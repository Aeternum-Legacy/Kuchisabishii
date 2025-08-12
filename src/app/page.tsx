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
      {currentView === 'enhanced-app' && <MainApp />}
      {currentView === 'profile' && <PlaceholderScreen title="Profile" />}
    </div>
  );
}