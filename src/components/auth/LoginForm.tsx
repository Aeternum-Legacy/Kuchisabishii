'use client'

import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import KuchisabishiiLogo from '../KuchisabishiiLogo'

interface LoginFormProps {
  onSuccess?: () => void
  onSwitchToRegister?: () => void
  onForgotPassword?: () => void
  onEmailNotVerified?: (email: string) => void
}

export default function LoginForm({ onSuccess, onSwitchToRegister, onForgotPassword, onEmailNotVerified }: LoginFormProps) {
  const { signIn, signInWithGoogle, signInWithApple, loading, error } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.email) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email format'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const result = await signIn(formData.email, formData.password)
    
    if (result.success) {
      onSuccess?.()
    } else if (result.code === 'EMAIL_NOT_VERIFIED' && onEmailNotVerified) {
      // Handle email not verified case
      onEmailNotVerified(formData.email)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
      <div className="text-center mb-8">
        <div className="mb-4">
          <KuchisabishiiLogo size="lg" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Kuchisabishii</h1>
        <p className="text-gray-600 mt-2">口寂しい - Rate dishes, not just restaurants</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                formErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="your.email@example.com"
            />
          </div>
          {formErrors.email && (
            <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                formErrors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {formErrors.password && (
            <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
          )}
        </div>

        {/* Forgot Password Link */}
        <div className="text-right">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-orange-500 hover:text-orange-600"
          >
            Forgot password?
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        {/* Social Authentication Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Loading...' : 'Google'}
          </button>
          
          <button
            type="button"
            onClick={signInWithApple}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#000000" d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
            </svg>
            {loading ? 'Loading...' : 'Apple'}
          </button>
        </div>

        {/* Switch to Register */}
        <div className="text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              Sign Up
            </button>
          </p>
        </div>
      </form>
    </div>
  )
}