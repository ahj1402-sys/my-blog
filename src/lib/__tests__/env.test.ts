/**
 * Tests for environment variable handling
 *
 * Coverage goal: 70-80%
 * Test approach: Unit tests with environment mocking
 *
 * Test cases:
 * - validateEnv: required variables, missing variables, production vs development
 * - hasApiKey: service checks
 * - Environment flags: isDevelopment, isProduction, isTest
 *
 * Note: The env object is evaluated at module load time and uses getRequiredEnv()
 * which throws immediately. Therefore, we must always provide required env vars
 * to avoid module load errors. We test validateEnv() separately which has its
 * own validation logic that doesn't throw at load time.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('env module', () => {
  // Helper to set up valid environment before importing
  function setupValidEnv() {
    process.env.GEMINI_API_KEY = 'test-gemini-key'
    process.env.YOUTUBE_API_KEY = 'test-youtube-key'
    process.env.YOUTUBE_CHANNEL_ID = 'test-channel-id'
  }

  describe('validateEnv', () => {
    let originalEnv: NodeJS.ProcessEnv
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>
    let consoleLogSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      // Save original env
      originalEnv = { ...process.env }

      // Set up valid env to allow module to load
      setupValidEnv()

      // Spy on console methods
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    })

    afterEach(() => {
      // Restore original env
      process.env = originalEnv

      // Restore console methods
      consoleErrorSpy.mockRestore()
      consoleLogSpy.mockRestore()

      // Clear module cache to reset env exports
      vi.resetModules()
    })

    it('should pass validation when all required vars are present', async () => {
      process.env.NODE_ENV = 'development'

      // Import fresh module
      const { validateEnv } = await import('../env')

      // Should not throw
      expect(() => validateEnv()).not.toThrow()

      // Should log success in development
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '✅ Environment variables validated successfully'
      )
      expect(consoleErrorSpy).not.toHaveBeenCalled()
    })

    it('should log error when variables are missing in development', async () => {
      process.env.NODE_ENV = 'development'

      // Import module first (while vars are present)
      const { validateEnv } = await import('../env')

      // Now remove vars and test validateEnv function
      delete process.env.GEMINI_API_KEY
      delete process.env.YOUTUBE_API_KEY
      delete process.env.YOUTUBE_CHANNEL_ID

      // Should not throw in development
      expect(() => validateEnv()).not.toThrow()

      // Should log error
      expect(consoleErrorSpy).toHaveBeenCalled()
      const errorMessage = consoleErrorSpy.mock.calls[0][0]
      expect(errorMessage).toContain('Missing required environment variables')
      expect(errorMessage).toContain('GEMINI_API_KEY')
      expect(errorMessage).toContain('YOUTUBE_API_KEY')
      expect(errorMessage).toContain('YOUTUBE_CHANNEL_ID')
    })

    it('should throw error when variables are missing in production', async () => {
      process.env.NODE_ENV = 'production'

      const { validateEnv } = await import('../env')

      // Remove vars after module load
      delete process.env.GEMINI_API_KEY
      delete process.env.YOUTUBE_API_KEY
      delete process.env.YOUTUBE_CHANNEL_ID

      // Should throw in production
      expect(() => validateEnv()).toThrow('Missing required environment variables')
    })

    it('should identify specific missing variables', async () => {
      process.env.NODE_ENV = 'development'

      const { validateEnv } = await import('../env')

      // Only remove some vars
      delete process.env.YOUTUBE_API_KEY
      delete process.env.YOUTUBE_CHANNEL_ID

      validateEnv()

      const errorMessage = consoleErrorSpy.mock.calls[0][0]
      expect(errorMessage).toContain('YOUTUBE_API_KEY')
      expect(errorMessage).toContain('YOUTUBE_CHANNEL_ID')
      expect(errorMessage).not.toContain('GEMINI_API_KEY')
    })

    it('should not log success message in production even when valid', async () => {
      process.env.NODE_ENV = 'production'

      const { validateEnv } = await import('../env')

      validateEnv()

      // Should not log success in production
      expect(consoleLogSpy).not.toHaveBeenCalled()
    })
  })

  describe('hasApiKey', () => {
    let originalEnv: NodeJS.ProcessEnv

    beforeEach(() => {
      originalEnv = { ...process.env }
      setupValidEnv()
    })

    afterEach(() => {
      process.env = originalEnv
      vi.resetModules()
    })

    it('should return true when Gemini API key is set', async () => {
      const { hasApiKey } = await import('../env')

      expect(hasApiKey('gemini')).toBe(true)
    })

    it('should return true when YouTube API key is set', async () => {
      const { hasApiKey } = await import('../env')

      expect(hasApiKey('youtube')).toBe(true)
    })

    it('should return false for unknown service', async () => {
      const { hasApiKey } = await import('../env')

      // @ts-expect-error - Testing invalid input
      expect(hasApiKey('unknown')).toBe(false)
    })
  })

  describe('environment flags', () => {
    let originalEnv: NodeJS.ProcessEnv

    beforeEach(() => {
      originalEnv = { ...process.env }
      setupValidEnv()
    })

    afterEach(() => {
      process.env = originalEnv
      vi.resetModules()
    })

    it('should detect development environment', async () => {
      process.env.NODE_ENV = 'development'

      const { isDevelopment, isProduction, isTest } = await import('../env')

      expect(isDevelopment).toBe(true)
      expect(isProduction).toBe(false)
      expect(isTest).toBe(false)
    })

    it('should detect production environment', async () => {
      process.env.NODE_ENV = 'production'

      const { isDevelopment, isProduction, isTest } = await import('../env')

      expect(isDevelopment).toBe(false)
      expect(isProduction).toBe(true)
      expect(isTest).toBe(false)
    })

    it('should detect test environment', async () => {
      process.env.NODE_ENV = 'test'

      const { isDevelopment, isProduction, isTest } = await import('../env')

      expect(isDevelopment).toBe(false)
      expect(isProduction).toBe(false)
      expect(isTest).toBe(true)
    })

    it('should default to development when NODE_ENV is not set', async () => {
      delete process.env.NODE_ENV

      const { isDevelopment, env } = await import('../env')

      expect(env.NODE_ENV).toBe('development')
      expect(isDevelopment).toBe(true)
    })
  })

  describe('env object', () => {
    let originalEnv: NodeJS.ProcessEnv

    beforeEach(() => {
      originalEnv = { ...process.env }
      setupValidEnv()
    })

    afterEach(() => {
      process.env = originalEnv
      vi.resetModules()
    })

    it('should export required environment variables', async () => {
      const { env } = await import('../env')

      expect(env.GEMINI_API_KEY).toBe('test-gemini-key')
      expect(env.YOUTUBE_API_KEY).toBe('test-youtube-key')
      expect(env.YOUTUBE_CHANNEL_ID).toBe('test-channel-id')
    })

    it('should export optional environment variables', async () => {
      process.env.DATABASE_URL = 'postgres://test'
      process.env.CRON_SECRET = 'secret123'

      const { env } = await import('../env')

      expect(env.DATABASE_URL).toBe('postgres://test')
      expect(env.CRON_SECRET).toBe('secret123')
    })

    it('should use default values for optional variables', async () => {
      delete process.env.NEXT_PUBLIC_SITE_URL

      const { env } = await import('../env')

      expect(env.NEXT_PUBLIC_SITE_URL).toBe('http://localhost:3000')
    })

    it('should be immutable (as const)', async () => {
      const { env } = await import('../env')

      // TypeScript will prevent this at compile time due to 'as const'
      // But we can verify the object properties exist
      expect(env).toHaveProperty('GEMINI_API_KEY')
      expect(env).toHaveProperty('YOUTUBE_API_KEY')
      expect(env).toHaveProperty('NODE_ENV')
    })

    it('should handle undefined optional variables', async () => {
      delete process.env.DATABASE_URL
      delete process.env.ADMIN_PASSWORD

      const { env } = await import('../env')

      expect(env.DATABASE_URL).toBeUndefined()
      expect(env.ADMIN_PASSWORD).toBeUndefined()
    })
  })
})
