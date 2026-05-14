import { redirect } from 'next/navigation'

export default function YouTubePage() {
  // /youtube로 접근 시 /admin/youtube로 리다이렉트
  redirect('/admin/youtube')
}