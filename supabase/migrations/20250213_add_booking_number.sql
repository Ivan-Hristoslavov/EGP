-- =====================================================
-- Add Booking Number Field to Bookings Table
-- =====================================================
-- This migration adds a readable booking_number field
-- Format: BK-YYYY-NNNN (e.g., BK-2025-0001)
-- =====================================================

-- Add booking_number column
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS booking_number VARCHAR(20) UNIQUE;

-- Create index for booking_number
CREATE INDEX IF NOT EXISTS idx_bookings_booking_number ON bookings(booking_number);

-- Function to generate booking number
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  booking_num TEXT;
BEGIN
  -- Get current year
  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  -- Get the highest sequence number for this year
  SELECT COALESCE(MAX(CAST(SUBSTRING(booking_number FROM 'BK-\d{4}-(\d+)') AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM bookings
  WHERE booking_number LIKE 'BK-' || year_part || '-%';
  
  -- Format: BK-YYYY-NNNN (4 digits for sequence)
  booking_num := 'BK-' || year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN booking_num;
END;
$$ LANGUAGE plpgsql;

-- Update existing bookings to have booking numbers (if they don't have them)
DO $$
DECLARE
  booking_record RECORD;
  new_booking_num TEXT;
BEGIN
  FOR booking_record IN 
    SELECT id, created_at 
    FROM bookings 
    WHERE booking_number IS NULL
    ORDER BY created_at ASC
  LOOP
    new_booking_num := generate_booking_number();
    
    -- Ensure uniqueness (in case of race condition)
    WHILE EXISTS (SELECT 1 FROM bookings WHERE booking_number = new_booking_num) LOOP
      new_booking_num := generate_booking_number();
    END LOOP;
    
    UPDATE bookings 
    SET booking_number = new_booking_num 
    WHERE id = booking_record.id;
  END LOOP;
END $$;

-- Create trigger to auto-generate booking_number on insert
CREATE OR REPLACE FUNCTION set_booking_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booking_number IS NULL THEN
    NEW.booking_number := generate_booking_number();
    
    -- Ensure uniqueness (retry if duplicate)
    WHILE EXISTS (SELECT 1 FROM bookings WHERE booking_number = NEW.booking_number AND id != NEW.id) LOOP
      NEW.booking_number := generate_booking_number();
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS trigger_set_booking_number ON bookings;
CREATE TRIGGER trigger_set_booking_number
  BEFORE INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION set_booking_number();

