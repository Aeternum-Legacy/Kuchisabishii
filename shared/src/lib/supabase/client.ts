import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Common Supabase configuration
export const supabaseConfig = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  db: {
    schema: 'public',
  },
};

// Get environment variables with fallbacks
export const getSupabaseEnvVars = () => {
  // Web environment variables
  if (typeof window !== 'undefined') {
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    };
  }
  
  // React Native / Expo environment variables
  if (process.env.EXPO_PUBLIC_SUPABASE_URL) {
    return {
      url: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
      anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
    };
  }
  
  // Server-side environment variables
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  };
};

// Create Supabase client
export const createSupabaseClient = () => {
  const { url, anonKey } = getSupabaseEnvVars();
  
  if (!url || !anonKey) {
    throw new Error('Supabase URL and Anon Key are required. Please check your environment variables.');
  }
  
  return createClient<Database>(url, anonKey, supabaseConfig);
};

// Export the client instance
export const supabase = createSupabaseClient();

// Service role client (server-side only)
export const createSupabaseServiceClient = () => {
  const { url } = getSupabaseEnvVars();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !serviceKey) {
    throw new Error('Supabase URL and Service Role Key are required for admin operations.');
  }
  
  return createClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Storage configuration
export const STORAGE_BUCKETS = {
  FOOD_IMAGES: 'food-images',
  PROFILE_IMAGES: 'profile-images',
  RESTAURANT_IMAGES: 'restaurant-images',
} as const;

// File upload helpers
export const getStorageUrl = (bucket: string, path: string): string => {
  const { url } = getSupabaseEnvVars();
  return `${url}/storage/v1/object/public/${bucket}/${path}`;
};

export const uploadFile = async (
  file: File,
  bucket: string,
  path: string,
  options?: { cacheControl?: string; upsert?: boolean }
) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: options?.cacheControl || '3600',
      upsert: options?.upsert || false,
    });

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  return {
    path: data.path,
    publicUrl: getStorageUrl(bucket, data.path),
  };
};

export const deleteFile = async (bucket: string, path: string) => {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  
  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};

// Helper to get file size limit
export const getMaxFileSize = (): number => {
  const maxSize = typeof window !== 'undefined' 
    ? process.env.NEXT_PUBLIC_MAX_FILE_SIZE
    : process.env.EXPO_PUBLIC_MAX_FILE_SIZE;
  
  return parseInt(maxSize || '5242880', 10); // 5MB default
};

// Utility function to handle Supabase errors
export const handleSupabaseError = (error: any): never => {
  console.error('Supabase error:', error);
  
  if (error?.code === 'PGRST301') {
    throw new Error('Resource not found');
  }
  
  if (error?.code === 'PGRST116') {
    throw new Error('Access denied');
  }
  
  if (error?.message) {
    throw new Error(error.message);
  }
  
  throw new Error('An unexpected error occurred');
};

// Connection status checker
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('users').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
};