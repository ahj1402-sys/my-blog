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
  const title = isKorean ? `팟캐스트 | ${siteConfig.shortName}` : `Podcast | ${siteConfig.shortName}`
  const description = isKorean
    ? `${siteConfig.shortName} 팟캐스트 — 블로그 주제와 관련된 음성 콘텐츠를 모았습니다.`
    : `${siteConfig.shortName} podcast — audio content covering blog topics.`
  return {
    title,
    description,
    alternates: { canonical: `${siteConfig.url}/${locale}/podcast` },
    openGraph: { title, description, url: `${siteConfig.url}/${locale}/podcast`, type: 'website' },
  }
}

export default async function PodcastPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const lang = locale === 'en' ? 'en' : 'ko'
  
  return (
    <PageLayout locale={locale} currentPath="/podcast">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        {lang === 'ko' ? '팟캐스트' : 'Podcast'}
      </h1>
      <p className="text-gray-600">
        {lang === 'ko' 
          ? '팟캐스트 콘텐츠가 곧 추가될 예정입니다.'
          : 'Podcast content coming soon.'}
      </p>
    </PageLayout>
  )
}