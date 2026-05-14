export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// POST /api/generate-ai-response - AI Devil's Advocate 응답 생성
export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json()

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })

    const prompt = `당신은 Devil's Advocate AI로서 사용자의 의견에 건설적인 반대 의견을 제시합니다.

사용자 의견: ${content}

위 의견에 대해:
1. 지적이고 존중하는 태도로 반대 관점을 제시하세요
2. 사실, 논리, 다른 시각을 활용하세요
3. 대립적이지만 건설적이어야 합니다
4. 2-3 단락으로 간결하게 작성하세요
5. 한국어로 작성하세요`

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 500,
      }
    })

    const aiResponse = result.response.text()

    return NextResponse.json({ aiResponse })
  } catch (error) {
    console.error('Failed to generate AI response:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI response' },
      { status: 500 }
    )
  }
}