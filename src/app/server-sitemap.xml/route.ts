import { getServerSideSitemap, ISitemapField } from 'next-sitemap'
import { prisma } from '@/lib/prisma'
import { siteConfig } from '@/config'

export async function GET() {
  try {
    // Fetch all published posts
    const posts = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: {
          not: null,
          lte: new Date(),
        },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
    })

    const sitemap: ISitemapField[] = posts.map((post) => ({
      loc: `${siteConfig.url}/posts/${post.slug}`,
      lastmod: post.updatedAt.toISOString(),
      changefreq: 'monthly',
      priority: 0.8,
    }))

    return getServerSideSitemap(sitemap)
  } catch (error) {
    console.error('Error generating server sitemap:', error)
    return getServerSideSitemap([])
  }
}