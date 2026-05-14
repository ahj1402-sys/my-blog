export function calculateReadingTime(content: string): number {
  // Average reading speed: 200 words per minute
  const wordsPerMinute = 200
  
  // Remove markdown syntax for more accurate word count
  const plainText = content
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`.*?`/g, '') // Remove inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Replace links with text
    .replace(/[#*_~>\-]/g, '') // Remove markdown symbols
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim()
  
  // Count words
  const words = plainText.split(/\s+/).filter(word => word.length > 0).length
  
  // Calculate reading time in minutes
  const readingTime = Math.ceil(words / wordsPerMinute)
  
  // Minimum 1 minute
  return Math.max(1, readingTime)
}

export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`
}