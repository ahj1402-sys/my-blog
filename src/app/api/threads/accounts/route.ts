export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getConfiguredAccounts, refreshThreadsToken } from '@/lib/threads'
import { setSettingValue, maskValue } from '@/lib/settings'

/**
 * GET /api/threads/accounts
 * List all configured Threads accounts
 */
export async function GET() {
  try {
    const accounts = await getConfiguredAccounts()
    return NextResponse.json({ accounts })
  } catch (error) {
    console.error('Error fetching Threads accounts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/threads/accounts
 * Save or refresh a Threads token
 *
 * Body: { action: 'save' | 'refresh', accountSuffix: string, token?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, accountSuffix, token } = body

    if (!accountSuffix) {
      return NextResponse.json(
        { error: 'accountSuffix is required' },
        { status: 400 }
      )
    }

    const tokenKey = `THREADS_TOKEN_${accountSuffix}`

    if (action === 'save') {
      if (!token) {
        return NextResponse.json(
          { error: 'token is required for save action' },
          { status: 400 }
        )
      }

      await setSettingValue(tokenKey, token)

      return NextResponse.json({
        message: `Token saved for ${accountSuffix}`,
        masked: maskValue(token),
      })
    }

    if (action === 'refresh') {
      // Get current token from DB/env
      const { getSettingValue: getSetting } = await import('@/lib/settings')
      const currentToken = await getSetting(tokenKey)

      if (!currentToken) {
        return NextResponse.json(
          { error: `No existing token found for ${accountSuffix}` },
          { status: 400 }
        )
      }

      const refreshed = await refreshThreadsToken(currentToken)

      // Save the new token
      await setSettingValue(tokenKey, refreshed.access_token)

      return NextResponse.json({
        message: `Token refreshed for ${accountSuffix}`,
        masked: maskValue(refreshed.access_token),
        expiresIn: refreshed.expires_in,
      })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "save" or "refresh"' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error managing Threads account:', error)
    const message =
      error instanceof Error ? error.message : 'Failed to manage account'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
