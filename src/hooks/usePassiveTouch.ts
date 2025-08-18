import { useEffect, useRef, useCallback } from 'react'

/**
 * Passive Touch Hooks for Mobile Performance
 * Eliminates console warnings and improves scroll performance
 */

// Base passive touch hook
export function usePassiveTouch(
  element: HTMLElement | null,
  onTouch: (event: TouchEvent) => void,
  eventType: 'touchstart' | 'touchmove' | 'touchend' = 'touchstart'
) {
  const handlerRef = useRef(onTouch)
  handlerRef.current = onTouch

  useEffect(() => {
    if (!element) return

    const handler = (event: TouchEvent) => {
      handlerRef.current(event)
    }

    // Always use passive: true for touch events
    element.addEventListener(eventType, handler, { passive: true })

    return () => {
      element.removeEventListener(eventType, handler)
    }
  }, [element, eventType])
}

// Optimized swipe detection with passive listeners
export function usePassiveSwipe(
  element: HTMLElement | null,
  onSwipe: (direction: 'left' | 'right' | 'up' | 'down') => void,
  threshold = 50
) {
  const startRef = useRef<{ x: number; y: number } | null>(null)

  const handleTouchStart = useCallback((event: TouchEvent) => {
    const touch = event.touches[0]
    startRef.current = { x: touch.clientX, y: touch.clientY }
  }, [])

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!startRef.current) return

    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - startRef.current.x
    const deltaY = touch.clientY - startRef.current.y

    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)

    if (Math.max(absDeltaX, absDeltaY) < threshold) return

    if (absDeltaX > absDeltaY) {
      onSwipe(deltaX > 0 ? 'right' : 'left')
    } else {
      onSwipe(deltaY > 0 ? 'down' : 'up')
    }

    startRef.current = null
  }, [onSwipe, threshold])

  usePassiveTouch(element, handleTouchStart, 'touchstart')
  usePassiveTouch(element, handleTouchEnd, 'touchend')
}

// Pull-to-refresh with passive touch events
export function usePassivePullToRefresh(
  element: HTMLElement | null,
  onRefresh: () => void,
  threshold = 80
) {
  const startY = useRef(0)
  const isPulling = useRef(false)

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (element && element.scrollTop === 0) {
      startY.current = event.touches[0].clientY
      isPulling.current = true
    }
  }, [element])

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!isPulling.current) return

    const currentY = event.touches[0].clientY
    const deltaY = currentY - startY.current

    if (deltaY > threshold) {
      // Visual feedback could be added here
    }
  }, [threshold])

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!isPulling.current) return

    const currentY = event.changedTouches[0].clientY
    const deltaY = currentY - startY.current

    if (deltaY > threshold) {
      onRefresh()
    }

    isPulling.current = false
  }, [onRefresh, threshold])

  usePassiveTouch(element, handleTouchStart, 'touchstart')
  usePassiveTouch(element, handleTouchMove, 'touchmove')
  usePassiveTouch(element, handleTouchEnd, 'touchend')
}

// Optimized scroll performance with throttling
export function useOptimizedScroll(
  element: HTMLElement | null,
  onScroll: (scrollTop: number) => void,
  throttleMs = 16 // ~60fps
) {
  const lastCallRef = useRef(0)
  const handlerRef = useRef(onScroll)
  handlerRef.current = onScroll

  useEffect(() => {
    if (!element) return

    const handler = (event: Event) => {
      const now = Date.now()
      if (now - lastCallRef.current >= throttleMs) {
        lastCallRef.current = now
        const target = event.target as HTMLElement
        handlerRef.current(target.scrollTop)
      }
    }

    // Passive scroll listeners for better performance
    element.addEventListener('scroll', handler, { passive: true })

    return () => {
      element.removeEventListener('scroll', handler)
    }
  }, [element, throttleMs])
}