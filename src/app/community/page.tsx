import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Community - CMA Blog',
  description: 'Join our community',
}

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="text-3xl font-bold text-gray-900">
              CMA Blog
            </Link>
            <nav>
              <Link href="/about" className="text-gray-600 hover:text-gray-900 ml-6">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 ml-6">Contact</Link>
              <Link href="/archive" className="text-gray-600 hover:text-gray-900 ml-6">Archive</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Community</h1>
        <p className="text-xl text-gray-600 mb-8">Coming soon...</p>
        <Link href="/" className="text-blue-600 hover:text-blue-800 underline">
          ← Back to home
        </Link>
      </main>
    </div>
  )
}