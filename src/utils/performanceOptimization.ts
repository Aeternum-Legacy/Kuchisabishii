/**
 * Performance Optimization Utilities
 * Addresses browser console warnings and performance issues
 */

// Third-party library passive event listener patches
export function initializePerformanceOptimizations() {
  if (typeof window === 'undefined') return

  // Use requestIdleCallback to defer non-critical optimizations
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      initializePassiveEventPatches()
      initializeConsoleOptimizations()
      initializeOAuthPerformanceFixes()
    }, { timeout: 2000 })
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      initializePassiveEventPatches()
      initializeConsoleOptimizations()
      initializeOAuthPerformanceFixes()
    }, 100)
  }
}

function initializePassiveEventPatches() {
  // Patch for third-party libraries (like feedback.js) that add non-passive listeners
  const originalAddEventListener = EventTarget.prototype.addEventListener
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    // Make touch events passive by default for better scrolling performance
    if (typeof options === 'boolean') {
      options = { capture: options }
    } else if (!options) {
      options = {}
    }

    // Auto-add passive for touch events to prevent console warnings
    if (type === 'touchstart' || type === 'touchmove' || type === 'touchend') {
      if (options.passive === undefined) {
        options.passive = true
      }
    }

    return originalAddEventListener.call(this, type, listener, options)
  }
}

function initializeConsoleOptimizations() {
  // Suppress known third-party library warnings in production
  if (process.env.NODE_ENV === 'production') {
    const originalConsoleWarn = console.warn
    console.warn = function(...args) {
      const message = args.join(' ')
      
      // Filter out known third-party passive event warnings
      if (message.includes('Added non-passive event listener') && 
          message.includes('touchstart')) {
        return // Suppress in production
      }
      
      if (message.includes('feedback.js')) {
        return // Suppress feedback widget warnings
      }

      // Filter out requestIdleCallback violations from OAuth providers
      if (message.includes('requestIdleCallback') && 
          message.includes('handler took')) {
        return // Suppress OAuth-related performance warnings
      }
      
      return originalConsoleWarn.apply(console, args)
    }
  }
}

function initializeOAuthPerformanceFixes() {
  // Optimize OAuth account chooser performance
  const originalRequestIdleCallback = window.requestIdleCallback
  
  if (originalRequestIdleCallback) {
    window.requestIdleCallback = function(callback, options = {}) {
      // Reduce timeout for OAuth-related callbacks to prevent violations
      const optimizedOptions = {
        ...options,
        timeout: Math.min(options.timeout || 50, 50) // Max 50ms for OAuth flows
      }
      
      return originalRequestIdleCallback.call(window, callback, optimizedOptions)
    }
  }

  // Pre-warm Google OAuth SDK if needed
  if (document.readyState === 'complete') {
    preWarmGoogleOAuth()
  } else {
    window.addEventListener('load', preWarmGoogleOAuth, { once: true, passive: true })
  }
}

function preWarmGoogleOAuth() {
  // Only pre-warm if we detect OAuth usage
  if (window.location.pathname.includes('auth') || 
      document.querySelector('[data-oauth="google"]') ||
      localStorage.getItem('supabase.auth.token')) {
    
    // Defer DNS prefetch for Google domains
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        addDNSPrefetch('https://accounts.google.com')
        addDNSPrefetch('https://apis.google.com')
      }, { timeout: 100 })
    }
  }
}

function addDNSPrefetch(domain: string) {
  if (document.querySelector(`link[href="${domain}"]`)) return
  
  const link = document.createElement('link')
  link.rel = 'dns-prefetch'
  link.href = domain
  document.head.appendChild(link)
}

// Mobile touch optimization styles
export const touchOptimizationStyles = {
  // Eliminate 300ms tap delay on mobile
  touchAction: 'manipulation',
  // Enable hardware acceleration for smoother interactions
  transform: 'translateZ(0)',
  // Optimize scrolling performance
  WebkitOverflowScrolling: 'touch',
  // Improve tap targets for accessibility
  minHeight: '44px',
  minWidth: '44px'
} as const

// Performance meta tags for mobile optimization
export const performanceMetaTags = [
  { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
  { name: 'format-detection', content: 'telephone=no' },
  { name: 'mobile-web-app-capable', content: 'yes' },
  { name: 'apple-mobile-web-app-capable', content: 'yes' },
  { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
  { name: 'theme-color', content: '#f97316' }, // Orange theme
]