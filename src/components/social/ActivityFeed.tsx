'use client'

import { useState, useEffect } from 'react'
import { Star, Heart, MessageCircle, Share2, RefreshCw } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import FoodImage from '../FoodImage'
import { getFoodEmoji } from '@/utils/foodEmojis'

interface FoodShare {
  id: string
  content_type: string
  content_id: string
  visibility: string
  shared_at: string
  user: {
    id: string
    display_name: string
    profile_image_url?: string
  }
  food_experience: {
    id: string
    food_name: string
    restaurant_name: string
    rating: number
    experience_notes: string
    photo_url?: string
    date_eaten: string
  }
}

interface ActivityFeedProps {
  onBack?: () => void
}

export default function ActivityFeed({ onBack }: ActivityFeedProps) {
  const { user } = useAuth()
  const [shares, setShares] = useState<FoodShare[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadShares = async (refresh = false) => {
    if (refresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await fetch('/api/social/share')
      if (response.ok) {
        const data = await response.json()
        setShares(data.shares || [])
      }
    } catch (error) {
      console.error('Failed to load activity feed:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadShares()
  }, [])

  const handleRefresh = () => {
    loadShares(true)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) {
      return `${diffMins}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else if (diffDays < 7) {
      return `${diffDays}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading activity feed...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Friends&apos; Activity</h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg disabled:opacity-50"
            title="Refresh feed"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="p-4">
        {shares.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Share2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Activity Yet</h3>
            <p className="text-gray-600 mb-4">Your friends haven&apos;t shared any food reviews yet.</p>
            <p className="text-sm text-gray-500">
              Add more friends or encourage them to share their food experiences!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {shares.map((share) => (
              <div key={share.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                {/* User Header */}
                <div className="flex items-center space-x-3 p-4 pb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {share.user.profile_image_url ? (
                      <img 
                        src={share.user.profile_image_url} 
                        alt={share.user.display_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg">👤</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{share.user.display_name}</h3>
                    <p className="text-sm text-gray-600">shared a food review</p>
                  </div>
                  <span className="text-xs text-gray-500">{formatTimeAgo(share.shared_at)}</span>
                </div>

                {/* Food Review Content */}
                <div className="px-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <FoodImage
                        src={share.food_experience.photo_url}
                        alt={share.food_experience.food_name}
                        fallbackEmoji={getFoodEmoji(share.food_experience.food_name, '', '')}
                        size="lg"
                        className="flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-800">{share.food_experience.food_name}</h4>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${
                                  i < share.food_experience.rating 
                                    ? 'text-yellow-400 fill-current' 
                                    : 'text-gray-300'
                                }`} 
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{share.food_experience.restaurant_name}</p>
                        <p className="text-sm text-gray-700">{share.food_experience.experience_notes}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Eaten on {new Date(share.food_experience.date_eaten).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interaction Buttons */}
                <div className="flex items-center justify-between p-4 pt-3 border-t border-gray-100 mt-3">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">Like</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">Comment</span>
                    </button>
                  </div>
                  <button className="flex items-center space-x-1 text-gray-500 hover:text-orange-500 transition-colors">
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm">Share</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}