-- Update admin profile password to use bcrypt hashed version
-- This migration will be run after the init-admin.js script sets the hashed password
-- Note: This is a placeholder migration - the actual password update happens via the init script

-- Add a comment to indicate password security improvement
COMMENT ON COLUMN admin_profile.password IS 'Bcrypt hashed password for secure authentication'; 