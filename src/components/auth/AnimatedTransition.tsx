'use client'

import { ReactNode, useEffect, useState } from 'react'

interface AnimatedTransitionProps {
  children: ReactNode
  isVisible: boolean
  animationType?: 'fade' | 'slide' | 'scale'
  duration?: number
  className?: string
}

export default function AnimatedTransition({
  children,
  isVisible,
  animationType = 'fade',
  duration = 300,
  className = ''
}: AnimatedTransitionProps) {
  const [shouldRender, setShouldRender] = useState(isVisible)
  const [animationClass, setAnimationClass] = useState('')

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true)
      // Trigger enter animation after component mounts
      setTimeout(() => {
        setAnimationClass(getEnterClass(animationType))
      }, 10)
    } else {
      // Trigger exit animation
      setAnimationClass(getExitClass(animationType))
      // Remove from DOM after animation completes
      setTimeout(() => {
        setShouldRender(false)
      }, duration)
    }
  }, [isVisible, animationType, duration])

  if (!shouldRender) return null

  return (
    <div
      className={`transition-all duration-${duration} ease-in-out ${animationClass} ${className}`}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  )
}

function getEnterClass(type: 'fade' | 'slide' | 'scale'): string {
  switch (type) {
    case 'fade':
      return 'opacity-100'
    case 'slide':
      return 'opacity-100 translate-y-0'
    case 'scale':
      return 'opacity-100 scale-100'
    default:
      return 'opacity-100'
  }
}

function getExitClass(type: 'fade' | 'slide' | 'scale'): string {
  switch (type) {
    case 'fade':
      return 'opacity-0'
    case 'slide':
      return 'opacity-0 -translate-y-4'
    case 'scale':
      return 'opacity-0 scale-95'
    default:
      return 'opacity-0'
  }
}

// Loading spinner component for auth states
export function AuthLoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin`} />
    </div>
  )
}

// Success checkmark animation
export function AuthSuccessCheckmark() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <svg 
            className="w-6 h-6 text-green-600 animate-pulse"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>
        <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-75" />
      </div>
    </div>
  )
}

// Error shake animation component
export function ErrorShake({ children, trigger }: { children: ReactNode; trigger: boolean }) {
  const [shaking, setShaking] = useState(false)

  useEffect(() => {
    if (trigger) {
      setShaking(true)
      setTimeout(() => setShaking(false), 500)
    }
  }, [trigger])

  return (
    <div className={shaking ? 'animate-bounce' : ''}>
      {children}
    </div>
  )
}

// Staggered fade-in for form elements
export function StaggeredFadeIn({ 
  children, 
  delay = 0,
  className = '' 
}: { 
  children: ReactNode
  delay?: number
  className?: string 
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div 
      className={`transition-all duration-500 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-4'
      } ${className}`}
    >
      {children}
    </div>
  )
}