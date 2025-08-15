/**
 * Taste Vector Calculation Engine
 * 11-Dimensional Taste Space with Emotional Intelligence
 * 
 * Patent-Pending: Advanced taste vector mathematics for food preference modeling
 */

import { ALGORITHM_CONFIG } from './palate-matching'

// 11-dimensional taste vector structure
export interface TasteVector {
  sweet: number      // 0-10 scale
  salty: number
  sour: number
  bitter: number
  umami: number
  spicy: number      // Heat level
  crunchy: number    // Texture: crunchiness
  creamy: number     // Texture: creaminess
  chewy: number      // Texture: chewiness
  hot: number        // Temperature preference for hot foods
  cold: number       // Temperature preference for cold foods
}

export interface EmotionalResponse {
  satisfaction: number
  excitement: number
  comfort: number
  surprise: number
  nostalgia: number
  overall_rating: number
  emotional_intensity: number
}

/**
 * Core Taste Vector Processing Engine
 * Handles 11-dimensional taste space mathematics
 */
export class TasteVectorProcessor {
  private static readonly DIMENSION_NAMES: (keyof TasteVector)[] = [
    'sweet', 'salty', 'sour', 'bitter', 'umami',
    'spicy', 'crunchy', 'creamy', 'chewy', 'hot', 'cold'
  ]

  private static readonly DIMENSION_WEIGHTS = {
    sweet: 1.0,
    salty: 1.0,
    sour: 0.9,
    bitter: 0.8,
    umami: 1.1,    // Slightly higher weight for umami complexity
    spicy: 1.0,
    crunchy: 0.7,  // Texture dimensions have different impact
    creamy: 0.7,
    chewy: 0.6,
    hot: 0.8,      // Temperature preferences
    cold: 0.8
  }

  /**
   * Create a normalized taste vector from raw input
   */
  static createVector(input: Partial<TasteVector>): TasteVector {
    const vector: TasteVector = {
      sweet: 5,
      salty: 5,
      sour: 5,
      bitter: 5,
      umami: 5,
      spicy: 5,
      crunchy: 5,
      creamy: 5,
      chewy: 5,
      hot: 5,
      cold: 5
    }

    // Apply input values with validation
    Object.entries(input).forEach(([key, value]) => {
      if (key in vector && typeof value === 'number') {
        vector[key as keyof TasteVector] = Math.max(0, Math.min(10, value))
      }
    })

    return vector
  }

  /**
   * Calculate cosine similarity between two taste vectors
   * Returns similarity score between 0 and 1
   */
  static calculateSimilarity(vectorA: TasteVector, vectorB: TasteVector): number {
    let dotProduct = 0
    let magnitudeA = 0
    let magnitudeB = 0

    this.DIMENSION_NAMES.forEach(dimension => {
      const valueA = vectorA[dimension]
      const valueB = vectorB[dimension]
      const weight = this.DIMENSION_WEIGHTS[dimension]

      // Apply dimensional weighting
      const weightedA = valueA * weight
      const weightedB = valueB * weight

      dotProduct += weightedA * weightedB
      magnitudeA += weightedA * weightedA
      magnitudeB += weightedB * weightedB
    })

    if (magnitudeA === 0 || magnitudeB === 0) return 0

    const similarity = dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB))
    return Math.max(0, Math.min(1, similarity))
  }

  /**
   * PATENT-PENDING: Emotional Gradient Descent Algorithm
   * Updates taste vector based on emotional satisfaction gradients
   */
  static applyEmotionalGradientDescent(
    currentVector: TasteVector,
    experienceVector: TasteVector,
    emotionalResponse: EmotionalResponse,
    learningRate: number,
    emotionalWeight: number,
    contextualWeight: number
  ): TasteVector {
    const updatedVector = { ...currentVector }
    
    // Calculate emotional satisfaction gradient
    const satisfactionGradient = this.calculateSatisfactionGradient(emotionalResponse)
    
    // Apply gradient descent with emotional weighting
    this.DIMENSION_NAMES.forEach(dimension => {
      const currentValue = currentVector[dimension]
      const experienceValue = experienceVector[dimension]
      const dimensionWeight = this.DIMENSION_WEIGHTS[dimension]
      
      // Emotional gradient calculation with dimension weighting
      const gradient = (experienceValue - currentValue) * satisfactionGradient * dimensionWeight
      const emotionalAdjustment = gradient * emotionalWeight * contextualWeight
      
      // Update with adaptive learning rate
      const delta = learningRate * emotionalAdjustment
      updatedVector[dimension] = Math.max(0, Math.min(10, currentValue + delta))
    })

    return updatedVector
  }

  /**
   * Calculate satisfaction gradient from emotional response
   * Higher satisfaction creates stronger positive gradient
   */
  private static calculateSatisfactionGradient(response: EmotionalResponse): number {
    const weightedSatisfaction = 
      response.satisfaction * ALGORITHM_CONFIG.EMOTIONAL_WEIGHTS.satisfaction +
      response.excitement * ALGORITHM_CONFIG.EMOTIONAL_WEIGHTS.excitement +
      response.comfort * ALGORITHM_CONFIG.EMOTIONAL_WEIGHTS.comfort +
      response.surprise * ALGORITHM_CONFIG.EMOTIONAL_WEIGHTS.surprise +
      response.nostalgia * ALGORITHM_CONFIG.EMOTIONAL_WEIGHTS.nostalgia

    // Apply emotional intensity multiplier
    const intensityMultiplier = response.emotional_intensity / 10
    
    // Convert to gradient (-1 to +1 scale)
    const gradient = (weightedSatisfaction - 5) / 5
    
    return gradient * intensityMultiplier
  }

  /**
   * Calculate euclidean distance between vectors
   */
  static calculateDistance(vectorA: TasteVector, vectorB: TasteVector): number {
    let sumSquaredDiff = 0

    this.DIMENSION_NAMES.forEach(dimension => {
      const diff = vectorA[dimension] - vectorB[dimension]
      const weight = this.DIMENSION_WEIGHTS[dimension]
      sumSquaredDiff += (diff * diff) * weight
    })

    return Math.sqrt(sumSquaredDiff)
  }

  /**
   * Normalize vector to unit length while preserving proportions
   */
  static normalize(vector: TasteVector): TasteVector {
    let magnitude = 0
    
    this.DIMENSION_NAMES.forEach(dimension => {
      const value = vector[dimension]
      magnitude += value * value
    })
    
    magnitude = Math.sqrt(magnitude)
    
    if (magnitude === 0) return vector
    
    const normalized: TasteVector = {} as TasteVector
    this.DIMENSION_NAMES.forEach(dimension => {
      normalized[dimension] = vector[dimension] / magnitude
    })
    
    return normalized
  }

  /**
   * Calculate weighted average of multiple taste vectors
   */
  static calculateWeightedAverage(
    vectors: TasteVector[],
    weights: number[]
  ): TasteVector {
    if (vectors.length === 0) {
      return this.createVector({})
    }

    if (weights.length !== vectors.length) {
      throw new Error('Weights array must match vectors array length')
    }

    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
    if (totalWeight === 0) {
      return this.createVector({})
    }

    const averaged: TasteVector = {} as TasteVector
    
    this.DIMENSION_NAMES.forEach(dimension => {
      let weightedSum = 0
      
      vectors.forEach((vector, index) => {
        weightedSum += vector[dimension] * weights[index]
      })
      
      averaged[dimension] = weightedSum / totalWeight
    })

    return averaged
  }

  /**
   * Apply temporal decay to taste preferences
   * Recent experiences have more influence
   */
  static applyTemporalDecay(
    baseVector: TasteVector,
    experiences: Array<{
      vector: TasteVector
      timestamp: Date
      emotional_weight: number
    }>
  ): TasteVector {
    const now = Date.now()
    const decayHalfLife = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds

    const weightedVectors: TasteVector[] = []
    const weights: number[] = []

    experiences.forEach(exp => {
      const ageMs = now - exp.timestamp.getTime()
      const decayFactor = Math.exp(-0.693 * ageMs / decayHalfLife) // 0.693 ≈ ln(2)
      const weight = decayFactor * exp.emotional_weight

      if (weight > 0.01) { // Only include if weight is significant
        weightedVectors.push(exp.vector)
        weights.push(weight)
      }
    })

    if (weightedVectors.length === 0) return baseVector

    // Include base vector with moderate weight
    weightedVectors.push(baseVector)
    weights.push(0.3)

    return this.calculateWeightedAverage(weightedVectors, weights)
  }

  /**
   * Detect taste preference outliers
   * Returns dimensions where preferences are significantly different from typical
   */
  static detectOutliers(
    userVector: TasteVector,
    populationVectors: TasteVector[]
  ): Array<{
    dimension: keyof TasteVector
    userValue: number
    populationMean: number
    zScore: number
    isOutlier: boolean
  }> {
    if (populationVectors.length < 3) return []

    const outliers: Array<{
      dimension: keyof TasteVector
      userValue: number
      populationMean: number
      zScore: number
      isOutlier: boolean
    }> = []

    this.DIMENSION_NAMES.forEach(dimension => {
      // Calculate population statistics
      const values = populationVectors.map(v => v[dimension])
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length
      
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
      const stdDev = Math.sqrt(variance)
      
      if (stdDev > 0) {
        const zScore = (userVector[dimension] - mean) / stdDev
        const isOutlier = Math.abs(zScore) > 2.0 // 2 standard deviations
        
        outliers.push({
          dimension,
          userValue: userVector[dimension],
          populationMean: mean,
          zScore,
          isOutlier
        })
      }
    })

    return outliers.filter(o => o.isOutlier)
  }

  /**
   * Calculate taste diversity score
   * Higher scores indicate more varied taste preferences
   */
  static calculateDiversityScore(vector: TasteVector): number {
    const values = this.DIMENSION_NAMES.map(dim => vector[dim])
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    const coefficient = Math.sqrt(variance) / mean
    
    // Normalize to 0-1 scale
    return Math.min(1, coefficient / 0.5)
  }

  /**
   * Generate taste profile summary for human interpretation
   */
  static generateProfileSummary(vector: TasteVector): {
    dominantTastes: Array<{ dimension: keyof TasteVector, strength: number }>
    texturePreferences: Array<{ dimension: keyof TasteVector, strength: number }>
    temperaturePreferences: Array<{ dimension: keyof TasteVector, strength: number }>
    overallProfile: string
    adventurousness: number
  } {
    const basicTastes: (keyof TasteVector)[] = ['sweet', 'salty', 'sour', 'bitter', 'umami', 'spicy']
    const textures: (keyof TasteVector)[] = ['crunchy', 'creamy', 'chewy']
    const temperatures: (keyof TasteVector)[] = ['hot', 'cold']

    const dominantTastes = basicTastes
      .map(dim => ({ dimension: dim, strength: vector[dim] }))
      .filter(item => item.strength > 6)
      .sort((a, b) => b.strength - a.strength)

    const texturePreferences = textures
      .map(dim => ({ dimension: dim, strength: vector[dim] }))
      .sort((a, b) => b.strength - a.strength)

    const temperaturePreferences = temperatures
      .map(dim => ({ dimension: dim, strength: vector[dim] }))
      .sort((a, b) => b.strength - a.strength)

    // Calculate adventurousness based on diversity and extreme preferences
    const diversityScore = this.calculateDiversityScore(vector)
    const extremePreferences = Object.values(vector).filter(v => v > 8 || v < 2).length
    const adventurousness = (diversityScore + (extremePreferences / 11)) / 2

    // Generate overall profile description
    let overallProfile = ''
    if (dominantTastes.length > 0) {
      const topTaste = dominantTastes[0].dimension
      overallProfile = `Strong preference for ${topTaste} flavors`
      
      if (dominantTastes.length > 1) {
        overallProfile += `, also enjoys ${dominantTastes[1].dimension}`
      }
    } else {
      overallProfile = 'Balanced taste preferences across all dimensions'
    }

    if (adventurousness > 0.7) {
      overallProfile += '. Highly adventurous eater.'
    } else if (adventurousness < 0.3) {
      overallProfile += '. Prefers familiar flavors.'
    }

    return {
      dominantTastes,
      texturePreferences,
      temperaturePreferences,
      overallProfile,
      adventurousness
    }
  }

  /**
   * Predict compatibility between two taste vectors
   * Returns compatibility score and explanation
   */
  static predictCompatibility(
    vectorA: TasteVector,
    vectorB: TasteVector
  ): {
    compatibility: number
    sharedPreferences: string[]
    differences: string[]
    recommendation: string
  } {
    const similarity = this.calculateSimilarity(vectorA, vectorB)
    
    const sharedPreferences: string[] = []
    const differences: string[] = []

    this.DIMENSION_NAMES.forEach(dimension => {
      const valueA = vectorA[dimension]
      const valueB = vectorB[dimension]
      const diff = Math.abs(valueA - valueB)

      if (diff <= 1.5 && (valueA > 6 || valueB > 6)) {
        sharedPreferences.push(`Both enjoy ${dimension} flavors`)
      } else if (diff > 3) {
        differences.push(`Different ${dimension} preferences (${valueA} vs ${valueB})`)
      }
    })

    let recommendation = ''
    if (similarity > 0.8) {
      recommendation = 'Highly compatible taste preferences. Great for dining together!'
    } else if (similarity > 0.6) {
      recommendation = 'Good compatibility with some interesting differences to explore.'
    } else if (similarity > 0.4) {
      recommendation = 'Moderate compatibility. May enjoy fusion cuisines together.'
    } else {
      recommendation = 'Very different taste preferences. Opportunity to discover new flavors!'
    }

    return {
      compatibility: similarity,
      sharedPreferences,
      differences,
      recommendation
    }
  }

  /**
   * Convert taste vector to database-friendly format
   */
  static serialize(vector: TasteVector): Record<string, number> {
    const serialized: Record<string, number> = {}
    this.DIMENSION_NAMES.forEach(dimension => {
      serialized[dimension] = vector[dimension]
    })
    return serialized
  }

  /**
   * Convert from database format to taste vector
   */
  static deserialize(data: Record<string, unknown>): TasteVector {
    return this.createVector(data)
  }

  /**
   * Validate taste vector integrity
   */
  static validate(vector: TasteVector): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    this.DIMENSION_NAMES.forEach(dimension => {
      const value = vector[dimension]
      
      if (typeof value !== 'number') {
        errors.push(`${dimension} must be a number`)
      } else if (value < 0 || value > 10) {
        errors.push(`${dimension} must be between 0 and 10`)
      } else if (isNaN(value)) {
        errors.push(`${dimension} cannot be NaN`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

/**
 * Taste Vector Utilities
 */
export class TasteVectorUtils {
  /**
   * Generate random taste vector for testing
   */
  static generateRandom(): TasteVector {
    return TasteVector.createVector({
      sweet: Math.random() * 10,
      salty: Math.random() * 10,
      sour: Math.random() * 10,
      bitter: Math.random() * 10,
      umami: Math.random() * 10,
      spicy: Math.random() * 10,
      crunchy: Math.random() * 10,
      creamy: Math.random() * 10,
      chewy: Math.random() * 10,
      hot: Math.random() * 10,
      cold: Math.random() * 10
    })
  }

  /**
   * Create taste vector from food item description
   */
  static fromFoodDescription(description: string, cuisineType: string = ''): TasteVector {
    // This would be enhanced with ML/NLP in production
    const vector = TasteVector.createVector({})
    
    // Simple keyword-based extraction (would be ML-powered in production)
    const text = (description + ' ' + cuisineType).toLowerCase()
    
    if (text.includes('sweet') || text.includes('dessert') || text.includes('candy')) {
      vector.sweet = 8
    }
    if (text.includes('salty') || text.includes('salt')) {
      vector.salty = 8
    }
    if (text.includes('sour') || text.includes('lemon') || text.includes('lime')) {
      vector.sour = 8
    }
    if (text.includes('bitter') || text.includes('dark chocolate') || text.includes('coffee')) {
      vector.bitter = 7
    }
    if (text.includes('umami') || text.includes('mushroom') || text.includes('cheese')) {
      vector.umami = 8
    }
    if (text.includes('spicy') || text.includes('hot') || text.includes('pepper')) {
      vector.spicy = 8
    }
    if (text.includes('crispy') || text.includes('crunchy') || text.includes('fried')) {
      vector.crunchy = 8
    }
    if (text.includes('creamy') || text.includes('smooth') || text.includes('rich')) {
      vector.creamy = 8
    }
    if (text.includes('chewy') || text.includes('tender') || text.includes('meat')) {
      vector.chewy = 7
    }
    
    return vector
  }

  /**
   * Interpolate between two taste vectors
   */
  static interpolate(vectorA: TasteVector, vectorB: TasteVector, factor: number): TasteVector {
    const interpolated: TasteVector = {} as TasteVector
    
    TasteVector['DIMENSION_NAMES'].forEach(dimension => {
      interpolated[dimension] = vectorA[dimension] * (1 - factor) + vectorB[dimension] * factor
    })
    
    return interpolated
  }

  /**
   * Create taste vector representing cuisine characteristics
   */
  static fromCuisineType(cuisineType: string): TasteVector {
    const cuisine = cuisineType.toLowerCase()
    
    // Cuisine-based taste profiles (simplified for demo)
    const cuisineProfiles: Record<string, Partial<TasteVector>> = {
      'italian': { umami: 7, salty: 6, creamy: 7, hot: 8 },
      'japanese': { umami: 9, salty: 7, sweet: 4, sour: 5 },
      'indian': { spicy: 9, bitter: 6, sweet: 6, creamy: 5 },
      'mexican': { spicy: 8, salty: 7, sour: 6, hot: 8 },
      'french': { creamy: 8, umami: 7, bitter: 5, hot: 7 },
      'thai': { spicy: 8, sweet: 7, sour: 8, salty: 6 },
      'chinese': { umami: 8, sweet: 6, salty: 7, hot: 7 },
      'mediterranean': { salty: 6, sour: 6, umami: 6, hot: 6 }
    }
    
    return TasteVector.createVector(cuisineProfiles[cuisine] || {})
  }
}