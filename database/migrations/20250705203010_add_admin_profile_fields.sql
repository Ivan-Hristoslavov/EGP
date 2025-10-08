-- Add legal documents fields to admin_profile table
-- Note: Other fields (years_of_experience, specializations, certifications, response_time) 
-- are already added in previous migration 20250626160717
-- service_areas was removed in migration 20250626190000 in favor of admin_areas_cover table
ALTER TABLE admin_profile ADD COLUMN IF NOT EXISTS terms_and_conditions TEXT;
ALTER TABLE admin_profile ADD COLUMN IF NOT EXISTS privacy_policy TEXT;
