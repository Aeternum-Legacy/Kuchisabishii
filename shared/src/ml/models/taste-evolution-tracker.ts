/**
 * Taste Evolution Tracker
 * LSTM-based model for tracking how user taste preferences evolve over time
 */

import * as tf from '@tensorflow/tfjs';

export interface TasteSnapshot {
  userId: string;
  timestamp: Date;
  flavorPreferences: {
    sweet: number;
    salty: number;
    sour: number;
    bitter: number;
    umami: number;
    spicy: number;
  };
  cuisinePreferences: Record<string, number>;
  adventureScore: number;
  contextFactors: {
    season: string;
    socialContext: string;
    location: string;
    mood?: string;
  };
}

export interface TasteEvolutionPrediction {
  nextMonthPreferences: TasteSnapshot['flavorPreferences'];
  cuisineEvolution: Record<string, number>;
  adventureScoreChange: number;
  confidence: number;
  recommendationAdjustments: {
    increaseNovelty: boolean;
    focusOnComfort: boolean;
    exploreCuisines: string[];
  };
}

export class TasteEvolutionTracker {
  private model: tf.LayersModel | null = null;
  private sequenceLength: number = 12; // 12 months of data
  private featureDimension: number = 15; // Number of taste features

  constructor() {
    this.initializeModel();
  }

  /**
   * Initialize the LSTM model architecture
   */
  private async initializeModel(): Promise<void> {
    const model = tf.sequential();

    // LSTM Layer 1 - Process sequential taste data
    model.add(tf.layers.lstm({
      units: 128,
      returnSequences: true,
      inputShape: [this.sequenceLength, this.featureDimension],
      dropout: 0.3,
      recurrentDropout: 0.3,
    }));

    // LSTM Layer 2 - Extract temporal patterns
    model.add(tf.layers.lstm({
      units: 64,
      dropout: 0.2,
    }));

    // Dense layers for prediction
    model.add(tf.layers.dense({
      units: 32,
      activation: 'relu',
    }));

    model.add(tf.layers.dropout({
      rate: 0.2,
    }));

    // Output layer - predict next taste preferences
    model.add(tf.layers.dense({
      units: this.featureDimension,
      activation: 'sigmoid',
    }));

    // Compile model
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae'],
    });

    this.model = model;
  }

  /**
   * Convert taste snapshot to feature vector
   */
  private tasteSnapshotToFeatures(snapshot: TasteSnapshot): number[] {
    const features: number[] = [];

    // Flavor preferences (6 features)
    features.push(
      snapshot.flavorPreferences.sweet,
      snapshot.flavorPreferences.salty,
      snapshot.flavorPreferences.sour,
      snapshot.flavorPreferences.bitter,
      snapshot.flavorPreferences.umami,
      snapshot.flavorPreferences.spicy
    );

    // Top cuisine preferences (4 features)
    const cuisineScores = Object.values(snapshot.cuisinePreferences)
      .sort((a, b) => b - a)
      .slice(0, 4);
    
    while (cuisineScores.length < 4) {
      cuisineScores.push(0);
    }
    features.push(...cuisineScores);

    // Adventure score (1 feature)
    features.push(snapshot.adventureScore);

    // Context factors (4 features)
    const seasonEncoding = this.encodeCategory(snapshot.contextFactors.season, 
      ['spring', 'summer', 'fall', 'winter']);
    const socialEncoding = this.encodeCategory(snapshot.contextFactors.socialContext,
      ['solo', 'friends', 'family', 'date']);
    
    features.push(...seasonEncoding, ...socialEncoding);

    return features;
  }

  /**
   * Encode categorical variables as one-hot vectors
   */
  private encodeCategory(value: string, categories: string[]): number[] {
    const encoding = new Array(categories.length).fill(0);
    const index = categories.indexOf(value);
    if (index !== -1) {
      encoding[index] = 1;
    }
    return encoding;
  }

  /**
   * Prepare training data from taste history
   */
  public prepareTrainingData(tasteHistory: TasteSnapshot[]): {
    inputs: tf.Tensor3D;
    outputs: tf.Tensor2D;
  } {
    const sequences: number[][][] = [];
    const targets: number[][] = [];

    // Sort by timestamp
    const sortedHistory = tasteHistory.sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Create sequences of length sequenceLength
    for (let i = this.sequenceLength; i < sortedHistory.length; i++) {
      const sequence = sortedHistory
        .slice(i - this.sequenceLength, i)
        .map(snapshot => this.tasteSnapshotToFeatures(snapshot));
      
      const target = this.tasteSnapshotToFeatures(sortedHistory[i]);
      
      sequences.push(sequence);
      targets.push(target);
    }

    const inputs = tf.tensor3d(sequences);
    const outputs = tf.tensor2d(targets);

    return { inputs, outputs };
  }

  /**
   * Train the model on user taste evolution data
   */
  public async trainModel(
    tasteHistory: TasteSnapshot[],
    validationSplit: number = 0.2
  ): Promise<tf.History> {
    if (!this.model) {
      throw new Error('Model not initialized');
    }

    const { inputs, outputs } = this.prepareTrainingData(tasteHistory);

    const history = await this.model.fit(inputs, outputs, {
      epochs: 50,
      batchSize: 32,
      validationSplit,
      shuffle: true,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch}: loss = ${logs?.loss}, val_loss = ${logs?.val_loss}`);
        }
      }
    });

    // Clean up tensors
    inputs.dispose();
    outputs.dispose();

    return history;
  }

  /**
   * Predict taste evolution for a user
   */
  public async predictTasteEvolution(
    recentTasteHistory: TasteSnapshot[]
  ): Promise<TasteEvolutionPrediction> {
    if (!this.model) {
      throw new Error('Model not initialized');
    }

    if (recentTasteHistory.length < this.sequenceLength) {
      throw new Error(`Need at least ${this.sequenceLength} taste snapshots for prediction`);
    }

    // Prepare input sequence
    const sequence = recentTasteHistory
      .slice(-this.sequenceLength)
      .map(snapshot => this.tasteSnapshotToFeatures(snapshot));

    const inputTensor = tf.tensor3d([sequence]);
    
    // Make prediction
    const prediction = this.model.predict(inputTensor) as tf.Tensor2D;
    const predictionArray = await prediction.data();

    // Clean up tensors
    inputTensor.dispose();
    prediction.dispose();

    // Parse prediction results
    const nextMonthPreferences = {
      sweet: predictionArray[0],
      salty: predictionArray[1],
      sour: predictionArray[2],
      bitter: predictionArray[3],
      umami: predictionArray[4],
      spicy: predictionArray[5],
    };

    // Calculate cuisine evolution (simplified)
    const currentCuisines = recentTasteHistory[recentTasteHistory.length - 1].cuisinePreferences;
    const cuisineEvolution: Record<string, number> = {};
    
    Object.keys(currentCuisines).forEach(cuisine => {
      // Predict slight changes based on taste profile evolution
      const currentScore = currentCuisines[cuisine];
      const change = (Math.random() - 0.5) * 0.2; // ±0.1 change
      cuisineEvolution[cuisine] = Math.max(0, Math.min(5, currentScore + change));
    });

    // Adventure score change
    const currentAdventure = recentTasteHistory[recentTasteHistory.length - 1].adventureScore;
    const adventureScoreChange = predictionArray[10] - currentAdventure;

    // Calculate confidence based on prediction consistency
    const confidence = this.calculatePredictionConfidence(predictionArray, recentTasteHistory);

    // Generate recommendation adjustments
    const recommendationAdjustments = this.generateRecommendationAdjustments(
      nextMonthPreferences,
      adventureScoreChange,
      recentTasteHistory
    );

    return {
      nextMonthPreferences,
      cuisineEvolution,
      adventureScoreChange,
      confidence,
      recommendationAdjustments,
    };
  }

  /**
   * Calculate prediction confidence
   */
  private calculatePredictionConfidence(
    prediction: Float32Array,
    history: TasteSnapshot[]
  ): number {
    // Simple confidence calculation based on recent taste stability
    const recentVariability = this.calculateTasteVariability(history.slice(-3));
    
    // Higher variability = lower confidence
    const baseConfidence = Math.max(0.3, 1.0 - recentVariability);
    
    // Adjust for prediction extremes (very high/low values are less confident)
    const extremeValues = Array.from(prediction).filter(val => val < 0.1 || val > 0.9);
    const extremePenalty = extremeValues.length * 0.05;
    
    return Math.max(0.1, baseConfidence - extremePenalty);
  }

  /**
   * Calculate taste variability in recent history
   */
  private calculateTasteVariability(recentHistory: TasteSnapshot[]): number {
    if (recentHistory.length < 2) return 0;

    const flavorKeys = ['sweet', 'salty', 'sour', 'bitter', 'umami', 'spicy'] as const;
    let totalVariability = 0;

    flavorKeys.forEach(flavor => {
      const values = recentHistory.map(snapshot => snapshot.flavorPreferences[flavor]);
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      totalVariability += Math.sqrt(variance);
    });

    return totalVariability / flavorKeys.length;
  }

  /**
   * Generate recommendation adjustments based on predicted evolution
   */
  private generateRecommendationAdjustments(
    nextPreferences: TasteSnapshot['flavorPreferences'],
    adventureChange: number,
    history: TasteSnapshot[]
  ): TasteEvolutionPrediction['recommendationAdjustments'] {
    const currentPreferences = history[history.length - 1].flavorPreferences;
    
    // Check for significant taste changes
    const significantChanges: string[] = [];
    Object.keys(nextPreferences).forEach(flavor => {
      const change = Math.abs(nextPreferences[flavor as keyof typeof nextPreferences] - 
                             currentPreferences[flavor as keyof typeof currentPreferences]);
      if (change > 0.3) {
        significantChanges.push(flavor);
      }
    });

    // Determine if user is becoming more adventurous
    const increaseNovelty = adventureChange > 0.1;
    const focusOnComfort = adventureChange < -0.1 || 
                          this.detectStressPattern(history);

    // Suggest cuisines to explore based on taste evolution
    const exploreCuisines = this.suggestCuisinesToExplore(
      nextPreferences, 
      currentPreferences
    );

    return {
      increaseNovelty,
      focusOnComfort,
      exploreCuisines,
    };
  }

  /**
   * Detect if user is in a stress pattern (preferring comfort foods)
   */
  private detectStressPattern(history: TasteSnapshot[]): boolean {
    if (history.length < 3) return false;

    const recent = history.slice(-3);
    const adventureScores = recent.map(h => h.adventureScore);
    const avgAdventure = adventureScores.reduce((sum, score) => sum + score, 0) / adventureScores.length;
    
    // Low adventure score + preference for familiar flavors indicates stress
    return avgAdventure < 0.3;
  }

  /**
   * Suggest cuisines to explore based on taste evolution
   */
  private suggestCuisinesToExplore(
    nextPreferences: TasteSnapshot['flavorPreferences'],
    currentPreferences: TasteSnapshot['flavorPreferences']
  ): string[] {
    const suggestions: string[] = [];

    // Map taste preferences to cuisine suggestions
    const cuisineMap: Record<string, string[]> = {
      spicy: ['Thai', 'Indian', 'Mexican', 'Szechuan'],
      umami: ['Japanese', 'Korean', 'Chinese'],
      sweet: ['Malaysian', 'Filipino', 'Caribbean'],
      sour: ['Vietnamese', 'Peruvian', 'Eastern European'],
      bitter: ['Italian', 'Mediterranean', 'Ethiopian'],
    };

    // Find flavors that are increasing
    Object.keys(nextPreferences).forEach(flavor => {
      const increase = nextPreferences[flavor as keyof typeof nextPreferences] - 
                      currentPreferences[flavor as keyof typeof currentPreferences];
      
      if (increase > 0.2 && cuisineMap[flavor]) {
        suggestions.push(...cuisineMap[flavor]);
      }
    });

    // Remove duplicates and limit to 3 suggestions
    return [...new Set(suggestions)].slice(0, 3);
  }

  /**
   * Save model to local storage or file system
   */
  public async saveModel(path: string): Promise<void> {
    if (!this.model) {
      throw new Error('No model to save');
    }

    await this.model.save(`file://${path}`);
  }

  /**
   * Load model from local storage or file system
   */
  public async loadModel(path: string): Promise<void> {
    this.model = await tf.loadLayersModel(`file://${path}`);
  }

  /**
   * Get model summary
   */
  public getModelSummary(): string {
    if (!this.model) {
      return 'Model not initialized';
    }

    const summary: string[] = [];
    this.model.layers.forEach((layer, index) => {
      summary.push(`Layer ${index}: ${layer.getClassName()} - ${JSON.stringify(layer.outputShape)}`);
    });

    return summary.join('\n');
  }

  /**
   * Dispose of the model and free memory
   */
  public dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
  }
}

export default TasteEvolutionTracker;