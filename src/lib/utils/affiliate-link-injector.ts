/**
 * 쿠팡 파트너스 링크 자동 삽입 유틸리티
 *
 * AI가 생성한 Markdown 콘텐츠에 쿠팡 파트너스 링크를 자연스럽게 삽입하고,
 * 법적 고지문을 추가합니다.
 */

export interface AffiliateProduct {
  id: string
  name: string
  coupangUrl: string
  category: string
  keywords: string
}

/**
 * Markdown 콘텐츠에 제휴 링크를 삽입합니다.
 *
 * @param content - 원본 Markdown 콘텐츠
 * @param products - 삽입할 제휴 상품 배열
 * @returns 제휴 링크가 삽입된 Markdown 콘텐츠
 *
 * @example
 * ```typescript
 * const content = "이 노트북은 정말 좋습니다."
 * const products = [{ name: "LG 그램", coupangUrl: "https://..." }]
 * const result = injectAffiliateLinks(content, products)
 * // "이 [노트북](https://...)은 정말 좋습니다."
 * ```
 */
export function injectAffiliateLinks(
  content: string,
  products: AffiliateProduct[]
): string {
  if (!products || products.length === 0) {
    return content
  }

  let modifiedContent = content

  // 1. AFFILIATE_LINK_PLACEHOLDER를 실제 링크로 교체
  products.forEach((product) => {
    const placeholderRegex = new RegExp(
      `\\[([^\\]]+)\\]\\(AFFILIATE_LINK_PLACEHOLDER\\)`,
      'gi'
    )
    modifiedContent = modifiedContent.replace(placeholderRegex, `[$1](${product.coupangUrl})`)
  })

  // 2. 상품명이 언급된 곳에 자동으로 링크 추가 (첫 번째 언급에만)
  products.forEach((product) => {
    // 이미 링크가 걸려있지 않은 경우에만 추가
    const productNameRegex = new RegExp(
      `(?<!\\[)\\b${escapeRegex(product.name)}\\b(?!\\])`,
      'i'
    )

    // 첫 번째 언급에만 링크 추가
    if (productNameRegex.test(modifiedContent)) {
      modifiedContent = modifiedContent.replace(
        productNameRegex,
        `[${product.name}](${product.coupangUrl})`
      )
    }
  })

  // 3. 쿠팡 파트너스 고지문 자동 추가 (법적 요구사항)
  const disclaimer = `

---

**파트너스 활동 고지**

*이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.*
`

  modifiedContent += disclaimer

  return modifiedContent
}

/**
 * 정규식 특수문자 이스케이프
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Markdown 콘텐츠에서 제휴 링크 개수를 카운트합니다.
 *
 * @param content - Markdown 콘텐츠
 * @param coupangDomain - 쿠팡 도메인 (기본: link.coupang.com)
 * @returns 제휴 링크 개수
 */
export function countAffiliateLinks(
  content: string,
  coupangDomain: string = 'link.coupang.com'
): number {
  const linkRegex = new RegExp(`\\[([^\\]]+)\\]\\(https?:\\/\\/${coupangDomain}[^)]+\\)`, 'g')
  const matches = content.match(linkRegex)
  return matches ? matches.length : 0
}

/**
 * 쿠팡 파트너스 링크가 이미 포함되어 있는지 확인합니다.
 *
 * @param content - Markdown 콘텐츠
 * @returns 쿠팡 링크 포함 여부
 */
export function hasAffiliateLinks(content: string): boolean {
  return countAffiliateLinks(content) > 0
}

/**
 * 제휴 고지문이 이미 포함되어 있는지 확인합니다.
 *
 * @param content - Markdown 콘텐츠
 * @returns 고지문 포함 여부
 */
export function hasAffiliateDisclaimer(content: string): boolean {
  return content.includes('쿠팡 파트너스 활동의 일환으로')
}

/**
 * 본문 내 키워드 밀도를 계산합니다 (SEO 최적화용)
 *
 * @param content - Markdown 콘텐츠
 * @param keyword - 검사할 키워드
 * @returns 키워드 등장 횟수
 */
export function calculateKeywordDensity(
  content: string,
  keyword: string
): { count: number; density: number } {
  const plainText = content
    .replace(/[#*_`~\[\]()]/g, '') // Markdown 문법 제거
    .toLowerCase()

  const keywordLower = keyword.toLowerCase()
  const regex = new RegExp(`\\b${escapeRegex(keywordLower)}\\b`, 'g')
  const matches = plainText.match(regex)
  const count = matches ? matches.length : 0

  const totalWords = plainText.split(/\s+/).length
  const density = totalWords > 0 ? (count / totalWords) * 100 : 0

  return { count, density }
}
