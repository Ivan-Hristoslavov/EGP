-- =====================================================
-- Add Missing Fields to Admin Profile
-- =====================================================
-- This migration adds fields that are referenced in the code
-- but missing from the admin_profile table
-- =====================================================

-- Add years_of_experience
ALTER TABLE admin_profile 
ADD COLUMN IF NOT EXISTS years_of_experience VARCHAR(50);

-- Add specializations
ALTER TABLE admin_profile 
ADD COLUMN IF NOT EXISTS specializations TEXT;

-- Add certifications
ALTER TABLE admin_profile 
ADD COLUMN IF NOT EXISTS certifications TEXT;

-- Add response_time
ALTER TABLE admin_profile 
ADD COLUMN IF NOT EXISTS response_time VARCHAR(50);

-- Add comments to columns
COMMENT ON COLUMN admin_profile.years_of_experience IS 'Years of professional experience';
COMMENT ON COLUMN admin_profile.specializations IS 'Professional specializations';
COMMENT ON COLUMN admin_profile.certifications IS 'Professional certifications';
COMMENT ON COLUMN admin_profile.response_time IS 'Average response time';

