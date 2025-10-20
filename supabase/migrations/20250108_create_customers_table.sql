-- Create customers table for customer portal
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  password_hash VARCHAR(255) NOT NULL,
  date_of_birth DATE,
  address TEXT,
  postcode VARCHAR(20),
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'United Kingdom',
  
  -- Membership fields
  membership_tier VARCHAR(50) DEFAULT 'standard', -- standard, essential, premium, elite
  membership_start_date DATE,
  membership_end_date DATE,
  
  -- Preferences
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  marketing_emails BOOLEAN DEFAULT true,
  
  -- Medical information (optional)
  medical_conditions TEXT,
  allergies TEXT,
  medications TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Create index for membership queries
CREATE INDEX IF NOT EXISTS idx_customers_membership ON customers(membership_tier, membership_end_date);

-- Create index for active customers
CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(is_active);

-- Add RLS (Row Level Security) policies
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Policy: Customers can only see their own data
CREATE POLICY "Customers can view own data" ON customers
  FOR SELECT USING (auth.uid()::text = id::text);

-- Policy: Customers can update their own data
CREATE POLICY "Customers can update own data" ON customers
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Policy: Allow customer registration (insert)
CREATE POLICY "Allow customer registration" ON customers
  FOR INSERT WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_customers_updated_at();

-- Add some sample customers for testing (with hashed passwords)
-- Password for all test customers is "password123"
INSERT INTO customers (
  first_name, 
  last_name, 
  email, 
  phone, 
  password_hash,
  membership_tier,
  created_at
) VALUES 
(
  'Sarah', 
  'Johnson', 
  'sarah.johnson@example.com', 
  '+44 7700 123456',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8KzK', -- password123
  'premium',
  NOW() - INTERVAL '6 months'
),
(
  'Emma', 
  'Williams', 
  'emma.williams@example.com', 
  '+44 7700 234567',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8KzK', -- password123
  'essential',
  NOW() - INTERVAL '3 months'
),
(
  'Lisa', 
  'Brown', 
  'lisa.brown@example.com', 
  '+44 7700 345678',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8KzK', -- password123
  'standard',
  NOW() - INTERVAL '1 month'
),
(
  'Rachel', 
  'Green', 
  'rachel.green@example.com', 
  '+44 7700 456789',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8KzK', -- password123
  'elite',
  NOW() - INTERVAL '2 weeks'
),
(
  'Jessica', 
  'Taylor', 
  'jessica.taylor@example.com', 
  '+44 7700 567890',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8KzK', -- password123
  'standard',
  NOW() - INTERVAL '1 week'
)
ON CONFLICT (email) DO NOTHING;
