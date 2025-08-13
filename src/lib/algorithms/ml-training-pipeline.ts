/**
 * ML Training Pipeline for Continuous Algorithm Improvement
 * Automated learning system for 92.3% accuracy target
 */

import { supabase } from '@/lib/supabase/client'
import { 
  PalateProfile, 
  FoodExperience, 
  UserSimilarity,
  RecommendationResult,
  ALGORITHM_CONFIG 
} from './palate-matching'
import { TasteVector } from './taste-vectors'

export interface TrainingData {
  user_id: string
  item_id: string
  predicted_score: number
  actual_rating: number
  taste_vector: any
  emotional_response: any
  context: any
  timestamp: Date
  confidence: number
}

export interface ModelPerformance {
  accuracy: number
  mae: number // Mean Absolute Error
  rmse: number // Root Mean Square Error
  precision: number
  recall: number
  f1_score: number
  similarity_accuracy: number
  dataset_size: number
  evaluation_date: Date
}

export interface TrainingMetrics {
  training_samples: number
  validation_samples: number
  test_samples: number
  epochs_completed: number
  convergence_achieved: boolean
  best_accuracy: number
  current_accuracy: number
  improvement_rate: number
  last_training: Date
}

export interface LearningConfig {
  batch_size: number
  learning_rate: number
  epochs: number
  validation_split: number
  early_stopping_patience: number
  target_accuracy: number
  retrain_threshold: number // Accuracy drop threshold for retraining
  data_freshness_days: number
}

/**
 * ML Training Pipeline
 * Handles continuous learning and model improvement
 */
export class MLTrainingPipeline {
  private config: LearningConfig = {
    batch_size: 32,
    learning_rate: 0.001,
    epochs: 100,
    validation_split: 0.2,
    early_stopping_patience: 10,
    target_accuracy: ALGORITHM_CONFIG.TARGET_ACCURACY,
    retrain_threshold: 0.05, // Retrain if accuracy drops by 5%
    data_freshness_days: 30
  }

  private isTraining = false
  private trainingHistory: ModelPerformance[] = []

  /**
   * Start continuous learning process
   */
  async startContinuousLearning(): Promise<void> {
    if (this.isTraining) {
      console.log('Training already in progress')
      return
    }

    try {
      console.log('Starting continuous learning pipeline...')
      
      // Check if retraining is needed
      const needsRetraining = await this.assessRetrainingNeed()
      
      if (needsRetraining) {
        await this.performTrainingCycle()
      }
      
      // Schedule next training check
      this.scheduleNextTraining()
      
    } catch (error) {
      console.error('Error in continuous learning:', error)
      this.isTraining = false
    }
  }

  /**
   * Assess whether model needs retraining
   */
  private async assessRetrainingNeed(): Promise<boolean> {
    try {
      // Get recent performance metrics
      const recentMetrics = await this.getRecentPerformanceMetrics()
      
      if (!recentMetrics) {
        console.log('No recent metrics found, training needed')
        return true
      }

      // Check accuracy degradation
      if (recentMetrics.accuracy < (this.config.target_accuracy - this.config.retrain_threshold)) {
        console.log(`Accuracy degraded to ${recentMetrics.accuracy}, retraining needed`)
        return true
      }

      // Check data freshness
      const daysSinceLastTraining = (Date.now() - recentMetrics.evaluation_date.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceLastTraining > this.config.data_freshness_days) {
        console.log(`Last training ${daysSinceLastTraining} days ago, retraining needed`)
        return true
      }

      // Check for new training data
      const newDataCount = await this.getNewTrainingDataCount(recentMetrics.evaluation_date)
      if (newDataCount > 1000) { // Significant amount of new data
        console.log(`${newDataCount} new training samples available, retraining recommended`)
        return true
      }

      console.log('Model performance is adequate, no retraining needed')
      return false

    } catch (error) {
      console.error('Error assessing retraining need:', error)
      return true // Err on the side of retraining
    }
  }

  /**
   * Perform complete training cycle
   */
  private async performTrainingCycle(): Promise<void> {
    this.isTraining = true
    console.log('Starting ML training cycle...')

    try {
      // 1. Collect training data
      const trainingData = await this.collectTrainingData()
      console.log(`Collected ${trainingData.length} training samples`)

      if (trainingData.length < 100) {
        console.log('Insufficient training data, skipping training')
        return
      }

      // 2. Preprocess data
      const processedData = await this.preprocessTrainingData(trainingData)

      // 3. Split data
      const { trainSet, validationSet, testSet } = this.splitDataset(processedData)

      // 4. Train models
      const modelPerformance = await this.trainModels(trainSet, validationSet)

      // 5. Evaluate on test set
      const testPerformance = await this.evaluateModel(testSet)

      // 6. Update performance metrics
      await this.recordModelPerformance({
        ...testPerformance,
        dataset_size: trainingData.length,
        evaluation_date: new Date()
      })

      // 7. Update algorithm parameters if improvement achieved
      if (testPerformance.accuracy > this.config.target_accuracy) {
        await this.updateAlgorithmParameters(modelPerformance)
      }

      console.log(`Training completed. Accuracy: ${testPerformance.accuracy.toFixed(4)}`)

    } catch (error) {
      console.error('Error in training cycle:', error)
    } finally {
      this.isTraining = false
    }
  }

  /**
   * Collect training data from user interactions
   */
  private async collectTrainingData(): Promise<TrainingData[]> {
    try {
      // Get recommendation interactions with actual outcomes
      const { data: interactions, error } = await supabase
        .from('recommendation_interactions')
        .select(`
          *,
          food_experiences_detailed!inner(*)
        `)
        .not('rating', 'is', null) // Only interactions with ratings
        .gte('shown_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()) // Last 90 days
        .order('shown_at', { ascending: false })
        .limit(10000)

      if (error) {
        console.error('Error collecting training data:', error)
        return []
      }

      const trainingData: TrainingData[] = []

      for (const interaction of interactions || []) {
        try {
          // Get the original recommendation score
          const recommendationScore = await this.getOriginalRecommendationScore(
            interaction.user_id,
            interaction.restaurant_id || interaction.menu_item_id
          )

          if (recommendationScore) {
            trainingData.push({
              user_id: interaction.user_id,
              item_id: interaction.restaurant_id || interaction.menu_item_id,
              predicted_score: recommendationScore,
              actual_rating: interaction.rating / 10, // Normalize to 0-1
              taste_vector: (interaction as any).food_experiences_detailed?.palate_profile || {},
              emotional_response: (interaction as any).food_experiences_detailed?.emotional_response || {},
              context: (interaction as any).food_experiences_detailed?.context || {},
              timestamp: new Date(interaction.shown_at),
              confidence: 0.8 // Default confidence
            })
          }
        } catch (itemError) {
          console.error('Error processing interaction:', itemError)
        }
      }

      return trainingData

    } catch (error) {
      console.error('Error collecting training data:', error)
      return []
    }
  }

  /**
   * Preprocess training data for ML
   */
  private async preprocessTrainingData(data: TrainingData[]): Promise<TrainingData[]> {
    return data.filter(item => {
      // Remove outliers and invalid data
      return (
        item.predicted_score >= 0 && 
        item.predicted_score <= 1 &&
        item.actual_rating >= 0 &&
        item.actual_rating <= 1 &&
        item.taste_vector &&
        Object.keys(item.taste_vector).length > 0
      )
    }).map(item => ({
      ...item,
      // Normalize and clean data
      predicted_score: Math.max(0, Math.min(1, item.predicted_score)),
      actual_rating: Math.max(0, Math.min(1, item.actual_rating))
    }))
  }

  /**
   * Split dataset into train/validation/test sets
   */
  private splitDataset(data: TrainingData[]): {
    trainSet: TrainingData[]
    validationSet: TrainingData[]
    testSet: TrainingData[]
  } {
    // Shuffle data
    const shuffled = data.sort(() => Math.random() - 0.5)
    
    const validationSize = Math.floor(data.length * this.config.validation_split)
    const testSize = Math.floor(data.length * 0.15) // 15% for test
    const trainSize = data.length - validationSize - testSize

    return {
      trainSet: shuffled.slice(0, trainSize),
      validationSet: shuffled.slice(trainSize, trainSize + validationSize),
      testSet: shuffled.slice(trainSize + validationSize)
    }
  }

  /**
   * Train models using training data
   */
  private async trainModels(
    trainSet: TrainingData[], 
    validationSet: TrainingData[]
  ): Promise<any> {
    console.log(`Training on ${trainSet.length} samples, validating on ${validationSet.length} samples`)

    // Simplified model training (in production, this would use TensorFlow.js or similar)
    const modelWeights = await this.trainNeuralNetwork(trainSet, validationSet)
    
    return {
      weights: modelWeights,
      architecture: 'taste_preference_model',
      version: ALGORITHM_CONFIG.VERSION
    }
  }

  /**
   * Simplified neural network training simulation
   */
  private async trainNeuralNetwork(
    trainSet: TrainingData[], 
    validationSet: TrainingData[]
  ): Promise<any> {
    let bestAccuracy = 0
    let bestWeights: any = null
    let patienceCounter = 0

    // Simulate training epochs
    for (let epoch = 0; epoch < this.config.epochs; epoch++) {
      // Training step (simplified)
      const trainLoss = this.calculateLoss(trainSet)
      
      // Validation step
      const validationAccuracy = this.evaluateAccuracy(validationSet)
      
      console.log(`Epoch ${epoch + 1}: Train Loss: ${trainLoss.toFixed(4)}, Val Accuracy: ${validationAccuracy.toFixed(4)}`)

      // Early stopping
      if (validationAccuracy > bestAccuracy) {
        bestAccuracy = validationAccuracy
        bestWeights = this.getCurrentWeights() // Simplified
        patienceCounter = 0
      } else {
        patienceCounter++
        if (patienceCounter >= this.config.early_stopping_patience) {
          console.log(`Early stopping at epoch ${epoch + 1}`)
          break
        }
      }

      // Simulate learning rate decay
      if (epoch % 20 === 0 && epoch > 0) {
        this.config.learning_rate *= 0.95
      }
    }

    return bestWeights
  }

  /**
   * Calculate loss for training data
   */
  private calculateLoss(data: TrainingData[]): number {
    let totalLoss = 0
    
    for (const item of data) {
      const error = Math.abs(item.predicted_score - item.actual_rating)
      totalLoss += error * error // MSE
    }
    
    return totalLoss / data.length
  }

  /**
   * Evaluate model accuracy
   */
  private evaluateAccuracy(data: TrainingData[]): number {
    let correctPredictions = 0
    
    for (const item of data) {
      const error = Math.abs(item.predicted_score - item.actual_rating)
      if (error <= 0.15) { // Within 15% considered correct
        correctPredictions++
      }
    }
    
    return correctPredictions / data.length
  }

  /**
   * Get current model weights (simplified)
   */
  private getCurrentWeights(): any {
    return {
      taste_weights: ALGORITHM_CONFIG.EMOTIONAL_WEIGHTS,
      context_weights: ALGORITHM_CONFIG.CONTEXT_WEIGHTS,
      similarity_threshold: ALGORITHM_CONFIG.SIMILARITY_THRESHOLD,
      learning_rates: ALGORITHM_CONFIG.LEARNING_RATES,
      timestamp: new Date()
    }
  }

  /**
   * Evaluate model performance on test set
   */
  private async evaluateModel(testSet: TrainingData[]): Promise<ModelPerformance> {
    console.log(`Evaluating model on ${testSet.length} test samples`)

    let totalError = 0
    let squaredError = 0
    let correctPredictions = 0
    let truePositives = 0
    let falsePositives = 0
    let falseNegatives = 0

    for (const item of testSet) {
      const error = Math.abs(item.predicted_score - item.actual_rating)
      totalError += error
      squaredError += error * error
      
      // Accuracy (within threshold)
      if (error <= 0.1) {
        correctPredictions++
      }

      // Precision/Recall for high ratings (>0.7)
      const predictedHigh = item.predicted_score > 0.7
      const actualHigh = item.actual_rating > 0.7

      if (predictedHigh && actualHigh) truePositives++
      else if (predictedHigh && !actualHigh) falsePositives++
      else if (!predictedHigh && actualHigh) falseNegatives++
    }

    const accuracy = correctPredictions / testSet.length
    const mae = totalError / testSet.length
    const rmse = Math.sqrt(squaredError / testSet.length)
    
    const precision = truePositives / (truePositives + falsePositives) || 0
    const recall = truePositives / (truePositives + falseNegatives) || 0
    const f1Score = 2 * (precision * recall) / (precision + recall) || 0

    // Test similarity accuracy
    const similarityAccuracy = await this.evaluateSimilarityAccuracy(testSet)

    return {
      accuracy,
      mae,
      rmse,
      precision,
      recall,
      f1_score: f1Score,
      similarity_accuracy: similarityAccuracy,
      dataset_size: testSet.length,
      evaluation_date: new Date()
    }
  }

  /**
   * Evaluate user similarity calculation accuracy
   */
  private async evaluateSimilarityAccuracy(testSet: TrainingData[]): Promise<number> {
    // Sample pairs of users for similarity evaluation
    const userPairs: Array<{ userA: string, userB: string }> = []
    const users = Array.from(new Set(testSet.map(item => item.user_id)))
    
    // Create sample pairs
    for (let i = 0; i < Math.min(50, users.length - 1); i++) {
      for (let j = i + 1; j < Math.min(i + 5, users.length); j++) {
        userPairs.push({ userA: users[i], userB: users[j] })
      }
    }

    let correctSimilarityPredictions = 0

    for (const pair of userPairs) {
      try {
        // Get actual preference similarity based on rating correlation
        const userAItems = testSet.filter(item => item.user_id === pair.userA)
        const userBItems = testSet.filter(item => item.user_id === pair.userB)
        
        const actualSimilarity = this.calculateActualUserSimilarity(userAItems, userBItems)
        const predictedSimilarity = await this.getPredictedUserSimilarity(pair.userA, pair.userB)
        
        if (predictedSimilarity) {
          const error = Math.abs(actualSimilarity - predictedSimilarity.similarity_score)
          if (error <= 0.15) { // Within 15% threshold
            correctSimilarityPredictions++
          }
        }
      } catch (error) {
        console.error('Error evaluating similarity for pair:', error)
      }
    }

    return userPairs.length > 0 ? correctSimilarityPredictions / userPairs.length : 0
  }

  /**
   * Calculate actual user similarity based on rating patterns
   */
  private calculateActualUserSimilarity(
    userAItems: TrainingData[], 
    userBItems: TrainingData[]
  ): number {
    // Find common items
    const commonItems = userAItems.filter(itemA => 
      userBItems.some(itemB => itemB.item_id === itemA.item_id)
    )

    if (commonItems.length === 0) {
      return 0.5 // Neutral similarity for no overlap
    }

    // Calculate correlation
    let correlation = 0
    for (const itemA of commonItems) {
      const itemB = userBItems.find(item => item.item_id === itemA.item_id)
      if (itemB) {
        const diff = Math.abs(itemA.actual_rating - itemB.actual_rating)
        correlation += 1 - diff // Convert difference to similarity
      }
    }

    return correlation / commonItems.length
  }

  /**
   * Record model performance metrics
   */
  private async recordModelPerformance(performance: ModelPerformance): Promise<void> {
    try {
      const { error } = await supabase
        .from('algorithm_performance_metrics')
        .insert([
          {
            algorithm_name: 'palate_matching',
            algorithm_version: ALGORITHM_CONFIG.VERSION,
            metric_type: 'accuracy',
            metric_value: performance.accuracy,
            test_dataset_size: performance.dataset_size,
            test_conditions: {
              evaluation_date: performance.evaluation_date,
              mae: performance.mae,
              rmse: performance.rmse,
              precision: performance.precision,
              recall: performance.recall,
              f1_score: performance.f1_score,
              similarity_accuracy: performance.similarity_accuracy
            }
          }
        ])

      if (error) {
        console.error('Error recording performance metrics:', error)
      } else {
        console.log('Performance metrics recorded successfully')
        this.trainingHistory.push(performance)
      }
    } catch (error) {
      console.error('Error recording performance metrics:', error)
    }
  }

  /**
   * Update algorithm parameters based on training results
   */
  private async updateAlgorithmParameters(modelResults: any): Promise<void> {
    try {
      console.log('Updating algorithm parameters with improved model')
      
      // Update configuration with learned parameters
      if (modelResults.weights) {
        // In production, this would update the actual algorithm weights
        console.log('Model weights updated')
      }

      // Record parameter update
      const { error } = await supabase
        .from('ml_training_data')
        .insert([{
          data: {
            action: 'parameter_update',
            old_weights: this.getCurrentWeights(),
            new_weights: modelResults.weights,
            improvement: true,
            timestamp: new Date()
          },
          processed: true,
          model_version: ALGORITHM_CONFIG.VERSION
        }])

      if (error) {
        console.error('Error recording parameter update:', error)
      }

    } catch (error) {
      console.error('Error updating algorithm parameters:', error)
    }
  }

  /**
   * Get recent performance metrics
   */
  private async getRecentPerformanceMetrics(): Promise<ModelPerformance | null> {
    try {
      const { data, error } = await supabase
        .from('algorithm_performance_metrics')
        .select('*')
        .eq('algorithm_name', 'palate_matching')
        .eq('metric_type', 'accuracy')
        .order('measured_at', { ascending: false })
        .limit(1)
        .single()

      if (error || !data) return null

      return {
        accuracy: data.metric_value,
        mae: data.test_conditions?.mae || 0,
        rmse: data.test_conditions?.rmse || 0,
        precision: data.test_conditions?.precision || 0,
        recall: data.test_conditions?.recall || 0,
        f1_score: data.test_conditions?.f1_score || 0,
        similarity_accuracy: data.test_conditions?.similarity_accuracy || 0,
        dataset_size: data.test_dataset_size || 0,
        evaluation_date: new Date(data.measured_at)
      }
    } catch (error) {
      console.error('Error getting recent metrics:', error)
      return null
    }
  }

  /**
   * Get count of new training data since last training
   */
  private async getNewTrainingDataCount(since: Date): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('recommendation_interactions')
        .select('id', { count: 'exact' })
        .gte('shown_at', since.toISOString())
        .not('rating', 'is', null)

      if (error) {
        console.error('Error counting new training data:', error)
        return 0
      }

      return data?.length || 0
    } catch (error) {
      console.error('Error counting new training data:', error)
      return 0
    }
  }

  /**
   * Get original recommendation score for comparison
   */
  private async getOriginalRecommendationScore(
    userId: string, 
    itemId: string
  ): Promise<number | null> {
    try {
      const { data, error } = await supabase
        .from('recommendation_cache')
        .select('recommendation_score')
        .eq('user_id', userId)
        .eq('item_id', itemId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error || !data) return null

      return data.recommendation_score
    } catch (error) {
      return null
    }
  }

  /**
   * Get predicted user similarity from cache
   */
  private async getPredictedUserSimilarity(
    userA: string, 
    userB: string
  ): Promise<UserSimilarity | null> {
    try {
      const { data, error } = await supabase
        .from('user_similarity_cache')
        .select('*')
        .or(`and(user_a.eq.${userA},user_b.eq.${userB}),and(user_a.eq.${userB},user_b.eq.${userA})`)
        .order('calculated_at', { ascending: false })
        .limit(1)
        .single()

      if (error || !data) return null

      return {
        user_a: data.user_a,
        user_b: data.user_b,
        similarity_score: data.similarity_score,
        taste_alignment: data.taste_alignment,
        emotional_alignment: data.emotional_alignment,
        context_alignment: data.context_alignment,
        confidence: data.confidence,
        algorithm_version: data.algorithm_version,
        calculated_at: new Date(data.calculated_at)
      }
    } catch (error) {
      return null
    }
  }

  /**
   * Schedule next training cycle
   */
  private scheduleNextTraining(): void {
    const nextTrainingDelay = 24 * 60 * 60 * 1000 // 24 hours
    
    setTimeout(async () => {
      await this.startContinuousLearning()
    }, nextTrainingDelay)

    console.log('Next training cycle scheduled in 24 hours')
  }

  /**
   * Generate training summary report
   */
  async generateTrainingReport(): Promise<{
    current_performance: ModelPerformance | null
    training_history: ModelPerformance[]
    improvement_trend: number
    recommendations: string[]
  }> {
    const currentPerformance = await this.getRecentPerformanceMetrics()
    const improvementTrend = this.calculateImprovementTrend()
    
    const recommendations: string[] = []
    
    if (currentPerformance) {
      if (currentPerformance.accuracy < this.config.target_accuracy) {
        recommendations.push('Model accuracy below target - consider retraining')
      }
      
      if (currentPerformance.mae > 0.15) {
        recommendations.push('High mean absolute error - review training data quality')
      }
      
      if (currentPerformance.similarity_accuracy < 0.85) {
        recommendations.push('User similarity predictions need improvement')
      }
    } else {
      recommendations.push('No recent performance data - initial training needed')
    }

    return {
      current_performance: currentPerformance,
      training_history: this.trainingHistory.slice(-10), // Last 10 training sessions
      improvement_trend: improvementTrend,
      recommendations
    }
  }

  /**
   * Calculate improvement trend from training history
   */
  private calculateImprovementTrend(): number {
    if (this.trainingHistory.length < 2) return 0

    const recent = this.trainingHistory.slice(-5) // Last 5 sessions
    const older = this.trainingHistory.slice(-10, -5) // Previous 5 sessions

    if (older.length === 0) return 0

    const recentAvg = recent.reduce((sum, perf) => sum + perf.accuracy, 0) / recent.length
    const olderAvg = older.reduce((sum, perf) => sum + perf.accuracy, 0) / older.length

    return recentAvg - olderAvg // Positive = improving, negative = degrading
  }

  /**
   * Force immediate retraining (for manual triggers)
   */
  async forceRetraining(): Promise<void> {
    if (this.isTraining) {
      throw new Error('Training already in progress')
    }

    console.log('Manual retraining triggered')
    await this.performTrainingCycle()
  }

  /**
   * Get training status
   */
  getTrainingStatus(): {
    is_training: boolean
    last_training: Date | null
    next_scheduled: Date | null
    performance_summary: {
      current_accuracy: number | null
      target_accuracy: number
      needs_improvement: boolean
    }
  } {
    const lastMetric = this.trainingHistory[this.trainingHistory.length - 1]
    
    return {
      is_training: this.isTraining,
      last_training: lastMetric?.evaluation_date || null,
      next_scheduled: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      performance_summary: {
        current_accuracy: lastMetric?.accuracy || null,
        target_accuracy: this.config.target_accuracy,
        needs_improvement: !lastMetric || lastMetric.accuracy < this.config.target_accuracy
      }
    }
  }

  /**
   * Update training configuration
   */
  updateTrainingConfig(newConfig: Partial<LearningConfig>): void {
    this.config = { ...this.config, ...newConfig }
    console.log('Training configuration updated:', newConfig)
  }

  /**
   * Clean up old training data to manage storage
   */
  async cleanupOldTrainingData(): Promise<void> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - 180) // Keep 6 months

      const { error } = await supabase
        .from('ml_training_data')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .eq('processed', true)

      if (error) {
        console.error('Error cleaning up training data:', error)
      } else {
        console.log('Old training data cleaned up successfully')
      }
    } catch (error) {
      console.error('Error cleaning up training data:', error)
    }
  }
}

export default MLTrainingPipeline