'use client'

/**
 * Group Recommendation System Component
 * Collaborative taste profiling, voting, and consensus recommendations
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, Plus, Vote, Target, Crown, Clock,
  Check, X, Star, MapPin, DollarSign, Utensils,
  TrendingUp, Heart, Zap, Award, ChefHat, Navigation
} from 'lucide-react'

interface GroupMember {
  id: string
  name: string
  avatar?: string
  taste_profile: Record<string, number>
  dietary_restrictions: string[]
  current_mood: string
  vote_weight: number
}

interface GroupSession {
  id: string
  name: string
  created_by: string
  members: GroupMember[]
  voting_deadline?: string
  location?: { latitude: number; longitude: number }
  budget_range?: { min: number; max: number }
  meal_type: string
  status: 'creating' | 'voting' | 'decided' | 'dining'
  consensus_reached: boolean
}

interface GroupRecommendation {
  id: string
  restaurant_name: string
  restaurant_address: string
  cuisine_types: string[]
  group_match_score: number
  individual_scores: Record<string, number>
  price_range: number
  estimated_wait: number
  distance_km: number
  votes: Record<string, 'for' | 'against' | 'neutral'>
  vote_count: { for: number; against: number; neutral: number }
  consensus_factors: string[]
  compromise_level: 'perfect' | 'good' | 'acceptable' | 'compromise'
  menu_highlights: string[]
}

interface GroupRecommendationSystemProps {
  userId: string
  onGroupDecision: (recommendation: GroupRecommendation) => void
}

export default function GroupRecommendationSystem({ 
  userId, 
  onGroupDecision 
}: GroupRecommendationSystemProps) {
  const [currentGroup, setCurrentGroup] = useState<GroupSession | null>(null)
  const [recommendations, setRecommendations] = useState<GroupRecommendation[]>([])
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [isVoting, setIsVoting] = useState(false)
  const [votingTimeLeft, setVotingTimeLeft] = useState<number | null>(null)
  const [finalRecommendation, setFinalRecommendation] = useState<GroupRecommendation | null>(null)

  // Voting countdown timer
  useEffect(() => {
    if (currentGroup?.voting_deadline && votingTimeLeft === null) {
      const deadline = new Date(currentGroup.voting_deadline).getTime()
      const now = new Date().getTime()
      setVotingTimeLeft(Math.max(0, deadline - now))
    }

    if (votingTimeLeft && votingTimeLeft > 0) {
      const timer = setInterval(() => {
        setVotingTimeLeft(prev => {
          if (!prev || prev <= 1000) {
            clearInterval(timer)
            return 0
          }
          return prev - 1000
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [currentGroup, votingTimeLeft])

  const createGroup = async (groupName: string) => {
    try {
      const response = await fetch('/api/recommendations/group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: groupName,
          created_by: userId,
          meal_type: 'dinner' // Default, can be customized
        })
      })

      const data = await response.json()
      if (data.success) {
        setCurrentGroup(data.data.group)
        setInviteCode(data.data.invite_code)
        setShowCreateGroup(false)
        setNewGroupName('')
      }
    } catch (error) {
      console.error('Failed to create group:', error)
    }
  }

  const joinGroup = async (code: string) => {
    try {
      const response = await fetch('/api/recommendations/group/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_code: code, user_id: userId })
      })

      const data = await response.json()
      if (data.success) {
        setCurrentGroup(data.data.group)
      }
    } catch (error) {
      console.error('Failed to join group:', error)
    }
  }

  const startVoting = async () => {
    try {
      // Generate group recommendations
      const response = await fetch(`/api/recommendations/group/${currentGroup?.id}/generate`, {
        method: 'POST'
      })

      const data = await response.json()
      if (data.success) {
        setRecommendations(data.data.recommendations)
        setIsVoting(true)
        setVotingTimeLeft(10 * 60 * 1000) // 10 minutes
      }
    } catch (error) {
      console.error('Failed to start voting:', error)
    }
  }

  const castVote = async (recommendationId: string, vote: 'for' | 'against' | 'neutral') => {
    try {
      await fetch(`/api/recommendations/group/${currentGroup?.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recommendation_id: recommendationId,
          user_id: userId,
          vote
        })
      })

      // Update local state
      setRecommendations(prev => prev.map(rec => {
        if (rec.id === recommendationId) {
          const newVotes = { ...rec.votes, [userId]: vote }
          const voteCount = {
            for: Object.values(newVotes).filter(v => v === 'for').length,
            against: Object.values(newVotes).filter(v => v === 'against').length,
            neutral: Object.values(newVotes).filter(v => v === 'neutral').length
          }
          return { ...rec, votes: newVotes, vote_count: voteCount }
        }
        return rec
      }))

      // Check for consensus
      checkConsensus()
    } catch (error) {
      console.error('Failed to cast vote:', error)
    }
  }

  const checkConsensus = () => {
    if (!currentGroup) return

    const totalMembers = currentGroup.members.length
    const consensusThreshold = Math.ceil(totalMembers * 0.7) // 70% agreement

    const consensusRec = recommendations.find(rec => 
      rec.vote_count.for >= consensusThreshold
    )

    if (consensusRec) {
      setFinalRecommendation(consensusRec)
      setCurrentGroup(prev => prev ? { ...prev, status: 'decided', consensus_reached: true } : null)
    }
  }

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / (1000 * 60))
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getCompromiseColor = (level: string) => {
    const colors = {
      'perfect': 'bg-green-100 text-green-700 border-green-200',
      'good': 'bg-blue-100 text-blue-700 border-blue-200',
      'acceptable': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'compromise': 'bg-orange-100 text-orange-700 border-orange-200'
    }
    return colors[level as keyof typeof colors]
  }

  // No group state
  if (!currentGroup) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Users size={48} className="text-purple-600" />
          </motion.div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Group Dining Decision
          </h2>
          <p className="text-gray-600">
            Find the perfect restaurant that everyone will love
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create New Group */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-100 cursor-pointer"
            onClick={() => setShowCreateGroup(true)}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Create Group</h3>
              <p className="text-gray-600">Start a new dining decision session</p>
            </div>
          </motion.div>

          {/* Join Existing Group */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-8 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl border border-green-100"
          >
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Join Group</h3>
              <p className="text-gray-600 mb-4">Enter an invite code</p>
            </div>
            
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Enter invite code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                onClick={() => joinGroup(inviteCode)}
                disabled={!inviteCode.trim()}
                className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Join Group
              </button>
            </div>
          </motion.div>
        </div>

        {/* Create Group Modal */}
        <AnimatePresence>
          {showCreateGroup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-2xl p-8 max-w-md w-full"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Create Dining Group
                </h3>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Group Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Friday Night Dinner"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCreateGroup(false)}
                    className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => createGroup(newGroupName)}
                    disabled={!newGroupName.trim()}
                    className="flex-1 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Create
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Group created/joined - waiting for members or voting
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Group Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="text-purple-500" size={32} />
              {currentGroup.name}
            </h2>
            <p className="text-gray-600 mt-1">
              {currentGroup.members.length} member{currentGroup.members.length !== 1 ? 's' : ''} • 
              {currentGroup.meal_type.charAt(0).toUpperCase() + currentGroup.meal_type.slice(1)}
            </p>
          </div>
          
          {currentGroup.status === 'creating' && (
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-2">Invite Code</div>
              <div className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-mono font-bold text-lg">
                {inviteCode}
              </div>
            </div>
          )}
        </div>

        {/* Members */}
        <div className="flex flex-wrap gap-4 mb-6">
          {currentGroup.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg"
            >
              {member.avatar ? (
                <img 
                  src={member.avatar} 
                  alt={member.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <div className="font-medium text-gray-900">{member.name}</div>
                {member.current_mood && (
                  <div className="text-xs text-gray-500">{member.current_mood}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        {currentGroup.status === 'creating' && currentGroup.members.length >= 2 && (
          <div className="text-center">
            <button
              onClick={startVoting}
              className="px-8 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium flex items-center gap-2 mx-auto"
            >
              <Vote size={20} />
              Start Voting
            </button>
          </div>
        )}
      </div>

      {/* Voting Interface */}
      {isVoting && !finalRecommendation && (
        <div className="space-y-6">
          {/* Voting Timer */}
          {votingTimeLeft !== null && votingTimeLeft > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
              <div className="flex items-center justify-center gap-3">
                <Clock className="text-orange-600" size={24} />
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatTime(votingTimeLeft)}
                  </div>
                  <div className="text-sm text-orange-700">Time remaining</div>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 text-center">
              Vote on Restaurant Options
            </h3>
            
            {recommendations.map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-8"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h4 className="text-2xl font-bold text-gray-900">
                        {rec.restaurant_name}
                      </h4>
                      
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                        getCompromiseColor(rec.compromise_level)
                      }`}>
                        {rec.compromise_level} match
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-6 mb-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span>{rec.restaurant_address}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} />
                        <span>{'$'.repeat(rec.price_range)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Navigation size={16} />
                        <span>{rec.distance_km}km away</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>{rec.estimated_wait}min wait</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {rec.cuisine_types.map(cuisine => (
                        <span
                          key={cuisine}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                        >
                          {cuisine}
                        </span>
                      ))}
                    </div>
                    
                    <div className="mb-4">
                      <h5 className="font-semibold text-gray-900 mb-2">Menu Highlights</h5>
                      <div className="flex flex-wrap gap-2">
                        {rec.menu_highlights.map(item => (
                          <span
                            key={item}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h5 className="font-semibold text-gray-900 mb-2">Why this works for your group</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {rec.consensus_factors.map((factor, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <Zap size={12} className="text-purple-500" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="text-center ml-8">
                    <div className="text-4xl font-bold text-purple-600 mb-2">
                      {rec.group_match_score}%
                    </div>
                    <div className="text-sm text-gray-600 mb-4">Group Match</div>
                    
                    {/* Individual Scores */}
                    <div className="space-y-2 mb-6">
                      {currentGroup.members.map(member => (
                        <div key={member.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{member.name}</span>
                          <span className="font-medium">
                            {rec.individual_scores[member.id] || 0}%
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Voting Buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={() => castVote(rec.id, 'for')}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors font-medium ${
                          rec.votes[userId] === 'for'
                            ? 'bg-green-500 text-white'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        <Check size={16} />
                        Yes ({rec.vote_count.for})
                      </button>
                      
                      <button
                        onClick={() => castVote(rec.id, 'against')}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors font-medium ${
                          rec.votes[userId] === 'against'
                            ? 'bg-red-500 text-white'
                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        <X size={16} />
                        No ({rec.vote_count.against})
                      </button>
                      
                      <button
                        onClick={() => castVote(rec.id, 'neutral')}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors font-medium ${
                          rec.votes[userId] === 'neutral'
                            ? 'bg-gray-500 text-white'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Heart size={16} />
                        Maybe ({rec.vote_count.neutral})
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Final Decision */}
      {finalRecommendation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl shadow-lg p-8 text-center"
        >
          <div className="mb-6">
            <Crown size={48} className="text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">We Have a Winner!</h2>
            <p className="text-gray-600">Your group has reached consensus</p>
          </div>
          
          <div className="bg-white rounded-xl p-8 mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {finalRecommendation.restaurant_name}
            </h3>
            
            <div className="flex items-center justify-center gap-8 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500">
                  {finalRecommendation.group_match_score}%
                </div>
                <div className="text-sm text-gray-600">Group Match</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-500">
                  {finalRecommendation.vote_count.for}
                </div>
                <div className="text-sm text-gray-600">Votes For</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-6 text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>{finalRecommendation.distance_km}km away</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{finalRecommendation.estimated_wait}min wait</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign size={16} />
                <span>{'$'.repeat(finalRecommendation.price_range)}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => onGroupDecision(finalRecommendation)}
            className="px-12 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white text-lg font-bold rounded-full shadow-lg hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-105"
          >
            Let&apos;s Go!
          </button>
        </motion.div>
      )}
    </div>
  )
}