-- =====================================================
-- Fix Hero Section RLS Policies
-- =====================================================
-- Migration: 20250219_fix_hero_section_rls.sql
-- Fixes RLS policies to allow admin operations
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view active hero sections" ON hero_section;
DROP POLICY IF EXISTS "Admins can manage hero sections" ON hero_section;

-- Recreate policies with correct permissions
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

