-- Complete database schema for Plumber project
-- Execute this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================
-- BASIC TABLES (no dependencies)
-- ==============================

-- Create admin_profile table FIRST (other tables reference it)
CREATE TABLE IF NOT EXISTS admin_profile (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
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

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Create gallery_sections table (needed before gallery)
CREATE TABLE IF NOT EXISTS gallery_sections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    duration_minutes INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    category VARCHAR(100),
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_areas_cover table
CREATE TABLE IF NOT EXISTS admin_areas_cover (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    area_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create faq table
CREATE TABLE IF NOT EXISTS faq (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'general',
    "order" INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create day_off_periods table
CREATE TABLE IF NOT EXISTS day_off_periods (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- ==============================
-- DEPENDENT TABLES (reference other tables)
-- ==============================

-- Create bookings table (references customers)
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Create payments table (references bookings and customers)
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20) DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'cheque')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
    payment_date DATE NOT NULL,
    reference VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoices table (references bookings and customers)
CREATE TABLE IF NOT EXISTS invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity_log table
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('booking_created', 'booking_updated', 'payment_received', 'invoice_sent', 'customer_added')),
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('booking', 'payment', 'invoice', 'customer')),
    entity_id UUID NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pricing_cards table (references admin_profile)
CREATE TABLE IF NOT EXISTS pricing_cards (
    id SERIAL PRIMARY KEY,
    admin_id UUID REFERENCES admin_profile(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subtitle TEXT,
    table_rows JSONB NOT NULL DEFAULT '[]',
    table_headers JSONB NOT NULL DEFAULT '[]',
    notes JSONB NOT NULL DEFAULT '[]',
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gallery table (references gallery_sections)
CREATE TABLE IF NOT EXISTS gallery (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    section_id UUID REFERENCES gallery_sections(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    "order" INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================
-- FUNCTIONS AND TRIGGERS
-- ==============================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_admin_profile_updated_at BEFORE UPDATE ON admin_profile FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON admin_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_day_off_periods_updated_at BEFORE UPDATE ON day_off_periods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pricing_cards_updated_at BEFORE UPDATE ON pricing_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gallery_sections_updated_at BEFORE UPDATE ON gallery_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gallery_updated_at BEFORE UPDATE ON gallery FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_faq_updated_at BEFORE UPDATE ON faq FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_areas_cover_updated_at BEFORE UPDATE ON admin_areas_cover FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================
-- ROW LEVEL SECURITY (RLS)
-- ==============================

-- Enable Row Level Security
ALTER TABLE admin_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_off_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_areas_cover ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now)
CREATE POLICY "Allow all operations on admin_profile" ON admin_profile FOR ALL USING (true);
CREATE POLICY "Allow all operations on admin_settings" ON admin_settings FOR ALL USING (true);
CREATE POLICY "Allow all operations on customers" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all operations on bookings" ON bookings FOR ALL USING (true);
CREATE POLICY "Allow all operations on payments" ON payments FOR ALL USING (true);
CREATE POLICY "Allow all operations on invoices" ON invoices FOR ALL USING (true);
CREATE POLICY "Allow all operations on day_off_periods" ON day_off_periods FOR ALL USING (true);
CREATE POLICY "Allow all operations on activity_log" ON activity_log FOR ALL USING (true);
CREATE POLICY "Allow all operations on pricing_cards" ON pricing_cards FOR ALL USING (true);
CREATE POLICY "Allow all operations on gallery_sections" ON gallery_sections FOR ALL USING (true);
CREATE POLICY "Allow all operations on gallery" ON gallery FOR ALL USING (true);
CREATE POLICY "Allow all operations on reviews" ON reviews FOR ALL USING (true);
CREATE POLICY "Allow all operations on faq" ON faq FOR ALL USING (true);
CREATE POLICY "Allow all operations on services" ON services FOR ALL USING (true);
CREATE POLICY "Allow all operations on admin_areas_cover" ON admin_areas_cover FOR ALL USING (true);

-- ==============================
-- SAMPLE DATA
-- ==============================

-- Insert sample gallery sections
INSERT INTO gallery_sections (id, title, description, "order", is_active) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Before & After', 'Transformation photos showing our work quality', 1, true),
    ('550e8400-e29b-41d4-a716-446655440002', 'Emergency Repairs', 'Quick fixes and emergency plumbing solutions', 2, true),
    ('550e8400-e29b-41d4-a716-446655440003', 'Installations', 'New installations and system setups', 3, true),
    ('550e8400-e29b-41d4-a716-446655440004', 'Maintenance', 'Regular maintenance and service work', 4, true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample areas
INSERT INTO admin_areas_cover (area_name, description, is_active, "order") VALUES
    ('Balham', 'Professional plumbing services in Balham and surrounding areas', true, 1),
    ('Battersea', 'Expert plumbers serving Battersea with 24/7 emergency services', true, 2),
    ('Chelsea', 'Premium plumbing solutions for Chelsea residents and businesses', true, 3),
    ('Clapham', 'Reliable plumbing services covering all of Clapham', true, 4),
    ('Streatham', 'Comprehensive plumbing services for Streatham area', true, 5),
    ('Wandsworth', 'Professional plumbers serving Wandsworth and nearby areas', true, 6)
ON CONFLICT (area_name) DO NOTHING;

-- Insert sample FAQ
INSERT INTO faq (question, answer, category, "order", is_active) VALUES
    ('What areas do you cover?', 'We provide plumbing services across South London, including Balham, Battersea, Chelsea, Clapham, Streatham, and Wandsworth.', 'general', 1, true),
    ('Do you offer 24/7 emergency services?', 'Yes, we provide 24/7 emergency plumbing services for urgent issues like burst pipes, major leaks, and heating system failures.', 'emergency', 2, true),
    ('Are you Gas Safe registered?', 'Yes, all our engineers are fully Gas Safe registered and qualified to work on gas appliances and systems.', 'qualifications', 3, true),
    ('Do you provide free quotes?', 'Yes, we offer free, no-obligation quotes for all planned work. Emergency callouts have a standard rate.', 'pricing', 4, true),
    ('What payment methods do you accept?', 'We accept cash, card payments, bank transfers, and can provide payment plans for larger jobs.', 'payment', 5, true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample services
INSERT INTO services (name, description, price, duration_minutes, is_active, category, "order") VALUES
    ('Emergency Plumber', 'Urgent plumbing repairs and emergency callouts', 80.00, 60, true, 'emergency', 1),
    ('Boiler Repair', 'Boiler diagnostics, repair and maintenance', 120.00, 90, true, 'heating', 2),
    ('Leak Detection', 'Professional leak detection and repair services', 90.00, 75, true, 'repair', 3),
    ('Bathroom Installation', 'Complete bathroom installation and renovation', 2500.00, 480, true, 'installation', 4),
    ('Drain Unblocking', 'Professional drain and pipe unblocking service', 60.00, 45, true, 'maintenance', 5),
    ('Central Heating', 'Central heating installation and repair', 150.00, 120, true, 'heating', 6)
ON CONFLICT (id) DO NOTHING;

-- Insert default admin settings
INSERT INTO admin_settings (key, value) VALUES
    ('dayOffSettings', '{"enabled": false, "message": "We are currently closed for maintenance", "showBanner": false, "startDate": "", "endDate": ""}'),
    ('businessHours', '{"monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "friday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "08:00", "close": "18:00"}, "sunday": {"open": "08:00", "close": "18:00"}}'),
    ('companyInfo', '{"name": "EGP", "address": "London, UK", "phone": "123456789", "email": "", "website": "https://egp.com"}'),
    ('googleCalendarIntegration', '{"enabled": false, "calendarId": "", "clientId": "", "clientSecret": ""}')
ON CONFLICT (key) DO NOTHING;

-- Success message
SELECT 'Database schema created successfully! All tables, functions, triggers, and sample data have been set up.' as result; 