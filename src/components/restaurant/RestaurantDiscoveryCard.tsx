'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Star,
  Clock,
  Phone,
  Globe,
  Bookmark,
  Share2,
  Navigation,
  DollarSign,
  Users,
  Car,
  Wifi,
  Coffee,
  CreditCard,
  Utensils,
  Heart,
  Award,
  TrendingUp,
  Camera
} from 'lucide-react';

export interface RestaurantDiscoveryCardProps {
  id: string;
  name: string;
  cuisine: string[];
  description?: string;
  image: string;
  images?: string[];
  rating: number;
  reviewCount: number;
  priceLevel: number; // 1-4 ($, $$, $$$, $$$$)
  location: {
    address: string;
    city: string;
    distance: number; // in miles/km
  };
  hours: {
    isOpen: boolean;
    opensAt?: string;
    closesAt?: string;
    openStatus: 'open' | 'closed' | 'closing_soon' | 'opening_soon';
  };
  contact: {
    phone?: string;
    website?: string;
  };
  features: {
    delivery: boolean;
    takeout: boolean;
    dineIn: boolean;
    parking: boolean;
    wifi: boolean;
    cardAccepted: boolean;
    reservations: boolean;
    kidFriendly: boolean;
    petFriendly: boolean;
    accessible: boolean;
  };
  popularDishes?: string[];
  trending?: boolean;
  newRestaurant?: boolean;
  isBookmarked: boolean;
  friendsVisited?: {
    count: number;
    avatars: string[];
  };
  onBookmark: () => void;
  onShare: () => void;
  onGetDirections: () => void;
  onViewMenu: () => void;
  onViewDetails: () => void;
  onCall?: () => void;
}

export const RestaurantDiscoveryCard: React.FC<RestaurantDiscoveryCardProps> = ({
  id,
  name,
  cuisine,
  description,
  image,
  images = [],
  rating,
  reviewCount,
  priceLevel,
  location,
  hours,
  contact,
  features,
  popularDishes = [],
  trending = false,
  newRestaurant = false,
  isBookmarked,
  friendsVisited,
  onBookmark,
  onShare,
  onGetDirections,
  onViewMenu,
  onViewDetails,
  onCall,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPressed, setIsPressed] = useState(false);

  const allImages = [image, ...images];

  const getPriceDisplay = useCallback((level: number): string => {
    return '$'.repeat(Math.max(1, Math.min(4, level)));
  }, []);

  const getStatusColor = useCallback((status: string): string => {
    switch (status) {
      case 'open': return 'var(--food-success)';
      case 'closed': return 'var(--food-error)';
      case 'closing_soon': return 'var(--food-warning)';
      case 'opening_soon': return 'var(--food-secondary)';
      default: return 'var(--food-neutral-400)';
    }
  }, []);

  const getStatusText = useCallback((status: string, opensAt?: string, closesAt?: string): string => {
    switch (status) {
      case 'open': return closesAt ? `Open until ${closesAt}` : 'Open now';
      case 'closed': return opensAt ? `Opens at ${opensAt}` : 'Closed';
      case 'closing_soon': return 'Closing soon';
      case 'opening_soon': return opensAt ? `Opens at ${opensAt}` : 'Opening soon';
      default: return 'Hours unknown';
    }
  }, []);

  const renderStars = useCallback((rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-4 h-4 fill-current text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative w-4 h-4">
            <Star className="w-4 h-4 text-gray-300" />
            <Star 
              className="w-4 h-4 fill-current text-yellow-400 absolute top-0 left-0"
              style={{ clipPath: 'inset(0 50% 0 0)' }}
            />
          </div>
        );
      } else {
        stars.push(
          <Star key={i} className="w-4 h-4 text-gray-300" />
        );
      }
    }
    
    return stars;
  }, []);

  const handleImageNavigation = useCallback((direction: 'prev' | 'next') => {
    if (allImages.length <= 1) return;
    
    setCurrentImageIndex(prev => {
      if (direction === 'next') {
        return (prev + 1) % allImages.length;
      } else {
        return prev === 0 ? allImages.length - 1 : prev - 1;
      }
    });
  }, [allImages.length]);

  const handleBookmark = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onBookmark();
  }, [onBookmark]);

  const handleShare = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onShare();
  }, [onShare]);

  const handleGetDirections = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onGetDirections();
  }, [onGetDirections]);

  const handleCall = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCall) onCall();
  }, [onCall]);

  return (
    <motion.article
      className={`restaurant-card cursor-pointer ${isPressed ? 'scale-[0.98]' : ''}`}
      onClick={onViewDetails}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onViewDetails();
        }
      }}
    >
      {/* Image Section with Navigation */}
      <div className="relative bg-gray-100 aspect-[16/10] overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="loading-spinner" />
          </div>
        )}
        
        <img
          src={allImages[currentImageIndex]}
          alt={`${name} restaurant`}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/api/placeholder/400/250';
            setImageLoaded(true);
          }}
          loading="lazy"
        />
        
        {/* Image Navigation */}
        {allImages.length > 1 && (
          <>
            <button
              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleImageNavigation('prev');
              }}
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleImageNavigation('next');
              }}
              aria-label="Next image"
            >
              ›
            </button>
            
            {/* Image Indicators */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {trending && (
            <div className="flex items-center gap-1 px-2 py-1 bg-orange-500 text-white text-xs font-medium rounded-full">
              <TrendingUp className="w-3 h-3" />
              Trending
            </div>
          )}
          {newRestaurant && (
            <div className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
              New
            </div>
          )}
        </div>
        
        {/* Bookmark and Share */}
        <div className="absolute top-3 right-3 flex gap-2">
          <motion.button
            className={`p-2 rounded-full shadow-lg transition-colors ${
              isBookmarked 
                ? 'bg-orange-500 text-white' 
                : 'bg-white/95 backdrop-blur-sm text-gray-600 hover:text-orange-500'
            }`}
            onClick={handleBookmark}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </motion.button>
          <motion.button
            className="p-2 bg-white/95 backdrop-blur-sm text-gray-600 hover:text-gray-800 rounded-full shadow-lg transition-colors"
            onClick={handleShare}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Share restaurant"
          >
            <Share2 className="w-4 h-4" />
          </motion.button>
        </div>
        
        {/* Price Level */}
        <div className="absolute bottom-3 right-3 px-2 py-1 bg-white/95 backdrop-blur-sm rounded-full">
          <span className="text-sm font-semibold text-gray-800">
            {getPriceDisplay(priceLevel)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="mb-3">
          <div className="flex items-start justify-between mb-2">
            <h2 className="text-heading-3 font-bold text-gray-800 line-clamp-2 flex-1 pr-2">
              {name}
            </h2>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-current text-yellow-400" />
              <span className="text-sm font-semibold text-gray-700">
                {rating.toFixed(1)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <span>{cuisine.join(' • ')}</span>
            <span className="text-gray-400">•</span>
            <span>{location.distance.toFixed(1)} miles</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getStatusColor(hours.openStatus) }}
            />
            <span 
              className="font-medium"
              style={{ color: getStatusColor(hours.openStatus) }}
            >
              {getStatusText(hours.openStatus, hours.opensAt, hours.closesAt)}
            </span>
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className="text-body-small text-gray-600 mb-3 line-clamp-2">
            {description}
          </p>
        )}

        {/* Popular Dishes */}
        {popularDishes.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-500 mb-1">Popular dishes:</p>
            <div className="flex flex-wrap gap-1">
              {popularDishes.slice(0, 3).map((dish, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded-full"
                >
                  {dish}
                </span>
              ))}
              {popularDishes.length > 3 && (
                <span className="text-xs text-gray-500 self-center">
                  +{popularDishes.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-4">
          {features.delivery && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Utensils className="w-3 h-3" />
              <span>Delivery</span>
            </div>
          )}
          {features.takeout && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Coffee className="w-3 h-3" />
              <span>Takeout</span>
            </div>
          )}
          {features.parking && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Car className="w-3 h-3" />
              <span>Parking</span>
            </div>
          )}
          {features.wifi && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Wifi className="w-3 h-3" />
              <span>WiFi</span>
            </div>
          )}
        </div>

        {/* Friends Visited */}
        {friendsVisited && friendsVisited.count > 0 && (
          <div className="flex items-center gap-2 mb-4 p-2 bg-blue-50 rounded-lg">
            <div className="flex -space-x-1">
              {friendsVisited.avatars.slice(0, 3).map((avatar, index) => (
                <img
                  key={index}
                  src={avatar}
                  alt=""
                  className="w-5 h-5 rounded-full border border-white object-cover"
                />
              ))}
            </div>
            <span className="text-xs text-blue-700">
              {friendsVisited.count === 1 
                ? '1 friend visited' 
                : `${friendsVisited.count} friends visited`
              }
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            className="btn btn-primary btn-small"
            onClick={(e) => {
              e.stopPropagation();
              onViewMenu();
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Utensils className="w-4 h-4" />
            View Menu
          </motion.button>
          
          <motion.button
            className="btn btn-outline btn-small"
            onClick={handleGetDirections}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Navigation className="w-4 h-4" />
            Directions
          </motion.button>
        </div>

        {/* Secondary Actions */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              {reviewCount.toLocaleString()} reviews
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">
              {location.address}
            </span>
          </div>
          
          {contact.phone && (
            <motion.button
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={handleCall}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Call restaurant"
            >
              <Phone className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.article>
  );
};