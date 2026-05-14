/**
 * Turso 자체-치유 마이그레이션 스크립트 (v2 - 부트스트랩 지원)
 *
 * 왜 필요한가?
 * - Prisma datasource가 sqlite + DATABASE_URL=file:./dev.db로 설정돼 있어서
 *   `prisma db push`는 로컬 SQLite 파일에만 적용된다.
 * - 런타임은 @prisma/adapter-libsql로 Turso에 접속하지만, 스키마 동기화는 별개.
 * - 그래서 빌드 시 직접 Turso에 connect해서 누락된 스키마를 보강한다.
 *
 * 동작:
 * - Post 테이블이 없으면 기본 스키마 전체를 부트스트랩(CREATE TABLE) → 첫 배포 지원.
 * - 기존 테이블에 누락된 컬럼이 있으면 ALTER TABLE로 추가 (기존 사용자용).
 * - 인덱스는 CREATE INDEX IF NOT EXISTS (멱등).
 * - 모든 작업이 멱등 — 여러 번 실행해도 안전.
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

// 빈 DB일 때 기본 스키마 생성 (prisma/schema.prisma 기준)
const BOOTSTRAP_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS "Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "coverImage" TEXT,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "author" TEXT,
    "tags" TEXT NOT NULL DEFAULT '',
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "scheduledAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "socialLinks" TEXT,
    "youtubeVideoId" TEXT,
    "threadsPostId" TEXT,
    "originalLanguage" TEXT NOT NULL DEFAULT 'ko',
    "globalRank" INTEGER,
    "isCornerstone" BOOLEAN NOT NULL DEFAULT false,
    "cornerstoneId" TEXT
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Post_slug_key" ON "Post"("slug")`,
  `CREATE INDEX IF NOT EXISTS "Post_slug_idx" ON "Post"("slug")`,
  `CREATE INDEX IF NOT EXISTS "Post_publishedAt_idx" ON "Post"("publishedAt")`,
  `CREATE INDEX IF NOT EXISTS "Post_status_scheduledAt_idx" ON "Post"("status","scheduledAt")`,
  `CREATE INDEX IF NOT EXISTS "Post_globalRank_idx" ON "Post"("globalRank")`,
  `CREATE INDEX IF NOT EXISTS "Post_threadsPostId_idx" ON "Post"("threadsPostId")`,
  `CREATE INDEX IF NOT EXISTS "Post_isCornerstone_idx" ON "Post"("isCornerstone")`,
  `CREATE INDEX IF NOT EXISTS "Post_cornerstoneId_idx" ON "Post"("cornerstoneId")`,

  `CREATE TABLE IF NOT EXISTS "Admin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Admin_email_key" ON "Admin"("email")`,

  `CREATE TABLE IF NOT EXISTS "Knowledge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "source" TEXT,
    "embedding" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT,
    "content" TEXT NOT NULL,
    "aiResponse" TEXT,
    "aiGeneratedAt" DATETIME,
    "agreeWithUser" INTEGER NOT NULL DEFAULT 0,
    "agreeWithAI" INTEGER NOT NULL DEFAULT 0,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parentId" TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS "Comment_postId_idx" ON "Comment"("postId")`,
  `CREATE INDEX IF NOT EXISTS "Comment_createdAt_idx" ON "Comment"("createdAt")`,
  `CREATE INDEX IF NOT EXISTS "Comment_isApproved_isDeleted_idx" ON "Comment"("isApproved","isDeleted")`,

  `CREATE TABLE IF NOT EXISTS "PostTranslation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "coverImage" TEXT
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "PostTranslation_postId_locale_key" ON "PostTranslation"("postId","locale")`,
  `CREATE INDEX IF NOT EXISTS "PostTranslation_postId_idx" ON "PostTranslation"("postId")`,
  `CREATE INDEX IF NOT EXISTS "PostTranslation_locale_idx" ON "PostTranslation"("locale")`,

  `CREATE TABLE IF NOT EXISTS "Setting" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS "Keyword" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "category" TEXT,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Keyword_text_key" ON "Keyword"("text")`,
  `CREATE INDEX IF NOT EXISTS "Keyword_category_idx" ON "Keyword"("category")`,
  `CREATE INDEX IF NOT EXISTS "Keyword_usageCount_idx" ON "Keyword"("usageCount")`,

  `CREATE TABLE IF NOT EXISTS "AffiliateProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "coupangUrl" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" INTEGER,
    "imageUrl" TEXT,
    "keywords" TEXT NOT NULL DEFAULT '',
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS "AffiliateProduct_category_idx" ON "AffiliateProduct"("category")`,

  `CREATE TABLE IF NOT EXISTS "PostAffiliateProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "affiliateProductId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "PostAffiliateProduct_postId_affiliateProductId_key" ON "PostAffiliateProduct"("postId","affiliateProductId")`,
  `CREATE INDEX IF NOT EXISTS "PostAffiliateProduct_postId_idx" ON "PostAffiliateProduct"("postId")`,
  `CREATE INDEX IF NOT EXISTS "PostAffiliateProduct_affiliateProductId_idx" ON "PostAffiliateProduct"("affiliateProductId")`,
]

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

  // 1단계: Post 테이블 없으면 기본 스키마 부트스트랩
  const baseCheck = await client.execute(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='Post'`,
  )
  if (baseCheck.rows.length === 0) {
    console.log('  [부트스트랩] 빈 DB 감지 — 기본 스키마 생성 중...')
    for (const sql of BOOTSTRAP_STATEMENTS) {
      await client.execute(sql)
    }
    console.log(`  [완료] ${BOOTSTRAP_STATEMENTS.length}개 statement 실행됨`)
  } else {
    console.log('  [확인] 기본 테이블 존재 — 컬럼 마이그레이션 검사')
  }

  // 2단계: 누락 컬럼 ALTER (기존 사용자용)
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

  // 3단계: 인덱스 보강 (이미 있으면 무시됨)
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
