-- =====================================================
-- EGP Aesthetics - Add Description to Service Categories
-- =====================================================
-- Migration: 20250117_add_category_description.sql
-- Adds description field to service_categories table
-- =====================================================

-- Add description field to service_categories table
ALTER TABLE service_categories 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add comment
COMMENT ON COLUMN service_categories.description IS 'Description of the service category.';

-- =====================================================
-- MIGRATION COMPLETED
-- =====================================================

