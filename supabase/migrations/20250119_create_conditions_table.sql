-- =====================================================
-- EGP Aesthetics - Create Conditions Table
-- =====================================================
-- Migration: 20250119_create_conditions_table.sql
-- Creates conditions table for storing condition information
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CONDITIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('Face Conditions', 'Body Conditions')),
  description TEXT NOT NULL,
  treatments JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of treatment strings
  popular BOOLEAN DEFAULT FALSE,
  seo_title VARCHAR(255),
  seo_description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_conditions_slug ON conditions(slug);
CREATE INDEX IF NOT EXISTS idx_conditions_category ON conditions(category);
CREATE INDEX IF NOT EXISTS idx_conditions_active ON conditions(is_active);
CREATE INDEX IF NOT EXISTS idx_conditions_popular ON conditions(popular);

-- Enable Row Level Security
ALTER TABLE conditions ENABLE ROW LEVEL SECURITY;

-- Public read access
DROP POLICY IF EXISTS "Public read access to conditions" ON conditions;
CREATE POLICY "Public read access to conditions" ON conditions
  FOR SELECT
  USING (is_active = TRUE);

-- Authenticated users can read all conditions (for admin)
DROP POLICY IF EXISTS "Authenticated users can read all conditions" ON conditions;
CREATE POLICY "Authenticated users can read all conditions" ON conditions
  FOR SELECT
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_conditions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_conditions_updated_at ON conditions;
CREATE TRIGGER update_conditions_updated_at
  BEFORE UPDATE ON conditions
  FOR EACH ROW
  EXECUTE FUNCTION update_conditions_updated_at();

