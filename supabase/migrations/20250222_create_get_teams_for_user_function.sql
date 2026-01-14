-- =====================================================
-- Create get_teams_for_user function
-- =====================================================
-- This function returns team members for a given user/customer ID
-- =====================================================

-- Drop existing function if it exists (to handle return type changes)
DROP FUNCTION IF EXISTS get_teams_for_user(UUID);

CREATE OR REPLACE FUNCTION get_teams_for_user(user_id UUID)
RETURNS TABLE (
  id UUID,
  admin_profile_id UUID,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  role VARCHAR(100),
  specializations TEXT,
  experience_years VARCHAR(50),
  certifications TEXT,
  is_active BOOLEAN,
  image_url TEXT,
  service_ids UUID[],
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Return all active team members
  -- If you need to filter by user_id, you can add a WHERE clause
  -- For now, returning all active team members
  RETURN QUERY
  SELECT 
    t.id,
    t.admin_profile_id,
    t.name,
    t.email,
    t.phone,
    t.role,
    t.specializations,
    t.experience_years,
    t.certifications,
    t.is_active,
    COALESCE(t.image_url, ''::TEXT) as image_url,
    COALESCE(t.service_ids, '{}'::UUID[]) as service_ids,
    t.created_at,
    t.updated_at
  FROM team t
  WHERE t.is_active = true
  ORDER BY t.created_at ASC;
END;
$$;

-- Grant execute permission to anon role
GRANT EXECUTE ON FUNCTION get_teams_for_user(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_teams_for_user(UUID) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION get_teams_for_user(UUID) IS 'Returns all active team members. The user_id parameter is currently not used but kept for future filtering capabilities.';
