-- Add missing fields to invoices table
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS manual_service VARCHAR(255),
ADD COLUMN IF NOT EXISTS manual_description TEXT;

-- Update existing invoices to have default values if needed
UPDATE invoices 
SET manual_service = COALESCE(manual_service, 'Plumbing Service'),
    manual_description = COALESCE(manual_description, 'Professional plumbing service provided')
WHERE manual_service IS NULL OR manual_description IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN invoices.manual_service IS 'Manual service description when not linked to a booking';
COMMENT ON COLUMN invoices.manual_description IS 'Detailed manual description of services provided'; 