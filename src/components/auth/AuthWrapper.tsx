'use client'

import { useState, useEffect } from 'react'
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
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot-password' | 'email-confirmation' | 'email-verification-required'>('login')
  const [previousUser, setPreviousUser] = useState<typeof user>(null)
  const [confirmationEmail, setConfirmationEmail] = useState<string>('')
  const [verificationEmail, setVerificationEmail] = useState<string>('')

  // Handle auth success when user state changes from null to authenticated
  useEffect(() => {
    if (!previousUser && user && onAuthSuccess) {
      onAuthSuccess()
    }
    setPreviousUser(user)
  }, [user, previousUser, onAuthSuccess])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <StaggeredFadeIn className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🍜</div>
          <p className="text-gray-600 mb-4">Loading your food journey...</p>
          <AuthLoadingSpinner size="lg" />
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