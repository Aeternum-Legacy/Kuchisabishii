'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import ForgotPasswordForm from './ForgotPasswordForm'
import EmailConfirmation from './EmailConfirmation'

interface AuthWrapperProps {
  children: React.ReactNode
  onAuthSuccess?: () => void
}

export default function AuthWrapper({ children, onAuthSuccess }: AuthWrapperProps) {
  const { user, loading } = useAuth()
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot-password' | 'email-confirmation'>('login')
  const [previousUser, setPreviousUser] = useState<typeof user>(null)
  const [confirmationEmail, setConfirmationEmail] = useState<string>('')

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
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🍜</div>
          <p className="text-gray-600">Loading your food journey...</p>
        </div>
      </div>
    )
  }

  // If user is authenticated, render children
  if (user) {
    return <>{children}</>
  }

  // Show authentication forms
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {authMode === 'login' && (
          <LoginForm
            onSuccess={onAuthSuccess}
            onSwitchToRegister={() => setAuthMode('register')}
            onForgotPassword={() => setAuthMode('forgot-password')}
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
      </div>
    </div>
  )
}