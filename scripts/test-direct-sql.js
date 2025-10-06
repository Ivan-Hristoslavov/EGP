const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDirectSQL() {
  console.log('🔍 Testing direct SQL queries...');
  
  try {
    // Check if tables exist in information_schema
    console.log('\n📋 Checking table existence in information_schema...');
    
    const { data: tables, error: tablesError } = await supabase
      .rpc('exec_sql', {
        sql: `SELECT table_name FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name IN ('terms', 'privacy_policy', 'site_guidance')`
      });
    
    if (tablesError) {
      console.log('❌ Error checking tables:', tablesError);
    } else {
      console.log('✅ Tables found:', tables);
    }
    
    // Try to query each table directly with SQL
    const testTables = ['terms', 'privacy_policy', 'site_guidance'];
    
    for (const table of testTables) {
      console.log(`\n📋 Testing direct query on ${table}...`);
      
      try {
        const { data, error } = await supabase
          .rpc('exec_sql', {
            sql: `SELECT COUNT(*) as count FROM ${table}`
          });
        
        if (error) {
          console.log(`❌ Error querying ${table}:`, error.message);
        } else {
          console.log(`✅ ${table} has ${data[0]?.count || 0} records`);
        }
      } catch (err) {
        console.log(`❌ Exception querying ${table}:`, err.message);
      }
    }
    
  } catch (error) {
    console.error('❌ General error:', error);
  }
}

testDirectSQL(); 