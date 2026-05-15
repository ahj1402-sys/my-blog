'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import KeywordSelector from '@/components/post-editor/KeywordSelector'
import AdvancedSettings from '@/components/post-editor/AdvancedSettings'
import CronJobInfo from '@/components/post-editor/CronJobInfo'
import '@uiw/react-md-editor/markdown-editor.css'

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
)

export default function SimplePostWriter() {
  const router = useRouter()
  const [step, setStep] = useState<'prompt' | 'edit'>('prompt')
  const [prompt, setPrompt] = useState('')
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [draftOutline, setDraftOutline] = useState('')
  const [showOutline, setShowOutline] = useState(false)
  const [personalStory, setPersonalStory] = useState('')
  const [showPersonalStory, setShowPersonalStory] = useState(false)
  const [generatedPostId, setGeneratedPostId] = useState<string | null>(null)
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isCoupangMode, setIsCoupangMode] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    coverImage: '',
    tags: '',
    seoTitle: '',
    seoDescription: '',
    coupangLink: '',
    publishedAt: null as string | null,
  })

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setGenerationStatus('generating')
    setErrorMessage('')

    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          keywords: selectedKeywords.length > 0 ? selectedKeywords : undefined,
          draftOutline: draftOutline.trim() || undefined,
          coupangLink: formData.coupangLink || undefined,
          personalStory: personalStory.trim() || undefined,
        }),
      })

      const raw = await response.json()
      const data = raw.data || raw

      if (!response.ok) {
        throw new Error(raw.message || raw.error || '생성에 실패했습니다.')
      }

      // The generate-content API auto-saves as DRAFT and returns post ID
      if (data.id) {
        setGeneratedPostId(data.id)
      }

      setFormData({
        title: data.title || '',
        slug: data.slug || '',
        content: data.content || '',
        excerpt: data.excerpt || '',
        coverImage: data.coverImage || '',
        tags: data.tags?.join(', ') || '',
        seoTitle: data.seoTitle || data.title || '',
        seoDescription: data.seoDescription || data.excerpt || '',
        coupangLink: formData.coupangLink,
        publishedAt: null,
      })

      setGenerationStatus('success')
      setStep('edit')
    } catch (error) {
      console.error('Generation error:', error)
      setGenerationStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'AI 콘텐츠 생성에 실패했습니다.')
    }
  }

  const handleSave = async (publish: boolean) => {
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      // 체크박스("바로 발행하기")가 켜져 있으면 어떤 버튼이든 발행 처리
      const shouldPublish = publish || !!formData.publishedAt
      const publishedAt = shouldPublish ? new Date().toISOString() : null
      const tagsArr = formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      const coverImage = formData.coverImage?.trim()
      const body: Record<string, unknown> = {
        title: formData.title,
        content: formData.content,
        publishedAt,
      }
      if (formData.slug?.trim()) body.slug = formData.slug.trim()
      if (formData.excerpt?.trim()) body.excerpt = formData.excerpt.trim()
      if (coverImage && /^https?:\/\//i.test(coverImage)) body.coverImage = coverImage
      // 태그가 비어 있으면 아예 보내지 않는다 (서버 schema가 빈 배열을 거부함)
      if (tagsArr.length > 0) body.tags = tagsArr
      if (formData.seoTitle?.trim()) body.seoTitle = formData.seoTitle.trim()
      if (formData.seoDescription?.trim()) body.seoDescription = formData.seoDescription.trim()

      let response: Response

      if (generatedPostId) {
        // Update the auto-saved draft
        response = await fetch(`/api/posts/${generatedPostId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      } else {
        // Create new post (manual creation without AI) — POST 는 tags 필수
        if (!body.tags) body.tags = ['일반']
        response = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }

      if (response.ok) {
        router.push('/admin')
      } else {
        const err = await response.json().catch(() => ({}))
        const msg = err.message || err.error || '저장에 실패했습니다.'
        setErrorMessage(msg)
        // 인라인 에러 메시지가 화면 상단에 있어 못 볼 수 있으니 alert 도 띄움
        alert(`저장 실패: ${msg}`)
      }
    } catch (error) {
      console.error('Save error:', error)
      const msg = error instanceof Error ? error.message : '저장에 실패했습니다.'
      setErrorMessage(msg)
      alert(`저장 실패: ${msg}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ========== Step 1: Prompt ==========
  if (step === 'prompt') {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">새 글 작성</h1>
          <p className="text-sm text-gray-500 mt-1">주제를 입력하면 AI가 SEO에 최적화된 글을 생성합니다.</p>
        </div>

        {/* Cron Job Info */}
        <CronJobInfo />

        {/* Main prompt area */}
        <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-6 space-y-5">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <h2 className="text-lg font-bold text-indigo-900">어떤 글을 쓸까요?</h2>
          </div>

          <div>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="예: Next.js 15 새로운 기능 정리 — 실무자가 알아야 할 핵심"
              rows={3}
              autoFocus
              disabled={generationStatus === 'generating'}
              className="w-full px-4 py-3 text-base rounded-xl border border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 resize-none placeholder:text-gray-400"
            />
          </div>

          <KeywordSelector
            selected={selectedKeywords}
            onChange={setSelectedKeywords}
            disabled={generationStatus === 'generating'}
          />

          {/* Post type toggle: Regular vs Coupang */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setIsCoupangMode(false)
                updateFormData({ coupangLink: '' })
              }}
              className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-xl border-2 transition-colors ${
                !isCoupangMode
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                일반 글
              </span>
            </button>
            <button
              type="button"
              onClick={() => setIsCoupangMode(true)}
              className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-xl border-2 transition-colors ${
                isCoupangMode
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                쿠팡파트너스
              </span>
            </button>
          </div>

          {/* Coupang link input (visible only in Coupang mode) */}
          {isCoupangMode && (
            <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-4 space-y-2">
              <label className="block text-sm font-semibold text-orange-800">
                쿠팡 파트너스 링크 또는 iframe
              </label>
              <textarea
                value={formData.coupangLink}
                onChange={e => updateFormData({ coupangLink: e.target.value })}
                placeholder={"쿠팡 파트너스 URL 또는 iframe HTML을 붙여넣으세요\n예: https://link.coupang.com/... 또는 <iframe src=\"https://ads-partners.coupang.com/...\" ...>"}
                rows={3}
                disabled={generationStatus === 'generating'}
                className="w-full px-4 py-3 text-sm rounded-xl border border-orange-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 resize-none bg-white"
              />
              <p className="text-xs text-orange-600">
                면책 문구 &ldquo;이 포스팅은 쿠팡 파트너스 활동의 일환으로...&rdquo;가 자동으로 추가됩니다.
              </p>
            </div>
          )}

          {/* Optional outline toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowOutline(!showOutline)}
              className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <svg className={`w-3 h-3 transition-transform ${showOutline ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              글의 방향이나 개요를 추가하고 싶다면?
            </button>
            {showOutline && (
              <textarea
                value={draftOutline}
                onChange={e => setDraftOutline(e.target.value)}
                placeholder="예: 1. 서론 - 왜 업그레이드해야 하는지  2. 핵심 변경점  3. 마이그레이션 팁"
                rows={3}
                disabled={generationStatus === 'generating'}
                className="mt-2 w-full px-4 py-3 text-sm rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 resize-none"
              />
            )}
          </div>

          {/* Optional personal story / human-touch toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowPersonalStory(!showPersonalStory)}
              className="text-sm text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
            >
              <svg className={`w-3 h-3 transition-transform ${showPersonalStory ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              사람 냄새 나는 개인 경험·일화 추가하기 (AI 티 줄이기)
            </button>
            {showPersonalStory && (
              <div className="mt-2 rounded-xl border-2 border-emerald-200 bg-emerald-50/40 p-4 space-y-2">
                <p className="text-xs text-emerald-800 leading-relaxed">
                  여기에 적은 내용은 AI가 글에 <strong>자연스럽게 녹여서</strong> 1인칭 경험담처럼 풀어줍니다.
                  형식은 자유 — 아래 템플릿은 예시일 뿐이고 다른 내용도 OK.
                </p>
                <textarea
                  value={personalStory}
                  onChange={e => setPersonalStory(e.target.value)}
                  placeholder={`## 제가 직접 겪어본 이야기

서론 → 종결 구조로 200~400자:

- 언제, 어떤 상황에서
- 어떤 문제가 있었는지
- 어떻게 시도했는지
- 결과가 어떠했는지

(자유 형식. 메모처럼 적어도 AI가 다듬어줍니다.)`}
                  rows={10}
                  maxLength={5000}
                  disabled={generationStatus === 'generating'}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 resize-y bg-white font-normal whitespace-pre-wrap"
                />
                <p className="text-xs text-gray-400 text-right">{personalStory.length}/5000자</p>
              </div>
            )}
          </div>

          {/* Generate button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generationStatus === 'generating' || !prompt.trim() || (isCoupangMode && !formData.coupangLink.trim())}
            className={`w-full py-3.5 text-base font-bold rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 ${
              isCoupangMode ? 'bg-orange-600 hover:bg-orange-700' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {generationStatus === 'generating' ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {isCoupangMode ? '쿠팡 파트너스 글을 작성하고 있어요...' : 'AI가 글을 작성하고 있어요...'}
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {isCoupangMode ? '쿠팡 리뷰 생성하기' : '글 생성하기'}
              </>
            )}
          </button>

          {generationStatus === 'error' && errorMessage && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{errorMessage}</p>
          )}
        </div>

        {/* Direct write option */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => setStep('edit')}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            AI 없이 직접 작성하기
          </button>
        </div>
      </div>
    )
  }

  // ========== Step 2: Edit ==========
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success banner */}
      {generationStatus === 'success' && (
        <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 px-5 py-4">
          <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-medium text-green-800">글이 생성되었습니다! 내용을 확인하고 발행하세요.</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {generatedPostId ? '글 편집' : '새 글 작성'}
        </h1>
        <button
          type="button"
          onClick={() => {
            setStep('prompt')
            setGenerationStatus('idle')
          }}
          className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          다시 생성하기
        </button>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
        <input
          type="text"
          value={formData.title}
          onChange={e => updateFormData({ title: e.target.value })}
          placeholder="글 제목을 입력하세요"
          className="w-full px-4 py-3 text-lg font-semibold rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {/* Content editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">본문</label>
        <MDEditor
          value={formData.content}
          onChange={val => updateFormData({ content: val || '' })}
          height={500}
        />
      </div>

      {/* Advanced settings */}
      <AdvancedSettings
        formData={{
          slug: formData.slug,
          excerpt: formData.excerpt,
          tags: formData.tags,
          seoTitle: formData.seoTitle,
          seoDescription: formData.seoDescription,
          coverImage: formData.coverImage,
          coupangLink: formData.coupangLink,
        }}
        onChange={updateFormData}
        title={formData.title}
        isOpen={showAdvanced}
        onToggle={() => setShowAdvanced(!showAdvanced)}
      />

      {/* Error message */}
      {errorMessage && step === 'edit' && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{errorMessage}</p>
      )}

      {/* Bottom action bar */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!!formData.publishedAt}
            onChange={e => updateFormData({ publishedAt: e.target.checked ? new Date().toISOString() : null })}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700">바로 발행하기</span>
        </label>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={isSubmitting || !formData.title || !formData.content}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50"
          >
            {isSubmitting ? '저장 중...' : formData.publishedAt ? '저장 (발행)' : '초안 저장'}
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={isSubmitting || !formData.title || !formData.content}
            className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? '발행 중...' : '발행하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
