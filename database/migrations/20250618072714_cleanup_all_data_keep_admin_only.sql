-- Clean up all data except admin account
-- This migration removes all sample/demo data and keeps only the admin profile

-- Clean up all tables in the correct order (respecting foreign key constraints)

-- 1. Clear activity_log table
DELETE FROM activity_log;

-- 2. Clear payments table
DELETE FROM payments;

-- 3. Clear invoices table  
DELETE FROM invoices;

-- 4. Clear bookings table
DELETE FROM bookings;

-- 5. Clear customers table
DELETE FROM customers;

-- 6. Clear day_off_periods table
DELETE FROM day_off_periods;

-- 7. Clear admin_settings table (except admin profile settings)
DELETE FROM admin_settings 
WHERE key NOT IN ('admin_profile', 'business_info', 'working_hours', 'pricing', 'notifications', 'dayOffSettings', 'businessHours');

-- Keep only the admin profile in admin_profile table
-- This should already exist from previous migrations, so we don't delete it

-- Note: Tables use UUID primary keys, so no sequences to reset

-- Log the cleanup activity
INSERT INTO activity_log (activity_type, entity_type, entity_id, message, created_at)
VALUES ('booking_updated', 'booking', uuid_generate_v4(), 'Database cleanup completed - all demo data cleared', NOW());
