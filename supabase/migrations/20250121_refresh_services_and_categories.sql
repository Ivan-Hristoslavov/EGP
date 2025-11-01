-- =====================================================
-- EGP Aesthetics - Refresh Services and Categories
-- =====================================================
-- Migration: 20250121_refresh_services_and_categories.sql
-- Deletes all existing services and categories, then inserts new structure
-- =====================================================

-- =====================================================
-- 1. DELETE ALL EXISTING SERVICES
-- =====================================================
DELETE FROM services;

-- =====================================================
-- 2. DELETE ALL EXISTING SERVICE CATEGORIES
-- =====================================================
DELETE FROM service_categories;

-- =====================================================
-- 3. INSERT BOOK NOW CATEGORIES
-- =====================================================

-- Face
INSERT INTO service_categories (main_tab_id, slug, name, display_order, is_active)
SELECT mt.id, 'face', 'Face', 1, TRUE
FROM main_tabs mt WHERE mt.slug = 'book-now'
ON CONFLICT (main_tab_id, slug) DO UPDATE 
SET name = EXCLUDED.name, display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;

-- Anti-wrinkle
INSERT INTO service_categories (main_tab_id, slug, name, display_order, is_active)
SELECT mt.id, 'anti-wrinkle', 'Anti-wrinkle', 2, TRUE
FROM main_tabs mt WHERE mt.slug = 'book-now'
ON CONFLICT (main_tab_id, slug) DO UPDATE 
SET name = EXCLUDED.name, display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;

-- Fillers
INSERT INTO service_categories (main_tab_id, slug, name, display_order, is_active)
SELECT mt.id, 'fillers', 'Fillers', 3, TRUE
FROM main_tabs mt WHERE mt.slug = 'book-now'
ON CONFLICT (main_tab_id, slug) DO UPDATE 
SET name = EXCLUDED.name, display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;

-- Body
INSERT INTO service_categories (main_tab_id, slug, name, display_order, is_active)
SELECT mt.id, 'body', 'Body', 4, TRUE
FROM main_tabs mt WHERE mt.slug = 'book-now'
ON CONFLICT (main_tab_id, slug) DO UPDATE 
SET name = EXCLUDED.name, display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;

-- =====================================================
-- 4. INSERT BY CONDITION CATEGORIES
-- =====================================================

-- Face
INSERT INTO service_categories (main_tab_id, slug, name, display_order, is_active)
SELECT mt.id, 'face', 'Face', 1, TRUE
FROM main_tabs mt WHERE mt.slug = 'by-condition'
ON CONFLICT (main_tab_id, slug) DO UPDATE 
SET name = EXCLUDED.name, display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;

-- Body
INSERT INTO service_categories (main_tab_id, slug, name, display_order, is_active)
SELECT mt.id, 'body', 'Body', 2, TRUE
FROM main_tabs mt WHERE mt.slug = 'by-condition'
ON CONFLICT (main_tab_id, slug) DO UPDATE 
SET name = EXCLUDED.name, display_order = EXCLUDED.display_order, is_active = EXCLUDED.is_active;

-- =====================================================
-- 5. INSERT BOOK NOW SERVICES
-- =====================================================

-- BOOK NOW -> Face Category Services
INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Free Discovery Consultation', 'free-discovery-consultation', 'Complimentary consultation to discuss your aesthetic goals and treatment options.', 30, 0.00, TRUE, FALSE, 0, NULL, 1
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'face'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Digital Skin Analysis & Consultation', 'digital-skin-analysis-consultation', 'Advanced digital skin analysis to assess your skin condition and create a personalized treatment plan.', 60, 50.00, TRUE, FALSE, 0, NULL, 2
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'face'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'PRP', 'prp', 'Platelet-Rich Plasma treatment for natural skin rejuvenation.', 60, 480.00, TRUE, TRUE, 0, 12, 3
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'face'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'EXOSOMES', 'exosomes', 'Exosome therapy for advanced skin regeneration and anti-ageing.', 60, 550.00, TRUE, TRUE, 0, 16, 4
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'face'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Polynucleotides', 'polynucleotides', 'Polynucleotide treatment for skin rejuvenation and hydration.', 45, 390.00, TRUE, TRUE, 0, 12, 5
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'face'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, '5-point facelift', '5-point-facelift', 'Non-surgical 5-point facelift using advanced techniques.', 90, 950.00, TRUE, TRUE, 1, 12, 6
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'face'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Profhilo', 'profhilo', 'Bio-remodelling treatment for improved skin quality and hydration.', 45, 390.00, TRUE, TRUE, 0, 12, 7
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'face'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Sculptra', 'sculptra', 'Poly-L-lactic acid treatment for gradual volume restoration.', 60, 790.00, TRUE, TRUE, 1, 24, 8
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'face'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Skin Boosters', 'skin-boosters', 'Hyaluronic acid skin boosters for deep hydration.', 45, 230.00, TRUE, TRUE, 0, 12, 9
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'face'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Deep cleansing facial', 'deep-cleansing-facial', 'Deep cleansing facial treatment for clear, healthy skin.', 60, 170.00, TRUE, FALSE, 0, NULL, 10
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'face'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Medical Skin peels', 'medical-skin-peels', 'Medical-grade skin peels for skin renewal and improvement.', 60, 200.00, TRUE, TRUE, 2, NULL, 11
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'face'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Deep Hydra Detox Facial', 'deep-hydra-detox-facial', 'Deep hydrating and detoxifying facial treatment.', 60, 170.00, TRUE, FALSE, 0, NULL, 12
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'face'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'NCTF under-eye skin booster', 'nctf-under-eye-skin-booster', 'NCTF under-eye treatment for dark circles and fine lines.', 30, 159.00, TRUE, FALSE, 0, 8, 13
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'face'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, '3-step under-eye signature treatment', '3-step-under-eye-signature-treatment', 'Comprehensive 3-step under-eye treatment for optimal results.', 60, 390.00, TRUE, TRUE, 0, 12, 14
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'face'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Injectable Mesotherapy', 'injectable-mesotherapy', 'Injectable mesotherapy for skin rejuvenation and hydration.', 45, 170.00, TRUE, TRUE, 0, 8, 15
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'face'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Microneedling Facial', 'microneedling-facial', 'Microneedling facial treatment for improved skin texture and tone.', 60, 170.00, TRUE, TRUE, 2, 12, 16
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'face'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Full Face Balancing', 'full-face-balancing', 'Comprehensive full face balancing treatment for harmonious features.', 90, 790.00, TRUE, TRUE, 1, 12, 17
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'face'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

-- BOOK NOW -> Anti-wrinkle Category Services
INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Anti-wrinkle injections', 'anti-wrinkle-injections', 'Anti-wrinkle injections to smooth fine lines and wrinkles.', 30, 200.00, TRUE, TRUE, 0, 12, 1
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'anti-wrinkle'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Baby Botox', 'baby-botox', 'Subtle Botox treatment for younger patients seeking preventive care.', 30, 199.00, TRUE, TRUE, 0, 12, 2
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'anti-wrinkle'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Brow lift', 'brow-lift', 'Brow lift treatment to elevate and shape eyebrows.', 30, 279.00, TRUE, TRUE, 0, 12, 3
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'anti-wrinkle'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Eye wrinkles', 'eye-wrinkles', 'Treatment for wrinkles around the eyes (crow''s feet).', 30, 179.00, TRUE, TRUE, 0, 12, 4
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'anti-wrinkle'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Forehead lines', 'forehead-lines', 'Treatment for horizontal forehead lines.', 30, 179.00, TRUE, TRUE, 0, 12, 5
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'anti-wrinkle'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Glabella lines', 'glabella-lines', 'Treatment for lines between the eyebrows (11 lines).', 30, 179.00, TRUE, TRUE, 0, 12, 6
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'anti-wrinkle'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Barcode lips', 'barcode-lips', 'Treatment for vertical lines above the upper lip.', 30, 129.00, TRUE, TRUE, 0, 12, 7
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'anti-wrinkle'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Bunny Lines', 'bunny-lines', 'Treatment for bunny lines on the nose.', 30, 129.00, TRUE, TRUE, 0, 12, 8
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'anti-wrinkle'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Lip lines', 'lip-lines', 'Treatment for lines around the lips.', 30, 179.00, TRUE, TRUE, 0, 12, 9
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'anti-wrinkle'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Gummy smile', 'gummy-smile', 'Treatment to reduce excessive gum display when smiling.', 30, 129.00, TRUE, TRUE, 0, 12, 10
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'anti-wrinkle'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Neck Lift', 'neck-lift', 'Neck lift treatment to reduce neck bands and wrinkles.', 45, 329.00, TRUE, TRUE, 0, 12, 11
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'anti-wrinkle'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Jaw Slimming', 'jaw-slimming', 'Jaw slimming treatment for a more refined jawline.', 30, 279.00, TRUE, TRUE, 0, 12, 12
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'anti-wrinkle'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Pebble chin', 'pebble-chin', 'Treatment to smooth pebble-like texture on the chin.', 30, 179.00, TRUE, TRUE, 0, 12, 13
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'anti-wrinkle'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Bruxism (deep grinding / bruxism)', 'bruxism-deep-grinding-bruxism', 'Treatment for bruxism (teeth grinding and jaw clenching).', 45, 279.00, TRUE, TRUE, 0, 12, 14
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'anti-wrinkle'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

-- BOOK NOW -> Fillers Category Services
INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Cheek & mid-face filler', 'cheek-mid-face-filler', 'Cheek and mid-face filler for volume restoration and contouring.', 60, 390.00, TRUE, TRUE, 1, 12, 1
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'fillers'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Chin filler', 'chin-filler', 'Chin filler for improved profile and definition.', 45, 290.00, TRUE, TRUE, 1, 12, 2
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'fillers'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Filler for marionette lines', 'filler-marionette-lines', 'Filler treatment for marionette lines around the mouth.', 45, 290.00, TRUE, TRUE, 1, 12, 3
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'fillers'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Filler for nasolabial folds', 'filler-nasolabial-folds', 'Filler treatment for nasolabial folds (smile lines).', 45, 290.00, TRUE, TRUE, 1, 12, 4
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'fillers'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Jawline filler', 'jawline-filler', 'Jawline filler for enhanced definition and contour.', 60, 550.00, TRUE, TRUE, 1, 12, 5
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'fillers'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Lip enhancement', 'lip-enhancement', 'Lip filler for enhanced volume and shape.', 45, 290.00, TRUE, TRUE, 1, 12, 6
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'fillers'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Lip hydration', 'lip-hydration', 'Lip hydration treatment for plump, moisturized lips.', 30, 190.00, TRUE, TRUE, 0, 8, 7
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'fillers'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Tear trough filler', 'tear-trough-filler', 'Tear trough filler to reduce under-eye hollows.', 45, 390.00, TRUE, TRUE, 1, 12, 8
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'fillers'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Temple filler', 'temple-filler', 'Temple filler for volume restoration and rejuvenation.', 45, 290.00, TRUE, TRUE, 1, 12, 9
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'fillers'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Filler dissolving', 'filler-dissolving', 'Filler dissolving treatment to remove unwanted filler.', 30, 150.00, TRUE, TRUE, 0, NULL, 10
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'fillers'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

-- BOOK NOW -> Body Category Services
INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Body fat burning mesotherapy (one area 20×20 cm)', 'body-fat-burning-mesotherapy', 'Body fat burning mesotherapy for targeted fat reduction in one area (20×20 cm).', 45, 170.00, TRUE, TRUE, 0, 8, 1
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'body'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Radiofrequency & Ultrasound for Skin Tightening and Anti-Cellulite', 'radiofrequency-ultrasound-skin-tightening-anti-cellulite', 'Combined radiofrequency and ultrasound treatment for skin tightening and cellulite reduction.', 60, 250.00, TRUE, TRUE, 0, 12, 2
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'body'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Fat freezing treatment (abdomen, losing centimetres)', 'fat-freezing-treatment-abdomen', 'Fat freezing treatment for the abdomen to reduce centimetres.', 60, 200.00, TRUE, TRUE, 0, 12, 3
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'body'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Ultrasound Lift & Tighten Face/Body', 'ultrasound-lift-tighten-face-body', 'Ultrasound lift and tighten treatment for face or body.', 60, 190.00, TRUE, TRUE, 0, 12, 4
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'body'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Ultrasound Lift & Tighten Face/Body Combined with Mesotherapy', 'ultrasound-lift-tighten-mesotherapy', 'Combined ultrasound lift & tighten with mesotherapy for enhanced results.', 90, 350.00, TRUE, TRUE, 0, 12, 5
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'body'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

-- =====================================================
-- 6. INSERT BY CONDITION SERVICES
-- =====================================================

-- BY CONDITION -> Face Category Services (Conditions that can be treated)
-- Note: These are condition names that should link to actual services
-- For now, we'll create them as services that treat these conditions

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Acne & acne scarring', 'acne-acne-scarring', 'Treatment for acne and acne scarring.', 60, 200.00, TRUE, TRUE, 2, NULL, 1
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'face'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Rosacea', 'rosacea', 'Treatment for rosacea to reduce redness and inflammation.', 60, 200.00, TRUE, TRUE, 1, NULL, 2
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'face'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Hyperpigmentation & melasma', 'hyperpigmentation-melasma', 'Treatment for hyperpigmentation and melasma.', 60, 250.00, TRUE, TRUE, 2, NULL, 3
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'face'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Barcode lines around lips', 'barcode-lines-around-lips', 'Treatment for barcode lines around the lips.', 30, 129.00, TRUE, TRUE, 0, 12, 4
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'face'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Bruxism', 'bruxism', 'Treatment for bruxism (teeth grinding).', 45, 279.00, TRUE, TRUE, 0, 12, 5
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'face'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Dark under-eye circles', 'dark-under-eye-circles', 'Treatment for dark under-eye circles.', 45, 390.00, TRUE, TRUE, 0, 12, 6
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'face'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Double chin', 'double-chin', 'Treatment for double chin reduction.', 60, 200.00, TRUE, TRUE, 0, 12, 7
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'face'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Nasolabial folds', 'nasolabial-folds', 'Treatment for nasolabial folds (smile lines).', 45, 290.00, TRUE, TRUE, 1, 12, 8
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'face'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Shadows around the nasolabial folds', 'shadows-around-nasolabial-folds', 'Treatment for shadows around nasolabial folds.', 45, 290.00, TRUE, TRUE, 1, 12, 9
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'face'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Under-eye hollows', 'under-eye-hollows', 'Treatment for under-eye hollows.', 45, 390.00, TRUE, TRUE, 1, 12, 10
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'face'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Eye bags', 'eye-bags', 'Treatment for under-eye bags.', 45, 390.00, TRUE, TRUE, 1, 12, 11
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'face'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Flat cheeks', 'flat-cheeks', 'Treatment for flat cheeks to restore volume.', 60, 390.00, TRUE, TRUE, 1, 12, 12
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'face'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Flat / pebble chin', 'flat-pebble-chin', 'Treatment for flat or pebble chin to improve definition.', 45, 290.00, TRUE, TRUE, 1, 12, 13
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'face'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Gummy smile', 'gummy-smile-condition', 'Treatment to correct gummy smile.', 30, 129.00, TRUE, TRUE, 0, 12, 14
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'face'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Heavy lower face', 'heavy-lower-face', 'Treatment for heavy lower face and jawline contouring.', 60, 550.00, TRUE, TRUE, 1, 12, 15
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'face'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Jowling', 'jowling', 'Treatment for jowling and jawline definition.', 60, 550.00, TRUE, TRUE, 1, 12, 16
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'face'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Low eyebrows', 'low-eyebrows', 'Treatment for low eyebrows with brow lift.', 30, 279.00, TRUE, TRUE, 0, 12, 17
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'face'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

-- BY CONDITION -> Body Category Services
INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Cellulite (thighs, buttocks, abdomen)', 'cellulite-thighs-buttocks-abdomen', 'Treatment for cellulite on thighs, buttocks, and abdomen.', 60, 250.00, TRUE, TRUE, 0, 12, 1
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'body'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Stubborn belly fat / abdominal fat', 'stubborn-belly-fat-abdominal-fat', 'Treatment for stubborn belly fat and abdominal fat reduction.', 60, 200.00, TRUE, TRUE, 0, 12, 2
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'body'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Love handles / flanks', 'love-handles-flanks', 'Treatment for love handles and flank fat reduction.', 60, 200.00, TRUE, TRUE, 0, 12, 3
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'body'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Sagging skin (skin laxity) – post-pregnancy, weight loss, ageing', 'sagging-skin-laxity', 'Treatment for sagging skin and skin laxity after pregnancy, weight loss, or ageing.', 90, 350.00, TRUE, TRUE, 0, 12, 4
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'body'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Stretch marks', 'stretch-marks', 'Treatment for stretch marks reduction.', 60, 250.00, TRUE, TRUE, 2, NULL, 5
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'body'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Arm fat & "bingo wings"', 'arm-fat-bingo-wings', 'Treatment for arm fat and bingo wings reduction.', 60, 200.00, TRUE, TRUE, 0, 12, 6
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'body'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Thigh fat & inner thigh laxity', 'thigh-fat-inner-thigh-laxity', 'Treatment for thigh fat and inner thigh laxity.', 60, 200.00, TRUE, TRUE, 0, 12, 7
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'body'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Double chin / jawline fat (often searched as body contouring too)', 'double-chin-jawline-fat', 'Treatment for double chin and jawline fat reduction.', 60, 200.00, TRUE, TRUE, 0, 12, 8
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'body'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Post-pregnancy tummy (abdominal laxity + fat pockets)', 'post-pregnancy-tummy', 'Treatment for post-pregnancy tummy addressing abdominal laxity and fat pockets.', 90, 350.00, TRUE, TRUE, 0, 12, 9
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'body'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Water retention / bloating / swelling (lymphatic stagnation)', 'water-retention-bloating-swelling', 'Treatment for water retention, bloating, and swelling caused by lymphatic stagnation.', 60, 250.00, TRUE, TRUE, 0, NULL, 10
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'body'
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, duration = EXCLUDED.duration, price = EXCLUDED.price, category_id = EXCLUDED.category_id, display_order = EXCLUDED.display_order;

-- =====================================================
-- MIGRATION COMPLETED
-- =====================================================
-- Structure: Book Now -> Face/Anti-wrinkle/Fillers/Body -> Services
-- Structure: By Condition -> Face/Body -> Services
-- Total: 6 categories, 87 services
-- =====================================================

