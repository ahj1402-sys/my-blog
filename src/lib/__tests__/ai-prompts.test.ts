/**
 * Tests for AI prompt generation utilities
 *
 * Coverage goal: 90-100%
 * Test approach: Unit tests (no mocks, pure functions)
 *
 * Test cases:
 * - generateContentPrompt: basic prompt, keywords, affiliate products, combinations
 * - MASTER_SYSTEM_PROMPT: structure validation
 */

import { describe, it, expect } from 'vitest'
import { MASTER_SYSTEM_PROMPT, generateContentPrompt } from '../ai-prompts'

describe('MASTER_SYSTEM_PROMPT', () => {
  describe('structure validation', () => {
    it('should be a non-empty string', () => {
      expect(MASTER_SYSTEM_PROMPT).toBeTruthy()
      expect(typeof MASTER_SYSTEM_PROMPT).toBe('string')
      expect(MASTER_SYSTEM_PROMPT.length).toBeGreaterThan(0)
    })

    it('should contain core sections', () => {
      expect(MASTER_SYSTEM_PROMPT).toContain('ROLE & GOAL')
      expect(MASTER_SYSTEM_PROMPT).toContain('CRITICAL CONTENT GENERATION RULES')
      expect(MASTER_SYSTEM_PROMPT).toContain('SEO CONSTITUTION')
      expect(MASTER_SYSTEM_PROMPT).toContain('OUTPUT STRUCTURE & FORMATTING')
    })

    it('should contain E-E-A-T compliance', () => {
      expect(MASTER_SYSTEM_PROMPT).toContain('E-E-A-T')
      expect(MASTER_SYSTEM_PROMPT).toContain('experience')
      expect(MASTER_SYSTEM_PROMPT).toContain('expertise')
      expect(MASTER_SYSTEM_PROMPT).toContain('authoritativeness')
      expect(MASTER_SYSTEM_PROMPT).toContain('trustworthiness')
    })

    it('should contain content pillars', () => {
      expect(MASTER_SYSTEM_PROMPT).toContain('CONTENT PILLARS')
      expect(MASTER_SYSTEM_PROMPT).toContain('Biohacking')
      expect(MASTER_SYSTEM_PROMPT).toContain('Startup Architect')
      expect(MASTER_SYSTEM_PROMPT).toContain('Sovereign Mind')
    })

    it('should contain persona guidelines', () => {
      expect(MASTER_SYSTEM_PROMPT).toContain('PERSONA & VOICE')
      expect(MASTER_SYSTEM_PROMPT).toContain('Cole IT AI')
      expect(MASTER_SYSTEM_PROMPT).toContain('brutally honest')
    })

    it('should contain SEO requirements', () => {
      expect(MASTER_SYSTEM_PROMPT).toContain('Content & Quality')
      expect(MASTER_SYSTEM_PROMPT).toContain('Technical SEO')
      expect(MASTER_SYSTEM_PROMPT).toContain('Page Experience')
      expect(MASTER_SYSTEM_PROMPT).toContain('Spam Policy')
    })

    it('should contain monetization strategy', () => {
      expect(MASTER_SYSTEM_PROMPT).toContain('AFFILIATE & MONETIZATION')
      expect(MASTER_SYSTEM_PROMPT).toContain('call-to-action')
    })

    it('should contain output format requirements', () => {
      expect(MASTER_SYSTEM_PROMPT).toContain('SEO Title')
      expect(MASTER_SYSTEM_PROMPT).toContain('Meta Description')
      expect(MASTER_SYSTEM_PROMPT).toContain('Slug')
      expect(MASTER_SYSTEM_PROMPT).toContain('Excerpt')
      expect(MASTER_SYSTEM_PROMPT).toContain('Article Body')
      expect(MASTER_SYSTEM_PROMPT).toContain('Tags')
    })
  })

  describe('character limits', () => {
    it('should mention 60 character limit for titles', () => {
      expect(MASTER_SYSTEM_PROMPT).toContain('under 60 char')
    })

    it('should mention 160 character limit for meta description', () => {
      expect(MASTER_SYSTEM_PROMPT).toContain('under 160 char')
    })
  })

  describe('content requirements', () => {
    it('should emphasize writing for people', () => {
      expect(MASTER_SYSTEM_PROMPT).toContain('written for people, not search engines')
    })

    it('should require original value', () => {
      expect(MASTER_SYSTEM_PROMPT).toContain('original value')
    })

    it('should mention human review', () => {
      expect(MASTER_SYSTEM_PROMPT).toContain('reviewed by humans')
    })
  })
})

describe('generateContentPrompt', () => {
  describe('basic functionality', () => {
    it('should generate prompt with user input only', () => {
      const result = generateContentPrompt('AI and Machine Learning')

      expect(result).toContain('Topic: AI and Machine Learning')
      expect(result).toContain('MINIMUM 3000 words')
      expect(result).toContain('JSON format')
    })

    it('should include critical requirements section', () => {
      const result = generateContentPrompt('Test Topic')

      expect(result).toContain('CRITICAL REQUIREMENTS')
      expect(result).toContain('E-E-A-T compliance')
      expect(result).toContain('specific examples')
      expect(result).toContain('actionable insights')
    })

    it('should include content structure requirements', () => {
      const result = generateContentPrompt('Test Topic')

      expect(result).toContain('CONTENT STRUCTURE REQUIREMENTS')
      expect(result).toContain('Hook')
      expect(result).toContain('Problem/Context')
      expect(result).toContain('Main Content')
      expect(result).toContain('Personal Experience')
      expect(result).toContain('Practical Implementation')
      expect(result).toContain('Common Mistakes')
      expect(result).toContain('Advanced Tips')
      expect(result).toContain('Conclusion')
    })

    it('should specify JSON output format', () => {
      const result = generateContentPrompt('Test Topic')

      expect(result).toContain('"title"')
      expect(result).toContain('"slug"')
      expect(result).toContain('"excerpt"')
      expect(result).toContain('"content"')
      expect(result).toContain('"coverImage"')
      expect(result).toContain('"tags"')
      expect(result).toContain('"seoTitle"')
      expect(result).toContain('"seoDescription"')
    })

    it('should require coverImage from Unsplash', () => {
      const result = generateContentPrompt('Test Topic')

      expect(result).toContain('coverImage')
      expect(result).toContain('REQUIRED')
      expect(result).toContain('Unsplash')
      expect(result).toContain('https://images.unsplash.com')
    })
  })

  describe('keywords integration', () => {
    it('should include keywords when provided', () => {
      const keywords = ['AI', 'Machine Learning', 'Deep Learning']
      const result = generateContentPrompt('AI Tutorial', keywords)

      expect(result).toContain('Target Keywords: AI, Machine Learning, Deep Learning')
    })

    it('should handle single keyword', () => {
      const result = generateContentPrompt('Topic', ['SEO'])

      expect(result).toContain('Target Keywords: SEO')
    })

    it('should not include keywords section when empty array', () => {
      const result = generateContentPrompt('Topic', [])

      expect(result).not.toContain('Target Keywords')
    })

    it('should not include keywords section when undefined', () => {
      const result = generateContentPrompt('Topic', undefined)

      expect(result).not.toContain('Target Keywords')
    })

    it('should handle keywords with special characters', () => {
      const keywords = ['Next.js', 'TypeScript', 'React.js']
      const result = generateContentPrompt('Topic', keywords)

      expect(result).toContain('Next.js, TypeScript, React.js')
    })
  })

  describe('affiliate products integration', () => {
    it('should include affiliate products when provided', () => {
      const products = ['Product A', 'Product B', 'Product C']
      const result = generateContentPrompt('Topic', undefined, products)

      expect(result).toContain('Affiliate Products to naturally integrate: Product A, Product B, Product C')
    })

    it('should handle single product', () => {
      const result = generateContentPrompt('Topic', undefined, ['Laptop'])

      expect(result).toContain('Affiliate Products to naturally integrate: Laptop')
    })

    it('should not include products section when empty array', () => {
      const result = generateContentPrompt('Topic', undefined, [])

      expect(result).not.toContain('Affiliate Products')
    })

    it('should not include products section when undefined', () => {
      const result = generateContentPrompt('Topic')

      expect(result).not.toContain('Affiliate Products')
    })

    it('should handle products with URLs', () => {
      const products = [
        'https://example.com/product-a',
        'https://example.com/product-b',
      ]
      const result = generateContentPrompt('Topic', undefined, products)

      expect(result).toContain('https://example.com/product-a')
      expect(result).toContain('https://example.com/product-b')
    })
  })

  describe('combined parameters', () => {
    it('should handle both keywords and affiliate products', () => {
      const keywords = ['AI', 'SEO']
      const products = ['Product A', 'Product B']
      const result = generateContentPrompt('Topic', keywords, products)

      expect(result).toContain('Topic: Topic')
      expect(result).toContain('Target Keywords: AI, SEO')
      expect(result).toContain('Affiliate Products to naturally integrate: Product A, Product B')
    })

    it('should handle all parameters with complex data', () => {
      const userInput = 'How to Build a Next.js Blog with TypeScript'
      const keywords = [
        'Next.js',
        'TypeScript',
        'Blog Development',
        'SEO',
        'Prisma',
      ]
      const products = [
        'Next.js Course by Vercel',
        'TypeScript Handbook',
        'Prisma Database Toolkit',
      ]

      const result = generateContentPrompt(userInput, keywords, products)

      expect(result).toContain('Topic: How to Build a Next.js Blog with TypeScript')
      expect(result).toContain('Next.js, TypeScript, Blog Development, SEO, Prisma')
      expect(result).toContain('Next.js Course by Vercel, TypeScript Handbook, Prisma Database Toolkit')
    })
  })

  describe('content requirements', () => {
    it('should specify minimum 3000 words', () => {
      const result = generateContentPrompt('Topic')

      expect(result).toContain('MINIMUM 3000 words')
    })

    it('should require 5-7 major sections', () => {
      const result = generateContentPrompt('Topic')

      expect(result).toContain('5-7 major sections')
    })

    it('should require personal anecdotes', () => {
      const result = generateContentPrompt('Topic')

      expect(result).toContain('personal anecdotes')
    })

    it('should require actionable advice', () => {
      const result = generateContentPrompt('Topic')

      expect(result).toContain('actionable advice')
    })

    it('should require thought-provoking question', () => {
      const result = generateContentPrompt('Topic')

      expect(result).toContain('thought-provoking question')
    })
  })

  describe('output format requirements', () => {
    it('should specify max 60 chars for title', () => {
      const result = generateContentPrompt('Topic')

      expect(result).toContain('max 60 chars')
    })

    it('should specify max 160 chars for meta description', () => {
      const result = generateContentPrompt('Topic')

      expect(result).toContain('max 160 chars')
    })

    it('should require Markdown format for content', () => {
      const result = generateContentPrompt('Topic')

      expect(result).toContain('Markdown format')
    })

    it('should require url-friendly slug', () => {
      const result = generateContentPrompt('Topic')

      expect(result).toContain('url-friendly-slug')
    })

    it('should require tags array', () => {
      const result = generateContentPrompt('Topic')

      expect(result).toContain('"tags"')
      expect(result).toContain('["tag1", "tag2"')
    })
  })

  describe('edge cases', () => {
    it('should handle empty string input', () => {
      const result = generateContentPrompt('')

      expect(result).toContain('Topic: ')
      expect(result).toContain('MINIMUM 3000 words')
    })

    it('should handle very long topic', () => {
      const longTopic = 'a'.repeat(500)
      const result = generateContentPrompt(longTopic)

      expect(result).toContain(`Topic: ${longTopic}`)
    })

    it('should handle topic with special characters', () => {
      const topic = 'AI & ML: How to Build with Next.js (2024)?'
      const result = generateContentPrompt(topic)

      expect(result).toContain('Topic: AI & ML: How to Build with Next.js (2024)?')
    })

    it('should handle Korean characters in topic', () => {
      const topic = 'Next.js로 블로그 만들기'
      const result = generateContentPrompt(topic)

      expect(result).toContain('Topic: Next.js로 블로그 만들기')
    })

    it('should handle mixed language keywords', () => {
      const keywords = ['AI', '인공지능', 'Machine Learning', '머신러닝']
      const result = generateContentPrompt('Topic', keywords)

      expect(result).toContain('AI, 인공지능, Machine Learning, 머신러닝')
    })
  })

  describe('prompt structure', () => {
    it('should start with topic statement', () => {
      const result = generateContentPrompt('Test Topic')

      expect(result).toMatch(/^Create a comprehensive.*Topic: Test Topic/s)
    })

    it('should end with coverImage instruction', () => {
      const result = generateContentPrompt('Test Topic')

      expect(result).toContain('IMPORTANT: You MUST include a coverImage URL')
      expect(result).toContain('https://images.unsplash.com/photo-')
    })

    it('should maintain proper section ordering', () => {
      const result = generateContentPrompt('Topic', ['keyword'], ['product'])

      const topicIndex = result.indexOf('Topic:')
      const keywordsIndex = result.indexOf('Target Keywords:')
      const productsIndex = result.indexOf('Affiliate Products')
      const requirementsIndex = result.indexOf('CRITICAL REQUIREMENTS')

      expect(topicIndex).toBeLessThan(keywordsIndex)
      expect(keywordsIndex).toBeLessThan(productsIndex)
      expect(productsIndex).toBeLessThan(requirementsIndex)
    })
  })

  describe('return type', () => {
    it('should return a string', () => {
      const result = generateContentPrompt('Topic')

      expect(typeof result).toBe('string')
    })

    it('should return non-empty string', () => {
      const result = generateContentPrompt('Topic')

      expect(result.length).toBeGreaterThan(0)
    })

    it('should return string longer than 1000 characters', () => {
      const result = generateContentPrompt('Topic')

      // Should be comprehensive prompt
      expect(result.length).toBeGreaterThan(1000)
    })
  })
})
