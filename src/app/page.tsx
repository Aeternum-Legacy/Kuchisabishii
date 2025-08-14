'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User, Mail, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Check if user was logged out
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('onboardingCompleted');
    if (hasCompletedOnboarding === 'true') {
      router.push('/app');
    }
  }, [router]);

  const handleLogin = () => {
    setIsLoggingIn(true);
    
    // Simulate login process
    setTimeout(() => {
      localStorage.setItem('onboardingCompleted', 'true');
      router.push('/app');
    }, 1500);
  };

  const handleStartOnboarding = () => {
    router.push('/onboarding');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Logo */}
          <div className="mb-8">
            <Image
              src="/images/kuchisabishii-logo.png"
              alt="Kuchisabishii"
              width={80}
              height={80}
              className="rounded-xl mx-auto mb-4"
              style={{
                filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))'
              }}
            />
            <h1 className="text-3xl font-bold text-gray-900">Kuchisabishii</h1>
            <p className="text-gray-600 mt-2">Your personalized food journey</p>
          </div>

          {isLoggingIn ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-gray-600">Logging you in...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Demo Login */}
              <button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl py-3 px-6 font-semibold flex items-center justify-center space-x-2 hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105"
              >
                <User className="w-5 h-5" />
                <span>Continue as Demo User</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Onboarding */}
              <button
                onClick={handleStartOnboarding}
                className="w-full bg-white border-2 border-orange-500 text-orange-500 rounded-xl py-3 px-6 font-semibold flex items-center justify-center space-x-2 hover:bg-orange-50 transition-colors"
              >
                <span>New User? Start Setup</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <p className="text-sm text-gray-500 mt-6">
                Discover amazing food experiences and
                connect with fellow food lovers
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}