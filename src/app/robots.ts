import type { MetadataRoute } from 'next'
import { siteConfig } from '@/config'

/**
 * 동적 robots.txt 생성.
 * siteConfig.url 기반으로 Host, Sitemap URL을 자동 설정한다.
 * public/robots.txt 대신 이 파일이 우선 적용된다.
 *
 * Disallow:
 * - /admin/*  : 관리자 패널은 크롤링 금지 (보안 + SEO 중복 방지)
 * - /api/*    : API 엔드포인트는 검색 노출 의미 없음
 * - /_next/*  : Next.js 내부 정적 자산
 */
const disallowedPaths = ['/admin', '/admin/*', '/api', '/api/*', '/_next']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: disallowedPaths,
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: disallowedPaths,
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
        disallow: disallowedPaths,
      },
    ],
    sitemap: [
      `${siteConfig.url}/sitemap.xml`,
      `${siteConfig.url}/server-sitemap.xml`,
    ],
    host: siteConfig.url,
  }
}
