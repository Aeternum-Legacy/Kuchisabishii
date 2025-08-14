'use client';

import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, Users, Clock, Heart, Info } from 'lucide-react';
import FoodImage from '@/components/FoodImage';
import { recommendedFoods } from '@/data/seed-data';

interface RecommendedFood {
  id: string;
  name: string;
  restaurantName?: string;
  restaurant?: string;
  cuisineType: string;
  image: string;
  aiConfidence: number;
  reasoning: string[];
  estimatedRating: number;
  recommendation_type: 'ai_match' | 'trending' | 'social';
  matchScore?: number;
  price?: string;
}

export default function RecommendationsList() {
  const [recommendations, setRecommendations] = useState<RecommendedFood[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'ai_match' | 'trending' | 'social'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading recommendations
    const loadRecommendations = async () => {
      setLoading(true);
      // In a real app, this would fetch from an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRecommendations(recommendedFoods as RecommendedFood[]);
      setLoading(false);
    };

    loadRecommendations();
  }, []);

  const filteredRecommendations = selectedCategory === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.recommendation_type === selectedCategory);

  const categories = [
    { id: 'all', label: 'All', icon: '🍽️' },
    { id: 'ai_match', label: 'AI Match', icon: '🤖' },
    { id: 'trending', label: 'Trending', icon: '📈' },
    { id: 'social', label: 'Friends', icon: '👥' }
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
            <div className="flex space-x-4">
              <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
              selectedCategory === category.id
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>{category.icon}</span>
            <span className="font-medium">{category.label}</span>
          </button>
        ))}
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecommendations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recommendations</h3>
            <p className="text-gray-600">
              {selectedCategory === 'all' 
                ? 'We\'re learning your taste preferences. Keep reviewing foods to get better recommendations!'
                : `No ${categories.find(c => c.id === selectedCategory)?.label.toLowerCase()} recommendations available.`
              }
            </p>
          </div>
        ) : (
          filteredRecommendations.map((food) => (
            <div key={food.id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex space-x-4">
                {/* Food Image */}
                <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  <FoodImage 
                    foodName={food.name}
                    imageUrl={food.image}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Food Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{food.name}</h3>
                      <p className="text-sm text-gray-600">
                        {food.restaurantName || food.restaurant}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{food.cuisineType}</p>
                    </div>
                    
                    {/* Recommendation Badge */}
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      food.recommendation_type === 'ai_match' 
                        ? 'bg-purple-100 text-purple-700'
                        : food.recommendation_type === 'trending'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {food.recommendation_type === 'ai_match' && '🤖 AI Match'}
                      {food.recommendation_type === 'trending' && '📈 Trending'}
                      {food.recommendation_type === 'social' && '👥 Friend'}
                    </div>
                  </div>

                  {/* AI Confidence & Rating */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* AI Confidence */}
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium text-purple-600">
                          {food.aiConfidence || food.matchScore || 90}% match
                        </span>
                      </div>

                      {/* Estimated Rating */}
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">
                          {food.estimatedRating}/5 predicted
                        </span>
                      </div>
                    </div>

                    {/* Price if available */}
                    {food.price && (
                      <span className="text-sm font-medium text-green-600">{food.price}</span>
                    )}
                  </div>

                  {/* AI Reasoning */}
                  {food.reasoning && food.reasoning.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center space-x-1 mb-2">
                        <Info className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-500 font-medium">Why we recommend this:</span>
                      </div>
                      <div className="space-y-1">
                        {food.reasoning.slice(0, 2).map((reason, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                            <span className="text-xs text-gray-600">{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-4 flex space-x-2">
                    <button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-colors">
                      Add to Wishlist
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More Button */}
      {filteredRecommendations.length > 0 && (
        <div className="text-center pt-4">
          <button className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
            Load More Recommendations
          </button>
        </div>
      )}
    </div>
  );
}