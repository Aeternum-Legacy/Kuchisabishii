'use client';

import React from 'react';
import { User } from 'lucide-react';
import UserProfileTabs from '@/components/profile/UserProfileTabs';

const ProfilePage: React.FC = () => {
  return (
      <div className="min-h-screen bg-gray-100">
        {/* Clean Food-Focused Header */}
        <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Food Profile</h1>
                <p className="text-orange-100">Your culinary journey and taste preferences</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Profile Content */}
        <UserProfileTabs />
      </div>
  );
};

export default ProfilePage;