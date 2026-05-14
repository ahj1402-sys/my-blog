import Link from 'next/link'
import type { Metadata } from 'next'
import { siteConfig } from '@/config'

export const metadata: Metadata = {
  title: `About | ${siteConfig.shortName}`,
  description: `About ${siteConfig.name} — our mission, what we write about, and the people behind the blog.`,
  alternates: { canonical: `${siteConfig.url}/about` },
  openGraph: {
    title: `About | ${siteConfig.shortName}`,
    description: `About ${siteConfig.name} — our mission, what we write about, and the people behind the blog.`,
    url: `${siteConfig.url}/about`,
    type: 'website',
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="text-3xl font-bold text-gray-900">
              CMA Blog
            </Link>
            <nav>
              <Link href="/about" className="text-gray-900 hover:text-gray-600 ml-6">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 ml-6">Contact</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About</h1>
        
        <div className="prose prose-lg">
          <p>Welcome to CMA Blog, a platform for sharing insights, ideas, and stories.</p>
          
          <h2>Our Mission</h2>
          <p>We believe in the power of words to inspire, educate, and connect people. Through this blog, we aim to create meaningful content that resonates with our readers.</p>
          
          <h2>What We Write About</h2>
          <ul>
            <li>Technology and Innovation</li>
            <li>Personal Development</li>
            <li>Creative Writing</li>
            <li>Industry Insights</li>
          </ul>
          
          <h2>Get in Touch</h2>
          <p>We'd love to hear from you! Visit our <Link href="/contact" className="text-blue-600 hover:underline">contact page</Link> to reach out.</p>
        </div>
      </main>

      <footer className="bg-gray-50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} CMA Blog. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}