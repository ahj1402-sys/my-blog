'use client'

import dynamic from 'next/dynamic'

// Lazy load the BlogPostAnalytics component
const BlogPostAnalytics = dynamic(
  () => import('./BlogPostAnalytics').then(mod => ({ default: mod.BlogPostAnalytics })),
  { 
    ssr: false,
    loading: () => null
  }
)

export default BlogPostAnalytics