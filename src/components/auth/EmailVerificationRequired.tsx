'use client'

import { useState } from 'react'
import { AlertCircle, RefreshCw, Mail } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import KuchisabishiiLogo from '../KuchisabishiiLogo'

interface EmailVerificationRequiredProps {
  email: string
  onBackToLogin?: () => void
}

export default function EmailVerificationRequired({ email, onBackToLogin }: EmailVerificationRequiredProps) {
  const { resendConfirmation } = useAuth()
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const [resendError, setResendError] = useState('')
  const [resendCount, setResendCount] = useState(0)
  const [lastResendTime, setLastResendTime] = useState<number | null>(null)

  const canResend = () => {
    if (!lastResendTime) return true
    const timeSinceLastResend = Date.now() - lastResendTime
    return timeSinceLastResend > 60000 // 1 minute cooldown
  }

  const getResendCooldown = () => {
    if (!lastResendTime) return 0
    const timeSinceLastResend = Date.now() - lastResendTime
    return Math.max(0, 60 - Math.floor(timeSinceLastResend / 1000))
  }

  const handleResendEmail = async () => {
    if (!canResend()) return
    
    setIsResending(true)
    setResendMessage('')
    setResendError('')

    const result = await resendConfirmation(email)
    
    if (result.success) {
      setResendMessage('Verification email sent successfully! Please check your inbox.')
      setResendCount(prev => prev + 1)
      setLastResendTime(Date.now())
    } else {
      setResendError(result.error || 'Failed to resend confirmation email')
    }
    
    setIsResending(false)
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
      <div className="text-center mb-6">
        <KuchisabishiiLogo size="lg" />
        <h2 className="text-2xl font-bold text-gray-800 mt-4 mb-2">
          Email Verification Required
        </h2>
        <p className="text-gray-600">
          Please verify your email address to continue
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-yellow-800 mb-2">
              Your account is not yet verified. Please check your email for a confirmation link.
            </p>
            <p className="text-sm font-medium text-yellow-900">
              {email}
            </p>
          </div>
        </div>
      </div>

      {resendMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <Mail className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-800">{resendMessage}</p>
          </div>
        </div>
      )}

      {resendError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-800">{resendError}</p>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={handleResendEmail}
          disabled={isResending || !canResend()}
          className="w-full bg-orange-500 hover:bg-orange-600 hover:shadow-lg disabled:bg-gray-300 text-white py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          {isResending ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Resending...</span>
            </>
          ) : !canResend() ? (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Resend in {getResendCooldown()}s</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Resend Verification Email{resendCount > 0 ? ` (${resendCount})` : ''}</span>
            </>
          )}
        </button>

        <button
          onClick={onBackToLogin}
          className="w-full text-orange-500 hover:text-orange-600 font-medium py-2 transition-colors duration-200 cursor-pointer hover:underline"
        >
          Back to Sign In
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Check your spam folder if you dondon'tapos;t see the email within a few minutes.
        </p>
        {resendCount > 0 && (
          <p className="text-xs text-gray-400 mt-2">
            Still not receiving emails? Contact support for assistance.
          </p>
        )}
      </div>
    </div>
  )
}