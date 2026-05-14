import { GoogleGenerativeAI } from '@google/generative-ai'
import { env } from '@/lib/env'
import { logger } from '@/lib/error-handler'

/**
 * 한글 제목을 SEO 친화적인 영문 슬러그로 번역합니다.
 *
 * 규칙 (Google URL 가이드 준수):
 * - 소문자, 하이픈(-) 구분
 * - 의미 있는 영문 단어 3~6개
 * - 60자 이내
 *
 * Gemini API 호출이 실패하거나 키가 없으면 `null` 반환 → 호출 측에서 폴백 처리.
 */
export async function translateTitleToEnglishSlug(title: string): Promise<string | null> {
  if (!env.GEMINI_API_KEY) {
    logger.warn('GEMINI_API_KEY 없음 — 슬러그 번역 건너뜀')
    return null
  }

  if (!title || title.trim().length === 0) return null

  try {
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })

    const prompt = `다음 한글 제목을 SEO 친화적인 영문 URL 슬러그로 번역하세요.

제목: "${title}"

규칙:
- 영문 소문자만 사용 (a-z, 0-9)
- 단어는 하이픈(-)으로 구분
- 의미 있는 영문 단어 3~6개
- 60자 이내
- 불필요한 stop words 제거 (the, a, of 등 최소화)
- 핵심 키워드 위주

응답은 슬러그 한 줄만. 따옴표, 설명, 마크다운 모두 금지.

예시:
입력: "맥미니 vs 맥북 - 당신에게 맞는 Apple 기기 선택 가이드"
출력: mac-mini-vs-macbook-buying-guide

입력: "2025년 강남 카페 추천 베스트 10"
출력: best-gangnam-cafes-2025`

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 64 },
    })

    const raw = result.response.text().trim()
    // 첫 줄만, 영문/숫자/하이픈만 추출
    const firstLine = raw.split('\n')[0].trim()
    const cleaned = firstLine
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 60)
      .replace(/-+$/g, '')

    if (!cleaned || cleaned.length < 3) {
      logger.warn('번역된 슬러그가 너무 짧음', { raw, cleaned })
      return null
    }

    logger.info('한글 제목 → 영문 슬러그 번역 성공', { title, slug: cleaned })
    return cleaned
  } catch (error) {
    logger.warn('슬러그 번역 실패', { error: error instanceof Error ? error.message : String(error) })
    return null
  }
}
