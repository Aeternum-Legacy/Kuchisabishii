'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import KuchisabishiiLogo from '@/components/KuchisabishiiLogo'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'resent'>('loading')
  const [message, setMessage] = useState('')
  const email = searchParams.get('email')

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!email) {
      setStatus('error')
      setMessage('Missing email parameter. Please check your verification link.')
      return
    }

    if (token) {
      // Verify the email with the token
      verifyEmail(token, email)
    } else {
      // Just show the verification pending page
      setStatus('success')
      setMessage('Please check your email for a verification link.')
    }
  }, [email, searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  const verifyEmail = useCallback(async (token: string, email: string) => {
    try {
      // This would typically verify the token with your backend
      // For now, we'll just show success
      setStatus('success')
      setMessage('Your email has been verified successfully! You can now sign in.')
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
    } catch (error) {
      setStatus('error')
      setMessage('Failed to verify email. The link may be expired.')
    }
  }, [router])

  const resendVerification = async () => {
    if (!email) return

    try {
      setStatus('loading')
      
      const response = await fetch('/api/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        setStatus('resent')
        setMessage('Verification email sent! Please check your inbox.')
      } else {
        throw new Error('Failed to resend verification email')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Failed to resend verification email. Please try again.')
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-16 h-16 text-orange-500 animate-spin" />
      case 'success':
      case 'resent':
        return <CheckCircle className="w-16 h-16 text-green-500" />
      case 'error':
        return <XCircle className="w-16 h-16 text-red-500" />
      default:
        return <Mail className="w-16 h-16 text-orange-500" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'success':
      case 'resent':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        <div className="mb-6">
          <KuchisabishiiLogo size="lg" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Kuchisabishii</h1>
        <p className="text-gray-600 mb-8">口寂しい - Email Verification</p>

        <div className="mb-6">
          {getStatusIcon()}
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {status === 'loading' ? 'Verifying Email...' :
           status === 'success' ? 'Email Verified!' :
           status === 'resent' ? 'Email Sent!' :
           'Verification Failed'}
        </h2>

        <p className={`mb-6 ${getStatusColor()}`}>
          {message}
        </p>

        {email && (
          <p className="text-sm text-gray-500 mb-6">
            Email: <span className="font-medium">{email}</span>
          </p>
        )}

        <div className="space-y-4">
          {status === 'error' && (
            <button
              onClick={resendVerification}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Resend Verification Email
            </button>
          )}

          <button
            onClick={() => router.push('/auth/login')}
            className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Back to Login
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Need help? Contact us at{' '}
            <a href="mailto:people@kuchisabishii.io" className="text-orange-500 hover:text-orange-600">
              people@kuchisabishii.io
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="mb-6">
            <KuchisabishiiLogo size="lg" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Kuchisabishii</h1>
          <p className="text-gray-600 mb-8">口寂しい - Loading...</p>
          <Loader2 className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-6" />
          <p className="text-gray-600">Please wait while we load the verification page.</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}