'use client'

import dynamic from 'next/dynamic'

// Lazy load the NewsletterAnalytics component
const NewsletterAnalytics = dynamic(
  () => import('./NewsletterAnalytics'),
  { 
    ssr: true,
    loading: () => (
      <div className="flex gap-4 max-w-md mx-auto">
        <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse" />
        <div className="w-24 h-12 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    )
  }
)

export default NewsletterAnalytics