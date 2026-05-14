# Coleitai Blog

**Lighthouse 400점, 무료 운영, 5단계 설정. 나만의 SEO 블로그를 만드세요.**

---

## Why — 왜 나만의 블로그인가?

네이버 블로그, 티스토리, 워드프레스... 다 좋다. 그런데 하나만 물어보자.

- 플랫폼이 문 닫으면? **내 콘텐츠는 사라진다.**
- 플랫폼 알고리즘이 바뀌면? **내 유입은 반토막 난다.**
- SEO를 제대로 하고 싶다면? **내 도메인이 있어야 한다.**

나만의 블로그는 **디지털 자산**이다. 한 번 만들면 내 것이고, 도메인 점수(DA)는 시간이 갈수록 올라간다.

이 템플릿은:
- Google Lighthouse **400점 만점** (성능·접근성·모범사례·SEO 각 100점)
- Vercel 무료 티어로 **월 운영비 0원**
- 블로그 글 SEO 최적화 자동 처리 (schema.org, sitemap, canonical URL)

---

## How — 어떻게 만드는가?

CLI(터미널)를 모른다? 괜찮다. **Claude Cowork에서 대화만으로** 설정한다.

### 5단계 설정

| 단계 | 내용 | 소요 |
|------|------|------|
| 1 | GitHub에서 "Use this template" 클릭 | 1분 |
| 2 | Claude Cowork에서 "블로그 이름을 OOO로 바꿔줘" | 2분 |
| 3 | turso.tech에서 무료 DB 생성 | 3분 |
| 4 | aistudio.google.com에서 Gemini API 키 발급 | 1분 |
| 5 | Vercel에서 Import → 환경변수 5개 입력 → Deploy | 3분 |

설정 완료 후 `/admin/setup`에서 전체 상태를 확인할 수 있다.

---

## What — 뭐가 포함되어 있는가?

### 포함 기능

- AI 블로그 글 생성 (Gemini API)
- SEO 자동 최적화 (schema.org JSON-LD, sitemap, robots.txt)
- 관리자 대시보드 (`/admin`)
  - **Admin1**: 밀키트 커스텀 (설정 가이드 + 전문 지식 업로드)
  - **Admin2**: 콘텐츠 관리 (글 작성·수정·삭제, 이미지 업로드)
- 전문 지식 시스템 (본인 노하우를 .md로 업로드 → AI가 참고)
- 반응형 디자인 (모바일 최적화)
- 다크 모드 대응
- 이미지 최적화 (next/image, AVIF/WebP)

### 기술 스택

| 기술 | 버전 | 용도 |
|------|------|------|
| Next.js | 15 | 프레임워크 (App Router, SSG) |
| React | 19 | UI |
| TypeScript | 5 | 타입 안전성 |
| TailwindCSS | 4 | 스타일링 |
| Prisma | 6 | DB ORM |
| Turso (LibSQL) | - | 데이터베이스 (무료) |
| Gemini API | - | AI 콘텐츠 생성 |
| Vercel | - | 호스팅 (무료) |

### 선택 기능 (features.config.ts에서 on/off)

| 기능 | 기본값 | 설명 |
|------|--------|------|
| YouTube 동기화 | off | YouTube 영상 → 블로그 글 자동 변환 |
| 제휴 상품 | off | 쿠팡 파트너스 등 제휴 링크 |
| 댓글 | off | 댓글 시스템 |
| 뉴스레터 | off | 이메일 구독 |
| 다국어 | off | 한국어 외 추가 언어 지원 |

---

## 환경 변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `NEXT_PUBLIC_SITE_URL` | O | 사이트 URL |
| `TURSO_DATABASE_URL` | O | Turso DB URL |
| `DATABASE_AUTH_TOKEN` | O | Turso 인증 토큰 |
| `GEMINI_API_KEY` | O | Gemini API 키 |
| `ADMIN_PASSWORD` | O | 관리자 비밀번호 |
| `DATABASE_URL` | - | Prisma 내부용 (기본값 유지) |

---

## 로컬 개발

```bash
# 의존성 설치
pnpm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 편집해서 값을 입력하세요

# DB 스키마 적용
pnpm db:push

# 개발 서버 실행
pnpm dev
```

---

## 프로젝트 구조

```
src/
├── app/                  # Next.js App Router 페이지
│   ├── [locale]/         # 로케일별 페이지 (홈, 글, 아카이브)
│   ├── admin/            # 관리자 페이지
│   │   ├── setup/        # Admin1: 설정 가이드
│   │   ├── knowledge/    # Admin1: 전문 지식 관리
│   │   ├── new/          # Admin2: 글 작성
│   │   └── edit/         # Admin2: 글 수정
│   └── api/              # API 라우트
├── components/           # React 컴포넌트
├── config/               # 설정 파일 (site, brand, features, navigation)
├── lib/                  # 유틸리티 (DB, 환경변수, 이미지 등)
└── scripts/              # 빌드 스크립트
knowledge/                # 사용자 전문 지식 .md 파일
```

---

## 라이선스

MIT
