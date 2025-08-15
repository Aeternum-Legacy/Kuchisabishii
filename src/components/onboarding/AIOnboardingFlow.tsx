'use client'

/**
 * AI-Powered Onboarding Flow Component
 * Interactive questionnaire with visual elements and real-time palate profiling
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Sparkles, Heart, Star } from 'lucide-react'

interface OnboardingQuestion {
  id: string
  type: 'slider' | 'multi_select' | 'emoji_scale' | 'binary' | 'preference_ranking'
  title: string
  description: string
  options?: Array<{ value: string; label: string; emoji?: string }>
  min?: number
  max?: number
}

interface OnboardingProps {
  onComplete: (answers: Record<string, unknown>, personalitySummary: string) => void
  onSkip?: () => void
}

export default function AIOnboardingFlow({ onComplete, onSkip }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [currentQuestion, setCurrentQuestion] = useState<OnboardingQuestion | null>(null)
  const [followUpMessage, setFollowUpMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [totalQuestions, setTotalQuestions] = useState(7)
  const [palateInsights, setPalateInsights] = useState<string[]>([])

  // Load current question
  useEffect(() => {
    loadQuestion()
  }, [currentStep])

  const loadQuestion = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        step: currentStep.toString(),
        answers: encodeURIComponent(JSON.stringify(answers))
      })

      const response = await fetch(`/api/onboarding?${params}`)
      const data = await response.json()

      if (data.success) {
        if (data.data.completed) {
          await handleComplete()
        } else {
          setCurrentQuestion(data.data.question)
          setFollowUpMessage(data.data.followUpMessage)
          setTotalQuestions(data.data.totalQuestions)
          
          // Update palate insights based on current answers
          updatePalateInsights()
        }
      }
    } catch (error) {
      console.error('Failed to load question:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updatePalateInsights = () => {
    const insights: string[] = []
    
    if (answers.taste_sensitivity >= 8) {
      insights.push("🌶️ Bold flavor adventurer")
    } else if (answers.taste_sensitivity <= 3) {
      insights.push("🏠 Comfort food lover")
    }
    
    if (answers.cuisine_preferences?.length > 3) {
      insights.push("🌍 Global cuisine explorer")
    }
    
    if (answers.social_dining === 'social') {
      insights.push("👥 Social dining enthusiast")
    }
    
    setPalateInsights(insights)
  }

  const handleAnswer = (questionId: string, value: Record<string, unknown>) => {
    const updatedAnswers = { ...answers, [questionId]: value }
    setAnswers(updatedAnswers)
  }

  const handleNext = () => {
    if (currentStep < totalQuestions - 1) {
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
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      })

      const data = await response.json()
      
      if (data.success) {
        onComplete(answers, data.data.personality_summary)
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderQuestion = () => {
    if (!currentQuestion) return null

    switch (currentQuestion.type) {
      case 'slider':
        return <SliderQuestion question={currentQuestion} value={answers[currentQuestion.id]} onChange={handleAnswer} />
      case 'multi_select':
        return <MultiSelectQuestion question={currentQuestion} value={answers[currentQuestion.id]} onChange={handleAnswer} />
      case 'emoji_scale':
        return <EmojiScaleQuestion question={currentQuestion} value={answers[currentQuestion.id]} onChange={handleAnswer} />
      case 'binary':
        return <BinaryQuestion question={currentQuestion} value={answers[currentQuestion.id]} onChange={handleAnswer} />
      case 'preference_ranking':
        return <PreferenceRankingQuestion question={currentQuestion} value={answers[currentQuestion.id]} onChange={handleAnswer} />
      default:
        return null
    }
  }

  const progress = ((currentStep + 1) / totalQuestions) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <Sparkles className="text-orange-500" size={24} />
            <h1 className="text-2xl font-bold text-gray-900">Create Your Taste Profile</h1>
            <Sparkles className="text-orange-500" size={24} />
          </motion.div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-orange-400 to-red-400 h-2 rounded-full"
            />
          </div>
          
          <p className="text-gray-600">
            Question {currentStep + 1} of {totalQuestions}
          </p>
        </div>

        {/* Palate Insights Sidebar */}
        {palateInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-orange-100"
          >
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Heart size={16} className="text-red-400" />
              Your Emerging Profile
            </h3>
            <div className="flex flex-wrap gap-2">
              {palateInsights.map((insight, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm"
                >
                  {insight}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-8 mb-6"
          >
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-400 border-t-transparent mx-auto mb-4" />
                <p className="text-gray-600">Loading your personalized question...</p>
              </div>
            ) : (
              <>
                {currentQuestion && (
                  <>
                    <h2 className="text-xl font-semibold text-gray-900 mb-3">
                      {currentQuestion.title}
                    </h2>
                    <p className="text-gray-600 mb-6">
                      {currentQuestion.description}
                    </p>
                    
                    {renderQuestion()}
                    
                    {followUpMessage && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <p className="text-blue-800 text-sm">{followUpMessage}</p>
                      </motion.div>
                    )}
                  </>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0 || isLoading}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed hover:text-gray-800 transition-colors"
          >
            <ChevronLeft size={20} />
            Previous
          </button>
          
          <div className="flex gap-3">
            {onSkip && (
              <button
                onClick={onSkip}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Skip for now
              </button>
            )}
            
            <button
              onClick={handleNext}
              disabled={!currentQuestion || !answers[currentQuestion.id] || isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-orange-400 to-red-400 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-orange-500 hover:to-red-500 transition-all transform hover:scale-105"
            >
              {currentStep === totalQuestions - 1 ? 'Complete' : 'Next'}
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Question Component Types
function SliderQuestion({ question, value, onChange }: Record<string, unknown>) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-gray-500">
        <span>Not at all</span>
        <span>Extremely</span>
      </div>
      <input
        type="range"
        min={question.min || 1}
        max={question.max || 10}
        value={value || 5}
        onChange={(e) => onChange(question.id, parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
      />
      <div className="text-center">
        <span className="text-2xl font-bold text-orange-500">{value || 5}</span>
        <span className="text-gray-500"> / {question.max || 10}</span>
      </div>
    </div>
  )
}

function MultiSelectQuestion({ question, value, onChange }: Record<string, unknown>) {
  const selectedValues = value || []
  
  const toggleSelection = (optionValue: string) => {
    const newSelection = selectedValues.includes(optionValue)
      ? selectedValues.filter((v: string) => v !== optionValue)
      : [...selectedValues, optionValue]
    onChange(question.id, newSelection)
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {question.options?.map((option: Record<string, unknown>) => (
        <motion.button
          key={option.value}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => toggleSelection(option.value)}
          className={`p-4 rounded-lg border-2 transition-all ${
            selectedValues.includes(option.value)
              ? 'border-orange-400 bg-orange-50 text-orange-700'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-2xl mb-2">{option.emoji}</div>
          <div className="text-sm font-medium">{option.label}</div>
        </motion.button>
      ))}
    </div>
  )
}

function EmojiScaleQuestion({ question, value, onChange }: Record<string, unknown>) {
  const ratings = value || {}
  
  const handleRating = (optionValue: string, rating: number) => {
    onChange(question.id, { ...ratings, [optionValue]: rating })
  }

  const emojiScale = ['😡', '😞', '😐', '😊', '😍']

  return (
    <div className="space-y-6">
      {question.options?.map((option: Record<string, unknown>) => (
        <div key={option.value} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-xl">{option.emoji}</span>
            <span className="font-medium">{option.label}</span>
          </div>
          <div className="flex gap-2">
            {emojiScale.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleRating(option.value, index + 1)}
                className={`text-2xl p-2 rounded transition-transform hover:scale-110 ${
                  ratings[option.value] === index + 1 ? 'bg-orange-100 scale-110' : ''
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function BinaryQuestion({ question, value, onChange }: Record<string, unknown>) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {question.options?.map((option: Record<string, unknown>) => (
        <motion.button
          key={option.value}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange(question.id, option.value)}
          className={`p-6 rounded-lg border-2 transition-all ${
            value === option.value
              ? 'border-orange-400 bg-orange-50 text-orange-700'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-4xl mb-3">{option.emoji}</div>
          <div className="font-medium">{option.label}</div>
        </motion.button>
      ))}
    </div>
  )
}

function PreferenceRankingQuestion({ question, value, onChange }: Record<string, unknown>) {
  const [rankings, setRankings] = useState(value || [])
  
  const handleRank = (optionValue: string, rank: number) => {
    const newRankings = [...rankings]
    const existingIndex = newRankings.findIndex(r => r.value === optionValue)
    
    if (existingIndex >= 0) {
      newRankings[existingIndex].rank = rank
    } else {
      newRankings.push({ value: optionValue, rank })
    }
    
    setRankings(newRankings)
    onChange(question.id, newRankings.sort((a, b) => a.rank - b.rank))
  }

  const getRank = (optionValue: string) => {
    const item = rankings.find((r: Record<string, unknown>) => r.value === optionValue)
    return item?.rank || 0
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">Click the stars to rank from 1 (favorite) to 5 (least favorite)</p>
      {question.options?.map((option: Record<string, unknown>) => (
        <div key={option.value} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-xl">{option.emoji}</span>
            <span className="font-medium">{option.label}</span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((rank) => (
              <button
                key={rank}
                onClick={() => handleRank(option.value, rank)}
                className={`p-1 ${getRank(option.value) >= rank ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
              >
                <Star size={20} fill="currentColor" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}