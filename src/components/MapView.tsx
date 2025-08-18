'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin, Star, Phone, Clock, DollarSign } from 'lucide-react';

interface Shop {
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
}

const mockShops: Shop[] = [
  {
    id: "1",
    name: "Seoul House",
    type: "Restaurant", 
    address: "10220 103 St NW, Edmonton, AB",
    coordinates: { lat: 53.5171, lng: -113.6189 },
    phone: "(780) 424-7665",
    hours: "11:30 AM - 10:00 PM",
    rating: 4.6,
    reviewCount: 324,
    priceRange: "$$",
    specialties: ["Korean BBQ", "Bulgogi", "Bibimbap", "Kimchi"]
  },
  {
    id: "2",
    name: "Tony's Pizza",
    type: "Restaurant",
    address: "8208 104 St NW, Edmonton, AB", 
    coordinates: { lat: 53.5103, lng: -113.5087 },
    phone: "(780) 433-3434",
    hours: "12:00 PM - 11:00 PM",
    rating: 4.3,
    reviewCount: 567,
    priceRange: "$",
    specialties: ["Wood-fired Pizza", "Margherita", "Italian Classics"]
  },
  {
    id: "3",
    name: "Mikado Sushi",
    type: "Restaurant",
    address: "10126 100 St NW, Edmonton, AB",
    coordinates: { lat: 53.5461, lng: -113.4869 },
    phone: "(780) 426-6475", 
    hours: "5:00 PM - 10:00 PM",
    rating: 4.8,
    reviewCount: 892,
    priceRange: "$$$",
    specialties: ["Fresh Sushi", "Sashimi", "Specialty Rolls"]
  },
  {
    id: "4", 
    name: "Bean There Coffee",
    type: "Cafe",
    address: "8525 112 St NW, Edmonton, AB",
    coordinates: { lat: 53.5167, lng: -113.5264 },
    phone: "(780) 439-3912",
    hours: "6:00 AM - 9:00 PM",
    rating: 4.4,
    reviewCount: 201,
    priceRange: "$",
    specialties: ["Specialty Coffee", "Matcha Lattes", "Fresh Pastries"]
  },
  {
    id: "5",
    name: "The Garneau Cafe",
    type: "Cafe", 
    address: "10932 88 Ave NW, Edmonton, AB",
    coordinates: { lat: 53.5189, lng: -113.5143 },
    phone: "(780) 433-6402",
    hours: "7:00 AM - 8:00 PM", 
    rating: 4.5,
    reviewCount: 156,
    priceRange: "$",
    specialties: ["French Pastries", "Coffee", "Croissants", "Light Lunch"]
  }
];

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [showShopDetails, setShowShopDetails] = useState(false);

  useEffect(() => {
    const initMap = async () => {
      // For demo purposes, we'll use a placeholder since we need a real API key
      // In production, you would add your Google Maps API key to environment variables
      
      // Simulated map loading
      // Google Maps initialization (production: remove debug statement)
      
      // Create a simple visual representation instead
      if (mapRef.current) {
        mapRef.current.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        mapRef.current.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white; text-align: center;">
            <div>
              <div style="font-size: 3rem; margin-bottom: 1rem;">🗺️</div>
              <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Interactive Map</h3>
              <p style="font-size: 0.875rem; opacity: 0.8;">Google Maps integration ready</p>
              <p style="font-size: 0.75rem; opacity: 0.6; margin-top: 1rem;">Add GOOGLE_MAPS_API_KEY to enable</p>
            </div>
          </div>
        `;
      }
    };

    initMap();
  }, []);

  const getShopTypeEmoji = (type: string) => {
    switch (type.toLowerCase()) {
      case 'restaurant': return '🍽️';
      case 'cafe': return '☕';
      case 'grocery store': return '🛒';
      case 'convenience store': return '🏪';
      case 'food truck': return '🚚';
      case 'market': return '🏪';
      default: return '🍽️';
    }
  };

  const getPriceRangeDisplay = (range: string) => {
    return range.split('').join(' ');
  };

  return (
    <div className="flex-1 bg-gray-50">
      {/* Map Container */}
      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-64 bg-gray-200 rounded-lg mx-4 mt-4"
        />
        
        {/* Map Controls */}
        <div className="absolute top-6 right-6 bg-white rounded-lg shadow-lg p-2">
          <div className="flex flex-col space-y-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Star className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4">
        <div className="flex space-x-2 overflow-x-auto">
          <button className="flex-shrink-0 px-4 py-2 bg-orange-500 text-white rounded-full text-sm font-medium">
            All
          </button>
          <button className="flex-shrink-0 px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-300">
            Restaurants
          </button>
          <button className="flex-shrink-0 px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-300">
            Cafes
          </button>
          <button className="flex-shrink-0 px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-300">
            Nearby
          </button>
        </div>
      </div>

      {/* Shop List */}
      <div className="px-4 pb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Nearby Food Places</h3>
        <div className="space-y-3">
          {mockShops.map((shop) => (
            <div
              key={shop.id}
              onClick={() => {
                setSelectedShop(shop);
                setShowShopDetails(true);
              }}
              className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{getShopTypeEmoji(shop.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-800">{shop.name}</h4>
                    <span className="text-sm text-gray-500">{getPriceRangeDisplay(shop.priceRange)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(shop.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">{shop.rating}</span>
                    <span className="text-sm text-gray-500">({shop.reviewCount})</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{shop.type} • {shop.address}</p>
                  
                  <div className="flex flex-wrap gap-1">
                    {shop.specialties.slice(0, 3).map((specialty) => (
                      <span
                        key={specialty}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                    {shop.specialties.length > 3 && (
                      <span className="text-xs text-gray-500">+{shop.specialties.length - 3} more</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shop Details Modal */}
      {showShopDetails && selectedShop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{getShopTypeEmoji(selectedShop.type)}</div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{selectedShop.name}</h2>
                    <p className="text-sm text-gray-600">{selectedShop.type}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowShopDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  ✕
                </button>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(selectedShop.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold">{selectedShop.rating}</span>
                <span className="text-gray-500">({selectedShop.reviewCount} reviews)</span>
              </div>

              {/* Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">{selectedShop.address}</span>
                </div>
                
                {selectedShop.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700">{selectedShop.phone}</span>
                  </div>
                )}
                
                {selectedShop.hours && (
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700">{selectedShop.hours}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">Price range: {getPriceRangeDisplay(selectedShop.priceRange)}</span>
                </div>
              </div>

              {/* Specialties */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedShop.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                  View Menu
                </button>
                <button className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                  Get Directions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}