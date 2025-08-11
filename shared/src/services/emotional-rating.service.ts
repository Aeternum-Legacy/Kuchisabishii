/**
 * Emotional Rating Service for Kuchisabishii
 * Handles the core emotional intelligence and rating logic
 */

import { EmotionalScale, EmotionalRating, EmotionalDimensions, EmotionalContext, EmotionalPattern } from '../types/emotional-rating';

export class EmotionalRatingService {
  
  /**
   * Calculate overall emotional score from dimensions
   * Weights are tuned for the "mouth loneliness" concept
   */
  static calculateOverallScore(dimensions: EmotionalDimensions): number {
    const weights = {
      satisfaction: 0.25,
      craving: 0.20,
      comfort: 0.20, // High weight for comfort - core to "mouth loneliness"
      excitement: 0.15,
      nostalgia: 0.10,
      social: 0.10
    };
    
    return Math.round(
      (dimensions.satisfaction * weights.satisfaction +
       dimensions.craving * weights.craving +
       dimensions.comfort * weights.comfort +
       dimensions.excitement * weights.excitement +
       dimensions.nostalgia * weights.nostalgia +
       dimensions.social * weights.social)
    );
  }
  
  /**
   * Convert emotional dimensions to the primary 5-point scale
   */
  static convertToEmotionalScale(dimensions: EmotionalDimensions, context: EmotionalContext): EmotionalScale {
    const overallScore = this.calculateOverallScore(dimensions);
    
    // Adjust based on emotional context
    let adjustedScore = overallScore;
    
    // Boost for comfort food when user was in negative mood
    if (context.mood_before === 'sad' || context.mood_before === 'stressed') {
      if (dimensions.comfort >= 8) {
        adjustedScore += 1;
      }
    }
    
    // Boost for adventure food when user was seeking excitement
    if (context.energy_level === 'excited' && dimensions.excitement >= 8) {
      adjustedScore += 0.5;
    }
    
    // Map to emotional scale
    if (adjustedScore <= 2) return EmotionalScale.NEVER_AGAIN;
    if (adjustedScore <= 4) return EmotionalScale.DISAPPOINTED;
    if (adjustedScore <= 6) return EmotionalScale.NEUTRAL;
    if (adjustedScore <= 8) return EmotionalScale.SATISFIED;
    return EmotionalScale.WHEN_MOUTH_IS_LONELY;
  }
  
  /**
   * Calculate "mouth loneliness" level based on emotional factors
   */
  static calculateMouthLonelinessLevel(
    dimensions: EmotionalDimensions, 
    context: EmotionalContext
  ): number {
    let baseLevel = (dimensions.comfort + dimensions.craving + dimensions.nostalgia) / 3;
    
    // Amplify for solo dining
    if (context.social_setting === 'alone') {
      baseLevel += 1;
    }
    
    // Amplify for comfort occasions
    if (context.occasion === 'comfort') {
      baseLevel += 1.5;
    }
    
    // Amplify for negative pre-mood
    if (context.mood_before === 'sad' || context.mood_before === 'lonely') {
      baseLevel += 2;
    }
    
    return Math.min(10, Math.max(1, Math.round(baseLevel)));
  }
  
  /**
   * Analyze when user would crave this food based on emotional patterns
   */
  static analyzeWouldCraveWhen(
    dimensions: EmotionalDimensions,
    context: EmotionalContext
  ): string[] {
    const tags: string[] = [];
    
    // High comfort = comfort craving triggers
    if (dimensions.comfort >= 8) {
      tags.push('stressed', 'sad', 'need_comfort');
    }
    
    // High excitement = adventure craving triggers  
    if (dimensions.excitement >= 8) {
      tags.push('adventurous', 'celebrating', 'trying_new_things');
    }
    
    // High social = social craving triggers
    if (dimensions.social >= 8) {
      tags.push('with_friends', 'dating', 'family_time');
    }
    
    // High nostalgia = memory-triggered cravings
    if (dimensions.nostalgia >= 8) {
      tags.push('nostalgic', 'homesick', 'missing_memories');
    }
    
    // Context-based triggers
    if (context.mood_after === 'happy' && context.mood_before !== 'happy') {
      tags.push('need_mood_boost');
    }
    
    if (context.social_setting === 'alone' && dimensions.comfort >= 7) {
      tags.push('eating_alone', 'mouth_is_lonely');
    }
    
    return [...new Set(tags)]; // Remove duplicates
  }
  
  /**
   * Create a complete emotional rating from user input
   */
  static createEmotionalRating(
    userId: string,
    foodExperienceId: string,
    dimensions: EmotionalDimensions,
    context: EmotionalContext,
    emotionalNotes?: string,
    remindsMe?: string
  ): Omit<EmotionalRating, 'id' | 'rated_at'> {
    
    const primaryRating = this.convertToEmotionalScale(dimensions, context);
    const mouthLonelinessLevel = this.calculateMouthLonelinessLevel(dimensions, context);
    const wouldCraveWhen = this.analyzeWouldCraveWhen(dimensions, context);
    
    return {
      user_id: userId,
      food_experience_id: foodExperienceId,
      primary_rating: primaryRating,
      dimensions,
      context,
      experience_date: new Date(),
      emotional_notes: emotionalNotes,
      mouth_loneliness_level: mouthLonelinessLevel,
      would_crave_when: wouldCraveWhen,
      reminds_me_of: remindsMe,
      emotional_memory_trigger: !!remindsMe && remindsMe.length > 0
    };
  }
  
  /**
   * Update emotional pattern based on new rating
   */
  static updateEmotionalPattern(
    existingPattern: EmotionalPattern | null,
    newRating: EmotionalRating
  ): Partial<EmotionalPattern> {
    
    const pattern: Partial<EmotionalPattern> = existingPattern || {
      user_id: newRating.user_id,
      comfort_food_triggers: [],
      adventure_food_readiness: [],
      social_food_preferences: {},
      satisfaction_trend: [],
      comfort_seeking_frequency: 0,
      adventure_seeking_frequency: 0,
      mouth_loneliness_frequency: 0,
      preferred_comfort_responses: [],
      emotional_food_associations: {}
    };
    
    // Update satisfaction trend (keep last 30 entries)
    const satisfactionScore = this.calculateOverallScore(newRating.dimensions);
    pattern.satisfaction_trend = [
      ...(pattern.satisfaction_trend || []).slice(-29),
      satisfactionScore
    ];
    
    // Update comfort seeking frequency
    if (newRating.context.occasion === 'comfort' || newRating.dimensions.comfort >= 8) {
      pattern.comfort_seeking_frequency = (pattern.comfort_seeking_frequency || 0) + 1;
    }
    
    // Update adventure seeking frequency
    if (newRating.dimensions.excitement >= 8) {
      pattern.adventure_seeking_frequency = (pattern.adventure_seeking_frequency || 0) + 1;
    }
    
    // Update mouth loneliness frequency
    if (newRating.mouth_loneliness_level >= 8) {
      pattern.mouth_loneliness_frequency = (pattern.mouth_loneliness_frequency || 0) + 1;
    }
    
    // Update preferred comfort responses
    if (newRating.context.occasion === 'comfort') {
      pattern.preferred_comfort_responses = [
        ...(pattern.preferred_comfort_responses || []),
        newRating.primary_rating
      ].slice(-10); // Keep last 10
    }
    
    // Update emotional food associations
    newRating.would_crave_when.forEach(trigger => {
      if (!pattern.emotional_food_associations) {
        pattern.emotional_food_associations = {};
      }
      if (!pattern.emotional_food_associations[trigger]) {
        pattern.emotional_food_associations[trigger] = [];
      }
      pattern.emotional_food_associations[trigger].push(newRating.food_experience_id);
      // Keep only last 5 associations per trigger
      pattern.emotional_food_associations[trigger] = 
        pattern.emotional_food_associations[trigger].slice(-5);
    });
    
    pattern.last_updated = new Date();
    
    return pattern;
  }
  
  /**
   * Get emotional scale description
   */
  static getEmotionalScaleDescription(scale: EmotionalScale): string {
    switch (scale) {
      case EmotionalScale.NEVER_AGAIN:
        return "Never again - this didn't speak to my soul";
      case EmotionalScale.DISAPPOINTED:
        return "Disappointed - left my mouth wanting";
      case EmotionalScale.NEUTRAL:
        return "Neutral - filled the space but didn't fill the longing";
      case EmotionalScale.SATISFIED:
        return "Satisfied - hit the spot nicely";
      case EmotionalScale.WHEN_MOUTH_IS_LONELY:
        return "When my mouth is lonely - I'll dream of this";
      default:
        return "Unknown rating";
    }
  }
}