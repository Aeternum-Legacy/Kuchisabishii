import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { apiGet, apiPost } from '@/lib/api-client'
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
  onboardingCompleted?: boolean | null
  createdAt?: string
  updatedAt?: string
}

interface AuthState {
  user: UserProfile | null
  loading: boolean
  error: string | null
}

/**
 * SPARC Architecture: Simplified Auth Hook
 * 
 * This hook uses ONLY Supabase's native session management:
 * 1. Uses supabase.auth.getSession() for initial session
 * 2. Uses supabase.auth.onAuthStateChange() for session monitoring
 * 3. NO manual cookie parsing or session restoration
 * 4. Relies on Supabase's built-in session persistence
 */
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    // Skip if no Supabase client (SSR/build)
    if (!supabase) {
      setAuthState({ user: null, loading: false, error: null })
      return
    }

    // Get initial session using Supabase's native method
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase!.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          setAuthState({ user: null, loading: false, error: error.message })
          return
        }

        if (session?.user) {
          await loadUserProfile(session.user.id, session)
        } else {
          setAuthState({ user: null, loading: false, error: null })
        }
      } catch (error) {
        setAuthState({ user: null, loading: false, error: 'Failed to initialize authentication' })
      }
    }

    // Load user profile from database
    const loadUserProfile = async (userId: string, session: any) => {
      try {
        const data = await apiGet('/api/auth/me')
        setAuthState({ user: data.user, loading: false, error: null })
      } catch (error) {
        // Fallback to session user data
        setAuthState({
            user: {
              id: session.user.id,
              email: session.user.email || '',
              displayName: session.user.user_metadata?.display_name || session.user.user_metadata?.full_name,
              firstName: session.user.user_metadata?.first_name || session.user.user_metadata?.given_name,
              lastName: session.user.user_metadata?.last_name || session.user.user_metadata?.family_name,
              profileImage: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
              onboardingCompleted: null
            },
            loading: false,
            error: null
        })
      }
    }

    getInitialSession()

    // Listen for auth state changes using Supabase's native listener
    const { data: { subscription } } = supabase!.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserProfile(session.user.id, session)
        } else if (event === 'SIGNED_OUT') {
          setAuthState({ user: null, loading: false, error: null })
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          await loadUserProfile(session.user.id, session)
        }
      }
    )

    // Cleanup timeout for loading state
    const loadingTimeout = setTimeout(() => {
      if (authState.loading) {
        console.log('⏱️ Auth loading timeout reached after 10 seconds')
        setAuthState(prev => ({ ...prev, loading: false }))
      }
    }, 10000) // Standard timeout for email authentication

    return () => {
      subscription.unsubscribe()
      clearTimeout(loadingTimeout)
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
      
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) {
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

      // Auth state will be updated by onAuthStateChange listener
      setAuthState(prev => ({ ...prev, loading: false }))
      
      return { success: true, data: authData }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }))
      
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
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw new Error(error.message)
      }

      // Clear any PKCE-related localStorage entries to prevent conflicts
      if (typeof window !== 'undefined') {
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.includes('supabase.auth.token') || 
              key.includes('pkce') || 
              key.includes('code_verifier') ||
              key.startsWith('sb-')) {
            localStorage.removeItem(key)
          }
        })
      }

      setAuthState({ user: null, loading: false, error: null })
      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed'
      setAuthState(prev => ({ ...prev, error: errorMessage }))
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
    resendConfirmation
  }
}