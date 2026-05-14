/**
 * Tags 유틸리티 함수
 * SQLite 변환으로 인해 tags가 String[]에서 String으로 변경됨
 * 호환성을 위한 헬퍼 함수들
 */

/**
 * 문자열 tags를 배열로 변환
 * @param tags - 쉼표로 구분된 문자열 또는 배열
 * @returns 태그 배열
 */
export function tagsToArray(tags: string | string[] | null | undefined): string[] {
  if (!tags) return []
  if (Array.isArray(tags)) return tags
  if (typeof tags === 'string') {
    return tags.split(',').map(tag => tag.trim()).filter(Boolean)
  }
  return []
}

/**
 * 배열 tags를 문자열로 변환 (데이터베이스 저장용)
 * @param tags - 태그 배열
 * @returns 쉼표로 구분된 문자열
 */
export function tagsToString(tags: string[] | string | null | undefined): string {
  if (!tags) return ''
  if (typeof tags === 'string') return tags
  if (Array.isArray(tags)) return tags.join(',')
  return ''
}

/**
 * Post 객체의 tags를 배열로 변환하여 반환
 * @param post - Post 객체
 * @returns tags가 배열로 변환된 Post 객체
 */
export function normalizePostTags<T extends { tags: string | string[] | null | undefined }>(post: T): T & { tags: string[] } {
  return {
    ...post,
    tags: tagsToArray(post.tags)
  }
}

/**
 * 여러 Post 객체들의 tags를 배열로 변환
 * @param posts - Post 객체 배열
 * @returns tags가 배열로 변환된 Post 객체 배열
 */
export function normalizePostsTags<T extends { tags: string | string[] | null | undefined }>(posts: T[]): (T & { tags: string[] })[] {
  return posts.map(normalizePostTags)
}