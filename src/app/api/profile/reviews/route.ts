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
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    // Filters
    const search = searchParams.get('search');
    const dateRange = searchParams.get('dateRange');
    const rating = searchParams.get('rating');
    const cuisine = searchParams.get('cuisine');
    const sortBy = searchParams.get('sortBy') || 'experienced_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    let query = supabase
      .from('food_experiences')
      .select(`
        *,
        restaurant:restaurants(id, name, cuisine_types, address, city),
        taste_experience:taste_experiences(*)
      `, { count: 'exact' })
      .eq('user_id', user.id);

    // Apply filters
    if (search) {
      query = query.or(`dish_name.ilike.%${search}%,custom_notes.ilike.%${search}%`);
    }

    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let cutoffDate: Date;
      
      switch (dateRange) {
        case 'week':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = new Date(0);
      }
      
      query = query.gte('experienced_at', cutoffDate.toISOString());
    }

    if (rating && rating !== 'all') {
      switch (rating) {
        case '5':
          query = query.eq('overall_rating', 5);
          break;
        case '4+':
          query = query.gte('overall_rating', 4);
          break;
        case '3+':
          query = query.gte('overall_rating', 3);
          break;
      }
    }

    // Apply sorting
    const ascending = sortOrder === 'asc';
    switch (sortBy) {
      case 'rating':
        query = query.order('overall_rating', { ascending });
        break;
      case 'restaurant':
        // This requires a join, so we'll sort in memory for now
        query = query.order('experienced_at', { ascending: false });
        break;
      default:
        query = query.order('experienced_at', { ascending });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: experiences, error: experiencesError, count } = await query;

    if (experiencesError) {
      console.error('Error fetching experiences:', experiencesError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    // If sorting by restaurant, do it in memory
    let sortedExperiences = experiences || [];
    if (sortBy === 'restaurant') {
      sortedExperiences.sort((a, b) => {
        const nameA = a.restaurant?.name || '';
        const nameB = b.restaurant?.name || '';
        const comparison = nameA.localeCompare(nameB);
        return ascending ? comparison : -comparison;
      });
    }

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return NextResponse.json({
      success: true,
      data: sortedExperiences,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext,
        hasPrevious
      }
    });

  } catch (error) {
    console.error('Error in profile reviews API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const reviewId = searchParams.get('id');

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required' },
        { status: 400 }
      );
    }

    // Verify the review belongs to the user
    const { data: review, error: reviewError } = await supabase
      .from('food_experiences')
      .select('id, user_id')
      .eq('id', reviewId)
      .eq('user_id', user.id)
      .single();

    if (reviewError || !review) {
      return NextResponse.json(
        { success: false, error: 'Review not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete related taste experience first
    await supabase
      .from('taste_experiences')
      .delete()
      .eq('food_experience_id', reviewId);

    // Delete the review
    const { error: deleteError } = await supabase
      .from('food_experiences')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting review:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete review' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Error in delete review API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}