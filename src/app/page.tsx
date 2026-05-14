// ISR (revalidate every hour) keeps bfcache enabled; middleware handles the rewrite.
export const revalidate = 3600

export default function RootPage() {
  // Middleware rewrites / to /ko internally, so this page is a build placeholder
  return null
}
