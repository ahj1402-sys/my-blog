/**
 * Tests for date utility functions
 *
 * Coverage goal: 90-100%
 * Test approach: Unit tests (no mocks, pure functions)
 *
 * Test cases:
 * - formatDate: full date formatting, null handling, invalid dates
 * - formatDateShort: short date formatting
 * - formatDateISO: ISO formatting
 * - getRelativeTime: relative time calculation
 * - isValidDate: date validation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  formatDate,
  formatDateShort,
  formatDateISO,
  getRelativeTime,
  isValidDate,
} from '../date'

describe('formatDate', () => {
  describe('valid dates', () => {
    it('should format Date object', () => {
      const date = new Date('2024-01-15T12:00:00Z')
      const result = formatDate(date)
      expect(result).toContain('January')
      expect(result).toContain('15')
      expect(result).toContain('2024')
    })

    it('should format ISO string', () => {
      const result = formatDate('2024-03-20T10:30:00Z')
      expect(result).toContain('March')
      expect(result).toContain('20')
      expect(result).toContain('2024')
    })

    it('should format different months', () => {
      expect(formatDate('2024-12-25T00:00:00Z')).toContain('December')
      expect(formatDate('2024-06-15T00:00:00Z')).toContain('June')
      expect(formatDate('2024-09-01T00:00:00Z')).toContain('September')
    })
  })

  describe('null and invalid dates', () => {
    it('should return empty string for null', () => {
      expect(formatDate(null)).toBe('')
    })

    it('should return empty string for invalid date string', () => {
      expect(formatDate('invalid date')).toBe('')
    })

    it('should return empty string for invalid Date object', () => {
      expect(formatDate(new Date('invalid'))).toBe('')
    })
  })

  describe('edge cases', () => {
    it('should handle leap year dates', () => {
      const result = formatDate('2024-02-29T00:00:00Z')
      expect(result).toContain('February')
      expect(result).toContain('29')
    })

    it('should handle year boundaries', () => {
      // Note: Depending on timezone, '2023-12-31T23:59:59Z' might be displayed as Jan 1
      const dec31 = formatDate('2023-12-31T00:00:00Z')
      expect(dec31).toContain('December')

      const jan1 = formatDate('2024-01-01T00:00:00Z')
      expect(jan1).toContain('January')
    })

    it('should handle distant past dates', () => {
      const result = formatDate('1900-01-01T00:00:00Z')
      expect(result).toContain('1900')
    })

    it('should handle distant future dates', () => {
      const result = formatDate('2100-12-31T00:00:00Z')
      expect(result).toContain('2100')
    })
  })
})

describe('formatDateShort', () => {
  describe('valid dates', () => {
    it('should format with short month name', () => {
      const result = formatDateShort('2024-01-15T12:00:00Z')
      expect(result).toContain('Jan')
      expect(result).toContain('15')
      expect(result).toContain('2024')
    })

    it('should use abbreviated month names', () => {
      expect(formatDateShort('2024-02-01T00:00:00Z')).toContain('Feb')
      expect(formatDateShort('2024-09-01T00:00:00Z')).toContain('Sep')
      expect(formatDateShort('2024-12-01T00:00:00Z')).toContain('Dec')
    })

    it('should format Date object', () => {
      const date = new Date('2024-05-20T10:30:00Z')
      const result = formatDateShort(date)
      expect(result).toContain('May')
      expect(result).toContain('20')
    })
  })

  describe('null and invalid dates', () => {
    it('should return empty string for null', () => {
      expect(formatDateShort(null)).toBe('')
    })

    it('should return empty string for invalid date', () => {
      expect(formatDateShort('not a date')).toBe('')
    })
  })
})

describe('formatDateISO', () => {
  describe('valid dates', () => {
    it('should format Date object to ISO string', () => {
      const date = new Date('2024-01-15T12:00:00.000Z')
      const result = formatDateISO(date)
      expect(result).toBe('2024-01-15T12:00:00.000Z')
    })

    it('should format date string to ISO string', () => {
      const result = formatDateISO('2024-03-20T10:30:00.000Z')
      expect(result).toBe('2024-03-20T10:30:00.000Z')
    })

    it('should include milliseconds', () => {
      const result = formatDateISO('2024-01-01T00:00:00.123Z')
      expect(result).toContain('.123Z')
    })

    it('should always end with Z (UTC)', () => {
      const result = formatDateISO(new Date())
      expect(result?.endsWith('Z')).toBe(true)
    })
  })

  describe('null and invalid dates', () => {
    it('should return null for null input', () => {
      expect(formatDateISO(null)).toBeNull()
    })

    it('should return null for invalid date', () => {
      expect(formatDateISO('invalid')).toBeNull()
    })

    it('should return null for invalid Date object', () => {
      expect(formatDateISO(new Date('invalid'))).toBeNull()
    })
  })
})

describe('getRelativeTime', () => {
  beforeEach(() => {
    // Mock current time to 2024-01-15 12:00:00
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('seconds and minutes', () => {
    it('should return "Just now" for recent times', () => {
      const date = new Date('2024-01-15T11:59:30Z') // 30 seconds ago
      expect(getRelativeTime(date)).toBe('Just now')
    })

    it('should show minutes for times < 1 hour ago', () => {
      const date = new Date('2024-01-15T11:30:00Z') // 30 minutes ago
      expect(getRelativeTime(date)).toBe('30 minutes ago')
    })

    it('should use singular for 1 minute', () => {
      const date = new Date('2024-01-15T11:59:00Z') // 1 minute ago
      expect(getRelativeTime(date)).toBe('1 minute ago')
    })

    it('should use plural for multiple minutes', () => {
      const date = new Date('2024-01-15T11:58:00Z') // 2 minutes ago
      expect(getRelativeTime(date)).toBe('2 minutes ago')
    })
  })

  describe('hours', () => {
    it('should show hours for times < 24 hours ago', () => {
      const date = new Date('2024-01-15T06:00:00Z') // 6 hours ago
      expect(getRelativeTime(date)).toBe('6 hours ago')
    })

    it('should use singular for 1 hour', () => {
      const date = new Date('2024-01-15T11:00:00Z') // 1 hour ago
      expect(getRelativeTime(date)).toBe('1 hour ago')
    })

    it('should use plural for multiple hours', () => {
      const date = new Date('2024-01-15T09:00:00Z') // 3 hours ago
      expect(getRelativeTime(date)).toBe('3 hours ago')
    })
  })

  describe('days', () => {
    it('should show days for times < 30 days ago', () => {
      const date = new Date('2024-01-10T12:00:00Z') // 5 days ago
      expect(getRelativeTime(date)).toBe('5 days ago')
    })

    it('should use singular for 1 day', () => {
      const date = new Date('2024-01-14T12:00:00Z') // 1 day ago
      expect(getRelativeTime(date)).toBe('1 day ago')
    })

    it('should use plural for multiple days', () => {
      const date = new Date('2024-01-13T12:00:00Z') // 2 days ago
      expect(getRelativeTime(date)).toBe('2 days ago')
    })
  })

  describe('months', () => {
    it('should show months for times < 365 days ago', () => {
      const date = new Date('2023-11-15T12:00:00Z') // 2 months ago
      expect(getRelativeTime(date)).toBe('2 months ago')
    })

    it('should use singular for 1 month', () => {
      const date = new Date('2023-12-15T12:00:00Z') // 1 month ago
      expect(getRelativeTime(date)).toBe('1 month ago')
    })

    it('should use plural for multiple months', () => {
      const date = new Date('2023-10-15T12:00:00Z') // 3 months ago
      expect(getRelativeTime(date)).toBe('3 months ago')
    })
  })

  describe('years', () => {
    it('should show years for times > 365 days ago', () => {
      const date = new Date('2022-01-15T12:00:00Z') // 2 years ago
      expect(getRelativeTime(date)).toBe('2 years ago')
    })

    it('should use singular for 1 year', () => {
      const date = new Date('2023-01-15T12:00:00Z') // 1 year ago
      expect(getRelativeTime(date)).toBe('1 year ago')
    })

    it('should use plural for multiple years', () => {
      const date = new Date('2020-01-15T12:00:00Z') // 4 years ago
      expect(getRelativeTime(date)).toBe('4 years ago')
    })
  })

  describe('string date input', () => {
    it('should accept ISO string', () => {
      const result = getRelativeTime('2024-01-14T12:00:00Z')
      expect(result).toBe('1 day ago')
    })

    it('should accept date string', () => {
      const result = getRelativeTime('2024-01-10T12:00:00Z')
      expect(result).toBe('5 days ago')
    })
  })
})

describe('isValidDate', () => {
  describe('valid dates', () => {
    it('should return true for Date object', () => {
      expect(isValidDate(new Date())).toBe(true)
    })

    it('should return true for valid ISO string', () => {
      expect(isValidDate('2024-01-15T12:00:00Z')).toBe(true)
    })

    it('should return true for valid date string', () => {
      expect(isValidDate('2024-01-15')).toBe(true)
      expect(isValidDate('January 15, 2024')).toBe(true)
    })

    it('should return true for timestamp number', () => {
      expect(isValidDate(1705320000000)).toBe(true)
    })
  })

  describe('invalid dates', () => {
    it('should return false for null', () => {
      expect(isValidDate(null)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(isValidDate(undefined)).toBe(false)
    })

    it('should return false for invalid string', () => {
      expect(isValidDate('not a date')).toBe(false)
    })

    it('should return false for invalid Date object', () => {
      expect(isValidDate(new Date('invalid'))).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isValidDate('')).toBe(false)
    })

    it('should return false for boolean false (falsy)', () => {
      // false is falsy, so early return
      expect(isValidDate(false)).toBe(false)
    })

    it('should return true for boolean true (converts to timestamp)', () => {
      // true converts to 1 (timestamp), which is valid: new Date(1) = 1970-01-01
      expect(isValidDate(true)).toBe(true)
    })

    it('should return false for object', () => {
      expect(isValidDate({})).toBe(false)
    })

    it('should return false for array', () => {
      expect(isValidDate([])).toBe(false)
    })
  })
})
