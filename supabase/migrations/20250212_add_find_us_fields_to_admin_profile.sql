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
  whatsapp = COALESCE(whatsapp, phone),
  how_to_find_us = COALESCE(NULLIF(how_to_find_us, ''), 'Our clinic is located in South West London, easily accessible by public transport and car. We are situated on Hassocks Road in the SW16 area, close to Streatham and Tooting.'),
  how_to_reach_us = COALESCE(NULLIF(how_to_reach_us, ''), 'We are conveniently located near major transport links. The clinic is easily reachable by bus, train, and car, with good parking options available nearby.'),
  google_maps_address = COALESCE(NULLIF(google_maps_address, ''), company_address),
  transport_options = CASE 
    WHEN transport_options IS NULL OR transport_options::text = '{}' OR transport_options::text = '{"tube":[]}' OR transport_options::text = '"{\"tube\":[]}"' THEN '{
      "tube": [
        {"station": "Streatham Station", "lines": "Southern Railway", "distance": "~10 min walk"},
        {"station": "Tooting Station", "lines": "Northern line", "distance": "~15 min walk / ~5 min bus"},
        {"station": "Balham Station", "lines": "Northern line", "distance": "~15 min walk / ~5 min bus"}
      ],
      "bus": [
        {"route": "118, 250", "stop": "Hassocks Road stop", "distance": "2 min walk"},
        {"route": "57, 159", "stop": "Streatham High Road stop", "distance": "~5 min walk"},
        {"route": "118, 250, 333", "stop": "Tooting Bec stop", "distance": "~8 min walk"}
      ],
      "car": [
        {"parking": "On-street parking", "distance": "", "notes": "Available on Hassocks Road and surrounding streets"},
        {"parking": "Nearby car parks", "distance": "~3-5 min walk", "notes": "Various options in the area"},
        {"parking": "Residential parking", "distance": "", "notes": "Please check parking restrictions"}
      ],
      "walking": [
        {"from": "Streatham High Road", "distance": "~10 minutes"},
        {"from": "Tooting Bec Common", "distance": "~8 minutes"},
        {"from": "Streatham Common", "distance": "~12 minutes"}
      ]
    }'::jsonb
    ELSE transport_options
  END,
  nearby_landmarks = CASE
    WHEN nearby_landmarks IS NULL OR nearby_landmarks::text = '[]' OR nearby_landmarks::text = '"[]"' THEN '[
      {"name": "Streatham Common", "type": "Park", "distance": "~12 min walk"},
      {"name": "Tooting Bec Common", "type": "Park", "distance": "~8 min walk"},
      {"name": "Streatham High Road", "type": "Shopping", "distance": "~10 min walk"},
      {"name": "Tooting Broadway", "type": "Shopping", "distance": "~15 min walk / ~5 min bus"},
      {"name": "Balham", "type": "Area", "distance": "~15 min walk / ~5 min bus"},
      {"name": "Norbury Park", "type": "Park", "distance": "~20 min walk / ~10 min bus"}
    ]'::jsonb
    ELSE nearby_landmarks
  END
WHERE how_to_find_us IS NULL OR how_to_find_us = '' OR how_to_reach_us IS NULL OR how_to_reach_us = '';

-- Add comment to columns
COMMENT ON COLUMN admin_profile.whatsapp IS 'WhatsApp contact number';
COMMENT ON COLUMN admin_profile.how_to_find_us IS 'Description of how to find the clinic location';
COMMENT ON COLUMN admin_profile.how_to_reach_us IS 'Description of how to reach the clinic';
COMMENT ON COLUMN admin_profile.transport_options IS 'JSONB object containing transport options (tube, bus, car, walking)';
COMMENT ON COLUMN admin_profile.nearby_landmarks IS 'JSONB array of nearby landmarks with name, type, and distance';
COMMENT ON COLUMN admin_profile.google_maps_address IS 'Address used for Google Maps embed and directions';

