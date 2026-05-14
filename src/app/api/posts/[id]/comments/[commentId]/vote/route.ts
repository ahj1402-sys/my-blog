export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT /api/posts/[id]/comments/[commentId]/vote - 투표
export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string; commentId: string }> }
) {
  const { commentId } = await props.params

  try {
    const body = await request.json()
    const { voteType } = body // 'user' or 'ai'

    if (voteType !== 'user' && voteType !== 'ai') {
      return NextResponse.json(
        { error: 'Invalid vote type' },
        { status: 400 }
      )
    }

    // 투표 수 증가
    const updateData = voteType === 'user' 
      ? { agreeWithUser: { increment: 1 } }
      : { agreeWithAI: { increment: 1 } }

    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: updateData,
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error('Failed to update vote:', error)
    return NextResponse.json(
      { error: 'Failed to update vote' },
      { status: 500 }
    )
  }
}