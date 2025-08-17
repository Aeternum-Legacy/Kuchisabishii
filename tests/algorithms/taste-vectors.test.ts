/**
 * Test Suite for Taste Vector Engine
 * 11-Dimensional Taste Space Mathematics Validation
 */

import { describe, test, expect } from '@jest/globals'
import {
  TasteVector,
  calculateCosineSimilarity,
  calculateEuclideanDistance,
  normalizeTasteVector,
  calculateDiversityScore,
  TasteVectorProcessor
} from '@/lib/algorithms/taste-vectors'

const mockTasteVector: TasteVector = {
  sweet: 7,
  salty: 5,
  sour: 3,
  bitter: 2,
  umami: 8,
  spicy: 6,
  crunchy: 4,
  creamy: 7,
  chewy: 3,
  hot: 8,
  cold: 2
}

describe('TasteVector Mathematics', () => {
  describe('Vector Operations', () => {
    test('should calculate cosine similarity correctly', () => {
      const vector1 = mockTasteVector
      const vector2 = { ...mockTasteVector }
      
      const similarity = calculateCosineSimilarity(vector1, vector2)
      expect(similarity).toBe(1.0) // Perfect similarity
    })

    test('should calculate euclidean distance', () => {
      const vector1 = mockTasteVector
      const vector2 = { ...mockTasteVector, sweet: 9, salty: 7 }
      
      const distance = calculateEuclideanDistance(vector1, vector2)
      expect(distance).toBeGreaterThan(0)
      expect(distance).toBeLessThan(20) // Reasonable range
    })

    test('should normalize taste vectors', () => {
      const normalized = normalizeTasteVector(mockTasteVector)
      
      // Check all values are between 0 and 1
      Object.values(normalized).forEach(value => {
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThanOrEqual(1)
      })
    })
  })

  describe('Diversity Scoring', () => {
    test('should calculate diversity for individual vector', () => {
      const diverseVector = { ...mockTasteVector, sweet: 10, salty: 1 }
      
      const diversity = calculateDiversityScore(diverseVector)
      expect(diversity).toBeGreaterThan(0)
      expect(diversity).toBeLessThanOrEqual(1)
    })
  })

  describe('Performance', () => {
    test('should handle similarity calculations efficiently', () => {
      const vector1 = mockTasteVector
      const vector2 = { ...mockTasteVector, sweet: 8, salty: 6 }
      
      const startTime = Date.now()
      const similarity = calculateCosineSimilarity(vector1, vector2)
      const processingTime = Date.now() - startTime
      
      expect(similarity).toBeGreaterThan(0)
      expect(similarity).toBeLessThanOrEqual(1)
      expect(processingTime).toBeLessThan(100) // Should be fast
    })
  })
})
