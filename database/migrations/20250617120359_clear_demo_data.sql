-- Clear all demo data from tables
-- This will remove all sample/test data so you can start fresh

-- Clear bookings table (remove all demo bookings)
DELETE FROM bookings;

-- Clear admin_profile table (remove demo admin profile)
DELETE FROM admin_profile;

-- Clear admin_settings table (remove demo settings)
DELETE FROM admin_settings;

-- Reset sequences (if any auto-increment IDs exist)
-- Note: Since we're using UUIDs, this is not necessary, but good practice

-- Optionally, you can insert a basic admin profile with your real data
-- Uncomment and modify the following lines with your actual information:

-- INSERT INTO admin_profile (name, email, phone, company_name, company_address, gas_safe_number) VALUES
-- ('Your Name', 'your-email@example.com', 'your-phone-number', 'Your Company Name', 'Your Address', 'Your Gas Safe Number');

-- Insert basic admin settings with default values
INSERT INTO admin_settings (key, value) VALUES
('dayOffSettings', '{"isEnabled": false, "message": "We are currently closed. Emergency services are still available. Please call for urgent matters.", "startDate": "", "endDate": "", "showOnAllPages": false}'),
('businessHours', '{"monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "friday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "08:00", "close": "18:00"}, "sunday": {"open": "08:00", "close": "18:00"}}');

-- Add a comment to confirm the cleanup
-- Demo data has been cleared. You can now add real data through the admin panel.
