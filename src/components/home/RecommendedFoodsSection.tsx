'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Heart,
  Bookmark,
  MapPin,
  TrendingUp,
  Sparkles,
  ChefHat,
  Clock,
  DollarSign,
  ThumbsUp
} from 'lucide-react';

interface RecommendedFood {
  id: string;
  name: string;
  restaurantName: string;
  cuisineType: string;
  image: string;
  aiConfidence: number;
  reasoning: string[];
  estimatedRating: number;
  priceRange: number;
  timeToVisit: string;
  distance: string;
  tags: string[];
  isBookmarked?: boolean;
  recommendation_type: 'ai_match' | 'trending' | 'friend_loved' | 'mood_based';
}

interface RecommendedFoodsSectionProps {
  onTryFood: (foodId: string) => void;
  onBookmark: (foodId: string) => void;
}

export const RecommendedFoodsSection: React.FC<RecommendedFoodsSectionProps> = ({
  onTryFood,
  onBookmark
}) => {
  const [recommendations, setRecommendations] = useState<RecommendedFood[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - In production, this would come from API
  useEffect(() => {
    const mockRecommendations: RecommendedFood[] = [
      {
        id: '1',
        name: 'Spicy Miso Ramen',
        restaurantName: 'Ippudo Ramen',
        cuisineType: 'Japanese',
        image: '🍜',
        aiConfidence: 0.92,
        reasoning: ['Matches your love for spicy foods', 'Similar to your recent Korean dishes'],
        estimatedRating: 4.6,
        priceRange: 2,
        timeToVisit: '15-20 min',
        distance: '0.8 miles',
        tags: ['spicy', 'comfort', 'noodles'],
        recommendation_type: 'ai_match'
      },
      {
        id: '2',
        name: 'Truffle Mac & Cheese',
        restaurantName: 'The Cozy Corner',
        cuisineType: 'American',
        image: '🧀',
        aiConfidence: 0.85,
        reasoning: ['Perfect for your comfort food mood', 'Highly rated by similar taste profiles'],
        estimatedRating: 4.4,
        priceRange: 3,
        timeToVisit: '10-15 min',
        distance: '1.2 miles',
        tags: ['comfort', 'creamy', 'indulgent'],
        recommendation_type: 'mood_based'
      },
      {
        id: '3',
        name: 'Korean BBQ Bulgogi',
        restaurantName: 'Seoul Garden',
        cuisineType: 'Korean',
        image: '🥩',
        aiConfidence: 0.88,
        reasoning: ['Trending in your area', '3 friends loved this recently'],
        estimatedRating: 4.7,
        priceRange: 4,
        timeToVisit: '20-25 min',
        distance: '2.1 miles',
        tags: ['trending', 'social', 'grilled'],
        recommendation_type: 'friend_loved'
      }
    ];

    setTimeout(() => {
      setRecommendations(mockRecommendations);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filters = [
    { key: 'all', label: 'All', icon: Sparkles },
    { key: 'ai_match', label: 'AI Pick', icon: Star },
    { key: 'trending', label: 'Trending', icon: TrendingUp },
    { key: 'friend_loved', label: 'Friends', icon: Heart }
  ];

  const filteredRecommendations = activeFilter === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.recommendation_type === activeFilter);

  const getRecommendationTypeLabel = (type: RecommendedFood['recommendation_type']) => {
    switch (type) {
      case 'ai_match': return { label: 'AI Match', color: 'bg-purple-500', icon: '🤖' };
      case 'trending': return { label: 'Trending', color: 'bg-green-500', icon: '🔥' };
      case 'friend_loved': return { label: 'Friend Loved', color: 'bg-pink-500', icon: '👥' };
      case 'mood_based': return { label: 'Mood Match', color: 'bg-blue-500', icon: '💭' };
      default: return { label: 'Recommended', color: 'bg-gray-500', icon: '⭐' };
    }
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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
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
          <h2 className="text-xl font-bold text-gray-800">🤖 AI Recommendations</h2>
          <div className="animate-spin w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white/50 rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-300 rounded w-1/2" />
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
          <Sparkles className="w-6 h-6 text-purple-500" />
          <h2 className="text-xl font-bold text-gray-800">AI Recommendations</h2>
        </div>
        <motion.div 
          className="text-sm text-purple-600 bg-purple-100 px-3 py-1 rounded-full"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          {filteredRecommendations.length} matches
        </motion.div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {filters.map(filter => {
          const Icon = filter.icon;
          return (
            <motion.button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`flex items-center space-x-1 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeFilter === filter.key
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-purple-50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="w-4 h-4" />
              <span>{filter.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Recommendations Grid */}
      <AnimatePresence mode="wait">
        <motion.div 
          className="space-y-4"
          key={activeFilter}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {filteredRecommendations.map((food, index) => {
            const typeInfo = getRecommendationTypeLabel(food.recommendation_type);
            
            return (
              <motion.div
                key={food.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200"
                variants={cardVariants}
                layoutId={food.id}
                whileHover={{ y: -2 }}
              >
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{food.image}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{food.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="w-3 h-3" />
                          <span>{food.restaurantName}</span>
                          <span>•</span>
                          <span>{food.cuisineType}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <motion.button
                        onClick={() => onBookmark(food.id)}
                        className={`p-2 rounded-full transition-colors ${
                          food.isBookmarked ? 'bg-orange-100 text-orange-500' : 'bg-gray-100 text-gray-400 hover:text-gray-600'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Bookmark className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Recommendation Badge */}
                  <div className="flex items-center space-x-2 mb-3">
                    <span className={`inline-flex items-center space-x-1 text-xs px-2 py-1 rounded-full text-white ${typeInfo.color}`}>
                      <span>{typeInfo.icon}</span>
                      <span>{typeInfo.label}</span>
                    </span>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <span>{Math.round(food.aiConfidence * 100)}% match</span>
                    </div>
                  </div>

                  {/* AI Reasoning */}
                  <div className="mb-3">
                    <div className="text-xs text-gray-600 mb-1">Why this matches you:</div>
                    <div className="space-y-1">
                      {food.reasoning.map((reason, idx) => (
                        <div key={idx} className="flex items-center space-x-1 text-sm text-gray-700">
                          <div className="w-1 h-1 bg-purple-400 rounded-full" />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Details Row */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{food.estimatedRating}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{'$'.repeat(food.priceRange)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{food.timeToVisit}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">{food.distance}</div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {food.tags.map(tag => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Action Button */}
                  <motion.button
                    onClick={() => onTryFood(food.id)}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:shadow-lg transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>Try This!</span>
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {filteredRecommendations.length === 0 && (
        <motion.div 
          className="text-center py-8 bg-white/50 rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-4xl mb-2">🔍</div>
          <h3 className="font-medium text-gray-800 mb-1">No recommendations yet</h3>
          <p className="text-sm text-gray-600">Keep logging food to get personalized suggestions!</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default RecommendedFoodsSection;