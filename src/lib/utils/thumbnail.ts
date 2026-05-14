/**
 * Thumbnail generation utilities
 */

/**
 * Generate OG image URL for a given title
 * @param title - The title to generate thumbnail for
 * @param baseUrl - The base URL (e.g., https://colemearchy.com or http://localhost:3000)
 * @returns The complete OG image URL
 */
export function generateThumbnailUrl(title: string, baseUrl: string): string {
  // Encode the title for URL
  const encodedTitle = encodeURIComponent(title);

  // Return the OG image API URL
  return `${baseUrl}/api/og?title=${encodedTitle}`;
}

/**
 * Extract base URL from request or environment
 * @param request - Next.js request object (optional)
 * @returns Base URL string
 */
export function getBaseUrl(request?: Request): string {
  if (request) {
    const url = new URL(request.url);
    return `${url.protocol}//${url.host}`;
  }

  // Fallback to environment variables
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }

  // Local development fallback
  return 'http://localhost:3000';
}

/**
 * Generate thumbnail URL from title with automatic base URL detection
 * @param title - The title to generate thumbnail for
 * @param request - Next.js request object (optional)
 * @returns The complete OG image URL
 */
export function autoGenerateThumbnailUrl(title: string, request?: Request): string {
  const baseUrl = getBaseUrl(request);
  return generateThumbnailUrl(title, baseUrl);
}