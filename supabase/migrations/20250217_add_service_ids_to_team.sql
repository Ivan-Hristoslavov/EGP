-- =====================================================
-- Add service_ids array column to team table
-- =====================================================
-- This migration adds a service_ids field to store array of service IDs
-- that each team member can perform
-- =====================================================

ALTER TABLE team 
ADD COLUMN IF NOT EXISTS service_ids UUID[] DEFAULT '{}';

-- Create index for array operations
CREATE INDEX IF NOT EXISTS idx_team_service_ids ON team USING GIN (service_ids);

-- Add comment for documentation
COMMENT ON COLUMN team.service_ids IS 'Array of service IDs that this team member can perform';

