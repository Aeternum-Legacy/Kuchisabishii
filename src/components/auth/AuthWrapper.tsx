'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import ForgotPasswordForm from './ForgotPasswordForm'
import EmailConfirmation from './EmailConfirmation'
import EmailVerificationRequired from './EmailVerificationRequired'

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
    console.log('AuthWrapper: user state changed', { previousUser: !!previousUser, currentUser: !!user })
    if (!previousUser && user && onAuthSuccess) {
      console.log('AuthWrapper: calling onAuthSuccess')
      onAuthSuccess()
    }
    setPreviousUser(user)
  }, [user, previousUser, onAuthSuccess])

  // Show loading state
  if (loading) {
    console.log('AuthWrapper: showing loading state')
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🍜</div>
          <p className="text-gray-600">Loading your food journey...</p>
        </div>
      </div>
    )
  }

  // If user is authenticated, render children
  if (user) {
    console.log('AuthWrapper: user authenticated, rendering children', user)
    return <>{children}</>
  }
  
  console.log('AuthWrapper: no user, showing auth forms')

  // Show authentication forms
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center p-4">
        {authMode === 'login' && (
          <LoginForm
            onSuccess={onAuthSuccess}
            onSwitchToRegister={() => setAuthMode('register')}
            onForgotPassword={() => setAuthMode('forgot-password')}
            onEmailNotVerified={(email: string) => {
              setVerificationEmail(email)
              setAuthMode('email-verification-required')
            }}
          />
        )}
        
        {authMode === 'register' && (
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
        )}
        
        {authMode === 'forgot-password' && (
          <ForgotPasswordForm
            onBackToLogin={() => setAuthMode('login')}
          />
        )}
        
        {authMode === 'email-confirmation' && (
          <EmailConfirmation
            email={confirmationEmail}
            onBackToLogin={() => setAuthMode('login')}
          />
        )}
        
        {authMode === 'email-verification-required' && (
          <EmailVerificationRequired
            email={verificationEmail}
            onBackToLogin={() => setAuthMode('login')}
          />
        )}
    </div>
  )
}