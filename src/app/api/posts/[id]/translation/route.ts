export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    
    const translation = await prisma.postTranslation.create({
      data: {
        postId: id,
        locale: data.locale,
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        coverImage: data.coverImage,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
      }
    })
    
    return NextResponse.json(translation)
  } catch (error) {
    console.error('Error creating translation:', error)
    return NextResponse.json({ error: 'Failed to create translation' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    // Build update data object, only including provided fields
    const updateData: any = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.content !== undefined) updateData.content = data.content
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage
    if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle
    if (data.seoDescription !== undefined) updateData.seoDescription = data.seoDescription

    const translation = await prisma.postTranslation.update({
      where: {
        postId_locale: {
          postId: id,
          locale: data.locale,
        }
      },
      data: updateData
    })

    return NextResponse.json(translation)
  } catch (error) {
    console.error('Error updating translation:', error)
    return NextResponse.json({ error: 'Failed to update translation' }, { status: 500 })
  }
}