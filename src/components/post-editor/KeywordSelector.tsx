'use client'

import { useState, useEffect } from 'react'

interface Keyword {
  id: string
  text: string
  category: string | null
  usageCount: number
}

interface KeywordSelectorProps {
  selected: string[]
  onChange: (keywords: string[]) => void
  disabled?: boolean
}

export default function KeywordSelector({ selected, onChange, disabled }: KeywordSelectorProps) {
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [loading, setLoading] = useState(true)
  const [customInput, setCustomInput] = useState('')

  useEffect(() => {
    fetch('/api/admin/keywords')
      .then(res => res.json())
      .then(data => setKeywords(data.keywords || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toggle = (text: string) => {
    if (disabled) return
    if (selected.includes(text)) {
      onChange(selected.filter(k => k !== text))
    } else {
      onChange([...selected, text])
    }
  }

  const addCustom = () => {
    const trimmed = customInput.trim()
    if (!trimmed || selected.includes(trimmed)) return
    onChange([...selected, trimmed])
    setCustomInput('')
  }

  if (loading) {
    return (
      <div className="animate-pulse h-10 bg-gray-100 rounded-lg" />
    )
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-2">
        키워드 선택 <span className="text-gray-400">(선택사항)</span>
      </label>

      {keywords.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-3">
          {keywords.map(kw => (
            <button
              key={kw.id}
              type="button"
              onClick={() => toggle(kw.text)}
              disabled={disabled}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                selected.includes(kw.text)
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {kw.text}
              {kw.usageCount > 0 && (
                <span className="ml-1 text-xs opacity-60">({kw.usageCount})</span>
              )}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 mb-3">
          등록된 키워드가 없습니다.{' '}
          <a href="/admin/keywords" className="text-indigo-500 hover:underline">
            키워드 관리
          </a>
          에서 추가하세요.
        </p>
      )}

      {/* Inline custom keyword add */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom())}
          placeholder="직접 입력"
          disabled={disabled}
          className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="button"
          onClick={addCustom}
          disabled={disabled || !customInput.trim()}
          className="px-3 py-1.5 text-sm font-medium text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 disabled:opacity-40"
        >
          추가
        </button>
      </div>

      {selected.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selected.map(kw => (
            <span key={kw} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full">
              {kw}
              <button type="button" onClick={() => toggle(kw)} className="hover:text-indigo-900">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
