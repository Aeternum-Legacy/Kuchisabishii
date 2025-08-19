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
  staging: ['NEXTAUTH_SECRET'],
  production: ['NEXTAUTH_SECRET', 'NEXT_PUBLIC_APP_URL']
} as const

/**
 * Get the base URL for the current environment
 * Priority: NEXTAUTH_URL > VERCEL_URL > window.origin > localhost fallback
 * 
 * CRITICAL: This function eliminates localhost hardcoding that causes OAuth failures
 * Uses NEXTAUTH_URL as primary source for consistency with OAuth configuration
 */
export function getBaseUrl(): string {
  // For client-side, always use the current origin (most reliable)
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  
  // Server-side environment detection with NEXTAUTH_URL priority
  // Priority 1: NextAuth URL (primary OAuth configuration source)
  if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes('localhost')) {
    return process.env.NEXTAUTH_URL
  }
  
  // Priority 2: Vercel deployment URL (automatic deployment URL)
  if (process.env.VERCEL_URL) {
    // Ensure HTTPS for Vercel URLs
    const vercelUrl = process.env.VERCEL_URL.startsWith('https://') 
      ? process.env.VERCEL_URL 
      : `https://${process.env.VERCEL_URL}`
    return vercelUrl
  }
  
  // Priority 3: Explicit app URL (manual override if needed)
  if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  
  // Priority 4: Development environment
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || '3000'
    return `http://localhost:${port}`
  }
  
  // Priority 5: Fallback for Vercel environments without proper config
  if (process.env.VERCEL === '1' || process.env.VERCEL_ENV) {
    if (process.env.VERCEL_PROJECT_NAME) {
      return `https://${process.env.VERCEL_PROJECT_NAME}.vercel.app`
    }
  }
  
  // Final fallback: This should NEVER happen in production
  console.warn('⚠️ CRITICAL: No valid base URL found, falling back to localhost')
  const port = process.env.PORT || '3000'
  return `http://localhost:${port}`
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