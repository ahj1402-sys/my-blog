import PageLayout from '@/components/PageLayout'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Metadata } from 'next'
import { siteConfig } from '@/config'

// ISR: hourly revalidation. Restores bfcache vs. force-dynamic.
export const revalidate = 3600

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isKorean = locale === 'ko'

  return {
    title: isKorean ? `사이트맵 | ${siteConfig.shortName}` : `Sitemap | ${siteConfig.shortName}`,
    description: isKorean
      ? '블로그의 모든 페이지와 글을 한눈에 보기'
      : 'Browse all pages and posts on the blog',
    openGraph: {
      title: isKorean ? `사이트맵 | ${siteConfig.shortName}` : `Sitemap | ${siteConfig.shortName}`,
      description: isKorean
        ? '블로그의 모든 페이지와 글을 한눈에 보기'
        : 'Browse all pages and posts on the blog',
      type: 'website',
    },
  }
}

export default async function SitemapPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const lang = locale === 'en' ? 'en' : 'ko'

  let posts: any[] = []

  try {
    posts = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: { not: null },
        OR: [
          { originalLanguage: lang },
          {
            translations: {
              some: {
                locale: lang
              }
            }
          }
        ]
      },
      select: {
        slug: true,
        title: true,
        publishedAt: true,
        translations: {
          where: {
            locale: lang
          },
          select: {
            title: true
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      }
    })
  } catch (error) {
    console.error('Error fetching posts for sitemap:', error)
    posts = []
  }

  const mainPages = [
    { href: '/', title: lang === 'ko' ? '홈' : 'Home' },
    { href: '/archive', title: lang === 'ko' ? '아카이브' : 'Archive' },
    { href: '/about', title: lang === 'ko' ? '소개' : 'About' },
  ]

  return (
    <PageLayout locale={locale} currentPath="/sitemap">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          {lang === 'ko' ? '사이트맵' : 'Sitemap'}
        </h1>

        <div className="space-y-8">
          {/* Main Pages */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {lang === 'ko' ? '주요 페이지' : 'Main Pages'}
            </h2>
            <ul className="space-y-2">
              {mainPages.map((page) => (
                <li key={page.href}>
                  <Link
                    href={page.href}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Blog Posts */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {lang === 'ko' ? '블로그 글' : 'Blog Posts'}
              <span className="text-sm text-gray-500 ml-2">
                ({posts.length} {lang === 'ko' ? '개' : 'posts'})
              </span>
            </h2>
            {posts.length > 0 ? (
              <ul className="space-y-2">
                {posts.map((post) => {
                  const title = lang === 'en' && post.translations?.[0]?.title
                    ? post.translations[0].title
                    : post.title

                  return (
                    <li key={post.slug} className="flex justify-between items-start">
                      <Link
                        href={`/posts/${post.slug}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline flex-1 mr-4"
                      >
                        {title}
                      </Link>
                      <time className="text-sm text-gray-500 flex-shrink-0">
                        {new Date(post.publishedAt).toLocaleDateString(
                          lang === 'ko' ? 'ko-KR' : 'en-US',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }
                        )}
                      </time>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="text-gray-600">
                {lang === 'ko' ? '게시물이 없습니다.' : 'No posts available.'}
              </p>
            )}
          </section>
        </div>
      </div>
    </PageLayout>
  )
}