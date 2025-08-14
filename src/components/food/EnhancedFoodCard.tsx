'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Camera,
  ThumbsUp,
  MoreHorizontal
} from 'lucide-react';

export interface EnhancedFoodCardProps {
  id: string;
  title: string;
  restaurant: {
    name: string;
    location: string;
    rating: number;
  };
  image: string;
  rating: number;
  price: string;
  cuisine: string;
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  bookmarks: number;
  isLiked: boolean;
  isBookmarked: boolean;
  author: {
    name: string;
    avatar: string;
    verified?: boolean;
  };
  createdAt: string;
  tasteProfile: {
    sweet: number;
    savory: number;
    spicy: number;
    sour: number;
    umami: number;
    bitter: number;
  };
  experienceLevel: 'never-again' | 'occasionally' | 'frequently' | 'kuchisabishii';
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onBookmark: () => void;
  onViewDetails: () => void;
}

export const EnhancedFoodCard: React.FC<EnhancedFoodCardProps> = ({
  id,
  title,
  restaurant,
  image,
  rating,
  price,
  cuisine,
  tags,
  likes,
  comments,
  shares,
  bookmarks,
  isLiked,
  isBookmarked,
  author,
  createdAt,
  tasteProfile,
  experienceLevel,
  onLike,
  onComment,
  onShare,
  onBookmark,
  onViewDetails,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const formatNumber = useCallback((num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }, []);

  const getExperienceEmoji = useCallback((level: string): string => {
    switch (level) {
      case 'never-again': return '😤';
      case 'occasionally': return '😐';
      case 'frequently': return '😊';
      case 'kuchisabishii': return '🤤';
      default: return '😊';
    }
  }, []);

  const getExperienceColor = useCallback((level: string): string => {
    switch (level) {
      case 'never-again': return 'var(--food-error)';
      case 'occasionally': return 'var(--food-warning)';
      case 'frequently': return 'var(--food-secondary)';
      case 'kuchisabishii': return 'var(--food-primary)';
      default: return 'var(--food-secondary)';
    }
  }, []);

  const renderStars = useCallback((rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star 
            key={i} 
            className="w-4 h-4 fill-current text-yellow-400" 
            aria-hidden="true"
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative w-4 h-4">
            <Star className="w-4 h-4 text-gray-300" aria-hidden="true" />
            <Star 
              className="w-4 h-4 fill-current text-yellow-400 absolute top-0 left-0 overflow-hidden"
              style={{ clipPath: 'inset(0 50% 0 0)' }}
              aria-hidden="true"
            />
          </div>
        );
      } else {
        stars.push(
          <Star 
            key={i} 
            className="w-4 h-4 text-gray-300" 
            aria-hidden="true"
          />
        );
      }
    }
    
    return stars;
  }, []);

  const renderTasteProfile = useCallback(() => {
    const tastes = [
      { key: 'sweet', label: 'Sweet', value: tasteProfile.sweet, color: '#FFB3BA' },
      { key: 'savory', label: 'Savory', value: tasteProfile.savory, color: '#FFDFBA' },
      { key: 'spicy', label: 'Spicy', value: tasteProfile.spicy, color: '#FF6B6B' },
      { key: 'sour', label: 'Sour', value: tasteProfile.sour, color: '#FFE66D' },
      { key: 'umami', label: 'Umami', value: tasteProfile.umami, color: '#95E77E' },
      { key: 'bitter', label: 'Bitter', value: tasteProfile.bitter, color: '#A8A29E' },
    ];

    const prominentTastes = tastes
      .filter(taste => taste.value >= 7)
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);

    return prominentTastes.map(taste => (
      <span
        key={taste.key}
        className="taste-badge"
        style={{ backgroundColor: taste.color }}
        title={`${taste.label}: ${taste.value}/10`}
      >
        {taste.label}
      </span>
    ));
  }, [tasteProfile]);

  const handleLike = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onLike();
  }, [onLike]);

  const handleBookmark = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onBookmark();
  }, [onBookmark]);

  const handleComment = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onComment();
  }, [onComment]);

  const handleShare = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onShare();
  }, [onShare]);

  return (
    <motion.article
      className={`food-card cursor-pointer ${isPressed ? 'scale-[0.98]' : ''}`}
      onClick={onViewDetails}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${title} from ${restaurant.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onViewDetails();
        }
      }}
    >
      {/* Header with Author Info */}
      <div className="flex items-center p-4 pb-3">
        <div className="avatar avatar-md mr-3">
          <img
            src={author.avatar}
            alt={`${author.name}'s profile`}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/api/placeholder/40/40';
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-body font-semibold text-gray-800 truncate">
              {author.name}
            </h3>
            {author.verified && (
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <time className="text-caption text-gray-500" dateTime={createdAt}>
              {createdAt}
            </time>
            <span className="text-caption text-gray-400">•</span>
            <span className="text-caption text-gray-500">{cuisine}</span>
          </div>
        </div>
        <button
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setShowActions(!showActions);
          }}
          aria-label="More options"
        >
          <MoreHorizontal className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Food Image with Overlays */}
      <div className="relative bg-gray-100 aspect-[4/3] overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="loading-spinner" />
          </div>
        )}
        
        <img
          src={image}
          alt={`${title} from ${restaurant.name}`}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/api/placeholder/400/300';
            setImageLoaded(true);
          }}
          loading="lazy"
        />
        
        {/* Image Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        {/* Price Tag */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
          <span className="text-sm font-semibold text-gray-800 flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            {price}
          </span>
        </div>
        
        {/* Experience Level Badge */}
        <div 
          className="absolute top-3 left-3 px-3 py-1 rounded-full text-white text-sm font-medium shadow-sm"
          style={{ backgroundColor: getExperienceColor(experienceLevel) }}
        >
          <span className="flex items-center gap-1">
            {getExperienceEmoji(experienceLevel)}
            <span className="capitalize">{experienceLevel.replace('-', ' ')}</span>
          </span>
        </div>
        
        {/* Bookmark Button */}
        <motion.button
          className={`absolute bottom-3 right-3 p-2 rounded-full shadow-lg transition-colors ${
            isBookmarked 
              ? 'bg-orange-500 text-white' 
              : 'bg-white/95 backdrop-blur-sm text-gray-600 hover:text-orange-500'
          }`}
          onClick={handleBookmark}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          <Bookmark 
            className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} 
          />
        </motion.button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title and Restaurant */}
        <div className="mb-3">
          <h2 className="text-heading-3 font-bold text-gray-800 mb-1 line-clamp-2">
            {title}
          </h2>
          <div className="flex items-center text-body-small text-gray-600 mb-2">
            <MapPin className="w-4 h-4 mr-1 text-gray-400" />
            <span className="truncate">{restaurant.name}</span>
            <span className="mx-2 text-gray-400">•</span>
            <span className="truncate">{restaurant.location}</span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {renderStars(rating)}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {rating.toFixed(1)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">{createdAt}</span>
          </div>
        </div>

        {/* Taste Profile Tags */}
        {renderTasteProfile().length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {renderTasteProfile()}
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="category-pill text-xs"
                style={{ padding: 'var(--space-1) var(--space-2)' }}
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-gray-500 self-center">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <motion.button
            className={`social-share-button ${isLiked ? 'active' : ''}`}
            onClick={handleLike}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isLiked ? 'Unlike this post' : 'Like this post'}
          >
            <Heart 
              className={`w-4 h-4 transition-all duration-200 ${
                isLiked ? 'fill-current text-red-500 heart-animation' : 'text-gray-600'
              }`} 
            />
            <span className="font-medium text-sm">
              {formatNumber(likes)}
            </span>
          </motion.button>

          <motion.button
            className="social-share-button"
            onClick={handleComment}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Comment on this post"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="font-medium text-sm">
              {formatNumber(comments)}
            </span>
          </motion.button>

          <motion.button
            className="social-share-button"
            onClick={handleShare}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Share this post"
          >
            <Share2 className="w-4 h-4" />
            <span className="font-medium text-sm">
              {formatNumber(shares)}
            </span>
          </motion.button>

          <motion.button
            className="social-share-button"
            onClick={(e) => {
              e.stopPropagation();
              // Handle "Try this" action
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Try this food"
          >
            <ThumbsUp className="w-4 h-4" />
            <span className="font-medium text-sm">Try</span>
          </motion.button>
        </div>
      </div>

      {/* Actions Menu */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            className="absolute top-16 right-4 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
              <Camera className="w-4 h-4" />
              View Photos
            </button>
            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              View Location
            </button>
            <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
              Report
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};