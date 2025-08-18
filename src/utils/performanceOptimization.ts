/**
 * Performance Optimization Utilities
 * Addresses browser console warnings and performance issues
 */

// Third-party library passive event listener patches
export function initializePerformanceOptimizations() {
  if (typeof window === 'undefined') return

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
      
      return originalConsoleWarn.apply(console, args)
    }
  }
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