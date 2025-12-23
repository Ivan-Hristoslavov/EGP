-- =====================================================
-- Make password_hash nullable for newsletter subscribers
-- =====================================================
-- Migration: 20250221_make_password_hash_nullable.sql
-- Allows customers to be created without password (newsletter subscribers)
-- =====================================================

ALTER TABLE customers ALTER COLUMN password_hash DROP NOT NULL;

COMMENT ON COLUMN customers.password_hash IS 'Password hash for customer login. NULL for newsletter subscribers who have not created an account.';




