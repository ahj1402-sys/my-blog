/**
 * Turso 자체-치유 마이그레이션 스크립트
 *
 * 동작:
 * - 기본 Post 테이블이 없으면 첫 배포로 간주하고 건너뛴다 (배포 후 /admin/setup 에서 생성).
 * - PRAGMA table_info()로 컬럼 존재 여부 확인 후 없을 때만 ALTER TABLE.
 * - 인덱스는 CREATE INDEX IF NOT EXISTS (SQLite 기본 지원).
 * - 모든 작업이 멱등(여러 번 실행해도 안전).
 */

try {
  require('dotenv').config()
} catch {
  // Vercel 환경에서는 dotenv 불필요
}

interface ColumnInfo {
  name: string
}

interface MigrationStep {
  table: string
  column: string
  definition: string
}

const COLUMN_MIGRATIONS: MigrationStep[] = [
  { table: 'Post', column: 'isCornerstone', definition: 'BOOLEAN NOT NULL DEFAULT false' },
  { table: 'Post', column: 'cornerstoneId', definition: 'TEXT' },
]

const INDEX_MIGRATIONS: { name: string; sql: string }[] = [
  {
    name: 'Post_isCornerstone_idx',
    sql: 'CREATE INDEX IF NOT EXISTS "Post_isCornerstone_idx" ON "Post"("isCornerstone")',
  },
  {
    name: 'Post_cornerstoneId_idx',
    sql: 'CREATE INDEX IF NOT EXISTS "Post_cornerstoneId_idx" ON "Post"("cornerstoneId")',
  },
]

async function main() {
  const url = (process.env.TURSO_DATABASE_URL || '').trim()
  const authToken = (process.env.DATABASE_AUTH_TOKEN || '').trim()

  if (!url) {
    console.log('[Turso Migrate] TURSO_DATABASE_URL 없음 — 마이그레이션 건너뜀')
    return
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require('@libsql/client')
  const client = createClient({ url, authToken })

  console.log('\n[Turso Migrate] Turso 스키마 동기화 시작...')

  // 기본 Post 테이블이 없으면 첫 배포 — 컬럼 마이그레이션 건너뛰기
  const baseCheck = await client.execute(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='Post'`,
  )
  if (baseCheck.rows.length === 0) {
    console.log('  [정보] 기본 테이블이 아직 없습니다 (첫 배포).')
    console.log('  [안내] 배포 완료 후 /admin/setup 페이지에서 DB를 초기화하세요.')
    client.close()
    console.log('[Turso Migrate] 완료 (건너뜀)\n')
    return
  }

  for (const { table, column, definition } of COLUMN_MIGRATIONS) {
    const result = await client.execute(`PRAGMA table_info("${table}")`)
    const exists = result.rows.some((row: ColumnInfo) => row.name === column)

    if (exists) {
      console.log(`  [건너뜀] ${table}.${column} (이미 존재)`)
      continue
    }

    const sql = `ALTER TABLE "${table}" ADD COLUMN "${column}" ${definition}`
    await client.execute(sql)
    console.log(`  [추가] ${table}.${column}`)
  }

  for (const { name, sql } of INDEX_MIGRATIONS) {
    await client.execute(sql)
    console.log(`  [확인] 인덱스 ${name}`)
  }

  console.log('[Turso Migrate] 완료\n')
  client.close()
}

main().catch((err) => {
  console.error('[Turso Migrate] 실패:', err)
  process.exit(1)
})
