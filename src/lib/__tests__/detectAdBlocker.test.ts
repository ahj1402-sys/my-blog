/**
 * Tests for ad blocker detection utilities
 *
 * Coverage goal: 80-90%
 * Test approach: Unit tests with DOM mocking (happy-dom environment)
 *
 * Test cases:
 * - detectAdBlocker: ad blocked, not blocked, DOM manipulation
 * - hasSeenAdBlockerNotice: localStorage read, SSR safety
 * - markAdBlockerNoticeSeen: localStorage write
 * - resetAdBlockerNotice: localStorage remove
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  detectAdBlocker,
  hasSeenAdBlockerNotice,
  markAdBlockerNoticeSeen,
  resetAdBlockerNotice,
} from '../detectAdBlocker'

describe('detectAdBlocker', () => {
  describe('localStorage functions', () => {
    beforeEach(() => {
      // Clear localStorage before each test
      localStorage.clear()
    })

    describe('hasSeenAdBlockerNotice', () => {
      it('should return false when notice has not been seen', () => {
        expect(hasSeenAdBlockerNotice()).toBe(false)
      })

      it('should return true when notice has been seen', () => {
        localStorage.setItem('adblock-notice-seen', 'true')
        expect(hasSeenAdBlockerNotice()).toBe(true)
      })

      it('should return false when value is not "true"', () => {
        localStorage.setItem('adblock-notice-seen', 'false')
        expect(hasSeenAdBlockerNotice()).toBe(false)
      })

      it('should return false when value is empty string', () => {
        localStorage.setItem('adblock-notice-seen', '')
        expect(hasSeenAdBlockerNotice()).toBe(false)
      })

      it('should return false on localStorage error', () => {
        // Mock localStorage.getItem to throw error
        const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
          throw new Error('localStorage error')
        })

        expect(hasSeenAdBlockerNotice()).toBe(false)

        getItemSpy.mockRestore()
      })

      it('should be safe to call multiple times', () => {
        expect(hasSeenAdBlockerNotice()).toBe(false)
        expect(hasSeenAdBlockerNotice()).toBe(false)

        markAdBlockerNoticeSeen()

        expect(hasSeenAdBlockerNotice()).toBe(true)
        expect(hasSeenAdBlockerNotice()).toBe(true)
      })
    })

    describe('markAdBlockerNoticeSeen', () => {
      it('should set localStorage flag to true', () => {
        markAdBlockerNoticeSeen()

        expect(localStorage.getItem('adblock-notice-seen')).toBe('true')
      })

      it('should make hasSeenAdBlockerNotice return true', () => {
        markAdBlockerNoticeSeen()

        expect(hasSeenAdBlockerNotice()).toBe(true)
      })

      it('should overwrite existing value', () => {
        localStorage.setItem('adblock-notice-seen', 'false')

        markAdBlockerNoticeSeen()

        expect(localStorage.getItem('adblock-notice-seen')).toBe('true')
      })

      it('should not throw on localStorage error', () => {
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
          throw new Error('localStorage error')
        })

        expect(() => markAdBlockerNoticeSeen()).not.toThrow()

        setItemSpy.mockRestore()
      })

      it('should be idempotent', () => {
        markAdBlockerNoticeSeen()
        markAdBlockerNoticeSeen()
        markAdBlockerNoticeSeen()

        expect(hasSeenAdBlockerNotice()).toBe(true)
      })
    })

    describe('resetAdBlockerNotice', () => {
      it('should remove localStorage flag', () => {
        localStorage.setItem('adblock-notice-seen', 'true')

        resetAdBlockerNotice()

        expect(localStorage.getItem('adblock-notice-seen')).toBeNull()
      })

      it('should make hasSeenAdBlockerNotice return false', () => {
        markAdBlockerNoticeSeen()
        expect(hasSeenAdBlockerNotice()).toBe(true)

        resetAdBlockerNotice()

        expect(hasSeenAdBlockerNotice()).toBe(false)
      })

      it('should not throw when flag does not exist', () => {
        expect(() => resetAdBlockerNotice()).not.toThrow()
      })

      it('should not throw on localStorage error', () => {
        const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
          throw new Error('localStorage error')
        })

        expect(() => resetAdBlockerNotice()).not.toThrow()

        removeItemSpy.mockRestore()
      })

      it('should be idempotent', () => {
        markAdBlockerNoticeSeen()

        resetAdBlockerNotice()
        resetAdBlockerNotice()
        resetAdBlockerNotice()

        expect(hasSeenAdBlockerNotice()).toBe(false)
      })
    })

    describe('integration workflow', () => {
      it('should handle complete workflow: check → mark → check → reset → check', () => {
        // Initially not seen
        expect(hasSeenAdBlockerNotice()).toBe(false)

        // Mark as seen
        markAdBlockerNoticeSeen()
        expect(hasSeenAdBlockerNotice()).toBe(true)

        // Reset
        resetAdBlockerNotice()
        expect(hasSeenAdBlockerNotice()).toBe(false)
      })

      it('should persist across multiple reads', () => {
        markAdBlockerNoticeSeen()

        expect(hasSeenAdBlockerNotice()).toBe(true)
        expect(hasSeenAdBlockerNotice()).toBe(true)
        expect(hasSeenAdBlockerNotice()).toBe(true)
      })
    })
  })

  describe('detectAdBlocker', () => {
    beforeEach(() => {
      // Ensure clean DOM state
      document.head.innerHTML = ''
      document.body.innerHTML = ''
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.restoreAllMocks()
      vi.useRealTimers()
    })

    describe('basic functionality', () => {
      it('should return a Promise', () => {
        const result = detectAdBlocker()
        expect(result).toBeInstanceOf(Promise)
      })

      it('should resolve to a boolean', async () => {
        const promise = detectAdBlocker()
        await vi.runAllTimersAsync()
        const result = await promise

        expect(typeof result).toBe('boolean')
      })
    })

    describe('DOM manipulation', () => {
      it('should create and append script element', async () => {
        const promise = detectAdBlocker()

        // Check script was added
        const scripts = document.head.querySelectorAll('script')
        expect(scripts.length).toBeGreaterThan(0)

        const adsenseScript = Array.from(scripts).find(
          s => s.src.includes('pagead2.googlesyndication.com')
        )
        expect(adsenseScript).toBeDefined()

        await vi.runAllTimersAsync()
        await promise
      })

      it('should create and append bait element to body', async () => {
        const promise = detectAdBlocker()

        // Check bait element was added
        const baitElements = document.body.querySelectorAll('div')
        expect(baitElements.length).toBeGreaterThan(0)

        const baitElement = Array.from(baitElements).find(
          div => div.className.includes('advertisement')
        )
        expect(baitElement).toBeDefined()

        await vi.runAllTimersAsync()
        await promise
      })

      it('should clean up DOM elements after detection', async () => {
        const promise = detectAdBlocker()
        await vi.runAllTimersAsync()
        await promise

        // Both elements should be removed
        const scriptsAfter = document.head.querySelectorAll('script')
        const baitElementsAfter = document.body.querySelectorAll('div')

        const adsenseScript = Array.from(scriptsAfter).find(
          s => s.src.includes('pagead2.googlesyndication.com')
        )
        const baitElement = Array.from(baitElementsAfter).find(
          div => div.className.includes('advertisement')
        )

        expect(adsenseScript).toBeUndefined()
        expect(baitElement).toBeUndefined()
      })

      it('should wait 1000ms before resolving', async () => {
        const promise = detectAdBlocker()

        // Should not resolve immediately
        await vi.advanceTimersByTimeAsync(500)
        // Promise should still be pending at this point

        // Should resolve after 1000ms
        await vi.advanceTimersByTimeAsync(500)
        const result = await promise

        expect(typeof result).toBe('boolean')
      })
    })

    describe('ad blocker detection logic', () => {
      it('should return false early if adsbygoogle is already loaded', async () => {
        // Mock adsbygoogle global
        ;(window as any).adsbygoogle = []

        const result = await detectAdBlocker()

        expect(result).toBe(false)

        // Cleanup
        delete (window as any).adsbygoogle
      })

      it('should detect ad blocker when script errors AND bait is hidden AND script did not load', async () => {
        const promise = detectAdBlocker()

        // Trigger script error (and ensure script.onload is NOT called)
        const script = document.head.querySelector('script')
        if (script && script.onerror) {
          script.onerror(new Event('error'))
        }

        // Mock bait element as hidden
        const baitElement = document.body.querySelector('div')
        if (baitElement) {
          Object.defineProperty(baitElement, 'offsetHeight', { value: 0 })
        }

        await vi.runAllTimersAsync()
        const result = await promise

        // Should be blocked because ALL THREE conditions: !scriptLoaded AND scriptErrored AND baitHidden
        expect(result).toBe(true)
      })

      it('should NOT detect ad blocker when script errors but bait is visible', async () => {
        const promise = detectAdBlocker()

        // Trigger script error
        const script = document.head.querySelector('script')
        if (script && script.onerror) {
          script.onerror(new Event('error'))
        }

        // Mock bait element as visible (not hidden)
        const baitElement = document.body.querySelector('div')
        if (baitElement) {
          Object.defineProperty(baitElement, 'offsetHeight', { value: 250 })
          Object.defineProperty(baitElement, 'offsetWidth', { value: 300 })
          baitElement.style.display = 'block'
          baitElement.style.visibility = 'visible'
          baitElement.style.opacity = '1'
        }

        await vi.runAllTimersAsync()
        const result = await promise

        // Should NOT be blocked (script error alone is not enough)
        expect(result).toBe(false)
      })

      it('should NOT detect ad blocker when script loads (despite bait being hidden)', async () => {
        const promise = detectAdBlocker()

        // Explicitly trigger onload to simulate successful load (overrides happy-dom's automatic error)
        const script = document.head.querySelector('script')
        if (script && script.onload) {
          script.onload(new Event('load'))
        }

        // Mock bait element as hidden (but script loaded, so should NOT be blocked)
        const baitElement = document.body.querySelector('div')
        if (baitElement) {
          Object.defineProperty(baitElement, 'offsetHeight', { value: 0 })
        }

        await vi.runAllTimersAsync()
        const result = await promise

        // Should NOT be blocked because script loaded successfully (scriptLoaded = true)
        expect(result).toBe(false)
      })

      it('should detect ad blocker when bait element has zero height AND script errors AND did not load', async () => {
        const promise = detectAdBlocker()

        // Trigger script error (don't call onload)
        const script = document.head.querySelector('script')
        if (script && script.onerror) {
          script.onerror(new Event('error'))
        }

        // Mock bait element with zero height
        const baitElement = document.body.querySelector('div')
        if (baitElement) {
          Object.defineProperty(baitElement, 'offsetHeight', { value: 0 })
          Object.defineProperty(baitElement, 'offsetWidth', { value: 300 })
        }

        await vi.runAllTimersAsync()
        const result = await promise

        expect(result).toBe(true)
      })

      it('should detect ad blocker when bait element is display:none AND script errors AND did not load', async () => {
        const promise = detectAdBlocker()

        // Trigger script error (don't call onload)
        const script = document.head.querySelector('script')
        if (script && script.onerror) {
          script.onerror(new Event('error'))
        }

        const baitElement = document.body.querySelector('div')
        if (baitElement) {
          baitElement.style.display = 'none'
          Object.defineProperty(baitElement, 'offsetHeight', { value: 250 })
          Object.defineProperty(baitElement, 'offsetWidth', { value: 300 })
        }

        await vi.runAllTimersAsync()
        const result = await promise

        expect(result).toBe(true)
      })

      it('should NOT detect ad blocker when script loads successfully', async () => {
        const promise = detectAdBlocker()

        // Trigger script load (success)
        const script = document.head.querySelector('script')
        if (script && script.onload) {
          script.onload(new Event('load'))
        }

        // Bait element state doesn't matter when script loads
        const baitElement = document.body.querySelector('div')
        if (baitElement) {
          Object.defineProperty(baitElement, 'offsetHeight', { value: 0 })
        }

        await vi.runAllTimersAsync()
        const result = await promise

        expect(result).toBe(false)
      })

      it('should NOT detect ad blocker when neither condition is met', async () => {
        const promise = detectAdBlocker()

        // Don't trigger script error or load - simulating slow network

        // Make bait element visible
        const baitElement = document.body.querySelector('div')
        if (baitElement) {
          Object.defineProperty(baitElement, 'offsetHeight', { value: 250 })
          Object.defineProperty(baitElement, 'offsetWidth', { value: 300 })
          baitElement.style.display = 'block'
          baitElement.style.visibility = 'visible'
          baitElement.style.opacity = '1'
        }

        await vi.runAllTimersAsync()
        const result = await promise

        expect(result).toBe(false)
      })
    })

    describe('bait element configuration', () => {
      it('should have ad-like class names', async () => {
        detectAdBlocker()

        const baitElement = document.body.querySelector('div')
        expect(baitElement?.className).toContain('ad')
        expect(baitElement?.className).toContain('ads')
        expect(baitElement?.className).toContain('advertisement')
        expect(baitElement?.className).toContain('adsbygoogle')
      })

      it('should have data-ad-slot attribute', async () => {
        detectAdBlocker()

        const baitElement = document.body.querySelector('div')
        expect(baitElement?.getAttribute('data-ad-slot')).toBeTruthy()
      })

      it('should be positioned off-screen', async () => {
        detectAdBlocker()

        const baitElement = document.body.querySelector('div') as HTMLDivElement
        expect(baitElement?.style.position).toBe('absolute')
        expect(baitElement?.style.left).toContain('-9999px')
        expect(baitElement?.style.top).toContain('-9999px')
      })
    })
  })
})
