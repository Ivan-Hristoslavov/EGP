-- =====================================================
-- Create Team Table for Admin Profile
-- =====================================================
-- This migration creates a team table for admin profile team members
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TEAM TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS team (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_profile_id UUID REFERENCES admin_profile(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(100) NOT NULL,
  specializations TEXT,
  experience_years VARCHAR(50),
  certifications TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_team_admin_profile_id ON team(admin_profile_id);
CREATE INDEX IF NOT EXISTS idx_team_email ON team(email);
CREATE INDEX IF NOT EXISTS idx_team_active ON team(is_active);
CREATE INDEX IF NOT EXISTS idx_team_role ON team(role);

-- Enable RLS
ALTER TABLE team ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable all operations for authenticated users" ON team
  FOR ALL USING (true) WITH CHECK (true);

-- Create updated_at trigger
CREATE TRIGGER update_team_updated_at 
  BEFORE UPDATE ON team 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

