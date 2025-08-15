import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/lib/supabase/types';

type FoodExperience = Database['public']['Tables']['food_experiences']['Row'];
type Restaurant = Database['public']['Tables']['restaurants']['Row'];

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
    const timeframe = searchParams.get('timeframe') || 'all'; // all, year, month

    // Calculate date filter
    let dateFilter = '';
    const now = new Date();
    if (timeframe === 'year') {
      const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      dateFilter = yearAgo.toISOString();
    } else if (timeframe === 'month') {
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      dateFilter = monthAgo.toISOString();
    }

    // Build query
    let query = supabase
      .from('food_experiences')
      .select(`
        *,
        restaurant:restaurants(id, name, cuisine_types),
        taste_experience:taste_experiences(*)
      `)
      .eq('user_id', user.id);

    if (dateFilter) {
      query = query.gte('experienced_at', dateFilter);
    }

    const { data: experiences, error: experiencesError } = await query
      .order('experienced_at', { ascending: false });

    if (experiencesError) {
      console.error('Error fetching experiences:', experiencesError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch experiences' },
        { status: 500 }
      );
    }

    // Calculate statistics
    const stats = calculateUserStatistics(experiences || []);

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error in profile statistics API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function calculateUserStatistics(experiences: Record<string, unknown>[]) {
  const totalReviews = experiences.length;
  const totalPhotos = experiences.reduce((sum, exp) => sum + (exp.photos?.length || 0), 0);
  
  // Calculate average rating
  const ratingsSum = experiences.reduce((sum, exp) => sum + (exp.overall_rating || 0), 0);
  const averageRating = totalReviews > 0 ? Number((ratingsSum / totalReviews).toFixed(1)) : 0;

  // Count unique restaurants
  const uniqueRestaurants = new Set(
    experiences
      .filter(exp => exp.restaurant?.id)
      .map(exp => exp.restaurant.id)
  );
  const totalRestaurants = uniqueRestaurants.size;

  // Cuisine analysis
  const cuisineCount: Record<string, number> = {};
  experiences.forEach(exp => {
    if (exp.restaurant?.cuisine_types) {
      exp.restaurant.cuisine_types.forEach((cuisine: string) => {
        cuisineCount[cuisine] = (cuisineCount[cuisine] || 0) + 1;
      });
    }
  });

  const favoriteCuisines = Object.entries(cuisineCount)
    .map(([cuisine, count]) => ({
      cuisine,
      count,
      percentage: totalReviews > 0 ? Number(((count / totalReviews) * 100).toFixed(1)) : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Monthly trends (last 6 months)
  const monthlyTrends = calculateMonthlyTrends(experiences);

  // Mock achievements (in a real app, these would be calculated based on actual data)
  const achievements = calculateAchievements(totalReviews, totalRestaurants, totalPhotos);

  // Taste evolution (simplified calculation)
  const tasteEvolution = calculateTasteEvolution(experiences);

  return {
    totalReviews,
    averageRating,
    totalRestaurants,
    totalPhotos,
    favoriteCuisines,
    monthlyTrends,
    achievements,
    tasteEvolution
  };
}

function calculateMonthlyTrends(experiences: Record<string, unknown>[]) {
  const monthlyData: Record<string, { reviews: number; ratings: number[] }> = {};
  
  experiences.forEach(exp => {
    const date = new Date(exp.experienced_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { reviews: 0, ratings: [] };
    }
    
    monthlyData[monthKey].reviews++;
    if (exp.overall_rating) {
      monthlyData[monthKey].ratings.push(exp.overall_rating);
    }
  });

  return Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6) // Last 6 months
    .map(([monthKey, data]) => {
      const date = new Date(monthKey + '-01');
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const avgRating = data.ratings.length > 0 
        ? Number((data.ratings.reduce((sum, rating) => sum + rating, 0) / data.ratings.length).toFixed(1))
        : 0;
      
      return {
        month,
        reviews: data.reviews,
        rating: avgRating
      };
    });
}

function calculateAchievements(totalReviews: number, totalRestaurants: number, totalPhotos: number) {
  const achievements = [];
  
  if (totalReviews >= 1) {
    achievements.push({
      id: 'first_review',
      title: 'First Review',
      description: 'Posted your first food review',
      unlockedAt: new Date().toISOString().split('T')[0]
    });
  }
  
  if (totalReviews >= 10) {
    achievements.push({
      id: 'reviewer',
      title: 'Active Reviewer',
      description: 'Posted 10 food reviews',
      unlockedAt: new Date().toISOString().split('T')[0]
    });
  }
  
  if (totalReviews >= 50) {
    achievements.push({
      id: 'critic',
      title: 'Food Critic',
      description: 'Posted 50 reviews',
      unlockedAt: new Date().toISOString().split('T')[0]
    });
  }
  
  if (totalRestaurants >= 25) {
    achievements.push({
      id: 'explorer',
      title: 'Restaurant Explorer',
      description: 'Visited 25 different restaurants',
      unlockedAt: new Date().toISOString().split('T')[0]
    });
  }
  
  if (totalPhotos >= 100) {
    achievements.push({
      id: 'photographer',
      title: 'Food Photographer',
      description: 'Uploaded 100 food photos',
      unlockedAt: new Date().toISOString().split('T')[0]
    });
  }

  return achievements;
}

function calculateTasteEvolution(experiences: Record<string, unknown>[]) {
  // Simplified calculation - in a real app, this would be more sophisticated
  const monthlyData: Record<string, { adventurousness: number[]; consistency: number[] }> = {};
  
  experiences.forEach(exp => {
    const date = new Date(exp.experienced_at);
    const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { adventurousness: [], consistency: [] };
    }
    
    // Mock adventurousness calculation (would be based on cuisine variety, new restaurants, etc.)
    const adventurousness = Math.random() * 2 + 3; // 3-5 range
    monthlyData[monthKey].adventurousness.push(adventurousness);
    
    // Mock consistency calculation (would be based on rating variance, etc.)
    const consistency = Math.random() * 1 + 3.5; // 3.5-4.5 range
    monthlyData[monthKey].consistency.push(consistency);
  });

  return Object.entries(monthlyData)
    .slice(-6) // Last 6 months
    .map(([month, data]) => ({
      month,
      adventurousness: data.adventurousness.length > 0 
        ? Number((data.adventurousness.reduce((sum, val) => sum + val, 0) / data.adventurousness.length).toFixed(1))
        : 0,
      consistency: data.consistency.length > 0 
        ? Number((data.consistency.reduce((sum, val) => sum + val, 0) / data.consistency.length).toFixed(1))
        : 0
    }));
}