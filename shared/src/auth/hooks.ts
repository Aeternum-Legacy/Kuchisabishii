// Authentication hooks and helpers
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import type { DbUser } from '../lib/types/api';

export interface AuthState {
  user: User | null;
  profile: DbUser | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to manage authentication state
 */
export function useSupabaseAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          setState(prev => ({ ...prev, error: error.message, loading: false }));
          return;
        }

        if (session?.user) {
          // Get user profile
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setState({
            user: session.user,
            profile: profile || null,
            session,
            loading: false,
            error: null,
          });
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Authentication error',
          loading: false,
        }));
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Get user profile
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setState({
            user: session.user,
            profile: profile || null,
            session,
            loading: false,
            error: null,
          });
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            error: null,
          });
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setState(prev => ({
            ...prev,
            session,
            user: session.user,
          }));
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setState(prev => ({ ...prev, error: error.message, loading: false }));
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed';
      setState(prev => ({ ...prev, error: message, loading: false }));
      return { success: false, error: message };
    }
  };

  const signUp = async (email: string, password: string, userData?: {
    username?: string;
    display_name?: string;
    first_name?: string;
    last_name?: string;
  }) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) {
        setState(prev => ({ ...prev, error: error.message, loading: false }));
        return { success: false, error: error.message };
      }

      // If user is immediately available (email confirmation disabled), create profile
      if (data.user && !data.user.email_confirmed_at) {
        return { 
          success: true, 
          data,
          message: 'Please check your email for confirmation link'
        };
      }

      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign up failed';
      setState(prev => ({ ...prev, error: message, loading: false }));
      return { success: false, error: message };
    }
  };

  const signOut = async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setState(prev => ({ ...prev, error: error.message, loading: false }));
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign out failed';
      setState(prev => ({ ...prev, error: message, loading: false }));
      return { success: false, error: message };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, message: 'Password reset email sent' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Password reset failed',
      };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Password update failed',
      };
    }
  };

  const updateEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ email });

      if (error) {
        return { success: false, error: error.message };
      }

      return { 
        success: true, 
        message: 'Email update initiated. Please check both old and new email for confirmation.' 
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Email update failed',
      };
    }
  };

  const refreshProfile = async () => {
    if (!state.user) return;

    try {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', state.user.id)
        .single();

      setState(prev => ({ ...prev, profile: profile || null }));
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  };

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateEmail,
    refreshProfile,
    isAuthenticated: !!state.user,
  };
}

/**
 * Hook for authentication with social providers
 */
export function useSocialAuth() {
  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Google sign in failed',
      };
    }
  };

  const signInWithApple = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Apple sign in failed',
      };
    }
  };

  return {
    signInWithGoogle,
    signInWithApple,
  };
}

/**
 * Hook to check if user has completed profile setup
 */
export function useProfileCompletion() {
  const { profile, loading } = useSupabaseAuth();

  const isProfileComplete = () => {
    if (!profile) return false;

    // Check required fields
    const requiredFields = ['username', 'display_name'];
    return requiredFields.every(field => profile[field as keyof DbUser]);
  };

  const getMissingFields = (): string[] => {
    if (!profile) return ['username', 'display_name'];

    const requiredFields = [
      { key: 'username', label: 'Username' },
      { key: 'display_name', label: 'Display Name' },
    ];

    return requiredFields
      .filter(field => !profile[field.key as keyof DbUser])
      .map(field => field.label);
  };

  return {
    isComplete: isProfileComplete(),
    missingFields: getMissingFields(),
    loading,
  };
}

/**
 * Helper function to create user profile after sign up
 */
export async function createUserProfile(
  userId: string,
  email: string,
  additionalData?: Partial<DbUser>
): Promise<{ success: boolean; error?: string; data?: DbUser }> {
  try {
    const profileData = {
      id: userId,
      email,
      username: email.split('@')[0], // Default username from email
      display_name: additionalData?.display_name || email.split('@')[0],
      first_name: additionalData?.first_name || null,
      last_name: additionalData?.last_name || null,
      ...additionalData,
    };

    const { data, error } = await supabase
      .from('users')
      .insert(profileData)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create profile',
    };
  }
}