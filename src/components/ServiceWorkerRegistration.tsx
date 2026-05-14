'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      setTimeout(() => {
        navigator.serviceWorker.register('/sw.js').catch(() => {})
      }, 7000) // 7s delay - after all other scripts
    }
  }, [])

  return null
}