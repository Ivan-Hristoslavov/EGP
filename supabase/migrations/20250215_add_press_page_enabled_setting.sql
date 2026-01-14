-- =====================================================
-- Add Press Page Enabled Setting
-- =====================================================
-- Migration: 20250215_add_press_page_enabled_setting.sql
-- Adds a setting to enable/disable the press page visibility
-- =====================================================

-- Insert default setting for press page enabled (default: true)
INSERT INTO admin_settings (key, value)
VALUES ('press_page_enabled', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Add comment
COMMENT ON TABLE admin_settings IS 'Stores admin settings including page visibility toggles';

