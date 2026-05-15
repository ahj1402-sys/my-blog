/**
 * Site Configuration
 *
 * 사이트 전역 설정. 새 회사 블로그를 만들 때 이 파일의 값만 교체하면 된다.
 * 모든 SEO 메타데이터, schema.org, canonical URL, sitemap 등이 이 설정을 참조한다.
 */
export const siteConfig = {
  /** 사이트 전체 이름 (schema.org, OG siteName) */
  name: '나의 블로그',

  /** 짧은 이름 (헤더 로고, 푸터 저작권, title template suffix) */
  shortName: '나의 블로그',

  /** 프로덕션 URL (trailing slash 없이). canonical, sitemap, robots 등에 사용 */
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com').trim(),

  /** 기본 로케일 */
  defaultLocale: 'ko' as const,

  /** 지원 로케일 */
  locales: ['ko'] as const,

  /** 로케일별 사이트 제목 (홈페이지 title, OG title) */
  title: {
    ko: '나의 블로그 - 블로그 제목을 입력하세요',
    en: 'My Blog - Enter your blog title',
  },

  /** 로케일별 사이트 설명 (meta description, OG description) */
  description: {
    ko: '블로그 설명을 입력하세요',
    en: 'Enter your blog description',
  },

  /** SEO 키워드 */
  keywords: ['블로그', 'blog'],

  /** 저자/발행자 정보 (schema.org author, publisher) */
  author: {
    name: '콜Cole',
    /** 'Person' = 개인 블로그, 'Organization' = 기업 블로그 */
    type: 'Person' as 'Person' | 'Organization',
    /** 저자 소개 페이지 경로 (schema.org author.url에 사용) */
    aboutPath: '/about',
  },

  /** 소셜 링크 (빈 문자열이면 렌더링 안 함) */
  social: {
    twitter: '',
    github: '',
    linkedin: '',
    youtube: '',
  },

  /** 연락처 이메일 */
  emails: {
    contact: 'contact@example.com',
    privacy: 'privacy@example.com',
    legal: 'legal@example.com',
  },

  /** 검색엔진 사이트 인증 코드 (빈 문자열이면 meta 태그 렌더링 안 함) */
  verification: {
    google: '',
    naver: '',
  },

  /** 분석 도구 ID (빈 문자열이면 스크립트 로딩 안 함) */
  analytics: {
    gaId: '',
  },
} as const

/** siteConfig의 locale 타입 */
export type SiteLocale = (typeof siteConfig.locales)[number]
