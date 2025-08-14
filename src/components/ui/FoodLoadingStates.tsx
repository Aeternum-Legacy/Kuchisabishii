'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface FoodCardSkeletonProps {
  count?: number;
  showAuthor?: boolean;
  showActions?: boolean;
  className?: string;
}

interface RestaurantCardSkeletonProps {
  count?: number;
  layout?: 'grid' | 'list';
  className?: string;
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
  className?: string;
}

// Food Card Skeleton
export const FoodCardSkeleton: React.FC<FoodCardSkeletonProps> = ({
  count = 1,
  showAuthor = true,
  showActions = true,
  className = '',
}) => {
  const skeletons = Array.from({ length: count }, (_, index) => (
    <motion.div
      key={index}
      className={`food-card-skeleton bg-white rounded-2xl overflow-hidden ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.1 }}
    >
      {/* Author Header */}
      {showAuthor && (
        <div className="p-4 pb-3">
          <div className="flex items-center gap-3">
            <div className="loading-skeleton w-10 h-10 rounded-full" />
            <div className="flex-1">
              <div className="loading-skeleton h-4 w-24 mb-2" />
              <div className="loading-skeleton h-3 w-16" />
            </div>
            <div className="loading-skeleton w-6 h-6 rounded" />
          </div>
        </div>
      )}

      {/* Image */}
      <div className="loading-skeleton aspect-[4/3] relative">
        <div className="absolute top-3 right-3">
          <div className="loading-skeleton w-12 h-6 rounded-full" />
        </div>
        <div className="absolute bottom-3 right-3">
          <div className="loading-skeleton w-8 h-8 rounded-full" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title and Location */}
        <div className="mb-3">
          <div className="loading-skeleton h-6 w-3/4 mb-2" />
          <div className="loading-skeleton h-4 w-1/2 mb-2" />
          <div className="flex items-center gap-2">
            <div className="loading-skeleton h-4 w-4 rounded" />
            <div className="loading-skeleton h-4 w-20" />
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="loading-skeleton w-4 h-4" />
              ))}
            </div>
            <div className="loading-skeleton h-4 w-8" />
          </div>
          <div className="loading-skeleton h-4 w-16" />
        </div>

        {/* Tags */}
        <div className="flex gap-2 mb-4">
          <div className="loading-skeleton h-6 w-16 rounded-full" />
          <div className="loading-skeleton h-6 w-20 rounded-full" />
          <div className="loading-skeleton h-6 w-14 rounded-full" />
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="loading-skeleton h-8 w-16 rounded-full" />
            <div className="loading-skeleton h-8 w-20 rounded-full" />
            <div className="loading-skeleton h-8 w-16 rounded-full" />
            <div className="loading-skeleton h-8 w-12 rounded-full" />
          </div>
        )}
      </div>
    </motion.div>
  ));

  return <>{skeletons}</>;
};

// Restaurant Card Skeleton
export const RestaurantCardSkeleton: React.FC<RestaurantCardSkeletonProps> = ({
  count = 1,
  layout = 'grid',
  className = '',
}) => {
  const skeletons = Array.from({ length: count }, (_, index) => (
    <motion.div
      key={index}
      className={`restaurant-card bg-white rounded-xl overflow-hidden ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.1 }}
    >
      {/* Image */}
      <div className="loading-skeleton aspect-[16/10] relative">
        <div className="absolute top-3 left-3">
          <div className="loading-skeleton h-6 w-20 rounded-full" />
        </div>
        <div className="absolute top-3 right-3 flex gap-2">
          <div className="loading-skeleton w-8 h-8 rounded-full" />
          <div className="loading-skeleton w-8 h-8 rounded-full" />
        </div>
        <div className="absolute bottom-3 right-3">
          <div className="loading-skeleton h-6 w-12 rounded-full" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="loading-skeleton h-6 w-3/4" />
          <div className="flex items-center gap-1">
            <div className="loading-skeleton w-4 h-4" />
            <div className="loading-skeleton h-4 w-8" />
          </div>
        </div>

        {/* Cuisine and Distance */}
        <div className="loading-skeleton h-4 w-1/2 mb-2" />
        
        {/* Status */}
        <div className="flex items-center gap-2 mb-3">
          <div className="loading-skeleton w-2 h-2 rounded-full" />
          <div className="loading-skeleton h-4 w-24" />
        </div>

        {/* Description */}
        <div className="space-y-2 mb-3">
          <div className="loading-skeleton h-3 w-full" />
          <div className="loading-skeleton h-3 w-4/5" />
        </div>

        {/* Popular Dishes */}
        <div className="mb-3">
          <div className="loading-skeleton h-3 w-20 mb-2" />
          <div className="flex gap-2">
            <div className="loading-skeleton h-5 w-16 rounded-full" />
            <div className="loading-skeleton h-5 w-20 rounded-full" />
            <div className="loading-skeleton h-5 w-14 rounded-full" />
          </div>
        </div>

        {/* Features */}
        <div className="flex gap-3 mb-4">
          <div className="loading-skeleton h-4 w-12" />
          <div className="loading-skeleton h-4 w-14" />
          <div className="loading-skeleton h-4 w-10" />
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="loading-skeleton h-9 rounded-lg" />
          <div className="loading-skeleton h-9 rounded-lg" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="loading-skeleton h-3 w-20" />
          <div className="loading-skeleton w-4 h-4 rounded" />
        </div>
      </div>
    </motion.div>
  ));

  return <>{skeletons}</>;
};

// Loading Spinner
export const FoodLoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'var(--food-primary)',
  text,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} border-2 border-gray-200 rounded-full relative overflow-hidden`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <div
          className="absolute inset-0 border-2 border-transparent rounded-full"
          style={{
            borderTopColor: color,
            borderRightColor: color,
          }}
        />
      </motion.div>
      {text && (
        <span className="text-sm text-gray-600 font-medium">{text}</span>
      )}
    </div>
  );
};

// Specialized Food Loading Components
export const FoodDiscoveryLoader: React.FC = () => (
  <motion.div
    className="flex flex-col items-center justify-center p-8"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <motion.div
      className="relative w-16 h-16 mb-4"
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
    >
      <div className="absolute inset-0 border-4 border-orange-100 rounded-full" />
      <div className="absolute inset-0 border-4 border-transparent border-t-orange-500 rounded-full" />
      <div className="absolute inset-2 border-2 border-transparent border-r-orange-400 rounded-full" />
    </motion.div>
    <motion.p
      className="text-gray-600 font-medium"
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      Discovering delicious foods...
    </motion.p>
  </motion.div>
);

export const RestaurantSearchLoader: React.FC = () => (
  <motion.div
    className="flex flex-col items-center justify-center p-8"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <motion.div className="relative w-12 h-12 mb-4">
      <motion.div
        className="absolute inset-0 border-3 border-teal-200 rounded-full"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <motion.div
        className="absolute inset-1 border-2 border-teal-500 rounded-full"
        animate={{ scale: [1.2, 1, 1.2] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </motion.div>
    <motion.p
      className="text-gray-600 font-medium"
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      Finding nearby restaurants...
    </motion.p>
  </motion.div>
);

export const RecommendationLoader: React.FC = () => (
  <motion.div
    className="flex flex-col items-center justify-center p-8"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <motion.div className="flex gap-2 mb-4">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-3 h-3 bg-yellow-400 rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.2,
          }}
        />
      ))}
    </motion.div>
    <motion.p
      className="text-gray-600 font-medium text-center"
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      Personalizing recommendations...
    </motion.p>
  </motion.div>
);

// Photo Upload Loader
export const PhotoUploadLoader: React.FC<{ progress?: number }> = ({ progress = 0 }) => (
  <motion.div
    className="flex flex-col items-center justify-center p-6"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <motion.div className="relative w-16 h-16 mb-4">
      {/* Background circle */}
      <div className="absolute inset-0 border-4 border-gray-200 rounded-full" />
      
      {/* Progress circle */}
      <motion.div
        className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full"
        style={{
          background: `conic-gradient(from 0deg, #8B5CF6 ${progress * 3.6}deg, transparent ${progress * 3.6}deg)`,
        }}
        animate={{ rotate: progress < 100 ? 360 : 0 }}
        transition={{ duration: 1, repeat: progress < 100 ? Infinity : 0, ease: 'linear' }}
      />
      
      {/* Camera icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          📸
        </motion.div>
      </div>
    </motion.div>
    
    <motion.p
      className="text-gray-600 font-medium mb-2"
      animate={{ opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 1, repeat: Infinity }}
    >
      {progress < 100 ? 'Uploading photos...' : 'Photos uploaded!'}
    </motion.p>
    
    {progress > 0 && (
      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-purple-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    )}
  </motion.div>
);

// Page Loading Overlay
export const FoodPageLoader: React.FC<{ text?: string }> = ({ 
  text = 'Loading delicious content...' 
}) => (
  <motion.div
    className="fixed inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div className="text-center">
      <motion.div
        className="w-20 h-20 mx-auto mb-6 relative"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute inset-0 border-4 border-orange-100 rounded-full" />
        <div className="absolute inset-0 border-4 border-transparent border-t-orange-500 border-r-orange-400 rounded-full" />
        <div className="absolute inset-4 border-2 border-transparent border-b-orange-300 rounded-full" />
      </motion.div>
      
      <motion.h3
        className="text-xl font-semibold text-gray-800 mb-2"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {text}
      </motion.h3>
      
      <motion.div
        className="flex items-center justify-center gap-2 text-sm text-gray-500"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span>🍽️</span>
        <span>Preparing your food experience</span>
        <span>✨</span>
      </motion.div>
    </div>
  </motion.div>
);