export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth'
import {
  ALLOWED_KEYS,
  getAllSettings,
  setSettingValue,
  maskValue,
} from '@/lib/settings'

/**
 * GET /api/admin/settings
 * Returns all setting values (masked) with configured status
 */
export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const allSettings = await getAllSettings(ALLOWED_KEYS)

  const settings: Record<
    string,
    { masked?: string; isConfigured: boolean; source: string }
  > = {}

  for (const key of ALLOWED_KEYS) {
    const info = allSettings[key]
    if (info.value) {
      settings[key] = {
        masked: maskValue(info.value),
        isConfigured: true,
        source: info.source,
      }
    } else {
      settings[key] = {
        isConfigured: false,
        source: 'none',
      }
    }
  }

  return NextResponse.json({ settings })
}

/**
 * POST /api/admin/settings
 * Save setting values (only non-empty, changed values)
 */
export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, string>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const updated: string[] = []
  const errors: string[] = []

  for (const [key, value] of Object.entries(body)) {
    // Skip empty values
    if (!value || typeof value !== 'string' || value.trim() === '') continue

    // Validate key is allowed
    if (!(ALLOWED_KEYS as readonly string[]).includes(key)) {
      errors.push(`Key "${key}" is not allowed`)
      continue
    }

    try {
      await setSettingValue(key, value.trim())
      updated.push(key)
    } catch (error) {
      errors.push(
        `Failed to save "${key}": ${error instanceof Error ? error.message : 'unknown error'}`
      )
    }
  }

  return NextResponse.json({
    updated,
    errors: errors.length > 0 ? errors : undefined,
    message: `${updated.length} setting(s) saved`,
  })
}
