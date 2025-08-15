'use client';

import React, { useState } from 'react';
import { ArrowLeft, Camera, Star, MapPin, Clock, DollarSign } from 'lucide-react';

interface EnhancedFoodReviewScreenProps {
  onBack: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
}

const EnhancedFoodReviewScreen: React.FC<EnhancedFoodReviewScreenProps> = ({ onBack, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    restaurant: '',
    location: '',
    rating: 5,
    description: '',
    cost: 0,
    mealTime: 'lunch',
    cuisineType: '',
    images: [] as string[]
  });

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">Add Food Review</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
          {/* Food Photo */}
          <div className="text-center">
            <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto flex items-center justify-center mb-4">
              <Camera className="w-8 h-8 text-gray-400" />
            </div>
            <button className="text-orange-500 font-medium">Add Photo</button>
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Food Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="What did you eat?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant</label>
              <input
                type="text"
                value={formData.restaurant}
                onChange={(e) => setFormData(prev => ({ ...prev, restaurant: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Where did you eat it?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="City, State"
              />
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                  className="transition-colors"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= formData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meal Time</label>
              <select
                value={formData.mealTime}
                onChange={(e) => setFormData(prev => ({ ...prev, mealTime: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="breakfast">Breakfast</option>
                <option value="brunch">Brunch</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost ($)</label>
              <input
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={4}
              placeholder="Tell us about your experience..."
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            Save Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedFoodReviewScreen;