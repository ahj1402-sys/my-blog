export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  // 환경 변수 확인
  const envCheck = {
    siteUrl: !!process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL !== 'https://example.com',
    tursoDb: !!process.env.TURSO_DATABASE_URL,
    dbToken: !!process.env.DATABASE_AUTH_TOKEN,
    geminiKey: !!process.env.GEMINI_API_KEY,
    adminPassword: !!process.env.ADMIN_PASSWORD,
  }

  // DB 연결 테스트
  let dbConnected = false
  try {
    await prisma.$queryRawUnsafe('SELECT 1')
    dbConnected = true
  } catch {
    dbConnected = false
  }

  return NextResponse.json({
    envCheck,
    dbConnected,
    allOk: Object.values(envCheck).every(Boolean) && dbConnected,
  })
}
