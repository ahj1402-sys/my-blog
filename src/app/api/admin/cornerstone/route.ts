export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminAuth } from '@/lib/auth'

/**
 * GET /api/admin/cornerstone
 * 모든 코너스톤 글 목록 (spoke 수 포함)
 */
export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cornerstones = await prisma.post.findMany({
    where: { isCornerstone: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      publishedAt: true,
      createdAt: true,
      coverImage: true,
      views: true,
      _count: { select: { spokes: true } },
    },
  })

  return NextResponse.json(
    cornerstones.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      status: c.status,
      publishedAt: c.publishedAt,
      createdAt: c.createdAt,
      coverImage: c.coverImage,
      views: c.views,
      spokeCount: c._count.spokes,
    }))
  )
}
