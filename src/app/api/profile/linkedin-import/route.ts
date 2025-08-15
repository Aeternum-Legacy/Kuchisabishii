/**
 * LinkedIn Profile Import API Route
 * Handles importing LinkedIn profile data into user profiles
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { 
  LinkedInProfileData, 
  parseLinkedInProfile, 
  validateLinkedInData,
  generateTasteProfileFromLinkedIn,
  getProfessionalFoodContext,
  aaronTongLinkedInData
} from '@/lib/linkedin/profile-import';

// LinkedIn import validation schema
const linkedInImportSchema = z.object({
  linkedInData: z.object({
    fullName: z.string().min(1),
    title: z.string().min(1),
    location: z.string().min(1),
    bio: z.string().min(1),
    languages: z.array(z.object({
      name: z.string(),
      proficiency: z.enum(['Native', 'Bilingual', 'Full Professional', 'Professional Working', 'Limited Working', 'Elementary'])
    })),
    skills: z.array(z.string()),
    education: z.array(z.object({
      school: z.string(),
      years: z.string(),
      degree: z.string().optional(),
      field: z.string().optional()
    })),
    experience: z.array(z.object({
      company: z.string(),
      position: z.string(),
      duration: z.string(),
      description: z.string().optional()
    })),
    certifications: z.array(z.string())
  }),
  importMode: z.enum(['replace', 'merge']).default('merge')
});

// GET - Retrieve Aaron Tong's LinkedIn profile data (demo endpoint)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');
    
    // For demo purposes, return Aaron Tong's data
    if (profileId === 'aaron-tong' || !profileId) {
      return NextResponse.json({
        success: true,
        data: {
          linkedInProfile: aaronTongLinkedInData,
          mappedProfile: parseLinkedInProfile(aaronTongLinkedInData),
          tasteInsights: generateTasteProfileFromLinkedIn(aaronTongLinkedInData),
          professionalContext: getProfessionalFoodContext(aaronTongLinkedInData)
        }
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Profile not found'
    }, { status: 404 });

  } catch (error) {
    console.error('LinkedIn profile fetch error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch LinkedIn profile'
    }, { status: 500 });
  }
}

// POST - Import LinkedIn profile data to user profile
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 });
    }

    const body = await request.json();
    const validation = linkedInImportSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid LinkedIn data format',
        details: validation.error.errors
      }, { status: 400 });
    }

    const { linkedInData, importMode } = validation.data;

    // Validate LinkedIn data structure
    if (!validateLinkedInData(linkedInData)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid LinkedIn profile data structure'
      }, { status: 400 });
    }

    // Parse LinkedIn data
    const mappedProfile = parseLinkedInProfile(linkedInData);
    const tasteInsights = generateTasteProfileFromLinkedIn(linkedInData);
    const professionalContext = getProfessionalFoodContext(linkedInData);

    // Get current profile
    const { data: currentProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Failed to fetch current profile:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch current profile'
      }, { status: 500 });
    }

    // Prepare profile updates
    const profileUpdates = {
      display_name: mappedProfile.display_name,
      bio: mappedProfile.bio,
      location: mappedProfile.location,
      linkedin_imported: true,
      linkedin_data: linkedInData,
      professional_title: mappedProfile.professional_title,
      credentials: mappedProfile.credentials,
      updated_at: new Date().toISOString()
    };

    // Merge with existing data if mode is 'merge'
    if (importMode === 'merge' && currentProfile) {
      // Keep existing dietary restrictions and preferences if they exist
      const currentProfileAny = currentProfile as any;
      if (currentProfileAny.dietary_restrictions) {
        (profileUpdates as any).dietary_restrictions = currentProfileAny.dietary_restrictions;
      }
      if (currentProfileAny.allergies) {
        (profileUpdates as any).allergies = currentProfileAny.allergies;
      }
      if (currentProfileAny.spice_tolerance) {
        (profileUpdates as any).spice_tolerance = currentProfileAny.spice_tolerance;
      }
      if (currentProfileAny.sweetness_preference) {
        (profileUpdates as any).sweetness_preference = currentProfileAny.sweetness_preference;
      }
    }

    // Update user profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('user_profiles')
      .upsert(profileUpdates)
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update profile:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Failed to update profile'
      }, { status: 500 });
    }

    // Update or create taste profile with LinkedIn insights
    const tasteProfileUpdates = {
      user_id: user.id,
      culinary_adventurousness: tasteInsights.culinary_adventurousness,
      linkedin_derived: true,
      professional_context: professionalContext,
      preference_notes: tasteInsights.preference_notes,
      updated_at: new Date().toISOString()
    };

    const { data: tasteProfile, error: tasteError } = await supabase
      .from('taste_profiles')
      .upsert(tasteProfileUpdates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (tasteError) {
      console.error('Failed to update taste profile:', tasteError);
      // Don't fail the entire import if taste profile update fails
    }

    return NextResponse.json({
      success: true,
      data: {
        profile: updatedProfile,
        tasteProfile,
        linkedInData,
        mappedProfile,
        tasteInsights,
        professionalContext
      },
      message: 'LinkedIn profile imported successfully'
    });

  } catch (error) {
    console.error('LinkedIn import error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// PUT - Update LinkedIn profile data
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 });
    }

    const body = await request.json();
    const { linkedInData } = body;

    if (!validateLinkedInData(linkedInData)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid LinkedIn profile data'
      }, { status: 400 });
    }

    // Update the LinkedIn data in the profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('user_profiles')
      .update({
        linkedin_data: linkedInData,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update LinkedIn data:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Failed to update LinkedIn data'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: { profile: updatedProfile },
      message: 'LinkedIn data updated successfully'
    });

  } catch (error) {
    console.error('LinkedIn update error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// DELETE - Remove LinkedIn integration
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated'
      }, { status: 401 });
    }

    // Remove LinkedIn data from profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('user_profiles')
      .update({
        linkedin_imported: false,
        linkedin_data: null,
        professional_title: null,
        credentials: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to remove LinkedIn integration:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Failed to remove LinkedIn integration'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: { profile: updatedProfile },
      message: 'LinkedIn integration removed successfully'
    });

  } catch (error) {
    console.error('LinkedIn removal error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}