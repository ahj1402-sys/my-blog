export const COUPANG_DISCLAIMER_TEXT =
  '이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.'

export const COUPANG_DISCLAIMER_MARKDOWN = `\n\n<small>${COUPANG_DISCLAIMER_TEXT}</small>\n`

export function extractCoupangUrl(input: string): string {
  const value = input.trim()
  if (!value) return ''

  const srcMatch = value.match(/\bsrc=["']([^"']+)["']/i)
  if (srcMatch?.[1]) return srcMatch[1].trim()

  const hrefMatch = value.match(/\bhref=["']([^"']+)["']/i)
  if (hrefMatch?.[1]) return hrefMatch[1].trim()

  const urlMatch = value.match(/https?:\/\/[^\s"'<>]+/i)
  if (urlMatch?.[0]) return urlMatch[0].trim()

  return value
}

export function isCoupangPartnerInput(input: string): boolean {
  const url = extractCoupangUrl(input).toLowerCase()
  return (
    url.includes('coupa.ng') ||
    url.includes('coupang.com') ||
    url.includes('link.coupang.com') ||
    url.includes('ads-partners.coupang.com')
  )
}

export function sanitizeCoupangEmbed(input: string): string {
  const value = input.trim()
  if (!value.toLowerCase().includes('<iframe')) return ''

  const src = extractCoupangUrl(value)
  if (!src || !isCoupangPartnerInput(src)) return ''

  const width = value.match(/\bwidth=["']?(\d{2,4})["']?/i)?.[1] || '120'
  const height = value.match(/\bheight=["']?(\d{2,4})["']?/i)?.[1] || '240'

  return `<iframe src="${src}" width="${width}" height="${height}" frameborder="0" scrolling="no" referrerpolicy="unsafe-url"></iframe>`
}

