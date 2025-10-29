-- =====================================================
-- EGP Aesthetics - Working Hours & Time Slot Management
-- =====================================================
-- This migration adds working hours management and time slot functionality
-- =====================================================

-- =====================================================
-- WORKING HOURS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS working_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 1=Monday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_working_day BOOLEAN DEFAULT true,
  buffer_minutes INTEGER DEFAULT 15, -- Buffer time between appointments
  max_appointments INTEGER DEFAULT 10, -- Max appointments per day
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure only one record per day
  UNIQUE(day_of_week)
);

-- =====================================================
-- TIME SLOTS TABLE (for caching generated slots)
-- =====================================================
CREATE TABLE IF NOT EXISTS time_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique slots per date/time
  UNIQUE(date, start_time)
);

-- =====================================================
-- SERVICE DURATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS service_durations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_name VARCHAR(255) NOT NULL UNIQUE,
  duration_minutes INTEGER NOT NULL,
  buffer_minutes INTEGER DEFAULT 15, -- Additional buffer for this service
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INSERT DEFAULT WORKING HOURS
-- =====================================================
INSERT INTO working_hours (day_of_week, start_time, end_time, is_working_day, buffer_minutes, max_appointments) VALUES
(0, '10:00', '16:00', false, 15, 0), -- Sunday - Closed
(1, '09:00', '18:00', true, 15, 12), -- Monday
(2, '09:00', '18:00', true, 15, 12), -- Tuesday
(3, '09:00', '18:00', true, 15, 12), -- Wednesday
(4, '09:00', '18:00', true, 15, 12), -- Thursday
(5, '09:00', '18:00', true, 15, 12), -- Friday
(6, '10:00', '16:00', true, 15, 8); -- Saturday - Shorter hours

-- =====================================================
-- INSERT DEFAULT SERVICE DURATIONS
-- =====================================================
INSERT INTO service_durations (service_name, duration_minutes, buffer_minutes) VALUES
('Anti-wrinkle Treatment', 30, 15),
('Lip Enhancement', 45, 15),
('Dermal Fillers', 60, 20),
('Skin Consultation', 30, 10),
('Chemical Peel', 45, 15),
('Botox Treatment', 30, 15),
('Hydrafacial', 60, 15),
('Microneedling', 90, 20),
('Skin Rejuvenation', 45, 15),
('Laser Hair Removal', 30, 10),
('Fat Freezing', 120, 30),
('Baby Botox', 30, 15),
('Profhilo Treatment', 60, 20),
('Deep Cleansing Facial', 45, 15),
('Brightening Treatment', 60, 15),
('Detox Treatment', 45, 15);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_working_hours_day ON working_hours(day_of_week);
CREATE INDEX IF NOT EXISTS idx_time_slots_date ON time_slots(date);
CREATE INDEX IF NOT EXISTS idx_time_slots_available ON time_slots(date, is_available);
CREATE INDEX IF NOT EXISTS idx_service_durations_name ON service_durations(service_name);

-- =====================================================
-- FUNCTIONS FOR TIME SLOT MANAGEMENT
-- =====================================================

-- Function to generate time slots for a specific date
CREATE OR REPLACE FUNCTION generate_time_slots(target_date DATE)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  day_of_week INTEGER;
  working_hour RECORD;
  current_time TIME;
  slot_duration INTERVAL;
  buffer_duration INTERVAL;
  slots_generated INTEGER := 0;
BEGIN
  -- Get day of week (0=Sunday, 1=Monday, etc.)
  day_of_week := EXTRACT(DOW FROM target_date);
  
  -- Get working hours for this day
  SELECT * INTO working_hour 
  FROM working_hours 
  WHERE day_of_week = day_of_week;
  
  -- If no working hours or not a working day, return 0
  IF NOT FOUND OR NOT working_hour.is_working_day THEN
    RETURN 0;
  END IF;
  
  -- Clear existing slots for this date
  DELETE FROM time_slots WHERE date = target_date;
  
  -- Set up durations
  slot_duration := '30 minutes'::INTERVAL; -- Default slot duration
  buffer_duration := (working_hour.buffer_minutes || ' minutes')::INTERVAL;
  
  -- Generate slots
  current_time := working_hour.start_time;
  
  WHILE current_time + slot_duration <= working_hour.end_time LOOP
    INSERT INTO time_slots (date, start_time, end_time, is_available)
    VALUES (
      target_date,
      current_time,
      current_time + slot_duration,
      true
    );
    
    slots_generated := slots_generated + 1;
    current_time := current_time + slot_duration + buffer_duration;
  END LOOP;
  
  RETURN slots_generated;
END;
$$;

-- Function to get available time slots for a date
CREATE OR REPLACE FUNCTION get_available_slots(target_date DATE)
RETURNS TABLE (
  slot_id UUID,
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Generate slots if they don't exist
  IF NOT EXISTS (SELECT 1 FROM time_slots WHERE date = target_date) THEN
    PERFORM generate_time_slots(target_date);
  END IF;
  
  -- Return available slots
  RETURN QUERY
  SELECT 
    ts.id,
    ts.start_time,
    ts.end_time,
    ts.is_available
  FROM time_slots ts
  WHERE ts.date = target_date
    AND ts.is_available = true
  ORDER BY ts.start_time;
END;
$$;

-- Function to book a time slot
CREATE OR REPLACE FUNCTION book_time_slot(
  target_date DATE,
  slot_start_time TIME,
  booking_uuid UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  slot_record RECORD;
BEGIN
  -- Find the slot
  SELECT * INTO slot_record
  FROM time_slots
  WHERE date = target_date 
    AND start_time = slot_start_time
    AND is_available = true;
  
  -- If slot not found or not available, return false
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Book the slot
  UPDATE time_slots
  SET 
    is_available = false,
    booking_id = booking_uuid
  WHERE id = slot_record.id;
  
  RETURN true;
END;
$$;

-- =====================================================
-- RLS POLICIES
-- =====================================================
-- Enable RLS
ALTER TABLE working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_durations ENABLE ROW LEVEL SECURITY;

-- Allow all operations for admin (same as bookings)
CREATE POLICY "Allow all operations on working_hours" ON working_hours FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on time_slots" ON time_slots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on service_durations" ON service_durations FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Uncomment these to verify the setup:

-- Check working hours
-- SELECT day_of_week, start_time, end_time, is_working_day FROM working_hours ORDER BY day_of_week;

-- Generate slots for today
-- SELECT generate_time_slots(CURRENT_DATE);

-- Check available slots for today
-- SELECT * FROM get_available_slots(CURRENT_DATE);

-- Check service durations
-- SELECT service_name, duration_minutes, buffer_minutes FROM service_durations ORDER BY service_name;

-- =====================================================
-- Expected Results:
-- =====================================================
-- 1. 7 working_hours records (one for each day)
-- 2. 16 service_durations records for common treatments
-- 3. Functions for generating and managing time slots
-- 4. Proper indexes for performance
-- 5. RLS policies for security
-- =====================================================
