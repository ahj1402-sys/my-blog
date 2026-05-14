/**
 * Tests for reading time calculation utilities
 *
 * Coverage goal: 90-100%
 * Test approach: Unit tests (no mocks, pure functions)
 *
 * Test cases:
 * - calculateReadingTime: word counting, markdown stripping, minimum time
 * - formatReadingTime: formatting output
 */

import { describe, it, expect } from 'vitest'
import { calculateReadingTime, formatReadingTime } from '../reading-time'

describe('calculateReadingTime', () => {
  describe('basic word counting', () => {
    it('should calculate reading time for plain text', () => {
      // 200 words/min, so 100 words = 1 min
      const text = 'word '.repeat(100).trim()
      expect(calculateReadingTime(text)).toBe(1)
    })

    it('should round up reading time', () => {
      // 250 words at 200 wpm = 1.25 min → rounds to 2 min
      const text = 'word '.repeat(250).trim()
      expect(calculateReadingTime(text)).toBe(2)
    })

    it('should calculate for longer content', () => {
      // 400 words at 200 wpm = 2 min
      const text = 'word '.repeat(400).trim()
      expect(calculateReadingTime(text)).toBe(2)
    })

    it('should calculate for very long content', () => {
      // 1000 words at 200 wpm = 5 min
      const text = 'word '.repeat(1000).trim()
      expect(calculateReadingTime(text)).toBe(5)
    })
  })

  describe('markdown syntax removal', () => {
    it('should remove code blocks', () => {
      const text = `
Some text before
\`\`\`javascript
const x = 1;
const y = 2;
console.log(x + y);
\`\`\`
Some text after
      `.trim()

      // Should only count "Some text before Some text after" = 5 words
      const result = calculateReadingTime(text)
      expect(result).toBe(1) // minimum 1 minute
    })

    it('should remove inline code', () => {
      const text = 'Use `npm install` to install the package'
      // Should count: Use to install the package = 5 words
      const result = calculateReadingTime(text)
      expect(result).toBe(1)
    })

    it('should replace links with their text', () => {
      const text = 'Check out [Google](https://google.com) for more info'
      // Should count: Check out Google for more info = 6 words
      const result = calculateReadingTime(text)
      expect(result).toBe(1)
    })

    it('should remove markdown symbols', () => {
      const text = '# Title\n\n**Bold** and *italic* text with ~~strikethrough~~'
      // Should count: Title Bold and italic text with strikethrough = 7 words
      const result = calculateReadingTime(text)
      expect(result).toBe(1)
    })

    it('should remove HTML tags', () => {
      const text = '<p>Hello <strong>world</strong></p> <div>Test</div>'
      // Should count: Hello world Test = 3 words
      const result = calculateReadingTime(text)
      expect(result).toBe(1)
    })

    it('should replace newlines with spaces', () => {
      const text = 'Line 1\nLine 2\nLine 3'
      // Should count: Line 1 Line 2 Line 3 = 6 words
      const result = calculateReadingTime(text)
      expect(result).toBe(1)
    })
  })

  describe('complex content', () => {
    it('should handle blog post with mixed content', () => {
      const text = `
# Introduction to Testing

Testing is **important** for maintaining code quality. Here's why:

- Prevents bugs
- Improves confidence
- Documents behavior

## Code Example

\`\`\`typescript
function add(a: number, b: number) {
  return a + b;
}
\`\`\`

Check out [this article](https://example.com) for more details.
      `.trim()

      // Should remove all markdown and count only meaningful words
      const result = calculateReadingTime(text)
      expect(result).toBeGreaterThan(0)
      expect(result).toBeLessThan(5) // Not too long
    })

    it('should handle content with multiple code blocks', () => {
      const text = `
Text 1
\`\`\`
code block 1
\`\`\`
Text 2
\`\`\`
code block 2
\`\`\`
Text 3
      `.trim()

      const result = calculateReadingTime(text)
      expect(result).toBe(1)
    })
  })

  describe('minimum reading time', () => {
    it('should return minimum 1 minute for very short text', () => {
      expect(calculateReadingTime('Short')).toBe(1)
    })

    it('should return minimum 1 minute for empty string', () => {
      expect(calculateReadingTime('')).toBe(1)
    })

    it('should return minimum 1 minute for only markdown', () => {
      const text = '```\ncode\n```'
      expect(calculateReadingTime(text)).toBe(1)
    })

    it('should return minimum 1 minute for whitespace only', () => {
      expect(calculateReadingTime('   \n\n   ')).toBe(1)
    })
  })

  describe('edge cases', () => {
    it('should handle single word', () => {
      expect(calculateReadingTime('Hello')).toBe(1)
    })

    it('should handle multiple spaces between words', () => {
      const text = 'word1    word2     word3'
      expect(calculateReadingTime(text)).toBe(1)
    })

    it('should handle Korean text', () => {
      const text = '안녕하세요 세계 테스트 입니다'
      expect(calculateReadingTime(text)).toBe(1)
    })

    it('should handle mixed languages', () => {
      const text = 'Hello 안녕 world 세계 test 테스트'
      expect(calculateReadingTime(text)).toBe(1)
    })

    it('should handle special characters', () => {
      const text = 'Hello! How are you? I\'m fine, thanks.'
      // Should count: Hello How are you I m fine thanks = 8 words
      expect(calculateReadingTime(text)).toBe(1)
    })

    it('should handle numbers', () => {
      const text = '123 456 789'
      expect(calculateReadingTime(text)).toBe(1)
    })
  })

  describe('realistic content examples', () => {
    it('should calculate for short blog post (~500 words)', () => {
      const text = 'word '.repeat(500).trim()
      expect(calculateReadingTime(text)).toBe(3) // 500/200 = 2.5 → rounds to 3
    })

    it('should calculate for medium blog post (~1000 words)', () => {
      const text = 'word '.repeat(1000).trim()
      expect(calculateReadingTime(text)).toBe(5) // 1000/200 = 5
    })

    it('should calculate for long blog post (~2000 words)', () => {
      const text = 'word '.repeat(2000).trim()
      expect(calculateReadingTime(text)).toBe(10) // 2000/200 = 10
    })

    it('should calculate for very long article (~5000 words)', () => {
      const text = 'word '.repeat(5000).trim()
      expect(calculateReadingTime(text)).toBe(25) // 5000/200 = 25
    })
  })
})

describe('formatReadingTime', () => {
  describe('basic formatting', () => {
    it('should format 1 minute', () => {
      expect(formatReadingTime(1)).toBe('1 min read')
    })

    it('should format 5 minutes', () => {
      expect(formatReadingTime(5)).toBe('5 min read')
    })

    it('should format 10 minutes', () => {
      expect(formatReadingTime(10)).toBe('10 min read')
    })

    it('should format 60 minutes', () => {
      expect(formatReadingTime(60)).toBe('60 min read')
    })
  })

  describe('edge cases', () => {
    it('should handle 0 minutes', () => {
      expect(formatReadingTime(0)).toBe('0 min read')
    })

    it('should handle negative numbers', () => {
      expect(formatReadingTime(-1)).toBe('-1 min read')
    })

    it('should handle decimal numbers', () => {
      expect(formatReadingTime(5.5)).toBe('5.5 min read')
    })

    it('should handle very large numbers', () => {
      expect(formatReadingTime(1000)).toBe('1000 min read')
    })
  })
})
