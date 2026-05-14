import { Prisma } from '@prisma/client'

// Prisma type aliases
type PostWhereInput = Prisma.PostWhereInput
type PostOrderByInput = Prisma.PostOrderByWithRelationInput

/**
 * Prisma 쿼리 헬퍼 함수
 */

export interface PaginationOptions {
  page: number
  limit: number
}

export function getPaginationParams(options: PaginationOptions) {
  const { page = 1, limit = 10 } = options
  const skip = (page - 1) * limit
  
  return {
    skip,
    take: limit,
  }
}

export function buildPostWhereClause(params: {
  search?: string
  tag?: string
  published?: boolean
}): PostWhereInput {
  const where: PostWhereInput = {}
  
  if (params.published !== undefined) {
    where.publishedAt = params.published ? { not: null } : null
  }
  
  if (params.search) {
    where.OR = [
      { title: { contains: params.search } },
      { content: { contains: params.search } },
      { excerpt: { contains: params.search } },
    ]
  }
  
  if (params.tag) {
    where.tags = { contains: params.tag }
  }
  
  return where
}

export function getPostOrderBy(sort?: string): PostOrderByInput {
  switch (sort) {
    case 'oldest':
      return { publishedAt: 'asc' }
    case 'views':
      return { views: 'desc' }
    case 'updated':
      return { updatedAt: 'desc' }
    default:
      return { publishedAt: 'desc' }
  }
}

export async function getPostWithRelated<T extends Prisma.PostSelect>(
  prisma: any, // Prisma client instance
  slug: string,
  select?: T
): Promise<Prisma.PostGetPayload<{ select: T }> | null> {
  return prisma.post.findUnique({
    where: { slug },
    select: select || undefined,
  })
}

export async function getPaginatedPosts<T extends Prisma.PostSelect>(
  prisma: any, // Prisma client instance
  options: {
    where?: PostWhereInput
    orderBy?: PostOrderByInput
    page?: number
    limit?: number
    select?: T
  }
): Promise<{
  posts: Prisma.PostGetPayload<{ select: T }>[]
  total: number
  page: number
  totalPages: number
}> {
  const { page = 1, limit = 10, where = {}, orderBy, select } = options
  const { skip, take } = getPaginationParams({ page, limit })
  
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy,
      skip,
      take,
      select: select || undefined,
    }),
    prisma.post.count({ where }),
  ])
  
  return {
    posts,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}

export function sanitizeJsonField<T>(json: any, defaultValue: T): T {
  if (!json) return defaultValue
  
  try {
    if (typeof json === 'string') {
      return JSON.parse(json)
    }
    return json as T
  } catch {
    return defaultValue
  }
}

export function prepareTagsForPrisma(tags: string[] | string): string[] {
  if (Array.isArray(tags)) {
    return tags.filter(Boolean)
  }
  
  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean)
  }
  
  return []
}