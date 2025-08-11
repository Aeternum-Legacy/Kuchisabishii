// Shared utilities for the Kuchisabishii application

import { FoodCategory, Mood } from '../types';

/**
 * Format a date to a human-readable string
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

/**
 * Format a date and time to a human-readable string
 */
export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Get display name for food category
 */
export const getCategoryDisplayName = (category: FoodCategory): string => {
  const categoryMap: Record<FoodCategory, string> = {
    [FoodCategory.BREAKFAST]: 'Breakfast',
    [FoodCategory.LUNCH]: 'Lunch',
    [FoodCategory.DINNER]: 'Dinner',
    [FoodCategory.SNACK]: 'Snack',
    [FoodCategory.DESSERT]: 'Dessert',
    [FoodCategory.DRINK]: 'Drink',
    [FoodCategory.OTHER]: 'Other',
  };
  return categoryMap[category];
};

/**
 * Get emoji for mood
 */
export const getMoodEmoji = (mood: Mood): string => {
  const moodMap: Record<Mood, string> = {
    [Mood.VERY_HAPPY]: '😍',
    [Mood.HAPPY]: '😊',
    [Mood.NEUTRAL]: '😐',
    [Mood.SAD]: '😔',
    [Mood.VERY_SAD]: '😢',
  };
  return moodMap[mood];
};

/**
 * Get star rating display
 */
export const getStarRating = (rating: number): string => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - Math.ceil(rating);

  return '★'.repeat(fullStars) + 
         (hasHalfStar ? '☆' : '') + 
         '☆'.repeat(emptyStars);
};

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Calculate distance between two coordinates (in kilometers)
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};