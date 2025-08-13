'use client'

/**
 * Recommendation Accuracy Dashboard
 * Tracks AI recommendation performance and user feedback learning
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, Target, Brain, Zap, Award,
  ThumbsUp, ThumbsDown, Star, Eye, BarChart3,
  Calendar, Filter, RefreshCw, Info, CheckCircle
} from 'lucide-react'

interface AccuracyMetrics {
  overall_accuracy: number
  cuisine_accuracy: Record<string, number>
  price_accuracy: number
  mood_accuracy: number
  time_accuracy: number
  learning_velocity: number
  recommendation_count: number
  feedback_count: number
  improvement_trend: 'improving' | 'stable' | 'declining'
}

interface FeedbackData {
  date: string
  recommendation_id: string
  food_name: string
  restaurant_name: string
  predicted_rating: number
  actual_rating: number
  feedback_type: 'liked' | 'disliked' | 'neutral'
  accuracy_score: number
}

interface LearningInsight {
  type: 'improvement' | 'pattern' | 'preference' | 'alert'
  title: string
  description: string
  confidence: number
  action_suggested?: string
}

export default function RecommendationAccuracyDashboard() {
  const [metrics, setMetrics] = useState<AccuracyMetrics | null>(null)
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackData[]>([])
  const [learningInsights, setLearningInsights] = useState<LearningInsight[]>([])
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [isLoading, setIsLoading] = useState(true)
  const [showDetailedView, setShowDetailedView] = useState(false)

  useEffect(() => {
    loadAccuracyData()
  }, [selectedTimeRange])

  const loadAccuracyData = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`/api/recommendations/accuracy?range=${selectedTimeRange}`)
      const data = await response.json()
      
      if (data.success) {
        setMetrics(data.data.metrics)
        setFeedbackHistory(data.data.feedback_history)
        setLearningInsights(data.data.insights)
      }
    } catch (error) {
      console.error('Failed to load accuracy data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' }
    if (accuracy >= 80) return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' }
    if (accuracy >= 70) return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' }
    return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return { icon: TrendingUp, color: 'text-green-500' }
      case 'declining': return { icon: TrendingDown, color: 'text-red-500' }
      default: return { icon: Target, color: 'text-blue-500' }
    }
  }

  const AccuracyCard = ({ title, value, trend, description, icon: Icon }: any) => {
    const colors = getAccuracyColor(value)
    const trendData = getTrendIcon(trend)
    const TrendIcon = trendData.icon
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-xl border ${colors.bg} ${colors.border}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-lg ${colors.bg}`}>
            <Icon size={24} className={colors.text} />
          </div>
          <div className="flex items-center gap-1">
            <TrendIcon size={16} className={trendData.color} />
            <span className={`text-xs font-medium ${trendData.color}`}>
              {trend}
            </span>
          </div>
        </div>
        
        <div className={`text-3xl font-bold mb-2 ${colors.text}`}>
          {value}%
        </div>
        
        <div className="text-sm font-semibold text-gray-900 mb-1">
          {title}
        </div>
        
        <div className="text-xs text-gray-600">
          {description}
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-white rounded-full h-2 mt-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className={`h-2 rounded-full ${colors.text.replace('text-', 'bg-')}`}
          />
        </div>
      </motion.div>
    )
  }

  const FeedbackChart = () => {
    if (!feedbackHistory.length) return null
    
    const chartData = feedbackHistory.slice(-30) // Last 30 entries
    const maxAccuracy = Math.max(...chartData.map(d => d.accuracy_score))
    const minAccuracy = Math.min(...chartData.map(d => d.accuracy_score))
    
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Accuracy Trend</h3>
            <p className="text-gray-600">Recent recommendation accuracy over time</p>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span>Accurate</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span>Inaccurate</span>
            </div>
          </div>
        </div>
        
        <div className="relative h-64 mb-4">
          <svg width="100%" height="100%" className="overflow-visible">
            {/* Grid lines */}
            {[20, 40, 60, 80, 100].map((y, index) => (
              <line
                key={index}
                x1="0"
                y1={`${100 - y}%`}
                x2="100%"
                y2={`${100 - y}%`}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="3,3"
              />
            ))}
            
            {/* Accuracy line */}
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeOut" }}
              d={`M ${chartData.map((point, index) => {
                const x = (index / (chartData.length - 1)) * 100
                const y = 100 - point.accuracy_score
                return `${x},${y}`
              }).join(' L ')}`}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
            />
            
            {/* Data points */}
            {chartData.map((point, index) => {
              const x = (index / (chartData.length - 1)) * 100
              const y = 100 - point.accuracy_score
              const color = point.accuracy_score >= 80 ? '#10b981' : point.accuracy_score >= 60 ? '#f59e0b' : '#ef4444'
              
              return (
                <motion.circle
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: (index * 0.1) + 1 }}
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="4"
                  fill={color}
                  stroke="white"
                  strokeWidth="2"
                />
              )
            })}
          </svg>
        </div>
        
        {/* Timeline */}
        <div className="flex justify-between text-xs text-gray-500">
          <span>{chartData[0]?.date ? new Date(chartData[0].date).toLocaleDateString() : ''}</span>
          <span>Today</span>
        </div>
      </div>
    )
  }

  const LearningInsightsPanel = () => {
    const getInsightIcon = (type: string) => {
      switch (type) {
        case 'improvement': return { icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-100' }
        case 'pattern': return { icon: Eye, color: 'text-blue-500', bg: 'bg-blue-100' }
        case 'preference': return { icon: Brain, color: 'text-purple-500', bg: 'bg-purple-100' }
        case 'alert': return { icon: Zap, color: 'text-red-500', bg: 'bg-red-100' }
        default: return { icon: Info, color: 'text-gray-500', bg: 'bg-gray-100' }
      }
    }

    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <Brain size={24} className="text-purple-500" />
          <h3 className="text-xl font-bold text-gray-900">AI Learning Insights</h3>
        </div>
        
        <div className="space-y-4">
          {learningInsights.length > 0 ? (
            learningInsights.map((insight, index) => {
              const iconData = getInsightIcon(insight.type)
              const Icon = iconData.icon
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className={`p-2 rounded-lg ${iconData.bg}`}>
                    <Icon size={20} className={iconData.color} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                      <span className="text-xs text-gray-500">
                        {insight.confidence}% confidence
                      </span>
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-2">{insight.description}</p>
                    
                    {insight.action_suggested && (
                      <div className="text-xs text-blue-600 font-medium">
                        💡 {insight.action_suggested}
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })
          ) : (
            <div className="text-center py-8">
              <Brain size={32} className="text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No insights available yet</p>
              <p className="text-sm text-gray-500">Keep rating recommendations to see AI learning patterns</p>
            </div>
          )}
        </div>
      </div>
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
            <Brain size={32} className="text-purple-500" />
          </motion.div>
          <p className="text-gray-600">Analyzing recommendation accuracy...</p>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <Target size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600 mb-4">
            Start rating recommendations to see accuracy metrics
          </p>
          <button
            onClick={loadAccuracyData}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="text-purple-500" size={32} />
            Recommendation Accuracy
          </h1>
          <p className="text-gray-600 mt-2">
            Track how well our AI learns your preferences
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Time range selector */}
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
          
          <button
            onClick={loadAccuracyData}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AccuracyCard
          title="Overall Accuracy"
          value={metrics.overall_accuracy}
          trend={metrics.improvement_trend}
          description={`${metrics.recommendation_count} recommendations analyzed`}
          icon={Target}
        />
        
        <AccuracyCard
          title="Price Predictions"
          value={metrics.price_accuracy}
          trend={metrics.improvement_trend}
          description="Budget preference matching"
          icon={Award}
        />
        
        <AccuracyCard
          title="Mood Matching"
          value={metrics.mood_accuracy}
          trend={metrics.improvement_trend}
          description="Context-aware suggestions"
          icon={Brain}
        />
        
        <AccuracyCard
          title="Learning Speed"
          value={metrics.learning_velocity}
          trend={metrics.improvement_trend}
          description="How fast AI adapts to you"
          icon={Zap}
        />
      </div>

      {/* Cuisine-specific Accuracy */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Star className="text-orange-500" size={24} />
          Cuisine Accuracy Breakdown
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(metrics.cuisine_accuracy).map(([cuisine, accuracy]) => {
            const colors = getAccuracyColor(accuracy)
            return (
              <div key={cuisine} className={`p-4 rounded-lg ${colors.bg} ${colors.border} border`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900 capitalize">{cuisine}</span>
                  <span className={`font-bold ${colors.text}`}>{accuracy}%</span>
                </div>
                <div className="w-full bg-white rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${accuracy}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className={`h-2 rounded-full ${colors.text.replace('text-', 'bg-')}`}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Charts and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FeedbackChart />
        <LearningInsightsPanel />
      </div>

      {/* Detailed Feedback History */}
      <AnimatePresence>
        {showDetailedView && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Feedback History</h3>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {feedbackHistory.slice(0, 20).map((feedback, index) => {
                const accuracyColors = getAccuracyColor(feedback.accuracy_score)
                const feedbackIcon = feedback.feedback_type === 'liked' ? ThumbsUp : 
                                   feedback.feedback_type === 'disliked' ? ThumbsDown : Eye
                const Icon = feedbackIcon
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className={`p-2 rounded-lg ${accuracyColors.bg}`}>
                      <Icon size={16} className={accuracyColors.text} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">{feedback.food_name}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(feedback.date).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-1">
                        {feedback.restaurant_name}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">
                          Predicted: {feedback.predicted_rating}/5
                        </span>
                        <span className="text-gray-600">
                          Actual: {feedback.actual_rating}/5
                        </span>
                        <span className={`font-medium ${accuracyColors.text}`}>
                          {feedback.accuracy_score}% accuracy
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Detailed View */}
      <div className="text-center">
        <button
          onClick={() => setShowDetailedView(!showDetailedView)}
          className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors mx-auto"
        >
          <Filter size={16} />
          {showDetailedView ? 'Hide' : 'Show'} Detailed History
        </button>
      </div>
    </div>
  )
}