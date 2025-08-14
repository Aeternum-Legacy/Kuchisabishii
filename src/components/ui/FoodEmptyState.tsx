'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  PlusCircle,
  Search,
  Heart,
  MapPin,
  Users,
  Star,
  Coffee,
  Utensils,
  ChefHat,
  Sparkles,
  TrendingUp,
  Clock,
  BookOpen
} from 'lucide-react';

interface FoodEmptyStateProps {
  type: 
    | 'no-food-logs'
    | 'no-restaurants'
    | 'no-recommendations'
    | 'no-friends'
    | 'no-reviews'
    | 'no-bookmarks'
    | 'no-search-results'
    | 'no-photos'
    | 'no-activity'
    | 'no-favorites';
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  showSecondaryAction?: boolean;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  illustration?: 'food' | 'restaurant' | 'social' | 'search' | 'generic';
  className?: string;
}

const emptyStateConfig = {
  'no-food-logs': {
    icon: Camera,
    title: "No food experiences yet",
    description: "Start logging your culinary adventures! Every meal is a story worth remembering.",
    actionText: "Log Your First Meal",
    illustration: "🍽️",
    color: "var(--food-primary)",
    tips: [
      "Take a photo of your dish",
      "Rate the taste experience",
      "Add notes about flavors"
    ]
  },
  'no-restaurants': {
    icon: MapPin,
    title: "No restaurants discovered",
    description: "Explore nearby restaurants and hidden gems waiting to be discovered!",
    actionText: "Discover Restaurants",
    illustration: "🏪",
    color: "var(--food-secondary)",
    tips: [
      "Browse by cuisine type",
      "Check ratings and reviews",
      "Find new local favorites"
    ]
  },
  'no-recommendations': {
    icon: Sparkles,
    title: "No recommendations yet",
    description: "Log more food experiences to get personalized recommendations based on your taste!",
    actionText: "Log More Foods",
    illustration: "✨",
    color: "var(--food-accent)",
    tips: [
      "Rate different cuisines",
      "Try various restaurants",
      "Build your taste profile"
    ]
  },
  'no-friends': {
    icon: Users,
    title: "No friends added yet",
    description: "Connect with friends to share food experiences and discover new places together!",
    actionText: "Find Friends",
    illustration: "👥",
    color: "var(--food-secondary)",
    tips: [
      "Share your friend code",
      "Find friends nearby",
      "See their food reviews"
    ]
  },
  'no-reviews': {
    icon: Star,
    title: "No reviews written",
    description: "Share your thoughts and help others discover great food experiences!",
    actionText: "Write Your First Review",
    illustration: "⭐",
    color: "var(--food-warning)",
    tips: [
      "Rate your experience",
      "Describe the flavors",
      "Help the community"
    ]
  },
  'no-bookmarks': {
    icon: Heart,
    title: "No saved favorites",
    description: "Bookmark restaurants and dishes you want to try or revisit later!",
    actionText: "Explore & Save",
    illustration: "❤️",
    color: "var(--food-error)",
    tips: [
      "Bookmark interesting places",
      "Save must-try dishes",
      "Create your wishlist"
    ]
  },
  'no-search-results': {
    icon: Search,
    title: "No results found",
    description: "Try adjusting your search terms or exploring different categories.",
    actionText: "Browse All",
    illustration: "🔍",
    color: "var(--food-neutral-500)",
    tips: [
      "Try broader keywords",
      "Check spelling",
      "Browse by category"
    ]
  },
  'no-photos': {
    icon: Camera,
    title: "No photos added",
    description: "Capture the beauty of your food to make your reviews more engaging!",
    actionText: "Add Photos",
    illustration: "📸",
    color: "var(--food-primary)",
    tips: [
      "Use natural lighting",
      "Capture the details",
      "Show the full dish"
    ]
  },
  'no-activity': {
    icon: TrendingUp,
    title: "No recent activity",
    description: "Start exploring, reviewing, and connecting to see your feed come alive!",
    actionText: "Get Started",
    illustration: "📊",
    color: "var(--food-secondary)",
    tips: [
      "Follow friends",
      "Like and comment",
      "Share experiences"
    ]
  },
  'no-favorites': {
    icon: ChefHat,
    title: "No favorites yet",
    description: "Mark dishes as favorites to easily find and reorder your go-to meals!",
    actionText: "Find Favorites",
    illustration: "👨‍🍳",
    color: "var(--food-accent)",
    tips: [
      "Try different cuisines",
      "Rate your experiences",
      "Mark loved dishes"
    ]
  }
};

export const FoodEmptyState: React.FC<FoodEmptyStateProps> = ({
  type,
  title,
  description,
  actionText,
  onAction,
  showSecondaryAction = false,
  secondaryActionText = "Learn More",
  onSecondaryAction,
  illustration = 'generic',
  className = '',
}) => {
  const config = emptyStateConfig[type];
  const IconComponent = config.icon;

  const displayTitle = title || config.title;
  const displayDescription = description || config.description;
  const displayActionText = actionText || config.actionText;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  const pulseVariants = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  };

  return (
    <motion.div
      className={`empty-state ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Illustration */}
      <motion.div
        className="empty-state-illustration mb-6"
        variants={itemVariants}
        animate={pulseVariants}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-4 mx-auto"
          style={{ 
            backgroundColor: `${config.color}20`,
            border: `3px solid ${config.color}30`
          }}
        >
          <IconComponent 
            className="w-10 h-10"
            style={{ color: config.color }}
          />
        </div>
        <div className="text-4xl mb-2">{config.illustration}</div>
      </motion.div>

      {/* Content */}
      <motion.div className="text-center max-w-sm mx-auto" variants={itemVariants}>
        <h3 className="text-heading-2 text-gray-800 mb-3 font-bold">
          {displayTitle}
        </h3>
        <p className="text-body text-gray-600 mb-6 leading-relaxed">
          {displayDescription}
        </p>
      </motion.div>

      {/* Tips Section */}
      {config.tips && (
        <motion.div
          className="mb-6 p-4 bg-gray-50 rounded-xl max-w-sm mx-auto"
          variants={itemVariants}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-gray-700">Quick Tips</span>
          </div>
          <ul className="space-y-2">
            {config.tips.map((tip, index) => (
              <motion.li
                key={index}
                className="flex items-start gap-2 text-sm text-gray-600"
                variants={itemVariants}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                <span>{tip}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div className="flex flex-col gap-3 max-w-xs mx-auto" variants={itemVariants}>
        {onAction && (
          <motion.button
            className="btn btn-primary"
            onClick={onAction}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ backgroundColor: config.color }}
          >
            <PlusCircle className="w-4 h-4" />
            {displayActionText}
          </motion.button>
        )}
        
        {showSecondaryAction && onSecondaryAction && (
          <motion.button
            className="btn btn-ghost"
            onClick={onSecondaryAction}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <BookOpen className="w-4 h-4" />
            {secondaryActionText}
          </motion.button>
        )}
      </motion.div>

      {/* Encouraging Footer */}
      <motion.div
        className="mt-8 text-center"
        variants={itemVariants}
      >
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <Coffee className="w-3 h-3" />
          <span>Every great food journey starts with a single bite</span>
          <Utensils className="w-3 h-3" />
        </div>
      </motion.div>
    </motion.div>
  );
};

// Enhanced empty state for specific food contexts
export const FoodLogEmptyState: React.FC<Omit<FoodEmptyStateProps, 'type'>> = (props) => (
  <FoodEmptyState type="no-food-logs" {...props} />
);

export const RestaurantEmptyState: React.FC<Omit<FoodEmptyStateProps, 'type'>> = (props) => (
  <FoodEmptyState type="no-restaurants" {...props} />
);

export const RecommendationEmptyState: React.FC<Omit<FoodEmptyStateProps, 'type'>> = (props) => (
  <FoodEmptyState type="no-recommendations" {...props} />
);

export const SearchEmptyState: React.FC<Omit<FoodEmptyStateProps, 'type'>> = (props) => (
  <FoodEmptyState type="no-search-results" {...props} />
);

// CSS-in-JS styles
const styles = `
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12) var(--space-6);
  text-align: center;
  min-height: 300px;
}

.empty-state-illustration {
  display: flex;
  flex-direction: column;
  align-items: center;
}

@media (max-width: 640px) {
  .empty-state {
    padding: var(--space-8) var(--space-4);
    min-height: 250px;
  }
  
  .empty-state-illustration .w-20 {
    width: 60px;
    height: 60px;
  }
  
  .empty-state-illustration .w-10 {
    width: 30px;
    height: 30px;
  }
  
  .empty-state-illustration .text-4xl {
    font-size: 2rem;
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}