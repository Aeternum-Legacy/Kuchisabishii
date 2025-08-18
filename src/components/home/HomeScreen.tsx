'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  User,
  TrendingUp,
  Star,
  Heart,
  Bookmark,
  Clock,
  Award,
  Target,
  ChefHat,
  Calendar,
  MapPin,
  Share2,
  Sparkles
} from 'lucide-react';
import { RecommendedFoodsSection } from './RecommendedFoodsSection';
import { LatestReviewedSection } from './LatestReviewedSection';
import { HallOfFameSection } from './HallOfFameSection';
import { QuickStatsSection } from './QuickStatsSection';

interface HomeScreenProps {
  onViewChange: (view: string) => void;
  user?: {
    id: string;
    displayName: string;
    profileImage?: string;
  };
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onViewChange, user }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [greeting, setGreeting] = useState('Hello!');

  // Dynamic greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning! 🌅');
    } else if (hour < 17) {
      setGreeting('Good afternoon! ☀️');
    } else if (hour < 21) {
      setGreeting('Good evening! 🌆');
    } else {
      setGreeting('Good night! 🌙');
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search functionality
  };

  const handleQuickLog = () => {
    onViewChange('add');
  };

  return (
    <motion.div
      className="flex-1 bg-gradient-to-br from-orange-50 to-red-50 min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div 
        className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10"
        variants={itemVariants}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1">
              <motion.h1 
                className="text-2xl font-bold text-gray-800"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {greeting}
              </motion.h1>
              <motion.p 
                className="text-gray-600 text-sm mt-1"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                What did your mouth experience today?
              </motion.p>
            </div>
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center border-2 border-orange-200">
                {user?.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt={user.displayName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-orange-600" />
                )}
              </div>
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </motion.div>
          </div>
          
          {/* Search Bar */}
          <motion.div 
            className="relative mb-4"
            variants={itemVariants}
          >
            <div className="flex items-center space-x-3 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-orange-100">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search foods, restaurants, moods..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
              />
              {searchQuery && (
                <motion.button
                  className="p-1 hover:bg-gray-100 rounded-full"
                  onClick={() => setSearchQuery('')}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ×
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Quick Log Button */}
          <motion.button
            onClick={handleQuickLog}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-200"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            variants={itemVariants}
          >
            <Plus className="w-5 h-5" />
            <span>Log Food Experience</span>
            <Sparkles className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="p-4 space-y-6 pb-20">
        {/* Quick Stats Dashboard */}
        <motion.div variants={itemVariants}>
          <QuickStatsSection 
            onSectionClick={(section) => setActiveSection(section)}
            activeSection={activeSection}
          />
        </motion.div>

        {/* Recommended Foods Section */}
        <motion.div variants={itemVariants}>
          <RecommendedFoodsSection 
            onTryFood={(foodId) => {
              // Handle trying recommended food
              // Production: Remove console log - foodId interaction
            }}
            onBookmark={(foodId) => {
              // Handle bookmarking
              console.log('Bookmarking:', foodId);
            }}
          />
        </motion.div>

        {/* Latest Reviewed Foods */}
        <motion.div variants={itemVariants}>
          <LatestReviewedSection 
            onReviewAgain={(foodId) => {
              // Handle reviewing again
              console.log('Review again:', foodId);
              onViewChange('add');
            }}
            onShare={(foodId) => {
              // Handle sharing
              console.log('Sharing:', foodId);
            }}
          />
        </motion.div>

        {/* Kuchisabishii Hall of Fame */}
        <motion.div variants={itemVariants}>
          <HallOfFameSection 
            onReorder={(foodId) => {
              // Handle reordering
              console.log('Reordering:', foodId);
            }}
            onShare={(foodId) => {
              // Handle sharing
              console.log('Sharing Hall of Fame item:', foodId);
            }}
          />
        </motion.div>

        {/* Floating Action Hints */}
        <AnimatePresence>
          {!searchQuery && (
            <motion.div
              className="fixed bottom-20 right-4 space-y-2"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
            >
              <motion.button
                className="bg-orange-500 text-white p-3 rounded-full shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => console.log('AI recommendations')}
              >
                <Sparkles className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default HomeScreen;