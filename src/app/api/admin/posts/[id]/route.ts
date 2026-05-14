export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminAuth } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 🔒 인증 체크
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    )
  }

  try {
    const { id } = await params
    const data = await request.json()
    
    // 부분 업데이트만 수행
    const updateData: any = {}
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage
    if (data.title !== undefined) updateData.title = data.title
    if (data.content !== undefined) updateData.content = data.content
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt
    if (data.tags !== undefined) updateData.tags = data.tags
    if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle
    if (data.seoDescription !== undefined) updateData.seoDescription = data.seoDescription
    if (data.publishedAt !== undefined) {
      updateData.publishedAt = data.publishedAt ? new Date(data.publishedAt) : null
      // If publishedAt is set, automatically set status to PUBLISHED
      updateData.status = data.publishedAt ? 'PUBLISHED' : 'DRAFT'
    }
    
    const post = await prisma.post.update({
      where: { id },
      data: updateData,
    })
    
    return NextResponse.json(post)
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 🔒 인증 체크
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    )
  }

  try {
    const { id } = await params
    
    // Delete the post
    await prisma.post.delete({
      where: { id },
    })
    
    // Trigger sitemap update after deletion
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/sitemap/update`, {
        method: 'POST',
      })
    } catch (error) {
      console.error('Failed to trigger sitemap update:', error)
    }
    
    return NextResponse.json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}