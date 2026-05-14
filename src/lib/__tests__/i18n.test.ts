/**
 * Tests for internationalization utilities
 *
 * Coverage goal: 100%
 * Test approach: Unit tests (no mocks, pure functions)
 *
 * Test cases:
 * - isValidLocale: valid locales, invalid strings
 * - getAlternateLinks: pathname generation for different locales
 * - Constants: locales, defaultLocale, languageNames
 */

import { describe, it, expect } from 'vitest'
import {
  isValidLocale,
  getAlternateLinks,
  locales,
  defaultLocale,
  languageNames,
  type Locale,
} from '../i18n'

describe('i18n module', () => {
  describe('constants', () => {
    it('should export locales array', () => {
      expect(locales).toEqual(['ko', 'en'])
      expect(locales).toHaveLength(2)
    })

    it('should have default locale as ko', () => {
      expect(defaultLocale).toBe('ko')
    })

    it('should have language names for all locales', () => {
      expect(languageNames).toEqual({
        ko: '한국어',
        en: 'English',
      })
    })

    it('should have language name for each locale', () => {
      locales.forEach((locale) => {
        expect(languageNames[locale]).toBeTruthy()
        expect(typeof languageNames[locale]).toBe('string')
      })
    })
  })

  describe('isValidLocale', () => {
    describe('valid locales', () => {
      it('should return true for "ko"', () => {
        expect(isValidLocale('ko')).toBe(true)
      })

      it('should return true for "en"', () => {
        expect(isValidLocale('en')).toBe(true)
      })

      it('should validate all defined locales', () => {
        locales.forEach((locale) => {
          expect(isValidLocale(locale)).toBe(true)
        })
      })
    })

    describe('invalid locales', () => {
      it('should return false for "fr"', () => {
        expect(isValidLocale('fr')).toBe(false)
      })

      it('should return false for "de"', () => {
        expect(isValidLocale('de')).toBe(false)
      })

      it('should return false for "ja"', () => {
        expect(isValidLocale('ja')).toBe(false)
      })

      it('should return false for "zh"', () => {
        expect(isValidLocale('zh')).toBe(false)
      })

      it('should return false for empty string', () => {
        expect(isValidLocale('')).toBe(false)
      })

      it('should return false for random string', () => {
        expect(isValidLocale('invalid')).toBe(false)
      })

      it('should return false for number as string', () => {
        expect(isValidLocale('123')).toBe(false)
      })
    })

    describe('case sensitivity', () => {
      it('should be case-sensitive', () => {
        expect(isValidLocale('KO')).toBe(false)
        expect(isValidLocale('EN')).toBe(false)
        expect(isValidLocale('Ko')).toBe(false)
        expect(isValidLocale('En')).toBe(false)
      })
    })

    describe('special characters', () => {
      it('should return false for locale with spaces', () => {
        expect(isValidLocale('ko ')).toBe(false)
        expect(isValidLocale(' ko')).toBe(false)
      })

      it('should return false for locale with special chars', () => {
        expect(isValidLocale('ko-')).toBe(false)
        expect(isValidLocale('ko_KR')).toBe(false)
      })
    })

    describe('type narrowing', () => {
      it('should narrow type to Locale when true', () => {
        const input = 'ko'
        if (isValidLocale(input)) {
          // TypeScript should narrow 'input' to Locale type
          const locale: Locale = input
          expect(locale).toBe('ko')
        }
      })
    })
  })

  describe('getAlternateLinks', () => {
    describe('basic functionality', () => {
      it('should generate links for root path', () => {
        const links = getAlternateLinks('/')

        expect(links).toHaveLength(2)
        expect(links).toContainEqual({ locale: 'ko', url: '/ko/' })
        expect(links).toContainEqual({ locale: 'en', url: '/en/' })
      })

      it('should generate links for simple path', () => {
        const links = getAlternateLinks('/about')

        expect(links).toHaveLength(2)
        expect(links).toContainEqual({ locale: 'ko', url: '/ko/about' })
        expect(links).toContainEqual({ locale: 'en', url: '/en/about' })
      })

      it('should generate links for nested path', () => {
        const links = getAlternateLinks('/blog/post-slug')

        expect(links).toHaveLength(2)
        expect(links).toContainEqual({ locale: 'ko', url: '/ko/blog/post-slug' })
        expect(links).toContainEqual({ locale: 'en', url: '/en/blog/post-slug' })
      })

      it('should generate links for deep nested path', () => {
        const links = getAlternateLinks('/category/subcategory/item')

        expect(links).toContainEqual({ locale: 'ko', url: '/ko/category/subcategory/item' })
        expect(links).toContainEqual({ locale: 'en', url: '/en/category/subcategory/item' })
      })
    })

    describe('path with query params', () => {
      it('should preserve query parameters', () => {
        const links = getAlternateLinks('/search?q=test')

        expect(links).toContainEqual({ locale: 'ko', url: '/ko/search?q=test' })
        expect(links).toContainEqual({ locale: 'en', url: '/en/search?q=test' })
      })

      it('should preserve multiple query parameters', () => {
        const links = getAlternateLinks('/search?q=test&page=2')

        expect(links).toContainEqual({ locale: 'ko', url: '/ko/search?q=test&page=2' })
        expect(links).toContainEqual({ locale: 'en', url: '/en/search?q=test&page=2' })
      })
    })

    describe('path with hash', () => {
      it('should preserve hash', () => {
        const links = getAlternateLinks('/page#section')

        expect(links).toContainEqual({ locale: 'ko', url: '/ko/page#section' })
        expect(links).toContainEqual({ locale: 'en', url: '/en/page#section' })
      })

      it('should preserve query and hash', () => {
        const links = getAlternateLinks('/page?id=1#section')

        expect(links).toContainEqual({ locale: 'ko', url: '/ko/page?id=1#section' })
        expect(links).toContainEqual({ locale: 'en', url: '/en/page?id=1#section' })
      })
    })

    describe('edge cases', () => {
      it('should handle empty string path', () => {
        const links = getAlternateLinks('')

        expect(links).toHaveLength(2)
        expect(links).toContainEqual({ locale: 'ko', url: '/ko' })
        expect(links).toContainEqual({ locale: 'en', url: '/en' })
      })

      it('should handle path without leading slash', () => {
        const links = getAlternateLinks('about')

        expect(links).toContainEqual({ locale: 'ko', url: '/koabout' })
        expect(links).toContainEqual({ locale: 'en', url: '/enabout' })
      })

      it('should handle path with trailing slash', () => {
        const links = getAlternateLinks('/about/')

        expect(links).toContainEqual({ locale: 'ko', url: '/ko/about/' })
        expect(links).toContainEqual({ locale: 'en', url: '/en/about/' })
      })

      it('should handle path with special characters', () => {
        const links = getAlternateLinks('/blog/post-with-dash_and_underscore')

        expect(links).toContainEqual({ locale: 'ko', url: '/ko/blog/post-with-dash_and_underscore' })
        expect(links).toContainEqual({ locale: 'en', url: '/en/blog/post-with-dash_and_underscore' })
      })

      it('should handle path with numbers', () => {
        const links = getAlternateLinks('/blog/post-123')

        expect(links).toContainEqual({ locale: 'ko', url: '/ko/blog/post-123' })
        expect(links).toContainEqual({ locale: 'en', url: '/en/blog/post-123' })
      })
    })

    describe('return value structure', () => {
      it('should return array of objects with locale and url', () => {
        const links = getAlternateLinks('/test')

        links.forEach((link) => {
          expect(link).toHaveProperty('locale')
          expect(link).toHaveProperty('url')
          expect(typeof link.locale).toBe('string')
          expect(typeof link.url).toBe('string')
        })
      })

      it('should maintain locale order', () => {
        const links = getAlternateLinks('/test')

        expect(links[0].locale).toBe('ko')
        expect(links[1].locale).toBe('en')
      })

      it('should generate one link per locale', () => {
        const links = getAlternateLinks('/test')

        expect(links).toHaveLength(locales.length)
      })
    })

    describe('real-world examples', () => {
      it('should handle blog post path', () => {
        const links = getAlternateLinks('/blog/how-to-use-nextjs')

        expect(links).toContainEqual({
          locale: 'ko',
          url: '/ko/blog/how-to-use-nextjs'
        })
        expect(links).toContainEqual({
          locale: 'en',
          url: '/en/blog/how-to-use-nextjs'
        })
      })

      it('should handle admin path', () => {
        const links = getAlternateLinks('/admin/posts')

        expect(links).toContainEqual({
          locale: 'ko',
          url: '/ko/admin/posts'
        })
        expect(links).toContainEqual({
          locale: 'en',
          url: '/en/admin/posts'
        })
      })

      it('should handle API path', () => {
        const links = getAlternateLinks('/api/posts')

        expect(links).toContainEqual({
          locale: 'ko',
          url: '/ko/api/posts'
        })
        expect(links).toContainEqual({
          locale: 'en',
          url: '/en/api/posts'
        })
      })
    })
  })
})
