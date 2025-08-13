'use client';

import React, { useState } from 'react';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { FoodCard, sampleFoodCards } from '@/components/mobile/FoodCard';
import { CategoryScroll, sampleCategories } from '@/components/mobile/CategoryScroll';
import { ActivityFeed, sampleActivityFeedItems } from '@/components/social/ActivityFeed';
import { FriendSuggestions, sampleFriendSuggestions } from '@/components/social/FriendSuggestions';

export default function MobileDemoPage() {
  const [activeTab, setActiveTab] = useState('home');
  const [activeCategory, setActiveCategory] = useState('all');
  const [foodCards, setFoodCards] = useState(sampleFoodCards);
  const [activityItems, setActivityItems] = useState(sampleActivityFeedItems);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  const handleFoodLike = (cardId: string) => {
    setFoodCards(prev => prev.map(card => 
      card.id === cardId 
        ? { 
            ...card, 
            isLiked: !card.isLiked, 
            likes: card.isLiked ? card.likes - 1 : card.likes + 1 
          }
        : card
    ));
  };

  const handleActivityLike = (itemId: string) => {
    setActivityItems(prev => prev.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            isLiked: !item.isLiked, 
            likes: item.isLiked ? item.likes - 1 : item.likes + 1 
          }
        : item
    ));
  };

  const handleRefresh = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Refreshed!');
  };

  const handleAddFriend = async (friendId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Added friend:', friendId);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-6">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 mx-4 rounded-xl shadow-lg">
              <h1 className="text-2xl font-bold mb-2">Welcome back! 👋</h1>
              <p className="text-orange-100">Discover amazing food experiences near you</p>
            </div>

            {/* Categories */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 px-4 mb-3">Categories</h2>
              <CategoryScroll
                categories={sampleCategories}
                activeCategory={activeCategory}
                onCategorySelect={handleCategorySelect}
              />
            </div>

            {/* Food Cards */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 px-4 mb-3">Recent Posts</h2>
              <div className="space-y-4">
                {foodCards.map(card => (
                  <FoodCard
                    key={card.id}
                    {...card}
                    onLike={() => handleFoodLike(card.id)}
                    onComment={() => console.log('Comment on', card.id)}
                    onShare={() => console.log('Share', card.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case 'search':
        return (
          <div className="p-4 space-y-6">
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Search Foods & Restaurants</h2>
              <p className="text-gray-500">Find your next favorite dish</p>
            </div>
          </div>
        );

      case 'add':
        return (
          <div className="p-4 space-y-6">
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📸</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Add Food Experience</h2>
              <p className="text-gray-500">Share your culinary discoveries</p>
              <button className="mt-4 bg-orange-500 text-white px-6 py-3 rounded-full font-medium">
                Take Photo
              </button>
            </div>
          </div>
        );

      case 'social':
        return (
          <div className="h-full flex flex-col">
            <div className="flex-1">
              <ActivityFeed
                items={activityItems}
                onRefresh={handleRefresh}
                onLike={handleActivityLike}
                onComment={(itemId) => console.log('Comment on', itemId)}
                onUserClick={(userId) => console.log('View user', userId)}
              />
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="bg-white p-6 mx-4 rounded-xl shadow-md">
              <div className="flex items-center space-x-4">
                <img
                  src="/api/placeholder/80/80"
                  alt="Profile"
                  className="w-20 h-20 rounded-full border-4 border-orange-200"
                />
                <div>
                  <h2 className="text-xl font-bold text-gray-800">John Doe</h2>
                  <p className="text-gray-600">Food Explorer</p>
                  <div className="flex space-x-4 mt-2 text-sm">
                    <span><strong>127</strong> Posts</span>
                    <span><strong>256</strong> Following</span>
                    <span><strong>189</strong> Followers</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Friend Suggestions */}
            <FriendSuggestions
              suggestions={sampleFriendSuggestions}
              onAddFriend={handleAddFriend}
              onViewProfile={(friendId) => console.log('View profile', friendId)}
            />
          </div>
        );

      default:
        return (
          <div className="p-4 text-center">
            <p className="text-gray-500">Tab content for {activeTab}</p>
          </div>
        );
    }
  };

  return (
    <MobileLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      className="bg-gray-50"
    >
      <div className="h-full overflow-y-auto">
        {renderTabContent()}
      </div>
    </MobileLayout>
  );
}