'use client';

import React, { useState } from 'react';
import { FoodCardProps } from '@/types/mobile';
import { useHapticFeedback } from '@/hooks/useMobileInteractions';
import { mobileTheme } from '@/styles/mobile-theme';

export const FoodCard: React.FC<FoodCardProps> = ({
  id,
  title,
  restaurant,
  image,
  rating,
  price,
  likes,
  comments,
  shares,
  isLiked,
  author,
  createdAt,
  onLike,
  onComment,
  onShare,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { triggerHaptic } = useHapticFeedback();

  const handleLike = () => {
    triggerHaptic(isLiked ? 'light' : 'success');
    onLike();
  };

  const handleComment = () => {
    triggerHaptic('light');
    onComment();
  };

  const handleShare = () => {
    triggerHaptic('medium');
    onShare();
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="text-yellow-400">★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="text-yellow-400">☆</span>);
      } else {
        stars.push(<span key={i} className="text-gray-300">☆</span>);
      }
    }
    
    return stars;
  };

  return (
    <div
      className={`
        bg-white rounded-xl shadow-md overflow-hidden mb-4 mx-4 transition-all duration-200
        ${isPressed ? 'scale-[0.98] shadow-lg' : 'scale-100'}
      `}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      style={{ touchAction: 'manipulation' }} // Optimize touch performance
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      {/* Header */}
      <div className="flex items-center p-4 pb-2">
        <img
          src={author.avatar}
          alt={author.name}
          className="w-10 h-10 rounded-full mr-3 border-2 border-orange-200"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/api/placeholder/40/40';
          }}
        />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800" style={mobileTheme.typography.body1}>
            {author.name}
          </h3>
          <p className="text-gray-500 text-sm" style={mobileTheme.typography.caption}>
            {createdAt}
          </p>
        </div>
      </div>

      {/* Food Image */}
      <div className="relative bg-gray-100" style={{ aspectRatio: '16/9' }}>
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <img
          src={image}
          alt={title}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/api/placeholder/400/225';
            setImageLoaded(true);
          }}
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        
        {/* Price Tag */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
          <span className="text-sm font-semibold text-gray-800">{price}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title and Restaurant */}
        <h2 className="font-bold text-lg text-gray-800 mb-1" style={mobileTheme.typography.h4}>
          {title}
        </h2>
        <p className="text-gray-600 mb-2" style={mobileTheme.typography.body2}>
          📍 {restaurant}
        </p>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center mr-2">
            {renderStars(rating)}
          </div>
          <span className="text-sm font-medium text-gray-700">
            {rating.toFixed(1)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <button
            onClick={handleLike}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 active:scale-95
              ${isLiked 
                ? 'bg-red-50 text-red-500' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }
            `}
            style={{ minHeight: mobileTheme.touchTarget.minHeight }}
          >
            <span className={`text-lg transition-transform duration-200 ${isLiked ? 'animate-pulse' : ''}`}>
              {isLiked ? '❤️' : '🤍'}
            </span>
            <span className="font-medium text-sm">
              {formatNumber(likes)}
            </span>
          </button>

          <button
            onClick={handleComment}
            className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all duration-200 active:scale-95"
            style={{ minHeight: mobileTheme.touchTarget.minHeight }}
          >
            <span className="text-lg">💬</span>
            <span className="font-medium text-sm">
              {formatNumber(comments)}
            </span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all duration-200 active:scale-95"
            style={{ minHeight: mobileTheme.touchTarget.minHeight }}
          >
            <span className="text-lg">📤</span>
            <span className="font-medium text-sm">
              {formatNumber(shares)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Example usage data
export const sampleFoodCards: FoodCardProps[] = [
  {
    id: '1',
    title: 'Spicy Ramen Bowl',
    restaurant: 'Noodle House Downtown',
    image: '/api/placeholder/400/225',
    rating: 4.5,
    price: '$12.99',
    likes: 127,
    comments: 23,
    shares: 5,
    isLiked: false,
    author: {
      name: 'Sarah Chen',
      avatar: '/api/placeholder/40/40',
    },
    createdAt: '2 hours ago',
    onLike: () => {}, // Production: Remove console logs
    onComment: () => {}, // Production: Remove console logs
    onShare: () => {}, // Production: Remove console logs
  },
  {
    id: '2',
    title: 'Truffle Burger',
    restaurant: 'Gourmet Burger Co.',
    image: '/api/placeholder/400/225',
    rating: 4.8,
    price: '$18.50',
    likes: 89,
    comments: 12,
    shares: 3,
    isLiked: true,
    author: {
      name: 'Mike Johnson',
      avatar: '/api/placeholder/40/40',
    },
    createdAt: '4 hours ago',
    onLike: () => {}, // Production: Remove console logs
    onComment: () => {}, // Production: Remove console logs
    onShare: () => {}, // Production: Remove console logs
  },
];