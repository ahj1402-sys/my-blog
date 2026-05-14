export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { verifyAdminAuth } from '@/lib/auth'
import { setSettingValue } from '@/lib/settings'

const MAX_SIZE = 1 * 1024 * 1024 // 1MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/x-icon', 'image/webp']

export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: 'BLOB_READ_WRITE_TOKEN is not configured' },
        { status: 503 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('favicon') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large (max 1MB)' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Allowed: PNG, JPEG, SVG, ICO, WebP` },
        { status: 400 }
      )
    }

    const ext = file.name.split('.').pop() || 'png'
    const filename = `favicon-${Date.now()}.${ext}`

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: file.type,
    })

    // Save URL to settings DB
    await setSettingValue('SITE_FAVICON_URL', blob.url)

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error('Favicon upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload favicon' },
      { status: 500 }
    )
  }
}
