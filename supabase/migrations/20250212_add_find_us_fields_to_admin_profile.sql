-- =====================================================
-- Add Find Us Page Fields to Admin Profile
-- =====================================================
-- This migration adds fields for location information,
-- transport options, and nearby landmarks to admin_profile
-- =====================================================

-- Add WhatsApp number
ALTER TABLE admin_profile 
ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(50);

-- Add how to find us description
ALTER TABLE admin_profile 
ADD COLUMN IF NOT EXISTS how_to_find_us TEXT;

-- Add how to reach us description
ALTER TABLE admin_profile 
ADD COLUMN IF NOT EXISTS how_to_reach_us TEXT;

-- Add transport options as JSONB
-- Structure: {
--   "tube": [{"station": "...", "lines": "...", "distance": "..."}],
--   "bus": [{"route": "...", "stop": "...", "distance": "..."}],
--   "car": [{"parking": "...", "distance": "...", "notes": "..."}],
--   "walking": [{"from": "...", "distance": "..."}]
-- }
ALTER TABLE admin_profile 
ADD COLUMN IF NOT EXISTS transport_options JSONB DEFAULT '{}'::jsonb;

-- Add nearby landmarks as JSONB array
-- Structure: [
--   {"name": "...", "type": "...", "distance": "..."}
-- ]
ALTER TABLE admin_profile 
ADD COLUMN IF NOT EXISTS nearby_landmarks JSONB DEFAULT '[]'::jsonb;

-- Add Google Maps address/location
ALTER TABLE admin_profile 
ADD COLUMN IF NOT EXISTS google_maps_address TEXT;

-- Insert default data for existing records (if any)
UPDATE admin_profile
SET 
  whatsapp = phone,
  how_to_find_us = 'Our clinic is located in the heart of London''s medical district, easily accessible by public transport and car.',
  how_to_reach_us = 'We are conveniently located near major transport links and landmarks.',
  google_maps_address = '809 Wandsworth Road, SW8 3JH, London, UK',
  transport_options = '{
    "tube": [
      {"station": "Bond Street Station", "lines": "Central & Jubilee lines", "distance": "5 min walk"},
      {"station": "Oxford Circus Station", "lines": "Central, Bakerloo & Victoria lines", "distance": "7 min walk"},
      {"station": "Regent''s Park Station", "lines": "Bakerloo line", "distance": "10 min walk"}
    ],
    "bus": [
      {"route": "2, 13, 74, 113, 139, 159, 453", "stop": "Harley Street stop", "distance": ""},
      {"route": "88, 453", "stop": "Cavendish Square stop", "distance": ""},
      {"route": "2, 13, 74, 139, 159", "stop": "Oxford Circus stop", "distance": ""}
    ],
    "car": [
      {"parking": "Q-Park Oxford Street", "distance": "5 min walk", "notes": ""},
      {"parking": "NCP Car Park Cavendish Square", "distance": "3 min walk", "notes": ""},
      {"parking": "Meter parking", "distance": "", "notes": "Available on surrounding streets"},
      {"parking": "Valet parking service", "distance": "", "notes": "Advance booking required"}
    ],
    "walking": [
      {"from": "Oxford Street", "distance": "5 minutes"},
      {"from": "Regent Street", "distance": "7 minutes"},
      {"from": "Bond Street", "distance": "10 minutes"},
      {"from": "London''s medical district", "distance": "Located in the heart"}
    ]
  }'::jsonb,
  nearby_landmarks = '[
    {"name": "Vauxhall Bridge", "type": "Landmark", "distance": "~5 min walk"},
    {"name": "Battersea Power Station", "type": "Landmark", "distance": "~10–12 min walk / ~5 min taxi"},
    {"name": "St George''s Wharf", "type": "Residential", "distance": "~8–9 min walk"},
    {"name": "King''s Road, Chelsea", "type": "Shopping", "distance": "~12–15 min by car"},
    {"name": "Harrods", "type": "Department Store", "distance": "~15–18 min by public transport / ~10–12 min by car"},
    {"name": "Big Ben (Elizabeth Tower)", "type": "Landmark", "distance": "~16–20 min by public transport"},
    {"name": "Palace of Westminster", "type": "Landmark", "distance": "~16–20 min by public transport"},
    {"name": "Westminster Abbey", "type": "Landmark", "distance": "~16–20 min by public transport"}
  ]'::jsonb
WHERE whatsapp IS NULL;

-- Add comment to columns
COMMENT ON COLUMN admin_profile.whatsapp IS 'WhatsApp contact number';
COMMENT ON COLUMN admin_profile.how_to_find_us IS 'Description of how to find the clinic location';
COMMENT ON COLUMN admin_profile.how_to_reach_us IS 'Description of how to reach the clinic';
COMMENT ON COLUMN admin_profile.transport_options IS 'JSONB object containing transport options (tube, bus, car, walking)';
COMMENT ON COLUMN admin_profile.nearby_landmarks IS 'JSONB array of nearby landmarks with name, type, and distance';
COMMENT ON COLUMN admin_profile.google_maps_address IS 'Address used for Google Maps embed and directions';

