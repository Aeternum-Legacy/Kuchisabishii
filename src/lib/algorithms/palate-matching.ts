/**
 * Kuchisabishii Patent-Pending Palate Matching Algorithm
 * Advanced AI-Powered Food Recommendation System
 * 
 * Core Innovation: 11-dimensional taste vectors with emotional intelligence
 * Target Accuracy: 92.3% recommendation accuracy
 * Patent Status: Patent Pending - Advanced Palate Profiling System
 */

import { supabase } from '@/lib/supabase/client'
import { TasteVector } from './taste-vectors'
import { CollaborativeFiltering } from './collaborative-filtering'
import { RecommendationEngine } from './recommendation-engine'

// Algorithm Configuration Constants
export const ALGORITHM_CONFIG = {
  VERSION: 'palate_profile_v2.1',
  TARGET_ACCURACY: 0.923, // 92.3% target accuracy
  SIMILARITY_THRESHOLD: 0.90, // 90%+ user similarity requirement
  TASTE_DIMENSIONS: 11,
  LEARNING_RATES: {
    novice: 0.8,
    developing: 0.5,
    established: 0.3,
    expert: 0.1
  },
  EMOTIONAL_WEIGHTS: {
    satisfaction: 0.35,
    excitement: 0.25,
    comfort: 0.20,
    surprise: 0.15,
    nostalgia: 0.05
  },
  CONTEXT_WEIGHTS: {
    time_of_day: 0.25,
    social_setting: 0.20,
    mood_before: 0.20,
    weather: 0.15,
    location_type: 0.10,
    special_occasion: 0.10
  },
  CACHE_TTL: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  MAX_SIMILAR_USERS: 50,
  RECOMMENDATION_BATCH_SIZE: 20
} as const

// Core Types for Patent-Pending Algorithm
export interface PalateProfile {
  user_id: string
  palate_vector: TasteVector
  emotional_preference_matrix: number[][] // 11x5 matrix
  context_weights: Record<string, number>
  confidence_score: number
  profile_maturity: 'novice' | 'developing' | 'established' | 'expert'
  last_updated: Date
  total_experiences: number
  evolution_history: PalateEvolution[]
}

export interface PalateEvolution {
  timestamp: Date
  vector_change: TasteVector
  trigger_experience: string
  change_magnitude: number
  evolution_type: 'gradual' | 'sudden' | 'seasonal' | 'contextual'
  confidence: number
}

export interface FoodExperience {
  id: string
  user_id: string
  food_item: string
  cuisine_type: string
  restaurant_id?: string
  palate_profile: TasteVector
  emotional_response: EmotionalResponse
  context: ExperienceContext
  timestamp: Date
  confidence: number
  overall_rating: number
}

export interface EmotionalResponse {
  satisfaction: number // 0-10
  excitement: number
  comfort: number
  surprise: number
  nostalgia: number
  overall_rating: number
  emotional_intensity: number
}

export interface ExperienceContext {
  time_of_day: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'late_night'
  social_setting: 'alone' | 'family' | 'friends' | 'date' | 'business' | 'celebration'
  mood_before: 'excited' | 'neutral' | 'tired' | 'stressed' | 'happy' | 'sad'
  weather: 'sunny' | 'rainy' | 'cold' | 'hot' | 'mild' | 'unknown'
  location_type: 'home' | 'restaurant' | 'office' | 'outdoor' | 'event' | 'travel'
  special_occasion?: string
}

export interface UserSimilarity {
  user_a: string
  user_b: string
  similarity_score: number
  taste_alignment: number
  emotional_alignment: number
  context_alignment: number
  confidence: number
  algorithm_version: string
  calculated_at: Date
}

export interface RecommendationResult {
  item_id: string
  item_type: 'restaurant' | 'menu_item' | 'food_experience'
  user_id: string
  total_score: number
  taste_score: number
  emotional_score: number
  context_score: number
  collaborative_score: number
  novelty_score: number
  confidence: number
  reasoning: string[]
  algorithm_version: string
  generated_at: Date
}

/**
 * Main Palate Matching Algorithm Class
 * Implements patent-pending multi-dimensional taste analysis
 */
export class PalateMatchingAlgorithm {
  private static instance: PalateMatchingAlgorithm
  private tasteVectorEngine: TasteVector
  private collaborativeEngine: CollaborativeFiltering
  private recommendationEngine: RecommendationEngine
  
  private constructor() {
    this.tasteVectorEngine = new TasteVector()
    this.collaborativeEngine = new CollaborativeFiltering()
    this.recommendationEngine = new RecommendationEngine()
  }

  public static getInstance(): PalateMatchingAlgorithm {
    if (!PalateMatchingAlgorithm.instance) {
      PalateMatchingAlgorithm.instance = new PalateMatchingAlgorithm()
    }
    return PalateMatchingAlgorithm.instance
  }

  /**
   * CORE ALGORITHM: Generate personalized recommendations
   * Combines taste vectors, emotional intelligence, and collaborative filtering
   */
  async generateRecommendations(
    userId: string,
    context: ExperienceContext,
    options: {
      maxRecommendations?: number
      includeNovelty?: boolean
      contextWeight?: number
      diversityFactor?: number
    } = {}
  ): Promise<RecommendationResult[]> {
    const {
      maxRecommendations = 10,
      includeNovelty = true,
      contextWeight = 1.0,
      diversityFactor = 0.3
    } = options

    try {
      // 1. Get or build user's palate profile
      const palateProfile = await this.getPalateProfile(userId)
      if (!palateProfile) {
        throw new Error('User palate profile not found')
      }

      // 2. Find similar users for collaborative filtering
      const similarUsers = await this.findSimilarUsers(userId, ALGORITHM_CONFIG.MAX_SIMILAR_USERS)

      // 3. Get candidate items from database
      const candidateItems = await this.getCandidateItems(userId, context)

      // 4. Calculate scores for each candidate
      const scoredRecommendations = await Promise.all(
        candidateItems.map(item => 
          this.calculateItemScore(palateProfile, item, context, similarUsers, includeNovelty)
        )
      )

      // 5. Apply filtering and ranking
      const filteredRecommendations = this.applyFiltering(
        scoredRecommendations.filter(rec => rec.total_score > 0.5),
        maxRecommendations,
        diversityFactor
      )

      // 6. Cache results for performance
      await this.cacheRecommendations(userId, filteredRecommendations)

      return filteredRecommendations
    } catch (error) {
      console.error('Error generating recommendations:', error)
      throw new Error('Failed to generate recommendations')
    }
  }

  /**
   * Update user's palate profile with new food experience
   * Uses patent-pending emotional gradient descent algorithm
   */
  async updatePalateProfile(experience: FoodExperience): Promise<PalateProfile> {
    try {
      const currentProfile = await this.getPalateProfile(experience.user_id)
      
      if (!currentProfile) {
        return await this.initializePalateProfile(experience)
      }

      // Apply patent-pending emotional learning algorithm
      const updatedProfile = await this.applyEmotionalLearning(currentProfile, experience)
      
      // Store updated profile
      await this.storePalateProfile(updatedProfile)
      
      return updatedProfile
    } catch (error) {
      console.error('Error updating palate profile:', error)
      throw new Error('Failed to update palate profile')
    }
  }

  /**
   * Calculate user similarity with 90%+ accuracy requirement
   */
  async calculateUserSimilarity(userA: string, userB: string): Promise<UserSimilarity | null> {
    try {
      // Check cache first
      const cached = await this.getCachedSimilarity(userA, userB)
      if (cached && this.isSimilarityCacheValid(cached)) {
        return cached
      }

      const profileA = await this.getPalateProfile(userA)
      const profileB = await this.getPalateProfile(userB)
      
      if (!profileA || !profileB) return null

      const similarity = this.computeSimilarityScore(profileA, profileB)
      
      // Only return if meets 90%+ threshold with high confidence
      if (similarity.similarity_score >= ALGORITHM_CONFIG.SIMILARITY_THRESHOLD && 
          similarity.confidence >= 0.85) {
        await this.cacheSimilarity(similarity)
        return similarity
      }

      return null
    } catch (error) {
      console.error('Error calculating user similarity:', error)
      return null
    }
  }

  /**
   * PATENT-PENDING: Emotional Learning Algorithm
   * Updates taste preferences based on emotional satisfaction gradients
   */
  private async applyEmotionalLearning(
    profile: PalateProfile,
    experience: FoodExperience
  ): Promise<PalateProfile> {
    const learningRate = this.calculateAdaptiveLearningRate(profile)
    const emotionalWeight = this.calculateEmotionalWeight(experience.emotional_response)
    const contextWeight = this.calculateContextWeight(experience.context, profile)
    
    // Core innovation: Emotional Gradient Descent
    const updatedVector = this.tasteVectorEngine.applyEmotionalGradientDescent(
      profile.palate_vector,
      experience.palate_profile,
      experience.emotional_response,
      learningRate,
      emotionalWeight,
      contextWeight
    )

    // Update emotional preference matrix
    const updatedMatrix = this.updateEmotionalPreferenceMatrix(
      profile.emotional_preference_matrix,
      experience
    )

    // Track evolution
    const evolution = this.calculateEvolution(profile.palate_vector, updatedVector, experience)
    
    return {
      ...profile,
      palate_vector: updatedVector,
      emotional_preference_matrix: updatedMatrix,
      evolution_history: [...profile.evolution_history, evolution],
      confidence_score: this.updateConfidenceScore(profile, experience),
      profile_maturity: this.determineProfileMaturity(profile.total_experiences + 1),
      last_updated: new Date(),
      total_experiences: profile.total_experiences + 1
    }
  }

  /**
   * Calculate comprehensive item score using all algorithm components
   */
  private async calculateItemScore(
    profile: PalateProfile,
    item: FoodExperience,
    context: ExperienceContext,
    similarUsers: UserSimilarity[],
    includeNovelty: boolean
  ): Promise<RecommendationResult> {
    // Taste alignment score
    const tasteScore = this.tasteVectorEngine.calculateSimilarity(
      profile.palate_vector,
      item.palate_profile
    )

    // Emotional satisfaction prediction
    const emotionalScore = this.predictEmotionalSatisfaction(
      profile.emotional_preference_matrix,
      item.palate_profile
    )

    // Context alignment
    const contextScore = this.calculateContextAlignment(item.context, context)

    // Collaborative filtering score
    const collaborativeScore = await this.collaborativeEngine.calculateScore(
      item,
      similarUsers
    )

    // Novelty score for exploration
    const noveltyScore = includeNovelty 
      ? this.calculateNoveltyScore(profile, item)
      : 0.5

    // Weighted composite score
    const totalScore = (
      tasteScore * 0.35 +
      emotionalScore * 0.25 +
      contextScore * 0.20 +
      collaborativeScore * 0.15 +
      noveltyScore * 0.05
    )

    const confidence = this.calculateRecommendationConfidence(
      profile, tasteScore, emotionalScore, contextScore
    )

    const reasoning = this.generateReasoningExplanation(
      tasteScore, emotionalScore, contextScore, collaborativeScore, item
    )

    return {
      item_id: item.id,
      item_type: item.restaurant_id ? 'menu_item' : 'food_experience',
      user_id: profile.user_id,
      total_score: Math.min(1, Math.max(0, totalScore)),
      taste_score: tasteScore,
      emotional_score: emotionalScore,
      context_score: contextScore,
      collaborative_score: collaborativeScore,
      novelty_score: noveltyScore,
      confidence,
      reasoning,
      algorithm_version: ALGORITHM_CONFIG.VERSION,
      generated_at: new Date()
    }
  }

  /**
   * Compute similarity score between two palate profiles
   */
  private computeSimilarityScore(profileA: PalateProfile, profileB: PalateProfile): UserSimilarity {
    // Taste vector similarity (cosine similarity)
    const tasteAlignment = this.tasteVectorEngine.calculateSimilarity(
      profileA.palate_vector,
      profileB.palate_vector
    )

    // Emotional preference similarity
    const emotionalAlignment = this.calculateEmotionalSimilarity(
      profileA.emotional_preference_matrix,
      profileB.emotional_preference_matrix
    )

    // Context preference similarity
    const contextAlignment = this.calculateContextSimilarity(
      profileA.context_weights,
      profileB.context_weights
    )

    // Evolution pattern similarity
    const evolutionAlignment = this.calculateEvolutionSimilarity(
      profileA.evolution_history,
      profileB.evolution_history
    )

    // Weighted composite similarity
    const similarityScore = (
      tasteAlignment * 0.40 +
      emotionalAlignment * 0.30 +
      contextAlignment * 0.20 +
      evolutionAlignment * 0.10
    )

    const confidence = this.calculateSimilarityConfidence(profileA, profileB, similarityScore)

    return {
      user_a: profileA.user_id,
      user_b: profileB.user_id,
      similarity_score: Math.min(1, Math.max(0, similarityScore)),
      taste_alignment: tasteAlignment,
      emotional_alignment: emotionalAlignment,
      context_alignment: contextAlignment,
      confidence,
      algorithm_version: ALGORITHM_CONFIG.VERSION,
      calculated_at: new Date()
    }
  }

  // Helper Methods
  private calculateAdaptiveLearningRate(profile: PalateProfile): number {
    const baseRate = ALGORITHM_CONFIG.LEARNING_RATES[profile.profile_maturity]
    const confidenceAdjustment = 1 - (profile.confidence_score / 100)
    return baseRate * (1 + confidenceAdjustment * 0.5)
  }

  private calculateEmotionalWeight(response: EmotionalResponse): number {
    const intensity = response.emotional_intensity / 10
    const consistency = this.calculateEmotionalConsistency(response)
    return Math.min(1, intensity * consistency)
  }

  private calculateContextWeight(context: ExperienceContext, profile: PalateProfile): number {
    // Calculate familiarity with this context based on profile history
    let familiarityScore = 0.5
    
    // Weight by context importance
    const contextScore = Object.entries(context).reduce((score, [key, value]) => {
      const weight = ALGORITHM_CONFIG.CONTEXT_WEIGHTS[key] || 0.1
      return score + (weight * familiarityScore)
    }, 0)
    
    return Math.max(0.3, Math.min(1, contextScore))
  }

  private predictEmotionalSatisfaction(
    emotionalMatrix: number[][],
    itemVector: TasteVector
  ): number {
    const itemValues = Object.values(itemVector)
    let predictedSatisfaction = 0
    
    // Matrix multiplication for emotional prediction
    for (let emotionIdx = 0; emotionIdx < 5; emotionIdx++) {
      let emotionScore = 0
      for (let tasteIdx = 0; tasteIdx < ALGORITHM_CONFIG.TASTE_DIMENSIONS; tasteIdx++) {
        if (emotionalMatrix[tasteIdx]) {
          emotionScore += emotionalMatrix[tasteIdx][emotionIdx] * (itemValues[tasteIdx] / 10)
        }
      }
      const emotionWeight = Object.values(ALGORITHM_CONFIG.EMOTIONAL_WEIGHTS)[emotionIdx]
      predictedSatisfaction += emotionScore * emotionWeight
    }
    
    return Math.min(1, Math.max(0, predictedSatisfaction))
  }

  private calculateContextAlignment(itemContext: ExperienceContext, currentContext: ExperienceContext): number {
    let matches = 0
    let total = 0
    
    Object.keys(currentContext).forEach(key => {
      total++
      if (itemContext[key as keyof ExperienceContext] === 
          currentContext[key as keyof ExperienceContext]) {
        matches++
      }
    })
    
    return total > 0 ? matches / total : 0.5
  }

  private calculateNoveltyScore(profile: PalateProfile, item: FoodExperience): number {
    const userValues = Object.values(profile.palate_vector)
    const itemValues = Object.values(item.palate_profile)
    
    let totalDifference = 0
    userValues.forEach((userVal, idx) => {
      totalDifference += Math.abs(userVal - itemValues[idx])
    })
    
    const avgDifference = totalDifference / userValues.length
    return Math.min(1, avgDifference / 5)
  }

  private calculateEmotionalConsistency(response: EmotionalResponse): number {
    const responses = [
      response.satisfaction,
      response.excitement,
      response.comfort,
      response.surprise,
      response.nostalgia
    ]
    
    const mean = responses.reduce((sum, val) => sum + val, 0) / responses.length
    const variance = responses.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / responses.length
    
    return Math.max(0.1, 1 - (variance / 25))
  }

  private calculateEmotionalSimilarity(matrixA: number[][], matrixB: number[][]): number {
    let totalSimilarity = 0
    let comparisons = 0

    for (let i = 0; i < matrixA.length; i++) {
      for (let j = 0; j < matrixA[i].length; j++) {
        if (matrixA[i] && matrixB[i]) {
          const diff = Math.abs(matrixA[i][j] - matrixB[i][j])
          totalSimilarity += 1 - diff
          comparisons++
        }
      }
    }

    return comparisons > 0 ? totalSimilarity / comparisons : 0
  }

  private calculateContextSimilarity(
    contextsA: Record<string, number>,
    contextsB: Record<string, number>
  ): number {
    const allContexts = new Set([...Object.keys(contextsA), ...Object.keys(contextsB)])
    
    if (allContexts.size === 0) return 0.5

    let similarity = 0
    allContexts.forEach(context => {
      const weightA = contextsA[context] || 0.5
      const weightB = contextsB[context] || 0.5
      similarity += 1 - Math.abs(weightA - weightB)
    })

    return similarity / allContexts.size
  }

  private calculateEvolutionSimilarity(
    evolutionA: PalateEvolution[],
    evolutionB: PalateEvolution[]
  ): number {
    if (evolutionA.length === 0 && evolutionB.length === 0) return 1
    if (evolutionA.length === 0 || evolutionB.length === 0) return 0.3

    const recentA = evolutionA.slice(-10)
    const recentB = evolutionB.slice(-10)

    let similarEvolutions = 0
    const maxComparisons = Math.min(recentA.length, recentB.length)

    for (let i = 0; i < maxComparisons; i++) {
      const evoA = recentA[recentA.length - 1 - i]
      const evoB = recentB[recentB.length - 1 - i]
      
      if (evoA.evolution_type === evoB.evolution_type) {
        const magnitudeSimilarity = 1 - Math.abs(evoA.change_magnitude - evoB.change_magnitude) / 10
        similarEvolutions += Math.max(0, magnitudeSimilarity)
      }
    }

    return maxComparisons > 0 ? similarEvolutions / maxComparisons : 0.5
  }

  private calculateEvolution(
    oldVector: TasteVector,
    newVector: TasteVector,
    experience: FoodExperience
  ): PalateEvolution {
    const vectorChange: TasteVector = {} as TasteVector
    let totalChange = 0

    Object.keys(oldVector).forEach(key => {
      const change = newVector[key as keyof TasteVector] - oldVector[key as keyof TasteVector]
      vectorChange[key as keyof TasteVector] = change
      totalChange += Math.abs(change)
    })

    return {
      timestamp: new Date(),
      vector_change: vectorChange,
      trigger_experience: experience.id,
      change_magnitude: totalChange,
      evolution_type: this.classifyEvolutionType(totalChange),
      confidence: experience.confidence
    }
  }

  private classifyEvolutionType(magnitude: number): PalateEvolution['evolution_type'] {
    if (magnitude > 5) return 'sudden'
    if (magnitude > 2) return 'gradual'
    if (magnitude > 1) return 'contextual'
    return 'gradual'
  }

  private updateConfidenceScore(profile: PalateProfile, experience: FoodExperience): number {
    const experienceWeight = experience.confidence
    const currentConfidence = profile.confidence_score
    const experienceCount = profile.total_experiences
    
    const weight = Math.min(0.1, 1 / experienceCount)
    return currentConfidence * (1 - weight) + experienceWeight * weight
  }

  private determineProfileMaturity(experienceCount: number): PalateProfile['profile_maturity'] {
    if (experienceCount >= 500) return 'expert'
    if (experienceCount >= 100) return 'established'
    if (experienceCount >= 25) return 'developing'
    return 'novice'
  }

  private updateEmotionalPreferenceMatrix(
    currentMatrix: number[][],
    experience: FoodExperience
  ): number[][] {
    const updatedMatrix = currentMatrix.map(row => [...row])
    
    const tasteVector = Object.values(experience.palate_profile)
    const emotionalVector = [
      experience.emotional_response.satisfaction,
      experience.emotional_response.excitement,
      experience.emotional_response.comfort,
      experience.emotional_response.surprise,
      experience.emotional_response.nostalgia
    ]

    for (let i = 0; i < ALGORITHM_CONFIG.TASTE_DIMENSIONS; i++) {
      for (let j = 0; j < 5; j++) {
        const correlation = (tasteVector[i] / 10) * (emotionalVector[j] / 10)
        updatedMatrix[i][j] = updatedMatrix[i][j] * 0.95 + correlation * 0.05
      }
    }

    return updatedMatrix
  }

  private calculateRecommendationConfidence(
    profile: PalateProfile,
    tasteScore: number,
    emotionalScore: number,
    contextScore: number
  ): number {
    const profileConfidence = profile.confidence_score / 100
    const scoreConsistency = 1 - Math.abs(tasteScore - emotionalScore)
    const contextReliability = contextScore
    
    return (profileConfidence + scoreConsistency + contextReliability) / 3
  }

  private calculateSimilarityConfidence(
    profileA: PalateProfile,
    profileB: PalateProfile,
    similarityScore: number
  ): number {
    const maturityA = this.getMaturityScore(profileA.profile_maturity)
    const maturityB = this.getMaturityScore(profileB.profile_maturity)
    const averageMaturity = (maturityA + maturityB) / 2

    const experienceOverlap = Math.min(
      profileA.total_experiences,
      profileB.total_experiences
    ) / Math.max(profileA.total_experiences, profileB.total_experiences)

    const avgProfileConfidence = (profileA.confidence_score + profileB.confidence_score) / 200
    const baseConfidence = (averageMaturity + experienceOverlap + avgProfileConfidence) / 3
    
    const similarityBoost = similarityScore > ALGORITHM_CONFIG.SIMILARITY_THRESHOLD ? 1.2 : 1.0
    return Math.min(1, baseConfidence * similarityBoost)
  }

  private getMaturityScore(maturity: PalateProfile['profile_maturity']): number {
    switch (maturity) {
      case 'expert': return 1.0
      case 'established': return 0.8
      case 'developing': return 0.6
      case 'novice': return 0.4
      default: return 0.4
    }
  }

  private generateReasoningExplanation(
    tasteScore: number,
    emotionalScore: number,
    contextScore: number,
    collaborativeScore: number,
    item: FoodExperience
  ): string[] {
    const reasons: string[] = []
    
    if (tasteScore > 0.8) {
      reasons.push('Excellent match for your taste preferences')
    } else if (tasteScore > 0.6) {
      reasons.push('Good alignment with your palate profile')
    }
    
    if (emotionalScore > 0.7) {
      reasons.push('Likely to provide high emotional satisfaction')
    }
    
    if (contextScore > 0.8) {
      reasons.push('Perfect for your current situation')
    }
    
    if (collaborativeScore > 0.7) {
      reasons.push('Highly rated by users with similar taste preferences')
    }
    
    if (reasons.length === 0) {
      reasons.push('Worth trying based on our advanced taste analysis')
    }
    
    return reasons
  }

  private applyFiltering(
    recommendations: RecommendationResult[],
    maxCount: number,
    diversityFactor: number
  ): RecommendationResult[] {
    if (recommendations.length <= maxCount) return recommendations
    
    // Sort by total score
    const sorted = recommendations.sort((a, b) => b.total_score - a.total_score)
    
    // Apply diversity filtering
    const diverse: RecommendationResult[] = []
    const seenCuisines = new Set<string>()
    
    for (const rec of sorted) {
      if (diverse.length >= maxCount) break
      
      // Add diversity logic here based on cuisine types, flavor profiles, etc.
      diverse.push(rec)
    }
    
    return diverse.slice(0, maxCount)
  }

  // Database Operations
  private async getPalateProfile(userId: string): Promise<PalateProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_palate_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error || !data) return null

      return {
        user_id: data.user_id,
        palate_vector: data.palate_vector,
        emotional_preference_matrix: data.emotional_preference_matrix,
        context_weights: data.context_weights || {},
        confidence_score: data.confidence_score,
        profile_maturity: data.profile_maturity,
        last_updated: new Date(data.last_updated),
        total_experiences: data.total_experiences,
        evolution_history: data.evolution_history || []
      }
    } catch (error) {
      console.error('Error fetching palate profile:', error)
      return null
    }
  }

  private async storePalateProfile(profile: PalateProfile): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_palate_profiles')
        .upsert({
          user_id: profile.user_id,
          palate_vector: profile.palate_vector,
          emotional_preference_matrix: profile.emotional_preference_matrix,
          context_weights: profile.context_weights,
          confidence_score: profile.confidence_score,
          profile_maturity: profile.profile_maturity,
          total_experiences: profile.total_experiences,
          evolution_history: profile.evolution_history,
          last_updated: new Date().toISOString()
        })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error storing palate profile:', error)
      throw error
    }
  }

  private async initializePalateProfile(experience: FoodExperience): Promise<PalateProfile> {
    const profile: PalateProfile = {
      user_id: experience.user_id,
      palate_vector: { ...experience.palate_profile },
      emotional_preference_matrix: this.initializeEmotionalMatrix(),
      context_weights: {},
      confidence_score: experience.confidence,
      profile_maturity: 'novice',
      last_updated: new Date(),
      total_experiences: 1,
      evolution_history: []
    }

    await this.storePalateProfile(profile)
    return profile
  }

  private initializeEmotionalMatrix(): number[][] {
    return Array(ALGORITHM_CONFIG.TASTE_DIMENSIONS).fill(null).map(() => 
      Array(5).fill(0.5)
    )
  }

  private async findSimilarUsers(userId: string, maxUsers: number): Promise<UserSimilarity[]> {
    try {
      const { data, error } = await supabase
        .from('user_similarity_cache')
        .select('*')
        .or(`user_a.eq.${userId},user_b.eq.${userId}`)
        .gte('similarity_score', ALGORITHM_CONFIG.SIMILARITY_THRESHOLD)
        .gt('expires_at', new Date().toISOString())
        .order('similarity_score', { ascending: false })
        .limit(maxUsers)

      if (error) {
        console.error('Error fetching similar users:', error)
        return []
      }

      return data?.map(row => ({
        user_a: row.user_a,
        user_b: row.user_b,
        similarity_score: row.similarity_score,
        taste_alignment: row.taste_alignment,
        emotional_alignment: row.emotional_alignment,
        context_alignment: row.context_alignment,
        confidence: row.confidence,
        algorithm_version: row.algorithm_version,
        calculated_at: new Date(row.calculated_at)
      })) || []
    } catch (error) {
      console.error('Error finding similar users:', error)
      return []
    }
  }

  private async getCandidateItems(userId: string, context: ExperienceContext): Promise<FoodExperience[]> {
    try {
      // Get food experiences from similar contexts and high-rated items
      const { data, error } = await supabase
        .from('food_experiences_detailed')
        .select('*')
        .neq('user_id', userId) // Exclude user's own experiences
        .gte('confidence', 0.7) // High confidence experiences only
        .order('created_at', { ascending: false })
        .limit(ALGORITHM_CONFIG.RECOMMENDATION_BATCH_SIZE)

      if (error || !data) return []

      return data.map(item => ({
        id: item.id,
        user_id: item.user_id,
        food_item: item.food_item,
        cuisine_type: item.cuisine_type || 'unknown',
        restaurant_id: item.restaurant_id,
        palate_profile: item.palate_profile,
        emotional_response: item.emotional_response,
        context: item.context,
        timestamp: new Date(item.created_at),
        confidence: item.confidence,
        overall_rating: item.emotional_response?.overall_rating || 5
      }))
    } catch (error) {
      console.error('Error getting candidate items:', error)
      return []
    }
  }

  private async getCachedSimilarity(userA: string, userB: string): Promise<UserSimilarity | null> {
    try {
      const { data, error } = await supabase
        .from('user_similarity_cache')
        .select('*')
        .or(`and(user_a.eq.${userA},user_b.eq.${userB}),and(user_a.eq.${userB},user_b.eq.${userA})`)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (error || !data) return null

      return {
        user_a: data.user_a,
        user_b: data.user_b,
        similarity_score: data.similarity_score,
        taste_alignment: data.taste_alignment,
        emotional_alignment: data.emotional_alignment,
        context_alignment: data.context_alignment,
        confidence: data.confidence,
        algorithm_version: data.algorithm_version,
        calculated_at: new Date(data.calculated_at)
      }
    } catch (error) {
      return null
    }
  }

  private isSimilarityCacheValid(similarity: UserSimilarity): boolean {
    const ageMs = Date.now() - similarity.calculated_at.getTime()
    return ageMs < (7 * 24 * 60 * 60 * 1000) // 7 days
  }

  private async cacheSimilarity(similarity: UserSimilarity): Promise<void> {
    try {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

      const { error } = await supabase
        .from('user_similarity_cache')
        .upsert({
          user_a: similarity.user_a,
          user_b: similarity.user_b,
          similarity_score: similarity.similarity_score,
          taste_alignment: similarity.taste_alignment,
          emotional_alignment: similarity.emotional_alignment,
          context_alignment: similarity.context_alignment,
          confidence: similarity.confidence,
          algorithm_version: similarity.algorithm_version,
          calculated_at: similarity.calculated_at.toISOString(),
          expires_at: expiresAt.toISOString()
        })

      if (error) {
        console.error('Error caching similarity:', error)
      }
    } catch (error) {
      console.error('Error caching similarity:', error)
    }
  }

  private async cacheRecommendations(userId: string, recommendations: RecommendationResult[]): Promise<void> {
    try {
      const cacheEntries = recommendations.map(rec => ({
        user_id: userId,
        item_type: rec.item_type,
        item_id: rec.item_id,
        recommendation_score: rec.total_score,
        algorithm_version: rec.algorithm_version,
        context_hash: this.generateContextHash(userId),
        expires_at: new Date(Date.now() + ALGORITHM_CONFIG.CACHE_TTL).toISOString()
      }))

      const { error } = await supabase
        .from('recommendation_cache')
        .upsert(cacheEntries)

      if (error) {
        console.error('Error caching recommendations:', error)
      }
    } catch (error) {
      console.error('Error caching recommendations:', error)
    }
  }

  private generateContextHash(userId: string): string {
    // Generate a hash based on current context factors
    const timestamp = Math.floor(Date.now() / (60 * 60 * 1000)) // Hour precision
    return `${userId}_${timestamp}`
  }
}

// Export singleton instance
export const palateMatchingAlgorithm = PalateMatchingAlgorithm.getInstance()
