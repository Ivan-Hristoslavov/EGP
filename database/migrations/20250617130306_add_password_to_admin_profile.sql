-- Add password field to admin_profile table
ALTER TABLE admin_profile 
ADD COLUMN password TEXT;

-- Set default password for all existing records
UPDATE admin_profile 
SET password = 'plamen-admin-2024'
WHERE password IS NULL;

-- Update existing admin profile with environment-based credentials
-- Note: In production, passwords should be properly hashed
UPDATE admin_profile 
SET 
  email = 'admin@egp.com',
  password = 'plamen-admin-2024',
  name = 'Plamen Zhelev'
WHERE email = 'admin@egp.com';

-- Make password field required for future records
ALTER TABLE admin_profile 
ALTER COLUMN password SET NOT NULL;
