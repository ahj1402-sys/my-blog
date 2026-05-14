export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'
import { generateUniqueFileName, validateImageFile } from '@/lib/upload-utils'
import { verifyAdminAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  // 🔒 인증 체크
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    )
  }

  try {
    // 환경 변수 체크
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN is not set')
      return NextResponse.json(
        { error: 'Storage service not configured. BLOB_READ_WRITE_TOKEN is missing.' },
        { status: 503 }
      )
    }

    const formData = await request.formData()
    const image = formData.get('image') as File
    const postId = formData.get('postId') as string
    const language = formData.get('language') as string // 'korean' or 'english'

    if (!image || !postId) {
      return NextResponse.json(
        { error: 'Image and postId are required' },
        { status: 400 }
      )
    }

    // Validate image file
    const validation = validateImageFile(image)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Generate unique filename
    const filename = generateUniqueFileName(image.name)

    console.log('Uploading file:', filename, 'Size:', image.size, 'Type:', image.type)

    // Convert File to Blob/ArrayBuffer for upload
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Vercel Blob
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: image.type || 'image/jpeg'
    })

    console.log('Upload successful:', blob.url)

    // Update post if not temp
    if (!postId.startsWith('temp-')) {
      // First check if the post exists
      const existingPost = await prisma.post.findUnique({
        where: { id: postId },
        select: { id: true }
      })

      if (!existingPost) {
        console.error('Post not found with id:', postId)
        return NextResponse.json(
          { error: `Post not found: ${postId}` },
          { status: 404 }
        )
      }

      // Update based on language tab
      if (language === 'english') {
        // Update English translation coverImage
        await prisma.postTranslation.updateMany({
          where: {
            postId: postId,
            locale: 'en'
          },
          data: { coverImage: blob.url }
        })
        console.log('Updated English translation coverImage for post:', postId)
      } else {
        // Update Korean original post coverImage (default)
        await prisma.post.update({
          where: { id: postId },
          data: { coverImage: blob.url }
        })
        console.log('Updated Korean post coverImage for post:', postId)
      }
    }

    return NextResponse.json({ 
      imageUrl: blob.url,
      postId 
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error details:', error.message)
      console.error('Error stack:', error.stack)
      
      // Check if it's a Vercel Blob error
      if (error.message.includes('BLOB_') || error.message.includes('token')) {
        return NextResponse.json(
          { error: 'Storage service error. Please ensure BLOB_READ_WRITE_TOKEN is set in environment variables.' },
          { status: 503 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to upload image: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}