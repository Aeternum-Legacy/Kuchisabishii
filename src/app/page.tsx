'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Simple redirect to app - bypass all auth complexity
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Just go directly to the app
    router.push('/app');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading Kuchisabishii...</p>
      </div>
    </div>
  );
}