'use client';

import React, { useState } from 'react';
import { MapPin, Star, Search, Plus, User, Home, Bell, Settings } from 'lucide-react';
import AuthWrapper from '../components/auth/AuthWrapper';
import { useAuth } from '../hooks/useAuth';
import { BottomTabBar, defaultTabs } from '../components/mobile/BottomTabBar';
import { CategoryScroll, sampleCategories } from '../components/mobile/CategoryScroll';
import ActivityFeed from '../components/social/ActivityFeed';
import FoodImage from '../components/FoodImage';
import { getFoodEmoji } from '../utils/foodEmojis';
import { mockFoodReviews, mockUserProfile, recommendedFoods, kuchisabishiFoods, recentFoods } from '../data/seed-data';

// Mobile-First PWA App Component
export default function KuchisabishiiPWA() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('onboarding');
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [activeCategory, setActiveCategory] = useState('all');
  
  // State for new food reviews - these will appear on home screen
  const [userFoodReviews, setUserFoodReviews] = useState<any[]>([]);
  const [showFoodForm, setShowFoodForm] = useState(false);
  const [prefillData, setPrefillData] = useState<any>(null);

  // Handle authentication success
  const handleAuthSuccess = () => {
    setShowOnboarding(true);
    setCurrentView('onboarding');
  };

  // Handle navigation
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'add') {
      setShowFoodForm(true);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  // Handle food form
  const handleAddNewFood = () => {
    setPrefillData(null);
    setShowFoodForm(true);
  };

  const handleEatingAgain = (food: any) => {
    setPrefillData(food);
    setShowFoodForm(true);
  };

  const handleFoodSave = (newExperience: any) => {
    // Add to user's food reviews at the top
    setUserFoodReviews(prev => [newExperience, ...prev]);
    setShowFoodForm(false);
    setActiveTab('home'); // Return to home after adding
  };

  // Onboarding completion handler
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setCurrentView('app');
  };

  // Onboarding Screens Component
  const OnboardingScreens = () => {
    const [currentOnboardingStep, setCurrentOnboardingStep] = useState(0);
    
    const onboardingSteps = [
      {
        title: "Mission",
        message: "Kuchisabishii is on a mission to redefine our relationship with food and emotions."
      },
      {
        title: "Approach", 
        message: "We approach eating with understanding, self-compassion, and an adventurous spirit to explore the great foods of the world!"
      },
      {
        title: "Community",
        message: "By connecting with people of the same pallet, we meet like minded taste buddies to share in the joy that Kuchisabishii brings!"
      }
    ];

    const nextStep = () => {
      if (currentOnboardingStep < onboardingSteps.length - 1) {
        setCurrentOnboardingStep(prev => prev + 1);
      } else {
        handleOnboardingComplete();
      }
    };

    const currentStep = onboardingSteps[currentOnboardingStep];

    return (
      <div className="flex-1 bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center px-6">
        <div className="text-center space-y-8 max-w-sm">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-800">{currentStep.title}</h1>
            <p className="text-lg text-gray-700 leading-relaxed">{currentStep.message}</p>
          </div>
          
          {/* Progress indicators */}
          <div className="flex justify-center space-x-2">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentOnboardingStep ? 'bg-orange-500' : 'bg-orange-200'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={nextStep}
            className="w-full bg-orange-500 text-white py-4 rounded-xl text-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            {currentOnboardingStep === onboardingSteps.length - 1 ? "Let's Begin!" : "Continue"}
          </button>
        </div>
      </div>
    );
  };

  // Mobile-First Home Screen with Uber Eats Style Design
  const MobileHomeScreen = () => {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen pb-20">
        {/* Mobile Header */}
        <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white p-4 pt-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-orange-100">Welcome back</p>
                <h1 className="text-lg font-bold">{mockUserProfile.name}</h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Bell className="w-4 h-4 text-white" />
              </button>
              <button className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Settings className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="bg-white rounded-xl p-3 shadow-sm flex items-center space-x-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search restaurants, dishes, cuisines..."
                className="flex-1 text-gray-800 text-sm bg-transparent focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Category Scroll */}
        <div className="bg-white shadow-sm">
          <CategoryScroll 
            categories={sampleCategories}
            activeCategory={activeCategory}
            onCategorySelect={handleCategorySelect}
          />
        </div>

        {/* Content Sections */}
        <div className="p-4 space-y-4">
          
          {/* Quick Actions */}
          <section>
            <div className="flex justify-between space-x-3">
              <button 
                onClick={() => setActiveTab('add')}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Log Food</span>
              </button>
              <button 
                onClick={() => setActiveTab('search')}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <MapPin className="w-5 h-5" />
                <span className="font-medium">Find Places</span>
              </button>
            </div>
          </section>

          {/* AI Recommendations */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-800">For You</h2>
              <span className="text-xs text-orange-500 font-medium">AI Powered</span>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {recommendedFoods.slice(0, 2).map((rec) => (
                <div key={rec.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">{getFoodEmoji(rec.name, rec.cuisineType, '')}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-800">{rec.name}</h3>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          {rec.aiConfidence}% match
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{rec.restaurantName}</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < rec.estimatedRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">{rec.estimatedRating}/5</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Activity */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-800">Recent Activity</h2>
              <button className="text-sm text-orange-500 hover:text-orange-600 font-medium">
                View All
              </button>
            </div>
            
            <div className="space-y-3">
              {/* Show user's new food reviews first */}
              {userFoodReviews.slice(0, 2).map((food: any) => (
                <div key={food.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 ring-2 ring-orange-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                      <FoodImage 
                        src={food.image} 
                        alt={food.name}
                        fallbackEmoji={getFoodEmoji(food.name, food.cuisineType, food.foodType)}
                        size="md"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-800">{food.name}</h3>
                        <span className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-full font-medium">NEW</span>
                      </div>
                      <p className="text-sm text-gray-600">{food.location}</p>
                      <div className="flex items-center mt-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < food.kuchisabishiRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-1">{food.kuchisabishiRating}/5</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleEatingAgain(food)}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-2 rounded-full transition-colors"
                    >
                      Again?
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Show mock data after user's reviews */}
              {recentFoods.slice(0, Math.max(0, 2 - userFoodReviews.length)).map((food) => (
                <div key={food.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                      <FoodImage 
                        src={food.image} 
                        alt={food.name}
                        fallbackEmoji={getFoodEmoji(food.name, food.cuisineType, food.foodType)}
                        size="md"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{food.name}</h3>
                      <p className="text-sm text-gray-600">{food.location}</p>
                      <div className="flex items-center mt-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < food.kuchisabishiRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-1">{food.kuchisabishiRating}/5</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleEatingAgain(food)}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-2 rounded-full transition-colors"
                    >
                      Again?
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Hall of Fame */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-800">Hall of Fame</h2>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">5 Stars</span>
            </div>
            
            <div className="overflow-x-auto">
              <div className="flex space-x-3 pb-2">
                {kuchisabishiFoods.slice(0, 5).map((food) => (
                  <div key={food.id} className="flex-shrink-0 w-48 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center ring-2 ring-yellow-400">
                        <span className="text-xl">{getFoodEmoji(food.name, food.cuisineType, food.foodType)}</span>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm mb-1">{food.name}</h3>
                    <p className="text-xs text-purple-700 font-medium">{food.location}</p>
                    <button 
                      onClick={() => handleEatingAgain(food)}
                      className="w-full bg-purple-500 hover:bg-purple-600 text-white text-xs py-2 rounded-lg transition-colors mt-2"
                    >
                      Eat Again!
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>
      </div>
    );
  };

  // Activity Feed Screen
  const ActivityScreen = () => (
    <ActivityFeed onBack={() => setActiveTab('home')} />
  );

  // Profile Screen Placeholder
  const ProfileScreen = () => (
    <div className="flex-1 bg-gray-50 flex items-center justify-center pb-20">
      <div className="text-center">
        <div className="text-4xl mb-4">👤</div>
        <p className="text-gray-600">Profile coming soon</p>
      </div>
    </div>
  );

  // Search Screen Placeholder
  const SearchScreen = () => (
    <div className="flex-1 bg-gray-50 flex items-center justify-center pb-20">
      <div className="text-center">
        <div className="text-4xl mb-4">🔍</div>
        <p className="text-gray-600">Search coming soon</p>
      </div>
    </div>
  );

  // Main App Content
  const AppContent = () => {
    return (
      <div className="min-h-screen bg-white flex flex-col relative">
        {currentView === 'onboarding' && <OnboardingScreens />}
        {currentView === 'app' && (
          <>
            {/* Tab Content */}
            <div className="flex-1">
              {activeTab === 'home' && <MobileHomeScreen />}
              {activeTab === 'search' && <SearchScreen />}
              {activeTab === 'add' && <MobileHomeScreen />} {/* Will trigger food form */}
              {activeTab === 'social' && <ActivityScreen />}
              {activeTab === 'profile' && <ProfileScreen />}
            </div>
            
            {/* Bottom Navigation */}
            <BottomTabBar 
              tabs={defaultTabs}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </>
        )}
      </div>
    )
  };

  return (
    <AuthWrapper onAuthSuccess={handleAuthSuccess}>
      <AppContent />
      {showFoodForm && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowFoodForm(false)} />
          <div className="relative z-10 h-full">
            {/* Food form will be implemented here */}
            <div className="bg-white h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-4">📝</div>
                <p className="text-gray-600 mb-4">Food logging form coming soon</p>
                <button 
                  onClick={() => setShowFoodForm(false)}
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthWrapper>
  );
}