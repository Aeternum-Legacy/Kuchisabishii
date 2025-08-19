// CRITICAL API SECURITY VALIDATION
// Ensures all profile queries are properly isolated to authenticated users

/**
 * Security wrapper for Supabase profile queries
 * Prevents user tenancy violations by enforcing strict user ID validation
 */

export class ProfileSecurityValidator {
  /**
   * Validates that a profile query result belongs to the authenticated user
   * @param profile - Profile data returned from database
   * @param authenticatedUserId - User ID from auth session
   * @returns boolean - true if profile belongs to authenticated user
   */
  static validateProfileOwnership(profile: any, authenticatedUserId: string): boolean {
    if (!profile || !authenticatedUserId) {
      console.error('🚨 SECURITY: Missing profile or user ID for validation')
      return false
    }

    if (profile.id !== authenticatedUserId) {
      console.error('🚨 CRITICAL SECURITY BREACH: Profile ID mismatch detected!', {
        profileId: profile.id,
        authenticatedUserId,
        timestamp: new Date().toISOString(),
        stackTrace: new Error().stack
      })
      
      // Log to audit trail
      this.logSecurityBreach('PROFILE_ID_MISMATCH', {
        profileId: profile.id,
        authenticatedUserId,
        breach_type: 'USER_TENANCY_VIOLATION'
      })
      
      return false
    }

    return true
  }

  /**
   * Secure profile query wrapper
   * Ensures query results are validated before returning to client
   */
  static async secureProfileQuery(
    supabase: any, 
    authenticatedUserId: string,
    queryBuilder: any
  ): Promise<{ data: any; error: any; securityValidated: boolean }> {
    
    // Execute the query
    const result = await queryBuilder
    
    if (result.error) {
      return { ...result, securityValidated: false }
    }

    // Validate the result belongs to authenticated user
    if (result.data) {
      const isValid = this.validateProfileOwnership(result.data, authenticatedUserId)
      
      if (!isValid) {
        return {
          data: null,
          error: { 
            message: 'Security validation failed', 
            code: 'SECURITY_BREACH_DETECTED',
            details: 'Profile data does not belong to authenticated user'
          },
          securityValidated: false
        }
      }
    }

    return { ...result, securityValidated: true }
  }

  /**
   * Log security breaches for monitoring and investigation
   */
  private static async logSecurityBreach(breachType: string, details: any) {
    try {
      // In production, this would send to security monitoring system
      console.error('🚨 SECURITY BREACH LOGGED', {
        type: breachType,
        details,
        timestamp: new Date().toISOString(),
        severity: 'CRITICAL'
      })
      
      // Could integrate with services like:
      // - Sentry for error tracking
      // - DataDog for security monitoring
      // - Custom audit logging system
      
    } catch (error) {
      console.error('Failed to log security breach:', error)
    }
  }
}

/**
 * Secure API route wrapper
 * Use this wrapper for all profile-related API endpoints
 */
export function withProfileSecurity(handler: Function) {
  return async (request: Request, ...args: any[]) => {
    try {
      // Add security headers
      const securityHeaders = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      }

      const response = await handler(request, ...args)
      
      // Add security headers to response
      if (response && typeof response.headers?.set === 'function') {
        Object.entries(securityHeaders).forEach(([key, value]) => {
          response.headers.set(key, value)
        })
      }

      return response

    } catch (error) {
      console.error('🚨 Security wrapper caught error:', error)
      
      return new Response(
        JSON.stringify({ 
          error: 'Internal security error',
          message: 'Request blocked for security reasons'
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }
}

/**
 * Usage example for API routes:
 * 
 * export const GET = withProfileSecurity(async (request: NextRequest) => {
 *   const supabase = await createClient()
 *   const { data: { user }, error } = await supabase.auth.getUser()
 *   
 *   if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 *   
 *   // Use secure profile query
 *   const result = await ProfileSecurityValidator.secureProfileQuery(
 *     supabase,
 *     user.id,
 *     supabase.from('profiles').select('*').eq('id', user.id).single()
 *   )
 *   
 *   if (!result.securityValidated) {
 *     return NextResponse.json({ error: result.error }, { status: 403 })
 *   }
 *   
 *   return NextResponse.json({ data: result.data })
 * })
 */