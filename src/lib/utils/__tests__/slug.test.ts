/**
 * Tests for slug generation utilities
 *
 * Coverage goal: 90-100%
 * Test approach: Unit tests (no mocks, pure functions)
 *
 * Test cases:
 * - generateSlug: basic conversion, Korean support, special chars, length limits
 * - generateUniqueSlug: uniqueness with counter, async behavior
 * - generateUniqueSlugWithTimestamp: timestamp format, uniqueness
 */

import { describe, it, expect, vi } from 'vitest'
import {
  generateSlug,
  generateUniqueSlug,
  generateUniqueSlugWithTimestamp,
} from '../slug'

describe('generateSlug', () => {
  describe('basic functionality', () => {
    it('should convert title to lowercase slug', () => {
      expect(generateSlug('Hello World')).toBe('hello-world')
    })

    it('should replace spaces with hyphens', () => {
      expect(generateSlug('This Is A Test')).toBe('this-is-a-test')
    })

    it('should remove special characters', () => {
      expect(generateSlug('Hello! World? #Test')).toBe('hello-world-test')
    })

    it('should collapse multiple hyphens into one', () => {
      expect(generateSlug('Hello   World')).toBe('hello-world')
      expect(generateSlug('Test---Multiple---Hyphens')).toBe('test-multiple-hyphens')
    })

    it('should trim leading and trailing hyphens', () => {
      expect(generateSlug('!Hello World!')).toBe('hello-world')
      expect(generateSlug('---Test---')).toBe('test')
    })

    it('should handle empty string', () => {
      expect(generateSlug('')).toBe('')
    })

    it('should handle string with only special characters', () => {
      expect(generateSlug('!@#$%^&*()')).toBe('')
    })
  })

  describe('Korean character support', () => {
    it('should preserve Korean characters', () => {
      expect(generateSlug('안녕하세요 세계')).toBe('안녕하세요-세계')
    })

    it('should handle mixed Korean and English', () => {
      expect(generateSlug('Hello 안녕 World 세계')).toBe('hello-안녕-world-세계')
    })

    it('should handle Korean with numbers', () => {
      expect(generateSlug('테스트123')).toBe('테스트123')
    })
  })

  describe('length limits', () => {
    it('should truncate to default 60 characters', () => {
      const longTitle = 'a'.repeat(100)
      const slug = generateSlug(longTitle)
      expect(slug.length).toBe(60)
    })

    it('should truncate to custom max length', () => {
      const longTitle = 'hello-world-this-is-a-very-long-title-that-exceeds-limit'
      const slug = generateSlug(longTitle, 20)
      expect(slug.length).toBeLessThanOrEqual(20)
    })

    it('should not truncate if under max length', () => {
      const shortTitle = 'short'
      expect(generateSlug(shortTitle, 60)).toBe('short')
    })
  })

  describe('edge cases', () => {
    it('should handle numbers', () => {
      expect(generateSlug('123 456')).toBe('123-456')
    })

    it('should handle mixed alphanumeric', () => {
      expect(generateSlug('test123abc')).toBe('test123abc')
    })

    it('should handle single character', () => {
      expect(generateSlug('a')).toBe('a')
    })

    it('should handle underscores (non-alphanumeric)', () => {
      expect(generateSlug('hello_world')).toBe('hello-world')
    })

    it('should handle dots and commas', () => {
      expect(generateSlug('hello.world,test')).toBe('hello-world-test')
    })
  })
})

describe('generateUniqueSlug', () => {
  describe('uniqueness logic', () => {
    it('should return base slug if not exists', async () => {
      const checkExists = vi.fn().mockResolvedValue(false)
      const result = await generateUniqueSlug('test-slug', checkExists)

      expect(result).toBe('test-slug')
      expect(checkExists).toHaveBeenCalledWith('test-slug')
      expect(checkExists).toHaveBeenCalledTimes(1)
    })

    it('should append -1 if base slug exists', async () => {
      const checkExists = vi.fn()
        .mockResolvedValueOnce(true)  // 'test-slug' exists
        .mockResolvedValueOnce(false) // 'test-slug-1' does not exist

      const result = await generateUniqueSlug('test-slug', checkExists)

      expect(result).toBe('test-slug-1')
      expect(checkExists).toHaveBeenCalledWith('test-slug')
      expect(checkExists).toHaveBeenCalledWith('test-slug-1')
      expect(checkExists).toHaveBeenCalledTimes(2)
    })

    it('should increment counter until unique slug found', async () => {
      const checkExists = vi.fn()
        .mockResolvedValueOnce(true)  // 'test-slug' exists
        .mockResolvedValueOnce(true)  // 'test-slug-1' exists
        .mockResolvedValueOnce(true)  // 'test-slug-2' exists
        .mockResolvedValueOnce(false) // 'test-slug-3' does not exist

      const result = await generateUniqueSlug('test-slug', checkExists)

      expect(result).toBe('test-slug-3')
      expect(checkExists).toHaveBeenCalledTimes(4)
    })

    it('should handle large counter values', async () => {
      const checkExists = vi.fn()

      // Simulate 99 existing slugs
      for (let i = 0; i < 100; i++) {
        checkExists.mockResolvedValueOnce(true)
      }
      checkExists.mockResolvedValueOnce(false)

      const result = await generateUniqueSlug('popular-slug', checkExists)

      expect(result).toBe('popular-slug-100')
    })
  })

  describe('async behavior', () => {
    it('should handle async check function', async () => {
      const checkExists = async (slug: string) => {
        // Simulate database lookup delay
        await new Promise(resolve => setTimeout(resolve, 10))
        return slug === 'existing-slug'
      }

      const result = await generateUniqueSlug('existing-slug', checkExists)
      expect(result).toBe('existing-slug-1')
    })

    it('should handle rejected promises', async () => {
      const checkExists = vi.fn().mockRejectedValue(new Error('Database error'))

      await expect(
        generateUniqueSlug('test-slug', checkExists)
      ).rejects.toThrow('Database error')
    })
  })
})

describe('generateUniqueSlugWithTimestamp', () => {
  describe('format validation', () => {
    it('should include base slug, timestamp, and random number', () => {
      const result = generateUniqueSlugWithTimestamp('Test Title')
      const parts = result.split('-')

      // Format: test-title-{timestamp}-{random}
      expect(parts.length).toBeGreaterThanOrEqual(4)
      expect(parts[0]).toBe('test')
      expect(parts[1]).toBe('title')

      // Last two parts should be numbers
      const timestamp = parseInt(parts[parts.length - 2])
      const randomNum = parseInt(parts[parts.length - 1])

      expect(timestamp).toBeGreaterThan(0)
      expect(randomNum).toBeGreaterThanOrEqual(0)
      expect(randomNum).toBeLessThan(1000)
    })

    it('should use Date.now() for timestamp', () => {
      const before = Date.now()
      const result = generateUniqueSlugWithTimestamp('Test')
      const after = Date.now()

      const parts = result.split('-')
      const timestamp = parseInt(parts[parts.length - 2])

      expect(timestamp).toBeGreaterThanOrEqual(before)
      expect(timestamp).toBeLessThanOrEqual(after)
    })

    it('should include random number between 0-999', () => {
      // Generate multiple slugs to test randomness
      const results = Array.from({ length: 10 }, () =>
        generateUniqueSlugWithTimestamp('Test')
      )

      results.forEach(result => {
        const parts = result.split('-')
        const randomNum = parseInt(parts[parts.length - 1])
        expect(randomNum).toBeGreaterThanOrEqual(0)
        expect(randomNum).toBeLessThan(1000)
      })
    })
  })

  describe('length handling', () => {
    it('should truncate to default 50 characters before adding suffix', () => {
      const longTitle = 'a'.repeat(100)
      const result = generateUniqueSlugWithTimestamp(longTitle)

      // Base slug should be truncated to 50, then timestamp + random added
      const parts = result.split('-')
      const baseSlug = parts.slice(0, -2).join('-')
      expect(baseSlug.length).toBeLessThanOrEqual(50)
    })

    it('should respect custom max length', () => {
      const result = generateUniqueSlugWithTimestamp('Long Title Here', 10)
      const parts = result.split('-')
      const baseSlug = parts.slice(0, -2).join('-')
      expect(baseSlug.length).toBeLessThanOrEqual(10)
    })
  })

  describe('uniqueness guarantee', () => {
    it('should generate different slugs on consecutive calls', () => {
      const slug1 = generateUniqueSlugWithTimestamp('Test')
      const slug2 = generateUniqueSlugWithTimestamp('Test')

      // Due to timestamp + random, these should be different
      expect(slug1).not.toBe(slug2)
    })

    it('should handle Korean titles with timestamp', () => {
      const result = generateUniqueSlugWithTimestamp('테스트 제목')
      expect(result).toContain('테스트')
      expect(result).toContain('제목')

      // Should have timestamp and random number
      const parts = result.split('-')
      expect(parts.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('edge cases', () => {
    it('should handle empty string', () => {
      const result = generateUniqueSlugWithTimestamp('')
      const parts = result.split('-')

      // Format: -{timestamp}-{random} (3 parts: empty string, timestamp, random)
      expect(parts.length).toBe(3)
      expect(parts[0]).toBe('') // empty base slug
      expect(parseInt(parts[1])).toBeGreaterThan(0) // timestamp
      expect(parseInt(parts[2])).toBeGreaterThanOrEqual(0) // random
    })

    it('should handle special characters', () => {
      const result = generateUniqueSlugWithTimestamp('Hello! @World#')
      expect(result).toContain('hello')
      expect(result).toContain('world')
      expect(result).not.toContain('!')
      expect(result).not.toContain('@')
      expect(result).not.toContain('#')
    })

    it('should handle very short maxLength', () => {
      const result = generateUniqueSlugWithTimestamp('Test Title', 5)
      const parts = result.split('-')
      const baseSlug = parts.slice(0, -2).join('-')
      expect(baseSlug.length).toBeLessThanOrEqual(5)
    })
  })
})
