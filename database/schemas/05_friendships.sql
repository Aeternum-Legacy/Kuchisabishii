-- Friendships table for social features
CREATE TYPE friendship_status AS ENUM (
    'pending',
    'accepted',
    'blocked',
    'declined'
);

CREATE TABLE IF NOT EXISTS public.friendships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    addressee_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    status friendship_status DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Prevent duplicate friendships and self-friendship
    CHECK (requester_id != addressee_id),
    UNIQUE(requester_id, addressee_id)
);

-- User follows table (for asymmetric relationships)
CREATE TABLE IF NOT EXISTS public.user_follows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Prevent self-follow and duplicate follows
    CHECK (follower_id != following_id),
    UNIQUE(follower_id, following_id)
);

-- Activity feed table
CREATE TYPE activity_type AS ENUM (
    'food_entry',
    'review',
    'friendship',
    'follow',
    'recommendation',
    'achievement'
);

CREATE TABLE IF NOT EXISTS public.user_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    activity_type activity_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb, -- Store additional data like entity IDs
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User collections/lists table
CREATE TABLE IF NOT EXISTS public.user_collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    color TEXT DEFAULT '#3b82f6', -- Hex color for theming
    icon TEXT DEFAULT 'bookmark', -- Icon name
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Collection items (restaurants, food entries, etc.)
CREATE TYPE collection_item_type AS ENUM (
    'restaurant',
    'food_entry',
    'review'
);

CREATE TABLE IF NOT EXISTS public.collection_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    collection_id UUID REFERENCES public.user_collections(id) ON DELETE CASCADE NOT NULL,
    item_type collection_item_type NOT NULL,
    item_id UUID NOT NULL, -- Reference to restaurant, food_entry, or review
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Prevent duplicate items in same collection
    UNIQUE(collection_id, item_type, item_id)
);

-- Indexes for friendships
CREATE INDEX IF NOT EXISTS idx_friendships_requester_id ON public.friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee_id ON public.friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON public.friendships(status);
CREATE INDEX IF NOT EXISTS idx_friendships_created_at ON public.friendships(created_at DESC);

-- Composite index for finding friendship between two users
CREATE INDEX IF NOT EXISTS idx_friendships_users ON public.friendships(
    LEAST(requester_id, addressee_id),
    GREATEST(requester_id, addressee_id)
);

-- Indexes for follows
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON public.user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_created_at ON public.user_follows(created_at DESC);

-- Indexes for activities
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON public.user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON public.user_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activities_public ON public.user_activities(is_public, created_at DESC) WHERE is_public = true;

-- Indexes for collections
CREATE INDEX IF NOT EXISTS idx_user_collections_user_id ON public.user_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_collections_public ON public.user_collections(is_public, created_at DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_collection_items_collection_id ON public.collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_type_id ON public.collection_items(item_type, item_id);

-- Triggers for updated_at
CREATE TRIGGER update_friendships_updated_at 
    BEFORE UPDATE ON public.friendships 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_collections_updated_at 
    BEFORE UPDATE ON public.user_collections 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to create activity when friendship is accepted
CREATE OR REPLACE FUNCTION create_friendship_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
        -- Create activity for requester
        INSERT INTO public.user_activities (user_id, activity_type, title, description, metadata)
        VALUES (
            NEW.requester_id,
            'friendship',
            'New Friend Connection',
            'You are now friends with someone new!',
            jsonb_build_object('friend_id', NEW.addressee_id, 'friendship_id', NEW.id)
        );
        
        -- Create activity for addressee
        INSERT INTO public.user_activities (user_id, activity_type, title, description, metadata)
        VALUES (
            NEW.addressee_id,
            'friendship',
            'New Friend Connection',
            'You are now friends with someone new!',
            jsonb_build_object('friend_id', NEW.requester_id, 'friendship_id', NEW.id)
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for friendship activities
CREATE TRIGGER create_friendship_activity_trigger
    AFTER UPDATE ON public.friendships
    FOR EACH ROW
    EXECUTE FUNCTION create_friendship_activity();

-- Function to get mutual friends
CREATE OR REPLACE FUNCTION get_mutual_friends(user1_id UUID, user2_id UUID)
RETURNS TABLE(friend_id UUID, friend_name TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT u.id, u.display_name
    FROM public.users u
    WHERE u.id IN (
        -- Friends of user1
        SELECT CASE 
            WHEN f1.requester_id = user1_id THEN f1.addressee_id
            ELSE f1.requester_id
        END
        FROM public.friendships f1
        WHERE (f1.requester_id = user1_id OR f1.addressee_id = user1_id)
        AND f1.status = 'accepted'
        
        INTERSECT
        
        -- Friends of user2  
        SELECT CASE 
            WHEN f2.requester_id = user2_id THEN f2.addressee_id
            ELSE f2.requester_id
        END
        FROM public.friendships f2
        WHERE (f2.requester_id = user2_id OR f2.addressee_id = user2_id)
        AND f2.status = 'accepted'
    );
END;
$$ language 'plpgsql';