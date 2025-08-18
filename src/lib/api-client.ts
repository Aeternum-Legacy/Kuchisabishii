import { supabase } from '@/lib/supabase/client'

/**
 * Enhanced API client that properly forwards authentication tokens
 * This ensures server-side APIs can authenticate requests even when
 * cookies aren't properly transmitted in Vercel's environment
 */
export async function apiClient(url: string, options: RequestInit = {}) {
  // Get the current session
  const { data: { session } } = await supabase!.auth.getSession()
  
  // Prepare headers with authentication
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  // Merge existing headers if they're an object
  if (options.headers && typeof options.headers === 'object' && !Array.isArray(options.headers)) {
    Object.assign(headers, options.headers)
  }
  
  // Add access token if available
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
    console.log('🔑 Adding access token to API request')
  }
  
  // Make the request with enhanced headers
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Ensure cookies are sent
  })
  
  return response
}

/**
 * GET request with authentication
 */
export async function apiGet(url: string) {
  const response = await apiClient(url, {
    method: 'GET',
  })
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }
  
  return response.json()
}

/**
 * POST request with authentication
 */
export async function apiPost(url: string, data?: any) {
  const response = await apiClient(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  })
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }
  
  return response.json()
}