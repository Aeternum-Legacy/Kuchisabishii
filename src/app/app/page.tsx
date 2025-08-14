'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MapPin, Star, Search, Plus, User, Home, Bell, Settings, QrCode, TrendingUp, LogOut } from 'lucide-react';
// Removed useAuth dependency since we're not using authentication
import { BottomTabBar } from '@/components/mobile/BottomTabBar';
import { CategoryScroll, sampleCategories } from '@/components/mobile/CategoryScroll';
import FoodImage from '@/components/FoodImage';
import { mockFoodReviews, mockUserProfile, recommendedFoods } from '@/data/seed-data';
// Removed supabase import since we're not using the database

// Main authenticated app component with proper navigation
export default function AuthenticatedApp() {
  // Simplified app without auth dependencies
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home');
  const [activeCategory, setActiveCategory] = useState('all');
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Simplified: Just show the app immediately
  useEffect(() => {
    console.log('Initializing app with demo profile');
    
    // Always show app with demo profile
    setHasCompletedOnboarding(true);
    setUserProfile({
      id: 'demo-user',
      display_name: 'Demo User',
      onboarding_completed: true,
      location: 'Demo Location'
    });
    setLoading(false);
  }, []);

  // Handle navigation based on tab selection
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    
    switch (tabId) {
      case 'home':
        // Stay on current page
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
        router.push('/profile');
        break;
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      router.push('/');
    }
  };

  // Navigation tabs configuration
  const navigationTabs = [
    { id: 'home', label: 'Home', icon: '🏠', badge: 0 },
    { id: 'search', label: 'Search', icon: '🔍', badge: 0 },
    { id: 'add', label: 'Add', icon: '➕', badge: 0, highlight: true },
    { id: 'social', label: 'Social', icon: '👥', badge: 3 },
    { id: 'profile', label: 'Profile', icon: '👤', badge: 0 }
  ];

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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Main Content Area */}
      <div className="flex-1 pb-20">
        {/* Mobile Header */}
        <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white p-4 pt-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1">
                <Image
                  src="/images/kuchisabishii-logo.png"
                  alt="Kuchisabishii"
                  width={32}
                  height={32}
                  className="rounded-md"
                />
              </div>
              <div>
                <p className="text-sm text-orange-100">Welcome back</p>
                <h1 className="text-lg font-bold">
                  {userProfile?.display_name || 'Demo User'}
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => router.push('/notifications')}
                className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
              >
                <Bell className="w-4 h-4 text-white" />
              </button>
              <button 
                onClick={() => router.push('/qr-scanner')}
                className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
              >
                <QrCode className="w-4 h-4 text-white" />
              </button>
              <button 
                onClick={handleLogout}
                className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-white hover:bg-opacity-30 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Location Bar */}
          <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-xl px-3 py-2">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">
              {userProfile?.location || 'Set your location'}
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 -mt-6 relative z-10">
          <button 
            onClick={() => router.push('/search')}
            className="w-full bg-white rounded-xl shadow-lg px-4 py-3 flex items-center space-x-3"
          >
            <Search className="w-5 h-5 text-gray-400" />
            <span className="text-gray-400">Search for food or restaurants...</span>
          </button>
        </div>

        {/* Category Scroll */}
        <div className="mt-6">
          <CategoryScroll
            categories={sampleCategories}
            activeCategory={activeCategory}
            onCategorySelect={handleCategorySelect}
          />
        </div>

        {/* Quick Actions */}
        <div className="px-4 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => router.push('/recommendations')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-4 text-left"
            >
              <TrendingUp className="w-6 h-6 mb-2" />
              <h3 className="font-semibold">AI Recommendations</h3>
              <p className="text-sm text-purple-100">Based on your taste</p>
            </button>
            
            <button 
              onClick={() => router.push('/add-friend')}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl p-4 text-left"
            >
              <QrCode className="w-6 h-6 mb-2" />
              <h3 className="font-semibold">Add Friends</h3>
              <p className="text-sm text-blue-100">Share & discover</p>
            </button>
          </div>
        </div>

        {/* Recent Food Experiences */}
        <div className="px-4 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Your Recent Eats</h2>
            <button 
              onClick={() => router.push('/food-history')}
              className="text-orange-500 text-sm font-medium"
            >
              See all
            </button>
          </div>
          
          <div className="space-y-4">
            {mockFoodReviews.slice(0, 3).map((food) => (
              <div key={food.id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <FoodImage 
                      foodName={food.foodName}
                      imageUrl={food.image}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{food.foodName}</h3>
                    <p className="text-sm text-gray-500">{food.restaurant}</p>
                    <div className="flex items-center mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(food.experience.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 ml-2">
                        {food.experience.rating}/5
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended for You */}
        <div className="px-4 mt-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>
            <button 
              onClick={() => router.push('/recommendations')}
              className="text-orange-500 text-sm font-medium"
            >
              See all
            </button>
          </div>
          
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {recommendedFoods.map((food) => (
              <div key={food.id} className="bg-white rounded-xl shadow-sm p-4 min-w-[200px]">
                <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 overflow-hidden">
                  <FoodImage 
                    foodName={food.name}
                    imageUrl={food.image}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{food.name}</h3>
                <p className="text-xs text-gray-500">{food.restaurant}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-orange-500 font-semibold">{food.matchScore}% match</span>
                  <span className="text-xs text-gray-500">{food.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomTabBar
        tabs={navigationTabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
}