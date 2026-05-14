// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  error: string;
  details?: any;
  status: number;
}

// Post Types
export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  tags: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  views: number;
}

export interface CreatePostData {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  publishedAt?: Date | string | null;
}

export interface UpdatePostData extends Partial<CreatePostData> {}

// Admin Types
export interface AdminCredentials {
  password: string;
}

export interface AdminSession {
  isAuthenticated: boolean;
  timestamp?: string;
}

// Analytics Types
export interface AnalyticsData {
  views: number;
  pageViews: number;
  uniqueVisitors: number;
  period?: string;
}

// AI Generation Types
export interface GenerateContentRequest {
  prompt: string;
  keywords?: string[];
  publishDate?: string;
}

export interface GenerateContentResponse {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  coverImage?: string;
}

// Knowledge Base Types
export interface Knowledge {
  id: string;
  content: string;
  embedding: number[];
  createdAt: Date;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  tag?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// File Upload Types
export interface UploadedFile {
  url: string;
  filename: string;
  size: number;
  type: string;
}

// Form Types
export interface PostFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  tags: string;
  seoTitle: string;
  seoDescription: string;
  publishedAt: string | null;
}

// Error Types
export type ErrorResponse = {
  error: string;
  message?: string;
  details?: unknown;
  status?: number;
};
