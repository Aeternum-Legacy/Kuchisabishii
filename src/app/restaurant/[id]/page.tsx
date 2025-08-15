'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, MapPin, Star, Phone, Clock, Share2, Heart, Camera, Filter } from 'lucide-react';
import { BottomTabBar } from '@/components/mobile/BottomTabBar';
import { mockShops, transformedFoodReviews } from '@/data/seed-data';
import FoodImage from '@/components/FoodImage';

interface Restaurant {
  id: string;
  name: string;
  type: string;
  address: string;
  coordinates: { lat: number; lng: number };
  phone?: string;
  hours?: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  specialties: string[];
  image?: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  kuchisabishiRatings: number;
  averageRating: number;
  reviews: Array<{
    id: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
    image?: string;
  }>;
}

export default function RestaurantPage() {
  const router = useRouter();
  const params = useParams();
  const [activeTab, setActiveTab] = useState('search');
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeSection, setActiveSection] = useState<'overview' | 'menu' | 'reviews'>('overview');
  const [isFavorited, setIsFavorited] = useState(false);
  const [filterRating, setFilterRating] = useState<'all' | '5' | '4+' | '3+'>('all');

  // Navigation tabs configuration
  const navigationTabs = [
    { id: 'home', label: 'Home', icon: '🏠', badge: 0, route: '/app' },
    { id: 'search', label: 'Search', icon: '🔍', badge: 0, route: '/search' },
    { id: 'add', label: 'Add', icon: '➕', badge: 0, highlight: true, route: '/add-food' },
    { id: 'social', label: 'Social', icon: '👥', badge: 3, route: '/social' },
    { id: 'profile', label: 'Profile', icon: '👤', badge: 0, route: '/profile' }
  ];

  // Handle navigation
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
        router.push('/profile');
        break;
    }
  };

  useEffect(() => {
    // Load restaurant data
    const foundRestaurant = mockShops.find(shop => shop.id === params.id) as Restaurant;
    if (foundRestaurant) {
      setRestaurant(foundRestaurant);
      
      // Generate menu items based on the restaurant's specialties and food reviews
      const restaurantFoodReviews = transformedFoodReviews.filter(
        food => food.location === foundRestaurant.name
      );

      const generatedMenuItems: MenuItem[] = foundRestaurant.specialties.map((specialty, index) => {
        const relatedReviews = restaurantFoodReviews.filter(
          review => review.name.toLowerCase().includes(specialty.toLowerCase())
        );

        const kuchisabishiRatings = relatedReviews.length;
        const averageRating = relatedReviews.length > 0 
          ? relatedReviews.reduce((sum, review) => sum + review.kuchisabishiRating, 0) / relatedReviews.length
          : 4.2 + Math.random() * 0.8; // Random rating between 4.2-5.0

        return {
          id: `menu-${foundRestaurant.id}-${index}`,
          name: specialty,
          description: `Authentic ${specialty.toLowerCase()} prepared with traditional recipes and fresh ingredients`,
          price: 12 + Math.random() * 20, // Random price between $12-32
          category: index < 2 ? 'Main Dishes' : index < 4 ? 'Appetizers' : 'Specialties',
          image: relatedReviews[0]?.image,
          kuchisabishiRatings,
          averageRating,
          reviews: relatedReviews.map(review => ({
            id: review.id,
            userName: 'Demo User',
            rating: review.kuchisabishiRating,
            comment: review.experience,
            date: review.dateEaten,
            image: review.image
          }))
        };
      });

      setMenuItems(generatedMenuItems);
    }
  }, [params.id]);

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const filteredMenuItems = menuItems.filter(item => {
    if (filterRating === 'all') return true;
    if (filterRating === '5') return item.averageRating >= 5;
    if (filterRating === '4+') return item.averageRating >= 4;
    if (filterRating === '3+') return item.averageRating >= 3;
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header with Restaurant Image */}
      <div className="relative">
        {/* Hero Image */}
        <div className="h-64 bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
          {restaurant.image && (
            <Image
              src={restaurant.image}
              alt={restaurant.name}
              fill
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-40" />
          
          {/* Header Controls */}
          <div className="absolute top-0 left-0 right-0 pt-12 px-4 z-10">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => router.back()}
                className="w-10 h-10 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:bg-opacity-30 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsFavorited(!isFavorited)}
                  className="w-10 h-10 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:bg-opacity-30 transition-colors"
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'text-red-500 fill-current' : 'text-white'}`} />
                </button>
                <button className="w-10 h-10 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:bg-opacity-30 transition-colors">
                  <Share2 className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Restaurant Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                <span className="font-semibold">{restaurant.rating}</span>
                <span className="ml-1 opacity-80">({restaurant.reviewCount} reviews)</span>
              </div>
              <span className="opacity-80">{restaurant.priceRange}</span>
              <span className="opacity-80">{restaurant.type}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="flex">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'menu', label: 'Menu', badge: menuItems.length },
            { key: 'reviews', label: 'Reviews', badge: restaurant.reviewCount }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveSection(tab.key as any)}
              className={`flex-1 px-4 py-3 text-center font-medium transition-colors border-b-2 ${
                activeSection === tab.key
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              {tab.badge && (
                <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-20">
        {activeSection === 'overview' && (
          <div className="p-4 space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Contact & Hours</h2>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-3" />
                  <span>{restaurant.address}</span>
                </div>
                {restaurant.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-5 h-5 mr-3" />
                    <span>{restaurant.phone}</span>
                  </div>
                )}
                {restaurant.hours && (
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-5 h-5 mr-3" />
                    <span>{restaurant.hours}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Specialties */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Specialties</h2>
              <div className="flex flex-wrap gap-2">
                {restaurant.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="px-3 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Restaurant Stats</h2>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-orange-600">{menuItems.length}</div>
                  <div className="text-sm text-gray-600">Menu Items</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {menuItems.reduce((sum, item) => sum + item.kuchisabishiRatings, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Kuchisabishii Reviews</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'menu' && (
          <div className="p-4">
            {/* Filter Bar */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Menu Items ({filteredMenuItems.length})
              </h2>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value as any)}
                  className="text-sm border rounded-lg px-3 py-1 bg-white"
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4+">4+ Stars</option>
                  <option value="3+">3+ Stars</option>
                </select>
              </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-4">
              {filteredMenuItems.map((item) => (
                <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex space-x-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <FoodImage
                        imageUrl={item.image}
                        foodName={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <span className="text-orange-600 font-semibold">${item.price.toFixed(2)}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                            <span className="font-medium">{item.averageRating.toFixed(1)}</span>
                          </div>
                          <span className="text-gray-500">
                            {item.kuchisabishiRatings} Kuchisabishii review{item.kuchisabishiRatings !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'reviews' && (
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">
              Food Reviews ({menuItems.reduce((sum, item) => sum + item.reviews.length, 0)})
            </h2>
            <div className="space-y-4">
              {menuItems.map((item) =>
                item.reviews.map((review) => (
                  <div key={`${item.id}-${review.id}`} className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-start space-x-3 mb-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 font-semibold text-sm">
                          {review.userName.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-900">{review.userName}</h4>
                          <span className="text-sm text-gray-500">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center mb-2">
                          <div className="flex mr-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-orange-600">{item.name}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3">{review.comment}</p>
                    {review.image && (
                      <div className="w-32 h-24 bg-gray-200 rounded-lg overflow-hidden">
                        <FoodImage
                          imageUrl={review.image}
                          foodName={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
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