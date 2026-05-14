'use client'

import { PostFormData } from '@/types'

interface PostTitleSlugFieldsProps {
  formData: PostFormData
  onChange: (data: Partial<PostFormData>) => void
}

export function PostTitleSlugFields({ formData, onChange }: PostTitleSlugFieldsProps) {
  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    onChange({ slug })
  }

  return (
    <>
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          required
          value={formData.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
          Slug
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="text"
            id="slug"
            required
            value={formData.slug}
            onChange={(e) => onChange({ slug: e.target.value })}
            className="block w-full rounded-none rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <button
            type="button"
            onClick={generateSlug}
            className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500 hover:bg-gray-100"
          >
            Generate
          </button>
        </div>
      </div>
    </>
  )
}