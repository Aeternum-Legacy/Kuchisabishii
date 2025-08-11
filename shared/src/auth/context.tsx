// Authentication context for React applications
import React, { createContext, useContext, ReactNode } from 'react';
import { useSupabaseAuth, AuthState } from './hooks';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; data?: any }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ success: boolean; error?: string; data?: any; message?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  updateEmail: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  refreshProfile: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication provider component
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useSupabaseAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use authentication context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

/**
 * Higher-order component to require authentication
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  redirectTo = '/login'
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, loading } = useAuth();

    // Show loading state while checking authentication
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    // Redirect if not authenticated (in web environment)
    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = redirectTo;
        return null;
      }
      
      // For React Native, you'd handle navigation differently
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-600">Please sign in to continue.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

/**
 * Component to protect routes that require authentication
 */
interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  fallback,
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, loading, error } = useAuth();

  // Show loading state
  if (loading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Authentication Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Handle unauthenticated state
  if (!isAuthenticated) {
    // In web environment, redirect
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo;
      return null;
    }
    
    // Show fallback or default message
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to continue.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Component to show content only for authenticated users
 */
interface AuthenticatedProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function Authenticated({ children, fallback = null }: AuthenticatedProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <>{fallback}</>;
  }

  return isAuthenticated ? <>{children}</> : <>{fallback}</>;
}

/**
 * Component to show content only for unauthenticated users
 */
interface UnauthenticatedProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function Unauthenticated({ children, fallback = null }: UnauthenticatedProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <>{fallback}</>;
  }

  return !isAuthenticated ? <>{children}</> : <>{fallback}</>;
}

/**
 * Hook to check user permissions
 */
export function usePermissions() {
  const { user, profile } = useAuth();

  const hasPermission = (permission: string): boolean => {
    // Basic permission system - extend as needed
    if (!user || !profile) return false;

    // Example permissions
    switch (permission) {
      case 'create_review':
        return true; // All authenticated users can create reviews
      case 'delete_own_content':
        return true; // All authenticated users can delete their own content
      case 'moderate_content':
        return false; // Only admins/moderators (would need role system)
      default:
        return false;
    }
  };

  const isOwner = (contentUserId: string): boolean => {
    return user?.id === contentUserId;
  };

  return {
    hasPermission,
    isOwner,
    user,
    profile,
  };
}