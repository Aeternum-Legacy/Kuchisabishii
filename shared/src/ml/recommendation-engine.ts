/**
 * AI-Powered Recommendation Engine for Kuchisabishii
 * Advanced emotional intelligence system that orchestrates all ML models
 * for comprehensive, emotionally-aware food recommendations
 */

import TasteEvolutionTracker, { 
  TasteSnapshot, 
  TasteEvolutionPrediction 
} from './models/taste-evolution-tracker';
import EmotionalAI, { 
  EmotionalContext, 
  EmotionalState, 
  KuchisabishiiDetection, 
  MoodBasedRecommendation 
} from './models/emotional-ai';
import CollaborativeIntelligence, {
  TasteTwin,
  CollaborativeRecommendation,
  SocialInfluenceWeights
} from './collaborative-intelligence';
import RealTimeAdaptationEngine, {
  AdaptationEvent,
  ContextSwitchDetection
} from './real-time-adaptation';
import PersonalizationEngine, {
  PersonalTasteProfile,
  PersonalizationInsights
} from './personalization-engine';
import DiscoveryAlgorithms, {
  SerendipityParameters,
  DiscoveryRecommendation,
  AdventureComfortBalance
} from './discovery-algorithms';
import { supabase } from '../lib/supabase/client';
import type { DbUserPreferences, RestaurantWithDetails } from '../lib/types/api';

export interface RecommendationRequest {
  userId: string;
  context: {
    currentTime: Date;
    location?: {
      latitude: number;
      longitude: number;
    };
    weather?: {
      condition: string;
      temperature: number;
    };
    socialContext?: 'solo' | 'friends' | 'family' | 'date' | 'business';
    explicitMood?: string;
    moodConfidence?: number;
  };
  preferences?: {
    maxDistance?: number;
    priceRange?: number[];
    cuisineTypes?: string[];
    includeExplanations?: boolean;
    diversityLevel?: number; // 0-1, how much variety in recommendations
  };
  limit?: number;
}

export interface ComprehensiveRecommendation {
  restaurantId: string;
  restaurant: RestaurantWithDetails;
  recommendedDishes?: string[];
  
  // Scoring components
  scores: {
    tasteMatch: number;        // How well it matches evolved taste preferences
    moodMatch: number;         // How well it matches current emotional state
    socialFit: number;         // How well it fits social context
    contextualFit: number;     // Time, location, weather appropriateness
    noveltyScore: number;      // How new/adventurous this recommendation is
    overallScore: number;      // Weighted combination of all scores
  };
  
  // Explanations
  reasoning: {
    primary: string;           // Main reason for recommendation
    secondary: string[];       // Additional reasons
    emotionalMatch?: string;   // Emotional reasoning if applicable
    tasteEvolution?: string;   // Taste evolution reasoning if applicable
  };
  
  // Recommendation metadata
  confidence: number;
  recommendationType: 'taste_evolution' | 'mood_based' | 'social' | 'contextual' | 'discovery';
  expectedSatisfaction: number;
  
  // Personalization features
  personalizations: {
    dishModifications?: string[];
    alternativeOptions?: string[];
    pairingRecommendations?: string[];
  };
}

export interface RecommendationResponse {
  recommendations: ComprehensiveRecommendation[];
  insights: {
    detectedMood?: EmotionalState;
    kuchisabishiiDetection?: KuchisabishiiDetection;
    tasteEvolution?: TasteEvolutionPrediction;
    recommendationStrategy: string;
  };
  metadata: {
    modelVersions: {
      tasteEvolution: string;
      emotionalAI: string;
      collaborativeFiltering: string;
    };
    processingTimeMs: number;
    fallbacksUsed: string[];
  };
}

export class RecommendationEngine {
  private tasteTracker: TasteEvolutionTracker;
  private emotionalAI: EmotionalAI;
  private collaborativeIntelligence: CollaborativeIntelligence;
  private realtimeAdaptation: RealTimeAdaptationEngine;
  private personalizationEngine: PersonalizationEngine;
  private discoveryAlgorithms: DiscoveryAlgorithms;
  
  private isInitialized: boolean = false;
  private emotionalIntelligenceEnabled: boolean = true;
  
  // Enhanced model versions for tracking
  private readonly modelVersions = {
    tasteEvolution: 'v2.1.0',
    emotionalAI: 'v2.0.0',
    collaborativeFiltering: 'v2.0.0',
    realtimeAdaptation: 'v1.0.0',
    personalization: 'v1.0.0',
    discovery: 'v1.0.0',
  };

  // Performance monitoring
  private recommendationMetrics: Map<string, any> = new Map();
  private emotionalAccuracyHistory: number[] = [];

  constructor() {
    this.tasteTracker = new TasteEvolutionTracker();
    this.emotionalAI = new EmotionalAI();
    this.collaborativeIntelligence = new CollaborativeIntelligence();
    this.realtimeAdaptation = new RealTimeAdaptationEngine();
    this.personalizationEngine = new PersonalizationEngine();
    this.discoveryAlgorithms = new DiscoveryAlgorithms();
  }

  /**
   * Initialize the recommendation engine
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Models are initialized in their constructors
      // Additional setup can be added here
      this.isInitialized = true;
      console.log('Recommendation engine initialized successfully');
    } catch (error) {
      console.error('Failed to initialize recommendation engine:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive emotionally-intelligent personalized recommendations
   */
  public async getRecommendations(
    request: RecommendationRequest
  ): Promise<RecommendationResponse> {
    const startTime = Date.now();
    const fallbacksUsed: string[] = [];

    await this.initialize();

    try {
      // Step 1: Enhanced data gathering with personalization
      const [userPreferences, tasteHistory, emotionalContext, candidateRestaurants, personalProfile] = 
        await Promise.all([
          this.getUserPreferences(request.userId),
          this.getTasteHistory(request.userId),
          this.buildEmotionalContext(request.userId, request.context),
          this.getCandidateRestaurants(request),
          this.personalizationEngine.buildPersonalTasteProfile(request.userId),
        ]);

      // Step 2: Advanced AI model orchestration
      const [tasteEvolution, emotionalState, kuchisabishiiDetection, tasteTwins, contextSwitch] = 
        await Promise.allSettled([
          this.predictTasteEvolution(tasteHistory),
          this.detectEmotionalState(emotionalContext),
          this.detectKuchisabishii(emotionalContext),
          this.collaborativeIntelligence.findTasteTwins(request.userId, 10),
          this.realtimeAdaptation.detectContextSwitch({
            userId: request.userId,
            eventType: 'context_change',
            context: {
              timestamp: request.context.currentTime,
              mood: request.context.explicitMood,
              socialContext: request.context.socialContext,
              timeOfDay: request.context.currentTime.getHours(),
              location: request.context.location
            }
          } as AdaptationEvent)
        ]);

      // Step 3: Emotional intelligence layer
      const emotionalInsights = await this.generateEmotionalIntelligenceLayer({
        emotionalState: emotionalState.status === 'fulfilled' ? emotionalState.value : null,
        kuchisabishiiDetection: kuchisabishiiDetection.status === 'fulfilled' ? kuchisabishiiDetection.value : null,
        personalProfile,
        context: request.context
      });

      // Step 4: Multi-modal recommendation generation
      const [ensembleRecs, collaborativeRecs, discoveryRecs] = await Promise.all([
        this.generateEnsembleRecommendations({
          request,
          userPreferences,
          tasteEvolution: tasteEvolution.status === 'fulfilled' ? tasteEvolution.value : null,
          emotionalState: emotionalState.status === 'fulfilled' ? emotionalState.value : null,
          kuchisabishiiDetection: kuchisabishiiDetection.status === 'fulfilled' ? kuchisabishiiDetection.value : null,
          candidateRestaurants,
          fallbacksUsed,
          personalProfile,
          emotionalInsights
        }),
        this.generateCollaborativeRecommendations({
          userId: request.userId,
          tasteTwins: tasteTwins.status === 'fulfilled' ? tasteTwins.value : [],
          context: request.context
        }),
        this.generateDiscoveryRecommendations({
          userId: request.userId,
          personalProfile,
          context: request.context
        })
      ]);

      // Step 5: Intelligent recommendation fusion
      const fusedRecommendations = await this.fuseMultiModalRecommendations({
        ensemble: ensembleRecs,
        collaborative: collaborativeRecs,
        discovery: discoveryRecs,
        emotionalInsights,
        personalProfile
      });

      // Step 6: Apply advanced optimization
      const optimizedRecommendations = await this.applyAdvancedOptimization(
        fusedRecommendations,
        {
          request,
          emotionalState: emotionalState.status === 'fulfilled' ? emotionalState.value : null,
          personalProfile,
          diversityLevel: request.preferences?.diversityLevel ?? 0.7
        }
      );

      // Step 7: Final ranking with emotional weights
      const finalRecommendations = this.rankWithEmotionalIntelligence(
        optimizedRecommendations,
        emotionalInsights,
        request.limit ?? 10
      );

      const processingTimeMs = Date.now() - startTime;

      // Record performance metrics
      this.recordRecommendationMetrics(request.userId, {
        processingTime: processingTimeMs,
        recommendationsGenerated: finalRecommendations.length,
        emotionalAccuracy: emotionalInsights.confidence,
        modelsUsed: Object.keys(this.modelVersions).filter(model => 
          !fallbacksUsed.includes(`${model}_fallback`)
        )
      });

      return {
        recommendations: finalRecommendations,
        insights: {
          detectedMood: emotionalState.status === 'fulfilled' ? emotionalState.value : undefined,
          kuchisabishiiDetection: kuchisabishiiDetection.status === 'fulfilled' ? kuchisabishiiDetection.value : undefined,
          tasteEvolution: tasteEvolution.status === 'fulfilled' ? tasteEvolution.value : undefined,
          recommendationStrategy: this.determineAdvancedRecommendationStrategy(request, emotionalInsights),
          emotionalInsights,
          personalInsights: await this.personalizationEngine.getPersonalizationInsights(request.userId)
        },
        metadata: {
          modelVersions: this.modelVersions,
          processingTimeMs,
          fallbacksUsed,
          emotionalIntelligenceUsed: this.emotionalIntelligenceEnabled,
          performanceScore: this.calculatePerformanceScore(processingTimeMs, finalRecommendations.length)
        },
      };

    } catch (error) {
      console.error('Error generating recommendations:', error);
      
      // Enhanced fallback with personalization
      fallbacksUsed.push('enhanced_fallback');
      const enhancedFallback = await this.getEnhancedFallbackRecommendations(request);
      
      return {
        recommendations: enhancedFallback,
        insights: {
          recommendationStrategy: 'enhanced_fallback',
        },
        metadata: {
          modelVersions: this.modelVersions,
          processingTimeMs: Date.now() - startTime,
          fallbacksUsed,
          emotionalIntelligenceUsed: false,
          performanceScore: 0.3
        },
      };
    }
  }

  /**
   * Get user preferences from database
   */
  private async getUserPreferences(userId: string): Promise<DbUserPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Error fetching user preferences:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Failed to fetch user preferences:', error);
      return null;
    }
  }

  /**
   * Get user's taste history for evolution tracking
   */
  private async getTasteHistory(userId: string): Promise<TasteSnapshot[]> {
    try {
      const { data: tasteSnapshots, error } = await supabase
        .from('taste_evolution_snapshots')
        .select('*')
        .eq('user_id', userId)
        .order('snapshot_date', { ascending: true })
        .limit(24); // Last 24 snapshots (2 years of monthly data)

      if (error) {
        console.warn('Error fetching taste history:', error);
        return [];
      }

      // Convert database records to TasteSnapshot format
      return (tasteSnapshots || []).map(snapshot => ({
        userId,
        timestamp: new Date(snapshot.snapshot_date),
        flavorPreferences: snapshot.flavor_preferences as any,
        cuisinePreferences: snapshot.cuisine_preferences as any,
        adventureScore: Number(snapshot.adventure_score),
        contextFactors: snapshot.social_preferences as any,
      }));
    } catch (error) {
      console.warn('Failed to fetch taste history:', error);
      return [];
    }
  }

  /**
   * Build emotional context from request and user history
   */
  private async buildEmotionalContext(
    userId: string, 
    requestContext: RecommendationRequest['context']
  ): Promise<EmotionalContext> {
    // Get recent food entries for behavioral analysis
    const { data: recentEntries } = await supabase
      .from('food_entries')
      .select('rating, category, spice_level, consumed_at')
      .eq('user_id', userId)
      .gte('consumed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
      .order('consumed_at', { ascending: false })
      .limit(20);

    const currentTime = requestContext.currentTime;

    return {
      userId,
      timestamp: currentTime,
      explicitMood: requestContext.explicitMood as any,
      moodConfidence: requestContext.moodConfidence,
      timeOfDay: currentTime.getHours(),
      dayOfWeek: currentTime.getDay(),
      weatherCondition: requestContext.weather?.condition as any,
      temperature: requestContext.weather?.temperature,
      diningContext: requestContext.socialContext || 'solo',
      locationContext: 'restaurant', // Default assumption
      recentFoodEntries: (recentEntries || []).map(entry => ({
        rating: Number(entry.rating),
        category: entry.category,
        spiceLevel: entry.spice_level,
        comfort: this.isComfortFood(entry.category), // Simple heuristic
        timestamp: new Date(entry.consumed_at),
      })),
    };
  }

  /**
   * Simple heuristic to determine if food category is comfort food
   */
  private isComfortFood(category: string): boolean {
    const comfortCategories = ['dessert', 'comfort', 'homestyle', 'traditional'];
    return comfortCategories.some(comfort => 
      category.toLowerCase().includes(comfort)
    );
  }

  /**
   * Get candidate restaurants for recommendation
   */
  private async getCandidateRestaurants(
    request: RecommendationRequest
  ): Promise<RestaurantWithDetails[]> {
    let query = supabase
      .from('restaurants')
      .select(`
        *,
        recent_reviews:reviews(rating, review_text, created_at),
        food_entries(rating, title, created_at)
      `)
      .eq('is_active', true);

    // Apply location filtering if provided
    if (request.context.location) {
      const maxDistance = request.preferences?.maxDistance || 10; // 10km default
      // Note: In production, you'd use PostGIS for proper geographical queries
      query = query.limit(100); // For now, just limit the results
    }

    // Apply cuisine filtering if provided
    if (request.preferences?.cuisineTypes?.length) {
      query = query.overlaps('cuisine_types', request.preferences.cuisineTypes);
    }

    // Apply price range filtering if provided
    if (request.preferences?.priceRange?.length) {
      query = query.in('price_range', request.preferences.priceRange);
    }

    const { data, error } = await query.limit(200); // Get pool of candidates

    if (error) {
      console.warn('Error fetching candidate restaurants:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Predict taste evolution if sufficient history exists
   */
  private async predictTasteEvolution(
    tasteHistory: TasteSnapshot[]
  ): Promise<TasteEvolutionPrediction | null> {
    if (tasteHistory.length < 3) {
      return null; // Need at least 3 data points
    }

    try {
      return await this.tasteTracker.predictTasteEvolution(tasteHistory);
    } catch (error) {
      console.warn('Error predicting taste evolution:', error);
      return null;
    }
  }

  /**
   * Detect emotional state
   */
  private async detectEmotionalState(
    emotionalContext: EmotionalContext
  ): Promise<EmotionalState | null> {
    try {
      return await this.emotionalAI.detectEmotionalState(emotionalContext);
    } catch (error) {
      console.warn('Error detecting emotional state:', error);
      return null;
    }
  }

  /**
   * Detect Kuchisabishii patterns
   */
  private async detectKuchisabishii(
    emotionalContext: EmotionalContext
  ): Promise<KuchisabishiiDetection | null> {
    try {
      // For now, use a simplified version without full week history
      const weekHistory = [emotionalContext]; // In production, fetch actual week history
      return await this.emotionalAI.detectKuchisabishii(emotionalContext, weekHistory);
    } catch (error) {
      console.warn('Error detecting Kuchisabishii:', error);
      return null;
    }
  }

  /**
   * Generate ensemble recommendations combining all models
   */
  private async generateEnsembleRecommendations(params: {
    request: RecommendationRequest;
    userPreferences: DbUserPreferences | null;
    tasteEvolution: TasteEvolutionPrediction | null;
    emotionalState: EmotionalState | null;
    kuchisabishiiDetection: KuchisabishiiDetection | null;
    candidateRestaurants: RestaurantWithDetails[];
    fallbacksUsed: string[];
  }): Promise<ComprehensiveRecommendation[]> {
    const { request, userPreferences, candidateRestaurants } = params;
    const recommendations: ComprehensiveRecommendation[] = [];

    for (const restaurant of candidateRestaurants) {
      const recommendation = await this.scoreRestaurant({
        restaurant,
        request,
        userPreferences,
        tasteEvolution: params.tasteEvolution,
        emotionalState: params.emotionalState,
        kuchisabishiiDetection: params.kuchisabishiiDetection,
      });

      if (recommendation.scores.overallScore > 0.3) { // Minimum threshold
        recommendations.push(recommendation);
      }
    }

    return recommendations;
  }

  /**
   * Score a restaurant using all available models
   */
  private async scoreRestaurant(params: {
    restaurant: RestaurantWithDetails;
    request: RecommendationRequest;
    userPreferences: DbUserPreferences | null;
    tasteEvolution: TasteEvolutionPrediction | null;
    emotionalState: EmotionalState | null;
    kuchisabishiiDetection: KuchisabishiiDetection | null;
  }): Promise<ComprehensiveRecommendation> {
    const { restaurant, request, userPreferences } = params;

    // Calculate individual scores
    const tasteMatch = this.calculateTasteMatchScore(restaurant, userPreferences, params.tasteEvolution);
    const moodMatch = this.calculateMoodMatchScore(restaurant, params.emotionalState);
    const socialFit = this.calculateSocialFitScore(restaurant, request.context.socialContext);
    const contextualFit = this.calculateContextualFitScore(restaurant, request.context);
    const noveltyScore = this.calculateNoveltyScore(restaurant, userPreferences);

    // Weight the scores based on available data and context
    const weights = this.calculateScoreWeights(params);
    const overallScore = 
      (tasteMatch * weights.taste) +
      (moodMatch * weights.mood) +
      (socialFit * weights.social) +
      (contextualFit * weights.contextual) +
      (noveltyScore * weights.novelty);

    // Generate explanations
    const reasoning = this.generateReasoning(restaurant, params, {
      tasteMatch, moodMatch, socialFit, contextualFit, noveltyScore
    });

    // Determine recommendation type
    const recommendationType = this.determineRecommendationType(
      { tasteMatch, moodMatch, socialFit, contextualFit, noveltyScore }
    );

    // Calculate confidence and expected satisfaction
    const confidence = this.calculateConfidence(params, overallScore);
    const expectedSatisfaction = this.calculateExpectedSatisfaction(overallScore, confidence);

    // Generate personalizations
    const personalizations = this.generatePersonalizations(restaurant, params);

    return {
      restaurantId: restaurant.id,
      restaurant,
      recommendedDishes: this.getRecommendedDishes(restaurant, params),
      scores: {
        tasteMatch,
        moodMatch,
        socialFit,
        contextualFit,
        noveltyScore,
        overallScore,
      },
      reasoning,
      confidence,
      recommendationType,
      expectedSatisfaction,
      personalizations,
    };
  }

  /**
   * Calculate taste match score
   */
  private calculateTasteMatchScore(
    restaurant: RestaurantWithDetails,
    userPreferences: DbUserPreferences | null,
    tasteEvolution: TasteEvolutionPrediction | null
  ): number {
    if (!userPreferences) return 0.5; // Neutral score if no preferences

    let score = 0;

    // Cuisine preferences
    if (userPreferences.preferred_cuisines && typeof userPreferences.preferred_cuisines === 'object') {
      const cuisinePrefs = userPreferences.preferred_cuisines as Record<string, number>;
      const restaurantCuisines = restaurant.cuisine_types || [];
      
      let cuisineScore = 0;
      let cuisineCount = 0;
      
      restaurantCuisines.forEach(cuisine => {
        if (cuisinePrefs[cuisine]) {
          cuisineScore += cuisinePrefs[cuisine] / 5; // Normalize to 0-1
          cuisineCount++;
        }
      });
      
      if (cuisineCount > 0) {
        score += (cuisineScore / cuisineCount) * 0.4;
      }
    }

    // Price range match
    if (userPreferences.preferred_price_range?.includes(restaurant.price_range || 0)) {
      score += 0.3;
    }

    // Apply taste evolution predictions
    if (tasteEvolution) {
      // Adjust score based on predicted taste changes
      const evolutionAdjustment = this.applyTasteEvolutionAdjustment(
        restaurant, tasteEvolution
      );
      score += evolutionAdjustment * 0.3;
    }

    return Math.min(1, score);
  }

  /**
   * Apply taste evolution adjustments to score
   */
  private applyTasteEvolutionAdjustment(
    restaurant: RestaurantWithDetails,
    tasteEvolution: TasteEvolutionPrediction
  ): number {
    let adjustment = 0;

    // Check if restaurant's cuisine aligns with predicted evolution
    if (tasteEvolution.recommendationAdjustments.exploreCuisines.some(cuisine =>
      restaurant.cuisine_types?.some(rCuisine => 
        rCuisine.toLowerCase().includes(cuisine.toLowerCase())
      )
    )) {
      adjustment += 0.3;
    }

    // Check novelty vs comfort preference
    if (tasteEvolution.recommendationAdjustments.increaseNovelty) {
      // Prefer less visited restaurant types
      adjustment += this.calculateRestaurantNovelty(restaurant) * 0.2;
    }

    if (tasteEvolution.recommendationAdjustments.focusOnComfort) {
      // Prefer familiar, highly-rated options
      adjustment += (restaurant.rating || 0) / 5 * 0.2;
    }

    return Math.max(-0.2, Math.min(0.5, adjustment)); // Cap adjustments
  }

  /**
   * Calculate restaurant novelty score
   */
  private calculateRestaurantNovelty(restaurant: RestaurantWithDetails): number {
    // Simple heuristic: newer restaurants or unique cuisine combinations are more novel
    const ageInYears = restaurant.created_at ? 
      (Date.now() - new Date(restaurant.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365) : 1;
    
    const ageScore = Math.max(0, 1 - (ageInYears / 5)); // Newer = more novel
    const cuisineUniqueness = (restaurant.cuisine_types?.length || 1) > 2 ? 0.3 : 0; // Fusion = more novel
    
    return Math.min(1, ageScore + cuisineUniqueness);
  }

  /**
   * Calculate mood match score
   */
  private calculateMoodMatchScore(
    restaurant: RestaurantWithDetails,
    emotionalState: EmotionalState | null
  ): number {
    if (!emotionalState) return 0.5; // Neutral if no mood detected

    let score = 0;

    // Map restaurant attributes to emotional needs
    if (emotionalState.needsComfort) {
      score += this.getRestaurantComfortScore(restaurant) * 0.4;
    }

    if (emotionalState.needsExcitement) {
      score += this.getRestaurantExcitementScore(restaurant) * 0.3;
    }

    if (emotionalState.needsSocialConnection) {
      score += this.getRestaurantSocialScore(restaurant) * 0.3;
    }

    if (emotionalState.needsIndulgence) {
      score += this.getRestaurantIndulgenceScore(restaurant) * 0.3;
    }

    return Math.min(1, score);
  }

  /**
   * Get restaurant comfort score
   */
  private getRestaurantComfortScore(restaurant: RestaurantWithDetails): number {
    const comfortKeywords = ['comfort', 'home', 'traditional', 'familiar', 'cozy'];
    const description = (restaurant.name + ' ' + (restaurant.description || '')).toLowerCase();
    
    const keywordMatches = comfortKeywords.filter(keyword => 
      description.includes(keyword)
    ).length;
    
    const ratingBonus = (restaurant.rating || 0) > 4.0 ? 0.2 : 0;
    
    return Math.min(1, (keywordMatches / 3) + ratingBonus);
  }

  /**
   * Get restaurant excitement score
   */
  private getRestaurantExcitementScore(restaurant: RestaurantWithDetails): number {
    const excitementKeywords = ['new', 'trendy', 'unique', 'innovative', 'fusion'];
    const description = (restaurant.name + ' ' + (restaurant.description || '')).toLowerCase();
    
    const keywordMatches = excitementKeywords.filter(keyword => 
      description.includes(keyword)
    ).length;
    
    const noveltyBonus = this.calculateRestaurantNovelty(restaurant) * 0.3;
    
    return Math.min(1, (keywordMatches / 3) + noveltyBonus);
  }

  /**
   * Get restaurant social score
   */
  private getRestaurantSocialScore(restaurant: RestaurantWithDetails): number {
    const socialKeywords = ['family', 'group', 'sharing', 'social', 'communal'];
    const description = (restaurant.name + ' ' + (restaurant.description || '')).toLowerCase();
    
    const keywordMatches = socialKeywords.filter(keyword => 
      description.includes(keyword)
    ).length;
    
    // Large restaurants are typically more social
    const sizeBonus = (restaurant.capacity || 50) > 30 ? 0.2 : 0;
    
    return Math.min(1, (keywordMatches / 3) + sizeBonus);
  }

  /**
   * Get restaurant indulgence score
   */
  private getRestaurantIndulgenceScore(restaurant: RestaurantWithDetails): number {
    const indulgenceKeywords = ['luxury', 'premium', 'fine', 'gourmet', 'upscale'];
    const description = (restaurant.name + ' ' + (restaurant.description || '')).toLowerCase();
    
    const keywordMatches = indulgenceKeywords.filter(keyword => 
      description.includes(keyword)
    ).length;
    
    // Higher price ranges indicate more indulgence
    const priceBonus = (restaurant.price_range || 0) >= 3 ? 0.3 : 0;
    
    return Math.min(1, (keywordMatches / 3) + priceBonus);
  }

  /**
   * Calculate social fit score
   */
  private calculateSocialFitScore(
    restaurant: RestaurantWithDetails,
    socialContext?: string
  ): number {
    if (!socialContext) return 0.5;

    const socialContextScores: Record<string, (r: RestaurantWithDetails) => number> = {
      solo: (r) => r.atmosphere?.includes('quiet') || r.atmosphere?.includes('casual') ? 0.8 : 0.5,
      friends: (r) => r.atmosphere?.includes('lively') || r.atmosphere?.includes('social') ? 0.9 : 0.6,
      family: (r) => r.atmosphere?.includes('family') || r.kid_friendly ? 0.9 : 0.4,
      date: (r) => r.atmosphere?.includes('romantic') || r.atmosphere?.includes('intimate') ? 0.9 : 0.5,
      business: (r) => r.atmosphere?.includes('professional') || r.atmosphere?.includes('quiet') ? 0.8 : 0.6,
    };

    return socialContextScores[socialContext]?.(restaurant) || 0.5;
  }

  /**
   * Calculate contextual fit score (time, weather, etc.)
   */
  private calculateContextualFitScore(
    restaurant: RestaurantWithDetails,
    context: RecommendationRequest['context']
  ): number {
    let score = 0.5; // Base score

    // Time of day appropriateness
    const hour = context.currentTime.getHours();
    if (hour >= 6 && hour < 11) { // Breakfast
      score += restaurant.serves_breakfast ? 0.3 : -0.2;
    } else if (hour >= 11 && hour < 16) { // Lunch
      score += restaurant.serves_lunch ? 0.2 : -0.1;
    } else if (hour >= 16) { // Dinner
      score += restaurant.serves_dinner ? 0.2 : -0.1;
    }

    // Weather appropriateness
    if (context.weather?.condition) {
      const weatherScore = this.getWeatherAppropriatenessScore(
        restaurant, context.weather.condition
      );
      score += weatherScore * 0.2;
    }

    // Day of week appropriateness
    const dayOfWeek = context.currentTime.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
      // Prefer places good for leisurely dining
      score += restaurant.atmosphere?.includes('relaxed') ? 0.1 : 0;
    } else { // Weekday
      // Prefer places with quick service for lunch
      if (hour >= 11 && hour < 14) {
        score += restaurant.service_type?.includes('fast') ? 0.1 : 0;
      }
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Get weather appropriateness score
   */
  private getWeatherAppropriatenessScore(
    restaurant: RestaurantWithDetails,
    weatherCondition: string
  ): number {
    const weatherPreferences: Record<string, string[]> = {
      sunny: ['outdoor', 'patio', 'terrace', 'garden'],
      rainy: ['cozy', 'indoor', 'warm', 'comfort'],
      cold: ['warm', 'hearty', 'indoor', 'hot'],
      hot: ['cold', 'refreshing', 'air-conditioned', 'light'],
    };

    const relevantKeywords = weatherPreferences[weatherCondition] || [];
    const description = (restaurant.name + ' ' + (restaurant.description || '') + 
                       ' ' + (restaurant.atmosphere || []).join(' ')).toLowerCase();

    const matches = relevantKeywords.filter(keyword => 
      description.includes(keyword)
    ).length;

    return Math.min(1, matches / 2);
  }

  /**
   * Calculate novelty score
   */
  private calculateNoveltyScore(
    restaurant: RestaurantWithDetails,
    userPreferences: DbUserPreferences | null
  ): number {
    let novelty = this.calculateRestaurantNovelty(restaurant);

    // Adjust based on user's cuisine experience
    if (userPreferences?.preferred_cuisines) {
      const userCuisines = Object.keys(userPreferences.preferred_cuisines);
      const restaurantCuisines = restaurant.cuisine_types || [];
      
      const unknownCuisines = restaurantCuisines.filter(cuisine => 
        !userCuisines.includes(cuisine)
      );
      
      if (unknownCuisines.length > 0) {
        novelty += 0.3; // Bonus for new cuisine types
      }
    }

    return Math.min(1, novelty);
  }

  /**
   * Calculate score weights based on available data and context
   */
  private calculateScoreWeights(params: {
    tasteEvolution: TasteEvolutionPrediction | null;
    emotionalState: EmotionalState | null;
    kuchisabishiiDetection: KuchisabishiiDetection | null;
  }): {
    taste: number;
    mood: number;
    social: number;
    contextual: number;
    novelty: number;
  } {
    const weights = {
      taste: 0.3,
      mood: 0.2,
      social: 0.2,
      contextual: 0.2,
      novelty: 0.1,
    };

    // Increase mood weight if strong emotional state detected
    if (params.emotionalState && params.emotionalState.moodIntensity > 0.7) {
      weights.mood = 0.35;
      weights.taste = 0.25;
    }

    // Increase taste weight if taste evolution is confident
    if (params.tasteEvolution && params.tasteEvolution.confidence > 0.8) {
      weights.taste = 0.4;
      weights.mood = 0.15;
    }

    // Adjust for Kuchisabishii detection
    if (params.kuchisabishiiDetection?.isExperiencing) {
      weights.mood = 0.4; // Focus on comfort
      weights.social = 0.3; // Focus on social recommendations
      weights.taste = 0.2;
      weights.novelty = 0.05; // Reduce novelty when lonely
    }

    return weights;
  }

  /**
   * Generate comprehensive reasoning for recommendation
   */
  private generateReasoning(
    restaurant: RestaurantWithDetails,
    params: any,
    scores: any
  ): ComprehensiveRecommendation['reasoning'] {
    const reasons: string[] = [];
    let primary = '';
    let emotionalMatch = '';
    let tasteEvolution = '';

    // Determine primary reason
    const maxScore = Math.max(...Object.values(scores));
    const primaryReasonType = Object.keys(scores).find(key => 
      scores[key as keyof typeof scores] === maxScore
    );

    switch (primaryReasonType) {
      case 'tasteMatch':
        primary = `This restaurant matches your taste preferences perfectly`;
        break;
      case 'moodMatch':
        primary = `This restaurant fits your current mood`;
        emotionalMatch = `Based on your ${params.emotionalState?.primaryMood} mood, this restaurant provides the ${params.emotionalState?.needsComfort ? 'comfort' : 'experience'} you're looking for`;
        break;
      case 'socialFit':
        primary = `Perfect for your ${params.request.context.socialContext} dining context`;
        break;
      case 'contextualFit':
        primary = `Great choice for this time and weather`;
        break;
      case 'noveltyScore':
        primary = `A great new discovery for you`;
        break;
      default:
        primary = `A well-rounded choice that fits your preferences`;
    }

    // Add secondary reasons
    if (scores.tasteMatch > 0.7) {
      reasons.push('matches your favorite cuisines');
    }
    if (scores.moodMatch > 0.7) {
      reasons.push('suits your current emotional needs');
    }
    if (scores.contextualFit > 0.7) {
      reasons.push('perfect for the current time and weather');
    }
    if (restaurant.rating && restaurant.rating > 4.0) {
      reasons.push(`highly rated (${restaurant.rating}/5)`);
    }

    // Add taste evolution reasoning
    if (params.tasteEvolution) {
      if (params.tasteEvolution.recommendationAdjustments.exploreCuisines.length > 0) {
        tasteEvolution = `Your taste preferences are evolving towards ${params.tasteEvolution.recommendationAdjustments.exploreCuisines.join(', ')} cuisines`;
      }
    }

    return {
      primary,
      secondary: reasons,
      emotionalMatch: emotionalMatch || undefined,
      tasteEvolution: tasteEvolution || undefined,
    };
  }

  /**
   * Determine recommendation type based on scores
   */
  private determineRecommendationType(scores: {
    tasteMatch: number;
    moodMatch: number;
    socialFit: number;
    contextualFit: number;
    noveltyScore: number;
  }): ComprehensiveRecommendation['recommendationType'] {
    const maxScore = Math.max(...Object.values(scores));
    
    if (scores.tasteMatch === maxScore) return 'taste_evolution';
    if (scores.moodMatch === maxScore) return 'mood_based';
    if (scores.socialFit === maxScore) return 'social';
    if (scores.contextualFit === maxScore) return 'contextual';
    if (scores.noveltyScore === maxScore) return 'discovery';
    
    return 'taste_evolution'; // Default
  }

  /**
   * Calculate recommendation confidence
   */
  private calculateConfidence(params: any, overallScore: number): number {
    let confidence = overallScore;

    // Boost confidence if we have good emotional state detection
    if (params.emotionalState?.confidence > 0.8) {
      confidence = Math.min(1, confidence + 0.1);
    }

    // Boost confidence if we have taste evolution data
    if (params.tasteEvolution?.confidence > 0.8) {
      confidence = Math.min(1, confidence + 0.1);
    }

    // Reduce confidence if using many fallbacks
    const fallbackPenalty = params.fallbacksUsed.length * 0.05;
    confidence = Math.max(0.1, confidence - fallbackPenalty);

    return confidence;
  }

  /**
   * Calculate expected satisfaction
   */
  private calculateExpectedSatisfaction(
    overallScore: number, 
    confidence: number
  ): number {
    // Expected satisfaction is a combination of score and confidence
    return (overallScore * 0.7) + (confidence * 0.3);
  }

  /**
   * Generate personalizations for the recommendation
   */
  private generatePersonalizations(
    restaurant: RestaurantWithDetails,
    params: any
  ): ComprehensiveRecommendation['personalizations'] {
    const personalizations: ComprehensiveRecommendation['personalizations'] = {};

    // Dish modifications based on preferences
    if (params.userPreferences) {
      const modifications: string[] = [];
      
      if (params.userPreferences.dietary_restrictions?.includes('vegetarian')) {
        modifications.push('Ask for vegetarian options');
      }
      if (params.userPreferences.spice_tolerance && params.userPreferences.spice_tolerance < 3) {
        modifications.push('Request mild spice level');
      }
      if (params.userPreferences.allergies?.length > 0) {
        modifications.push(`Mention allergies: ${params.userPreferences.allergies.join(', ')}`);
      }
      
      if (modifications.length > 0) {
        personalizations.dishModifications = modifications;
      }
    }

    // Alternative options
    if (restaurant.cuisine_types && restaurant.cuisine_types.length > 1) {
      personalizations.alternativeOptions = [
        `Try their ${restaurant.cuisine_types[1]} dishes if you want variety`
      ];
    }

    // Pairing recommendations
    const pairings: string[] = [];
    if (params.emotionalState?.needsIndulgence) {
      pairings.push('Consider pairing with their dessert selection');
    }
    if (params.request.context.socialContext === 'date') {
      pairings.push('Perfect for sharing appetizers');
    }
    
    if (pairings.length > 0) {
      personalizations.pairingRecommendations = pairings;
    }

    return personalizations;
  }

  /**
   * Get recommended dishes for the restaurant
   */
  private getRecommendedDishes(
    restaurant: RestaurantWithDetails,
    params: any
  ): string[] {
    // This would typically query a dishes database
    // For now, return placeholder recommendations based on context
    const dishes: string[] = [];

    if (params.emotionalState?.needsComfort) {
      dishes.push('Signature comfort dish');
    }
    if (params.emotionalState?.needsIndulgence) {
      dishes.push('Chef\'s special');
    }
    if (params.tasteEvolution?.recommendationAdjustments.increaseNovelty) {
      dishes.push('Featured new menu item');
    }

    return dishes.length > 0 ? dishes : ['Chef\'s recommendation'];
  }

  /**
   * Optimize recommendations for diversity and novelty
   */
  private optimizeForDiversityAndNovelty(
    recommendations: ComprehensiveRecommendation[],
    diversityLevel: number
  ): ComprehensiveRecommendation[] {
    if (recommendations.length <= 1) return recommendations;

    // Sort by overall score first
    const sorted = recommendations.sort((a, b) => 
      b.scores.overallScore - a.scores.overallScore
    );

    const optimized: ComprehensiveRecommendation[] = [];
    const usedCuisines = new Set<string>();
    const usedPriceRanges = new Set<number>();

    for (const rec of sorted) {
      let diversityScore = 1;

      // Reduce score if cuisine type already recommended
      const cuisines = rec.restaurant.cuisine_types || [];
      const hasDuplicateCuisine = cuisines.some(cuisine => usedCuisines.has(cuisine));
      if (hasDuplicateCuisine) {
        diversityScore -= diversityLevel * 0.3;
      }

      // Reduce score if price range already recommended
      if (rec.restaurant.price_range && usedPriceRanges.has(rec.restaurant.price_range)) {
        diversityScore -= diversityLevel * 0.2;
      }

      // Apply diversity adjustment
      const adjustedRec = {
        ...rec,
        scores: {
          ...rec.scores,
          overallScore: rec.scores.overallScore * diversityScore,
        },
      };

      optimized.push(adjustedRec);

      // Track used features
      cuisines.forEach(cuisine => usedCuisines.add(cuisine));
      if (rec.restaurant.price_range) {
        usedPriceRanges.add(rec.restaurant.price_range);
      }
    }

    // Re-sort after diversity adjustment
    return optimized.sort((a, b) => b.scores.overallScore - a.scores.overallScore);
  }

  /**
   * Rank and limit final recommendations
   */
  private rankAndLimitRecommendations(
    recommendations: ComprehensiveRecommendation[],
    limit: number
  ): ComprehensiveRecommendation[] {
    return recommendations
      .sort((a, b) => {
        // Primary sort: overall score
        const scoreDiff = b.scores.overallScore - a.scores.overallScore;
        if (Math.abs(scoreDiff) > 0.05) return scoreDiff;
        
        // Secondary sort: expected satisfaction
        const satisfactionDiff = b.expectedSatisfaction - a.expectedSatisfaction;
        if (Math.abs(satisfactionDiff) > 0.05) return satisfactionDiff;
        
        // Tertiary sort: confidence
        return b.confidence - a.confidence;
      })
      .slice(0, limit);
  }

  /**
   * Determine recommendation strategy description
   */
  private determineRecommendationStrategy(
    request: RecommendationRequest,
    emotionalState: EmotionalState | null
  ): string {
    if (emotionalState?.primaryMood) {
      return `mood-based recommendations for ${emotionalState.primaryMood} state`;
    }
    
    if (request.context.socialContext) {
      return `${request.context.socialContext} dining recommendations`;
    }
    
    return 'personalized taste-based recommendations';
  }

  /**
   * Get basic recommendations as fallback
   */
  private async getBasicRecommendations(
    request: RecommendationRequest
  ): Promise<ComprehensiveRecommendation[]> {
    // Simple fallback: get highly rated restaurants
    const { data: restaurants } = await supabase
      .from('restaurants')
      .select('*')
      .eq('is_active', true)
      .gte('rating', 4.0)
      .order('rating', { ascending: false })
      .limit(request.limit || 10);

    return (restaurants || []).map(restaurant => ({
      restaurantId: restaurant.id,
      restaurant: restaurant as RestaurantWithDetails,
      scores: {
        tasteMatch: 0.5,
        moodMatch: 0.5,
        socialFit: 0.5,
        contextualFit: 0.5,
        noveltyScore: 0.5,
        overallScore: (restaurant.rating || 0) / 5,
      },
      reasoning: {
        primary: 'Highly rated restaurant',
        secondary: [`${restaurant.rating}/5 stars`],
      },
      confidence: 0.6,
      recommendationType: 'contextual' as const,
      expectedSatisfaction: (restaurant.rating || 0) / 5,
      personalizations: {},
    }));
  }

  /**
   * Process user feedback to improve recommendations
   */
  public async processFeedback(params: {
    userId: string;
    recommendationId: string;
    feedback: {
      visited: boolean;
      rating?: number;
      liked?: boolean;
      reason?: string;
    };
  }): Promise<void> {
    try {
      // Store feedback in database
      await supabase.from('recommendation_performance').insert({
        recommendation_id: params.recommendationId,
        model_version: this.modelVersions.tasteEvolution,
        actual_rating: params.feedback.rating,
        // Additional performance metrics would be calculated here
      });

      // Update user preferences based on feedback
      // This would trigger model retraining in a production system
      console.log('Feedback processed successfully');
    } catch (error) {
      console.warn('Failed to process feedback:', error);
    }
  }

  /**
   * Generate emotional intelligence layer insights
   */
  private async generateEmotionalIntelligenceLayer(params: {
    emotionalState: EmotionalState | null;
    kuchisabishiiDetection: KuchisabishiiDetection | null;
    personalProfile: PersonalTasteProfile;
    context: RecommendationRequest['context'];
  }): Promise<any> {
    const { emotionalState, kuchisabishiiDetection, personalProfile, context } = params;
    
    return {
      primaryEmotionalNeed: this.identifyPrimaryEmotionalNeed(emotionalState, kuchisabishiiDetection),
      emotionalIntensity: emotionalState?.moodIntensity || 0.5,
      comfortLevel: this.calculateRequiredComfortLevel(emotionalState, kuchisabishiiDetection),
      socialNeed: this.calculateSocialNeed(emotionalState, context, personalProfile),
      adventureReadiness: this.calculateAdventureReadiness(emotionalState, personalProfile),
      culturalOpenness: this.calculateCulturalOpenness(emotionalState, personalProfile),
      confidence: Math.min(emotionalState?.confidence || 0.5, kuchisabishiiDetection?.intensity || 0.5)
    };
  }

  /**
   * Generate collaborative recommendations
   */
  private async generateCollaborativeRecommendations(params: {
    userId: string;
    tasteTwins: TasteTwin[];
    context: RecommendationRequest['context'];
  }): Promise<CollaborativeRecommendation[]> {
    try {
      return await this.collaborativeIntelligence.generateCollaborativeRecommendations(
        params.userId,
        {
          location: params.context.location,
          socialContext: params.context.socialContext,
          timeOfDay: params.context.currentTime.getHours(),
          mood: params.context.explicitMood
        },
        15
      );
    } catch (error) {
      console.error('Error generating collaborative recommendations:', error);
      return [];
    }
  }

  /**
   * Generate discovery recommendations
   */
  private async generateDiscoveryRecommendations(params: {
    userId: string;
    personalProfile: PersonalTasteProfile;
    context: RecommendationRequest['context'];
  }): Promise<DiscoveryRecommendation[]> {
    try {
      const serendipityParams: SerendipityParameters = {
        userId: params.userId,
        adventureLevel: params.personalProfile.adventurousnessScore,
        comfortLevel: 1 - params.personalProfile.adventurousnessScore,
        noveltyPreference: 0.6,
        diversityWeight: 0.7,
        socialContext: params.context.socialContext as any,
        explorationRadius: 10,
        budgetConstraints: [1, 4],
        timeConstraints: 120
      };
      
      return await this.discoveryAlgorithms.generateSerendipitousRecommendations(serendipityParams);
    } catch (error) {
      console.error('Error generating discovery recommendations:', error);
      return [];
    }
  }

  /**
   * Fuse multi-modal recommendations intelligently
   */
  private async fuseMultiModalRecommendations(params: {
    ensemble: ComprehensiveRecommendation[];
    collaborative: CollaborativeRecommendation[];
    discovery: DiscoveryRecommendation[];
    emotionalInsights: any;
    personalProfile: PersonalTasteProfile;
  }): Promise<ComprehensiveRecommendation[]> {
    const fusedMap = new Map<string, ComprehensiveRecommendation>();
    
    // Add ensemble recommendations as base
    params.ensemble.forEach(rec => {
      fusedMap.set(rec.restaurantId, rec);
    });
    
    // Enhance with collaborative intelligence
    params.collaborative.forEach(colabRec => {
      if (fusedMap.has(colabRec.restaurantId)) {
        const existing = fusedMap.get(colabRec.restaurantId)!;
        existing.scores.socialFit = Math.max(existing.scores.socialFit, colabRec.aggregatedRating / 5);
        existing.reasoning.secondary.push('recommended by taste twins');
      }
    });
    
    // Add discovery recommendations
    params.discovery.forEach(discRec => {
      if (fusedMap.has(discRec.restaurantId)) {
        const existing = fusedMap.get(discRec.restaurantId)!;
        existing.scores.noveltyScore = Math.max(existing.scores.noveltyScore, discRec.serendipityScore);
        existing.reasoning.secondary.push(discRec.discoveryReasons.primary);
      } else {
        // Add as new recommendation
        const newRec: ComprehensiveRecommendation = {
          restaurantId: discRec.restaurantId,
          restaurant: discRec.restaurant,
          scores: {
            tasteMatch: 0.6,
            moodMatch: 0.7,
            socialFit: discRec.socialValue.shareability,
            contextualFit: 0.6,
            noveltyScore: discRec.serendipityScore,
            overallScore: discRec.serendipityScore * 0.8
          },
          reasoning: {
            primary: discRec.discoveryReasons.primary,
            secondary: discRec.discoveryReasons.secondary,
            emotionalMatch: discRec.discoveryReasons.emotionalAppeal
          },
          confidence: discRec.expectedSatisfaction,
          recommendationType: 'discovery',
          expectedSatisfaction: discRec.expectedSatisfaction,
          personalizations: {}
        };
        fusedMap.set(discRec.restaurantId, newRec);
      }
    });
    
    return Array.from(fusedMap.values());
  }

  /**
   * Apply advanced optimization with emotional awareness
   */
  private async applyAdvancedOptimization(
    recommendations: ComprehensiveRecommendation[],
    params: {
      request: RecommendationRequest;
      emotionalState: EmotionalState | null;
      personalProfile: PersonalTasteProfile;
      diversityLevel: number;
    }
  ): Promise<ComprehensiveRecommendation[]> {
    let optimized = [...recommendations];
    
    // Apply emotional state optimizations
    if (params.emotionalState) {
      optimized = this.applyEmotionalOptimization(optimized, params.emotionalState);
    }
    
    // Apply personalization optimizations
    optimized = this.applyPersonalizationOptimization(optimized, params.personalProfile);
    
    // Apply context-aware diversity
    optimized = this.applyContextAwareDiversity(optimized, params.request.context, params.diversityLevel);
    
    return optimized;
  }

  /**
   * Rank recommendations with emotional intelligence
   */
  private rankWithEmotionalIntelligence(
    recommendations: ComprehensiveRecommendation[],
    emotionalInsights: any,
    limit: number
  ): ComprehensiveRecommendation[] {
    return recommendations
      .map(rec => ({
        ...rec,
        emotionalFitScore: this.calculateEmotionalFitScore(rec, emotionalInsights),
        finalScore: this.calculateFinalEmotionalScore(rec, emotionalInsights)
      }))
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, limit);
  }

  /**
   * Helper methods for emotional intelligence
   */
  
  private identifyPrimaryEmotionalNeed(
    emotionalState: EmotionalState | null, 
    kuchisabishiiDetection: KuchisabishiiDetection | null
  ): string {
    if (kuchisabishiiDetection?.isExperiencing) {
      return 'social_connection';
    }
    if (emotionalState?.needsComfort) {
      return 'comfort';
    }
    if (emotionalState?.needsExcitement) {
      return 'adventure';
    }
    return 'satisfaction';
  }

  private calculateRequiredComfortLevel(
    emotionalState: EmotionalState | null,
    kuchisabishiiDetection: KuchisabishiiDetection | null
  ): number {
    let comfortLevel = 0.5;
    
    if (emotionalState?.needsComfort) comfortLevel += 0.3;
    if (kuchisabishiiDetection?.isExperiencing) comfortLevel += 0.2;
    if (emotionalState?.primaryMood === 'stressed') comfortLevel += 0.3;
    
    return Math.min(1, comfortLevel);
  }

  private calculateSocialNeed(
    emotionalState: EmotionalState | null,
    context: RecommendationRequest['context'],
    personalProfile: PersonalTasteProfile
  ): number {
    let socialNeed = 0.5;
    
    if (emotionalState?.needsSocialConnection) socialNeed += 0.3;
    if (context.socialContext !== 'solo') socialNeed += 0.2;
    if (personalProfile.socialDiningPreferences?.groupPreferences) socialNeed += 0.1;
    
    return Math.min(1, socialNeed);
  }

  private calculateAdventureReadiness(
    emotionalState: EmotionalState | null,
    personalProfile: PersonalTasteProfile
  ): number {
    let readiness = personalProfile.adventurousnessScore;
    
    if (emotionalState?.needsExcitement) readiness += 0.2;
    if (emotionalState?.primaryMood === 'happy') readiness += 0.1;
    if (emotionalState?.needsComfort) readiness -= 0.2;
    
    return Math.max(0, Math.min(1, readiness));
  }

  private calculateCulturalOpenness(
    emotionalState: EmotionalState | null,
    personalProfile: PersonalTasteProfile
  ): number {
    let openness = personalProfile.culturalInfluences?.fusionOpenness || 0.5;
    
    if (emotionalState?.needsExcitement) openness += 0.1;
    if (emotionalState?.primaryMood === 'curious') openness += 0.2;
    
    return Math.max(0, Math.min(1, openness));
  }

  private applyEmotionalOptimization(
    recommendations: ComprehensiveRecommendation[],
    emotionalState: EmotionalState
  ): ComprehensiveRecommendation[] {
    return recommendations.map(rec => {
      const emotionalBoost = this.calculateEmotionalBoost(rec, emotionalState);
      return {
        ...rec,
        scores: {
          ...rec.scores,
          moodMatch: Math.min(1, rec.scores.moodMatch + emotionalBoost),
          overallScore: Math.min(1, rec.scores.overallScore + emotionalBoost * 0.3)
        }
      };
    });
  }

  private applyPersonalizationOptimization(
    recommendations: ComprehensiveRecommendation[],
    personalProfile: PersonalTasteProfile
  ): ComprehensiveRecommendation[] {
    return recommendations.map(rec => {
      const personalBoost = this.calculatePersonalizationBoost(rec, personalProfile);
      return {
        ...rec,
        scores: {
          ...rec.scores,
          tasteMatch: Math.min(1, rec.scores.tasteMatch + personalBoost),
          overallScore: Math.min(1, rec.scores.overallScore + personalBoost * 0.2)
        }
      };
    });
  }

  private applyContextAwareDiversity(
    recommendations: ComprehensiveRecommendation[],
    context: RecommendationRequest['context'],
    diversityLevel: number
  ): ComprehensiveRecommendation[] {
    // Enhanced diversity with context awareness
    return this.optimizeForDiversityAndNovelty(recommendations, diversityLevel);
  }

  private calculateEmotionalFitScore(
    recommendation: ComprehensiveRecommendation,
    emotionalInsights: any
  ): number {
    let score = 0.5;
    
    if (emotionalInsights.primaryEmotionalNeed === 'comfort') {
      score += recommendation.scores.moodMatch * 0.4;
    }
    if (emotionalInsights.primaryEmotionalNeed === 'adventure') {
      score += recommendation.scores.noveltyScore * 0.4;
    }
    if (emotionalInsights.primaryEmotionalNeed === 'social_connection') {
      score += recommendation.scores.socialFit * 0.4;
    }
    
    return Math.min(1, score);
  }

  private calculateFinalEmotionalScore(
    recommendation: ComprehensiveRecommendation,
    emotionalInsights: any
  ): number {
    const emotionalWeight = emotionalInsights.confidence * 0.3;
    const traditionalWeight = 1 - emotionalWeight;
    
    const emotionalScore = this.calculateEmotionalFitScore(recommendation, emotionalInsights);
    const traditionalScore = recommendation.scores.overallScore;
    
    return (emotionalScore * emotionalWeight) + (traditionalScore * traditionalWeight);
  }

  private calculateEmotionalBoost(
    recommendation: ComprehensiveRecommendation,
    emotionalState: EmotionalState
  ): number {
    let boost = 0;
    
    if (emotionalState.needsComfort && recommendation.scores.moodMatch > 0.7) {
      boost += 0.2;
    }
    if (emotionalState.needsExcitement && recommendation.scores.noveltyScore > 0.7) {
      boost += 0.2;
    }
    
    return boost;
  }

  private calculatePersonalizationBoost(
    recommendation: ComprehensiveRecommendation,
    personalProfile: PersonalTasteProfile
  ): number {
    // Calculate boost based on personal taste alignment
    return 0.1; // Simplified calculation
  }

  private determineAdvancedRecommendationStrategy(
    request: RecommendationRequest,
    emotionalInsights: any
  ): string {
    if (emotionalInsights.primaryEmotionalNeed === 'comfort') {
      return 'emotional comfort-focused recommendations';
    }
    if (emotionalInsights.primaryEmotionalNeed === 'adventure') {
      return 'adventure-seeking recommendations with emotional safety';
    }
    if (emotionalInsights.primaryEmotionalNeed === 'social_connection') {
      return 'socially-oriented recommendations for connection';
    }
    return 'balanced personalized recommendations';
  }

  private recordRecommendationMetrics(userId: string, metrics: any): void {
    this.recommendationMetrics.set(userId, {
      ...metrics,
      timestamp: new Date()
    });
  }

  private calculatePerformanceScore(processingTime: number, recommendationCount: number): number {
    const timeScore = Math.max(0, 1 - (processingTime / 5000)); // Target: under 5 seconds
    const countScore = Math.min(1, recommendationCount / 10); // Target: 10 recommendations
    return (timeScore + countScore) / 2;
  }

  /**
   * Enhanced fallback recommendations with personalization
   */
  private async getEnhancedFallbackRecommendations(
    request: RecommendationRequest
  ): Promise<ComprehensiveRecommendation[]> {
    try {
      // Try to get personalized fallback
      const personalProfile = await this.personalizationEngine.buildPersonalTasteProfile(request.userId);
      
      const { data: restaurants } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .gte('rating', 3.5)
        .order('rating', { ascending: false })
        .limit(request.limit || 10);

      return (restaurants || []).map(restaurant => ({
        restaurantId: restaurant.id,
        restaurant: restaurant as RestaurantWithDetails,
        scores: {
          tasteMatch: 0.6,
          moodMatch: 0.5,
          socialFit: 0.5,
          contextualFit: 0.5,
          noveltyScore: 0.4,
          overallScore: (restaurant.rating || 0) / 5,
        },
        reasoning: {
          primary: 'Highly rated restaurant in your area',
          secondary: [`${restaurant.rating}/5 stars`, 'Popular choice'],
        },
        confidence: 0.7,
        recommendationType: 'contextual' as const,
        expectedSatisfaction: (restaurant.rating || 0) / 5,
        personalizations: {},
      }));
    } catch (error) {
      console.error('Enhanced fallback failed, using basic fallback:', error);
      return this.getBasicRecommendations(request);
    }
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    this.tasteTracker.dispose();
    this.emotionalAI.dispose();
    this.collaborativeIntelligence.dispose();
    this.realtimeAdaptation.dispose();
    this.personalizationEngine.dispose();
    this.discoveryAlgorithms.dispose();
    this.isInitialized = false;
  }
}

export default RecommendationEngine;