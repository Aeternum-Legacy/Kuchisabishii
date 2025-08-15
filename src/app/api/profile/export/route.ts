import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json'; // json, csv

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Get taste profile
    const { data: tasteProfile, error: tasteError } = await supabase
      .from('taste_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Get all food experiences
    const { data: experiences, error: experiencesError } = await supabase
      .from('food_experiences')
      .select(`
        *,
        restaurant:restaurants(id, name, cuisine_types, address, city),
        taste_experience:taste_experiences(*)
      `)
      .eq('user_id', user.id)
      .order('experienced_at', { ascending: false });

    // Get friendships
    const { data: friendships, error: friendshipsError } = await supabase
      .from('friendships')
      .select(`
        *,
        requester:user_profiles!friendships_requester_id_fkey(id, display_name, username),
        addressee:user_profiles!friendships_addressee_id_fkey(id, display_name, username)
      `)
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq('status', 'accepted');

    if (format === 'csv') {
      return generateCSVExport(experiences || []);
    }

    // Default JSON export
    const exportData = {
      exportInfo: {
        exportDate: new Date().toISOString(),
        format: 'json',
        version: '1.0'
      },
      profile: profile || null,
      tasteProfile: tasteProfile || null,
      experiences: experiences || [],
      friendships: friendships || [],
      statistics: {
        totalReviews: experiences?.length || 0,
        totalRestaurants: new Set((experiences || []).map(e => e.restaurant?.id).filter(Boolean)).size,
        totalPhotos: (experiences || []).reduce((sum, exp) => sum + (exp.photos?.length || 0), 0),
        averageRating: experiences?.length 
          ? Number(((experiences.reduce((sum, exp) => sum + (exp.overall_rating || 0), 0) / experiences.length).toFixed(2)))
          : 0
      }
    };

    const response = new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="kuchisabishii-export-${new Date().toISOString().split('T')[0]}.json"`
      }
    });

    return response;

  } catch (error) {
    console.error('Error in export API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateCSVExport(experiences: Record<string, unknown>[]) {
  const csvHeaders = [
    'Date',
    'Dish Name',
    'Restaurant',
    'Cuisine Types',
    'Rating',
    'Price',
    'Meal Time',
    'Dining Method',
    'Notes',
    'Satisfaction Level',
    'Photos Count'
  ];

  const csvRows = experiences.map(exp => [
    new Date(exp.experienced_at).toLocaleDateString(),
    `"${exp.dish_name || ''}"`,
    `"${exp.restaurant?.name || ''}"`,
    `"${exp.restaurant?.cuisine_types?.join(', ') || ''}"`,
    exp.overall_rating || '',
    exp.amount_spent || '',
    exp.meal_time || '',
    exp.dining_method || '',
    `"${(exp.custom_notes || '').replace(/"/g, '""')}"`,
    exp.satisfaction_level || '',
    exp.photos?.length || 0
  ]);

  const csvContent = [
    csvHeaders.join(','),
    ...csvRows.map(row => row.join(','))
  ].join('\n');

  const response = new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="kuchisabishii-reviews-${new Date().toISOString().split('T')[0]}.csv"`
    }
  });

  return response;
}