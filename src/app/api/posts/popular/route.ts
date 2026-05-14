export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || 'all' // 'week', 'month', 'all'
    const limit = parseInt(searchParams.get('limit') || '5')
    
    // Calculate date range
    let dateFilter = {}
    const now = new Date()
    
    if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      dateFilter = { publishedAt: { gte: weekAgo } }
    } else if (period === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      dateFilter = { publishedAt: { gte: monthAgo } }
    }
    
    const posts = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: { lte: now },
        ...dateFilter
      },
      select: {
        id: true,
        title: true,
        slug: true,
        views: true,
        publishedAt: true,
        excerpt: true,
        coverImage: true
      },
      orderBy: { views: 'desc' },
      take: limit
    })
    
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching popular posts:', error)

    // Emergency fallback during DB quota or connection issues
    if (error instanceof Error && (
      error.message.includes('quota') ||
      error.message.includes('connection') ||
      error.message.includes('database') ||
      error.name === 'PrismaClientInitializationError'
    )) {
      return NextResponse.json([])
    }

    return NextResponse.json({ error: 'Failed to fetch popular posts' }, { status: 500 })
  }
}