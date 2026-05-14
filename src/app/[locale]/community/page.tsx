import PageLayout from '@/components/PageLayout'
import type { Metadata } from 'next'
import { siteConfig } from '@/config'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isKorean = locale === 'ko'
  const title = isKorean ? `커뮤니티 | ${siteConfig.shortName}` : `Community | ${siteConfig.shortName}`
  const description = isKorean
    ? `${siteConfig.shortName} 커뮤니티 — 독자와 함께 토론하고 의견을 나누는 공간입니다.`
    : `${siteConfig.shortName} community — discuss and share ideas with other readers.`
  return {
    title,
    description,
    alternates: { canonical: `${siteConfig.url}/${locale}/community` },
    openGraph: { title, description, url: `${siteConfig.url}/${locale}/community`, type: 'website' },
  }
}

export default async function CommunityPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const lang = locale === 'en' ? 'en' : 'ko'
  
  return (
    <PageLayout locale={locale} currentPath="/community">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        {lang === 'ko' ? '커뮤니티' : 'Community'}
      </h1>
      <p className="text-gray-600">
        {lang === 'ko' 
          ? '커뮤니티 기능이 곧 추가될 예정입니다.'
          : 'Community features coming soon.'}
      </p>
    </PageLayout>
  )
}