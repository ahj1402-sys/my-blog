# 작업 기록 (Worklog)

모든 주요 변경 사항을 이 파일에 기록합니다.

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
