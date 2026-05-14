/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
  generateRobotsTxt: false, // robots.txt는 src/app/robots.ts에서 동적 생성
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        crawlDelay: 0,
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
      },
    ],
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'}/server-sitemap.xml`,
    ],
  },
  exclude: [
    '/admin',
    '/admin/*',
    '/api/*',
    '/offline',
    '/icon.svg',
    '/*.svg',
    '/*.png',
    '/*.jpg',
  ],
  generateIndexSitemap: false,
  changefreq: 'weekly',
  priority: 0.7,
  transform: async (config, path) => {
    // Homepage - highest priority
    if (path === '/' || path === '/ko' || path === '/en') {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: new Date().toISOString(),
      }
    }

    // Blog post pages - high priority with SEO-optimized settings
    if (path.includes('/posts/')) {
      // Calculate age-based changefreq
      const now = new Date()
      const daysSinceNow = 0 // We don't have the actual post date here

      return {
        loc: path,
        changefreq: 'monthly', // Posts are relatively stable
        priority: 0.9, // High priority for all posts
        lastmod: new Date().toISOString(),
      }
    }

    // Archive, About, etc - medium priority
    if (path.includes('/archive') || path.includes('/about') || path.includes('/community')) {
      return {
        loc: path,
        changefreq: 'monthly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      }
    }

    // Other pages - default
    return {
      loc: path,
      changefreq: 'monthly',
      priority: 0.6,
      lastmod: new Date().toISOString(),
    }
  },
}