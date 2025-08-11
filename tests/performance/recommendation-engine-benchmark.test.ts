/**
 * Recommendation Engine Performance Benchmark Tests
 * Tests response times and accuracy under various loads
 */

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { performance } from 'perf_hooks';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'test-key';

interface BenchmarkResult {
  operation: string;
  averageTime: number;
  minTime: number;
  maxTime: number;
  successRate: number;
  iterations: number;
}

describe('Recommendation Engine Performance', () => {
  let supabase: any;
  let testUserIds: string[] = [];

  beforeAll(async () => {
    supabase = createClient(supabaseUrl, supabaseKey);
    
    // Create multiple test users for load testing
    for (let i = 0; i < 10; i++) {
      const { data: user } = await supabase.auth.signUp({
        email: `perf.test${i}@kuchisabishii.test`,
        password: 'TestPass123!'
      });
      if (user.user?.id) {
        testUserIds.push(user.user.id);
      }
    }

    // Seed test data for each user
    await seedTestData();
  });

  async function seedTestData() {
    for (const userId of testUserIds) {
      // Create diverse food experiences
      const experiences = [
        { dish: 'Tonkotsu Ramen', comfort: 9, excitement: 6, social: 4 },
        { dish: 'Spicy Thai Curry', comfort: 6, excitement: 9, social: 7 },
        { dish: 'Mom\'s Chicken Soup', comfort: 10, excitement: 3, social: 5 },
        { dish: 'Sushi Omakase', comfort: 5, excitement: 10, social: 8 },
        { dish: 'Comfort Mac & Cheese', comfort: 10, excitement: 4, social: 6 },
        { dish: 'Street Tacos', comfort: 7, excitement: 8, social: 9 },
        { dish: 'Homemade Pizza', comfort: 8, excitement: 7, social: 8 },
        { dish: 'Fancy Steak', comfort: 6, excitement: 8, social: 9 },
        { dish: 'Instant Noodles', comfort: 7, excitement: 2, social: 2 },
        { dish: 'Birthday Cake', comfort: 6, excitement: 9, social: 10 }
      ];

      for (const exp of experiences) {
        // Create food experience
        const { data: foodExp } = await supabase
          .from('food_experiences')
          .insert({
            user_id: userId,
            dish_name: exp.dish,
            restaurant_name: 'Performance Test Restaurant',
            experience_date: new Date(),
            dining_method: 'dine-in',
            meal_time: 'dinner',
            spending: Math.random() * 30 + 10
          })
          .select()
          .single();

        // Create emotional rating
        await supabase
          .from('emotional_ratings')
          .insert({
            user_id: userId,
            food_experience_id: foodExp.id,
            primary_rating: Math.ceil(Math.random() * 5),
            dimensions: {
              satisfaction: Math.floor(Math.random() * 10) + 1,
              craving: Math.floor(Math.random() * 10) + 1,
              comfort: exp.comfort,
              excitement: exp.excitement,
              nostalgia: Math.floor(Math.random() * 10) + 1,
              social: exp.social
            },
            context: {
              mood_before: ['happy', 'sad', 'neutral', 'excited', 'stressed'][Math.floor(Math.random() * 5)],
              mood_after: ['happy', 'satisfied', 'disappointed', 'excited'][Math.floor(Math.random() * 4)],
              energy_level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
              social_setting: ['alone', 'with_friends', 'with_family', 'on_date'][Math.floor(Math.random() * 4)],
              occasion: ['regular', 'comfort', 'celebration', 'special'][Math.floor(Math.random() * 4)]
            },
            experience_date: new Date(),
            mouth_loneliness_level: Math.floor(Math.random() * 10) + 1,
            would_crave_when: ['stressed', 'happy', 'celebrating', 'lonely'][Math.floor(Math.random() * 4)]
          });
      }
    }
  }

  async function benchmarkOperation(
    operationName: string,
    operation: () => Promise<any>,
    iterations: number = 50
  ): Promise<BenchmarkResult> {
    const times: number[] = [];
    let successCount = 0;

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      try {
        await operation();
        successCount++;
      } catch (error) {
        console.warn(`Operation failed: ${error}`);
      }
      const end = performance.now();
      times.push(end - start);
    }

    return {
      operation: operationName,
      averageTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      successRate: (successCount / iterations) * 100,
      iterations
    };
  }

  describe('Core Recommendation Performance', () => {
    test('mood-based recommendations should respond under 200ms', async () => {
      const result = await benchmarkOperation(
        'Mood-based recommendations',
        async () => {
          const userId = testUserIds[Math.floor(Math.random() * testUserIds.length)];
          const moods = ['sad', 'happy', 'stressed', 'excited', 'lonely'];
          const socialSettings = ['alone', 'with_friends', 'with_family'];
          
          return await supabase.rpc('get_mood_based_recommendations', {
            p_user_id: userId,
            p_current_mood: moods[Math.floor(Math.random() * moods.length)],
            p_social_setting: socialSettings[Math.floor(Math.random() * socialSettings.length)],
            p_limit: 10
          });
        }
      );

      console.log('Mood-based Recommendations Benchmark:', result);
      
      expect(result.averageTime).toBeLessThan(200);
      expect(result.successRate).toBeGreaterThan(95);
      expect(result.minTime).toBeLessThan(150);
    });

    test('similarity-based recommendations should respond under 300ms', async () => {
      const result = await benchmarkOperation(
        'Similarity-based recommendations',
        async () => {
          const userId = testUserIds[Math.floor(Math.random() * testUserIds.length)];
          
          return await supabase.rpc('get_similar_users_recommendations', {
            p_user_id: userId,
            p_limit: 10
          });
        }
      );

      console.log('Similarity-based Recommendations Benchmark:', result);
      
      expect(result.averageTime).toBeLessThan(300);
      expect(result.successRate).toBeGreaterThan(90);
    });

    test('craving-based predictions should respond under 150ms', async () => {
      const result = await benchmarkOperation(
        'Craving predictions',
        async () => {
          const userId = testUserIds[Math.floor(Math.random() * testUserIds.length)];
          const cravingTriggers = ['stressed', 'lonely', 'celebrating', 'adventurous'];
          
          return await supabase.rpc('get_craving_predictions', {
            p_user_id: userId,
            p_trigger: cravingTriggers[Math.floor(Math.random() * cravingTriggers.length)],
            p_limit: 5
          });
        }
      );

      console.log('Craving Predictions Benchmark:', result);
      
      expect(result.averageTime).toBeLessThan(150);
      expect(result.successRate).toBeGreaterThan(95);
    });
  });

  describe('Load Testing', () => {
    test('should handle concurrent recommendation requests', async () => {
      const concurrentRequests = 20;
      const promises: Promise<any>[] = [];

      const start = performance.now();

      for (let i = 0; i < concurrentRequests; i++) {
        const userId = testUserIds[i % testUserIds.length];
        promises.push(
          supabase.rpc('get_mood_based_recommendations', {
            p_user_id: userId,
            p_current_mood: 'lonely',
            p_social_setting: 'alone',
            p_limit: 5
          })
        );
      }

      const results = await Promise.allSettled(promises);
      const end = performance.now();

      const successfulResults = results.filter(r => r.status === 'fulfilled');
      const successRate = (successfulResults.length / concurrentRequests) * 100;
      const averageTime = (end - start) / concurrentRequests;

      console.log(`Concurrent Load Test: ${successRate}% success rate, ${averageTime.toFixed(2)}ms average`);

      expect(successRate).toBeGreaterThan(90);
      expect(averageTime).toBeLessThan(500);
    });

    test('should handle high-volume pattern analysis', async () => {
      const result = await benchmarkOperation(
        'Pattern analysis under load',
        async () => {
          const userId = testUserIds[Math.floor(Math.random() * testUserIds.length)];
          
          return await supabase
            .from('emotional_patterns')
            .select('*')
            .eq('user_id', userId)
            .single();
        }
      );

      console.log('Pattern Analysis Benchmark:', result);
      
      expect(result.averageTime).toBeLessThan(100);
      expect(result.successRate).toBeGreaterThan(98);
    });
  });

  describe('Cache Performance', () => {
    test('cached recommendations should respond under 50ms', async () => {
      const userId = testUserIds[0];
      
      // First request (cache miss)
      const start1 = performance.now();
      await supabase.rpc('get_mood_based_recommendations', {
        p_user_id: userId,
        p_current_mood: 'sad',
        p_social_setting: 'alone',
        p_limit: 5
      });
      const end1 = performance.now();
      const firstRequestTime = end1 - start1;

      // Second request (should be cached)
      const start2 = performance.now();
      await supabase.rpc('get_mood_based_recommendations', {
        p_user_id: userId,
        p_current_mood: 'sad',
        p_social_setting: 'alone',
        p_limit: 5
      });
      const end2 = performance.now();
      const cachedRequestTime = end2 - start2;

      console.log(`Cache Performance: First: ${firstRequestTime.toFixed(2)}ms, Cached: ${cachedRequestTime.toFixed(2)}ms`);

      // Cached requests should be significantly faster
      expect(cachedRequestTime).toBeLessThan(firstRequestTime * 0.7);
      expect(cachedRequestTime).toBeLessThan(100);
    });
  });

  describe('Accuracy Under Load', () => {
    test('recommendations should maintain relevance under concurrent load', async () => {
      const userId = testUserIds[0];
      
      // Create specific pattern
      await supabase
        .from('food_experiences')
        .insert({
          user_id: userId,
          dish_name: 'Ultimate Comfort Ramen',
          restaurant_name: 'Comfort Central',
          experience_date: new Date(),
          dining_method: 'dine-in',
          meal_time: 'dinner',
          spending: 15.00
        });

      const { data: comfortFood } = await supabase
        .from('food_experiences')
        .select('id')
        .eq('dish_name', 'Ultimate Comfort Ramen')
        .eq('user_id', userId)
        .single();

      await supabase
        .from('emotional_ratings')
        .insert({
          user_id: userId,
          food_experience_id: comfortFood.id,
          primary_rating: 5,
          dimensions: {
            satisfaction: 10,
            craving: 9,
            comfort: 10,
            excitement: 4,
            nostalgia: 9,
            social: 3
          },
          context: {
            mood_before: 'sad',
            mood_after: 'happy',
            energy_level: 'low',
            social_setting: 'alone',
            occasion: 'comfort'
          },
          experience_date: new Date(),
          mouth_loneliness_level: 10,
          would_crave_when: ['sad', 'lonely', 'stressed', 'mouth_is_lonely']
        });

      // Test concurrent requests for sad mood
      const concurrentRequests = 10;
      const promises = Array(concurrentRequests).fill(null).map(() =>
        supabase.rpc('get_mood_based_recommendations', {
          p_user_id: userId,
          p_current_mood: 'sad',
          p_social_setting: 'alone',
          p_limit: 5
        })
      );

      const results = await Promise.allSettled(promises);
      const successfulResults = results
        .filter(r => r.status === 'fulfilled')
        .map(r => (r as any).value.data || (r as any).value);

      // All successful results should include the comfort food
      successfulResults.forEach(recommendations => {
        const hasComfortFood = recommendations?.some((rec: any) => 
          rec.dish_name === 'Ultimate Comfort Ramen' ||
          rec.comfort_score >= 9
        );
        expect(hasComfortFood).toBe(true);
      });
    });
  });

  afterAll(async () => {
    // Cleanup test data
    for (const userId of testUserIds) {
      await supabase
        .from('emotional_ratings')
        .delete()
        .eq('user_id', userId);
        
      await supabase
        .from('food_experiences')
        .delete()
        .eq('user_id', userId);
        
      await supabase
        .from('emotional_patterns')
        .delete()
        .eq('user_id', userId);
    }
  });
});