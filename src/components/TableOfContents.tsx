'use client'

import { useEffect, useState } from 'react'

interface TocItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: string
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')
  
  useEffect(() => {
    // Extract headings from markdown content
    const regex = /^(#{1,3})\s+(.+)$/gm
    const matches = Array.from(content.matchAll(regex))
    
    const items: TocItem[] = matches.map((match, index) => {
      const level = match[1].length
      const text = match[2].trim()
      const id = `heading-${index}-${text.toLowerCase().replace(/[^\w]+/g, '-')}`
      
      return { id, text, level }
    })
    
    setHeadings(items)
  }, [content])
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-80px 0% -80% 0%',
        threshold: 0
      }
    )
    
    // Wait for markdown to render
    setTimeout(() => {
      headings.forEach((heading) => {
        const element = document.getElementById(heading.id)
        if (element) {
          observer.observe(element)
        }
      })
    }, 100)
    
    return () => {
      headings.forEach((heading) => {
        const element = document.getElementById(heading.id)
        if (element) {
          observer.unobserve(element)
        }
      })
    }
  }, [headings])
  
  if (headings.length < 3) return null // Only show TOC for longer articles
  
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const yOffset = -80
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }
  
  return (
    <nav className="hidden lg:block sticky top-24 ml-8 max-w-xs">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">On this page</h3>
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
          >
            <button
              onClick={() => scrollToHeading(heading.id)}
              className={`
                text-sm text-left w-full py-1 transition-colors duration-200
                ${activeId === heading.id 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}