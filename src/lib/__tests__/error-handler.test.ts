/**
 * Tests for error handling utilities
 *
 * Coverage goal: 80-90%
 * Test approach: Unit tests with mocking for Next.js and Prisma
 *
 * Test cases:
 * - ApiError: class instantiation, properties
 * - handleApiError: ApiError, ZodError, Prisma errors, Error, unknown
 * - withErrorHandler: wrapper function, error catching
 * - getErrorMessage: various error types
 * - logger: error, warn, info methods
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ZodError, z } from 'zod'
import { Prisma } from '@prisma/client'
import {
  ApiError,
  handleApiError,
  withErrorHandler,
  getErrorMessage,
  logger,
} from '../error-handler'

describe('ApiError', () => {
  describe('instantiation', () => {
    it('should create ApiError with status code and message', () => {
      const error = new ApiError(404, 'Not found')

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(ApiError)
      expect(error.statusCode).toBe(404)
      expect(error.message).toBe('Not found')
      expect(error.name).toBe('ApiError')
    })

    it('should create ApiError with details', () => {
      const details = { id: '123', reason: 'test' }
      const error = new ApiError(400, 'Bad request', details)

      expect(error.statusCode).toBe(400)
      expect(error.message).toBe('Bad request')
      expect(error.details).toEqual(details)
    })

    it('should create ApiError without details', () => {
      const error = new ApiError(500, 'Internal error')

      expect(error.details).toBeUndefined()
    })
  })

  describe('error codes', () => {
    it('should support 400 Bad Request', () => {
      const error = new ApiError(400, 'Bad Request')
      expect(error.statusCode).toBe(400)
    })

    it('should support 401 Unauthorized', () => {
      const error = new ApiError(401, 'Unauthorized')
      expect(error.statusCode).toBe(401)
    })

    it('should support 404 Not Found', () => {
      const error = new ApiError(404, 'Not Found')
      expect(error.statusCode).toBe(404)
    })

    it('should support 500 Internal Server Error', () => {
      const error = new ApiError(500, 'Internal Server Error')
      expect(error.statusCode).toBe(500)
    })
  })
})

describe('handleApiError', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>
  let originalEnv: string | undefined

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    originalEnv = process.env.NODE_ENV
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
    process.env.NODE_ENV = originalEnv
    vi.resetModules()
  })

  describe('ApiError handling', () => {
    it('should handle ApiError with correct status code', () => {
      const error = new ApiError(404, 'Resource not found')
      const response = handleApiError(error, '/api/test')

      expect(response.status).toBe(404)
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    it('should include details in development mode', async () => {
      process.env.NODE_ENV = 'development'
      vi.resetModules()
      const { handleApiError, ApiError } = await import('../error-handler')

      const details = { id: '123' }
      const error = new ApiError(400, 'Bad request', details)

      const response = handleApiError(error)
      const body = await response.json()

      expect(body.details).toEqual(details)
    })

    it('should exclude details in production mode', async () => {
      process.env.NODE_ENV = 'production'
      const details = { id: '123' }
      const error = new ApiError(400, 'Bad request', details)

      const response = handleApiError(error)
      const body = await response.json()

      expect(body.details).toBeUndefined()
    })

    it('should include timestamp and path', async () => {
      const error = new ApiError(500, 'Error')
      const response = handleApiError(error, '/api/posts')
      const body = await response.json()

      expect(body.timestamp).toBeTruthy()
      expect(new Date(body.timestamp)).toBeInstanceOf(Date)
      expect(body.path).toBe('/api/posts')
    })
  })

  describe('ZodError handling', () => {
    it('should handle ZodError with validation messages', async () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(18),
      })

      try {
        schema.parse({ email: 'invalid', age: 10 })
      } catch (error) {
        const response = handleApiError(error)
        const body = await response.json()

        expect(response.status).toBe(400)
        expect(body.error).toBe('Validation Error')
        expect(body.message).toContain('Invalid request data')
      }
    })

    it('should format field errors', async () => {
      const schema = z.object({ name: z.string().min(1) })

      try {
        schema.parse({ name: '' })
      } catch (error) {
        const response = handleApiError(error)
        const body = await response.json()

        expect(body.message).toContain('name')
      }
    })

    it('should include zodError issues in development', async () => {
      process.env.NODE_ENV = 'development'
      vi.resetModules()
      const { handleApiError } = await import('../error-handler')
      const schema = z.object({ email: z.string().email() })

      try {
        schema.parse({ email: 'invalid' })
      } catch (error) {
        const response = handleApiError(error)
        const body = await response.json()

        expect(body.details).toBeTruthy()
        expect(Array.isArray(body.details)).toBe(true)
      }
    })
  })

  describe('Prisma error handling', () => {
    it('should handle P2002 unique constraint violation', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '5.0.0',
          meta: { target: ['email'] },
        }
      )

      const response = handleApiError(prismaError)
      const body = await response.json()

      expect(response.status).toBe(409)
      expect(body.error).toBe('A unique constraint would be violated')
    })

    it('should handle P2025 record not found', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        {
          code: 'P2025',
          clientVersion: '5.0.0',
        }
      )

      const response = handleApiError(prismaError)
      const body = await response.json()

      expect(response.status).toBe(404)
      expect(body.error).toBe('Record not found')
    })

    it('should handle P2003 foreign key constraint', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Foreign key constraint failed',
        {
          code: 'P2003',
          clientVersion: '5.0.0',
        }
      )

      const response = handleApiError(prismaError)
      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.error).toBe('Foreign key constraint failed')
    })

    it('should include error code and meta in development', async () => {
      process.env.NODE_ENV = 'development'
      vi.resetModules()
      const { handleApiError } = await import('../error-handler')

      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Error',
        {
          code: 'P2002',
          clientVersion: '5.0.0',
          meta: { target: ['email'] },
        }
      )

      const response = handleApiError(prismaError)
      const body = await response.json()

      expect(body.details).toBeTruthy()
      expect(body.details).toHaveProperty('code', 'P2002')
      expect(body.details).toHaveProperty('meta')
    })
  })

  describe('generic Error handling', () => {
    it('should handle generic Error', async () => {
      const error = new Error('Something went wrong')
      const response = handleApiError(error)
      const body = await response.json()

      expect(response.status).toBe(500)
      expect(body.error).toBe('Internal Server Error')
    })

    it('should show error message in development', async () => {
      process.env.NODE_ENV = 'development'
      vi.resetModules()
      const { handleApiError } = await import('../error-handler')

      const error = new Error('Debug info')
      const response = handleApiError(error)
      const body = await response.json()

      expect(body.message).toBe('Debug info')
      expect(body.details).toHaveProperty('stack')
    })

    it('should hide error message in production', async () => {
      process.env.NODE_ENV = 'production'
      const error = new Error('Sensitive info')

      const response = handleApiError(error)
      const body = await response.json()

      expect(body.message).toBe('An unexpected error occurred')
      expect(body.details).toBeUndefined()
    })
  })

  describe('unknown error handling', () => {
    it('should handle string errors', async () => {
      const response = handleApiError('Something failed')
      const body = await response.json()

      expect(response.status).toBe(500)
      expect(body.error).toBe('Internal Server Error')
    })

    it('should handle null errors', async () => {
      const response = handleApiError(null)
      const body = await response.json()

      expect(response.status).toBe(500)
      expect(body.message).toBe('An unexpected error occurred')
    })

    it('should include unknown error in development', async () => {
      process.env.NODE_ENV = 'development'
      vi.resetModules()
      const { handleApiError } = await import('../error-handler')

      const unknownError = { custom: 'error' }
      const response = handleApiError(unknownError)
      const body = await response.json()

      expect(body.details).toEqual(unknownError)
    })
  })
})

describe('withErrorHandler', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('should pass through successful results', async () => {
    const handler = withErrorHandler(async (input: string) => {
      return `Success: ${input}`
    })

    const result = await handler('test')
    expect(result).toBe('Success: test')
  })

  it('should catch and handle errors', async () => {
    const handler = withErrorHandler(async () => {
      throw new ApiError(400, 'Bad request')
    })

    const result = await handler()
    expect(result).toHaveProperty('status', 400)
  })

  it('should extract path from Request object', async () => {
    const request = new Request('http://localhost:3000/api/test')
    const handler = withErrorHandler(async (req: Request) => {
      throw new Error('Test error')
    })

    const result = await handler(request)
    const body = await (result as any).json()
    expect(body.path).toBe('/api/test')
  })

  it('should work with multiple arguments', async () => {
    const handler = withErrorHandler(async (a: number, b: number) => {
      return a + b
    })

    const result = await handler(2, 3)
    expect(result).toBe(5)
  })
})

describe('getErrorMessage', () => {
  it('should extract message from Error instance', () => {
    const error = new Error('Test error')
    expect(getErrorMessage(error)).toBe('Test error')
  })

  it('should return string error as-is', () => {
    expect(getErrorMessage('String error')).toBe('String error')
  })

  it('should extract message from object with message property', () => {
    const error = { message: 'Object error' }
    expect(getErrorMessage(error)).toBe('Object error')
  })

  it('should handle null', () => {
    expect(getErrorMessage(null)).toBe('An unexpected error occurred')
  })

  it('should handle undefined', () => {
    expect(getErrorMessage(undefined)).toBe('An unexpected error occurred')
  })

  it('should handle numbers', () => {
    expect(getErrorMessage(123)).toBe('An unexpected error occurred')
  })

  it('should handle objects without message', () => {
    expect(getErrorMessage({ code: 500 })).toBe('An unexpected error occurred')
  })

  it('should handle ApiError', () => {
    const error = new ApiError(404, 'Not found')
    expect(getErrorMessage(error)).toBe('Not found')
  })
})

describe('logger', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>
  let consoleLogSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
    consoleWarnSpy.mockRestore()
    consoleLogSpy.mockRestore()
  })

  describe('error', () => {
    it('should log error messages', () => {
      logger.error('Test error')

      expect(consoleErrorSpy).toHaveBeenCalled()
      const call = consoleErrorSpy.mock.calls[0]
      expect(call[0]).toContain('[ERROR]')
      expect(call[0]).toContain('Test error')
    })

    it('should include error object', () => {
      const error = new Error('Failed')
      logger.error('Operation failed', error)

      expect(consoleErrorSpy).toHaveBeenCalled()
      const call = consoleErrorSpy.mock.calls[0]
      expect(call[1]).toHaveProperty('error', error)
    })

    it('should include metadata', () => {
      const metadata = { userId: '123', action: 'delete' }
      logger.error('User action failed', undefined, metadata)

      expect(consoleErrorSpy).toHaveBeenCalled()
      const call = consoleErrorSpy.mock.calls[0]
      expect(call[1]).toHaveProperty('metadata', metadata)
    })

    it('should include timestamp', () => {
      logger.error('Test')

      const call = consoleErrorSpy.mock.calls[0]
      expect(call[1]).toHaveProperty('timestamp')
      expect(new Date(call[1].timestamp)).toBeInstanceOf(Date)
    })
  })

  describe('warn', () => {
    it('should log warning messages', () => {
      logger.warn('Test warning')

      expect(consoleWarnSpy).toHaveBeenCalled()
      const call = consoleWarnSpy.mock.calls[0]
      expect(call[0]).toContain('[WARN]')
      expect(call[0]).toContain('Test warning')
    })

    it('should include metadata', () => {
      const metadata = { key: 'value' }
      logger.warn('Warning', metadata)

      const call = consoleWarnSpy.mock.calls[0]
      expect(call[1]).toHaveProperty('metadata', metadata)
    })
  })

  describe('info', () => {
    it('should log info messages', () => {
      logger.info('Test info')

      expect(consoleLogSpy).toHaveBeenCalled()
      const call = consoleLogSpy.mock.calls[0]
      expect(call[0]).toContain('[INFO]')
      expect(call[0]).toContain('Test info')
    })

    it('should include metadata', () => {
      const metadata = { requestId: 'abc123' }
      logger.info('Request processed', metadata)

      const call = consoleLogSpy.mock.calls[0]
      expect(call[1]).toHaveProperty('metadata', metadata)
    })
  })
})
