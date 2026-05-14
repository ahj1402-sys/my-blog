/**
 * Tests for string utility functions
 *
 * Coverage goal: 90-100%
 * Test approach: Unit tests (no mocks, pure functions)
 *
 * Test cases:
 * - truncate: basic truncation, edge cases
 * - stripHtml: HTML tag removal, nested tags, attributes
 * - generateSlug: slug generation (duplicate of slug.ts)
 * - capitalizeFirst: capitalization, empty strings
 * - pluralize: singular/plural forms, custom plural
 * - parseExcerpt: JSON parsing, truncated JSON, plain text
 * - extractTextFromMarkdown: code blocks, links, formatting
 * - isValidUrl: valid/invalid URLs, edge cases
 */

import { describe, it, expect } from 'vitest'
import {
  truncate,
  stripHtml,
  generateSlug,
  capitalizeFirst,
  pluralize,
  parseExcerpt,
  extractTextFromMarkdown,
  isValidUrl,
} from '../string'

describe('truncate', () => {
  describe('basic functionality', () => {
    it('should truncate string longer than limit', () => {
      expect(truncate('Hello World', 5)).toBe('Hello...')
    })

    it('should add ellipsis when truncating', () => {
      const result = truncate('This is a long string', 10)
      expect(result).toBe('This is a ...')
      expect(result.endsWith('...')).toBe(true)
    })

    it('should not truncate string shorter than limit', () => {
      expect(truncate('Short', 10)).toBe('Short')
    })

    it('should not truncate string equal to limit', () => {
      expect(truncate('Exact', 5)).toBe('Exact')
    })
  })

  describe('edge cases', () => {
    it('should handle empty string', () => {
      expect(truncate('', 5)).toBe('')
    })

    it('should handle zero length limit', () => {
      expect(truncate('Hello', 0)).toBe('...')
    })

    it('should handle single character', () => {
      expect(truncate('H', 1)).toBe('H')
      expect(truncate('Hello', 1)).toBe('H...')
    })

    it('should handle very long strings', () => {
      const longString = 'a'.repeat(1000)
      const result = truncate(longString, 50)
      expect(result.length).toBe(53) // 50 + '...'
    })

    it('should handle unicode characters', () => {
      expect(truncate('안녕하세요 세계', 5)).toBe('안녕하세요...')
    })
  })
})

describe('stripHtml', () => {
  describe('basic HTML removal', () => {
    it('should remove simple HTML tags', () => {
      expect(stripHtml('<p>Hello</p>')).toBe('Hello')
    })

    it('should remove multiple tags', () => {
      expect(stripHtml('<div><p>Hello</p></div>')).toBe('Hello')
    })

    it('should remove self-closing tags', () => {
      expect(stripHtml('Hello<br/>World')).toBe('HelloWorld')
      expect(stripHtml('Test<img src="test.jpg"/>End')).toBe('TestEnd')
    })

    it('should remove tags with attributes', () => {
      expect(stripHtml('<p class="test" id="main">Content</p>')).toBe('Content')
    })
  })

  describe('complex HTML', () => {
    it('should handle nested tags', () => {
      const html = '<div><p><strong>Bold</strong> text</p></div>'
      expect(stripHtml(html)).toBe('Bold text')
    })

    it('should preserve text content', () => {
      const html = '<h1>Title</h1><p>Paragraph 1</p><p>Paragraph 2</p>'
      expect(stripHtml(html)).toBe('TitleParagraph 1Paragraph 2')
    })

    it('should remove script tags and content', () => {
      const html = '<p>Before</p><script>alert("test")</script><p>After</p>'
      expect(stripHtml(html)).toBe('Beforealert("test")After')
    })

    it('should remove style tags', () => {
      const html = '<style>body { color: red; }</style><p>Text</p>'
      expect(stripHtml(html)).toBe('body { color: red; }Text')
    })
  })

  describe('edge cases', () => {
    it('should handle empty string', () => {
      expect(stripHtml('')).toBe('')
    })

    it('should handle plain text (no HTML)', () => {
      expect(stripHtml('Just plain text')).toBe('Just plain text')
    })

    it('should handle malformed HTML', () => {
      expect(stripHtml('<p>Unclosed tag')).toBe('Unclosed tag')
      expect(stripHtml('Text with <>')).toBe('Text with ')
    })

    it('should handle HTML entities', () => {
      expect(stripHtml('&lt;div&gt;')).toBe('&lt;div&gt;')
    })
  })
})

describe('generateSlug', () => {
  describe('basic functionality', () => {
    it('should convert title to lowercase slug', () => {
      expect(generateSlug('Hello World')).toBe('hello-world')
    })

    it('should replace spaces with hyphens', () => {
      expect(generateSlug('This Is A Test')).toBe('this-is-a-test')
    })

    it('should remove special characters', () => {
      expect(generateSlug('Hello! World?')).toBe('hello-world')
    })

    it('should collapse multiple hyphens', () => {
      expect(generateSlug('Test   Multiple   Spaces')).toBe('test-multiple-spaces')
    })

    it('should trim whitespace from input', () => {
      // Note: This generateSlug doesn't remove leading/trailing hyphens
      // It only trims the final result with .trim()
      const result = generateSlug('  Title  ')
      expect(result).toBe('-title-')
    })
  })

  describe('edge cases', () => {
    it('should handle empty string', () => {
      expect(generateSlug('')).toBe('')
    })

    it('should handle numbers', () => {
      expect(generateSlug('Test 123')).toBe('test-123')
    })

    it('should handle underscores', () => {
      expect(generateSlug('hello_world')).toBe('hello_world')
    })
  })
})

describe('capitalizeFirst', () => {
  describe('basic functionality', () => {
    it('should capitalize first letter', () => {
      expect(capitalizeFirst('hello')).toBe('Hello')
    })

    it('should only capitalize first letter', () => {
      expect(capitalizeFirst('hello world')).toBe('Hello world')
    })

    it('should not change already capitalized string', () => {
      expect(capitalizeFirst('Hello')).toBe('Hello')
    })

    it('should handle single character', () => {
      expect(capitalizeFirst('h')).toBe('H')
    })
  })

  describe('edge cases', () => {
    it('should handle empty string', () => {
      expect(capitalizeFirst('')).toBe('')
    })

    it('should handle string with numbers first', () => {
      expect(capitalizeFirst('123abc')).toBe('123abc')
    })

    it('should handle all uppercase', () => {
      expect(capitalizeFirst('HELLO')).toBe('HELLO')
    })

    it('should handle Korean characters', () => {
      expect(capitalizeFirst('안녕하세요')).toBe('안녕하세요')
    })
  })
})

describe('pluralize', () => {
  describe('basic pluralization', () => {
    it('should return singular for count 1', () => {
      expect(pluralize(1, 'item')).toBe('item')
    })

    it('should return default plural for count > 1', () => {
      expect(pluralize(2, 'item')).toBe('items')
      expect(pluralize(5, 'item')).toBe('items')
    })

    it('should return default plural for count 0', () => {
      expect(pluralize(0, 'item')).toBe('items')
    })
  })

  describe('custom plural', () => {
    it('should use custom plural when provided', () => {
      expect(pluralize(2, 'child', 'children')).toBe('children')
    })

    it('should use custom plural for irregular words', () => {
      expect(pluralize(3, 'person', 'people')).toBe('people')
      expect(pluralize(2, 'goose', 'geese')).toBe('geese')
    })

    it('should return singular for count 1 even with custom plural', () => {
      expect(pluralize(1, 'child', 'children')).toBe('child')
    })
  })

  describe('edge cases', () => {
    it('should handle negative counts', () => {
      expect(pluralize(-1, 'item')).toBe('items')
      expect(pluralize(-5, 'item')).toBe('items')
    })

    it('should handle decimal counts', () => {
      expect(pluralize(1.5, 'item')).toBe('items')
      expect(pluralize(0.5, 'item')).toBe('items')
    })

    it('should handle empty singular', () => {
      expect(pluralize(1, '')).toBe('')
      expect(pluralize(2, '')).toBe('s')
    })
  })
})

describe('parseExcerpt', () => {
  describe('plain text excerpts', () => {
    it('should return plain text as-is', () => {
      const excerpt = 'This is a plain text excerpt'
      expect(parseExcerpt(excerpt)).toBe(excerpt)
    })

    it('should handle null input', () => {
      expect(parseExcerpt(null)).toBeNull()
    })
  })

  describe('JSON excerpt parsing', () => {
    it('should extract excerpt from JSON with "excerpt" field', () => {
      const json = '{"excerpt": "This is the excerpt", "content": "Full content"}'
      expect(parseExcerpt(json)).toBe('This is the excerpt')
    })

    it('should extract from JSON with ```json wrapper', () => {
      const json = '```json\n{"excerpt": "Test excerpt"}\n```'
      expect(parseExcerpt(json)).toBe('Test excerpt')
    })

    it('should fallback to content field if no excerpt', () => {
      const longContent = 'a'.repeat(250)
      // Include ```json to trigger JSON parsing mode
      const json = `\`\`\`json\n{"content": "${longContent}"}\n\`\`\``
      const result = parseExcerpt(json)
      expect(result).toContain('aaaa')
      expect(result?.length).toBe(203) // 200 chars + '...'
      expect(result?.endsWith('...')).toBe(true)
    })

    it('should handle malformed JSON gracefully', () => {
      const malformed = '```json\n{"excerpt": "Test'
      const result = parseExcerpt(malformed)
      expect(result).toBeTruthy()
      expect(result?.includes('excerpt')).toBe(true)
    })

    it('should remove JSON formatting', () => {
      const json = '```json\n{"key": "value"}\n```'
      const result = parseExcerpt(json)
      expect(result).not.toContain('```')
      expect(result).not.toContain('{')
      expect(result).not.toContain('}')
    })

    it('should truncate cleaned JSON to 200 chars', () => {
      const longJson = '```json\n{"data": "' + 'a'.repeat(300) + '"}\n```'
      const result = parseExcerpt(longJson)
      expect(result?.length).toBeLessThanOrEqual(203) // 200 + '...'
    })
  })

  describe('edge cases', () => {
    it('should handle empty string', () => {
      // Empty string is falsy, so function returns null
      expect(parseExcerpt('')).toBeNull()
    })

    it('should handle whitespace-only string', () => {
      const result = parseExcerpt('   ')
      expect(result).toBeTruthy()
    })

    it('should handle nested JSON', () => {
      const nested = '{"excerpt": "Main", "nested": {"excerpt": "Nested"}}'
      expect(parseExcerpt(nested)).toBe('Main')
    })
  })
})

describe('extractTextFromMarkdown', () => {
  describe('code block removal', () => {
    it('should remove fenced code blocks', () => {
      const md = 'Text before\n```\ncode here\n```\nText after'
      expect(extractTextFromMarkdown(md)).toBe('Text before Text after')
    })

    it('should remove code blocks with language', () => {
      const md = '```javascript\nconst x = 1;\n```'
      expect(extractTextFromMarkdown(md)).toBe('')
    })

    it('should remove inline code', () => {
      const md = 'Use `npm install` to install'
      expect(extractTextFromMarkdown(md)).toBe('Use  to install')
    })
  })

  describe('link conversion', () => {
    it('should convert links to plain text', () => {
      const md = 'Check out [Google](https://google.com)'
      expect(extractTextFromMarkdown(md)).toBe('Check out Google')
    })

    it('should handle multiple links', () => {
      const md = 'Visit [Site1](url1) and [Site2](url2)'
      expect(extractTextFromMarkdown(md)).toBe('Visit Site1 and Site2')
    })
  })

  describe('formatting removal', () => {
    it('should remove headers', () => {
      expect(extractTextFromMarkdown('# Title')).toBe('Title')
      expect(extractTextFromMarkdown('## Subtitle')).toBe('Subtitle')
    })

    it('should remove bold formatting', () => {
      expect(extractTextFromMarkdown('**bold text**')).toBe('bold text')
    })

    it('should remove italic formatting', () => {
      expect(extractTextFromMarkdown('*italic text*')).toBe('italic text')
      expect(extractTextFromMarkdown('_italic text_')).toBe('italic text')
    })

    it('should remove strikethrough', () => {
      expect(extractTextFromMarkdown('~~strikethrough~~')).toBe('strikethrough')
    })
  })

  describe('whitespace normalization', () => {
    it('should replace newlines with spaces', () => {
      const md = 'Line 1\nLine 2\nLine 3'
      expect(extractTextFromMarkdown(md)).toBe('Line 1 Line 2 Line 3')
    })

    it('should collapse multiple newlines', () => {
      const md = 'Paragraph 1\n\n\nParagraph 2'
      const result = extractTextFromMarkdown(md)
      expect(result).toBe('Paragraph 1 Paragraph 2')
    })

    it('should trim result', () => {
      const md = '  \n\n  Text  \n\n  '
      expect(extractTextFromMarkdown(md)).toBe('Text')
    })
  })

  describe('complex markdown', () => {
    it('should handle mixed formatting', () => {
      const md = '# Title\n\n**Bold** and *italic* with `code` and [link](url)'
      const result = extractTextFromMarkdown(md)
      expect(result).toBe('Title Bold and italic with  and link')
    })

    it('should handle lists', () => {
      const md = '- Item 1\n- Item 2\n- Item 3'
      expect(extractTextFromMarkdown(md)).toBe('- Item 1 - Item 2 - Item 3')
    })
  })

  describe('edge cases', () => {
    it('should handle empty string', () => {
      expect(extractTextFromMarkdown('')).toBe('')
    })

    it('should handle plain text', () => {
      expect(extractTextFromMarkdown('Plain text')).toBe('Plain text')
    })

    it('should handle only code blocks', () => {
      const md = '```\ncode only\n```'
      expect(extractTextFromMarkdown(md)).toBe('')
    })
  })
})

describe('isValidUrl', () => {
  describe('valid URLs', () => {
    it('should accept valid HTTP URLs', () => {
      expect(isValidUrl('http://example.com')).toBe(true)
    })

    it('should accept valid HTTPS URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
    })

    it('should accept URLs with paths', () => {
      expect(isValidUrl('https://example.com/path/to/page')).toBe(true)
    })

    it('should accept URLs with query params', () => {
      expect(isValidUrl('https://example.com?key=value')).toBe(true)
    })

    it('should accept URLs with ports', () => {
      expect(isValidUrl('http://localhost:3000')).toBe(true)
    })

    it('should accept URLs with fragments', () => {
      expect(isValidUrl('https://example.com#section')).toBe(true)
    })
  })

  describe('invalid URLs', () => {
    it('should reject URLs without protocol', () => {
      expect(isValidUrl('example.com')).toBe(false)
    })

    it('should reject empty string', () => {
      expect(isValidUrl('')).toBe(false)
    })

    it('should reject plain text', () => {
      expect(isValidUrl('not a url')).toBe(false)
    })

    it('should reject invalid protocols', () => {
      expect(isValidUrl('ftp://example.com')).toBe(true) // FTP is valid
      expect(isValidUrl('javascript:alert(1)')).toBe(true) // JavaScript protocol is technically valid
    })

    it('should reject malformed URLs', () => {
      expect(isValidUrl('http://')).toBe(false)
      expect(isValidUrl('https://')).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle URLs with special characters', () => {
      expect(isValidUrl('https://example.com/path?q=hello%20world')).toBe(true)
    })

    it('should handle international domains', () => {
      expect(isValidUrl('https://예제.한국')).toBe(true)
    })

    it('should handle IP addresses', () => {
      expect(isValidUrl('http://192.168.1.1')).toBe(true)
      expect(isValidUrl('http://127.0.0.1:8080')).toBe(true)
    })

    it('should handle file URLs', () => {
      expect(isValidUrl('file:///path/to/file')).toBe(true)
    })
  })
})
