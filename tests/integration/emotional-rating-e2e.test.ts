/**
 * End-to-End Emotional Rating System Tests
 * Tests the complete emotional rating workflow from input to recommendation
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { EmotionalRatingService } from '../../shared/src/services/emotional-rating.service';
import { EmotionalScale, EmotionalDimensions, EmotionalContext } from '../../shared/src/types/emotional-rating';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'test-key';

describe('Emotional Rating System E2E', () => {
  let supabase: any;
  let testUserId: string;

  beforeAll(async () => {
    supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data: user } = await supabase.auth.signUp({
      email: 'test.emotional@kuchisabishii.test',
      password: 'TestPass123!'
    });
    testUserId = user.user?.id || 'test-user-emotional';
  });

  describe('Emotional Rating Calculation', () => {
    test('should correctly calculate "When Mouth is Lonely" ratings', async () => {
      const highComfortDimensions: EmotionalDimensions = {
        satisfaction: 9,
        craving: 9,
        comfort: 10, // Maximum comfort
        excitement: 6,
        nostalgia: 9,
        social: 4
      };

      const lonelyContext: EmotionalContext = {
        mood_before: 'sad',
        mood_after: 'happy',
        energy_level: 'low',
        social_setting: 'alone',
        occasion: 'comfort'
      };

      const rating = EmotionalRatingService.createEmotionalRating(
        testUserId,
        'test-food-id',
        highComfortDimensions,
        lonelyContext,
        'This dish filled the emptiness in my heart and mouth',
        'Sunday dinners at my childhood home'
      );

      expect(rating.primary_rating).toBe(EmotionalScale.WHEN_MOUTH_IS_LONELY);
      expect(rating.mouth_loneliness_level).toBeGreaterThanOrEqual(8);
      expect(rating.would_crave_when).toContain('mouth_is_lonely');
      expect(rating.would_crave_when).toContain('need_comfort');
      expect(rating.emotional_memory_trigger).toBe(true);
    });

    test('should identify disappointment accurately', async () => {
      const lowSatisfactionDimensions: EmotionalDimensions = {
        satisfaction: 2,
        craving: 1,
        comfort: 2,
        excitement: 1,
        nostalgia: 0,
        social: 3
      };

      const neutralContext: EmotionalContext = {
        mood_before: 'neutral',
        mood_after: 'disappointed',
        energy_level: 'medium',
        social_setting: 'with_friends',
        occasion: 'regular'
      };

      const rating = EmotionalRatingService.createEmotionalRating(
        testUserId,
        'test-food-id-2',
        lowSatisfactionDimensions,
        neutralContext,
        'Expected so much more. Left me wanting.'
      );

      expect(rating.primary_rating).toBe(EmotionalScale.DISAPPOINTED);
      expect(rating.mouth_loneliness_level).toBeLessThan(5);
      expect(rating.would_crave_when.length).toBe(0);
    });

    test('should handle adventure food correctly', async () => {
      const adventureDimensions: EmotionalDimensions = {
        satisfaction: 8,
        craving: 7,
        comfort: 5,
        excitement: 10, // Maximum excitement
        nostalgia: 2,
        social: 8
      };

      const excitedContext: EmotionalContext = {
        mood_before: 'excited',
        mood_after: 'thrilled',
        energy_level: 'excited',
        social_setting: 'with_friends',
        occasion: 'celebration'
      };

      const rating = EmotionalRatingService.createEmotionalRating(
        testUserId,
        'test-food-id-3',
        adventureDimensions,
        excitedContext,
        'What an amazing flavor explosion! Never tasted anything like it!'
      );

      expect(rating.primary_rating).toBe(EmotionalScale.SATISFIED);
      expect(rating.would_crave_when).toContain('adventurous');
      expect(rating.would_crave_when).toContain('celebrating');
      expect(rating.would_crave_when).toContain('with_friends');
    });
  });

  describe('Emotional Pattern Evolution', () => {
    test('should build and update emotional patterns over time', async () => {
      // Simulate a series of comfort food experiences over time
      const comfortExperiences = [
        {
          dimensions: { satisfaction: 9, craving: 8, comfort: 10, excitement: 4, nostalgia: 8, social: 3 },
          context: { mood_before: 'sad', mood_after: 'comforted', energy_level: 'low', social_setting: 'alone', occasion: 'comfort' },
          notes: 'Perfect soul food when I needed it most'
        },
        {
          dimensions: { satisfaction: 8, craving: 7, comfort: 9, excitement: 3, nostalgia: 7, social: 2 },
          context: { mood_before: 'stressed', mood_after: 'calm', energy_level: 'medium', social_setting: 'alone', occasion: 'comfort' },
          notes: 'Helped me unwind after a tough day'
        },
        {
          dimensions: { satisfaction: 10, craving: 9, comfort: 10, excitement: 5, nostalgia: 9, social: 4 },
          context: { mood_before: 'lonely', mood_after: 'satisfied', energy_level: 'low', social_setting: 'alone', occasion: 'comfort' },
          notes: 'Like a warm hug for my mouth'
        }
      ];

      let existingPattern = null;

      for (const [index, experience] of comfortExperiences.entries()) {
        // Create food experience
        const { data: foodExp } = await supabase
          .from('food_experiences')
          .insert({
            user_id: testUserId,
            dish_name: `Comfort Food #${index + 1}`,
            restaurant_name: 'Comfort Palace',
            experience_date: new Date(Date.now() - (2 - index) * 24 * 60 * 60 * 1000), // Spread over 3 days
            dining_method: 'dine-in',
            meal_time: 'dinner',
            spending: 15.00
          })
          .select()
          .single();

        // Create emotional rating
        const rating = EmotionalRatingService.createEmotionalRating(
          testUserId,
          foodExp.id,
          experience.dimensions,
          experience.context,
          experience.notes
        );

        const { data: insertedRating } = await supabase
          .from('emotional_ratings')
          .insert(rating)
          .select()
          .single();

        // Update emotional pattern
        const updatedPattern = EmotionalRatingService.updateEmotionalPattern(
          existingPattern,
          insertedRating
        );

        // Save or update pattern in database
        if (existingPattern) {
          await supabase
            .from('emotional_patterns')
            .update(updatedPattern)
            .eq('user_id', testUserId);
        } else {
          await supabase
            .from('emotional_patterns')
            .insert(updatedPattern);
        }

        existingPattern = updatedPattern;
      }

      // Verify final pattern
      const { data: finalPattern } = await supabase
        .from('emotional_patterns')
        .select('*')
        .eq('user_id', testUserId)
        .single();

      expect(finalPattern.comfort_seeking_frequency).toBe(3);
      expect(finalPattern.mouth_loneliness_frequency).toBeGreaterThan(0);
      expect(finalPattern.satisfaction_trend.length).toBe(3);
      expect(finalPattern.emotional_food_associations).toHaveProperty('mouth_is_lonely');
      expect(finalPattern.emotional_food_associations).toHaveProperty('need_comfort');
      expect(finalPattern.preferred_comfort_responses.length).toBe(3);
    });

    test('should provide accurate craving predictions', async () => {
      // Create diverse rating history
      const experiences = [
        {
          name: 'Spicy Ramen',
          dimensions: { satisfaction: 9, craving: 8, comfort: 7, excitement: 9, nostalgia: 4, social: 6 },
          context: { mood_before: 'excited', mood_after: 'thrilled', energy_level: 'high', social_setting: 'with_friends', occasion: 'celebration' }
        },
        {
          name: 'Mom\'s Soup',
          dimensions: { satisfaction: 10, craving: 9, comfort: 10, excitement: 3, nostalgia: 10, social: 4 },
          context: { mood_before: 'homesick', mood_after: 'nostalgic', energy_level: 'low', social_setting: 'alone', occasion: 'comfort' }
        },
        {
          name: 'Fancy Sushi',
          dimensions: { satisfaction: 8, craving: 6, comfort: 5, excitement: 8, nostalgia: 2, social: 9 },
          context: { mood_before: 'nervous', mood_after: 'impressed', energy_level: 'medium', social_setting: 'on_date', occasion: 'special' }
        }
      ];

      for (const experience of experiences) {
        const { data: foodExp } = await supabase
          .from('food_experiences')
          .insert({
            user_id: testUserId,
            dish_name: experience.name,
            restaurant_name: 'Test Restaurant',
            experience_date: new Date(),
            dining_method: 'dine-in',
            meal_time: 'dinner',
            spending: 20.00
          })
          .select()
          .single();

        const rating = EmotionalRatingService.createEmotionalRating(
          testUserId,
          foodExp.id,
          experience.dimensions,
          experience.context
        );

        await supabase
          .from('emotional_ratings')
          .insert(rating);
      }

      // Test recommendation system
      const { data: recommendations } = await supabase.rpc('get_mood_based_recommendations', {
        p_user_id: testUserId,
        p_current_mood: 'sad',
        p_social_setting: 'alone',
        p_limit: 5
      });

      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);
      
      // Should prioritize comfort foods for sad mood
      const comfortRecommendation = recommendations.find((r: any) => 
        r.dish_name === 'Mom\'s Soup' || r.comfort_score > 8
      );
      expect(comfortRecommendation).toBeDefined();
    });
  });

  describe('Mouth Loneliness Algorithm', () => {
    test('should accurately calculate mouth loneliness levels', async () => {
      const testCases = [
        {
          dimensions: { satisfaction: 9, craving: 10, comfort: 10, excitement: 4, nostalgia: 9, social: 3 },
          context: { mood_before: 'lonely', mood_after: 'satisfied', energy_level: 'low', social_setting: 'alone', occasion: 'comfort' },
          expectedLevel: 10
        },
        {
          dimensions: { satisfaction: 7, craving: 6, comfort: 5, excitement: 8, nostalgia: 3, social: 9 },
          context: { mood_before: 'excited', mood_after: 'happy', energy_level: 'high', social_setting: 'with_friends', occasion: 'celebration' },
          expectedLevel: 4
        },
        {
          dimensions: { satisfaction: 6, craving: 5, comfort: 6, excitement: 5, nostalgia: 5, social: 5 },
          context: { mood_before: 'neutral', mood_after: 'neutral', energy_level: 'medium', social_setting: 'with_family', occasion: 'regular' },
          expectedLevel: 5
        }
      ];

      for (const testCase of testCases) {
        const level = EmotionalRatingService.calculateMouthLonelinessLevel(
          testCase.dimensions,
          testCase.context
        );

        expect(level).toBeCloseTo(testCase.expectedLevel, 1);
      }
    });

    test('should provide meaningful emotional scale descriptions', async () => {
      const descriptions = [
        EmotionalRatingService.getEmotionalScaleDescription(EmotionalScale.WHEN_MOUTH_IS_LONELY),
        EmotionalRatingService.getEmotionalScaleDescription(EmotionalScale.DISAPPOINTED),
        EmotionalRatingService.getEmotionalScaleDescription(EmotionalScale.SATISFIED)
      ];

      descriptions.forEach(desc => {
        expect(desc).toBeTruthy();
        expect(desc.length).toBeGreaterThan(10);
        expect(desc).not.toBe('Unknown rating');
      });

      // Verify the core theme is present
      const lonelyDesc = EmotionalRatingService.getEmotionalScaleDescription(EmotionalScale.WHEN_MOUTH_IS_LONELY);
      expect(lonelyDesc.toLowerCase()).toContain('lonely');
      expect(lonelyDesc.toLowerCase()).toContain('mouth');
    });
  });

  afterAll(async () => {
    // Cleanup all test data
    await supabase
      .from('emotional_ratings')
      .delete()
      .eq('user_id', testUserId);
      
    await supabase
      .from('food_experiences')
      .delete()
      .eq('user_id', testUserId);
      
    await supabase
      .from('emotional_patterns')
      .delete()
      .eq('user_id', testUserId);
  });
});