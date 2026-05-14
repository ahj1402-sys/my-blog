export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <a href="/admin" className="text-xl font-semibold text-gray-900 hover:text-gray-700">
                Admin
              </a>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto">
              {/* Admin1: 밀키트 커스텀 */}
              <span className="text-xs text-gray-400 px-2 hidden sm:inline">커스텀</span>
              <a href="/admin/setup" className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md whitespace-nowrap">
                설정 가이드
              </a>
              <a href="/admin/knowledge" className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md whitespace-nowrap">
                전문 지식
              </a>
              <a href="/admin/keywords" className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md whitespace-nowrap">
                키워드
              </a>

              {/* 구분선 */}
              <div className="w-px h-6 bg-gray-200 mx-1" />

              {/* Admin2: 콘텐츠 관리 (CMS) */}
              <span className="text-xs text-gray-400 px-2 hidden sm:inline">CMS</span>
              <a href="/admin" className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md whitespace-nowrap">
                글 관리
              </a>
              <a href="/admin/cornerstone" className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md whitespace-nowrap">
                코너스톤
              </a>
              <a href="/admin/settings" className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md whitespace-nowrap">
                사이트 설정
              </a>

              {/* 구분선 */}
              <div className="w-px h-6 bg-gray-200 mx-1" />

              <a href="/admin/new" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm whitespace-nowrap">
                새 글 작성
              </a>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
