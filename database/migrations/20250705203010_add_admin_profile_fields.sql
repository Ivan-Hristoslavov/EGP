-- Add missing fields to admin_profile table
ALTER TABLE admin_profile ADD COLUMN IF NOT EXISTS years_of_experience VARCHAR(100);
ALTER TABLE admin_profile ADD COLUMN IF NOT EXISTS specializations TEXT;
ALTER TABLE admin_profile ADD COLUMN IF NOT EXISTS certifications TEXT;
ALTER TABLE admin_profile ADD COLUMN IF NOT EXISTS service_areas TEXT;
ALTER TABLE admin_profile ADD COLUMN IF NOT EXISTS response_time VARCHAR(100);
ALTER TABLE admin_profile ADD COLUMN IF NOT EXISTS terms_and_conditions TEXT;
ALTER TABLE admin_profile ADD COLUMN IF NOT EXISTS privacy_policy TEXT;
