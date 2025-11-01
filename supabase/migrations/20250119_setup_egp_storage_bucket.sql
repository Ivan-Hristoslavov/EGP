-- =====================================================
-- Setup EGP Storage Bucket and Policies
-- =====================================================
-- This migration ensures the 'egp' bucket exists and has proper policies
-- =====================================================

-- Create the 'egp' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'egp',
  'egp',
  true, -- Public bucket for image access
  10485760, -- 10MB file size limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'] -- Allowed image types
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- =====================================================
-- RLS POLICIES FOR EGP BUCKET
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read egp images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload egp images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update egp images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete egp images" ON storage.objects;

-- Allow public read access (for displaying images on website)
CREATE POLICY "Public can read egp images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'egp');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload egp images" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'egp' 
  AND (auth.role() = 'authenticated' OR auth.role() = 'service_role')
);

-- Allow authenticated users to update images
CREATE POLICY "Authenticated users can update egp images" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'egp' 
  AND (auth.role() = 'authenticated' OR auth.role() = 'service_role')
);

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete egp images" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'egp' 
  AND (auth.role() = 'authenticated' OR auth.role() = 'service_role')
);

-- =====================================================
-- MIGRATION COMPLETED
-- =====================================================

