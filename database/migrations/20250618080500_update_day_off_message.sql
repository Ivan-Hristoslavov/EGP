-- Update existing day off messages to use the new text
UPDATE admin_settings 
SET value = jsonb_set(
  value::jsonb, 
  '{message}', 
  '"Limited service hours today. Emergency services available 24/7."'
)
WHERE key = 'dayOffSettings' 
AND value::jsonb->>'message' LIKE '%We are currently closed%'
OR value::jsonb->>'message' LIKE '%We are currently on holiday%'
OR value::jsonb->>'message' LIKE '%Emergency services are still available%';

-- Also clean up any old demo messages that might still exist
UPDATE admin_settings 
SET value = jsonb_set(
  value::jsonb, 
  '{message}', 
  '"Limited service hours today. Emergency services available 24/7."'
)
WHERE key = 'dayOffSettings' 
AND (
  value::jsonb->>'message' = 'We are currently closed. Emergency services are still available. Please call for urgent matters.'
  OR value::jsonb->>'message' = 'We are currently on holiday. Emergency services are still available.'
  OR value::jsonb->>'message' = 'We are currently closed for maintenance'
  OR value::jsonb->>'message' = 'We are currently closed for maintenance. Emergency services are still available.'
);
