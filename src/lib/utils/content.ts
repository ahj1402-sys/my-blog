/**
 * Content unwrap utility
 *
 * AI(Gemini) sometimes wraps markdown content in JSON format:
 * - ```json { "content": "## Title\n..." } ```
 * - { "content": "## Title\n..." }
 *
 * This utility extracts the pure markdown from such wrappers.
 */

export interface ParsedAIResponse {
  title?: string
  slug?: string
  content?: string
  excerpt?: string
  seoTitle?: string
  seoDescription?: string
  coverImage?: string
  tags?: string[]
  [k: string]: unknown
}

/**
 * Parse Gemini's response into structured fields. Tolerates:
 * - ```json ... ``` fence (or ``` ... ``` plain fence)
 * - Raw text without fence
 * - Invalid JSON caused by raw newlines inside string values
 *   (Gemini's most common bug — recovers via per-field regex)
 */
export function parseAIResponse(responseText: string): ParsedAIResponse {
  let jsonText = (responseText || '').trim()
  jsonText = jsonText
    .replace(/^```(?:json)?\s*\n?/, '')
    .replace(/\n?```\s*$/, '')
    .trim()

  try {
    const parsed = JSON.parse(jsonText)
    if (parsed && typeof parsed === 'object') return parsed
  } catch {
    // fall through to regex recovery
  }

  // Per-field regex recovery
  const pickField = (field: string): string | undefined => {
    const m = jsonText.match(new RegExp(`"${field}"\\s*:\\s*"([\\s\\S]*?)"\\s*[,}]`))
    return m ? unescapeJsonString(m[1]) : undefined
  }
  const pickArray = (field: string): string[] | undefined => {
    const m = jsonText.match(new RegExp(`"${field}"\\s*:\\s*\\[([\\s\\S]*?)\\]`))
    if (!m) return undefined
    return m[1]
      .split(',')
      .map(s => s.trim().replace(/^"|"$/g, ''))
      .filter(Boolean)
  }
  // content 는 가장 길어서 맞춰진 종결 키 직전까지 잡는 패턴이 안전
  const contentMatch =
    jsonText.match(/"content"\s*:\s*"([\s\S]*?)"\s*,\s*"(?:excerpt|tags|seoTitle|seoDescription|slug|coverImage)"/) ||
    jsonText.match(/"content"\s*:\s*"([\s\S]*)"\s*\}\s*$/)
  const content = contentMatch ? unescapeJsonString(contentMatch[1]) : undefined

  return {
    title: pickField('title'),
    slug: pickField('slug'),
    excerpt: pickField('excerpt'),
    seoTitle: pickField('seoTitle'),
    seoDescription: pickField('seoDescription'),
    coverImage: pickField('coverImage'),
    content,
    tags: pickArray('tags'),
  }
}

/**
 * Try to extract `content` field from a (possibly broken) JSON blob.
 * Used when JSON.parse fails — typically because Gemini emits raw
 * newlines inside the string value, which is invalid JSON but very common.
 */
function extractContentByRegex(text: string): string | null {
  // "content": "....." — capture greedily up to the last "}" or end
  // Handles raw newlines inside the value.
  const match = text.match(/"content"\s*:\s*"([\s\S]*?)"\s*[,}]/)
  if (!match) {
    // Fallback: capture to end of string
    const tail = text.match(/"content"\s*:\s*"([\s\S]*)$/)
    if (!tail) return null
    let md = tail[1]
    if (md.endsWith('"}')) md = md.slice(0, -2)
    else if (md.endsWith('"}\n```')) md = md.slice(0, -6)
    else if (md.endsWith('"')) md = md.slice(0, -1)
    return unescapeJsonString(md)
  }
  return unescapeJsonString(match[1])
}

function unescapeJsonString(s: string): string {
  return s
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
}

/**
 * Unwrap content that may be wrapped in JSON format.
 * Returns pure markdown content.
 */
export function unwrapContent(content: string): string {
  if (!content || typeof content !== 'string') return content

  let text = content.trim()

  // Case 1: Content starts with ```json block
  if (text.startsWith('```json') || text.startsWith('```\n{')) {
    // Strip leading fence
    const inner = text
      .replace(/^```(?:json)?\s*\n?/, '')
      .replace(/\n?```\s*$/, '')
      .trim()
    try {
      const parsed = JSON.parse(inner)
      if (parsed.content && typeof parsed.content === 'string') {
        return parsed.content
      }
    } catch {
      // JSON.parse 가 실패 (Gemini가 string value 안에 raw newline을 그대로
      // 넣는 경우가 잦음). regex로 content 필드만 추출.
      const md = extractContentByRegex(inner)
      if (md && md.length > 50) return md
    }
  }

  // Case 2: Content starts with { — try direct JSON parse
  if (text.startsWith('{')) {
    try {
      const parsed = JSON.parse(text)
      if (parsed.content && typeof parsed.content === 'string') {
        return parsed.content
      }
    } catch {
      const md = extractContentByRegex(text)
      if (md && md.length > 50) return md
    }
  }

  // Case 3: Already plain markdown
  return content
}

/**
 * Clean up AI-generated markdown content.
 * - Strips "H2:", "H3:", "H4:" prefixes from headings
 * - Ensures proper markdown heading syntax
 */
export function cleanMarkdownHeadings(content: string): string {
  if (!content || typeof content !== 'string') return content

  return content.replace(
    /^(#{2,4})\s*[Hh][2-4]\s*[:：]\s*/gm,
    '$1 '
  )
}
