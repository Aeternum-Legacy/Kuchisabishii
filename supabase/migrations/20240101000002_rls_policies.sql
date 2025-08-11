-- Row Level Security (RLS) Policies for Kuchisabishii
-- This migration applies all RLS policies from the policies directory

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taste_profile_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_pairings ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION public.is_friends_with(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.friendships
        WHERE ((requester_id = user1_id AND addressee_id = user2_id)
               OR (requester_id = user2_id AND addressee_id = user1_id))
        AND status = 'accepted'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.can_view_user_profile(viewer_id UUID, profile_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    profile_privacy TEXT;
BEGIN
    IF viewer_id = profile_id THEN
        RETURN TRUE;
    END IF;
    
    SELECT privacy_level INTO profile_privacy
    FROM public.users
    WHERE id = profile_id;
    
    IF profile_privacy = 'public' THEN
        RETURN TRUE;
    END IF;
    
    IF profile_privacy = 'friends' THEN
        RETURN public.is_friends_with(viewer_id, profile_id);
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- USERS TABLE POLICIES
CREATE POLICY "Users can view public profiles" ON public.users
    FOR SELECT USING (
        id = auth.uid() OR 
        privacy_level = 'public' OR
        (privacy_level = 'friends' AND EXISTS (
            SELECT 1 FROM public.friendships f
            WHERE (f.requester_id = auth.uid() AND f.addressee_id = users.id)
               OR (f.addressee_id = auth.uid() AND f.requester_id = users.id)
            AND f.status = 'accepted'
        ))
    );

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (id = auth.uid());

-- RESTAURANTS TABLE POLICIES  
CREATE POLICY "Authenticated users can view restaurants" ON public.restaurants
    FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "Service role can manage restaurants" ON public.restaurants
    FOR ALL USING (auth.role() = 'service_role');

-- FOOD ENTRIES TABLE POLICIES
CREATE POLICY "Users can view accessible food entries" ON public.food_entries
    FOR SELECT USING (
        user_id = auth.uid() OR 
        (is_public = true AND allow_comments = true) OR
        (is_public = true AND user_id IN (
            SELECT CASE 
                WHEN f.requester_id = auth.uid() THEN f.addressee_id
                ELSE f.requester_id
            END
            FROM public.friendships f
            WHERE (f.requester_id = auth.uid() OR f.addressee_id = auth.uid())
            AND f.status = 'accepted'
        ))
    );

CREATE POLICY "Users can insert own food entries" ON public.food_entries
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own food entries" ON public.food_entries
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own food entries" ON public.food_entries
    FOR DELETE USING (user_id = auth.uid());

-- REVIEWS TABLE POLICIES
CREATE POLICY "Users can view accessible reviews" ON public.reviews
    FOR SELECT USING (
        user_id = auth.uid() OR 
        is_public = true
    );

CREATE POLICY "Users can insert own reviews" ON public.reviews
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reviews" ON public.reviews
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own reviews" ON public.reviews
    FOR DELETE USING (user_id = auth.uid());

-- REVIEW RESPONSES TABLE POLICIES
CREATE POLICY "Users can view review responses" ON public.review_responses
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.reviews r
            WHERE r.id = review_responses.review_id
            AND (r.is_public = true OR r.user_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert review responses" ON public.review_responses
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.reviews r
            WHERE r.id = review_id
            AND (r.is_public = true AND r.allow_responses = true)
        )
    );

CREATE POLICY "Users can manage own review responses" ON public.review_responses
    FOR ALL USING (user_id = auth.uid());

-- REVIEW VOTES TABLE POLICIES
CREATE POLICY "Users can view review votes" ON public.review_votes
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.reviews r
            WHERE r.id = review_votes.review_id
            AND r.is_public = true
        )
    );

CREATE POLICY "Users can vote on reviews" ON public.review_votes
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.reviews r
            WHERE r.id = review_id
            AND r.is_public = true
        )
    );

CREATE POLICY "Users can manage own votes" ON public.review_votes
    FOR ALL USING (user_id = auth.uid());

-- FRIENDSHIPS TABLE POLICIES
CREATE POLICY "Users can view own friendships" ON public.friendships
    FOR SELECT USING (
        requester_id = auth.uid() OR addressee_id = auth.uid()
    );

CREATE POLICY "Users can create friendship requests" ON public.friendships
    FOR INSERT WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update own friendships" ON public.friendships
    FOR UPDATE USING (
        requester_id = auth.uid() OR addressee_id = auth.uid()
    );

CREATE POLICY "Users can delete own friendships" ON public.friendships
    FOR DELETE USING (
        requester_id = auth.uid() OR addressee_id = auth.uid()
    );

-- USER FOLLOWS TABLE POLICIES
CREATE POLICY "Users can view accessible follows" ON public.user_follows
    FOR SELECT USING (
        follower_id = auth.uid() OR 
        following_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = following_id
            AND u.privacy_level = 'public'
        )
    );

CREATE POLICY "Users can create follows" ON public.user_follows
    FOR INSERT WITH CHECK (follower_id = auth.uid());

CREATE POLICY "Users can delete own follows" ON public.user_follows
    FOR DELETE USING (follower_id = auth.uid());

-- USER ACTIVITIES TABLE POLICIES
CREATE POLICY "Users can view accessible activities" ON public.user_activities
    FOR SELECT USING (
        user_id = auth.uid() OR 
        (is_public = true AND EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = user_activities.user_id
            AND (u.privacy_level = 'public' OR
                 (u.privacy_level = 'friends' AND EXISTS (
                     SELECT 1 FROM public.friendships f
                     WHERE (f.requester_id = auth.uid() AND f.addressee_id = u.id)
                        OR (f.addressee_id = auth.uid() AND f.requester_id = u.id)
                     AND f.status = 'accepted'
                 )))
        ))
    );

CREATE POLICY "Users can insert own activities" ON public.user_activities
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can insert activities" ON public.user_activities
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- USER COLLECTIONS TABLE POLICIES
CREATE POLICY "Users can view accessible collections" ON public.user_collections
    FOR SELECT USING (
        user_id = auth.uid() OR 
        is_public = true
    );

CREATE POLICY "Users can manage own collections" ON public.user_collections
    FOR ALL USING (user_id = auth.uid());

-- COLLECTION ITEMS TABLE POLICIES
CREATE POLICY "Users can view accessible collection items" ON public.collection_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_collections uc
            WHERE uc.id = collection_items.collection_id
            AND (uc.user_id = auth.uid() OR uc.is_public = true)
        )
    );

CREATE POLICY "Users can manage own collection items" ON public.collection_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_collections uc
            WHERE uc.id = collection_id
            AND uc.user_id = auth.uid()
        )
    );

-- USER PREFERENCES TABLE POLICIES
CREATE POLICY "Users can manage own preferences" ON public.user_preferences
    FOR ALL USING (user_id = auth.uid());

-- TASTE PROFILE HISTORY TABLE POLICIES
CREATE POLICY "Users can manage own taste history" ON public.taste_profile_history
    FOR ALL USING (user_id = auth.uid());

-- RESTAURANT RECOMMENDATIONS TABLE POLICIES
CREATE POLICY "Users can manage own recommendations" ON public.restaurant_recommendations
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "System can insert recommendations" ON public.restaurant_recommendations
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- FOOD PAIRINGS TABLE POLICIES
CREATE POLICY "Authenticated users can view food pairings" ON public.food_pairings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage food pairings" ON public.food_pairings
    FOR ALL USING (auth.role() = 'service_role');