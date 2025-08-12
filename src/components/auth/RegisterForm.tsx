'use client'

import { useState } from 'react'
import { Eye, EyeOff, Mail, User, Lock } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface RegisterFormProps {
  onSuccess?: (email?: string) => void
  onSwitchToLogin?: () => void
}

export default function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const { signUp, loading, error } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    firstName: '',
    lastName: ''
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
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }

    if (!formData.displayName) {
      errors.displayName = 'Display name is required'
    }

    if (!formData.firstName) {
      errors.firstName = 'First name is required'
    }

    if (!formData.lastName) {
      errors.lastName = 'Last name is required'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const result = await signUp(formData)
    
    if (result.success) {
      // Pass the email to show confirmation message
      onSuccess?.(formData.email)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🍜</div>
        <h1 className="text-3xl font-bold text-gray-800">Join Kuchisabishii</h1>
        <p className="text-gray-600 mt-2">Start your emotional food journey</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  formErrors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="First name"
              />
            </div>
            {formErrors.firstName && (
              <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  formErrors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Last name"
              />
            </div>
            {formErrors.lastName && (
              <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>
            )}
          </div>
        </div>

        {/* Display Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Name
          </label>
          <div className="relative">
            <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                formErrors.displayName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="How others will see you"
            />
          </div>
          {formErrors.displayName && (
            <p className="text-red-500 text-sm mt-1">{formErrors.displayName}</p>
          )}
        </div>

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
              placeholder="At least 8 characters"
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        {/* Switch to Login */}
        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              Sign In
            </button>
          </p>
        </div>
      </form>
    </div>
  )
}