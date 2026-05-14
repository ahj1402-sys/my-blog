/**
 * Tests for analytics tracking
 *
 * Coverage goal: 100%
 * Test approach: Unit tests with window.gtag mocking
 *
 * Test cases:
 * - trackEvent: gtag calls, console logging, SSR safety
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { trackEvent } from '../analytics'

describe('analytics', () => {
  describe('trackEvent', () => {
    let originalEnv: NodeJS.ProcessEnv
    let gtagSpy: ReturnType<typeof vi.fn>
    let consoleLogSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      originalEnv = { ...process.env }
      gtagSpy = vi.fn()
      consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      // Setup window.gtag
      if (typeof window !== 'undefined') {
        ;(window as any).gtag = gtagSpy
      }
    })

    afterEach(() => {
      process.env = originalEnv
      consoleLogSpy.mockRestore()

      if (typeof window !== 'undefined') {
        delete (window as any).gtag
      }
    })

    describe('Google Analytics tracking', () => {
      it('should call gtag with correct parameters', () => {
        trackEvent('click', 'button', 'submit')

        expect(gtagSpy).toHaveBeenCalledWith('event', 'click', {
          event_category: 'button',
          event_label: 'submit',
          value: undefined,
        })
      })

      it('should include value when provided', () => {
        trackEvent('purchase', 'ecommerce', 'product-123', 99.99)

        expect(gtagSpy).toHaveBeenCalledWith('event', 'purchase', {
          event_category: 'ecommerce',
          event_label: 'product-123',
          value: 99.99,
        })
      })

      it('should work without label and value', () => {
        trackEvent('page_view', 'navigation')

        expect(gtagSpy).toHaveBeenCalledWith('event', 'page_view', {
          event_category: 'navigation',
          event_label: undefined,
          value: undefined,
        })
      })

      it('should handle zero value', () => {
        trackEvent('free_trial', 'signup', 'basic', 0)

        expect(gtagSpy).toHaveBeenCalledWith('event', 'free_trial', {
          event_category: 'signup',
          event_label: 'basic',
          value: 0,
        })
      })

      it('should not error when gtag is undefined', () => {
        if (typeof window !== 'undefined') {
          delete (window as any).gtag
        }

        expect(() => trackEvent('test', 'category')).not.toThrow()
      })
    })

    describe('development logging', () => {
      it('should log to console in development mode', () => {
        process.env.NODE_ENV = 'development'

        trackEvent('click', 'button', 'submit', 5)

        expect(consoleLogSpy).toHaveBeenCalledWith('Track Event:', {
          eventName: 'click',
          category: 'button',
          label: 'submit',
          value: 5,
        })
      })

      it('should not log in production mode', () => {
        process.env.NODE_ENV = 'production'

        trackEvent('click', 'button')

        expect(consoleLogSpy).not.toHaveBeenCalled()
      })

      it('should not log in test mode', () => {
        process.env.NODE_ENV = 'test'

        trackEvent('click', 'button')

        expect(consoleLogSpy).not.toHaveBeenCalled()
      })
    })

    describe('parameter handling', () => {
      it('should handle empty strings', () => {
        trackEvent('', '', '', 0)

        expect(gtagSpy).toHaveBeenCalledWith('event', '', {
          event_category: '',
          event_label: '',
          value: 0,
        })
      })

      it('should handle special characters in event name', () => {
        trackEvent('user:login', 'authentication')

        expect(gtagSpy).toHaveBeenCalledWith('event', 'user:login', {
          event_category: 'authentication',
          event_label: undefined,
          value: undefined,
        })
      })

      it('should handle long strings', () => {
        const longEventName = 'a'.repeat(200)
        const longCategory = 'b'.repeat(200)
        const longLabel = 'c'.repeat(200)

        trackEvent(longEventName, longCategory, longLabel)

        expect(gtagSpy).toHaveBeenCalledWith('event', longEventName, {
          event_category: longCategory,
          event_label: longLabel,
          value: undefined,
        })
      })

      it('should handle negative values', () => {
        trackEvent('refund', 'ecommerce', 'order-123', -50)

        expect(gtagSpy).toHaveBeenCalledWith('event', 'refund', {
          event_category: 'ecommerce',
          event_label: 'order-123',
          value: -50,
        })
      })

      it('should handle decimal values', () => {
        trackEvent('purchase', 'ecommerce', 'item', 19.99)

        expect(gtagSpy).toHaveBeenCalledWith('event', 'purchase', {
          event_category: 'ecommerce',
          event_label: 'item',
          value: 19.99,
        })
      })
    })

    describe('real-world scenarios', () => {
      it('should track button click', () => {
        trackEvent('click', 'button', 'signup-cta')

        expect(gtagSpy).toHaveBeenCalledTimes(1)
        expect(gtagSpy).toHaveBeenCalledWith('event', 'click', {
          event_category: 'button',
          event_label: 'signup-cta',
          value: undefined,
        })
      })

      it('should track page view', () => {
        trackEvent('page_view', 'navigation', '/blog/post-1')

        expect(gtagSpy).toHaveBeenCalledWith('event', 'page_view', {
          event_category: 'navigation',
          event_label: '/blog/post-1',
          value: undefined,
        })
      })

      it('should track form submission', () => {
        trackEvent('form_submit', 'contact', 'footer-form')

        expect(gtagSpy).toHaveBeenCalledWith('event', 'form_submit', {
          event_category: 'contact',
          event_label: 'footer-form',
          value: undefined,
        })
      })

      it('should track video play', () => {
        trackEvent('video_play', 'media', 'tutorial-1', 45)

        expect(gtagSpy).toHaveBeenCalledWith('event', 'video_play', {
          event_category: 'media',
          event_label: 'tutorial-1',
          value: 45,
        })
      })

      it('should track ecommerce purchase', () => {
        trackEvent('purchase', 'ecommerce', 'product-abc', 149.99)

        expect(gtagSpy).toHaveBeenCalledWith('event', 'purchase', {
          event_category: 'ecommerce',
          event_label: 'product-abc',
          value: 149.99,
        })
      })
    })

    describe('multiple calls', () => {
      it('should track multiple events independently', () => {
        trackEvent('click', 'button1')
        trackEvent('click', 'button2')
        trackEvent('submit', 'form')

        expect(gtagSpy).toHaveBeenCalledTimes(3)
      })

      it('should not interfere with previous calls', () => {
        trackEvent('event1', 'cat1', 'label1', 10)
        trackEvent('event2', 'cat2')

        expect(gtagSpy).toHaveBeenNthCalledWith(1, 'event', 'event1', {
          event_category: 'cat1',
          event_label: 'label1',
          value: 10,
        })

        expect(gtagSpy).toHaveBeenNthCalledWith(2, 'event', 'event2', {
          event_category: 'cat2',
          event_label: undefined,
          value: undefined,
        })
      })
    })
  })
})
