/**
 * 환경 변수 타입 안전성 및 검증
 * 모든 환경 변수는 이 파일을 통해 접근해야 합니다.
 */

/**
 * 선택적 환경 변수 가져오기
 */
function getOptionalEnv(key: string, defaultValue?: string): string | undefined {
  return process.env[key] || defaultValue
}

/**
 * 환경 변수 객체
 * 앱 시작 시 한 번만 검증되며, 이후 타입 안전하게 사용 가능
 */
export const env = {
  // Node Environment
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database (Turso)
  DATABASE_URL: getOptionalEnv('DATABASE_URL'),
  TURSO_DATABASE_URL: getOptionalEnv('TURSO_DATABASE_URL'),
  DATABASE_AUTH_TOKEN: getOptionalEnv('DATABASE_AUTH_TOKEN'),

  // AI Services
  GEMINI_API_KEY: getOptionalEnv('GEMINI_API_KEY'),

  // YouTube API (선택 — featuresConfig.youtubeSync 사용 시에만 필요)
  YOUTUBE_API_KEY: getOptionalEnv('YOUTUBE_API_KEY'),
  YOUTUBE_CHANNEL_ID: getOptionalEnv('YOUTUBE_CHANNEL_ID'),

  // Site Configuration
  NEXT_PUBLIC_SITE_URL: getOptionalEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000'),

  // Unsplash (선택 — 자동 썸네일용)
  UNSPLASH_ACCESS_KEY: getOptionalEnv('UNSPLASH_ACCESS_KEY'),

  // Cron & Webhooks (선택)
  CRON_SECRET: getOptionalEnv('CRON_SECRET'),
  REDEPLOY_WEBHOOK_URL: getOptionalEnv('REDEPLOY_WEBHOOK_URL'),

  // Admin
  ADMIN_PASSWORD: getOptionalEnv('ADMIN_PASSWORD'),
} as const

/**
 * 환경 변수 타입
 */
export type Env = typeof env

/**
 * 개발 환경 체크
 */
export const isDevelopment = env.NODE_ENV === 'development'
export const isProduction = env.NODE_ENV === 'production'
export const isTest = env.NODE_ENV === 'test'

/**
 * 환경 변수 검증 (앱 초기화 시 호출)
 * 5개 필수 변수만 검증한다. 나머지는 optional.
 */
export function validateEnv(): void {
  const requiredVars = [
    'NEXT_PUBLIC_SITE_URL',
    'TURSO_DATABASE_URL',
    'DATABASE_AUTH_TOKEN',
    'GEMINI_API_KEY',
    'ADMIN_PASSWORD',
  ]

  const missing: string[] = []

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName)
    }
  }

  if (missing.length > 0) {
    const errorMessage = [
      '환경 변수가 설정되지 않았습니다:',
      ...missing.map((v) => `   - ${v}`),
      '',
      '.env.example 파일을 참고해서 설정해주세요.',
    ].join('\n')

    console.error(errorMessage)

    // 프로덕션에서는 앱 시작을 막음
    if (isProduction) {
      throw new Error(errorMessage)
    }
  }

  if (isDevelopment) {
    console.log('환경 변수 검증 완료')
  }
}

/**
 * 특정 API 키가 설정되었는지 확인
 */
export function hasApiKey(service: 'gemini' | 'youtube'): boolean {
  switch (service) {
    case 'gemini':
      return !!env.GEMINI_API_KEY
    case 'youtube':
      return !!env.YOUTUBE_API_KEY
    default:
      return false
  }
}
