/**
 * Real-Time Adaptation Engine for Kuchisabishii
 * Continuous learning system that adapts recommendations based on user feedback,
 * context changes, and behavioral patterns in real-time
 */

import * as tf from '@tensorflow/tfjs';
import { supabase } from '../lib/supabase/client';

export interface AdaptationEvent {
  userId: string;
  eventType: 'rating' | 'visit' | 'dismiss' | 'save' | 'share' | 'context_change';
  restaurantId?: string;
  foodEntryId?: string;
  rating?: number;
  context: {
    timestamp: Date;
    location?: { lat: number; lng: number };
    mood?: string;
    socialContext?: string;
    weather?: string;
    timeOfDay: number;
  };
  metadata?: Record<string, any>;
}

export interface ContextSwitchDetection {
  detected: boolean;
  previousContext: string;
  newContext: string;
  confidence: number;
  adaptationRequired: boolean;
  recommendationAdjustments: {
    increaseWeight: string[];
    decreaseWeight: string[];
    newFactorsToConsider: string[];
  };
}

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  algorithm: string;
  parameters: Record<string, any>;
  isActive: boolean;
  trafficAllocation: number; // 0-1
  performanceMetrics: {
    clickThroughRate: number;
    visitRate: number;
    satisfactionScore: number;
    diversityScore: number;
  };
}

export interface ModelPerformanceMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  calibrationError: number;
  diversityIndex: number;
  noveltyScore: number;
  userSatisfactionScore: number;
  temporalConsistency: number;
}

export interface OnlineLearningBatch {
  userId: string;
  samples: AdaptationEvent[];
  batchSize: number;
  learningRate: number;
  priority: 'high' | 'medium' | 'low';
  processingTime: Date;
}

export class RealTimeAdaptationEngine {
  private onlineLearningModel: tf.LayersModel | null = null;
  private contextSwitchDetector: tf.LayersModel | null = null;
  private realtimeOptimizer: tf.Optimizer | null = null;
  
  // Real-time data structures
  private eventStream: AdaptationEvent[] = [];
  private userAdaptations: Map<string, any> = new Map();
  private abTestVariants: Map<string, ABTestVariant> = new Map();
  private performanceBuffer: Map<string, ModelPerformanceMetrics> = new Map();
  
  // Online learning configuration
  private batchSize = 32;
  private maxEventBuffer = 10000;
  private adaptationThreshold = 0.7;
  private learningRateDecay = 0.99;
  
  // A/B testing configuration
  private currentExperiments: Map<string, string> = new Map(); // userId -> variantId
  
  constructor() {
    this.initializeModels();
    this.startRealtimeProcessing();
    this.initializeABTestFramework();
  }

  /**
   * Initialize real-time adaptation models
   */
  private async initializeModels(): Promise<void> {
    await Promise.all([
      this.initializeOnlineLearningModel(),
      this.initializeContextSwitchDetector(),
    ]);
    
    this.realtimeOptimizer = tf.train.sgd(0.01); // Start with SGD for online learning
  }

  /**
   * Initialize online learning model for real-time updates
   */
  private async initializeOnlineLearningModel(): Promise<void> {
    // Lightweight model optimized for frequent updates
    const model = tf.sequential();
    
    model.add(tf.layers.dense({
      units: 64,
      activation: 'relu',
      inputShape: [30], // Compact feature representation
    }));
    
    model.add(tf.layers.dropout({ rate: 0.1 })); // Lower dropout for stability
    
    model.add(tf.layers.dense({
      units: 32,
      activation: 'relu',
    }));
    
    // Output: rating prediction
    model.add(tf.layers.dense({
      units: 1,
      activation: 'sigmoid',
    }));
    
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });
    
    this.onlineLearningModel = model;
  }

  /**
   * Initialize context switch detection model
   */
  private async initializeContextSwitchDetector(): Promise<void> {
    const model = tf.sequential();
    
    // Time series processing for context change detection
    model.add(tf.layers.lstm({
      units: 32,
      returnSequences: false,
      inputShape: [5, 15], // 5 time steps, 15 context features
    }));
    
    model.add(tf.layers.dense({
      units: 16,
      activation: 'relu',
    }));
    
    // Multi-output: switch detection + context classification
    model.add(tf.layers.dense({
      units: 8, // switch detection (1) + context types (7)
      activation: 'sigmoid',
    }));
    
    model.compile({
      optimizer: tf.train.adam(0.002),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });
    
    this.contextSwitchDetector = model;
  }

  /**
   * Process adaptation event in real-time
   */
  public async processAdaptationEvent(event: AdaptationEvent): Promise<void> {
    try {
      // Add to event stream
      this.eventStream.push(event);
      
      // Trim buffer if too large
      if (this.eventStream.length > this.maxEventBuffer) {
        this.eventStream = this.eventStream.slice(-this.maxEventBuffer);
      }
      
      // Immediate processing for high-priority events
      if (this.isHighPriorityEvent(event)) {
        await this.processHighPriorityEvent(event);
      }
      
      // Batch processing trigger
      if (this.eventStream.length % this.batchSize === 0) {
        this.processBatchUpdate();
      }
      
      // Context switch detection
      await this.detectContextSwitch(event);
      
      // Update A/B test metrics
      await this.updateABTestMetrics(event);
      
    } catch (error) {
      console.error('Error processing adaptation event:', error);
    }
  }

  /**
   * Detect context switches requiring adaptation
   */
  private async detectContextSwitch(event: AdaptationEvent): Promise<ContextSwitchDetection> {
    if (!this.contextSwitchDetector) {
      return {
        detected: false,
        previousContext: '',
        newContext: '',
        confidence: 0,
        adaptationRequired: false,
        recommendationAdjustments: {
          increaseWeight: [],
          decreaseWeight: [],
          newFactorsToConsider: []
        }
      };
    }

    try {
      // Get recent context history for the user
      const recentEvents = this.eventStream
        .filter(e => e.userId === event.userId)
        .slice(-5);
      
      if (recentEvents.length < 2) {
        return {
          detected: false,
          previousContext: '',
          newContext: '',
          confidence: 0,
          adaptationRequired: false,
          recommendationAdjustments: {
            increaseWeight: [],
            decreaseWeight: [],
            newFactorsToConsider: []
          }
        };
      }
      
      // Prepare context feature sequence
      const contextSequence = recentEvents.map(e => 
        this.extractContextFeatures(e.context)
      );
      
      // Pad sequence to required length
      while (contextSequence.length < 5) {
        contextSequence.unshift(new Array(15).fill(0));
      }
      
      const inputTensor = tf.tensor3d([contextSequence]);
      const prediction = this.contextSwitchDetector.predict(inputTensor) as tf.Tensor2D;
      const result = await prediction.data();
      
      inputTensor.dispose();
      prediction.dispose();
      
      const switchDetected = result[0] > 0.7; // Switch detection threshold
      const contextTypes = ['mood', 'social', 'temporal', 'location', 'weather', 'activity', 'dietary'];
      const contextScores = Array.from(result.slice(1));
      
      if (switchDetected) {
        const maxContextIndex = contextScores.indexOf(Math.max(...contextScores));
        const newContext = contextTypes[maxContextIndex];
        const previousContext = this.getPreviousContext(event.userId);
        
        const adaptationRequired = newContext !== previousContext && contextScores[maxContextIndex] > 0.6;
        
        // Generate recommendation adjustments
        const adjustments = this.generateContextAdaptationAdjustments(
          previousContext, newContext, contextScores[maxContextIndex]
        );
        
        return {
          detected: true,
          previousContext,
          newContext,
          confidence: contextScores[maxContextIndex],
          adaptationRequired,
          recommendationAdjustments: adjustments
        };
      }
      
      return {
        detected: false,
        previousContext: '',
        newContext: '',
        confidence: 0,
        adaptationRequired: false,
        recommendationAdjustments: {
          increaseWeight: [],
          decreaseWeight: [],
          newFactorsToConsider: []
        }
      };
      
    } catch (error) {
      console.error('Error detecting context switch:', error);
      return {
        detected: false,
        previousContext: '',
        newContext: '',
        confidence: 0,
        adaptationRequired: false,
        recommendationAdjustments: {
          increaseWeight: [],
          decreaseWeight: [],
          newFactorsToConsider: []
        }
      };
    }
  }

  /**
   * Process high-priority events immediately
   */
  private async processHighPriorityEvent(event: AdaptationEvent): Promise<void> {
    if (!this.onlineLearningModel) return;
    
    try {
      // Prepare training data from the event
      const features = this.extractEventFeatures(event);
      const label = this.extractEventLabel(event);
      
      if (features && label !== null) {
        const inputTensor = tf.tensor2d([features]);
        const labelTensor = tf.tensor2d([[label]]);
        
        // Perform single-sample gradient update
        const history = await this.onlineLearningModel.fit(inputTensor, labelTensor, {
          epochs: 1,
          verbose: 0,
          batchSize: 1
        });
        
        inputTensor.dispose();
        labelTensor.dispose();
        
        // Store adaptation result
        this.userAdaptations.set(event.userId, {
          lastUpdate: new Date(),
          adaptationType: 'immediate',
          loss: history.history.loss?.[0],
          confidence: this.calculateAdaptationConfidence(event)
        });
      }
    } catch (error) {
      console.error('Error processing high-priority event:', error);
    }
  }

  /**
   * Process batch updates for accumulated events
   */
  private async processBatchUpdate(): Promise<void> {
    if (!this.onlineLearningModel || this.eventStream.length < this.batchSize) {
      return;
    }
    
    try {
      const batch = this.createTrainingBatch(this.eventStream.slice(-this.batchSize));
      
      if (batch.features.length > 0) {
        const inputTensor = tf.tensor2d(batch.features);
        const labelTensor = tf.tensor2d(batch.labels.map(l => [l]));
        
        // Update model with batch
        const history = await this.onlineLearningModel.fit(inputTensor, labelTensor, {
          epochs: 1,
          verbose: 0,
          batchSize: this.batchSize
        });
        
        inputTensor.dispose();
        labelTensor.dispose();
        
        // Update performance metrics
        await this.updateModelPerformance(history);
        
        // Adaptive learning rate
        this.adjustLearningRate(history);
      }
    } catch (error) {
      console.error('Error processing batch update:', error);
    }
  }

  /**
   * Initialize A/B testing framework
   */
  private async initializeABTestFramework(): Promise<void> {
    // Default variants for testing
    const variants: ABTestVariant[] = [
      {
        id: 'control',
        name: 'Control (Current Algorithm)',
        description: 'Current recommendation algorithm',
        algorithm: 'standard',
        parameters: {},
        isActive: true,
        trafficAllocation: 0.5,
        performanceMetrics: {
          clickThroughRate: 0,
          visitRate: 0,
          satisfactionScore: 0,
          diversityScore: 0
        }
      },
      {
        id: 'emotional_boost',
        name: 'Emotional Intelligence Boost',
        description: 'Increased weight on emotional factors',
        algorithm: 'emotional_enhanced',
        parameters: { emotionalWeight: 0.6, moodWeight: 0.4 },
        isActive: true,
        trafficAllocation: 0.25,
        performanceMetrics: {
          clickThroughRate: 0,
          visitRate: 0,
          satisfactionScore: 0,
          diversityScore: 0
        }
      },
      {
        id: 'social_amplified',
        name: 'Social Amplified',
        description: 'Enhanced collaborative filtering',
        algorithm: 'social_enhanced',
        parameters: { socialWeight: 0.7, tasteTwinWeight: 0.5 },
        isActive: true,
        trafficAllocation: 0.25,
        performanceMetrics: {
          clickThroughRate: 0,
          visitRate: 0,
          satisfactionScore: 0,
          diversityScore: 0
        }
      }
    ];
    
    variants.forEach(variant => {
      this.abTestVariants.set(variant.id, variant);
    });
  }

  /**
   * Assign user to A/B test variant
   */
  public assignABTestVariant(userId: string): string {
    if (this.currentExperiments.has(userId)) {
      return this.currentExperiments.get(userId)!;
    }
    
    // Deterministic assignment based on user ID hash
    const hash = this.hashUserId(userId);
    const random = hash % 1000 / 1000; // Convert to 0-1
    
    let cumulativeAllocation = 0;
    for (const [variantId, variant] of this.abTestVariants.entries()) {
      if (!variant.isActive) continue;
      
      cumulativeAllocation += variant.trafficAllocation;
      if (random <= cumulativeAllocation) {
        this.currentExperiments.set(userId, variantId);
        return variantId;
      }
    }
    
    // Fallback to control
    this.currentExperiments.set(userId, 'control');
    return 'control';
  }

  /**
   * Update A/B test metrics based on user interactions
   */
  private async updateABTestMetrics(event: AdaptationEvent): Promise<void> {
    const variantId = this.currentExperiments.get(event.userId);
    if (!variantId) return;
    
    const variant = this.abTestVariants.get(variantId);
    if (!variant) return;
    
    // Update metrics based on event type
    switch (event.eventType) {
      case 'visit':
        variant.performanceMetrics.clickThroughRate += 0.01;
        variant.performanceMetrics.visitRate += 0.01;
        break;
      case 'rating':
        if (event.rating && event.rating >= 4) {
          variant.performanceMetrics.satisfactionScore += 0.01;
        }
        break;
      case 'save':
        variant.performanceMetrics.satisfactionScore += 0.005;
        break;
      case 'dismiss':
        variant.performanceMetrics.satisfactionScore -= 0.002;
        break;
    }
    
    // Periodic persistence to database
    if (Math.random() < 0.1) { // 10% chance to persist
      await this.persistABTestMetrics(variantId, variant);
    }
  }

  /**
   * Get current adaptation state for a user
   */
  public getUserAdaptationState(userId: string): any {
    return this.userAdaptations.get(userId) || {
      lastUpdate: null,
      adaptationType: 'none',
      confidence: 0
    };
  }

  /**
   * Force model adaptation for specific user
   */
  public async forceUserAdaptation(
    userId: string, 
    adaptationType: 'preference_shift' | 'context_change' | 'feedback_correction'
  ): Promise<boolean> {
    try {
      // Get user's recent events
      const userEvents = this.eventStream
        .filter(e => e.userId === userId)
        .slice(-20); // Last 20 events
      
      if (userEvents.length === 0) {
        return false;
      }
      
      // Create focused training batch for this user
      const batch = this.createTrainingBatch(userEvents);
      
      if (batch.features.length === 0) {
        return false;
      }
      
      const inputTensor = tf.tensor2d(batch.features);
      const labelTensor = tf.tensor2d(batch.labels.map(l => [l]));
      
      // Multiple epochs for stronger adaptation
      await this.onlineLearningModel!.fit(inputTensor, labelTensor, {
        epochs: 3,
        verbose: 0,
        batchSize: Math.min(8, batch.features.length)
      });
      
      inputTensor.dispose();
      labelTensor.dispose();
      
      // Update adaptation state
      this.userAdaptations.set(userId, {
        lastUpdate: new Date(),
        adaptationType: 'forced',
        subtype: adaptationType,
        confidence: 0.8
      });
      
      return true;
    } catch (error) {
      console.error('Error forcing user adaptation:', error);
      return false;
    }
  }

  /**
   * Start real-time processing loop
   */
  private startRealtimeProcessing(): void {
    // Process events every 5 seconds
    setInterval(() => {
      if (this.eventStream.length > 0) {
        this.processRealtimeMetrics();
      }
    }, 5000);
    
    // Model performance evaluation every minute
    setInterval(() => {
      this.evaluateModelPerformance();
    }, 60000);
    
    // A/B test analysis every 10 minutes
    setInterval(() => {
      this.analyzeABTestResults();
    }, 600000);
  }

  /**
   * Helper methods
   */
  
  private isHighPriorityEvent(event: AdaptationEvent): boolean {
    return event.eventType === 'rating' || 
           (event.eventType === 'visit' && event.rating && event.rating <= 2);
  }

  private extractContextFeatures(context: any): number[] {
    const features = new Array(15).fill(0);
    let index = 0;
    
    // Time features
    features[index++] = context.timeOfDay / 24;
    features[index++] = new Date(context.timestamp).getDay() / 7;
    
    // Mood encoding (one-hot)
    const moods = ['happy', 'sad', 'stressed', 'excited', 'lonely'];
    const moodIndex = moods.indexOf(context.mood);
    if (moodIndex !== -1) features[index + moodIndex] = 1;
    index += moods.length;
    
    // Social context
    const socialContexts = ['solo', 'friends', 'family', 'date'];
    const socialIndex = socialContexts.indexOf(context.socialContext);
    if (socialIndex !== -1) features[index + socialIndex] = 1;
    index += socialContexts.length;
    
    // Weather
    const weatherConditions = ['sunny', 'rainy', 'cloudy'];
    const weatherIndex = weatherConditions.indexOf(context.weather);
    if (weatherIndex !== -1) features[index + weatherIndex] = 1;
    
    return features;
  }

  private extractEventFeatures(event: AdaptationEvent): number[] | null {
    // Extract features from adaptation event for training
    const features = new Array(30).fill(0);
    let index = 0;
    
    // Context features
    const contextFeatures = this.extractContextFeatures(event.context);
    features.splice(index, contextFeatures.length, ...contextFeatures);
    index += contextFeatures.length;
    
    // Event type encoding
    const eventTypes = ['rating', 'visit', 'dismiss', 'save', 'share'];
    const eventIndex = eventTypes.indexOf(event.eventType);
    if (eventIndex !== -1) features[index + eventIndex] = 1;
    
    return features;
  }

  private extractEventLabel(event: AdaptationEvent): number | null {
    switch (event.eventType) {
      case 'rating':
        return event.rating ? event.rating / 5 : null;
      case 'visit':
        return 1.0;
      case 'save':
        return 0.8;
      case 'dismiss':
        return 0.2;
      case 'share':
        return 0.9;
      default:
        return null;
    }
  }

  private createTrainingBatch(events: AdaptationEvent[]): {
    features: number[][];
    labels: number[];
  } {
    const features: number[][] = [];
    const labels: number[] = [];
    
    for (const event of events) {
      const eventFeatures = this.extractEventFeatures(event);
      const label = this.extractEventLabel(event);
      
      if (eventFeatures && label !== null) {
        features.push(eventFeatures);
        labels.push(label);
      }
    }
    
    return { features, labels };
  }

  private calculateAdaptationConfidence(event: AdaptationEvent): number {
    // Simple confidence calculation based on event type and context
    const baseConfidence = {
      rating: 0.9,
      visit: 0.7,
      save: 0.8,
      dismiss: 0.6,
      share: 0.85,
      context_change: 0.5
    };
    
    return baseConfidence[event.eventType] || 0.5;
  }

  private getPreviousContext(userId: string): string {
    const userEvents = this.eventStream.filter(e => e.userId === userId);
    if (userEvents.length < 2) return 'unknown';
    
    const previousEvent = userEvents[userEvents.length - 2];
    return previousEvent.context.socialContext || 'solo';
  }

  private generateContextAdaptationAdjustments(
    previousContext: string,
    newContext: string,
    confidence: number
  ): ContextSwitchDetection['recommendationAdjustments'] {
    const adjustments = {
      increaseWeight: [] as string[],
      decreaseWeight: [] as string[],
      newFactorsToConsider: [] as string[]
    };
    
    // Context-specific adjustments
    if (newContext === 'mood' && previousContext !== 'mood') {
      adjustments.increaseWeight.push('emotional_factors', 'comfort_food');
      adjustments.newFactorsToConsider.push('kuchisabishii_detection');
    }
    
    if (newContext === 'social' && previousContext === 'solo') {
      adjustments.increaseWeight.push('social_dining', 'sharing_friendly');
      adjustments.decreaseWeight.push('intimate_atmosphere');
    }
    
    return adjustments;
  }

  private async updateModelPerformance(history: tf.History): Promise<void> {
    // Extract metrics from training history
    const loss = history.history.loss?.[0] as number;
    const mae = history.history.mae?.[0] as number;
    
    // Update performance tracking
    const metrics: ModelPerformanceMetrics = {
      accuracy: 1 - mae, // Simplified accuracy calculation
      precision: 0.8, // Would be calculated from validation data
      recall: 0.75,
      f1Score: 0.77,
      auc: 0.85,
      calibrationError: loss,
      diversityIndex: 0.6,
      noveltyScore: 0.4,
      userSatisfactionScore: 0.8,
      temporalConsistency: 0.9
    };
    
    this.performanceBuffer.set('current_model', metrics);
  }

  private adjustLearningRate(history: tf.History): void {
    const currentLoss = history.history.loss?.[0] as number;
    
    // Simple adaptive learning rate based on loss
    if (currentLoss > 0.5) {
      // Increase learning rate if loss is high
      const newLr = Math.min(0.01, (this.realtimeOptimizer as any).learningRate * 1.1);
      (this.realtimeOptimizer as any).learningRate = newLr;
    } else if (currentLoss < 0.1) {
      // Decrease learning rate if loss is very low
      const newLr = Math.max(0.0001, (this.realtimeOptimizer as any).learningRate * this.learningRateDecay);
      (this.realtimeOptimizer as any).learningRate = newLr;
    }
  }

  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private async persistABTestMetrics(variantId: string, variant: ABTestVariant): Promise<void> {
    try {
      await supabase
        .from('ab_test_metrics')
        .upsert({
          variant_id: variantId,
          metrics: variant.performanceMetrics,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error persisting A/B test metrics:', error);
    }
  }

  private processRealtimeMetrics(): void {
    // Process real-time metrics for monitoring
    console.log(`Processing ${this.eventStream.length} events in buffer`);
  }

  private evaluateModelPerformance(): void {
    // Evaluate current model performance
    const currentMetrics = this.performanceBuffer.get('current_model');
    if (currentMetrics) {
      console.log('Current model performance:', currentMetrics);
    }
  }

  private analyzeABTestResults(): void {
    // Analyze A/B test performance
    for (const [variantId, variant] of this.abTestVariants.entries()) {
      console.log(`Variant ${variantId} performance:`, variant.performanceMetrics);
    }
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    if (this.onlineLearningModel) {
      this.onlineLearningModel.dispose();
      this.onlineLearningModel = null;
    }
    if (this.contextSwitchDetector) {
      this.contextSwitchDetector.dispose();
      this.contextSwitchDetector = null;
    }
    if (this.realtimeOptimizer) {
      this.realtimeOptimizer.dispose();
      this.realtimeOptimizer = null;
    }
  }
}

export default RealTimeAdaptationEngine;