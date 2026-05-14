import { Metadata } from 'next'
import PageLayout from '@/components/PageLayout'
import ArchiveClient from '@/components/ArchiveClient'
import { prisma } from '@/lib/prisma'
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
    title: isKorean ? `아카이브 | ${siteConfig.shortName}` : `Archive | ${siteConfig.shortName}`,
    description: isKorean
      ? 'AI, 기술, 소프트웨어 개발에 관한 모든 글'
      : 'Browse all posts about AI, technology, and software development',
    openGraph: {
      title: isKorean ? `아카이브 | ${siteConfig.shortName}` : `Archive | ${siteConfig.shortName}`,
      description: isKorean
        ? 'AI, 기술, 소프트웨어 개발에 관한 모든 글'
        : 'Browse all posts about AI, technology, and software development',
      type: 'website',
    },
  }
}

export default async function ArchivePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  try {
    const { locale } = await params

    const posts = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: {
          not: null,
          lte: new Date(),
        },
        originalLanguage: 'ko',
      },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        publishedAt: true,
        tags: true,
      }
    })

    const serializedPosts = posts.map(post => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      publishedAt: post.publishedAt?.toISOString() || null,
      tags: post.tags,
    }))

    return (
      <PageLayout locale={locale} currentPath="/archive">
        <ArchiveClient posts={serializedPosts} locale={locale} />
      </PageLayout>
    )
  } catch (error) {
    console.error('Error loading archive page:', error)

    if (error instanceof Error && (
      error.message.includes('quota') ||
      error.message.includes('connection') ||
      error.message.includes('database') ||
      error.name === 'PrismaClientInitializationError'
    )) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Service Temporarily Unavailable</h1>
            <p className="text-gray-600 mb-4">We're experiencing high traffic. Please try again in a few minutes.</p>
            <a href="/" className="text-blue-600 hover:text-blue-800">&larr; Return to Home</a>
          </div>
        </div>
      )
    }

    const { locale } = await params

    return (
      <PageLayout locale={locale} currentPath="/archive">
        <ArchiveClient posts={[]} locale={locale} />
      </PageLayout>
    )
  }
}
