-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_profile table
CREATE TABLE IF NOT EXISTS admin_profile (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
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

-- Create pricing cards table
CREATE TABLE IF NOT EXISTS pricing_cards (
    id SERIAL PRIMARY KEY,
    admin_id UUID REFERENCES admin_profile(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subtitle TEXT,
    table_rows JSONB NOT NULL DEFAULT '[]',
    notes JSONB NOT NULL DEFAULT '[]',
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON admin_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_profile_updated_at BEFORE UPDATE ON admin_profile FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for bookings
INSERT INTO bookings (customer_name, customer_email, customer_phone, service, date, time, status, payment_status, amount, address, notes) VALUES
('John Smith', 'john.smith@email.com', '+44 7700 900123', 'Call-out & Hourly Labour Rates', '2024-03-20', '09:00', 'scheduled', 'paid', 80.00, '123 Main Street, London, SW1A 1AA', 'Customer prefers morning appointments'),
('Sarah Johnson', 'sarah.j@email.com', '+44 7700 900456', 'Full-Day Booking Rates', '2024-03-20', '14:00', 'pending', 'pending', 520.00, '456 Oak Avenue, Manchester, M1 1AA', 'Large bathroom renovation project'),
('Michael Brown', 'mike.brown@email.com', '+44 7700 900789', 'Call-out & Hourly Labour Rates', '2024-03-21', '10:00', 'completed', 'paid', 120.00, '789 Pine Road, Birmingham, B1 1AA', NULL),
('Emily White', 'emily.white@email.com', '+44 7700 900012', 'Call-out & Hourly Labour Rates', '2024-03-19', '16:00', 'cancelled', 'refunded', 65.00, '321 Elm Street, Liverpool, L1 1AA', 'Customer cancelled due to emergency');

-- Insert default admin profile
INSERT INTO admin_profile (name, email, phone, company_name, company_address, gas_safe_number) VALUES
('Admin User', '', '123456789', 'EGP Ltd', 'London, UK', 'GS123456');

-- Insert default admin settings
INSERT INTO admin_settings (key, value) VALUES
('dayOffSettings', '{"enabled": false, "message": "We are currently closed for maintenance", "showBanner": false, "startDate": "", "endDate": ""}'),
('businessHours', '{"monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "friday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "08:00", "close": "18:00"}, "sunday": {"open": "08:00", "close": "18:00"}}');

-- Enable Row Level Security (RLS)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profile ENABLE ROW LEVEL SECURITY;

-- Create policies (for now, allow all operations - you can restrict later)
CREATE POLICY "Allow all operations on bookings" ON bookings FOR ALL USING (true);
CREATE POLICY "Allow all operations on admin_settings" ON admin_settings FOR ALL USING (true);
CREATE POLICY "Allow all operations on admin_profile" ON admin_profile FOR ALL USING (true); 