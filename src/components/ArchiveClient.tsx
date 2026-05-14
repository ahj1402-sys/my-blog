import Link from 'next/link'

interface Post {
  id: string
  slug: string
  title: string
  excerpt: string | null
  publishedAt: string | null
  tags?: string
}

interface ArchiveClientProps {
  posts: Post[]
  locale: string
}

export default function ArchiveClient({ posts, locale }: ArchiveClientProps) {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          아카이브
        </h1>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">게시물이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <article key={post.id} className="border-b border-gray-200 pb-4">
              <Link
                href={`/posts/${post.slug}`}
                className="block hover:bg-gray-50 -mx-4 px-4 py-2 rounded transition-colors"
              >
                <div className="flex justify-between items-baseline gap-4">
                  <div className="flex-1">
                    <h2 className="text-lg font-medium text-gray-900 hover:text-gray-700 mb-1">
                      {post.title}
                      {(post.tags || '').includes('쿠팡') && (
                        <span className="ml-2 align-middle rounded bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700 ring-1 ring-orange-600/20">
                          쿠팡 파트너스
                        </span>
                      )}
                    </h2>
                    {post.excerpt && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                  <time className="text-sm text-gray-500 whitespace-nowrap">
                    {post.publishedAt && new Date(post.publishedAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </time>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </>
  )
}
