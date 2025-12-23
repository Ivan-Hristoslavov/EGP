-- Migration: Remove unused fields from admin_profile table
-- Date: 2025-02-16
-- Description: Remove fields that are no longer used in the application

-- Drop columns that are no longer needed
ALTER TABLE admin_profile
DROP COLUMN IF EXISTS about,
DROP COLUMN IF EXISTS years_of_experience,
DROP COLUMN IF EXISTS specializations,
DROP COLUMN IF EXISTS certifications,
DROP COLUMN IF EXISTS response_time,
DROP COLUMN IF EXISTS bank_name,
DROP COLUMN IF EXISTS gas_safe_number,
DROP COLUMN IF EXISTS insurance_provider,
DROP COLUMN IF EXISTS gas_safe_registered,
DROP COLUMN IF EXISTS fully_insured,
DROP COLUMN IF EXISTS terms_and_conditions;

-- Add comment to document the change
COMMENT ON TABLE admin_profile IS 'Admin profile table - removed unused fields: about, years_of_experience, specializations, certifications, response_time, bank_name, gas_safe_number, insurance_provider, gas_safe_registered, fully_insured, terms_and_conditions';

