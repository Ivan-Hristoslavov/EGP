const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixInvoicesTable() {
  try {
    console.log('Adding missing fields to invoices table...');
    
    // Try to add the columns using a simple query
    const { error } = await supabase
      .from('invoices')
      .select('manual_service, manual_description')
      .limit(1);

    if (error && error.message.includes('manual_description')) {
      console.log('Columns missing, need to add them...');
      
      // Since we can't use ALTER TABLE directly, let's check what we can do
      console.log('Please run this SQL in your Supabase SQL editor:');
      console.log(`
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS manual_service VARCHAR(255),
ADD COLUMN IF NOT EXISTS manual_description TEXT;

UPDATE invoices 
SET manual_service = COALESCE(manual_service, 'Plumbing Service'),
    manual_description = COALESCE(manual_description, 'Professional plumbing service provided')
WHERE manual_service IS NULL OR manual_description IS NULL;
      `);
    } else {
      console.log('✅ Columns already exist!');
    }

  } catch (error) {
    console.error('Error checking invoices table:', error);
  }
}

fixInvoicesTable(); 