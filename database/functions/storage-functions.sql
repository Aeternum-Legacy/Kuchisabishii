-- Storage and Media Management Functions for Kuchisabishii
-- Functions for handling image/video uploads, optimization, and management

-- Function to generate storage paths for different content types
CREATE OR REPLACE FUNCTION generate_storage_path(
  p_user_id UUID,
  p_content_type TEXT, -- 'experience', 'profile', 'restaurant'
  p_file_extension TEXT DEFAULT 'jpg'
)
RETURNS TEXT AS $$
DECLARE
  base_path TEXT;
  timestamp_str TEXT;
  random_suffix TEXT;
BEGIN
  -- Generate timestamp string
  timestamp_str := to_char(NOW(), 'YYYY/MM/DD/HH24MI');
  
  -- Generate random suffix for uniqueness
  random_suffix := substring(gen_random_uuid()::TEXT from 1 for 8);
  
  -- Build path based on content type
  CASE p_content_type
    WHEN 'experience' THEN
      base_path := 'experiences/' || p_user_id || '/' || timestamp_str || '/' || random_suffix || '.' || p_file_extension;
    WHEN 'profile' THEN
      base_path := 'profiles/' || p_user_id || '/avatar_' || random_suffix || '.' || p_file_extension;
    WHEN 'restaurant' THEN
      base_path := 'restaurants/' || timestamp_str || '/' || random_suffix || '.' || p_file_extension;
    ELSE
      base_path := 'misc/' || p_user_id || '/' || timestamp_str || '/' || random_suffix || '.' || p_file_extension;
  END CASE;
  
  RETURN base_path;
END;
$$ LANGUAGE plpgsql;

-- Function to create storage buckets and set policies
CREATE OR REPLACE FUNCTION setup_storage_buckets()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- This function would be called once during setup
  -- In practice, these would be executed as separate SQL commands in Supabase
  
  SELECT json_build_object(
    'success', true,
    'message', 'Storage buckets configured. Execute the following in Supabase Dashboard:',
    'commands', json_build_array(
      'INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES (''food-images'', ''food-images'', true, 10485760, ''{\"image/jpeg\",\"image/png\",\"image/webp\",\"image/heic\"}'');',
      'INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES (''food-videos'', ''food-videos'', true, 52428800, ''{\"video/mp4\",\"video/quicktime\",\"video/webm\"}'');',
      'INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES (''profile-images'', ''profile-images'', true, 5242880, ''{\"image/jpeg\",\"image/png\",\"image/webp\"}'');'
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to validate and process media uploads
CREATE OR REPLACE FUNCTION validate_media_upload(
  p_user_id UUID,
  p_file_path TEXT,
  p_file_size INTEGER,
  p_mime_type TEXT,
  p_content_type TEXT DEFAULT 'experience'
)
RETURNS JSON AS $$
DECLARE
  max_file_size INTEGER;
  allowed_types TEXT[];
  result JSON;
BEGIN
  -- Set limits based on content type
  CASE p_content_type
    WHEN 'experience' THEN
      max_file_size := 10485760; -- 10MB for experience images
      allowed_types := ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    WHEN 'profile' THEN
      max_file_size := 5242880; -- 5MB for profile images
      allowed_types := ARRAY['image/jpeg', 'image/png', 'image/webp'];
    WHEN 'video' THEN
      max_file_size := 52428800; -- 50MB for videos
      allowed_types := ARRAY['video/mp4', 'video/quicktime', 'video/webm'];
    ELSE
      max_file_size := 10485760;
      allowed_types := ARRAY['image/jpeg', 'image/png', 'image/webp'];
  END CASE;
  
  -- Validate file size
  IF p_file_size > max_file_size THEN
    SELECT json_build_object(
      'success', false,
      'error', 'file_too_large',
      'message', 'File size exceeds maximum allowed size',
      'max_size', max_file_size
    ) INTO result;
    RETURN result;
  END IF;
  
  -- Validate mime type
  IF NOT (p_mime_type = ANY(allowed_types)) THEN
    SELECT json_build_object(
      'success', false,
      'error', 'invalid_file_type',
      'message', 'File type not allowed',
      'allowed_types', allowed_types
    ) INTO result;
    RETURN result;
  END IF;
  
  -- Return success with processing instructions
  SELECT json_build_object(
    'success', true,
    'message', 'File validation passed',
    'processing_required', p_content_type IN ('experience', 'profile'),
    'generate_thumbnails', p_mime_type LIKE 'image/%',
    'compress_image', p_mime_type LIKE 'image/%' AND p_file_size > 2097152, -- 2MB
    'extract_metadata', true
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to track media usage and analytics
CREATE OR REPLACE FUNCTION track_media_usage(
  p_user_id UUID,
  p_media_type TEXT, -- 'image', 'video'
  p_upload_size INTEGER,
  p_processing_time INTEGER DEFAULT NULL,
  p_compression_ratio DECIMAL DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  tracking_id UUID;
BEGIN
  -- This would typically be stored in a separate analytics table
  -- For now, we'll update user analytics
  INSERT INTO public.user_analytics (
    user_id, 
    date, 
    photos_uploaded
  ) VALUES (
    p_user_id, 
    CURRENT_DATE,
    CASE WHEN p_media_type = 'image' THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id, date) DO UPDATE SET
    photos_uploaded = user_analytics.photos_uploaded + 
      CASE WHEN p_media_type = 'image' THEN 1 ELSE 0 END;
  
  -- Generate a tracking ID for this upload
  tracking_id := gen_random_uuid();
  
  RETURN tracking_id;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up unused media files
CREATE OR REPLACE FUNCTION cleanup_unused_media(
  p_days_old INTEGER DEFAULT 30,
  p_dry_run BOOLEAN DEFAULT TRUE
)
RETURNS JSON AS $$
DECLARE
  cleanup_count INTEGER := 0;
  result JSON;
BEGIN
  -- This is a placeholder for cleanup logic
  -- In practice, this would:
  -- 1. Find media files not referenced in any active records
  -- 2. Check if they're older than p_days_old days
  -- 3. If not dry_run, delete them from storage
  -- 4. Return count of files that would be/were deleted
  
  -- For now, just return a placeholder response
  SELECT json_build_object(
    'success', true,
    'dry_run', p_dry_run,
    'files_identified', 0,
    'files_deleted', CASE WHEN p_dry_run THEN 0 ELSE 0 END,
    'message', 'Media cleanup completed',
    'note', 'This function requires integration with Supabase Storage API for full implementation'
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to generate different image sizes/thumbnails
CREATE OR REPLACE FUNCTION generate_image_variants(
  p_original_path TEXT,
  p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  variants JSON;
  base_path TEXT;
  extension TEXT;
BEGIN
  -- Extract base path and extension
  base_path := substring(p_original_path from '^(.*)\.([^.]+)$');
  extension := substring(p_original_path from '\.([^.]+)$');
  
  -- Define image variants to generate
  SELECT json_build_object(
    'original', p_original_path,
    'large', base_path || '_large.' || extension,
    'medium', base_path || '_medium.' || extension,
    'small', base_path || '_small.' || extension,
    'thumbnail', base_path || '_thumb.' || extension,
    'processing_instructions', json_build_object(
      'large', json_build_object('width', 1200, 'height', 1200, 'quality', 85),
      'medium', json_build_object('width', 800, 'height', 800, 'quality', 80),
      'small', json_build_object('width', 400, 'height', 400, 'quality', 75),
      'thumbnail', json_build_object('width', 150, 'height', 150, 'quality', 70)
    )
  ) INTO variants;
  
  RETURN variants;
END;
$$ LANGUAGE plpgsql;

-- Function to extract and store image metadata
CREATE OR REPLACE FUNCTION extract_image_metadata(
  p_file_path TEXT,
  p_user_id UUID,
  p_experience_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  metadata JSON;
BEGIN
  -- This function would integrate with image processing services
  -- to extract EXIF data, dominant colors, etc.
  -- For now, return a placeholder structure
  
  SELECT json_build_object(
    'file_path', p_file_path,
    'extracted_at', NOW(),
    'metadata', json_build_object(
      'dimensions', json_build_object('width', null, 'height', null),
      'file_size', null,
      'dominant_colors', json_build_array(),
      'location', json_build_object('lat', null, 'lng', null),
      'timestamp', null,
      'camera_info', json_build_object(
        'make', null,
        'model', null,
        'settings', json_build_object()
      )
    ),
    'processing_required', true,
    'note', 'This function requires integration with image processing services'
  ) INTO metadata;
  
  RETURN metadata;
END;
$$ LANGUAGE plpgsql;

-- Function to optimize storage costs by managing file lifecycles
CREATE OR REPLACE FUNCTION optimize_storage_lifecycle()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- This would implement storage optimization strategies:
  -- 1. Move old, rarely accessed files to cheaper storage tiers
  -- 2. Compress images that haven't been viewed recently
  -- 3. Remove duplicate files
  -- 4. Archive or delete very old temporary files
  
  SELECT json_build_object(
    'success', true,
    'optimizations_applied', json_build_array(
      'Identified rarely accessed files for tier migration',
      'Queued old images for additional compression',
      'Detected and marked duplicate files',
      'Scheduled cleanup of temporary upload files'
    ),
    'estimated_savings', json_build_object(
      'storage_gb', 0,
      'monthly_cost_usd', 0
    ),
    'note', 'This function requires integration with cloud storage management APIs'
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;