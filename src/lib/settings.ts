/**
 * DB-backed settings with env fallback
 * Allows admin to configure API keys via UI instead of Vercel env vars
 */

import { prisma } from '@/lib/prisma'

const ALLOWED_KEYS = [
  'YOUTUBE_API_KEY',
  'YOUTUBE_CHANNEL_ID',
  'GEMINI_API_KEY',
  'CRON_SECRET',
  'REDEPLOY_WEBHOOK_URL',
  'THREADS_DEFAULT_ACCOUNT',
  'SITE_FAVICON_URL',
  'SITE_LOGO_URL',
  'SITE_META_DESCRIPTION',
  'UNSPLASH_ACCESS_KEY',
] as const

export type SettingKey = (typeof ALLOWED_KEYS)[number]

const DYNAMIC_KEY_PATTERNS = [/^THREADS_TOKEN_/] as const

function isAllowedKey(key: string): key is SettingKey {
  if ((ALLOWED_KEYS as readonly string[]).includes(key)) return true
  return DYNAMIC_KEY_PATTERNS.some(pattern => pattern.test(key))
}

// In-memory cache with 60s TTL
const cache = new Map<string, { value: string; expiresAt: number }>()
const CACHE_TTL_MS = 60_000

function getCached(key: string): string | undefined {
  const entry = cache.get(key)
  if (!entry) return undefined
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return undefined
  }
  return entry.value
}

function setCache(key: string, value: string): void {
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS })
}

export function invalidateCache(key?: string): void {
  if (key) {
    cache.delete(key)
  } else {
    cache.clear()
  }
}

/**
 * Get a setting value: DB first, then process.env fallback
 */
export async function getSettingValue(key: string): Promise<string | undefined> {
  if (!isAllowedKey(key)) return undefined

  // Check cache first
  const cached = getCached(key)
  if (cached !== undefined) return cached

  try {
    const row = await prisma.setting.findUnique({ where: { key } })
    if (row?.value) {
      setCache(key, row.value)
      return row.value
    }
  } catch (error) {
    console.warn(`[settings] DB lookup failed for ${key}, falling back to env`, error)
  }

  // Fallback to env
  const envValue = process.env[key]
  if (envValue) {
    setCache(key, envValue)
  }
  return envValue
}

/**
 * Save a setting value to DB (upsert)
 */
export async function setSettingValue(key: string, value: string): Promise<void> {
  if (!isAllowedKey(key)) {
    throw new Error(`Key "${key}" is not in the allowed settings list`)
  }

  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  })

  // Invalidate cache for this key
  invalidateCache(key)
}

type SettingSource = 'db' | 'env' | 'none'

export interface SettingInfo {
  value: string | undefined
  source: SettingSource
}

/**
 * Get multiple settings at once with source info
 */
export async function getAllSettings(
  keys: readonly string[]
): Promise<Record<string, SettingInfo>> {
  const result: Record<string, SettingInfo> = {}

  // Batch fetch from DB
  let dbRows: { key: string; value: string }[] = []
  try {
    dbRows = await prisma.setting.findMany({
      where: { key: { in: keys as string[] } },
    })
  } catch (error) {
    console.warn('[settings] DB batch lookup failed, using env only', error)
  }

  const dbMap = new Map(dbRows.map((r) => [r.key, r.value]))

  for (const key of keys) {
    const dbValue = dbMap.get(key)
    if (dbValue) {
      result[key] = { value: dbValue, source: 'db' }
      continue
    }

    const envValue = process.env[key]
    if (envValue) {
      result[key] = { value: envValue, source: 'env' }
      continue
    }

    result[key] = { value: undefined, source: 'none' }
  }

  return result
}

/**
 * Mask a sensitive value for display
 */
export function maskValue(value: string): string {
  if (value.length <= 8) return '••••••••'
  return value.slice(0, 4) + '••••' + value.slice(-4)
}

export { ALLOWED_KEYS }
