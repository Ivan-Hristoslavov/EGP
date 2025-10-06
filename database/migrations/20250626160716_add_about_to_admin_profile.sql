-- Add about column to admin_profile table
ALTER TABLE admin_profile ADD COLUMN IF NOT EXISTS about TEXT;

-- Add a default about text for existing records
UPDATE admin_profile SET about = 'Professional plumber with over 10 years of experience in London. Specializing in emergency plumbing, leak detection, and high-quality installations.' WHERE about IS NULL;
