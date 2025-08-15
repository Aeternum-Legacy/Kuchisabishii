'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Clock,
  RotateCcw,
  Share2,
  MapPin,
  Calendar,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle
} from 'lucide-react';

interface LatestFoodReview {
  id: string;
  name: string;
  restaurantName: string;
  rating: number;
  kuchisabishiRating: 1 | 2 | 3 | 4 | 5;
  image: string;
  date: string;
  timeAgo: string;
  category: string;
  tags: string[];
  notes?: string;
  previousReviews?: number;
  averageRating?: number;
  mood: string;
  priceRange: number;
  wouldRecommend: boolean;
}

interface LatestReviewedSectionProps {
  onReviewAgain: (foodId: string) => void;
  onShare: (foodId: string) => void;
}

export const LatestReviewedSection: React.FC<LatestReviewedSectionProps> = ({
  onReviewAgain,
  onShare
}) => {
  const [reviews, setReviews] = useState<LatestFoodReview[]>([]);
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - In production, this would come from API
  useEffect(() => {
    const mockReviews: LatestFoodReview[] = [
      {
        id: '1',
        name: 'Korean BBQ Bulgogi',
        restaurantName: 'Seoul House',
        rating: 4.5,
        kuchisabishiRating: 5,
        image: '🥩',
        date: '2024-01-15',
        timeAgo: 'Today',
        category: 'Main Dish',
        tags: ['spicy', 'grilled', 'comfort'],
        notes: 'Perfect balance of sweet and savory. The meat was incredibly tender and the banchan was fresh.',
        previousReviews: 2,
        averageRating: 4.3,
        mood: '😍',
        priceRange: 3,
        wouldRecommend: true
      },
      {
        id: '2',
        name: 'Margherita Pizza',
        restaurantName: "Tony's Pizzeria",
        rating: 4.0,
        kuchisabishiRating: 4,
        image: '🍕',
        date: '2024-01-14',
        timeAgo: 'Yesterday',
        category: 'Main Dish',
        tags: ['comfort', 'classic', 'cheesy'],
        notes: 'Classic done right. The crust was perfect - crispy outside, chewy inside.',
        previousReviews: 1,
        averageRating: 4.0,
        mood: '😋',
        priceRange: 2,
        wouldRecommend: true
      },
      {
        id: '3',
        name: 'Green Tea Latte',
        restaurantName: 'Bean There Coffee',
        rating: 3.5,
        kuchisabishiRating: 3,
        image: '🍵',
        date: '2024-01-13',
        timeAgo: '2 days ago',
        category: 'Beverage',
        tags: ['bitter', 'earthy', 'warm'],
        notes: 'Good matcha flavor but could be creamier. Temperature was perfect.',
        previousReviews: 0,
        averageRating: 3.5,
        mood: '😐',
        priceRange: 2,
        wouldRecommend: false
      }
    ];

    setTimeout(() => {
      setReviews(mockReviews);
      setIsLoading(false);
    }, 800);
  }, []);

  const getKuchisabishiLabel = (rating: number) => {
    const labels = {
      1: { label: "Never Again", emoji: "😞", color: "text-red-500" },
      2: { label: "Next Time", emoji: "😕", color: "text-orange-500" },
      3: { label: "Occasionally", emoji: "😐", color: "text-yellow-500" },
      4: { label: "Frequently", emoji: "😊", color: "text-green-500" },
      5: { label: "Kuchisabishii!", emoji: "😍", color: "text-purple-500" }
    };
    return labels[rating as keyof typeof labels];
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">📝 Latest Reviews</h2>
          <div className="animate-spin w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white/50 rounded-xl p-4 animate-pulse">
              <div className="flex space-x-4">
                <div className="w-16 h-16 bg-gray-300 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4" />
                  <div className="h-3 bg-gray-300 rounded w-1/2" />
                  <div className="h-3 bg-gray-300 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="w-6 h-6 text-orange-500" />
          <h2 className="text-xl font-bold text-gray-900">Latest Reviews</h2>
        </div>
        <div className="text-sm text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
          {reviews.length} recent
        </div>
      </div>

      {/* Reviews List */}
      <motion.div className="space-y-3" variants={containerVariants}>
        {reviews.map((review, index) => {
          const kuchisabishiInfo = getKuchisabishiLabel(review.kuchisabishiRating);
          const isExpanded = expandedReview === review.id;
          
          return (
            <motion.div
              key={review.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200"
              variants={cardVariants}
              layoutId={`review-${review.id}`}
            >
              <div className="p-4">
                {/* Main Review Content */}
                <div className="flex items-start space-x-4">
                  {/* Food Image */}
                  <div className="relative">
                    <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center text-2xl border border-orange-300">
                      {review.image}
                    </div>
                    {(review.previousReviews ?? 0) > 0 && (
                      <motion.div 
                        className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        {(review.previousReviews ?? 0) + 1}
                      </motion.div>
                    )}
                  </div>

                  {/* Review Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 truncate">{review.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-700">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{review.restaurantName}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{review.timeAgo}</span>
                      </div>
                    </div>

                    {/* Ratings */}
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{review.rating}</span>
                      </div>
                      <div className={`flex items-center space-x-1 ${kuchisabishiInfo.color}`}>
                        <span className="text-lg">{kuchisabishiInfo.emoji}</span>
                        <span className="text-sm font-medium">{kuchisabishiInfo.label}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {review.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                      {review.tags.length > 3 && (
                        <span className="text-xs text-gray-400">+{review.tags.length - 3}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-4 pt-4 border-t border-gray-100"
                    >
                      {/* Notes */}
                      {review.notes && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
                          <p className="text-sm text-gray-600">{review.notes}</p>
                        </div>
                      )}

                      {/* Additional Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Category:</span>
                          <span className="ml-2 text-gray-700">{review.category}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Price:</span>
                          <span className="ml-2 text-gray-700">{'$'.repeat(review.priceRange)}</span>
                        </div>
                        {(review.previousReviews ?? 0) > 0 && (
                          <div className="col-span-2">
                            <span className="text-gray-500">Average across {(review.previousReviews ?? 0) + 1} visits:</span>
                            <span className="ml-2 text-gray-700 font-medium">{review.averageRating?.toFixed(1)} ⭐</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="flex items-center justify-between mt-4">
                  <motion.button
                    onClick={() => setExpandedReview(isExpanded ? null : review.id)}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                  >
                    {isExpanded ? 'Show Less' : 'Show More'}
                  </motion.button>

                  <div className="flex items-center space-x-2">
                    <motion.button
                      onClick={() => onShare(review.id)}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Share2 className="w-3 h-3" />
                      <span>Share</span>
                    </motion.button>
                    
                    <motion.button
                      onClick={() => onReviewAgain(review.id)}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Review Again</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {reviews.length === 0 && (
        <motion.div 
          className="text-center py-8 bg-white/50 rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-4xl mb-2">📝</div>
          <h3 className="font-medium text-gray-800 mb-1">No reviews yet</h3>
          <p className="text-sm text-gray-600">Start logging your food experiences!</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default LatestReviewedSection;