-- =====================================================
-- EGP Aesthetics - Blog Table Migration with Sample Data
-- =====================================================
-- Migration: 20250120_create_blog_table_and_data.sql
-- Creates blog posts table and inserts sample data
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- BLOG POSTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  featured_image_url TEXT,
  featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  read_time_minutes INTEGER DEFAULT 5,
  seo_title VARCHAR(255),
  seo_description TEXT,
  author_name VARCHAR(255) DEFAULT 'EGP Aesthetics Team',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure all columns exist (handles case where table might have been partially created)
-- This MUST run before indexes to avoid index errors on missing columns
DO $$ 
BEGIN
  -- Only run if table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'blog_posts'
  ) THEN
    -- Add featured column if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'blog_posts' AND column_name = 'featured'
    ) THEN
      ALTER TABLE blog_posts ADD COLUMN featured BOOLEAN DEFAULT FALSE;
      RAISE NOTICE 'Added featured column';
    END IF;
    
    -- Add read_time_minutes column if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'blog_posts' AND column_name = 'read_time_minutes'
    ) THEN
      ALTER TABLE blog_posts ADD COLUMN read_time_minutes INTEGER DEFAULT 5;
      RAISE NOTICE 'Added read_time_minutes column';
    END IF;
    
    -- Add other potentially missing columns
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'blog_posts' AND column_name = 'featured_image_url'
    ) THEN
      ALTER TABLE blog_posts ADD COLUMN featured_image_url TEXT;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'blog_posts' AND column_name = 'seo_title'
    ) THEN
      ALTER TABLE blog_posts ADD COLUMN seo_title VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'blog_posts' AND column_name = 'seo_description'
    ) THEN
      ALTER TABLE blog_posts ADD COLUMN seo_description TEXT;
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'blog_posts' AND column_name = 'author_name'
    ) THEN
      ALTER TABLE blog_posts ADD COLUMN author_name VARCHAR(255) DEFAULT 'EGP Aesthetics Team';
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'blog_posts' AND column_name = 'display_order'
    ) THEN
      ALTER TABLE blog_posts ADD COLUMN display_order INTEGER DEFAULT 0;
    END IF;
  END IF;
END $$;

-- Create indexes for performance (after ensuring columns exist)
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_is_published ON blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_display_order ON blog_posts(display_order);

-- Add RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Published blog posts are viewable by everyone." ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can create blog posts." ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can update blog posts." ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can delete blog posts." ON blog_posts;

-- Create policies
CREATE POLICY "Published blog posts are viewable by everyone."
  ON blog_posts FOR SELECT
  USING (is_published = TRUE);

CREATE POLICY "Authenticated users can create blog posts."
  ON blog_posts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update blog posts."
  ON blog_posts FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete blog posts."
  ON blog_posts FOR DELETE
  USING (auth.role() = 'authenticated');

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_posts_updated_at();

-- =====================================================
-- INSERT SAMPLE DATA
-- =====================================================

INSERT INTO blog_posts (title, slug, excerpt, content, category, featured, is_published, published_at, read_time_minutes, seo_title, seo_description, author_name, display_order) VALUES

(
  'Understanding Baby Botox: A Gentle Approach to Anti-Ageing',
  'understanding-baby-botox-gentle-approach-anti-ageing',
  'Learn about the benefits and considerations of baby botox treatments for younger patients seeking preventive anti-ageing solutions.',
  '<h2>What is Baby Botox?</h2><p>Baby Botox, also known as micro-Botox, is a preventive anti-ageing treatment that uses smaller amounts of Botulinum Toxin Type A than traditional Botox injections. This approach is gaining popularity among younger patients in their late 20s and early 30s who want to prevent fine lines and wrinkles before they become deeply set.</p><h2>How Does Baby Botox Work?</h2><p>Baby Botox works by using diluted amounts of the neurotoxin, typically 25-50% less than standard treatments. The goal is to provide subtle muscle relaxation without completely freezing facial expressions, resulting in a more natural, refreshed appearance.</p><h2>Benefits of Baby Botox</h2><ul><li>Prevents deep wrinkle formation</li><li>Maintains natural facial expressions</li><li>Reduces treatment frequency over time</li><li>More subtle, natural-looking results</li></ul><h2>Who is a Good Candidate?</h2><p>Ideal candidates for Baby Botox are individuals aged 25-35 who are starting to notice fine lines but don''t yet have deep wrinkles. It''s perfect for those who want a preventive approach to anti-ageing.</p>',
  'Anti-wrinkle',
  TRUE,
  TRUE,
  '2024-01-15 10:00:00+00',
  5,
  'Understanding Baby Botox | EGP Aesthetics London',
  'Learn about Baby Botox treatments for preventive anti-ageing. Discover benefits, how it works, and who is a good candidate for this gentle approach.',
  'Dr. Elena Petrov',
  1
),

(
  'The Science Behind Dermal Fillers',
  'science-behind-dermal-fillers',
  'Discover how dermal fillers work, different types available, and what to expect from your treatment journey.',
  '<h2>What Are Dermal Fillers?</h2><p>Dermal fillers are injectable gels made from hyaluronic acid (HA), a naturally occurring substance in the skin that provides volume and hydration. They are used to restore lost volume, smooth wrinkles, and enhance facial contours.</p><h2>How Do Fillers Work?</h2><p>Hyaluronic acid fillers work by attracting and holding water molecules, providing immediate volume and hydration. When injected into the skin, they integrate with the natural tissue, providing structure and support.</p><h2>Types of Dermal Fillers</h2><ul><li><strong>Lip Fillers:</strong> Enhance lip volume and shape</li><li><strong>Cheek Fillers:</strong> Restore cheekbone definition</li><li><strong>Nasolabial Fillers:</strong> Smooth smile lines</li><li><strong>Jawline Fillers:</strong> Define and contour the jaw</li></ul><h2>What to Expect</h2><p>Treatment typically takes 30-45 minutes with immediate results. Most fillers last 6-18 months depending on the area treated and the product used. Minor swelling and bruising may occur but usually resolves within a few days.</p>',
  'Fillers',
  FALSE,
  TRUE,
  '2024-01-10 14:30:00+00',
  7,
  'Dermal Fillers Guide | EGP Aesthetics',
  'Complete guide to dermal fillers: how they work, types available, and what to expect from your treatment at EGP Aesthetics London.',
  'Dr. Elena Petrov',
  2
),

(
  'Skincare Routine for Optimal Results',
  'skincare-routine-optimal-results',
  'Essential skincare tips to maintain and enhance your aesthetic treatment results for long-lasting beauty.',
  '<h2>Why Skincare Matters</h2><p>Your skincare routine is the foundation of maintaining your aesthetic treatment results. Proper skincare can enhance the effects of injectables and treatments while protecting your investment.</p><h2>Morning Routine</h2><ol><li><strong>Cleanser:</strong> Use a gentle, pH-balanced cleanser</li><li><strong>Vitamin C Serum:</strong> Brightens and protects against free radicals</li><li><strong>Moisturizer:</strong> Hydrate with an appropriate formula for your skin type</li><li><strong>SPF 50+:</strong> Essential for protecting against UV damage</li></ol><h2>Evening Routine</h2><ol><li><strong>Double Cleanse:</strong> Remove makeup and impurities</li><li><strong>Retinol:</strong> Promote cell turnover (use as directed)</li><li><strong>Peptides:</strong> Support collagen production</li><li><strong>Rich Moisturizer:</strong> Repair and hydrate overnight</li></ol><h2>Post-Treatment Care</h2><p>After aesthetic treatments, avoid active ingredients like retinol and acids for the first 24-48 hours. Always follow your practitioner''s specific aftercare instructions.</p>',
  'Skincare',
  FALSE,
  TRUE,
  '2024-01-05 09:00:00+00',
  6,
  'Skincare Routine for Aesthetic Results | EGP Aesthetics',
  'Discover the best skincare routine to maintain and enhance your aesthetic treatment results. Expert tips from EGP Aesthetics London.',
  'EGP Aesthetics Team',
  3
),

(
  'Profhilo: The Revolutionary Skin Remodelling Treatment',
  'profhilo-revolutionary-skin-remodelling-treatment',
  'Everything you need to know about Profhilo, the innovative treatment that improves skin quality and hydration.',
  '<h2>What is Profhilo?</h2><p>Profhilo is an innovative injectable treatment that uses high concentrations of hyaluronic acid to remodel and rejuvenate the skin. Unlike traditional fillers, Profhilo doesn''t add volume but instead improves skin quality, elasticity, and hydration.</p><h2>How Profhilo Works</h2><p>Profhilo contains 100% hyaluronic acid in a unique formulation that stimulates the production of collagen and elastin. It''s injected in strategic points across the face, creating a "bioremodelling" effect that improves skin texture and firmness.</p><h2>Treatment Protocol</h2><p>The standard Profhilo protocol involves two treatments, 4-6 weeks apart. Each treatment involves 10 injection points across the face - 5 on each side. Results become visible after the second treatment and continue to improve over 3-4 months.</p><h2>Benefits</h2><ul><li>Improves skin elasticity and firmness</li><li>Enhances skin hydration</li><li>Reduces fine lines and improves texture</li><li>Natural-looking results with no "frozen" appearance</li><li>Stimulates collagen production</li></ul><h2>Perfect For</h2><p>Profhilo is ideal for patients aged 35-55 who want to improve overall skin quality without adding volume. It''s particularly effective for those experiencing early signs of skin laxity.</p>',
  'Face Treatments',
  TRUE,
  TRUE,
  '2024-01-01 11:00:00+00',
  8,
  'Profhilo Treatment Guide | EGP Aesthetics London',
  'Complete guide to Profhilo: the revolutionary skin remodelling treatment that improves skin quality, hydration, and elasticity.',
  'Dr. Elena Petrov',
  4
),

(
  'Non-Invasive Body Contouring: Fat Freezing Explained',
  'non-invasive-body-contouring-fat-freezing-explained',
  'Understanding cryolipolysis and how fat freezing treatments can help you achieve your body goals safely.',
  '<h2>What is Cryolipolysis?</h2><p>Cryolipolysis, commonly known as fat freezing, is a non-invasive body contouring treatment that uses controlled cooling to eliminate stubborn fat cells. It''s FDA-approved and clinically proven to reduce fat in treated areas by up to 25%.</p><h2>How Fat Freezing Works</h2><p>The treatment uses applicators that deliver controlled cooling to target fat cells. Fat cells are more sensitive to cold than surrounding tissues, so they undergo apoptosis (cell death) while leaving skin, nerves, and other tissues unharmed. The body naturally eliminates these dead fat cells over 2-4 months.</p><h2>Treatment Areas</h2><ul><li>Abdomen and waist</li><li>Love handles (flanks)</li><li>Thighs</li><li>Upper arms</li><li>Chin and neck</li><li>Back and bra fat</li></ul><h2>What to Expect</h2><p>Each session typically lasts 35-60 minutes per area. You may experience mild discomfort during the first few minutes as the area becomes numb. Most patients can return to normal activities immediately after treatment. Results become visible after 6-12 weeks as the body processes and eliminates the treated fat cells.</p><h2>Ideal Candidates</h2><p>Fat freezing is best for individuals who are close to their ideal weight but have stubborn fat pockets that resist diet and exercise. It''s not a weight loss solution but a body contouring treatment.</p>',
  'Body Treatments',
  FALSE,
  TRUE,
  '2023-12-28 15:00:00+00',
  6,
  'Fat Freezing Body Contouring | EGP Aesthetics',
  'Learn about cryolipolysis (fat freezing) treatments for non-invasive body contouring. Safe and effective fat reduction at EGP Aesthetics London.',
  'EGP Aesthetics Team',
  5
),

(
  'Preparing for Your First Aesthetic Treatment',
  'preparing-first-aesthetic-treatment',
  'A comprehensive guide to help you prepare for your first aesthetic procedure and what to expect.',
  '<h2>Consultation is Key</h2><p>Your first step should always be a thorough consultation with a qualified practitioner. During this session, discuss your goals, medical history, and any concerns. This is your opportunity to ask questions and ensure you''re comfortable with the proposed treatment plan.</p><h2>Pre-Treatment Preparation</h2><ul><li><strong>One Week Before:</strong> Avoid blood-thinning medications (aspirin, ibuprofen) and supplements (vitamin E, fish oil, ginkgo)</li><li><strong>48 Hours Before:</strong> Avoid alcohol and excessive sun exposure</li><li><strong>24 Hours Before:</strong> Stay well-hydrated and get plenty of rest</li><li><strong>Day of Treatment:</strong> Arrive with clean, makeup-free skin</li></ul><h2>What to Bring</h2><p>Bring a list of current medications, any questions you have, and your mobile phone for before/after photos. Wear comfortable clothing that allows easy access to the treatment area.</p><h2>During Treatment</h2><p>Most aesthetic treatments are relatively quick, ranging from 15 minutes to an hour. Topical numbing cream is often applied to minimize discomfort. Your practitioner will guide you through the process and check your comfort levels throughout.</p><h2>Aftercare</h2><p>Follow your practitioner''s specific aftercare instructions. This typically includes avoiding exercise for 24 hours, not touching the treated area, and avoiding sun exposure. Keep your follow-up appointment to assess results and address any concerns.</p><h2>Managing Expectations</h2><p>Results vary by individual and treatment type. Some treatments show immediate results, while others may take weeks to fully develop. Remember, subtle, natural-looking results are often the most desirable outcome.</p>',
  'General',
  FALSE,
  TRUE,
  '2023-12-25 10:00:00+00',
  10,
  'Preparing for Aesthetic Treatment | EGP Aesthetics',
  'Complete guide to preparing for your first aesthetic treatment. Expert tips on preparation, what to expect, and aftercare from EGP Aesthetics.',
  'EGP Aesthetics Team',
  6
)

ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETED
-- =====================================================

