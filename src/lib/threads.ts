/**
 * Threads API client
 * Read-only access to Threads posts via graph.threads.net
 */

import { getSettingValue } from '@/lib/settings'
import { prisma } from '@/lib/prisma'
import type { ThreadsPost, ThreadsAccount, ThreadsPostsResponse } from '@/types/threads'

const THREADS_API_BASE = 'https://graph.threads.net/v1.0'
const THREADS_FIELDS = 'id,text,media_type,media_url,permalink,username,timestamp'

/**
 * Get Threads access token for a given account suffix
 * Checks DB first, then falls back to env
 */
export async function getThreadsToken(accountSuffix: string): Promise<string | undefined> {
  const key = `THREADS_TOKEN_${accountSuffix}`
  return getSettingValue(key)
}

/**
 * Discover configured Threads accounts from env + DB
 * Looks for THREADS_TOKEN_* patterns
 */
export async function getConfiguredAccounts(): Promise<ThreadsAccount[]> {
  const accounts: ThreadsAccount[] = []

  // Check DB for THREADS_TOKEN_* settings
  try {
    const dbSettings = await prisma.setting.findMany({
      where: {
        key: { startsWith: 'THREADS_TOKEN_' },
      },
    })
    for (const setting of dbSettings) {
      const suffix = setting.key.replace('THREADS_TOKEN_', '')
      accounts.push({
        name: suffix,
        displayName: formatAccountName(suffix),
        tokenKey: setting.key,
        isConfigured: !!setting.value,
      })
    }
  } catch (error) {
    console.warn('[threads] DB lookup for accounts failed', error)
  }

  // Check env vars for any not already found in DB
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith('THREADS_TOKEN_') && value) {
      const suffix = key.replace('THREADS_TOKEN_', '')
      if (!accounts.find(a => a.name === suffix)) {
        accounts.push({
          name: suffix,
          displayName: formatAccountName(suffix),
          tokenKey: key,
          isConfigured: true,
        })
      }
    }
  }

  return accounts
}

function formatAccountName(suffix: string): string {
  return suffix
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export interface GetThreadsPostsOptions {
  limit?: number
  after?: string
  since?: string
  until?: string
}

/**
 * Fetch Threads posts for a given account
 */
export async function getThreadsPosts(
  accountSuffix: string,
  options: GetThreadsPostsOptions = {}
): Promise<{ posts: ThreadsPost[]; nextCursor?: string }> {
  const token = await getThreadsToken(accountSuffix)
  if (!token) {
    throw new Error(`Threads token not configured for account: ${accountSuffix}`)
  }

  const { limit = 25, after, since, until } = options

  const params = new URLSearchParams({
    fields: THREADS_FIELDS,
    limit: String(limit),
    access_token: token,
  })

  if (after) params.set('after', after)
  if (since) params.set('since', since)
  if (until) params.set('until', until)

  const url = `${THREADS_API_BASE}/me/threads?${params.toString()}`

  const response = await fetch(url)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      `Threads API error (${response.status}): ${errorData?.error?.message || response.statusText}`
    )
  }

  const data: ThreadsPostsResponse = await response.json()

  return {
    posts: data.data || [],
    nextCursor: data.paging?.cursors?.after,
  }
}

/**
 * Fetch a single Threads post by ID
 */
export async function getThreadsPostById(
  postId: string,
  accountSuffix: string
): Promise<ThreadsPost | null> {
  const token = await getThreadsToken(accountSuffix)
  if (!token) {
    throw new Error(`Threads token not configured for account: ${accountSuffix}`)
  }

  const params = new URLSearchParams({
    fields: THREADS_FIELDS,
    access_token: token,
  })

  const url = `${THREADS_API_BASE}/${postId}?${params.toString()}`

  const response = await fetch(url)
  if (!response.ok) {
    if (response.status === 404) return null
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      `Threads API error (${response.status}): ${errorData?.error?.message || response.statusText}`
    )
  }

  return response.json()
}

/**
 * Refresh a long-lived Threads access token
 * Long-lived tokens can be refreshed if they are at least 24 hours old and not expired
 */
export async function refreshThreadsToken(currentToken: string): Promise<{
  access_token: string
  token_type: string
  expires_in: number
}> {
  const params = new URLSearchParams({
    grant_type: 'th_refresh_token',
    access_token: currentToken,
  })

  const url = `${THREADS_API_BASE}/refresh_access_token?${params.toString()}`

  const response = await fetch(url)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      `Token refresh failed (${response.status}): ${errorData?.error?.message || response.statusText}`
    )
  }

  return response.json()
}

/**
 * Extract hashtags from text (supports Korean and English)
 */
export function extractHashtags(text: string): string[] {
  const matches = text.match(/#[a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ_]+/g)
  if (!matches) return []
  return [...new Set(matches.map(tag => tag.slice(1)))]
}

/**
 * Extract an excerpt from Threads text
 */
export function extractExcerpt(text: string, maxLength: number = 200): string {
  // Remove hashtags for cleaner excerpt
  const cleaned = text.replace(/#[a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ_]+/g, '').trim()
  if (cleaned.length <= maxLength) return cleaned
  return cleaned.substring(0, maxLength - 3) + '...'
}
