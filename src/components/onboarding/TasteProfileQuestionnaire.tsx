'use client'

/**
 * Enhanced AI-Powered Taste Profile Questionnaire
 * 11-dimensional taste profiling with adaptive questions and real-time insights
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, ChevronRight, Sparkles, Brain, 
  Eye, Zap, TrendingUp, Target, Save, RotateCcw
} from 'lucide-react'

interface TasteQuestion {
  id: string
  category: 'basic_tastes' | 'textures' | 'temperatures' | 'emotional' | 'contextual' | 'behavioral'
  type: 'slider' | 'multi_select' | 'emoji_rating' | 'ranking' | 'comparison' | 'scenario'
  title: string
  subtitle: string
  description: string
  options?: Array<{
    value: string
    label: string
    emoji?: string
    image?: string
    description?: string
  }>
  min?: number
  max?: number
  step?: number
  scenarios?: Array<{
    situation: string
    options: string[]
  }>
}

interface TasteProfileData {
  // Basic taste preferences (0-10 scale)
  sweet: number
  salty: number
  sour: number
  bitter: number
  umami: number
  spicy: number
  
  // Texture preferences
  crunchy: number
  creamy: number
  chewy: number
  
  // Temperature preferences
  hot: number
  cold: number
  
  // Behavioral patterns
  adventurousness: number
  social_dining: string
  meal_frequency: string
  cooking_frequency: string
  
  // Contextual preferences
  cuisine_preferences: Record<string, number>
  dietary_restrictions: string[]
  allergies: string[]
  
  // Emotional connections
  comfort_foods: string[]
  celebration_foods: string[]
  stress_foods: string[]
  
  // Advanced preferences
  ingredient_preferences: Record<string, number>
  preparation_methods: Record<string, number>
  meal_timing: Record<string, number>
}

interface QuestionnaireProps {
  onComplete: (profile: TasteProfileData, insights: string[]) => void
  onSkip?: () => void
  existingProfile?: Partial<TasteProfileData>
}

export default function TasteProfileQuestionnaire({ 
  onComplete, 
  onSkip, 
  existingProfile 
}: QuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<TasteProfileData>>(existingProfile || {})
  const [currentQuestion, setCurrentQuestion] = useState<TasteQuestion | null>(null)
  const [totalSteps, setTotalSteps] = useState(15)
  const [isLoading, setIsLoading] = useState(false)
  const [realTimeInsights, setRealTimeInsights] = useState<string[]>([])
  const [confidenceScore, setConfidenceScore] = useState(0)
  const [adaptiveQuestions, setAdaptiveQuestions] = useState<TasteQuestion[]>([])

  useEffect(() => {
    loadAdaptiveQuestion()
  }, [currentStep, answers])

  const loadAdaptiveQuestion = async () => {
    try {
      setIsLoading(true)
      
      // In a real implementation, this would call the AI service
      // For now, we'll use predefined adaptive questions
      const question = getAdaptiveQuestion(currentStep, answers)
      setCurrentQuestion(question)
      
      // Update real-time insights
      updateRealTimeInsights()
      
      // Calculate confidence score
      updateConfidenceScore()
    } catch (error) {
      console.error('Failed to load question:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getAdaptiveQuestion = (step: number, currentAnswers: Partial<TasteProfileData>): TasteQuestion => {
    const questions: TasteQuestion[] = [
      {
        id: 'sweet_preference',
        category: 'basic_tastes',
        type: 'slider',
        title: 'How much do you enjoy sweet flavors?',
        subtitle: 'Think about desserts, fruits, and sweet sauces',
        description: 'This helps us understand your sweet tooth level and recommend appropriate dishes.',
        min: 0,
        max: 10,
        step: 1
      },
      {
        id: 'salty_preference', 
        category: 'basic_tastes',
        type: 'slider',
        title: 'How much do you crave salty foods?',
        subtitle: 'Consider chips, pickles, and well-seasoned dishes',
        description: 'Salt preference affects everything from snack choices to main course seasoning.',
        min: 0,
        max: 10,
        step: 1
      },
      {
        id: 'texture_comparison',
        category: 'textures',
        type: 'comparison',
        title: 'Which texture combination appeals to you more?',
        subtitle: 'Choose between different texture experiences',
        description: 'Texture preferences are key to finding foods you\'ll truly enjoy.',
        options: [
          {
            value: 'crunchy_creamy',
            label: 'Crunchy + Creamy',
            description: 'Like chips with dip, or cookies with ice cream',
            emoji: '🥨🍦'
          },
          {
            value: 'soft_chewy',
            label: 'Soft + Chewy',
            description: 'Like pasta, bread, or tender meat',
            emoji: '🍝🥖'
          }
        ]
      },
      {
        id: 'cuisine_ranking',
        category: 'contextual',
        type: 'ranking',
        title: 'Rank these cuisines by preference',
        subtitle: 'Drag to reorder from most to least favorite',
        description: 'This helps us understand your cultural taste preferences and suggest restaurants.',
        options: [
          { value: 'italian', label: 'Italian', emoji: '🍝' },
          { value: 'mexican', label: 'Mexican', emoji: '🌮' },
          { value: 'asian', label: 'Asian', emoji: '🍜' },
          { value: 'american', label: 'American', emoji: '🍔' },
          { value: 'mediterranean', label: 'Mediterranean', emoji: '🥗' }
        ]
      },
      {
        id: 'spice_tolerance',
        category: 'basic_tastes',
        type: 'emoji_rating',
        title: 'Rate your spice tolerance',
        subtitle: 'How well do you handle spicy food?',
        description: 'This helps us filter recommendations by heat level.',
        options: [
          { value: '1', label: 'Mild', emoji: '😌' },
          { value: '2', label: 'Little Heat', emoji: '😊' },
          { value: '3', label: 'Medium', emoji: '😋' },
          { value: '4', label: 'Hot', emoji: '😅' },
          { value: '5', label: 'Fire!', emoji: '🔥' }
        ]
      },
      {
        id: 'dining_scenario',
        category: 'behavioral',
        type: 'scenario',
        title: 'You\'re choosing dinner after a long day',
        subtitle: 'What sounds most appealing?',
        description: 'This reveals your comfort food patterns and stress eating preferences.',
        scenarios: [{
          situation: 'Long stressful day at work',
          options: [
            'Something warm and comforting',
            'Light and fresh',
            'Rich and indulgent',
            'Quick and familiar'
          ]
        }]
      },
      {
        id: 'adventurousness',
        category: 'behavioral',
        type: 'slider',
        title: 'How adventurous are you with new foods?',
        subtitle: 'From playing it safe to loving exotic dishes',
        description: 'This determines how often we\'ll suggest unfamiliar cuisines and ingredients.',
        min: 1,
        max: 10,
        step: 1
      },
      {
        id: 'meal_timing',
        category: 'contextual',
        type: 'multi_select',
        title: 'When do you typically eat your main meal?',
        subtitle: 'Select all that apply to your routine',
        description: 'Timing preferences help us suggest appropriate portion sizes and types.',
        options: [
          { value: 'early_breakfast', label: 'Early Breakfast (6-8 AM)', emoji: '🌅' },
          { value: 'late_breakfast', label: 'Late Breakfast (8-10 AM)', emoji: '☀️' },
          { value: 'brunch', label: 'Brunch (10 AM-2 PM)', emoji: '🥐' },
          { value: 'lunch', label: 'Traditional Lunch (12-2 PM)', emoji: '🌞' },
          { value: 'early_dinner', label: 'Early Dinner (4-6 PM)', emoji: '🌇' },
          { value: 'dinner', label: 'Traditional Dinner (6-8 PM)', emoji: '🌆' },
          { value: 'late_dinner', label: 'Late Dinner (8+ PM)', emoji: '🌙' }
        ]
      }
    ]

    return questions[Math.min(step, questions.length - 1)]
  }

  const updateRealTimeInsights = () => {
    const insights: string[] = []
    
    if (answers.sweet !== undefined && answers.sweet >= 8) {
      insights.push('🍭 Sweet tooth detected! You\'ll love dessert-focused restaurants')
    }
    
    if (answers.spicy !== undefined && answers.spicy >= 7) {
      insights.push('🌶️ Heat seeker! We\'ll prioritize spicy cuisine recommendations')
    }
    
    if (answers.adventurousness !== undefined && answers.adventurousness >= 8) {
      insights.push('🌍 Culinary explorer! Expect exotic and fusion recommendations')
    }
    
    if (answers.social_dining === 'prefer_social') {
      insights.push('👥 Social diner! We\'ll focus on group-friendly restaurants')
    }
    
    if (answers.cuisine_preferences) {
      const topCuisine = Object.entries(answers.cuisine_preferences)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0]
      if (topCuisine) {
        insights.push(`🍽️ ${topCuisine[0]} cuisine lover detected!`)
      }
    }
    
    setRealTimeInsights(insights)
  }

  const updateConfidenceScore = () => {
    const totalQuestions = 15
    const answeredQuestions = Object.keys(answers).length
    const confidence = Math.round((answeredQuestions / totalQuestions) * 100)
    setConfidenceScore(confidence)
  }

  const handleAnswer = (questionId: string, value: Record<string, unknown>) => {
    const updatedAnswers = { ...answers, [questionId]: value }
    setAnswers(updatedAnswers)
  }

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    try {
      setIsLoading(true)
      
      // Convert answers to full TasteProfileData
      const fullProfile: TasteProfileData = {
        sweet: answers.sweet || 5,
        salty: answers.salty || 5,
        sour: answers.sour || 5,
        bitter: answers.bitter || 5,
        umami: answers.umami || 5,
        spicy: answers.spicy || 5,
        crunchy: answers.crunchy || 5,
        creamy: answers.creamy || 5,
        chewy: answers.chewy || 5,
        hot: answers.hot || 5,
        cold: answers.cold || 5,
        adventurousness: answers.adventurousness || 5,
        social_dining: answers.social_dining || 'mixed',
        meal_frequency: answers.meal_frequency || 'regular',
        cooking_frequency: answers.cooking_frequency || 'sometimes',
        cuisine_preferences: answers.cuisine_preferences || {},
        dietary_restrictions: answers.dietary_restrictions || [],
        allergies: answers.allergies || [],
        comfort_foods: answers.comfort_foods || [],
        celebration_foods: answers.celebration_foods || [],
        stress_foods: answers.stress_foods || [],
        ingredient_preferences: answers.ingredient_preferences || {},
        preparation_methods: answers.preparation_methods || {},
        meal_timing: answers.meal_timing || {}
      }
      
      // Generate final insights
      const finalInsights = generateFinalInsights(fullProfile)
      
      onComplete(fullProfile, finalInsights)
    } catch (error) {
      console.error('Failed to complete questionnaire:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateFinalInsights = (profile: TasteProfileData): string[] => [
    `Your taste profile shows a ${profile.adventurousness >= 7 ? 'high' : profile.adventurousness >= 4 ? 'moderate' : 'conservative'} level of culinary adventurousness`,
    `You prefer ${profile.sweet >= 7 ? 'sweet' : profile.salty >= 7 ? 'salty' : profile.spicy >= 7 ? 'spicy' : 'balanced'} flavors`,
    `Your texture preference leans toward ${profile.crunchy >= 7 ? 'crunchy' : profile.creamy >= 7 ? 'creamy' : 'varied'} foods`,
    `Based on your profile, you'd enjoy ${Object.keys(profile.cuisine_preferences).length > 3 ? 'diverse international' : 'familiar comfort'} cuisines`
  ]

  const renderQuestion = () => {
    if (!currentQuestion) return null

    const questionProps = {
      question: currentQuestion,
      value: answers[currentQuestion.id as keyof TasteProfileData],
      onChange: handleAnswer
    }

    switch (currentQuestion.type) {
      case 'slider':
        return <SliderQuestion {...questionProps} />
      case 'multi_select':
        return <MultiSelectQuestion {...questionProps} />
      case 'emoji_rating':
        return <EmojiRatingQuestion {...questionProps} />
      case 'ranking':
        return <RankingQuestion {...questionProps} />
      case 'comparison':
        return <ComparisonQuestion {...questionProps} />
      case 'scenario':
        return <ScenarioQuestion {...questionProps} />
      default:
        return null
    }
  }

  const progress = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Enhanced Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <Brain className="text-purple-500" size={28} />
            <h1 className="text-3xl font-bold text-gray-900">AI Taste Profiling</h1>
            <Sparkles className="text-orange-500" size={28} />
          </motion.div>
          
          <p className="text-lg text-gray-600 mb-6">
            Building your personalized 11-dimensional taste profile
          </p>
          
          {/* Enhanced Progress Bar */}
          <div className="relative mb-6">
            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-gradient-to-r from-purple-500 via-orange-500 to-red-500 h-3 rounded-full shadow-sm"
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>Question {currentStep + 1} of {totalSteps}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </div>
          
          {/* Confidence Score */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-purple-100">
            <Target size={16} className="text-purple-500" />
            <span className="text-sm font-medium text-gray-700">
              Profile Confidence: {confidenceScore}%
            </span>
          </div>
        </div>

        {/* Real-time Insights */}
        <AnimatePresence>
          {realTimeInsights.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <Eye size={20} className="text-purple-500" />
                <h3 className="font-semibold text-gray-800">Live Insights</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {realTimeInsights.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm"
                  >
                    <Zap size={14} className="text-yellow-500" />
                    <span className="text-sm text-gray-700">{insight}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-orange-100"
          >
            {isLoading ? (
              <div className="text-center py-12">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  <Brain size={32} className="text-purple-500" />
                </motion.div>
                <p className="text-gray-600 mt-4">Analyzing your responses...</p>
              </div>
            ) : (
              currentQuestion && (
                <>
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        {currentQuestion.category.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {currentQuestion.title}
                    </h2>
                    <p className="text-lg text-gray-600 mb-3">
                      {currentQuestion.subtitle}
                    </p>
                    <p className="text-sm text-gray-500">
                      {currentQuestion.description}
                    </p>
                  </div>
                  
                  {renderQuestion()}
                </>
              )
            )}
          </motion.div>
        </AnimatePresence>

        {/* Enhanced Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0 || isLoading}
            className="flex items-center gap-2 px-6 py-3 text-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed hover:text-gray-800 transition-colors rounded-lg hover:bg-gray-50"
          >
            <ChevronLeft size={20} />
            Previous
          </button>
          
          <div className="flex gap-3">
            {onSkip && currentStep < totalSteps - 3 && (
              <button
                onClick={onSkip}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors rounded-lg hover:bg-gray-50"
              >
                Skip for now
              </button>
            )}
            
            <button
              onClick={() => setAnswers({})}
              className="flex items-center gap-2 px-6 py-3 text-orange-600 hover:text-orange-800 transition-colors rounded-lg hover:bg-orange-50"
            >
              <RotateCcw size={16} />
              Reset
            </button>
            
            <button
              onClick={handleNext}
              disabled={!currentQuestion || isLoading}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-500 to-orange-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-orange-600 transition-all transform hover:scale-105 shadow-lg"
            >
              {currentStep === totalSteps - 1 ? (
                <>
                  <Save size={20} />
                  Complete Profile
                </>
              ) : (
                <>
                  Next
                  <ChevronRight size={20} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Question Component Types with Enhanced UI
function SliderQuestion({ question, value, onChange }: Record<string, unknown>) {
  const currentValue = value || Math.floor(((question as any).min + (question as any).max) / 2)
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="text-6xl font-bold text-transparent bg-gradient-to-r from-purple-500 to-orange-500 bg-clip-text mb-2">
          {String(currentValue)}
        </div>
        <div className="text-sm text-gray-500">out of {(question as any).max}</div>
      </div>
      
      <div className="relative">
        <input
          type="range"
          min={(question as any).min || 1}
          max={(question as any).max || 10}
          step={(question as any).step || 1}
          value={Number(currentValue)}
          onChange={(e) => (onChange as any)((question as any).id, parseInt(e.target.value))}
          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-gradient"
        />
        
        <div className="flex justify-between text-sm text-gray-500 mt-3">
          <span>Not at all</span>
          <span>Moderately</span>
          <span>Extremely</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-6">
        {[1, 5, 10].map(num => (
          <button
            key={num}
            onClick={() => (onChange as any)((question as any).id, num)}
            className={`p-3 rounded-lg border-2 transition-all ${
              currentValue === num
                ? 'border-purple-400 bg-purple-50 text-purple-700'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="font-medium">{num}</div>
            <div className="text-xs">
              {num === 1 ? 'Minimal' : num === 5 ? 'Moderate' : 'Maximum'}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function MultiSelectQuestion({ question, value, onChange }: Record<string, unknown>) {
  const selectedValues: string[] = (value as string[]) || []
  
  const toggleSelection = (optionValue: string) => {
    const newSelection: string[] = selectedValues.includes(optionValue)
      ? selectedValues.filter((v: string) => v !== optionValue)
      : [...selectedValues, optionValue]
    ;(onChange as any)((question as any).id, newSelection)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {(question as any).options?.map((option: Record<string, unknown>) => (
        <motion.button
          key={option.value as string}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => toggleSelection(option.value as string)}
          className={`p-6 rounded-xl border-2 transition-all text-left ${
            selectedValues.includes(option.value as string)
              ? 'border-purple-400 bg-gradient-to-br from-purple-50 to-orange-50 text-purple-700 shadow-lg'
              : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'
          }`}
        >
          <div className="text-3xl mb-3">{String(option.emoji)}</div>
          <div className="font-semibold mb-1">{String(option.label)}</div>
          {Boolean(option.description) && (
            <div className="text-sm text-gray-600">{String(option.description)}</div>
          )}
          {selectedValues.includes(option.value as string) && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
            >
              ✓
            </motion.div>
          )}
        </motion.button>
      ))}
    </div>
  )
}

function EmojiRatingQuestion({ question, value, onChange }: Record<string, unknown>) {
  const currentValue = value || '3'
  
  return (
    <div className="space-y-8">
      <div className="flex justify-center gap-4">
        {(question as any).options?.map((option: Record<string, unknown>) => (
          <motion.button
            key={option.value as string}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => (onChange as any)((question as any).id, option.value)}
            className={`p-6 rounded-2xl border-3 transition-all ${
              currentValue === option.value
                ? 'border-purple-400 bg-purple-50 shadow-lg scale-110'
                : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
            }`}
          >
            <div className="text-4xl mb-2">{String(option.emoji)}</div>
            <div className="font-medium text-sm">{String(option.label)}</div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

function RankingQuestion({ question, value, onChange }: Record<string, unknown>) {
  const [rankings, setRankings] = useState<any[]>((value as any[]) || [])
  
  const handleRank = (optionValue: string, rank: number) => {
    const newRankings = [...rankings]
    const existingIndex = newRankings.findIndex((r: any) => r.value === optionValue)
    
    if (existingIndex >= 0) {
      newRankings[existingIndex].rank = rank
    } else {
      newRankings.push({ value: optionValue, rank })
    }
    
    const sortedRankings = [...newRankings].sort((a: any, b: any) => a.rank - b.rank)
    ;(setRankings as any)(sortedRankings)
    (onChange as any)((question as any).id, sortedRankings)
  }

  const getRank = (optionValue: string) => {
    const item = rankings.find((r: Record<string, unknown>) => r.value === optionValue)
    return (item?.rank as number) || 0
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-gray-600 mb-6">
        Click the stars to rank from 1 (most favorite) to 5 (least favorite)
      </p>
      
      {(question as any).options?.map((option: Record<string, unknown>) => {
        const rank = getRank(option.value as string)
        return (
          <motion.div
            key={option.value as string}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">{String(option.emoji)}</span>
              <span className="font-medium text-lg">{String(option.label)}</span>
              {rank > 0 && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  #{rank}
                </span>
              )}
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((starRank) => (
                <motion.button
                  key={starRank}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleRank(option.value as string, starRank)}
                  className={`p-1 rounded ${
                    rank === starRank 
                      ? 'text-yellow-400 bg-yellow-50' 
                      : 'text-gray-300 hover:text-yellow-400'
                  }`}
                >
                  ★
                </motion.button>
              ))}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

function ComparisonQuestion({ question, value, onChange }: Record<string, unknown>) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {(question as any).options?.map((option: Record<string, unknown>) => (
        <motion.button
          key={option.value as string}
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => (onChange as any)((question as any).id, option.value)}
          className={`p-8 rounded-2xl border-2 transition-all text-center ${
            value === option.value
              ? 'border-purple-400 bg-gradient-to-br from-purple-50 to-orange-50 text-purple-700 shadow-xl'
              : 'border-gray-200 hover:border-gray-300 hover:shadow-lg bg-white'
          }`}
        >
          <div className="text-5xl mb-4">{String(option.emoji)}</div>
          <div className="text-xl font-bold mb-2">{String(option.label)}</div>
          <div className="text-sm text-gray-600">{String(option.description)}</div>
        </motion.button>
      ))}
    </div>
  )
}

function ScenarioQuestion({ question, value, onChange }: Record<string, unknown>) {
  return (
    <div className="space-y-6">
      {(question as any).scenarios?.map((scenario: Record<string, unknown>, scenarioIndex: number) => (
        <div key={scenarioIndex} className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
          <h3 className="font-semibold text-gray-800 mb-4">
            Scenario: {String(scenario.situation)}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(scenario.options as string[]).map((option: string, optionIndex: number) => (
              <motion.button
                key={optionIndex}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => (onChange as any)((question as any).id, option)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  value === option
                    ? 'border-purple-400 bg-white text-purple-700 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm'
                }`}
              >
                <div className="font-medium">{option}</div>
              </motion.button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}