import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

function createPrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  if (tursoUrl) {
    const adapter = new PrismaLibSQL({
      url: tursoUrl,
      authToken: process.env.DATABASE_AUTH_TOKEN || '',
    })
    return new PrismaClient({ adapter })
  }
  return new PrismaClient()
}

const prisma = createPrismaClient()

const dummyPosts = [
  {
    title: 'Next.js 15로 블로그 만들기 완벽 가이드',
    slug: 'nextjs-15-blog-guide',
    content: `## Next.js 15 블로그 시작하기

Next.js 15는 React 19를 기반으로 한 최신 프레임워크입니다. 이 글에서는 Next.js 15의 App Router를 사용하여 SEO에 최적화된 블로그를 만드는 방법을 알아보겠습니다.

### App Router의 장점

App Router는 Server Components를 기본으로 사용하여 초기 로딩 속도가 빠릅니다.

- **서버 컴포넌트**: JavaScript 번들 크기 감소
- **스트리밍**: 점진적 렌더링으로 사용자 경험 개선
- **메타데이터 API**: SEO 최적화를 위한 내장 도구

### 프로젝트 구조

\`\`\`
src/
  app/
    page.tsx          # 홈페이지
    posts/
      [slug]/
        page.tsx      # 글 상세 페이지
  components/
    PostCard.tsx      # 글 카드 컴포넌트
  lib/
    prisma.ts         # DB 연결
\`\`\`

### 정적 생성 (SSG)

블로그 글은 빌드 시 정적으로 생성하면 성능이 극대화됩니다. \`generateStaticParams\`를 사용하면 각 글마다 HTML 파일이 미리 생성됩니다.

### 마무리

Next.js 15의 App Router는 블로그에 최적화된 프레임워크입니다. SSG, 메타데이터 API, 이미지 최적화 등 SEO에 필요한 모든 기능을 내장하고 있습니다.`,
    excerpt: 'Next.js 15의 App Router를 사용하여 Lighthouse 100점 블로그를 만드는 완벽 가이드입니다.',
    tags: 'Next.js,React,블로그,웹개발,SSG',
    seoTitle: 'Next.js 15 블로그 만들기 - 완벽 가이드 (2025)',
    seoDescription: 'Next.js 15 App Router로 SEO 최적화 블로그를 만드는 방법을 단계별로 알아봅니다.',
    author: 'Blog Author',
    coverImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=630&fit=crop',
  },
  {
    title: 'Tailwind CSS 4 새로운 기능 총정리',
    slug: 'tailwind-css-4-new-features',
    content: `## Tailwind CSS 4의 변화

Tailwind CSS 4는 성능과 개발자 경험을 크게 개선했습니다.

### 주요 변경사항

1. **Oxide 엔진**: Rust로 작성된 새로운 엔진으로 빌드 속도 10배 향상
2. **CSS 기반 설정**: tailwind.config.js 대신 CSS 변수로 설정
3. **자동 콘텐츠 감지**: content 경로 설정 불필요

### CSS 변수 기반 테마

\`\`\`css
@theme {
  --color-primary: #3b82f6;
  --color-secondary: #10b981;
  --font-sans: 'Pretendard', sans-serif;
}
\`\`\`

### 성능 비교

| 항목 | v3 | v4 |
|------|-----|-----|
| 빌드 속도 | 350ms | 35ms |
| CSS 크기 | 38KB | 28KB |
| HMR | 120ms | 8ms |

### 마이그레이션 팁

기존 프로젝트를 v4로 마이그레이션할 때는 공식 마이그레이션 도구를 사용하세요.`,
    excerpt: 'Tailwind CSS 4의 Oxide 엔진, CSS 기반 설정 등 새로운 기능을 정리했습니다.',
    tags: 'TailwindCSS,CSS,프론트엔드,웹개발',
    seoTitle: 'Tailwind CSS 4 새 기능 총정리 - 빌드 속도 10배 향상',
    seoDescription: 'Tailwind CSS 4의 Oxide 엔진, CSS 변수 기반 설정 등 주요 변경사항을 알아봅니다.',
    author: 'Blog Author',
    coverImage: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=1200&h=630&fit=crop',
  },
  {
    title: 'TypeScript 타입 가드 실전 활용법',
    slug: 'typescript-type-guard-practical',
    content: `## 타입 가드란?

TypeScript에서 타입 가드(Type Guard)는 런타임에서 변수의 타입을 좁혀주는 기법입니다.

### typeof 타입 가드

\`\`\`typescript
function processValue(value: string | number) {
  if (typeof value === 'string') {
    // 여기서 value는 string 타입
    return value.toUpperCase()
  }
  // 여기서 value는 number 타입
  return value.toFixed(2)
}
\`\`\`

### 사용자 정의 타입 가드

\`\`\`typescript
interface Cat {
  meow(): void
}

interface Dog {
  bark(): void
}

function isCat(animal: Cat | Dog): animal is Cat {
  return 'meow' in animal
}
\`\`\`

### in 연산자 활용

\`\`\`typescript
interface AdminUser {
  role: 'admin'
  permissions: string[]
}

interface RegularUser {
  role: 'user'
  email: string
}

function handleUser(user: AdminUser | RegularUser) {
  if ('permissions' in user) {
    // AdminUser
    console.log(user.permissions)
  }
}
\`\`\`

### 실전 팁

- Discriminated Union과 함께 사용하면 효과적
- API 응답 파싱에서 특히 유용
- Zod 같은 라이브러리와 결합하면 런타임 검증까지 가능`,
    excerpt: 'TypeScript 타입 가드의 종류와 실전에서 활용하는 방법을 코드 예제와 함께 알아봅니다.',
    tags: 'TypeScript,타입가드,웹개발,프로그래밍',
    seoTitle: 'TypeScript 타입 가드 실전 활용법 - 코드 안전성 높이기',
    seoDescription: 'typeof, instanceof, 사용자 정의 타입 가드 등 TypeScript 타입 가드를 실전 예제로 배워봅니다.',
    author: 'Blog Author',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=630&fit=crop',
  },
  {
    title: 'Lighthouse 점수 100점 만드는 비법',
    slug: 'lighthouse-perfect-score-tips',
    content: `## Lighthouse 400점의 비밀

Google Lighthouse는 성능, 접근성, 모범사례, SEO 4개 카테고리에서 각 100점을 평가합니다. 총 400점을 달성하는 방법을 알아보겠습니다.

### 성능 (Performance) 100점

- **이미지 최적화**: next/image 컴포넌트로 WebP/AVIF 자동 변환
- **코드 분할**: dynamic import로 필요한 코드만 로드
- **폰트 최적화**: next/font로 FOUT/FOIT 방지
- **캐싱**: Cache-Control 헤더 설정

### 접근성 (Accessibility) 100점

- 모든 이미지에 alt 속성 필수
- 색상 대비 4.5:1 이상
- 키보드 네비게이션 지원
- ARIA 레이블 적절히 사용

### 모범사례 (Best Practices) 100점

- HTTPS 사용
- console.error 제거
- 최신 JavaScript API 사용
- CSP 헤더 설정

### SEO 100점

- meta title, description 필수
- 구조화된 데이터 (JSON-LD)
- robots.txt, sitemap.xml
- canonical URL 설정

### 핵심 요약

1. next/image + next/font 적극 활용
2. 접근성은 개발 초기부터 적용
3. meta 태그와 JSON-LD 빠짐없이 설정
4. 배포 후 실제 URL로 Lighthouse 측정`,
    excerpt: 'Google Lighthouse 성능, 접근성, 모범사례, SEO 각 100점을 달성하는 실전 비법을 공유합니다.',
    tags: 'Lighthouse,성능최적화,SEO,웹개발,접근성',
    seoTitle: 'Lighthouse 400점 달성 비법 - 성능, 접근성, SEO 완벽 가이드',
    seoDescription: 'Google Lighthouse 4개 카테고리 모두 100점을 달성하는 구체적인 방법을 알아봅니다.',
    author: 'Blog Author',
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop',
  },
  {
    title: 'Prisma ORM 시작하기 - 데이터베이스 쉽게 다루기',
    slug: 'prisma-orm-getting-started',
    content: `## Prisma란?

Prisma는 Node.js와 TypeScript를 위한 차세대 ORM입니다. SQL을 직접 작성하지 않고도 타입 안전하게 데이터베이스를 다룰 수 있습니다.

### 설치 및 초기화

\`\`\`bash
npm install prisma @prisma/client
npx prisma init
\`\`\`

### 스키마 정의

\`\`\`prisma
model Post {
  id          String   @id @default(cuid())
  title       String
  content     String
  published   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
\`\`\`

### CRUD 작업

\`\`\`typescript
// 생성
const post = await prisma.post.create({
  data: {
    title: '첫 번째 글',
    content: '안녕하세요!',
  },
})

// 조회
const posts = await prisma.post.findMany({
  where: { published: true },
  orderBy: { createdAt: 'desc' },
})

// 수정
await prisma.post.update({
  where: { id: 'abc123' },
  data: { published: true },
})

// 삭제
await prisma.post.delete({
  where: { id: 'abc123' },
})
\`\`\`

### Prisma Studio

\`npx prisma studio\`를 실행하면 웹 브라우저에서 데이터베이스를 직접 확인하고 편집할 수 있습니다.`,
    excerpt: 'Prisma ORM의 기본 사용법부터 CRUD 작업까지, TypeScript 기반 데이터베이스 관리를 배워봅니다.',
    tags: 'Prisma,ORM,데이터베이스,TypeScript,백엔드',
    seoTitle: 'Prisma ORM 시작 가이드 - TypeScript 데이터베이스 쉽게 다루기',
    seoDescription: 'Prisma ORM으로 TypeScript에서 타입 안전하게 데이터베이스를 다루는 방법을 배웁니다.',
    author: 'Blog Author',
    coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1200&h=630&fit=crop',
  },
  {
    title: 'Vercel 무료 배포 완전 정복',
    slug: 'vercel-free-deployment-guide',
    content: `## Vercel이란?

Vercel은 Next.js를 만든 회사가 운영하는 클라우드 플랫폼입니다. GitHub 레포지토리를 연결하면 자동으로 빌드하고 배포해줍니다.

### 무료 플랜으로 할 수 있는 것

- 무제한 프로젝트 배포
- 자동 HTTPS (SSL 인증서)
- 글로벌 CDN
- 커스텀 도메인 연결
- 자동 미리보기 배포 (PR마다)

### 배포 과정

1. **GitHub에 코드 올리기**: 레포지토리 생성 후 push
2. **Vercel에서 Import**: vercel.com → New Project → GitHub 레포 선택
3. **환경 변수 설정**: Settings → Environment Variables에 필수 값 입력
4. **Deploy 클릭**: 자동으로 빌드 + 배포

### 환경 변수 설정

\`\`\`
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
DATABASE_URL=your-database-url
\`\`\`

### 커스텀 도메인

1. Vercel 대시보드 → Settings → Domains
2. 도메인 입력 (예: myblog.com)
3. DNS 설정 안내에 따라 레코드 추가
4. 자동으로 SSL 인증서 발급

### 성능 팁

- \`output: 'standalone'\`으로 배포 크기 최소화
- ISR(Incremental Static Regeneration)으로 정적 + 동적 장점 결합
- Edge Functions로 빠른 응답 시간`,
    excerpt: 'Vercel 무료 플랜으로 Next.js 프로젝트를 배포하는 방법을 A부터 Z까지 알려드립니다.',
    tags: 'Vercel,배포,Next.js,호스팅,DevOps',
    seoTitle: 'Vercel 무료 배포 완전 정복 - Next.js 프로젝트 배포 가이드',
    seoDescription: 'Vercel 무료 플랜으로 Next.js 프로젝트를 배포하고 커스텀 도메인을 연결하는 방법을 배웁니다.',
    author: 'Blog Author',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=630&fit=crop',
  },
  {
    title: 'SEO 기초 - 검색엔진 상위 노출 전략',
    slug: 'seo-basics-search-ranking',
    content: `## SEO가 중요한 이유

블로그를 운영한다면 SEO(검색엔진 최적화)는 선택이 아닌 필수입니다. 검색 유입은 가장 안정적인 트래픽 소스입니다.

### On-Page SEO 체크리스트

#### 1. 제목 태그 (Title Tag)
- 핵심 키워드를 앞쪽에 배치
- 60자 이내 권장
- 각 페이지마다 고유한 제목

#### 2. 메타 설명 (Meta Description)
- 160자 이내
- 핵심 키워드 포함
- 클릭을 유도하는 문구

#### 3. 헤딩 구조
- H1은 페이지당 1개
- H2, H3으로 논리적 계층 구성
- 키워드 자연스럽게 포함

#### 4. 이미지 최적화
- alt 텍스트 필수
- 파일명에 키워드 포함
- WebP 형식 사용

### Technical SEO

- **사이트맵**: sitemap.xml 자동 생성
- **robots.txt**: 크롤링 규칙 설정
- **구조화된 데이터**: JSON-LD로 검색결과 풍부하게
- **페이지 속도**: Core Web Vitals 최적화
- **모바일 최적화**: 반응형 디자인 필수

### 키워드 리서치 팁

1. 구글 자동완성 활용
2. 관련 검색어 확인
3. 네이버 키워드 도구 사용
4. 경쟁 블로그 분석

### 핵심 요약

SEO는 하루아침에 되지 않습니다. 꾸준히 좋은 콘텐츠를 작성하고, 기술적 최적화를 유지하는 것이 가장 중요합니다.`,
    excerpt: 'SEO 기초부터 실전 전략까지, 블로그 검색엔진 상위 노출을 위한 핵심 가이드입니다.',
    tags: 'SEO,검색엔진,블로그,마케팅,콘텐츠',
    seoTitle: 'SEO 기초 가이드 - 블로그 검색엔진 상위 노출 전략',
    seoDescription: '블로그 SEO의 기초부터 실전까지, 검색엔진 상위 노출을 위한 핵심 전략을 알아봅니다.',
    author: 'Blog Author',
    coverImage: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=1200&h=630&fit=crop',
  },
  {
    title: 'React 19 새로운 기능 - use, Actions, 서버 컴포넌트',
    slug: 'react-19-new-features',
    content: `## React 19의 주요 변화

React 19는 서버 컴포넌트, Actions, \`use\` 훅 등 혁신적인 기능을 도입했습니다.

### use 훅

\`use\`는 Promise나 Context를 읽을 수 있는 새로운 훅입니다.

\`\`\`tsx
function Comments({ commentsPromise }) {
  const comments = use(commentsPromise)
  return comments.map(c => <p key={c.id}>{c.text}</p>)
}
\`\`\`

### Server Actions

폼 제출을 서버에서 직접 처리할 수 있습니다.

\`\`\`tsx
async function createPost(formData: FormData) {
  'use server'
  const title = formData.get('title')
  await db.post.create({ data: { title } })
}

function NewPostForm() {
  return (
    <form action={createPost}>
      <input name="title" />
      <button type="submit">작성</button>
    </form>
  )
}
\`\`\`

### useOptimistic

낙관적 업데이트를 쉽게 구현할 수 있습니다.

\`\`\`tsx
function LikeButton({ likes }) {
  const [optimisticLikes, addOptimistic] = useOptimistic(likes)

  async function handleLike() {
    addOptimistic(prev => prev + 1)
    await fetch('/api/like', { method: 'POST' })
  }

  return <button onClick={handleLike}>{optimisticLikes}</button>
}
\`\`\`

### 문서 메타데이터

\`<title>\`과 \`<meta>\`를 컴포넌트 안에서 직접 사용 가능합니다.

### 마무리

React 19는 서버와 클라이언트의 경계를 더욱 자연스럽게 만들어줍니다. Next.js 15와 함께 사용하면 최고의 개발 경험을 얻을 수 있습니다.`,
    excerpt: 'React 19의 use 훅, Server Actions, useOptimistic 등 핵심 새 기능을 예제와 함께 알아봅니다.',
    tags: 'React,React19,프론트엔드,웹개발,JavaScript',
    seoTitle: 'React 19 새 기능 총정리 - use, Actions, 서버 컴포넌트',
    seoDescription: 'React 19의 use 훅, Server Actions, useOptimistic 등 주요 새 기능을 코드 예제로 배워봅니다.',
    author: 'Blog Author',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=630&fit=crop',
  },
]

async function main() {
  console.log('Seeding database with 8 dummy posts...')

  // Clear existing posts
  await prisma.post.deleteMany()
  console.log('Cleared existing posts.')

  // Create posts with staggered dates
  const baseDate = new Date('2025-05-01')

  for (let i = 0; i < dummyPosts.length; i++) {
    const post = dummyPosts[i]
    const publishedAt = new Date(baseDate)
    publishedAt.setDate(publishedAt.getDate() + i * 2) // 2일 간격

    await prisma.post.create({
      data: {
        ...post,
        status: 'PUBLISHED',
        publishedAt,
        originalLanguage: 'ko',
        views: Math.floor(Math.random() * 500) + 50,
      },
    })

    console.log(`  Created: ${post.title}`)
  }

  console.log('\nSeeding completed! 8 posts created.')
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
