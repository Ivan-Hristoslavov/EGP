-- =====================================================
-- EGP Aesthetics - Insert Complete Services Data
-- =====================================================
-- Migration: 20250118_insert_complete_services_data.sql
-- Adds all services based on the user-provided list
-- =====================================================

-- =====================================================
-- BOOK NOW - FACE
-- =====================================================
INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 
  'Free Discovery Consultation', 
  'free-discovery-consultation',
  'Initial consultation to discuss your aesthetic goals and create a personalized treatment plan.',
  30, 0.00, TRUE, FALSE, 0, NULL, 1
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'face'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Digital Skin Analysis & Consultation', 'digital-skin-analysis-consultation', 'Comprehensive skin analysis using advanced digital imaging technology.', 45, 50.00, TRUE, FALSE, 0, NULL, 2
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'face'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'PRP', 'prp-face', 'Platelet-Rich Plasma treatment to rejuvenate and enhance skin quality.', 45, 480.00, TRUE, TRUE, 2, 12, 3
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'face'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'EXOSOMES', 'exosomes-face', 'Exosome treatment for advanced skin regeneration and rejuvenation.', 45, 550.00, TRUE, TRUE, 2, 12, 4
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'face'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Polynucleotides', 'polynucleotides-face', 'Polynucleotide treatment for skin rejuvenation and anti-aging.', 45, 390.00, TRUE, TRUE, 2, 12, 5
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'face'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, '5-point facelift', '5-point-facelift', 'Non-surgical facelift using targeted injections at 5 strategic points.', 60, 950.00, TRUE, TRUE, 3, 52, 6
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'face'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Profhilo', 'profhilo', 'Hydrating treatment with hyaluronic acid for skin quality improvement.', 45, 390.00, TRUE, TRUE, 1, 26, 7
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'face'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Sculptra', 'sculptra-face', 'Stimulate collagen production for natural-looking volume restoration.', 60, 790.00, TRUE, TRUE, 2, 78, 8
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'face'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Skin Boosters', 'skin-boosters', 'Deep hydration with hyaluronic acid skin booster injections.', 30, 230.00, TRUE, FALSE, 1, 12, 9
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'face'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Deep cleansing facial', 'deep-cleansing-facial', 'Intensive deep cleansing facial for clear, healthy skin.', 60, 170.00, TRUE, FALSE, 0, 2, 10
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'face'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Medical Skin peels', 'medical-skin-peels', 'Professional medical-grade chemical peels for skin renewal.', 45, 200.00, TRUE, TRUE, 3, 8, 11
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'face'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Deep Hydra Detox Facial', 'deep-hydra-detox-facial', 'Detoxifying and hydrating facial treatment.', 75, 170.00, TRUE, FALSE, 0, 2, 12
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'face'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'NCTF under-eye skin booster', 'nctf-under-eye-skin-booster', 'Specialized under-eye treatment with NCTF booster for brightening and hydration.', 30, 159.00, TRUE, FALSE, 1, 12, 13
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'face'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, '3-step under-eye signature treatment', '3-step-under-eye-signature-treatment', 'Comprehensive 3-step under-eye treatment for complete rejuvenation.', 60, 390.00, TRUE, TRUE, 2, 12, 14
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'face'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Injectable Mesotherapy', 'injectable-mesotherapy', 'Injectable mesotherapy for targeted skin improvement.', 45, 150.00, TRUE, FALSE, 1, 8, 15
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'face'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Microneedling Facial', 'microneedling-facial', 'Advanced microneedling treatment for skin regeneration.', 90, 170.00, TRUE, TRUE, 3, 12, 16
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'face'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Full Face Balancing', 'full-face-balancing', 'Comprehensive face balancing treatment for harmonious facial contours.', 90, 790.00, TRUE, TRUE, 3, 52, 17
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'face'
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- BOOK NOW - ANTI-WRINKLE
-- =====================================================
INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Baby Botox', 'baby-botox', 'Subtle anti-wrinkle treatment for natural-looking results.', 20, 199.00, TRUE, FALSE, 0, 12, 1
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'anti-wrinkle'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Brow lift', 'brow-lift', 'Anti-wrinkle brow lift for lifted, refreshed appearance.', 20, 279.00, TRUE, FALSE, 0, 12, 2
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'anti-wrinkle'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Eye wrinkles', 'eye-wrinkles', 'Targeted treatment for crow''s feet and eye wrinkles.', 15, 179.00, TRUE, FALSE, 0, 12, 3
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'anti-wrinkle'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Forehead lines', 'forehead-lines', 'Smooth horizontal forehead lines.', 15, 179.00, TRUE, FALSE, 0, 12, 4
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'anti-wrinkle'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Glabella lines', 'glabella-lines', 'Treat frown lines between the eyebrows.', 15, 179.00, TRUE, FALSE, 0, 12, 5
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'anti-wrinkle'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Barcode lips', 'barcode-lips', 'Reduce vertical lip lines (barcode lines).', 15, 129.00, TRUE, FALSE, 0, 12, 6
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'anti-wrinkle'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Bunny Lines', 'bunny-lines', 'Smooth bunny lines on the nose.', 15, 129.00, TRUE, FALSE, 0, 12, 7
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'anti-wrinkle'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Lip lines', 'lip-lines', 'Reduce lines around the lips.', 15, 179.00, TRUE, FALSE, 0, 12, 8
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'anti-wrinkle'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Gummy smile', 'gummy-smile', 'Reduce excessive gum exposure when smiling.', 15, 129.00, TRUE, FALSE, 0, 12, 9
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'anti-wrinkle'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Neck Lift', 'neck-lift', 'Reduce neck bands and wrinkles for a lifted appearance.', 30, 329.00, TRUE, TRUE, 0, 12, 10
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'anti-wrinkle'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Jaw Slimming', 'jaw-slimming', 'Slim and contour the jawline with anti-wrinkle injections.', 30, 279.00, TRUE, TRUE, 0, 12, 11
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'anti-wrinkle'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Pebble chin', 'pebble-chin', 'Smooth dimpled chin appearance.', 15, 179.00, TRUE, FALSE, 0, 12, 12
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'anti-wrinkle'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Bruxism (deep grinding / bruxism)', 'bruxism-grinding', 'Reduce teeth grinding and TMJ symptoms.', 30, 279.00, TRUE, TRUE, 0, 12, 13
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'anti-wrinkle'
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- BOOK NOW - FILLERS
-- =====================================================
INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Cheek & mid-face filler', 'cheek-mid-face-filler', 'Restore volume and enhance cheek definition.', 45, 390.00, TRUE, TRUE, 2, 52, 1
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'fillers'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Chin filler', 'chin-filler', 'Enhance chin definition and projection.', 30, 290.00, TRUE, TRUE, 2, 52, 2
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'fillers'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Filler for marionette lines', 'filler-marionette-lines', 'Smooth marionette lines around the mouth.', 30, 290.00, TRUE, TRUE, 2, 52, 3
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'fillers'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Filler for nasolabial folds', 'filler-nasolabial-folds', 'Reduce nasolabial fold depth.', 30, 290.00, TRUE, TRUE, 2, 52, 4
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'fillers'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Jawline filler', 'jawline-filler', 'Define and enhance jawline contours.', 45, 550.00, TRUE, TRUE, 2, 52, 5
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'fillers'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Lip enhancement', 'lip-enhancement', 'Natural-looking lip volume enhancement.', 30, 290.00, TRUE, TRUE, 3, 26, 6
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'fillers'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Lip hydration', 'lip-hydration', 'Hydrating treatment for fuller, smoother lips.', 20, 190.00, TRUE, FALSE, 1, 12, 7
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'fillers'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Tear trough filler', 'tear-trough-filler', 'Reduce under-eye hollows and dark circles.', 30, 390.00, TRUE, TRUE, 2, 52, 8
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'fillers'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Temple filler', 'temple-filler', 'Restore temple volume for a more youthful appearance.', 30, 290.00, TRUE, TRUE, 2, 52, 9
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'fillers'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Filler dissolving', 'filler-dissolving', 'Dissolve unwanted filler using hyaluronidase.', 30, 150.00, TRUE, TRUE, 0, 1, 10
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'fillers'
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- BOOK NOW - BODY
-- =====================================================
INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Body fat burning mesotherapy (one area 20×20 cm)', 'body-fat-burning-mesotherapy', 'Targeted fat reduction treatment for specific body areas.', 45, 170.00, TRUE, TRUE, 1, 8, 1
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'body'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Radiofrequency & Ultrasound for Skin Tightening and Anti-Cellulite', 'rf-ultrasound-tightening', 'Combined radiofrequency and ultrasound for skin tightening and cellulite reduction.', 60, 250.00, TRUE, TRUE, 0, 12, 2
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'body'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Fat freezing treatment (abdomen, losing centimetres)', 'fat-freezing-abolten', 'Cryolipolysis for non-invasive fat reduction on abdomen.', 60, 200.00, TRUE, TRUE, 0, 8, 3
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'body'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Ultrasound Lift & Tighten Face/Body', 'ultrasound-lift-tighten', 'Ultrasound treatment for skin lifting and tightening.', 60, 190.00, TRUE, TRUE, 1, 12, 4
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'body'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Ultrasound Lift & Tighten Face/Body Combined with Mesotherapy', 'ultrasound-mesotherapy-combined', 'Combined ultrasound lifting with mesotherapy for enhanced results.', 90, 350.00, TRUE, TRUE, 1, 12, 5
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'book-now' AND sc.slug = 'body'
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- BY CONDITION - FACE
-- =====================================================
INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Acne & acne scarring', 'acne-acne-scarring', 'Comprehensive acne treatment and scar reduction.', 60, 200.00, TRUE, TRUE, 3, 8, 1
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'face'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Rosacea', 'rosacea', 'Targeted treatment for rosacea and facial redness.', 45, 200.00, TRUE, TRUE, 2, 8, 2
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'face'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Hyperpigmentation & melasma', 'hyperpigmentation-melasma', 'Reduce hyperpigmentation and melasma for even skin tone.', 60, 200.00, TRUE, TRUE, 3, 12, 3
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'face'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Barcode lines around lips', 'barcode-lines-around-lips', 'Reduce vertical lip lines for smoother appearance.', 15, 129.00, TRUE, FALSE, 0, 12, 4
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'face'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Bruxism', 'bruxism-condition', 'Reduce teeth grinding and jaw tension.', 30, 279.00, TRUE, TRUE, 0, 12, 5
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'face'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Dark under-eye circles', 'dark-under-eye-circles', 'Targeted treatment for dark circles and under-eye concerns.', 30, 390.00, TRUE, TRUE, 2, 52, 6
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'face'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Double chin', 'double-chin', 'Non-invasive treatment for double chin reduction.', 30, 279.00, TRUE, TRUE, 0, 12, 7
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'face'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Nasolabial folds', 'nasolabial-folds', 'Reduce the appearance of nasolabial folds.', 30, 290.00, TRUE, TRUE, 2, 52, 8
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'face'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Shadows around the nasolabial folds', 'shadows-nasolabial-folds', 'Address shadowing around nasolabial fold area.', 30, 290.00, TRUE, TRUE, 2, 52, 9
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'face'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Under-eye hollows', 'under-eye-hollows', 'Restore volume to under-eye hollows.', 30, 390.00, TRUE, TRUE, 2, 52, 10
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'face'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Eye bags', 'eye-bags', 'Reduce under-eye bags and puffiness.', 30, 390.00, TRUE, TRUE, 2, 52, 11
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'face'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Flat cheeks', 'flat-cheeks', 'Restore cheek volume and definition.', 45, 390.00, TRUE, TRUE, 2, 52, 12
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'face'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Flat / pebble chin', 'flat-pebble-chin', 'Enhance chin definition and smoothness.', 30, 290.00, TRUE, TRUE, 2, 52, 13
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'face'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Gummy smile', 'gummy-smile-condition', 'Correct excessive gum exposure.', 15, 129.00, TRUE, FALSE, 0, 12, 14
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'face'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Heavy lower face', 'heavy-lower-face', 'Contour and lift the lower face.', 60, 650.00, TRUE, TRUE, 3, 52, 15
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'face'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Jowling', 'jowling', 'Address jowling and sagging in the lower face.', 60, 650.00, TRUE, TRUE, 3, 52, 16
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'face'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Low eyebrows', 'low-eyebrows', 'Lift and shape eyebrows for a more youthful look.', 20, 279.00, TRUE, FALSE, 0, 12, 17
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'face'
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- BY CONDITION - BODY
-- =====================================================
INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Cellulite (thighs, buttocks, abdomen)', 'cellulite-thighs-buttocks-abdomen', 'Targeted cellulite reduction treatment.', 60, 250.00, TRUE, TRUE, 0, 12, 1
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'body'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Stubborn belly fat / abdominal fat', 'stubborn-belly-fat', 'Non-invasive abdominal fat reduction.', 60, 200.00, TRUE, TRUE, 0, 8, 2
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'body'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Love handles / flanks', 'love-handles-flanks', 'Targeted fat reduction for love handles.', 60, 200.00, TRUE, TRUE, 0, 8, 3
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'body'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Sagging skin (skin laxity) – post-pregnancy, weight loss, ageing', 'sagging-skin-laxity', 'Comprehensive skin tightening treatment.', 60, 250.00, TRUE, TRUE, 1, 12, 4
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'body'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Stretch marks', 'stretch-marks', 'Reduce the appearance of stretch marks.', 45, 200.00, TRUE, TRUE, 2, 8, 5
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'body'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Arm fat & "bingo wings"', 'arm-fat-bingo-wings', 'Targeted treatment for upper arm fat and sagging.', 60, 200.00, TRUE, TRUE, 0, 8, 6
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'body'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Thigh fat & inner thigh laxity', 'thigh-fat-inner-thigh-laxity', 'Reduce thigh fat and tighten inner thighs.', 60, 200.00, TRUE, TRUE, 0, 8, 7
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'body'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Double chin / jawline fat (often searched as body contouring too)', 'double-chin-jawline-fat', 'Non-invasive treatment for double chin and jawline contouring.', 30, 279.00, TRUE, TRUE, 0, 12, 8
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'body'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Post-pregnancy tummy (abdominal laxity + fat pockets)', 'post-pregnancy-tummy', 'Comprehensive post-pregnancy abdominal treatment.', 90, 400.00, TRUE, TRUE, 1, 12, 9
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'body'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, duration, price, is_active, requires_consultation, downtime_days, results_duration_weeks, display_order)
SELECT sc.id, 'Water retention / bloating / swelling (lymphatic stagnation)', 'water-retention-bloating-swelling', 'Targeted lymphatic drainage treatment.', 60, 170.00, TRUE, TRUE, 0, 4, 10
FROM service_categories sc
JOIN main_tabs mt ON sc.main_tab_id = mt.id
WHERE mt.slug = 'by-condition' AND sc.slug = 'body'
ON CONFLICT (slug) DO NOTHING;

-- Note: BY CONDITION categories need to be created first if they don't exist
-- This migration assumes 'face' and 'body' categories exist under 'by-condition' main tab

