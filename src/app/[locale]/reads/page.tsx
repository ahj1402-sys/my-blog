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
  const title = isKorean ? `읽을거리 | ${siteConfig.shortName}` : `Reads | ${siteConfig.shortName}`
  const description = isKorean
    ? `${siteConfig.shortName}이 추천하는 읽을거리 — 책, 글, 뉴스레터를 큐레이션합니다.`
    : `Curated reads from ${siteConfig.shortName} — books, articles, and newsletters worth your time.`
  return {
    title,
    description,
    alternates: { canonical: `${siteConfig.url}/${locale}/reads` },
    openGraph: { title, description, url: `${siteConfig.url}/${locale}/reads`, type: 'website' },
  }
}

export default async function ReadsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const lang = locale === 'en' ? 'en' : 'ko'
  
  return (
    <PageLayout locale={locale} currentPath="/reads">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        {lang === 'ko' ? '읽을거리' : 'Reads'}
      </h1>
      <p className="text-gray-600">
        {lang === 'ko' 
          ? '추천 읽을거리가 곧 추가될 예정입니다.'
          : 'Recommended reads coming soon.'}
      </p>
    </PageLayout>
  )
}