import { z } from 'zod';

// 공통 검증 규칙
// Slug validation: allow URL-encoded characters (Korean slugs are URL-encoded in practice)
export const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .refine(
    (slug) => {
      // Allow lowercase letters, numbers, hyphens, and Korean characters
      // Korean range: \uAC00-\uD7A3
      return /^[a-z0-9-\uAC00-\uD7A3%]+$/i.test(slug)
    },
    { message: 'Slug contains invalid characters' }
  );

export const tagsSchema = z
  .union([
    z.array(z.string().min(1)),
    z.string()
  ])
  .transform((val) => {
    if (typeof val === 'string') {
      return val.split(',').map(tag => tag.trim()).filter(Boolean);
    }
    return val;
  })
  .refine((tags) => tags.length >= 1, { message: 'At least one tag is required' })
  .refine((tags) => tags.length <= 10, { message: 'Maximum 10 tags allowed' });

// Post 검증 스키마
export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  slug: slugSchema.optional(),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(500, 'Excerpt too long').optional(),
  coverImage: z.string().url('Invalid image URL').or(z.literal('')).optional(),
  tags: tagsSchema.optional(),
  seoTitle: z.string().max(70, 'SEO title too long').optional(),
  seoDescription: z.string().max(160, 'SEO description too long').optional(),
  publishedAt: z.string().datetime().or(z.literal('')).nullable().optional(),
});

export const updatePostSchema = createPostSchema.partial();

// AI 생성 검증 스키마
export const generateContentSchema = z.object({
  prompt: z.string().min(5, 'Prompt too short').max(1000, 'Prompt too long'),
  keywords: z.array(z.string()).max(20, 'Too many keywords').optional(),
  publishDate: z.string().datetime().optional(),
  draftOutline: z.string().max(5000).optional(),
  coupangLink: z.string().max(5000).optional(),
});

// 파일 업로드 검증
export const imageUploadSchema = z.object({
  size: z.number().max(5 * 1024 * 1024, 'File size must be less than 5MB'),
  type: z
    .string()
    .refine((type) => type.startsWith('image/'), 'File must be an image'),
});

// 페이지네이션 검증
export const paginationSchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1))
    .optional()
    .nullable(),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100))
    .optional()
    .nullable(),
  search: z.string().optional(),
  tag: z.string().optional(),
});

// 관리자 인증 검증
export const adminAuthSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

// 타입 추론을 위한 유틸리티
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type GenerateContentInput = z.infer<typeof generateContentSchema>;
export type PaginationParams = z.infer<typeof paginationSchema>;
