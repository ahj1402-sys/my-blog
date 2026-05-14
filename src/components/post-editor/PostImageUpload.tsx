'use client'

import { useState } from 'react'
import { PostFormData } from '@/types'

interface PostImageUploadProps {
  formData: PostFormData
  onChange: (data: Partial<PostFormData>) => void
}

export function PostImageUpload({ formData, onChange }: PostImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleImageUpload = async (file: File) => {
    setIsUploading(true)
    setUploadError(null)

    try {
      const formDataUpload = new FormData()
      formDataUpload.append('image', file)
      formDataUpload.append('postId', 'temp-' + Date.now())

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formDataUpload,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const { imageUrl } = await response.json()
      onChange({ coverImage: imageUrl })
    } catch (error) {
      setUploadError('Image upload failed. Please try again.')
      console.error('Image upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div>
      <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700">
        Cover Image
      </label>
      <div className="mt-1 space-y-2">
        <input
          type="url"
          id="coverImage"
          placeholder="이미지 URL을 입력하거나 아래에서 파일을 업로드하세요"
          value={formData.coverImage}
          onChange={(e) => onChange({ coverImage: e.target.value })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        
        <div className="flex items-center space-x-4">
          <label className="block">
            <span className="sr-only">Choose image file</span>
            <input
              type="file"
              accept="image/*"
              disabled={isUploading}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleImageUpload(file)
                }
              }}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100
                disabled:opacity-50"
            />
          </label>
          
          {formData.coverImage && (
            <div className="relative w-20 h-20">
              <img
                src={formData.coverImage}
                alt="Cover preview"
                className="w-full h-full object-cover rounded"
              />
              <button
                type="button"
                onClick={() => onChange({ coverImage: '' })}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
        
        {isUploading && (
          <p className="text-sm text-gray-500">Uploading...</p>
        )}
        
        {uploadError && (
          <p className="text-sm text-red-600">{uploadError}</p>
        )}
      </div>
    </div>
  )
}