'use client'

import { useEffect } from 'react'
import { trackBlogPostRead } from './GoogleAnalytics'

interface BlogPostAnalyticsProps {
  title: string
  slug: string
  author?: string
  tags?: string[]
}

export function BlogPostAnalytics({ title, slug, author, tags }: BlogPostAnalyticsProps) {
  useEffect(() => {
    // Track blog post read immediately
    trackBlogPostRead(title, slug)

    // Track scroll depth with debouncing to reduce TBT
    let maxScroll = 0
    let scrollTimeout: ReturnType<typeof setTimeout> | null = null
    const milestones = [25, 50, 75, 90]
    const firedMilestones = new Set<number>()

    const trackScrollDepth = () => {
      if (scrollTimeout) return
      scrollTimeout = setTimeout(() => {
        scrollTimeout = null
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        if (docHeight <= 0) return
        const scrollPercent = Math.round((scrollTop / docHeight) * 100)

        if (scrollPercent > maxScroll) {
          maxScroll = scrollPercent
          for (const milestone of milestones) {
            if (scrollPercent >= milestone && !firedMilestones.has(milestone) && window.gtag) {
              firedMilestones.add(milestone)
              window.gtag('event', `scroll_depth_${milestone}`, {
                event_category: 'engagement',
                event_label: slug,
                value: milestone
              })
            }
          }
        }
      }, 250)
    }

    // Track time on page
    const startTime = Date.now()
    const trackTimeOnPage = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000)
      if (window.gtag) {
        window.gtag('event', 'time_on_page', {
          event_category: 'engagement',
          event_label: slug,
          value: timeSpent
        })
      }
    }

    window.addEventListener('scroll', trackScrollDepth, { passive: true })
    window.addEventListener('beforeunload', trackTimeOnPage)

    return () => {
      window.removeEventListener('scroll', trackScrollDepth)
      window.removeEventListener('beforeunload', trackTimeOnPage)
      if (scrollTimeout) clearTimeout(scrollTimeout)
      trackTimeOnPage()
    }
  }, [title, slug])

  return null
}