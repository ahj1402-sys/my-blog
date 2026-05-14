'use client'

interface AdvancedSettingsProps {
  formData: {
    slug: string
    excerpt: string
    tags: string
    seoTitle: string
    seoDescription: string
    coverImage: string
    coupangLink: string
  }
  onChange: (data: Partial<AdvancedSettingsProps['formData']>) => void
  title: string
  isOpen: boolean
  onToggle: () => void
}

export default function AdvancedSettings({ formData, onChange, title, isOpen, onToggle }: AdvancedSettingsProps) {
  const generateSlug = () => {
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s\uAC00-\uD7A3-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    onChange({ slug })
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="text-sm font-medium text-gray-700">고급 설정</span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="p-5 space-y-4 border-t border-gray-200">
          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">슬러그 (URL)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.slug}
                onChange={e => onChange({ slug: e.target.value })}
                placeholder="자동 생성됩니다"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={generateSlug}
                className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                자동 생성
              </button>
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">요약</label>
            <textarea
              rows={2}
              value={formData.excerpt}
              onChange={e => onChange({ excerpt: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">태그 (쉼표 구분)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={e => onChange({ tags: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* SEO fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SEO 제목 <span className="text-gray-400 text-xs">({formData.seoTitle.length}/60)</span>
              </label>
              <input
                type="text"
                value={formData.seoTitle}
                onChange={e => onChange({ seoTitle: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SEO 설명 <span className="text-gray-400 text-xs">({formData.seoDescription.length}/160)</span>
              </label>
              <input
                type="text"
                value={formData.seoDescription}
                onChange={e => onChange({ seoDescription: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">커버 이미지</label>
            <div className="flex items-center gap-3">
              <input
                type="url"
                value={formData.coverImage}
                onChange={e => onChange({ coverImage: e.target.value })}
                placeholder="URL 또는 파일 업로드"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <label className="shrink-0 px-3 py-2 text-sm font-medium text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 cursor-pointer">
                업로드
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const uploadFormData = new FormData()
                    uploadFormData.append('image', file)
                    uploadFormData.append('postId', 'temp-' + Date.now())
                    try {
                      const res = await fetch('/api/admin/upload-image', { method: 'POST', body: uploadFormData })
                      if (res.ok) {
                        const { imageUrl } = await res.json()
                        onChange({ coverImage: imageUrl })
                      }
                    } catch (err) {
                      console.error('Image upload failed:', err)
                    }
                  }}
                />
              </label>
              {formData.coverImage && (
                <button
                  type="button"
                  onClick={() => onChange({ coverImage: '' })}
                  className="text-red-500 hover:text-red-700"
                  title="이미지 제거"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {formData.coverImage && (
              <img src={formData.coverImage} alt="Preview" className="mt-2 h-20 rounded-lg object-cover" />
            )}
          </div>

          {/* Coupang Link (편집 시 수정 가능) */}
          {formData.coupangLink && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">쿠팡 파트너스 링크</label>
              <textarea
                rows={2}
                value={formData.coupangLink}
                onChange={e => onChange({ coupangLink: e.target.value })}
                placeholder="쿠팡 파트너스 URL 또는 iframe HTML"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
