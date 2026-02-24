-- Add payment_method to bookings table
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT 'card';
