/**
 * Cross-Platform Synchronization Integration Tests
 * Tests data synchronization between mobile and web platforms
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { EmotionalRatingService } from '../../shared/src/services/emotional-rating.service';
import { EmotionalScale, EmotionalDimensions, EmotionalContext } from '../../shared/src/types/emotional-rating';

// Test environment setup
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'test-key';

describe('Cross-Platform Synchronization', () => {
  let supabase: any;
  let testUserId: string;
  let testFoodExperienceId: string;

  beforeAll(async () => {
    supabase = createClient(supabaseUrl, supabaseKey);
    
    // Create test user
    const { data: user } = await supabase.auth.signUp({
      email: 'test.sync@kuchisabishii.test',
      password: 'TestPass123!'
    });
    testUserId = user.user?.id || 'test-user-id';
  });

  beforeEach(async () => {
    // Create test food experience
    const { data: foodExp } = await supabase
      .from('food_experiences')
      .insert({
        user_id: testUserId,
        dish_name: 'Test Ramen Bowl',
        restaurant_name: 'Test Restaurant',
        experience_date: new Date(),
        dining_method: 'dine-in',
        meal_time: 'dinner',
        spending: 12.50
      })
      .select()
      .single();
      
    testFoodExperienceId = foodExp.id;
  });

  describe('Emotional Rating Synchronization', () => {
    test('should sync emotional ratings between platforms', async () => {
      // Simulate mobile platform creating emotional rating
      const mobileRatingDimensions: EmotionalDimensions = {
        satisfaction: 9,
        craving: 8,
        comfort: 9,
        excitement: 7,
        nostalgia: 6,
        social: 5
      };

      const mobileContext: EmotionalContext = {
        mood_before: 'sad',
        mood_after: 'happy',
        energy_level: 'medium',
        social_setting: 'alone',
        occasion: 'comfort'
      };

      const mobileRating = EmotionalRatingService.createEmotionalRating(
        testUserId,
        testFoodExperienceId,
        mobileRatingDimensions,
        mobileContext,
        'This ramen reminded me of home and filled my lonely evening',
        'My grandmother\'s kitchen'
      );

      // Insert via mobile (simulated)
      const { data: insertedRating } = await supabase
        .from('emotional_ratings')
        .insert(mobileRating)
        .select()
        .single();

      expect(insertedRating).toBeDefined();
      expect(insertedRating.primary_rating).toBe(EmotionalScale.WHEN_MOUTH_IS_LONELY);
      expect(insertedRating.mouth_loneliness_level).toBeGreaterThan(7);

      // Verify web platform can read the same data
      const { data: webRating } = await supabase
        .from('emotional_ratings')
        .select('*, food_experiences(*)')
        .eq('id', insertedRating.id)
        .single();

      expect(webRating).toEqual(insertedRating);
      expect(webRating.would_crave_when).toContain('mouth_is_lonely');
      expect(webRating.would_crave_when).toContain('need_comfort');
    });

    test('should handle real-time updates across platforms', async () => {
      // Create initial rating
      const initialRating = EmotionalRatingService.createEmotionalRating(
        testUserId,
        testFoodExperienceId,
        {
          satisfaction: 7,
          craving: 6,
          comfort: 8,
          excitement: 5,
          nostalgia: 4,
          social: 3
        },
        {
          mood_before: 'neutral',
          mood_after: 'satisfied',
          energy_level: 'medium',
          social_setting: 'alone',
          occasion: 'regular'
        }
      );

      const { data: rating } = await supabase
        .from('emotional_ratings')
        .insert(initialRating)
        .select()
        .single();

      // Set up real-time subscription (simulated)
      let updateReceived = false;
      let updatedData: any = null;

      const subscription = supabase
        .channel('emotional_ratings')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'emotional_ratings',
          filter: `id=eq.${rating.id}`
        }, (payload: any) => {
          updateReceived = true;
          updatedData = payload.new;
        })
        .subscribe();

      // Update from different platform
      await supabase
        .from('emotional_ratings')
        .update({
          emotional_notes: 'Updated from web platform - even better on second thought!'
        })
        .eq('id', rating.id);

      // Wait for real-time update
      await new Promise(resolve => setTimeout(resolve, 1000));

      expect(updateReceived).toBe(true);
      expect(updatedData?.emotional_notes).toContain('Updated from web platform');

      await subscription.unsubscribe();
    });
  });

  describe('Food Experience Data Consistency', () => {
    test('should maintain data integrity across platforms', async () => {
      // Create food experience on mobile
      const mobileExperience = {
        user_id: testUserId,
        dish_name: 'Tonkotsu Ramen with Extra Chashu',
        restaurant_name: 'Lonely Nights Ramen-ya',
        experience_date: new Date(),
        dining_method: 'dine-in' as const,
        meal_time: 'dinner' as const,
        spending: 18.75,
        photo_url: 'https://example.com/test-ramen.jpg',
        tasting_notes: 'Rich, creamy broth that hugged my soul. Perfect for a cold, lonely evening.',
        location: 'Downtown District'
      };

      const { data: foodExp } = await supabase
        .from('food_experiences')
        .insert(mobileExperience)
        .select()
        .single();

      // Verify web can access with all related data
      const { data: webExperience } = await supabase
        .from('food_experiences')
        .select(`
          *,
          emotional_ratings(*),
          restaurants(*)
        `)
        .eq('id', foodExp.id)
        .single();

      expect(webExperience).toBeDefined();
      expect(webExperience.dish_name).toBe(mobileExperience.dish_name);
      expect(webExperience.tasting_notes).toBe(mobileExperience.tasting_notes);
      expect(webExperience.spending).toBe(mobileExperience.spending);
    });

    test('should sync recommendation data consistently', async () => {
      // Create multiple emotional ratings to build pattern
      const ratings = [
        {
          dimensions: { satisfaction: 9, craving: 9, comfort: 10, excitement: 6, nostalgia: 8, social: 4 },
          context: { mood_before: 'sad', mood_after: 'happy', energy_level: 'low', social_setting: 'alone', occasion: 'comfort' }
        },
        {
          dimensions: { satisfaction: 8, craving: 7, comfort: 9, excitement: 5, nostalgia: 7, social: 3 },
          context: { mood_before: 'lonely', mood_after: 'comforted', energy_level: 'medium', social_setting: 'alone', occasion: 'comfort' }
        }
      ];

      for (const ratingData of ratings) {
        // Create food experience
        const { data: foodExp } = await supabase
          .from('food_experiences')
          .insert({
            user_id: testUserId,
            dish_name: 'Comfort Food Test',
            restaurant_name: 'Test Comfort Place',
            experience_date: new Date(),
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
          ratingData.dimensions,
          ratingData.context
        );

        await supabase
          .from('emotional_ratings')
          .insert(rating);
      }

      // Check if pattern recognition works across platforms
      const { data: patterns } = await supabase
        .from('emotional_patterns')
        .select('*')
        .eq('user_id', testUserId)
        .single();

      expect(patterns?.comfort_seeking_frequency).toBeGreaterThan(0);
      expect(patterns?.mouth_loneliness_frequency).toBeGreaterThan(0);
      expect(patterns?.emotional_food_associations).toHaveProperty('mouth_is_lonely');
    });
  });

  afterAll(async () => {
    // Cleanup test data
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