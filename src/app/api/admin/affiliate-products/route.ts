import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@libsql/client'
import { withErrorHandler, logger, createSuccessResponse, validateRequest } from '@/lib/error-handler'
import { verifyAdminAuth } from '@/lib/auth'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// Direct Turso client to bypass Prisma INTEGER/REAL conversion issues
let _turso: ReturnType<typeof createClient> | null = null
function getTurso() {
  if (!_turso) {
    _turso = createClient({
      url: process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "",
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  }
  return _turso
}

const affiliateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  coupangUrl: z.string().url('Valid Coupang URL is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().int().positive().optional().nullable(),
  imageUrl: z.string().url().optional().or(z.literal('')).nullable(),
  keywords: z.string().optional().default(''),
  description: z.string().optional().nullable()
})

/**
 * GET /api/admin/affiliate-products
 * Fetch all affiliate products
 * Using raw Turso SQL to bypass Prisma INTEGER/REAL conversion issues
 */
async function getProductsHandler(request: NextRequest) {
  logger.info('Fetching all affiliate products')

  // Use raw SQL query to avoid Prisma type conversion errors
  const result = await getTurso().execute({
    sql: `
      SELECT
        ap.*,
        COUNT(pap."postId") as post_count
      FROM "AffiliateProduct" ap
      LEFT JOIN "PostAffiliateProduct" pap ON ap.id = pap."affiliateProductId"
      GROUP BY ap.id
      ORDER BY ap.createdAt DESC
    `
  })

  // Transform rows to match the expected format
  const products = result.rows.map(row => {
    // Handle both integer timestamps and ISO string dates
    let createdAt: string
    let updatedAt: string

    try {
      // Try to parse as integer timestamp
      const createdNum = Number(row.createdAt)
      createdAt = isNaN(createdNum) ? String(row.createdAt) : new Date(createdNum).toISOString()
    } catch {
      createdAt = new Date().toISOString()
    }

    try {
      const updatedNum = Number(row.updatedAt)
      updatedAt = isNaN(updatedNum) ? String(row.updatedAt) : new Date(updatedNum).toISOString()
    } catch {
      updatedAt = new Date().toISOString()
    }

    return {
      id: row.id,
      name: row.name,
      coupangUrl: row.coupangUrl,
      category: row.category,
      price: row.price,
      imageUrl: row.imageUrl,
      keywords: row.keywords,
      description: row.description,
      createdAt,
      updatedAt,
      _count: {
        posts: Number(row.post_count || 0)
      }
    }
  })

  logger.info('Affiliate products fetched', { count: products.length })

  return createSuccessResponse(
    { products },
    new URL(request.url).pathname
  )
}

/**
 * POST /api/admin/affiliate-products
 * Create new affiliate product
 */
async function createProductHandler(request: NextRequest) {
  const validatedData = await validateRequest(request, affiliateProductSchema)

  logger.info('Creating new affiliate product', { name: validatedData.name })

  // Use raw SQL for Turso to avoid DateTime conversion issues
  const now = Date.now()
  const id = `ap_${now}_${Math.random().toString(36).substr(2, 9)}`

  await getTurso().execute({
    sql: `
      INSERT INTO "AffiliateProduct"
      (id, name, coupangUrl, category, price, imageUrl, keywords, description, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      id,
      validatedData.name,
      validatedData.coupangUrl,
      validatedData.category,
      validatedData.price ?? null,
      validatedData.imageUrl ?? null,
      validatedData.keywords,
      validatedData.description ?? null,
      now,
      now
    ]
  })

  logger.info('Affiliate product created', { productId: id })

  return createSuccessResponse(
    { product: { id, ...validatedData } },
    new URL(request.url).pathname
  )
}

export async function GET(request: NextRequest) {
  // 🔒 인증 체크
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    )
  }

  return withErrorHandler(getProductsHandler)(request)
}

export async function POST(request: NextRequest) {
  // 🔒 인증 체크
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    )
  }

  return withErrorHandler(createProductHandler)(request)
}
