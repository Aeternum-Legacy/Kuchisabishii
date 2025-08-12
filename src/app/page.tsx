'use client';

import React, { useState } from 'react';
import { MapPin, Star, Search, Plus, User, Home, Map, List, ChefHat, TrendingUp, Clock } from 'lucide-react';
import MapView from '../components/MapView';
import FoodImage from '../components/FoodImage';
import MainApp from '../components/MainApp';
import { getFoodEmoji } from '../utils/foodEmojis';
import { mockFoodReviews, mockUserProfile, recommendedFoods, kuchisabishiFoods, recentFoods } from '../data/seed-data';

// PWA App Component
export default function KuchisabishiiPWA() {
  const [currentView, setCurrentView] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [useEnhancedApp, setUseEnhancedApp] = useState(true);
  const [user, setUser] = useState({
    id: '1',
    displayName: 'Food Lover',
    profileImage: undefined
  });
  
  // State for new food reviews - these will appear on home screen
  const [userFoodReviews, setUserFoodReviews] = useState<any[]>([]);

  // Set logged in and show onboarding after login
  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowOnboarding(true);
    setCurrentView('onboarding');
  };

  // Onboarding completion handler
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    if (useEnhancedApp) {
      setCurrentView('enhanced-app');
    } else {
      setCurrentView('home');
    }
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

  // Simple placeholder for non-enhanced features
  const PlaceholderScreen = ({ title }: { title: string }) => (
    <div className="flex-1 bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">🚧</div>
        <p className="text-gray-600">{title} coming soon</p>
      </div>
    </div>
  );

  // Enhanced Home Screen with Beautiful Gradient Design
  const HomeScreen = () => {
    const [selectedFood, setSelectedFood] = useState<any>(null);
    const [isReviewing, setIsReviewing] = useState(false);
    
    const handleEatingAgain = (food: any) => {
      setSelectedFood(food);
      setIsReviewing(true);
      // This would transition to the food review screen with pre-filled data
      setCurrentView('add');
    };

    return (
      <div className="flex-1 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white p-4 rounded-b-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Welcome back!</h1>
                <p className="text-orange-100 text-sm">{mockUserProfile.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-orange-100">Total Reviews</p>
              <p className="text-2xl font-bold">{mockUserProfile.totalReviews + userFoodReviews.length}</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex justify-between bg-white rounded-lg p-3 shadow-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">
                {userFoodReviews.length > 0 
                  ? ((mockUserProfile.averageRating * mockUserProfile.totalReviews + userFoodReviews.reduce((sum: number, food: any) => sum + food.kuchisabishiRating, 0)) / (mockUserProfile.totalReviews + userFoodReviews.length)).toFixed(1)
                  : mockUserProfile.averageRating.toFixed(1)
                }
              </div>
              <div className="text-xs text-gray-600">Avg Rating</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">
                {mockUserProfile.kuchisabishiCount + userFoodReviews.filter((food: any) => food.kuchisabishiRating === 5).length}
              </div>
              <div className="text-xs text-gray-600">Kuchisabishii!</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">{mockUserProfile.achievements.length}</div>
              <div className="text-xs text-gray-600">Achievements</div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="p-4 space-y-6">
          
          {/* AI Recommendations */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg font-semibold text-gray-800">AI Recommendations</h2>
              </div>
              <span className="text-xs text-gray-500">Powered by your taste profile</span>
            </div>
            
            <div className="space-y-3">
              {recommendedFoods.slice(0, 3).map((rec) => (
                <div key={rec.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-gray-800">{rec.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full text-white font-medium ${
                          rec.recommendation_type === 'ai_match' ? 'bg-blue-600' :
                          rec.recommendation_type === 'trending' ? 'bg-green-600' : 'bg-purple-600'
                        }`}>
                          {rec.recommendation_type === 'ai_match' ? 'AI Match' :
                           rec.recommendation_type === 'trending' ? 'Trending' : 'Friend Loved'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{rec.restaurantName} • {rec.cuisineType}</p>
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < rec.estimatedRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">Est. {rec.estimatedRating}/5</span>
                        <span className="text-xs text-green-600 font-medium">{rec.aiConfidence}% match</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        <ul className="list-disc list-inside">
                          {rec.reasoning.slice(0, 2).map((reason, i) => (
                            <li key={i}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Foods */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-800">Recent Foods</h2>
              </div>
              <button 
                onClick={() => setCurrentView('history')}
                className="text-sm text-orange-500 hover:text-orange-600"
              >
                View All
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {/* Show user's new food reviews first */}
              {userFoodReviews.slice(0, 3).map((food: any) => (
                <div key={food.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 ring-2 ring-orange-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FoodImage 
                        src={food.image} 
                        alt={food.name}
                        fallbackEmoji={getFoodEmoji(food.name, food.cuisineType, food.foodType)}
                        size="md"
                        className="flex-shrink-0"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-800">{food.name}</h3>
                          <span className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-full font-medium">NEW</span>
                        </div>
                        <p className="text-sm text-gray-600">{food.location} • {food.dateEaten}</p>
                        <div className="flex items-center mt-1">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < food.kuchisabishiRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <span className="text-xs text-gray-600 ml-1">{food.kuchisabishiRating}/5</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleEatingAgain(food)}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1 rounded-full transition-colors"
                    >
                      Eating Again?
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Show mock data after user's reviews */}
              {recentFoods.slice(0, Math.max(0, 3 - userFoodReviews.length)).map((food) => (
                <div key={food.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FoodImage 
                        src={food.image} 
                        alt={food.name}
                        fallbackEmoji={getFoodEmoji(food.name, food.cuisineType, food.foodType)}
                        size="md"
                        className="flex-shrink-0"
                      />
                      <div>
                        <h3 className="font-medium text-gray-800">{food.name}</h3>
                        <p className="text-sm text-gray-600">{food.location} • {food.dateEaten}</p>
                        <div className="flex items-center mt-1">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < food.kuchisabishiRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <span className="text-xs text-gray-600 ml-1">{food.kuchisabishiRating}/5</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleEatingAgain(food)}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1 rounded-full transition-colors"
                    >
                      Eating Again?
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Kuchisabishii Hall of Fame */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <ChefHat className="w-5 h-5 text-purple-500" />
                <h2 className="text-lg font-semibold text-gray-800">Kuchisabishii Hall of Fame</h2>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">5-Star Foods</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {kuchisabishiFoods.slice(0, 3).map((food) => (
                <div key={food.id} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FoodImage 
                        src={food.image} 
                        alt={food.name}
                        fallbackEmoji={getFoodEmoji(food.name, food.cuisineType, food.foodType)}
                        size="lg"
                        className="flex-shrink-0 ring-2 ring-yellow-400"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-800">{food.name}</h3>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-purple-700 font-medium">{food.location}</p>
                        <p className="text-xs text-gray-600 mt-1">"{food.experience.slice(0, 80)}..."</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleEatingAgain(food)}
                      className="bg-purple-500 hover:bg-purple-600 text-white text-xs px-3 py-2 rounded-full transition-colors whitespace-nowrap"
                    >
                      Eat Again!
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setCurrentView('add')}
                className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-lg transition-colors"
              >
                <Plus className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Log New Food</span>
              </button>
              <button 
                onClick={() => setCurrentView('map')}
                className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg transition-colors"
              >
                <MapPin className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Find Places</span>
              </button>
            </div>
          </section>

        </div>
      </div>
    );
  };

  // Login Screen Component
  const LoginScreen = ({ onLogin }: { onLogin: () => void }) => (
    <div className="flex-1 bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center px-6">
      <div className="text-center space-y-8 max-w-sm">
        <div className="space-y-4">
          <div className="text-6xl">🍜</div>
          <h1 className="text-4xl font-bold text-gray-800">Kuchisabishii</h1>
          <p className="text-lg text-gray-700">Your emotional food journey starts here</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={onLogin}
            className="w-full bg-orange-500 text-white py-4 rounded-xl text-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            Get Started
          </button>
          <p className="text-sm text-gray-600">
            Track, discover, and share your food experiences
          </p>
        </div>
      </div>
    </div>
  );

  // Main App Router
  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg min-h-screen flex flex-col">
      {currentView === 'onboarding' && <OnboardingScreens />}
      {currentView === 'enhanced-app' && <HomeScreen />}
      {currentView === 'profile' && <PlaceholderScreen title="Profile" />}
    </div>
  );
}