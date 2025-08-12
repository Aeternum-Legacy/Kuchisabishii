'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Trophy,
  Target,
  Calendar,
  Star,
  TrendingUp,
  Award,
  Flame,
  Heart,
  MapPin,
  ChefHat,
  Crown,
  Sparkles,
  Clock
} from 'lucide-react';

interface QuickStats {
  totalReviews: number;
  averageRating: number;
  kuchisabishiiCount: number;
  favoritesCuisine: string;
  reviewsThisWeek: number;
  reviewsThisMonth: number;
  totalSpent: number;
  uniqueRestaurants: number;
  currentStreak: number;
  longestStreak: number;
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  progress?: {
    current: number;
    total: number;
  };
}

interface QuickStatsSectionProps {
  onSectionClick: (section: string) => void;
  activeSection: string | null;
}

export const QuickStatsSection: React.FC<QuickStatsSectionProps> = ({
  onSectionClick,
  activeSection
}) => {
  const [stats, setStats] = useState<QuickStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  // Mock data - In production, this would come from API
  useEffect(() => {
    const mockStats: QuickStats = {
      totalReviews: 127,
      averageRating: 4.2,
      kuchisabishiiCount: 23,
      favoritesCuisine: 'Korean',
      reviewsThisWeek: 5,
      reviewsThisMonth: 18,
      totalSpent: 2840,
      uniqueRestaurants: 54,
      currentStreak: 7,
      longestStreak: 15,
      achievements: [
        {
          id: '1',
          title: 'First Kuchisabishii!',
          description: 'Found your first perfect food',
          icon: '😍',
          unlockedAt: '2024-01-10',
          rarity: 'common'
        },
        {
          id: '2',
          title: 'Streak Master',
          description: '7 days in a row of food logging',
          icon: '🔥',
          unlockedAt: '2024-01-15',
          rarity: 'rare',
          progress: { current: 7, total: 30 }
        },
        {
          id: '3',
          title: 'Cuisine Explorer',
          description: 'Tried 10 different cuisine types',
          icon: '🌍',
          unlockedAt: '2024-01-12',
          rarity: 'epic'
        },
        {
          id: '4',
          title: 'Review Legend',
          description: 'Reached 100 food reviews',
          icon: '👑',
          unlockedAt: '2024-01-14',
          rarity: 'legendary'
        }
      ]
    };

    setTimeout(() => {
      setStats(mockStats);
      setIsLoading(false);
    }, 600);
  }, []);

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-orange-500';
      case 'epic': return 'bg-orange-500';
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-orange-500" />
          <h2 className="text-xl font-bold text-gray-900">Your Food Journey</h2>
          <div className="animate-spin w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white/50 rounded-xl p-4 animate-pulse">
              <div className="h-8 bg-gray-300 rounded mb-2" />
              <div className="h-4 bg-gray-300 rounded w-2/3" />
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
          <BarChart3 className="w-6 h-6 text-orange-500" />
          <h2 className="text-xl font-bold text-gray-900">Your Food Journey</h2>
        </div>
        <motion.div 
          className="text-sm text-orange-600 bg-orange-100 px-3 py-1 rounded-full cursor-pointer"
          onClick={() => onSectionClick('stats')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          View Details
        </motion.div>
      </div>

      {/* Main Stats Grid */}
      <motion.div className="grid grid-cols-2 gap-3" variants={containerVariants}>
        {/* Total Reviews */}
        <motion.div 
          className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200 cursor-pointer hover:shadow-md transition-all"
          variants={itemVariants}
          onClick={() => onSectionClick('reviews')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <TrendingUp className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-orange-700">{stats.totalReviews}</div>
          <div className="text-sm text-orange-600">Total Reviews</div>
          <div className="text-xs text-orange-500 mt-1">+{stats.reviewsThisWeek} this week</div>
        </motion.div>

        {/* Average Rating */}
        <motion.div 
          className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-xl p-4 border border-yellow-200 cursor-pointer hover:shadow-md transition-all"
          variants={itemVariants}
          onClick={() => onSectionClick('rating')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-white fill-current" />
            </div>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3 h-3 ${i < Math.floor(stats.averageRating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
              ))}
            </div>
          </div>
          <div className="text-2xl font-bold text-yellow-700">{stats.averageRating}</div>
          <div className="text-sm text-yellow-600">Average Rating</div>
          <div className="text-xs text-yellow-500 mt-1">Across all foods</div>
        </motion.div>

        {/* Kuchisabishii Count */}
        <motion.div 
          className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200 cursor-pointer hover:shadow-md transition-all"
          variants={itemVariants}
          onClick={() => onSectionClick('hall-of-fame')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg">😍</span>
          </div>
          <div className="text-2xl font-bold text-orange-700">{stats.kuchisabishiiCount}</div>
          <div className="text-sm text-orange-600">Kuchisabishii!</div>
          <div className="text-xs text-orange-500 mt-1">Perfect foods</div>
        </motion.div>

        {/* Current Streak */}
        <motion.div 
          className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200 cursor-pointer hover:shadow-md transition-all"
          variants={itemVariants}
          onClick={() => onSectionClick('streak')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <Clock className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-orange-700">{stats.currentStreak}</div>
          <div className="text-sm text-orange-600">Day Streak</div>
          <div className="text-xs text-orange-500 mt-1">Keep logging!</div>
        </motion.div>
      </motion.div>

      {/* Extended Stats Row */}
      <motion.div className="grid grid-cols-3 gap-3" variants={containerVariants}>
        <motion.div 
          className="bg-white rounded-lg p-3 border border-gray-200 text-center cursor-pointer hover:shadow-sm transition-all"
          variants={itemVariants}
          onClick={() => onSectionClick('spending')}
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-lg font-bold text-orange-600">${stats.totalSpent}</div>
          <div className="text-xs text-gray-600">Total Spent</div>
        </motion.div>
        
        <motion.div 
          className="bg-white rounded-lg p-3 border border-gray-200 text-center cursor-pointer hover:shadow-sm transition-all"
          variants={itemVariants}
          onClick={() => onSectionClick('restaurants')}
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-lg font-bold text-indigo-600">{stats.uniqueRestaurants}</div>
          <div className="text-xs text-gray-600">Restaurants</div>
        </motion.div>
        
        <motion.div 
          className="bg-white rounded-lg p-3 border border-gray-200 text-center cursor-pointer hover:shadow-sm transition-all"
          variants={itemVariants}
          onClick={() => onSectionClick('cuisine')}
          whileHover={{ scale: 1.02 }}
        >
          <div className="text-lg font-bold text-pink-600">{stats.favoritesCuisine}</div>
          <div className="text-xs text-gray-600">Fav Cuisine</div>
        </motion.div>
      </motion.div>

      {/* Recent Achievements */}
      <motion.div className="space-y-3" variants={containerVariants}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h3 className="font-semibold text-gray-900">Recent Achievements</h3>
          </div>
          <motion.button 
            className="text-sm text-gray-500 hover:text-gray-700"
            onClick={() => onSectionClick('achievements')}
            whileHover={{ scale: 1.05 }}
          >
            View All
          </motion.button>
        </div>
        
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {stats.achievements.slice(0, 4).map(achievement => (
            <motion.div
              key={achievement.id}
              className="flex-shrink-0 bg-white rounded-lg p-3 border border-gray-200 cursor-pointer hover:shadow-md transition-all min-w-[120px]"
              variants={itemVariants}
              onClick={() => setSelectedAchievement(achievement)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{achievement.icon}</div>
                <div className={`inline-block w-2 h-2 rounded-full mb-2 ${getRarityColor(achievement.rarity)}`} />
                <div className="text-xs font-medium text-gray-900 leading-tight">{achievement.title}</div>
                {achievement.progress && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-orange-500 h-1 rounded-full transition-all duration-500"
                        style={{ width: `${(achievement.progress.current / achievement.progress.total) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {achievement.progress.current}/{achievement.progress.total}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAchievement(null)}
          >
            <motion.div
              className="bg-white rounded-xl p-6 max-w-sm w-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">{selectedAchievement.icon}</div>
                <div className={`inline-block px-3 py-1 rounded-full text-white text-xs font-bold mb-3 ${getRarityColor(selectedAchievement.rarity)}`}>
                  {selectedAchievement.rarity.toUpperCase()}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{selectedAchievement.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{selectedAchievement.description}</p>
                <div className="text-xs text-gray-500">
                  Unlocked on {new Date(selectedAchievement.unlockedAt).toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default QuickStatsSection;