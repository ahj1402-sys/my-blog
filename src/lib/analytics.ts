// Analytics tracking helper
export function trackEvent(
  eventName: string,
  category: string,
  label?: string,
  value?: number
) {
  // Google Analytics tracking
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Track Event:', {
      eventName,
      category,
      label,
      value,
    })
  }
}