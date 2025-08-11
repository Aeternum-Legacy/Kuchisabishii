-- Row Level Security Policies for Kuchisabishii
-- Ensures users can only access their own data and properly shared content

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taste_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taste_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view public profiles" ON public.user_profiles
  FOR SELECT USING (profile_visibility = 'public');

CREATE POLICY "Friends can view friends-only profiles" ON public.user_profiles
  FOR SELECT USING (
    profile_visibility = 'friends' AND 
    EXISTS (
      SELECT 1 FROM public.friendships 
      WHERE status = 'accepted' 
      AND ((requester_id = auth.uid() AND addressee_id = user_profiles.id) 
           OR (addressee_id = auth.uid() AND requester_id = user_profiles.id))
    )
  );

-- Taste Profiles Policies
CREATE POLICY "Users can manage their own taste profile" ON public.taste_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Restaurants Policies (public read, authenticated insert/update)
CREATE POLICY "Anyone can view restaurants" ON public.restaurants
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Authenticated users can insert restaurants" ON public.restaurants
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Restaurant owners can update their restaurants" ON public.restaurants
  FOR UPDATE USING (claimed_by = auth.uid() OR auth.uid() IN (
    SELECT id FROM public.user_profiles WHERE id = auth.uid()
  ));

-- Menu Items Policies (public read, restaurant owners can manage)
CREATE POLICY "Anyone can view menu items" ON public.menu_items
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Restaurant owners can manage menu items" ON public.menu_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.restaurants 
      WHERE id = restaurant_id AND claimed_by = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can add menu items" ON public.menu_items
  FOR INSERT TO authenticated WITH CHECK (true);

-- Food Experiences Policies
CREATE POLICY "Users can manage their own food experiences" ON public.food_experiences
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared food experiences" ON public.food_experiences
  FOR SELECT USING (
    (NOT is_private AND shared_with_friends) OR
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.shared_experiences se
      WHERE se.food_experience_id = food_experiences.id
      AND se.shared_with = auth.uid()
    )
  );

CREATE POLICY "Friends can view friends' public food experiences" ON public.food_experiences
  FOR SELECT USING (
    NOT is_private AND 
    shared_with_friends AND
    EXISTS (
      SELECT 1 FROM public.friendships 
      WHERE status = 'accepted' 
      AND ((requester_id = auth.uid() AND addressee_id = food_experiences.user_id) 
           OR (addressee_id = auth.uid() AND requester_id = food_experiences.user_id))
    )
  );

-- Taste Experiences Policies
CREATE POLICY "Users can manage taste experiences for their food experiences" ON public.taste_experiences
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.food_experiences fe
      WHERE fe.id = food_experience_id AND fe.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view taste experiences for accessible food experiences" ON public.taste_experiences
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.food_experiences fe
      WHERE fe.id = food_experience_id 
      AND (
        fe.user_id = auth.uid() OR
        (NOT fe.is_private AND fe.shared_with_friends AND
         EXISTS (
           SELECT 1 FROM public.friendships f
           WHERE f.status = 'accepted' 
           AND ((f.requester_id = auth.uid() AND f.addressee_id = fe.user_id) 
                OR (f.addressee_id = auth.uid() AND f.requester_id = fe.user_id))
         ))
      )
    )
  );

-- Restaurant Reviews Policies
CREATE POLICY "Users can manage their own restaurant reviews" ON public.restaurant_reviews
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public restaurant reviews" ON public.restaurant_reviews
  FOR SELECT USING (NOT is_private);

CREATE POLICY "Friends can view friends' restaurant reviews" ON public.restaurant_reviews
  FOR SELECT USING (
    NOT is_private OR
    EXISTS (
      SELECT 1 FROM public.friendships 
      WHERE status = 'accepted' 
      AND ((requester_id = auth.uid() AND addressee_id = restaurant_reviews.user_id) 
           OR (addressee_id = auth.uid() AND requester_id = restaurant_reviews.user_id))
    )
  );

-- Friendships Policies
CREATE POLICY "Users can view their own friendships" ON public.friendships
  FOR SELECT USING (requester_id = auth.uid() OR addressee_id = auth.uid());

CREATE POLICY "Users can create friend requests" ON public.friendships
  FOR INSERT WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update friendships they're part of" ON public.friendships
  FOR UPDATE USING (requester_id = auth.uid() OR addressee_id = auth.uid());

CREATE POLICY "Users can delete friendships they're part of" ON public.friendships
  FOR DELETE USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- Shared Experiences Policies
CREATE POLICY "Users can share their own experiences" ON public.shared_experiences
  FOR INSERT WITH CHECK (
    shared_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.food_experiences 
      WHERE id = food_experience_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view experiences shared with them" ON public.shared_experiences
  FOR SELECT USING (shared_with = auth.uid() OR shared_by = auth.uid());

CREATE POLICY "Users can delete shares they created" ON public.shared_experiences
  FOR DELETE USING (shared_by = auth.uid());

-- Recommendation Preferences Policies
CREATE POLICY "Users can manage their own recommendation preferences" ON public.recommendation_preferences
  FOR ALL USING (auth.uid() = user_id);

-- User Analytics Policies
CREATE POLICY "Users can view their own analytics" ON public.user_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert/update user analytics" ON public.user_analytics
  FOR ALL USING (auth.uid() = user_id);

-- Recommendation Interactions Policies
CREATE POLICY "Users can manage their own recommendation interactions" ON public.recommendation_interactions
  FOR ALL USING (auth.uid() = user_id);

-- Search History Policies
CREATE POLICY "Users can manage their own search history" ON public.search_history
  FOR ALL USING (auth.uid() = user_id);

-- Create policies for service role (for server-side operations)
CREATE POLICY "Service role can manage all data" ON public.user_profiles
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage all taste profiles" ON public.taste_profiles
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage all restaurants" ON public.restaurants
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage all menu items" ON public.menu_items
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage all food experiences" ON public.food_experiences
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage all taste experiences" ON public.taste_experiences
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage all restaurant reviews" ON public.restaurant_reviews
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage all friendships" ON public.friendships
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage all shared experiences" ON public.shared_experiences
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage all recommendation preferences" ON public.recommendation_preferences
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage all analytics" ON public.user_analytics
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage all recommendation interactions" ON public.recommendation_interactions
  FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage all search history" ON public.search_history
  FOR ALL TO service_role USING (true);