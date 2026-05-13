-- Default empty list: weekdays 0–6 where online /book flow is forced closed (overlay on business_hours).
-- Managed from Admin → Working hours (Save) via bookingClosedWeekdays in API body.
INSERT INTO admin_settings (key, value, updated_at)
VALUES ('booking_closed_weekdays', '[]'::jsonb, NOW())
ON CONFLICT (key) DO NOTHING;
