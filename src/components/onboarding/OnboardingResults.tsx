'use client'

/**
 * Onboarding Results Component
 * Shows personalized taste profile results with visual representation
 */

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Target, Sparkles, TrendingUp, Brain, Heart,
  Zap, Globe, ChefHat, Award, ArrowRight
} from 'lucide-react'

interface OnboardingResultsProps {
  tasteProfile: Record<string, unknown>
  insights: string[]
  recommendations: Record<string, unknown>[]
  onContinue: () => void
  onRetake?: () => void
}

export default function OnboardingResults({
  tasteProfile,
  insights,
  recommendations,
  onContinue,
  onRetake
}: OnboardingResultsProps) {
  const getProfileSummary = () => {
    const { sweet, salty, spicy, adventurousness } = tasteProfile
    
    let personality = "Balanced Eater"
    if (adventurousness >= 8) personality = "Culinary Explorer"
    else if (sweet >= 8) personality = "Sweet Tooth"
    else if (spicy >= 8) personality = "Heat Seeker"
    else if (salty >= 8) personality = "Savory Lover"
    
    return personality
  }

  const getMatchingRestaurants = () => {
    // Mock restaurant recommendations based on profile
    return [
      { name: "Spice Paradise", match: 95, cuisine: "Thai" },
      { name: "Sweet Dreams Bakery", match: 88, cuisine: "Desserts" },
      { name: "Umami House", match: 82, cuisine: "Japanese" }
    ]
  }

  const RadarChart = ({ data, title }: Record<string, unknown>) => {
    const size = 300
    const center = size / 2
    const radius = 100
    
    const points = data.map((_: Record<string, unknown>, index: number) => {
      const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle)
      }
    })

    const dataPoints = data.map((item: Record<string, unknown>, index: number) => {
      const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2
      const dataRadius = (item.value / 10) * radius
      return {
        x: center + dataRadius * Math.cos(angle),
        y: center + dataRadius * Math.sin(angle)
      }
    })

    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-xl font-bold text-center mb-6 flex items-center justify-center gap-2">
          <Target className="text-purple-500" size={24} />
          {title}
        </h3>
        
        <div className="flex justify-center mb-6">
          <svg width={size} height={size} className="overflow-visible">
            {/* Grid circles */}
            {[1, 2, 3, 4, 5].map(level => (
              <circle
                key={level}
                cx={center}
                cy={center}
                r={(level * 2) * radius / 10}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="1"
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
            
            {/* Data polygon */}
            <motion.polygon
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              points={dataPoints.map(p => `${p.x},${p.y}`).join(' ')}
              fill="rgba(168, 85, 247, 0.2)"
              stroke="rgba(168, 85, 247, 0.8)"
              strokeWidth="3"
            />
            
            {/* Data points */}
            {dataPoints.map((point, index) => (
              <motion.circle
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.5, type: "spring" }}
                cx={point.x}
                cy={point.y}
                r="6"
                fill="#a855f7"
                stroke="white"
                strokeWidth="3"
              />
            ))}
            
            {/* Labels */}
            {data.map((item: Record<string, unknown>, index: number) => {
              const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2
              const labelRadius = radius + 30
              const labelX = center + labelRadius * Math.cos(angle)
              const labelY = center + labelRadius * Math.sin(angle)
              
              return (
                <text
                  key={index}
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-sm font-semibold fill-gray-700"
                >
                  {item.label}
                </text>
              )
            })}
          </svg>
        </div>
        
        {/* Legend */}
        <div className="grid grid-cols-2 gap-4">
          {data.map((item: Record<string, unknown>, index: number) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <span className="font-bold text-purple-600">{item.value}/10</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const tasteData = [
    { label: 'Sweet', value: tasteProfile.sweet },
    { label: 'Salty', value: tasteProfile.salty },
    { label: 'Sour', value: tasteProfile.sour },
    { label: 'Bitter', value: tasteProfile.bitter },
    { label: 'Umami', value: tasteProfile.umami },
    { label: 'Spicy', value: tasteProfile.spicy }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <Award className="text-purple-500" size={32} />
            <h1 className="text-4xl font-bold text-gray-900">Your Taste Profile</h1>
            <Sparkles className="text-orange-500" size={32} />
          </div>
          
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full shadow-lg mb-6"
            >
              <Brain size={24} />
              <span className="text-xl font-bold">{getProfileSummary()}</span>
            </motion.div>
            
            <p className="text-lg text-gray-600">
              Based on your responses, we've created a personalized taste profile that will help us recommend the perfect dining experiences for you.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Taste Profile Visualization */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <RadarChart data={tasteData} title="Your Taste Preferences" />
          </motion.div>

          {/* Profile Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            {/* Adventurousness Score */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="text-green-500" size={24} />
                <h3 className="text-xl font-bold">Culinary Adventurousness</h3>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-green-500">
                  {tasteProfile.adventurousness}/10
                </div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(tasteProfile.adventurousness / 10) * 100}%` }}
                      transition={{ delay: 1, duration: 1 }}
                      className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {tasteProfile.adventurousness >= 8 ? "Loves trying new cuisines" :
                     tasteProfile.adventurousness >= 5 ? "Open to new experiences" :
                     "Prefers familiar foods"}
                  </p>
                </div>
              </div>
            </div>

            {/* Top Insights */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <Zap className="text-yellow-500" size={24} />
                <h3 className="text-xl font-bold">Key Insights</h3>
              </div>
              
              <div className="space-y-4">
                {insights.slice(0, 4).map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-start gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-gray-700 leading-relaxed">{insight}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Restaurant Recommendations Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <ChefHat className="text-orange-500" size={24} />
            <h3 className="text-xl font-bold">Perfect Restaurant Matches</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {getMatchingRestaurants().map((restaurant, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4 + index * 0.1 }}
                className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-900">{restaurant.name}</h4>
                  <div className="flex items-center gap-1">
                    <Heart className="text-red-400" size={16} />
                    <span className="font-bold text-red-500">{restaurant.match}%</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{restaurant.cuisine} Cuisine</p>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${restaurant.match}%` }}
                    transition={{ delay: 1.6 + index * 0.1, duration: 0.8 }}
                    className="bg-gradient-to-r from-orange-400 to-red-400 h-2 rounded-full"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
          className="text-center space-y-4"
        >
          <button
            onClick={onContinue}
            className="inline-flex items-center gap-3 px-12 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-lg font-bold rounded-full shadow-lg hover:from-purple-600 hover:to-blue-600 transition-all transform hover:scale-105"
          >
            Start Exploring
            <ArrowRight size={24} />
          </button>
          
          {onRetake && (
            <div>
              <button
                onClick={onRetake}
                className="text-gray-600 hover:text-gray-800 transition-colors underline"
              >
                Retake questionnaire
              </button>
            </div>
          )}
        </motion.div>
        
        {/* Fun Facts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-12 p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100"
        >
          <div className="text-center">
            <TrendingUp className="text-blue-500 mx-auto mb-4" size={32} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Did You Know?</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Your taste preferences are as unique as your fingerprint! Our AI will continue to learn 
              from your dining experiences and provide increasingly accurate recommendations over time.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}