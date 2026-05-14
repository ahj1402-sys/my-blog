export type ThreadsMediaType = 'TEXT_POST' | 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'

export interface ThreadsPost {
  id: string
  text?: string
  media_type: ThreadsMediaType
  media_url?: string
  permalink: string
  username: string
  timestamp: string
  topic_tag?: string
}

export interface ThreadsAccount {
  name: string          // e.g. "PARTNERS_DANA"
  displayName: string   // e.g. "Partners Dana"
  tokenKey: string      // e.g. "THREADS_TOKEN_PARTNERS_DANA"
  isConfigured: boolean
}

export interface ThreadsPostsResponse {
  data: ThreadsPost[]
  paging?: {
    cursors?: {
      before?: string
      after?: string
    }
    next?: string
  }
}
