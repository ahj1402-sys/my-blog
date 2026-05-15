export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { prisma } from '@/lib/prisma'

const KNOWLEDGE_DIR = path.join(process.cwd(), 'knowledge')
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const UPLOAD_EXTENSIONS = ['.txt', '.pdf', '.md']
const EDIT_EXTENSIONS = ['.md', '.txt']

async function ensureDir() {
  try {
    await fs.mkdir(KNOWLEDGE_DIR, { recursive: true })
  } catch {
    // already exists
  }
}

function isEditableFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase()
  return EDIT_EXTENSIONS.includes(ext)
}

function makeArchiveContent(filename: string, content: string) {
  return `# ${filename}\n\n${content.trim()}`
}

async function readKnowledgeRecord(filename: string) {
  const records = await prisma.knowledge.findMany({
    where: { source: filename },
    orderBy: { createdAt: 'desc' },
    take: 1,
  })
  return records[0] || null
}

/**
 * GET /api/admin/knowledge
 * 지식 파일 목록 조회 또는 개별 파일 내용 조회
 */
export async function GET(request: NextRequest) {
  await ensureDir()

  const filename = request.nextUrl.searchParams.get('filename')

  // 개별 파일 내용 조회
  if (filename) {
    const safeName = path.basename(filename)
    try {
      const record = await readKnowledgeRecord(safeName)
      if (record) {
        return NextResponse.json({ filename: safeName, content: record.content })
      }

      const filePath = path.join(KNOWLEDGE_DIR, safeName)
      const content = await fs.readFile(filePath, 'utf-8')
      return NextResponse.json({ filename: safeName, content })
    } catch {
      return NextResponse.json({ error: '파일을 찾을 수 없습니다.' }, { status: 404 })
    }
  }

  // 전체 목록 조회
  try {
    const dbRecords = await prisma.knowledge.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    const dbFiles = dbRecords.map((record) => ({
      name: record.source || `knowledge-${record.id}.txt`,
      size: Buffer.byteLength(record.content, 'utf-8'),
      updatedAt: record.createdAt.toISOString(),
      preview: record.content
        .split('\n')
        .find((line) => line.trim() && !line.startsWith('#'))
        ?.trim()
        .slice(0, 100) || '',
      archived: true,
    }))

    const entries = await fs.readdir(KNOWLEDGE_DIR, { withFileTypes: true })
    const files = await Promise.all(
      entries
        .filter((e) => e.isFile() && isEditableFile(e.name))
        .map(async (e) => {
          const filePath = path.join(KNOWLEDGE_DIR, e.name)
          const stat = await fs.stat(filePath)

          let preview = ''
          try {
            const content = await fs.readFile(filePath, 'utf-8')
            preview = content.split('\n').find((line) => line.trim() && !line.startsWith('#'))?.trim().slice(0, 100) || ''
          } catch {
            // ignore
          }

          return {
            name: e.name,
            size: stat.size,
            updatedAt: stat.mtime.toISOString(),
            preview,
            archived: false,
          }
        })
    )

    const seen = new Set<string>()
    const allFiles = [...dbFiles, ...files].filter((file) => {
      if (seen.has(file.name)) return false
      seen.add(file.name)
      return true
    })

    allFiles.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    return NextResponse.json({ files: allFiles })
  } catch {
    return NextResponse.json({ files: [] })
  }
}

/**
 * POST /api/admin/knowledge
 * 지식 파일 생성/수정
 * - JSON 모드: { filename, content } — .md, .txt 인라인 에디터
 * - FormData 모드: file 필드로 PDF/TXT/MD 업로드 (5MB 제한, DB 아카이빙)
 */
export async function POST(request: NextRequest) {
  await ensureDir()

  const contentType = request.headers.get('content-type') || ''

  // FormData 모드 (파일 업로드)
  if (contentType.includes('multipart/form-data')) {
    try {
      const formData = await request.formData()
      const file = formData.get('file') as File | null

      if (!file) {
        return NextResponse.json({ error: '파일이 필요합니다.' }, { status: 400 })
      }

      // 크기 제한
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: '파일 크기는 5MB 이하여야 합니다.' },
          { status: 400 }
        )
      }

      const safeName = path.basename(file.name)
      const ext = path.extname(safeName).toLowerCase()

      if (!UPLOAD_EXTENSIONS.includes(ext)) {
        return NextResponse.json(
          { error: '.txt, .md, .pdf 파일만 업로드할 수 있습니다.' },
          { status: 400 }
        )
      }

      let archiveName = safeName
      let archiveContent = ''

      if (ext === '.pdf') {
        // PDF → 텍스트 추출 → .md 로 변환 저장
        try {
          const { PDFParse } = await import('pdf-parse')
          const arrayBuffer = await file.arrayBuffer()
          const pdf = new PDFParse({ data: new Uint8Array(arrayBuffer) })
          const textResult = await pdf.getText()
          const extractedText = textResult.text

          archiveName = safeName.replace(/\.pdf$/i, '.txt')
          archiveContent = makeArchiveContent(`${safeName} (PDF에서 추출)`, extractedText)
        } catch (err) {
          console.error('PDF 파싱 실패:', err)
          return NextResponse.json(
            { error: 'PDF 파일을 읽을 수 없습니다. 파일이 손상되었거나 암호화되어 있을 수 있습니다.' },
            { status: 400 }
          )
        }
      } else {
        const content = await file.text()
        archiveContent = makeArchiveContent(safeName, content)
      }

      await prisma.knowledge.deleteMany({ where: { source: archiveName } })
      const record = await prisma.knowledge.create({
        data: {
          source: archiveName,
          content: archiveContent,
          embedding: JSON.stringify({
            originalName: safeName,
            mimeType: file.type || 'application/octet-stream',
            size: file.size,
            archivedAt: new Date().toISOString(),
          }),
        },
      })

      return NextResponse.json({
        ok: true,
        filename: archiveName,
        id: record.id,
        archived: true,
        converted: ext === '.pdf',
      })
    } catch {
      return NextResponse.json({ error: '파일 업로드에 실패했습니다.' }, { status: 500 })
    }
  }

  // JSON 모드 (인라인 에디터)
  try {
    const { filename, content } = await request.json()

    if (!filename || typeof content !== 'string') {
      return NextResponse.json({ error: '파일 이름과 내용이 필요합니다.' }, { status: 400 })
    }

    const safeName = path.basename(filename)
    const ext = path.extname(safeName).toLowerCase()

    if (!EDIT_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ error: '.md 또는 .txt 파일만 직접 편집할 수 있습니다.' }, { status: 400 })
    }

    await prisma.knowledge.deleteMany({ where: { source: safeName } })
    await prisma.knowledge.create({
      data: {
        source: safeName,
        content,
        embedding: JSON.stringify({
          createdBy: 'inline-editor',
          archivedAt: new Date().toISOString(),
        }),
      },
    })

    return NextResponse.json({ ok: true, filename: safeName })
  } catch {
    return NextResponse.json({ error: '파일 저장에 실패했습니다.' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/knowledge
 * 지식 파일 삭제
 */
export async function DELETE(request: NextRequest) {
  await ensureDir()

  try {
    const { filename } = await request.json()

    if (!filename) {
      return NextResponse.json({ error: '파일 이름이 필요합니다.' }, { status: 400 })
    }

    const safeName = path.basename(filename)

    const deleted = await prisma.knowledge.deleteMany({ where: { source: safeName } })

    if (deleted.count === 0) {
      const filePath = path.join(KNOWLEDGE_DIR, safeName)
      await fs.unlink(filePath)
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '파일 삭제에 실패했습니다.' }, { status: 500 })
  }
}
