-- AI and Machine Learning Tables
-- Extends the existing database schema with AI/ML specific tables

-- Table for storing ML training data
CREATE TABLE IF NOT EXISTS public.ml_training_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    data JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    model_version TEXT,
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Table for ML feedback from users
CREATE TABLE IF NOT EXISTS public.ml_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    recommendation_interaction_id UUID REFERENCES public.recommendation_interactions(id),
    feedback_type TEXT NOT NULL CHECK (feedback_type IN ('like', 'dislike', 'not_interested', 'visited', 'tried')),
    feedback_score DECIMAL(3,2) CHECK (feedback_score >= 0 AND feedback_score <= 1),
    feedback_context JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table for A/B test assignments
CREATE TABLE IF NOT EXISTS public.ab_test_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    test_id TEXT NOT NULL,
    variant_id TEXT NOT NULL,
    variant_config JSONB,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    UNIQUE(user_id, test_id)
);

-- Table for A/B test results
CREATE TABLE IF NOT EXISTS public.ab_test_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    test_id TEXT NOT NULL,
    variant_id TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL,
    context JSONB,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table for storing model performance metrics
CREATE TABLE IF NOT EXISTS public.model_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    model_name TEXT NOT NULL,
    model_version TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL NOT NULL,
    evaluation_date DATE NOT NULL,
    dataset_size INTEGER,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table for seasonal/temporal recommendation patterns
CREATE TABLE IF NOT EXISTS public.seasonal_patterns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pattern_type TEXT NOT NULL CHECK (pattern_type IN ('daily', 'weekly', 'monthly', 'seasonal', 'holiday')),
    pattern_key TEXT NOT NULL, -- e.g., 'monday_lunch', 'summer_drinks', 'christmas'
    cuisine_type TEXT,
    food_category TEXT,
    boost_factor DECIMAL(3,2) DEFAULT 1.0,
    start_date DATE,
    end_date DATE,
    time_of_day_start TIME,
    time_of_day_end TIME,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table for storing user behavior embeddings (for similarity calculations)
CREATE TABLE IF NOT EXISTS public.user_embeddings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    embedding_vector DECIMAL[] NOT NULL, -- Array of decimal values representing the user's taste embedding
    embedding_version TEXT NOT NULL DEFAULT 'v1.0',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    training_data_points INTEGER DEFAULT 0
);

-- Table for storing restaurant/food item embeddings
CREATE TABLE IF NOT EXISTS public.item_embeddings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_type TEXT NOT NULL CHECK (item_type IN ('restaurant', 'menu_item', 'cuisine')),
    item_id UUID NOT NULL,
    embedding_vector DECIMAL[] NOT NULL,
    embedding_version TEXT NOT NULL DEFAULT 'v1.0',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    metadata JSONB
);

-- Table for caching recommendation scores
CREATE TABLE IF NOT EXISTS public.recommendation_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('restaurant', 'menu_item')),
    item_id UUID NOT NULL,
    recommendation_score DECIMAL(4,3) NOT NULL CHECK (recommendation_score >= 0 AND recommendation_score <= 1),
    algorithm_version TEXT NOT NULL,
    context_hash TEXT, -- Hash of contextual factors (location, time, etc.)
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    INDEX(user_id, expires_at),
    INDEX(item_type, item_id)
);

-- Enable Row Level Security
ALTER TABLE public.ml_training_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_test_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasonal_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_cache ENABLE ROW LEVEL SECURITY;

-- Policies for ml_feedback
CREATE POLICY "Users can view their own ML feedback" ON public.ml_feedback
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ML feedback" ON public.ml_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for ab_test_assignments
CREATE POLICY "Users can view their own A/B test assignments" ON public.ab_test_assignments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert A/B test assignments" ON public.ab_test_assignments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policies for ab_test_results
CREATE POLICY "Users can view their own A/B test results" ON public.ab_test_results
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own A/B test results" ON public.ab_test_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for user_embeddings
CREATE POLICY "Users can view their own embeddings" ON public.user_embeddings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage user embeddings" ON public.user_embeddings
    FOR ALL WITH CHECK (auth.role() = 'authenticated');

-- Policies for recommendation_cache
CREATE POLICY "Users can view their own cached recommendations" ON public.recommendation_cache
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage recommendation cache" ON public.recommendation_cache
    FOR ALL WITH CHECK (auth.role() = 'authenticated');

-- Policies for public read tables
CREATE POLICY "Anyone can view seasonal patterns" ON public.seasonal_patterns
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view item embeddings" ON public.item_embeddings
    FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ml_feedback_user_id ON public.ml_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_ml_feedback_created_at ON public.ml_feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_ab_test_assignments_user_test ON public.ab_test_assignments(user_id, test_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_results_test_variant ON public.ab_test_results(test_id, variant_id);
CREATE INDEX IF NOT EXISTS idx_user_embeddings_user_id ON public.user_embeddings(user_id);
CREATE INDEX IF NOT EXISTS idx_item_embeddings_item ON public.item_embeddings(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_cache_user_expires ON public.recommendation_cache(user_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_seasonal_patterns_active ON public.seasonal_patterns(is_active, pattern_type);

-- Create triggers for updated_at
CREATE TRIGGER update_seasonal_patterns_updated_at BEFORE UPDATE ON public.seasonal_patterns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Functions for ML operations

-- Function to calculate user similarity based on embeddings
CREATE OR REPLACE FUNCTION calculate_user_similarity(user1_id UUID, user2_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    embedding1 DECIMAL[];
    embedding2 DECIMAL[];
    similarity DECIMAL;
BEGIN
    -- Get user embeddings
    SELECT embedding_vector INTO embedding1 FROM public.user_embeddings WHERE user_id = user1_id;
    SELECT embedding_vector INTO embedding2 FROM public.user_embeddings WHERE user_id = user2_id;
    
    -- Return 0 if either embedding doesn't exist
    IF embedding1 IS NULL OR embedding2 IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Calculate cosine similarity (simplified - in real implementation use proper vector operations)
    -- This is a placeholder that would need proper vector math
    similarity := 0.5; -- Placeholder
    
    RETURN similarity;
END;
$$ LANGUAGE plpgsql;

-- Function to update recommendation cache
CREATE OR REPLACE FUNCTION update_recommendation_cache(
    p_user_id UUID,
    p_item_type TEXT,
    p_item_id UUID,
    p_score DECIMAL,
    p_algorithm_version TEXT,
    p_context_hash TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.recommendation_cache (
        user_id, 
        item_type, 
        item_id, 
        recommendation_score, 
        algorithm_version, 
        context_hash,
        expires_at
    )
    VALUES (
        p_user_id,
        p_item_type,
        p_item_id,
        p_score,
        p_algorithm_version,
        p_context_hash,
        NOW() + INTERVAL '24 hours' -- Cache for 24 hours
    )
    ON CONFLICT (user_id, item_type, item_id, algorithm_version) 
    DO UPDATE SET
        recommendation_score = EXCLUDED.recommendation_score,
        context_hash = EXCLUDED.context_hash,
        expires_at = EXCLUDED.expires_at,
        created_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS VOID AS $$
BEGIN
    DELETE FROM public.recommendation_cache 
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get seasonal boost factor
CREATE OR REPLACE FUNCTION get_seasonal_boost(
    p_cuisine_type TEXT,
    p_food_category TEXT,
    p_check_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS DECIMAL AS $$
DECLARE
    boost_factor DECIMAL DEFAULT 1.0;
    pattern_record RECORD;
BEGIN
    -- Get active seasonal patterns that match the criteria
    FOR pattern_record IN
        SELECT boost_factor as factor
        FROM public.seasonal_patterns
        WHERE is_active = true
          AND (cuisine_type IS NULL OR cuisine_type = p_cuisine_type)
          AND (food_category IS NULL OR food_category = p_food_category)
          AND (start_date IS NULL OR start_date <= p_check_time::DATE)
          AND (end_date IS NULL OR end_date >= p_check_time::DATE)
          AND (time_of_day_start IS NULL OR time_of_day_start <= p_check_time::TIME)
          AND (time_of_day_end IS NULL OR time_of_day_end >= p_check_time::TIME)
    LOOP
        boost_factor := boost_factor * pattern_record.factor;
    END LOOP;
    
    RETURN boost_factor;
END;
$$ LANGUAGE plpgsql;