import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Test Supabase connection
    const { data, error } = await supabase.from('profiles').select('count').single()
    
    if (error) {
      return NextResponse.json({
        status: 'error',
        message: 'Supabase connection failed',
        error: error.message,
        details: error
      }, { status: 500 })
    }
    
    // Test auth admin functions
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    
    return NextResponse.json({
      status: 'success',
      message: 'Supabase connection working',
      database: {
        connected: true,
        profiles_accessible: true
      },
      auth: {
        admin_access: !usersError,
        total_users: users?.users?.length || 0,
        error: usersError?.message
      },
      environment: {
        hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Supabase test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}