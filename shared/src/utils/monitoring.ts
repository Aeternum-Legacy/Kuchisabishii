/**
 * Monitoring and observability utilities for Kuchisabishii
 * Handles error tracking, performance monitoring, and analytics
 */

export interface MetricData {
  name: string;
  value: number;
  tags?: Record<string, string | number>;
  timestamp?: Date;
}

export interface ErrorData {
  message: string;
  stack?: string;
  context?: Record<string, any>;
  user_id?: string;
  platform?: 'web' | 'mobile';
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface PerformanceData {
  operation: string;
  duration: number;
  success: boolean;
  context?: Record<string, any>;
  platform?: 'web' | 'mobile';
}

// Performance monitoring
export class PerformanceMonitor {
  private static operations: Map<string, number> = new Map();

  /**
   * Start timing an operation
   */
  static startOperation(operationName: string): string {
    const operationId = `${operationName}-${Date.now()}-${Math.random()}`;
    this.operations.set(operationId, performance.now());
    return operationId;
  }

  /**
   * End timing an operation and log performance data
   */
  static endOperation(
    operationId: string, 
    success: boolean = true, 
    context?: Record<string, any>
  ): PerformanceData {
    const startTime = this.operations.get(operationId);
    if (!startTime) {
      throw new Error(`Operation ${operationId} not found`);
    }

    const duration = performance.now() - startTime;
    this.operations.delete(operationId);

    const performanceData: PerformanceData = {
      operation: operationId.split('-')[0],
      duration: Math.round(duration * 100) / 100, // Round to 2 decimal places
      success,
      context,
      platform: typeof window !== 'undefined' ? 'web' : 'mobile',
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 Performance: ${performanceData.operation} took ${performanceData.duration}ms`, {
        success,
        context,
      });
    }

    // Send to monitoring service
    this.sendPerformanceData(performanceData);

    return performanceData;
  }

  /**
   * Monitor emotional rating creation performance
   */
  static async monitorEmotionalRating<T>(
    operation: () => Promise<T>,
    userId?: string,
    foodExperienceId?: string
  ): Promise<T> {
    const operationId = this.startOperation('emotional_rating_creation');
    
    try {
      const result = await operation();
      this.endOperation(operationId, true, { userId, foodExperienceId });
      return result;
    } catch (error) {
      this.endOperation(operationId, false, { userId, foodExperienceId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Monitor recommendation generation performance
   */
  static async monitorRecommendation<T>(
    operation: () => Promise<T>,
    recommendationType: 'mood' | 'similarity' | 'craving',
    userId?: string
  ): Promise<T> {
    const operationId = this.startOperation(`recommendation_${recommendationType}`);
    
    try {
      const result = await operation();
      this.endOperation(operationId, true, { recommendationType, userId });
      return result;
    } catch (error) {
      this.endOperation(operationId, false, { recommendationType, userId, error: (error as Error).message });
      throw error;
    }
  }

  /**
   * Send performance data to monitoring service
   */
  private static sendPerformanceData(data: PerformanceData): void {
    // Send to monitoring service (Datadog, New Relic, etc.)
    if (process.env.DATADOG_API_KEY) {
      this.sendToDatadog(data);
    }

    // Send to analytics
    if (process.env.MIXPANEL_TOKEN) {
      this.sendToMixpanel('performance_metric', data);
    }
  }

  private static sendToDatadog(data: PerformanceData): void {
    // Implementation would send to Datadog StatsD or HTTP API
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Would send to Datadog:', data);
    }
  }

  private static sendToMixpanel(event: string, data: any): void {
    // Implementation would send to Mixpanel
    if (process.env.NODE_ENV === 'development') {
      console.log('📈 Would send to Mixpanel:', event, data);
    }
  }
}

// Error tracking and logging
export class ErrorTracker {
  /**
   * Log application errors
   */
  static logError(error: Error | ErrorData, context?: Record<string, any>): void {
    const errorData: ErrorData = error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      context,
      platform: typeof window !== 'undefined' ? 'web' : 'mobile',
      severity: 'medium',
    } : error;

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Error:', errorData);
    }

    // Send to error tracking service
    this.sendErrorData(errorData);

    // Send critical errors to monitoring
    if (errorData.severity === 'critical' || errorData.severity === 'high') {
      this.sendCriticalAlert(errorData);
    }
  }

  /**
   * Log emotional rating validation errors
   */
  static logEmotionalRatingError(error: Error, userId?: string, data?: any): void {
    this.logError(error, {
      type: 'emotional_rating_validation',
      userId,
      inputData: data,
      severity: 'low',
    });
  }

  /**
   * Log recommendation engine errors
   */
  static logRecommendationError(error: Error, userId?: string, recommendationType?: string): void {
    this.logError(error, {
      type: 'recommendation_engine',
      userId,
      recommendationType,
      severity: 'high', // Recommendation failures are high priority
    });
  }

  /**
   * Log authentication errors
   */
  static logAuthError(error: Error, context?: any): void {
    this.logError(error, {
      type: 'authentication',
      ...context,
      severity: 'high',
    });
  }

  /**
   * Log database errors
   */
  static logDatabaseError(error: Error, query?: string, userId?: string): void {
    this.logError(error, {
      type: 'database',
      query: query ? query.substring(0, 200) : undefined, // Limit query length
      userId,
      severity: 'critical',
    });
  }

  private static sendErrorData(errorData: ErrorData): void {
    // Send to Sentry
    if (process.env.SENTRY_DSN) {
      this.sendToSentry(errorData);
    }

    // Send to Datadog logs
    if (process.env.DATADOG_API_KEY) {
      this.sendToDatadogLogs(errorData);
    }
  }

  private static sendToSentry(errorData: ErrorData): void {
    // Implementation would initialize and send to Sentry
    if (process.env.NODE_ENV === 'development') {
      console.log('📡 Would send to Sentry:', errorData);
    }
  }

  private static sendToDatadogLogs(errorData: ErrorData): void {
    // Implementation would send to Datadog Logs API
    if (process.env.NODE_ENV === 'development') {
      console.log('📝 Would send to Datadog Logs:', errorData);
    }
  }

  private static sendCriticalAlert(errorData: ErrorData): void {
    // Send immediate alerts for critical errors
    if (process.env.NODE_ENV === 'development') {
      console.log('🚨 CRITICAL ALERT:', errorData);
    }
  }
}

// Business metrics and analytics
export class BusinessMetrics {
  /**
   * Track user engagement with emotional features
   */
  static trackEmotionalEngagement(
    userId: string,
    action: 'rating_created' | 'pattern_viewed' | 'recommendation_clicked',
    metadata?: Record<string, any>
  ): void {
    const event = {
      event: 'emotional_engagement',
      user_id: userId,
      action,
      metadata,
      timestamp: new Date(),
      platform: typeof window !== 'undefined' ? 'web' : 'mobile',
    };

    this.sendAnalyticsEvent(event);
  }

  /**
   * Track recommendation performance
   */
  static trackRecommendationPerformance(
    userId: string,
    recommendationType: 'mood' | 'similarity' | 'craving',
    recommendationId: string,
    action: 'shown' | 'clicked' | 'converted',
    metadata?: Record<string, any>
  ): void {
    const event = {
      event: 'recommendation_performance',
      user_id: userId,
      recommendation_type: recommendationType,
      recommendation_id: recommendationId,
      action,
      metadata,
      timestamp: new Date(),
      platform: typeof window !== 'undefined' ? 'web' : 'mobile',
    };

    this.sendAnalyticsEvent(event);
  }

  /**
   * Track mouth loneliness insights
   */
  static trackMouthLonelinessInsight(
    userId: string,
    loneliness_level: number,
    context: any,
    action: 'created' | 'viewed' | 'shared'
  ): void {
    const event = {
      event: 'mouth_loneliness_insight',
      user_id: userId,
      loneliness_level,
      context,
      action,
      timestamp: new Date(),
      platform: typeof window !== 'undefined' ? 'web' : 'mobile',
    };

    this.sendAnalyticsEvent(event);
  }

  /**
   * Track cross-platform usage
   */
  static trackCrossPlatformUsage(
    userId: string,
    platforms: ('web' | 'mobile')[],
    timespan_days: number
  ): void {
    const event = {
      event: 'cross_platform_usage',
      user_id: userId,
      platforms,
      timespan_days,
      timestamp: new Date(),
    };

    this.sendAnalyticsEvent(event);
  }

  private static sendAnalyticsEvent(event: any): void {
    // Send to Mixpanel
    if (process.env.MIXPANEL_TOKEN) {
      this.sendToMixpanel(event);
    }

    // Send to Google Analytics
    if (process.env.GA_MEASUREMENT_ID) {
      this.sendToGA(event);
    }

    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', event);
    }
  }

  private static sendToMixpanel(event: any): void {
    // Implementation would send to Mixpanel
    if (process.env.NODE_ENV === 'development') {
      console.log('📈 Would send to Mixpanel:', event);
    }
  }

  private static sendToGA(event: any): void {
    // Implementation would send to Google Analytics 4
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Would send to GA4:', event);
    }
  }
}

// Health check utilities
export class HealthMonitor {
  private static checks: Map<string, () => Promise<boolean>> = new Map();

  /**
   * Register a health check
   */
  static registerCheck(name: string, checkFunction: () => Promise<boolean>): void {
    this.checks.set(name, checkFunction);
  }

  /**
   * Run all health checks
   */
  static async runHealthChecks(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; checks: Record<string, boolean> }> {
    const results: Record<string, boolean> = {};
    let healthyCount = 0;

    for (const [name, checkFn] of this.checks.entries()) {
      try {
        const result = await checkFn();
        results[name] = result;
        if (result) healthyCount++;
      } catch (error) {
        results[name] = false;
        ErrorTracker.logError(error as Error, { healthCheck: name });
      }
    }

    const totalChecks = this.checks.size;
    const status = healthyCount === totalChecks ? 'healthy' : 
                   healthyCount > totalChecks / 2 ? 'degraded' : 'unhealthy';

    return { status, checks: results };
  }

  /**
   * Initialize default health checks
   */
  static initializeDefaultChecks(): void {
    // Database connectivity check
    this.registerCheck('database', async () => {
      try {
        // Would check Supabase connection
        return true;
      } catch {
        return false;
      }
    });

    // Recommendation engine check
    this.registerCheck('recommendations', async () => {
      try {
        // Would test recommendation generation
        return true;
      } catch {
        return false;
      }
    });

    // External services check
    this.registerCheck('external_services', async () => {
      try {
        // Would check Google Maps, etc.
        return true;
      } catch {
        return false;
      }
    });
  }
}

// Initialize health checks
HealthMonitor.initializeDefaultChecks();