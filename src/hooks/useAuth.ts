import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  email: string
  displayName?: string
  firstName?: string
  lastName?: string
  profileImage?: string
  bio?: string
  location?: string
  dietaryRestrictions?: string[]
  createdAt?: string
  updatedAt?: string
}

interface AuthState {
  user: UserProfile | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    // Skip initialization if supabase client is not available (during SSR/build)
    if (!supabase) {
      setAuthState({ user: null, loading: false, error: null })
      return
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        // Check for OAuth success/error in URL
        const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
        if (urlParams?.get('auth') === 'success') {
          // Remove the query parameter
          window.history.replaceState({}, '', window.location.pathname)
        }
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          setAuthState({ user: null, loading: false, error: error.message })
          return
        }

        if (session?.user) {
          try {
            // Fetch user profile with timeout
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
            
            const response = await fetch('/api/auth/me', {
              signal: controller.signal
            })
            clearTimeout(timeoutId)
            
            if (response.ok) {
              const data = await response.json()
              setAuthState({ user: data.user, loading: false, error: null })
            } else {
              throw new Error('Profile API failed')
            }
          } catch (error) {
            // Fallback to basic user data if API fails
            console.warn('Profile API error, using basic user data:', error)
            setAuthState({
              user: {
                id: session.user.id,
                email: session.user.email || '',
                displayName: session.user.user_metadata?.display_name,
                firstName: session.user.user_metadata?.first_name,
                lastName: session.user.user_metadata?.last_name
              },
              loading: false,
              error: null
            })
          }
        } else {
          setAuthState({ user: null, loading: false, error: null })
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setAuthState({ user: null, loading: false, error: 'Failed to initialize authentication' })
      }
    }

    getInitialSession()

    // Add timeout to prevent infinite loading
    const authTimeout = setTimeout(() => {
      console.warn('Auth timeout - forcing no user state')
      setAuthState({ user: null, loading: false, error: null })
    }, 5000)

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const response = await fetch('/api/auth/me')
            if (response.ok) {
              const data = await response.json()
              setAuthState({ user: data.user, loading: false, error: null })
            } else {
              setAuthState({
                user: {
                  id: session.user.id,
                  email: session.user.email || '',
                  displayName: session.user.user_metadata?.display_name,
                  firstName: session.user.user_metadata?.first_name,
                  lastName: session.user.user_metadata?.last_name
                },
                loading: false,
                error: null
              })
            }
          } catch (error) {
            console.error('User profile fetch error:', error)
            setAuthState({
              user: {
                id: session.user.id,
                email: session.user.email || '',
                displayName: session.user.user_metadata?.display_name,
                firstName: session.user.user_metadata?.first_name,
                lastName: session.user.user_metadata?.last_name
              },
              loading: false,
              error: null
            })
          }
        } else if (event === 'SIGNED_OUT') {
          setAuthState({ user: null, loading: false, error: null })
        }
      }
    )

    return () => {
      subscription.unsubscribe()
      clearTimeout(authTimeout)
    }
  }, [])

  const signUp = async (userData: {
    email: string
    password: string
    displayName: string
    firstName: string
    lastName: string
  }) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      setAuthState(prev => ({ ...prev, loading: false, error: null }))
      return { success: true, data }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed'
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      // Use Supabase client directly for authentication
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) {
        // Check if it's an email not confirmed error
        if (authError.message.includes('Email not confirmed')) {
          const error = new Error('Email not verified')
          ;(error as any).code = 'EMAIL_NOT_VERIFIED'
          ;(error as any).email = email
          throw error
        }
        throw new Error(authError.message)
      }

      if (!authData.user || !authData.session) {
        throw new Error('Invalid credentials')
      }

      // The auth state will be updated by the onAuthStateChange listener
      // So we just need to wait a moment for it to trigger
      setTimeout(() => {
        setAuthState(prev => ({ ...prev, loading: false }))
      }, 100)
      
      return { success: true, data: authData }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }))
      
      // Return additional error data if available
      return { 
        success: false, 
        error: errorMessage,
        code: (error as any).code,
        email: (error as any).email,
        data: (error as any).data
      }
    }
  }

  const signOut = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      
      if (!response.ok) {
        throw new Error('Logout failed')
      }

      setAuthState({ user: null, loading: false, error: null })
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed'
      setAuthState(prev => ({ ...prev, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }

  const signInWithGoogle = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      // Try GET instead of POST to work around deployment issue
      const response = await fetch('/api/auth/social/google?action=signin', {
        method: 'GET'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Google sign-in failed')
      }

      // Redirect to Google OAuth URL
      window.location.href = data.url
      
      return { success: true, data }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google sign-in failed'
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }

  const resendConfirmation = async (email: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await fetch('/api/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend confirmation')
      }

      setAuthState(prev => ({ ...prev, loading: false, error: null }))
      return { success: true, data }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend confirmation'
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    resendConfirmation
  }
}