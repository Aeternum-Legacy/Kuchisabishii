'use client';

import React, { useState } from 'react';
import { X, Camera, MapPin, Clock, Star } from 'lucide-react';

interface FoodExperience {
  id: string;
  name: string;
  restaurant: string;
  location: string;
  image: string;
  rating: number;
  lastEaten: string;
  experience: string;
  cost: number;
  versions: ExperienceVersion[];
}

interface ExperienceVersion {
  id: string;
  date: string;
  images: string[];
  location: string;
  mealTime: 'breakfast' | 'brunch' | 'lunch' | 'dinner';
  diningMethod: 'home' | 'dine-in' | 'takeout' | 'delivery';
  cost: number;
  experienceText: string;
  rating: 'never-again' | 'not-as-much' | 'just-as-much' | 'more-often' | 'kuchisabishii';
}

interface EatAgainModalProps {
  food: FoodExperience;
  onClose: () => void;
  onSubmit: (version: ExperienceVersion) => void;
}

const EatAgainModal: React.FC<EatAgainModalProps> = ({ food, onClose, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    location: food.location,
    mealTime: 'lunch' as const,
    diningMethod: 'dine-in' as const,
    cost: food.cost,
    experienceText: '',
    rating: 'just-as-much' as const,
    images: [] as string[]
  });

  const handleSubmit = () => {
    const newVersion: ExperienceVersion = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      images: formData.images,
      location: formData.location,
      mealTime: formData.mealTime,
      diningMethod: formData.diningMethod,
      cost: formData.cost,
      experienceText: formData.experienceText,
      rating: formData.rating
    };
    
    onSubmit(newVersion);
  };

  const ratingOptions = [
    { value: 'never-again', label: 'Never Again', emoji: '😞', color: 'text-red-500' },
    { value: 'not-as-much', label: 'Not as Much', emoji: '😐', color: 'text-orange-500' },
    { value: 'just-as-much', label: 'Just as Much', emoji: '😊', color: 'text-yellow-500' },
    { value: 'more-often', label: 'More Often', emoji: '😍', color: 'text-green-500' },
    { value: 'kuchisabishii', label: 'Kuchisabishii!', emoji: '🤩', color: 'text-purple-500' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Eating {food.name} Again?</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-4 py-2">
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded ${
                  step <= currentStep ? 'bg-orange-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">Step {currentStep} of 4</p>
        </div>

        {/* Content */}
        <div className="p-4">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Where did you have it?</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dining Method</label>
                  <select
                    value={formData.diningMethod}
                    onChange={(e) => setFormData(prev => ({ ...prev, diningMethod: e.target.value as any }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="dine-in">Dine In</option>
                    <option value="takeout">Takeout</option>
                    <option value="delivery">Delivery</option>
                    <option value="home">Home Cooked</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">When and how much?</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meal Time</label>
                  <select
                    value={formData.mealTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, mealTime: e.target.value as any }))}
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
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">How was your experience?</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tell us about it</label>
                  <textarea
                    value={formData.experienceText}
                    onChange={(e) => setFormData(prev => ({ ...prev, experienceText: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows={4}
                    placeholder="Describe your experience..."
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">How does this compare?</h3>
              <p className="text-sm text-gray-600">Compared to your previous experience with {food.name}</p>
              <div className="space-y-2">
                {ratingOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFormData(prev => ({ ...prev, rating: option.value as any }))}
                    className={`w-full flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors ${
                      formData.rating === option.value ? 'border-orange-500 bg-orange-50' : 'border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <div className="flex-1 text-left">
                      <div className={`font-medium ${option.color}`}>{option.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t">
          <button
            onClick={() => currentStep > 1 ? setCurrentStep(prev => prev - 1) : onClose()}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </button>
          <button
            onClick={() => currentStep < 4 ? setCurrentStep(prev => prev + 1) : handleSubmit()}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            {currentStep === 4 ? 'Save Experience' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EatAgainModal;