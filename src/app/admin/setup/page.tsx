import SetupWizard from '@/components/admin/setup/SetupWizard'

export const dynamic = 'force-dynamic'

export default function SetupPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">설정 가이드</h1>
        <p className="mt-1 text-gray-500">
          아래 5단계를 따라 블로그를 완성하세요. 모든 단계를 완료하면 바로 글을 작성할 수 있습니다.
        </p>
      </div>
      <SetupWizard />
    </div>
  )
}
