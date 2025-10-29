-- =====================================================
-- EGP Aesthetics - Fix RLS Policies for Admin Access
-- =====================================================
-- This migration adds RLS policies to allow admin panel
-- to access data using the anon key.
-- =====================================================

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_off_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on bookings" ON bookings;
DROP POLICY IF EXISTS "Allow all operations on customers" ON customers;
DROP POLICY IF EXISTS "Allow all operations on payments" ON payments;
DROP POLICY IF EXISTS "Allow all operations on admin_profile" ON admin_profile;
DROP POLICY IF EXISTS "Allow all operations on admin_settings" ON admin_settings;
DROP POLICY IF EXISTS "Allow all operations on day_off_periods" ON day_off_periods;
DROP POLICY IF EXISTS "Allow all operations on activity_log" ON activity_log;

-- Create policies to allow full access for admin operations
-- This allows the anon key to perform all operations on these tables
-- In production, you might want to restrict this further

-- Bookings policies
CREATE POLICY "Allow all operations on bookings" ON bookings
    FOR ALL USING (true) WITH CHECK (true);

-- Customers policies  
CREATE POLICY "Allow all operations on customers" ON customers
    FOR ALL USING (true) WITH CHECK (true);

-- Payments policies
CREATE POLICY "Allow all operations on payments" ON payments
    FOR ALL USING (true) WITH CHECK (true);

-- Admin profile policies
CREATE POLICY "Allow all operations on admin_profile" ON admin_profile
    FOR ALL USING (true) WITH CHECK (true);

-- Admin settings policies
CREATE POLICY "Allow all operations on admin_settings" ON admin_settings
    FOR ALL USING (true) WITH CHECK (true);

-- Day off periods policies
CREATE POLICY "Allow all operations on day_off_periods" ON day_off_periods
    FOR ALL USING (true) WITH CHECK (true);

-- Activity log policies
CREATE POLICY "Allow all operations on activity_log" ON activity_log
    FOR ALL USING (true) WITH CHECK (true);

-- Grant necessary permissions to anon role
GRANT ALL ON bookings TO anon;
GRANT ALL ON customers TO anon;
GRANT ALL ON payments TO anon;
GRANT ALL ON admin_profile TO anon;
GRANT ALL ON admin_settings TO anon;
GRANT ALL ON day_off_periods TO anon;
GRANT ALL ON activity_log TO anon;

-- Grant sequence permissions for auto-generated IDs
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
