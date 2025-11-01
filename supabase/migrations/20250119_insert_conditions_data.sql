-- =====================================================
-- EGP Aesthetics - Insert Conditions Data
-- =====================================================
-- Migration: 20250119_insert_conditions_data.sql
-- Inserts all condition data from the hardcoded conditionsData object
-- =====================================================

-- Insert Face Conditions
INSERT INTO conditions (title, slug, category, description, treatments, popular, display_order) VALUES
-- Face Conditions
('Acne & Acne Scarring', 'acne-acne-scarring', 'Face Conditions', 'Professional treatment for active acne and scar reduction', 
 '["Medical Skin Peels - £200", "Microneedling Facial - £170", "PRP Treatment - £480", "Injectable Mesotherapy - £170"]'::jsonb, 
 TRUE, 1),

('Rosacea', 'rosacea', 'Face Conditions', 'Gentle treatments to reduce redness and inflammation', 
 '["IPL Therapy - £250", "Medical Skin Peels - £200", "Skincare Routine - £100", "Injectable Mesotherapy - £170"]'::jsonb, 
 FALSE, 2),

('Hyperpigmentation & Melasma', 'hyperpigmentation-melasma', 'Face Conditions', 'Advanced treatments for dark spots and uneven skin tone', 
 '["Medical Skin Peels - £200", "IPL Therapy - £250", "PRP Treatment - £480", "Injectable Mesotherapy - £170"]'::jsonb, 
 TRUE, 3),

('Barcode Lines Around Lips', 'barcode-lines-around-lips', 'Face Conditions', 'Smooth fine lines around the mouth for a youthful appearance', 
 '["Barcode Lips Treatment - £129", "Lip Enhancement - £290", "Lip Hydration - £190", "Medical Skin Peels - £200"]'::jsonb, 
 TRUE, 4),

('Bruxism', 'bruxism', 'Face Conditions', 'Reduce jaw tension and teeth grinding with targeted treatments', 
 '["Bruxism Treatment - £279", "Jaw Slimming - £279", "Masseter Treatment - £250", "Combined Treatment - £350"]'::jsonb, 
 FALSE, 5),

('Dark Under-Eye Circles', 'dark-under-eye-circles', 'Face Conditions', 'Non-invasive solutions for tired-looking eyes', 
 '["Tear Trough Filler - £390", "Under-Eye Skin Booster - £159", "PRP Treatment - £480", "3-Step Under-Eye Treatment - £390"]'::jsonb, 
 TRUE, 6),

('Nasolabial Folds', 'nasolabial-folds', 'Face Conditions', 'Smooth lines from nose to mouth for a refreshed look', 
 '["Nasolabial Folds Filler - £290", "Cheek & Mid-Face Filler - £390", "5-Point Facelift - £950", "PRP Treatment - £480"]'::jsonb, 
 TRUE, 7),

('Shadows Around Nasolabial Folds', 'shadows-around-nasolabial-folds', 'Face Conditions', 'Brighten and lift the mid-face area to reduce shadows', 
 '["Cheek & Mid-Face Filler - £390", "5-Point Facelift - £950", "PRP Treatment - £480", "Profhilo - £390"]'::jsonb, 
 FALSE, 8),

('Under-Eye Hollows', 'under-eye-hollows', 'Face Conditions', 'Restore volume and smooth under-eye area', 
 '["Tear Trough Filler - £390", "Under-Eye Skin Booster - £159", "3-Step Under-Eye Treatment - £390", "PRP Treatment - £480"]'::jsonb, 
 TRUE, 9),

('Eye Bags', 'eye-bags', 'Face Conditions', 'Reduce puffiness and tighten under-eye area', 
 '["3-Step Under-Eye Treatment - £390", "Tear Trough Filler - £390", "Radiofrequency & Ultrasound - £250", "Combined Treatment - £350"]'::jsonb, 
 TRUE, 10),

('Flat Cheeks', 'flat-cheeks', 'Face Conditions', 'Restore cheek volume and definition', 
 '["Cheek & Mid-Face Filler - £390", "5-Point Facelift - £950", "Profhilo - £390", "Sculptra - £790"]'::jsonb, 
 FALSE, 11),

('Flat / Pebble Chin', 'flat-pebble-chin', 'Face Conditions', 'Enhance chin definition and profile', 
 '["Chin Filler - £290", "Jawline Filler - £550", "Pebble Chin Treatment - £179", "5-Point Facelift - £950"]'::jsonb, 
 FALSE, 12),

('Gummy Smile', 'gummy-smile', 'Face Conditions', 'Reduce excessive gum exposure when smiling', 
 '["Gummy Smile Treatment - £129", "Lip Enhancement - £290", "Combined Treatment - £350", "PRP Treatment - £480"]'::jsonb, 
 FALSE, 13),

('Heavy Lower Face', 'heavy-lower-face', 'Face Conditions', 'Slim and contour the lower face and jawline', 
 '["Jaw Slimming - £279", "Jawline Filler - £550", "Radiofrequency & Ultrasound - £250", "Combined Treatment - £350"]'::jsonb, 
 TRUE, 14),

('Jowling', 'jowling', 'Face Conditions', 'Tighten and lift sagging jawline area', 
 '["5-Point Facelift - £950", "Jawline Filler - £550", "Radiofrequency & Ultrasound - £250", "Ultrasound Lift & Tighten - £190"]'::jsonb, 
 TRUE, 15),

('Low Eyebrows', 'low-eyebrows', 'Face Conditions', 'Lift and shape eyebrows for a more youthful appearance', 
 '["Brow Lift - £279", "5-Point Facelift - £950", "PRP Treatment - £480", "Combined Treatment - £350"]'::jsonb, 
 FALSE, 16),

-- Body Conditions
('Double Chin', 'double-chin', 'Body Conditions', 'Effective fat reduction for a more defined jawline', 
 '["Fat Freezing Treatment - £200", "Radiofrequency & Ultrasound - £250", "Ultrasound Therapy - £190", "Combined Treatment - £350"]'::jsonb, 
 TRUE, 17),

('Cellulite', 'cellulite', 'Body Conditions', 'Reduce the appearance of cellulite on thighs, buttocks, and abdomen', 
 '["Radiofrequency & Ultrasound - £250", "Ultrasound Lift & Tighten - £190", "Body Fat Burning Mesotherapy - £170", "Combined Treatment - £350"]'::jsonb, 
 FALSE, 18),

('Stubborn Belly Fat / Abdominal Fat', 'stubborn-belly-fat--abdominal-fat', 'Body Conditions', 'Target stubborn belly fat with advanced non-invasive treatments', 
 '["Fat Freezing Treatment - £200", "Body Fat Burning Mesotherapy - £170", "Radiofrequency & Ultrasound - £250", "Combined Treatment - £350"]'::jsonb, 
 TRUE, 19),

('Love Handles / Flanks', 'love-handles--flanks', 'Body Conditions', 'Sculpt and contour the waist area for a more defined silhouette', 
 '["Fat Freezing Treatment - £200", "Radiofrequency & Ultrasound - £250", "Body Fat Burning Mesotherapy - £170", "Combined Treatment - £350"]'::jsonb, 
 TRUE, 20),

('Sagging Skin (Skin Laxity)', 'sagging-skin--skin-laxity', 'Body Conditions', 'Tighten and firm loose skin for a more youthful appearance', 
 '["Radiofrequency & Ultrasound - £250", "Ultrasound Lift & Tighten - £190", "Combined Treatment - £350", "PRP Treatment - £480"]'::jsonb, 
 TRUE, 21),

('Stretch Marks', 'stretch-marks', 'Body Conditions', 'Reduce the appearance of stretch marks and improve skin texture', 
 '["Microneedling Facial - £170", "Radiofrequency & Ultrasound - £250", "PRP Treatment - £480", "Injectable Mesotherapy - £170"]'::jsonb, 
 FALSE, 22),

('Arm Fat & Bingo Wings', 'arm-fat--bingo-wings', 'Body Conditions', 'Tone and tighten upper arms for a more sculpted look', 
 '["Fat Freezing Treatment - £200", "Radiofrequency & Ultrasound - £250", "Ultrasound Lift & Tighten - £190", "Combined Treatment - £350"]'::jsonb, 
 TRUE, 23),

('Thigh Fat & Inner Thigh Laxity', 'thigh-fat--inner-thigh-laxity', 'Body Conditions', 'Reduce thigh fat and tighten inner thigh area', 
 '["Fat Freezing Treatment - £200", "Radiofrequency & Ultrasound - £250", "Ultrasound Lift & Tighten - £190", "Combined Treatment - £350"]'::jsonb, 
 TRUE, 24),

('Double Chin / Jawline Fat', 'double-chin--jawline-fat', 'Body Conditions', 'Eliminate double chin and define jawline', 
 '["Fat Freezing Treatment - £200", "Jaw Slimming - £279", "Jawline Filler - £550", "Combined Treatment - £350"]'::jsonb, 
 TRUE, 25),

('Post-Pregnancy Tummy', 'post-pregnancy-tummy', 'Body Conditions', 'Restore abdominal area after pregnancy', 
 '["Radiofrequency & Ultrasound - £250", "Ultrasound Lift & Tighten - £190", "Body Fat Burning Mesotherapy - £170", "Combined Treatment - £350"]'::jsonb, 
 TRUE, 26),

('Water Retention / Bloating / Swelling', 'water-retention--bloating--swelling', 'Body Conditions', 'Reduce water retention and bloating for a slimmer appearance', 
 '["Body Fat Burning Mesotherapy - £170", "Radiofrequency & Ultrasound - £250", "Combined Treatment - £350", "Injectable Mesotherapy - £170"]'::jsonb, 
 FALSE, 27),

('Cellulite (Thighs, Buttocks, Abdomen)', 'cellulite-thighs-buttocks-abdomen', 'Body Conditions', 'Reduce the appearance of cellulite on thighs, buttocks, and abdomen', 
 '["Radiofrequency & Ultrasound - £250", "Ultrasound Lift & Tighten - £190", "Body Fat Burning Mesotherapy - £170", "Combined Treatment - £350"]'::jsonb, 
 TRUE, 28),

('Stubborn Belly Fat / Abdominal Fat', 'stubborn-belly-fat-abdominal-fat', 'Body Conditions', 'Target stubborn belly fat with advanced non-invasive treatments', 
 '["Fat Freezing Treatment - £200", "Body Fat Burning Mesotherapy - £170", "Radiofrequency & Ultrasound - £250", "Combined Treatment - £350"]'::jsonb, 
 TRUE, 29),

('Love Handles / Flanks', 'love-handles-flanks', 'Body Conditions', 'Sculpt and contour the waist area for a more defined silhouette', 
 '["Fat Freezing Treatment - £200", "Radiofrequency & Ultrasound - £250", "Body Fat Burning Mesotherapy - £170", "Combined Treatment - £350"]'::jsonb, 
 TRUE, 30),

('Sagging Skin (Skin Laxity)', 'sagging-skin-skin-laxity', 'Body Conditions', 'Tighten and firm loose skin for a more youthful appearance', 
 '["Radiofrequency & Ultrasound - £250", "Ultrasound Lift & Tighten - £190", "Combined Treatment - £350", "PRP Treatment - £480"]'::jsonb, 
 TRUE, 31),

('Arm Fat & Bingo Wings', 'arm-fat-bingo-wings', 'Body Conditions', 'Tone and tighten upper arms for a more sculpted look', 
 '["Fat Freezing Treatment - £200", "Radiofrequency & Ultrasound - £250", "Ultrasound Lift & Tighten - £190", "Combined Treatment - £350"]'::jsonb, 
 TRUE, 32),

('Thigh Fat & Inner Thigh Laxity', 'thigh-fat-inner-thigh-laxity', 'Body Conditions', 'Reduce thigh fat and tighten inner thigh area', 
 '["Fat Freezing Treatment - £200", "Radiofrequency & Ultrasound - £250", "Ultrasound Lift & Tighten - £190", "Combined Treatment - £350"]'::jsonb, 
 TRUE, 33),

('Double Chin / Jawline Fat', 'double-chin-jawline-fat', 'Body Conditions', 'Eliminate double chin and define jawline', 
 '["Fat Freezing Treatment - £200", "Jaw Slimming - £279", "Jawline Filler - £550", "Combined Treatment - £350"]'::jsonb, 
 TRUE, 34)

ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  treatments = EXCLUDED.treatments,
  popular = EXCLUDED.popular,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

