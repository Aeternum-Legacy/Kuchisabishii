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
  const [userFoodReviews, setUserFoodReviews] = useState([]);

  // Enhanced Home Screen with Instagram Dark Mode Inspired Design
  const HomeScreen = () => {
    const [selectedFood, setSelectedFood] = useState(null);
    const [isReviewing, setIsReviewing] = useState(false);
    
    const handleEatingAgain = (food) => {
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
                  ? ((mockUserProfile.averageRating * mockUserProfile.totalReviews + userFoodReviews.reduce((sum, food) => sum + food.kuchisabishiRating, 0)) / (mockUserProfile.totalReviews + userFoodReviews.length)).toFixed(1)
                  : mockUserProfile.averageRating.toFixed(1)
                }
              </div>
              <div className="text-xs text-gray-600">Avg Rating</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800">
                {mockUserProfile.kuchisabishiCount + userFoodReviews.filter(food => food.kuchisabishiRating === 5).length}
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
              {userFoodReviews.slice(0, 3).map((food) => (
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
                        <p className="text-xs text-gray-300 mt-1">"{food.experience.slice(0, 80)}..."</p>
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

  // Login Screen with Instagram Dark Mode Design
  const LoginScreen = ({ onLogin }: { onLogin: () => void }) => (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <svg viewBox="0 0 100 100" className="w-16 h-16">
              <g>
                <circle cx="50" cy="50" r="35" fill="white" stroke="black" strokeWidth="3"/>
                <path d="M 25 50 Q 50 65 75 50" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round"/>
                <line x1="35" y1="50" x2="35" y2="54" stroke="black" strokeWidth="2" strokeLinecap="round"/>
                <line x1="45" y1="50" x2="45" y2="54" stroke="black" strokeWidth="2" strokeLinecap="round"/>
                <line x1="55" y1="50" x2="55" y2="54" stroke="black" strokeWidth="2" strokeLinecap="round"/>
                <line x1="65" y1="50" x2="65" y2="54" stroke="black" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="35" cy="35" r="3" fill="black"/>
                <circle cx="65" cy="35" r="3" fill="black"/>
                <circle cx="36" cy="34" r="1" fill="white"/>
                <circle cx="66" cy="34" r="1" fill="white"/>
                <circle cx="25" cy="25" r="10" fill="white" stroke="black" strokeWidth="3"/>
                <circle cx="75" cy="25" r="10" fill="white" stroke="black" strokeWidth="3"/>
                <circle cx="25" cy="25" r="5" fill="none" stroke="black" strokeWidth="2"/>
                <circle cx="75" cy="25" r="5" fill="none" stroke="black" strokeWidth="2"/>
              </g>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Kuchisabishii</h1>
          <p className="text-gray-600 mt-2">口寂しい - When Your Mouth is Lonely</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={onLogin}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold flex items-center justify-center space-x-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            <span>Continue with Apple</span>
          </button>
          
          <button
            onClick={onLogin}
            className="w-full bg-white text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center space-x-3 border border-gray-300"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>
          
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400"
          />
          <button
            onClick={onLogin}
            className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold"
          >
            Sign In
          </button>
          <button 
            onClick={onLogin}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );


  // Navigation Bar with Instagram Dark Mode Design
  const NavigationBar = () => (
    <div className="bg-white border-t border-gray-200">
      <div className="flex justify-around py-2">
        {[
          { icon: Home, label: 'Home', view: 'home' },
          { icon: Map, label: 'Map', view: 'map' },
          { icon: Plus, label: 'Log Food', view: 'add' },
          { icon: List, label: 'My Foods', view: 'history' },
          { icon: User, label: 'Profile', view: 'profile' }
        ].map(({ icon: Icon, label, view }) => (
          <button
            key={view}
            onClick={() => setCurrentView(view)}
            className={`flex flex-col items-center p-2 ${
              currentView === view ? 'text-orange-500' : 'text-gray-400'
            }`}
          >
            <div className={`${view === 'add' && currentView !== view ? 'bg-orange-500 p-1 rounded-lg' : ''}`}>
              <Icon className={`w-6 h-6 ${view === 'add' && currentView !== view ? 'text-white' : ''}`} />
            </div>
            <span className="text-xs mt-1">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // Food Review Screen with Comprehensive Data Collection
  const FoodReviewScreen = () => {
    const [step, setStep] = useState(1);
    
    // Mandatory fields
    const [foodName, setFoodName] = useState('');
    const [location, setLocation] = useState('');
    const [shopType, setShopType] = useState('');
    const [cuisineType, setCuisineType] = useState('');
    const [foodType, setFoodType] = useState('');
    const [dateEaten, setDateEaten] = useState(new Date().toISOString().split('T')[0]);
    const [kuchisabishiRating, setKuchisabishiRating] = useState(0);
    
    // Optional fields
    const [image, setImage] = useState('');
    const [mealtime, setMealtime] = useState('');
    const [basicTastes, setBasicTastes] = useState({
      sweet: 0, savoury: 0, sour: 0, spicy: 0, umami: 0, bitter: 0
    });
    const [mouthfeel, setMouthfeel] = useState([]);
    const [smell, setSmell] = useState([]);
    const [diningMethod, setDiningMethod] = useState('');
    const [cost, setCost] = useState('');
    const [worthCost, setWorthCost] = useState('');
    const [experience, setExperience] = useState('');

    const kuchisabishiScale = [
      { value: 1, label: "Never Again", emoji: "😞", description: "I wish I could eat it never again", color: "bg-red-500" },
      { value: 2, label: "Next Time", emoji: "😕", description: "I wish I could eat it next time", color: "bg-orange-500" },
      { value: 3, label: "Occasionally", emoji: "😐", description: "I wish I could eat it occasionally", color: "bg-yellow-500" },
      { value: 4, label: "Frequently", emoji: "😊", description: "I wish I could eat it frequently", color: "bg-green-500" },
      { value: 5, label: "Kuchisabishii!", emoji: "😍", description: "Whenever my mouth is lonely - Kuchisabishii!", color: "bg-purple-500" }
    ];

    const shopTypes = ["Restaurant", "Cafe", "Convenience Store", "Grocery Store", "Home", "Food Truck", "Market", "Bakery"];
    const cuisineTypes = ["Japanese", "Korean", "Chinese", "Italian", "Mexican", "Thai", "Indian", "French", "American", "Vietnamese", "Mediterranean", "Other"];
    const foodTypes = ["Main Dish", "Appetizer", "Dessert", "Beverage", "Soup", "Salad", "Side Dish", "Snack", "Bread", "Noodles", "Rice", "Meat", "Seafood", "Vegetarian"];
    const mealtimes = ["Breakfast", "Brunch", "Lunch", "Dinner", "Dessert", "Snack Time"];
    const diningMethods = ["Homemade", "Dine In", "Take Out", "Delivery"];
    const mouthfeelOptions = ["Creamy", "Oily", "Crunchy", "Crispy", "Earthy", "Soupy", "Chewy", "Juicy", "Firm", "Soft", "Sticky", "Jelly", "Granular", "Pulpy", "Stretchy", "Spongy", "Rich", "Flaky", "Hot", "Cold", "Warm", "Slimy", "Fatty", "Mushy", "Tough", "Dry", "Fluffy"];
    const smellOptions = ["Pungent", "Floral", "Fruity", "Savory", "Sweet", "Oily", "Citrusy", "Buttery", "Earthy"];
    const tasteNames = ["Sweet", "Savoury", "Sour", "Spicy", "Umami", "Bitter"];

    const handleSubmit = () => {
      const foodEntry = {
        // Mandatory fields
        name: foodName,
        location,
        shopType,
        cuisineType,
        foodType,
        dateEaten,
        kuchisabishiRating,
        
        // Optional fields
        image,
        mealtime,
        basicTastes,
        mouthfeel,
        smell,
        diningMethod,
        cost: cost ? parseFloat(cost) : null,
        worthCost,
        experience,
        timestamp: new Date().toISOString(),
        id: Date.now().toString()
      };
      
      // Add to user's food reviews (this will show on home screen)
      setUserFoodReviews(prev => [foodEntry, ...prev]);
      
      // In production, this would also save to database
      console.log('Comprehensive food entry saved:', foodEntry);
      alert(`"${foodName}" experience logged and added to your Recent Foods!\n\nKuchisabishii Rating: ${kuchisabishiRating}/5 - ${kuchisabishiScale[kuchisabishiRating-1]?.label}\nLocation: ${location}\nCuisine: ${cuisineType}`);
      
      // Navigate back to home to see the new entry
      setCurrentView('home');
      
      // Reset form
      setStep(1);
      setFoodName('');
      setLocation('');
      setShopType('');
      setCuisineType('');
      setFoodType('');
      setDateEaten(new Date().toISOString().split('T')[0]);
      setKuchisabishiRating(0);
      setImage('');
      setMealtime('');
      setBasicTastes({ sweet: 0, savoury: 0, sour: 0, spicy: 0, umami: 0, bitter: 0 });
      setMouthfeel([]);
      setSmell([]);
      setDiningMethod('');
      setCost('');
      setWorthCost('');
      setExperience('');
    };

    return (
      <div className="flex-1 bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentView('home')}
              className="text-orange-500 flex items-center space-x-2"
            >
              <span>←</span>
              <span>Back</span>
            </button>
            <h1 className="text-xl font-bold text-gray-800">Log Food Experience</h1>
            <div className="w-8"></div>
          </div>
          
          {/* Progress Bar */}
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full ${
                  i <= step ? 'bg-orange-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">Step {step} of 5</p>
        </div>

        <div className="p-4">
          {/* Step 1: Basic Mandatory Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="text-6xl mb-2">🍽️</div>
                <h2 className="text-xl font-semibold text-gray-800">What did you eat?</h2>
                <p className="text-gray-600">Let's capture the essentials first!</p>
              </div>

              {/* Image Upload (Optional) */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Photo/Video (Optional)</label>
                <div className="border-2 border-dashed border-gray-700 bg-gray-800 rounded-xl p-6 text-center hover:border-pink-500 transition-colors cursor-pointer">
                  <div className="text-4xl mb-2">📸</div>
                  <p className="text-sm text-gray-300">Tap to add a delicious photo!</p>
                  <p className="text-xs text-gray-500 mt-1">Supports JPG, PNG, HEIC, MP4</p>
                  <input type="file" accept="image/*,video/*" className="hidden" />
                </div>
              </div>

              {/* Food Name (Mandatory) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Food Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Korean BBQ Bulgogi"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Date Eaten */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Eaten *</label>
                <input
                  type="date"
                  value={dateEaten}
                  onChange={(e) => setDateEaten(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <button
                onClick={() => foodName.trim() && dateEaten && setStep(2)}
                disabled={!foodName.trim() || !dateEaten}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors"
              >
                Next: Location & Categories
              </button>
            </div>
          )}

          {/* Step 2: Location & Categories */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">🏪</div>
                <h2 className="text-xl font-semibold text-gray-800">Where & What Type?</h2>
                <p className="text-gray-600">Help us categorize your experience</p>
              </div>

              {/* Location (Mandatory) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location/Shop Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Seoul House, Home Kitchen"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Shop Type (Mandatory) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shop Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  {shopTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setShopType(type)}
                      className={`p-3 text-sm rounded-lg border transition-colors ${
                        shopType === type
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cuisine Type (Mandatory) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine Type *</label>
                <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                  {cuisineTypes.map((cuisine) => (
                    <button
                      key={cuisine}
                      onClick={() => setCuisineType(cuisine)}
                      className={`p-2 text-xs rounded-lg border transition-colors ${
                        cuisineType === cuisine
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {cuisine}
                    </button>
                  ))}
                </div>
              </div>

              {/* Food Type (Mandatory) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Food Type *</label>
                <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                  {foodTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setFoodType(type)}
                      className={`p-2 text-xs rounded-lg border transition-colors ${
                        foodType === type
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => location.trim() && shopType && cuisineType && foodType && setStep(3)}
                  disabled={!location.trim() || !shopType || !cuisineType || !foodType}
                  className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors"
                >
                  Next: Kuchisabishii Rating
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Kuchisabishii Rating (Mandatory) */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">💭</div>
                <h2 className="text-xl font-semibold text-gray-800">How did it make you feel?</h2>
                <p className="text-gray-600">Rate using our Kuchisabishii scale</p>
              </div>

              <div className="space-y-3">
                {kuchisabishiScale.map((scale) => (
                  <button
                    key={scale.value}
                    onClick={() => setKuchisabishiRating(scale.value)}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                      kuchisabishiRating === scale.value
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${scale.color} text-white rounded-full flex items-center justify-center text-xl font-bold`}>
                        {scale.value}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{scale.emoji}</span>
                          <span className="font-semibold text-gray-800">{scale.label}</span>
                        </div>
                        <p className="text-sm text-gray-600">"{scale.description}"</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => kuchisabishiRating > 0 && setStep(4)}
                  disabled={kuchisabishiRating === 0}
                  className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors"
                >
                  Next: Sensory Details
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Sensory Details (Optional) */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">👃👅</div>
                <h2 className="text-xl font-semibold text-gray-800">Sensory Experience</h2>
                <p className="text-gray-600">Optional: Tell us about taste, mouthfeel & smell</p>
              </div>

              {/* Basic Tastes */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Basic Tastes (0=None, 5=Strong)</h3>
                <div className="space-y-3">
                  {tasteNames.map((taste) => (
                    <div key={taste} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{taste}</span>
                      <div className="flex space-x-2">
                        {[0, 1, 2, 3, 4, 5].map((level) => (
                          <button
                            key={level}
                            onClick={() => setBasicTastes(prev => ({ ...prev, [taste.toLowerCase()]: level }))}
                            className={`w-8 h-8 rounded-full text-xs font-bold transition-colors ${
                              basicTastes[taste.toLowerCase()] === level
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mouthfeel */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Mouthfeel (Select all that apply)</h3>
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                  {mouthfeelOptions.map((feel) => (
                    <button
                      key={feel}
                      onClick={() => {
                        const newMouthfeel = mouthfeel.includes(feel)
                          ? mouthfeel.filter(f => f !== feel)
                          : [...mouthfeel, feel];
                        setMouthfeel(newMouthfeel);
                      }}
                      className={`p-2 text-xs rounded-lg border transition-colors ${
                        mouthfeel.includes(feel)
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {feel}
                    </button>
                  ))}
                </div>
              </div>

              {/* Smell */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Smell (Select all that apply)</h3>
                <div className="grid grid-cols-3 gap-2">
                  {smellOptions.map((scent) => (
                    <button
                      key={scent}
                      onClick={() => {
                        const newSmell = smell.includes(scent)
                          ? smell.filter(s => s !== scent)
                          : [...smell, scent];
                        setSmell(newSmell);
                      }}
                      className={`p-2 text-xs rounded-lg border transition-colors ${
                        smell.includes(scent)
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {scent}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(5)}
                  className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                >
                  Next: Final Details
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Final Details & Experience */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">💰📝</div>
                <h2 className="text-xl font-semibold text-gray-800">Final Details</h2>
                <p className="text-gray-600">Optional: Cost, experience & context</p>
              </div>

              {/* Mealtime */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mealtime (Optional)</label>
                <div className="grid grid-cols-3 gap-2">
                  {mealtimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => setMealtime(mealtime === time ? '' : time)}
                      className={`p-2 text-sm rounded-lg border transition-colors ${
                        mealtime === time
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dining Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">How did you get/eat this? (Optional)</label>
                <div className="grid grid-cols-2 gap-2">
                  {diningMethods.map((method) => (
                    <button
                      key={method}
                      onClick={() => setDiningMethod(diningMethod === method ? '' : method)}
                      className={`p-2 text-sm rounded-lg border transition-colors ${
                        diningMethod === method
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">How much did you spend? (Optional)</label>
                <div className="flex items-center space-x-3">
                  <span className="text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <select
                    value={worthCost}
                    onChange={(e) => setWorthCost(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Worth it?</option>
                    <option value="definitely">Definitely!</option>
                    <option value="yes">Yes</option>
                    <option value="maybe">Maybe</option>
                    <option value="no">No</option>
                    <option value="overpriced">Overpriced</option>
                  </select>
                </div>
              </div>

              {/* Experience Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Experience (Optional)</label>
                <textarea
                  placeholder="Describe your experience, memories, flavors, emotions... (max 4,096 characters)"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value.slice(0, 4096))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-32 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{experience.length}/4,096 characters</p>
              </div>

              {/* Summary */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">🍽️ Experience Summary</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Food:</span> {foodName}</p>
                  <p><span className="font-medium">Location:</span> {location} ({shopType})</p>
                  <p><span className="font-medium">Cuisine:</span> {cuisineType} • {foodType}</p>
                  <p><span className="font-medium">Date:</span> {dateEaten}</p>
                  <p><span className="font-medium">Kuchisabishii Rating:</span> {kuchisabishiScale[kuchisabishiRating-1]?.emoji} {kuchisabishiScale[kuchisabishiRating-1]?.label}</p>
                  {mealtime && <p><span className="font-medium">Mealtime:</span> {mealtime}</p>}
                  {diningMethod && <p><span className="font-medium">Method:</span> {diningMethod}</p>}
                  {cost && <p><span className="font-medium">Cost:</span> ${cost} {worthCost && `(${worthCost})`}</p>}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Save Kuchisabishii Experience! 🍽️
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // My Foods Screen - Complete food journal with filtering and search
  const MyFoodsScreen = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFood, setSelectedFood] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [filterCuisine, setFilterCuisine] = useState('all');
    const [sortBy, setSortBy] = useState('date');

    // Combine user's foods with mock data for demonstration
    const allFoods = [...userFoodReviews, ...mockFoodReviews];
    
    // Get unique cuisines for filter
    const cuisines = ['all', ...new Set(allFoods.map(food => food.cuisineType))];
    
    // Filter and sort foods
    const filteredFoods = allFoods.filter(food => {
      const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           food.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           food.cuisineType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCuisine = filterCuisine === 'all' || food.cuisineType === filterCuisine;
      return matchesSearch && matchesCuisine;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'rating': return b.kuchisabishiRating - a.kuchisabishiRating;
        case 'name': return a.name.localeCompare(b.name);
        case 'date': 
        default: return new Date(b.dateEaten || b.timestamp) - new Date(a.dateEaten || a.timestamp);
      }
    });

    const openFoodDetails = (food) => {
      setSelectedFood(food);
      setShowDetailsModal(true);
    };

    return (
      <div className="flex-1 bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-800">My Foods</h1>
              <div className="text-sm text-gray-600">
                {allFoods.length} total entries
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search foods, restaurants, cuisines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Filters */}
            <div className="flex space-x-3 overflow-x-auto">
              <select
                value={filterCuisine}
                onChange={(e) => setFilterCuisine(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {cuisines.map(cuisine => (
                  <option key={cuisine} value={cuisine}>
                    {cuisine === 'all' ? 'All Cuisines' : cuisine}
                  </option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="date">Newest First</option>
                <option value="rating">Highest Rated</option>
                <option value="name">A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Food List */}
        <div className="p-4">
          {filteredFoods.length === 0 ? (
            <div className="text-center py-12">
              <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {searchTerm || filterCuisine !== 'all' ? 'No matching foods found' : 'No foods logged yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterCuisine !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Start logging your food experiences!'}
              </p>
              {!searchTerm && filterCuisine === 'all' && (
                <button
                  onClick={() => setCurrentView('add')}
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  Log Your First Food
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFoods.map((food, index) => (
                <div
                  key={food.id || index}
                  onClick={() => openFoodDetails(food)}
                  className={`bg-white rounded-lg p-4 shadow-sm border cursor-pointer hover:shadow-md transition-shadow ${
                    userFoodReviews.some(userFood => userFood.id === food.id) ? 'border-orange-200 ring-1 ring-orange-100' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <FoodImage 
                      src={food.image} 
                      alt={food.name}
                      fallbackEmoji={getFoodEmoji(food.name, food.cuisineType, food.foodType)}
                      size="lg"
                      className="flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-800">{food.name}</h3>
                          {userFoodReviews.some(userFood => userFood.id === food.id) && (
                            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-full font-medium">MY ENTRY</span>
                          )}
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < food.kuchisabishiRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                          ))}
                          <span className="ml-1 text-sm text-gray-600">{food.kuchisabishiRating}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {food.location}
                        </span>
                        <span>{food.cuisineType}</span>
                        <span>{food.dateEaten}</span>
                      </div>
                      
                      {food.experience && (
                        <p className="text-sm text-gray-700 line-clamp-2 mb-2">{food.experience}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {food.mouthfeel && food.mouthfeel.slice(0, 3).map((feel) => (
                            <span key={feel} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                              {feel}
                            </span>
                          ))}
                          {food.mouthfeel && food.mouthfeel.length > 3 && (
                            <span className="text-xs text-gray-500">+{food.mouthfeel.length - 3} more</span>
                          )}
                        </div>
                        
                        {food.cost && (
                          <span className="text-sm text-gray-600 font-medium">${food.cost}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Food Details Modal */}
        {showDetailsModal && selectedFood && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
            <div className="bg-white rounded-t-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-4">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">{selectedFood.name}</h2>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    ✕
                  </button>
                </div>

                {/* Food Image */}
                <div className="mb-4">
                  <FoodImage 
                    src={selectedFood.image} 
                    alt={selectedFood.name}
                    fallbackEmoji={getFoodEmoji(selectedFood.name, selectedFood.cuisineType, selectedFood.foodType)}
                    size="xl"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < selectedFood.kuchisabishiRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-lg font-semibold">{selectedFood.kuchisabishiRating}/5</span>
                </div>

                {/* Basic Info */}
                <div className="space-y-3 mb-6">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Location: </span>
                    <span className="text-sm text-gray-800">{selectedFood.location}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Cuisine: </span>
                    <span className="text-sm text-gray-800">{selectedFood.cuisineType} • {selectedFood.foodType}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Date: </span>
                    <span className="text-sm text-gray-800">{selectedFood.dateEaten}</span>
                  </div>
                  {selectedFood.mealtime && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Mealtime: </span>
                      <span className="text-sm text-gray-800">{selectedFood.mealtime}</span>
                    </div>
                  )}
                  {selectedFood.cost && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Cost: </span>
                      <span className="text-sm text-gray-800">${selectedFood.cost}</span>
                    </div>
                  )}
                </div>

                {/* Taste Profile */}
                {selectedFood.basicTastes && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-3">Taste Profile</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(selectedFood.basicTastes).map(([taste, level]) => (
                        <div key={taste} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 capitalize">{taste}</span>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className={`w-2 h-2 rounded-full ${i < level ? 'bg-orange-400' : 'bg-gray-200'}`} />
                            ))}
                            <span className="text-xs text-gray-500 ml-1">{level}/5</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mouthfeel & Smell */}
                {(selectedFood.mouthfeel?.length > 0 || selectedFood.smell?.length > 0) && (
                  <div className="mb-6">
                    {selectedFood.mouthfeel?.length > 0 && (
                      <div className="mb-3">
                        <h4 className="font-medium text-gray-800 mb-2">Mouthfeel</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedFood.mouthfeel.map((feel) => (
                            <span key={feel} className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                              {feel}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedFood.smell?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Aroma</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedFood.smell.map((smell) => (
                            <span key={smell} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                              {smell}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Experience Notes */}
                {selectedFood.experience && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-2">My Experience</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedFood.experience}</p>
                  </div>
                )}

                {/* Action Button */}
                <button 
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleEatingAgain(selectedFood);
                  }}
                  className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                >
                  Eating Again? Log New Experience
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Placeholder screens with dark theme
  const PlaceholderScreen = ({ title }: { title: string }) => (
    <div className="flex-1 bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">🚧</div>
        <p className="text-gray-600">{title} coming soon</p>
      </div>
    </div>
  );

  // Set logged in and home view after login
  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentView('home');
  };

  // Main App Router
  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg min-h-screen flex flex-col">
      {currentView === 'home' && <HomeScreen />}
      {currentView === 'map' && <MapView />}
      {currentView === 'add' && <FoodReviewScreen />}
      {currentView === 'history' && <MyFoodsScreen />}
      {currentView === 'profile' && <PlaceholderScreen title="Profile" />}
      <NavigationBar />
    </div>
  );
}