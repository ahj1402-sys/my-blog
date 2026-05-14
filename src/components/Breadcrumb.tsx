import Link from 'next/link'

interface BreadcrumbProps {
  postTitle: string
  postSlug: string
}

export default function Breadcrumb({ postTitle, postSlug }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center space-x-2 text-sm text-gray-500">
        <li>
          <Link href="/" className="hover:text-gray-700 transition-colors">
            Home
          </Link>
        </li>
        <li>
          <span className="mx-2">/</span>
        </li>
        <li>
          <Link href="/archive" className="hover:text-gray-700 transition-colors">
            Posts
          </Link>
        </li>
        <li>
          <span className="mx-2">/</span>
        </li>
        <li>
          <span className="text-gray-900 font-medium" aria-current="page">
            {postTitle}
          </span>
        </li>
      </ol>
    </nav>
  )
}