import Link from 'next/link'
import { Metadata } from 'next'
import { navigationItems } from '@/lib/navigation'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isEn = locale === 'en'

  return {
    title: isEn ? 'Consulting - Cole' : '컨설팅 - Cole',
    description: isEn 
      ? 'Custom IT consulting and development services by Cole' 
      : 'Cole의 맞춤형 IT 컨설팅 및 개발 서비스',
  }
}

const problems = {
  ko: [
    {
      id: 1,
      problem: "내부 데이터 활용이 어렵나요?",
      solution: "SQL 지식 없이 자연어로 데이터를 조회하고 시각화합니다.",
      description: "DBeaver 기반에 LLM을 결합하여, 모든 팀원이 자연어로 쿼리하고 원하는 결과를 즉시 얻을 수 있는 시스템을 구축합니다.",
      image: "/images/projects/project-sql.png"
    },
    {
      id: 2,
      problem: "광고 소재 제작 리소스가 부족한가요?",
      solution: "기획안만으로 일관성 있는 광고 소재를 자동 생성합니다.",
      description: "기존 광고 소재를 학습한 AI가 마케팅 기획안을 바탕으로 영상/이미지 소재를 대량으로 제작할 수 있게 돕습니다.",
      image: "/images/projects/project-ad-creative.png"
    },
    {
      id: 3,
      problem: "오가닉 트래픽을 늘리고 싶으신가요?",
      solution: "구글 상위 노출에 최적화된 블로그 자동화 시스템을 구축합니다.",
      description: "Lighthouse 100점 만점의 기술적 SEO가 완비된 블로그를 구축하고, AI가 매일 최적화된 콘텐츠를 자동 발행합니다.",
      image: "/images/projects/project-seo-blog.png"
    },
    {
      id: 4,
      problem: "데이터 기반 전략 수립이 막막하신가요?",
      solution: "광고 데이터를 AI가 분석하여 최적의 전략을 제안합니다.",
      description: "마케팅 전문 인스트럭션이 학습된 AI가 광고 데이터를 분석하여 목표 달성을 위한 예산 및 매체 전략을 도출합니다.",
      image: "/images/projects/project-ad-analysis.png"
    },
    {
      id: 5,
      problem: "쓰레드 운영 리소스 최소화",
      solution: "쓰레드 자동 포스팅 AI",
      description: "쓰레드에 최적화된 시스템 인스트럭션을 만든 뒤, 해당 포스팅을 자동으로 할 수 있게 하는 쓰레드 자동 포스팅 AI를 만들었습니다.",
      image: "/images/projects/project-threads.png"
    },
  ],
  en: [
    {
      id: 1,
      problem: "Struggling with internal data access?",
      solution: "Query and visualize data in natural language, no SQL needed.",
      description: "Integrating LLMs with database structures allows any team member to get insights just by asking questions.",
      image: "/images/projects/project-sql.png"
    },
    {
      id: 2,
      problem: "Lack of resources for ad creatives?",
      solution: "Automatically generate consistent ad assets from just a brief.",
      description: "AI trained on your best-performing ads creates new variations, enabling massive scaling without editing skills.",
      image: "/images/projects/project-ad-creative.png"
    },
    {
      id: 3,
      problem: "Want to grow organic traffic?",
      solution: "Build an automated SEO blog system optimized for Google rankings.",
      description: "Custom-developed blogs with perfect Lighthouse scores and AI-driven daily content generation.",
      image: "/images/projects/project-seo-blog.png"
    },
    {
      id: 4,
      problem: "Unsure about your marketing strategy?",
      solution: "AI analyzes ad data to propose optimal growth strategies.",
      description: "Specialized AI instructions process your data to suggest budget allocation and media strategies based on real performance.",
      image: "/images/projects/project-ad-analysis.png"
    },
    {
      id: 5,
      problem: "Overwhelmed by SNS management?",
      solution: "Minimize operation resources with AI-driven auto-posting.",
      description: "Setup AI personas that automatically create and schedule high-quality posts tailored to platforms like Threads.",
      image: "/images/projects/project-threads.png"
    },
  ],
};

const profile = {
  ko: {
    name: "콜(Cole)",
    intro: "비즈니스 실무자가 직접 사용하는 AI와 자동화 시스템을 만듭니다.",
    achievements: [
      "콜잇AI - AI 실무 교육 유튜버 (2025.08~)",
      "패스트캠퍼스, 비상, 아정당 등 다수 기업 특강 진행",
      "셀피쉬클럽 - 초기 멤버 (2023.03~)",
      "마켓핏랩 - 그로스PM (2022.03~)",
      "시리즈B 투자 AI 스타트업 초기멤버 & 이사 (2020.03~)",
      "AC2(애자일 코칭 제곱) 47기 수료",
      "Webflow 전 자격증 취득",
    ],
  },
  en: {
    name: "Cole",
    intro: "Building AI and automation systems that business practitioners actually use.",
    achievements: [
      "Cole It AI - AI Practitioner YouTuber (Aug 2025~)",
      "Corporate training for FastCampus, Visang, Ajungdang, etc.",
      "Selfish Club - Early Member (Mar 2023~)",
      "MarketFitLab - Growth PM (Mar 2022~)",
      "Co-founder & Director at Series B AI Startup (Mar 2020~)",
      "AC2 (Agile Coaching Squared) 47th Cohort",
      "Webflow Certified Professional",
    ],
  },
};

export default async function ConsultingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const lang = locale === 'en' ? 'en' : 'ko'
  const isEn = lang === 'en'

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                <img src="/images/character.png" alt="Cole It AI Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tighter leading-none">COLE IT</span>
                <span className="text-xs font-bold text-gray-500 tracking-widest leading-none mt-1">AI CONSULTING</span>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex gap-1 bg-gray-100 p-1 rounded-md">
                <Link
                  href="/consulting"
                  className={`px-3 py-1 text-xs font-semibold rounded ${lang === 'ko' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  KO
                </Link>
                <Link
                  href="/consulting"
                  className={`px-3 py-1 text-xs font-semibold rounded ${lang === 'en' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  EN
                </Link>
              </div>
            </div>
          </div>
          <nav className="flex gap-6 pb-4">
            <span
              className="text-sm font-bold text-gray-900 border-b-2 border-gray-900 pb-4 -mb-4"
            >
              {isEn ? 'Consulting' : '컨설팅'}
            </span>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gray-50 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h2 className="text-lg font-bold text-gray-400 mb-4 tracking-widest uppercase">
                {isEn ? 'IT Consulting & Development' : 'IT 컨설팅 & 외주 개발'}
              </h2>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-8 leading-tight">
                {isEn 
                  ? 'Solving complex business problems with AI and technology.' 
                  : '비즈니스의 복잡한 문제를\nAI와 기술로 해결합니다.'}
              </h1>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed break-keep">
                {isEn
                  ? 'We design and build custom automation systems that eliminate repetitive tasks and create new business opportunities.'
                  : '반복적인 업무는 줄이고, 데이터와 기술을 통해 새로운 비즈니스 기회를 창출하는 맞춤형 자동화 시스템을 설계하고 구축합니다.'}
              </p>
              <Link 
                href="mailto:cole.hkg@gmail.com"
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-lg text-white bg-gray-900 hover:bg-gray-800 transition-colors"
              >
                {isEn ? 'Get in Touch' : '문의하기'}
              </Link>
            </div>
          </div>
        </section>

        {/* Problems & Solutions Section */}
        <section className="py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {isEn ? 'What can we solve?' : '어떤 고민이 있으신가요?'}
              </h2>
              <p className="text-gray-500 text-lg">
                {isEn 
                  ? 'We provide tailored solutions for common business growth bottlenecks.' 
                  : '비즈니스 성장의 병목이 되는 지점들을 맞춤형으로 해결합니다.'}
              </p>
            </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {problems[lang].map((item) => (
                  <div key={item.id} className="group overflow-hidden rounded-2xl border border-gray-100 bg-white hover:border-gray-900 transition-all duration-300 flex flex-col">
                    {item.image && (
                      <div className="relative aspect-video overflow-hidden bg-gray-100">
                        <img 
                          src={item.image} 
                          alt={item.solution}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-8 flex-1 group-hover:bg-gray-900 group-hover:text-white transition-colors duration-300">
                      <div className="mb-6 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 text-gray-900 font-bold group-hover:bg-white/10 group-hover:text-white transition-colors">
                        0{item.id}
                      </div>
                      <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-tight group-hover:text-gray-300">
                        {item.problem}
                      </h3>
                      <h4 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-white transition-colors">
                        {item.solution}
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-300">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              
              {/* Additional Service Card */}
              <div className="p-8 rounded-2xl border border-dashed border-gray-300 flex flex-col justify-center items-center text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {isEn ? 'Something else?' : '그 외의 고민이 있으신가요?'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {isEn ? 'Tell us about your specific business process.' : '귀사의 구체적인 비즈니스 프로세스를 말씀해 주세요.'}
                </p>
                <Link href="mailto:cole.hkg@gmail.com" className="text-gray-900 font-bold underline underline-offset-4">
                  {isEn ? 'Custom Inquiry' : '별도 문의하기'}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Profile & Achievements Section */}
        <section className="py-24 bg-gray-900 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <div>
                <h2 className="text-lg font-bold text-gray-400 mb-4 tracking-widest uppercase">
                  {isEn ? 'About Cole' : '성과 및 이력'}
                </h2>
                <h3 className="text-4xl font-extrabold mb-8">
                  {profile[lang].name}
                </h3>
                <p className="text-xl text-gray-300 mb-12 break-keep">
                  {profile[lang].intro}
                </p>
                
                <div className="space-y-8">
                  <div>
                    <h4 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">{isEn ? 'Experience & Activities' : '경력 및 활동'}</h4>
                    <ul className="space-y-3">
                      {profile[lang].achievements.map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="text-gray-500 mt-1">•</span>
                          <span className="text-gray-200">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 p-8 sm:p-12 rounded-3xl">
                <h3 className="text-2xl font-bold mb-8">{isEn ? 'Ready to work together?' : '함께 시작할 준비가 되셨나요?'}</h3>
                <p className="text-gray-400 mb-10 leading-relaxed">
                  {isEn 
                    ? 'Book a consultation to discuss how we can automate your workflow and scale your business with custom tech solutions.'
                    : '귀사의 워크플로우를 자동화하고, 맞춤형 기술 솔루션을 통해 비즈니스를 확장하는 방법을 상담해 보세요.'}
                </p>
                <div className="space-y-4">
                  <Link 
                    href="mailto:cole.hkg@gmail.com"
                    className="flex items-center justify-center w-full py-4 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    cole.hkg@gmail.com
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Cole It AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
