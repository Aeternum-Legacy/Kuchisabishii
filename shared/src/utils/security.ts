/**
 * Security utilities for Kuchisabishii
 * Handles data validation, sanitization, and protection for emotional data
 */

import { z } from 'zod';

// Input validation schemas
export const EmotionalInputSchema = z.object({
  satisfaction: z.number().min(1).max(10),
  craving: z.number().min(1).max(10),
  comfort: z.number().min(1).max(10),
  excitement: z.number().min(1).max(10),
  nostalgia: z.number().min(0).max(10),
  social: z.number().min(0).max(10),
});

export const EmotionalContextSchema = z.object({
  mood_before: z.enum(['happy', 'sad', 'neutral', 'excited', 'stressed', 'lonely', 'angry', 'anxious']),
  mood_after: z.enum(['happy', 'sad', 'neutral', 'excited', 'satisfied', 'disappointed', 'comforted', 'thrilled']),
  energy_level: z.enum(['low', 'medium', 'high', 'excited']),
  social_setting: z.enum(['alone', 'with_friends', 'with_family', 'on_date', 'with_colleagues']),
  occasion: z.enum(['regular', 'comfort', 'celebration', 'special', 'business', 'romantic']),
});

export const FoodExperienceSchema = z.object({
  dish_name: z.string().min(1).max(200),
  restaurant_name: z.string().min(1).max(200),
  spending: z.number().min(0).max(1000),
  dining_method: z.enum(['dine-in', 'takeout', 'delivery', 'home-cooked']),
  meal_time: z.enum(['breakfast', 'brunch', 'lunch', 'dinner', 'snack', 'late-night']),
  tasting_notes: z.string().max(1000).optional(),
  photo_url: z.string().url().optional(),
  location: z.string().max(200).optional(),
});

// Content sanitization
export class ContentSanitizer {
  private static readonly ALLOWED_HTML_TAGS = [];
  private static readonly MAX_TEXT_LENGTH = 1000;
  private static readonly PROFANITY_PATTERNS = [
    // Add patterns for content moderation
    /\b(spam|abuse|harassment)\b/gi,
  ];

  /**
   * Sanitize user text input for emotional notes
   */
  static sanitizeEmotionalNotes(input: string): string {
    if (!input) return '';
    
    // Trim and limit length
    let sanitized = input.trim().substring(0, this.MAX_TEXT_LENGTH);
    
    // Remove HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');
    
    // Escape special characters
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
    
    // Check for inappropriate content
    if (this.containsInappropriateContent(sanitized)) {
      throw new Error('Content contains inappropriate material');
    }
    
    return sanitized;
  }

  /**
   * Sanitize dish and restaurant names
   */
  static sanitizeFoodName(input: string): string {
    if (!input) return '';
    
    let sanitized = input.trim().substring(0, 200);
    
    // Allow basic food-related characters
    sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-'&,.()]/g, '');
    
    return sanitized.trim();
  }

  /**
   * Check for inappropriate content
   */
  private static containsInappropriateContent(text: string): boolean {
    return this.PROFANITY_PATTERNS.some(pattern => pattern.test(text));
  }
}

// Data encryption for sensitive information
export class DataProtection {
  /**
   * Hash sensitive data for database storage
   */
  static async hashSensitiveData(data: string): Promise<string> {
    if (typeof window !== 'undefined') {
      // Browser environment - use Web Crypto API
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } else {
      // Node.js environment
      const crypto = require('crypto');
      return crypto.createHash('sha256').update(data).digest('hex');
    }
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  /**
   * Generate secure random token
   */
  static generateSecureToken(length: number = 32): string {
    if (typeof window !== 'undefined') {
      // Browser environment
      const array = new Uint8Array(length);
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    } else {
      // Node.js environment
      const crypto = require('crypto');
      return crypto.randomBytes(length).toString('hex');
    }
  }
}

// Rate limiting utilities
export class RateLimiter {
  private static attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private static readonly MAX_ATTEMPTS = 10;
  private static readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes

  /**
   * Check if user/IP is rate limited
   */
  static isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier);

    if (!userAttempts) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return false;
    }

    // Reset window if expired
    if (now - userAttempts.lastAttempt > this.WINDOW_MS) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return false;
    }

    // Increment attempts
    userAttempts.count++;
    userAttempts.lastAttempt = now;

    return userAttempts.count > this.MAX_ATTEMPTS;
  }

  /**
   * Clear rate limit for identifier
   */
  static clearRateLimit(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

// GDPR compliance utilities
export class PrivacyCompliance {
  /**
   * Anonymize user data for analytics
   */
  static anonymizeUserData(userId: string): string {
    return DataProtection.hashSensitiveData(userId + 'salt');
  }

  /**
   * Check if data can be processed based on consent
   */
  static canProcessData(consent: {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    preferences: boolean;
  }, dataType: 'emotional' | 'analytics' | 'marketing' | 'functional'): boolean {
    switch (dataType) {
      case 'emotional':
      case 'functional':
        return consent.necessary;
      case 'analytics':
        return consent.analytics;
      case 'marketing':
        return consent.marketing;
      default:
        return false;
    }
  }

  /**
   * Generate data export for GDPR compliance
   */
  static generateDataExport(userData: any): any {
    return {
      profile: {
        id: userData.id,
        email: userData.email,
        created_at: userData.created_at,
        dietary_restrictions: userData.dietary_restrictions,
        taste_preferences: userData.taste_preferences,
      },
      food_experiences: userData.food_experiences?.map((exp: any) => ({
        dish_name: exp.dish_name,
        restaurant_name: exp.restaurant_name,
        experience_date: exp.experience_date,
        spending: exp.spending,
        tasting_notes: exp.tasting_notes,
      })),
      emotional_ratings: userData.emotional_ratings?.map((rating: any) => ({
        primary_rating: rating.primary_rating,
        dimensions: rating.dimensions,
        emotional_notes: rating.emotional_notes,
        experience_date: rating.experience_date,
        mouth_loneliness_level: rating.mouth_loneliness_level,
      })),
      emotional_patterns: userData.emotional_patterns ? {
        comfort_seeking_frequency: userData.emotional_patterns.comfort_seeking_frequency,
        adventure_seeking_frequency: userData.emotional_patterns.adventure_seeking_frequency,
        mouth_loneliness_frequency: userData.emotional_patterns.mouth_loneliness_frequency,
        satisfaction_trend: userData.emotional_patterns.satisfaction_trend,
      } : null,
      export_date: new Date().toISOString(),
      note: 'This export contains all your personal data stored in Kuchisabishii. Your emotional data has been anonymized where possible while preserving its usefulness to you.',
    };
  }
}

// Security validation for API endpoints
export class APISecurityValidator {
  /**
   * Validate emotional rating submission
   */
  static validateEmotionalRating(data: any): {
    isValid: boolean;
    errors: string[];
    sanitizedData?: any;
  } {
    const errors: string[] = [];

    try {
      // Validate dimensions
      const dimensions = EmotionalInputSchema.parse(data.dimensions);
      
      // Validate context
      const context = EmotionalContextSchema.parse(data.context);
      
      // Sanitize optional text fields
      const sanitizedData = {
        dimensions,
        context,
        emotional_notes: data.emotional_notes ? 
          ContentSanitizer.sanitizeEmotionalNotes(data.emotional_notes) : null,
        reminds_me_of: data.reminds_me_of ? 
          ContentSanitizer.sanitizeEmotionalNotes(data.reminds_me_of) : null,
      };

      return { isValid: true, errors: [], sanitizedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.push(...error.errors.map(e => `${e.path.join('.')}: ${e.message}`));
      } else {
        errors.push(error instanceof Error ? error.message : 'Validation failed');
      }
      
      return { isValid: false, errors };
    }
  }

  /**
   * Validate food experience submission
   */
  static validateFoodExperience(data: any): {
    isValid: boolean;
    errors: string[];
    sanitizedData?: any;
  } {
    const errors: string[] = [];

    try {
      const sanitizedData = {
        dish_name: ContentSanitizer.sanitizeFoodName(data.dish_name),
        restaurant_name: ContentSanitizer.sanitizeFoodName(data.restaurant_name),
        spending: Math.max(0, Math.min(1000, Number(data.spending) || 0)),
        dining_method: data.dining_method,
        meal_time: data.meal_time,
        tasting_notes: data.tasting_notes ? 
          ContentSanitizer.sanitizeEmotionalNotes(data.tasting_notes) : null,
        photo_url: data.photo_url,
        location: data.location ? 
          ContentSanitizer.sanitizeFoodName(data.location) : null,
      };

      // Validate with schema
      FoodExperienceSchema.parse(sanitizedData);

      return { isValid: true, errors: [], sanitizedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.push(...error.errors.map(e => `${e.path.join('.')}: ${e.message}`));
      } else {
        errors.push(error instanceof Error ? error.message : 'Validation failed');
      }
      
      return { isValid: false, errors };
    }
  }
}