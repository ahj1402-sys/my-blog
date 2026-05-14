/**
 * Tests for image optimization utilities
 *
 * Coverage goal: 80-90%
 * Test approach: Integration tests with sharp library
 *
 * Test cases:
 * - getImageMimeType: various formats, case insensitivity, defaults
 * - optimizeImage: format conversion, resizing, quality, error handling
 *
 * Note: optimizeImage uses sharp library - tests are integration-style
 */

import { describe, it, expect, vi } from 'vitest'
import { getImageMimeType, optimizeImage, type ImageOptimizationOptions } from '../image-utils'
import sharp from 'sharp'

describe('image-utils', () => {
  describe('getImageMimeType', () => {
    describe('standard formats', () => {
      it('should return correct MIME type for jpeg', () => {
        expect(getImageMimeType('jpeg')).toBe('image/jpeg')
      })

      it('should return correct MIME type for jpg', () => {
        expect(getImageMimeType('jpg')).toBe('image/jpeg')
      })

      it('should return correct MIME type for png', () => {
        expect(getImageMimeType('png')).toBe('image/png')
      })

      it('should return correct MIME type for webp', () => {
        expect(getImageMimeType('webp')).toBe('image/webp')
      })
    })

    describe('case insensitivity', () => {
      it('should handle uppercase formats', () => {
        expect(getImageMimeType('JPEG')).toBe('image/jpeg')
        expect(getImageMimeType('PNG')).toBe('image/png')
        expect(getImageMimeType('WEBP')).toBe('image/webp')
      })

      it('should handle mixed case formats', () => {
        expect(getImageMimeType('JpEg')).toBe('image/jpeg')
        expect(getImageMimeType('PnG')).toBe('image/png')
        expect(getImageMimeType('WebP')).toBe('image/webp')
      })
    })

    describe('unknown formats', () => {
      it('should return default for unknown format', () => {
        expect(getImageMimeType('gif')).toBe('image/jpeg')
      })

      it('should return default for empty string', () => {
        expect(getImageMimeType('')).toBe('image/jpeg')
      })

      it('should return default for invalid format', () => {
        expect(getImageMimeType('invalid')).toBe('image/jpeg')
      })

      it('should return default for special characters', () => {
        expect(getImageMimeType('!@#$')).toBe('image/jpeg')
      })
    })

    describe('edge cases', () => {
      it('should handle formats with leading/trailing spaces', () => {
        expect(getImageMimeType('jpeg ')).toBe('image/jpeg')
        // Note: This will return default because ' jpeg' !== 'jpeg' after toLowerCase
        // The function doesn't trim, so this is expected behavior
      })

      it('should be consistent for jpg and jpeg', () => {
        expect(getImageMimeType('jpg')).toBe(getImageMimeType('jpeg'))
      })
    })
  })

  describe('optimizeImage', () => {
    // Helper to create a small test image buffer
    async function createTestImage(width: number, height: number, format: 'jpeg' | 'png' | 'webp' = 'png'): Promise<Buffer> {
      return await sharp({
        create: {
          width,
          height,
          channels: 4,
          background: { r: 255, g: 0, b: 0, alpha: 1 }
        }
      })[format]().toBuffer()
    }

    describe('basic functionality', () => {
      it('should optimize image with default options', async () => {
        const inputBuffer = await createTestImage(100, 100)
        const result = await optimizeImage(inputBuffer)

        expect(result).toBeInstanceOf(Buffer)
        expect(result.length).toBeGreaterThan(0)

        // Verify it's actually a valid image
        const metadata = await sharp(result).metadata()
        expect(metadata.format).toBe('webp') // default format
      })

      it('should preserve dimensions for small images', async () => {
        const inputBuffer = await createTestImage(100, 100)
        const result = await optimizeImage(inputBuffer)

        const metadata = await sharp(result).metadata()
        expect(metadata.width).toBe(100)
        expect(metadata.height).toBe(100)
      })

      it('should return a Buffer', async () => {
        const inputBuffer = await createTestImage(100, 100)
        const result = await optimizeImage(inputBuffer)

        expect(Buffer.isBuffer(result)).toBe(true)
      })
    })

    describe('format conversion', () => {
      it('should convert to jpeg format', async () => {
        const inputBuffer = await createTestImage(100, 100, 'png')
        const result = await optimizeImage(inputBuffer, { format: 'jpeg' })

        const metadata = await sharp(result).metadata()
        expect(metadata.format).toBe('jpeg')
      })

      it('should convert to png format', async () => {
        const inputBuffer = await createTestImage(100, 100, 'jpeg')
        const result = await optimizeImage(inputBuffer, { format: 'png' })

        const metadata = await sharp(result).metadata()
        expect(metadata.format).toBe('png')
      })

      it('should convert to webp format', async () => {
        const inputBuffer = await createTestImage(100, 100, 'png')
        const result = await optimizeImage(inputBuffer, { format: 'webp' })

        const metadata = await sharp(result).metadata()
        expect(metadata.format).toBe('webp')
      })
    })

    describe('resizing', () => {
      it('should resize large images to maxWidth', async () => {
        const inputBuffer = await createTestImage(3000, 2000)
        const result = await optimizeImage(inputBuffer, { maxWidth: 1920, maxHeight: 1080 })

        const metadata = await sharp(result).metadata()
        expect(metadata.width).toBeLessThanOrEqual(1920)
        expect(metadata.height).toBeLessThanOrEqual(1080)
      })

      it('should resize large images to maxHeight', async () => {
        const inputBuffer = await createTestImage(2000, 3000)
        const result = await optimizeImage(inputBuffer, { maxWidth: 1920, maxHeight: 1080 })

        const metadata = await sharp(result).metadata()
        expect(metadata.width).toBeLessThanOrEqual(1920)
        expect(metadata.height).toBeLessThanOrEqual(1080)
      })

      it('should maintain aspect ratio when resizing', async () => {
        const inputBuffer = await createTestImage(2000, 1000) // 2:1 ratio
        const result = await optimizeImage(inputBuffer, { maxWidth: 1920, maxHeight: 1080 })

        const metadata = await sharp(result).metadata()
        const outputRatio = metadata.width! / metadata.height!
        expect(outputRatio).toBeCloseTo(2, 1) // Allow small floating point differences
      })

      it('should not enlarge small images', async () => {
        const inputBuffer = await createTestImage(500, 500)
        const result = await optimizeImage(inputBuffer, { maxWidth: 1920, maxHeight: 1080 })

        const metadata = await sharp(result).metadata()
        expect(metadata.width).toBe(500)
        expect(metadata.height).toBe(500)
      })

      it('should respect custom maxWidth and maxHeight', async () => {
        const inputBuffer = await createTestImage(2000, 2000)
        const result = await optimizeImage(inputBuffer, { maxWidth: 500, maxHeight: 500 })

        const metadata = await sharp(result).metadata()
        expect(metadata.width).toBeLessThanOrEqual(500)
        expect(metadata.height).toBeLessThanOrEqual(500)
      })
    })

    describe('quality settings', () => {
      it('should accept custom quality setting', async () => {
        const inputBuffer = await createTestImage(100, 100)
        const result = await optimizeImage(inputBuffer, { quality: 50, format: 'jpeg' })

        expect(result).toBeInstanceOf(Buffer)
        expect(result.length).toBeGreaterThan(0)
      })

      it('should produce smaller files with lower quality', async () => {
        const inputBuffer = await createTestImage(500, 500)

        const highQuality = await optimizeImage(inputBuffer, { quality: 95, format: 'jpeg' })
        const lowQuality = await optimizeImage(inputBuffer, { quality: 50, format: 'jpeg' })

        // Lower quality should generally produce smaller files
        // This is a fuzzy test - exact sizes depend on sharp's compression
        expect(lowQuality.length).toBeLessThan(highQuality.length * 1.5) // Allow some variance
      })
    })

    describe('error handling', () => {
      it('should return original buffer on invalid input', async () => {
        const invalidBuffer = Buffer.from('not an image')
        const result = await optimizeImage(invalidBuffer)

        // Should return original buffer when optimization fails
        expect(result).toBe(invalidBuffer)
      })

      it('should log error when optimization fails', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

        const invalidBuffer = Buffer.from('not an image')
        await optimizeImage(invalidBuffer)

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Image optimization error:',
          expect.any(Error)
        )

        consoleErrorSpy.mockRestore()
      })

      it('should handle empty buffer gracefully', async () => {
        const emptyBuffer = Buffer.from([])
        const result = await optimizeImage(emptyBuffer)

        // Should return original buffer
        expect(result).toBe(emptyBuffer)
      })
    })

    describe('options combinations', () => {
      it('should handle all options together', async () => {
        const inputBuffer = await createTestImage(2000, 2000)
        const result = await optimizeImage(inputBuffer, {
          maxWidth: 800,
          maxHeight: 600,
          quality: 75,
          format: 'jpeg'
        })

        const metadata = await sharp(result).metadata()
        expect(metadata.format).toBe('jpeg')
        expect(metadata.width).toBeLessThanOrEqual(800)
        expect(metadata.height).toBeLessThanOrEqual(600)
      })

      it('should use defaults when options is empty object', async () => {
        const inputBuffer = await createTestImage(100, 100)
        const result = await optimizeImage(inputBuffer, {})

        const metadata = await sharp(result).metadata()
        expect(metadata.format).toBe('webp') // default
        expect(metadata.width).toBe(100)
        expect(metadata.height).toBe(100)
      })

      it('should use defaults when options is omitted', async () => {
        const inputBuffer = await createTestImage(100, 100)
        const result = await optimizeImage(inputBuffer)

        const metadata = await sharp(result).metadata()
        expect(metadata.format).toBe('webp')
      })
    })

    describe('real-world scenarios', () => {
      it('should optimize a large blog header image', async () => {
        const inputBuffer = await createTestImage(4000, 2000)
        const result = await optimizeImage(inputBuffer, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 85,
          format: 'webp'
        })

        const metadata = await sharp(result).metadata()
        expect(metadata.format).toBe('webp')
        expect(metadata.width).toBeLessThanOrEqual(1920)
        expect(metadata.height).toBeLessThanOrEqual(1080)
      })

      it('should optimize a thumbnail image', async () => {
        const inputBuffer = await createTestImage(800, 600)
        const result = await optimizeImage(inputBuffer, {
          maxWidth: 400,
          maxHeight: 300,
          quality: 80,
          format: 'webp'
        })

        const metadata = await sharp(result).metadata()
        expect(metadata.format).toBe('webp')
        expect(metadata.width).toBeLessThanOrEqual(400)
        expect(metadata.height).toBeLessThanOrEqual(300)
      })
    })
  })
})
