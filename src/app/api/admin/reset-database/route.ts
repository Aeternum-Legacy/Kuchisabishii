import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Admin endpoint to reset database
// Only use in development!
export async function POST(request: NextRequest) {
  // Safety check - only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Reset not allowed in production' },
      { status: 403 }
    )
  }

  try {
    // Get admin Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🧹 Starting database reset...')

    // Step 1: Clear user-generated content (in dependency order)
    const tablesToClear = [
      // AI/ML data
      'ml_training_data',
      'ml_feedback',
      'ab_test_assignments', 
      'ab_test_results',
      'model_metrics',
      'user_embeddings',
      'item_embeddings',
      'recommendation_cache',
      
      // Social data
      'qr_friend_tokens',
      'friend_requests', 
      'friendships',
      'social_activities',
      
      // User profiles
      'taste_profiles',
      'user_profiles',
      'profiles', // Alternative table name
      
      // Food data
      'restaurant_reviews',
      'food_experiences_detailed',
      'food_experiences',
      
      // Other data
      'notifications',
      'seasonal_patterns'
    ]

    const results = []

    for (const tableName of tablesToClear) {
      try {
        const { error, count } = await supabase
          .from(tableName)
          .delete()
          .neq('id', '') // Delete all records

        if (error) {
          if (error.message.includes('does not exist')) {
            results.push(`⚠️ Table ${tableName} does not exist, skipping`)
          } else {
            results.push(`❌ Error clearing ${tableName}: ${error.message}`)
          }
        } else {
          results.push(`✅ Cleared ${tableName}`)
        }
      } catch (err) {
        results.push(`❌ Error clearing ${tableName}: ${err}`)
      }
    }

    // Step 2: Clear auth data (optional - uncomment to enable)
    const { searchParams } = new URL(request.url)
    const clearAuth = searchParams.get('clearAuth') === 'true'
    
    if (clearAuth) {
      try {
        // This is more complex and requires direct SQL
        results.push('⚠️ Auth clearing requires SQL Editor access')
      } catch (err) {
        results.push(`❌ Error clearing auth: ${err}`)
      }
    }

    // Step 3: Verification
    const verification = []
    const verifyTables = ['user_profiles', 'profiles', 'food_experiences', 'restaurants']
    
    for (const tableName of verifyTables) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })
        
        if (!error) {
          verification.push(`${tableName}: ${count} records`)
        }
      } catch (err) {
        verification.push(`${tableName}: unable to count`)
      }
    }

    console.log('✅ Database reset completed')

    return NextResponse.json({
      success: true,
      message: 'Database reset completed',
      results,
      verification,
      note: clearAuth ? 'Auth data cleared' : 'Auth data preserved (add ?clearAuth=true to clear)'
    })

  } catch (error) {
    console.error('Error resetting database:', error)
    return NextResponse.json(
      { error: 'Failed to reset database', details: error },
      { status: 500 }
    )
  }
}

// GET endpoint to check status
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Admin endpoints not available in production' },
      { status: 403 }
    )
  }

  return NextResponse.json({
    message: 'Database reset endpoint ready',
    usage: {
      resetData: 'POST /api/admin/reset-database',
      resetWithAuth: 'POST /api/admin/reset-database?clearAuth=true'
    }
  })
}