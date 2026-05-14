/**
 * 문자열 관련 유틸리티 함수
 */

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function capitalizeFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return singular;
  return plural || `${singular}s`;
}

export function parseExcerpt(excerpt: string | null): string | null {
  if (!excerpt) return null;
  
  // Handle potentially truncated JSON content
  if (excerpt.includes('```json') || excerpt.includes('"excerpt":')) {
    const excerptMatch = excerpt.match(/"excerpt"\s*:\s*"([^"]+)"/)
    if (excerptMatch) {
      return excerptMatch[1];
    }
    
    const contentMatch = excerpt.match(/"content"\s*:\s*"([^"]+)/)
    if (contentMatch) {
      return contentMatch[1].substring(0, 200) + '...';
    }
    
    // Remove JSON formatting
    const cleanText = excerpt
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .replace(/[{}[\]"]/g, '')
      .trim();
    
    return cleanText.substring(0, 200) + '...';
  }
  
  return excerpt;
}

export function extractTextFromMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]*`/g, '') // Remove inline code
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Convert links to text
    .replace(/[#*_~]/g, '') // Remove markdown formatting
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();
}

export function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}