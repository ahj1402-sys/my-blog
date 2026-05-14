import { promises as fs } from 'fs'
import path from 'path'
import { prisma } from '@/lib/prisma'
import { extractCoupangUrl, sanitizeCoupangEmbed } from '@/lib/coupang'

const KNOWLEDGE_DIR = path.join(process.cwd(), 'knowledge')
const SYSTEM_INSTRUCTION_FILE = 'system-instruction.md'

// 폴백 시스템 프롬프트 (파일 읽기 실패 시)
const FALLBACK_SYSTEM_PROMPT = `
ROLE & GOAL: 당신은 전문 블로그 콘텐츠 작성자입니다.
목표는 사용자가 선택한 주제에 대해 정확하고 실용적인 정보를 독자가 이해하기 쉽게 전달하는 것입니다.

글쓰기 스타일:
- 한국어로 작성
- 존댓말 사용 (합쇼체)
- 전문적이되 친근한 톤
- 구체적인 숫자와 사례를 활용

SEO 규칙:
1. 검색 의도에 맞는 제목 (60자 이내)
2. 메타 설명 (160자 이내)
3. H2/H3 계층 구조
4. 키워드 자연스럽게 3-5회 포함

slug 규칙: 영문 소문자 + 숫자 + 하이픈(-)만. 한글 금지. 60자 이내.

OUTPUT FORMAT (JSON):
{
  "title": "SEO 최적화 제목 (60자 이내, 한국어 가능)",
  "slug": "english-only-kebab-case",
  "excerpt": "2-3문장 요약",
  "content": "마크다운 형식 본문 (1500-2500자)",
  "tags": ["태그1", "태그2", "태그3", "태그4", "태그5"],
  "seoTitle": "SEO 제목",
  "seoDescription": "메타 설명 (160자 이내)"
}
`

/**
 * knowledge/system-instruction.md 에서 시스템 지침을 읽어옵니다.
 * 파일이 없으면 폴백 프롬프트를 반환합니다.
 */
export async function getSystemInstruction(): Promise<string> {
  try {
    const filePath = path.join(KNOWLEDGE_DIR, SYSTEM_INSTRUCTION_FILE)
    const content = await fs.readFile(filePath, 'utf-8')
    return content
  } catch {
    console.warn('system-instruction.md를 읽을 수 없습니다. 폴백 프롬프트를 사용합니다.')
    return FALLBACK_SYSTEM_PROMPT
  }
}

/**
 * DB에 아카이빙된 지식과 로컬 knowledge/ 파일을 함께 읽어옵니다.
 * 간단 RAG 버전: query와 겹치는 단어가 많은 지식을 우선 사용합니다.
 */
export async function getRelevantKnowledgeContext(query: string = ''): Promise<string> {
  const MAX_CHARS_PER_SOURCE = 3500
  const MAX_SOURCES = 6
  const queryTerms = query
    .toLowerCase()
    .split(/[\s,.;:!?()[\]{}"'`~]+/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 2)

  const scoreContent = (content: string, source: string) => {
    if (queryTerms.length === 0) return 1
    const haystack = `${source}\n${content}`.toLowerCase()
    return queryTerms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0)
  }

  const sources: Array<{ source: string; content: string; updatedAt?: Date }> = []

  try {
    const records = await prisma.knowledge.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    for (const record of records) {
      sources.push({
        source: record.source || `knowledge-${record.id}`,
        content: record.content,
        updatedAt: record.createdAt,
      })
    }
  } catch {
    // DB가 아직 준비되지 않은 로컬/빌드 환경에서는 파일 기반 지식만 사용합니다.
  }

  try {
    await fs.mkdir(KNOWLEDGE_DIR, { recursive: true })
    const entries = await fs.readdir(KNOWLEDGE_DIR, { withFileTypes: true })

    const knowledgeFiles = entries.filter(
      (e) =>
        e.isFile() &&
        (e.name.endsWith('.md') || e.name.endsWith('.txt')) &&
        e.name !== SYSTEM_INSTRUCTION_FILE
    )

    for (const file of knowledgeFiles) {
      try {
        const filePath = path.join(KNOWLEDGE_DIR, file.name)
        const content = await fs.readFile(filePath, 'utf-8')
        sources.push({ source: file.name, content })
      } catch {
        // 개별 파일 읽기 실패는 무시
      }
    }
  } catch {
    // 로컬 파일 지식이 없어도 DB 지식은 그대로 사용합니다.
  }

  if (sources.length === 0) return ''

  const chunks = sources
    .map((item) => ({
      ...item,
      score: scoreContent(item.content, item.source),
    }))
    .filter((item) => queryTerms.length === 0 || item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SOURCES)
    .map((item) => {
      const content =
        item.content.length > MAX_CHARS_PER_SOURCE
          ? item.content.substring(0, MAX_CHARS_PER_SOURCE) + '\n...(truncated)'
          : item.content
      return `[지식 자료: ${item.source}]\n${content}`
    })

  if (chunks.length === 0) return ''

  return (
    '\n\n**참고 지식 (Knowledge Context):**\n' +
    chunks.join('\n\n---\n\n') +
    '\n\n**위 지식을 사실 근거와 전문성 보강 자료로 참고해서 글을 작성해주세요.**\n\n'
  )
}

export const getAllKnowledgeContext = getRelevantKnowledgeContext

/**
 * 사용자 입력으로부터 AI 콘텐츠 생성 프롬프트를 만듭니다.
 */
export function generateContentPrompt(
  userInput: string,
  keywords?: string[],
  draftOutline?: string
): string {
  let prompt = `다음 주제로 블로그 글을 작성해주세요: ${userInput}\n`

  if (keywords && keywords.length > 0) {
    prompt += `타겟 키워드: ${keywords.join(', ')}\n`
  }

  if (draftOutline && draftOutline.trim()) {
    prompt += `\n초안/개요:\n${draftOutline}\n\n위 초안을 참고하여 완성된 글을 작성해주세요.\n`
  }

  prompt += `
작성 요구사항:
- 1500-2500자, 정확하고 실용적인 정보
- 마크다운 ## (H2), ### (H3) 문법으로 섹션 구분. "H2:", "H3:" 같은 접두사 절대 금지
- 짧은 문단 (2-4문장)
- 구체적인 숫자와 실제 사례 포함
- 독자가 행동할 수 있는 실질적 팁 제공
- 글 마지막에 핵심 요약 또는 체크리스트 포함

**slug 규칙 (필수):**
- 반드시 영문 소문자 + 숫자 + 하이픈(-)만 사용. 한글/특수문자 절대 금지.
- 의미 있는 영문 단어 3~6개로 구성 (예: "mac-mini-vs-macbook-guide", "best-gangnam-cafes-2025")
- 60자 이내, stop words 최소화

반드시 JSON 형식으로 응답:
{"title":"SEO 제목 (60자 이내)","slug":"english-kebab-case-slug","excerpt":"2-3문장 요약","content":"마크다운 본문","tags":["태그1","태그2","태그3"],"seoTitle":"SEO 제목","seoDescription":"메타 설명 (160자 이내)"}`

  return prompt
}

/**
 * 쿠팡 파트너스 상품 리뷰 모드 프롬프트
 */
export function generateCoupangPrompt(coupangLink: string): string {
  const coupangUrl = extractCoupangUrl(coupangLink)
  const coupangEmbed = sanitizeCoupangEmbed(coupangLink)

  return `
**쿠팡 파트너스 상품 리뷰 모드:**
- 아래 쿠팡 파트너스 URL 또는 배너를 바탕으로 해당 상품에 대한 글을 작성해주세요.
- 쿠팡 파트너스 URL: ${coupangUrl}
${coupangEmbed ? `- 본문 중간에 아래 배너 HTML을 그대로 한 번 포함해주세요:\n${coupangEmbed}` : `- 링크 형식: [상품명 또는 관련 텍스트](${coupangUrl})`}
- 상품에 대한 객관적 정보와 실제 사용 관점의 리뷰를 포함하세요.
- 과장 광고 금지, 장단점을 균형 있게 서술하세요.
- 태그에는 반드시 "쿠팡파트너스"를 포함하세요.

**필수 면책 문구 (반드시 글 마지막에 포함):**
<small>이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</small>
`
}

/**
 * 코너스톤(Cornerstone) 가이드 생성 프롬프트
 *
 * 5개 source 글을 종합해서 5,000~8,000자 종합 가이드 작성.
 * 각 H2 섹션 마지막에 출처 글 링크 자동 삽입 → 양방향 인링크 SEO.
 */
export interface CornerstoneSourcePost {
  title: string
  slug: string
  excerpt?: string | null
  content: string
}

export function buildCornerstonePrompt(
  sourcePosts: CornerstoneSourcePost[],
  mainKeyword: string,
  targetTitle?: string
): string {
  const MAX_CONTENT_PER_POST = 2000 // 글당 최대 2000자만 컨텍스트로 사용

  const sourceContext = sourcePosts
    .map((post, idx) => {
      const trimmed =
        post.content.length > MAX_CONTENT_PER_POST
          ? post.content.substring(0, MAX_CONTENT_PER_POST) + '\n...(이하 생략)'
          : post.content
      return `[원본 ${idx + 1}] "${post.title}" (/posts/${post.slug})\n요약: ${
        post.excerpt || '(없음)'
      }\n본문:\n${trimmed}`
    })
    .join('\n\n---\n\n')

  return `다음 5개의 기존 블로그 글을 종합해서 한 편의 **코너스톤(Cornerstone) 가이드**를 작성해주세요.

**메인 키워드:** ${mainKeyword}
${targetTitle ? `**목표 제목 후보:** ${targetTitle}` : ''}

**원본 글 (Source Posts):**
${sourceContext}

**코너스톤 작성 규칙 (필수):**
1. **분량**: 5,000~8,000자 (긴 종합 가이드)
2. **H2 섹션 수**: 8~12개
   - 인트로 1개 (전체 구조 안내)
   - 본문 H2 6~10개 (각 원본 글의 핵심을 1~2개 H2로 풀어쓰기 + 종합 H2 추가)
   - 결론 1개 (실행 체크리스트)
3. **각 H2 섹션 마지막에 출처 링크 필수 삽입:**
   형식: \`👉 더 자세히: [원본 글 제목](/posts/원본-slug)\`
   해당 H2가 다룬 주제와 가장 관련 있는 원본 글을 가리킴
4. **인트로**: "이 글은 누구를 위한 것인지" + "전체 목차 미리보기" 포함
5. **결론**: 행동 가능한 체크리스트 5~7항목 (✅ 형식)
6. **paraphrase 필수**: 원본 글의 표현을 그대로 복사하지 말고 재구성
7. **키워드 자연 분포**: 메인 키워드 8~15회, LSI 변형 키워드 함께 사용
8. **마크다운 ## (H2), ### (H3) 사용**. "H2:", "H3:" 같은 접두사 절대 금지

**SEO 메타데이터:**
- title: 60자 이내, "${mainKeyword} 완벽 가이드" 또는 "${mainKeyword} 총정리" 패턴
- slug: 영문 케밥 케이스, 짧고 의미있게 (예: "remote-work-complete-guide")
- seoDescription: 150~160자, 메인 키워드 포함, 종합 가이드임을 명시

**반드시 JSON 형식으로 응답:**
{"title":"SEO 제목 (60자 이내)","slug":"url-slug","excerpt":"3-4문장 요약 (이 가이드가 다루는 범위)","content":"마크다운 본문 (5000~8000자)","tags":["${mainKeyword}","코너스톤","완벽가이드"],"seoTitle":"SEO 제목","seoDescription":"메타 설명 (150~160자)"}`
}

/**
 * Source 글 본문 끝에 자동 삽입할 코너스톤 링크 박스
 * HTML 주석 delimiter 로 감싸서 추후 자동 갱신·제거 가능.
 */
export const CORNERSTONE_BOX_START = '<!-- CORNERSTONE_BOX_START -->'
export const CORNERSTONE_BOX_END = '<!-- CORNERSTONE_BOX_END -->'

export function buildCornerstoneBox(cornerstoneTitle: string, cornerstoneSlug: string): string {
  return `\n\n${CORNERSTONE_BOX_START}\n---\n\n## 📚 이 주제의 종합 가이드\n\n[**${cornerstoneTitle}**](/posts/${cornerstoneSlug}) — 더 자세한 내용을 한 편에 모았습니다.\n${CORNERSTONE_BOX_END}\n`
}

/**
 * 기존 본문에서 코너스톤 박스를 제거 (재할당·삭제 시 사용)
 */
export function stripCornerstoneBox(content: string): string {
  const pattern = new RegExp(
    `\\n*${CORNERSTONE_BOX_START}[\\s\\S]*?${CORNERSTONE_BOX_END}\\n*`,
    'g'
  )
  return content.replace(pattern, '\n')
}

// 하위 호환성을 위한 re-export
export const MASTER_SYSTEM_PROMPT = FALLBACK_SYSTEM_PROMPT
