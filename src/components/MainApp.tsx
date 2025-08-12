'use client';

import React, { useState } from 'react';
import { Home, Search, Plus, User, Users, ChefHat, Star, MapPin, Clock } from 'lucide-react';
import ProfileScreen from './ProfileScreen';
import RecommendationScreen from './RecommendationScreen';
import EatAgainModal from './EatAgainModal';
import EnhancedFoodReviewScreen from './EnhancedFoodReviewScreen';

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

  // Home Tab Content
  const HomeContent = () => (
    <div className="flex-1 bg-gray-50 p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Welcome back!</h1>
        <p className="text-gray-600">Ready to discover your next Kuchisabishii moment?</p>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Your Journey</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">{userFoodExperiences.length}</div>
            <div className="text-sm text-gray-600">Foods Tried</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {userFoodExperiences.filter(f => f.rating >= 4).length}
            </div>
            <div className="text-sm text-gray-600">Favorites</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500">
              {userFoodExperiences.reduce((sum, f) => sum + f.versions.length, 0)}
            </div>
            <div className="text-sm text-gray-600">Revisits</div>
          </div>
        </div>
      </div>

      {/* Recent Foods */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Foods</h2>
          <button className="text-orange-500 text-sm font-medium">View All</button>
        </div>
        
        <div className="space-y-3">
          {userFoodExperiences.map((food) => (
            <div key={food.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <img 
                  src={food.image} 
                  alt={food.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-medium text-gray-800">{food.name}</h3>
                  <p className="text-sm text-gray-600">{food.restaurant}</p>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3 h-3 ${i < food.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleEatAgain(food)}
                className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-medium hover:bg-orange-600 transition-colors"
              >
                Eat Again?
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

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
        {currentTab === 'home' && <HomeContent />}
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