import sharp from 'sharp'

export interface ImageOptimizationOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
}

export async function optimizeImage(
  buffer: Buffer,
  options: ImageOptimizationOptions = {}
): Promise<Buffer> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 85,
    format = 'webp'
  } = options

  try {
    let image = sharp(buffer)
    
    // Get metadata
    const metadata = await image.metadata()
    
    // Resize if needed
    if (metadata.width && metadata.height) {
      if (metadata.width > maxWidth || metadata.height > maxHeight) {
        image = image.resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
      }
    }
    
    // Convert format and optimize
    switch (format) {
      case 'jpeg':
        image = image.jpeg({ quality, progressive: true })
        break
      case 'png':
        image = image.png({ quality, compressionLevel: 9 })
        break
      case 'webp':
        image = image.webp({ quality })
        break
    }
    
    return await image.toBuffer()
  } catch (error) {
    console.error('Image optimization error:', error)
    // Return original buffer if optimization fails
    return buffer
  }
}

export function getImageMimeType(format: string): string {
  const mimeTypes: Record<string, string> = {
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp'
  }
  return mimeTypes[format.toLowerCase()] || 'image/jpeg'
}

/**
 * Check if the image URL is from YouTube
 */
export function isYouTubeImage(url: string): boolean {
  return url.includes('ytimg.com') || url.includes('youtube.com')
}

/**
 * Check if the image URL is from Vercel Blob Storage
 */
export function isVercelBlobImage(url: string): boolean {
  return url.includes('.public.blob.vercel-storage.com')
}

/**
 * Check if the image URL should use Vercel image optimization
 * Returns false for YouTube images and Vercel Blob Storage images to avoid 402 Payment Required errors
 */
export function shouldUseNextImage(url: string): boolean {
  // Skip optimization for images that cause 402 Payment Required errors
  if (isYouTubeImage(url)) return false
  if (isVercelBlobImage(url)) return false

  return true
}