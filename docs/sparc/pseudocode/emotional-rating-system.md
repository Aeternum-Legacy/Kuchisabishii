# Emotional Rating System Algorithm

## Overview
Convert subjective emotional food experiences into quantifiable data structures using the "Never Again" to "When My Mouth is Lonely" scale.

## Data Structures

```typescript
interface EmotionalRating {
  id: string;
  userId: string;
  foodLogId: string;
  timestamp: number;
  
  // Core emotional scale (0-4)
  experienceLevel: EmotionalLevel;
  
  // Dimensional analysis
  satisfaction: number;      // 0-100
  craving: number;          // 0-100  
  comfort: number;          // 0-100
  excitement: number;       // 0-100
  
  // Contextual factors
  mood: MoodState;
  hunger: HungerLevel;
  socialContext: SocialContext;
  
  // Temporal tracking
  immediateRating: EmotionalLevel;
  reflectiveRating?: EmotionalLevel; // 24h later
  
  // Confidence metrics
  certainty: number;        // 0-100
  consistency: number;      // Historical variance
}

enum EmotionalLevel {
  NEVER_AGAIN = 0,           // "Never Again"
  MEH = 1,                   // "Meh"  
  DECENT = 2,                // "Decent"
  DAMN_GOOD = 3,             // "Damn Good"
  MOUTH_LONELY = 4           // "When My Mouth is Lonely"
}

enum MoodState {
  STRESSED, HAPPY, NEUTRAL, SAD, EXCITED, TIRED
}

enum HungerLevel {
  STARVING = 0, HUNGRY = 1, SATISFIED = 2, FULL = 3, STUFFED = 4
}

enum SocialContext {
  ALONE, FAMILY, FRIENDS, DATE, BUSINESS, CELEBRATION
}
```

## Core Algorithm: Emotional Rating Conversion

```pseudocode
FUNCTION convertEmotionalExperience(
  userInput: RawEmotionalInput,
  contextData: ContextualData,
  userHistory: UserTasteProfile
) -> EmotionalRating:

  BEGIN
    // Step 1: Initialize rating structure
    rating = new EmotionalRating()
    rating.timestamp = getCurrentTimestamp()
    rating.certainty = calculateInitialCertainty(userInput)
    
    // Step 2: Process primary emotional response
    primaryLevel = mapUserInputToScale(userInput.primaryResponse)
    rating.experienceLevel = primaryLevel
    rating.immediateRating = primaryLevel
    
    // Step 3: Extract dimensional analysis
    rating.satisfaction = extractSatisfactionLevel(userInput, contextData)
    rating.craving = calculateCravingIntensity(userInput, userHistory)
    rating.comfort = assessComfortLevel(userInput, contextData.socialContext)
    rating.excitement = measureExcitementLevel(userInput, contextData.novelty)
    
    // Step 4: Apply contextual adjustments
    rating = adjustForContext(rating, contextData)
    rating = adjustForUserBias(rating, userHistory.ratingPatterns)
    
    // Step 5: Calculate consistency score
    rating.consistency = calculateConsistencyScore(rating, userHistory)
    
    // Step 6: Schedule reflective rating
    scheduleReflectiveRating(rating.id, 24_HOURS)
    
    RETURN rating
  END

FUNCTION mapUserInputToScale(input: string) -> EmotionalLevel:
  BEGIN
    // Semantic analysis with emotional context
    semanticScore = analyzeSemanticContent(input)
    emotionalIntensity = extractEmotionalIntensity(input)
    
    // Map to 5-point scale with fuzzy boundaries
    IF semanticScore < 0.2 AND emotionalIntensity < 0.3:
      RETURN EmotionalLevel.NEVER_AGAIN
    ELSIF semanticScore < 0.4 AND emotionalIntensity < 0.5:
      RETURN EmotionalLevel.MEH
    ELSIF semanticScore < 0.6 AND emotionalIntensity < 0.7:
      RETURN EmotionalLevel.DECENT
    ELSIF semanticScore < 0.8 AND emotionalIntensity < 0.9:
      RETURN EmotionalLevel.DAMN_GOOD
    ELSE:
      RETURN EmotionalLevel.MOUTH_LONELY
    END IF
  END
```

## Temporal Emotion Tracking Algorithm

```pseudocode
FUNCTION trackEmotionalEvolution(
  userId: string,
  timeWindow: TimeRange
) -> EmotionalPattern:

  BEGIN
    // Step 1: Retrieve emotional ratings in time window
    ratings = getRatingsInTimeRange(userId, timeWindow)
    
    // Step 2: Detect patterns
    trends = detectEmotionalTrends(ratings)
    cycles = identifyEmotionalCycles(ratings)
    outliers = detectEmotionalOutliers(ratings)
    
    // Step 3: Calculate stability metrics
    volatility = calculateEmotionalVolatility(ratings)
    consistency = measureRatingConsistency(ratings)
    
    // Step 4: Identify trigger foods
    triggers = identifyEmotionalTriggers(ratings)
    comfortFoods = identifyComfortFoodPatterns(ratings)
    
    // Step 5: Generate pattern insights
    pattern = new EmotionalPattern()
    pattern.dominantMood = calculateDominantMood(ratings)
    pattern.satisfactionTrend = calculateSatisfactionTrend(ratings)
    pattern.cravingPatterns = analyzeCravingPatterns(ratings)
    
    RETURN pattern
  END

FUNCTION calculateEmotionalVolatility(ratings: EmotionalRating[]) -> number:
  BEGIN
    IF ratings.length < 2: RETURN 0
    
    variance = 0
    mean = calculateMeanRating(ratings)
    
    FOR each rating IN ratings:
      variance += (rating.experienceLevel - mean)²
    END FOR
    
    standardDeviation = sqrt(variance / ratings.length)
    
    // Normalize to 0-100 scale
    volatility = (standardDeviation / 4) * 100
    
    RETURN volatility
  END
```

## Pattern Recognition Algorithm

```pseudocode
FUNCTION recognizeEmotionalPatterns(
  userRatings: EmotionalRating[],
  analysisDepth: number
) -> PatternAnalysis:

  BEGIN
    patterns = new PatternAnalysis()
    
    // Temporal patterns
    patterns.timeOfDayPreferences = analyzeTimePatterns(userRatings)
    patterns.dayOfWeekTrends = analyzeDayPatterns(userRatings)
    patterns.seasonalChanges = analyzeSeasonalPatterns(userRatings)
    
    // Food type patterns
    patterns.cuisinePreferences = analyzeCuisinePatterns(userRatings)
    patterns.flavorProfileTrends = analyzeFlavorPatterns(userRatings)
    patterns.texturePreferences = analyzeTexturePatterns(userRatings)
    
    // Social context patterns
    patterns.socialEatingTrends = analyzeSocialPatterns(userRatings)
    patterns.moodFoodCorrelations = analyzeMoodCorrelations(userRatings)
    
    // Prediction patterns
    patterns.cravingPredictors = identifyCravingPredictors(userRatings)
    patterns.satisfactionPredictors = identifySatisfactionPredictors(userRatings)
    
    RETURN patterns
  END

FUNCTION identifyCravingPredictors(ratings: EmotionalRating[]) -> CravingPredictor[]:
  BEGIN
    predictors = []
    
    // Analyze correlation between context and high craving ratings
    FOR each contextFactor IN [mood, socialContext, timeOfDay, season]:
      correlation = calculateCorrelation(
        extractContextValues(ratings, contextFactor),
        extractCravingValues(ratings)
      )
      
      IF correlation > SIGNIFICANCE_THRESHOLD:
        predictor = new CravingPredictor()
        predictor.factor = contextFactor
        predictor.strength = correlation
        predictor.confidence = calculateConfidence(correlation, ratings.length)
        predictors.add(predictor)
      END IF
    END FOR
    
    RETURN predictors
  END
```

## Complexity Analysis

### Time Complexity
- **Emotional Rating Conversion**: O(1) - Constant time for single rating
- **Pattern Recognition**: O(n log n) - Where n = number of historical ratings
- **Temporal Analysis**: O(n) - Linear scan of time-ordered ratings
- **Volatility Calculation**: O(n) - Single pass through ratings

### Space Complexity  
- **Rating Storage**: O(1) per rating
- **Pattern Cache**: O(k) where k = number of identified patterns
- **Historical Analysis**: O(n) for temporary analysis structures

### Performance Considerations
- **Batch Processing**: Process multiple ratings in single operation
- **Caching**: Cache pattern analysis results with TTL
- **Indexing**: Index ratings by userId, timestamp, and experienceLevel
- **Lazy Loading**: Load detailed patterns only when requested

## Implementation Notes

### Data Validation
```pseudocode
FUNCTION validateEmotionalRating(rating: EmotionalRating) -> ValidationResult:
  BEGIN
    errors = []
    
    // Range validation
    IF rating.experienceLevel NOT IN [0, 1, 2, 3, 4]:
      errors.add("Invalid experience level")
    END IF
    
    IF rating.satisfaction NOT IN [0, 100]:
      errors.add("Satisfaction out of range")
    END IF
    
    // Logical consistency
    IF rating.experienceLevel == NEVER_AGAIN AND rating.satisfaction > 20:
      errors.add("Inconsistent satisfaction for negative experience")
    END IF
    
    // Temporal validation
    IF rating.reflectiveRating EXISTS AND 
       abs(rating.timestamp - rating.reflectiveTimestamp) < 12_HOURS:
      errors.add("Reflective rating too early")
    END IF
    
    RETURN new ValidationResult(errors.isEmpty(), errors)
  END
```

### Privacy Considerations
- Emotional ratings contain sensitive personal data
- Implement differential privacy for aggregated insights
- User consent required for emotional pattern sharing
- Allow selective emotional data deletion

### Scalability Notes
- Partition emotional data by userId and timestamp
- Use time-series database for temporal analysis
- Implement emotional data archiving after 2+ years
- Cache frequent pattern queries with Redis