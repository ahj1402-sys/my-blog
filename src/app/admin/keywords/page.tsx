'use client'

import { useState, useEffect } from 'react'

interface Keyword {
  id: string
  text: string
  category: string | null
  usageCount: number
}

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [loading, setLoading] = useState(true)
  const [manualInput, setManualInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const fetchKeywords = async () => {
    try {
      const res = await fetch('/api/admin/keywords')
      const data = await res.json()
      setKeywords(data.keywords || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchKeywords() }, [])

  const handleAddManual = async () => {
    const texts = manualInput
      .split(/[,\n]/)
      .map(t => t.trim())
      .filter(Boolean)

    if (texts.length === 0) return

    try {
      const res = await fetch('/api/admin/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: texts }),
      })
      const data = await res.json()
      setMessage(`${data.created}개 키워드가 추가되었습니다.`)
      setManualInput('')
      fetchKeywords()
    } catch {
      setMessage('키워드 추가에 실패했습니다.')
    }
  }

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/keywords', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      setMessage(`${data.created}개 키워드가 업로드되었습니다. (총 ${data.total}개 중)`)
      fetchKeywords()
    } catch {
      setMessage('CSV 업로드에 실패했습니다.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDelete = async () => {
    if (selectedIds.size === 0) return

    try {
      await fetch('/api/admin/keywords', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      })
      setMessage(`${selectedIds.size}개 키워드가 삭제되었습니다.`)
      setSelectedIds(new Set())
      fetchKeywords()
    } catch {
      setMessage('삭제에 실패했습니다.')
    }
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const toggleAll = () => {
    if (selectedIds.size === keywords.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(keywords.map(k => k.id)))
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">키워드 관리</h1>
        <p className="text-sm text-gray-500 mb-6">
          등록된 키워드는 AI 글 생성 시 선택하거나, 크론잡의 자동 글 생성에 사용됩니다.
        </p>

        {message && (
          <div className="mb-4 p-3 rounded-lg text-sm bg-blue-50 text-blue-700">
            {message}
          </div>
        )}

        {/* Add keywords section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Manual input */}
          <div className="border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">직접 입력</h3>
            <textarea
              value={manualInput}
              onChange={e => setManualInput(e.target.value)}
              placeholder="키워드를 입력하세요 (쉼표 또는 줄바꿈으로 구분)"
              rows={4}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 mb-3"
            />
            <button
              onClick={handleAddManual}
              disabled={!manualInput.trim()}
              className="w-full py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              추가
            </button>
          </div>

          {/* CSV upload */}
          <div className="border border-dashed border-gray-300 rounded-xl p-5 flex flex-col items-center justify-center text-center">
            <svg className="w-10 h-10 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">CSV 파일 업로드</h3>
            <p className="text-xs text-gray-500 mb-4">CSV 또는 TXT 파일 (한 줄에 하나 또는 쉼표 구분)</p>
            <label className={`px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
              {uploading ? '업로드 중...' : '파일 선택'}
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleCSVUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Keywords list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">
              등록된 키워드 <span className="text-gray-400 font-normal">({keywords.length})</span>
            </h3>
            {selectedIds.size > 0 && (
              <button
                onClick={handleDelete}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                {selectedIds.size}개 삭제
              </button>
            )}
          </div>

          {loading ? (
            <div className="animate-pulse space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-8 bg-gray-100 rounded" />)}
            </div>
          ) : keywords.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>등록된 키워드가 없습니다.</p>
              <p className="text-sm mt-1">위에서 키워드를 추가하세요.</p>
            </div>
          ) : (
            <>
              <div className="mb-2">
                <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === keywords.length}
                    onChange={toggleAll}
                    className="rounded border-gray-300 text-indigo-600"
                  />
                  전체 선택
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {keywords.map(kw => (
                  <label
                    key={kw.id}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm cursor-pointer transition-colors ${
                      selectedIds.has(kw.id)
                        ? 'bg-red-50 border-red-300 text-red-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(kw.id)}
                      onChange={() => toggleSelect(kw.id)}
                      className="hidden"
                    />
                    {kw.text}
                    {kw.usageCount > 0 && (
                      <span className="text-xs text-gray-400">({kw.usageCount})</span>
                    )}
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
