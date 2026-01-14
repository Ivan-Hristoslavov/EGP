-- =====================================================
-- Add Image Position Fields to Hero Section
-- =====================================================
-- Migration: 20250220_add_image_position_to_hero_section.sql
-- Adds object-position fields for each hero image to allow cropping/positioning
-- =====================================================

-- Add object-position columns for each image
-- Valid values: object-center, object-top, object-bottom, object-left, object-right, 
-- object-left-top, object-left-bottom, object-right-top, object-right-bottom
ALTER TABLE hero_section 
ADD COLUMN IF NOT EXISTS image_1_position TEXT DEFAULT 'object-center',
ADD COLUMN IF NOT EXISTS image_2_position TEXT DEFAULT 'object-center',
ADD COLUMN IF NOT EXISTS image_3_position TEXT DEFAULT 'object-center';

-- Add comments
COMMENT ON COLUMN hero_section.image_1_position IS 'CSS object-position for image 1 (object-center, object-top, object-bottom, etc.)';
COMMENT ON COLUMN hero_section.image_2_position IS 'CSS object-position for image 2 (object-center, object-top, object-bottom, etc.)';
COMMENT ON COLUMN hero_section.image_3_position IS 'CSS object-position for image 3 (object-center, object-top, object-bottom, etc.)';

