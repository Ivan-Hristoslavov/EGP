-- =====================================================
-- EGP Aesthetics - Add Detailed Service Fields
-- =====================================================
-- Migration: 20250117_add_service_detailed_fields.sql
-- Adds fields for service details, benefits, preparation, and aftercare
-- =====================================================

-- Add detailed fields to services table
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS details TEXT,
ADD COLUMN IF NOT EXISTS benefits JSONB, -- Array of benefit strings
ADD COLUMN IF NOT EXISTS preparation TEXT,
ADD COLUMN IF NOT EXISTS aftercare TEXT;

-- Add comments
COMMENT ON COLUMN services.details IS 'Detailed description of the treatment process';
COMMENT ON COLUMN services.benefits IS 'JSON array of treatment benefits';
COMMENT ON COLUMN services.preparation IS 'Pre-treatment preparation instructions';
COMMENT ON COLUMN services.aftercare IS 'Post-treatment aftercare instructions';

-- =====================================================
-- UPDATE EXISTING SERVICES WITH DETAILS
-- =====================================================

-- HydraFacial - Face treatment
UPDATE services 
SET 
  details = 'HydraFacial is a multi-step facial treatment that deep cleanses, extracts, hydrates, and protects the skin. Using patented Vortex-Fusion technology, it delivers immediate, noticeable results with no downtime.',
  benefits = '["Deep cleansing and extraction", "Hydration boost", "Immediate results", "No downtime", "Suitable for all skin types"]'::jsonb,
  preparation = 'Avoid retinoids 48 hours before treatment. Come with clean, makeup-free skin.',
  aftercare = 'Avoid sun exposure for 24 hours. Use gentle skincare products. Apply sunscreen daily.'
WHERE slug = 'hydrafacial';

-- Chemical Peel - Skin treatment
UPDATE services 
SET 
  details = 'Professional chemical peels remove damaged skin layers to reveal smoother, more even-toned skin underneath. We use various acid formulations tailored to your specific skin concerns.',
  benefits = '["Improved skin texture", "Reduced pigmentation", "Acne treatment", "Even skin tone", "Youthful glow"]'::jsonb,
  preparation = 'Avoid retinoids and exfoliants 1 week prior. Clean skin required on the day.',
  aftercare = 'Use gentle skincare only. Avoid sun exposure. Follow peeling schedule as instructed. Apply sunscreen daily.'
WHERE slug = 'chemical-peel';

-- Microneedling - Skin treatment
UPDATE services 
SET 
  details = 'Microneedling creates controlled micro-injuries in the skin to stimulate natural healing and collagen production. This minimally invasive treatment improves skin texture, reduces fine lines, scars, and pigmentation.',
  benefits = '["Collagen stimulation", "Improved texture", "Reduced scars", "Better pigmentation", "Skin renewal"]'::jsonb,
  preparation = 'Clean skin required. Avoid retinoids 1 week prior. Stay hydrated.',
  aftercare = 'Gentle skincare for 72 hours. Avoid sun exposure. Use healing products as recommended. Apply sunscreen daily.'
WHERE slug = 'microneedling';

-- Anti-Wrinkle Injections (Botox)
UPDATE services 
SET 
  details = 'Premium anti-wrinkle treatments relax muscle activity to smooth fine lines and wrinkles. Best results for forehead, frown lines, and crow''s feet. Results appear in 3-7 days and last 3-4 months.',
  benefits = '["Reduced fine lines and wrinkles", "Natural-looking results", "Minimal downtime", "Long-lasting effects", "Non-surgical"]'::jsonb,
  preparation = 'Avoid blood thinners 1 week prior. Clean skin required. Stay hydrated.',
  aftercare = 'Avoid lying down 4 hours post-treatment. No exercise for 24 hours. Avoid touching treated areas. Results appear in 3-7 days.'
WHERE slug = 'anti-wrinkle-injections';

-- Dermal Fillers - Cheeks
UPDATE services 
SET 
  details = 'Premium hyaluronic acid fillers restore volume and enhance cheek definition. This treatment lifts sagging skin and creates youthful facial contours. Results are immediate and natural-looking.',
  benefits = '["Restored cheek volume", "Enhanced facial contours", "Lifted appearance", "Youthful look", "Natural results"]'::jsonb,
  preparation = 'Avoid blood thinners 1 week prior. Clean skin required. Stay hydrated.',
  aftercare = 'Avoid touching treated areas. No makeup for 12 hours. Gentle massage as instructed. Results last 12-18 months.'
WHERE slug = 'dermal-fillers-cheeks';

-- Dermal Fillers - Nasolabial
UPDATE services 
SET 
  details = 'Smooth nasolabial folds and restore youthful facial contours using premium hyaluronic acid fillers. This treatment addresses volume loss between nose and mouth corners.',
  benefits = '["Smoother mid-face", "Reduced nasolabial folds", "Youthful appearance", "Natural enhancement", "Improved facial contours"]'::jsonb,
  preparation = 'Avoid blood thinners 1 week prior. Clean skin required.',
  aftercare = 'Avoid touching treated areas. No makeup for 12 hours. Gentle massage as instructed. Results last 12-18 months.'
WHERE slug = 'dermal-fillers-nasolabial';

-- Lip Fillers
UPDATE services 
SET 
  details = 'Enhance lip volume and shape with natural-looking hyaluronic acid fillers. This treatment can create fuller, more defined lips while maintaining natural movement.',
  benefits = '["Fuller lips", "Enhanced shape", "Natural movement", "Improved definition", "Youthful appearance"]'::jsonb,
  preparation = 'Avoid blood thinners 1 week prior. Clean skin required.',
  aftercare = 'Avoid touching lips. No kissing for 24 hours. Gentle care. Use lip balm. Results last 6-12 months.'
WHERE slug = 'lip-fillers';

-- CoolSculpting - Body
UPDATE services 
SET 
  details = 'Non-invasive fat reduction treatment that freezes away stubborn fat cells using controlled cooling technology. Body naturally eliminates frozen fat cells over several months.',
  benefits = '["Non-surgical fat reduction", "Permanent fat cell elimination", "No downtime", "Safe and effective", "Natural elimination"]'::jsonb,
  preparation = 'Clean skin required. Stay hydrated. Wear comfortable clothing.',
  aftercare = 'Gentle massage of treated areas. Stay hydrated. Results develop over 2-4 months. Multiple sessions may be recommended.'
WHERE slug = 'coolsculpting';

-- Forehead Lines Treatment
UPDATE services 
SET 
  details = 'Target horizontal forehead lines with precision anti-wrinkle injections. This treatment creates a smoother, more youthful appearance while maintaining natural facial expressions.',
  benefits = '["Smoother forehead", "Reduced lines", "Youthful appearance", "Natural expressions", "Long-lasting"]'::jsonb,
  preparation = 'Avoid blood thinners 1 week prior. Clean skin required.',
  aftercare = 'Avoid lying down 4 hours. No exercise for 24 hours. Results in 3-7 days.'
WHERE slug = 'forehead-lines-treatment';

-- Crow''s Feet Treatment
UPDATE services 
SET 
  details = 'Smooth out crow''s feet around the eyes for a refreshed appearance. This treatment targets fine lines and wrinkles while maintaining natural eye movement.',
  benefits = '["Smoother eye area", "Reduced crow''s feet", "Natural movement", "Quick treatment", "Effective results"]'::jsonb,
  preparation = 'Avoid blood thinners 1 week prior. Clean skin required. Remove eye makeup thoroughly.',
  aftercare = 'Avoid lying down 4 hours. No exercise for 24 hours. Use gentle eye products. Results in 3-7 days.'
WHERE slug = 'crows-feet-treatment';

-- Cheek Volume Restoration
UPDATE services 
SET 
  details = 'Restore lost cheek volume and create natural-looking lift using premium hyaluronic acid fillers. This treatment addresses volume loss and lifts sagging skin.',
  benefits = '["Restored cheek volume", "Enhanced facial contours", "Lifted appearance", "Youthful look", "Natural results"]'::jsonb,
  preparation = 'Avoid blood thinners 1 week prior. Clean skin required.',
  aftercare = 'Avoid touching treated areas. No makeup for 12 hours. Gentle massage as instructed. Results last 12-18 months.'
WHERE slug = 'cheek-volume-restoration';

-- =====================================================
-- MIGRATION COMPLETED
-- =====================================================
-- Added detailed fields: details, benefits, preparation, aftercare
-- Updated 11 existing services with comprehensive information
-- =====================================================

