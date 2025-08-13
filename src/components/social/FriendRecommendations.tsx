'use client'

import { useState, useEffect } from 'react'
import { UserPlus, Users, Star, Sparkles } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface RecommendedFriend {
  id: string
  displayName: string
  firstName: string
  lastName: string
  profileImage?: string
  email: string
  recommendationReason: string
  mutualFriends: number
  similarTastes: number
  matchScore: number
  friendshipStatus: 'none' | 'pending' | 'accepted'
}

interface FriendRecommendationsProps {
  limit?: number
  showTitle?: boolean
}

export default function FriendRecommendations({ limit = 5, showTitle = true }: FriendRecommendationsProps) {
  const { user } = useAuth()
  const [recommendations, setRecommendations] = useState<RecommendedFriend[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecommendations()
  }, [])

  const loadRecommendations = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/friends/recommendations?limit=${limit}`)
      if (response.ok) {
        const data = await response.json()
        setRecommendations(data.recommendations || [])
      }
    } catch (error) {
      console.error('Failed to load friend recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendFriendRequest = async (userId: string) => {
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendUserId: userId })
      })
      
      if (response.ok) {
        // Update the recommendation status
        setRecommendations(prev => prev.map(rec => 
          rec.id === userId ? { ...rec, friendshipStatus: 'pending' } : rec
        ))
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to send friend request')
      }
    } catch (error) {
      console.error('Failed to send friend request:', error)
      alert('Failed to send friend request')
    }
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-blue-600 bg-blue-100'
    if (score >= 40) return 'text-yellow-600 bg-yellow-100'
    return 'text-gray-600 bg-gray-100'
  }

  const getRecommendationIcon = (reason: string) => {
    if (reason.includes('mutual')) return <Users className="w-4 h-4 text-blue-500" />
    if (reason.includes('taste')) return <Star className="w-4 h-4 text-yellow-500" />
    return <Sparkles className="w-4 h-4 text-purple-500" />
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {showTitle && <h3 className="text-lg font-semibold text-gray-800 mb-3">Friend Recommendations</h3>}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-16 h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {showTitle && (
        <div className="flex items-center space-x-2 mb-3">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-800">Friend Recommendations</h3>
        </div>
      )}
      
      {recommendations.map((friend) => (
        <div key={friend.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {friend.profileImage ? (
                  <img 
                    src={friend.profileImage} 
                    alt={friend.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg">👤</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-semibold text-gray-800">{friend.displayName}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getMatchScoreColor(friend.matchScore)}`}>
                    {friend.matchScore}% match
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  {getRecommendationIcon(friend.recommendationReason)}
                  <span>{friend.recommendationReason}</span>
                </div>
                {(friend.mutualFriends > 0 || friend.similarTastes > 0) && (
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                    {friend.mutualFriends > 0 && (
                      <span>
                        <Users className="w-3 h-3 inline mr-1" />
                        {friend.mutualFriends} mutual friend{friend.mutualFriends !== 1 ? 's' : ''}
                      </span>
                    )}
                    {friend.similarTastes > 0 && (
                      <span>
                        <Star className="w-3 h-3 inline mr-1" />
                        {friend.similarTastes} similar taste{friend.similarTastes !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {friend.friendshipStatus === 'none' ? (
              <button
                onClick={() => sendFriendRequest(friend.id)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-1 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add</span>
              </button>
            ) : friend.friendshipStatus === 'pending' ? (
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                Pending
              </span>
            ) : (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                Friends
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}