-- Create press table for managing awards and press features
CREATE TABLE IF NOT EXISTS press (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('award', 'press_feature')),
  title VARCHAR(255) NOT NULL,
  organisation VARCHAR(255),
  publication VARCHAR(255),
  year VARCHAR(10),
  date DATE,
  description TEXT,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_press_type ON press(type);
CREATE INDEX IF NOT EXISTS idx_press_featured ON press(is_featured);
CREATE INDEX IF NOT EXISTS idx_press_display_order ON press(display_order);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_press_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_press_updated_at ON press;
CREATE TRIGGER update_press_updated_at
  BEFORE UPDATE ON press
  FOR EACH ROW
  EXECUTE FUNCTION update_press_updated_at();

-- Enable Row Level Security
ALTER TABLE press ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all on press" ON press;

-- Policy: Allow all operations (admin operations use service role key which bypasses RLS)
CREATE POLICY "Allow all on press" ON press
  FOR ALL USING (true) WITH CHECK (true);

-- Add comments for documentation
COMMENT ON TABLE press IS 'Stores awards and press features for display on the press page';
COMMENT ON COLUMN press.type IS 'Type of press item: award or press_feature';
COMMENT ON COLUMN press.organisation IS 'Organisation name for awards';
COMMENT ON COLUMN press.publication IS 'Publication name for press features';
COMMENT ON COLUMN press.image_url IS 'URL to certificate or press image stored in Supabase storage';

