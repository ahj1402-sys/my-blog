import Link from 'next/link'
import { brandConfig, navigationConfig } from '@/config'

interface SiteHeaderProps {
  /** 현재 경로 — 네비 active 상태 표시용. 미지정 시 '/' 로 가정 */
  currentPath?: string
  /** locale 키 (default 'ko') */
  locale?: keyof typeof navigationConfig
}

export default function SiteHeader({
  currentPath = '/',
  locale = 'ko',
}: SiteHeaderProps) {
  const items = navigationConfig[locale] ?? navigationConfig.ko

  return (
    <header className="bg-blue-900 border-b border-blue-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-8">
          <a href={brandConfig.logo.url || '/'} className="flex items-center">
            {brandConfig.logo.image ? (
              <img
                src={brandConfig.logo.image}
                alt={brandConfig.logo.text}
                className="h-6 w-auto"
              />
            ) : (
              <span className="text-2xl font-bold tracking-tight text-white">
                {brandConfig.logo.text}
              </span>
            )}
          </a>
        </div>
        <nav
          className="flex justify-center items-center gap-6 pb-4"
          aria-label="Main navigation"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium pb-2 transition-colors ${
                currentPath === item.href
                  ? 'text-white border-b-2 border-white'
                  : 'text-blue-200 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
