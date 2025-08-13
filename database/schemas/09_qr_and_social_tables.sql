-- QR Code Verification System
-- Table for storing temporary QR code verification tokens
CREATE TABLE IF NOT EXISTS qr_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE
);

-- Index for quick token lookups
CREATE INDEX IF NOT EXISTS idx_qr_tokens_token ON qr_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_qr_tokens_user_id ON qr_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_tokens_expires_at ON qr_verification_tokens(expires_at);

-- Connection Analytics
-- Table for tracking how users connect (QR vs URL vs search)
CREATE TABLE IF NOT EXISTS connection_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    target_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    connection_method VARCHAR(50) NOT NULL, -- 'qr', 'url', 'search', 'recommendation'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_connection_analytics_requester ON connection_analytics(requester_id);
CREATE INDEX IF NOT EXISTS idx_connection_analytics_target ON connection_analytics(target_id);
CREATE INDEX IF NOT EXISTS idx_connection_analytics_method ON connection_analytics(connection_method);
CREATE INDEX IF NOT EXISTS idx_connection_analytics_created_at ON connection_analytics(created_at);

-- Enhanced Friendships Table Updates
-- Add connection method tracking to existing friendships table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'friendships' AND column_name = 'connection_method') THEN
        ALTER TABLE friendships ADD COLUMN connection_method VARCHAR(50) DEFAULT 'manual';
    END IF;
END $$;

-- Enhanced Profiles Table Updates
-- Add fields for better user discovery and matching
DO $$ 
BEGIN
    -- Add location field if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'location') THEN
        ALTER TABLE profiles ADD COLUMN location TEXT;
    END IF;
    
    -- Add dietary preferences array if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'dietary_preferences') THEN
        ALTER TABLE profiles ADD COLUMN dietary_preferences TEXT[];
    END IF;
    
    -- Add taste preferences JSON if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'taste_preferences') THEN
        ALTER TABLE profiles ADD COLUMN taste_preferences JSONB;
    END IF;
    
    -- Add notification preferences JSON if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'notification_preferences') THEN
        ALTER TABLE profiles ADD COLUMN notification_preferences JSONB DEFAULT '{"friend_requests": true, "recommendations": true}';
    END IF;
END $$;

-- Indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles USING gin(to_tsvector('english', location));
CREATE INDEX IF NOT EXISTS idx_profiles_dietary_preferences ON profiles USING gin(dietary_preferences);
CREATE INDEX IF NOT EXISTS idx_profiles_taste_preferences ON profiles USING gin(taste_preferences);

-- Full-text search index for user discovery
CREATE INDEX IF NOT EXISTS idx_profiles_search ON profiles USING gin(
    to_tsvector('english', 
        COALESCE(display_name, '') || ' ' || 
        COALESCE(first_name, '') || ' ' || 
        COALESCE(last_name, '') || ' ' || 
        COALESCE(email, '')
    )
);

-- Friend Suggestions Table
-- For storing and caching friend recommendations
CREATE TABLE IF NOT EXISTS friend_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    suggested_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    suggestion_reason VARCHAR(100), -- 'mutual_friends', 'similar_taste', 'location', 'activity'
    similarity_score INTEGER DEFAULT 0, -- 0-100 similarity score
    mutual_friends_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    dismissed_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(user_id, suggested_user_id)
);

-- Indexes for friend suggestions
CREATE INDEX IF NOT EXISTS idx_friend_suggestions_user_id ON friend_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_friend_suggestions_similarity ON friend_suggestions(similarity_score DESC);
CREATE INDEX IF NOT EXISTS idx_friend_suggestions_created_at ON friend_suggestions(created_at DESC);

-- User Search History
-- For improving search relevance and suggestions
CREATE TABLE IF NOT EXISTS user_search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    search_query TEXT NOT NULL,
    results_count INTEGER DEFAULT 0,
    clicked_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for search analytics
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON user_search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON user_search_history(created_at DESC);

-- Cleanup function for expired QR tokens
CREATE OR REPLACE FUNCTION cleanup_expired_qr_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM qr_verification_tokens 
    WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- Function to get friend recommendations based on mutual friends and taste similarity
CREATE OR REPLACE FUNCTION get_friend_recommendations(target_user_id UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    suggested_user_id UUID,
    display_name TEXT,
    profile_image_url TEXT,
    mutual_friends_count INTEGER,
    similarity_score INTEGER,
    suggestion_reason TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH user_friends AS (
        SELECT CASE 
            WHEN f.user_id = target_user_id THEN f.friend_user_id
            ELSE f.user_id
        END as friend_id
        FROM friendships f
        WHERE (f.user_id = target_user_id OR f.friend_user_id = target_user_id)
        AND f.status = 'accepted'
    ),
    friends_of_friends AS (
        SELECT CASE 
            WHEN f.user_id IN (SELECT friend_id FROM user_friends) THEN f.friend_user_id
            ELSE f.user_id
        END as suggested_id,
        COUNT(*) as mutual_count
        FROM friendships f
        WHERE (f.user_id IN (SELECT friend_id FROM user_friends) OR 
               f.friend_user_id IN (SELECT friend_id FROM user_friends))
        AND f.status = 'accepted'
        AND CASE 
            WHEN f.user_id IN (SELECT friend_id FROM user_friends) THEN f.friend_user_id
            ELSE f.user_id
        END != target_user_id
        AND CASE 
            WHEN f.user_id IN (SELECT friend_id FROM user_friends) THEN f.friend_user_id
            ELSE f.user_id
        END NOT IN (SELECT friend_id FROM user_friends)
        AND NOT EXISTS (
            SELECT 1 FROM friendships existing
            WHERE (existing.user_id = target_user_id AND existing.friend_user_id = CASE 
                WHEN f.user_id IN (SELECT friend_id FROM user_friends) THEN f.friend_user_id
                ELSE f.user_id
            END)
            OR (existing.friend_user_id = target_user_id AND existing.user_id = CASE 
                WHEN f.user_id IN (SELECT friend_id FROM user_friends) THEN f.friend_user_id
                ELSE f.user_id
            END)
        )
        GROUP BY suggested_id
    )
    SELECT 
        fof.suggested_id,
        p.display_name,
        p.profile_image_url,
        fof.mutual_count::INTEGER,
        COALESCE(fs.similarity_score, 50)::INTEGER,
        COALESCE(fs.suggestion_reason, 'mutual_friends')::TEXT
    FROM friends_of_friends fof
    JOIN profiles p ON p.id = fof.suggested_id
    LEFT JOIN friend_suggestions fs ON fs.user_id = target_user_id AND fs.suggested_user_id = fof.suggested_id
    ORDER BY fof.mutual_count DESC, COALESCE(fs.similarity_score, 50) DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- RLS (Row Level Security) Policies

-- QR Verification Tokens - users can only access their own tokens
ALTER TABLE qr_verification_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY qr_tokens_user_policy ON qr_verification_tokens
    FOR ALL USING (auth.uid() = user_id);

-- Connection Analytics - users can see their own analytics
ALTER TABLE connection_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY connection_analytics_policy ON connection_analytics
    FOR ALL USING (
        auth.uid() = requester_id OR 
        auth.uid() = target_id
    );

-- Friend Suggestions - users can only see suggestions for themselves
ALTER TABLE friend_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY friend_suggestions_policy ON friend_suggestions
    FOR ALL USING (auth.uid() = user_id);

-- Search History - users can only see their own search history
ALTER TABLE user_search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY search_history_policy ON user_search_history
    FOR ALL USING (auth.uid() = user_id);

-- Insert some sample data for testing (optional)
-- This would typically be handled by the application
/*
INSERT INTO friend_suggestions (user_id, suggested_user_id, suggestion_reason, similarity_score, mutual_friends_count)
SELECT 
    p1.id,
    p2.id,
    'similar_taste',
    75,
    0
FROM profiles p1, profiles p2
WHERE p1.id != p2.id
AND NOT EXISTS (
    SELECT 1 FROM friendships f
    WHERE (f.user_id = p1.id AND f.friend_user_id = p2.id)
    OR (f.user_id = p2.id AND f.friend_user_id = p1.id)
)
LIMIT 50;
*/