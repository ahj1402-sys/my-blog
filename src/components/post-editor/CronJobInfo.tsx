'use client'

import { useState } from 'react'

export default function CronJobInfo() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-blue-50 transition-colors"
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-blue-900">자동 발행 시스템 작동 중</p>
          <p className="text-xs text-blue-600 mt-0.5">매일 오전 9시 ~ 밤 9시, 1시간 간격으로 13편 자동 생성·발행 (Vercel Cron)</p>
        </div>
        <svg
          className={`w-4 h-4 text-blue-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 border-t border-blue-200">
          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">키워드 저장</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  <a href="/admin/keywords" className="text-blue-600 hover:underline">키워드 관리</a>에서
                  키워드를 등록하면 AI가 자동으로 글을 생성합니다.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">자동 글 생성 & 발행</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Vercel Cron이 매시간 (9시~21시) 저장된 키워드 1개를 골라 AI로 글을 생성하고 즉시 발행합니다. 하루 최대 13편.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-600">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">직접 글쓰기도 가능</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  위 입력창에서 원하는 주제를 입력하면 AI가 즉시 글을 생성합니다. 바로 발행하거나 초안으로 저장할 수 있어요.
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white rounded-lg border border-blue-100">
              <p className="text-xs text-gray-500">
                <span className="font-medium text-gray-700">발행 스케줄 변경이 필요한가요?</span><br />
                Claude Code에서 &quot;vercel.json의 cron 스케줄을 0 9-21 * * * 로 바꿔줘&quot; 처럼 요청하세요.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
