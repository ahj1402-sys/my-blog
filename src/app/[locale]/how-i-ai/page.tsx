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
  const title = isKorean ? `내가 AI를 쓰는 법 | ${siteConfig.shortName}` : `How I AI | ${siteConfig.shortName}`
  const description = isKorean
    ? `AI 도구를 어떻게 활용해 글을 쓰고, 검색하고, 자동화하는지 정리합니다.`
    : `How I use AI tools to research, write, and automate publishing.`
  return {
    title,
    description,
    alternates: { canonical: `${siteConfig.url}/${locale}/how-i-ai` },
    openGraph: { title, description, url: `${siteConfig.url}/${locale}/how-i-ai`, type: 'article' },
  }
}

export default async function HowIAIPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const lang = locale === 'en' ? 'en' : 'ko'
  
  return (
    <PageLayout locale={locale} currentPath="/how-i-ai">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        {lang === 'ko' ? '내가 AI를 쓰는 법' : 'How I AI'}
      </h1>
      <p className="text-gray-600">
        {lang === 'ko' 
          ? 'AI 활용 방법에 대한 콘텐츠가 곧 추가될 예정입니다.'
          : 'Content about how I use AI coming soon.'}
      </p>
    </PageLayout>
  )
}