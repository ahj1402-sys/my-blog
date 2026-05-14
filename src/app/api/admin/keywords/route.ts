export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const category = request.nextUrl.searchParams.get('category')

    const keywords = await prisma.keyword.findMany({
      where: category ? { category } : undefined,
      orderBy: [{ usageCount: 'desc' }, { text: 'asc' }],
    })

    return NextResponse.json({ keywords })
  } catch (error) {
    console.error('Error fetching keywords:', error)
    return NextResponse.json({ error: 'Failed to fetch keywords' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const contentType = request.headers.get('content-type') || ''

    let keywordTexts: string[] = []
    let category: string | undefined

    if (contentType.includes('multipart/form-data')) {
      // CSV file upload
      const formData = await request.formData()
      const file = formData.get('file') as File
      category = (formData.get('category') as string) || undefined

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      }

      const text = await file.text()
      // Handle CSV: split by newlines and commas, trim, deduplicate
      keywordTexts = text
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .split(/[\n,]/)
        .map(k => k.trim().replace(/^["']|["']$/g, ''))
        .filter(k => k.length > 0)
    } else {
      // JSON body
      const body = await request.json()
      keywordTexts = body.keywords || []
      category = body.category
    }

    if (keywordTexts.length === 0) {
      return NextResponse.json({ error: 'No keywords provided' }, { status: 400 })
    }

    // Deduplicate
    const unique = [...new Set(keywordTexts)]

    let created = 0
    for (const text of unique) {
      try {
        await prisma.keyword.create({
          data: { text, category },
        })
        created++
      } catch {
        // Unique constraint violation — skip duplicates
      }
    }

    return NextResponse.json({ created, total: unique.length })
  } catch (error) {
    console.error('Error creating keywords:', error)
    return NextResponse.json({ error: 'Failed to create keywords' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const ids: string[] = body.ids || []

    if (ids.length === 0) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 })
    }

    await prisma.keyword.deleteMany({
      where: { id: { in: ids } },
    })

    return NextResponse.json({ deleted: ids.length })
  } catch (error) {
    console.error('Error deleting keywords:', error)
    return NextResponse.json({ error: 'Failed to delete keywords' }, { status: 500 })
  }
}
