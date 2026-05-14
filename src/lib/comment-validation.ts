/**
 * 댓글 입력 검증 및 Sanitization
 *
 * XSS 방지, 스팸 방지, 악성 입력 차단
 */

import { z } from 'zod'

/**
 * 댓글 입력 검증 스키마
 */
export const commentSchema = z.object({
  authorName: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9가-힣\s._-]+$/, 'Name contains invalid characters'),

  authorEmail: z
    .string()
    .trim()
    .email('Invalid email address')
    .max(100, 'Email must be less than 100 characters')
    .toLowerCase(),

  content: z
    .string()
    .trim()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment must be less than 2000 characters'),

  parentId: z
    .string()
    .uuid('Invalid parent comment ID')
    .optional()
    .nullable()
})

export type CommentInput = z.infer<typeof commentSchema>

/**
 * HTML/Script 태그 제거 (XSS 방지)
 *
 * 기본적인 텍스트 sanitization을 수행합니다.
 * Markdown은 허용하되, HTML 태그는 제거합니다.
 */
export function sanitizeComment(content: string): string {
  // HTML 태그 제거
  let sanitized = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // <script> 태그 제거
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // <iframe> 태그 제거
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // <object> 태그 제거
    .replace(/<embed[^>]*>/gi, '') // <embed> 태그 제거
    .replace(/<link[^>]*>/gi, '') // <link> 태그 제거
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // <style> 태그 제거
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // on* 이벤트 핸들러 제거
    .replace(/javascript:/gi, '') // javascript: 프로토콜 제거

  // 기본 HTML 엔티티 인코딩 (< > & " ')
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')

  return sanitized.trim()
}

/**
 * 스팸 감지 (간단한 휴리스틱)
 *
 * - URL 과다 포함
 * - 반복 문자 과다
 * - 대문자 과다
 */
export function detectSpam(content: string): { isSpam: boolean; reason?: string } {
  // URL이 3개 이상이면 스팸 의심
  const urlCount = (content.match(/https?:\/\/[^\s]+/gi) || []).length
  if (urlCount >= 3) {
    return { isSpam: true, reason: 'Too many URLs' }
  }

  // 같은 문자가 10번 이상 반복되면 스팸 의심
  if (/(.)\1{9,}/.test(content)) {
    return { isSpam: true, reason: 'Excessive character repetition' }
  }

  // 대문자가 50% 이상이면 스팸 의심
  const upperCaseCount = (content.match(/[A-Z]/g) || []).length
  const letterCount = (content.match(/[a-zA-Z]/g) || []).length
  if (letterCount > 10 && upperCaseCount / letterCount > 0.5) {
    return { isSpam: true, reason: 'Excessive uppercase letters' }
  }

  // 금지 키워드 (영어 스팸)
  const bannedKeywords = [
    'viagra',
    'cialis',
    'casino',
    'lottery',
    'earn money fast',
    'click here now',
    'limited time offer'
  ]

  const lowerContent = content.toLowerCase()
  for (const keyword of bannedKeywords) {
    if (lowerContent.includes(keyword)) {
      return { isSpam: true, reason: `Banned keyword: ${keyword}` }
    }
  }

  return { isSpam: false }
}

/**
 * 댓글 검증 및 Sanitization 수행
 */
export function validateAndSanitizeComment(input: unknown): {
  success: boolean
  data?: CommentInput & { sanitizedContent: string }
  error?: string
} {
  // Zod 스키마 검증
  const validation = commentSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message
    }
  }

  const { authorName, authorEmail, content, parentId } = validation.data

  // Content sanitization
  const sanitizedContent = sanitizeComment(content)

  // 스팸 감지
  const spamCheck = detectSpam(sanitizedContent)
  if (spamCheck.isSpam) {
    return {
      success: false,
      error: `Spam detected: ${spamCheck.reason}`
    }
  }

  return {
    success: true,
    data: {
      authorName: authorName.trim(),
      authorEmail: authorEmail.toLowerCase().trim(),
      content: sanitizedContent,
      sanitizedContent,
      parentId: parentId || null
    }
  }
}
