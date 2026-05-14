'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import PostEditor from '@/components/PostEditor'

interface Post {
  title: string
  slug: string
  content: string
  excerpt?: string
  coverImage?: string
  tags?: string[]
  seoTitle?: string
  seoDescription?: string
  publishedAt?: string | null
}

interface PostFormData {
  title: string
  slug: string
  content: string
  excerpt?: string
  coverImage?: string
  tags?: string[]
  seoTitle?: string
  seoDescription?: string
  publishedAt?: string | null
}

export default function EditPostClient({ id }: { id: string }) {
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/posts/${id}`)
      .then(res => res.json())
      .then(data => {
        setPost(data)
        setLoading(false)
      })
  }, [id])

  const handleSubmit = async (data: PostFormData) => {
    const response = await fetch(`/api/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (response.ok) {
      alert('저장이 완료되었습니다!')
      router.push('/admin')
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      alert(`저장 중 오류가 발생했습니다:\n${JSON.stringify(errorData, null, 2)}`)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!post) {
    return <div>Post not found</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="mr-2 -ml-0.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            목록으로
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">글 수정</h1>
        </div>
      </div>

      <PostEditor initialData={post} onSubmit={handleSubmit} isEdit />
    </div>
  )
}
