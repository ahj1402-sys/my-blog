'use client'

import dynamic from 'next/dynamic'

// Lazy load the CommentSection component
const CommentSection = dynamic(
  () => import('./comments/CommentSection'),
  { 
    ssr: false,
    loading: () => (
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-100 rounded"></div>
            <div className="h-12 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    )
  }
)

export default CommentSection