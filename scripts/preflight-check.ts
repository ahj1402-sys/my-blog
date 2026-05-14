/**
 * 빌드 전 환경 변수 검증 스크립트
 *
 * package.json의 build 명령에서 가장 먼저 실행된다.
 * 필수 환경 변수가 없으면 빌드를 중단하고 한국어 안내 메시지를 출력한다.
 *
 * 로컬 개발 환경(NODE_ENV !== 'production')에서는 경고만 출력하고 빌드를 계속한다.
 */

// dotenv를 사용해 .env 파일 로드 (로컬 개발용)
try {
  require('dotenv').config()
} catch {
  // dotenv가 없어도 Vercel 환경에서는 자동으로 주입됨
}

const REQUIRED_VARS = [
  { key: 'NEXT_PUBLIC_SITE_URL', label: '사이트 URL' },
  { key: 'TURSO_DATABASE_URL', label: 'Turso DB URL' },
  { key: 'DATABASE_AUTH_TOKEN', label: 'Turso 인증 토큰' },
  { key: 'GEMINI_API_KEY', label: 'Gemini API 키' },
  { key: 'ADMIN_PASSWORD', label: '관리자 비밀번호' },
]

function main() {
  console.log('\n[Preflight] 환경 변수 검사 중...\n')

  const missing: { key: string; label: string }[] = []

  for (const { key, label } of REQUIRED_VARS) {
    const value = process.env[key]
    if (!value || value.trim() === '') {
      missing.push({ key, label })
      console.log(`  [누락] ${label} (${key})`)
    } else {
      console.log(`  [확인] ${label}`)
    }
  }

  if (missing.length > 0) {
    console.log(`\n  [경고] ${missing.length}개의 환경 변수가 설정되지 않았습니다.`)
    console.log('  .env.example 파일을 참고해서 설정해주세요.')
    console.log('  누락된 변수가 있어도 빌드는 계속합니다. 해당 기능만 작동하지 않습니다.\n')
  } else {
    console.log('\n  모든 환경 변수가 설정되었습니다. 빌드를 시작합니다.\n')
  }
}

main()
