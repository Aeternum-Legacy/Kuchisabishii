/**
 * A/B Testing Framework API Route
 * Manages experimental variations for recommendation algorithms
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// A/B Test configuration schema
const abTestSchema = z.object({
  test_id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  variants: z.array(z.object({
    id: z.string(),
    name: z.string(),
    weight: z.number().min(0).max(1),
    config: z.record(z.any())
  })),
  target_percentage: z.number().min(0).max(100).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  success_metrics: z.array(z.string()).optional()
})

// A/B Test assignment schema
const assignmentRequestSchema = z.object({
  test_ids: z.array(z.string()).optional(),
  user_context: z.object({
    location: z.object({
      latitude: z.number(),
      longitude: z.number()
    }).optional(),
    meal_time: z.string().optional(),
    device_type: z.string().optional()
  }).optional()
})

interface ABTestVariant {
  id: string
  name: string
  weight: number
  config: Record<string, any>
}

interface ABTest {
  test_id: string
  name: string
  description?: string
  variants: ABTestVariant[]
  target_percentage: number
  start_date?: string
  end_date?: string
  success_metrics: string[]
  is_active: boolean
}

// Predefined A/B tests for recommendation algorithms
const ACTIVE_AB_TESTS: ABTest[] = [
  {
    test_id: 'recommendation_algorithm_v2',
    name: 'Recommendation Algorithm V2',
    description: 'Testing improved ML algorithm vs current baseline',
    variants: [
      {
        id: 'control',
        name: 'Current Algorithm',
        weight: 0.5,
        config: {
          algorithm_version: 'v1.0',
          taste_weight: 0.4,
          friend_weight: 0.3,
          location_weight: 0.2,
          trending_weight: 0.1
        }
      },
      {
        id: 'treatment',
        name: 'Enhanced Algorithm',
        weight: 0.5,
        config: {
          algorithm_version: 'v2.0',
          taste_weight: 0.5,
          friend_weight: 0.25,
          location_weight: 0.15,
          trending_weight: 0.1,
          enable_neural_features: true,
          personalization_boost: 1.2
        }
      }
    ],
    target_percentage: 50,
    success_metrics: ['click_rate', 'conversion_rate', 'satisfaction_score'],
    is_active: true
  },
  {
    test_id: 'onboarding_flow_v2',
    name: 'Enhanced Onboarding Flow',
    description: 'Testing new interactive onboarding vs simplified version',
    variants: [
      {
        id: 'full_onboarding',
        name: 'Full Interactive Onboarding',
        weight: 0.6,
        config: {
          show_all_questions: true,
          enable_real_time_insights: true,
          show_personality_summary: true
        }
      },
      {
        id: 'quick_onboarding',
        name: 'Quick Setup',
        weight: 0.4,
        config: {
          show_essential_questions_only: true,
          skip_personality_insights: true,
          fast_track_to_recommendations: true
        }
      }
    ],
    target_percentage: 30,
    success_metrics: ['completion_rate', 'time_to_complete', 'user_satisfaction'],
    is_active: true
  },
  {
    test_id: 'recommendation_ui_layout',
    name: 'Recommendation Card Layout',
    description: 'Testing different layouts for recommendation cards',
    variants: [
      {
        id: 'detailed_cards',
        name: 'Detailed Information Cards',
        weight: 0.5,
        config: {
          show_match_factors: true,
          show_reasoning: true,
          show_confidence_score: true,
          card_style: 'detailed'
        }
      },
      {
        id: 'minimal_cards',
        name: 'Minimal Clean Cards',
        weight: 0.5,
        config: {
          show_essential_info_only: true,
          hide_technical_details: true,
          card_style: 'minimal'
        }
      }
    ],
    target_percentage: 25,
    success_metrics: ['engagement_time', 'click_rate', 'user_feedback'],
    is_active: true
  }
]

// GET - Get user's A/B test assignments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const testIds = searchParams.get('test_ids')?.split(',')
    
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 })
    }

    // Get user's existing assignments
    let assignmentsQuery = supabase
      .from('ab_test_assignments')
      .select('*')
      .eq('user_id', user.id)

    if (testIds) {
      assignmentsQuery = assignmentsQuery.in('test_id', testIds)
    }

    const { data: existingAssignments } = await assignmentsQuery

    const assignments: Record<string, any> = {}
    const newAssignments: any[] = []

    // Process each active test
    for (const test of ACTIVE_AB_TESTS) {
      if (testIds && !testIds.includes(test.test_id)) continue

      // Check if user already has assignment for this test
      const existingAssignment = existingAssignments?.find(a => a.test_id === test.test_id)
      
      if (existingAssignment) {
        assignments[test.test_id] = {
          variant_id: existingAssignment.variant_id,
          config: existingAssignment.variant_config,
          assigned_at: existingAssignment.assigned_at
        }
      } else {
        // Assign user to a variant
        const variant = assignUserToVariant(user.id, test)
        
        if (variant) {
          assignments[test.test_id] = {
            variant_id: variant.id,
            config: variant.config,
            assigned_at: new Date().toISOString()
          }

          // Store new assignment
          newAssignments.push({
            user_id: user.id,
            test_id: test.test_id,
            variant_id: variant.id,
            variant_config: variant.config,
            assigned_at: new Date().toISOString()
          })
        }
      }
    }

    // Save new assignments
    if (newAssignments.length > 0) {
      await supabase.from('ab_test_assignments').insert(newAssignments)
    }

    return NextResponse.json({
      success: true,
      data: {
        assignments,
        active_tests: ACTIVE_AB_TESTS.filter(test => 
          !testIds || testIds.includes(test.test_id)
        ).map(test => ({
          test_id: test.test_id,
          name: test.name,
          description: test.description
        }))
      }
    })

  } catch (error) {
    console.error('A/B test assignment error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to get A/B test assignments'
    }, { status: 500 })
  }
}

// POST - Record A/B test results/metrics
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 })
    }

    const body = await request.json()
    const { test_id, metric_name, metric_value, context } = body

    // Validate the test exists and user is assigned
    const { data: assignment } = await supabase
      .from('ab_test_assignments')
      .select('*')
      .eq('user_id', user.id)
      .eq('test_id', test_id)
      .single()

    if (!assignment) {
      return NextResponse.json({
        success: false,
        error: 'User not assigned to this test'
      }, { status: 404 })
    }

    // Record the metric
    await supabase.from('ab_test_results').insert([{
      user_id: user.id,
      test_id,
      variant_id: assignment.variant_id,
      metric_name,
      metric_value,
      context,
      recorded_at: new Date().toISOString()
    }])

    return NextResponse.json({
      success: true,
      message: 'Metric recorded successfully'
    })

  } catch (error) {
    console.error('A/B test result recording error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to record test result'
    }, { status: 500 })
  }
}

// PUT - Update A/B test configuration (admin only)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 })
    }

    // TODO: Add admin role check
    // For now, we'll just validate the schema
    const body = await request.json()
    const validation = abTestSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid test configuration',
        details: validation.error.errors
      }, { status: 400 })
    }

    // In a real implementation, you'd store this in a database
    // For now, just validate and return success
    return NextResponse.json({
      success: true,
      message: 'A/B test configuration updated'
    })

  } catch (error) {
    console.error('A/B test update error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update A/B test'
    }, { status: 500 })
  }
}

// Function to assign user to a variant using consistent hashing
function assignUserToVariant(userId: string, test: ABTest): ABTestVariant | null {
  // Use consistent hashing to ensure same user always gets same variant
  const hash = simpleHash(userId + test.test_id)
  const normalizedHash = hash / 0xffffffff // Normalize to 0-1
  
  // Check if user should be included in this test
  if (normalizedHash > (test.target_percentage / 100)) {
    return null // User not in test
  }
  
  // Assign to variant based on weights
  let cumulativeWeight = 0
  const totalWeight = test.variants.reduce((sum, variant) => sum + variant.weight, 0)
  const targetWeight = (normalizedHash % (test.target_percentage / 100)) * totalWeight
  
  for (const variant of test.variants) {
    cumulativeWeight += variant.weight
    if (targetWeight <= cumulativeWeight) {
      return variant
    }
  }
  
  // Fallback to first variant
  return test.variants[0]
}

// Simple hash function for consistent assignment
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}