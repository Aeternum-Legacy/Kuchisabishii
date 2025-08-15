/**
 * API Helper Utilities
 * Common utilities for API route handlers
 */

import { NextResponse } from 'next/server'
import { z, ZodSchema } from 'zod'
import { ApiResponse } from '@/lib/supabase/types'

/**
 * Standard API response helper
 */
export function apiResponse<T = any>(
  success: boolean,
  data?: T,
  error?: string,
  status: number = 200,
  message?: string
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success,
      data,
      error,
      message
    },
    { status }
  )
}

/**
 * Success response helper
 */
export function successResponse<T = any>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return apiResponse(true, data, undefined, status, message)
}

/**
 * Error response helper
 */
export function errorResponse(
  error: string,
  status: number = 400,
  details?: Record<string, unknown>
): NextResponse<ApiResponse> {
  const response: ApiResponse = {
    success: false,
    error,
    ...(details && { details })
  }
  
  return NextResponse.json(response, { status })
}

/**
 * Validation error response helper
 */
export function validationErrorResponse(
  errors: z.ZodIssue[]
): NextResponse<ApiResponse> {
  return errorResponse(
    'Validation failed',
    400,
    errors
  )
}

/**
 * Validate request body against schema
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await request.json()
    const validation = schema.safeParse(body)
    
    if (!validation.success) {
      return {
        success: false,
        response: validationErrorResponse(validation.error.errors)
      }
    }
    
    return { success: true, data: validation.data }
  } catch (error) {
    return {
      success: false,
      response: errorResponse('Invalid JSON in request body', 400)
    }
  }
}

/**
 * Validate query parameters against schema
 */
export function validateQueryParams<T>(
  url: URL,
  schema: ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse } {
  const queryParams = Object.fromEntries(url.searchParams.entries())
  const validation = schema.safeParse(queryParams)
  
  if (!validation.success) {
    return {
      success: false,
      response: errorResponse(
        'Invalid query parameters',
        400,
        validation.error.errors
      )
    }
  }
  
  return { success: true, data: validation.data }
}

/**
 * Handle async errors in API routes
 */
export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error('API Error:', error)
  
  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes('Not authenticated')) {
      return errorResponse('Authentication required', 401)
    }
    
    if (error.message.includes('not found')) {
      return errorResponse('Resource not found', 404)
    }
    
    if (error.message.includes('permission')) {
      return errorResponse('Access denied', 403)
    }
    
    // Generic error
    return errorResponse('Internal server error', 500)
  }
  
  return errorResponse('Internal server error', 500)
}

/**
 * Wrap API route handler with error handling
 */
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

/**
 * Pagination helper
 */
export function buildPagination(
  page: number,
  limit: number,
  total: number
) {
  const totalPages = Math.ceil(total / limit)
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
    offset: (page - 1) * limit
  }
}

/**
 * Generate slug from string
 */
export function generateSlug(text: string, maxLength: number = 100): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, maxLength)
}

/**
 * Generate unique slug by appending random suffix if needed
 */
export async function generateUniqueSlug(
  text: string,
  checkExists: (slug: string) => Promise<boolean>,
  maxLength: number = 100
): Promise<string> {
  let baseSlug = generateSlug(text, maxLength - 10) // Reserve space for suffix
  let finalSlug = baseSlug
  
  // Check if slug exists and append suffix if needed
  if (await checkExists(finalSlug)) {
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    finalSlug = `${baseSlug}-${randomSuffix}`
  }
  
  return finalSlug
}

/**
 * Sanitize search query
 */
export function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ') // Replace special characters with spaces
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .substring(0, 100) // Limit length
}

/**
 * Parse array from comma-separated string
 */
export function parseArrayParam(param: string | undefined): string[] {
  if (!param) return []
  return param
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0)
}

/**
 * Parse number array from comma-separated string
 */
export function parseNumberArrayParam(param: string | undefined): number[] {
  if (!param) return []
  return param
    .split(',')
    .map(item => parseInt(item.trim(), 10))
    .filter(num => !isNaN(num))
}

/**
 * Check if user can access resource based on privacy settings
 */
export function canAccessResource(
  resource: { user_id: string; is_private?: boolean; shared_with_friends?: boolean },
  currentUserId: string | null,
  isOwner: boolean = false,
  isFriend: boolean = false
): boolean {
  // Owner can always access their own resources
  if (isOwner || resource.user_id === currentUserId) {
    return true
  }
  
  // Private resources are only accessible by owner
  if (resource.is_private) {
    return false
  }
  
  // If resource is shared with friends only, check friendship
  if (resource.shared_with_friends === false) {
    return false // Public access
  }
  
  // If shared_with_friends is true, need to be a friend
  if (resource.shared_with_friends && !isFriend) {
    return false
  }
  
  return true
}

/**
 * Format price for display
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase()
  }).format(price)
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

/**
 * Debounce function for API calls
 */
export function debounce<T extends (...args: Record<string, unknown>[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(null, args), wait)
  }
}