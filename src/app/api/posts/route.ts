export const dynamic = "force-dynamic"
import { NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { withErrorHandler, logger, createSuccessResponse, ApiError, validateRequest } from '@/lib/error-handler'
import { createPostSchema } from '@/lib/validations'
import { generateSlug, generateUniqueSlug } from '@/lib/utils/slug'
import { translateTitleToEnglishSlug } from '@/lib/utils/slug-translate'

export const GET = withErrorHandler(async (request: NextRequest) => {
  logger.info('Fetching all posts');

  const posts = await prisma.post.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      tags: true,
      publishedAt: true,
      createdAt: true,
      author: true,
      status: true,
      views: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return createSuccessResponse(posts, new URL(request.url).pathname);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const data = await validateRequest(request, createPostSchema);

  // 슬러그 자동 생성: 영문 케밥 케이스 + 중복 시 -2, -3 suffix
  // 사용자가 직접 입력했다면 그 값을 정리(영문/숫자/하이픈만)해서 사용
  if (data.slug) {
    data.slug = generateSlug(data.slug)
  } else {
    // 제목에 한글이 포함된 경우 Gemini로 영문 슬러그 번역, 영문이면 그대로 슬러그화
    let baseSlug = generateSlug(data.title)
    const looksLikeFallback = /^post-[a-z0-9]+$/.test(baseSlug)
    if (looksLikeFallback) {
      // 영문/숫자가 거의 없는 한글 제목 → Gemini로 번역 시도
      const translated = await translateTitleToEnglishSlug(data.title)
      if (translated) {
        baseSlug = generateSlug(translated)
      }
    }
    data.slug = await generateUniqueSlug(baseSlug, async (candidate) => {
      const existing = await prisma.post.findUnique({ where: { slug: candidate }, select: { id: true } })
      return !!existing
    })
  }

  logger.info('Creating post', {
    title: data.title,
    slug: data.slug,
    tags: data.tags,
    publishedAt: data.publishedAt
  });

  // 사용자가 직접 입력한 슬러그가 이미 존재하면 명시적으로 충돌 에러
  const existingPost = await prisma.post.findUnique({
    where: { slug: data.slug }
  });

  if (existingPost) {
    logger.warn('Slug already exists', { slug: data.slug });
    throw new ApiError(409, 'Slug already exists', { slug: data.slug });
  }

  const post = await prisma.post.create({
    data: {
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt,
      coverImage: data.coverImage,
      tags: Array.isArray(data.tags) ? data.tags.join(',') : (data.tags || ''),
      seoTitle: data.seoTitle || data.title,
      seoDescription: data.seoDescription || data.excerpt,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      originalLanguage: 'ko',
      status: data.publishedAt ? 'PUBLISHED' : 'DRAFT',
    },
  });

  // If post is published, trigger sitemap update
  if (post.status === 'PUBLISHED' && post.publishedAt) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/sitemap/update`, {
        method: 'POST',
      });
      logger.info('Sitemap update triggered', { postId: post.id });
    } catch (error) {
      logger.error('Failed to trigger sitemap update', error, { postId: post.id });
    }
  }

  // ISR 캐시 무효화: 발행 상태로 생성됐다면 공개 페이지에 즉시 반영
  if (post.status === 'PUBLISHED') {
    revalidatePath('/', 'layout')
  }

  logger.info('Post created successfully', { postId: post.id, slug: post.slug });
  return createSuccessResponse(post, new URL(request.url).pathname);
});
