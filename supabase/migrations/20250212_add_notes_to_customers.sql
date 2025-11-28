-- =====================================================
-- Add Notes Column to Customers Table
-- =====================================================
-- This migration adds the missing notes column to customers table
-- =====================================================

-- Add notes column to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add comment to the column
COMMENT ON COLUMN customers.notes IS 'Additional notes about the customer';
