-- =====================================================
-- EGP Aesthetics - Blog, Awards, Press & About Tables
-- =====================================================
-- Migration: 20250116_create_blog_awards_press_about_tables.sql
-- Creates tables for blog posts, awards, press features, and about page content
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. BLOG POSTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  author VARCHAR(255) DEFAULT 'EGP Aesthetics',
  category VARCHAR(255) DEFAULT 'General',
  read_time INTEGER DEFAULT 5, -- in minutes
  is_featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  meta_title VARCHAR(255),
  meta_description TEXT,
  view_count INTEGER DEFAULT 0,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for blog_posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_is_published ON blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_is_featured ON blog_posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);

-- =====================================================
-- 2. AWARDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS awards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  organisation VARCHAR(255) NOT NULL,
  year VARCHAR(50) NOT NULL,
  description TEXT,
  logo_url TEXT,
  certificate_url TEXT,
  external_url TEXT,
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for awards
CREATE INDEX IF NOT EXISTS idx_awards_year ON awards(year);
CREATE INDEX IF NOT EXISTS idx_awards_is_active ON awards(is_active);
CREATE INDEX IF NOT EXISTS idx_awards_organisation ON awards(organisation);

-- =====================================================
-- 3. PRESS FEATURES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS press_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  publication VARCHAR(255) NOT NULL,
  publish_date DATE NOT NULL,
  description TEXT,
  article_url TEXT,
  image_url TEXT,
  featured BOOLEAN DEFAULT FALSE,
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for press_features
CREATE INDEX IF NOT EXISTS idx_press_features_publish_date ON press_features(publish_date);
CREATE INDEX IF NOT EXISTS idx_press_features_publication ON press_features(publication);
CREATE INDEX IF NOT EXISTS idx_press_features_is_active ON press_features(is_active);
CREATE INDEX IF NOT EXISTS idx_press_features_featured ON press_features(featured);

-- =====================================================
-- 4. ABOUT CONTENT TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS about_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_type VARCHAR(100) NOT NULL, -- hero, story, values, why_choose_us, etc.
  heading VARCHAR(255),
  content TEXT NOT NULL,
  bullet_points JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for about_content
CREATE INDEX IF NOT EXISTS idx_about_content_section_type ON about_content(section_type);
CREATE INDEX IF NOT EXISTS idx_about_content_is_active ON about_content(is_active);

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE press_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all on blog_posts" ON blog_posts;
DROP POLICY IF EXISTS "Allow all on awards" ON awards;
DROP POLICY IF EXISTS "Allow all on press_features" ON press_features;
DROP POLICY IF EXISTS "Allow all on about_content" ON about_content;

-- Create permissive policies (allow all operations for now - restrict later based on auth)
CREATE POLICY "Allow all on blog_posts" ON blog_posts FOR ALL USING (true);
CREATE POLICY "Allow all on awards" ON awards FOR ALL USING (true);
CREATE POLICY "Allow all on press_features" ON press_features FOR ALL USING (true);
CREATE POLICY "Allow all on about_content" ON about_content FOR ALL USING (true);

-- =====================================================
-- 6. FUNCTIONS AND TRIGGERS
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
CREATE TRIGGER update_blog_posts_updated_at 
    BEFORE UPDATE ON blog_posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_awards_updated_at 
    BEFORE UPDATE ON awards 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_press_features_updated_at 
    BEFORE UPDATE ON press_features 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_about_content_updated_at 
    BEFORE UPDATE ON about_content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate blog slug from title
CREATE OR REPLACE FUNCTION generate_blog_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate slug before insert
CREATE TRIGGER generate_blog_slug_trigger
  BEFORE INSERT OR UPDATE ON blog_posts
  FOR EACH ROW
  WHEN (NEW.slug IS NULL OR NEW.slug = '' OR NEW.slug = NEW.title)
  EXECUTE FUNCTION generate_blog_slug();

-- =====================================================
-- 7. INITIAL SAMPLE DATA (Optional - remove if not needed)
-- =====================================================

-- Insert sample blog posts
INSERT INTO blog_posts (
  title,
  slug,
  excerpt,
  content,
  category,
  read_time,
  is_featured,
  is_published,
  published_at,
  author,
  meta_title,
  meta_description
) VALUES 
(
  'Understanding Baby Botox: A Gentle Approach to Anti-Ageing',
  'understanding-baby-botox-a-gentle-approach-to-anti-ageing',
  'Learn about the benefits and considerations of baby botox treatments for younger patients seeking preventive anti-ageing solutions.',
  '## Understanding Baby Botox

Baby Botox is a preventive aesthetic treatment gaining popularity among younger patients. This gentle approach uses smaller doses of botulinum toxin to soften fine lines before they become more pronounced.

### Benefits

- **Prevention**: Reduces the formation of deeper wrinkles
- **Natural look**: Maintains facial expressiveness
- **Minimal downtime**: Less invasive than traditional treatments

### What to Expect

Your consultation will include a thorough assessment of your skin and a discussion of your aesthetic goals. Treatment takes approximately 15-20 minutes with results lasting 3-4 months.',
  'Anti-wrinkle',
  5,
  TRUE,
  TRUE,
  NOW() - INTERVAL '10 days',
  'EGP Aesthetics',
  'Baby Botox Treatment Guide - EGP Aesthetics',
  'Learn about baby botox treatments at EGP Aesthetics London.'
),
(
  'The Science Behind Dermal Fillers',
  'the-science-behind-dermal-fillers',
  'Discover how dermal fillers work, different types available, and what to expect from your treatment journey.',
  '## The Science Behind Dermal Fillers

Dermal fillers are injectable treatments designed to restore volume and smooth out wrinkles and fine lines. They work by adding substance to areas of the face that have lost volume due to ageing.

### How They Work

Most dermal fillers use hyaluronic acid, a naturally occurring substance in the body. When injected, it attracts and binds water molecules, creating volume and hydration.

### Treatment Areas

- Cheeks
- Lips
- Under-eye hollows
- Nasolabial folds
- Jawline',
  'Fillers',
  7,
  FALSE,
  TRUE,
  NOW() - INTERVAL '5 days',
  'EGP Aesthetics',
  'Dermal Fillers Explained - EGP Aesthetics',
  'Everything you need to know about dermal filler treatments.'
);

-- Insert sample awards
INSERT INTO awards (
  title,
  organisation,
  year,
  description,
  is_active
) VALUES 
(
  'Best Aesthetic Clinic London 2024',
  'Aesthetic Awards',
  '2024',
  'Recognised for excellence in aesthetic treatments and patient care.',
  TRUE
),
(
  'Excellence in Patient Care 2023',
  'Aesthetic Medicine Awards',
  '2023',
  'Recognition for outstanding commitment to patient safety and satisfaction.',
  TRUE
),
(
  'Patient Choice Award',
  'WhatClinic',
  '2023',
  'Voted by patients as their preferred aesthetic clinic in London.',
  TRUE
);

-- Insert sample press features
INSERT INTO press_features (
  title,
  publication,
  publish_date,
  description,
  is_active
) VALUES 
(
  'The Future of Aesthetic Medicine',
  'Aesthetic Medicine Magazine',
  '2024-01-20',
  'Feature article on innovative treatment approaches.',
  TRUE
),
(
  'Natural Beauty Enhancement Trends',
  'Beauty Business Weekly',
  '2024-01-15',
  'Expert insights on current aesthetic trends.',
  TRUE
);

-- Insert sample about content
INSERT INTO about_content (
  section_type,
  heading,
  content,
  bullet_points,
  is_active,
  "order"
) VALUES 
(
  'hero',
  NULL,
  'Welcome to EGP Aesthetics London, where we combine medical expertise with artistic vision to help you achieve your aesthetic goals.',
  '[]',
  TRUE,
  1
),
(
  'story',
  'Our Story',
  'Founded with a passion for natural beauty enhancement, EGP Aesthetics has been serving clients in London with exceptional aesthetic treatments. Our clinic is built on the foundation of trust, expertise, and personalized care.',
  '[]',
  TRUE,
  2
),
(
  'values',
  'Our Values',
  'We are committed to providing the highest quality aesthetic treatments with a focus on safety, natural results, and patient satisfaction.',
  '["Safety and excellence in every treatment", "Natural-looking results that enhance your beauty", "Personalized care tailored to your unique needs", "Continuous education and training in latest techniques", "Transparent pricing and honest consultations"]',
  TRUE,
  3
),
(
  'why_choose_us',
  'Why Choose Us',
  'Our team of qualified practitioners is dedicated to providing safe, effective, and beautiful results. We stay at the forefront of aesthetic medicine, using only the latest techniques and highest quality products.',
  '[]',
  TRUE,
  4
);

-- =====================================================
-- 8. COMMENTS
-- =====================================================

COMMENT ON TABLE blog_posts IS 'Blog posts and articles for the website';
COMMENT ON TABLE awards IS 'Awards and recognition received by the clinic';
COMMENT ON TABLE press_features IS 'Press features and media coverage';
COMMENT ON TABLE about_content IS 'Content sections for the about page';

COMMENT ON COLUMN blog_posts.slug IS 'URL-friendly version of the title';
COMMENT ON COLUMN blog_posts.read_time IS 'Estimated reading time in minutes';
COMMENT ON COLUMN blog_posts.view_count IS 'Number of times the post has been viewed';
COMMENT ON COLUMN awards.year IS 'Year the award was received';
COMMENT ON COLUMN press_features.publish_date IS 'Date the press feature was published';
COMMENT ON COLUMN about_content.section_type IS 'Type of section (hero, story, values, etc.)';
COMMENT ON COLUMN about_content.bullet_points IS 'Array of bullet points for the section';

-- =====================================================
-- MIGRATION COMPLETED
-- =====================================================
-- All tables, indexes, policies, triggers, and sample data have been created
-- Blog, Awards, Press & About database structure is now ready!
-- =====================================================
