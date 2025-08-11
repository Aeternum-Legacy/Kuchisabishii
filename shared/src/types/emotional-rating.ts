/**
 * Emotional Rating System Types for Kuchisabishii
 * Captures the unique "mouth loneliness" concept with emotional depth
 */

export enum EmotionalScale {
  NEVER_AGAIN = 1,
  DISAPPOINTED = 2,
  NEUTRAL = 3,
  SATISFIED = 4,
  WHEN_MOUTH_IS_LONELY = 5
}

export interface EmotionalDimensions {
  satisfaction: number; // 1-10: Overall happiness with the experience
  craving: number; // 1-10: How much you want it again
  comfort: number; // 1-10: Emotional comfort provided
  excitement: number; // 1-10: Adventure and novelty
  nostalgia: number; // 1-10: Memory and emotional connection
  social: number; // 1-10: Social bonding potential
}

export interface EmotionalContext {
  mood_before: string; // User's emotional state before eating
  mood_after: string; // User's emotional state after eating
  social_setting: 'alone' | 'partner' | 'family' | 'friends' | 'colleagues' | 'strangers';
  occasion: 'everyday' | 'celebration' | 'comfort' | 'adventure' | 'date' | 'business';
  energy_level: 'exhausted' | 'tired' | 'neutral' | 'energetic' | 'excited';
  weather_mood: 'gloomy' | 'neutral' | 'bright' | 'cozy' | 'refreshing';
}

export interface EmotionalRating {
  id: string;
  user_id: string;
  food_experience_id: string;
  
  // Core emotional scale
  primary_rating: EmotionalScale;
  
  // Detailed emotional dimensions
  dimensions: EmotionalDimensions;
  
  // Contextual emotional data
  context: EmotionalContext;
  
  // Temporal data
  rated_at: Date;
  experience_date: Date;
  
  // Free-form emotional expression
  emotional_notes?: string;
  
  // Kuchisabishii-specific
  mouth_loneliness_level: number; // 1-10: How much this addresses "mouth loneliness"
  would_crave_when: string[]; // Tags like "stressed", "happy", "lonely", "celebrating"
  
  // Memory associations
  reminds_me_of?: string;
  emotional_memory_trigger?: boolean;
}

export interface EmotionalPattern {
  user_id: string;
  
  // Temporal patterns
  comfort_food_triggers: string[];
  adventure_food_readiness: string[];
  social_food_preferences: Record<string, number>;
  
  // Emotional evolution over time
  satisfaction_trend: number[]; // Last 30 days
  comfort_seeking_frequency: number;
  adventure_seeking_frequency: number;
  
  // Kuchisabishii patterns
  mouth_loneliness_frequency: number; // How often they feel this
  preferred_comfort_responses: EmotionalScale[];
  emotional_food_associations: Record<string, string[]>;
  
  last_updated: Date;
}

export interface EmotionalInsight {
  user_id: string;
  insight_type: 'comfort_pattern' | 'adventure_growth' | 'social_preference' | 'mood_correlation';
  title: string;
  description: string;
  confidence: number; // 0-1
  actionable_suggestion: string;
  created_at: Date;
}