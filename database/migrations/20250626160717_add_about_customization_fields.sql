-- Add About Me customization fields to admin_profile table
ALTER TABLE admin_profile 
ADD COLUMN years_of_experience TEXT DEFAULT '10+',
ADD COLUMN specializations TEXT DEFAULT 'Emergency repairs, Boiler installations, Bathroom plumbing',
ADD COLUMN certifications TEXT DEFAULT 'Gas Safe Registered, City & Guilds Level 3',
ADD COLUMN service_areas TEXT DEFAULT 'Clapham, Balham, Chelsea, Wandsworth, Battersea',
ADD COLUMN response_time TEXT DEFAULT '45 minutes';

-- Update existing records with default values
UPDATE admin_profile 
SET 
  years_of_experience = COALESCE(years_of_experience, '10+'),
  specializations = COALESCE(specializations, 'Emergency repairs, Boiler installations, Bathroom plumbing'),
  certifications = COALESCE(certifications, 'Gas Safe Registered, City & Guilds Level 3'),
  service_areas = COALESCE(service_areas, 'Clapham, Balham, Chelsea, Wandsworth, Battersea'),
  response_time = COALESCE(response_time, '45 minutes'); 