'use client'

/**
 * Food History Tabs Component
 * Enhanced food history with recent, favorites, and to-try sections
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, Heart, Bookmark, Star, MapPin, 
  DollarSign, Calendar, Filter, Search,
  TrendingUp, Award, Utensils, Eye, Plus
} from 'lucide-react'

interface FoodHistoryItem {
  id: string
  food_name: string
  restaurant_name: string
  restaurant_address: string
  image_url?: string
  rating: number
  emotional_rating: number
  price: number
  date_consumed: string
  cuisine_type: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  dining_method: 'dine_in' | 'takeout' | 'delivery'
  tags: string[]
  notes?: string
  is_favorite: boolean
  want_to_try_again: boolean
  times_ordered: number
}

interface ToTryItem {
  id: string
  food_name: string
  restaurant_name: string
  image_url?: string
  cuisine_type: string
  price_range: number
  priority_level: 'low' | 'medium' | 'high'
  added_date: string
  source: 'recommendation' | 'friend' | 'social' | 'manual'
  notes?: string
}

interface FoodHistoryTabsProps {
  userId: string
}

export default function FoodHistoryTabs({ userId }: FoodHistoryTabsProps) {
  const [activeTab, setActiveTab] = useState<'recent' | 'favorites' | 'to_try'>('recent')
  const [recentItems, setRecentItems] = useState<FoodHistoryItem[]>([])
  const [favoriteItems, setFavoriteItems] = useState<FoodHistoryItem[]>([])
  const [toTryItems, setToTryItems] = useState<ToTryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCuisine, setFilterCuisine] = useState('all')
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'price' | 'name'>('date')

  useEffect(() => {
    loadFoodHistory()
  }, [userId, activeTab])

  const loadFoodHistory = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`/api/profile/food-history?tab=${activeTab}&user_id=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        switch (activeTab) {
          case 'recent':
            setRecentItems(data.data.items)
            break
          case 'favorites':
            setFavoriteItems(data.data.items)
            break
          case 'to_try':
            setToTryItems(data.data.items)
            break
        }
      }
    } catch (error) {
      console.error('Failed to load food history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFavorite = async (itemId: string) => {
    try {
      await fetch(`/api/profile/food-history/${itemId}/favorite`, {
        method: 'POST'
      })
      
      // Update local state
      setRecentItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, is_favorite: !item.is_favorite } : item
      ))
      
      // Refresh favorites tab if active
      if (activeTab === 'favorites') {
        loadFoodHistory()
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  const addToTryList = async (foodName: string, restaurantName: string, priority: 'low' | 'medium' | 'high') => {
    try {
      await fetch('/api/profile/to-try', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          food_name: foodName,
          restaurant_name: restaurantName,
          priority_level: priority,
          source: 'manual'
        })
      })
      
      if (activeTab === 'to_try') {
        loadFoodHistory()
      }
    } catch (error) {
      console.error('Failed to add to try list:', error)
    }
  }

  const markAsTried = async (itemId: string) => {
    try {
      await fetch(`/api/profile/to-try/${itemId}/tried`, {
        method: 'POST'
      })
      
      setToTryItems(prev => prev.filter(item => item.id !== itemId))
    } catch (error) {
      console.error('Failed to mark as tried:', error)
    }
  }

  const getFilteredItems = () => {
    let items: Record<string, unknown>[] = []
    
    switch (activeTab) {
      case 'recent':
        items = recentItems
        break
      case 'favorites':
        items = favoriteItems
        break
      case 'to_try':
        items = toTryItems
        break
    }

    // Apply search filter
    if (searchQuery) {
      items = items.filter(item => 
        item.food_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.restaurant_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply cuisine filter
    if (filterCuisine !== 'all') {
      items = items.filter(item => item.cuisine_type === filterCuisine)
    }

    // Apply sorting
    items.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date_consumed || b.added_date).getTime() - new Date(a.date_consumed || a.added_date).getTime()
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        case 'price':
          return (b.price || b.price_range || 0) - (a.price || a.price_range || 0)
        case 'name':
          return a.food_name.localeCompare(b.food_name)
        default:
          return 0
      }
    })

    return items
  }

  const renderStars = (rating: number, size = 16) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          size={size}
          className={`${
            star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  )

  const FoodHistoryCard = ({ item, type }: { item: Record<string, unknown>, type: 'recent' | 'favorites' | 'to_try' }) => {
    const isToTry = type === 'to_try'
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
      >
        {/* Image */}
        {item.image_url && (
          <div className="aspect-video w-full overflow-hidden">
            <img 
              src={item.image_url} 
              alt={item.food_name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {item.food_name}
              </h3>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <MapPin size={14} />
                <span className="text-sm">{item.restaurant_name}</span>
              </div>
            </div>
            
            {!isToTry && (
              <button
                onClick={() => toggleFavorite(item.id)}
                className={`p-2 rounded-lg transition-colors ${
                  item.is_favorite 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Heart size={16} fill={item.is_favorite ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>

          {/* Details */}
          <div className="space-y-3">
            {/* Rating and Price */}
            {!isToTry && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {renderStars(item.rating)}
                    <span className="text-sm font-medium text-gray-700">
                      {item.rating}/5
                    </span>
                  </div>
                  
                  {item.emotional_rating && (
                    <div className="flex items-center gap-1">
                      <Heart size={14} className="text-pink-500" />
                      <span className="text-sm text-pink-600 font-medium">
                        {item.emotional_rating}/10
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <DollarSign size={14} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    ${item.price}
                  </span>
                </div>
              </div>
            )}
            
            {/* To-try specific info */}
            {isToTry && (
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  item.priority_level === 'high' ? 'bg-red-100 text-red-700' :
                  item.priority_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {item.priority_level} priority
                </span>
                
                <div className="flex items-center gap-1">
                  <DollarSign size={14} className="text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {'$'.repeat(item.price_range)}
                  </span>
                </div>
              </div>
            )}

            {/* Meta info */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>
                  {new Date(item.date_consumed || item.added_date).toLocaleDateString()}
                </span>
              </div>
              
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                {item.cuisine_type}
              </span>
              
              {!isToTry && item.times_ordered > 1 && (
                <div className="flex items-center gap-1">
                  <Award size={12} className="text-orange-500" />
                  <span className="text-orange-600 font-medium">
                    {item.times_ordered}x
                  </span>
                </div>
              )}
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {item.tags.slice(0, 3).map((tag: string) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {item.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                    +{item.tags.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Notes */}
            {item.notes && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 italic">&ldquo;{item.notes}&rdquo;</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-3">
              {isToTry ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => markAsTried(item.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                  >
                    <Utensils size={14} />
                    Mark as Tried
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock size={12} className="text-gray-500" />
                    <span className="text-gray-600">{item.meal_type}</span>
                  </div>
                  
                  <span className={`px-2 py-1 rounded text-xs ${
                    item.dining_method === 'dine_in' ? 'bg-green-100 text-green-700' :
                    item.dining_method === 'takeout' ? 'bg-blue-100 text-blue-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {item.dining_method.replace('_', ' ')}
                  </span>
                </div>
              )}
              
              <div className="text-xs text-gray-500">
                {isToTry ? `Added via ${item.source}` : `Last eaten`}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  const filteredItems = getFilteredItems()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Food History</h2>
          <p className="text-gray-600">Track your culinary journey</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex">
          {[
            { id: 'recent', label: 'Recent', icon: Clock, count: recentItems.length },
            { id: 'favorites', label: 'Favorites', icon: Heart, count: favoriteItems.length },
            { id: 'to_try', label: 'To Try', icon: Bookmark, count: toTryItems.length }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'bg-purple-50 text-purple-700 border-purple-600'
                    : 'text-gray-600 hover:bg-gray-50 border-transparent'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{tab.label}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-purple-200 text-purple-800'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search food or restaurant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterCuisine}
            onChange={(e) => setFilterCuisine(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Cuisines</option>
            <option value="italian">Italian</option>
            <option value="mexican">Mexican</option>
            <option value="asian">Asian</option>
            <option value="american">American</option>
            <option value="mediterranean">Mediterranean</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="date">Sort by Date</option>
            <option value="rating">Sort by Rating</option>
            <option value="price">Sort by Price</option>
            <option value="name">Sort by Name</option>
          </select>
          
          {activeTab === 'to_try' && (
            <button
              onClick={() => {/* Show add to try modal */}}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              <Plus size={16} />
              Add Item
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-400 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading your food history...</p>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <FoodHistoryCard item={item} type={activeTab} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {activeTab === 'recent' && <Clock size={24} className="text-gray-400" />}
            {activeTab === 'favorites' && <Heart size={24} className="text-gray-400" />}
            {activeTab === 'to_try' && <Bookmark size={24} className="text-gray-400" />}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'recent' && 'No recent meals'}
            {activeTab === 'favorites' && 'No favorite foods yet'}
            {activeTab === 'to_try' && 'Nothing to try yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {activeTab === 'recent' && 'Start logging your meals to see your food history'}
            {activeTab === 'favorites' && 'Mark foods as favorites to see them here'}
            {activeTab === 'to_try' && 'Add restaurants and dishes you want to try'}
          </p>
        </div>
      )}
    </div>
  )
}