-- =====================================================
-- Create Hero Section Table
-- =====================================================
-- Migration: 20250219_create_hero_section_table.sql
-- Creates table for managing hero section content with images, text, and buttons
-- =====================================================

-- Create hero_section table
CREATE TABLE IF NOT EXISTS hero_section (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Images (3 images for animation)
  image_1_url TEXT,
  image_2_url TEXT,
  image_3_url TEXT,
  
  -- Main content
  badge_text TEXT DEFAULT 'Award-Winning Clinic',
  badge_icon TEXT DEFAULT 'star', -- icon identifier (star, award, etc.)
  
  main_headline TEXT NOT NULL DEFAULT 'Your Journey to Confidence',
  sub_headline TEXT DEFAULT 'Personalised treatments tailored to your unique goals',
  
  -- Feature list (3 features)
  feature_1_text TEXT DEFAULT '1000+ Treatments',
  feature_2_text TEXT DEFAULT '100% Satisfaction',
  feature_3_text TEXT DEFAULT 'Professional Standards',
  
  -- Buttons
  button_1_text TEXT DEFAULT 'Book Treatment Now',
  button_1_icon TEXT DEFAULT 'calendar',
  button_1_link TEXT DEFAULT '#contact',
  button_1_type TEXT DEFAULT 'internal', -- internal or external
  
  button_2_text TEXT DEFAULT 'WhatsApp Us',
  button_2_icon TEXT DEFAULT 'whatsapp',
  button_2_link TEXT,
  button_2_type TEXT DEFAULT 'external',
  
  -- Contact information
  contact_label TEXT DEFAULT 'Or call us now:',
  phone_number TEXT,
  
  -- Image settings
  image_resize_enabled BOOLEAN DEFAULT true,
  image_max_width INTEGER DEFAULT 1920,
  image_max_height INTEGER DEFAULT 1080,
  image_quality DECIMAL(3,2) DEFAULT 0.85,
  
  -- Display settings
  is_active BOOLEAN DEFAULT true,
  animation_duration_ms INTEGER DEFAULT 6000, -- milliseconds between image transitions
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for active hero sections
CREATE INDEX IF NOT EXISTS idx_hero_section_active ON hero_section(is_active) WHERE is_active = true;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_hero_section_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists before creating
DROP TRIGGER IF EXISTS update_hero_section_updated_at ON hero_section;

CREATE TRIGGER update_hero_section_updated_at
  BEFORE UPDATE ON hero_section
  FOR EACH ROW
  EXECUTE FUNCTION update_hero_section_updated_at();

-- Enable RLS
ALTER TABLE hero_section ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view active hero sections" ON hero_section;
DROP POLICY IF EXISTS "Admins can manage hero sections" ON hero_section;
DROP POLICY IF EXISTS "Allow all operations on hero_section" ON hero_section;

-- RLS Policies
-- Allow public read access to active hero sections
CREATE POLICY "Public can view active hero sections"
  ON hero_section
  FOR SELECT
  USING (is_active = true);

-- Allow all operations for admin panel (uses anon key)
CREATE POLICY "Allow all operations on hero_section" ON hero_section
  FOR ALL USING (true) WITH CHECK (true);

-- Grant necessary permissions to anon role
GRANT ALL ON hero_section TO anon;

-- Insert default hero section
INSERT INTO hero_section (
  badge_text,
  main_headline,
  sub_headline,
  feature_1_text,
  feature_2_text,
  feature_3_text,
  button_1_text,
  button_2_text,
  contact_label,
  is_active
) VALUES (
  'Award-Winning Clinic',
  'Your Journey to Confidence',
  'Personalised treatments tailored to your unique goals',
  '1000+ Treatments',
  '100% Satisfaction',
  'Professional Standards',
  'Book Treatment Now',
  'WhatsApp Us',
  'Or call us now:',
  true
)
ON CONFLICT DO NOTHING;

-- Add comments
COMMENT ON TABLE hero_section IS 'Stores hero section content including images, text, and button configurations';
COMMENT ON COLUMN hero_section.image_resize_enabled IS 'Whether to resize images on upload (false = keep original quality)';
COMMENT ON COLUMN hero_section.animation_duration_ms IS 'Duration in milliseconds between image transitions';

