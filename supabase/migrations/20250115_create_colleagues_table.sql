-- Create colleagues table
CREATE TABLE IF NOT EXISTS colleagues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(100) NOT NULL,
  specializations TEXT,
  experience_years VARCHAR(50),
  certifications TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_colleagues_email ON colleagues(email);
CREATE INDEX IF NOT EXISTS idx_colleagues_active ON colleagues(is_active);
CREATE INDEX IF NOT EXISTS idx_colleagues_role ON colleagues(role);

-- Enable RLS
ALTER TABLE colleagues ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable all operations for authenticated users" ON colleagues
  FOR ALL USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_colleagues_updated_at 
  BEFORE UPDATE ON colleagues 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();




