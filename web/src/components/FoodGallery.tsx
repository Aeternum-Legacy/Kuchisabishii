'use client';

import React, { useState } from 'react';
import FoodImage from './FoodImage';
import { getFoodEmoji } from '../utils/foodEmojis';

interface FoodGalleryProps {
  images: string[];
  foodName: string;
  cuisineType: string;
  foodType: string;
  maxDisplay?: number;
}

const FoodGallery: React.FC<FoodGalleryProps> = ({ 
  images, 
  foodName, 
  cuisineType, 
  foodType, 
  maxDisplay = 4 
}) => {
  const [showAll, setShowAll] = useState(false);
  
  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-32 bg-gray-800 rounded-xl border border-gray-700">
        <span className="text-4xl" role="img" aria-label={foodName}>
          {getFoodEmoji(foodName, cuisineType, foodType)}
        </span>
      </div>
    );
  }

  const displayedImages = showAll ? images : images.slice(0, maxDisplay);
  const remainingCount = images.length - maxDisplay;

  if (images.length === 1) {
    return (
      <FoodImage 
        src={images[0]} 
        alt={foodName}
        fallbackEmoji={getFoodEmoji(foodName, cuisineType, foodType)}
        size="xl"
        className="w-full h-48 object-cover"
      />
    );
  }

  return (
    <div className="space-y-2">
      <div className={`grid gap-2 ${
        images.length === 2 ? 'grid-cols-2' : 
        images.length === 3 ? 'grid-cols-3' : 
        'grid-cols-2'
      }`}>
        {displayedImages.map((image, index) => (
          <div key={index} className="relative">
            <FoodImage 
              src={image} 
              alt={`${foodName} - Image ${index + 1}`}
              fallbackEmoji={getFoodEmoji(foodName, cuisineType, foodType)}
              size="lg"
              className="w-full h-24 object-cover"
            />
            
            {/* Show count overlay for last image if more exist */}
            {!showAll && index === maxDisplay - 1 && remainingCount > 0 && (
              <div 
                className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-xl cursor-pointer"
                onClick={() => setShowAll(true)}
              >
                <span className="text-white font-bold text-lg">+{remainingCount}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {showAll && images.length > maxDisplay && (
        <button 
          onClick={() => setShowAll(false)}
          className="text-sm text-pink-400 hover:text-pink-300 transition-colors"
        >
          Show Less
        </button>
      )}
    </div>
  );
};

export default FoodGallery;