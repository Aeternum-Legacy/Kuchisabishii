/**
 * Authentication Integration Tests
 * Tests the complete authentication flow including registration, login, and social auth
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/testing-library/jest-dom'
import { createClient } from '@supabase/supabase-js'

// Mock environment variables for testing
const TEST_SUPABASE_URL = process.env.TEST_SUPABASE_URL || 'http://localhost:54321'
const TEST_SUPABASE_ANON_KEY = process.env.TEST_SUPABASE_ANON_KEY || 'test-anon-key'

describe('Authentication System Integration Tests', () => {
  let supabase: any
  let testUserId: string | null = null
  let testUserEmail: string

  beforeEach(async () => {
    // Initialize test Supabase client
    supabase = createClient(TEST_SUPABASE_URL, TEST_SUPABASE_ANON_KEY)
    testUserEmail = `test-${Date.now()}@example.com`
  })

  afterEach(async () => {
    // Clean up test user if created
    if (testUserId && supabase) {
      try {
        await supabase.auth.admin.deleteUser(testUserId)
      } catch (error) {
        console.warn('Failed to cleanup test user:', error)
      }
    }
  })

  describe('User Registration', () => {
    it('should register a new user with email and password', async () => {
      const userData = {
        email: testUserEmail,
        password: 'TestPassword123!',
        displayName: 'Test User',
        firstName: 'Test',
        lastName: 'User'
      }

      // Test registration API endpoint
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      const result = await response.json()

      expect(response.status).toBe(201)
      expect(result.message).toBe('Registration successful')
      expect(result.user).toHaveProperty('id')
      expect(result.user.email).toBe(userData.email)

      testUserId = result.user.id
    })

    it('should reject registration with weak password', async () => {
      const userData = {
        email: testUserEmail,
        password: '123',
        displayName: 'Test User',
        firstName: 'Test',
        lastName: 'User'
      }

      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toContain('Password must be at least 8 characters')
    })

    it('should reject registration with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'TestPassword123!',
        displayName: 'Test User',
        firstName: 'Test',
        lastName: 'User'
      }

      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toContain('Invalid email address')
    })
  })

  describe('User Login', () => {
    beforeEach(async () => {
      // Create a test user first
      const userData = {
        email: testUserEmail,
        password: 'TestPassword123!',
        displayName: 'Test User',
        firstName: 'Test',
        lastName: 'User'
      }

      const registerResponse = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      const registerResult = await registerResponse.json()
      testUserId = registerResult.user?.id

      // Confirm the user (in a real test, you'd need to handle email confirmation)
      if (supabase && testUserId) {
        await supabase.auth.admin.updateUserById(testUserId, {
          email_confirm: true
        })
      }
    })

    it('should login with valid credentials', async () => {
      const loginData = {
        email: testUserEmail,
        password: 'TestPassword123!'
      }

      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      })

      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.message).toBe('Login successful')
      expect(result.user).toHaveProperty('id')
      expect(result.user.email).toBe(loginData.email)
    })

    it('should reject login with invalid credentials', async () => {
      const loginData = {
        email: testUserEmail,
        password: 'WrongPassword123!'
      }

      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      })

      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toBeDefined()
    })

    it('should handle unverified email appropriately', async () => {
      // Create user without email confirmation
      const unverifiedEmail = `unverified-${Date.now()}@example.com`
      const userData = {
        email: unverifiedEmail,
        password: 'TestPassword123!',
        displayName: 'Unverified User',
        firstName: 'Unverified',
        lastName: 'User'
      }

      await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      const loginData = {
        email: unverifiedEmail,
        password: 'TestPassword123!'
      }

      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      })

      const result = await response.json()

      expect(response.status).toBe(403)
      expect(result.code).toBe('EMAIL_NOT_VERIFIED')
      expect(result.email).toBe(unverifiedEmail)
    })
  })

  describe('Rate Limiting', () => {
    it('should enforce rate limits on login attempts', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'WrongPassword123!'
      }

      // Make multiple failed login attempts
      const promises = Array(6).fill(null).map(() =>
        fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData)
        })
      )

      const responses = await Promise.all(promises)
      const lastResponse = responses[responses.length - 1]

      // The last request should be rate limited
      expect(lastResponse.status).toBe(429)

      const result = await lastResponse.json()
      expect(result.error).toContain('Too many requests')
      expect(result.retryAfter).toBeGreaterThan(0)
    })

    it('should enforce rate limits on registration attempts', async () => {
      const promises = Array(6).fill(null).map((_, index) =>
        fetch('http://localhost:3000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: `test${index}@example.com`,
            password: 'TestPassword123!',
            displayName: 'Test User',
            firstName: 'Test',
            lastName: 'User'
          })
        })
      )

      const responses = await Promise.all(promises)
      const lastResponse = responses[responses.length - 1]

      // The last request should be rate limited
      expect(lastResponse.status).toBe(429)
    })
  })

  describe('Social Authentication', () => {
    it('should initiate Google OAuth flow', async () => {
      const response = await fetch('http://localhost:3000/api/auth/social/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.url).toBeDefined()
      expect(result.provider).toBe('google')
      expect(result.url).toContain('accounts.google.com')
    })

    it('should initiate Apple OAuth flow', async () => {
      const response = await fetch('http://localhost:3000/api/auth/social/apple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.url).toBeDefined()
      expect(result.provider).toBe('apple')
      expect(result.url).toContain('appleid.apple.com')
    })
  })

  describe('Email Management', () => {
    it('should resend confirmation email', async () => {
      const response = await fetch('http://localhost:3000/api/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testUserEmail })
      })

      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.message).toContain('Confirmation email sent successfully')
    })

    it('should enforce rate limits on email resend', async () => {
      // Make multiple resend requests
      const promises = Array(4).fill(null).map(() =>
        fetch('http://localhost:3000/api/auth/resend-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: testUserEmail })
        })
      )

      const responses = await Promise.all(promises)
      const lastResponse = responses[responses.length - 1]

      // The last request should be rate limited
      expect(lastResponse.status).toBe(429)
    })
  })

  describe('Security Headers', () => {
    it('should include proper security headers in responses', async () => {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password'
        })
      })

      // Check for security headers
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
      expect(response.headers.get('X-Frame-Options')).toBe('DENY')
      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block')
    })
  })
})

// Helper function to test password strength validation
export function testPasswordStrength(password: string): number {
  let strength = 0
  if (password.length >= 8) strength += 1
  if (/[a-z]/.test(password)) strength += 1
  if (/[A-Z]/.test(password)) strength += 1
  if (/[0-9]/.test(password)) strength += 1
  if (/[^a-zA-Z0-9]/.test(password)) strength += 1
  return strength
}

describe('Password Strength Validation', () => {
  it('should correctly calculate password strength', () => {
    expect(testPasswordStrength('weak')).toBe(1)
    expect(testPasswordStrength('WeakPass')).toBe(2)
    expect(testPasswordStrength('WeakPass1')).toBe(3)
    expect(testPasswordStrength('WeakPass1!')).toBe(4)
    expect(testPasswordStrength('StrongPass123!')).toBe(5)
  })
})