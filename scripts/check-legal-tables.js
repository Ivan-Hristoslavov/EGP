const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkLegalTables() {
  console.log('🔍 Checking legal tables...');
  
  const legalTables = ['terms', 'privacy_policy', 'site_guidance'];
  
  for (const tableName of legalTables) {
    console.log(`\n📋 Checking table: ${tableName}`);
    
    try {
      // Try to select from the table
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Table ${tableName} doesn't exist:`, error.message);
      } else {
        console.log(`✅ Table ${tableName} exists and has ${data.length > 0 ? 'data' : 'no data'}`);
        
        // If table exists, show its structure
        if (data.length > 0) {
          console.log(`   Columns: ${Object.keys(data[0]).join(', ')}`);
        }
      }
    } catch (err) {
      console.log(`❌ Error checking ${tableName}:`, err.message);
    }
  }
  
  // Also check what migrations are actually applied
  console.log('\n🔍 Checking current migrations...');
  
  try {
    const { data: migrations, error } = await supabase
      .from('supabase_migrations.schema_migrations')
      .select('*')
      .order('version');
    
    if (error) {
      console.log('❌ Could not fetch migrations:', error.message);
    } else {
      console.log(`✅ Found ${migrations.length} applied migrations`);
      
      // Show only our custom migrations (not system ones)
      const customMigrations = migrations.filter(m => 
        m.version.startsWith('202501') || 
        m.version.startsWith('202412') || 
        m.version.startsWith('202507')
      );
      
      if (customMigrations.length > 0) {
        console.log('\n📋 Custom migrations:');
        customMigrations.forEach(m => {
          console.log(`  - ${m.version}: ${m.name || 'No name'}`);
        });
      }
    }
  } catch (err) {
    console.log('❌ Error checking migrations:', err.message);
  }
}

checkLegalTables(); 