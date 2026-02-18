-- =====================================================
-- Create Discount Codes Table + RLS Policy
-- =====================================================
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Create the table
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_percentage DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);a

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_discount_codes_customer_id ON discount_codes(customer_id);
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON discount_codes(is_active, valid_until);
CREATE INDEX IF NOT EXISTS idx_discount_codes_used ON discount_codes(used_at);

-- 3. Add comment
COMMENT ON TABLE discount_codes IS 'Discount codes for newsletter subscribers and promotions';

-- 4. Enable RLS
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

-- 5. Allow service role full access (used by admin API via supabaseAdmin)
CREATE POLICY "Service role full access on discount_codes"
  ON discount_codes
  FOR ALL
  USING (true)
  WITH CHECK (true);
