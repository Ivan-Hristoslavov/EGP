-- =====================================================
-- EGP Aesthetics - Complete Database Setup Migration
-- =====================================================
-- This migration creates all necessary tables, indexes, 
-- policies, and sample data for the EGP Aesthetics system
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. ADMIN PROFILE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  business_email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  company_address TEXT,
  about TEXT,
  bank_name VARCHAR(255),
  account_number VARCHAR(50),
  sort_code VARCHAR(20),
  gas_safe_number VARCHAR(50),
  insurance_provider VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for admin_profile
CREATE INDEX IF NOT EXISTS idx_admin_profile_email ON admin_profile(email);
CREATE INDEX IF NOT EXISTS idx_admin_profile_business_email ON admin_profile(business_email);

-- =====================================================
-- 2. CUSTOMERS TABLE
-- =====================================================
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

-- Create indexes for customers
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_membership ON customers(membership_tier, membership_end_date);
CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(is_active);

-- =====================================================
-- 3. BOOKINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  service VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, completed, cancelled
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, refunded
  amount DECIMAL(10,2) NOT NULL,
  address TEXT,
  notes TEXT,
  
  -- Reminder tracking fields
  reminder_24h_sent BOOLEAN DEFAULT false,
  reminder_1h_sent BOOLEAN DEFAULT false,
  followup_sent BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for bookings
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_reminder_24h ON bookings(date, status, reminder_24h_sent) 
WHERE status IN ('confirmed', 'pending') AND reminder_24h_sent = false;
CREATE INDEX IF NOT EXISTS idx_bookings_reminder_1h ON bookings(date, time, status, reminder_1h_sent) 
WHERE status IN ('confirmed', 'pending') AND reminder_1h_sent = false;
CREATE INDEX IF NOT EXISTS idx_bookings_followup ON bookings(date, status, followup_sent) 
WHERE status = 'completed' AND followup_sent = false;

-- =====================================================
-- 4. INVOICES TABLE - REMOVED FOR NOW
-- =====================================================

-- =====================================================
-- 4. PAYMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'card', -- cash, card, bank_transfer, cheque
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, refunded, failed
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  reference VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for payments
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);

-- =====================================================
-- 5. DAY OFF PERIODS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS day_off_periods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_type VARCHAR(50), -- weekly, monthly, yearly
  show_banner BOOLEAN DEFAULT true,
  banner_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for day_off_periods
CREATE INDEX IF NOT EXISTS idx_day_off_periods_dates ON day_off_periods(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_day_off_periods_recurring ON day_off_periods(is_recurring);

-- =====================================================
-- 6. MEMBERSHIP PLANS TABLE
-- =====================================================
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

-- =====================================================
-- 7. CUSTOMER MEMBERSHIPS TABLE
-- =====================================================
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

-- =====================================================
-- 8. MEMBERSHIP USAGE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS membership_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  membership_id UUID NOT NULL REFERENCES customer_memberships(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id),
  usage_type VARCHAR(50) NOT NULL, -- free_treatment, discount, priority_booking
  amount_saved DECIMAL(10,2) DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for membership system
CREATE INDEX IF NOT EXISTS idx_customer_memberships_customer_id ON customer_memberships(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_memberships_status ON customer_memberships(status);
CREATE INDEX IF NOT EXISTS idx_customer_memberships_end_date ON customer_memberships(end_date);
CREATE INDEX IF NOT EXISTS idx_membership_usage_membership_id ON membership_usage(membership_id);
CREATE INDEX IF NOT EXISTS idx_membership_usage_booking_id ON membership_usage(booking_id);

-- =====================================================
-- 9. LEGAL TABLES
-- =====================================================

-- Terms table
CREATE TABLE IF NOT EXISTS terms (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Privacy policy table
CREATE TABLE IF NOT EXISTS privacy_policy (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Site guidance table
CREATE TABLE IF NOT EXISTS site_guidance (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    category VARCHAR(100) NOT NULL DEFAULT 'general',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for legal tables
CREATE INDEX IF NOT EXISTS idx_site_guidance_category ON site_guidance(category);
CREATE INDEX IF NOT EXISTS idx_site_guidance_sort_order ON site_guidance(sort_order);

-- =====================================================
-- 10. ACTIVITY LOG TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_type VARCHAR(50) NOT NULL, -- booking_created, booking_updated, payment_received, invoice_sent, customer_added
  entity_type VARCHAR(50) NOT NULL, -- booking, payment, invoice, customer
  entity_id UUID NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for activity_log
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at);

-- =====================================================
-- 11. ADMIN SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for admin_settings
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(key);

-- =====================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_off_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_policy ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_guidance ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Customers can view own data" ON customers;
DROP POLICY IF EXISTS "Customers can update own data" ON customers;
DROP POLICY IF EXISTS "Allow customer registration" ON customers;
DROP POLICY IF EXISTS "Membership plans are viewable by everyone" ON membership_plans;
DROP POLICY IF EXISTS "Customers can view own memberships" ON customer_memberships;
DROP POLICY IF EXISTS "Customers can view own membership usage" ON membership_usage;
DROP POLICY IF EXISTS "Allow all on terms" ON terms;
DROP POLICY IF EXISTS "Allow all on privacy_policy" ON privacy_policy;
DROP POLICY IF EXISTS "Allow all on site_guidance" ON site_guidance;

-- Create RLS policies

-- Customers policies
CREATE POLICY "Customers can view own data" ON customers
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Customers can update own data" ON customers
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Allow customer registration" ON customers
  FOR INSERT WITH CHECK (true);

-- Membership plans policies (public read)
CREATE POLICY "Membership plans are viewable by everyone" ON membership_plans
  FOR SELECT USING (is_active = true);

-- Customer memberships policies
CREATE POLICY "Customers can view own memberships" ON customer_memberships
  FOR SELECT USING (auth.uid()::text = customer_id::text);

-- Membership usage policies
CREATE POLICY "Customers can view own membership usage" ON membership_usage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM customer_memberships 
      WHERE id = membership_usage.membership_id 
      AND customer_id::text = auth.uid()::text
    )
  );

-- Legal tables policies (allow all operations for now)
CREATE POLICY "Allow all on terms" ON terms FOR ALL USING (true);
CREATE POLICY "Allow all on privacy_policy" ON privacy_policy FOR ALL USING (true);
CREATE POLICY "Allow all on site_guidance" ON site_guidance FOR ALL USING (true);

-- =====================================================
-- 13. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to update customers updated_at
CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update membership updated_at
CREATE OR REPLACE FUNCTION update_membership_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_admin_profile_updated_at 
    BEFORE UPDATE ON admin_profile 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_customers_updated_at();

CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON bookings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_day_off_periods_updated_at 
    BEFORE UPDATE ON day_off_periods 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_membership_plans_updated_at
  BEFORE UPDATE ON membership_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_membership_updated_at();

CREATE TRIGGER trigger_update_customer_memberships_updated_at
  BEFORE UPDATE ON customer_memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_membership_updated_at();

CREATE TRIGGER update_terms_updated_at 
    BEFORE UPDATE ON terms 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_privacy_policy_updated_at 
    BEFORE UPDATE ON privacy_policy 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_guidance_updated_at 
    BEFORE UPDATE ON site_guidance 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at 
    BEFORE UPDATE ON admin_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 14. MEMBERSHIP HELPER FUNCTIONS
-- =====================================================

-- Function to get customer's current membership
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

-- Function to apply membership discount
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

-- =====================================================
-- 15. TEST DATA FOR PAGINATION TESTING
-- =====================================================

-- Insert test customers (20 records for pagination testing)
INSERT INTO customers (
  first_name, 
  last_name, 
  email, 
  phone, 
  password_hash,
  membership_tier,
  address,
  city,
  postcode,
  created_at
) VALUES 
('Sarah', 'Johnson', 'sarah.johnson@example.com', '+44 7700 123456', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8KzK', 'premium', '123 High Street', 'London', 'SW1A 1AA', NOW() - INTERVAL '6 months'),
('Emma', 'Williams', 'emma.williams@example.com', '+44 7700 234567', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8KzK', 'essential', '45 Park Lane', 'Manchester', 'M1 1AA', NOW() - INTERVAL '3 months'),
('Lisa', 'Brown', 'lisa.brown@example.com', '+44 7700 345678', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8KzK', 'standard', '78 Queen''s Road', 'Birmingham', 'B1 1AA', NOW() - INTERVAL '1 month'),
('Rachel', 'Green', 'rachel.green@example.com', '+44 7700 456789', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8KzK', 'elite', '92 King Street', 'Edinburgh', 'EH1 1AA', NOW() - INTERVAL '2 weeks'),
('Jessica', 'Taylor', 'jessica.taylor@example.com', '+44 7700 567890', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8KzK', 'standard', '15 Bridge Road', 'Bristol', 'BS1 1AA', NOW() - INTERVAL '1 week'),
('Maria', 'Garcia', 'maria.garcia@example.com', '+44 7700 678901', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8KzK', 'premium', '67 Market Street', 'Liverpool', 'L1 1AA', NOW() - INTERVAL '5 days'),
('Jennifer', 'Davis', 'jennifer.davis@example.com', '+44 7700 789012', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8KzK', 'essential', '34 Church Lane', 'Leeds', 'LS1 1AA', NOW() - INTERVAL '4 days'),
('Amanda', 'Wilson', 'amanda.wilson@example.com', '+44 7700 890123', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8KzK', 'standard', '89 Station Road', 'Glasgow', 'G1 1AA', NOW() - INTERVAL '3 days'),
('Sophie', 'Anderson', 'sophie.anderson@example.com', '+44 7700 901234', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8KzK', 'elite', '56 Mill Lane', 'Cardiff', 'CF1 1AA', NOW() - INTERVAL '2 days'),
('Charlotte', 'Thompson', 'charlotte.thompson@example.com', '+44 7700 012345', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8KzK', 'premium', '23 Highfield Road', 'Belfast', 'BT1 1AA', NOW() - INTERVAL '1 day'),
('Olivia', 'Roberts', 'olivia.roberts@example.com', '+44 7700 123456', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8KzK', 'essential', '78 Victoria Street', 'Newcastle', 'NE1 1AA', NOW() - INTERVAL '12 hours'),
('Grace', 'Mitchell', 'grace.mitchell@example.com', '+44 7700 234567', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8KzK', 'standard', '45 Church Road', 'Sheffield', 'S1 1AA', NOW() - INTERVAL '8 hours'),
('Mia', 'Patel', 'mia.patel@example.com', '+44 7700 345678', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8KzK', 'premium', '12 High Street', 'Nottingham', 'NG1 1AA', NOW() - INTERVAL '6 hours'),
('Isabella', 'Clarke', 'isabella.clarke@example.com', '+44 7700 456789', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8KzK', 'elite', '67 Park Avenue', 'Derby', 'DE1 1AA', NOW() - INTERVAL '4 hours'),
('Ava', 'Harrison', 'ava.harrison@example.com', '+44 7700 567890', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8KzK', 'essential', '89 Queen Street', 'Plymouth', 'PL1 1AA', NOW() - INTERVAL '2 hours'),
('Lily', 'Cooper', 'lily.cooper@example.com', '+44 7700 678901', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8KzK', 'standard', '34 Bridge Street', 'Southampton', 'SO1 1AA', NOW() - INTERVAL '1 hour'),
('Zoe', 'Ward', 'zoe.ward@example.com', '+44 7700 789012', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8KzK', 'premium', '56 Market Square', 'Norwich', 'NR1 1AA', NOW() - INTERVAL '30 minutes'),
('Chloe', 'Turner', 'chloe.turner@example.com', '+44 7700 890123', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8KzK', 'elite', '78 High Road', 'Exeter', 'EX1 1AA', NOW() - INTERVAL '15 minutes'),
('Ruby', 'Phillips', 'ruby.phillips@example.com', '+44 7700 901234', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8KzK', 'essential', '23 Church Lane', 'York', 'YO1 1AA', NOW() - INTERVAL '5 minutes'),
('Ella', 'Parker', 'ella.parker@example.com', '+44 7700 012345', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Kz8KzK', 'standard', '45 Victoria Road', 'Bath', 'BA1 1AA', NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert test bookings (25 records for pagination testing)
INSERT INTO bookings (
  customer_name,
  customer_email,
  customer_phone,
  service,
  date,
  time,
  status,
  payment_status,
  amount,
  address,
  notes,
  created_at
) VALUES 
('Sarah Johnson', 'sarah.johnson@example.com', '+44 7700 123456', 'Baby Botox', CURRENT_DATE, '10:00', 'confirmed', 'paid', 199, '123 High Street, London', 'First time client', NOW() - INTERVAL '1 day'),
('Emma Williams', 'emma.williams@example.com', '+44 7700 234567', 'Lip Enhancement', CURRENT_DATE, '12:30', 'confirmed', 'paid', 290, '45 Park Lane, Manchester', 'Regular client', NOW() - INTERVAL '1 day'),
('Lisa Brown', 'lisa.brown@example.com', '+44 7700 345678', 'Profhilo Treatment', CURRENT_DATE, '14:00', 'completed', 'paid', 390, '78 Queen''s Road, Birmingham', 'Second session', NOW() - INTERVAL '1 day'),
('Rachel Green', 'rachel.green@example.com', '+44 7700 456789', 'Skin Consultation', CURRENT_DATE + INTERVAL '1 day', '10:30', 'pending', 'pending', 75, '92 King Street, Edinburgh', 'New client', NOW() - INTERVAL '1 day'),
('Jessica Taylor', 'jessica.taylor@example.com', '+44 7700 567890', 'Anti-wrinkle Treatment', CURRENT_DATE + INTERVAL '1 day', '14:30', 'confirmed', 'pending', 220, '15 Bridge Road, Bristol', 'Follow-up', NOW() - INTERVAL '1 day'),
('Maria Garcia', 'maria.garcia@example.com', '+44 7700 678901', 'Fat Freezing', CURRENT_DATE + INTERVAL '2 days', '09:00', 'pending', 'pending', 200, '67 Market Street, Liverpool', 'First consultation', NOW() - INTERVAL '1 day'),
('Jennifer Davis', 'jennifer.davis@example.com', '+44 7700 789012', 'Dermal Fillers', CURRENT_DATE + INTERVAL '2 days', '11:30', 'confirmed', 'pending', 320, '34 Church Lane, Leeds', 'Regular treatment', NOW() - INTERVAL '1 day'),
('Amanda Wilson', 'amanda.wilson@example.com', '+44 7700 890123', 'Skin Rejuvenation', CURRENT_DATE + INTERVAL '3 days', '15:00', 'pending', 'pending', 180, '89 Station Road, Glasgow', 'Monthly treatment', NOW() - INTERVAL '1 day'),
('Sophie Anderson', 'sophie.anderson@example.com', '+44 7700 901234', 'Laser Hair Removal', CURRENT_DATE + INTERVAL '4 days', '10:00', 'confirmed', 'pending', 150, '56 Mill Lane, Cardiff', 'Session 3 of 6', NOW() - INTERVAL '1 day'),
('Charlotte Thompson', 'charlotte.thompson@example.com', '+44 7700 012345', 'Chemical Peel', CURRENT_DATE + INTERVAL '5 days', '14:00', 'pending', 'pending', 120, '23 Highfield Road, Belfast', 'VIP client', NOW() - INTERVAL '1 day'),
('Olivia Roberts', 'olivia.roberts@example.com', '+44 7700 123456', 'Microneedling', CURRENT_DATE + INTERVAL '6 days', '11:00', 'confirmed', 'pending', 160, '78 Victoria Street, Newcastle', 'First time', NOW() - INTERVAL '1 day'),
('Grace Mitchell', 'grace.mitchell@example.com', '+44 7700 234567', 'Hydrafacial', CURRENT_DATE + INTERVAL '7 days', '13:30', 'pending', 'pending', 140, '45 Church Road, Sheffield', 'Monthly treatment', NOW() - INTERVAL '1 day'),
('Mia Patel', 'mia.patel@example.com', '+44 7700 345678', 'Botox Treatment', CURRENT_DATE + INTERVAL '8 days', '09:30', 'confirmed', 'pending', 250, '12 High Street, Nottingham', 'Regular client', NOW() - INTERVAL '1 day'),
('Isabella Clarke', 'isabella.clarke@example.com', '+44 7700 456789', 'Lip Enhancement', CURRENT_DATE + INTERVAL '9 days', '16:00', 'pending', 'pending', 290, '67 Park Avenue, Derby', 'Touch-up', NOW() - INTERVAL '1 day'),
('Ava Harrison', 'ava.harrison@example.com', '+44 7700 567890', 'Profhilo Treatment', CURRENT_DATE + INTERVAL '10 days', '12:00', 'confirmed', 'pending', 390, '89 Queen Street, Plymouth', 'Second session', NOW() - INTERVAL '1 day'),
('Lily Cooper', 'lily.cooper@example.com', '+44 7700 678901', 'Skin Consultation', CURRENT_DATE + INTERVAL '11 days', '10:30', 'pending', 'pending', 75, '34 Bridge Street, Southampton', 'New client', NOW() - INTERVAL '1 day'),
('Zoe Ward', 'zoe.ward@example.com', '+44 7700 789012', 'Anti-wrinkle Treatment', CURRENT_DATE + INTERVAL '12 days', '15:30', 'confirmed', 'pending', 220, '56 Market Square, Norwich', 'Follow-up', NOW() - INTERVAL '1 day'),
('Chloe Turner', 'chloe.turner@example.com', '+44 7700 890123', 'Fat Freezing', CURRENT_DATE + INTERVAL '13 days', '11:00', 'pending', 'pending', 200, '78 High Road, Exeter', 'First consultation', NOW() - INTERVAL '1 day'),
('Ruby Phillips', 'ruby.phillips@example.com', '+44 7700 901234', 'Dermal Fillers', CURRENT_DATE + INTERVAL '14 days', '14:00', 'confirmed', 'pending', 320, '23 Church Lane, York', 'Regular treatment', NOW() - INTERVAL '1 day'),
('Ella Parker', 'ella.parker@example.com', '+44 7700 012345', 'Skin Rejuvenation', CURRENT_DATE + INTERVAL '15 days', '09:00', 'pending', 'pending', 180, '45 Victoria Road, Bath', 'Follow-up treatment', NOW() - INTERVAL '1 day'),
('Sarah Johnson', 'sarah.johnson@example.com', '+44 7700 123456', 'Laser Hair Removal', CURRENT_DATE + INTERVAL '16 days', '13:00', 'confirmed', 'pending', 150, '123 High Street, London', 'Session 4 of 6', NOW() - INTERVAL '1 day'),
('Emma Williams', 'emma.williams@example.com', '+44 7700 234567', 'Chemical Peel', CURRENT_DATE + INTERVAL '17 days', '10:30', 'pending', 'pending', 120, '45 Park Lane, Manchester', 'Monthly treatment', NOW() - INTERVAL '1 day'),
('Lisa Brown', 'lisa.brown@example.com', '+44 7700 345678', 'Microneedling', CURRENT_DATE + INTERVAL '18 days', '15:00', 'confirmed', 'pending', 160, '78 Queen''s Road, Birmingham', 'First time', NOW() - INTERVAL '1 day'),
('Rachel Green', 'rachel.green@example.com', '+44 7700 456789', 'Hydrafacial', CURRENT_DATE + INTERVAL '19 days', '11:30', 'pending', 'pending', 140, '92 King Street, Edinburgh', 'Monthly treatment', NOW() - INTERVAL '1 day'),
('Jessica Taylor', 'jessica.taylor@example.com', '+44 7700 567890', 'Botox Treatment', CURRENT_DATE + INTERVAL '20 days', '14:30', 'confirmed', 'pending', 250, '15 Bridge Road, Bristol', 'Regular client', NOW() - INTERVAL '1 day');

-- Insert test payments (20 records for pagination testing)
INSERT INTO payments (
  booking_id,
  customer_id,
  amount,
  payment_method,
  payment_status,
  payment_date,
  reference,
  notes,
  created_at
) VALUES 
((SELECT id FROM bookings LIMIT 1 OFFSET 0), (SELECT id FROM customers LIMIT 1 OFFSET 0), 199, 'card', 'paid', CURRENT_DATE, 'PAY-2025-001', 'Baby Botox treatment', NOW() - INTERVAL '1 day'),
((SELECT id FROM bookings LIMIT 1 OFFSET 1), (SELECT id FROM customers LIMIT 1 OFFSET 1), 290, 'card', 'paid', CURRENT_DATE, 'PAY-2025-002', 'Lip Enhancement', NOW() - INTERVAL '1 day'),
((SELECT id FROM bookings LIMIT 1 OFFSET 2), (SELECT id FROM customers LIMIT 1 OFFSET 2), 390, 'bank_transfer', 'paid', CURRENT_DATE, 'PAY-2025-003', 'Profhilo Treatment', NOW() - INTERVAL '1 day'),
((SELECT id FROM bookings LIMIT 1 OFFSET 3), (SELECT id FROM customers LIMIT 1 OFFSET 3), 75, 'card', 'pending', CURRENT_DATE + INTERVAL '1 day', 'PAY-2025-004', 'Skin Consultation', NOW() - INTERVAL '1 day'),
((SELECT id FROM bookings LIMIT 1 OFFSET 4), (SELECT id FROM customers LIMIT 1 OFFSET 4), 220, 'card', 'pending', CURRENT_DATE + INTERVAL '1 day', 'PAY-2025-005', 'Anti-wrinkle Treatment', NOW() - INTERVAL '1 day'),
((SELECT id FROM bookings LIMIT 1 OFFSET 5), (SELECT id FROM customers LIMIT 1 OFFSET 5), 200, 'card', 'pending', CURRENT_DATE + INTERVAL '2 days', 'PAY-2025-006', 'Fat Freezing', NOW() - INTERVAL '1 day'),
((SELECT id FROM bookings LIMIT 1 OFFSET 6), (SELECT id FROM customers LIMIT 1 OFFSET 6), 320, 'bank_transfer', 'pending', CURRENT_DATE + INTERVAL '2 days', 'PAY-2025-007', 'Dermal Fillers', NOW() - INTERVAL '1 day'),
((SELECT id FROM bookings LIMIT 1 OFFSET 7), (SELECT id FROM customers LIMIT 1 OFFSET 7), 180, 'card', 'pending', CURRENT_DATE + INTERVAL '3 days', 'PAY-2025-008', 'Skin Rejuvenation', NOW() - INTERVAL '1 day'),
((SELECT id FROM bookings LIMIT 1 OFFSET 8), (SELECT id FROM customers LIMIT 1 OFFSET 8), 150, 'card', 'pending', CURRENT_DATE + INTERVAL '4 days', 'PAY-2025-009', 'Laser Hair Removal', NOW() - INTERVAL '1 day'),
((SELECT id FROM bookings LIMIT 1 OFFSET 9), (SELECT id FROM customers LIMIT 1 OFFSET 9), 120, 'card', 'pending', CURRENT_DATE + INTERVAL '5 days', 'PAY-2025-010', 'Chemical Peel', NOW() - INTERVAL '1 day'),
((SELECT id FROM bookings LIMIT 1 OFFSET 10), (SELECT id FROM customers LIMIT 1 OFFSET 10), 160, 'bank_transfer', 'pending', CURRENT_DATE + INTERVAL '6 days', 'PAY-2025-011', 'Microneedling', NOW() - INTERVAL '1 day'),
((SELECT id FROM bookings LIMIT 1 OFFSET 11), (SELECT id FROM customers LIMIT 1 OFFSET 11), 140, 'card', 'pending', CURRENT_DATE + INTERVAL '7 days', 'PAY-2025-012', 'Hydrafacial', NOW() - INTERVAL '1 day'),
((SELECT id FROM bookings LIMIT 1 OFFSET 12), (SELECT id FROM customers LIMIT 1 OFFSET 12), 250, 'card', 'pending', CURRENT_DATE + INTERVAL '8 days', 'PAY-2025-013', 'Botox Treatment', NOW() - INTERVAL '1 day'),
((SELECT id FROM bookings LIMIT 1 OFFSET 13), (SELECT id FROM customers LIMIT 1 OFFSET 13), 290, 'card', 'pending', CURRENT_DATE + INTERVAL '9 days', 'PAY-2025-014', 'Lip Enhancement', NOW() - INTERVAL '1 day'),
((SELECT id FROM bookings LIMIT 1 OFFSET 14), (SELECT id FROM customers LIMIT 1 OFFSET 14), 390, 'bank_transfer', 'pending', CURRENT_DATE + INTERVAL '10 days', 'PAY-2025-015', 'Profhilo Treatment', NOW() - INTERVAL '1 day'),
((SELECT id FROM bookings LIMIT 1 OFFSET 15), (SELECT id FROM customers LIMIT 1 OFFSET 15), 75, 'card', 'pending', CURRENT_DATE + INTERVAL '11 days', 'PAY-2025-016', 'Skin Consultation', NOW() - INTERVAL '1 day'),
((SELECT id FROM bookings LIMIT 1 OFFSET 16), (SELECT id FROM customers LIMIT 1 OFFSET 16), 220, 'card', 'pending', CURRENT_DATE + INTERVAL '12 days', 'PAY-2025-017', 'Anti-wrinkle Treatment', NOW() - INTERVAL '1 day'),
((SELECT id FROM bookings LIMIT 1 OFFSET 17), (SELECT id FROM customers LIMIT 1 OFFSET 17), 200, 'card', 'pending', CURRENT_DATE + INTERVAL '13 days', 'PAY-2025-018', 'Fat Freezing', NOW() - INTERVAL '1 day'),
((SELECT id FROM bookings LIMIT 1 OFFSET 18), (SELECT id FROM customers LIMIT 1 OFFSET 18), 320, 'bank_transfer', 'pending', CURRENT_DATE + INTERVAL '14 days', 'PAY-2025-019', 'Dermal Fillers', NOW() - INTERVAL '1 day'),
((SELECT id FROM bookings LIMIT 1 OFFSET 19), (SELECT id FROM customers LIMIT 1 OFFSET 19), 180, 'card', 'pending', CURRENT_DATE + INTERVAL '15 days', 'PAY-2025-020', 'Skin Rejuvenation', NOW() - INTERVAL '1 day');

-- =====================================================
-- MIGRATION COMPLETED
-- =====================================================
-- All tables, indexes, policies, and functions have been created
-- Clean database ready for testing - no sample data included
-- Your EGP Aesthetics database is now ready to use!
-- =====================================================
