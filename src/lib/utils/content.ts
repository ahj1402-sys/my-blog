/**
 * Content unwrap utility
 *
 * AI(Gemini) sometimes wraps markdown content in JSON format:
 * - ```json { "content": "## Title\n..." } ```
 * - { "content": "## Title\n..." }
 *
 * This utility extracts the pure markdown from such wrappers.
 */

/**
 * Unwrap content that may be wrapped in JSON format.
 * Returns pure markdown content.
 */
export function unwrapContent(content: string): string {
  if (!content || typeof content !== 'string') return content

  let text = content.trim()

  // Case 1: Content starts with ```json block
  if (text.startsWith('```json')) {
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1])
        if (parsed.content && typeof parsed.content === 'string') {
          return parsed.content
        }
      } catch {
        // Failed to parse, fall through
      }
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
      // JSON might be truncated — try regex extraction as fallback
      const contentMatch = text.match(/"content"\s*:\s*"([\s\S]*)$/)
      if (contentMatch) {
        let markdown = contentMatch[1]
        // Remove trailing JSON artifacts
        if (markdown.endsWith('"}')) markdown = markdown.slice(0, -2)
        else if (markdown.endsWith('"')) markdown = markdown.slice(0, -1)
        // Unescape JSON string escapes
        markdown = markdown
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\')
        if (markdown.length > 100) return markdown
      }
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
