-- =====================================================
-- Fix Customers Table RLS Policy for Test Bookings
-- =====================================================
-- This migration fixes RLS policies to allow test customer creation
-- =====================================================

-- Drop existing RLS policies for customers table if they exist
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable read access for all users" ON customers;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON customers;
DROP POLICY IF EXISTS "Enable update for users based on email" ON customers;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON customers;

-- Disable RLS temporarily to allow operations
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create new permissive policies for customers table
-- Allow all operations for service role (used by API)
CREATE POLICY "Allow all operations for service role" ON customers
  FOR ALL 
  TO service_role
  USING (true) 
  WITH CHECK (true);

-- Allow authenticated users to read all customers (for admin panel)
CREATE POLICY "Allow read for authenticated users" ON customers
  FOR SELECT 
  TO authenticated
  USING (true);

-- Allow authenticated users to insert customers (for bookings)
CREATE POLICY "Allow insert for authenticated users" ON customers
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update customers (for admin panel)
CREATE POLICY "Allow update for authenticated users" ON customers
  FOR UPDATE 
  TO authenticated
  USING (true) 
  WITH CHECK (true);

-- Allow authenticated users to delete customers (for admin panel)
CREATE POLICY "Allow delete for authenticated users" ON customers
  FOR DELETE 
  TO authenticated
  USING (true);

-- Allow anonymous users to insert customers (for public bookings)
CREATE POLICY "Allow anonymous insert for bookings" ON customers
  FOR INSERT 
  TO anon
  WITH CHECK (true);
