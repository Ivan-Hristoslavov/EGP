const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    console.log('🔧 Applying pricing cards enabled column migration...');

    // Add is_enabled column
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE pricing_cards 
        ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT true;
      `
    });

    if (alterError) {
      console.error('❌ Error adding is_enabled column:', alterError);
      return;
    }

    // Update existing pricing cards to be enabled by default
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE pricing_cards 
        SET is_enabled = true 
        WHERE is_enabled IS NULL;
      `
    });

    if (updateError) {
      console.error('❌ Error updating existing cards:', updateError);
      return;
    }

    // Add trigger for updated_at
    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.triggers 
            WHERE trigger_name = 'update_pricing_cards_updated_at'
          ) THEN
            CREATE TRIGGER update_pricing_cards_updated_at 
            BEFORE UPDATE ON pricing_cards 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
          END IF;
        END $$;
      `
    });

    if (triggerError) {
      console.error('❌ Error creating trigger:', triggerError);
      return;
    }

    console.log('✅ Migration applied successfully!');
    console.log('📋 Changes made:');
    console.log('   - Added is_enabled column to pricing_cards table');
    console.log('   - Set all existing cards to enabled by default');
    console.log('   - Added updated_at trigger for pricing_cards');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

applyMigration(); 