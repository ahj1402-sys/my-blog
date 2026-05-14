/**
 * Lightweight Ad Blocker Detection Utility
 *
 * This utility detects if an ad blocker is active by checking if Google AdSense
 * scripts are being blocked. It's minimal (< 1KB) and doesn't impact performance.
 *
 * Detection methods:
 * 1. Check if AdSense script loads
 * 2. Check if a bait element with ad-like classes gets hidden
 */

export function detectAdBlocker(): Promise<boolean> {
  return new Promise((resolve) => {
    // Quick check: If AdSense is already loaded and working, user definitely doesn't have ad blocker
    if (typeof (window as any).adsbygoogle !== 'undefined') {
      resolve(false)
      return
    }

    // Method 1: Try loading AdSense script
    const adsenseTest = document.createElement('script')
    adsenseTest.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
    adsenseTest.async = true

    let scriptLoaded = false
    let scriptErrored = false

    adsenseTest.onload = () => {
      scriptLoaded = true
    }

    adsenseTest.onerror = () => {
      scriptErrored = true
    }

    document.head.appendChild(adsenseTest)

    // Method 2: Bait element with ad-like classes
    const testAd = document.createElement('div')
    testAd.innerHTML = '&nbsp;'
    testAd.className = 'ad ads advertisement banner adsbox ad-placement adsbygoogle'
    testAd.style.cssText = 'width: 300px !important; height: 250px !important; position: absolute !important; left: -9999px !important; top: -9999px !important;'
    testAd.setAttribute('data-ad-slot', '1234567890')

    document.body.appendChild(testAd)

    // Wait longer for slow connections (1000ms instead of 150ms)
    setTimeout(() => {
      // Bait element checks
      const baitHidden =
        testAd.offsetHeight === 0 ||
        testAd.offsetWidth === 0 ||
        window.getComputedStyle(testAd).display === 'none' ||
        window.getComputedStyle(testAd).visibility === 'hidden' ||
        window.getComputedStyle(testAd).opacity === '0'

      // More lenient logic:
      // - If script loaded successfully, definitely NOT blocked
      // - Only flag as blocked if script failed AND bait is hidden
      const isBlocked = !scriptLoaded && scriptErrored && baitHidden

      // Clean up
      try {
        document.body.removeChild(testAd)
        document.head.removeChild(adsenseTest)
      } catch (e) {
        // Elements might have been removed already
      }

      resolve(isBlocked)
    }, 1000)
  })
}

/**
 * Check if user has already been notified about ad blocker
 */
export function hasSeenAdBlockerNotice(): boolean {
  if (typeof window === 'undefined') return false

  try {
    return localStorage.getItem('adblock-notice-seen') === 'true'
  } catch {
    return false
  }
}

/**
 * Mark that user has seen the ad blocker notice
 */
export function markAdBlockerNoticeSeen(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem('adblock-notice-seen', 'true')
  } catch {
    // Ignore if localStorage is not available
  }
}

/**
 * Reset the notice (for testing or user preference)
 */
export function resetAdBlockerNotice(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem('adblock-notice-seen')
  } catch {
    // Ignore if localStorage is not available
  }
}
