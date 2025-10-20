-- Add reminder tracking fields to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS reminder_24h_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reminder_1h_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS followup_sent BOOLEAN DEFAULT false;

-- Add indexes for reminder queries
CREATE INDEX IF NOT EXISTS idx_bookings_reminder_24h ON bookings(date, status, reminder_24h_sent) 
WHERE status IN ('confirmed', 'pending') AND reminder_24h_sent = false;

CREATE INDEX IF NOT EXISTS idx_bookings_reminder_1h ON bookings(date, time, status, reminder_1h_sent) 
WHERE status IN ('confirmed', 'pending') AND reminder_1h_sent = false;

CREATE INDEX IF NOT EXISTS idx_bookings_followup ON bookings(date, status, followup_sent) 
WHERE status = 'completed' AND followup_sent = false;
