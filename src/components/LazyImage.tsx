'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
  width?: number
  height?: number
}

export default function LazyImage({
  src,
  alt,
  className = '',
  priority = false,
  fill,
  sizes,
  width,
  height
}: LazyImageProps) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (priority || hasLoaded) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '250px',
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [priority, hasLoaded])

  const shouldLoad = priority || isIntersecting

  // For markdown images, we don't know dimensions, so use regular img with lazy loading
  if (!fill && !width && !height) {
    return (
      <div ref={ref} style={{maxWidth: '100%', margin: '1.5rem 0'}}>
        {shouldLoad ? (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            style={{maxWidth: '100%', height: 'auto', borderRadius: '0.5rem'}}
            onLoad={() => setHasLoaded(true)}
            className={!hasLoaded ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}
          />
        ) : (
          <div style={{paddingBottom: '56.25%', backgroundColor: '#e5e7eb', borderRadius: '0.5rem'}} />
        )}
      </div>
    )
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      {shouldLoad && (
        <Image
          src={src}
          alt={alt}
          fill={fill}
          width={width}
          height={height}
          sizes={sizes}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={() => setHasLoaded(true)}
          className={`${className} ${!hasLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        />
      )}
      {!hasLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  )
}
