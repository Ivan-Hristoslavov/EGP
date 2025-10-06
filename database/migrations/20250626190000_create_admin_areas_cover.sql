-- Create table for service areas covered
CREATE TABLE admin_areas_cover (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  postcode TEXT,
  description TEXT,
  response_time TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Remove serviceAreas field from admin_profile
ALTER TABLE admin_profile DROP COLUMN IF EXISTS service_areas; 