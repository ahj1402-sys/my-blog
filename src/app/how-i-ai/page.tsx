import { Metadata } from 'next'
import Link from 'next/link'
import { siteConfig } from '@/config'

export const metadata: Metadata = {
  title: `How I AI | ${siteConfig.shortName}`,
  description: `How I use AI tools to research, write, and publish content on ${siteConfig.name}. Workflow, prompts, and lessons learned.`,
  alternates: { canonical: `${siteConfig.url}/how-i-ai` },
  openGraph: {
    title: `How I AI | ${siteConfig.shortName}`,
    description: `How I use AI tools to research, write, and publish content on ${siteConfig.name}.`,
    url: `${siteConfig.url}/how-i-ai`,
    type: 'article',
  },
}

export default function HowIAIPage() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-8">How I AI</h1>
        <p className="text-xl text-gray-600 mb-8">Coming soon...</p>
        <Link href="/" className="text-blue-600 hover:text-blue-800 underline">
          ← Back to home
        </Link>
      </main>
    </div>
  )
}