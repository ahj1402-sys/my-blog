import { redirect } from 'next/navigation'

// Static redirect; no DB access. Revalidate not needed.
export default function PostsPage() {
  redirect('/archive')
}
