'use client'

import { useEffect, useState } from 'react'

interface ViewCounterProps {
  postId: string
  initialViews: number
}

export default function ViewCounter({ postId, initialViews }: ViewCounterProps) {
  const [views, setViews] = useState(initialViews)

  useEffect(() => {
    // Track view after component mounts
    const trackView = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}/views`, {
          method: 'POST',
        })
        
        if (response.ok) {
          const data = await response.json()
          setViews(data.views)
        }
      } catch (error) {
        console.error('Error tracking view:', error)
      }
    }

    // Delay view tracking to avoid blocking main thread
    const timer = setTimeout(trackView, 4000)
    return () => clearTimeout(timer)
  }, [postId])

  return <span>{views} views</span>
}