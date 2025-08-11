-- Performance Optimizations and Advanced Features for Kuchisabishii
-- Database optimizations, advanced indexes, and additional utility functions

-- Enable required extensions for advanced features
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Advanced composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_food_entries_user_rating_date 
    ON public.food_entries(user_id, rating DESC, consumed_at DESC) 
    WHERE is_public = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_food_entries_restaurant_rating_date 
    ON public.food_entries(restaurant_id, rating DESC, consumed_at DESC) 
    WHERE is_public = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurants_location_rating 
    ON public.restaurants(latitude, longitude, rating DESC) 
    WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurants_cuisine_price_rating 
    ON public.restaurants USING GIN(cuisine_types, price_range, rating) 
    WHERE is_active = true;

-- Advanced search indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_food_entries_tags_gin 
    ON public.food_entries USING GIN(tags) 
    WHERE is_public = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_food_entries_ingredients_gin 
    ON public.food_entries USING GIN(ingredients) 
    WHERE is_public = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_emotional_experiences_emotions_gin 
    ON public.emotional_experiences USING GIN(pre_meal_emotions, post_meal_emotions);

-- Partial indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_featured_recent 
    ON public.reviews(created_at DESC) 
    WHERE is_featured = true AND is_public = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active_public 
    ON public.users(created_at DESC) 
    WHERE privacy_level = 'public';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_friendships_accepted 
    ON public.friendships(requester_id, addressee_id) 
    WHERE status = 'accepted';

-- Expression indexes for computed values
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_restaurants_avg_rating 
    ON public.restaurants((rating::integer)) 
    WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_food_entries_month_year 
    ON public.food_entries(DATE_TRUNC('month', consumed_at)) 
    WHERE is_public = true;

-- Advanced analytics tables for performance

-- Pre-computed user statistics
CREATE TABLE IF NOT EXISTS public.user_statistics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    computed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Experience metrics
    total_experiences INTEGER DEFAULT 0,
    public_experiences INTEGER DEFAULT 0,
    total_restaurants INTEGER DEFAULT 0,
    favorite_cuisines JSONB DEFAULT '{}'::jsonb,
    average_rating DECIMAL(3,2) DEFAULT 0,
    
    -- Social metrics
    friend_count INTEGER DEFAULT 0,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    shared_experiences INTEGER DEFAULT 0,
    
    -- Emotional metrics
    happiness_score DECIMAL(4,2) DEFAULT 0,
    comfort_food_frequency DECIMAL(4,2) DEFAULT 0,
    adventurousness_score DECIMAL(4,2) DEFAULT 0,
    social_dining_preference DECIMAL(4,2) DEFAULT 0,
    
    -- Activity metrics
    weekly_activity JSONB DEFAULT '{}'::jsonb,
    monthly_activity JSONB DEFAULT '{}'::jsonb,
    last_activity_date DATE,
    most_active_time_of_day TIME,
    
    -- Quality metrics
    photo_quality_average DECIMAL(3,2) DEFAULT 0,
    review_helpfulness_score DECIMAL(3,2) DEFAULT 0,
    completeness_score DECIMAL(3,2) DEFAULT 0,
    
    UNIQUE(user_id)
);

-- Pre-computed restaurant analytics
CREATE TABLE IF NOT EXISTS public.restaurant_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    computed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Rating analytics
    rating_distribution JSONB DEFAULT '{}'::jsonb, -- {1: 5, 2: 10, 3: 25, 4: 40, 5: 20}
    average_food_rating DECIMAL(3,2) DEFAULT 0,
    average_service_rating DECIMAL(3,2) DEFAULT 0,
    average_atmosphere_rating DECIMAL(3,2) DEFAULT 0,
    
    -- Visit patterns
    peak_hours JSONB DEFAULT '{}'::jsonb,
    peak_days JSONB DEFAULT '{}'::jsonb,
    seasonal_patterns JSONB DEFAULT '{}'::jsonb,
    average_party_size DECIMAL(3,2) DEFAULT 0,
    
    -- Popular items
    most_photographed_dishes JSONB DEFAULT '{}'::jsonb,
    highest_rated_dishes JSONB DEFAULT '{}'::jsonb,
    most_mentioned_ingredients JSONB DEFAULT '{}'::jsonb,
    
    -- Sentiment analysis
    positive_emotion_frequency DECIMAL(4,2) DEFAULT 0,
    comfort_food_rating DECIMAL(4,2) DEFAULT 0,
    special_occasion_frequency DECIMAL(4,2) DEFAULT 0,
    
    -- Demographics
    visitor_age_distribution JSONB DEFAULT '{}'::jsonb,
    repeat_visitor_rate DECIMAL(4,2) DEFAULT 0,
    recommendation_rate DECIMAL(4,2) DEFAULT 0,
    
    UNIQUE(restaurant_id)
);

-- Trending analysis table
CREATE TABLE IF NOT EXISTS public.trending_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL CHECK (category IN (
        'restaurants', 'cuisines', 'dishes', 'ingredients', 'emotions', 'locations'
    )),
    item_name TEXT NOT NULL,
    time_period TEXT NOT NULL CHECK (time_period IN ('hour', 'day', 'week', 'month')),
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Trending metrics
    mention_count INTEGER DEFAULT 0,
    unique_users INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    growth_rate DECIMAL(5,2), -- Percentage growth from previous period
    trend_score DECIMAL(5,2), -- Calculated trending score
    
    -- Context data
    geographic_data JSONB DEFAULT '{}'::jsonb,
    demographic_data JSONB DEFAULT '{}'::jsonb,
    sentiment_data JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    UNIQUE(category, item_name, time_period, period_start)
);

-- Media records table for storing AI analysis results
CREATE TABLE IF NOT EXISTS public.media_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    food_experience_id UUID REFERENCES public.food_entries(id) ON DELETE SET NULL,
    
    -- Media details
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
    file_name TEXT,
    content_type TEXT,
    file_size INTEGER,
    
    -- AI Analysis results
    ai_analysis JSONB DEFAULT '{}'::jsonb,
    processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    analysis_confidence DECIMAL(3,2),
    
    -- Extracted data
    detected_foods JSONB DEFAULT '{}'::jsonb,
    nutrition_estimate JSONB DEFAULT '{}'::jsonb,
    aesthetic_score DECIMAL(3,2),
    color_palette JSONB DEFAULT '{}'::jsonb,
    
    -- Metadata
    camera_metadata JSONB DEFAULT '{}'::jsonb,
    location_data JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    analyzed_at TIMESTAMP WITH TIME ZONE
);

-- Performance monitoring table
CREATE TABLE IF NOT EXISTS public.performance_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_type TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(10,4) NOT NULL,
    metric_unit TEXT,
    
    -- Context
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    endpoint TEXT,
    query_type TEXT,
    response_time_ms INTEGER,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_user_statistics_user_id ON public.user_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_statistics_computed_at ON public.user_statistics(computed_at DESC);

CREATE INDEX IF NOT EXISTS idx_restaurant_analytics_restaurant_id ON public.restaurant_analytics(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_analytics_computed_at ON public.restaurant_analytics(computed_at DESC);

CREATE INDEX IF NOT EXISTS idx_trending_analysis_category_period ON public.trending_analysis(category, time_period, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_trending_analysis_trend_score ON public.trending_analysis(trend_score DESC);

CREATE INDEX IF NOT EXISTS idx_media_records_user_id ON public.media_records(user_id);
CREATE INDEX IF NOT EXISTS idx_media_records_food_experience_id ON public.media_records(food_experience_id);
CREATE INDEX IF NOT EXISTS idx_media_records_status ON public.media_records(processing_status);
CREATE INDEX IF NOT EXISTS idx_media_records_created_at ON public.media_records(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_type_name ON public.performance_metrics(metric_type, metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_created_at ON public.performance_metrics(created_at DESC);

-- Advanced functions for analytics and optimization

-- Function to compute user statistics
CREATE OR REPLACE FUNCTION compute_user_statistics(target_user_id UUID)
RETURNS VOID AS $$
DECLARE
    stats_record RECORD;
    experience_count INTEGER;
    restaurant_count INTEGER;
    friend_count INTEGER;
    avg_rating DECIMAL;
    cuisines_json JSONB;
    emotional_metrics RECORD;
BEGIN
    -- Calculate basic experience metrics
    SELECT 
        COUNT(*) as total_exp,
        COUNT(DISTINCT restaurant_id) as unique_restaurants,
        AVG(rating) as avg_rating,
        COUNT(*) FILTER (WHERE is_public = true) as public_exp
    INTO experience_count, restaurant_count, avg_rating, experience_count
    FROM public.food_entries 
    WHERE user_id = target_user_id;

    -- Calculate friend metrics
    SELECT COUNT(*) INTO friend_count
    FROM public.friendships
    WHERE (requester_id = target_user_id OR addressee_id = target_user_id)
    AND status = 'accepted';

    -- Calculate favorite cuisines
    SELECT jsonb_agg(
        jsonb_build_object(
            'cuisine', cuisine,
            'count', cuisine_count,
            'avg_rating', avg_cuisine_rating
        )
    ) INTO cuisines_json
    FROM (
        SELECT 
            unnest(r.cuisine_types) as cuisine,
            COUNT(*) as cuisine_count,
            AVG(fe.rating) as avg_cuisine_rating
        FROM public.food_entries fe
        JOIN public.restaurants r ON fe.restaurant_id = r.id
        WHERE fe.user_id = target_user_id
        GROUP BY cuisine
        ORDER BY cuisine_count DESC
        LIMIT 10
    ) cuisine_stats;

    -- Calculate emotional metrics
    SELECT 
        AVG(post_meal_mood_level) as happiness,
        AVG(comfort_factor::DECIMAL) as comfort_freq,
        COUNT(*) FILTER (WHERE 'adventurous' = ANY(post_meal_emotions)) / GREATEST(COUNT(*)::DECIMAL, 1) as adventurousness
    INTO emotional_metrics
    FROM public.emotional_experiences 
    WHERE user_id = target_user_id;

    -- Upsert statistics
    INSERT INTO public.user_statistics (
        user_id,
        total_experiences,
        total_restaurants,
        favorite_cuisines,
        average_rating,
        friend_count,
        happiness_score,
        comfort_food_frequency,
        adventurousness_score
    ) VALUES (
        target_user_id,
        COALESCE(experience_count, 0),
        COALESCE(restaurant_count, 0),
        COALESCE(cuisines_json, '{}'::jsonb),
        COALESCE(avg_rating, 0),
        COALESCE(friend_count, 0),
        COALESCE(emotional_metrics.happiness, 0),
        COALESCE(emotional_metrics.comfort_freq, 0),
        COALESCE(emotional_metrics.adventurousness, 0)
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        total_experiences = EXCLUDED.total_experiences,
        total_restaurants = EXCLUDED.total_restaurants,
        favorite_cuisines = EXCLUDED.favorite_cuisines,
        average_rating = EXCLUDED.average_rating,
        friend_count = EXCLUDED.friend_count,
        happiness_score = EXCLUDED.happiness_score,
        comfort_food_frequency = EXCLUDED.comfort_food_frequency,
        adventurousness_score = EXCLUDED.adventurousness_score,
        computed_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to analyze trending items
CREATE OR REPLACE FUNCTION analyze_trending_items(
    analysis_category TEXT,
    time_period TEXT DEFAULT 'day',
    lookback_periods INTEGER DEFAULT 7
)
RETURNS INTEGER AS $$
DECLARE
    period_interval INTERVAL;
    current_period_start TIMESTAMP WITH TIME ZONE;
    current_period_end TIMESTAMP WITH TIME ZONE;
    previous_period_start TIMESTAMP WITH TIME ZONE;
    previous_period_end TIMESTAMP WITH TIME ZONE;
    inserted_count INTEGER := 0;
BEGIN
    -- Set period interval
    period_interval := CASE time_period
        WHEN 'hour' THEN '1 hour'::INTERVAL
        WHEN 'day' THEN '1 day'::INTERVAL
        WHEN 'week' THEN '1 week'::INTERVAL
        WHEN 'month' THEN '1 month'::INTERVAL
        ELSE '1 day'::INTERVAL
    END;

    -- Calculate time ranges
    current_period_end := DATE_TRUNC(time_period, NOW());
    current_period_start := current_period_end - period_interval;
    previous_period_end := current_period_start;
    previous_period_start := previous_period_end - period_interval;

    -- Analyze based on category
    IF analysis_category = 'restaurants' THEN
        WITH current_mentions AS (
            SELECT 
                r.name,
                COUNT(*) as mention_count,
                COUNT(DISTINCT fe.user_id) as unique_users,
                AVG(fe.rating) as avg_rating
            FROM public.food_entries fe
            JOIN public.restaurants r ON fe.restaurant_id = r.id
            WHERE fe.consumed_at >= current_period_start 
            AND fe.consumed_at < current_period_end
            AND fe.is_public = true
            GROUP BY r.id, r.name
            HAVING COUNT(*) >= 2
        ),
        previous_mentions AS (
            SELECT 
                r.name,
                COUNT(*) as mention_count
            FROM public.food_entries fe
            JOIN public.restaurants r ON fe.restaurant_id = r.id
            WHERE fe.consumed_at >= previous_period_start 
            AND fe.consumed_at < previous_period_end
            AND fe.is_public = true
            GROUP BY r.id, r.name
        )
        INSERT INTO public.trending_analysis (
            category, item_name, time_period, period_start, period_end,
            mention_count, unique_users, average_rating, growth_rate, trend_score
        )
        SELECT 
            analysis_category,
            c.name,
            time_period,
            current_period_start,
            current_period_end,
            c.mention_count,
            c.unique_users,
            c.avg_rating,
            CASE WHEN COALESCE(p.mention_count, 0) > 0 
                THEN ((c.mention_count - COALESCE(p.mention_count, 0))::DECIMAL / p.mention_count * 100)
                ELSE 100 
            END as growth_rate,
            (c.mention_count * 0.4 + c.unique_users * 0.3 + c.avg_rating * 0.3) as trend_score
        FROM current_mentions c
        LEFT JOIN previous_mentions p ON c.name = p.name
        ORDER BY trend_score DESC
        LIMIT 50;
        
        GET DIAGNOSTICS inserted_count = ROW_COUNT;
    END IF;

    -- Similar analysis for other categories would go here...

    RETURN inserted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to optimize queries based on usage patterns
CREATE OR REPLACE FUNCTION optimize_query_performance()
RETURNS TEXT AS $$
DECLARE
    optimization_report TEXT := '';
    slow_queries RECORD;
BEGIN
    -- Analyze slow queries from pg_stat_statements
    FOR slow_queries IN
        SELECT 
            query,
            calls,
            total_time / calls as avg_time,
            stddev_time,
            (total_time / sum(total_time) OVER()) * 100 as pct_total_time
        FROM pg_stat_statements
        WHERE calls > 10
        ORDER BY total_time DESC
        LIMIT 10
    LOOP
        optimization_report := optimization_report || 
            format('Query: %s | Avg Time: %s ms | Calls: %s | %% Total: %s%%' || E'\n',
                   left(slow_queries.query, 100),
                   round(slow_queries.avg_time, 2),
                   slow_queries.calls,
                   round(slow_queries.pct_total_time, 2)
            );
    END LOOP;

    -- Update table statistics
    ANALYZE public.food_entries;
    ANALYZE public.restaurants;
    ANALYZE public.users;
    ANALYZE public.emotional_experiences;

    optimization_report := optimization_report || E'\nTable statistics updated.';

    RETURN optimization_report;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create materialized views for complex aggregations
CREATE MATERIALIZED VIEW IF NOT EXISTS public.restaurant_summary AS
SELECT 
    r.id,
    r.name,
    r.cuisine_types,
    r.city,
    r.price_range,
    r.rating,
    COUNT(fe.id) as experience_count,
    AVG(fe.rating) as avg_experience_rating,
    COUNT(DISTINCT fe.user_id) as unique_visitors,
    COUNT(rv.id) as review_count,
    AVG(rv.rating) as avg_review_rating,
    array_agg(DISTINCT fe.tags) FILTER (WHERE fe.tags IS NOT NULL) as popular_tags,
    COUNT(*) FILTER (WHERE fe.consumed_at >= NOW() - INTERVAL '30 days') as recent_visits
FROM public.restaurants r
LEFT JOIN public.food_entries fe ON r.id = fe.restaurant_id AND fe.is_public = true
LEFT JOIN public.reviews rv ON r.id = rv.restaurant_id AND rv.is_public = true
WHERE r.is_active = true
GROUP BY r.id, r.name, r.cuisine_types, r.city, r.price_range, r.rating;

-- Create unique index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_restaurant_summary_id ON public.restaurant_summary(id);

-- Create materialized view for user activity summary
CREATE MATERIALIZED VIEW IF NOT EXISTS public.user_activity_summary AS
SELECT 
    u.id,
    u.username,
    u.display_name,
    COUNT(fe.id) as total_experiences,
    COUNT(fe.id) FILTER (WHERE fe.consumed_at >= NOW() - INTERVAL '30 days') as recent_experiences,
    AVG(fe.rating) as avg_rating,
    COUNT(DISTINCT fe.restaurant_id) as restaurants_visited,
    array_agg(DISTINCT unnest(r.cuisine_types)) FILTER (WHERE r.cuisine_types IS NOT NULL) as tried_cuisines,
    COUNT(f.id) as friend_count,
    MAX(fe.consumed_at) as last_activity
FROM public.users u
LEFT JOIN public.food_entries fe ON u.id = fe.user_id AND fe.is_public = true
LEFT JOIN public.restaurants r ON fe.restaurant_id = r.id
LEFT JOIN public.friendships f ON (u.id = f.requester_id OR u.id = f.addressee_id) AND f.status = 'accepted'
WHERE u.privacy_level IN ('public', 'friends')
GROUP BY u.id, u.username, u.display_name;

-- Create unique index on user activity materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_activity_summary_id ON public.user_activity_summary(id);

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS TEXT AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.restaurant_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.user_activity_summary;
    
    RETURN 'Materialized views refreshed successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to clean up old data
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
    temp_count INTEGER;
BEGIN
    -- Clean up old recommendation interactions (older than 90 days)
    DELETE FROM public.recommendation_interactions 
    WHERE shown_at < NOW() - INTERVAL '90 days';
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    -- Clean up old search history (older than 180 days)
    DELETE FROM public.search_history 
    WHERE created_at < NOW() - INTERVAL '180 days';
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    -- Clean up old performance metrics (older than 30 days)
    DELETE FROM public.performance_metrics 
    WHERE created_at < NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    -- Clean up old trending analysis (older than 365 days)
    DELETE FROM public.trending_analysis 
    WHERE created_at < NOW() - INTERVAL '365 days';
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    -- Clean up expired recommendations
    DELETE FROM public.restaurant_recommendations 
    WHERE expires_at < NOW();
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for new tables
ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trending_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- User statistics policies
CREATE POLICY "Users can view own statistics" ON public.user_statistics
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can manage user statistics" ON public.user_statistics
    FOR ALL USING (auth.role() = 'service_role');

-- Restaurant analytics policies
CREATE POLICY "Public can view restaurant analytics" ON public.restaurant_analytics
    FOR SELECT USING (true);

CREATE POLICY "System can manage restaurant analytics" ON public.restaurant_analytics
    FOR ALL USING (auth.role() = 'service_role');

-- Trending analysis policies
CREATE POLICY "Public can view trending analysis" ON public.trending_analysis
    FOR SELECT USING (true);

CREATE POLICY "System can manage trending analysis" ON public.trending_analysis
    FOR ALL USING (auth.role() = 'service_role');

-- Media records policies
CREATE POLICY "Users can manage own media" ON public.media_records
    FOR ALL USING (user_id = auth.uid());

-- Performance metrics policies (admin only)
CREATE POLICY "Service role can manage performance metrics" ON public.performance_metrics
    FOR ALL USING (auth.role() = 'service_role');