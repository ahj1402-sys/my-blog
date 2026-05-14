'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface PopularPost {
  id: string
  title: string
  slug: string
  views: number
  publishedAt: string
  excerpt: string | null
  coverImage: string | null
}

type Period = 'week' | 'month' | 'all'

export default function PopularPosts() {
  const [posts, setPosts] = useState<PopularPost[]>([])
  const [period, setPeriod] = useState<Period>('week')
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function fetchPopularPosts() {
      setLoading(true)
      try {
        const response = await fetch(`/api/posts/popular?period=${period}&limit=5`)
        if (response.ok) {
          const data = await response.json()
          setPosts(data)
        }
      } catch (error) {
        console.error('Failed to fetch popular posts:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchPopularPosts()
  }, [period])
  
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Trending</h2>
        <div className="flex gap-1 text-sm">
          <button
            onClick={() => setPeriod('week')}
            aria-label="Filter by week"
            aria-pressed={period === 'week'}
            className={`px-3 py-1 rounded-md transition-colors ${
              period === 'week'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setPeriod('month')}
            aria-label="Filter by month"
            aria-pressed={period === 'month'}
            className={`px-3 py-1 rounded-md transition-colors ${
              period === 'month'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setPeriod('all')}
            aria-label="Filter by all time"
            aria-pressed={period === 'all'}
            className={`px-3 py-1 rounded-md transition-colors ${
              period === 'all'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Time
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex gap-3">
                <div className="bg-gray-200 w-16 h-16 rounded"></div>
                <div className="flex-1">
                  <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
                  <div className="bg-gray-200 h-3 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post, index) => (
            <Link 
              key={post.id} 
              href={`/posts/${post.slug}`}
              className="flex gap-3 group"
            >
              <div className="flex-shrink-0 w-16 h-16 relative">
                {post.coverImage ? (
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover rounded group-hover:opacity-80 transition-opacity"
                    sizes="64px"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center text-2xl font-bold text-gray-400">
                    {index + 1}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h3>
                <div className="text-sm text-gray-500 mt-1">
                  {post.views.toLocaleString()} views
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}