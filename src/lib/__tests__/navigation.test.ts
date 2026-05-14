/**
 * Tests for navigation configuration
 *
 * Coverage goal: 100%
 * Test approach: Verification tests for navigation structure
 *
 * Test cases:
 * - Verify navigation items structure
 * - Verify localized navigation items
 * - Verify navigation item properties
 */

import { describe, it, expect } from 'vitest'
import { navigationItems } from '../navigation'

describe('navigation', () => {
  describe('structure', () => {
    it('should export navigationItems object', () => {
      expect(navigationItems).toBeDefined()
      expect(typeof navigationItems).toBe('object')
    })

    it('should have ko and en locales', () => {
      expect(navigationItems).toHaveProperty('ko')
      expect(navigationItems).toHaveProperty('en')
    })

    it('should have arrays for each locale', () => {
      expect(Array.isArray(navigationItems.ko)).toBe(true)
      expect(Array.isArray(navigationItems.en)).toBe(true)
    })

    it('should have same number of items for both locales', () => {
      expect(navigationItems.ko.length).toBe(navigationItems.en.length)
    })
  })

  describe('Korean navigation', () => {
    it('should have navigation items', () => {
      expect(navigationItems.ko.length).toBeGreaterThan(0)
    })

    it('should have Home item', () => {
      const homeItem = navigationItems.ko.find(item => item.href === '/')
      expect(homeItem).toBeDefined()
      expect(homeItem?.label).toBe('홈')
    })

    it('should have Archive item', () => {
      const archiveItem = navigationItems.ko.find(item => item.href === '/archive')
      expect(archiveItem).toBeDefined()
      expect(archiveItem?.label).toBe('아카이브')
    })

    it('should have valid href and label for each item', () => {
      navigationItems.ko.forEach(item => {
        expect(item).toHaveProperty('href')
        expect(item).toHaveProperty('label')
        expect(typeof item.href).toBe('string')
        expect(typeof item.label).toBe('string')
        expect(item.href.length).toBeGreaterThan(0)
        expect(item.label.length).toBeGreaterThan(0)
      })
    })

    it('should have hrefs starting with /', () => {
      navigationItems.ko.forEach(item => {
        expect(item.href.startsWith('/')).toBe(true)
      })
    })
  })

  describe('English navigation', () => {
    it('should have navigation items', () => {
      expect(navigationItems.en.length).toBeGreaterThan(0)
    })

    it('should have Home item', () => {
      const homeItem = navigationItems.en.find(item => item.href === '/')
      expect(homeItem).toBeDefined()
      expect(homeItem?.label).toBe('Home')
    })

    it('should have Archive item', () => {
      const archiveItem = navigationItems.en.find(item => item.href === '/archive')
      expect(archiveItem).toBeDefined()
      expect(archiveItem?.label).toBe('Archive')
    })

    it('should have valid href and label for each item', () => {
      navigationItems.en.forEach(item => {
        expect(item).toHaveProperty('href')
        expect(item).toHaveProperty('label')
        expect(typeof item.href).toBe('string')
        expect(typeof item.label).toBe('string')
        expect(item.href.length).toBeGreaterThan(0)
        expect(item.label.length).toBeGreaterThan(0)
      })
    })

    it('should have hrefs starting with /', () => {
      navigationItems.en.forEach(item => {
        expect(item.href.startsWith('/')).toBe(true)
      })
    })
  })

  describe('consistency between locales', () => {
    it('should have matching hrefs across locales', () => {
      const koHrefs = navigationItems.ko.map(item => item.href).sort()
      const enHrefs = navigationItems.en.map(item => item.href).sort()

      expect(koHrefs).toEqual(enHrefs)
    })

    it('should have same routes in same order', () => {
      const koHrefs = navigationItems.ko.map(item => item.href)
      const enHrefs = navigationItems.en.map(item => item.href)

      expect(koHrefs).toEqual(enHrefs)
    })

    it('should have different labels for same routes', () => {
      navigationItems.ko.forEach((koItem, index) => {
        const enItem = navigationItems.en[index]

        // Same href
        expect(koItem.href).toBe(enItem.href)

        // Different label (localized)
        if (koItem.href === '/') {
          expect(koItem.label).toBe('홈')
          expect(enItem.label).toBe('Home')
        }
        if (koItem.href === '/archive') {
          expect(koItem.label).toBe('아카이브')
          expect(enItem.label).toBe('Archive')
        }
      })
    })
  })

  describe('navigation item properties', () => {
    it('should have exactly 2 properties per item (href and label)', () => {
      navigationItems.ko.forEach(item => {
        expect(Object.keys(item)).toHaveLength(2)
      })

      navigationItems.en.forEach(item => {
        expect(Object.keys(item)).toHaveLength(2)
      })
    })

    it('should not have undefined or null values', () => {
      navigationItems.ko.forEach(item => {
        expect(item.href).toBeTruthy()
        expect(item.label).toBeTruthy()
      })

      navigationItems.en.forEach(item => {
        expect(item.href).toBeTruthy()
        expect(item.label).toBeTruthy()
      })
    })
  })

  describe('currently active items', () => {
    it('should have Home and Archive items active', () => {
      const koHrefs = navigationItems.ko.map(item => item.href)
      const enHrefs = navigationItems.en.map(item => item.href)

      expect(koHrefs).toContain('/')
      expect(koHrefs).toContain('/archive')
      expect(enHrefs).toContain('/')
      expect(enHrefs).toContain('/archive')
    })

    it('should have exactly 2 items currently active', () => {
      expect(navigationItems.ko).toHaveLength(2)
      expect(navigationItems.en).toHaveLength(2)
    })
  })
})
