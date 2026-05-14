# 1강. 0에서 배포까지 — Claude Code 실습 가이드

> **완성 템플릿**: https://github.com/colehkg-cyber/coleitai-blog
> **소요 시간**: 약 70분
> **결과물**: 완성된 블로그가 내 Vercel 주소에 배포된 상태

---

## 전체 목차

| # | 단계 | 시간 | 하는 일 |
|---|---|---|---|
| PHASE 0 | 도구 이해 + 계정 만들기 | 35분 | 5개 서비스 가입 + 키 발급 |
| PHASE 1 | 템플릿 복사 | 3분 | GitHub에서 내 계정으로 복사 |
| PHASE 2 | VS Code 세팅 | 5분 | 코드 열고 Claude Code 실행 |
| PHASE 3 | 블로그 커스텀 | 10분 | 이름·색상 내 것으로 변경 |
| PHASE 4 | 환경변수 입력 | 5분 | .env 파일에 API 키 넣기 |
| PHASE 5 | Vercel 배포 | 10분 | 인터넷에 공개 |
| PHASE 6 | 자동배포 확인 | 2분 | push → 자동 업데이트 확인 |

---

## PHASE 0. 우리가 쓸 도구 + 계정 만들기 (35분)

### 우선 비유로 이해해봅시다

블로그를 운영하는 건 **카페를 차리는 것과 같습니다.** 우리가 쓸 5개 도구를 카페에 빗대보면:

| 도구 | 카페로 치면 | 한 줄로 | 돈 |
|---|---|---|---|
| **Claude** | 똑똑한 알바생 | 내 대신 코드를 짜주는 AI | $20/월 |
| **GitHub** | 카페 레시피 노트 | 블로그 코드를 보관하는 창고 | 무료 |
| **Vercel** | 카페 매장 | 인터넷에서 누구나 들어올 수 있는 공간 | 무료 |
| **Turso** | 매출 장부 | 블로그 글·방문자수를 저장하는 곳 | 무료 |
| **Gemini** | 글쓰기 비서 | 블로그 글을 자동으로 써주는 AI | 무료 |

> 💡 **돈 드는 건 Claude Pro 딱 하나입니다.** 나머지 4개는 평생 무료로 써도 충분해요. 블로그가 너무 잘 돼서 월 50만 명 넘게 들어오기 시작하면 그때 유료를 고민하면 됩니다.

---

### 각 도구가 뭔지 짧게 설명 (왜 무료인지 포함)

#### 1. Claude — AI 알바생

- ChatGPT를 만든 회사의 경쟁사가 만든 AI예요.
- 우리는 **"Claude Code"** 라는 도구를 씁니다. 터미널(까만 화면)에서 명령어 하나만 치면, AI가 내 컴퓨터에 있는 코드를 **직접 읽고 직접 고쳐줍니다.**
- 채팅 AI는 코드를 알려만 주지만, Claude Code는 **실행까지 자동.** 초보자가 100시간 배워야 할 일을 1시간 만에 해줍니다.
- **유료인 이유**: AI 모델 운영 비용이 비쌉니다. 한 달 $20에 Pro 계정으로 거의 무제한 사용 가능.

#### 2. GitHub — 코드 보관 창고

- **"코드용 구글 드라이브"** 라고 생각하면 됩니다.
- 내가 코드를 바꿀 때마다 "언제 / 뭘 / 왜" 바꿨는지 자동으로 기록돼서, 망쳐도 과거로 되돌릴 수 있어요.
- **무료인 이유**: 마이크로소프트가 사들였고, 개인 사용은 그냥 풉니다 (개발자 늘려야 자기네 클라우드도 쓰니까).

#### 3. Vercel — 내 블로그 매장

- GitHub에 코드를 올리면, Vercel이 **20초 만에 그걸 인터넷 주소로 바꿔줍니다.**
- 도메인, 보안 인증서(자물쇠 아이콘), 빠른 속도 전부 자동.
- **무료인 이유**: Vercel은 Next.js를 만든 회사예요. 사람들이 Next.js를 많이 써야 자기네 유료 고객이 늘어나니까, 개인 블로그 수준은 그냥 풉니다.

#### 4. Turso — 글 저장소

- 블로그 글, 조회수, 카테고리 같은 데이터를 저장하는 **온라인 엑셀 같은 것.**
- **무료인 이유**: 신생 회사라 개인 사용자한테 후하게 풉니다. 9GB까지 무료인데, 글로만 채우면 평생 못 채워요.

#### 5. Gemini — AI 글쓰기 비서

- 구글이 만든 AI예요.
- 키워드만 주면 블로그 글을 자동으로 써줍니다. **2강에서 본격적으로 씁니다.**
- **무료인 이유**: 구글이 ChatGPT한테 밀려서, 사용자 늘리려고 키만 받아가도 무료. 카드 등록 안 해도 됩니다.

---

### 5개 계정 만들기 — 이 순서대로 (35분)

> ⚠️ **꼭 GitHub부터 만드세요.** 나머지 3개(Vercel, Turso, Google)는 GitHub 계정으로 1초만에 로그인 되거든요.

---

#### Step 1. GitHub 계정 만들기 (5분)

1. https://github.com/signup 접속
2. 이메일 → 비밀번호 → **사용자 이름** 입력
   - **사용자 이름 팁**: 짧고 깔끔하게. 예: `jkim-blog`
   - 이게 나중에 내 블로그 코드 주소에 들어갑니다.
3. 메일로 온 인증번호 입력 → 끝

✅ 결제카드 등록 X. 그냥 무료로 쓰면 됩니다.

---

#### Step 2. Vercel 가입 (3분)

1. https://vercel.com/signup 접속
2. **"Continue with GitHub"** 클릭 ← 반드시 이거
3. GitHub 로그인 → "Authorize Vercel" 클릭
4. 플랜 선택 화면이 나오면 **"Hobby"** (무료) 선택
5. 끝

---

#### Step 3. Turso 가입 + DB 만들기 + 토큰 받기 (10분)

이 단계가 제일 깁니다. 천천히 따라하세요.

**(1) 가입**
1. https://app.turso.tech 접속
2. **"Sign in with GitHub"** 클릭 → Authorize

**(2) DB 만들기**
3. 화면에 **"Create Database"** 버튼 클릭
4. 입력란:
   - **Name**: `my-blog-db` (그대로 입력)
   - **Group**: `default` (그대로)
   - **Region**: `Tokyo` 선택 (한국에서 가장 빠름)
5. **"Create Database"** 클릭

**(3) DB 주소 복사하기**
6. 방금 만든 DB 이름을 클릭 → 상세 페이지 열림
7. 상단에 **"Database URL"** 표시됨 (`libsql://my-blog-db-...`로 시작)
8. 옆에 📋 복사 버튼 → 클릭 → **메모장에 붙여넣기**

**(4) 토큰 발급 (중요!)**
9. 같은 페이지에 **"Generate Token"** 버튼 클릭
10. 설정값:
    - **Expiration**: `Never`
    - **Permissions**: `Read & Write`
11. **"Create Token"** 클릭
12. `eyJ...`로 시작하는 **엄청 긴 문자열**이 한 번만 나옵니다.
13. **즉시 메모장에 복사하세요.**

> 🚨 토큰은 **딱 한 번만** 보여줍니다. 페이지 새로고침하면 사라져요! 못 복사했으면 새로 발급받아야 합니다.

---

#### Step 4. Gemini API 키 받기 (5분)

1. https://aistudio.google.com 접속
2. Gmail 계정으로 로그인 (없으면 그냥 구글 계정 만들기)
3. 왼쪽 메뉴에서 **"Get API Key"** 클릭
4. **"Create API Key"** → "Create API key in new project" 선택
5. `AIzaSy...`로 시작하는 키 나옴 → **메모장에 복사**

✅ 결제카드 등록 X. 카드 묻지도 않습니다.

---

#### Step 5. Claude Pro 구독 (5분, 유료 $20/월)

1. https://claude.ai 접속 → Sign up (구글 계정으로 가입 가능)
2. 가입 후, 왼쪽 아래 본인 이름 → **Settings → Plans & Billing**
3. **"Upgrade to Pro"** 클릭
4. 카드 정보 입력 → 결제 완료
5. **한 번 로그아웃했다 다시 로그인** (Pro 활성화 확인)

> 💡 안 맞으면 가입 후 7일 안에 환불 신청 가능. 일단 한 달만 써본다는 마음으로 결제해도 OK.
> 💡 ChatGPT Plus를 이미 쓰고 있어도 별개입니다. Claude Code는 Claude Pro에만 포함돼요.

---

### ⏸ 다음 단계로 가기 전 — 메모장 체크

아래 5개가 메모장에 다 있는지 확인하세요. 하나라도 비면 **여기서 멈추고** 다시 받아오세요.

```
[ ] GitHub 사용자 이름     : jkim-blog 같은 형식
[ ] Turso DB URL          : libsql://my-blog-db-...turso.io 로 시작
[ ] Turso 토큰            : eyJ... 로 시작하는 긴 문자열
[ ] Gemini API 키         : AIzaSy... 로 시작
[ ] 관리자 비밀번호        : 8자 이상 본인이 정한 문자열
```

> 🚨 **이 키들 절대 남한테 보여주지 마세요.** 카톡·블로그·이메일에도 올리면 안 됩니다. 키가 새면:
> - Turso 토큰 노출 → 누가 내 블로그 글 다 삭제 가능
> - Gemini 키 노출 → 누가 내 키로 AI 호출 무한 사용 (다행히 Gemini 무료라 돈은 안 듦, 그러나 한도 다 써버림)

---

## PHASE 1. 템플릿 복사 (3분)

1. 브라우저에서 접속: **https://github.com/colehkg-cyber/coleitai-blog**
2. 초록색 **"Use this template"** 버튼 클릭
3. **"Create a new repository"** 선택
4. Repository name: `my-blog`
5. **Public** 선택 ← 필수
6. **"Create repository"** 클릭

이게 끝입니다. 완성된 블로그 코드 전체가 내 GitHub에 복사됩니다.

---

## PHASE 2. VS Code 세팅 (5분)

### 2-1. VS Code 설치 (없으면)

https://code.visualstudio.com → Download → 설치

### 2-2. 코드 내 컴퓨터로 가져오기

VS Code 실행 → Terminal 메뉴 → New Terminal → 아래 입력:

```bash
# 내아이디와 my-blog는 본인 것으로 변경
git clone https://github.com/내아이디/my-blog.git
cd my-blog
code .
```

`code .` 입력하면 VS Code가 프로젝트 폴더를 새 창으로 엽니다.

### 2-3. Claude Code 설치 (처음 한 번만)

VS Code 내장 터미널에서 (`Ctrl + 백틱` 또는 Terminal → New Terminal):

**Mac:**
```bash
npm install -g @anthropic-ai/claude-code
```

**Windows (PowerShell 관리자 권한으로 열기):**
```bash
npm install -g @anthropic-ai/claude-code
```

설치 확인:
```bash
claude --version
```

### 2-4. Claude Code 실행 및 로그인

```bash
claude
```

처음 실행하면 브라우저가 열립니다.
Claude Pro 계정으로 로그인 → 권한 허용 → 터미널로 돌아옴.

`>` 프롬프트가 보이면 준비 완료입니다.

---

## PHASE 3. 블로그 커스텀 (10분)

이제부터 Claude Code `>` 뒤에 아래 프롬프트를 복붙하면 됩니다.
**[대괄호] 안만 본인 것으로 바꾸세요.**

---

### 📋 프롬프트 1 — 프로젝트 파악

```
이 프로젝트의 구조를 파악해줘.

1. 어떤 파일들이 있는지 트리로 보여줘
2. 블로그 이름, 저자 이름, 사이트 설명이 어느 파일에서 관리되는지 찾아줘
3. 한국어로 설명해줘
```

---

### 📋 프롬프트 2 — 블로그 기본 정보 변경

```
블로그 기본 정보를 아래와 같이 바꿔줘.

블로그 이름: [내 블로그 이름]
블로그 설명: [한 줄 소개]
저자 이름: [내 이름 또는 닉네임]
저자 이메일: [내 이메일]

관련된 파일을 모두 찾아서 빠짐없이 바꿔줘.
바꾼 파일 목록을 한국어로 보고해줘.
```

---

### 📋 프롬프트 3 — 색상 테마 변경

```
아래 수정을 해줘.
Lighthouse 점수(성능·접근성·SEO)에 영향 주지 않게 유지하면서 작업해줘.

메인 컬러를 [원하는 색상, 예: 딥그린 / 네이비 / 오렌지] 계열로 바꿔줘.
헤더, 링크, 버튼, 강조 색상 전부 통일해줘.
바꾼 파일 목록 한국어로 보고해줘.
```

---

### 📋 프롬프트 4 — 변경사항 GitHub에 저장

```
방금 바꾼 내용을 git에 커밋하고 push해줘.
커밋 메시지는 "블로그 기본 정보 및 디자인 커스텀"으로 해줘.
push 결과 한국어로 보고해줘.
```

> Claude Code가 git add → git commit → git push를 자동으로 실행합니다.
> 승인 요청이 오면 `y` 또는 Enter를 누르세요.

---

## PHASE 4. 환경변수(.env) — Claude에게 통째로 맡기기 (5분)

### 환경변수가 뭐예요?

`.env`는 **"비밀 메모장 파일"** 입니다.
- 블로그 코드는 GitHub에 올라가지만 → 누구나 볼 수 있음
- 그런데 Turso 토큰, Gemini 키 같은 비밀번호도 어딘가에 적어둬야 코드가 작동함
- 그래서 `.env`라는 파일에만 적고, **이 파일은 GitHub에 안 올리도록** 따로 설정합니다.

### 📋 프롬프트 5 — Claude가 .env 파일까지 직접 만들도록

Claude Code(`>` 프롬프트)에서 아래를 복붙하세요.
**대괄호 `[ ]` 안만 본인이 메모장에 적어둔 값으로 바꾸면 됩니다.**

```
프로젝트 루트에 .env 파일을 만들어서 아래 값들을 정확히 채워줘.

NEXT_PUBLIC_SITE_URL=https://[내깃허브사용자이름]-my-blog.vercel.app
TURSO_DATABASE_URL=[Turso DB URL 붙여넣기]
DATABASE_AUTH_TOKEN=[Turso 토큰 붙여넣기]
GEMINI_API_KEY=[Gemini API 키 붙여넣기]
ADMIN_PASSWORD=[내가 정한 8자 이상 비밀번호]

만들고 나서 아래 3가지를 자동으로 확인하고 한국어로 보고해줘:

1. .env 파일이 제대로 만들어졌는지 (값이 비어있지 않은지)
2. .gitignore 파일에 .env가 포함되어 있는지 (없으면 추가)
3. git status로 .env가 추적되지 않는지 (실수로 GitHub에 올라가지 않도록)

문제가 있으면 자동으로 고쳐줘.
```

**이게 끝입니다.** Claude가:
- ✅ `.env` 파일 직접 생성
- ✅ `.gitignore`에 `.env` 들어있는지 검사 → 없으면 자동 추가
- ✅ `git status`로 노출 위험 검사
- ✅ 결과를 한국어로 정리해서 보고

> 💡 **왜 NEXT_PUBLIC_SITE_URL은 지금 가짜 값을 넣나?**
> Vercel 배포(PHASE 5)를 해야 진짜 주소가 나옵니다. 일단 임시값으로 넣고, 배포 후에 다시 바꿉니다. 빌드는 통과합니다.

> 🚨 만약 Claude가 `.env`가 git에 추적되고 있다고 보고하면 **거기서 멈추고** Claude에게 이렇게 추가 명령:
> ```
> .env가 추적되고 있어. 안전하게 추적 해제하고, 토큰을 새로 발급해야 하는지도 알려줘.
> ```

---

## PHASE 5. Vercel 배포 (10분)

이 단계는 브라우저에서 직접 합니다.

### 5-1. Vercel 프로젝트 연결

1. https://vercel.com → 로그인
2. **Add New Project** 클릭
3. my-blog 저장소 옆 **Import** 클릭
4. **Environment Variables** 섹션을 펼쳐서 아래 값 입력:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://my-blog.vercel.app` |
| `TURSO_DATABASE_URL` | Turso DB URL |
| `DATABASE_AUTH_TOKEN` | Turso 토큰 |
| `GEMINI_API_KEY` | Gemini 키 |
| `ADMIN_PASSWORD` | 내가 정한 비밀번호 |

5. **Deploy** 클릭 → 2~3분 대기

### 5-2. 배포 완료 확인

Vercel이 도메인을 줍니다: `https://my-blog-내아이디.vercel.app`

접속해서 블로그가 보이면 성공!

### 5-3. DB 초기화 (첫 배포 후 1회만)

```
https://my-blog-내아이디.vercel.app/admin/setup
```

접속 → 안내에 따라 진행.

---

## PHASE 6. 자동배포 확인 (2분)

Claude Code에서:

### 📋 프롬프트 6 — 자동배포 테스트

```
홈페이지 메인 타이틀 아래에 딱 한 줄만 추가해줘.

내용: "자동 배포 테스트 완료 🚀"

추가 후 git 커밋하고 push해줘.
커밋 메시지: "test: 자동배포 확인"
```

push 후 10~20초 뒤:
- Vercel 대시보드 → Deployments 탭에 새 빌드 자동으로 시작되는지 확인
- 빌드 완료 후 내 사이트 새로고침 → 문구가 보이면 완료

---

## ✅ 완료 체크리스트

- [ ] 템플릿을 내 GitHub으로 복사 완료
- [ ] VS Code에서 Claude Code 실행 성공
- [ ] 블로그 이름/저자/색상 변경 완료
- [ ] .env에 API 키 5개 입력 + GitHub에 노출 안 됨
- [ ] Vercel 배포 완료 (내 도메인으로 접속 가능)
- [ ] push → 자동 배포 작동 확인

---

## 자주 막히는 에러

### "command not found: claude"

터미널을 완전히 닫고 새로 열기.
그래도 안 되면 Claude Code에 붙여넣기:
```
npm install -g @anthropic-ai/claude-code
```

### Vercel 빌드 실패

Claude Code에 붙여넣기:
```
Vercel 빌드 로그에 이런 에러가 났어:
[에러 메시지 그대로 붙여넣기]

원인 설명하고 바로 고쳐줘. 한국어로 보고해줘.
```

### git push 시 인증 오류

Claude Code에 붙여넣기:
```
git push 할 때 인증 오류가 났어.
GitHub Personal Access Token(PAT)으로 인증하는 방법을 한국어로 단계별로 알려줘.
```

---

## 2강 예고

1강은 완성된 블로그를 내 것으로 만들고 배포하는 것까지.
2강에서는:

- 황금 키워드 발굴
- AI로 첫 번째 블로그 글 쓰기
- 구글 서치 콘솔 등록
- 애드센스 신청 준비
