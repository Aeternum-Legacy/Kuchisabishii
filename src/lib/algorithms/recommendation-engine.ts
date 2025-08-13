/**
 * Real-time Recommendation Engine
 * Orchestrates multiple algorithms for 92.3% accuracy target
 */

import { supabase } from '@/lib/supabase/client'
import { CollaborativeFiltering } from './collaborative-filtering'
import { TasteVector } from './taste-vectors'
import { ALGORITHM_CONFIG, PalateProfile, FoodExperience, UserSimilarity } from './palate-matching'

export interface RecommendationRequest {
  user_id: string
  context: ExperienceContext
  preferences?: RecommendationPreferences
}

export interface RecommendationPreferences {
  max_recommendations?: number
  include_novelty?: boolean
  diversity_factor?: number
  dietary_restrictions?: string[]
  exclude_cuisines?: string[]
  price_range?: [number, number]
  location?: {
    latitude: number
    longitude: number
    radius_km: number
  }
  time_constraints?: string
}

export interface ExperienceContext {
  time_of_day: 'breakfast' | 'brunch' | 'lunch' | 'dinner' | 'snack' | 'late_night'
  social_setting: 'alone' | 'family' | 'friends' | 'date' | 'business' | 'celebration'
  mood_before: 'excited' | 'neutral' | 'tired' | 'stressed' | 'happy' | 'sad'
  weather: 'sunny' | 'rainy' | 'cold' | 'hot' | 'mild' | 'unknown'
  location_type: 'home' | 'restaurant' | 'office' | 'outdoor' | 'event' | 'travel'
}

export interface RecommendationResult {
  item_id: string
  item_type: 'menu_item' | 'restaurant' | 'food_experience'
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

export interface RecommendationResponse {
  recommendations: RecommendationResult[]
  metrics: RecommendationMetrics
  explanations: Map<string, RecommendationExplanation>
  fallback_used: boolean
  cache_hit: boolean
}

export interface RecommendationMetrics {
  total_candidates: number
  filtered_candidates: number
  processing_time_ms: number
  algorithm_version: string
  confidence_distribution: {
    high: number
    medium: number
    low: number
  }
  diversity_score: number
  novelty_score: number
}

export interface RecommendationExplanation {
  primary_reason: string
  supporting_factors: string[]
  confidence_factors: {
    taste_match: number
    emotional_prediction: number
    context_relevance: number
    social_proof: number
    freshness: number
  }
  similar_users_count: number
  algorithm_weights: {
    taste: number
    emotional: number
    context: number
    collaborative: number
    novelty: number
  }
}

/**
 * Main Recommendation Engine
 * Orchestrates all algorithms for optimal recommendations
 */
export class RecommendationEngine {
  private collaborativeFilter: CollaborativeFiltering

  constructor() {
    this.collaborativeFilter = new CollaborativeFiltering()
  }

  /**
   * Generate personalized recommendations
   */
  async generateRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
    const startTime = Date.now()
    
    try {
      // Validate request
      if (!request.user_id) {
        throw new Error('User ID is required')
      }

      // Check cache first
      const cached = await this.getCachedRecommendations(request)
      if (cached) {
        return cached
      }

      // Get user profile and similar users
      const [profile, similarUsers] = await Promise.all([
        this.getUserPalateProfile(request.user_id),
        this.findSimilarUsers(request.user_id)
      ])

      if (!profile) {
        return await this.generateFallbackRecommendations(request, startTime)
      }

      // Get candidate items
      const candidates = await this.getCandidateItems(request, profile)
      
      // Score all candidates
      const scoredItems = await this.scoreAllCandidates(
        candidates,
        profile,
        request.context,
        similarUsers,
        request.preferences
      )

      // Apply advanced filtering
      const filteredRecommendations = this.applyAdvancedFiltering(
        scoredItems,
        request.preferences,
        profile
      )

      // Calculate metrics
      const processingTime = Date.now() - startTime
      const metrics = this.calculateMetrics(candidates, filteredRecommendations, processingTime)

      // Generate explanations
      const explanations = this.generateExplanations(filteredRecommendations, profile, similarUsers)

      const response: RecommendationResponse = {
        recommendations: filteredRecommendations,
        metrics,
        explanations,
        fallback_used: false,
        cache_hit: false
      }

      // Cache the results
      await this.cacheRecommendations(request, response)

      return response
    } catch (error) {
      console.error('Error generating recommendations:', error)
      return await this.generateFallbackRecommendations(request, startTime)
    }
  }

  /**
   * Score all candidate items using multiple algorithms
   */
  private async scoreAllCandidates(
    candidates: FoodExperience[],
    profile: PalateProfile,
    context: ExperienceContext,
    similarUsers: UserSimilarity[],
    preferences: RecommendationRequest['preferences']
  ): Promise<RecommendationResult[]> {
    const results: RecommendationResult[] = []

    for (const candidate of candidates) {
      try {
        const result = await this.calculateComprehensiveScore(
          candidate,
          profile,
          context,
          similarUsers,
          preferences
        )
        
        if (result.total_score > 0.3) {
          results.push(result)
        }
      } catch (error) {
        console.error('Error scoring candidate:', error)
      }
    }

    return results
  }

  /**
   * Calculate comprehensive score for a single item
   */
  private async calculateComprehensiveScore(
    item: FoodExperience,
    profile: PalateProfile,
    context: ExperienceContext,
    similarUsers: UserSimilarity[],
    preferences: RecommendationRequest['preferences'] = {}
  ): Promise<RecommendationResult> {
    // Core algorithm components
    const tasteScore = TasteVector.calculateSimilarity(profile.palate_vector, item.palate_profile)
    const emotionalScore = this.predictEmotionalSatisfaction(profile, item)
    const contextScore = this.calculateContextRelevance(item.context, context)
    const collaborativeScore = await this.collaborativeFilter.calculateScore(item, similarUsers)
    const noveltyScore = preferences.include_novelty ? this.calculateNoveltyScore(profile, item) : 0.5
    
    // Calculate weighted score
    const totalScore = (
      tasteScore * 0.35 +
      emotionalScore * 0.25 +
      contextScore * 0.20 +
      collaborativeScore * 0.15 +
      noveltyScore * 0.05
    )

    // Calculate confidence
    const confidence = Math.min(1, Math.max(0.1, 
      (tasteScore + emotionalScore + contextScore + collaborativeScore) / 4
    ))

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
      reasoning: this.generateReasoning(tasteScore, emotionalScore, contextScore, collaborativeScore),
      algorithm_version: ALGORITHM_CONFIG.VERSION,
      generated_at: new Date()
    }
  }

  /**
   * Predict emotional satisfaction
   */
  private predictEmotionalSatisfaction(profile: PalateProfile, item: FoodExperience): number {
    // Simple emotional prediction based on taste alignment
    const tasteAlignment = TasteVector.calculateSimilarity(profile.palate_vector, item.palate_profile)
    
    // Use emotional response from the item if available
    if (item.emotional_response?.overall_rating) {
      return (item.emotional_response.overall_rating / 10) * tasteAlignment
    }
    
    return tasteAlignment * 0.8 // Conservative prediction
  }

  /**
   * Calculate context relevance score
   */
  private calculateContextRelevance(itemContext: ExperienceContext, currentContext: ExperienceContext): number {
    let matches = 0
    let total = 0

    const contextKeys: (keyof ExperienceContext)[] = ['time_of_day', 'social_setting', 'mood_before', 'weather', 'location_type']
    
    contextKeys.forEach(key => {
      if (itemContext[key] && currentContext[key]) {
        total++
        if (itemContext[key] === currentContext[key]) {
          matches++
        }
      }
    })

    return total > 0 ? matches / total : 0.5
  }

  /**
   * Calculate novelty score
   */
  private calculateNoveltyScore(profile: PalateProfile, item: FoodExperience): number {
    const userValues = Object.values(profile.palate_vector)
    const itemValues = Object.values(item.palate_profile)
    
    let totalDifference = 0
    userValues.forEach((userVal, idx) => {
      totalDifference += Math.abs(userVal - itemValues[idx])
    })
    
    return Math.min(1, totalDifference / (userValues.length * 5))
  }

  /**
   * Generate reasoning for recommendations
   */
  private generateReasoning(
    tasteScore: number,
    emotionalScore: number,
    contextScore: number,
    collaborativeScore: number
  ): string[] {
    const reasons: string[] = []

    if (tasteScore > 0.8) {
      reasons.push('Excellent match for your taste preferences')
    } else if (tasteScore > 0.6) {
      reasons.push('Good alignment with your palate profile')
    }

    if (emotionalScore > 0.75) {
      reasons.push('Likely to provide high satisfaction')
    }

    if (contextScore > 0.8) {
      reasons.push('Perfect for your current situation')
    }

    if (collaborativeScore > 0.7) {
      reasons.push('Highly rated by users with similar tastes')
    }

    if (reasons.length === 0) {
      reasons.push('Recommended based on advanced taste analysis')
    }

    return reasons.slice(0, 3)
  }

  /**
   * Apply advanced filtering and ranking
   */
  private applyAdvancedFiltering(
    recommendations: RecommendationResult[],
    preferences: RecommendationRequest['preferences'] = {},
    profile: PalateProfile
  ): RecommendationResult[] {
    let filtered = [...recommendations]

    // Sort by total score
    filtered.sort((a, b) => b.total_score - a.total_score)

    // Apply diversity filtering
    if (preferences.diversity_factor && preferences.diversity_factor > 0) {
      filtered = this.applyDiversityFilter(filtered, preferences.diversity_factor)
    }

    // Limit results
    const maxRecs = preferences.max_recommendations || 10
    filtered = filtered.slice(0, maxRecs)

    // Apply minimum confidence threshold
    filtered = filtered.filter(rec => rec.confidence > 0.4)

    return filtered
  }

  /**
   * Apply diversity filtering
   */
  private applyDiversityFilter(
    recommendations: RecommendationResult[],
    diversityFactor: number
  ): RecommendationResult[] {
    if (diversityFactor <= 0 || recommendations.length <= 1) {
      return recommendations
    }

    // Simple diversity implementation
    const diverse: RecommendationResult[] = []
    const usedScores = new Set<string>()

    for (const rec of recommendations) {
      const scoreKey = Math.floor(rec.total_score * 10).toString()
      
      if (diverse.length < 3 || !usedScores.has(scoreKey) || diverse.length < recommendations.length * (1 - diversityFactor)) {
        diverse.push(rec)
        usedScores.add(scoreKey)
      }
    }

    return diverse
  }

  /**
   * Calculate metrics
   */
  private calculateMetrics(
    candidates: FoodExperience[],
    recommendations: RecommendationResult[],
    processingTime: number
  ): RecommendationMetrics {
    const confidenceDistribution = {
      high: recommendations.filter(r => r.confidence > 0.8).length,
      medium: recommendations.filter(r => r.confidence >= 0.5 && r.confidence <= 0.8).length,
      low: recommendations.filter(r => r.confidence < 0.5).length
    }

    const diversityScore = Math.min(1, recommendations.length / Math.min(candidates.length, 10))
    const avgNovelty = recommendations.length > 0 
      ? recommendations.reduce((sum, r) => sum + r.novelty_score, 0) / recommendations.length 
      : 0

    return {
      total_candidates: candidates.length,
      filtered_candidates: recommendations.length,
      processing_time_ms: processingTime,
      algorithm_version: ALGORITHM_CONFIG.VERSION,
      confidence_distribution,
      diversity_score: diversityScore,
      novelty_score: avgNovelty
    }
  }

  /**
   * Generate explanations
   */
  private generateExplanations(
    recommendations: RecommendationResult[],
    profile: PalateProfile,
    similarUsers: UserSimilarity[]
  ): Map<string, RecommendationExplanation> {
    const explanations = new Map<string, RecommendationExplanation>()

    recommendations.forEach(rec => {
      explanations.set(rec.item_id, {
        primary_reason: rec.reasoning[0] || 'Advanced taste analysis',
        supporting_factors: rec.reasoning.slice(1),
        confidence_factors: {
          taste_match: rec.taste_score,
          emotional_prediction: rec.emotional_score,
          context_relevance: rec.context_score,
          social_proof: rec.collaborative_score,
          freshness: 0.8
        },
        similar_users_count: similarUsers.length,
        algorithm_weights: {
          taste: 0.35,
          emotional: 0.25,
          context: 0.20,
          collaborative: 0.15,
          novelty: 0.05
        }
      })
    })

    return explanations
  }

  // Database operations
  private async getUserPalateProfile(userId: string): Promise<PalateProfile | null> {
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
      console.error('Error fetching user palate profile:', error)
      return null
    }
  }

  private async findSimilarUsers(userId: string): Promise<UserSimilarity[]> {
    try {
      const { data, error } = await supabase
        .from('user_similarity_cache')
        .select('*')
        .or(`user_a.eq.${userId},user_b.eq.${userId}`)
        .gte('similarity_score', ALGORITHM_CONFIG.SIMILARITY_THRESHOLD)
        .order('similarity_score', { ascending: false })
        .limit(20)

      if (error) return []

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

  private async getCandidateItems(
    request: RecommendationRequest,
    profile: PalateProfile
  ): Promise<FoodExperience[]> {
    try {
      let query = supabase
        .from('food_experiences_detailed')
        .select('*')
        .neq('user_id', request.user_id)
        .gte('confidence', 0.6)

      if (request.preferences?.exclude_cuisines) {
        query = query.not('cuisine_type', 'in', `(${request.preferences.exclude_cuisines.join(',')})`)
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(100)

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

  private async generateFallbackRecommendations(
    request: RecommendationRequest,
    startTime: number
  ): Promise<RecommendationResponse> {
    try {
      const { data } = await supabase
        .from('food_experiences_detailed')
        .select('*')
        .neq('user_id', request.user_id)
        .gte('confidence', 0.8)
        .order('created_at', { ascending: false })
        .limit(5)

      const fallbackRecommendations: RecommendationResult[] = (data || []).map(item => ({
        item_id: item.id,
        item_type: 'food_experience' as const,
        user_id: request.user_id,
        total_score: 0.6,
        taste_score: 0.5,
        emotional_score: 0.6,
        context_score: 0.5,
        collaborative_score: 0.7,
        novelty_score: 0.5,
        confidence: 0.5,
        reasoning: ['Popular choice among users'],
        algorithm_version: ALGORITHM_CONFIG.VERSION,
        generated_at: new Date()
      }))

      return {
        recommendations: fallbackRecommendations,
        metrics: this.calculateMetrics([], fallbackRecommendations, Date.now() - startTime),
        explanations: new Map(),
        fallback_used: true,
        cache_hit: false
      }
    } catch (error) {
      return {
        recommendations: [],
        metrics: {
          total_candidates: 0,
          filtered_candidates: 0,
          processing_time_ms: Date.now() - startTime,
          algorithm_version: ALGORITHM_CONFIG.VERSION,
          confidence_distribution: { high: 0, medium: 0, low: 0 },
          diversity_score: 0,
          novelty_score: 0
        },
        explanations: new Map(),
        fallback_used: true,
        cache_hit: false
      }
    }
  }

  // Cache operations
  private async getCachedRecommendations(request: RecommendationRequest): Promise<RecommendationResponse | null> {
    return null // Simplified - would implement caching in production
  }

  private async cacheRecommendations(request: RecommendationRequest, response: RecommendationResponse): Promise<void> {
    // Simplified - would implement caching in production
  }
}

export default RecommendationEngine