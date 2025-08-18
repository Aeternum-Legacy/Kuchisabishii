'use client';

/**
 * Touch Optimization Utilities
 * Provides passive event listener setup for better scroll performance
 */

export interface TouchEventOptions extends AddEventListenerOptions {
  passive?: boolean;
  capture?: boolean;
}

/**
 * Adds passive event listeners for better scroll performance
 * Prevents console warnings about passive event listeners
 */
export const addPassiveTouchListener = (
  element: HTMLElement,
  event: string,
  handler: EventListener,
  options?: TouchEventOptions
): void => {
  const touchOptions: TouchEventOptions = {
    passive: true,
    capture: false,
    ...options,
  };

  element.addEventListener(event, handler, touchOptions);
};

/**
 * Removes passive touch event listeners
 */
export const removePassiveTouchListener = (
  element: HTMLElement,
  event: string,
  handler: EventListener,
  options?: TouchEventOptions
): void => {
  const touchOptions: TouchEventOptions = {
    passive: true,
    capture: false,
    ...options,
  };

  element.removeEventListener(event, handler, touchOptions);
};

/**
 * CSS-in-JS touch optimization styles
 */
export const touchOptimizationStyles = {
  // Improves touch responsiveness and prevents 300ms tap delay
  touchAction: 'manipulation',
  // Enables hardware acceleration for smooth animations
  transform: 'translateZ(0)',
  // Optimizes repaints during touch interactions
  willChange: 'transform',
  // Improves scroll performance on iOS
  WebkitOverflowScrolling: 'touch',
} as const;

/**
 * React hook for optimized touch interactions
 */
export const useTouchOptimization = () => {
  return {
    styles: touchOptimizationStyles,
    addPassiveListener: addPassiveTouchListener,
    removePassiveListener: removePassiveTouchListener,
  };
};

/**
 * Common touch-optimized CSS classes for components
 */
export const touchOptimizedClasses = {
  // For buttons and interactive elements
  interactive: 'touch-manipulation transform-gpu will-change-transform active:scale-95 transition-transform duration-150',
  // For scrollable containers
  scrollable: 'overflow-scroll scroll-smooth',
  // For cards and swipeable elements
  swipeable: 'touch-manipulation transform-gpu will-change-transform',
  // For tab bars and navigation
  navigation: 'touch-manipulation select-none',
} as const;

/**
 * Detects if the device supports touch
 */
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore - Legacy support
    navigator.msMaxTouchPoints > 0
  );
};

/**
 * Gets optimal touch target size based on device
 */
export const getOptimalTouchTargetSize = (): { width: number; height: number } => {
  // iOS and Android recommend minimum 44px touch targets
  const minSize = 44;
  
  if (typeof window === 'undefined') {
    return { width: minSize, height: minSize };
  }
  
  // Adjust for high DPI displays
  const dpr = window.devicePixelRatio || 1;
  const adjustedSize = Math.max(minSize, minSize * (dpr > 2 ? 1.2 : 1));
  
  return { width: adjustedSize, height: adjustedSize };
};