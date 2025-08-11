import React, { useState } from 'react';
import { MapPin, Star, Search, Plus, User, Home, Map, List } from 'lucide-react';

// Mock data - Edmonton, Alberta locations with images
const mockRestaurants = [
  // Restaurants
  { 
    id: 1, 
    name: "Pampa Brazilian Steakhouse", 
    type: "Restaurant", 
    lat: 53.5171, 
    lng: -113.6189, 
    address: "10220 103 St NW",
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop",
    menu: [
      { id: 1, name: "Picanha (Top Sirloin)", avgRating: 4.8, reviewCount: 156, price: "$45.99", image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop" },
      { id: 2, name: "Grilled Pineapple", avgRating: 4.6, reviewCount: 89, price: "$8.99", image: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=400&h=300&fit=crop" },
      { id: 3, name: "Feijoada", avgRating: 4.5, reviewCount: 45, price: "$28.99", image: "https://images.unsplash.com/photo-1547424450-75ec164925ad?w=400&h=300&fit=crop" }
    ]
  },
  { 
    id: 2, 
    name: "Northern Chicken", 
    type: "Restaurant", 
    lat: 53.5461, 
    lng: -113.4869, 
    address: "10145 104 St NW",
    image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop",
    menu: [
      { id: 4, name: "Korean Fried Chicken", avgRating: 4.7, reviewCount: 234, price: "$18.99", image: "https://images.unsplash.com/photo-1569691899455-88464f6d3ab1?w=400&h=300&fit=crop" },
      { id: 5, name: "Honey Garlic Wings", avgRating: 4.9, reviewCount: 189, price: "$16.99", image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&h=300&fit=crop" }
    ]
  },
  // Grocery Stores
  { 
    id: 3, 
    name: "Save-On-Foods", 
    type: "Grocery", 
    lat: 53.5188, 
    lng: -113.5072, 
    address: "10150 Jasper Ave",
    image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop",
    menu: [
      { id: 6, name: "Fresh Sushi Platter", avgRating: 4.3, reviewCount: 67, price: "$24.99", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop" },
      { id: 7, name: "Rotisserie Chicken", avgRating: 4.5, reviewCount: 143, price: "$12.99", image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop" }
    ]
  }
];

export default function KuchisabishiiApp() {
  const [currentView, setCurrentView] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [showAddFood, setShowAddFood] = useState(false);
  const [newFoodName, setNewFoodName] = useState('');
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  // Login Screen
  const LoginScreen = () => (
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
          <p className="text-gray-600 mt-2">口寂しい - Rate dishes, not just restaurants</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => setIsLoggedIn(true)}
            className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold flex items-center justify-center space-x-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            <span>Continue with Apple</span>
          </button>
          
          <button
            onClick={() => setIsLoggedIn(true)}
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={() => setIsLoggedIn(true)}
            className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold"
          >
            Sign In
          </button>
          <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold">
            Create Account
          </button>
        </div>
      </div>
    </div>
  );

  // Home Screen
  const HomeScreen = () => {
    const [activeTab, setActiveTab] = useState('food');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFavorites, setShowFavorites] = useState(false);
    
    return (
      <div className="flex-1 bg-gray-50">
        <div className="bg-white shadow-sm">
          <div className="p-4 pb-0">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              {showFavorites ? 'My Favorites' : 'Discover'}
            </h1>
            
            <div className="flex space-x-1">
              <button
                onClick={() => {
                  setShowFavorites(false);
                  setActiveTab('food');
                }}
                className={`flex-1 py-2 px-4 rounded-t-lg font-medium transition-colors ${
                  !showFavorites && activeTab === 'food'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Foods
              </button>
              <button
                onClick={() => {
                  setShowFavorites(false);
                  setActiveTab('places');
                }}
                className={`flex-1 py-2 px-4 rounded-t-lg font-medium transition-colors ${
                  !showFavorites && activeTab === 'places'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Places
              </button>
              <button
                onClick={() => setShowFavorites(true)}
                className={`flex-1 py-2 px-4 rounded-t-lg font-medium transition-colors ${
                  showFavorites
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                ❤️ Favorites
              </button>
            </div>
          </div>
          
          <div className="p-4 pt-3">
            <div className="flex items-center space-x-3 bg-gray-100 rounded-lg p-3">
              <Search className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-gray-700"
              />
            </div>
          </div>
        </div>
        
        <div className="p-4">
          {!showFavorites && activeTab === 'places' && (
            <div className="space-y-4">
              {mockRestaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  onClick={() => {
                    setSelectedRestaurant(restaurant);
                    setCurrentView('restaurant');
                  }}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                >
                  {restaurant.image && (
                    <img 
                      src={restaurant.image} 
                      alt={restaurant.name}
                      className="w-full h-32 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800">{restaurant.name}</h3>
                    <p className="text-sm text-gray-600">{restaurant.type}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{restaurant.address}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Restaurant Screen
  const RestaurantScreen = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [localMenu, setLocalMenu] = useState(selectedRestaurant?.menu || []);
    const [foodPrice, setFoodPrice] = useState('');
    const [foodCategory, setFoodCategory] = useState('');
    const [foodDescription, setFoodDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    
    const handleAddFood = () => {
      if (newFoodName.trim() && foodPrice.trim()) {
        const newFood = {
          id: Date.now(),
          name: newFoodName,
          price: `${foodPrice}`,
          category: foodCategory || 'Uncategorized',
          description: foodDescription,
          avgRating: 0,
          reviewCount: 0,
          image: imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
          // Backend would automatically track these:
          dateAdded: new Date().toISOString(),
          lastMonthReviews: 0,
          favoriteCount: 0,
          establishment: {
            name: selectedRestaurant?.name,
            type: selectedRestaurant?.type,
            id: selectedRestaurant?.id
          }
        };
        
        setLocalMenu([...localMenu, newFood]);
        
        // Reset form
        setNewFoodName('');
        setFoodPrice('');
        setFoodCategory('');
        setFoodDescription('');
        setImageUrl('');
        setShowAddFood(false);
        
        // Show what would be sent to backend
        console.log('New food item to save:', newFood);
        alert(`"${newFood.name}" has been added!\n\nIn production, this would be saved to the database with:\n- Timestamp: ${new Date().toLocaleString()}\n- Establishment: ${newFood.establishment.name}\n- Initial stats tracking enabled`);
      } else {
        alert('Please fill in at least the food name and price.');
      }
    };
    
    return (
      <div className="flex-1 bg-gray-50">
        <div className="bg-white shadow-sm p-4">
          <button
            onClick={() => setCurrentView('home')}
            className="text-orange-500 mb-2"
          >
            ← Back
          </button>
          <h2 className="text-xl font-bold text-gray-800">{selectedRestaurant?.name}</h2>
          <p className="text-gray-600">{selectedRestaurant?.type}</p>
        </div>
        
        <div className="bg-white border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                activeTab === 'all' 
                  ? 'text-orange-500 border-b-2 border-orange-500' 
                  : 'text-gray-600'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setActiveTab('myexperiences')}
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                activeTab === 'myexperiences' 
                  ? 'text-orange-500 border-b-2 border-orange-500' 
                  : 'text-gray-600'
              }`}
            >
              My Experiences
            </button>
          </div>
        </div>
        
        <div className="p-4">
          {activeTab === 'all' && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-700">Menu Items</h3>
                <button
                  onClick={() => setShowAddFood(true)}
                  className="flex items-center space-x-1 text-orange-500 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Item</span>
                </button>
              </div>
              
              {showAddFood && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-800 mb-3">Add New Food Item</h4>
                  
                  <div className="space-y-3">
                    {/* Food Name */}
                    <div>
                      <label className="text-sm text-gray-600">Food Name *</label>
                      <input
                        type="text"
                        placeholder="e.g., Margherita Pizza"
                        value={newFoodName}
                        onChange={(e) => setNewFoodName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
                      />
                    </div>
                    
                    {/* Price */}
                    <div>
                      <label className="text-sm text-gray-600">Price (CAD) *</label>
                      <div className="flex items-center mt-1">
                        <span className="text-gray-500 mr-2">$</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={foodPrice}
                          onChange={(e) => setFoodPrice(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                    
                    {/* Category */}
                    <div>
                      <label className="text-sm text-gray-600">Category</label>
                      <select
                        value={foodCategory}
                        onChange={(e) => setFoodCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
                      >
                        <option value="">Select category...</option>
                        <option value="Appetizers">Appetizers</option>
                        <option value="Main Courses">Main Courses</option>
                        <option value="Desserts">Desserts</option>
                        <option value="Beverages">Beverages</option>
                        <option value="Snacks">Snacks</option>
                        <option value="Prepared Foods">Prepared Foods</option>
                      </select>
                    </div>
                    
                    {/* Description */}
                    <div>
                      <label className="text-sm text-gray-600">Description</label>
                      <textarea
                        placeholder="Brief description of the food..."
                        value={foodDescription}
                        onChange={(e) => setFoodDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1 h-20 resize-none"
                      />
                    </div>
                    
                    {/* Image URL */}
                    <div>
                      <label className="text-sm text-gray-600">Image URL</label>
                      <input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        In production, you would upload images directly
                      </p>
                    </div>
                    
                    {/* Establishment Info (Read-only) */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">This item will be added to:</p>
                      <p className="font-medium text-gray-800">{selectedRestaurant?.name}</p>
                      <p className="text-sm text-gray-600">{selectedRestaurant?.type} • {selectedRestaurant?.address}</p>
                    </div>
                    
                    {/* Auto-tracked fields info */}
                    <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                      <p className="font-medium mb-1">The system will automatically track:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Date and time added</li>
                        <li>Number of user experiences</li>
                        <li>Average star rating</li>
                        <li>Monthly experience trends</li>
                        <li>Favorite count</li>
                        <li>User who added this item</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={handleAddFood}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600"
                    >
                      Add Food Item
                    </button>
                    <button
                      onClick={() => {
                        setShowAddFood(false);
                        setNewFoodName('');
                        setFoodPrice('');
                        setFoodCategory('');
                        setFoodDescription('');
                        setImageUrl('');
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                {localMenu.map(food => (
                  <div
                    key={food.id}
                    onClick={() => {
                      setSelectedFood(food);
                      setCurrentView('food');
                    }}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                  >
                    <div className="flex">
                      {food.image && (
                        <img 
                          src={food.image} 
                          alt={food.name}
                          className="w-24 h-24 object-cover"
                        />
                      )}
                      <div className="flex-1 p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800">{food.name}</h4>
                            {food.category && (
                              <p className="text-xs text-gray-500">{food.category}</p>
                            )}
                            <p className="text-lg font-semibold text-green-600 mt-1">{food.price}</p>
                            <div className="flex items-center mt-1">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < Math.floor(food.avgRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                              <span className="ml-2 text-sm text-gray-600">
                                {food.avgRating > 0 ? food.avgRating : 'New'} ({food.reviewCount} experiences)
                              </span>
                            </div>
                          </div>
                          {food.dateAdded && (
                            <span className="text-xs text-orange-500 bg-orange-100 px-2 py-1 rounded-full">
                              Just added
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {localMenu.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No menu items yet.</p>
                  <p className="text-sm mt-2">Add the first item to get started!</p>
                </div>
              )}
            </>
          )}
          
          {activeTab === 'myexperiences' && (
            <div className="text-center py-8 text-gray-500">
              <p>You haven't recorded any experiences here yet.</p>
              <button
                onClick={() => setActiveTab('all')}
                className="mt-3 text-orange-500 text-sm"
              >
                Browse menu items
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Food Detail Screen
  const FoodScreen = () => {
    const [showEditReview, setShowEditReview] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    
    return (
      <div className="flex-1 bg-gray-50">
        <div className="bg-white shadow-sm">
          <div className="p-4">
            <button
              onClick={() => setCurrentView('restaurant')}
              className="text-orange-500 mb-2"
            >
              ← Back
            </button>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800">{selectedFood?.name}</h2>
                <p className="text-gray-600">{selectedRestaurant?.name}</p>
                <p className="text-sm text-gray-500">{selectedRestaurant?.type}</p>
              </div>
              <button
                onClick={() => setIsFavorited(!isFavorited)}
                className={`p-2 rounded-full ${isFavorited ? 'text-red-500' : 'text-gray-400'}`}
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 20 20">
                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-center space-x-4 mt-3">
              <span className="text-2xl font-bold text-green-600">{selectedFood?.price}</span>
              <span className="text-sm text-gray-500">CAD</span>
            </div>
            
            <div className="flex items-center mt-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(selectedFood?.avgRating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="ml-2 font-semibold">{selectedFood?.avgRating}</span>
              <span className="ml-2 text-gray-600">({selectedFood?.reviewCount} experiences)</span>
            </div>
          </div>
          
          <div className="flex space-x-2 px-4 pb-4 overflow-x-auto">
            <img 
              src={selectedFood?.image} 
              alt={selectedFood?.name}
              className="w-24 h-24 object-cover rounded-lg"
            />
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-gray-700 mb-3">Record Your Experience</h3>
            
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-2">Rating</p>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <textarea
              placeholder="Share your experience..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 h-24 resize-none"
            />
            
            <button
              onClick={() => {
                setRating(0);
                setReviewText('');
              }}
              className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Submit Experience
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Profile Screen
  const ProfileScreen = () => {
    return (
      <div className="flex-1 bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">John Doe</h3>
              <p className="text-gray-600">john.doe@email.com</p>
            </div>
          </div>
          <div className="flex justify-around py-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">23</p>
              <p className="text-sm text-gray-600">Experiences</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">4.2</p>
              <p className="text-sm text-gray-600">Avg Rating</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">15</p>
              <p className="text-sm text-gray-600">Public</p>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setIsLoggedIn(false)}
          className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  };

  // Map Screen
  const MapScreen = () => {
    return (
      <div className="flex-1 bg-gray-200 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Map view coming soon</p>
        </div>
      </div>
    );
  };

  // Navigation Bar
  const NavigationBar = () => (
    <div className="bg-white border-t border-gray-200">
      <div className="flex justify-around py-2">
        {[
          { icon: Home, label: 'Home', view: 'home' },
          { icon: Map, label: 'Map', view: 'map' },
          { icon: List, label: 'My Experiences', view: 'experiences' },
          { icon: User, label: 'Profile', view: 'profile' }
        ].map(({ icon: Icon, label, view }) => (
          <button
            key={view}
            onClick={() => setCurrentView(view)}
            className={`flex flex-col items-center p-2 ${
              currentView === view ? 'text-orange-500' : 'text-gray-400'
            }`}
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs mt-1">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // Main App
  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg h-screen flex flex-col">
      {currentView === 'home' && <HomeScreen />}
      {currentView === 'restaurant' && <RestaurantScreen />}
      {currentView === 'food' && <FoodScreen />}
      {currentView === 'map' && <MapScreen />}
      {currentView === 'profile' && <ProfileScreen />}
      {currentView === 'experiences' && (
        <div className="flex-1 bg-gray-50 flex items-center justify-center">
          <p className="text-gray-600">Your experiences will appear here</p>
        </div>
      )}
      <NavigationBar />
    </div>
  );
}