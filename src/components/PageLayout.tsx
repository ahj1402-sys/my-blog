import Link from 'next/link'
import { brandConfig, navigationConfig } from '@/config'

interface PageLayoutProps {
  locale: string
  currentPath: string
  children: React.ReactNode
}

export default function PageLayout({ locale, currentPath, children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <a href={brandConfig.logo.url || '/'} className="flex items-center">
              {brandConfig.logo.image ? (
                <img src={brandConfig.logo.image} alt={brandConfig.logo.text} className="h-6 w-auto" />
              ) : (
                <span className="logo-text">{brandConfig.logo.text}</span>
              )}
            </a>
          </div>
          {/* Navigation */}
          <nav className="flex justify-center items-center gap-6 pb-4" aria-label="Main navigation">
            {(navigationConfig.ko).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium pb-2 ${
                  currentPath === item.href
                    ? 'text-gray-900 border-b-2 border-gray-900' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            &copy; {brandConfig.copyright.startYear} {brandConfig.copyright.holder}
          </div>
        </div>
      </footer>
    </div>
  )
}