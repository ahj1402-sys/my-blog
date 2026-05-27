# 작업 기록 (Worklog)

모든 주요 변경 사항을 이 파일에 기록합니다.

---

## 2026-05-27 — 헤더 공용 컴포넌트화(색=config 한 곳) + 컨설팅 제거

- **변경**:
  - `src/components/SiteHeader.tsx` 신규: 공용 헤더. 색은 `brandConfig.header`(배경/글자) inline style로 적용 → 한 곳만 바꾸면 전체 반영
  - `src/config/brand.config.ts`: `header.background`/`header.text` 추가 (이 인스턴스는 남색 `#1e3a8a` + 흰색 `#ffffff`)
  - `src/app/[locale]/page.tsx`, `src/components/PageLayout.tsx`: 중복 인라인 헤더 제거 → `<SiteHeader>` 사용
  - 컨설팅 제거: `src/app/[locale]/consulting/` 삭제, `features.config.ts`의 `consulting` 플래그 삭제, `middleware.ts`의 컨설팅 서브도메인 리다이렉트 블록 삭제(기능 OFF라 동작 영향 없음)
- **이유**: 헤더가 페이지마다 4종으로 흩어져 색 변경이 어려웠음 → 공용 컴포넌트 + config 단일 제어로 수강생도 쉽게 색 변경 가능. 컨설팅은 CMA에만 필요해 제거.
- **검증**: `pnpm type-check` 통과(에러 0). 배포 후 헤더 남색 적용 확인 예정.
- **범위**: 공용 헤더만 통합. 글 상세(`posts/[slug]`) 헤더는 별도 구조라 이번엔 미포함.
## 2026-05-27 — SEO/접근성: not-found description + 작업목록 체크박스 라벨 경고 제거

- **변경**:
  - `src/app/posts/[slug]/page.tsx`: "Post Not Found" 분기에도 `description`(사이트 기본 설명) 추가 — 없는 글 측정 시 메타 디스크립션 누락 경고 방지
  - `src/components/MarkdownContent.tsx`: `input` 렌더러 추가 — GFM 작업목록 체크박스(비활성·장식용)에 `aria-hidden`+`tabIndex=-1` 부여
- **이유**: Lighthouse 접근성 "form elements do not have associated labels"가 본문 마크다운의 `- [ ]` 체크박스 때문에 발생. 라이브 글 페이지 자체는 메타 디스크립션 정상이었으나, not-found 분기는 description이 없어 보강.
- **검증**: `pnpm type-check` 통과(에러 0).
## 2026-05-27 — GitHub Actions 정리: 죽은 워크플로우 삭제 + Hourly 503 재시도

- **변경**:
  - `.github/workflows/daily-content.yml` 삭제 (참조 스크립트 `scripts/daily-content-generator.js` 없음 + 스케줄 이미 비활성)
  - `.github/workflows/daily-shorts-regeneration.yml` 삭제 (참조 스크립트 `scripts/regenerate-shorts-daily.mjs` 없음 → 매일 실패)
  - `src/app/api/cron/generate-post/route.ts`: `generateContentWithRetry` 헬퍼 추가, Gemini `generateContent` 호출을 503/429 시 지수 백오프(2s·4s·8s, 최대 3회) 재시도로 감쌈
- **이유**:
  - Daily 2개는 삭제된 스크립트를 참조해 항상 실패하는 죽은 워크플로우. Shorts는 매일 빨간 X 발생.
  - Hourly의 간헐적 실패는 설정 문제가 아니라 `gemini-2.5-flash-lite`의 일시적 503(과부하)였고 재시도가 없어 그대로 실패함. 실패 run 5건 중 4건이 503 확인.
- **검증**: `pnpm type-check` 통과(에러 0). 워크플로우 목록은 push 후 Actions에서 Hourly 1개만 남는지 확인 필요.

## 2026-05-20 — 썸네일 다양성 + cron 500 에러 가시성 개선

- **변경**:
  - `src/lib/unsplash.ts`: `per_page` 1 → 30, 결과 중 랜덤 1장 선택
  - `src/app/api/cron/generate-post/route.ts`: handler를 try/catch로 감싸 예외 시 메시지를 응답 body에 포함
- **이유**:
  - 썸네일 동일 문제: `extractImageKeywords`가 기본값 `'technology digital workspace minimal'`로 fallback될 때 + `per_page: 1`이면 Unsplash가 항상 같은 #1 사진을 반환 → 여러 글이 같은 썸네일 공유. 키워드 매칭이 되어도 동일한 query는 동일한 #1 결과를 줘서 다양성 0.
  - 500 에러 가시성: cron route에 top-level try/catch가 없어서 예외 발생 시 Next.js가 빈 body의 500을 반환 → workflow 로그에 원인이 안 보임. try/catch로 message/stage를 응답에 실어 디버깅 가능하도록.
- **검증**: `pnpm type-check` 통과. 향후 cron 재실행 시 다른 썸네일 확인 + 실패 시 응답 body에 원인 노출 확인 필요.

---

## 2026-05-20 — GitHub Actions 글 생성 워크플로우 silent failure 수정

- **변경**: `.github/workflows/auto-publish.yml`
  - curl에 `-L` 추가 → SITE_URL이 redirect 도메인이어도 따라감 (308 차단)
  - 성공 판정을 `>= 500`만 실패 → `2xx 외 전부 실패`로 강화
  - 실패 시 흔한 원인(SITE_URL 불일치, CRON_SECRET 불일치, 키워드 미등록) 출력
- **이유**: 사용자가 workflow를 수동 실행했으나 글이 생성되지 않음. 로그 확인 결과 HTTP 308 응답(SITE_URL secret이 `my-blog.vercel.app` 같은 redirect 도메인을 가리킴) → curl이 redirect 미추종 → 글 미생성. 그런데 워크플로우는 500 미만이면 success로 처리해서 사용자가 실패를 인지하지 못함.
- **검증**: yaml 문법 검증 통과. 수동 재실행 시 308이 그대로면 -L 덕분에 따라가서 성공하거나, 실패 시 명확한 메시지와 함께 워크플로우 실패로 표시됨.

---

## 2026-05-20 — Admin 설정 페이지 401 Unauthorized 수정

- **변경**: `src/app/admin/settings/page.tsx`
  - 인증 패턴을 codebase 표준(`sessionStorage` + `?password=` query param)으로 통일
  - GET 3개 (settings, meta-description, default-author) — 기존엔 존재하지 않는 `document.cookie` 읽음 → `sessionStorage`로 변경
  - POST 5개 (settings 저장 3개 + favicon/logo 업로드 2개) — 기존엔 인증 헤더 자체가 없음 → `?password=` 추가
  - `getAdminPasswordOrPrompt()` 헬퍼 추가 (sessionStorage 비어 있으면 prompt)
- **이유**: 설정 페이지에서 "기본 작성자 이름" 저장 시 `POST /api/admin/settings` 401. POST 요청들이 인증 정보를 아예 안 보내고 있었음. GET도 `document.cookie`를 읽고 있었는데, 로그인은 `sessionStorage`에 저장하므로 cookie는 항상 비어 있어서 작동한 적이 없음.
- **검증**: `pnpm type-check` 에러 없음. `AdminPostsTable.tsx`와 동일한 패턴이라 일관성 확보.

---

## 2026-05-20 — Admin URL 복사 시 404 발생 문제 수정

- **변경**:
  - `src/components/admin/AdminPostsTable.tsx` `handleCopyUrl`:
    - `process.env.NEXT_PUBLIC_SITE_URL` → `window.location.origin` 으로 변경
- **이유**: `NEXT_PUBLIC_SITE_URL` 환경변수가 실제 배포 URL과 다르게 설정되면(예: `my-blog.vercel.app` vs 실제 `my-blog-ao4r.vercel.app`) 복사된 URL이 404로 연결되는 문제. 템플릿 사용자(수강생)가 환경변수 정확히 맞추기 어려우므로 코드 레벨에서 차단.
- **검증**: `pnpm type-check` 에러 없음. admin 페이지는 `'use client'` 컴포넌트라 브라우저에서 동작 → `window.location.origin`은 항상 현재 접속한 도메인(=실제 배포 URL)을 반환.

---

## 2026-05-12 — Lighthouse SEO/Performance 100점화

- **변경**:
  - `src/app/[locale]/posts/[slug]/page.tsx` + `src/app/posts/[slug]/page.tsx` (generateMetadata):
    - `description` fallback 체인 추가 — `seoDescription → excerpt → 본문 stripMarkdown 160자 → siteConfig.description` (절대 undefined 없음) → SEO 100점
  - 동일 두 페이지 LCP cover image (`Image priority`):
    - `fetchPriority="high"` + `loading="eager"` 명시 추가 → Lighthouse "LCP request discovery" 통과 (Performance 점수 +10)
- **이유**: Lighthouse 결과 SEO 92점 (meta description 누락), Performance 90점 (LCP fetchpriority 미적용)
- **검증**: `pnpm exec tsc --noEmit` — 에러 없음

---

## 2026-05-12 — 쿠팡 CSP / 발행 / Unsplash 설정 패치

- **변경**:
  - `next.config.ts`: CSP `frame-src`에 `https://*.coupangcdn.com`, `https://partners.coupangcdn.com`, `https://ads-partners.coupang.com` 추가 → 쿠팡 위젯 iframe 회색 화면 오류 해결
  - `src/app/api/posts/[id]/route.ts` (PUT): `publishedAt` 값에 따라 `status`도 `PUBLISHED`/`DRAFT`로 함께 갱신 → "바로 발행" 실제 동작
  - `src/components/SimplePostWriter.tsx`: 체크박스(`formData.publishedAt`)가 켜져 있으면 "초안 저장" 버튼도 발행되도록 `handleSave` 보정, 버튼 라벨 동적 변경
  - `src/lib/settings.ts`: `ALLOWED_KEYS`에 `UNSPLASH_ACCESS_KEY` 추가
  - `src/lib/unsplash.ts`: env 직접 참조 대신 `getSettingValue('UNSPLASH_ACCESS_KEY')` → env 폴백으로 변경
  - `src/app/api/generate-content/route.ts`: 글 생성 시 Unsplash 검색 → 실패 시 OG 이미지 폴백 순서로 `coverImage` 자동 설정
  - `src/app/admin/settings/page.tsx`: Unsplash Access Key 입력/저장 UI 추가
- **이유**: 쿠팡 파트너스 위젯 CSP 차단, "바로 발행하기" 미동작, Unsplash 썸네일 미사용/설정 부재 문제 해결
- **검증**: `pnpm exec tsc --noEmit` — 새 코드에 신규 타입 에러 없음 (기존 pdf-parse 에러만 잔존)

---

## 2026-05-12 — Coleitai Blog 초기화

- **변경**: intalk-blog 기반 코드를 Coleitai Blog로 분리
  - InTalk 전용 파일 30+개 삭제
  - site.config.ts, brand.config.ts 기본값으로 변경
  - Admin1 (설정 가이드 + 전문 지식 관리) / Admin2 (CMS) 분리
  - 환경 변수 검증 시스템 구축 (env-validation.ts, preflight-check.ts)
  - CLAUDE.md 재작성 (harness-engineering + planning-workflow + wwh-framework + superpowers + context7 통합)
- **이유**: 누구나 클론해서 본인 블로그를 만들 수 있는 밀키트 템플릿 구축
- **검증**: pnpm build 성공, TypeScript 에러 0개
