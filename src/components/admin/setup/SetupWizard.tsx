'use client'

import { useState, useEffect } from 'react'

interface StepStatus {
  envCheck: {
    siteUrl: boolean
    tursoDb: boolean
    dbToken: boolean
    geminiKey: boolean
    adminPassword: boolean
  }
  dbConnected: boolean
}

const STEPS = [
  {
    number: 1,
    title: '브랜딩 설정',
    description: 'Claude Cowork에서 블로그 이름과 설명을 변경합니다.',
  },
  {
    number: 2,
    title: 'Turso 데이터베이스',
    description: 'turso.tech에서 무료 DB를 생성하고 URL/토큰을 복사합니다.',
  },
  {
    number: 3,
    title: 'Gemini API 키',
    description: 'aistudio.google.com에서 API 키를 발급받습니다.',
  },
  {
    number: 4,
    title: 'Vercel 배포',
    description: 'Vercel에서 레포를 가져오고 환경 변수를 입력합니다.',
  },
  {
    number: 5,
    title: '도메인 연결 (선택)',
    description: '커스텀 도메인을 연결합니다.',
  },
] as const

export default function SetupWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [status, setStatus] = useState<StepStatus | null>(null)
  const [loading, setLoading] = useState(false)

  const checkStatus = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/setup/validate')
      const data = await res.json()
      setStatus(data)
    } catch {
      // 검증 API가 없거나 실패해도 계속 진행
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  const getStepStatus = (stepNumber: number): 'done' | 'current' | 'pending' => {
    if (!status) return stepNumber === 1 ? 'current' : 'pending'

    const env = status.envCheck
    switch (stepNumber) {
      case 1:
        return 'done' // 브랜딩은 항상 설정된 상태 (기본값 존재)
      case 2:
        return env.tursoDb && env.dbToken ? 'done' : stepNumber <= currentStep ? 'current' : 'pending'
      case 3:
        return env.geminiKey ? 'done' : stepNumber <= currentStep ? 'current' : 'pending'
      case 4:
        return env.siteUrl && env.siteUrl ? 'done' : stepNumber <= currentStep ? 'current' : 'pending'
      case 5:
        return 'pending'
      default:
        return 'pending'
    }
  }

  return (
    <div className="space-y-8">
      {/* 상태 요약 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">설정 상태</h2>
          <button
            onClick={checkStatus}
            disabled={loading}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            {loading ? '확인 중...' : '다시 확인'}
          </button>
        </div>
        {status && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: '사이트 URL', ok: status.envCheck.siteUrl },
              { label: 'Turso DB', ok: status.envCheck.tursoDb },
              { label: 'DB 토큰', ok: status.envCheck.dbToken },
              { label: 'Gemini API', ok: status.envCheck.geminiKey },
              { label: 'Admin PW', ok: status.envCheck.adminPassword },
            ].map(({ label, ok }) => (
              <div
                key={label}
                className={`text-center p-2 rounded text-sm ${
                  ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}
              >
                {ok ? '●' : '○'} {label}
              </div>
            ))}
          </div>
        )}
        {status?.dbConnected !== undefined && (
          <div className={`mt-3 text-sm ${status.dbConnected ? 'text-green-600' : 'text-red-600'}`}>
            DB 연결: {status.dbConnected ? '정상' : '실패 — Turso URL과 토큰을 확인하세요'}
          </div>
        )}
      </div>

      {/* 단계별 가이드 */}
      <div className="space-y-4">
        {STEPS.map((step) => {
          const stepStatus = getStepStatus(step.number)
          const isExpanded = currentStep === step.number

          return (
            <div
              key={step.number}
              className={`bg-white rounded-lg shadow overflow-hidden ${
                stepStatus === 'done' ? 'border-l-4 border-green-500' : ''
              }`}
            >
              <button
                onClick={() => setCurrentStep(isExpanded ? 0 : step.number)}
                className="w-full px-6 py-4 flex items-center gap-4 text-left hover:bg-gray-50"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    stepStatus === 'done'
                      ? 'bg-green-100 text-green-700'
                      : stepStatus === 'current'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {stepStatus === 'done' ? '✓' : step.number}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isExpanded && (
                <div className="px-6 pb-6 border-t">
                  <StepContent stepNumber={step.number} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StepContent({ stepNumber }: { stepNumber: number }) {
  switch (stepNumber) {
    case 1:
      return (
        <div className="pt-4 space-y-4">
          <p className="text-gray-700">
            Claude Cowork에서 다음과 같이 말해보세요:
          </p>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
            <p>&quot;블로그 이름을 [나의 블로그 이름]으로 바꿔줘&quot;</p>
          </div>
          <p className="text-sm text-gray-500">
            Claude가 <code className="bg-gray-100 px-1 rounded">src/config/site.config.ts</code>와{' '}
            <code className="bg-gray-100 px-1 rounded">src/config/brand.config.ts</code>를 자동으로 수정합니다.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
            <strong>변경 가능한 항목:</strong>
            <ul className="mt-2 space-y-1 list-disc pl-4">
              <li>블로그 이름, 제목, 설명</li>
              <li>저자 이름 (개인/조직)</li>
              <li>로고 이미지 (public/ 폴더에 업로드 후 경로 입력)</li>
              <li>Google Analytics ID, Search Console 인증 코드</li>
            </ul>
          </div>
        </div>
      )

    case 2:
      return (
        <div className="pt-4 space-y-4">
          <ol className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 shrink-0">2-1.</span>
              <span>
                <a href="https://turso.tech" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  turso.tech
                </a>
                에 가입합니다 (GitHub 계정으로 로그인).
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 shrink-0">2-2.</span>
              <span>대시보드에서 &quot;Create Database&quot;를 클릭합니다.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 shrink-0">2-3.</span>
              <span>DB 이름을 입력하고 지역은 &quot;Seoul&quot;을 선택합니다.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 shrink-0">2-4.</span>
              <span>
                생성된 DB의 URL (<code className="bg-gray-100 px-1 rounded">libsql://...</code>)을 복사합니다.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 shrink-0">2-5.</span>
              <span>Tokens 탭에서 인증 토큰을 생성하고 복사합니다.</span>
            </li>
          </ol>
          <div className="bg-yellow-50 p-4 rounded-lg text-sm text-yellow-800">
            Turso 무료 플랜: 500개 DB, 9GB 저장공간, 월 10억 행 읽기
          </div>
        </div>
      )

    case 3:
      return (
        <div className="pt-4 space-y-4">
          <ol className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 shrink-0">3-1.</span>
              <span>
                <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  aistudio.google.com
                </a>
                에 접속합니다.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 shrink-0">3-2.</span>
              <span>&quot;Get API Key&quot; → &quot;Create API Key&quot;를 클릭합니다.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 shrink-0">3-3.</span>
              <span>생성된 API 키를 복사합니다.</span>
            </li>
          </ol>
          <div className="bg-yellow-50 p-4 rounded-lg text-sm text-yellow-800">
            Gemini API 무료 플랜: 분당 15회 요청, 일일 1,500회 요청
          </div>
        </div>
      )

    case 4:
      return (
        <div className="pt-4 space-y-4">
          <ol className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 shrink-0">4-1.</span>
              <span>
                <a href="https://vercel.com/new" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  vercel.com/new
                </a>
                에서 &quot;Import Git Repository&quot;를 클릭합니다.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 shrink-0">4-2.</span>
              <span>GitHub 레포를 선택합니다.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 shrink-0">4-3.</span>
              <span>Environment Variables에 5개 환경 변수를 입력합니다:</span>
            </li>
          </ol>
          <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm space-y-1">
            <div><span className="text-gray-500">NEXT_PUBLIC_SITE_URL</span> = 배포 후 URL</div>
            <div><span className="text-gray-500">TURSO_DATABASE_URL</span> = libsql://...</div>
            <div><span className="text-gray-500">DATABASE_AUTH_TOKEN</span> = 토큰값</div>
            <div><span className="text-gray-500">GEMINI_API_KEY</span> = API 키</div>
            <div><span className="text-gray-500">ADMIN_PASSWORD</span> = 비밀번호</div>
          </div>
          <ol className="space-y-3 text-gray-700" start={4}>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 shrink-0">4-4.</span>
              <span>&quot;Deploy&quot; 버튼을 클릭합니다.</span>
            </li>
          </ol>
        </div>
      )

    case 5:
      return (
        <div className="pt-4 space-y-4">
          <p className="text-gray-700">
            (선택 사항) Vercel 대시보드 → Settings → Domains에서 커스텀 도메인을 연결할 수 있습니다.
          </p>
          <ol className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 shrink-0">5-1.</span>
              <span>도메인 등록 서비스에서 도메인을 구매합니다.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 shrink-0">5-2.</span>
              <span>Vercel 대시보드에서 도메인을 추가합니다.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 shrink-0">5-3.</span>
              <span>DNS 설정을 Vercel이 안내하는 대로 변경합니다.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 shrink-0">5-4.</span>
              <span>
                <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_SITE_URL</code>을 새 도메인으로 변경합니다.
              </span>
            </li>
          </ol>
        </div>
      )

    default:
      return null
  }
}
