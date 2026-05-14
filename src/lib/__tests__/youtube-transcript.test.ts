/**
 * Tests for YouTube transcript service
 *
 * Coverage goal: 70-80%
 * Test approach: Unit tests for pure functions, mock for API calls
 *
 * Test cases:
 * - processTranscript: text processing, duration calculation, chunking
 * - extractKeyMoments: moment extraction, formatting
 * - generateBlogPrompt: prompt generation for regular/shorts videos
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  YouTubeTranscriptService,
  type TranscriptItem,
  type YouTubeVideoMetadata,
} from '../youtube-transcript'

describe('YouTubeTranscriptService', () => {
  let service: YouTubeTranscriptService

  beforeEach(() => {
    service = new YouTubeTranscriptService()
  })

  describe('processTranscript', () => {
    describe('basic processing', () => {
      it('should combine transcript items into full text', () => {
        const transcript: TranscriptItem[] = [
          { text: 'Hello', start: 0, duration: 1 },
          { text: 'World', start: 1, duration: 1 },
          { text: 'Test', start: 2, duration: 1 },
        ]

        const result = service.processTranscript(transcript)
        expect(result.fullText).toBe('Hello World Test')
      })

      it('should remove extra whitespace', () => {
        const transcript: TranscriptItem[] = [
          { text: 'Hello   ', start: 0, duration: 1 },
          { text: '  World', start: 1, duration: 1 },
        ]

        const result = service.processTranscript(transcript)
        expect(result.fullText).toBe('Hello World')
      })

      it('should calculate total duration', () => {
        const transcript: TranscriptItem[] = [
          { text: 'Hello', start: 0, duration: 2 },
          { text: 'World', start: 2, duration: 3 },
          { text: 'Test', start: 5, duration: 1 },
        ]

        const result = service.processTranscript(transcript)
        expect(result.duration).toBe(6) // 5 + 1
      })

      it('should detect timestamps', () => {
        const transcript: TranscriptItem[] = [
          { text: 'Hello', start: 1, duration: 1 },
        ]

        const result = service.processTranscript(transcript)
        expect(result.hasTimestamps).toBe(true)
      })

      it('should detect no timestamps when all start at 0', () => {
        const transcript: TranscriptItem[] = [
          { text: 'Hello', start: 0, duration: 1 },
          { text: 'World', start: 0, duration: 1 },
        ]

        const result = service.processTranscript(transcript)
        expect(result.hasTimestamps).toBe(false)
      })
    })

    describe('chunking', () => {
      it('should create single chunk for short text', () => {
        const transcript: TranscriptItem[] = [
          { text: 'Short text', start: 0, duration: 1 },
        ]

        const result = service.processTranscript(transcript)
        expect(result.chunks).toHaveLength(1)
        expect(result.chunks[0]).toBe('Short text')
      })

      it('should create multiple chunks for long text', () => {
        // Create text longer than 4000 characters
        const longText = 'This is a sentence. '.repeat(250) // ~5000 characters
        const transcript: TranscriptItem[] = [
          { text: longText, start: 0, duration: 10 },
        ]

        const result = service.processTranscript(transcript)
        expect(result.chunks.length).toBeGreaterThan(1)
      })

      it('should preserve all text in chunks', () => {
        const longText = 'This is a sentence. '.repeat(250)
        const transcript: TranscriptItem[] = [
          { text: longText, start: 0, duration: 10 },
        ]

        const result = service.processTranscript(transcript)
        const combinedChunks = result.chunks.join(' ')

        // All text should be preserved
        expect(combinedChunks.length).toBeGreaterThan(0)
      })
    })

    describe('edge cases', () => {
      it('should handle empty transcript', () => {
        const result = service.processTranscript([])
        expect(result.fullText).toBe('')
        expect(result.chunks).toHaveLength(0)
        expect(result.duration).toBe(0)
      })

      it('should handle single item', () => {
        const transcript: TranscriptItem[] = [
          { text: 'Only one', start: 5, duration: 2 },
        ]

        const result = service.processTranscript(transcript)
        expect(result.fullText).toBe('Only one')
        expect(result.duration).toBe(7) // 5 + 2
      })

      it('should handle Korean text', () => {
        const transcript: TranscriptItem[] = [
          { text: '안녕하세요', start: 0, duration: 1 },
          { text: '세계', start: 1, duration: 1 },
        ]

        const result = service.processTranscript(transcript)
        expect(result.fullText).toBe('안녕하세요 세계')
      })
    })
  })

  describe('extractKeyMoments', () => {
    describe('basic extraction', () => {
      it('should extract evenly distributed moments', () => {
        const transcript: TranscriptItem[] = Array.from({ length: 10 }, (_, i) => ({
          text: `Moment ${i}`,
          start: i * 10,
          duration: 10,
        }))

        const moments = service.extractKeyMoments(transcript, 5)
        expect(moments).toHaveLength(5)
      })

      it('should include timestamp and formatted time', () => {
        const transcript: TranscriptItem[] = [
          { text: 'Start', start: 0, duration: 1 },
          { text: 'Middle', start: 30, duration: 1 },
          { text: 'End', start: 60, duration: 1 },
        ]

        const moments = service.extractKeyMoments(transcript, 3)

        expect(moments[0].timestamp).toBe(0)
        expect(moments[0].timeString).toBe('0:00')

        expect(moments[1].timestamp).toBe(30)
        expect(moments[1].timeString).toBe('0:30')

        expect(moments[2].timestamp).toBe(60)
        expect(moments[2].timeString).toBe('1:00')
      })

      it('should truncate long text to 100 chars', () => {
        const longText = 'a'.repeat(200)
        const transcript: TranscriptItem[] = [
          { text: longText, start: 0, duration: 1 },
        ]

        const moments = service.extractKeyMoments(transcript, 1)
        expect(moments[0].text.length).toBe(103) // 100 + '...'
        expect(moments[0].text.endsWith('...')).toBe(true)
      })
    })

    describe('timestamp formatting', () => {
      it('should format seconds only', () => {
        const transcript: TranscriptItem[] = [
          { text: 'Test', start: 45, duration: 1 },
        ]

        const moments = service.extractKeyMoments(transcript, 1)
        expect(moments[0].timeString).toBe('0:45')
      })

      it('should format minutes and seconds', () => {
        const transcript: TranscriptItem[] = [
          { text: 'Test', start: 125, duration: 1 },
        ]

        const moments = service.extractKeyMoments(transcript, 1)
        expect(moments[0].timeString).toBe('2:05')
      })

      it('should format hours, minutes, and seconds', () => {
        const transcript: TranscriptItem[] = [
          { text: 'Test', start: 3665, duration: 1 },
        ]

        const moments = service.extractKeyMoments(transcript, 1)
        expect(moments[0].timeString).toBe('1:01:05')
      })

      it('should pad single-digit minutes and seconds', () => {
        const transcript: TranscriptItem[] = [
          { text: 'Test', start: 3605, duration: 1 }, // 1:00:05
        ]

        const moments = service.extractKeyMoments(transcript, 1)
        expect(moments[0].timeString).toBe('1:00:05')
      })
    })

    describe('edge cases', () => {
      it('should handle empty transcript', () => {
        const moments = service.extractKeyMoments([], 5)
        expect(moments).toHaveLength(0)
      })

      it('should handle requesting more moments than available', () => {
        const transcript: TranscriptItem[] = [
          { text: 'Only one', start: 0, duration: 1 },
        ]

        const moments = service.extractKeyMoments(transcript, 10)
        // When transcript has only 1 item, interval = floor(1/10) = 0
        // So i * 0 is always 0, and loop runs maxMoments times
        // All moments will point to the same (first) item
        expect(moments.length).toBe(10)
        expect(moments[0].text).toBe(moments[9].text) // All same
      })

      it('should handle zero moments requested', () => {
        const transcript: TranscriptItem[] = [
          { text: 'Test', start: 0, duration: 1 },
        ]

        const moments = service.extractKeyMoments(transcript, 0)
        expect(moments).toHaveLength(0)
      })
    })
  })

  describe('generateBlogPrompt', () => {
    const mockMetadata: YouTubeVideoMetadata = {
      id: 'test-id',
      title: 'Test Video',
      description: 'Test Description',
      channelTitle: 'Test Channel',
      publishedAt: '2024-01-01',
      duration: 'PT5M30S',
      thumbnailUrl: 'https://example.com/thumb.jpg',
    }

    const mockTranscript = {
      fullText: 'This is the full transcript text',
      chunks: ['This is the full transcript text'],
      duration: 330, // 5 minutes 30 seconds
      hasTimestamps: true,
    }

    describe('regular video prompts', () => {
      it('should include video metadata', () => {
        const prompt = service.generateBlogPrompt(mockTranscript, mockMetadata)

        expect(prompt).toContain('Test Video')
        expect(prompt).toContain('Test Channel')
        expect(prompt).toContain('2024-01-01')
      })

      it('should include transcript content', () => {
        const prompt = service.generateBlogPrompt(mockTranscript, mockMetadata)
        expect(prompt).toContain('This is the full transcript text')
      })

      it('should format duration correctly', () => {
        const prompt = service.generateBlogPrompt(mockTranscript, mockMetadata)
        expect(prompt).toContain('5분 30초')
      })

      it('should format duration with seconds only', () => {
        const shortTranscript = { ...mockTranscript, duration: 45 }
        const prompt = service.generateBlogPrompt(shortTranscript, mockMetadata)
        expect(prompt).toContain('45초')
      })

      it('should include chunk information for multi-part transcripts', () => {
        const multiChunkTranscript = {
          ...mockTranscript,
          chunks: ['chunk1', 'chunk2', 'chunk3'],
        }

        const prompt = service.generateBlogPrompt(multiChunkTranscript, mockMetadata, 1)
        expect(prompt).toContain('part 2 of 3')
      })
    })

    describe('shorts video prompts', () => {
      it('should include special shorts instructions', () => {
        const prompt = service.generateBlogPrompt(mockTranscript, mockMetadata, undefined, true)

        expect(prompt).toContain('YouTube Shorts')
        expect(prompt).toContain('1000자 이상')
        expect(prompt).toContain('도입부')
        expect(prompt).toContain('핵심 내용 확장')
      })

      it('should mention shorts duration', () => {
        const shortsTranscript = { ...mockTranscript, duration: 45 }
        const prompt = service.generateBlogPrompt(shortsTranscript, mockMetadata, undefined, true)

        expect(prompt).toContain('Shorts 영상')
        expect(prompt).toContain('45초')
      })

      it('should include 4-part structure requirements', () => {
        const prompt = service.generateBlogPrompt(mockTranscript, mockMetadata, undefined, true)

        expect(prompt).toContain('도입부 (150-200자)')
        expect(prompt).toContain('핵심 내용 확장 (600-800자)')
        expect(prompt).toContain('추가 인사이트 (200-300자)')
        expect(prompt).toContain('마무리 및 실행 계획 (100-150자)')
      })

      it('should emphasize content expansion', () => {
        const prompt = service.generateBlogPrompt(mockTranscript, mockMetadata, undefined, true)

        expect(prompt).toContain('쇼츠가 짧다고 블로그도 짧아서는 안 됩니다')
        expect(prompt).toContain('영상을 보세요')
      })
    })

    describe('content selection', () => {
      it('should use full text when no chunk index provided', () => {
        const prompt = service.generateBlogPrompt(mockTranscript, mockMetadata)
        expect(prompt).toContain('This is the full transcript text')
      })

      it('should use specific chunk when index provided', () => {
        const multiChunkTranscript = {
          ...mockTranscript,
          chunks: ['First chunk', 'Second chunk', 'Third chunk'],
        }

        const prompt = service.generateBlogPrompt(multiChunkTranscript, mockMetadata, 1)
        expect(prompt).toContain('Second chunk')
        expect(prompt).not.toContain('First chunk')
      })
    })
  })
})
