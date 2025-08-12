'use client'

import { useState } from 'react'
import { ArrowLeft, Mail, Send } from 'lucide-react'
import KuchisabishiiLogo from '../KuchisabishiiLogo'

interface ForgotPasswordFormProps {
  onBackToLogin: () => void
}

export default function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message)
        setEmail('')
      } else {
        setError(data.error || 'Failed to send reset email')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
      <div className="text-center mb-6">
        <div className="mb-4">
          <KuchisabishiiLogo size="lg" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Reset Password</h1>
        <p className="text-gray-600 mt-2">Enter your email to receive a reset link</p>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Send Reset Link</span>
            </>
          )}
        </button>
      </form>

      <button
        onClick={onBackToLogin}
        className="w-full mt-4 text-orange-500 hover:text-orange-600 font-medium py-2 flex items-center justify-center space-x-2 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Login</span>
      </button>
    </div>
  )
}