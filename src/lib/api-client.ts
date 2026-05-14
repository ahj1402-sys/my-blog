import {
  Post,
  CreatePostData,
  UpdatePostData,
  GenerateContentRequest,
  GenerateContentResponse,
  PaginationParams,
  PaginatedResponse
} from '@/types'
import { getErrorMessage, ApiError } from './error-handler'

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new ApiError(
          response.status,
          error.error || error.message || 'Request failed',
          error.details
        )
      }

      return await response.json()
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      
      throw new ApiError(
        500,
        getErrorMessage(error),
        error
      )
    }
  }

  // Post API
  posts = {
    list: (params?: PaginationParams) => {
      const searchParams = new URLSearchParams()
      if (params?.page) searchParams.set('page', params.page.toString())
      if (params?.limit) searchParams.set('limit', params.limit.toString())
      if (params?.search) searchParams.set('search', params.search)
      if (params?.tag) searchParams.set('tag', params.tag)
      
      const query = searchParams.toString()
      return this.request<PaginatedResponse<Post>>(
        `/api/posts${query ? `?${query}` : ''}`
      )
    },

    get: (slug: string) => 
      this.request<Post>(`/api/posts/${slug}`),

    create: (data: CreatePostData) =>
      this.request<Post>('/api/posts', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: UpdatePostData) =>
      this.request<Post>(`/api/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      this.request<{ success: boolean }>(`/api/posts/${id}`, {
        method: 'DELETE',
      }),
  }

  // AI Generation API
  ai = {
    generateContent: (data: GenerateContentRequest) =>
      this.request<GenerateContentResponse>('/api/generate-content', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  }

  // Admin API
  admin = {
    login: (password: string) =>
      this.request<{ success: boolean }>('/api/admin/auth', {
        method: 'POST',
        body: JSON.stringify({ password }),
      }),

    uploadImage: async (file: File, postId?: string) => {
      const formData = new FormData()
      formData.append('image', file)
      if (postId) formData.append('postId', postId)

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new ApiError(response.status, 'Upload failed')
      }

      return response.json() as Promise<{ imageUrl: string }>
    },
  }

  // Analytics API
  analytics = {
    getPageViews: () =>
      this.request<{ views: number }>('/api/analytics'),
  }
}

// Singleton instance
const apiClient = new ApiClient()

export default apiClient

// Export typed hooks for React components
export function useApiClient() {
  return apiClient
}