export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';
import { getSystemInstruction, getRelevantKnowledgeContext, generateContentPrompt, generateCoupangPrompt } from '@/lib/ai-prompts';
import { env } from '@/lib/env';
import { withErrorHandler, logger, createSuccessResponse, validateRequest } from '@/lib/error-handler';
import { generateContentSchema } from '@/lib/validations';
import { generateSlug, generateUniqueSlug } from '@/lib/utils/slug';
import { autoGenerateThumbnailUrl } from '@/lib/utils/thumbnail';
import { searchUnsplashImage, extractImageKeywords, getOptimizedImageUrl } from '@/lib/unsplash';
import { tagsToString } from '@/lib/utils/tags'
import { unwrapContent } from '@/lib/utils/content'
import { checkGeminiRateLimit, createRateLimitResponse } from '@/lib/rate-limit';
import { verifyAdminAuth } from '@/lib/auth';
import {
  COUPANG_DISCLAIMER_MARKDOWN,
  COUPANG_DISCLAIMER_TEXT,
  extractCoupangUrl,
  isCoupangPartnerInput,
  sanitizeCoupangEmbed,
} from '@/lib/coupang';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY || '');

async function generateContentHandler(request: NextRequest): Promise<NextResponse> {
  // Validate input data
  const validatedData = await validateRequest(request, generateContentSchema);
  const { prompt, keywords, publishDate, draftOutline, coupangLink } = validatedData;
  const normalizedCoupangUrl = coupangLink ? extractCoupangUrl(coupangLink) : '';
  const coupangEmbed = coupangLink ? sanitizeCoupangEmbed(coupangLink) : '';
  const hasCoupangInput = !!coupangLink?.trim();

  logger.info('Generating content', {
    promptLength: prompt.length,
    keywordsCount: keywords?.length || 0,
    hasDraftOutline: !!draftOutline,
    hasCoupangLink: hasCoupangInput,
  });

  if (hasCoupangInput && !isCoupangPartnerInput(coupangLink || '')) {
    return NextResponse.json(
      { error: '쿠팡 파트너스 링크 또는 iframe HTML만 입력할 수 있습니다.' },
      { status: 400 }
    )
  }

  // Step 1: 파일 기반 시스템 지침 로드
  const systemInstruction = await getSystemInstruction();

  // Step 2: 지식 파일 컨텍스트 로드
  const knowledgeContext = await getRelevantKnowledgeContext(
    [prompt, keywords?.join(' '), draftOutline].filter(Boolean).join('\n')
  );

  // Step 3: 프롬프트 조합
  let userPrompt = generateContentPrompt(prompt, keywords, draftOutline);

  // 쿠팡 링크가 있으면 쿠팡 프롬프트 추가
  if (hasCoupangInput) {
    userPrompt += '\n' + generateCoupangPrompt(coupangLink || '');
  }

  const fullPrompt = `${systemInstruction}\n\n------\n\n${knowledgeContext}**EXECUTE TASK:**\n\n${userPrompt}`;

  // Step 4: Gemini API 호출
  logger.info('Starting Gemini content generation');
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
  const result = await model.generateContent({
    contents: [{
      role: 'user',
      parts: [{ text: fullPrompt }]
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
    }
  });

  logger.info('Gemini API call successful');
  const responseText = result.response.text();
  logger.info('Response text length', { length: responseText.length });

  // Step 5: Parse the generated content
  let parsedContent;
  try {
    let jsonText = responseText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    parsedContent = JSON.parse(jsonText);

    if (parsedContent.content && typeof parsedContent.content === 'string') {
      // Content is already extracted correctly
    } else if (typeof parsedContent === 'object' && !parsedContent.content) {
      parsedContent = {
        title: parsedContent.title || prompt.substring(0, 60),
        content: responseText,
        excerpt: parsedContent.excerpt || responseText.substring(0, 160),
        tags: parsedContent.tags || keywords || []
      };
    }
  } catch {
    parsedContent = {
      title: prompt.substring(0, 60),
      content: responseText,
      excerpt: responseText.substring(0, 160),
      tags: keywords || []
    };
  }

  // Step 5b: 쿠팡 면책 문구 강제 삽입 (AI가 빠뜨릴 경우 안전장치)
  if (hasCoupangInput && parsedContent.content) {
    if (coupangEmbed && !parsedContent.content.includes('<iframe')) {
      parsedContent.content = parsedContent.content + `\n\n${coupangEmbed}\n`
    } else if (normalizedCoupangUrl && !parsedContent.content.includes(normalizedCoupangUrl)) {
      parsedContent.content = parsedContent.content + `\n\n[쿠팡에서 상품 보기](${normalizedCoupangUrl})\n`
    }

    if (!parsedContent.content.includes(COUPANG_DISCLAIMER_TEXT)) {
      parsedContent.content = parsedContent.content + COUPANG_DISCLAIMER_MARKDOWN;
    }

    const tags = Array.isArray(parsedContent.tags) ? parsedContent.tags : []
    if (!tags.some((tag: string) => tag.includes('쿠팡'))) {
      parsedContent.tags = [...tags, '쿠팡파트너스']
    }
  }

  // Step 6: Save to database as draft
  const scheduledAt = publishDate ? new Date(publishDate) : null;
  const postTitle = parsedContent.title || prompt;

  // AI가 반환한 영문 슬러그를 우선 사용, 없거나 영문이 아니면 fallback
  const aiSlug = typeof parsedContent.slug === 'string' ? parsedContent.slug : '';
  const baseSlug = generateSlug(aiSlug || postTitle);
  // 중복 시 -2, -3... suffix (타임스탬프 X)
  const slug = await generateUniqueSlug(baseSlug, async (candidate) => {
    const existing = await prisma.post.findUnique({ where: { slug: candidate }, select: { id: true } });
    return !!existing;
  });

  // Cover image: parsed → Unsplash → OG fallback
  let coverImageUrl: string = parsedContent.coverImage || '';
  if (!coverImageUrl) {
    try {
      const query = extractImageKeywords(postTitle);
      const image = await searchUnsplashImage(query);
      if (image) {
        coverImageUrl = getOptimizedImageUrl(image, 1080, 75);
        logger.info('Unsplash thumbnail assigned at generation', { query });
      }
    } catch (err) {
      logger.warn('Unsplash 검색 실패, OG 이미지로 폴백', { err: err instanceof Error ? err.message : String(err) });
    }
  }
  if (!coverImageUrl) {
    coverImageUrl = autoGenerateThumbnailUrl(postTitle, request);
  }

  const post = await prisma.post.create({
    data: {
      title: postTitle,
      slug,
      content: unwrapContent(parsedContent.content || responseText),
      excerpt: parsedContent.excerpt || responseText.substring(0, 160),
      tags: tagsToString(parsedContent.tags || []),
      seoTitle: parsedContent.seoTitle || parsedContent.title,
      seoDescription: parsedContent.seoDescription || parsedContent.excerpt,
      coverImage: coverImageUrl,
      status: 'DRAFT',
      scheduledAt,
      author: 'AI',
      originalLanguage: 'ko'
    }
  });

  logger.info('Content generated and saved', {
    postId: post.id,
    slug: post.slug,
    status: post.status
  });

  return createSuccessResponse({
    ...parsedContent,
    id: post.id,
    slug: post.slug,
    status: post.status,
    scheduledAt: post.scheduledAt,
  }, new URL(request.url).pathname);
}

export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    )
  }

  const rateLimit = checkGeminiRateLimit()
  if (!rateLimit.success) {
    return NextResponse.json(
      createRateLimitResponse(rateLimit.resetTime),
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString()
        }
      }
    )
  }

  return withErrorHandler(generateContentHandler)(request)
}
