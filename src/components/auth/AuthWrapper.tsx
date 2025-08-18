'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import ForgotPasswordForm from './ForgotPasswordForm'
import EmailConfirmation from './EmailConfirmation'
import EmailVerificationRequired from './EmailVerificationRequired'
import AnimatedTransition, { AuthLoadingSpinner, AuthSuccessCheckmark, StaggeredFadeIn } from './AnimatedTransition'

interface AuthWrapperProps {
  children: React.ReactNode
  onAuthSuccess?: () => void
}

export default function AuthWrapper({ children, onAuthSuccess }: AuthWrapperProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot-password' | 'email-confirmation' | 'email-verification-required'>('login')
  const [previousUser, setPreviousUser] = useState<typeof user>(null)
  const [confirmationEmail, setConfirmationEmail] = useState<string>('')
  const [verificationEmail, setVerificationEmail] = useState<string>('')
  const [forceShowAuth, setForceShowAuth] = useState(false)
  // const [emergencyMode, setEmergencyMode] = useState(false) // REMOVED: Security vulnerability
  const [onboardingCheckDone, setOnboardingCheckDone] = useState(false)

  // Handle auth success when user state changes from null to authenticated
  useEffect(() => {
    if (!previousUser && user && onAuthSuccess) {
      onAuthSuccess()
    }
    setPreviousUser(user)
  }, [user, previousUser, onAuthSuccess])

  // Handle onboarding redirect logic
  useEffect(() => {
    if (user && !loading) {
      // Only check onboarding status for pages that require it (like /app)
      const requiresOnboarding = pathname === '/app' || pathname?.startsWith('/app/')
      
      if (requiresOnboarding && user.onboardingCompleted !== true) {
        console.log('🔄 User needs onboarding, redirecting to /onboarding')
        router.push('/onboarding')
        return
      } else if (requiresOnboarding && user.onboardingCompleted === true) {
        console.log('✅ User has completed onboarding, allowing access to app')
      }
      
      setOnboardingCheckDone(true)
    } else if (!user && !loading) {
      // User is not authenticated
      setOnboardingCheckDone(true)
    }
  }, [user, loading, pathname, router])

  // Add timeout to prevent infinite loading - more aggressive
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading && !user) {
        // Auth loading timeout - showing auth forms (production: removed debug statement)
        setForceShowAuth(true)
      }
    }, 8000) // 8 second timeout for better mobile compatibility

    // Removed emergency timeout - security vulnerability
    // Never bypass authentication

    return () => {
      clearTimeout(timeout)
      // clearTimeout(emergencyTimeout) // Removed with emergency mode
    }
  }, [loading, user])

  // Show loading state (but not if timeout has occurred)
  if ((loading || !onboardingCheckDone) && !forceShowAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <StaggeredFadeIn className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🍜</div>
          <p className="text-gray-600 mb-4">Loading your food journey...</p>
          <AuthLoadingSpinner size="lg" />
          <button 
            onClick={() => setForceShowAuth(true)}
            className="mt-4 text-sm text-orange-600 hover:text-orange-800 underline cursor-pointer transition-colors duration-200"
          >
            Continue without waiting
          </button>
        </StaggeredFadeIn>
      </div>
    )
  }

  // If user is authenticated, render children
  if (user) {
    return <>{children}</>
  }

  // Show authentication forms
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <AnimatedTransition isVisible={authMode === 'login'} animationType="slide">
          <LoginForm
            onSuccess={onAuthSuccess}
            onSwitchToRegister={() => setAuthMode('register')}
            onForgotPassword={() => setAuthMode('forgot-password')}
            onEmailNotVerified={(email: string) => {
              setVerificationEmail(email)
              setAuthMode('email-verification-required')
            }}
          />
        </AnimatedTransition>
        
        <AnimatedTransition isVisible={authMode === 'register'} animationType="slide">
          <RegisterForm
            onSuccess={(email?: string) => {
              // After successful registration, show email confirmation
              if (email) {
                setConfirmationEmail(email)
                setAuthMode('email-confirmation')
              } else {
                setAuthMode('login')
              }
            }}
            onSwitchToLogin={() => setAuthMode('login')}
          />
        </AnimatedTransition>
        
        <AnimatedTransition isVisible={authMode === 'forgot-password'} animationType="slide">
          <ForgotPasswordForm
            onBackToLogin={() => setAuthMode('login')}
          />
        </AnimatedTransition>
        
        <AnimatedTransition isVisible={authMode === 'email-confirmation'} animationType="fade">
          <EmailConfirmation
            email={confirmationEmail}
            onBackToLogin={() => setAuthMode('login')}
          />
        </AnimatedTransition>
        
        <AnimatedTransition isVisible={authMode === 'email-verification-required'} animationType="fade">
          <EmailVerificationRequired
            email={verificationEmail}
            onBackToLogin={() => setAuthMode('login')}
          />
        </AnimatedTransition>
      </div>
    </div>
  )
}