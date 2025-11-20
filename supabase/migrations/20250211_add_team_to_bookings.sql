-- =====================================================
-- Add Team Member and Service Duration to Bookings
-- =====================================================
-- This migration adds team_member_id and service_duration_minutes to bookings
-- =====================================================

-- Add team_member_id column to bookings
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS team_member_id UUID REFERENCES team(id) ON DELETE SET NULL;

-- Add service_duration_minutes column to bookings
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS service_duration_minutes INTEGER;

-- Create index for team_member_id
CREATE INDEX IF NOT EXISTS idx_bookings_team_member_id ON bookings(team_member_id);

-- Create index for date, time, and team_member_id for availability queries
CREATE INDEX IF NOT EXISTS idx_bookings_team_date_time ON bookings(team_member_id, date, time) 
WHERE status IN ('pending', 'confirmed', 'scheduled');

