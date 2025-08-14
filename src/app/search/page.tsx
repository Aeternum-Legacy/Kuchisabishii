'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Filter, MapPin, Star, Clock } from 'lucide-react';

export default function SearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'food' | 'restaurant' | 'user'>('food');

  return (
    <div className="min-h-screen bg-gray-50">
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
        </div>
      </div>

      {/* Search Results */}
      <div className="p-4">
        {searchQuery ? (
          <div className="space-y-4">
            {/* Placeholder results */}
            <p className="text-gray-500 text-center py-8">
              Search results for "{searchQuery}" will appear here
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
                {[
                  { name: 'The Local Kitchen', type: 'American', rating: 4.5, distance: '0.5 mi' },
                  { name: 'Sushi Master', type: 'Japanese', rating: 4.8, distance: '0.8 mi' },
                  { name: 'Pasta Paradise', type: 'Italian', rating: 4.3, distance: '1.2 mi' }
                ].map((place) => (
                  <div key={place.name} className="bg-white p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{place.name}</h3>
                        <p className="text-sm text-gray-500">{place.type}</p>
                        <div className="flex items-center mt-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm ml-1">{place.rating}</span>
                          <span className="text-gray-400 mx-2">•</span>
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500 ml-1">{place.distance}</span>
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
    </div>
  );
}