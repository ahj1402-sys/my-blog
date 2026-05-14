/**
 * Rehype plugin: 글 본문을 H2 단위 <section> 으로 래핑
 *
 * 변환 전 (flat HAST):
 *   <h2>제목A</h2><p>본문…</p><h3>소제목</h3><p>본문…</p>
 *   <h2>제목B</h2><p>본문…</p>
 *
 * 변환 후:
 *   <section class="post-section" id="..."><div class="post-section-container"><div class="post-section-content">
 *     <h2>제목A</h2><p>본문…</p><h3>소제목</h3><p>본문…</p>
 *   </div></div></section>
 *   <section …>…</section>
 *
 * 효과:
 * - 시맨틱 HTML5 sectioning content (SEO + 접근성)
 * - 피처드 스니펫 추출 시 구글이 단락 경계를 명확히 인식
 * - 섹션 단위 CSS / JS 처리 가능 (스크롤 스냅, 광고 삽입 위치 등)
 */

// 인라인 HAST 타입 정의 (pnpm 호이스팅 회피)
interface HastTextNode {
  type: 'text'
  value: string
}
interface HastElement {
  type: 'element'
  tagName: string
  properties?: Record<string, unknown>
  children: HastNode[]
}
interface HastRoot {
  type: 'root'
  children: HastNode[]
}
type HastNode = HastTextNode | HastElement | { type: string; [key: string]: unknown }

function getHeadingText(el: HastElement): string {
  let out = ''
  for (const child of el.children) {
    if (child.type === 'text') {
      out += (child as HastTextNode).value
    } else if (child.type === 'element') {
      out += getHeadingText(child as HastElement)
    }
  }
  return out
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function buildSection(
  children: HastNode[],
  variant: 'intro' | 'body',
  anchorId?: string
): HastElement {
  const inner: HastElement = {
    type: 'element',
    tagName: 'div',
    properties: { className: ['post-section-content'] },
    children,
  }
  const container: HastElement = {
    type: 'element',
    tagName: 'div',
    properties: { className: ['post-section-container'] },
    children: [inner],
  }
  const props: Record<string, unknown> = {
    className: [
      'post-section',
      variant === 'intro' ? 'post-section--intro' : 'post-section--body',
    ],
  }
  if (anchorId) props.id = `section-${anchorId}`
  return {
    type: 'element',
    tagName: 'section',
    properties: props,
    children: [container],
  }
}

export default function rehypeSectionWrap() {
  return (tree: HastRoot) => {
    const sections: HastNode[] = []
    let buffer: HastNode[] = []
    let currentH2: HastElement | null = null

    const flush = () => {
      if (buffer.length === 0) return
      if (currentH2) {
        const id = slugify(getHeadingText(currentH2))
        sections.push(buildSection(buffer, 'body', id || undefined))
      } else {
        sections.push(buildSection(buffer, 'intro'))
      }
      buffer = []
    }

    for (const node of tree.children) {
      const isH2 =
        node.type === 'element' && (node as HastElement).tagName === 'h2'
      if (isH2) {
        flush()
        currentH2 = node as HastElement
        buffer = [node]
      } else {
        // h1, h3+, p, ul, blockquote, hr, raw element 등 모든 요소
        buffer.push(node)
      }
    }
    flush()

    tree.children = sections
  }
}
