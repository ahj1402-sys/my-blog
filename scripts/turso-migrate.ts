/**
 * Turso 자체-치유 마이그레이션 스크립트
 *
 * 왜 필요한가?
 * - Prisma datasource가 sqlite + DATABASE_URL=file:./dev.db로 설정돼 있어서
 *   `prisma db push`는 로컬 SQLite 파일에만 적용된다.
 * - 런타임은 @prisma/adapter-libsql로 Turso에 접속하지만, 스키마 동기화는 별개.
 * - 그래서 빌드 시 직접 Turso에 connect해서 누락된 컬럼/인덱스를 ALTER로 추가한다.
 *
 * 동작:
 * - PRAGMA table_info()로 컬럼 존재 여부 확인 후 없을 때만 ALTER TABLE
 * - 인덱스는 CREATE INDEX IF NOT EXISTS (SQLite 기본 지원)
 * - 모든 작업이 멱등(여러 번 실행해도 안전)
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
  /** 컬럼 추가 대상 테이블 */
  table: string
  /** 추가할 컬럼명 */
  column: string
  /** ALTER TABLE에 사용할 SQL 조각 (예: 'BOOLEAN NOT NULL DEFAULT false') */
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
