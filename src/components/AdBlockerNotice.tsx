'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { detectAdBlocker, hasSeenAdBlockerNotice, markAdBlockerNoticeSeen } from '@/lib/detectAdBlocker'

export default function AdBlockerNotice() {
  const pathname = usePathname()
  const [showNotice, setShowNotice] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    // Don't show on admin pages
    if (pathname?.startsWith('/admin')) return

    // Don't show if user has already seen the notice
    if (hasSeenAdBlockerNotice()) return

    // Detect ad blocker after a short delay to avoid impacting initial page load
    // Delay detection to avoid blocking main thread
    const timer = setTimeout(async () => {
      const isBlocked = await detectAdBlocker()
      if (isBlocked) setShowNotice(true)
    }, 6000) // 6s delay - well after interactive

    return () => clearTimeout(timer)
  }, [pathname])

  const handleClose = () => {
    setIsClosing(true)

    // Mark as seen so it won't show again
    markAdBlockerNoticeSeen()

    // Wait for animation to complete before removing from DOM
    setTimeout(() => {
      setShowNotice(false)
    }, 300)
  }

  if (!showNotice) return null

  return (
    <div
      className={`fixed bottom-6 right-6 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-5 z-50 transition-all duration-300 ${
        isClosing ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="adblock-notice-title"
      aria-describedby="adblock-notice-description"
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        aria-label="Close"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Icon */}
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <div className="flex-1 pr-4">
          <h3
            id="adblock-notice-title"
            className="font-semibold text-gray-900 dark:text-white mb-2"
          >
            Ad Blocker 감지됨
          </h3>
          <p
            id="adblock-notice-description"
            className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3"
          >
            광고 차단 프로그램이 활성화되어 있습니다.
            <br />
            광고를 허용해주시면 양질의 콘텐츠를 계속 제공하는 데 큰 도움이 됩니다. 🙏
          </p>
          <button
            onClick={handleClose}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            이해했습니다
          </button>
        </div>
      </div>
    </div>
  )
}
