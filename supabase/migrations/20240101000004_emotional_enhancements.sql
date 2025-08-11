-- Emotional Food Journey Enhancements for Kuchisabishii
-- Advanced emotional tracking, mood analytics, and AI-powered insights

-- Create emotional states enum
CREATE TYPE emotional_state AS ENUM (
    'joyful', 'excited', 'content', 'satisfied', 'happy', 'delighted',
    'disappointed', 'frustrated', 'sad', 'angry', 'disgusted', 'anxious',
    'curious', 'nostalgic', 'adventurous', 'comfort_seeking', 'celebratory',
    'stressed', 'relaxed', 'energetic', 'tired', 'romantic', 'social'
);

-- Create mood impact enum  
CREATE TYPE mood_impact AS ENUM (
    'very_negative', 'negative', 'neutral', 'positive', 'very_positive'
);

-- Enhanced emotional experiences table
CREATE TABLE IF NOT EXISTS public.emotional_experiences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    food_experience_id UUID REFERENCES public.food_experiences(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Pre-meal emotional state
    pre_meal_emotions emotional_state[] DEFAULT '{}',
    pre_meal_mood_level INTEGER CHECK (pre_meal_mood_level >= 1 AND pre_meal_mood_level <= 10) DEFAULT 5,
    pre_meal_energy_level INTEGER CHECK (pre_meal_energy_level >= 1 AND pre_meal_energy_level <= 10) DEFAULT 5,
    pre_meal_stress_level INTEGER CHECK (pre_meal_stress_level >= 1 AND pre_meal_stress_level <= 10) DEFAULT 5,
    
    -- Post-meal emotional state
    post_meal_emotions emotional_state[] DEFAULT '{}',
    post_meal_mood_level INTEGER CHECK (post_meal_mood_level >= 1 AND post_meal_mood_level <= 10) DEFAULT 5,
    post_meal_energy_level INTEGER CHECK (post_meal_energy_level >= 1 AND post_meal_energy_level <= 10) DEFAULT 5,
    post_meal_stress_level INTEGER CHECK (post_meal_stress_level >= 1 AND post_meal_stress_level <= 10) DEFAULT 5,
    
    -- Emotional impact analysis
    mood_impact mood_impact DEFAULT 'neutral',
    emotional_intensity INTEGER CHECK (emotional_intensity >= 1 AND emotional_intensity <= 10) DEFAULT 5,
    comfort_factor INTEGER CHECK (comfort_factor >= 1 AND comfort_factor <= 10) DEFAULT 5,
    nostalgia_factor INTEGER CHECK (nostalgia_factor >= 1 AND nostalgia_factor <= 10) DEFAULT 1,
    social_connection_factor INTEGER CHECK (social_connection_factor >= 1 AND social_connection_factor <= 10) DEFAULT 5,
    
    -- Context factors
    emotional_triggers TEXT[], -- What triggered specific emotions
    mood_descriptors TEXT[], -- Free-form mood descriptions
    emotional_journey_notes TEXT, -- Narrative of the emotional experience
    
    -- Memory association
    reminds_of TEXT, -- What this experience reminds them of
    memory_strength INTEGER CHECK (memory_strength >= 1 AND memory_strength <= 10) DEFAULT 1,
    emotional_significance TEXT, -- Why this meal was emotionally significant
    
    -- AI analysis fields
    ai_emotion_analysis JSONB DEFAULT '{}'::jsonb,
    ai_mood_prediction JSONB DEFAULT '{}'::jsonb,
    ai_comfort_classification JSONB DEFAULT '{}'::jsonb
);

-- Emotional patterns analysis table
CREATE TABLE IF NOT EXISTS public.emotional_patterns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    pattern_type TEXT NOT NULL CHECK (pattern_type IN (
        'cuisine_mood_correlation', 'time_emotion_pattern', 'social_emotional_impact',
        'weather_mood_correlation', 'stress_eating_pattern', 'comfort_food_pattern',
        'celebration_pattern', 'seasonal_emotion_pattern'
    )),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Pattern data
    pattern_name TEXT NOT NULL,
    pattern_description TEXT,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0) NOT NULL,
    strength INTEGER CHECK (strength >= 1 AND strength <= 10) NOT NULL,
    
    -- Pattern specifics
    trigger_conditions JSONB DEFAULT '{}'::jsonb, -- What triggers this pattern
    emotional_outcomes JSONB DEFAULT '{}'::jsonb, -- What emotions result
    food_associations JSONB DEFAULT '{}'::jsonb, -- What foods are associated
    temporal_data JSONB DEFAULT '{}'::jsonb, -- Time-based pattern data
    
    -- Statistical data
    sample_size INTEGER DEFAULT 0,
    correlation_coefficient DECIMAL(4,3),
    statistical_significance DECIMAL(4,3),
    
    -- Insights and recommendations
    insights TEXT[],
    recommendations TEXT[],
    
    -- Validation
    is_validated BOOLEAN DEFAULT false,
    validation_date TIMESTAMP WITH TIME ZONE
);

-- Mood journey tracking table
CREATE TABLE IF NOT EXISTS public.mood_journeys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    journey_date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Daily mood tracking
    morning_mood INTEGER CHECK (morning_mood >= 1 AND morning_mood <= 10),
    afternoon_mood INTEGER CHECK (afternoon_mood >= 1 AND afternoon_mood <= 10),
    evening_mood INTEGER CHECK (evening_mood >= 1 AND evening_mood <= 10),
    
    -- Mood influencers
    primary_mood_influencers TEXT[] DEFAULT '{}',
    stress_factors TEXT[] DEFAULT '{}',
    positive_factors TEXT[] DEFAULT '{}',
    
    -- Food-mood connections
    comfort_foods_consumed TEXT[] DEFAULT '{}',
    emotional_eating_instances INTEGER DEFAULT 0,
    mindful_eating_score INTEGER CHECK (mindful_eating_score >= 1 AND mindful_eating_score <= 10),
    
    -- Overall day assessment
    overall_satisfaction INTEGER CHECK (overall_satisfaction >= 1 AND overall_satisfaction <= 10),
    food_mood_impact_rating INTEGER CHECK (food_mood_impact_rating >= 1 AND food_mood_impact_rating <= 10),
    
    -- Goals and reflections
    mood_goals TEXT,
    daily_reflection TEXT,
    gratitude_notes TEXT,
    
    UNIQUE(user_id, journey_date)
);

-- Emotional insights and recommendations table
CREATE TABLE IF NOT EXISTS public.emotional_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    insight_type TEXT NOT NULL CHECK (insight_type IN (
        'mood_trend', 'comfort_pattern', 'social_eating_insight', 'stress_eating_alert',
        'positive_trigger_identification', 'emotional_balance_assessment', 'mindfulness_opportunity',
        'seasonal_mood_insight', 'celebration_pattern', 'nostalgia_trigger'
    )),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Insight content
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'suggestion', 'warning', 'alert')),
    confidence_level DECIMAL(3,2) CHECK (confidence_level >= 0.0 AND confidence_level <= 1.0) NOT NULL,
    
    -- Data backing the insight
    supporting_data JSONB DEFAULT '{}'::jsonb,
    time_range_analyzed INTERVAL,
    sample_size INTEGER,
    
    -- Recommendations
    recommendations JSONB DEFAULT '{}'::jsonb,
    action_items TEXT[],
    suggested_foods TEXT[],
    suggested_restaurants TEXT[],
    
    -- User interaction
    user_viewed BOOLEAN DEFAULT false,
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    user_feedback TEXT,
    dismissed BOOLEAN DEFAULT false,
    
    -- Follow-up tracking
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + INTERVAL '30 days'),
    follow_up_date TIMESTAMP WITH TIME ZONE,
    outcome_tracked BOOLEAN DEFAULT false,
    effectiveness_score INTEGER CHECK (effectiveness_score >= 1 AND effectiveness_score <= 10)
);

-- Enhanced user emotional profile table
CREATE TABLE IF NOT EXISTS public.user_emotional_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Emotional eating patterns
    emotional_eating_tendency INTEGER CHECK (emotional_eating_tendency >= 1 AND emotional_eating_tendency <= 10) DEFAULT 5,
    stress_eating_level INTEGER CHECK (stress_eating_level >= 1 AND stress_eating_level <= 10) DEFAULT 5,
    comfort_seeking_frequency INTEGER CHECK (comfort_seeking_frequency >= 1 AND comfort_seeking_frequency <= 10) DEFAULT 5,
    emotional_awareness_level INTEGER CHECK (emotional_awareness_level >= 1 AND emotional_awareness_level <= 10) DEFAULT 5,
    
    -- Mood-food associations
    comfort_food_categories JSONB DEFAULT '{}'::jsonb,
    stress_response_foods JSONB DEFAULT '{}'::jsonb,
    celebration_food_preferences JSONB DEFAULT '{}'::jsonb,
    nostalgia_trigger_foods JSONB DEFAULT '{}'::jsonb,
    
    -- Social emotional patterns
    social_eating_preference INTEGER CHECK (social_eating_preference >= 1 AND social_eating_preference <= 10) DEFAULT 5,
    emotional_sharing_comfort INTEGER CHECK (emotional_sharing_comfort >= 1 AND emotional_sharing_comfort <= 10) DEFAULT 5,
    peer_influence_susceptibility INTEGER CHECK (peer_influence_susceptibility >= 1 AND peer_influence_susceptibility <= 10) DEFAULT 5,
    
    -- Seasonal and temporal patterns
    seasonal_emotional_patterns JSONB DEFAULT '{}'::jsonb,
    time_of_day_mood_patterns JSONB DEFAULT '{}'::jsonb,
    weather_mood_sensitivity INTEGER CHECK (weather_mood_sensitivity >= 1 AND weather_mood_sensitivity <= 10) DEFAULT 5,
    
    -- Mindfulness and awareness
    mindful_eating_practice INTEGER CHECK (mindful_eating_practice >= 1 AND mindful_eating_practice <= 10) DEFAULT 5,
    emotional_regulation_skills INTEGER CHECK (emotional_regulation_skills >= 1 AND emotional_regulation_skills <= 10) DEFAULT 5,
    food_mood_awareness INTEGER CHECK (food_mood_awareness >= 1 AND food_mood_awareness <= 10) DEFAULT 5,
    
    -- Goals and preferences
    emotional_wellness_goals TEXT[],
    mood_tracking_preferences JSONB DEFAULT '{}'::jsonb,
    insight_frequency_preference TEXT DEFAULT 'weekly' CHECK (insight_frequency_preference IN ('daily', 'weekly', 'monthly')),
    
    UNIQUE(user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_emotional_experiences_user_id ON public.emotional_experiences(user_id);
CREATE INDEX IF NOT EXISTS idx_emotional_experiences_food_experience_id ON public.emotional_experiences(food_experience_id);
CREATE INDEX IF NOT EXISTS idx_emotional_experiences_pre_emotions ON public.emotional_experiences USING GIN(pre_meal_emotions);
CREATE INDEX IF NOT EXISTS idx_emotional_experiences_post_emotions ON public.emotional_experiences USING GIN(post_meal_emotions);
CREATE INDEX IF NOT EXISTS idx_emotional_experiences_mood_impact ON public.emotional_experiences(mood_impact);
CREATE INDEX IF NOT EXISTS idx_emotional_experiences_created_at ON public.emotional_experiences(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_emotional_patterns_user_id ON public.emotional_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_emotional_patterns_type ON public.emotional_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_emotional_patterns_confidence ON public.emotional_patterns(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_emotional_patterns_updated_at ON public.emotional_patterns(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_mood_journeys_user_date ON public.mood_journeys(user_id, journey_date);
CREATE INDEX IF NOT EXISTS idx_mood_journeys_date ON public.mood_journeys(journey_date DESC);

CREATE INDEX IF NOT EXISTS idx_emotional_insights_user_id ON public.emotional_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_emotional_insights_type ON public.emotional_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_emotional_insights_created_at ON public.emotional_insights(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emotional_insights_active ON public.emotional_insights(user_id, expires_at) WHERE NOT dismissed AND expires_at > NOW();

CREATE INDEX IF NOT EXISTS idx_user_emotional_profiles_user_id ON public.user_emotional_profiles(user_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_emotional_patterns_updated_at 
    BEFORE UPDATE ON public.emotional_patterns 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mood_journeys_updated_at 
    BEFORE UPDATE ON public.mood_journeys 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_emotional_profiles_updated_at 
    BEFORE UPDATE ON public.user_emotional_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to analyze emotional impact of food experiences
CREATE OR REPLACE FUNCTION analyze_emotional_impact(
    target_user_id UUID,
    days_back INTEGER DEFAULT 30
)
RETURNS JSONB AS $$
DECLARE
    result JSONB := '{}'::jsonb;
    avg_mood_change DECIMAL;
    comfort_food_frequency INTEGER;
    emotional_variety INTEGER;
    stress_eating_indicator DECIMAL;
BEGIN
    -- Calculate average mood change from pre to post meal
    SELECT AVG(
        (post_meal_mood_level + post_meal_energy_level - post_meal_stress_level) -
        (pre_meal_mood_level + pre_meal_energy_level - pre_meal_stress_level)
    ) INTO avg_mood_change
    FROM public.emotional_experiences ee
    JOIN public.food_experiences fe ON ee.food_experience_id = fe.id
    WHERE ee.user_id = target_user_id
    AND fe.consumed_at >= NOW() - (days_back || ' days')::INTERVAL;

    -- Count comfort food instances
    SELECT COUNT(*) INTO comfort_food_frequency
    FROM public.emotional_experiences ee
    JOIN public.food_experiences fe ON ee.food_experience_id = fe.id
    WHERE ee.user_id = target_user_id
    AND ee.comfort_factor >= 8
    AND fe.consumed_at >= NOW() - (days_back || ' days')::INTERVAL;

    -- Calculate emotional variety (unique emotions experienced)
    SELECT COUNT(DISTINCT emotion) INTO emotional_variety
    FROM (
        SELECT unnest(pre_meal_emotions || post_meal_emotions) as emotion
        FROM public.emotional_experiences ee
        JOIN public.food_experiences fe ON ee.food_experience_id = fe.id
        WHERE ee.user_id = target_user_id
        AND fe.consumed_at >= NOW() - (days_back || ' days')::INTERVAL
    ) emotions;

    -- Calculate stress eating indicator
    SELECT AVG(
        CASE WHEN pre_meal_stress_level >= 8 AND comfort_factor >= 7
        THEN 1.0 ELSE 0.0 END
    ) INTO stress_eating_indicator
    FROM public.emotional_experiences ee
    JOIN public.food_experiences fe ON ee.food_experience_id = fe.id
    WHERE ee.user_id = target_user_id
    AND fe.consumed_at >= NOW() - (days_back || ' days')::INTERVAL;

    -- Build result JSON
    result := jsonb_build_object(
        'avg_mood_change', COALESCE(avg_mood_change, 0),
        'comfort_food_frequency', COALESCE(comfort_food_frequency, 0),
        'emotional_variety', COALESCE(emotional_variety, 0),
        'stress_eating_indicator', COALESCE(stress_eating_indicator, 0),
        'analysis_period_days', days_back,
        'generated_at', NOW()
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to identify emotional eating patterns
CREATE OR REPLACE FUNCTION identify_emotional_patterns(target_user_id UUID)
RETURNS TABLE(
    pattern_type TEXT,
    pattern_strength INTEGER,
    confidence DECIMAL,
    description TEXT,
    recommendations TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    WITH pattern_analysis AS (
        -- Analyze comfort eating patterns
        SELECT 
            'comfort_eating_pattern' as pattern_type,
            CASE 
                WHEN AVG(comfort_factor) >= 8 THEN 9
                WHEN AVG(comfort_factor) >= 7 THEN 7
                WHEN AVG(comfort_factor) >= 6 THEN 5
                ELSE 3
            END as pattern_strength,
            CASE 
                WHEN COUNT(*) >= 10 THEN 0.9
                WHEN COUNT(*) >= 5 THEN 0.7
                ELSE 0.5
            END as confidence,
            'You frequently seek comfort through food when experiencing strong emotions' as description,
            ARRAY[
                'Practice mindful eating techniques',
                'Keep a mood journal alongside your food log',
                'Identify non-food comfort activities'
            ] as recommendations
        FROM public.emotional_experiences ee
        JOIN public.food_experiences fe ON ee.food_experience_id = fe.id
        WHERE ee.user_id = target_user_id
        AND ee.comfort_factor >= 6
        AND fe.consumed_at >= NOW() - INTERVAL '60 days'
        
        UNION ALL
        
        -- Analyze stress eating patterns
        SELECT 
            'stress_eating_pattern' as pattern_type,
            CASE 
                WHEN stress_eating_freq >= 0.6 THEN 9
                WHEN stress_eating_freq >= 0.4 THEN 7
                WHEN stress_eating_freq >= 0.2 THEN 5
                ELSE 3
            END as pattern_strength,
            CASE 
                WHEN total_experiences >= 15 THEN 0.85
                WHEN total_experiences >= 8 THEN 0.7
                ELSE 0.5
            END as confidence,
            'You tend to eat when stressed, which may impact your emotional well-being' as description,
            ARRAY[
                'Develop stress management techniques',
                'Plan healthy stress-relief snacks',
                'Practice breathing exercises before meals'
            ] as recommendations
        FROM (
            SELECT 
                COUNT(*) as total_experiences,
                AVG(CASE WHEN pre_meal_stress_level >= 8 AND comfort_factor >= 6 THEN 1.0 ELSE 0.0 END) as stress_eating_freq
            FROM public.emotional_experiences ee
            JOIN public.food_experiences fe ON ee.food_experience_id = fe.id
            WHERE ee.user_id = target_user_id
            AND fe.consumed_at >= NOW() - INTERVAL '60 days'
        ) stress_analysis
        
        UNION ALL
        
        -- Analyze social eating emotional impact
        SELECT 
            'social_emotional_impact' as pattern_type,
            CASE 
                WHEN social_boost >= 2.0 THEN 9
                WHEN social_boost >= 1.0 THEN 7
                WHEN social_boost >= 0.5 THEN 5
                ELSE 3
            END as pattern_strength,
            CASE 
                WHEN total_social >= 10 AND total_solo >= 10 THEN 0.9
                WHEN total_social >= 5 AND total_solo >= 5 THEN 0.7
                ELSE 0.5
            END as confidence,
            CASE 
                WHEN social_boost >= 1.0 THEN 'Social dining significantly improves your mood and emotional well-being'
                ELSE 'You show consistent emotional responses regardless of dining company'
            END as description,
            CASE 
                WHEN social_boost >= 1.0 THEN ARRAY[
                    'Plan more social dining experiences',
                    'Consider joining dining groups or food meetups',
                    'Use meals as opportunities to connect with others'
                ]
                ELSE ARRAY[
                    'Both solo and social dining work well for you',
                    'Continue enjoying the flexibility of different dining styles'
                ]
            END as recommendations
        FROM (
            SELECT 
                AVG(CASE WHEN fe.dining_companions > 0 
                    THEN (post_meal_mood_level - pre_meal_mood_level) ELSE NULL END) as social_mood_change,
                AVG(CASE WHEN fe.dining_companions = 0 
                    THEN (post_meal_mood_level - pre_meal_mood_level) ELSE NULL END) as solo_mood_change,
                COALESCE(AVG(CASE WHEN fe.dining_companions > 0 
                    THEN (post_meal_mood_level - pre_meal_mood_level) ELSE NULL END), 0) -
                COALESCE(AVG(CASE WHEN fe.dining_companions = 0 
                    THEN (post_meal_mood_level - pre_meal_mood_level) ELSE NULL END), 0) as social_boost,
                COUNT(CASE WHEN fe.dining_companions > 0 THEN 1 END) as total_social,
                COUNT(CASE WHEN fe.dining_companions = 0 THEN 1 END) as total_solo
            FROM public.emotional_experiences ee
            JOIN public.food_experiences fe ON ee.food_experience_id = fe.id
            WHERE ee.user_id = target_user_id
            AND fe.consumed_at >= NOW() - INTERVAL '90 days'
        ) social_analysis
    )
    SELECT 
        pa.pattern_type,
        pa.pattern_strength,
        pa.confidence,
        pa.description,
        pa.recommendations
    FROM pattern_analysis pa
    WHERE pa.confidence >= 0.5
    ORDER BY pa.confidence DESC, pa.pattern_strength DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate emotional insights
CREATE OR REPLACE FUNCTION generate_emotional_insights(target_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    insights_count INTEGER := 0;
    pattern_record RECORD;
BEGIN
    -- Clean up old insights
    DELETE FROM public.emotional_insights 
    WHERE user_id = target_user_id 
    AND expires_at < NOW();

    -- Generate insights from identified patterns
    FOR pattern_record IN 
        SELECT * FROM identify_emotional_patterns(target_user_id)
        WHERE confidence >= 0.7
    LOOP
        INSERT INTO public.emotional_insights (
            user_id,
            insight_type,
            title,
            description,
            confidence_level,
            recommendations,
            supporting_data
        ) VALUES (
            target_user_id,
            pattern_record.pattern_type,
            CASE pattern_record.pattern_type
                WHEN 'comfort_eating_pattern' THEN 'Comfort Eating Pattern Detected'
                WHEN 'stress_eating_pattern' THEN 'Stress Eating Alert'
                WHEN 'social_emotional_impact' THEN 'Social Dining Benefits'
                ELSE 'Emotional Pattern Insight'
            END,
            pattern_record.description,
            pattern_record.confidence,
            jsonb_build_object('actionItems', pattern_record.recommendations),
            jsonb_build_object(
                'patternStrength', pattern_record.pattern_strength,
                'analysisDate', NOW()
            )
        );
        
        insights_count := insights_count + 1;
    END LOOP;

    RETURN insights_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create daily mood journey entry
CREATE OR REPLACE FUNCTION create_daily_mood_entry(
    target_user_id UUID,
    entry_date DATE DEFAULT CURRENT_DATE
)
RETURNS UUID AS $$
DECLARE
    journey_id UUID;
BEGIN
    INSERT INTO public.mood_journeys (user_id, journey_date)
    VALUES (target_user_id, entry_date)
    ON CONFLICT (user_id, journey_date) 
    DO UPDATE SET updated_at = NOW()
    RETURNING id INTO journey_id;
    
    RETURN journey_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for new tables
ALTER TABLE public.emotional_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotional_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotional_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_emotional_profiles ENABLE ROW LEVEL SECURITY;

-- Emotional experiences policies
CREATE POLICY "Users can manage own emotional experiences" ON public.emotional_experiences
    FOR ALL USING (user_id = auth.uid());

-- Emotional patterns policies
CREATE POLICY "Users can view own emotional patterns" ON public.emotional_patterns
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can manage emotional patterns" ON public.emotional_patterns
    FOR ALL USING (auth.role() = 'service_role');

-- Mood journeys policies
CREATE POLICY "Users can manage own mood journeys" ON public.mood_journeys
    FOR ALL USING (user_id = auth.uid());

-- Emotional insights policies
CREATE POLICY "Users can view own insights" ON public.emotional_insights
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own insights" ON public.emotional_insights
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can manage insights" ON public.emotional_insights
    FOR ALL USING (auth.role() = 'service_role');

-- User emotional profiles policies
CREATE POLICY "Users can manage own emotional profile" ON public.user_emotional_profiles
    FOR ALL USING (user_id = auth.uid());