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
    
    // Add the missing columns
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE invoices 
        ADD COLUMN IF NOT EXISTS manual_service VARCHAR(255),
        ADD COLUMN IF NOT EXISTS manual_description TEXT;
      `
    });

    if (alterError) {
      console.error('Error adding columns:', alterError);
      return;
    }

    // Update existing records with default values
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE invoices 
        SET manual_service = COALESCE(manual_service, 'Plumbing Service'),
            manual_description = COALESCE(manual_description, 'Professional plumbing service provided')
        WHERE manual_service IS NULL OR manual_description IS NULL;
      `
    });

    if (updateError) {
      console.error('Error updating records:', updateError);
      return;
    }

    console.log('✅ Successfully added manual_service and manual_description fields to invoices table');
    
    // Verify the changes
    const { data: columns, error: describeError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'invoices' 
        AND column_name IN ('manual_service', 'manual_description');
      `
    });

    if (describeError) {
      console.error('Error verifying columns:', describeError);
    } else {
      console.log('✅ Verified columns:', columns);
    }

  } catch (error) {
    console.error('Error fixing invoices table:', error);
  }
}

fixInvoicesTable(); 