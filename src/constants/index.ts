/**
 * 애플리케이션 전역 상수
 *
 * SEO 상수는 src/config/site.config.ts 에서 관리.
 * 이 파일의 SEO 객체는 하위 호환성을 위해 config를 re-export 한다.
 */
import { siteConfig } from '@/config'
import { brandConfig } from '@/config'

// SEO 관련 상수 (config 기반)
export const SEO = {
  DEFAULT_TITLE: siteConfig.title[siteConfig.defaultLocale],
  DEFAULT_DESCRIPTION: siteConfig.description[siteConfig.defaultLocale],
  DEFAULT_KEYWORDS: siteConfig.keywords,
  SITE_NAME: siteConfig.name,
  SITE_URL: siteConfig.url,
  TWITTER_HANDLE: siteConfig.social.twitter,
  DEFAULT_OG_IMAGE: brandConfig.ogImage,
} as const

// 페이지네이션 상수
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
} as const

// 파일 업로드 상수
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  IMAGE_QUALITY: 0.85,
} as const

// API 상수
export const API = {
  TIMEOUT: 30000, // 30초
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1초
} as const

// 캐시 상수
export const CACHE = {
  POST_TTL: 60 * 60, // 1시간
  ANALYTICS_TTL: 5 * 60, // 5분
  YOUTUBE_TTL: 15 * 60, // 15분
} as const

// 날짜 포맷 상수
export const DATE_FORMATS = {
  DISPLAY: 'MMMM d, yyyy',
  SHORT: 'MMM d, yyyy',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
} as const

// YouTube 상수
export const YOUTUBE = {
  DEFAULT_THUMBNAIL_QUALITY: 'hqdefault',
  VIDEO_ID_LENGTH: 11,
  MAX_VIDEOS_FETCH: 50,
} as const

// 태그 상수
export const TAGS = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 50,
  MAX_COUNT: 10,
} as const

// 콘텐츠 상수
export const CONTENT = {
  TITLE_MIN_LENGTH: 1,
  TITLE_MAX_LENGTH: 200,
  EXCERPT_MAX_LENGTH: 500,
  SEO_TITLE_MAX_LENGTH: 70,
  SEO_DESCRIPTION_MAX_LENGTH: 160,
  MIN_READING_TIME: 1,
} as const