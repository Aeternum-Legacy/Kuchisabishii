'use client';

import React, { useState } from 'react';
import { FriendSuggestion } from '@/types/mobile';
import { useHapticFeedback } from '@/hooks/useMobileInteractions';
import { mobileTheme } from '@/styles/mobile-theme';

interface FriendSuggestionsProps {
  suggestions: FriendSuggestion[];
  onAddFriend: (friendId: string) => void;
  onViewProfile: (friendId: string) => void;
  className?: string;
}

export const FriendSuggestions: React.FC<FriendSuggestionsProps> = ({
  suggestions,
  onAddFriend,
  onViewProfile,
  className = '',
}) => {
  const [addingFriends, setAddingFriends] = useState<Set<string>>(new Set());
  const [pressedCard, setPressedCard] = useState<string | null>(null);
  const { triggerHaptic } = useHapticFeedback();

  const handleAddFriend = async (friendId: string) => {
    if (addingFriends.has(friendId)) return;
    
    triggerHaptic('success');
    setAddingFriends(prev => new Set([...prev, friendId]));
    
    try {
      await onAddFriend(friendId);
      
      // Keep loading state for a bit to show success
      setTimeout(() => {
        setAddingFriends(prev => {
          const newSet = new Set(prev);
          newSet.delete(friendId);
          return newSet;
        });
      }, 1000);
    } catch (error) {
      triggerHaptic('error');
      setAddingFriends(prev => {
        const newSet = new Set(prev);
        newSet.delete(friendId);
        return newSet;
      });
    }
  };

  const handleViewProfile = (friendId: string) => {
    triggerHaptic('light');
    onViewProfile(friendId);
  };

  const getSimilarityColor = (similarity: number): string => {
    if (similarity >= 80) return mobileTheme.colors.success;
    if (similarity >= 60) return mobileTheme.colors.warning;
    return mobileTheme.colors.secondary;
  };

  const getSimilarityText = (similarity: number): string => {
    if (similarity >= 80) return 'Very Similar';
    if (similarity >= 60) return 'Similar';
    return 'Somewhat Similar';
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 className="font-bold text-lg text-gray-800" style={mobileTheme.typography.h3}>
          Suggested Friends
        </h2>
        <span className="text-sm text-gray-500">
          {suggestions.length} suggestions
        </span>
      </div>

      {/* Suggestions List */}
      <div className="divide-y divide-gray-100">
        {suggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No suggestions</h3>
            <p className="text-gray-500 text-center">
              We'll show friend suggestions based on your taste preferences
            </p>
          </div>
        ) : (
          suggestions.map((suggestion) => {
            const isAdding = addingFriends.has(suggestion.id);
            const isPressed = pressedCard === suggestion.id;
            
            return (
              <div
                key={suggestion.id}
                className={`
                  p-4 transition-all duration-200
                  ${isPressed ? 'bg-gray-50' : 'bg-white'}
                `}
                onTouchStart={() => setPressedCard(suggestion.id)}
                onTouchEnd={() => setPressedCard(null)}
                onMouseLeave={() => setPressedCard(null)}
              >
                <div className="flex items-center space-x-4">
                  {/* Profile Picture */}
                  <button
                    onClick={() => handleViewProfile(suggestion.id)}
                    className="relative flex-shrink-0"
                  >
                    <img
                      src={suggestion.avatar}
                      alt={suggestion.name}
                      className="w-16 h-16 rounded-full border-2 border-orange-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/api/placeholder/64/64';
                      }}
                    />
                    
                    {/* Similarity Badge */}
                    <div
                      className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: getSimilarityColor(suggestion.tasteSimilarity) }}
                    >
                      {suggestion.tasteSimilarity}%
                    </div>
                  </button>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <button
                          onClick={() => handleViewProfile(suggestion.id)}
                          className="font-semibold text-gray-800 hover:text-orange-500 transition-colors"
                          style={mobileTheme.typography.body1}
                        >
                          {suggestion.name}
                        </button>
                        
                        {/* Mutual Friends */}
                        {suggestion.mutualFriends > 0 && (
                          <p className="text-sm text-gray-500 mt-1">
                            👥 {suggestion.mutualFriends} mutual friend{suggestion.mutualFriends > 1 ? 's' : ''}
                          </p>
                        )}
                        
                        {/* Taste Similarity */}
                        <div className="flex items-center space-x-2 mt-2">
                          <div
                            className="px-2 py-1 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: getSimilarityColor(suggestion.tasteSimilarity) }}
                          >
                            {getSimilarityText(suggestion.tasteSimilarity)}
                          </div>
                        </div>
                        
                        {/* Favorite Categories */}
                        <div className="flex items-center space-x-1 mt-2">
                          {suggestion.favoriteCategories.slice(0, 3).map((category, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                            >
                              {category}
                            </span>
                          ))}
                          {suggestion.favoriteCategories.length > 3 && (
                            <span className="text-gray-400 text-xs">
                              +{suggestion.favoriteCategories.length - 3}
                            </span>
                          )}
                        </div>
                        
                        {/* Recent Activity */}
                        <p className="text-xs text-gray-400 mt-1">
                          {suggestion.recentActivity}
                        </p>
                      </div>

                      {/* Add Friend Button */}
                      <button
                        onClick={() => handleAddFriend(suggestion.id)}
                        disabled={isAdding}
                        className={`
                          flex items-center justify-center px-4 py-2 rounded-full font-medium transition-all duration-200 active:scale-95
                          ${isAdding
                            ? 'bg-green-500 text-white'
                            : 'bg-orange-500 hover:bg-orange-600 text-white'
                          }
                        `}
                        style={{ 
                          minHeight: mobileTheme.touchTarget.minHeight,
                          minWidth: mobileTheme.touchTarget.minWidth,
                        }}
                      >
                        {isAdding ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm">Adding...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span>➕</span>
                            <span className="text-sm">Add</span>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Taste Match Details */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Taste Match</span>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${suggestion.tasteSimilarity}%`,
                            backgroundColor: getSimilarityColor(suggestion.tasteSimilarity),
                          }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-700">
                        {suggestion.tasteSimilarity}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* View All Link */}
      {suggestions.length > 0 && (
        <div className="p-4 border-t border-gray-100">
          <button className="w-full py-3 text-orange-500 font-medium text-center hover:text-orange-600 transition-colors">
            View All Suggestions
          </button>
        </div>
      )}
    </div>
  );
};

// Sample friend suggestions data
export const sampleFriendSuggestions: FriendSuggestion[] = [
  {
    id: 'friend1',
    name: 'Alex Rodriguez',
    avatar: '/api/placeholder/64/64',
    mutualFriends: 3,
    tasteSimilarity: 87,
    favoriteCategories: ['Ramen', 'Sushi', 'Korean'],
    recentActivity: 'Posted 2 food reviews this week',
  },
  {
    id: 'friend2',
    name: 'Jessica Park',
    avatar: '/api/placeholder/64/64',
    mutualFriends: 1,
    tasteSimilarity: 72,
    favoriteCategories: ['Pizza', 'Italian', 'Desserts'],
    recentActivity: 'Tried 5 new restaurants this month',
  },
  {
    id: 'friend3',
    name: 'David Kim',
    avatar: '/api/placeholder/64/64',
    mutualFriends: 5,
    tasteSimilarity: 91,
    favoriteCategories: ['BBQ', 'Burgers', 'Mexican'],
    recentActivity: 'Active food explorer - 12 posts this week',
  },
  {
    id: 'friend4',
    name: 'Maria Lopez',
    avatar: '/api/placeholder/64/64',
    mutualFriends: 0,
    tasteSimilarity: 65,
    favoriteCategories: ['Vegan', 'Healthy', 'Smoothies'],
    recentActivity: 'New to the app - joined yesterday',
  },
  {
    id: 'friend5',
    name: 'James Wilson',
    avatar: '/api/placeholder/64/64',
    mutualFriends: 2,
    tasteSimilarity: 78,
    favoriteCategories: ['Coffee', 'Pastries', 'Brunch'],
    recentActivity: 'Coffee enthusiast - 8 cafe reviews',
  },
];