-- =====================================================
-- EGP Aesthetics - Create BY CONDITION Categories
-- =====================================================
-- Migration: 20250118_create_by_condition_categories.sql
-- Adds 'face' and 'body' categories under BY CONDITION main tab
-- =====================================================

-- BY CONDITION - FACE
INSERT INTO service_categories (main_tab_id, slug, name, display_order, is_active)
SELECT mt.id, 'face', 'FACE', 1, TRUE
FROM main_tabs mt WHERE mt.slug = 'by-condition'
ON CONFLICT (main_tab_id, slug) DO NOTHING;

-- BY CONDITION - BODY
INSERT INTO service_categories (main_tab_id, slug, name, display_order, is_active)
SELECT mt.id, 'body', 'BODY', 2, TRUE
FROM main_tabs mt WHERE mt.slug = 'by-condition'
ON CONFLICT (main_tab_id, slug) DO NOTHING;

