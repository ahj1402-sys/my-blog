'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ko, enUS } from 'date-fns/locale'
import CommentForm from './CommentForm'
import { useRouter } from 'next/navigation'

interface Comment {
  id: string
  authorName: string
  content: string
  createdAt: string
  aiResponse: string | null
  aiGeneratedAt: string | null
  agreeWithUser: number
  agreeWithAI: number
  replies?: Comment[]
  postSlug?: string
}

interface CommentItemProps {
  comment: Comment
  postSlug: string
  locale?: string
}

export default function CommentItem({ comment, postSlug, locale = 'ko' }: CommentItemProps) {
  const isEnglish = locale === 'en'
  const router = useRouter()
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  
  const totalVotes = comment.agreeWithUser + comment.agreeWithAI
  const userVotePercentage = totalVotes > 0 ? (comment.agreeWithUser / totalVotes) * 100 : 50
  const aiVotePercentage = totalVotes > 0 ? (comment.agreeWithAI / totalVotes) * 100 : 50

  const handleVote = async (voteType: 'user' | 'ai') => {
    if (hasVoted) return

    try {
      const response = await fetch(`/api/posts/${postSlug}/comments/${comment.id}/vote`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voteType }),
      })

      if (response.ok) {
        setHasVoted(true)
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to vote:', error)
    }
  }

  return (
    <div className="border-l-2 border-gray-200 pl-4 py-4">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-gray-900">{comment.authorName}</span>
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: isEnglish ? enUS : ko })}
            </span>
          </div>
          
          <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
          
          {comment.aiResponse && (
            <div className="mt-4 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-purple-600 font-semibold">🤖 AI Devil's Advocate</span>
                {comment.aiGeneratedAt && (
                  <span className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(comment.aiGeneratedAt), { addSuffix: true, locale: isEnglish ? enUS : ko })}
                  </span>
                )}
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{comment.aiResponse}</p>
              
              {/* 투표 시스템 */}
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">{isEnglish ? "Whose opinion do you agree with more?" : "누구의 의견에 더 동의하시나요?"}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleVote('user')}
                    disabled={hasVoted}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      hasVoted
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    {isEnglish ? `User (${comment.agreeWithUser} votes)` : `사용자 (${comment.agreeWithUser}표)`}
                  </button>
                  <button
                    onClick={() => handleVote('ai')}
                    disabled={hasVoted}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      hasVoted
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    {isEnglish ? `AI (${comment.agreeWithAI} votes)` : `AI (${comment.agreeWithAI}표)`}
                  </button>
                </div>
                
                {/* 투표 결과 바 */}
                {totalVotes > 0 && (
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full flex">
                      <div
                        className="bg-blue-500 transition-all duration-300"
                        style={{ width: `${userVotePercentage}%` }}
                      />
                      <div
                        className="bg-purple-500 transition-all duration-300"
                        style={{ width: `${aiVotePercentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="mt-3 flex items-center gap-4">
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {isEnglish ? 'Reply' : '답글 달기'}
            </button>
          </div>
        </div>
      </div>
      
      {/* 답글 폼 */}
      {showReplyForm && (
        <div className="mt-4 ml-8">
          <CommentForm
            postSlug={postSlug}
            parentId={comment.id}
            onSuccess={() => setShowReplyForm(false)}
            onCancel={() => setShowReplyForm(false)}
            locale={locale}
          />
        </div>
      )}
      
      {/* 답글 목록 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-8 mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} postSlug={postSlug} locale={locale} />
          ))}
        </div>
      )}
    </div>
  )
}