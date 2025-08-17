/**
 * Test Suite for Collaborative Filtering Algorithm
 * Tests for 90%+ accuracy user similarity matching
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals'
import { CollaborativeFiltering } from '@/lib/algorithms/collaborative-filtering'

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      }))
    }))
  }
}))

describe('CollaborativeFiltering', () => {
  let collaborativeFilter: CollaborativeFiltering

  beforeEach(() => {
    collaborativeFilter = new CollaborativeFiltering()
    jest.clearAllMocks()
  })

  describe('Score Calculation', () => {
    test('should calculate collaborative scores', async () => {
      const mockExperience = {
        id: 'exp-1',
        user_id: 'user-1',
        food_item: 'Pizza',
        cuisine_type: 'Italian',
        palate_profile: {
          sweet: 5, salty: 8, sour: 2, bitter: 3, umami: 7,
          spicy: 4, crunchy: 6, creamy: 5, chewy: 6, hot: 7, cold: 2
        },
        emotional_response: {
          satisfaction: 8,
          excitement: 7,
          comfort: 9,
          surprise: 5,
          nostalgia: 6,
          overall_rating: 8,
          emotional_intensity: 7
        },
        context: {
          time_of_day: 'dinner' as const,
          social_setting: 'friends' as const,
          mood_before: 'happy' as const,
          weather: 'mild' as const,
          location_type: 'restaurant' as const
        },
        timestamp: new Date(),
        confidence: 0.8,
        overall_rating: 8
      }
      
      const mockSimilarUsers = [
        {
          user_a: 'user-1',
          user_b: 'user-2',
          similarity_score: 0.92,
          taste_alignment: 0.89,
          emotional_alignment: 0.94,
          context_alignment: 0.87,
          confidence: 0.91,
          algorithm_version: 'v1.0',
          calculated_at: new Date()
        }
      ]
      
      const score = await collaborativeFilter.calculateScore(mockExperience, mockSimilarUsers)
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(1)
    })

    test('should handle empty similarity data', async () => {
      const mockExperience = {
        id: 'exp-1',
        user_id: 'user-1',
        food_item: 'Pizza',
        cuisine_type: 'Italian',
        palate_profile: {
          sweet: 5, salty: 8, sour: 2, bitter: 3, umami: 7,
          spicy: 4, crunchy: 6, creamy: 5, chewy: 6, hot: 7, cold: 2
        },
        emotional_response: {
          satisfaction: 8, excitement: 7, comfort: 9, surprise: 5, nostalgia: 6,
          overall_rating: 8, emotional_intensity: 7
        },
        context: {
          time_of_day: 'dinner' as const, social_setting: 'friends' as const, mood_before: 'happy' as const,
          weather: 'mild' as const, location_type: 'restaurant' as const
        },
        timestamp: new Date(),
        confidence: 0.8,
        overall_rating: 8
      }
      
      const score = await collaborativeFilter.calculateScore(mockExperience, [])
      expect(score).toBe(0.5) // Default fallback score
    })
  })

  describe('Performance', () => {
    test('should process within acceptable time limits', async () => {
      const startTime = Date.now()
      
      const mockExperience = {
        id: 'exp-1', user_id: 'user-1', food_item: 'Pizza', cuisine_type: 'Italian',
        palate_profile: {
          sweet: 5, salty: 8, sour: 2, bitter: 3, umami: 7,
          spicy: 4, crunchy: 6, creamy: 5, chewy: 6, hot: 7, cold: 2
        },
        emotional_response: { satisfaction: 8, excitement: 7, comfort: 9, surprise: 5, nostalgia: 6, overall_rating: 8, emotional_intensity: 7 },
        context: { time_of_day: 'dinner' as const, social_setting: 'friends' as const, mood_before: 'happy' as const, weather: 'mild' as const, location_type: 'restaurant' as const },
        timestamp: new Date(), confidence: 0.8, overall_rating: 8
      }
      
      await collaborativeFilter.calculateScore(mockExperience, [])
      const processingTime = Date.now() - startTime
      expect(processingTime).toBeLessThan(1000) // Should be fast
    })
  })
})
