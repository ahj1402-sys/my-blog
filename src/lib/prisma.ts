import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  _prisma: PrismaClient | undefined
}

// Lazy Prisma client — never connects during build
// Only creates the client on first actual database query
function getPrismaClient(): PrismaClient {
  if (globalForPrisma._prisma) return globalForPrisma._prisma

  // TURSO_DATABASE_URL holds the actual libsql:// URL for the adapter.
  // DATABASE_URL must be file:// for Prisma schema validation (provider="sqlite").
  const tursoUrl = (process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || '').trim()
  if (!tursoUrl) {
    console.warn('[prisma] No database URL set — database queries will fail')
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaLibSQL } = require('@prisma/adapter-libsql')
  const adapter = new PrismaLibSQL({
    url: tursoUrl || 'file:./dev.db',
    authToken: (process.env.DATABASE_AUTH_TOKEN || '').trim(),
  })

  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma._prisma = client
  }

  return client
}

// Export as a Proxy so the client is only created when a property is accessed
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient()
    const value = (client as unknown as Record<string | symbol, unknown>)[prop]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
})
