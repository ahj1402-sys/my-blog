'use client'

import { useEffect, useRef } from 'react'
import Script from 'next/script'

/**
 * Coupang Partners Dynamic Banner Component
 *
 * Displays contextual product recommendations based on page content.
 * Automatically tracks clicks and conversions.
 *
 * @example
 * ```tsx
 * <CoupangBanner widgetId="123456" size="responsive" />
 * ```
 */

interface CoupangBannerProps {
  /** Widget ID from Coupang Partners Dashboard */
  widgetId: string

  /** Banner size (default: responsive) */
  size?: '300x250' | '320x50' | '728x90' | '160x600' | 'responsive'

  /** Banner type (default: standard) */
  type?: 'standard' | 'carousel'

  /** Number of products in carousel (type="carousel" only) */
  count?: number

  /** Additional CSS classes */
  className?: string

  /** Whether to show on mobile (default: true) */
  showOnMobile?: boolean

  /** Whether to show on desktop (default: true) */
  showOnDesktop?: boolean
}

export default function CoupangBanner({
  widgetId,
  size = 'responsive',
  type = 'standard',
  count = 4,
  className = '',
  showOnMobile = true,
  showOnDesktop = true
}: CoupangBannerProps) {
  const bannerRef = useRef<HTMLModElement>(null)
  const scriptLoadedRef = useRef(false)

  useEffect(() => {
    // Reinitialize Coupang banner when component mounts or updates
    if (typeof window !== 'undefined' && (window as any).coupang && scriptLoadedRef.current) {
      try {
        (window as any).coupang.init()
      } catch {
        // Silent fail - Coupang banner init is non-critical
      }
    }
  }, [widgetId])

  const handleScriptLoad = () => {
    scriptLoadedRef.current = true
    if (typeof window !== 'undefined' && (window as any).coupang) {
      try {
        (window as any).coupang.init()
      } catch {
        // Silent fail - Coupang banner init is non-critical
      }
    }
  }

  const partnerId = process.env.NEXT_PUBLIC_COUPANG_PARTNER_ID

  if (!partnerId) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('NEXT_PUBLIC_COUPANG_PARTNER_ID is not set. Banner will not display.')
    }
    return null
  }

  // Responsive visibility classes
  const visibilityClass =
    !showOnMobile && showOnDesktop ? 'hidden md:block' :
    showOnMobile && !showOnDesktop ? 'block md:hidden' :
    'block'

  return (
    <>
      <div
        className={`coupang-banner-wrapper ${visibilityClass} ${className}`}
        data-banner-type="coupang-dynamic"
      >
        <ins
          ref={bannerRef}
          className="coupang-banner-tag"
          data-client-id={partnerId}
          data-widget-id={widgetId}
          data-size={size === 'responsive' ? undefined : size}
          data-responsive={size === 'responsive' ? 'true' : undefined}
          data-type={type}
          data-count={type === 'carousel' ? count : undefined}
          style={{
            display: 'block',
            width: size === 'responsive' ? '100%' : undefined,
            textAlign: 'center'
          }}
        />

        {/* Legal Disclosure */}
        <p className="text-xs text-gray-500 mt-2 text-center">
          이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
        </p>
      </div>

      {/* Load Coupang banner script (lazy loaded) */}
      <Script
        src="https://ads-partners.coupang.com/g.js"
        strategy="lazyOnload"
        onLoad={handleScriptLoad}
        onError={() => {
          // Silently handle script load failure
        }}
      />
    </>
  )
}

/**
 * Preset Banner Configurations
 */

export function CoupangBannerMidContent({ className = '' }: { className?: string }) {
  return (
    <CoupangBanner
      widgetId={process.env.NEXT_PUBLIC_COUPANG_WIDGET_MID_CONTENT || ''}
      size="responsive"
      type="standard"
      className={`my-8 ${className}`}
    />
  )
}

export function CoupangBannerEndPost({ className = '' }: { className?: string }) {
  return (
    <CoupangBanner
      widgetId={process.env.NEXT_PUBLIC_COUPANG_WIDGET_END_POST || ''}
      size="responsive"
      type="carousel"
      count={4}
      className={`my-12 ${className}`}
    />
  )
}

export function CoupangBannerSidebar({ className = '' }: { className?: string }) {
  return (
    <CoupangBanner
      widgetId={process.env.NEXT_PUBLIC_COUPANG_WIDGET_SIDEBAR || ''}
      size="300x250"
      type="standard"
      className={className}
      showOnMobile={false}
      showOnDesktop={true}
    />
  )
}
