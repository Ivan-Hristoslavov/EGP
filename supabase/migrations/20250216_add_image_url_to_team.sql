-- =====================================================
-- Add image_url column to team table
-- =====================================================
-- This migration adds an image_url field to store team member profile images
-- =====================================================

ALTER TABLE team 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN team.image_url IS 'URL to team member profile image stored in Supabase storage';

