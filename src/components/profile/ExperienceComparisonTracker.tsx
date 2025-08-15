'use client'

/**
 * Experience Comparison Tracker
 * Tracks rating improvements and experience evolution over time
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, TrendingDown, Minus, Star, 
  Calendar, Eye, Award, Target, Zap,
  BarChart3, LineChart, Filter, RefreshCw
} from 'lucide-react'

interface ExperienceComparison {
  food_id: string
  food_name: string
  restaurant_name: string
  experiences: {
    id: string
    date: string
    rating: number
    emotional_rating: number
    notes?: string
    context: {
      mood: string
      social_setting: string
      occasion?: string
    }
  }[]
  trend: 'improving' | 'declining' | 'stable'
  average_rating: number
  rating_change: number
  total_visits: number
  first_visit: string
  last_visit: string
}

interface RatingEvolution {
  date: string
  rating: number
  emotional_rating: number
  change_from_previous: number
  improvement_factors?: string[]
  decline_factors?: string[]
}

interface ExperienceComparisonTrackerProps {
  userId: string
}

export default function ExperienceComparisonTracker({ userId }: ExperienceComparisonTrackerProps) {
  const [comparisons, setComparisons] = useState<ExperienceComparison[]>([])
  const [selectedComparison, setSelectedComparison] = useState<ExperienceComparison | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '1y' | 'all'>('90d')
  const [sortBy, setSortBy] = useState<'improvement' | 'visits' | 'recent'>('improvement')
  const [showDetailedView, setShowDetailedView] = useState(false)

  useEffect(() => {
    loadExperienceComparisons()
  }, [userId, timeRange, sortBy])

  const loadExperienceComparisons = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`/api/profile/experience-comparisons?user_id=${userId}&range=${timeRange}&sort=${sortBy}`)
      const data = await response.json()
      
      if (data.success) {
        setComparisons(data.data.comparisons)
      }
    } catch (error) {
      console.error('Failed to load experience comparisons:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTrendIcon = (trend: string, change: number) => {
    if (change > 0.5) return { icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-100' }
    if (change < -0.5) return { icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-100' }
    return { icon: Minus, color: 'text-gray-500', bg: 'bg-gray-100' }
  }

  const formatRatingChange = (change: number) => {
    const prefix = change > 0 ? '+' : ''
    return `${prefix}${change.toFixed(1)}`
  }

  const ExperienceChart = ({ experiences }: { experiences: Record<string, unknown>[] }) => {
    if (experiences.length < 2) return null
    
    const chartData = experiences.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const maxRating = 5
    const minRating = 1
    
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <LineChart size={20} className="text-purple-500" />
          Rating Evolution
        </h4>
        
        <div className="relative h-48 mb-4">
          <svg width="100%" height="100%" className="overflow-visible">
            {/* Grid lines */}
            {[1, 2, 3, 4, 5].map((rating, index) => (
              <line
                key={index}
                x1="0"
                y1={`${100 - ((rating - 1) / 4) * 100}%`}
                x2="100%"
                y2={`${100 - ((rating - 1) / 4) * 100}%`}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="3,3"
              />
            ))}
            
            {/* Rating line */}
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeOut" }}
              d={`M ${chartData.map((exp, index) => {
                const x = (index / (chartData.length - 1)) * 100
                const y = 100 - ((exp.rating - 1) / 4) * 100
                return `${x},${y}`
              }).join(' L ')}`}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="3"
            />
            
            {/* Emotional rating line */}
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
              d={`M ${chartData.map((exp, index) => {
                const x = (index / (chartData.length - 1)) * 100
                const y = 100 - ((exp.emotional_rating / 2 - 1) / 4) * 100 // Convert 0-10 to 1-5 scale
                return `${x},${y}`
              }).join(' L ')}`}
              fill="none"
              stroke="#ec4899"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            
            {/* Data points */}
            {chartData.map((exp, index) => {
              const x = (index / (chartData.length - 1)) * 100
              const y = 100 - ((exp.rating - 1) / 4) * 100
              const isImprovement = index > 0 && exp.rating > chartData[index - 1].rating
              const isDecline = index > 0 && exp.rating < chartData[index - 1].rating
              
              return (
                <motion.g key={index}>
                  <motion.circle
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: (index * 0.1) + 1 }}
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="6"
                    fill={isImprovement ? '#10b981' : isDecline ? '#ef4444' : '#8b5cf6'}
                    stroke="white"
                    strokeWidth="2"
                  />
                  
                  {/* Rating label */}
                  <motion.text
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: (index * 0.1) + 1.5 }}
                    x={`${x}%`}
                    y={`${y - 15}%`}
                    textAnchor="middle"
                    className="text-xs font-medium fill-gray-700"
                  >
                    {exp.rating}
                  </motion.text>
                </motion.g>
              )
            })}
          </svg>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full" />
            <span className="text-gray-700">Food Rating</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-pink-500 rounded" />
            <span className="text-gray-700">Emotional Rating</span>
          </div>
        </div>
        
        {/* Timeline */}
        <div className="flex justify-between text-xs text-gray-500 mt-4">
          <span>{new Date(chartData[0].date).toLocaleDateString()}</span>
          <span>{new Date(chartData[chartData.length - 1].date).toLocaleDateString()}</span>
        </div>
      </div>
    )
  }

  const ComparisonCard = ({ comparison }: { comparison: ExperienceComparison }) => {
    const trendData = getTrendIcon(comparison.trend, comparison.rating_change)
    const TrendIcon = trendData.icon
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02, y: -2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-lg transition-all"
        onClick={() => setSelectedComparison(comparison)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {comparison.food_name}
            </h3>
            <p className="text-gray-600 text-sm mb-2">
              {comparison.restaurant_name}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{comparison.total_visits} visits</span>
              <span>Since {new Date(comparison.first_visit).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className={`p-2 rounded-lg ${trendData.bg}`}>
            <TrendIcon size={20} className={trendData.color} />
          </div>
        </div>
        
        <div className="space-y-3">
          {/* Rating Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star size={16} className="text-yellow-400 fill-current" />
              <span className="font-medium text-gray-900">
                {comparison.average_rating.toFixed(1)}/5
              </span>
              <span className="text-sm text-gray-600">average</span>
            </div>
            
            <div className={`flex items-center gap-1 text-sm font-medium ${
              comparison.rating_change > 0 ? 'text-green-600' :
              comparison.rating_change < 0 ? 'text-red-600' :
              'text-gray-600'
            }`}>
              <span>{formatRatingChange(comparison.rating_change)}</span>
              <span>change</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                comparison.rating_change > 0 ? 'bg-green-500' :
                comparison.rating_change < 0 ? 'bg-red-500' :
                'bg-gray-500'
              }`}
              style={{ width: `${(comparison.average_rating / 5) * 100}%` }}
            />
          </div>
          
          {/* Recent Visits Preview */}
          <div className="flex -space-x-1">
            {comparison.experiences.slice(-5).map((exp, index) => {
              const ratingColor = exp.rating >= 4 ? 'bg-green-500' :
                                exp.rating >= 3 ? 'bg-yellow-500' :
                                'bg-red-500'
              return (
                <div
                  key={index}
                  className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white ${ratingColor}`}
                  title={`${exp.rating}/5 on ${new Date(exp.date).toLocaleDateString()}`}
                >
                  {exp.rating}
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-4"
          >
            <BarChart3 size={32} className="text-purple-500" />
          </motion.div>
          <p className="text-gray-600">Analyzing your dining experiences...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TrendingUp className="text-purple-500" size={32} />
            Experience Evolution
          </h1>
          <p className="text-gray-600 mt-2">
            Track how your ratings change over repeated visits
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
            <option value="all">All time</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="improvement">Most improved</option>
            <option value="visits">Most visits</option>
            <option value="recent">Most recent</option>
          </select>
          
          <button
            onClick={loadExperienceComparisons}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { 
            label: 'Total Comparisons', 
            value: comparisons.length,
            icon: Eye,
            color: 'text-blue-600',
            bg: 'bg-blue-100'
          },
          { 
            label: 'Improving Experiences', 
            value: comparisons.filter(c => c.rating_change > 0).length,
            icon: TrendingUp,
            color: 'text-green-600',
            bg: 'bg-green-100'
          },
          { 
            label: 'Declining Experiences', 
            value: comparisons.filter(c => c.rating_change < 0).length,
            icon: TrendingDown,
            color: 'text-red-600',
            bg: 'bg-red-100'
          },
          { 
            label: 'Biggest Improvement', 
            value: `+${Math.max(...comparisons.map(c => c.rating_change), 0).toFixed(1)}`,
            icon: Award,
            color: 'text-purple-600',
            bg: 'bg-purple-100'
          }
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-xl ${stat.bg}`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon size={24} className={stat.color} />
              </div>
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          )
        })}
      </div>

      {/* Comparisons Grid */}
      {comparisons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {comparisons.map((comparison, index) => (
              <motion.div
                key={comparison.food_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ComparisonCard comparison={comparison} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-12">
          <Target size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Repeat Visits Yet</h3>
          <p className="text-gray-600">
            Visit the same restaurants multiple times to track your evolving preferences
          </p>
        </div>
      )}

      {/* Detailed Modal */}
      <AnimatePresence>
        {selectedComparison && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedComparison(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedComparison.food_name}
                  </h2>
                  <p className="text-gray-600">{selectedComparison.restaurant_name}</p>
                </div>
                
                <button
                  onClick={() => setSelectedComparison(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
              
              {/* Modal Content */}
              <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
                <ExperienceChart experiences={selectedComparison.experiences} />
                
                {/* Experience Timeline */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar size={20} className="text-purple-500" />
                    Experience Timeline
                  </h4>
                  
                  {selectedComparison.experiences
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((exp, index) => {
                      const prevExp = index < selectedComparison.experiences.length - 1 ? 
                        selectedComparison.experiences[selectedComparison.experiences.length - 1 - index - 1] : null
                      const change = prevExp ? exp.rating - prevExp.rating : 0
                      const changeColor = change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
                      
                      return (
                        <motion.div
                          key={exp.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-shrink-0">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                  key={star}
                                  size={16}
                                  className={star <= exp.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                                />
                              ))}
                            </div>
                            
                            {change !== 0 && (
                              <div className={`text-xs font-medium ${changeColor} mt-1`}>
                                {change > 0 ? '+' : ''}{change.toFixed(1)}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900">
                                {exp.rating}/5 stars
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(exp.date).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                              <span>Emotional: {exp.emotional_rating}/10</span>
                              <span>Mood: {exp.context.mood}</span>
                              <span>{exp.context.social_setting}</span>
                            </div>
                            
                            {exp.notes && (
                              <p className="text-sm text-gray-700 italic">
                                &ldquo;{exp.notes}&rdquo;
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}