-- =====================================================
-- Add deposit payment support to bookings
-- =====================================================
-- Migration: 20250223_add_booking_deposit_columns.sql
-- Adds total_amount, amount_paid, payment_type, remaining_amount to bookings.
-- Inserts default deposit_settings into admin_settings.
-- =====================================================

-- Bookings: deposit columns
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS payment_type VARCHAR(20) DEFAULT 'full',
  ADD COLUMN IF NOT EXISTS remaining_amount DECIMAL(10,2);

-- Backfill: existing rows keep amount as both total and paid (full payment)
UPDATE bookings
SET total_amount = amount,
    amount_paid = amount,
    payment_type = 'full',
    remaining_amount = 0
WHERE total_amount IS NULL AND amount IS NOT NULL;

-- Payments: optional payment_type for clarity
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS payment_type VARCHAR(20) DEFAULT 'full';

UPDATE payments SET payment_type = 'full' WHERE payment_type IS NULL;

-- Default deposit settings (admin can change via UI)
INSERT INTO admin_settings (key, value)
VALUES (
  'deposit_settings',
  '{"enabled":false,"type":"percentage","percentage":50,"fixedAmount":null}'::jsonb
)
ON CONFLICT (key) DO NOTHING;

COMMENT ON COLUMN bookings.total_amount IS 'Full booking total before any deposit';
COMMENT ON COLUMN bookings.amount_paid IS 'Amount paid now (deposit or full)';
COMMENT ON COLUMN bookings.payment_type IS 'full or deposit';
COMMENT ON COLUMN bookings.remaining_amount IS 'Balance due on arrival when payment_type=deposit';
