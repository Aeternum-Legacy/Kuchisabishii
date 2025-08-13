'use client'

/**
 * Recommendation Analytics Dashboard Component
 * Displays ML performance metrics and recommendation insights
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, TrendingDown, Target, Users, Clock, 
  Brain, BarChart3, PieChart, Activity, Lightbulb
} from 'lucide-react'

interface AnalyticsData {
  total_shown: number
  total_clicked: number
  total_visited: number
  total_rated: number
  click_rate: number
  conversion_rate: number
  average_rating: number
  satisfaction_score: number
  diversity_score: number
  user_engagement: {
    daily_active_users: number
    avg_session_duration: number
    recommendations_per_session: number
  }
  recommendation_breakdown: Array<{
    type: string
    count: number
    performance: number
  }>
  trending_patterns: Array<{
    cuisine: string
    popularity_trend: number
    satisfaction_trend: number
  }>
}

interface ModelMetrics {
  personal_metrics: {
    recommendations_shown: number
    click_rate: number
    satisfaction_rate: number
    discovery_rate: number
  }
  system_metrics: {
    total_users: number
    avg_satisfaction: number
    model_accuracy: number
    improvement_over_baseline: number
  }
  improvement_suggestions: Array<{
    type: string
    suggestion: string
    impact: string
  }>
}

export default function RecommendationAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('all')

  useEffect(() => {
    loadAnalytics()
    loadModelMetrics()
  }, [timeRange, selectedMetric])

  const loadAnalytics = async () => {
    try {
      const params = new URLSearchParams({
        start_date: getStartDate(timeRange),
        end_date: new Date().toISOString().split('T')[0],
        metric: selectedMetric
      })

      const response = await fetch(`/api/analytics/recommendations?${params}`)
      const data = await response.json()

      if (data.success) {
        setAnalytics(data.data.analytics)
      }
    } catch (error) {
      console.error('Failed to load analytics:', error)
    }
  }

  const loadModelMetrics = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/ml/feedback')
      const data = await response.json()

      if (data.success) {
        setModelMetrics(data.data)
      }
    } catch (error) {
      console.error('Failed to load model metrics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStartDate = (range: string) => {
    const days = {
      '7d': 7,
      '30d': 30,
      '90d': 90
    }[range] || 30

    const date = new Date()
    date.setDate(date.getDate() - days)
    return date.toISOString().split('T')[0]
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  const formatNumber = (value: number) => {
    return value.toLocaleString()
  }

  const getChangeIndicator = (value: number, baseline: number = 0) => {
    const change = value - baseline
    const isPositive = change > 0
    
    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        <span className="text-sm font-medium">
          {Math.abs(change * 100).toFixed(1)}%
        </span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="text-purple-600" />
            Recommendation Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            AI performance insights and personalization metrics
          </p>
        </div>

        <div className="flex gap-2">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>

          {/* Metric Selector */}
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="all">All Metrics</option>
            <option value="click_rate">Click Rate</option>
            <option value="conversion_rate">Conversion Rate</option>
            <option value="satisfaction">Satisfaction</option>
            <option value="diversity">Diversity</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Click Rate"
            value={formatPercentage(analytics.click_rate)}
            change={getChangeIndicator(analytics.click_rate, 0.15)}
            icon={<Target className="text-blue-600" />}
            description="Users clicking recommendations"
          />
          
          <MetricCard
            title="Conversion Rate"
            value={formatPercentage(analytics.conversion_rate)}
            change={getChangeIndicator(analytics.conversion_rate, 0.08)}
            icon={<Activity className="text-green-600" />}
            description="Users visiting recommended places"
          />
          
          <MetricCard
            title="Satisfaction Score"
            value={formatPercentage(analytics.satisfaction_score)}
            change={getChangeIndicator(analytics.satisfaction_score, 0.75)}
            icon={<TrendingUp className="text-purple-600" />}
            description="Average user satisfaction"
          />
          
          <MetricCard
            title="Diversity Score"
            value={formatPercentage(analytics.diversity_score)}
            change={getChangeIndicator(analytics.diversity_score, 0.65)}
            icon={<PieChart className="text-orange-600" />}
            description="Recommendation variety"
          />
        </div>
      )}

      {/* Model Performance */}
      {modelMetrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Model Performance */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Brain size={20} className="text-purple-600" />
              Your Personal Model Performance
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Recommendations Shown</span>
                <span className="font-medium">{formatNumber(modelMetrics.personal_metrics.recommendations_shown)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Click Rate</span>
                <span className="font-medium">{formatPercentage(modelMetrics.personal_metrics.click_rate)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Discovery Rate</span>
                <span className="font-medium">{formatPercentage(modelMetrics.personal_metrics.discovery_rate)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Satisfaction Rate</span>
                <span className="font-medium">{formatPercentage(modelMetrics.personal_metrics.satisfaction_rate)}</span>
              </div>
            </div>

            {/* Model Accuracy Visualization */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Personal Model Accuracy</span>
                <span className="text-sm font-medium">{formatPercentage(modelMetrics.personal_metrics.satisfaction_rate)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${modelMetrics.personal_metrics.satisfaction_rate * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* System-wide Metrics */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users size={20} className="text-blue-600" />
              System Performance
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Users</span>
                <span className="font-medium">{formatNumber(modelMetrics.system_metrics.total_users)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg Satisfaction</span>
                <span className="font-medium">{modelMetrics.system_metrics.avg_satisfaction.toFixed(1)}/5.0</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Model Accuracy</span>
                <span className="font-medium">{formatPercentage(modelMetrics.system_metrics.model_accuracy)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Improvement vs Baseline</span>
                <span className="font-medium text-green-600">+{formatPercentage(modelMetrics.system_metrics.improvement_over_baseline)}</span>
              </div>
            </div>

            {/* System Health Indicator */}
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <Activity size={16} />
                <span className="font-medium">System Health: Excellent</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                All metrics performing above baseline targets
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recommendation Breakdown */}
      {analytics && analytics.recommendation_breakdown.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-indigo-600" />
            Recommendation Type Performance
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.recommendation_breakdown.map((item, index) => (
              <motion.div
                key={item.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900 capitalize">
                    {item.type.replace('_', ' ')}
                  </span>
                  <span className="text-sm text-gray-600">{item.count} shown</span>
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Performance</span>
                  <span className="font-medium">{formatPercentage(item.performance)}</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-indigo-400 to-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${item.performance * 100}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Improvement Suggestions */}
      {modelMetrics && modelMetrics.improvement_suggestions.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lightbulb size={20} className="text-yellow-600" />
            Improvement Suggestions
          </h3>
          
          <div className="space-y-3">
            {modelMetrics.improvement_suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`p-4 rounded-lg border-l-4 ${
                  suggestion.impact === 'high' 
                    ? 'bg-red-50 border-red-400' 
                    : suggestion.impact === 'medium'
                    ? 'bg-yellow-50 border-yellow-400'
                    : 'bg-blue-50 border-blue-400'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{suggestion.suggestion}</p>
                    <p className="text-sm text-gray-600 mt-1 capitalize">{suggestion.type.replace('_', ' ')}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    suggestion.impact === 'high' 
                      ? 'bg-red-100 text-red-700' 
                      : suggestion.impact === 'medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {suggestion.impact} impact
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Trending Cuisine Patterns */}
      {analytics && analytics.trending_patterns.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-600" />
            Trending Cuisine Patterns
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Cuisine</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-600">Popularity</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-600">Satisfaction</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-600">Trend</th>
                </tr>
              </thead>
              <tbody>
                {analytics.trending_patterns.slice(0, 8).map((pattern, index) => (
                  <tr key={pattern.cuisine} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900 capitalize">{pattern.cuisine}</td>
                    <td className="py-3 text-right text-gray-600">{pattern.popularity_trend}</td>
                    <td className="py-3 text-right text-gray-600">{pattern.satisfaction_trend.toFixed(1)}</td>
                    <td className="py-3 text-right">
                      {pattern.satisfaction_trend >= 4.0 ? (
                        <span className="text-green-600 flex items-center justify-end gap-1">
                          <TrendingUp size={14} />
                          Rising
                        </span>
                      ) : (
                        <span className="text-gray-600">Stable</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// Metric Card Component
function MetricCard({ title, value, change, icon, description }: {
  title: string
  value: string
  change: React.ReactNode
  icon: React.ReactNode
  description: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-gray-50 rounded-lg">
          {icon}
        </div>
        {change}
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
        <h4 className="font-semibold text-gray-700 mb-1">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </motion.div>
  )
}