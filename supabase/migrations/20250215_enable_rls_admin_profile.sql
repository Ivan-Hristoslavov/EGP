-- =====================================================
-- Enable RLS on admin_profile table
-- =====================================================
-- This migration ensures that Row Level Security (RLS)
-- is enabled on the admin_profile table and creates
-- a policy to allow all operations (admin operations
-- use service role key which bypasses RLS)
-- =====================================================

-- Enable Row Level Security on admin_profile
ALTER TABLE admin_profile ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow all operations on admin_profile" ON admin_profile;

-- Create policy to allow all operations
-- Note: Admin operations use service role key which bypasses RLS
-- This policy allows the anon key to perform operations when needed
CREATE POLICY "Allow all operations on admin_profile" ON admin_profile
  FOR ALL USING (true) WITH CHECK (true);

-- Grant necessary permissions to anon role
GRANT ALL ON admin_profile TO anon;

-- Add comment for documentation
COMMENT ON TABLE admin_profile IS 'Admin profile information. RLS is enabled with a policy allowing all operations.';

