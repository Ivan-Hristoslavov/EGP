-- =====================================================
-- Make password_hash nullable (newsletter subscribers)
-- =====================================================
-- Run this in Supabase SQL Editor if newsletter signup fails with:
-- "null value in column password_hash of relation customers violates not-null constraint"
-- =====================================================

ALTER TABLE customers ALTER COLUMN password_hash DROP NOT NULL;

COMMENT ON COLUMN customers.password_hash IS 'Password hash for customer login. NULL for newsletter subscribers who have not created an account.';
