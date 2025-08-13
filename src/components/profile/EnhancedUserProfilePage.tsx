'use client'

/**
 * Enhanced User Profile Page
 * Complete profile management with all Phase 5 components integrated
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Target, History, TrendingUp, 
  BarChart3, Settings, Award, Brain
} from 'lucide-react'
import EnhancedPalateProfileTab from './EnhancedPalateProfileTab'
import FoodHistoryTabs from './FoodHistoryTabs'
import RecommendationAccuracyDashboard from './RecommendationAccuracyDashboard'
import ExperienceComparisonTracker from './ExperienceComparisonTracker'
import AuthWrapper from '@/components/auth/AuthWrapper'

interface UserProfile {
  id: string
  name: string
  email: string
  avatar_url?: string
  created_at: string
  total_experiences: number
  favorite_cuisines: string[]
  dietary_restrictions: string[]
  accuracy_score: number
}

interface EnhancedTasteProfile {
  sweet: number
  salty: number
  sour: number
  bitter: number
  umami: number
  spicy: number
  crunchy: number
  creamy: number
  chewy: number
  hot: number
  cold: number
  overall_intensity: number
  flavor_balance_score: number
  texture_preference_score: number
  temperature_sensitivity: number
  culinary_adventurousness: number
  dominant_taste_category: string
  flavor_personality: string
  recommended_cuisines: string[]
  dietary_patterns: string[]
  profile_stability: number
  last_updated: string
  total_experiences: number
  confidence_level: number
}

interface ProfileEvolution {
  date: string
  change_magnitude: number
  trigger_food: string
  change_type: 'gradual' | 'sudden' | 'seasonal'
}

export default function EnhancedUserProfilePage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'accuracy' | 'evolution' | 'settings'>('profile')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [tasteProfile, setTasteProfile] = useState<EnhancedTasteProfile | null>(null)
  const [profileEvolution, setProfileEvolution] = useState<ProfileEvolution[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setIsLoading(true)
      
      // Load user profile
      const profileResponse = await fetch('/api/profile')
      const profileData = await profileResponse.json()
      
      if (profileData.success) {
        setUserProfile(profileData.data.profile)
      }
      
      // Load taste profile
      const tasteResponse = await fetch('/api/profile/taste-profile')
      const tasteData = await tasteResponse.json()
      
      if (tasteData.success) {
        setTasteProfile(tasteData.data.profile)
        setProfileEvolution(tasteData.data.evolution || [])
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateTasteProfile = async (updates: Partial<EnhancedTasteProfile>) => {
    try {
      const response = await fetch('/api/profile/taste-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setTasteProfile(prev => prev ? { ...prev, ...updates } : null)
      }
    } catch (error) {
      console.error('Failed to update taste profile:', error)
      throw error
    }
  }

  const tabs = [
    {
      id: 'profile',
      label: 'Taste Profile',
      icon: Target,
      description: 'Your 11-dimensional taste preferences'
    },
    {
      id: 'history',
      label: 'Food History',
      icon: History,
      description: 'Recent meals, favorites, and to-try list'
    },
    {
      id: 'accuracy',
      label: 'AI Accuracy',
      icon: BarChart3,
      description: 'How well our AI learns your preferences'
    },
    {
      id: 'evolution',
      label: 'Taste Evolution',
      icon: TrendingUp,
      description: 'Track how your preferences change over time'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Account and privacy settings'
    }
  ]

  if (isLoading) {
    return (
      <AuthWrapper>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-4"
          >
            <Brain size={48} className="text-purple-500" />
          </motion.div>
          <div className="ml-4">
            <h2 className="text-xl font-semibold text-gray-900">Loading your profile...</h2>
            <p className="text-gray-600">Analyzing your taste preferences and dining history</p>
          </div>
        </div>
      </AuthWrapper>
    )
  }

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        {/* Profile Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  {userProfile?.avatar_url ? (
                    <img 
                      src={userProfile.avatar_url}
                      alt={userProfile.name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  
                  {/* Status indicator */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <Award size={12} className="text-white" />
                  </div>
                </div>
                
                {/* Profile Info */}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {userProfile?.name || 'User'}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {userProfile?.email}
                  </p>
                  
                  {/* Quick Stats */}
                  <div className="flex items-center gap-6 mt-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <History size={14} />
                      <span>{userProfile?.total_experiences || 0} experiences</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Target size={14} />
                      <span>{userProfile?.accuracy_score || 0}% AI accuracy</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>Member since {userProfile?.created_at ? new Date(userProfile.created_at).getFullYear() : 'recently'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Profile Completion */}
              <div className="text-right">
                <div className="text-sm text-gray-600 mb-2">Profile Completion</div>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${tasteProfile?.confidence_level || 0}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {tasteProfile?.confidence_level || 0}% complete
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-3 py-4 px-2 border-b-2 transition-colors relative ${
                      activeTab === tab.id
                        ? 'border-purple-600 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={20} />
                    <div className="text-left">
                      <div className="font-medium">{tab.label}</div>
                      <div className="text-xs opacity-75 hidden md:block">
                        {tab.description}
                      </div>
                    </div>
                    
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-purple-50 rounded-t-lg -z-10"
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'profile' && tasteProfile && (
                <EnhancedPalateProfileTab
                  profile={tasteProfile}
                  evolution={profileEvolution}
                  onUpdateProfile={updateTasteProfile}
                  isEditable={true}
                />
              )}

              {activeTab === 'history' && userProfile && (
                <FoodHistoryTabs userId={userProfile.id} />
              )}

              {activeTab === 'accuracy' && (
                <RecommendationAccuracyDashboard />
              )}

              {activeTab === 'evolution' && userProfile && (
                <ExperienceComparisonTracker userId={userProfile.id} />
              )}

              {activeTab === 'settings' && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <Settings className="text-purple-500" size={24} />
                    Account Settings
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Profile Settings */}
                    <div className="p-6 border border-gray-200 rounded-xl">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name
                          </label>
                          <input
                            type="text"
                            value={userProfile?.name || ''}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            value={userProfile?.email || ''}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Privacy Settings */}
                    <div className="p-6 border border-gray-200 rounded-xl">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy & Data</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">Data Collection</div>
                            <div className="text-sm text-gray-600">Allow AI to learn from your dining experiences</div>
                          </div>
                          <input type="checkbox" className="toggle" defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">Social Sharing</div>
                            <div className="text-sm text-gray-600">Share recommendations with friends</div>
                          </div>
                          <input type="checkbox" className="toggle" defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">Location Services</div>
                            <div className="text-sm text-gray-600">Use location for nearby recommendations</div>
                          </div>
                          <input type="checkbox" className="toggle" defaultChecked />
                        </div>
                      </div>
                    </div>
                    
                    {/* Data Export */}
                    <div className="p-6 border border-gray-200 rounded-xl">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
                      <div className="space-y-4">
                        <button className="w-full md:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                          Export My Data
                        </button>
                        
                        <button className="w-full md:w-auto px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors ml-0 md:ml-4">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </AuthWrapper>
  )
}