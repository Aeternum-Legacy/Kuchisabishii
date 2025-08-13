'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { GestureState, HapticFeedbackType } from '@/types/mobile';

// Haptic feedback hook
export const useHapticFeedback = () => {
  const triggerHaptic = useCallback((type: keyof HapticFeedbackType = 'light') => {
    if (typeof window !== 'undefined' && 'navigator' in window) {
      // Web Vibration API
      if ('vibrate' in navigator) {
        switch (type) {
          case 'light':
            navigator.vibrate(10);
            break;
          case 'medium':
            navigator.vibrate(20);
            break;
          case 'heavy':
            navigator.vibrate(50);
            break;
          case 'success':
            navigator.vibrate([10, 50, 10]);
            break;
          case 'warning':
            navigator.vibrate([20, 20, 20]);
            break;
          case 'error':
            navigator.vibrate([100]);
            break;
        }
      }
    }
  }, []);

  return { triggerHaptic };
};

// Swipe gesture hook
export const useSwipeGesture = (onSwipeLeft?: () => void, onSwipeRight?: () => void) => {
  const [gestureState, setGestureState] = useState<GestureState>({
    isSwipingLeft: false,
    isSwipingRight: false,
    swipeProgress: 0,
  });
  
  const touchStartX = useRef<number>(0);
  const touchCurrentX = useRef<number>(0);
  const { triggerHaptic } = useHapticFeedback();

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchCurrentX.current = e.touches[0].clientX;
    const deltaX = touchCurrentX.current - touchStartX.current;
    const progress = Math.min(Math.abs(deltaX) / 100, 1);

    setGestureState({
      isSwipingLeft: deltaX < -20,
      isSwipingRight: deltaX > 20,
      swipeProgress: progress,
    });
  }, []);

  const handleTouchEnd = useCallback(() => {
    const deltaX = touchCurrentX.current - touchStartX.current;
    
    if (deltaX < -50) {
      triggerHaptic('light');
      onSwipeLeft?.();
    } else if (deltaX > 50) {
      triggerHaptic('light');
      onSwipeRight?.();
    }

    setGestureState({
      isSwipingLeft: false,
      isSwipingRight: false,
      swipeProgress: 0,
    });
  }, [onSwipeLeft, onSwipeRight, triggerHaptic]);

  return {
    gestureState,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
};

// Pull-to-refresh hook
export const usePullToRefresh = (onRefresh: () => Promise<void>) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef<number>(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const { triggerHaptic } = useHapticFeedback();

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (scrollElementRef.current?.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (scrollElementRef.current?.scrollTop === 0 && !isRefreshing) {
      const deltaY = e.touches[0].clientY - touchStartY.current;
      if (deltaY > 0) {
        setPullDistance(Math.min(deltaY, 120));
        
        // Haptic feedback at threshold
        if (deltaY > 80 && pullDistance <= 80) {
          triggerHaptic('medium');
        }
      }
    }
  }, [isRefreshing, pullDistance, triggerHaptic]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance > 80 && !isRefreshing) {
      setIsRefreshing(true);
      triggerHaptic('success');
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
  }, [pullDistance, isRefreshing, onRefresh, triggerHaptic]);

  return {
    isRefreshing,
    pullDistance,
    scrollElementRef,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
};

// Safe area hook
export const useSafeArea = () => {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Get CSS safe area values
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      
      setSafeArea({
        top: parseInt(computedStyle.getPropertyValue('--safe-area-top') || '0', 10),
        bottom: parseInt(computedStyle.getPropertyValue('--safe-area-bottom') || '0', 10),
        left: parseInt(computedStyle.getPropertyValue('--safe-area-left') || '0', 10),
        right: parseInt(computedStyle.getPropertyValue('--safe-area-right') || '0', 10),
      });
    }
  }, []);

  return safeArea;
};