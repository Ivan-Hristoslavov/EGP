-- =====================================================
-- Create Gallery, Reviews, and FAQ Tables
-- =====================================================
-- This migration creates the missing gallery, reviews, and faq tables
-- that are referenced by the API but don't exist in the database
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. GALLERY SECTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS gallery_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admin_profile(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  color TEXT,
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for gallery_sections
CREATE INDEX IF NOT EXISTS idx_gallery_sections_admin_id ON gallery_sections(admin_id);
CREATE INDEX IF NOT EXISTS idx_gallery_sections_order ON gallery_sections("order");
CREATE INDEX IF NOT EXISTS idx_gallery_sections_active ON gallery_sections(is_active);

-- =====================================================
-- 2. GALLERY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admin_profile(id) ON DELETE SET NULL,
  section_id UUID REFERENCES gallery_sections(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  before_image_url TEXT,
  after_image_url TEXT,
  alt_text VARCHAR(255),
  completion_date DATE,
  project_type VARCHAR(255),
  location VARCHAR(255),
  is_featured BOOLEAN DEFAULT FALSE,
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for gallery
CREATE INDEX IF NOT EXISTS idx_gallery_admin_id ON gallery(admin_id);
CREATE INDEX IF NOT EXISTS idx_gallery_section_id ON gallery(section_id);
CREATE INDEX IF NOT EXISTS idx_gallery_featured ON gallery(is_featured);
CREATE INDEX IF NOT EXISTS idx_gallery_order ON gallery("order");
CREATE INDEX IF NOT EXISTS idx_gallery_active ON gallery(is_active);

-- =====================================================
-- 3. REVIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  rating INTEGER NOT NULL CHECK (rating >= 0 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for reviews
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_reviews_featured ON reviews(is_featured);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- =====================================================
-- 4. FAQ TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS faq (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(255) DEFAULT 'general',
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faq
CREATE INDEX IF NOT EXISTS idx_faq_category ON faq(category);
CREATE INDEX IF NOT EXISTS idx_faq_order ON faq("order");
CREATE INDEX IF NOT EXISTS idx_faq_active ON faq(is_active);

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE gallery_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all on gallery_sections" ON gallery_sections;
DROP POLICY IF EXISTS "Allow all on gallery" ON gallery;
DROP POLICY IF EXISTS "Allow all on reviews" ON reviews;
DROP POLICY IF EXISTS "Allow all on faq" ON faq;

-- Create RLS policies (allow all operations for now)
CREATE POLICY "Allow all on gallery_sections" ON gallery_sections FOR ALL USING (true);
CREATE POLICY "Allow all on gallery" ON gallery FOR ALL USING (true);
CREATE POLICY "Allow all on reviews" ON reviews FOR ALL USING (true);
CREATE POLICY "Allow all on faq" ON faq FOR ALL USING (true);

-- =====================================================
-- 6. TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Create triggers for updated_at
CREATE TRIGGER update_gallery_sections_updated_at 
    BEFORE UPDATE ON gallery_sections 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_updated_at 
    BEFORE UPDATE ON gallery 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON reviews 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faq_updated_at 
    BEFORE UPDATE ON faq 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MIGRATION COMPLETED
-- =====================================================

