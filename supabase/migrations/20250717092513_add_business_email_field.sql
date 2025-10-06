-- Add business_email column to admin_profile table
ALTER TABLE admin_profile ADD COLUMN IF NOT EXISTS business_email VARCHAR(255);

-- Set default business_email to current email value for existing records
UPDATE admin_profile 
SET business_email = email 
WHERE business_email IS NULL;

-- Add comment for clarity
COMMENT ON COLUMN admin_profile.email IS 'Admin login email - for authentication only';
COMMENT ON COLUMN admin_profile.business_email IS 'Business email - displayed to customers';
