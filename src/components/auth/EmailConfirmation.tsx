'use client'

import { Mail } from 'lucide-react'

interface EmailConfirmationProps {
  email: string
  onBackToLogin?: () => void
}

export default function EmailConfirmation({ email, onBackToLogin }: EmailConfirmationProps) {
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
        
        <button
          onClick={onBackToLogin}
          className="text-orange-500 hover:text-orange-600 font-medium"
        >
          Back to Sign In
        </button>
      </div>
    </div>
  )
}