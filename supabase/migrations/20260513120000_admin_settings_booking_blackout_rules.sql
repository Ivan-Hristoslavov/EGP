-- Date-range blackouts for online booking (optional per-weekday within range).
-- Managed from Admin → Schedule & closures → Working hours via bookingBlackoutRules in API body.
INSERT INTO admin_settings (key, value, updated_at)
VALUES ('booking_blackout_rules', '[]'::jsonb, NOW())
ON CONFLICT (key) DO NOTHING;
