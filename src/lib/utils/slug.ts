/**
 * Generate a URL-friendly slug from a title
 * @param title - The title to convert to a slug
 * @param maxLength - Maximum length of the slug (default: 60)
 * @returns URL-friendly slug
 */
export function generateSlug(title: string, maxLength: number = 60): string {
  // Clean up title (remove JSON artifacts, code blocks, etc.)
  let cleanTitle = title
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .replace(/[{}"\[\]]/g, ' ')
    .trim();

  // Fallback for empty or invalid titles
  if (!cleanTitle || cleanTitle.length < 3) {
    cleanTitle = `post-${Date.now()}`;
  }

  let slug = cleanTitle
    .toLowerCase()
    .replace(/[^a-z0-9가-힣ㄱ-ㅎㅏ-ㅣ\s]+/g, '') // Remove special chars, keep Korean and spaces
    .replace(/\s+/g, '-') // Convert spaces to hyphens
    .replace(/-+/g, '-') // Remove duplicate hyphens
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, maxLength);

  // Ensure slug doesn't start/end with hyphen (extra safety)
  slug = slug.replace(/^-+|-+$/g, '');

  // Final fallback if slug is empty
  if (!slug || slug.length < 2) {
    slug = `post-${Date.now()}`;
  }

  return slug;
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
 * Generate a unique slug with timestamp and random number
 * @param title - The title to convert to a slug
 * @param maxLength - Maximum length before adding suffix (default: 50)
 * @returns A unique slug with timestamp and random suffix
 */
export function generateUniqueSlugWithTimestamp(title: string, maxLength: number = 50): string {
  const baseSlug = generateSlug(title, maxLength);
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 1000);

  return `${baseSlug}-${timestamp}-${randomNum}`;
}
