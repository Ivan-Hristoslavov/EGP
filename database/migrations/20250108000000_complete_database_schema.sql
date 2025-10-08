-- Complete Database Schema for EGP Aesthetics
-- This migration creates all tables with proper structure, indexes, triggers, and constraints
-- No sample data - clean skeleton ready for aesthetics clinic transformation

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Admin Profile Table
CREATE TABLE IF NOT EXISTS admin_profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50) NOT NULL,
  password TEXT NOT NULL,
  company_name VARCHAR(255),
  company_address TEXT,
  about TEXT,
  bank_name VARCHAR(255),
  account_number VARCHAR(50),
  sort_code VARCHAR(20),
  gas_safe_number VARCHAR(50),
  insurance_provider VARCHAR(255),
  years_of_experience TEXT DEFAULT '10+',
  specializations TEXT DEFAULT 'Emergency repairs, Boiler installations, Bathroom plumbing',
  certifications TEXT DEFAULT 'Gas Safe Registered, City & Guilds Level 3',
  response_time TEXT DEFAULT '45 minutes',
  terms_and_conditions TEXT,
  privacy_policy TEXT,
  business_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Settings Table
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  customer_type VARCHAR(20) DEFAULT 'individual' CHECK (customer_type IN ('individual', 'company')),
  company_name VARCHAR(255),
  vat_number VARCHAR(50),
  contact_person VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  service VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'pending')),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  amount DECIMAL(10,2) NOT NULL,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(20) DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'cheque')),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  payment_date DATE NOT NULL,
  reference VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE,
  subtotal DECIMAL(10,2) NOT NULL,
  vat_rate DECIMAL(5,2) DEFAULT 20.00,
  vat_amount DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'paid', 'overdue', 'cancelled')),
  sent_date DATE,
  paid_date DATE,
  company_name VARCHAR(255) NOT NULL,
  company_address TEXT NOT NULL,
  company_phone VARCHAR(50) NOT NULL,
  company_email VARCHAR(255) NOT NULL,
  company_vat_number VARCHAR(50),
  notes TEXT,
  image_attachments JSONB DEFAULT '[]',
  manual_service VARCHAR(255),
  manual_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Day Off Periods Table
CREATE TABLE IF NOT EXISTS day_off_periods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_type VARCHAR(20) CHECK (recurrence_type IN ('weekly', 'monthly', 'yearly')),
  show_banner BOOLEAN DEFAULT FALSE,
  banner_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Log Table
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('booking_created', 'booking_updated', 'payment_received', 'invoice_sent', 'customer_added')),
  entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('booking', 'payment', 'invoice', 'customer')),
  entity_id UUID NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CONTENT & PRESENTATION TABLES
-- =====================================================

-- Services Table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  duration_minutes INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  category VARCHAR(255),
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pricing Cards Table
CREATE TABLE IF NOT EXISTS pricing_cards (
  id SERIAL PRIMARY KEY,
  admin_id UUID REFERENCES admin_profile(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  table_rows JSONB NOT NULL DEFAULT '[]',
  table_headers JSONB NOT NULL DEFAULT '[]',
  notes JSONB NOT NULL DEFAULT '[]',
  "order" INTEGER DEFAULT 0,
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gallery Sections Table
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

-- Gallery Table
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

-- Reviews Table
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

-- FAQ Table
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

-- Admin Areas Cover Table
CREATE TABLE IF NOT EXISTS admin_areas_cover (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) UNIQUE,
  postcode VARCHAR(50),
  description TEXT,
  response_time VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- LEGAL & COMPLIANCE TABLES
-- =====================================================

-- Terms & Conditions Table
CREATE TABLE IF NOT EXISTS terms (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Privacy Policy Table
CREATE TABLE IF NOT EXISTS privacy_policy (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Site Guidance Table
CREATE TABLE IF NOT EXISTS site_guidance (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  category VARCHAR(255) NOT NULL DEFAULT 'general',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- VAT Settings Table
CREATE TABLE IF NOT EXISTS vat_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  is_enabled BOOLEAN DEFAULT TRUE,
  vat_rate DECIMAL(5,2) DEFAULT 20.00,
  vat_number VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Bookings indexes
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_customer_type ON customers(customer_type);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);

-- Invoices indexes
CREATE INDEX IF NOT EXISTS idx_invoices_booking_id ON invoices(booking_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date);

-- Day Off Periods indexes
CREATE INDEX IF NOT EXISTS idx_day_off_periods_dates ON day_off_periods(start_date, end_date);

-- Activity Log indexes
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_log_activity_type ON activity_log(activity_type);

-- Services indexes
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_reviews_is_featured ON reviews(is_featured);

-- Gallery indexes
CREATE INDEX IF NOT EXISTS idx_gallery_section_id ON gallery(section_id);
CREATE INDEX IF NOT EXISTS idx_gallery_is_active ON gallery(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_is_featured ON gallery(is_featured);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_admin_profile_updated_at BEFORE UPDATE ON admin_profile FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON admin_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_day_off_periods_updated_at BEFORE UPDATE ON day_off_periods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pricing_cards_updated_at BEFORE UPDATE ON pricing_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gallery_sections_updated_at BEFORE UPDATE ON gallery_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gallery_updated_at BEFORE UPDATE ON gallery FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_faq_updated_at BEFORE UPDATE ON faq FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_areas_cover_updated_at BEFORE UPDATE ON admin_areas_cover FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vat_settings_updated_at BEFORE UPDATE ON vat_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create activity log entries
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Log booking activities
  IF TG_TABLE_NAME = 'bookings' THEN
    IF TG_OP = 'INSERT' THEN
      INSERT INTO activity_log (activity_type, entity_type, entity_id, message, metadata)
      VALUES (
        'booking_created',
        'booking',
        NEW.id,
        'New booking created for ' || NEW.customer_name,
        jsonb_build_object('service', NEW.service, 'date', NEW.date, 'amount', NEW.amount)
      );
    ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
      INSERT INTO activity_log (activity_type, entity_type, entity_id, message, metadata)
      VALUES (
        'booking_updated',
        'booking',
        NEW.id,
        'Booking status changed to ' || NEW.status || ' for ' || NEW.customer_name,
        jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
      );
    END IF;
  END IF;
  
  -- Log payment activities
  IF TG_TABLE_NAME = 'payments' THEN
    IF TG_OP = 'INSERT' THEN
      INSERT INTO activity_log (activity_type, entity_type, entity_id, message, metadata)
      VALUES (
        'payment_received',
        'payment',
        NEW.id,
        'Payment of £' || NEW.amount || ' received via ' || NEW.payment_method,
        jsonb_build_object('amount', NEW.amount, 'method', NEW.payment_method)
      );
    END IF;
  END IF;
  
  -- Log customer activities
  IF TG_TABLE_NAME = 'customers' THEN
    IF TG_OP = 'INSERT' THEN
      INSERT INTO activity_log (activity_type, entity_type, entity_id, message, metadata)
      VALUES (
        'customer_added',
        'customer',
        NEW.id,
        'New customer added: ' || NEW.name,
        jsonb_build_object('customer_type', NEW.customer_type, 'email', NEW.email)
      );
    END IF;
  END IF;
  
  -- Log invoice activities
  IF TG_TABLE_NAME = 'invoices' THEN
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status AND NEW.status = 'sent' THEN
      INSERT INTO activity_log (activity_type, entity_type, entity_id, message, metadata)
      VALUES (
        'invoice_sent',
        'invoice',
        NEW.id,
        'Invoice ' || NEW.invoice_number || ' sent to customer',
        jsonb_build_object('invoice_number', NEW.invoice_number, 'amount', NEW.total_amount)
      );
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for activity logging
CREATE TRIGGER log_booking_activity AFTER INSERT OR UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER log_payment_activity AFTER INSERT ON payments FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER log_customer_activity AFTER INSERT ON customers FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER log_invoice_activity AFTER UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION log_activity();

-- Function to generate next invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  formatted_number TEXT;
BEGIN
  -- Get the highest existing invoice number
  SELECT COALESCE(
    MAX(CAST(SUBSTRING(invoice_number FROM 'IVN-(\d+)') AS INTEGER)), 
    0
  ) + 1 INTO next_number
  FROM invoices 
  WHERE invoice_number ~ '^IVN-\d+$';
  
  -- Format with leading zeros
  formatted_number := 'IVN-' || LPAD(next_number::TEXT, 4, '0');
  
  RETURN formatted_number;
END;
$$ LANGUAGE plpgsql;

-- Function to safely delete customer with all related records
CREATE OR REPLACE FUNCTION delete_customer_complete(p_customer_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  customer_exists BOOLEAN;
  deleted_customer RECORD;
  deleted_bookings_count INTEGER := 0;
  deleted_payments_count INTEGER := 0;
  deleted_invoices_count INTEGER := 0;
  result JSONB;
BEGIN
  -- Check if customer exists
  SELECT EXISTS(SELECT 1 FROM customers WHERE id = p_customer_id) INTO customer_exists;
  
  IF NOT customer_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Customer not found',
      'customer_id', p_customer_id
    );
  END IF;
  
  -- Get customer info for logging
  SELECT * INTO deleted_customer FROM customers WHERE id = p_customer_id;
  
  -- Count related records
  SELECT COUNT(*) INTO deleted_bookings_count FROM bookings WHERE customer_id = p_customer_id;
  SELECT COUNT(*) INTO deleted_payments_count FROM payments WHERE customer_id = p_customer_id;
  SELECT COUNT(*) INTO deleted_invoices_count FROM invoices WHERE customer_id = p_customer_id;
  
  BEGIN
    -- Delete in correct order (foreign key constraints)
    DELETE FROM invoices WHERE customer_id = p_customer_id;
    DELETE FROM payments WHERE customer_id = p_customer_id;
    DELETE FROM bookings WHERE customer_id = p_customer_id;
    DELETE FROM customers WHERE id = p_customer_id;
    
    -- Return success
    result := jsonb_build_object(
      'success', true,
      'message', 'Customer deleted successfully',
      'customer_id', p_customer_id,
      'customer_name', deleted_customer.name,
      'customer_email', deleted_customer.email,
      'deleted_bookings', deleted_bookings_count,
      'deleted_payments', deleted_payments_count,
      'deleted_invoices', deleted_invoices_count,
      'deleted_at', NOW()
    );
    
    RETURN result;
    
  EXCEPTION
    WHEN OTHERS THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'customer_id', p_customer_id
      );
  END;
END;
$$;

-- =====================================================
-- VIEWS
-- =====================================================

-- Dashboard Statistics View
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM bookings) as total_bookings,
  (SELECT COUNT(*) FROM bookings WHERE status = 'pending') as pending_bookings,
  (SELECT COUNT(*) FROM bookings WHERE status = 'completed') as completed_bookings,
  (SELECT COALESCE(SUM(amount), 0) FROM bookings WHERE status = 'completed') as total_revenue,
  (SELECT COALESCE(SUM(amount), 0) FROM bookings WHERE status = 'completed' AND date >= CURRENT_DATE - INTERVAL '7 days') as weekly_revenue,
  (SELECT COUNT(DISTINCT customer_id) FROM bookings WHERE customer_id IS NOT NULL) as total_customers,
  (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payment_status = 'pending') as pending_payments;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE admin_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_off_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_areas_cover ENABLE ROW LEVEL SECURITY;
ALTER TABLE vat_settings ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (allow all operations for now - restrict later based on auth)
CREATE POLICY "Allow all operations on admin_profile" ON admin_profile FOR ALL USING (true);
CREATE POLICY "Allow all operations on admin_settings" ON admin_settings FOR ALL USING (true);
CREATE POLICY "Allow all operations on customers" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all operations on bookings" ON bookings FOR ALL USING (true);
CREATE POLICY "Allow all operations on payments" ON payments FOR ALL USING (true);
CREATE POLICY "Allow all operations on invoices" ON invoices FOR ALL USING (true);
CREATE POLICY "Allow all operations on day_off_periods" ON day_off_periods FOR ALL USING (true);
CREATE POLICY "Allow all operations on activity_log" ON activity_log FOR ALL USING (true);
CREATE POLICY "Allow all operations on services" ON services FOR ALL USING (true);
CREATE POLICY "Allow all operations on pricing_cards" ON pricing_cards FOR ALL USING (true);
CREATE POLICY "Allow all operations on gallery_sections" ON gallery_sections FOR ALL USING (true);
CREATE POLICY "Allow all operations on gallery" ON gallery FOR ALL USING (true);
CREATE POLICY "Allow all operations on reviews" ON reviews FOR ALL USING (true);
CREATE POLICY "Allow all operations on faq" ON faq FOR ALL USING (true);
CREATE POLICY "Allow all operations on admin_areas_cover" ON admin_areas_cover FOR ALL USING (true);
CREATE POLICY "Allow all operations on vat_settings" ON vat_settings FOR ALL USING (true);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE admin_profile IS 'Stores admin/practitioner profile information';
COMMENT ON TABLE admin_settings IS 'Key-value store for application settings';
COMMENT ON TABLE customers IS 'Customer database for individuals and companies';
COMMENT ON TABLE bookings IS 'Treatment bookings and appointments';
COMMENT ON TABLE payments IS 'Payment records linked to bookings';
COMMENT ON TABLE invoices IS 'Invoice generation and tracking';
COMMENT ON TABLE day_off_periods IS 'Clinic closure periods and holidays';
COMMENT ON TABLE activity_log IS 'Audit trail for system activities';
COMMENT ON TABLE services IS 'Available treatments and services';
COMMENT ON TABLE pricing_cards IS 'Pricing information display cards';
COMMENT ON TABLE gallery IS 'Before/after treatment photos';
COMMENT ON TABLE reviews IS 'Customer reviews and testimonials';
COMMENT ON TABLE faq IS 'Frequently asked questions';
COMMENT ON TABLE admin_areas_cover IS 'Geographic service coverage areas';
COMMENT ON TABLE vat_settings IS 'VAT configuration and settings';

COMMENT ON COLUMN admin_profile.password IS 'Bcrypt hashed password for secure authentication';
COMMENT ON COLUMN reviews.rating IS 'Rating from 0-5 stars';
COMMENT ON COLUMN invoices.image_attachments IS 'Array of image URLs attached to invoice';

-- =====================================================
-- COMPLETE - DATABASE SKELETON READY
-- =====================================================

-- This schema is ready for:
-- 1. Admin authentication and profile management
-- 2. Customer and booking management
-- 3. Payment and invoicing
-- 4. Content management (services, gallery, reviews, FAQ)
-- 5. Settings and configuration
-- 6. Activity logging and audit trails
-- 7. Future aesthetics clinic specific extensions

