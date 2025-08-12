'use client';

import React, { useState } from 'react';
import { Home, Search, Plus, User, Users, ChefHat, Star, MapPin, Clock } from 'lucide-react';
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
  const [currentTab, setCurrentTab] = useState<'home' | 'discover' | 'add' | 'profile'>('home');
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

  // Bottom Navigation
  const BottomNav = () => (
    <div className="bg-white border-t border-gray-200 px-6 py-2">
      <div className="flex justify-around">
        {[
          { id: 'home', icon: Home, label: 'Home' },
          { id: 'discover', icon: Search, label: 'Discover' },
          { id: 'add', icon: Plus, label: 'Add' },
          { id: 'profile', icon: User, label: 'Profile' }
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setCurrentTab(id as any)}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              currentTab === id 
                ? 'text-orange-500 bg-orange-50' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Icon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {currentTab === 'home' && <HomeScreen onViewChange={setCurrentTab} />}
        {currentTab === 'discover' && <RecommendationScreen />}
        {currentTab === 'add' && <AddContent />}
        {currentTab === 'profile' && <ProfileScreen />}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />

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