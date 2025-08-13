'use client';

import React, { useState } from 'react';
import { Home, Search, Plus, User, Users, ChefHat, Star, MapPin, Clock } from 'lucide-react';
import { BottomTabBar, defaultTabs } from './mobile/BottomTabBar';
import { CategoryScroll, sampleCategories } from './mobile/CategoryScroll';
import ActivityFeed from './social/ActivityFeed';
import ProfileScreen from './ProfileScreen';
import RecommendationScreen from './RecommendationScreen';
import EatAgainModal from './EatAgainModal';
import EnhancedFoodReviewScreen from './EnhancedFoodReviewScreen';
import { HomeScreen } from './home/HomeScreen';

interface FoodExperience {
  id: string;
  name: string;
  restaurant: string;
  location: string;
  image: string;
  rating: number;
  lastEaten: string;
  experience: string;
  cost: number;
  versions: ExperienceVersion[];
}

interface ExperienceVersion {
  id: string;
  date: string;
  images: string[];
  location: string;
  mealTime: 'breakfast' | 'brunch' | 'lunch' | 'dinner';
  diningMethod: 'home' | 'dine-in' | 'takeout' | 'delivery';
  cost: number;
  experienceText: string;
  rating: 'never-again' | 'not-as-much' | 'just-as-much' | 'more-often' | 'kuchisabishii';
}

const MainApp: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showEatAgainModal, setShowEatAgainModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodExperience | null>(null);
  const [userFoodExperiences, setUserFoodExperiences] = useState<FoodExperience[]>([
    {
      id: '1',
      name: 'Spicy Miso Ramen',
      restaurant: 'Ramen Nagi',
      location: 'San Francisco, CA',
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=200&fit=crop',
      rating: 5,
      lastEaten: '2024-01-10',
      experience: 'kuchisabishii',
      cost: 18,
      versions: []
    }
  ]);

  const handleEatAgain = (food: FoodExperience) => {
    setSelectedFood(food);
    setShowEatAgainModal(true);
  };

  const handleEatAgainSubmit = (newVersion: ExperienceVersion) => {
    if (selectedFood) {
      setUserFoodExperiences(prev => 
        prev.map(food => 
          food.id === selectedFood.id 
            ? { ...food, versions: [...food.versions, newVersion] }
            : food
        )
      );
    }
    setShowEatAgainModal(false);
    setSelectedFood(null);
  };

  const handleTabChange = (tabId: string) => {
    setCurrentTab(tabId);
  };

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId);
  };


  // Add placeholder content for other tabs
  const AddContent = () => (
    <div className="flex-1">
      <EnhancedFoodReviewScreen 
        onBack={() => setCurrentTab('home')}
        onSubmit={(data) => {
          // Handle new food submission
          console.log('New food submitted:', data);
          setCurrentTab('home');
        }}
      />
    </div>
  );

  // Social/Activity Content
  const SocialContent = () => (
    <ActivityFeed onBack={() => setCurrentTab('home')} />
  );

  // Search/Discover Content  
  const DiscoverContent = () => (
    <div className="flex-1 bg-gray-50 pb-20">
      {/* Category Scroll */}
      <div className="bg-white shadow-sm">
        <CategoryScroll 
          categories={sampleCategories}
          activeCategory={activeCategory}
          onCategorySelect={handleCategorySelect}
        />
      </div>
      
      {/* Search Results */}
      <div className="p-4">
        <RecommendationScreen />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-white relative">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {currentTab === 'home' && <HomeScreen onViewChange={setCurrentTab} />}
        {currentTab === 'search' && <DiscoverContent />}
        {currentTab === 'add' && <AddContent />}
        {currentTab === 'social' && <SocialContent />}
        {currentTab === 'profile' && <ProfileScreen />}
      </div>

      {/* Bottom Navigation */}
      <BottomTabBar 
        tabs={defaultTabs}
        activeTab={currentTab}
        onTabChange={handleTabChange}
      />

      {/* Eat Again Modal */}
      {showEatAgainModal && selectedFood && (
        <EatAgainModal
          food={selectedFood}
          onClose={() => {
            setShowEatAgainModal(false);
            setSelectedFood(null);
          }}
          onSubmit={handleEatAgainSubmit}
        />
      )}
    </div>
  );
};

export default MainApp;