export const dynamic = "force-dynamic"
import { NextResponse } from 'next/server'

export async function GET() {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const dbUrl = process.env.DATABASE_URL
  const authToken = process.env.DATABASE_AUTH_TOKEN

  // Try DB connection
  let dbStatus = 'not tested'
  let dbError = null
  let postCount = 0
  try {
    const { prisma } = await import('@/lib/prisma')
    const count = await prisma.post.count()
    postCount = count
    dbStatus = 'connected'
  } catch (e: unknown) {
    dbStatus = 'error'
    dbError = e instanceof Error ? e.message : String(e)
  }

  return NextResponse.json({
    TURSO_DATABASE_URL: tursoUrl ? `len=${tursoUrl.length}, last3=[${tursoUrl.charCodeAt(tursoUrl.length-3)},${tursoUrl.charCodeAt(tursoUrl.length-2)},${tursoUrl.charCodeAt(tursoUrl.length-1)}], trimmed=${tursoUrl.trim()}` : 'Not set',
    DATABASE_URL: dbUrl ? `len=${dbUrl.length}, trimmed=${dbUrl.trim()}` : 'Not set',
    DATABASE_AUTH_TOKEN: authToken ? 'Set' : 'Not set',
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    dbStatus,
    dbError,
    postCount,
  })
}