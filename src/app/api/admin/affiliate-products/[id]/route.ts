export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withErrorHandler, logger, ApiError, createSuccessResponse, validateRequest } from '@/lib/error-handler'
import { verifyAdminAuth } from '@/lib/auth'
import { z } from 'zod'

const affiliateProductSchema = z.object({
  name: z.string().min(1).optional(),
  coupangUrl: z.string().url().optional(),
  category: z.string().min(1).optional(),
  price: z.number().int().positive().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  keywords: z.string().optional(),
  description: z.string().optional().nullable()
})

/**
 * PUT /api/admin/affiliate-products/[id]
 * Update affiliate product
 */
async function updateProductHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const validatedData = await validateRequest(request, affiliateProductSchema)

  logger.info('Updating affiliate product', { productId: id })

  // Check if product exists
  const existingProduct = await prisma.affiliateProduct.findUnique({
    where: { id }
  })

  if (!existingProduct) {
    throw new ApiError(404, 'Product not found', { productId: id })
  }

  // Update product
  const product = await prisma.affiliateProduct.update({
    where: { id },
    data: {
      ...(validatedData.name && { name: validatedData.name }),
      ...(validatedData.coupangUrl && { coupangUrl: validatedData.coupangUrl }),
      ...(validatedData.category && { category: validatedData.category }),
      ...(validatedData.price !== undefined && { price: validatedData.price }),
      ...(validatedData.imageUrl !== undefined && { imageUrl: validatedData.imageUrl }),
      ...(validatedData.keywords !== undefined && { keywords: validatedData.keywords }),
      ...(validatedData.description !== undefined && { description: validatedData.description }),
      updatedAt: new Date()
    }
  })

  logger.info('Affiliate product updated', { productId: id })

  return createSuccessResponse(
    { product },
    new URL(request.url).pathname
  )
}

/**
 * DELETE /api/admin/affiliate-products/[id]
 * Delete affiliate product
 */
async function deleteProductHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  logger.info('Deleting affiliate product', { productId: id })

  // Check if product exists
  const existingProduct = await prisma.affiliateProduct.findUnique({
    where: { id }
  })

  if (!existingProduct) {
    throw new ApiError(404, 'Product not found', { productId: id })
  }

  // Delete product (will cascade delete PostAffiliateProduct entries)
  await prisma.affiliateProduct.delete({
    where: { id }
  })

  logger.info('Affiliate product deleted', { productId: id })

  return createSuccessResponse(
    { success: true, message: 'Product deleted successfully' },
    new URL(request.url).pathname
  )
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // 🔒 인증 체크
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    )
  }

  return withErrorHandler(updateProductHandler)(request, context)
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // 🔒 인증 체크
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    )
  }

  return withErrorHandler(deleteProductHandler)(request, context)
}
