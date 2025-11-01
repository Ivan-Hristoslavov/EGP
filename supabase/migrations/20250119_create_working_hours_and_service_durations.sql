    -- =====================================================
    -- Create Working Hours and Service Durations Tables
    -- =====================================================
    -- This migration ensures working_hours and service_durations tables exist
    -- =====================================================

    -- Enable UUID extension if not already enabled
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- =====================================================
    -- 1. WORKING HOURS TABLE
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

    -- Create indexes for working_hours
    CREATE INDEX IF NOT EXISTS idx_working_hours_day ON working_hours(day_of_week);

    -- =====================================================
    -- 2. SERVICE DURATIONS TABLE
    -- =====================================================
    CREATE TABLE IF NOT EXISTS service_durations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_name VARCHAR(255) NOT NULL UNIQUE,
    duration_minutes INTEGER NOT NULL,
    buffer_minutes INTEGER DEFAULT 15, -- Additional buffer for this service
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create indexes for service_durations
    CREATE INDEX IF NOT EXISTS idx_service_durations_service_name ON service_durations(service_name);

    -- =====================================================
    -- 3. INSERT DEFAULT WORKING HOURS (only if not exists)
    -- =====================================================
    INSERT INTO working_hours (day_of_week, start_time, end_time, is_working_day, buffer_minutes, max_appointments)
    SELECT 0, '10:00', '16:00', false, 15, 0 WHERE NOT EXISTS (SELECT 1 FROM working_hours WHERE day_of_week = 0); -- Sunday - Closed
    INSERT INTO working_hours (day_of_week, start_time, end_time, is_working_day, buffer_minutes, max_appointments)
    SELECT 1, '09:00', '18:00', true, 15, 12 WHERE NOT EXISTS (SELECT 1 FROM working_hours WHERE day_of_week = 1); -- Monday
    INSERT INTO working_hours (day_of_week, start_time, end_time, is_working_day, buffer_minutes, max_appointments)
    SELECT 2, '09:00', '18:00', true, 15, 12 WHERE NOT EXISTS (SELECT 1 FROM working_hours WHERE day_of_week = 2); -- Tuesday
    INSERT INTO working_hours (day_of_week, start_time, end_time, is_working_day, buffer_minutes, max_appointments)
    SELECT 3, '09:00', '18:00', true, 15, 12 WHERE NOT EXISTS (SELECT 1 FROM working_hours WHERE day_of_week = 3); -- Wednesday
    INSERT INTO working_hours (day_of_week, start_time, end_time, is_working_day, buffer_minutes, max_appointments)
    SELECT 4, '09:00', '18:00', true, 15, 12 WHERE NOT EXISTS (SELECT 1 FROM working_hours WHERE day_of_week = 4); -- Thursday
    INSERT INTO working_hours (day_of_week, start_time, end_time, is_working_day, buffer_minutes, max_appointments)
    SELECT 5, '09:00', '18:00', true, 15, 12 WHERE NOT EXISTS (SELECT 1 FROM working_hours WHERE day_of_week = 5); -- Friday
    INSERT INTO working_hours (day_of_week, start_time, end_time, is_working_day, buffer_minutes, max_appointments)
    SELECT 6, '10:00', '16:00', true, 15, 8 WHERE NOT EXISTS (SELECT 1 FROM working_hours WHERE day_of_week = 6); -- Saturday - Shorter hours

    -- =====================================================
    -- 4. ROW LEVEL SECURITY (RLS) POLICIES
    -- =====================================================

    -- Enable RLS on tables
    ALTER TABLE working_hours ENABLE ROW LEVEL SECURITY;
    ALTER TABLE service_durations ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Allow all operations on working_hours" ON working_hours;
    DROP POLICY IF EXISTS "Allow all operations on service_durations" ON service_durations;

    -- Create permissive policies (allow all operations for now)
    CREATE POLICY "Allow all operations on working_hours" ON working_hours FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY "Allow all operations on service_durations" ON service_durations FOR ALL USING (true) WITH CHECK (true);

    -- =====================================================
    -- 5. TRIGGERS FOR UPDATED_AT
    -- =====================================================

    -- Create triggers for updated_at
    CREATE TRIGGER update_working_hours_updated_at 
        BEFORE UPDATE ON working_hours 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_service_durations_updated_at 
        BEFORE UPDATE ON service_durations 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    -- =====================================================
    -- MIGRATION COMPLETED
    -- =====================================================

