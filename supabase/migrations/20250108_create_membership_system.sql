-- Create membership plans table
CREATE TABLE IF NOT EXISTS membership_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  priority_booking BOOLEAN DEFAULT false,
  free_treatments_per_month INTEGER DEFAULT 0,
  consultation_discount DECIMAL(5,2) DEFAULT 0,
  exclusive_access BOOLEAN DEFAULT false,
  features JSONB DEFAULT '[]'::jsonb,
  stripe_price_id_monthly VARCHAR(255),
  stripe_price_id_yearly VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customer memberships table
CREATE TABLE IF NOT EXISTS customer_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES membership_plans(id),
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active', -- active, cancelled, paused, expired
  start_date DATE NOT NULL,
  end_date DATE,
  next_billing_date DATE,
  auto_renew BOOLEAN DEFAULT true,
  free_treatments_used INTEGER DEFAULT 0,
  free_treatments_reset_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create membership usage tracking
CREATE TABLE IF NOT EXISTS membership_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  membership_id UUID NOT NULL REFERENCES customer_memberships(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id),
  usage_type VARCHAR(50) NOT NULL, -- free_treatment, discount, priority_booking
  amount_saved DECIMAL(10,2) DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default membership plans
INSERT INTO membership_plans (
  name, 
  slug, 
  description, 
  price_monthly, 
  price_yearly,
  discount_percentage,
  priority_booking,
  free_treatments_per_month,
  consultation_discount,
  exclusive_access,
  features,
  display_order
) VALUES 
(
  'Essential',
  'essential',
  'Perfect for regular clients who want to save on treatments',
  49.00,
  490.00,
  15.00,
  true,
  0,
  0.00,
  false,
  '["15% discount on all treatments", "Priority booking", "Skincare consultation", "Monthly skincare tips"]'::jsonb,
  1
),
(
  'Premium',
  'premium',
  'Our most popular plan with great value and exclusive benefits',
  99.00,
  990.00,
  25.00,
  true,
  1,
  50.00,
  true,
  '["25% discount on all treatments", "VIP priority booking", "Quarterly skin analysis", "Free monthly facial", "Exclusive treatment previews"]'::jsonb,
  2
),
(
  'Elite',
  'elite',
  'Ultimate membership for the most discerning clients',
  199.00,
  1990.00,
  30.00,
  true,
  1,
  100.00,
  true,
  '["30% discount on all treatments", "Ultimate VIP booking", "Monthly skin analysis", "Free monthly treatment of choice", "Personal aesthetic advisor", "Exclusive member events"]'::jsonb,
  3
)
ON CONFLICT (slug) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customer_memberships_customer_id ON customer_memberships(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_memberships_status ON customer_memberships(status);
CREATE INDEX IF NOT EXISTS idx_customer_memberships_end_date ON customer_memberships(end_date);
CREATE INDEX IF NOT EXISTS idx_membership_usage_membership_id ON membership_usage(membership_id);
CREATE INDEX IF NOT EXISTS idx_membership_usage_booking_id ON membership_usage(booking_id);

-- Add RLS policies
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_usage ENABLE ROW LEVEL SECURITY;

-- Policies for membership_plans (public read)
CREATE POLICY "Membership plans are viewable by everyone" ON membership_plans
  FOR SELECT USING (is_active = true);

-- Policies for customer_memberships
CREATE POLICY "Customers can view own memberships" ON customer_memberships
  FOR SELECT USING (auth.uid()::text = customer_id::text);

-- Policies for membership_usage
CREATE POLICY "Customers can view own membership usage" ON membership_usage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM customer_memberships 
      WHERE id = membership_usage.membership_id 
      AND customer_id::text = auth.uid()::text
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_membership_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_membership_plans_updated_at
  BEFORE UPDATE ON membership_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_membership_updated_at();

CREATE TRIGGER trigger_update_customer_memberships_updated_at
  BEFORE UPDATE ON customer_memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_membership_updated_at();

-- Create function to get customer's current membership
CREATE OR REPLACE FUNCTION get_customer_membership(customer_uuid UUID)
RETURNS TABLE (
  membership_id UUID,
  plan_name VARCHAR(100),
  plan_slug VARCHAR(100),
  discount_percentage DECIMAL(5,2),
  free_treatments_remaining INTEGER,
  status VARCHAR(50)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cm.id,
    mp.name,
    mp.slug,
    mp.discount_percentage,
    GREATEST(0, mp.free_treatments_per_month - cm.free_treatments_used) as free_treatments_remaining,
    cm.status
  FROM customer_memberships cm
  JOIN membership_plans mp ON cm.plan_id = mp.id
  WHERE cm.customer_id = customer_uuid
    AND cm.status = 'active'
    AND (cm.end_date IS NULL OR cm.end_date >= CURRENT_DATE)
  ORDER BY cm.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Create function to apply membership discount
CREATE OR REPLACE FUNCTION apply_membership_discount(
  customer_uuid UUID,
  original_amount DECIMAL(10,2)
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  membership_discount DECIMAL(5,2);
  discounted_amount DECIMAL(10,2);
BEGIN
  -- Get customer's membership discount
  SELECT discount_percentage INTO membership_discount
  FROM get_customer_membership(customer_uuid);
  
  -- If no active membership, return original amount
  IF membership_discount IS NULL THEN
    RETURN original_amount;
  END IF;
  
  -- Calculate discounted amount
  discounted_amount := original_amount * (1 - membership_discount / 100);
  
  RETURN discounted_amount;
END;
$$ LANGUAGE plpgsql;
