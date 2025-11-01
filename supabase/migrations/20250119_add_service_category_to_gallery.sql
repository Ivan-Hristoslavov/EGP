-- =====================================================
-- Add Service and Category References to Gallery
-- =====================================================
-- This migration adds service_id and category_id to gallery table
-- =====================================================

-- Add service_id and category_id columns to gallery table
ALTER TABLE gallery 
ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES services(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_gallery_service_id ON gallery(service_id);
CREATE INDEX IF NOT EXISTS idx_gallery_category_id ON gallery(category_id);

-- =====================================================
-- MIGRATION COMPLETED
-- =====================================================

