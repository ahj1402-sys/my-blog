import { redirect } from 'next/navigation'

// Static redirect; no DB access. Revalidate not needed.
export default async function PostsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  await params
  redirect('/archive')
}
