import PageLayout from '@/components/PageLayout'
import type { Metadata } from 'next'
import { siteConfig, brandConfig } from '@/config'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isKorean = locale === 'ko'
  const blogName = siteConfig.shortName || brandConfig.logo.text || siteConfig.name
  const title = isKorean ? `${blogName} 소개 | ${siteConfig.shortName}` : `About ${blogName} | ${siteConfig.shortName}`
  const description = isKorean
    ? `${blogName} 블로그를 운영하는 사람과 다루는 주제, 운영 방식을 소개합니다.`
    : `About ${blogName} — who runs the blog, the topics we cover, and how we publish.`
  return {
    title,
    description,
    alternates: { canonical: `${siteConfig.url}/${locale}/about` },
    openGraph: { title, description, url: `${siteConfig.url}/${locale}/about`, type: 'website' },
  }
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const blogName = siteConfig.shortName || brandConfig.logo.text || siteConfig.name

  return (
    <PageLayout locale={locale} currentPath="/about">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        {blogName} 소개
      </h1>

      <div className="prose prose-lg max-w-none">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <p className="text-yellow-800 font-medium mb-2">
            안내: 이 페이지를 수정해서 본인의 소개를 작성하세요.
          </p>
          <p className="text-yellow-700 text-sm">
            이 파일은 <code className="bg-yellow-100 px-1 rounded">src/app/[locale]/about/page.tsx</code> 에서 수정할 수 있습니다.
          </p>
        </div>

        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          <strong>{blogName}</strong>에 방문해 주셔서 감사합니다.
          이곳에서 본인의 블로그 소개, 운영 목적, 작성자 정보 등을 자유롭게 작성하세요.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">블로그 소개</h2>
        <p className="text-gray-700 leading-relaxed mb-6">
          여기에 블로그의 주제, 목적, 독자에게 제공하는 가치를 설명하세요.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">문의</h2>
        <p className="text-gray-700 leading-relaxed">
          문의 사항이 있으시면{' '}
          <a href={`mailto:${siteConfig.emails.contact}`} className="text-blue-600 hover:underline font-medium">
            {siteConfig.emails.contact}
          </a>
          으로 연락해 주세요.
        </p>
      </div>
    </PageLayout>
  )
}
