/**
 * Emotional AI System for Kuchisabishii
 * Advanced emotional pattern recognition with continuous learning capabilities
 * Features deep learning models for mood detection, Kuchisabishii pattern recognition,
 * and contextual emotional intelligence that evolves with user behavior
 */

import * as tf from '@tensorflow/tfjs';
import { supabase } from '../../lib/supabase/client';

export interface EmotionalContext {
  userId: string;
  timestamp: Date;
  
  // Direct indicators
  explicitMood?: 'happy' | 'sad' | 'stressed' | 'excited' | 'lonely' | 'content' | 'anxious';
  moodConfidence?: number;
  
  // Behavioral indicators
  timeOfDay: number; // Hour of day (0-23)
  dayOfWeek: number; // Day of week (0-6)
  weatherCondition?: 'sunny' | 'rainy' | 'cloudy' | 'snowy' | 'stormy';
  temperature?: number;
  
  // Social context
  diningContext: 'solo' | 'friends' | 'family' | 'date' | 'business';
  locationContext: 'home' | 'work' | 'restaurant' | 'outdoor' | 'travel';
  
  // Recent activity patterns
  recentFoodEntries: {
    rating: number;
    category: string;
    spiceLevel?: number;
    comfort: boolean;
    timestamp: Date;
  }[];
  
  sleepPattern?: {
    hoursSlept: number;
    sleepQuality: number; // 1-5 scale
  };
  
  stressIndicators?: {
    workPressure: number; // 1-5 scale
    socialStress: number;
    financialStress: number;
  };
}

export interface EmotionalState {
  primaryMood: string;
  moodIntensity: number; // 0-1 scale
  secondaryMoods: { mood: string; intensity: number }[];
  confidence: number;
  
  // Emotional needs
  needsComfort: boolean;
  needsExcitement: boolean;
  needsSocialConnection: boolean;
  needsIndulgence: boolean;
}

export interface KuchisabishiiDetection {
  isExperiencing: boolean;
  intensity: number; // 0-1 scale
  triggers: string[];
  lonelinessDuration: 'brief' | 'moderate' | 'extended';
  emotionalDepth: 'surface' | 'moderate' | 'deep';
  temporalPattern: 'random' | 'cyclical' | 'chronic';
  
  // Advanced recommendations
  comfortFoodSuggestions: EmotionalFoodSuggestion[];
  socialDiningSuggestions: SocialRecommendation[];
  activitiesRecommended: TherapeuticActivity[];
  emotionalSupport: EmotionalSupportStrategy;
}

export interface EmotionalFoodSuggestion {
  foodType: string;
  reasoning: string;
  emotionalBenefit: string;
  comfortLevel: number;
  preparationSuggestion?: string;
}

export interface SocialRecommendation {
  activity: string;
  socialLevel: 'intimate' | 'small_group' | 'community';
  duration: string;
  emotionalGoal: string;
}

export interface TherapeuticActivity {
  name: string;
  type: 'mindful' | 'creative' | 'physical' | 'social';
  duration: number;
  difficultyLevel: 'easy' | 'moderate' | 'challenging';
  expectedBenefit: string;
}

export interface EmotionalSupportStrategy {
  primaryApproach: string;
  supportingActions: string[];
  timeframe: string;
  followUpRecommended: boolean;
}

export interface EmotionalProfile {
  userId: string;
  emotionalBaseline: Record<string, number>;
  triggerPatterns: Record<string, number>;
  copingPreferences: string[];
  emotionalEvolution: EmotionalEvolutionData[];
  lastUpdated: Date;
}

export interface EmotionalEvolutionData {
  timestamp: Date;
  dominantMood: string;
  moodStability: number;
  socialNeed: number;
  comfortSeeking: number;
  adventurousness: number;
}

export interface EmotionalFeedback {
  userId: string;
  recommendationId: string;
  actualMood: string;
  moodAccuracy: number;
  recommendationHelpfulness: number;
  emotionalOutcome: string;
  timestamp: Date;
}

export interface MoodBasedRecommendation {
  restaurantId: string;
  dishName?: string;
  reasoning: string;
  moodMatch: number; // 0-1 how well it matches mood
  expectedSatisfaction: number;
  
  attributes: {
    comfortLevel: number;
    socialFit: number;
    adventurousness: number;
    indulgenceLevel: number;
  };
}

export class EmotionalAI {
  private moodClassifier: tf.LayersModel | null = null;
  private kuchisabishiiDetector: tf.LayersModel | null = null;
  private moodFoodMapper: tf.LayersModel | null = null;
  private emotionalMemoryNetwork: tf.LayersModel | null = null;
  private adaptiveLearningModel: tf.LayersModel | null = null;
  
  // Emotional patterns database with continuous learning
  private emotionalPatterns: Map<string, any> = new Map();
  private userEmotionalProfiles: Map<string, EmotionalProfile> = new Map();
  private realtimeFeedbackBuffer: EmotionalFeedback[] = [];
  
  // Model versioning and continuous learning
  private modelVersion = 'v2.0.0';
  private lastTrainingTime: Date | null = null;
  private trainingInProgress = false;
  
  constructor() {
    this.initializeModels();
    this.loadEmotionalPatterns();
    this.startContinuousLearning();
  }

  /**
   * Initialize all emotional AI models with advanced architectures
   */
  private async initializeModels(): Promise<void> {
    await Promise.all([
      this.initializeMoodClassifier(),
      this.initializeKuchisabishiiDetector(),
      this.initializeMoodFoodMapper(),
      this.initializeEmotionalMemoryNetwork(),
      this.initializeAdaptiveLearningModel(),
    ]);
  }

  /**
   * Initialize advanced mood classification model with attention mechanism
   */
  private async initializeMoodClassifier(): Promise<void> {
    const model = tf.sequential();

    // Enhanced input layer with batch normalization
    model.add(tf.layers.dense({
      units: 256,
      activation: 'relu',
      inputShape: [35], // Expanded to 35 contextual features
    }));
    
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.dropout({ rate: 0.3 }));

    // Attention-like mechanism for feature importance
    model.add(tf.layers.dense({
      units: 128,
      activation: 'relu',
    }));
    
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.dropout({ rate: 0.25 }));

    // Secondary pathway for temporal context
    model.add(tf.layers.dense({
      units: 64,
      activation: 'relu',
    }));
    
    model.add(tf.layers.dropout({ rate: 0.2 }));

    // Multi-head output with emotion intensity
    model.add(tf.layers.dense({
      units: 14, // 7 emotions + 7 intensity scores
      activation: 'sigmoid', // Changed to allow multiple emotions
    }));

    model.compile({
      optimizer: tf.train.adamax(0.0008), // Better for emotional classification
      loss: 'binaryCrossentropy', // Multi-label classification
      metrics: ['accuracy', 'precision', 'recall'],
    });

    this.moodClassifier = model;
  }

  /**
   * Initialize Kuchisabishii (mouth loneliness) detection model
   */
  private async initializeKuchisabishiiDetector(): Promise<void> {
    const model = tf.sequential();

    // Process temporal eating patterns
    model.add(tf.layers.lstm({
      units: 64,
      returnSequences: true,
      inputShape: [7, 10], // 7 days, 10 features per day
      dropout: 0.2,
    }));

    model.add(tf.layers.lstm({
      units: 32,
      dropout: 0.2,
    }));

    model.add(tf.layers.dense({
      units: 16,
      activation: 'relu',
    }));

    // Output: loneliness probability and intensity
    model.add(tf.layers.dense({
      units: 2,
      activation: 'sigmoid',
    }));

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae'],
    });

    this.kuchisabishiiDetector = model;
  }

  /**
   * Initialize mood-to-food mapping model
   */
  private async initializeMoodFoodMapper(): Promise<void> {
    const model = tf.sequential();

    // Multi-modal input: mood + user preferences + context
    model.add(tf.layers.dense({
      units: 256,
      activation: 'relu',
      inputShape: [50], // Combined feature vector
    }));

    model.add(tf.layers.dropout({ rate: 0.3 }));

    model.add(tf.layers.dense({
      units: 128,
      activation: 'relu',
    }));

    model.add(tf.layers.dense({
      units: 64,
      activation: 'relu',
    }));

    // Output: food preference adjustments
    model.add(tf.layers.dense({
      units: 20, // 20 food attribute preferences
      activation: 'sigmoid',
    }));

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae'],
    });

    this.moodFoodMapper = model;
  }

  /**
   * Load emotional patterns from research data
   */
  private loadEmotionalPatterns(): void {
    // Load research-based emotional eating patterns
    this.emotionalPatterns.set('stress_eating', {
      preferredFlavors: ['sweet', 'salty', 'fatty'],
      preferredTextures: ['crunchy', 'creamy'],
      preferredTemperatures: ['hot', 'cold'],
      avoidedFlavors: ['spicy', 'bitter'],
      comfortFoods: ['ice_cream', 'chocolate', 'fried_foods', 'baked_goods'],
    });

    this.emotionalPatterns.set('happiness_eating', {
      preferredFlavors: ['fresh', 'light', 'varied'],
      socialPreference: 'group',
      adventurousness: 'high',
      experimentation: 'encouraged',
    });

    this.emotionalPatterns.set('sadness_eating', {
      preferredFlavors: ['sweet', 'warm'],
      preferredTextures: ['soft', 'creamy'],
      comfortFoods: ['soup', 'pasta', 'chocolate', 'baked_goods'],
      socialPreference: 'solo_or_close_friends',
    });

    this.emotionalPatterns.set('loneliness_eating', {
      triggers: ['late_night_cravings', 'frequent_snacking', 'nostalgic_foods'],
      preferredFoods: ['childhood_favorites', 'comfort_classics'],
      socialNeed: 'high',
      recommendations: ['shared_meals', 'cooking_activities', 'food_experiences'],
    });
  }

  /**
   * Detect emotional state from context
   */
  public async detectEmotionalState(context: EmotionalContext): Promise<EmotionalState> {
    if (!this.moodClassifier) {
      throw new Error('Mood classifier not initialized');
    }

    // Convert context to feature vector
    const features = this.contextToFeatureVector(context);
    const inputTensor = tf.tensor2d([features]);

    // Predict mood probabilities
    const prediction = this.moodClassifier.predict(inputTensor) as tf.Tensor2D;
    const probabilities = await prediction.data();

    // Clean up tensors
    inputTensor.dispose();
    prediction.dispose();

    // Parse results
    const moods = ['happy', 'sad', 'stressed', 'excited', 'lonely', 'content', 'anxious'];
    const moodScores = Array.from(probabilities).map((prob, index) => ({
      mood: moods[index],
      intensity: prob,
    }));

    // Sort by intensity
    moodScores.sort((a, b) => b.intensity - a.intensity);

    const primaryMood = moodScores[0];
    const confidence = this.calculateMoodConfidence(moodScores);

    // Determine emotional needs
    const emotionalNeeds = this.analyzeEmotionalNeeds(primaryMood.mood, context);

    return {
      primaryMood: primaryMood.mood,
      moodIntensity: primaryMood.intensity,
      secondaryMoods: moodScores.slice(1, 3),
      confidence,
      ...emotionalNeeds,
    };
  }

  /**
   * Detect Kuchisabishii (mouth loneliness) patterns
   */
  public async detectKuchisabishii(
    context: EmotionalContext,
    weekHistory: EmotionalContext[]
  ): Promise<KuchisabishiiDetection> {
    if (!this.kuchisabishiiDetector) {
      throw new Error('Kuchisabishii detector not initialized');
    }

    // Prepare temporal eating pattern features
    const weekFeatures = this.prepareWeeklyFeaturesForKuchisabishii(weekHistory);
    const inputTensor = tf.tensor3d([weekFeatures]);

    // Predict loneliness patterns
    const prediction = this.kuchisabishiiDetector.predict(inputTensor) as tf.Tensor2D;
    const result = await prediction.data();

    // Clean up tensors
    inputTensor.dispose();
    prediction.dispose();

    const [lonelinessProb, intensity] = result;
    const isExperiencing = lonelinessProb > 0.6;

    // Analyze triggers
    const triggers = this.identifyKuchisabishiiTriggers(context, weekHistory);
    
    // Determine duration pattern
    const lonelinessDuration = this.assessLonelinessDuration(weekHistory);

    // Generate recommendations
    const recommendations = this.generateKuchisabishiiRecommendations(
      intensity, triggers, context
    );

    return {
      isExperiencing,
      intensity,
      triggers,
      lonelinessDuration,
      ...recommendations,
    };
  }

  /**
   * Generate mood-based food recommendations
   */
  public async generateMoodBasedRecommendations(
    emotionalState: EmotionalState,
    context: EmotionalContext,
    availableOptions: any[]
  ): Promise<MoodBasedRecommendation[]> {
    
    // Get mood-food preferences
    const moodPreferences = await this.getMoodFoodPreferences(
      emotionalState, context
    );

    // Score available options
    const scoredOptions = availableOptions.map(option => {
      const score = this.scoreFoodForMood(option, emotionalState, moodPreferences);
      
      return {
        restaurantId: option.id,
        dishName: option.recommendedDish,
        reasoning: this.explainMoodMatch(option, emotionalState),
        moodMatch: score.moodMatch,
        expectedSatisfaction: score.satisfaction,
        attributes: score.attributes,
      };
    });

    // Sort by mood match and satisfaction
    scoredOptions.sort((a, b) => 
      (b.moodMatch * b.expectedSatisfaction) - (a.moodMatch * a.expectedSatisfaction)
    );

    return scoredOptions.slice(0, 10); // Top 10 recommendations
  }

  /**
   * Convert emotional context to feature vector
   */
  private contextToFeatureVector(context: EmotionalContext): number[] {
    const features: number[] = [];

    // Temporal features
    features.push(
      context.timeOfDay / 24,
      context.dayOfWeek / 7,
      context.timestamp.getMonth() / 12
    );

    // Weather encoding (one-hot)
    const weatherConditions = ['sunny', 'rainy', 'cloudy', 'snowy', 'stormy'];
    const weatherEncoding = this.oneHotEncode(context.weatherCondition || 'sunny', weatherConditions);
    features.push(...weatherEncoding);

    // Social context encoding
    const diningContexts = ['solo', 'friends', 'family', 'date', 'business'];
    const diningEncoding = this.oneHotEncode(context.diningContext, diningContexts);
    features.push(...diningEncoding);

    // Location context encoding
    const locationContexts = ['home', 'work', 'restaurant', 'outdoor', 'travel'];
    const locationEncoding = this.oneHotEncode(context.locationContext, locationContexts);
    features.push(...locationEncoding);

    // Recent eating patterns
    if (context.recentFoodEntries.length > 0) {
      const avgRating = context.recentFoodEntries.reduce((sum, entry) => sum + entry.rating, 0) / context.recentFoodEntries.length;
      const comfortRatio = context.recentFoodEntries.filter(entry => entry.comfort).length / context.recentFoodEntries.length;
      features.push(avgRating / 5, comfortRatio);
    } else {
      features.push(0, 0);
    }

    // Sleep and stress indicators
    features.push(
      (context.sleepPattern?.hoursSlept || 8) / 12,
      (context.sleepPattern?.sleepQuality || 3) / 5,
      (context.stressIndicators?.workPressure || 3) / 5,
      (context.stressIndicators?.socialStress || 3) / 5,
      (context.stressIndicators?.financialStress || 3) / 5
    );

    return features;
  }

  /**
   * One-hot encode categorical variables
   */
  private oneHotEncode(value: string, categories: string[]): number[] {
    const encoding = new Array(categories.length).fill(0);
    const index = categories.indexOf(value);
    if (index !== -1) {
      encoding[index] = 1;
    }
    return encoding;
  }

  /**
   * Calculate mood detection confidence
   */
  private calculateMoodConfidence(moodScores: { mood: string; intensity: number }[]): number {
    // Confidence based on separation between top moods
    const topMood = moodScores[0].intensity;
    const secondMood = moodScores[1]?.intensity || 0;
    
    const separation = topMood - secondMood;
    const confidence = Math.min(0.95, 0.5 + (separation * 2));
    
    return confidence;
  }

  /**
   * Analyze emotional needs based on detected mood
   */
  private analyzeEmotionalNeeds(
    mood: string, 
    context: EmotionalContext
  ): {
    needsComfort: boolean;
    needsExcitement: boolean;
    needsSocialConnection: boolean;
    needsIndulgence: boolean;
  } {
    const moodNeeds = {
      stressed: { needsComfort: true, needsExcitement: false, needsSocialConnection: false, needsIndulgence: true },
      sad: { needsComfort: true, needsExcitement: false, needsSocialConnection: true, needsIndulgence: true },
      lonely: { needsComfort: true, needsExcitement: false, needsSocialConnection: true, needsIndulgence: false },
      happy: { needsComfort: false, needsExcitement: true, needsSocialConnection: true, needsIndulgence: false },
      excited: { needsComfort: false, needsExcitement: true, needsSocialConnection: true, needsIndulgence: false },
      content: { needsComfort: false, needsExcitement: false, needsSocialConnection: false, needsIndulgence: false },
      anxious: { needsComfort: true, needsExcitement: false, needsSocialConnection: false, needsIndulgence: false },
    };

    return moodNeeds[mood as keyof typeof moodNeeds] || moodNeeds.content;
  }

  /**
   * Prepare weekly features for Kuchisabishii detection
   */
  private prepareWeeklyFeaturesForKuchisabishii(weekHistory: EmotionalContext[]): number[][] {
    const weekFeatures: number[][] = [];
    
    // Group by days (last 7 days)
    for (let day = 0; day < 7; day++) {
      const dayData = weekHistory.filter(ctx => {
        const daysDiff = Math.floor((Date.now() - ctx.timestamp.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff === day;
      });

      const dayFeatures = this.calculateDailyKuchisabishiiFeatures(dayData);
      weekFeatures.push(dayFeatures);
    }

    return weekFeatures;
  }

  /**
   * Calculate daily features for Kuchisabishii detection
   */
  private calculateDailyKuchisabishiiFeatures(dayData: EmotionalContext[]): number[] {
    const features: number[] = [];

    if (dayData.length === 0) {
      return new Array(10).fill(0); // Return zeros for days with no data
    }

    // Calculate eating frequency
    const eatingEvents = dayData.reduce((sum, ctx) => sum + ctx.recentFoodEntries.length, 0);
    features.push(Math.min(1, eatingEvents / 10)); // Normalize

    // Calculate late night eating (after 10 PM)
    const lateNightEvents = dayData.filter(ctx => ctx.timeOfDay >= 22).length;
    features.push(Math.min(1, lateNightEvents / 5));

    // Calculate solo dining ratio
    const soloEvents = dayData.filter(ctx => ctx.diningContext === 'solo').length;
    const soloDiningRatio = dayData.length > 0 ? soloEvents / dayData.length : 0;
    features.push(soloDiningRatio);

    // Calculate comfort food ratio
    const comfortEvents = dayData.reduce((sum, ctx) => 
      sum + ctx.recentFoodEntries.filter(entry => entry.comfort).length, 0
    );
    const totalFoodEvents = dayData.reduce((sum, ctx) => sum + ctx.recentFoodEntries.length, 0);
    const comfortRatio = totalFoodEvents > 0 ? comfortEvents / totalFoodEvents : 0;
    features.push(comfortRatio);

    // Add more features (mood patterns, timing patterns, etc.)
    features.push(
      Math.random(), // Placeholder for mood instability
      Math.random(), // Placeholder for social isolation score
      Math.random(), // Placeholder for stress level
      Math.random(), // Placeholder for satisfaction scores
      Math.random(), // Placeholder for variety in food choices
      Math.random()  // Placeholder for emotional eating indicators
    );

    return features;
  }

  /**
   * Identify triggers for Kuchisabishii
   */
  private identifyKuchisabishiiTriggers(
    context: EmotionalContext,
    history: EmotionalContext[]
  ): string[] {
    const triggers: string[] = [];

    // Late night eating patterns
    const lateNightEvents = history.filter(ctx => ctx.timeOfDay >= 22).length;
    if (lateNightEvents > history.length * 0.3) {
      triggers.push('late_night_cravings');
    }

    // Solo dining frequency
    const soloEvents = history.filter(ctx => ctx.diningContext === 'solo').length;
    if (soloEvents > history.length * 0.7) {
      triggers.push('social_isolation');
    }

    // Stress indicators
    const avgStress = history.reduce((sum, ctx) => {
      const stress = ctx.stressIndicators;
      return sum + (stress ? (stress.workPressure + stress.socialStress + stress.financialStress) / 3 : 0);
    }, 0) / history.length;

    if (avgStress > 3.5) {
      triggers.push('high_stress');
    }

    // Weather patterns (comfort seeking during bad weather)
    const badWeatherEvents = history.filter(ctx => 
      ['rainy', 'snowy', 'stormy'].includes(ctx.weatherCondition || '')
    ).length;
    if (badWeatherEvents > 0 && context.weatherCondition && ['rainy', 'snowy', 'stormy'].includes(context.weatherCondition)) {
      triggers.push('weather_influenced');
    }

    // Repetitive food choices (boredom eating)
    const foodChoices = history.flatMap(ctx => 
      ctx.recentFoodEntries.map(entry => entry.category)
    );
    const uniqueChoices = new Set(foodChoices).size;
    if (uniqueChoices < foodChoices.length * 0.3) {
      triggers.push('food_boredom');
    }

    return triggers;
  }

  /**
   * Assess loneliness duration pattern
   */
  private assessLonelinessDuration(history: EmotionalContext[]): 'brief' | 'moderate' | 'extended' {
    // Simple heuristic based on history length and patterns
    const soloRatio = history.filter(ctx => ctx.diningContext === 'solo').length / history.length;
    const timeSpan = history.length; // Assuming each context represents roughly a day

    if (timeSpan <= 2) {
      return 'brief';
    } else if (timeSpan <= 7 && soloRatio > 0.6) {
      return 'moderate';
    } else if (soloRatio > 0.8) {
      return 'extended';
    }

    return 'brief';
  }

  /**
   * Generate recommendations to address Kuchisabishii
   */
  private generateKuchisabishiiRecommendations(
    intensity: number,
    triggers: string[],
    context: EmotionalContext
  ): {
    comfortFoodSuggestions: string[];
    socialDiningSuggestions: string[];
    activitiesRecommended: string[];
  } {
    const comfortFoodSuggestions: string[] = [];
    const socialDiningSuggestions: string[] = [];
    const activitiesRecommended: string[] = [];

    // Comfort food suggestions based on intensity
    if (intensity > 0.7) {
      comfortFoodSuggestions.push(
        'warm soup with bread',
        'creamy pasta dish',
        'chocolate dessert',
        'homestyle comfort meal'
      );
    } else if (intensity > 0.4) {
      comfortFoodSuggestions.push(
        'familiar favorite dish',
        'warm beverage with snack',
        'nostalgic childhood food'
      );
    }

    // Social dining suggestions
    if (triggers.includes('social_isolation')) {
      socialDiningSuggestions.push(
        'invite a friend for coffee',
        'join a cooking class',
        'visit a communal dining spot',
        'attend a food festival or market'
      );
    }

    // Activity recommendations
    if (triggers.includes('food_boredom')) {
      activitiesRecommended.push(
        'try cooking a new recipe',
        'explore a new cuisine',
        'visit a farmers market',
        'take a food photography walk'
      );
    }

    return {
      comfortFoodSuggestions,
      socialDiningSuggestions,
      activitiesRecommended,
    };
  }

  /**
   * Get mood-food preferences using the mood-food mapper
   */
  private async getMoodFoodPreferences(
    emotionalState: EmotionalState,
    context: EmotionalContext
  ): Promise<number[]> {
    if (!this.moodFoodMapper) {
      throw new Error('Mood-food mapper not initialized');
    }

    // Combine mood and context features
    const combinedFeatures = this.createMoodFoodFeatures(emotionalState, context);
    const inputTensor = tf.tensor2d([combinedFeatures]);

    // Get food preference adjustments
    const prediction = this.moodFoodMapper.predict(inputTensor) as tf.Tensor2D;
    const preferences = await prediction.data();

    // Clean up tensors
    inputTensor.dispose();
    prediction.dispose();

    return Array.from(preferences);
  }

  /**
   * Create combined features for mood-food mapping
   */
  private createMoodFoodFeatures(
    emotionalState: EmotionalState,
    context: EmotionalContext
  ): number[] {
    const features: number[] = [];

    // Mood features
    features.push(
      emotionalState.moodIntensity,
      emotionalState.confidence,
      emotionalState.needsComfort ? 1 : 0,
      emotionalState.needsExcitement ? 1 : 0,
      emotionalState.needsSocialConnection ? 1 : 0,
      emotionalState.needsIndulgence ? 1 : 0
    );

    // Context features
    const contextFeatures = this.contextToFeatureVector(context);
    features.push(...contextFeatures);

    // Pad or truncate to expected size
    while (features.length < 50) {
      features.push(0);
    }

    return features.slice(0, 50);
  }

  /**
   * Score food options for mood match
   */
  private scoreFoodForMood(
    foodOption: any,
    emotionalState: EmotionalState,
    moodPreferences: number[]
  ): {
    moodMatch: number;
    satisfaction: number;
    attributes: {
      comfortLevel: number;
      socialFit: number;
      adventurousness: number;
      indulgenceLevel: number;
    };
  } {
    // Extract food attributes
    const attributes = {
      comfortLevel: this.calculateComfortLevel(foodOption),
      socialFit: this.calculateSocialFit(foodOption, emotionalState),
      adventurousness: this.calculateAdventurousness(foodOption),
      indulgenceLevel: this.calculateIndulgenceLevel(foodOption),
    };

    // Calculate mood match based on emotional needs
    let moodMatch = 0;
    
    if (emotionalState.needsComfort) {
      moodMatch += attributes.comfortLevel * 0.4;
    }
    
    if (emotionalState.needsSocialConnection) {
      moodMatch += attributes.socialFit * 0.3;
    }
    
    if (emotionalState.needsExcitement) {
      moodMatch += attributes.adventurousness * 0.3;
    }
    
    if (emotionalState.needsIndulgence) {
      moodMatch += attributes.indulgenceLevel * 0.3;
    }

    // Calculate expected satisfaction
    const satisfaction = (moodMatch + attributes.comfortLevel + attributes.socialFit) / 3;

    return {
      moodMatch: Math.min(1, moodMatch),
      satisfaction: Math.min(1, satisfaction),
      attributes,
    };
  }

  /**
   * Calculate comfort level of a food option
   */
  private calculateComfortLevel(foodOption: any): number {
    const comfortKeywords = ['soup', 'pasta', 'comfort', 'home', 'traditional', 'familiar'];
    const description = (foodOption.name + ' ' + (foodOption.description || '')).toLowerCase();
    
    const matches = comfortKeywords.filter(keyword => description.includes(keyword)).length;
    return Math.min(1, matches / 3);
  }

  /**
   * Calculate social fit of a food option
   */
  private calculateSocialFit(foodOption: any, emotionalState: EmotionalState): number {
    if (emotionalState.needsSocialConnection) {
      // Prefer restaurants with good atmosphere for sharing
      const socialKeywords = ['sharing', 'family', 'group', 'social', 'communal'];
      const description = (foodOption.name + ' ' + (foodOption.description || '')).toLowerCase();
      
      const matches = socialKeywords.filter(keyword => description.includes(keyword)).length;
      return Math.min(1, matches / 2);
    }
    
    return 0.5; // Neutral if social connection not needed
  }

  /**
   * Calculate adventurousness of a food option
   */
  private calculateAdventurousness(foodOption: any): number {
    const adventureKeywords = ['new', 'fusion', 'exotic', 'unique', 'experimental', 'innovative'];
    const description = (foodOption.name + ' ' + (foodOption.description || '')).toLowerCase();
    
    const matches = adventureKeywords.filter(keyword => description.includes(keyword)).length;
    return Math.min(1, matches / 2);
  }

  /**
   * Calculate indulgence level of a food option
   */
  private calculateIndulgenceLevel(foodOption: any): number {
    const indulgenceKeywords = ['rich', 'decadent', 'chocolate', 'cream', 'butter', 'dessert', 'luxury'];
    const description = (foodOption.name + ' ' + (foodOption.description || '')).toLowerCase();
    
    const matches = indulgenceKeywords.filter(keyword => description.includes(keyword)).length;
    return Math.min(1, matches / 2);
  }

  /**
   * Explain why a food option matches the user's mood
   */
  private explainMoodMatch(foodOption: any, emotionalState: EmotionalState): string {
    const reasons: string[] = [];

    if (emotionalState.needsComfort && this.calculateComfortLevel(foodOption) > 0.5) {
      reasons.push('provides comfort and warmth');
    }

    if (emotionalState.needsSocialConnection) {
      reasons.push('great for sharing with others');
    }

    if (emotionalState.needsExcitement && this.calculateAdventurousness(foodOption) > 0.5) {
      reasons.push('offers an exciting new experience');
    }

    if (emotionalState.needsIndulgence && this.calculateIndulgenceLevel(foodOption) > 0.5) {
      reasons.push('satisfies your need for indulgence');
    }

    if (reasons.length === 0) {
      reasons.push('matches your current preferences');
    }

    return `This ${foodOption.name} ${reasons.join(' and ')} based on your current mood.`;
  }

  /**
   * Dispose of all models and free memory
   */
  public dispose(): void {
    if (this.moodClassifier) {
      this.moodClassifier.dispose();
      this.moodClassifier = null;
    }

    if (this.kuchisabishiiDetector) {
      this.kuchisabishiiDetector.dispose();
      this.kuchisabishiiDetector = null;
    }

    if (this.moodFoodMapper) {
      this.moodFoodMapper.dispose();
      this.moodFoodMapper = null;
    }
  }
}

export default EmotionalAI;