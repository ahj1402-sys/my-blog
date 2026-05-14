import { NextResponse } from 'next/server';
import { ZodError, ZodSchema } from 'zod';
import { Prisma } from '@prisma/client';

/**
 * Standard success response format
 */
export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  timestamp: string;
  path?: string;
}

/**
 * Standard error response format
 */
export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  details?: unknown;
  timestamp: string;
  path?: string;
}

/**
 * Union type for all API responses
 */
export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 환경별 에러 상세 정보 포함 여부
const isDevelopment = process.env.NODE_ENV === 'development';

export function handleApiError(
  error: unknown,
  path?: string
): NextResponse<ErrorResponse> {
  console.error(`[${new Date().toISOString()}] API Error at ${path}:`, error);

  // ApiError 인스턴스
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: error.message,
        details: isDevelopment ? error.details : undefined,
        timestamp: new Date().toISOString(),
        path,
      },
      { status: error.statusCode }
    );
  }

  // Zod 검증 에러
  if (error instanceof ZodError) {
    // Format validation errors into readable messages
    const zodError = error as ZodError;
    const fieldErrors = zodError.issues.map(err => {
      const field = err.path.join('.');
      return `${field}: ${err.message}`;
    }).join(', ');

    return NextResponse.json(
      {
        success: false,
        error: 'Validation Error',
        message: `Invalid request data: ${fieldErrors}`,
        details: isDevelopment ? zodError.issues : undefined,
        timestamp: new Date().toISOString(),
        path,
      },
      { status: 400 }
    );
  }

  // Prisma 에러 - Known Request Error
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    let message = 'Database operation failed';
    let statusCode = 500;

    switch (error.code) {
      case 'P2002':
        message = 'A unique constraint would be violated';
        statusCode = 409;
        break;
      case 'P2025':
        message = 'Record not found';
        statusCode = 404;
        break;
      case 'P2003':
        message = 'Foreign key constraint failed';
        statusCode = 400;
        break;
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
        message,
        // TEMPORARY: Always show details to debug Turso issues
        details: { type: 'PrismaClientKnownRequestError', code: error.code, meta: error.meta, fullError: error.message },
        timestamp: new Date().toISOString(),
        path,
      },
      { status: statusCode }
    );
  }

  // Prisma 에러 - Initialization Error
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return NextResponse.json(
      {
        success: false,
        error: 'Database connection failed',
        message: 'Failed to initialize database connection',
        details: { type: 'PrismaClientInitializationError', errorCode: error.errorCode, message: error.message },
        timestamp: new Date().toISOString(),
        path,
      },
      { status: 500 }
    );
  }

  // Prisma 에러 - Validation Error
  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      {
        success: false,
        error: 'Database validation failed',
        message: 'Invalid data provided to database',
        details: { type: 'PrismaClientValidationError', message: error.message },
        timestamp: new Date().toISOString(),
        path,
      },
      { status: 400 }
    );
  }

  // Prisma 에러 - Unknown Request Error
  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return NextResponse.json(
      {
        success: false,
        error: 'Database operation failed',
        message: 'Unknown database error occurred',
        details: { type: 'PrismaClientUnknownRequestError', message: error.message },
        timestamp: new Date().toISOString(),
        path,
      },
      { status: 500 }
    );
  }

  // Prisma 에러 - Rust Panic
  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return NextResponse.json(
      {
        success: false,
        error: 'Database engine crashed',
        message: 'Critical database engine error',
        details: { type: 'PrismaClientRustPanicError', message: error.message },
        timestamp: new Date().toISOString(),
        path,
      },
      { status: 500 }
    );
  }

  // 일반 Error 인스턴스
  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        // TEMPORARY: Always show error message to debug Turso issues
        message: error.message || 'An unexpected error occurred',
        details: { stack: error.stack, name: error.name, fullMessage: error.toString() },
        timestamp: new Date().toISOString(),
        path,
      },
      { status: 500 }
    );
  }

  // 알 수 없는 에러
  return NextResponse.json(
    {
      success: false,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      details: isDevelopment ? error : undefined,
      timestamp: new Date().toISOString(),
      path,
    },
    { status: 500 }
  );
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  path?: string
): NextResponse<SuccessResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
    path,
  });
}

/**
 * API route wrapper function with error handling
 * Automatically catches errors and returns standardized error responses
 */
export function withErrorHandler<T extends unknown[], R>(
  handler: (...args: T) => Promise<NextResponse<R>>
) {
  return async (...args: T): Promise<NextResponse<R | ErrorResponse>> => {
    try {
      return await handler(...args);
    } catch (error) {
      const request = args.find(arg => arg instanceof Request) as Request | undefined;
      const path = request ? new URL(request.url).pathname : undefined;
      return handleApiError(error, path);
    }
  };
}

/**
 * Validate request body with Zod schema
 * Throws ApiError if validation fails
 */
export async function validateRequest<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw error; // Will be handled by withErrorHandler
    }
    if (error instanceof SyntaxError) {
      throw new ApiError(400, 'Invalid JSON in request body');
    }
    throw new ApiError(400, 'Invalid request body');
  }
}

/**
 * Validate URL search params with Zod schema
 * Throws ApiError if validation fails
 */
export function validateSearchParams<T>(
  searchParams: URLSearchParams,
  schema: ZodSchema<T>
): T {
  const params = Object.fromEntries(searchParams.entries());
  return schema.parse(params);
}

// 클라이언트 측 에러 처리 헬퍼
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }

  return 'An unexpected error occurred';
}

// 로깅 유틸리티
export const logger = {
  error: (message: string, error?: unknown, metadata?: Record<string, unknown>) => {
    console.error(`[ERROR] ${message}`, {
      error,
      metadata,
      timestamp: new Date().toISOString(),
    });
  },
  
  warn: (message: string, metadata?: Record<string, unknown>) => {
    console.warn(`[WARN] ${message}`, {
      metadata,
      timestamp: new Date().toISOString(),
    });
  },
  
  info: (message: string, metadata?: Record<string, unknown>) => {
    console.log(`[INFO] ${message}`, {
      metadata,
      timestamp: new Date().toISOString(),
    });
  },
};