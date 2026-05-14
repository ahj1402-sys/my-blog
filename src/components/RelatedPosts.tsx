'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface RelatedPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  publishedAt: string
  tags: string[]
  views: number
}

interface RelatedPostsProps {
  postId: string
}

function parseExcerpt(excerpt: string | null): string | null {
  if (!excerpt) return null;
  
  // Handle potentially truncated JSON content
  if (excerpt.includes('```json') || excerpt.includes('"excerpt":')) {
    // 1. Try to extract from ```json block
    const jsonMatch = excerpt.match(/```json\s*([\s\S]*?)(?:```|$)/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        return parsed.excerpt || parsed.description || null;
      } catch (e) {
        // JSON might be truncated, continue to fallback methods
      }
    }
    
    // 2. Try to extract excerpt value directly from JSON string
    const excerptMatch = excerpt.match(/"excerpt"\s*:\s*"([^"]+)"/);
    if (excerptMatch) {
      return excerptMatch[1];
    }
    
    // 3. If it's clearly JSON but we can't parse it, return a default message
    if (excerpt.startsWith('```json') || excerpt.startsWith('{')) {
      // Extract title if possible as fallback
      const titleMatch = excerpt.match(/"title"\s*:\s*"([^"]+)"/);
      if (titleMatch) {
        return `Read about: ${titleMatch[1]}`;
      }
      return "Click to read more...";
    }
  }
  
  return excerpt;
}

export default function RelatedPosts({ postId }: RelatedPostsProps) {
  const [posts, setPosts] = useState<RelatedPost[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function fetchRelatedPosts() {
      try {
        const response = await fetch(`/api/posts/${postId}/related`)
        if (response.ok) {
          const data = await response.json()
          setPosts(data)
        }
      } catch (error) {
        console.error('Failed to fetch related posts:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchRelatedPosts()
  }, [postId])
  
  if (loading) {
    return (
      <div className="mt-16 border-t pt-8">
        <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
              <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
              <div className="bg-gray-200 h-4 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  if (posts.length === 0) return null
  
  return (
    <div className="mt-16 border-t pt-8">
      <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link 
            key={post.id} 
            href={`/posts/${post.slug}`}
            className="group hover:opacity-90 transition-opacity"
          >
            <article className="h-full flex flex-col">
              {post.coverImage && (
                <div className="relative aspect-[16/9] mb-4 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              )}
              <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                  {parseExcerpt(post.excerpt)}
                </p>
              )}
              <div className="mt-auto flex items-center text-sm text-gray-500">
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </time>
                <span className="mx-2">•</span>
                <span>{post.views} views</span>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  )
}