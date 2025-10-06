-- Add business_email field to admin_profile table
ALTER TABLE admin_profile ADD COLUMN IF NOT EXISTS business_email VARCHAR(255);

-- Update existing admin profile with business email
UPDATE admin_profile 
SET business_email = 'pzplumbingservices@gmail.com' 
WHERE business_email IS NULL;

-- Make business_email NOT NULL after setting default value
ALTER TABLE admin_profile ALTER COLUMN business_email SET NOT NULL; 