-- =====================================================
-- EGP Aesthetics - Services Table Migration (Normalized)
-- =====================================================
-- Migration: 20250116_create_services_table.sql
-- Creates normalized services structure: main_tabs -> categories -> services
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. MAIN TABS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS main_tabs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for main_tabs
CREATE INDEX IF NOT EXISTS idx_main_tabs_slug ON main_tabs(slug);

-- =====================================================
-- 2. SERVICE CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  main_tab_id UUID NOT NULL REFERENCES main_tabs(id) ON DELETE CASCADE,
  slug VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(main_tab_id, slug)
);

-- Create indexes for service_categories
CREATE INDEX IF NOT EXISTS idx_service_categories_main_tab_id ON service_categories(main_tab_id);
CREATE INDEX IF NOT EXISTS idx_service_categories_slug ON service_categories(slug);

-- =====================================================
-- 3. SERVICES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- in minutes
  price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  requires_consultation BOOLEAN DEFAULT FALSE,
  downtime_days INTEGER DEFAULT 0,
  results_duration_weeks INTEGER, -- null for permanent results
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for services
CREATE INDEX IF NOT EXISTS idx_services_category_id ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_is_featured ON services(is_featured);
CREATE INDEX IF NOT EXISTS idx_services_display_order ON services(display_order);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE main_tabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all on main_tabs" ON main_tabs;
DROP POLICY IF EXISTS "Allow all on service_categories" ON service_categories;
DROP POLICY IF EXISTS "Allow all on services" ON services;

-- Create permissive policies (allow all operations for now - restrict later based on auth)
CREATE POLICY "Allow all on main_tabs" ON main_tabs FOR ALL USING (true);
CREATE POLICY "Allow all on service_categories" ON service_categories FOR ALL USING (true);
CREATE POLICY "Allow all on services" ON services FOR ALL USING (true);

-- =====================================================
-- 5. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_main_tabs_updated_at 
    BEFORE UPDATE ON main_tabs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_categories_updated_at 
    BEFORE UPDATE ON service_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at 
    BEFORE UPDATE ON services 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate service slug from name
CREATE OR REPLACE FUNCTION generate_service_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate slug before insert
CREATE TRIGGER generate_service_slug_trigger
  BEFORE INSERT OR UPDATE ON services
  FOR EACH ROW
  WHEN (NEW.slug IS NULL OR NEW.slug = '' OR NEW.slug = NEW.name)
  EXECUTE FUNCTION generate_service_slug();

-- =====================================================
-- 6. INSERT MAIN TABS DATA
-- =====================================================

INSERT INTO main_tabs (slug, name, display_order, is_active) VALUES
  ('book-now', 'BOOK NOW', 1, TRUE),
  ('by-condition', 'BY CONDITION', 2, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 7. INSERT SERVICE CATEGORIES DATA
-- =====================================================

-- BOOK NOW Categories
INSERT INTO service_categories (main_tab_id, slug, name, display_order, is_active)
SELECT mt.id, 'face', 'FACE', 1, TRUE
FROM main_tabs mt WHERE mt.slug = 'book-now'
ON CONFLICT (main_tab_id, slug) DO NOTHING;

INSERT INTO service_categories (main_tab_id, slug, name, display_order, is_active)
SELECT mt.id, 'anti-wrinkle', 'ANTI-WRINKLE INJECTIONS', 2, TRUE
FROM main_tabs mt WHERE mt.slug = 'book-now'
ON CONFLICT (main_tab_id, slug) DO NOTHING;

INSERT INTO service_categories (main_tab_id, slug, name, display_order, is_active)
SELECT mt.id, 'fillers', 'FILLERS', 3, TRUE
FROM main_tabs mt WHERE mt.slug = 'book-now'
ON CONFLICT (main_tab_id, slug) DO NOTHING;

INSERT INTO service_categories (main_tab_id, slug, name, display_order, is_active)
SELECT mt.id, 'body', 'BODY', 4, TRUE
FROM main_tabs mt WHERE mt.slug = 'book-now'
ON CONFLICT (main_tab_id, slug) DO NOTHING;

INSERT INTO service_categories (main_tab_id, slug, name, display_order, is_active)
SELECT mt.id, 'lips', 'LIPS', 5, TRUE
FROM main_tabs mt WHERE mt.slug = 'book-now'
ON CONFLICT (main_tab_id, slug) DO NOTHING;

INSERT INTO service_categories (main_tab_id, slug, name, display_order, is_active)
SELECT mt.id, 'skin', 'SKIN', 6, TRUE
FROM main_tabs mt WHERE mt.slug = 'book-now'
ON CONFLICT (main_tab_id, slug) DO NOTHING;

INSERT INTO service_categories (main_tab_id, slug, name, display_order, is_active)
SELECT mt.id, 'hair', 'HAIR', 7, TRUE
FROM main_tabs mt WHERE mt.slug = 'book-now'
ON CONFLICT (main_tab_id, slug) DO NOTHING;

-- BY CONDITION Categories
INSERT INTO service_categories (main_tab_id, slug, name, display_order, is_active)
SELECT mt.id, 'wrinkles', 'WRINKLES', 1, TRUE
FROM main_tabs mt WHERE mt.slug = 'by-condition'
ON CONFLICT (main_tab_id, slug) DO NOTHING;

INSERT INTO service_categories (main_tab_id, slug, name, display_order, is_active)
SELECT mt.id, 'volume-loss', 'VOLUME LOSS', 2, TRUE
FROM main_tabs mt WHERE mt.slug = 'by-condition'
ON CONFLICT (main_tab_id, slug) DO NOTHING;

INSERT INTO service_categories (main_tab_id, slug, name, display_order, is_active)
SELECT mt.id, 'acne', 'ACNE', 3, TRUE
FROM main_tabs mt WHERE mt.slug = 'by-condition'
ON CONFLICT (main_tab_id, slug) DO NOTHING;

INSERT INTO service_categories (main_tab_id, slug, name, display_order, is_active)
SELECT mt.id, 'pigmentation', 'PIGMENTATION', 4, TRUE
FROM main_tabs mt WHERE mt.slug = 'by-condition'
ON CONFLICT (main_tab_id, slug) DO NOTHING;

INSERT INTO service_categories (main_tab_id, slug, name, display_order, is_active)
SELECT mt.id, 'scars', 'SCARS', 5, TRUE
FROM main_tabs mt WHERE mt.slug = 'by-condition'
ON CONFLICT (main_tab_id, slug) DO NOTHING;

INSERT INTO service_categories (main_tab_id, slug, name, display_order, is_active)
SELECT mt.id, 'hair-loss', 'HAIR LOSS', 6, TRUE
FROM main_tabs mt WHERE mt.slug = 'by-condition'
ON CONFLICT (main_tab_id, slug) DO NOTHING;

INSERT INTO service_categories (main_tab_id, slug, name, display_order, is_active)
SELECT mt.id, 'body-contouring', 'BODY CONTOURING', 7, TRUE
FROM main_tabs mt WHERE mt.slug = 'by-condition'
ON CONFLICT (main_tab_id, slug) DO NOTHING;

-- =====================================================
-- 8. INSERT SERVICES DATA
-- =====================================================

-- BOOK NOW - ANTI-WRINKLE
INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Anti-Wrinkle Injections (Botox)', 'anti-wrinkle-injections', 'Reduce fine lines and wrinkles with premium anti-wrinkle treatments. Popular for forehead, frown lines, and crow''s feet.', 30, 250.00, TRUE, FALSE, 0, 12, 1
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'anti-wrinkle'
ON CONFLICT (slug) DO NOTHING;

-- BOOK NOW - FILLERS
INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Dermal Fillers - Cheeks', 'dermal-fillers-cheeks', 'Restore volume and enhance cheek definition with premium hyaluronic acid fillers.', 45, 450.00, TRUE, TRUE, 2, 52, 1
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'fillers'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Dermal Fillers - Nasolabial', 'dermal-fillers-nasolabial', 'Smooth nasolabial folds and restore youthful facial contours.', 30, 380.00, TRUE, FALSE, 2, 52, 2
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'fillers'
ON CONFLICT (slug) DO NOTHING;

-- BOOK NOW - LIPS
INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Lip Fillers', 'lip-fillers', 'Enhance lip volume and shape with natural-looking hyaluronic acid fillers.', 30, 350.00, TRUE, FALSE, 3, 26, 1
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'lips'
ON CONFLICT (slug) DO NOTHING;

-- BOOK NOW - SKIN
INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Chemical Peel', 'chemical-peel', 'Improve skin texture and tone with professional chemical peels.', 60, 180.00, TRUE, TRUE, 5, 8, 1
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'skin'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Microneedling', 'microneedling', 'Stimulate collagen production and improve skin texture with advanced microneedling.', 90, 220.00, TRUE, TRUE, 3, 12, 2
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'skin'
ON CONFLICT (slug) DO NOTHING;

-- BOOK NOW - FACE
INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'HydraFacial', 'hydrafacial', 'Deep cleanse, extract, and hydrate your skin with the revolutionary HydraFacial treatment.', 60, 150.00, TRUE, FALSE, 0, 2, 1
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'face'
ON CONFLICT (slug) DO NOTHING;

-- BOOK NOW - BODY
INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'CoolSculpting', 'coolsculpting', 'Non-invasive fat reduction treatment that freezes away stubborn fat cells.', 60, 800.00, TRUE, TRUE, 0, 16, 1
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'body'
ON CONFLICT (slug) DO NOTHING;

-- BOOK NOW - HAIR
INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Laser Hair Removal', 'laser-hair-removal', 'Permanent hair reduction using advanced laser technology.', 30, 120.00, TRUE, FALSE, 0, NULL, 1
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'hair'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'PRP Hair Treatment', 'prp-hair-treatment', 'Stimulate hair growth using your own platelet-rich plasma.', 90, 400.00, TRUE, TRUE, 1, 12, 2
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'hair'
ON CONFLICT (slug) DO NOTHING;

-- BY CONDITION - WRINKLES
INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Forehead Lines Treatment', 'forehead-lines-treatment', 'Target horizontal forehead lines with precision anti-wrinkle injections.', 20, 200.00, TRUE, FALSE, 0, 12, 1
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'wrinkles'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Crow''s Feet Treatment', 'crows-feet-treatment', 'Smooth out crow''s feet around the eyes for a refreshed appearance.', 15, 180.00, TRUE, FALSE, 0, 12, 2
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'wrinkles'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Frown Lines Treatment', 'frown-lines-treatment', 'Relax the muscles between the eyebrows to smooth frown lines.', 15, 180.00, TRUE, FALSE, 0, 12, 3
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'wrinkles'
ON CONFLICT (slug) DO NOTHING;

-- BY CONDITION - VOLUME LOSS
INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Cheek Volume Restoration', 'cheek-volume-restoration', 'Restore lost cheek volume and create natural-looking lift.', 45, 450.00, TRUE, TRUE, 2, 52, 1
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'volume-loss'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Temple Hollow Treatment', 'temple-hollow-treatment', 'Fill temple hollows to restore youthful facial contours.', 30, 350.00, TRUE, TRUE, 2, 52, 2
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'volume-loss'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Under Eye Hollow Treatment', 'under-eye-hollow-treatment', 'Restore volume under the eyes to eliminate hollows and dark circles.', 30, 400.00, TRUE, TRUE, 3, 26, 3
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'volume-loss'
ON CONFLICT (slug) DO NOTHING;

-- BY CONDITION - ACNE
INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Acne Scar Treatment', 'acne-scar-treatment', 'Reduce the appearance of acne scars with advanced treatments.', 60, 280.00, TRUE, TRUE, 5, 12, 1
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'acne'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Active Acne Treatment', 'active-acne-treatment', 'Target active acne with professional treatments and skincare.', 45, 150.00, TRUE, TRUE, 2, 8, 2
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'acne'
ON CONFLICT (slug) DO NOTHING;

-- BY CONDITION - PIGMENTATION
INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Hyperpigmentation Treatment', 'hyperpigmentation-treatment', 'Reduce dark spots and uneven skin tone with advanced treatments.', 60, 200.00, TRUE, TRUE, 3, 8, 1
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'pigmentation'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Melasma Treatment', 'melasma-treatment', 'Target melasma and hormonal pigmentation with specialized treatments.', 90, 250.00, TRUE, TRUE, 5, 12, 2
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'pigmentation'
ON CONFLICT (slug) DO NOTHING;

-- BY CONDITION - SCARS
INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Surgical Scar Treatment', 'surgical-scar-treatment', 'Improve the appearance of surgical scars with advanced treatments.', 60, 300.00, TRUE, TRUE, 3, 16, 1
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'scars'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Trauma Scar Treatment', 'trauma-scar-treatment', 'Reduce the appearance of trauma-related scars.', 60, 280.00, TRUE, TRUE, 3, 16, 2
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'scars'
ON CONFLICT (slug) DO NOTHING;

-- BY CONDITION - HAIR LOSS
INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Male Pattern Baldness Treatment', 'male-pattern-baldness-treatment', 'Comprehensive treatment for male pattern hair loss.', 90, 400.00, TRUE, TRUE, 1, 12, 1
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'hair-loss'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Female Hair Loss Treatment', 'female-hair-loss-treatment', 'Specialized treatment for female hair loss and thinning.', 90, 400.00, TRUE, TRUE, 1, 12, 2
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'hair-loss'
ON CONFLICT (slug) DO NOTHING;

-- BY CONDITION - BODY CONTOURING
INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Stubborn Fat Treatment', 'stubborn-fat-treatment', 'Target stubborn fat areas that don''t respond to diet and exercise.', 60, 800.00, TRUE, TRUE, 0, 16, 1
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'body-contouring'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Skin Tightening Treatment', 'skin-tightening-treatment', 'Tighten loose skin and improve body contours.', 90, 600.00, TRUE, TRUE, 1, 12, 2
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'body-contouring'
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- 9. COMMENTS
-- =====================================================

COMMENT ON TABLE main_tabs IS 'Main navigation tabs for services (book-now, by-condition)';
COMMENT ON TABLE service_categories IS 'Service categories within each main tab';
COMMENT ON TABLE services IS 'Individual services and treatments offered';
COMMENT ON COLUMN services.duration IS 'Treatment duration in minutes';
COMMENT ON COLUMN services.price IS 'Treatment price in GBP';
COMMENT ON COLUMN services.downtime_days IS 'Expected downtime in days';
COMMENT ON COLUMN services.results_duration_weeks IS 'How long results last in weeks (NULL for permanent)';
COMMENT ON COLUMN services.is_featured IS 'Whether service is featured prominently';

-- =====================================================
-- MIGRATION COMPLETED
-- =====================================================
-- Normalized structure: main_tabs -> service_categories -> services
-- 2 main tabs, 14 categories, 26 services inserted
-- Database structure is now ready for services management!
-- =====================================================