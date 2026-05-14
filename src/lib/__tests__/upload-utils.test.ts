/**
 * Tests for upload utilities
 *
 * Coverage goal: 90-100%
 * Test approach: Unit tests with mocking for async functions
 *
 * Test cases:
 * - uploadWithRetry: success, retries, exponential backoff, 4xx errors
 * - validateImageFile: valid files, invalid types, size limits
 * - generateUniqueFileName: filename cleaning, timestamp, extension handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { uploadWithRetry, validateImageFile, generateUniqueFileName } from '../upload-utils'

describe('upload-utils', () => {
  describe('uploadWithRetry', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.restoreAllMocks()
      vi.useRealTimers()
    })

    describe('successful uploads', () => {
      it('should return result on successful upload', async () => {
        const uploadFn = vi.fn().mockResolvedValue({ success: true })

        const result = await uploadWithRetry(uploadFn)

        expect(result).toEqual({ success: true })
        expect(uploadFn).toHaveBeenCalledTimes(1)
      })

      it('should return data from upload function', async () => {
        const uploadFn = vi.fn().mockResolvedValue('upload-success')

        const result = await uploadWithRetry(uploadFn)

        expect(result).toBe('upload-success')
      })

      it('should work with different return types', async () => {
        const uploadFn1 = vi.fn().mockResolvedValue(42)
        const uploadFn2 = vi.fn().mockResolvedValue({ id: '123', url: 'https://example.com' })

        expect(await uploadWithRetry(uploadFn1)).toBe(42)
        expect(await uploadWithRetry(uploadFn2)).toEqual({ id: '123', url: 'https://example.com' })
      })
    })

    describe('retry behavior', () => {
      it('should retry on failure', async () => {
        const uploadFn = vi.fn()
          .mockRejectedValueOnce(new Error('Network error'))
          .mockResolvedValue({ success: true })

        const promise = uploadWithRetry(uploadFn)

        // Fast-forward through delay
        await vi.runAllTimersAsync()
        const result = await promise

        expect(result).toEqual({ success: true })
        expect(uploadFn).toHaveBeenCalledTimes(2)
      })

      it('should retry up to maxRetries times', async () => {
        const uploadFn = vi.fn()
          .mockRejectedValueOnce(new Error('Error 1'))
          .mockRejectedValueOnce(new Error('Error 2'))
          .mockResolvedValue({ success: true })

        const promise = uploadWithRetry(uploadFn, 3)

        await vi.runAllTimersAsync()
        const result = await promise

        expect(result).toEqual({ success: true })
        expect(uploadFn).toHaveBeenCalledTimes(3)
      })

      it('should throw after all retries exhausted', async () => {
        const uploadFn = vi.fn().mockRejectedValue(new Error('Persistent error'))

        const promise = uploadWithRetry(uploadFn, 3)
        await vi.runAllTimersAsync()

        await expect(promise).rejects.toThrow('Persistent error')
        expect(uploadFn).toHaveBeenCalledTimes(3)
      })

      it('should respect custom maxRetries', async () => {
        const uploadFn = vi.fn().mockRejectedValue(new Error('Error'))

        const promise = uploadWithRetry(uploadFn, 5)
        await vi.runAllTimersAsync()

        await expect(promise).rejects.toThrow()
        expect(uploadFn).toHaveBeenCalledTimes(5)
      })
    })

    describe('exponential backoff', () => {
      it('should use exponential backoff delays', async () => {
        const uploadFn = vi.fn()
          .mockRejectedValueOnce(new Error('Error 1'))
          .mockRejectedValueOnce(new Error('Error 2'))
          .mockResolvedValue({ success: true })

        const promise = uploadWithRetry(uploadFn, 3, 1000)

        // First attempt - immediate
        await vi.advanceTimersByTimeAsync(0)
        expect(uploadFn).toHaveBeenCalledTimes(1)

        // Second attempt - after 1000ms (2^0 * 1000)
        await vi.advanceTimersByTimeAsync(1000)
        expect(uploadFn).toHaveBeenCalledTimes(2)

        // Third attempt - after 2000ms (2^1 * 1000)
        await vi.advanceTimersByTimeAsync(2000)
        expect(uploadFn).toHaveBeenCalledTimes(3)

        const result = await promise
        expect(result).toEqual({ success: true })
      })

      it('should respect custom delay', async () => {
        const uploadFn = vi.fn()
          .mockRejectedValueOnce(new Error('Error 1'))
          .mockResolvedValue({ success: true })

        const promise = uploadWithRetry(uploadFn, 3, 500)

        await vi.advanceTimersByTimeAsync(0)
        expect(uploadFn).toHaveBeenCalledTimes(1)

        // Second attempt - after 500ms (2^0 * 500)
        await vi.advanceTimersByTimeAsync(500)
        expect(uploadFn).toHaveBeenCalledTimes(2)

        const result = await promise
        expect(result).toEqual({ success: true })
      })
    })

    describe('4xx error handling', () => {
      it('should not retry on 4xx errors', async () => {
        const error = new Response(null, { status: 400 })
        const uploadFn = vi.fn().mockRejectedValue(error)

        const promise = uploadWithRetry(uploadFn, 3)
        await vi.runAllTimersAsync()

        await expect(promise).rejects.toBe(error)
        expect(uploadFn).toHaveBeenCalledTimes(1) // No retries
      })

      it('should not retry on 404 errors', async () => {
        const error = new Response(null, { status: 404 })
        const uploadFn = vi.fn().mockRejectedValue(error)

        const promise = uploadWithRetry(uploadFn, 3)
        await vi.runAllTimersAsync()

        await expect(promise).rejects.toBe(error)
        expect(uploadFn).toHaveBeenCalledTimes(1)
      })

      it('should not retry on 422 errors', async () => {
        const error = new Response(null, { status: 422 })
        const uploadFn = vi.fn().mockRejectedValue(error)

        const promise = uploadWithRetry(uploadFn, 3)
        await vi.runAllTimersAsync()

        await expect(promise).rejects.toBe(error)
        expect(uploadFn).toHaveBeenCalledTimes(1)
      })

      it('should retry on 5xx errors', async () => {
        const uploadFn = vi.fn()
          .mockRejectedValueOnce(new Response(null, { status: 500 }))
          .mockResolvedValue({ success: true })

        const promise = uploadWithRetry(uploadFn, 3)
        await vi.runAllTimersAsync()

        const result = await promise
        expect(result).toEqual({ success: true })
        expect(uploadFn).toHaveBeenCalledTimes(2)
      })
    })

    describe('edge cases', () => {
      it('should handle uploadFn that throws synchronously', async () => {
        const uploadFn = vi.fn(() => {
          throw new Error('Sync error')
        })

        const promise = uploadWithRetry(uploadFn, 2)
        await vi.runAllTimersAsync()

        await expect(promise).rejects.toThrow('Sync error')
        expect(uploadFn).toHaveBeenCalledTimes(2)
      })

      it('should throw generic error if no error captured', async () => {
        // This is a hard-to-reach edge case, but test for completeness
        const uploadFn = vi.fn().mockImplementation(() => {
          return Promise.reject()
        })

        const promise = uploadWithRetry(uploadFn, 1)
        await vi.runAllTimersAsync()

        await expect(promise).rejects.toThrow('Upload failed after all retries')
      })
    })
  })

  describe('validateImageFile', () => {
    // Helper to create mock File objects
    function createMockFile(name: string, type: string, size: number): File {
      const blob = new Blob([''], { type })
      const file = new File([blob], name, { type })
      Object.defineProperty(file, 'size', { value: size })
      return file
    }

    describe('valid files', () => {
      it('should accept valid JPEG file', () => {
        const file = createMockFile('photo.jpg', 'image/jpeg', 1024 * 1024) // 1MB
        const result = validateImageFile(file)

        expect(result.valid).toBe(true)
        expect(result.error).toBeUndefined()
      })

      it('should accept valid PNG file', () => {
        const file = createMockFile('photo.png', 'image/png', 2 * 1024 * 1024) // 2MB
        const result = validateImageFile(file)

        expect(result.valid).toBe(true)
        expect(result.error).toBeUndefined()
      })

      it('should accept valid WebP file', () => {
        const file = createMockFile('photo.webp', 'image/webp', 500 * 1024) // 500KB
        const result = validateImageFile(file)

        expect(result.valid).toBe(true)
      })

      it('should accept valid GIF file', () => {
        const file = createMockFile('animation.gif', 'image/gif', 3 * 1024 * 1024) // 3MB
        const result = validateImageFile(file)

        expect(result.valid).toBe(true)
      })

      it('should accept file at maximum size limit', () => {
        const file = createMockFile('large.jpg', 'image/jpeg', 10 * 1024 * 1024) // Exactly 10MB
        const result = validateImageFile(file)

        expect(result.valid).toBe(true)
      })

      it('should accept very small files', () => {
        const file = createMockFile('tiny.jpg', 'image/jpeg', 1) // 1 byte
        const result = validateImageFile(file)

        expect(result.valid).toBe(true)
      })
    })

    describe('invalid file types', () => {
      it('should reject non-image files', () => {
        const file = createMockFile('document.pdf', 'application/pdf', 1024)
        const result = validateImageFile(file)

        expect(result.valid).toBe(false)
        expect(result.error).toBe('허용되지 않은 파일 형식입니다. JPEG, PNG, WebP, GIF만 가능합니다.')
      })

      it('should reject SVG files', () => {
        const file = createMockFile('icon.svg', 'image/svg+xml', 1024)
        const result = validateImageFile(file)

        expect(result.valid).toBe(false)
        expect(result.error).toContain('허용되지 않은 파일 형식')
      })

      it('should reject text files', () => {
        const file = createMockFile('file.txt', 'text/plain', 1024)
        const result = validateImageFile(file)

        expect(result.valid).toBe(false)
      })

      it('should reject video files', () => {
        const file = createMockFile('video.mp4', 'video/mp4', 1024)
        const result = validateImageFile(file)

        expect(result.valid).toBe(false)
      })
    })

    describe('file size limits', () => {
      it('should reject files over 10MB', () => {
        const file = createMockFile('huge.jpg', 'image/jpeg', 11 * 1024 * 1024) // 11MB
        const result = validateImageFile(file)

        expect(result.valid).toBe(false)
        expect(result.error).toBe('파일 크기는 10MB 이하여야 합니다.')
      })

      it('should reject files slightly over limit', () => {
        const file = createMockFile('large.jpg', 'image/jpeg', (10 * 1024 * 1024) + 1) // 10MB + 1 byte
        const result = validateImageFile(file)

        expect(result.valid).toBe(false)
        expect(result.error).toContain('10MB 이하')
      })

      it('should reject very large files', () => {
        const file = createMockFile('massive.jpg', 'image/jpeg', 100 * 1024 * 1024) // 100MB
        const result = validateImageFile(file)

        expect(result.valid).toBe(false)
      })
    })

    describe('combined validation', () => {
      it('should fail on both invalid type and size', () => {
        const file = createMockFile('huge.pdf', 'application/pdf', 20 * 1024 * 1024)
        const result = validateImageFile(file)

        expect(result.valid).toBe(false)
        // Should fail on type first (order of checks)
        expect(result.error).toContain('허용되지 않은 파일 형식')
      })
    })
  })

  describe('generateUniqueFileName', () => {
    let dateNowSpy: ReturnType<typeof vi.spyOn>
    let randomSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      dateNowSpy = vi.spyOn(Date, 'now').mockReturnValue(1234567890000)
      randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.123456789)
    })

    afterEach(() => {
      dateNowSpy.mockRestore()
      randomSpy.mockRestore()
    })

    describe('basic functionality', () => {
      it('should generate unique filename with timestamp and random string', () => {
        const result = generateUniqueFileName('photo.jpg')

        expect(result).toContain('1234567890000') // timestamp
        expect(result).toMatch(/[a-z0-9]{7}/) // random string (7 chars from .toString(36))
        expect(result).toMatch(/\.jpg$/)
      })

      it('should preserve file extension', () => {
        expect(generateUniqueFileName('image.png')).toMatch(/\.png$/)
        expect(generateUniqueFileName('file.webp')).toMatch(/\.webp$/)
        expect(generateUniqueFileName('animation.gif')).toMatch(/\.gif$/)
      })

      it('should clean original filename', () => {
        const result = generateUniqueFileName('My Photo!@#$.jpg')

        expect(result).toContain('my-photo----')
        expect(result).not.toContain('!')
        expect(result).not.toContain('@')
        expect(result).not.toContain('$')
      })

      it('should return a string', () => {
        const result = generateUniqueFileName('file.jpg')
        expect(typeof result).toBe('string')
      })
    })

    describe('filename cleaning', () => {
      it('should convert to lowercase', () => {
        const result = generateUniqueFileName('UPPERCASE.jpg')
        expect(result).toContain('uppercase')
        expect(result).not.toContain('UPPERCASE')
      })

      it('should replace spaces with dashes', () => {
        const result = generateUniqueFileName('my photo file.jpg')
        expect(result).toContain('my-photo-file')
      })

      it('should replace special characters with dashes', () => {
        const result = generateUniqueFileName('file!@#$%^&*().jpg')
        expect(result).toMatch(/file-+/)
      })

      it('should keep alphanumeric, dashes, and underscores', () => {
        const result = generateUniqueFileName('file_name-123.jpg')
        expect(result).toContain('file_name-123')
      })

      it('should handle Korean characters', () => {
        const result = generateUniqueFileName('한글파일명.jpg')
        // Korean chars will be replaced with dashes
        expect(result).toMatch(/^-+-1234567890000-[a-z0-9]{7}\.jpg$/)
      })

      it('should handle emoji', () => {
        const result = generateUniqueFileName('photo-😀.jpg')
        expect(result).toContain('photo')
        expect(result).not.toContain('😀')
      })
    })

    describe('extension handling', () => {
      it('should handle files without extension', () => {
        const result = generateUniqueFileName('filename')
        // When no extension, the entire filename becomes the extension
        expect(result).toMatch(/\.filename$/)
      })

      it('should handle multiple dots in filename', () => {
        const result = generateUniqueFileName('file.name.with.dots.png')
        expect(result).toContain('file-name-with-dots')
        expect(result).toMatch(/\.png$/)
      })

      it('should handle uppercase extensions', () => {
        const result = generateUniqueFileName('photo.JPG')
        expect(result).toMatch(/\.JPG$/)
      })

      it('should preserve unusual extensions', () => {
        const result = generateUniqueFileName('file.jpeg')
        expect(result).toMatch(/\.jpeg$/)
      })
    })

    describe('format structure', () => {
      it('should follow format: cleanname-timestamp-random.ext', () => {
        const result = generateUniqueFileName('test.jpg')

        const parts = result.split('-')
        expect(parts.length).toBeGreaterThanOrEqual(3)
        expect(parts[0]).toBe('test')
        expect(parts[1]).toBe('1234567890000')
        expect(parts[2]).toMatch(/[a-z0-9]{7}\.jpg/)
      })

      it('should generate different filenames for different inputs', () => {
        const result1 = generateUniqueFileName('photo1.jpg')
        const result2 = generateUniqueFileName('photo2.jpg')

        expect(result1).toContain('photo1')
        expect(result2).toContain('photo2')
      })
    })

    describe('edge cases', () => {
      it('should handle very long filenames', () => {
        const longName = 'a'.repeat(200) + '.jpg'
        const result = generateUniqueFileName(longName)

        expect(result).toContain('a'.repeat(200))
        expect(result).toMatch(/\.jpg$/)
      })

      it('should handle empty filename', () => {
        const result = generateUniqueFileName('.jpg')

        expect(result).toMatch(/^-1234567890000-[a-z0-9]{7}\.jpg$/)
      })

      it('should handle filename with only special characters', () => {
        const result = generateUniqueFileName('!@#$%^&*().jpg')

        expect(result).toMatch(/^-+-1234567890000-[a-z0-9]{7}\.jpg$/)
      })
    })
  })
})
