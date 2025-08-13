import { NextRequest } from 'next/server'

interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxAttempts: number // Maximum number of attempts per window
  keyGenerator?: (request: NextRequest) => string // Function to generate rate limiting key
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

export function createRateLimit(options: RateLimitOptions) {
  const { windowMs, maxAttempts, keyGenerator } = options

  return function rateLimit(request: NextRequest): { 
    allowed: boolean
    remaining: number
    resetTime: number
    error?: string
  } {
    const key = keyGenerator ? keyGenerator(request) : getDefaultKey(request)
    const now = Date.now()
    const resetTime = now + windowMs

    let entry = rateLimitStore.get(key)

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      entry = {
        count: 1,
        resetTime
      }
      rateLimitStore.set(key, entry)

      return {
        allowed: true,
        remaining: maxAttempts - 1,
        resetTime: entry.resetTime
      }
    }

    if (entry.count >= maxAttempts) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        error: `Too many requests. Try again in ${Math.ceil((entry.resetTime - now) / 1000)} seconds.`
      }
    }

    entry.count++
    rateLimitStore.set(key, entry)

    return {
      allowed: true,
      remaining: maxAttempts - entry.count,
      resetTime: entry.resetTime
    }
  }
}

function getDefaultKey(request: NextRequest): string {
  // Get IP address from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'
  
  return `ratelimit:${ip}`
}

// Predefined rate limiters for common use cases
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxAttempts: 5, // 5 attempts per 15 minutes
  keyGenerator: (request) => {
    const ip = getDefaultKey(request)
    return `auth:${ip}`
  }
})

export const passwordResetRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxAttempts: 3, // 3 attempts per hour
  keyGenerator: (request) => {
    const ip = getDefaultKey(request)
    return `password-reset:${ip}`
  }
})

export const emailResendRateLimit = createRateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxAttempts: 3, // 3 resends per 5 minutes
  keyGenerator: (request) => {
    const ip = getDefaultKey(request)
    return `email-resend:${ip}`
  }
})

export const socialAuthRateLimit = createRateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  maxAttempts: 10, // 10 attempts per 10 minutes
  keyGenerator: (request) => {
    const ip = getDefaultKey(request)
    return `social-auth:${ip}`
  }
})