/**
 * OAuth Performance Monitoring Utilities
 * Monitors and optimizes OAuth flow performance to prevent requestIdleCallback violations
 */

interface PerformanceMetrics {
  startTime: number
  endTime?: number
  duration?: number
  violationDetected?: boolean
  violationThreshold: number
}

class OAuthPerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map()
  private readonly VIOLATION_THRESHOLD = 50 // 50ms threshold for requestIdleCallback
  private violationCount = 0

  constructor() {
    this.setupRequestIdleCallbackMonitoring()
  }

  /**
   * Monitor requestIdleCallback violations
   */
  private setupRequestIdleCallbackMonitoring() {
    if (typeof window === 'undefined' || !window.requestIdleCallback) return

    const originalRequestIdleCallback = window.requestIdleCallback
    
    window.requestIdleCallback = (callback, options = {}) => {
      const wrappedCallback = (deadline: IdleDeadline) => {
        const startTime = performance.now()
        
        try {
          const result = callback(deadline)
          const duration = performance.now() - startTime
          
          // Log violation if callback took too long
          if (duration > this.VIOLATION_THRESHOLD) {
            this.logViolation('requestIdleCallback', startTime, duration)
          }
          
          return result
        } catch (error) {
          console.error('RequestIdleCallback error:', error)
          throw error
        }
      }

      return originalRequestIdleCallback.call(window, wrappedCallback, options)
    }
  }

  /**
   * Start monitoring an OAuth operation
   */
  startMonitoring(operationName: string): void {
    this.metrics.set(operationName, {
      startTime: performance.now(),
      violationThreshold: this.VIOLATION_THRESHOLD
    })
  }

  /**
   * End monitoring an OAuth operation
   */
  endMonitoring(operationName: string): PerformanceMetrics | null {
    const metric = this.metrics.get(operationName)
    if (!metric) return null

    const endTime = performance.now()
    const duration = endTime - metric.startTime

    const updatedMetric: PerformanceMetrics = {
      ...metric,
      endTime,
      duration,
      violationDetected: duration > this.VIOLATION_THRESHOLD
    }

    this.metrics.set(operationName, updatedMetric)

    // Log if this operation caused a violation
    if (updatedMetric.violationDetected) {
      this.logViolation(operationName, metric.startTime, duration)
    }

    return updatedMetric
  }

  /**
   * Log performance violation
   */
  private logViolation(operationName: string, startTime: number, duration: number): void {
    this.violationCount++
    
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[OAuth Performance] Violation detected in ${operationName}:`, {
        duration: `${duration.toFixed(2)}ms`,
        threshold: `${this.VIOLATION_THRESHOLD}ms`,
        violationCount: this.violationCount,
        timestamp: new Date(startTime).toISOString()
      })
    }

    // In production, send to analytics (implement as needed)
    if (process.env.NODE_ENV === 'production') {
      this.sendViolationToAnalytics(operationName, duration)
    }
  }

  /**
   * Send violation data to analytics (placeholder)
   */
  private sendViolationToAnalytics(operationName: string, duration: number): void {
    // Implement your analytics tracking here
    // Example: gtag, mixpanel, etc.
    try {
      if ((window as any).gtag) {
        (window as any).gtag('event', 'oauth_performance_violation', {
          operation: operationName,
          duration: Math.round(duration),
          violation_threshold: this.VIOLATION_THRESHOLD
        })
      }
    } catch (error) {
      // Silently fail analytics
    }
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    totalViolations: number
    operations: Array<{ name: string; metrics: PerformanceMetrics }>
  } {
    const operations = Array.from(this.metrics.entries()).map(([name, metrics]) => ({
      name,
      metrics
    }))

    return {
      totalViolations: this.violationCount,
      operations
    }
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear()
    this.violationCount = 0
  }
}

// Singleton instance
export const oauthPerformanceMonitor = new OAuthPerformanceMonitor()

/**
 * Decorator for monitoring OAuth operations
 */
export function monitorOAuthPerformance(operationName: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      oauthPerformanceMonitor.startMonitoring(operationName)
      
      try {
        const result = await originalMethod.apply(this, args)
        return result
      } finally {
        oauthPerformanceMonitor.endMonitoring(operationName)
      }
    }

    return descriptor
  }
}

/**
 * Utility to defer heavy operations during OAuth
 */
export function deferOAuthOperation<T>(
  operation: () => T | Promise<T>,
  priority: 'immediate' | 'idle' | 'timeout' = 'idle',
  timeoutMs = 100
): Promise<T> {
  return new Promise((resolve, reject) => {
    const executeOperation = async () => {
      try {
        const result = await operation()
        resolve(result)
      } catch (error) {
        reject(error)
      }
    }

    switch (priority) {
      case 'immediate':
        executeOperation()
        break
      
      case 'idle':
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => executeOperation(), { timeout: timeoutMs })
        } else {
          setTimeout(executeOperation, 0)
        }
        break
      
      case 'timeout':
        setTimeout(executeOperation, timeoutMs)
        break
    }
  })
}

/**
 * Optimize OAuth button rendering
 */
export function optimizeOAuthButtonRendering() {
  // Use CSS containment for OAuth buttons
  const style = document.createElement('style')
  style.textContent = `
    [data-oauth-button] {
      contain: layout style paint;
      will-change: transform;
    }
    
    [data-oauth-button]:hover {
      transform: translateZ(0);
    }
  `
  
  if (!document.head.querySelector('[data-oauth-performance]')) {
    style.setAttribute('data-oauth-performance', 'true')
    document.head.appendChild(style)
  }
}

/**
 * Pre-load OAuth dependencies during idle time
 */
export function preloadOAuthDependencies() {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // Preconnect to OAuth providers
      const preconnectLinks = [
        'https://accounts.google.com',
        'https://apis.google.com',
        'https://www.gstatic.com'
      ]

      preconnectLinks.forEach(href => {
        if (!document.querySelector(`link[href="${href}"]`)) {
          const link = document.createElement('link')
          link.rel = 'preconnect'
          link.href = href
          link.crossOrigin = 'anonymous'
          document.head.appendChild(link)
        }
      })
    }, { timeout: 200 })
  }
}