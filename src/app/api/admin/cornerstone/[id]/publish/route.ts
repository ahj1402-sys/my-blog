export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildCornerstoneBox, stripCornerstoneBox } from '@/lib/ai-prompts'
import { verifyAdminAuth } from '@/lib/auth'
import { withErrorHandler, logger, createSuccessResponse } from '@/lib/error-handler'

interface RouteContext {
  params: Promise<{ id: string }>
}

async function handler(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  const { id } = await context.params

  const cornerstone = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      isCornerstone: true,
      status: true,
    },
  })

  if (!cornerstone) {
    return NextResponse.json({ error: '코너스톤을 찾을 수 없습니다.' }, { status: 404 })
  }
  if (!cornerstone.isCornerstone) {
    return NextResponse.json(
      { error: '이 글은 코너스톤이 아닙니다. (isCornerstone=false)' },
      { status: 400 }
    )
  }

  // 1. 코너스톤 자체 publish
  const now = new Date()
  await prisma.post.update({
    where: { id: cornerstone.id },
    data: {
      status: 'PUBLISHED',
      publishedAt: cornerstone.status === 'PUBLISHED' ? undefined : now,
    },
  })

  // 2. spoke (source posts) 가져와서 박스 삽입
  const spokes = await prisma.post.findMany({
    where: { cornerstoneId: cornerstone.id },
    select: { id: true, content: true, slug: true, title: true },
  })

  const box = buildCornerstoneBox(cornerstone.title, cornerstone.slug)

  let updatedSpokes = 0
  for (const spoke of spokes) {
    // 기존 박스 제거 후 새 박스 append (재생성·재할당 시에도 일관)
    const cleaned = stripCornerstoneBox(spoke.content)
    await prisma.post.update({
      where: { id: spoke.id },
      data: { content: cleaned + box },
    })
    updatedSpokes += 1
  }

  logger.info('Cornerstone published with spokes', {
    cornerstoneId: cornerstone.id,
    slug: cornerstone.slug,
    spokeCount: updatedSpokes,
  })

  return createSuccessResponse(
    {
      id: cornerstone.id,
      slug: cornerstone.slug,
      title: cornerstone.title,
      spokeCount: updatedSpokes,
    },
    new URL(request.url).pathname
  )
}

export async function POST(request: NextRequest, context: RouteContext) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
  }
  const wrapped = withErrorHandler<[NextRequest], unknown>((req) => handler(req, context))
  return wrapped(request)
}
