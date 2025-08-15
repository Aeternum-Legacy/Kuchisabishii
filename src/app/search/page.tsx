'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Filter, MapPin, Star, Clock, Phone } from 'lucide-react';
import { Loader } from '@googlemaps/js-api-loader';
import { BottomTabBar } from '@/components/mobile/BottomTabBar';
import { mockShops } from '@/data/seed-data';

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

export default function SearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'food' | 'restaurant' | 'user'>('restaurant');
  const [activeTab, setActiveTab] = useState('search');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [restaurants] = useState<Restaurant[]>(mockShops as Restaurant[]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(mockShops as Restaurant[]);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list');

  // Navigation tabs configuration
  const navigationTabs = [
    { id: 'home', label: 'Home', icon: '🏠', badge: 0 },
    { id: 'search', label: 'Search', icon: '🔍', badge: 0 },
    { id: 'add', label: 'Add', icon: '➕', badge: 0, highlight: true },
    { id: 'social', label: 'Social', icon: '👥', badge: 3 },
    { id: 'profile', label: 'Profile', icon: '👤', badge: 0 }
  ];

  // Handle navigation
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    
    switch (tabId) {
      case 'home':
        router.push('/app');
        break;
      case 'search':
        // Stay on current page
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

  // Initialize Google Maps
  useEffect(() => {
    if (searchType === 'restaurant' && viewMode === 'map') {
      const initMap = async () => {
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
          version: 'weekly',
          libraries: ['places']
        });

        try {
          await loader.load();
          setMapLoaded(true);

          const mapOptions: google.maps.MapOptions = {
            center: { lat: 53.5461, lng: -113.4937 }, // Edmonton, AB
            zoom: 12,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          };

          const mapElement = document.getElementById('map');
          if (mapElement) {
            const googleMap = new google.maps.Map(mapElement, mapOptions);
            setMap(googleMap);
            
            // Add markers for restaurants
            filteredRestaurants.forEach((restaurant) => {
              const marker = new google.maps.Marker({
                position: restaurant.coordinates,
                map: googleMap,
                title: restaurant.name,
                icon: {
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="16" cy="16" r="12" fill="#f97316" stroke="white" stroke-width="2"/>
                      <text x="16" y="20" text-anchor="middle" fill="white" font-size="16">🍽️</text>
                    </svg>
                  `),
                  scaledSize: new google.maps.Size(32, 32),
                  anchor: new google.maps.Point(16, 16)
                }
              });

              marker.addListener('click', () => {
                setSelectedRestaurant(restaurant);
                googleMap.panTo(restaurant.coordinates);
                googleMap.setZoom(15);
              });
            });
          }
        } catch (error) {
          console.error('Error loading Google Maps:', error);
        }
      };

      initMap();
    }
  }, [searchType, viewMode, filteredRestaurants]);

  // Filter restaurants based on search
  useEffect(() => {
    let filtered = restaurants;

    if (searchQuery && searchType === 'restaurant') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(restaurant =>
        restaurant.name.toLowerCase().includes(query) ||
        restaurant.type.toLowerCase().includes(query) ||
        restaurant.specialties.some(specialty => specialty.toLowerCase().includes(query)) ||
        restaurant.address.toLowerCase().includes(query)
      );
    }

    setFilteredRestaurants(filtered);
  }, [searchQuery, searchType, restaurants]);

  const handleRestaurantClick = (restaurant: Restaurant) => {
    router.push(`/restaurant/${restaurant.id}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="p-4">
          <div className="flex items-center mb-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            
            <div className="flex-1 ml-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for food, restaurants, or users..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            <button className="ml-3 p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Filter className="w-6 h-6" />
            </button>
          </div>

          {/* Search Type Tabs */}
          <div className="flex space-x-4">
            {(['food', 'restaurant', 'user'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSearchType(type)}
                className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                  searchType === type
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type === 'user' ? 'People' : type}
              </button>
            ))}
          </div>
          
          {/* View Toggle for restaurants */}
          {searchType === 'restaurant' && (
            <div className="flex bg-gray-100 rounded-lg p-1 mt-3 w-fit">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${ 
                  viewMode === 'list' 
                    ? 'bg-orange-500 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${ 
                  viewMode === 'map' 
                    ? 'bg-orange-500 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Map
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 pb-20">
        {searchType === 'restaurant' ? (
          viewMode === 'map' ? (
            <div className="h-full">
              {/* Map Container */}
              <div id="map" className="w-full h-96">
                {!mapLoaded && (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                      <p className="text-gray-600">Loading map...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Restaurant List Below Map */}
              <div className="p-4 bg-white">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  {filteredRestaurants.length} restaurants found
                </h2>
                <div className="space-y-4">
                  {filteredRestaurants.slice(0, 5).map((restaurant) => (
                    <div
                      key={restaurant.id}
                      onClick={() => handleRestaurantClick(restaurant)}
                      className={`p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md ${
                        selectedRestaurant?.id === restaurant.id 
                          ? 'border-orange-500 bg-orange-50' 
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
                          <p className="text-sm text-gray-600">{restaurant.type}</p>
                          <div className="flex items-center mt-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">
                              {restaurant.rating} ({restaurant.reviewCount} reviews)
                            </span>
                            <span className="text-sm text-gray-500 ml-2">{restaurant.priceRange}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {restaurant.address}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/restaurant/${restaurant.id}`);
                          }}
                          className="px-3 py-1 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          View
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {restaurant.specialties.slice(0, 3).map((specialty, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {filteredRestaurants.length} restaurants found
              </h2>
              <div className="space-y-4">
                {filteredRestaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    onClick={() => handleRestaurantClick(restaurant)}
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{restaurant.name}</h3>
                        <p className="text-gray-600">{restaurant.type}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="font-semibold text-gray-900 ml-1">{restaurant.rating}</span>
                        </div>
                        <p className="text-sm text-gray-500">({restaurant.reviewCount} reviews)</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {restaurant.address}
                      </div>
                      {restaurant.phone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2" />
                          {restaurant.phone}
                        </div>
                      )}
                      {restaurant.hours && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          {restaurant.hours}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {restaurant.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <span className="text-lg font-semibold text-orange-600">
                        {restaurant.priceRange}
                      </span>
                      <span className="text-sm text-gray-500">
                        Click to view details
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ) : (
          <div className="p-4">
            {searchQuery ? (
              <div className="space-y-4">
                <p className="text-gray-500 text-center py-8">
                  Search results for &ldquo;{searchQuery}&rdquo; will appear here
                </p>
              </div>
            ) : (
              <div>
                {/* Recent Searches */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-3">Recent Searches</h2>
                  <div className="space-y-2">
                    {['Sushi', 'Pizza', 'Thai Food', 'Coffee'].map((item) => (
                      <button
                        key={item}
                        onClick={() => setSearchQuery(item)}
                        className="flex items-center space-x-3 w-full p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{item}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Popular Near You */}
                <div>
                  <h2 className="text-lg font-semibold mb-3">Popular Near You</h2>
                  <div className="space-y-3">
                    {filteredRestaurants.slice(0, 3).map((restaurant) => (
                      <div 
                        key={restaurant.id} 
                        onClick={() => handleRestaurantClick(restaurant)}
                        className="bg-white p-4 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{restaurant.name}</h3>
                            <p className="text-sm text-gray-500">{restaurant.type}</p>
                            <div className="flex items-center mt-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm ml-1">{restaurant.rating}</span>
                              <span className="text-gray-400 mx-2">•</span>
                              <span className="text-sm text-gray-500">{restaurant.priceRange}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
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