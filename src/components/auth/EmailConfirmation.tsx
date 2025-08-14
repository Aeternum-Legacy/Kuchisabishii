'use client'

import { useState } from 'react'
import { Mail, RefreshCw } from 'lucide-react'

interface EmailConfirmationProps {
  email: string
  onBackToLogin?: () => void
}

export default function EmailConfirmation({ email, onBackToLogin }: EmailConfirmationProps) {
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const [resendError, setResendError] = useState('')

  const handleResendEmail = async () => {
    setIsResending(true)
    setResendMessage('')
    setResendError('')

    try {
      const response = await fetch('/api/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setResendMessage(data.message)
      } else {
        setResendError(data.error || 'Failed to resend confirmation email')
      }
    } catch (error) {
      setResendError('Network error. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto text-center">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <Mail className="w-10 h-10 text-green-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Check Your Email!
        </h2>
        
        <p className="text-gray-600 mb-6">
          We've sent a confirmation email to:
        </p>
        
        <p className="font-semibold text-gray-800 mb-6">
          {email}
        </p>
        
        <div className="bg-orange-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-orange-800">
            Please click the link in the email to confirm your account. 
            Check your spam folder if you don't see it within a few minutes.
          </p>
        </div>

        {resendMessage && (
          <div className="bg-green-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-green-800">{resendMessage}</p>
          </div>
        )}

        {resendError && (
          <div className="bg-red-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-800">{resendError}</p>
          </div>
        )}

        <button
          onClick={handleResendEmail}
          disabled={isResending}
          className="w-full bg-orange-500 hover:bg-orange-600 hover:shadow-lg disabled:bg-gray-300 text-white py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 mb-4 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          {isResending ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Resending...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Resend Confirmation Email</span>
            </>
          )}
        </button>
        
        <button
          onClick={onBackToLogin}
          className="text-orange-500 hover:text-orange-600 font-medium cursor-pointer transition-colors duration-200 hover:underline"
        >
          Back to Sign In
        </button>
      </div>
    </div>
  )
}