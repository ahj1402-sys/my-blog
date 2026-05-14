'use client'

import { useState, useEffect } from 'react'

interface KnowledgeFile {
  name: string
  size: number
  updatedAt: string
  preview: string
  archived?: boolean
}

type TabType = 'system-instruction' | 'knowledge-files'

export default function KnowledgePage() {
  const [activeTab, setActiveTab] = useState<TabType>('system-instruction')

  // 시스템 지침 상태
  const [systemContent, setSystemContent] = useState('')
  const [systemLoading, setSystemLoading] = useState(true)
  const [systemSaving, setSystemSaving] = useState(false)
  const [systemSaved, setSystemSaved] = useState(false)

  // 지식 파일 상태
  const [files, setFiles] = useState<KnowledgeFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorContent, setEditorContent] = useState('')
  const [editorFilename, setEditorFilename] = useState('')
  const [editingExisting, setEditingExisting] = useState(false)

  // 시스템 지침 로드
  const fetchSystemInstruction = async () => {
    setSystemLoading(true)
    try {
      const res = await fetch('/api/admin/knowledge?filename=system-instruction.md')
      if (res.ok) {
        const data = await res.json()
        setSystemContent(data.content)
      } else {
        setSystemContent('')
      }
    } catch {
      // ignore
    } finally {
      setSystemLoading(false)
    }
  }

  // 시스템 지침 저장
  const handleSystemSave = async () => {
    setSystemSaving(true)
    try {
      const res = await fetch('/api/admin/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: 'system-instruction.md', content: systemContent }),
      })
      if (res.ok) {
        setSystemSaved(true)
        setTimeout(() => setSystemSaved(false), 3000)
      }
    } catch {
      // ignore
    } finally {
      setSystemSaving(false)
    }
  }

  // 지식 파일 목록 로드
  const fetchFiles = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/knowledge')
      if (res.ok) {
        const data = await res.json()
        // system-instruction.md는 목록에서 제외
        setFiles(data.files.filter((f: KnowledgeFile) => f.name !== 'system-instruction.md'))
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSystemInstruction()
    fetchFiles()
  }, [])

  // 파일 업로드 (PDF/TXT)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadFiles = e.target.files
    if (!uploadFiles) return

    setUploading(true)
    for (let i = 0; i < uploadFiles.length; i++) {
      const file = uploadFiles[i]
      const ext = file.name.split('.').pop()?.toLowerCase()

      // 5MB 체크
      if (file.size > 5 * 1024 * 1024) {
        alert(`"${file.name}" 파일이 5MB를 초과합니다.`)
        continue
      }

      if (ext !== 'pdf' && ext !== 'txt') {
        alert(`"${file.name}" 파일은 업로드할 수 없습니다. PDF 또는 TXT 파일만 지원합니다.`)
        continue
      }

      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/knowledge', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.error || `"${file.name}" 업로드에 실패했습니다.`)
      }
    }
    setUploading(false)
    fetchFiles()
    e.target.value = ''
  }

  const handleSave = async () => {
    if (!editorFilename.trim()) return

    let filename = editorFilename
    if (!filename.endsWith('.md') && !filename.endsWith('.txt')) {
      filename = `${filename}.md`
    }
    await fetch('/api/admin/knowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, content: editorContent }),
    })
    setEditorOpen(false)
    setEditorContent('')
    setEditorFilename('')
    setEditingExisting(false)
    fetchFiles()
  }

  const handleEdit = async (filename: string) => {
    try {
      const res = await fetch(`/api/admin/knowledge?filename=${encodeURIComponent(filename)}`)
      if (res.ok) {
        const data = await res.json()
        setEditorFilename(filename)
        setEditorContent(data.content)
        setEditingExisting(true)
        setEditorOpen(true)
      }
    } catch {
      // ignore
    }
  }

  const handleDelete = async (filename: string) => {
    if (!confirm(`"${filename}" 파일을 삭제할까요?`)) return

    await fetch('/api/admin/knowledge', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename }),
    })
    fetchFiles()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">전문 지식 관리</h1>
        <p className="mt-1 text-gray-500">
          AI 글쓰기에 사용되는 시스템 지침과 참고 지식 파일을 관리하세요.
        </p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('system-instruction')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'system-instruction'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            시스템 지침
          </button>
          <button
            onClick={() => setActiveTab('knowledge-files')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'knowledge-files'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            지식 파일 ({files.length}개)
          </button>
        </nav>
      </div>

      {/* 시스템 지침 탭 */}
      {activeTab === 'system-instruction' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">system-instruction.md</h3>
                <p className="text-sm text-gray-500">
                  AI가 글을 작성할 때 따르는 기본 지침입니다. 수정하면 다음 글 생성부터 반영됩니다.
                </p>
              </div>
              {systemSaved && (
                <span className="text-sm text-green-600 font-medium">저장 완료</span>
              )}
            </div>

            {systemLoading ? (
              <div className="text-center text-gray-500 py-8">불러오는 중...</div>
            ) : (
              <>
                <textarea
                  value={systemContent}
                  onChange={(e) => setSystemContent(e.target.value)}
                  className="w-full h-96 px-4 py-3 border rounded-lg text-sm font-mono resize-y focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="시스템 지침을 작성하세요..."
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSystemSave}
                    disabled={systemSaving}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
                  >
                    {systemSaving ? '저장 중...' : '저장'}
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="bg-amber-50 rounded-lg p-4 text-sm text-amber-800">
            <h4 className="font-semibold mb-1">시스템 지침이란?</h4>
            <p>
              AI가 블로그 글을 생성할 때 가장 먼저 읽는 지침서입니다.
              글쓰기 스타일, SEO 규칙, 금지 사항, 출력 형식 등을 정의합니다.
              수정 후 저장하면 다음 AI 글 생성부터 즉시 반영됩니다.
            </p>
          </div>
        </div>
      )}

      {/* 지식 파일 탭 */}
      {activeTab === 'knowledge-files' && (
        <div className="space-y-6">
          {/* 업로드 영역 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {uploading ? '업로드 중...' : '파일 업로드'}
                <input
                  type="file"
                  accept=".txt,.pdf"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              <button
                onClick={() => {
                  setEditorOpen(true)
                  setEditorContent('')
                  setEditorFilename('')
                  setEditingExisting(false)
                }}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                직접 작성
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              .txt, .pdf 파일만 업로드할 수 있습니다 (5MB 제한). 업로드된 파일은 지식 자료로 아카이빙되어 다음 AI 글 생성부터 참고됩니다.
            </p>
          </div>

          {/* 에디터 모달 */}
          {editorOpen && (
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  {editingExisting ? '파일 수정' : '새 지식 파일 작성'}
                </h3>
                <button onClick={() => setEditorOpen(false)} className="text-gray-400 hover:text-gray-600">
                  닫기
                </button>
              </div>
              <input
                type="text"
                placeholder="파일 이름 (예: insurance-basics.md)"
                value={editorFilename}
                onChange={(e) => setEditorFilename(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
                disabled={editingExisting}
              />
              <textarea
                placeholder="마크다운으로 전문 지식을 작성하세요...&#10;&#10;# 제목&#10;&#10;## 주요 내용&#10;- 포인트 1&#10;- 포인트 2"
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                className="w-full h-64 px-3 py-2 border rounded-md text-sm font-mono resize-y"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setEditorOpen(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                  취소
                </button>
                <button
                  onClick={handleSave}
                  disabled={!editorFilename.trim() || !editorContent.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  저장
                </button>
              </div>
            </div>
          )}

          {/* 파일 목록 */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-900">
                업로드된 지식 파일 ({files.length}개)
              </h3>
            </div>
            {loading ? (
              <div className="p-6 text-center text-gray-500">불러오는 중...</div>
            ) : files.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                아직 업로드된 파일이 없습니다. 파일을 업로드하거나 직접 작성해보세요.
              </div>
            ) : (
              <div className="divide-y">
                {files.map((file) => (
                  <div key={file.name} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="font-medium text-gray-900 truncate">{file.name}</span>
                        <span className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)}KB</span>
                        {file.archived && (
                          <span className="rounded bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-green-600/20">
                            학습됨
                          </span>
                        )}
                      </div>
                      {file.preview && (
                        <p className="mt-1 text-sm text-gray-500 truncate pl-7">{file.preview}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {(file.name.endsWith('.md') || file.name.endsWith('.txt')) && (
                        <button
                          onClick={() => handleEdit(file.name)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          수정
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(file.name)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 안내 */}
          <div className="bg-blue-50 rounded-lg p-6 text-sm text-blue-800">
            <h3 className="font-semibold mb-2">전문 지식 파일 작성 팁</h3>
            <ul className="space-y-1 list-disc pl-4">
              <li>본인의 업종 전문 용어와 개념을 정리하세요.</li>
              <li>직접 경험한 사례나 데이터를 포함하면 AI가 더 좋은 글을 작성합니다.</li>
              <li>독서 노트, 강의 요약, 업계 트렌드 등도 좋은 소재입니다.</li>
              <li>PDF 파일을 업로드하면 텍스트를 추출하여 지식 자료로 자동 아카이빙합니다.</li>
              <li>파일은 여러 개로 나눠서 주제별로 관리하는 것을 추천합니다.</li>
              <li>업로드된 파일은 <code className="bg-blue-100 px-1 rounded">knowledge/</code> 폴더에 저장됩니다.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
