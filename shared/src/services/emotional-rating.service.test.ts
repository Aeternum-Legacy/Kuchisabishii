/**
 * Test suite for Emotional Rating Service
 * Tests the core "mouth loneliness" emotional intelligence
 */

import { describe, it, expect } from 'vitest';
import { EmotionalRatingService } from './emotional-rating.service';
import { EmotionalScale, EmotionalDimensions, EmotionalContext } from '../types/emotional-rating';

describe('EmotionalRatingService', () => {
  
  describe('calculateOverallScore', () => {
    it('should calculate weighted emotional score correctly', () => {
      const dimensions: EmotionalDimensions = {
        satisfaction: 8,
        craving: 7,
        comfort: 9,
        excitement: 5,
        nostalgia: 6,
        social: 4
      };
      
      const score = EmotionalRatingService.calculateOverallScore(dimensions);
      
      // Weighted calculation: 8*0.25 + 7*0.20 + 9*0.20 + 5*0.15 + 6*0.10 + 4*0.10
      // = 2 + 1.4 + 1.8 + 0.75 + 0.6 + 0.4 = 6.95 ≈ 7
      expect(score).toBe(7);
    });
    
    it('should handle extreme comfort food scenarios', () => {
      const comfortFoodDimensions: EmotionalDimensions = {
        satisfaction: 6,
        craving: 8,
        comfort: 10, // Very high comfort
        excitement: 2,
        nostalgia: 9,
        social: 3
      };
      
      const score = EmotionalRatingService.calculateOverallScore(comfortFoodDimensions);
      expect(score).toBeGreaterThan(6); // Comfort weight should boost score
    });
  });
  
  describe('convertToEmotionalScale', () => {
    const basicContext: EmotionalContext = {
      mood_before: 'neutral',
      mood_after: 'happy',
      social_setting: 'alone',
      occasion: 'everyday',
      energy_level: 'neutral',
      weather_mood: 'neutral'
    };
    
    it('should convert low scores to NEVER_AGAIN', () => {
      const lowDimensions: EmotionalDimensions = {
        satisfaction: 1,
        craving: 1,
        comfort: 2,
        excitement: 1,
        nostalgia: 1,
        social: 1
      };
      
      const scale = EmotionalRatingService.convertToEmotionalScale(lowDimensions, basicContext);
      expect(scale).toBe(EmotionalScale.NEVER_AGAIN);
    });
    
    it('should convert high scores to WHEN_MOUTH_IS_LONELY', () => {
      const highDimensions: EmotionalDimensions = {
        satisfaction: 10,
        craving: 9,
        comfort: 10,
        excitement: 8,
        nostalgia: 9,
        social: 7
      };
      
      const scale = EmotionalRatingService.convertToEmotionalScale(highDimensions, basicContext);
      expect(scale).toBe(EmotionalScale.WHEN_MOUTH_IS_LONELY);
    });
    
    it('should boost comfort food when user was stressed', () => {
      const comfortDimensions: EmotionalDimensions = {
        satisfaction: 6,
        craving: 6,
        comfort: 9, // High comfort
        excitement: 3,
        nostalgia: 7,
        social: 4
      };
      
      const stressedContext: EmotionalContext = {
        ...basicContext,
        mood_before: 'stressed',
        occasion: 'comfort'
      };
      
      const scale = EmotionalRatingService.convertToEmotionalScale(comfortDimensions, stressedContext);
      expect(scale).toBeGreaterThanOrEqual(EmotionalScale.SATISFIED);
    });
    
    it('should boost adventure food when user was excited', () => {
      const adventureDimensions: EmotionalDimensions = {
        satisfaction: 7,
        craving: 6,
        comfort: 4,
        excitement: 9, // High excitement
        nostalgia: 3,
        social: 8
      };
      
      const excitedContext: EmotionalContext = {
        ...basicContext,
        energy_level: 'excited',
        occasion: 'adventure'
      };
      
      const scale = EmotionalRatingService.convertToEmotionalScale(adventureDimensions, excitedContext);
      expect(scale).toBeGreaterThanOrEqual(EmotionalScale.SATISFIED);
    });
  });
  
  describe('calculateMouthLonelinessLevel', () => {
    it('should calculate base mouth loneliness from comfort, craving, and nostalgia', () => {
      const dimensions: EmotionalDimensions = {
        satisfaction: 7,
        craving: 8,
        comfort: 9,
        excitement: 4,
        nostalgia: 7,
        social: 5
      };
      
      const context: EmotionalContext = {
        mood_before: 'neutral',
        mood_after: 'happy',
        social_setting: 'partner',
        occasion: 'everyday',
        energy_level: 'neutral',
        weather_mood: 'neutral'
      };
      
      const level = EmotionalRatingService.calculateMouthLonelinessLevel(dimensions, context);
      
      // Base: (8 + 9 + 7) / 3 = 8
      expect(level).toBe(8);
    });
    
    it('should amplify mouth loneliness for solo dining', () => {
      const dimensions: EmotionalDimensions = {
        satisfaction: 6,
        craving: 7,
        comfort: 8,
        excitement: 3,
        nostalgia: 6,
        social: 2
      };
      
      const soloContext: EmotionalContext = {
        mood_before: 'neutral',
        mood_after: 'content',
        social_setting: 'alone',
        occasion: 'everyday',
        energy_level: 'neutral',
        weather_mood: 'neutral'
      };
      
      const level = EmotionalRatingService.calculateMouthLonelinessLevel(dimensions, soloContext);
      
      // Base: (7 + 8 + 6) / 3 = 7, +1 for alone = 8
      expect(level).toBe(8);
    });
    
    it('should amplify mouth loneliness for comfort occasions and negative moods', () => {
      const dimensions: EmotionalDimensions = {
        satisfaction: 7,
        craving: 8,
        comfort: 9,
        excitement: 2,
        nostalgia: 8,
        social: 3
      };
      
      const comfortContext: EmotionalContext = {
        mood_before: 'sad',
        mood_after: 'comforted',
        social_setting: 'alone',
        occasion: 'comfort',
        energy_level: 'tired',
        weather_mood: 'gloomy'
      };
      
      const level = EmotionalRatingService.calculateMouthLonelinessLevel(dimensions, comfortContext);
      
      // Base: (8 + 9 + 8) / 3 = 8.33
      // +1 for alone, +1.5 for comfort occasion, +2 for sad mood
      // = 8.33 + 4.5 = 12.83, capped at 10
      expect(level).toBe(10);
    });
    
    it('should cap mouth loneliness at maximum value of 10', () => {
      const dimensions: EmotionalDimensions = {
        satisfaction: 10,
        craving: 10,
        comfort: 10,
        excitement: 1,
        nostalgia: 10,
        social: 1
      };
      
      const extremeContext: EmotionalContext = {
        mood_before: 'lonely',
        mood_after: 'fulfilled',
        social_setting: 'alone',
        occasion: 'comfort',
        energy_level: 'exhausted',
        weather_mood: 'gloomy'
      };
      
      const level = EmotionalRatingService.calculateMouthLonelinessLevel(dimensions, extremeContext);
      expect(level).toBe(10);
    });
  });
  
  describe('analyzeWouldCraveWhen', () => {
    it('should identify comfort craving triggers for high comfort foods', () => {
      const comfortDimensions: EmotionalDimensions = {
        satisfaction: 7,
        craving: 6,
        comfort: 9, // High comfort
        excitement: 2,
        nostalgia: 5,
        social: 3
      };
      
      const context: EmotionalContext = {
        mood_before: 'neutral',
        mood_after: 'content',
        social_setting: 'alone',
        occasion: 'comfort',
        energy_level: 'neutral',
        weather_mood: 'neutral'
      };
      
      const triggers = EmotionalRatingService.analyzeWouldCraveWhen(comfortDimensions, context);
      
      expect(triggers).toContain('stressed');
      expect(triggers).toContain('sad');
      expect(triggers).toContain('need_comfort');
    });
    
    it('should identify adventure craving triggers for high excitement foods', () => {
      const adventureDimensions: EmotionalDimensions = {
        satisfaction: 8,
        craving: 7,
        comfort: 4,
        excitement: 9, // High excitement
        nostalgia: 3,
        social: 8
      };
      
      const context: EmotionalContext = {
        mood_before: 'excited',
        mood_after: 'thrilled',
        social_setting: 'friends',
        occasion: 'adventure',
        energy_level: 'energetic',
        weather_mood: 'bright'
      };
      
      const triggers = EmotionalRatingService.analyzeWouldCraveWhen(adventureDimensions, context);
      
      expect(triggers).toContain('adventurous');
      expect(triggers).toContain('celebrating');
      expect(triggers).toContain('trying_new_things');
      expect(triggers).toContain('with_friends');
    });
    
    it('should identify mouth loneliness triggers for solo comfort eating', () => {
      const dimensions: EmotionalDimensions = {
        satisfaction: 7,
        craving: 8,
        comfort: 8,
        excitement: 2,
        nostalgia: 6,
        social: 2
      };
      
      const soloContext: EmotionalContext = {
        mood_before: 'lonely',
        mood_after: 'comforted',
        social_setting: 'alone',
        occasion: 'comfort',
        energy_level: 'tired',
        weather_mood: 'gloomy'
      };
      
      const triggers = EmotionalRatingService.analyzeWouldCraveWhen(dimensions, soloContext);
      
      expect(triggers).toContain('eating_alone');
      expect(triggers).toContain('mouth_is_lonely');
      expect(triggers).toContain('need_mood_boost');
    });
  });
  
  describe('createEmotionalRating', () => {
    it('should create a complete emotional rating with all calculated fields', () => {
      const dimensions: EmotionalDimensions = {
        satisfaction: 8,
        craving: 7,
        comfort: 9,
        excitement: 4,
        nostalgia: 6,
        social: 5
      };
      
      const context: EmotionalContext = {
        mood_before: 'stressed',
        mood_after: 'comforted',
        social_setting: 'alone',
        occasion: 'comfort',
        energy_level: 'tired',
        weather_mood: 'cozy'
      };
      
      const rating = EmotionalRatingService.createEmotionalRating(
        'user-123',
        'food-456',
        dimensions,
        context,
        'This mac and cheese saved my evening',
        'Mom\'s cooking when I was sick'
      );
      
      expect(rating.user_id).toBe('user-123');
      expect(rating.food_experience_id).toBe('food-456');
      expect(rating.primary_rating).toBeGreaterThanOrEqual(EmotionalScale.SATISFIED);
      expect(rating.mouth_loneliness_level).toBeGreaterThan(5);
      expect(rating.would_crave_when).toContain('stressed');
      expect(rating.emotional_notes).toBe('This mac and cheese saved my evening');
      expect(rating.reminds_me_of).toBe('Mom\'s cooking when I was sick');
      expect(rating.emotional_memory_trigger).toBe(true);
    });
  });
  
  describe('getEmotionalScaleDescription', () => {
    it('should return appropriate descriptions for each emotional scale', () => {
      expect(EmotionalRatingService.getEmotionalScaleDescription(EmotionalScale.NEVER_AGAIN))
        .toContain('Never again');
      
      expect(EmotionalRatingService.getEmotionalScaleDescription(EmotionalScale.WHEN_MOUTH_IS_LONELY))
        .toContain('When my mouth is lonely');
        
      expect(EmotionalRatingService.getEmotionalScaleDescription(EmotionalScale.SATISFIED))
        .toContain('hit the spot');
    });
  });
});