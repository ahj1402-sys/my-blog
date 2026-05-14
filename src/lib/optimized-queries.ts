import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

// Optimized post query with caching and error handling
export const getPostBySlug = unstable_cache(
  async (slug: string) => {
    try {
      return await prisma.post.findUnique({
        where: {
          slug,
          status: 'PUBLISHED',
          publishedAt: {
            not: null,
            lte: new Date()
          }
        },
        select: {
          // Only select required fields
          id: true,
          title: true,
          slug: true,
          content: true,
          excerpt: true,
          coverImage: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,
          author: true,
          tags: true,
          seoTitle: true,
          seoDescription: true,
          views: true,
          status: true,
          originalLanguage: true,
        }
      })
    } catch (error) {
      console.error('Error fetching post by slug:', error)

      // During database issues, return null instead of throwing
      if (error instanceof Error && (
        error.message.includes('quota') ||
        error.message.includes('connection') ||
        error.message.includes('database') ||
        error.name === 'PrismaClientInitializationError'
      )) {
        return null
      }

      // Re-throw other errors
      throw error
    }
  },
  ['post-by-slug'],
  {
    revalidate: 3600, // 1 hour
    tags: ['posts']
  }
)

// Optimized related posts query
export const getRelatedPosts = unstable_cache(
  async (postId: string, tags: string[], limit: number = 3) => {
    if (!tags.length) return []
    
    return prisma.post.findMany({
      where: {
        id: { not: postId },
        status: 'PUBLISHED',
        publishedAt: {
          not: null,
          lte: new Date()
        },
        // 썸네일이 있는 포스트만 노출
        coverImage: {
          not: null
        },
        tags: {
          contains: tags.join(',')
        }
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        publishedAt: true,
        tags: true,
        views: true,
      },
      orderBy: [
        { views: 'desc' },
        { publishedAt: 'desc' }
      ],
      take: limit
    })
  },
  ['related-posts'],
  {
    revalidate: 3600,
    tags: ['posts']
  }
)

// Get comments without caching (dynamic data) with error handling
export async function getPostComments(postId: string) {
  try {
    return await prisma.comment.findMany({
      where: {
        postId,
        isApproved: true,
        isDeleted: false,
        parentId: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        replies: {
          where: {
            isApproved: true,
            isDeleted: false,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })
  } catch (error) {
    console.error('Error fetching post comments:', error)

    // During database issues, return empty array instead of throwing
    if (error instanceof Error && (
      error.message.includes('quota') ||
      error.message.includes('connection') ||
      error.message.includes('database') ||
      error.name === 'PrismaClientInitializationError'
    )) {
      return []
    }

    // Re-throw other errors
    throw error
  }
}