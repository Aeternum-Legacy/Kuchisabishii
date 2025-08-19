'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { oauthPerformanceMonitor, preloadOAuthDependencies, optimizeOAuthButtonRendering } from '@/utils/oauthPerformanceMonitor'

interface OAuthPerformanceContextType {
  monitor: typeof oauthPerformanceMonitor
}

const OAuthPerformanceContext = createContext<OAuthPerformanceContextType | null>(null)

interface OAuthPerformanceProviderProps {
  children: ReactNode
}

/**
 * OAuth Performance Provider
 * Provides performance monitoring for OAuth operations throughout the app
 */
export function OAuthPerformanceProvider({ children }: OAuthPerformanceProviderProps) {
  useEffect(() => {
    // Initialize OAuth performance optimizations
    if (typeof window !== 'undefined') {
      // Defer optimizations to prevent blocking initial render
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          optimizeOAuthButtonRendering()
          preloadOAuthDependencies()
        }, { timeout: 200 })
      } else {
        setTimeout(() => {
          optimizeOAuthButtonRendering()
          preloadOAuthDependencies()
        }, 100)
      }
    }
  }, [])

  const contextValue: OAuthPerformanceContextType = {
    monitor: oauthPerformanceMonitor
  }

  return (
    <OAuthPerformanceContext.Provider value={contextValue}>
      {children}
    </OAuthPerformanceContext.Provider>
  )
}

/**
 * Hook to access OAuth performance monitoring
 */
export function useOAuthPerformance(): OAuthPerformanceContextType {
  const context = useContext(OAuthPerformanceContext)
  
  if (!context) {
    throw new Error('useOAuthPerformance must be used within an OAuthPerformanceProvider')
  }
  
  return context
}

/**
 * HOC to monitor component performance during OAuth flows
 */
export function withOAuthPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  return function PerformanceMonitoredComponent(props: P) {
    const { monitor } = useOAuthPerformance()

    useEffect(() => {
      monitor.startMonitoring(`${componentName}-mount`)
      
      return () => {
        monitor.endMonitoring(`${componentName}-mount`)
      }
    }, [monitor])

    return <WrappedComponent {...props} />
  }
}