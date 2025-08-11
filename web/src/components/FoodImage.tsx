'use client';

import React, { useState } from 'react';

interface FoodImageProps {
  src?: string;
  alt: string;
  fallbackEmoji?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  rounded?: boolean;
}

const FoodImage: React.FC<FoodImageProps> = ({ 
  src, 
  alt, 
  fallbackEmoji = '🍽️', 
  className = '',
  size = 'md',
  rounded = true
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16', 
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  const roundedClass = rounded ? 'rounded-xl' : '';
  
  const baseClasses = `${sizeClasses[size]} ${roundedClass} object-cover bg-gray-800 ${className}`;

  // If no src provided or image failed to load, show emoji fallback
  if (!src || imageError) {
    return (
      <div className={`${baseClasses} flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700`}>
        <span className="text-2xl" role="img" aria-label={alt}>
          {fallbackEmoji}
        </span>
      </div>
    );
  }

  return (
    <div className={`${baseClasses} relative overflow-hidden`}>
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 animate-pulse">
          <div className="w-4 h-4 bg-gray-600 rounded-full animate-bounce"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${baseClasses} transition-opacity duration-300 ${
          imageLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
        loading="lazy"
      />
    </div>
  );
};

export default FoodImage;