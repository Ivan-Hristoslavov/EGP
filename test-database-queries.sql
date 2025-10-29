-- =====================================================
-- EGP Aesthetics - Database Test Queries
-- =====================================================
-- Run these queries after the main migration to test your database setup
-- =====================================================

-- 1. Check if all tables exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN (
        'admin_profile',
        'customers', 
        'bookings',
        'payments',
        'day_off_periods',
        'membership_plans',
        'customer_memberships',
        'membership_usage',
        'terms',
        'privacy_policy',
        'site_guidance',
        'activity_log',
        'admin_settings'
    )
ORDER BY table_name;

-- 2. Check table row counts (should all be 0 for clean setup)
SELECT 
    'admin_profile' as table_name, COUNT(*) as row_count FROM admin_profile
UNION ALL
SELECT 
    'customers' as table_name, COUNT(*) as row_count FROM customers
UNION ALL
SELECT 
    'bookings' as table_name, COUNT(*) as row_count FROM bookings
UNION ALL
SELECT 
    'payments' as table_name, COUNT(*) as row_count FROM payments
UNION ALL
SELECT 
    'day_off_periods' as table_name, COUNT(*) as row_count FROM day_off_periods
UNION ALL
SELECT 
    'membership_plans' as table_name, COUNT(*) as row_count FROM membership_plans
UNION ALL
SELECT 
    'customer_memberships' as table_name, COUNT(*) as row_count FROM customer_memberships
UNION ALL
SELECT 
    'membership_usage' as table_name, COUNT(*) as row_count FROM membership_usage
UNION ALL
SELECT 
    'terms' as table_name, COUNT(*) as row_count FROM terms
UNION ALL
SELECT 
    'privacy_policy' as table_name, COUNT(*) as row_count FROM privacy_policy
UNION ALL
SELECT 
    'site_guidance' as table_name, COUNT(*) as row_count FROM site_guidance
UNION ALL
SELECT 
    'activity_log' as table_name, COUNT(*) as row_count FROM activity_log
UNION ALL
SELECT 
    'admin_settings' as table_name, COUNT(*) as row_count FROM admin_settings;

-- 3. Check if indexes were created
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- 4. Check if RLS is enabled on tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'admin_profile',
        'customers', 
        'bookings',
        'payments',
        'day_off_periods',
        'membership_plans',
        'customer_memberships',
        'membership_usage',
        'terms',
        'privacy_policy',
        'site_guidance',
        'activity_log',
        'admin_settings'
    )
ORDER BY tablename;

-- 5. Check if functions were created
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name IN (
        'update_updated_at_column',
        'update_customers_updated_at',
        'update_membership_updated_at',
        'get_customer_membership',
        'apply_membership_discount'
    )
ORDER BY routine_name;

-- 6. Test basic insert (optional - uncomment to test)
-- INSERT INTO admin_profile (name, email, business_email, phone, password, company_name) 
-- VALUES ('Test Admin', 'test@example.com', 'business@example.com', '+44 123 456789', 'testpass', 'Test Company');

-- 7. Test membership function (optional - uncomment to test)
-- SELECT * FROM get_customer_membership('00000000-0000-0000-0000-000000000000'::uuid);

-- =====================================================
-- Expected Results:
-- =====================================================
-- 1. All 13 tables should be listed
-- 2. All row counts should be 0
-- 3. Multiple indexes should be listed (idx_*)
-- 4. RLS should be enabled (true) for all tables
-- 5. All 5 functions should be listed
-- =====================================================

-- =====================================================
-- INSERT TEST DATA - 20 BOOKING RECORDS
-- =====================================================
-- Run these queries to populate the database with test data for development

-- First, ensure we have some customers to reference
INSERT INTO customers (id, first_name, last_name, email, phone, address, postcode, city, password_hash, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Sarah', 'Johnson', 'sarah.johnson@email.com', '+44 7700 900001', '123 Clapham High Street', 'SW4 7AA', 'London', 'hashed_password_123', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Michael', 'Chen', 'michael.chen@email.com', '+44 7700 900002', '45 Balham Road', 'SW12 9DR', 'London', 'hashed_password_123', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Emma', 'Williams', 'emma.williams@email.com', '+44 7700 900003', '78 Chelsea Embankment', 'SW3 4LT', 'London', 'hashed_password_123', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'David', 'Thompson', 'david.thompson@email.com', '+44 7700 900004', '92 Battersea Park Road', 'SW8 4DU', 'London', 'hashed_password_123', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'Lisa', 'Anderson', 'lisa.anderson@email.com', '+44 7700 900005', '156 Wandsworth Common', 'SW18 3RT', 'London', 'hashed_password_123', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'James', 'Wilson', 'james.wilson@email.com', '+44 7700 900006', '234 Streatham High Road', 'SW16 6HG', 'London', 'hashed_password_123', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440007', 'Sophie', 'Brown', 'sophie.brown@email.com', '+44 7700 900007', '67 Tooting Bec Road', 'SW17 8BS', 'London', 'hashed_password_123', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440008', 'Robert', 'Taylor', 'robert.taylor@email.com', '+44 7700 900008', '89 Putney High Street', 'SW15 1SP', 'London', 'hashed_password_123', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440009', 'Charlotte', 'Davis', 'charlotte.davis@email.com', '+44 7700 900009', '145 Richmond Road', 'SW20 0PT', 'London', 'hashed_password_123', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440010', 'Oliver', 'Miller', 'oliver.miller@email.com', '+44 7700 900010', '201 Kingston Road', 'SW19 3LX', 'London', 'hashed_password_123', NOW(), NOW());

-- Insert 20 booking records
INSERT INTO bookings (id, customer_id, customer_name, customer_email, customer_phone, service, date, time, status, payment_status, amount, address, notes, created_at, updated_at) VALUES
-- January 2025 bookings
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Sarah Johnson', 'sarah.johnson@email.com', '+44 7700 900001', 'Anti-wrinkle Treatment', '2025-01-20', '10:00', 'scheduled', 'pending', 250.00, '123 Clapham High Street, London SW4 7AA', 'First time client, interested in forehead lines', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Michael Chen', 'michael.chen@email.com', '+44 7700 900002', 'Lip Enhancement', '2025-01-20', '11:30', 'scheduled', 'paid', 350.00, '45 Balham Road, London SW12 9DR', 'Follow-up appointment, very satisfied with previous treatment', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Emma Williams', 'emma.williams@email.com', '+44 7700 900003', 'Dermal Fillers', '2025-01-21', '09:00', 'completed', 'paid', 450.00, '78 Chelsea Embankment, London SW3 4LT', 'Cheek enhancement, excellent results', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'David Thompson', 'david.thompson@email.com', '+44 7700 900004', 'Skin Consultation', '2025-01-21', '14:00', 'scheduled', 'pending', 100.00, '92 Battersea Park Road, London SW8 4DU', 'New client consultation for skin concerns', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'Lisa Anderson', 'lisa.anderson@email.com', '+44 7700 900005', 'Chemical Peel', '2025-01-22', '10:30', 'scheduled', 'pending', 200.00, '156 Wandsworth Common, London SW18 3RT', 'Monthly maintenance treatment', NOW(), NOW()),

-- February 2025 bookings
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006', 'James Wilson', 'james.wilson@email.com', '+44 7700 900006', 'Botox Treatment', '2025-02-01', '15:00', 'scheduled', 'paid', 280.00, '234 Streatham High Road, London SW16 6HG', 'Regular client, 6-month follow-up', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440007', 'Sophie Brown', 'sophie.brown@email.com', '+44 7700 900007', 'Hydrafacial', '2025-02-02', '11:00', 'completed', 'paid', 180.00, '67 Tooting Bec Road, London SW17 8BS', 'Deep cleansing facial, skin looking great', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440008', 'Robert Taylor', 'robert.taylor@email.com', '+44 7700 900008', 'Microneedling', '2025-02-03', '09:30', 'scheduled', 'pending', 320.00, '89 Putney High Street, London SW15 1SP', 'First time microneedling treatment', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440009', 'Charlotte Davis', 'charlotte.davis@email.com', '+44 7700 900009', 'Lip Enhancement', '2025-02-04', '13:00', 'scheduled', 'paid', 380.00, '145 Richmond Road, London SW20 0PT', 'Touch-up appointment for lip fillers', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440010', 'Oliver Miller', 'oliver.miller@email.com', '+44 7700 900010', 'Anti-wrinkle Treatment', '2025-02-05', '16:00', 'completed', 'paid', 260.00, '201 Kingston Road, London SW19 3LX', 'Crow''s feet treatment, very happy with results', NOW(), NOW()),

-- March 2025 bookings
('660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'Sarah Johnson', 'sarah.johnson@email.com', '+44 7700 900001', 'Dermal Fillers', '2025-03-01', '10:00', 'scheduled', 'pending', 420.00, '123 Clapham High Street, London SW4 7AA', 'Follow-up to anti-wrinkle treatment', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', 'Michael Chen', 'michael.chen@email.com', '+44 7700 900002', 'Skin Rejuvenation', '2025-03-02', '14:30', 'scheduled', 'paid', 300.00, '45 Balham Road, London SW12 9DR', 'Comprehensive skin treatment package', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440003', 'Emma Williams', 'emma.williams@email.com', '+44 7700 900003', 'Laser Hair Removal', '2025-03-03', '12:00', 'scheduled', 'pending', 150.00, '78 Chelsea Embankment, London SW3 4LT', 'Session 3 of 6 for facial hair removal', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440004', 'David Thompson', 'david.thompson@email.com', '+44 7700 900004', 'Fat Freezing', '2025-03-04', '15:30', 'scheduled', 'paid', 500.00, '92 Battersea Park Road, London SW8 4DU', 'Stomach area treatment', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440005', 'Lisa Anderson', 'lisa.anderson@email.com', '+44 7700 900005', 'Baby Botox', '2025-03-05', '11:00', 'completed', 'paid', 200.00, '156 Wandsworth Common, London SW18 3RT', 'Preventive treatment for fine lines', NOW(), NOW()),

-- April 2025 bookings
('660e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440006', 'James Wilson', 'james.wilson@email.com', '+44 7700 900006', 'Profhilo Treatment', '2025-04-01', '09:00', 'scheduled', 'pending', 400.00, '234 Streatham High Road, London SW16 6HG', 'Skin hydration and rejuvenation', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440007', 'Sophie Brown', 'sophie.brown@email.com', '+44 7700 900007', 'Deep Cleansing Facial', '2025-04-02', '13:30', 'scheduled', 'paid', 120.00, '67 Tooting Bec Road, London SW17 8BS', 'Monthly maintenance facial', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440008', 'Robert Taylor', 'robert.taylor@email.com', '+44 7700 900008', 'Brightening Treatment', '2025-04-03', '16:00', 'scheduled', 'pending', 250.00, '89 Putney High Street, London SW15 1SP', 'Hyperpigmentation treatment', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440009', 'Charlotte Davis', 'charlotte.davis@email.com', '+44 7700 900009', 'Detox Treatment', '2025-04-04', '10:30', 'scheduled', 'paid', 180.00, '145 Richmond Road, London SW20 0PT', 'Spring detox facial treatment', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440010', 'Oliver Miller', 'oliver.miller@email.com', '+44 7700 900010', 'Anti-wrinkle Treatment', '2025-04-05', '14:00', 'scheduled', 'pending', 270.00, '201 Kingston Road, London SW19 3LX', 'Regular maintenance appointment', NOW(), NOW());

-- =====================================================
-- VERIFY BOOKING DATA INSERTION
-- =====================================================
-- Run this query to verify the bookings were inserted correctly

SELECT 
    b.id,
    b.customer_name,
    b.service,
    b.date,
    b.time,
    b.status,
    b.payment_status,
    b.amount,
    b.created_at
FROM bookings b
ORDER BY b.date, b.time;

-- Count total bookings
SELECT COUNT(*) as total_bookings FROM bookings;

-- Count bookings by status
SELECT 
    status,
    COUNT(*) as count
FROM bookings
GROUP BY status
ORDER BY status;

-- Count bookings by payment status
SELECT 
    payment_status,
    COUNT(*) as count
FROM bookings
GROUP BY payment_status
ORDER BY payment_status;

-- =====================================================
-- Expected Results:
-- =====================================================
-- 1. 20 booking records should be inserted
-- 2. Bookings should span from January to April 2025
-- 3. Mix of statuses: scheduled, completed
-- 4. Mix of payment statuses: pending, paid
-- 5. Various services and realistic London addresses
-- =====================================================
