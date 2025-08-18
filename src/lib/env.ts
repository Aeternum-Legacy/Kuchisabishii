/**
 * Environment Configuration Utility
 * Provides environment-aware URL resolution to eliminate hardcoded localhost references
 * 
 * SPARC Architecture: Zero-Localhost Environment Resolution
 * This module ensures that NO hardcoded localhost references cause production failures
 */

/**
 * Environment type definitions for better type safety
 */
export type Environment = 'development' | 'staging' | 'production'

export interface EnvironmentConfig {
  environment: Environment
  baseUrl: string
  nodeEnv: string | undefined
  vercelEnv: string | undefined
  vercelUrl: string | undefined
  nextAuthUrl: string | undefined
  appUrl: string | undefined
  isVercel: boolean
  isClient: boolean
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Required environment variables for different environments
 */
export const REQUIRED_ENV_VARS = {
  development: ['NEXTAUTH_SECRET'],
  staging: ['NEXTAUTH_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
  production: ['NEXTAUTH_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'NEXT_PUBLIC_APP_URL']
} as const

/**
 * Get the base URL for the current environment
 * Priority: NEXT_PUBLIC_APP_URL > VERCEL_URL > NEXTAUTH_URL > localhost fallback
 * 
 * CRITICAL: This function eliminates localhost hardcoding that causes OAuth failures
 */
export function getBaseUrl(): string {
  // For client-side, always use the current origin (most reliable)
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  
  // Server-side environment detection with improved priority order
  // Priority 1: Explicit app URL (production/staging override)
  if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  
  // Priority 2: Vercel deployment URL (most common for deployments)
  if (process.env.VERCEL_URL) {
    // Ensure HTTPS for Vercel URLs
    const vercelUrl = process.env.VERCEL_URL.startsWith('https://') 
      ? process.env.VERCEL_URL 
      : `https://${process.env.VERCEL_URL}`
    return vercelUrl
  }
  
  // Priority 3: NextAuth URL (only if not localhost)
  if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes('localhost')) {
    return process.env.NEXTAUTH_URL
  }
  
  // Priority 4: Development environment detection
  if (getEnvironment() === 'development') {
    const port = process.env.PORT || '3000'
    return `http://localhost:${port}`
  }
  
  // Fallback: This should NEVER happen in production
  console.warn('⚠️ CRITICAL: No valid base URL found, falling back to localhost')
  const port = process.env.PORT || '3000'
  return `http://localhost:${port}`
}

/**
 * Get environment-aware OAuth redirect URL
 */
export function getOAuthRedirectUrl(path: string = '/app'): string {
  const baseUrl = getBaseUrl()
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Get environment-aware API callback URL
 */
export function getOAuthCallbackUrl(provider: string): string {
  const baseUrl = getBaseUrl()
  return `${baseUrl}/api/auth/callback/${provider}`
}

/**
 * Get the current environment name
 */
export function getEnvironment(): Environment {
  if (process.env.NODE_ENV === 'production') {
    // Check if it's Vercel staging branch
    if (process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_GIT_COMMIT_REF === 'staging') {
      return 'staging'
    }
    return 'production'
  }
  return 'development'
}

/**
 * Validate environment configuration and detect localhost issues
 * CRITICAL: This prevents localhost URLs from reaching production
 */
export function validateEnvironmentConfig(): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  const baseUrl = getBaseUrl()
  const environment = getEnvironment()
  
  // CRITICAL: Check for localhost in non-development environments
  if (environment !== 'development' && baseUrl.includes('localhost')) {
    errors.push(`${environment} environment is using localhost URL: ${baseUrl}`)
  }
  
  // Check for localhost in environment variables
  if (process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL.includes('localhost') && environment !== 'development') {
    errors.push(`NEXTAUTH_URL contains localhost in ${environment} environment`)
  }
  
  if (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.includes('localhost') && environment !== 'development') {
    errors.push(`NEXT_PUBLIC_APP_URL contains localhost in ${environment} environment`)
  }
  
  // Check for missing required environment variables based on environment
  const requiredVars = REQUIRED_ENV_VARS[environment] || REQUIRED_ENV_VARS.development
  
  for (const envVar of requiredVars) {
    if (!process.env[envVar]) {
      errors.push(`Missing required environment variable: ${envVar}`)
    }
  }
  
  // Staging/Production specific checks
  if (environment !== 'development') {
    if (!process.env.VERCEL_URL && !process.env.NEXT_PUBLIC_APP_URL) {
      warnings.push('No deployment URL configured (VERCEL_URL or NEXT_PUBLIC_APP_URL)')
    }
    
    // Warn about OAuth URL consistency only if both are set
    if (process.env.NEXTAUTH_URL && process.env.NEXT_PUBLIC_APP_URL) {
      if (process.env.NEXTAUTH_URL !== process.env.NEXT_PUBLIC_APP_URL) {
        warnings.push(`NEXTAUTH_URL (${process.env.NEXTAUTH_URL}) differs from NEXT_PUBLIC_APP_URL (${process.env.NEXT_PUBLIC_APP_URL})`)
      }
    }
  }
  
  // Check for chunk loading compatibility
  if (typeof window !== 'undefined' && window.location.origin !== baseUrl) {
    warnings.push(`Client origin (${window.location.origin}) differs from configured base URL (${baseUrl})`)
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Environment configuration for debugging
 */
export function getEnvironmentInfo(): EnvironmentConfig {
  return {
    environment: getEnvironment(),
    baseUrl: getBaseUrl(),
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    vercelUrl: process.env.VERCEL_URL,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    isVercel: !!process.env.VERCEL,
    isClient: typeof window !== 'undefined'
  }
}