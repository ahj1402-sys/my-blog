'use client'

import { trackNewsletterSignup } from './GoogleAnalytics'

interface NewsletterAnalyticsProps {
  children: React.ReactNode
  onSubmit?: (email: string) => void
}

export default function NewsletterAnalytics({ children, onSubmit }: NewsletterAnalyticsProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    
    if (email) {
      // Track newsletter signup
      trackNewsletterSignup(email)
      
      // Call parent onSubmit handler if provided
      if (onSubmit) {
        onSubmit(email)
      }
      
      // Show success message (you can customize this)
      alert('Thanks for subscribing! We\'ll be in touch soon.')
      
      // Reset form
      e.currentTarget.reset()
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {children}
    </form>
  )
}