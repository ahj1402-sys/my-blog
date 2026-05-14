/**
 * Rate Limiting 유틸리티
 *
 * 외부 API 비용 폭탄 방지:
 * - Gemini API 호출 제한 (번역, 콘텐츠 생성)
 * - YouTube API 호출 제한
 * - Vercel Blob 업로드 제한
 *
 * 방식: In-memory 카운터 (서버리스 환경에서 간단하고 효과적)
 */

interface RateLimitConfig {
  interval: number // 시간 간격 (ms)
  maxRequests: number // 최대 요청 수
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory 저장소 (서버리스에서는 각 인스턴스마다 독립적)
const store = new Map<string, RateLimitEntry>()

/**
 * Rate Limit 체크
 *
 * @param key - 제한 키 (예: 'gemini-api', 'youtube-api', 'upload')
 * @param config - 제한 설정
 * @returns { success: boolean, remaining: number, resetTime: number }
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const entry = store.get(key)

  // 첫 요청이거나 시간 간격 초과 시 리셋
  if (!entry || now > entry.resetTime) {
    const resetTime = now + config.interval
    store.set(key, { count: 1, resetTime })

    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime
    }
  }

  // 제한 초과
  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime
    }
  }

  // 카운트 증가
  entry.count++
  store.set(key, entry)

  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime
  }
}

/**
 * 사전 정의된 Rate Limit 프리셋
 */
export const RATE_LIMITS = {
  // Gemini API: 시간당 60회 (무료 티어 제한 고려)
  GEMINI_API: {
    interval: 60 * 60 * 1000, // 1시간
    maxRequests: 60
  },

  // YouTube API: 일일 10,000 quota units (대략 100회 비디오 조회)
  YOUTUBE_API: {
    interval: 24 * 60 * 60 * 1000, // 24시간
    maxRequests: 100
  },

  // Vercel Blob 업로드: 시간당 100개
  BLOB_UPLOAD: {
    interval: 60 * 60 * 1000, // 1시간
    maxRequests: 100
  },

  // 댓글 작성: IP당 분당 5개
  COMMENT_CREATE: {
    interval: 60 * 1000, // 1분
    maxRequests: 5
  }
} as const

/**
 * Rate Limit 헬퍼: Gemini API
 */
export function checkGeminiRateLimit() {
  return checkRateLimit('gemini-api', RATE_LIMITS.GEMINI_API)
}

/**
 * Rate Limit 헬퍼: YouTube API
 */
export function checkYouTubeRateLimit() {
  return checkRateLimit('youtube-api', RATE_LIMITS.YOUTUBE_API)
}

/**
 * Rate Limit 헬퍼: Blob Upload
 */
export function checkBlobUploadRateLimit() {
  return checkRateLimit('blob-upload', RATE_LIMITS.BLOB_UPLOAD)
}

/**
 * Rate Limit 헬퍼: 댓글 작성 (IP 기반)
 *
 * @param ip - 사용자 IP 주소
 */
export function checkCommentRateLimit(ip: string) {
  return checkRateLimit(`comment-${ip}`, RATE_LIMITS.COMMENT_CREATE)
}

/**
 * Rate Limit 에러 응답 생성
 */
export function createRateLimitResponse(resetTime: number) {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000)

  return {
    error: 'Too many requests',
    message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
    retryAfter,
    resetTime: new Date(resetTime).toISOString()
  }
}
