-- Complete Database Consistency Fix Script
-- Execute this in Supabase Dashboard → SQL Editor

-- ==============================
-- 1. FIX ADMIN_PROFILE TABLE
-- ==============================

-- Add missing fields to admin_profile
ALTER TABLE admin_profile ADD COLUMN IF NOT EXISTS years_of_experience VARCHAR(100) DEFAULT '10+';
ALTER TABLE admin_profile ADD COLUMN IF NOT EXISTS specializations TEXT DEFAULT 'Emergency repairs, Boiler installations, Bathroom plumbing';
ALTER TABLE admin_profile ADD COLUMN IF NOT EXISTS certifications TEXT DEFAULT 'Gas Safe Registered, City & Guilds Level 3';
ALTER TABLE admin_profile ADD COLUMN IF NOT EXISTS service_areas TEXT DEFAULT 'Clapham, Balham, Chelsea, Wandsworth, Battersea';
ALTER TABLE admin_profile ADD COLUMN IF NOT EXISTS response_time VARCHAR(100) DEFAULT '45 minutes';
ALTER TABLE admin_profile ADD COLUMN IF NOT EXISTS terms_and_conditions TEXT;
ALTER TABLE admin_profile ADD COLUMN IF NOT EXISTS privacy_policy TEXT;

-- Update existing records with default values
UPDATE admin_profile 
SET 
  years_of_experience = COALESCE(years_of_experience, '10+'),
  specializations = COALESCE(specializations, 'Emergency repairs, Boiler installations, Bathroom plumbing'),
  certifications = COALESCE(certifications, 'Gas Safe Registered, City & Guilds Level 3'),
  service_areas = COALESCE(service_areas, 'Clapham, Balham, Chelsea, Wandsworth, Battersea'),
  response_time = COALESCE(response_time, '45 minutes');

-- ==============================
-- 2. FIX GALLERY TABLE
-- ==============================

-- Add before/after image fields and project details
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS before_image_url TEXT;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS after_image_url TEXT;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS project_type VARCHAR(255);
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS completion_date DATE;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Migrate existing image_url to before_image_url and after_image_url
UPDATE gallery 
SET before_image_url = image_url, 
    after_image_url = image_url 
WHERE before_image_url IS NULL AND image_url IS NOT NULL;

-- ==============================
-- 3. FIX GALLERY_SECTIONS TABLE
-- ==============================

-- Add color field to gallery_sections
ALTER TABLE gallery_sections ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#3B82F6';

-- Update existing records with default colors
UPDATE gallery_sections 
SET color = '#3B82F6' 
WHERE color IS NULL;

-- Add sample gallery sections if none exist
INSERT INTO gallery_sections (title, description, color, "order", is_active) 
VALUES 
  ('Bathroom Renovations', 'Complete bathroom transformations', '#3B82F6', 1, true),
  ('Kitchen Plumbing', 'Kitchen sink and pipe installations', '#10B981', 2, true),
  ('Emergency Repairs', 'Urgent leak and pipe repairs', '#EF4444', 3, true),
  ('Heating Systems', 'Boiler and radiator services', '#F59E0B', 4, true)
ON CONFLICT (title) DO NOTHING;

-- ==============================
-- 4. CREATE VAT_SETTINGS TABLE
-- ==============================

-- Create VAT settings table
CREATE TABLE IF NOT EXISTS vat_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    is_enabled BOOLEAN DEFAULT TRUE,
    vat_rate DECIMAL(5,2) DEFAULT 20.00,
    vat_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger for updated_at
CREATE TRIGGER update_vat_settings_updated_at 
    BEFORE UPDATE ON vat_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE vat_settings ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Allow all operations on vat_settings" ON vat_settings FOR ALL USING (true);

-- Insert default VAT settings
INSERT INTO vat_settings (is_enabled, vat_rate, vat_number) 
VALUES (true, 20.00, NULL) 
ON CONFLICT DO NOTHING;

-- ==============================
-- 5. FIX INVOICES TABLE
-- ==============================

-- Add manual invoice fields
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS manual_description TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS manual_service VARCHAR(255);

-- ==============================
-- 6. CREATE DASHBOARD_STATS VIEW
-- ==============================

-- Create dashboard_stats view
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM bookings) as total_bookings,
    (SELECT COUNT(*) FROM bookings WHERE status = 'pending') as pending_bookings,
    (SELECT COUNT(*) FROM bookings WHERE status = 'completed') as completed_bookings,
    (SELECT COALESCE(SUM(amount), 0) FROM bookings WHERE status = 'completed') as total_revenue,
    (SELECT COALESCE(SUM(amount), 0) FROM bookings WHERE status = 'completed' AND date >= CURRENT_DATE - INTERVAL '7 days') as weekly_revenue,
    (SELECT COUNT(DISTINCT customer_id) FROM bookings WHERE customer_id IS NOT NULL) as total_customers,
    (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payment_status = 'pending') as pending_payments;

-- ==============================
-- 7. OPTIONAL: CLEAN UP OLD FIELDS
-- ==============================

-- Uncomment these lines after confirming the migration worked:
-- ALTER TABLE gallery DROP COLUMN IF EXISTS image_url;
-- ALTER TABLE gallery DROP COLUMN IF EXISTS alt_text;

-- ==============================
-- 8. VERIFICATION QUERIES
-- ==============================

-- Run these to verify the changes worked:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'admin_profile' ORDER BY ordinal_position;
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'gallery' ORDER BY ordinal_position;
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'gallery_sections' ORDER BY ordinal_position;
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'vat_settings' ORDER BY ordinal_position;
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'invoices' ORDER BY ordinal_position; 