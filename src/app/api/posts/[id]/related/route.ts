export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { tagsToArray } from '@/lib/utils/tags'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get the current post
    const currentPost = await prisma.post.findUnique({
      where: { id },
      select: {
        tags: true,
        title: true
      }
    })
    
    if (!currentPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    
    // Find related posts based on tags
    const relatedPosts = await prisma.post.findMany({
      where: {
        AND: [
          { id: { not: id } },
          { status: 'PUBLISHED' },
          { publishedAt: { lte: new Date() } },
          {
            OR: tagsToArray(currentPost.tags).map(tag => ({
              tags: { contains: tag }
            }))
          }
        ]
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        publishedAt: true,
        tags: true,
        views: true
      },
      orderBy: [
        { views: 'desc' },
        { publishedAt: 'desc' }
      ],
      take: 5
    })
    
    // If not enough related posts, get popular posts
    if (relatedPosts.length < 3) {
      const popularPosts = await prisma.post.findMany({
        where: {
          AND: [
            { id: { not: id } },
            { status: 'PUBLISHED' },
            { publishedAt: { lte: new Date() } },
            { id: { notIn: relatedPosts.map(p => p.id) } }
          ]
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          publishedAt: true,
          tags: true,
          views: true
        },
        orderBy: [
          { views: 'desc' },
          { publishedAt: 'desc' }
        ],
        take: 3 - relatedPosts.length
      })
      
      relatedPosts.push(...popularPosts)
    }
    
    return NextResponse.json(relatedPosts.slice(0, 3))
    
  } catch (error) {
    console.error('Error fetching related posts:', error)
    return NextResponse.json({ error: 'Failed to fetch related posts' }, { status: 500 })
  }
}