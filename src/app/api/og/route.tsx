import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

/**
 * OG 이미지 동적 생성.
 * brandConfig.ogCharacterImage가 설정되어 있으면 캐릭터 이미지를 함께 표시한다.
 *
 * NOTE: Edge Runtime에서는 Node.js 모듈 import가 제한되므로
 * config를 직접 import하지 않고 환경변수 + searchParams로 처리한다.
 */

// Edge Runtime에서 사용 가능한 설정값
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Blog'
const OG_CHARACTER_IMAGE = process.env.NEXT_PUBLIC_OG_CHARACTER_IMAGE || ''

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const title = searchParams.get('title') || SITE_NAME
    const url = new URL(req.url)
    const baseUrl = `${url.protocol}//${url.host}`

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000',
            position: 'relative',
            padding: '0 100px',
          }}
        >
          <h1
            style={{
              color: '#fff',
              fontSize: 64,
              fontWeight: 400,
              textAlign: 'center',
              lineHeight: 1.2,
              maxWidth: '900px',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            {title}
          </h1>

          {/* 캐릭터/로고 이미지 (설정된 경우에만 표시) */}
          {OG_CHARACTER_IMAGE && (
            <img
              src={`${baseUrl}${OG_CHARACTER_IMAGE}`}
              width={200}
              height={200}
              style={{
                position: 'absolute',
                bottom: 20,
                right: 40,
              }}
            />
          )}
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.error('OG Image generation error:', e)
    return new Response(`Failed to generate image: ${e.message}`, {
      status: 500,
    })
  }
}
