'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown,
  Star,
  Share2,
  RotateCcw,
  MapPin,
  Calendar,
  Heart,
  Award,
  Sparkles,
  ShoppingCart,
  Phone,
  ExternalLink
} from 'lucide-react';

interface HallOfFameFood {
  id: string;
  name: string;
  restaurantName: string;
  image: string;
  rating: 5; // Always 5 stars for Hall of Fame
  kuchisabishiRating: 5; // Always "Kuchisabishii!"
  dateFirstTried: string;
  timesOrdered: number;
  totalSpent: number;
  lastOrdered?: string;
  category: string;
  cuisineType: string;
  tags: string[];
  notes: string;
  isAvailableForDelivery: boolean;
  restaurantPhone?: string;
  averagePrice: number;
  personalNotes: string;
  shareCount: number;
  friendsWhoLoved: number;
}

interface HallOfFameSectionProps {
  onReorder: (foodId: string) => void;
  onShare: (foodId: string) => void;
}

export const HallOfFameSection: React.FC<HallOfFameSectionProps> = ({
  onReorder,
  onShare
}) => {
  const [hallOfFame, setHallOfFame] = useState<HallOfFameFood[]>([]);
  const [selectedFood, setSelectedFood] = useState<HallOfFameFood | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - In production, this would come from API
  useEffect(() => {
    const mockHallOfFame: HallOfFameFood[] = [
      {
        id: '1',
        name: 'Korean BBQ Bulgogi',
        restaurantName: 'Seoul House',
        image: '🥩',
        rating: 5,
        kuchisabishiRating: 5,
        dateFirstTried: '2024-01-01',
        timesOrdered: 8,
        totalSpent: 240,
        lastOrdered: '2024-01-15',
        category: 'Main Dish',
        cuisineType: 'Korean',
        tags: ['spicy', 'grilled', 'comfort', 'perfect'],
        notes: 'The perfect balance of sweet and savory that never fails to satisfy my soul.',
        isAvailableForDelivery: true,
        restaurantPhone: '+1-555-0123',
        averagePrice: 30,
        personalNotes: 'Always order with extra banchan and ask for medium-well doneness.',
        shareCount: 12,
        friendsWhoLoved: 5
      },
      {
        id: '2',
        name: 'Truffle Risotto',
        restaurantName: 'Casa Italiana',
        image: '🍚',
        rating: 5,
        kuchisabishiRating: 5,
        dateFirstTried: '2024-01-05',
        timesOrdered: 6,
        totalSpent: 180,
        lastOrdered: '2024-01-12',
        category: 'Main Dish',
        cuisineType: 'Italian',
        tags: ['creamy', 'luxurious', 'aromatic', 'indulgent'],
        notes: 'The earthiness of truffle paired with perfectly cooked arborio rice - pure magic.',
        isAvailableForDelivery: false,
        restaurantPhone: '+1-555-0124',
        averagePrice: 32,
        personalNotes: 'Best paired with their house Chianti. Always fresh shaved truffle on top.',
        shareCount: 8,
        friendsWhoLoved: 3
      },
      {
        id: '3',
        name: 'Chocolate Lava Cake',
        restaurantName: 'Sweet Dreams Bakery',
        image: '🍰',
        rating: 5,
        kuchisabishiRating: 5,
        dateFirstTried: '2024-01-10',
        timesOrdered: 4,
        totalSpent: 60,
        lastOrdered: '2024-01-14',
        category: 'Dessert',
        cuisineType: 'French',
        tags: ['sweet', 'warm', 'decadent', 'emotional'],
        notes: 'Every bite is like a warm hug. The molten center flows like liquid happiness.',
        isAvailableForDelivery: true,
        restaurantPhone: '+1-555-0125',
        averagePrice: 15,
        personalNotes: 'Perfect with vanilla ice cream. Always order 2 minutes before main course ends.',
        shareCount: 15,
        friendsWhoLoved: 7
      }
    ];

    setTimeout(() => {
      setHallOfFame(mockHallOfFame);
      setIsLoading(false);
    }, 1200);
  }, []);

  const handleReorder = (food: HallOfFameFood) => {
    if (food.isAvailableForDelivery) {
      onReorder(food.id);
    } else {
      // Show call option or directions
      window.open(`tel:${food.restaurantPhone}`);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants = {
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">👑 Hall of Fame</h2>
          <div className="animate-spin w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 animate-pulse">
              <div className="h-20 bg-gray-300 rounded-lg mb-3" />
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
          <Crown className="w-6 h-6 text-yellow-500" />
          <h2 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
            Kuchisabishii! Hall of Fame
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <motion.div 
            className="text-sm text-orange-600 bg-orange-100 px-3 py-1 rounded-full"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            {hallOfFame.length} perfect foods
          </motion.div>
        </div>
      </div>

      <div className="text-sm text-gray-600 bg-orange-50 p-3 rounded-lg border border-orange-200">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span>These are your 5-star "When my mouth is lonely" foods - the ones that truly satisfy your soul!</span>
        </div>
      </div>

      {/* Hall of Fame Cards */}
      <motion.div className="space-y-4" variants={containerVariants}>
        {hallOfFame.map((food, index) => (
          <motion.div
            key={food.id}
            className="relative bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 rounded-xl shadow-lg border-2 border-orange-300 overflow-hidden hover:shadow-xl transition-all duration-300"
            variants={cardVariants}
            whileHover={{ y: -4 }}
            layoutId={`hall-of-fame-${food.id}`}
          >
            {/* Crown Badge */}
            <div className="absolute top-3 right-3">
              <motion.div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold ${
                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                }`}
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, delay: index * 0.5 }}
              >
                {index === 0 ? '👑' : index === 1 ? '🥈' : '🥉'}
              </motion.div>
            </div>

            <div className="p-4">
              {/* Main Content */}
              <div className="flex items-start space-x-4">
                {/* Food Image with Special Effect */}
                <div className="relative">
                  <motion.div 
                    className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center text-3xl border-2 border-orange-300 shadow-lg"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  >
                    {food.image}
                  </motion.div>
                  <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                    ×{food.timesOrdered}
                  </div>
                </div>

                {/* Food Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{food.name}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{food.restaurantName}</span>
                        <span>•</span>
                        <span>{food.cuisineType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Kuchisabishii Rating */}
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex items-center space-x-1 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      <span className="text-lg">😍</span>
                      <span>Kuchisabishii!</span>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                    <div className="text-center bg-white/50 rounded-lg p-2">
                      <div className="font-bold text-orange-600">${food.totalSpent}</div>
                      <div className="text-gray-500 text-xs">Total Spent</div>
                    </div>
                    <div className="text-center bg-white/50 rounded-lg p-2">
                      <div className="font-bold text-orange-600">{food.shareCount}</div>
                      <div className="text-gray-500 text-xs">Shares</div>
                    </div>
                    <div className="text-center bg-white/50 rounded-lg p-2">
                      <div className="font-bold text-orange-700">{food.friendsWhoLoved}</div>
                      <div className="text-gray-500 text-xs">Friends Love</div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="bg-white/60 rounded-lg p-3 mb-3">
                    <p className="text-sm text-gray-700 italic">💭 "{food.notes}"</p>
                    {food.personalNotes && (
                      <p className="text-xs text-orange-600 mt-1 font-medium">✨ {food.personalNotes}</p>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {food.tags.map(tag => (
                      <span key={tag} className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <motion.button
                      onClick={() => handleReorder(food)}
                      className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg font-semibold text-sm transition-all ${
                        food.isAvailableForDelivery
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg'
                          : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-lg'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {food.isAvailableForDelivery ? (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          <span>Order Again</span>
                        </>
                      ) : (
                        <>
                          <Phone className="w-4 h-4" />
                          <span>Call & Order</span>
                        </>
                      )}
                    </motion.button>
                    
                    <motion.button
                      onClick={() => onShare(food.id)}
                      className="flex items-center justify-center space-x-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Special Achievement Badge */}
              {food.timesOrdered >= 10 && (
                <motion.div 
                  className="absolute top-0 left-0 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-2 py-1 rounded-br-lg"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  🏆 LEGEND
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {hallOfFame.length === 0 && (
        <motion.div 
          className="text-center py-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-dashed border-purple-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-6xl mb-4">👑</div>
          <h3 className="font-bold text-gray-800 mb-2">No Hall of Fame Foods Yet</h3>
          <p className="text-gray-600 mb-4">Rate foods as "Kuchisabishii!" (5 stars) to build your Hall of Fame</p>
          <div className="text-sm text-purple-600 bg-purple-100 inline-block px-4 py-2 rounded-full">
            💫 These are your soul-satisfying, mouth-lonely-curing perfect foods!
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default HallOfFameSection;