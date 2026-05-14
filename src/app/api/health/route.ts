export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  // 환경 변수 상태 확인
  const envStatus = {
    siteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
    tursoDb: !!process.env.TURSO_DATABASE_URL,
    dbToken: !!process.env.DATABASE_AUTH_TOKEN,
    geminiKey: !!process.env.GEMINI_API_KEY,
    adminPassword: !!process.env.ADMIN_PASSWORD,
  }

  const envOk = Object.values(envStatus).every(Boolean)

  // DB 연결 테스트
  let dbOk = false
  let dbMessage = ''
  try {
    await prisma.$queryRawUnsafe('SELECT 1')
    dbOk = true
    dbMessage = '데이터베이스 연결 정상'
  } catch (error) {
    dbMessage = `데이터베이스 연결 실패: ${error instanceof Error ? error.message : String(error)}`
  }

  const allOk = envOk && dbOk

  return NextResponse.json({
    status: allOk ? 'ok' : 'warning',
    message: allOk
      ? '모든 시스템 정상 작동 중'
      : '일부 설정을 확인해주세요',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    checks: {
      env: {
        ok: envOk,
        details: envStatus,
      },
      database: {
        ok: dbOk,
        message: dbMessage,
      },
    },
  })
}
