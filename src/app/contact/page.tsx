import Link from 'next/link'
import type { Metadata } from 'next'
import { siteConfig, brandConfig } from '@/config'

export const metadata: Metadata = {
  title: `Contact | ${siteConfig.shortName}`,
  description: `Get in touch with ${siteConfig.name} — questions, partnerships, and collaboration opportunities.`,
  alternates: { canonical: `${siteConfig.url}/contact` },
  openGraph: {
    title: `Contact | ${siteConfig.shortName}`,
    description: `Get in touch with ${siteConfig.name}.`,
    url: `${siteConfig.url}/contact`,
    type: 'website',
  },
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <a href={brandConfig.logo.url || '/'} className="flex items-center">
              {brandConfig.logo.image ? (
                <img src={brandConfig.logo.image} alt={brandConfig.logo.text} className="h-6 w-auto" />
              ) : (
                <span className="text-3xl font-bold text-gray-900">{brandConfig.logo.text}</span>
              )}
            </a>
            <nav>
              <Link href="/about" className="text-gray-600 hover:text-gray-900 ml-6">About</Link>
              <Link href="/contact" className="text-gray-900 hover:text-gray-600 ml-6">Contact</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Contact</h1>
        
        <div className="prose prose-lg">
          <p>We'd love to hear from you! Whether you have questions, feedback, or just want to say hello, feel free to reach out.</p>
          
          <h2>Get in Touch</h2>
          <div className="bg-gray-50 p-6 rounded-lg my-8">
            <p className="mb-4"><strong>Email:</strong> {siteConfig.emails.contact}</p>
            {siteConfig.social.twitter && <p className="mb-4"><strong>Twitter:</strong> {siteConfig.social.twitter}</p>}
            {siteConfig.social.github && <p><strong>GitHub:</strong> {siteConfig.social.github}</p>}
          </div>
          
          <h2>Collaboration</h2>
          <p>Interested in collaborating or guest posting? We're always open to new ideas and partnerships. Send us an email with your proposal!</p>
          
          <h2>Feedback</h2>
          <p>Your feedback helps us improve. If you have suggestions for topics you'd like to see covered or ways we can enhance your reading experience, please let us know.</p>
        </div>
      </main>

      <footer className="bg-gray-50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} {brandConfig.copyright.holder}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}