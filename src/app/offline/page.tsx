import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Offline',
  description: 'You appear to be offline. Reconnect to continue reading.',
  robots: { index: false, follow: false },
}

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">You're Offline</h1>
        <p className="text-lg text-gray-600 mb-8">
          It looks like you've lost your internet connection. Please check your connection and try again.
        </p>
        <Link 
          href="/" 
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </Link>
      </div>
    </div>
  )
}