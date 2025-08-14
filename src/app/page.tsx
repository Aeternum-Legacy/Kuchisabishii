'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import AuthWrapper from '../components/auth/AuthWrapper';
import { useAuth } from '../hooks/useAuth';

// Landing page that redirects based on auth status
export default function HomePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUserStatus = async () => {
      if (user) {
        // User is logged in, redirect to app
        router.push('/app');
      } else {
        // User not logged in, show auth wrapper
        setLoading(false);
      }
    };

    // Small delay to prevent flash
    setTimeout(checkUserStatus, 100);
  }, [user, router]);

  const enterDemoMode = () => {
    console.log('ENTERING DEMO MODE - going to dedicated demo page');
    localStorage.setItem('demoMode', 'true');
    setDemoMode(true);
    router.push('/demo');
  };

  // Handle authentication success
  const handleAuthSuccess = () => {
    // After successful auth, redirect to app
    // The app page will handle onboarding check
    router.push('/app');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="text-center">
          <Image
            src="/images/kuchisabishii-logo.png"
            alt="Kuchisabishii"
            width={80}
            height={80}
            className="rounded-xl mx-auto mb-4"
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
              background: 'transparent'
            }}
          />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <button
            onClick={enterDemoMode}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Enter Demo Mode
          </button>
        </div>
      </div>
    );
  }

  // Show auth wrapper for non-authenticated users
  if (!user) {
    return <AuthWrapper onSuccess={handleAuthSuccess} />;
  }

  // This shouldn't be reached, but just in case
  return null;
}