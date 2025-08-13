'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestAuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        setMessage(`Error: ${error.message}`)
      } else if (data.user) {
        if (data.user.email_confirmed_at) {
          setMessage('✅ Account created successfully! You can now sign in.')
        } else {
          setMessage('📧 Check your email for verification link (may go to spam folder)')
        }
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setMessage(`Sign in error: ${error.message}`)
      } else if (data.user) {
        setMessage('✅ Successfully signed in!')
        // Redirect to main app
        window.location.href = '/onboarding'
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            🍱 Phase 5 Test Authentication
          </h1>
          <p className="text-gray-600 mb-6 text-center">
            Test authentication before accessing Phase 5 features
          </p>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Min 8 characters"
                required
                minLength={8}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="submit"
                onClick={handleSignUp}
                disabled={loading || !email || !password}
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '⏳' : '📝 Sign Up'}
              </button>
              
              <button
                type="submit"
                onClick={handleSignIn}
                disabled={loading || !email || !password}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '⏳' : '🔑 Sign In'}
              </button>
            </div>
          </form>

          {message && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${
              message.includes('Error') || message.includes('error')
                ? 'bg-red-100 text-red-800 border border-red-200'
                : 'bg-green-100 text-green-800 border border-green-200'
            }`}>
              {message}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">🎯 After Authentication:</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div>• <strong>AI Onboarding:</strong> /onboarding</div>
              <div>• <strong>Enhanced Profile:</strong> /profile</div>
              <div>• <strong>Recommendations:</strong> Main dashboard</div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> If email verification is required, check your email (including spam folder) 
              for the verification link. The link should redirect back to this preview site.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}