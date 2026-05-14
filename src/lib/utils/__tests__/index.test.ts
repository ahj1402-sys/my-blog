/**
 * Tests for utility index functions
 *
 * Coverage goal: 90-100%
 * Test approach: Unit tests for utility functions
 *
 * Test cases:
 * - getEnvVar: environment variable retrieval
 * - isDevelopment, isProduction: environment checks
 * - formatNumber, formatCompactNumber: number formatting
 * - chunk, unique: array utilities
 * - sleep, retry: async utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getEnvVar,
  isDevelopment,
  isProduction,
  formatNumber,
  formatCompactNumber,
  chunk,
  unique,
  sleep,
  retry,
} from '../index'

describe('utils/index', () => {
  describe('getEnvVar', () => {
    let originalEnv: NodeJS.ProcessEnv

    beforeEach(() => {
      originalEnv = { ...process.env }
    })

    afterEach(() => {
      process.env = originalEnv
    })

    it('should return environment variable value', () => {
      process.env.TEST_VAR = 'test-value'
      expect(getEnvVar('TEST_VAR')).toBe('test-value')
    })

    it('should return default value when env var not set', () => {
      delete process.env.TEST_VAR
      expect(getEnvVar('TEST_VAR', 'default')).toBe('default')
    })

    it('should throw error when env var not set and no default', () => {
      delete process.env.TEST_VAR
      expect(() => getEnvVar('TEST_VAR')).toThrow('Environment variable TEST_VAR is not set')
    })

    it('should prefer env var over default value', () => {
      process.env.TEST_VAR = 'env-value'
      expect(getEnvVar('TEST_VAR', 'default')).toBe('env-value')
    })
  })

  describe('isDevelopment', () => {
    let originalEnv: NodeJS.ProcessEnv

    beforeEach(() => {
      originalEnv = { ...process.env }
    })

    afterEach(() => {
      process.env = originalEnv
    })

    it('should return true when NODE_ENV is development', () => {
      process.env.NODE_ENV = 'development'
      expect(isDevelopment()).toBe(true)
    })

    it('should return false when NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production'
      expect(isDevelopment()).toBe(false)
    })

    it('should return false when NODE_ENV is test', () => {
      process.env.NODE_ENV = 'test'
      expect(isDevelopment()).toBe(false)
    })
  })

  describe('isProduction', () => {
    let originalEnv: NodeJS.ProcessEnv

    beforeEach(() => {
      originalEnv = { ...process.env }
    })

    afterEach(() => {
      process.env = originalEnv
    })

    it('should return true when NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production'
      expect(isProduction()).toBe(true)
    })

    it('should return false when NODE_ENV is development', () => {
      process.env.NODE_ENV = 'development'
      expect(isProduction()).toBe(false)
    })

    it('should return false when NODE_ENV is test', () => {
      process.env.NODE_ENV = 'test'
      expect(isProduction()).toBe(false)
    })
  })

  describe('formatNumber', () => {
    it('should format number with thousand separators', () => {
      expect(formatNumber(1000)).toBe('1,000')
      expect(formatNumber(1000000)).toBe('1,000,000')
    })

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0')
    })

    it('should handle negative numbers', () => {
      expect(formatNumber(-1000)).toBe('-1,000')
    })

    it('should handle decimal numbers', () => {
      expect(formatNumber(1234.56)).toBe('1,234.56')
    })

    it('should handle very large numbers', () => {
      expect(formatNumber(1234567890)).toBe('1,234,567,890')
    })
  })

  describe('formatCompactNumber', () => {
    it('should format small numbers normally', () => {
      expect(formatCompactNumber(999)).toBe('999')
    })

    it('should format thousands with K', () => {
      expect(formatCompactNumber(1000)).toBe('1K')
      expect(formatCompactNumber(1500)).toBe('1.5K')
    })

    it('should format millions with M', () => {
      expect(formatCompactNumber(1000000)).toBe('1M')
      expect(formatCompactNumber(2500000)).toBe('2.5M')
    })

    it('should format billions with B', () => {
      expect(formatCompactNumber(1000000000)).toBe('1B')
    })

    it('should handle zero', () => {
      expect(formatCompactNumber(0)).toBe('0')
    })

    it('should handle negative numbers', () => {
      expect(formatCompactNumber(-1000)).toBe('-1K')
    })
  })

  describe('chunk', () => {
    it('should split array into chunks of specified size', () => {
      const result = chunk([1, 2, 3, 4, 5], 2)
      expect(result).toEqual([[1, 2], [3, 4], [5]])
    })

    it('should handle exact chunk size', () => {
      const result = chunk([1, 2, 3, 4], 2)
      expect(result).toEqual([[1, 2], [3, 4]])
    })

    it('should handle single chunk', () => {
      const result = chunk([1, 2, 3], 5)
      expect(result).toEqual([[1, 2, 3]])
    })

    it('should handle empty array', () => {
      const result = chunk([], 2)
      expect(result).toEqual([])
    })

    it('should handle chunk size of 1', () => {
      const result = chunk([1, 2, 3], 1)
      expect(result).toEqual([[1], [2], [3]])
    })

    it('should work with strings', () => {
      const result = chunk(['a', 'b', 'c', 'd'], 2)
      expect(result).toEqual([['a', 'b'], ['c', 'd']])
    })

    it('should work with objects', () => {
      const result = chunk([{ id: 1 }, { id: 2 }, { id: 3 }], 2)
      expect(result).toEqual([[{ id: 1 }, { id: 2 }], [{ id: 3 }]])
    })
  })

  describe('unique', () => {
    it('should remove duplicate numbers', () => {
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3])
    })

    it('should remove duplicate strings', () => {
      expect(unique(['a', 'b', 'b', 'c'])).toEqual(['a', 'b', 'c'])
    })

    it('should handle empty array', () => {
      expect(unique([])).toEqual([])
    })

    it('should handle array with no duplicates', () => {
      expect(unique([1, 2, 3])).toEqual([1, 2, 3])
    })

    it('should preserve order of first occurrence', () => {
      expect(unique([3, 1, 2, 3, 1])).toEqual([3, 1, 2])
    })

    it('should work with mixed types', () => {
      expect(unique([1, '1', 2, '2'])).toEqual([1, '1', 2, '2'])
    })
  })

  describe('sleep', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return a promise', () => {
      const result = sleep(1000)
      expect(result).toBeInstanceOf(Promise)
    })

    it('should resolve after specified time', async () => {
      const promise = sleep(1000)

      // Should not resolve immediately
      await vi.advanceTimersByTimeAsync(500)

      // Should resolve after 1000ms
      await vi.advanceTimersByTimeAsync(500)
      await promise

      expect(true).toBe(true) // If we get here, it resolved
    })

    it('should work with different delays', async () => {
      const promise1 = sleep(100)
      const promise2 = sleep(200)

      await vi.advanceTimersByTimeAsync(100)
      await promise1

      await vi.advanceTimersByTimeAsync(100)
      await promise2

      expect(true).toBe(true)
    })
  })

  describe('retry', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return result on successful execution', async () => {
      const fn = vi.fn().mockResolvedValue('success')

      const promise = retry(fn)
      await vi.runAllTimersAsync()
      const result = await promise

      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should retry on failure', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Attempt 1 failed'))
        .mockResolvedValue('success')

      const promise = retry(fn, { attempts: 3 })
      await vi.runAllTimersAsync()
      const result = await promise

      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('should throw after all attempts exhausted', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Always fails'))

      const promise = retry(fn, { attempts: 3 })
      await vi.runAllTimersAsync()

      await expect(promise).rejects.toThrow('Always fails')
      expect(fn).toHaveBeenCalledTimes(3)
    })

    it('should use custom delay', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockResolvedValue('success')

      const promise = retry(fn, { attempts: 3, delay: 500 })

      // First attempt fails immediately
      await vi.advanceTimersByTimeAsync(0)

      // Wait for delay (500ms * 1)
      await vi.advanceTimersByTimeAsync(500)

      const result = await promise
      expect(result).toBe('success')
    })

    it('should call onError callback', async () => {
      const onError = vi.fn()
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockResolvedValue('success')

      const promise = retry(fn, { attempts: 3, onError })
      await vi.runAllTimersAsync()
      await promise

      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError).toHaveBeenCalledWith(expect.any(Error), 1)
    })

    it('should use exponential backoff for delay', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValue('success')

      const promise = retry(fn, { attempts: 3, delay: 100 })

      // First attempt - immediate
      await vi.advanceTimersByTimeAsync(0)
      expect(fn).toHaveBeenCalledTimes(1)

      // Second attempt - after 100ms * 1
      await vi.advanceTimersByTimeAsync(100)
      expect(fn).toHaveBeenCalledTimes(2)

      // Third attempt - after 100ms * 2
      await vi.advanceTimersByTimeAsync(200)
      expect(fn).toHaveBeenCalledTimes(3)

      const result = await promise
      expect(result).toBe('success')
    })

    it('should work with default options', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Fail'))
        .mockResolvedValue('success')

      const promise = retry(fn)
      await vi.runAllTimersAsync()
      const result = await promise

      expect(result).toBe('success')
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })
})
