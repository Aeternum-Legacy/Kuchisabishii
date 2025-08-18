'use client'

import { useEffect } from 'react'
import { initializePerformanceOptimizations } from '@/utils/performanceOptimization'

/**
 * Performance Optimizer Component
 * Initializes performance optimizations on the client side
 */
export default function PerformanceOptimizer() {
  useEffect(() => {
    // Initialize performance optimizations once
    initializePerformanceOptimizations()
  }, [])

  // This component renders nothing - it's just for side effects
  return null
}