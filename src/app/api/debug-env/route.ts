export const dynamic = "force-dynamic"
import { NextResponse } from 'next/server'
import { env } from '@/lib/env'

export async function GET() {
  return NextResponse.json({
    hasCronSecret: !!env.CRON_SECRET,
    cronSecretLength: env.CRON_SECRET?.length || 0,
    cronSecretFirst3: env.CRON_SECRET?.substring(0, 3) || 'N/A',
    nodeEnv: env.NODE_ENV,
    timestamp: new Date().toISOString()
  })
}
