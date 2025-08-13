'use client'

/**
 * Enhanced Palate Profile Tab with 11-Dimensional Visualization
 * Advanced taste profiling with AI insights and evolution tracking
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Target, Brain, TrendingUp, Sparkles, Eye, 
  Zap, Award, RotateCcw, Save, Edit3, X,
  ChefHat, Globe, Heart, Star, Gauge, Info
} from 'lucide-react'

interface EnhancedTasteProfile {
  // 11-dimensional taste vector
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
  
  // Advanced metrics
  overall_intensity: number
  flavor_balance_score: number
  texture_preference_score: number
  temperature_sensitivity: number
  culinary_adventurousness: number
  
  // AI-derived insights
  dominant_taste_category: string
  flavor_personality: string
  recommended_cuisines: string[]
  dietary_patterns: string[]
  
  // Evolution tracking
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

interface EnhancedPalateProfileTabProps {
  profile: EnhancedTasteProfile
  evolution: ProfileEvolution[]
  onUpdateProfile: (updates: Partial<EnhancedTasteProfile>) => void
  isEditable?: boolean
}

export default function EnhancedPalateProfileTab({ 
  profile, 
  evolution, 
  onUpdateProfile,
  isEditable = true
}: EnhancedPalateProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editingProfile, setEditingProfile] = useState(profile)
  const [selectedView, setSelectedView] = useState<'radar' | '3d' | 'timeline' | 'insights'>('radar')
  const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false)

  // 11-dimensional taste data
  const tasteData = [
    { label: 'Sweet', value: profile.sweet, color: '#ec4899', category: 'basic' },
    { label: 'Salty', value: profile.salty, color: '#3b82f6', category: 'basic' },
    { label: 'Sour', value: profile.sour, color: '#f59e0b', category: 'basic' },
    { label: 'Bitter', value: profile.bitter, color: '#10b981', category: 'basic' },
    { label: 'Umami', value: profile.umami, color: '#8b5cf6', category: 'basic' },
    { label: 'Spicy', value: profile.spicy, color: '#ef4444', category: 'basic' },
    { label: 'Crunchy', value: profile.crunchy, color: '#f97316', category: 'texture' },
    { label: 'Creamy', value: profile.creamy, color: '#06b6d4', category: 'texture' },
    { label: 'Chewy', value: profile.chewy, color: '#84cc16', category: 'texture' },
    { label: 'Hot', value: profile.hot, color: '#dc2626', category: 'temperature' },
    { label: 'Cold', value: profile.cold, color: '#0ea5e9', category: 'temperature' }
  ]

  const handleSave = async () => {
    try {
      await onUpdateProfile(editingProfile)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save profile:', error)
    }
  }

  const handleCancel = () => {
    setEditingProfile(profile)
    setIsEditing(false)
  }

  const updateTasteValue = (key: keyof EnhancedTasteProfile, value: number) => {
    setEditingProfile(prev => ({ ...prev, [key]: value }))
  }

  const Advanced11DRadarChart = () => {
    const size = 400
    const center = size / 2
    const radius = 150
    
    // Create 11 points for the radar chart
    const points = tasteData.map((_, index) => {
      const angle = (index * 2 * Math.PI) / tasteData.length - Math.PI / 2
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
        angle
      }
    })

    // Create data points
    const dataPoints = tasteData.map((item, index) => {
      const angle = (index * 2 * Math.PI) / tasteData.length - Math.PI / 2
      const dataRadius = (item.value / 10) * radius
      return {
        x: center + dataRadius * Math.cos(angle),
        y: center + dataRadius * Math.sin(angle),
        value: item.value,
        color: item.color
      }
    })

    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">11-Dimensional Taste Profile</h3>
          <p className="text-gray-600">Your complete flavor and texture preferences</p>
        </div>
        
        <div className="flex justify-center mb-8">
          <svg width={size} height={size} className="overflow-visible">
            {/* Background grid */}
            {[2, 4, 6, 8, 10].map(level => (
              <circle
                key={level}
                cx={center}
                cy={center}
                r={(level / 10) * radius}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray={level % 2 === 0 ? "5,5" : "none"}
              />
            ))}
            
            {/* Grid lines */}
            {points.map((point, index) => (
              <line
                key={index}
                x1={center}
                y1={center}
                x2={point.x}
                y2={point.y}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            ))}
            
            {/* Category backgrounds */}
            <defs>
              <radialGradient id="basicGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(168, 85, 247, 0.1)" />
                <stop offset="100%" stopColor="rgba(168, 85, 247, 0.05)" />
              </radialGradient>
            </defs>
            
            {/* Data polygon with gradient fill */}
            <motion.polygon
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2, ease: "easeOut" }}
              points={dataPoints.map(p => `${p.x},${p.y}`).join(' ')}
              fill="url(#basicGradient)"
              stroke="#a855f7"
              strokeWidth="3"
              filter="drop-shadow(0 4px 8px rgba(0,0,0,0.1))"
            />
            
            {/* Individual data points */}
            {dataPoints.map((point, index) => (
              <motion.g key={index}>
                <motion.circle
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.5, type: "spring" }}
                  cx={point.x}
                  cy={point.y}
                  r="8"
                  fill={point.color}
                  stroke="white"
                  strokeWidth="3"
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
                />
                
                {/* Value labels on hover */}
                <motion.text
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 1 }}
                  x={point.x}
                  y={point.y - 15}
                  textAnchor="middle"
                  className="text-xs font-bold fill-gray-700"
                >
                  {point.value}
                </motion.text>
              </motion.g>
            ))}
            
            {/* Labels with category grouping */}
            {tasteData.map((item, index) => {
              const point = points[index]
              const labelRadius = radius + 40
              const labelX = center + labelRadius * Math.cos(point.angle)
              const labelY = center + labelRadius * Math.sin(point.angle)
              
              return (
                <motion.g key={index}>
                  {/* Category indicator */}
                  <circle
                    cx={labelX}
                    cy={labelY + 15}
                    r="3"
                    fill={item.color}
                  />
                  
                  {/* Label */}
                  <text
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-sm font-semibold fill-gray-700"
                  >
                    {item.label}
                  </text>
                  
                  {/* Category badge */}
                  <text
                    x={labelX}
                    y={labelY + 25}
                    textAnchor="middle"
                    className="text-xs fill-gray-500"
                  >
                    {item.category}
                  </text>
                </motion.g>
              )
            })}
          </svg>
        </div>
        
        {/* Advanced Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Overall Intensity', value: profile.overall_intensity, max: 10, color: 'text-purple-600', bg: 'bg-purple-100' },
            { label: 'Flavor Balance', value: profile.flavor_balance_score, max: 100, suffix: '%', color: 'text-blue-600', bg: 'bg-blue-100' },
            { label: 'Texture Score', value: profile.texture_preference_score, max: 100, suffix: '%', color: 'text-green-600', bg: 'bg-green-100' },
            { label: 'Adventurousness', value: profile.culinary_adventurousness, max: 10, color: 'text-orange-600', bg: 'bg-orange-100' }
          ].map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 + index * 0.1 }}
              className={`p-4 rounded-xl ${metric.bg}`}
            >
              <div className={`text-2xl font-bold ${metric.color}`}>
                {metric.value}{metric.suffix || ''}
              </div>
              <div className="text-sm text-gray-600">{metric.label}</div>
              <div className="w-full bg-white rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full ${metric.color.replace('text-', 'bg-')}`}
                  style={{ width: `${(metric.value / metric.max) * 100}%` }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  const ProfileInsights = () => {
    const insights = [
      {
        icon: Brain,
        title: 'Flavor Personality',
        description: profile.flavor_personality || 'Balanced Taster',
        details: 'Your taste profile suggests you enjoy well-balanced flavors with moderate intensity.',
        color: 'text-purple-600'
      },
      {
        icon: Globe,
        title: 'Recommended Cuisines',
        description: profile.recommended_cuisines?.join(', ') || 'Various',
        details: 'Based on your preferences, these cuisines align best with your taste profile.',
        color: 'text-blue-600'
      },
      {
        icon: TrendingUp,
        title: 'Profile Evolution',
        description: `${profile.profile_stability}% stable`,
        details: 'Your taste preferences have remained relatively consistent over time.',
        color: 'text-green-600'
      },
      {
        icon: Award,
        title: 'Confidence Level',
        description: `${profile.confidence_level}% confident`,
        details: 'Based on your dining history and rating consistency.',
        color: 'text-orange-600'
      }
    ]

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight, index) => {
          const Icon = insight.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${insight.color.replace('text-', 'bg-').replace('600', '100')}`}>
                  <Icon size={24} className={insight.color} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{insight.title}</h3>
                  <p className={`font-medium mb-2 ${insight.color}`}>{insight.description}</p>
                  <p className="text-sm text-gray-600">{insight.details}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    )
  }

  const TasteSlider = ({ label, value, color, onChange, disabled }: any) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-bold" style={{ color }}>{value}/10</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min="0"
          max="10"
          step="0.1"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          disabled={disabled}
          className="w-full h-3 rounded-lg appearance-none cursor-pointer"
          style={{
            background: disabled 
              ? '#e5e7eb'
              : `linear-gradient(to right, ${color}22 0%, ${color}22 ${value * 10}%, #e5e7eb ${value * 10}%, #e5e7eb 100%)`
          }}
        />
        {!disabled && (
          <div 
            className="absolute w-6 h-6 rounded-full border-3 border-white shadow-lg pointer-events-none"
            style={{ 
              left: `calc(${value * 10}% - 12px)`,
              top: '-6px',
              backgroundColor: color
            }}
          />
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Target className="text-purple-500" size={32} />
              Enhanced Palate Profile
            </h2>
            <p className="text-gray-600 mt-2">
              11-dimensional taste analysis powered by AI insights
            </p>
          </div>
          
          {isEditable && (
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                  >
                    <Save size={20} />
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                  >
                    <X size={20} />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
                >
                  <Edit3 size={20} />
                  Edit Profile
                </button>
              )}
            </div>
          )}
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'radar', label: 'Radar View', icon: Target },
            { id: 'insights', label: 'AI Insights', icon: Brain },
            { id: 'timeline', label: 'Evolution', icon: TrendingUp }
          ].map(view => {
            const Icon = view.icon
            return (
              <button
                key={view.id}
                onClick={() => setSelectedView(view.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedView === view.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={16} />
                {view.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {selectedView === 'radar' && (
          <motion.div
            key="radar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Advanced11DRadarChart />
          </motion.div>
        )}

        {selectedView === 'insights' && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <ProfileInsights />
            
            {/* Detailed Breakdown Toggle */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <button
                onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Info size={20} className="text-purple-500" />
                  <span className="font-medium text-gray-900">
                    Detailed Taste Breakdown
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: showDetailedBreakdown ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  ⌄
                </motion.div>
              </button>
              
              <AnimatePresence>
                {showDetailedBreakdown && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-6 space-y-6">
                      {/* Basic Tastes */}
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Sparkles size={20} className="text-purple-500" />
                          Basic Tastes
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {tasteData.filter(t => t.category === 'basic').map(taste => (
                            <TasteSlider
                              key={taste.label}
                              label={taste.label}
                              value={isEditing ? editingProfile[taste.label.toLowerCase() as keyof EnhancedTasteProfile] : taste.value}
                              color={taste.color}
                              onChange={(value: number) => updateTasteValue(taste.label.toLowerCase() as keyof EnhancedTasteProfile, value)}
                              disabled={!isEditing}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Textures */}
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Heart size={20} className="text-orange-500" />
                          Textures
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {tasteData.filter(t => t.category === 'texture').map(taste => (
                            <TasteSlider
                              key={taste.label}
                              label={taste.label}
                              value={isEditing ? editingProfile[taste.label.toLowerCase() as keyof EnhancedTasteProfile] : taste.value}
                              color={taste.color}
                              onChange={(value: number) => updateTasteValue(taste.label.toLowerCase() as keyof EnhancedTasteProfile, value)}
                              disabled={!isEditing}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Temperature */}
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Gauge size={20} className="text-blue-500" />
                          Temperature Preferences
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {tasteData.filter(t => t.category === 'temperature').map(taste => (
                            <TasteSlider
                              key={taste.label}
                              label={taste.label}
                              value={isEditing ? editingProfile[taste.label.toLowerCase() as keyof EnhancedTasteProfile] : taste.value}
                              color={taste.color}
                              onChange={(value: number) => updateTasteValue(taste.label.toLowerCase() as keyof EnhancedTasteProfile, value)}
                              disabled={!isEditing}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {selectedView === 'timeline' && (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <TrendingUp className="text-green-500" size={24} />
              Taste Profile Evolution
            </h3>
            
            {evolution && evolution.length > 0 ? (
              <div className="space-y-4">
                {evolution.map((change, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className={`w-3 h-3 rounded-full ${
                      change.change_type === 'sudden' ? 'bg-red-500' :
                      change.change_type === 'seasonal' ? 'bg-orange-500' :
                      'bg-green-500'
                    }`} />
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">
                          {change.change_type.charAt(0).toUpperCase() + change.change_type.slice(1)} change
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(change.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Triggered by: {change.trigger_food} • Magnitude: {change.change_magnitude.toFixed(1)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Eye size={48} className="text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Evolution Data Yet</h4>
                <p className="text-gray-600">
                  Your taste evolution will be tracked as you log more dining experiences
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}