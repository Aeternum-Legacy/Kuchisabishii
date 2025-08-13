'use client';

import React from 'react';
import UserProfileTabs from '@/components/profile/UserProfileTabs';
import AuthWrapper from '@/components/auth/AuthWrapper';

const ProfilePage: React.FC = () => {
  return (
    <AuthWrapper>
      <UserProfileTabs />
    </AuthWrapper>
  );
};

export default ProfilePage;