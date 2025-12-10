-- =====================================================
-- Create team_day_off_periods table
-- =====================================================
-- This migration creates a table to store day off periods
-- for team members, allowing them to mark themselves as
-- unavailable for specific date ranges.
-- =====================================================

CREATE TABLE IF NOT EXISTS team_day_off_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID NOT NULL REFERENCES team(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure end_date is after start_date
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_team_day_off_team_member_id ON team_day_off_periods(team_member_id);
CREATE INDEX IF NOT EXISTS idx_team_day_off_dates ON team_day_off_periods(start_date, end_date);

-- Enable RLS
ALTER TABLE team_day_off_periods ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (admin operations use service role key)
DROP POLICY IF EXISTS "Allow all operations on team_day_off_periods" ON team_day_off_periods;
CREATE POLICY "Allow all operations on team_day_off_periods" ON team_day_off_periods
  FOR ALL USING (true) WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON team_day_off_periods TO anon;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_team_day_off_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_team_day_off_periods_updated_at ON team_day_off_periods;
CREATE TRIGGER update_team_day_off_periods_updated_at
  BEFORE UPDATE ON team_day_off_periods
  FOR EACH ROW
  EXECUTE FUNCTION update_team_day_off_updated_at();

-- Add comment for documentation
COMMENT ON TABLE team_day_off_periods IS 'Day off periods for team members. Used to mark team members as unavailable for specific date ranges.';

