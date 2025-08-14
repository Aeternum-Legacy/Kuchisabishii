'use client';

import AuthWrapper from '@/components/auth/AuthWrapper';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();

  const handleAuthSuccess = () => {
    // Redirect to main app after successful authentication
    router.push('/app');
  };

  return (
    <AuthWrapper onAuthSuccess={handleAuthSuccess}>
      {/* This will never render as AuthWrapper handles authentication */}
      <div></div>
    </AuthWrapper>
  );
}