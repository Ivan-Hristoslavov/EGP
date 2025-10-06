-- Clean up old day off settings format
-- Remove individual day off settings that are now stored as JSON in dayOffSettings

DELETE FROM admin_settings 
WHERE key IN ('dayOffEnabled', 'dayOffMessage', 'dayOffStartDate', 'dayOffEndDate');

-- Ensure dayOffSettings exists with proper default values if not already present
INSERT INTO admin_settings (key, value) 
VALUES ('dayOffSettings', '{
  "enabled": false,
  "message": "We are currently closed for maintenance. Emergency services are still available.",
  "startDate": "",
  "endDate": "",
  "showOnAllPages": true
}'::jsonb)
ON CONFLICT (key) DO NOTHING;
