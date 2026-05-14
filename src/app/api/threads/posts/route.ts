export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getThreadsPosts } from '@/lib/threads'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/threads/posts?account=PARTNERS_DANA&limit=25&after=CURSOR
 * Fetch Threads posts for a given account, with blog post status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const account = searchParams.get('account')
    const limit = parseInt(searchParams.get('limit') || '25')
    const after = searchParams.get('after') || undefined

    if (!account) {
      return NextResponse.json(
        { error: 'account parameter is required' },
        { status: 400 }
      )
    }

    const { posts, nextCursor } = await getThreadsPosts(account, {
      limit,
      after,
    })

    // Check which Threads posts already have blog posts
    const threadsIds = posts.map(p => p.id)
    const existingPosts = await prisma.post.findMany({
      where: {
        threadsPostId: { in: threadsIds },
      },
      select: {
        threadsPostId: true,
        id: true,
        slug: true,
        status: true,
      },
    })

    const postedMap = new Map(
      existingPosts.map(post => [post.threadsPostId, post])
    )

    const postsWithStatus = posts.map(post => ({
      ...post,
      isPosted: postedMap.has(post.id),
      postDetails: postedMap.get(post.id) || null,
    }))

    return NextResponse.json({
      posts: postsWithStatus,
      nextCursor,
    })
  } catch (error) {
    console.error('Error fetching Threads posts:', error)
    const message =
      error instanceof Error ? error.message : 'Failed to fetch Threads posts'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
