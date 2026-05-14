export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { withErrorHandler, logger, ApiError } from '@/lib/error-handler'
import { verifyAdminAuth } from '@/lib/auth'
import { searchUnsplashImage, extractImageKeywords, getOptimizedImageUrl } from '@/lib/unsplash'

/**
 * POST /api/admin/posts/[id]/publish
 * Publish a draft post
 */
async function publishHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  logger.info('Publishing post', { postId: id })

  // Check if post exists and is a draft
  const existingPost = await prisma.post.findUnique({
    where: { id },
    select: { status: true, title: true, coverImage: true }
  })

  if (!existingPost) {
    throw new ApiError(404, 'Post not found', { postId: id })
  }

  if (existingPost.status === 'PUBLISHED') {
    logger.info('Post is already published', { postId: id })
    return NextResponse.json({
      success: true,
      message: 'Post is already published',
      alreadyPublished: true
    })
  }

  // Unsplash 자동 썸네일: coverImage가 없거나 OG URL이면 Unsplash에서 검색
  let coverImage = existingPost.coverImage
  const needsThumbnail = !coverImage || coverImage.includes('/api/og?')

  if (needsThumbnail && existingPost.title) {
    logger.info('Searching Unsplash for thumbnail', { title: existingPost.title })
    const query = extractImageKeywords(existingPost.title)
    const image = await searchUnsplashImage(query)
    if (image) {
      coverImage = getOptimizedImageUrl(image)
      logger.info('Unsplash thumbnail assigned', { imageId: image.id })
    }
  }

  // Update post status to PUBLISHED and set publishedAt
  const post = await prisma.post.update({
    where: { id },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
      ...(coverImage !== existingPost.coverImage ? { coverImage } : {}),
    },
  })

  logger.info('Post published successfully', {
    postId: id,
    title: existingPost.title,
    publishedAt: post.publishedAt,
    unsplashThumbnail: coverImage !== existingPost.coverImage,
  })

  // ISR 캐시 무효화: 발행 즉시 공개 페이지에 반영되도록
  revalidatePath('/', 'layout')

  return NextResponse.json({
    success: true,
    message: 'Post published successfully',
    alreadyPublished: false,
    post: {
      id: post.id,
      status: post.status,
      publishedAt: post.publishedAt
    }
  })
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // 인증 체크
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    )
  }

  return withErrorHandler(publishHandler)(request, context)
}
