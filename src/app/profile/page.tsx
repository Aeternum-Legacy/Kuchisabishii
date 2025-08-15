'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, ArrowLeft } from 'lucide-react';
import { BottomTabBar } from '@/components/mobile/BottomTabBar';
import UserProfileTabs from '@/components/profile/UserProfileTabs';

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');

  // Handle navigation based on tab selection
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    
    switch (tabId) {
      case 'home':
        router.push('/app');
        break;
      case 'search':
        router.push('/search');
        break;
      case 'add':
        router.push('/add-food');
        break;
      case 'social':
        router.push('/social');
        break;
      case 'profile':
        // Stay on current page
        break;
    }
  };

  // Navigation tabs configuration
  const navigationTabs = [
    { id: 'home', label: 'Home', icon: '🏠', badge: 0, route: '/app' },
    { id: 'search', label: 'Search', icon: '🔍', badge: 0, route: '/search' },
    { id: 'add', label: 'Add', icon: '➕', badge: 0, highlight: true, route: '/add-food' },
    { id: 'social', label: 'Social', icon: '👥', badge: 3, route: '/social' },
    { id: 'profile', label: 'Profile', icon: '👤', badge: 0, route: '/profile' }
  ];

  return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        {/* Clean Food-Focused Header with Back Button */}
        <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white pt-12">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/app')}
                className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-white hover:bg-opacity-30 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Food Profile</h1>
                <p className="text-orange-100">Your culinary journey and taste preferences</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Profile Content */}
        <div className="flex-1 pb-20">
          <UserProfileTabs />
        </div>

        {/* Bottom Navigation */}
        <BottomTabBar
          tabs={navigationTabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>
  );
};

export default ProfilePage;