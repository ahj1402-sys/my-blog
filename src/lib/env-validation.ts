/**
 * 환경 변수 검증 모듈
 *
 * 5개 필수 환경 변수의 존재 여부와 포맷을 검증한다.
 * 빌드 전(preflight-check.ts)과 런타임(/api/health)에서 사용.
 */

interface EnvCheckResult {
  key: string
  ok: boolean
  message: string
  hint?: string
}

const REQUIRED_VARS = [
  {
    key: 'NEXT_PUBLIC_SITE_URL',
    label: '사이트 URL',
    validate: (v: string) => v.startsWith('http'),
    hint: '예: https://my-blog.vercel.app — Vercel 배포 후 자동 생성되는 URL을 입력하세요.',
  },
  {
    key: 'TURSO_DATABASE_URL',
    label: 'Turso DB URL',
    validate: (v: string) => v.startsWith('libsql://'),
    hint: 'turso.tech → 대시보드 → DB 선택 → URL 복사. libsql://로 시작해야 합니다.',
  },
  {
    key: 'DATABASE_AUTH_TOKEN',
    label: 'Turso 인증 토큰',
    validate: (v: string) => v.length > 10,
    hint: 'turso.tech → 대시보드 → DB 선택 → Tokens 탭에서 생성하세요.',
  },
  {
    key: 'GEMINI_API_KEY',
    label: 'Gemini API 키',
    validate: (v: string) => v.length > 10,
    hint: 'aistudio.google.com → Get API Key → Create API Key로 발급하세요.',
  },
  {
    key: 'ADMIN_PASSWORD',
    label: '관리자 비밀번호',
    validate: (v: string) => v.length >= 4,
    hint: '/admin 페이지 로그인에 사용할 비밀번호를 설정하세요 (4자 이상).',
  },
] as const

/**
 * 5개 필수 환경 변수를 검증하고 결과를 반환한다.
 */
export function validateEssentialEnv(): {
  allOk: boolean
  results: EnvCheckResult[]
} {
  const results: EnvCheckResult[] = REQUIRED_VARS.map(({ key, label, validate, hint }) => {
    const value = process.env[key]

    if (!value || value.trim() === '') {
      return {
        key,
        ok: false,
        message: `${label} (${key})이(가) 설정되지 않았습니다.`,
        hint,
      }
    }

    if (!validate(value.trim())) {
      return {
        key,
        ok: false,
        message: `${label} (${key})의 값이 올바르지 않습니다.`,
        hint,
      }
    }

    return {
      key,
      ok: true,
      message: `${label} — 설정 완료`,
    }
  })

  return {
    allOk: results.every((r) => r.ok),
    results,
  }
}

/**
 * 콘솔에 검증 결과를 한국어로 출력한다.
 */
export function printValidationResult(result: ReturnType<typeof validateEssentialEnv>): void {
  console.log('\n========================================')
  console.log('  환경 변수 검증 결과')
  console.log('========================================\n')

  for (const r of result.results) {
    if (r.ok) {
      console.log(`  [통과] ${r.message}`)
    } else {
      console.log(`  [실패] ${r.message}`)
      if (r.hint) {
        console.log(`         -> ${r.hint}`)
      }
    }
  }

  console.log('')

  if (result.allOk) {
    console.log('  모든 환경 변수가 올바르게 설정되었습니다!\n')
  } else {
    const failCount = result.results.filter((r) => !r.ok).length
    console.log(`  ${failCount}개의 환경 변수를 확인해주세요.`)
    console.log('  .env.example 파일을 참고하세요.\n')
  }
}
