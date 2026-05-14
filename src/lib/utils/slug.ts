/**
 * Generate a URL-friendly slug from a title.
 *
 * SEO 규칙 (Google 권장):
 * - 소문자만 사용 (lowercase)
 * - 하이픈(-)으로 단어 구분 (underscore X)
 * - 의미 있는 영문 단어 사용 (한글 X)
 * - 짧고 명확하게 (60자 이내)
 *
 * 한글이 포함된 경우 한글을 제거하고 영문/숫자만 남깁니다.
 * 영문/숫자가 전혀 없으면 `post-{shortId}` 폴백을 반환합니다.
 *
 * @param title - 슬러그로 변환할 제목 (또는 AI가 반환한 슬러그)
 * @param maxLength - 슬러그 최대 길이 (기본값 60)
 */
export function generateSlug(title: string, maxLength: number = 60): string {
  // Clean up title (remove JSON artifacts, code blocks, etc.)
  let cleanTitle = title
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .replace(/[{}"\[\]]/g, ' ')
    .trim();

  if (!cleanTitle) {
    return `post-${shortId()}`;
  }

  let slug = cleanTitle
    .toLowerCase()
    .replace(/[_\s]+/g, '-')      // 공백/언더스코어 → 하이픈
    .replace(/[^a-z0-9-]+/g, '')  // 영문/숫자/하이픈만 남기고 모두 제거 (한글 포함)
    .replace(/-+/g, '-')          // 중복 하이픈 압축
    .replace(/^-+|-+$/g, '')      // 앞뒤 하이픈 제거
    .substring(0, maxLength)
    .replace(/-+$/g, '');         // substring 후 끝에 하이픈이 남을 경우 제거

  // 영문/숫자가 전혀 없으면 폴백
  if (!slug || slug.length < 2) {
    slug = `post-${shortId()}`;
  }

  return slug;
}

/**
 * 짧은 랜덤 ID 생성 (폴백 슬러그용).
 * timestamp + random 대신 7자리 base36으로 깔끔한 식별자.
 */
function shortId(): string {
  return Math.random().toString(36).slice(2, 9);
}

/**
 * Generate a unique slug by appending a suffix if needed
 * @param baseSlug - The base slug to make unique
 * @param checkExists - Async function to check if a slug exists
 * @returns A unique slug
 */
export async function generateUniqueSlug(
  baseSlug: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * @deprecated 타임스탬프+랜덤 suffix는 SEO에 좋지 않습니다.
 * 대신 `generateSlug()` + `generateUniqueSlug()` 조합을 사용하세요.
 *
 * 호환성을 위해 남겨두지만, 내부적으로는 깨끗한 영문 슬러그를 반환합니다.
 */
export function generateUniqueSlugWithTimestamp(title: string, maxLength: number = 60): string {
  return generateSlug(title, maxLength);
}
