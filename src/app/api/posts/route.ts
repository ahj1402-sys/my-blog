export const dynamic = "force-dynamic"
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withErrorHandler, logger, createSuccessResponse, ApiError, validateRequest } from '@/lib/error-handler'
import { createPostSchema } from '@/lib/validations'

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

  // Auto-generate slug from title if not provided
  if (!data.slug) {
    const baseSlug = data.title
      .toLowerCase()
      .replace(/[^\w\s\uAC00-\uD7A3-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() || `post-${Date.now()}`

    // Ensure uniqueness by appending timestamp if needed
    const existing = await prisma.post.findUnique({ where: { slug: baseSlug } })
    data.slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug
  }

  logger.info('Creating post', {
    title: data.title,
    slug: data.slug,
    tags: data.tags,
    publishedAt: data.publishedAt
  });

  // Check if slug already exists
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

  logger.info('Post created successfully', { postId: post.id, slug: post.slug });
  return createSuccessResponse(post, new URL(request.url).pathname);
});
