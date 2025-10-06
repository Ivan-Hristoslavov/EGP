const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTablesDirectly() {
  console.log('🔧 Creating tables directly...');
  
  try {
    // First, let's try to see what tables exist
    console.log('📋 Trying to list existing tables...');
    
    const { data: existingTables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (error) {
      console.log('❌ Cannot access information_schema:', error.message);
    } else {
      console.log('✅ Found tables:', existingTables?.map(t => t.table_name) || []);
    }
    
    // Try to create tables by inserting data (this should fail if tables don't exist)
    console.log('\n📋 Trying to create terms table by inserting data...');
    
    const { data: termsData, error: termsError } = await supabase
      .from('terms')
      .insert([{ content: 'Test content' }])
      .select();
    
    if (termsError) {
      console.log('❌ Terms table error:', termsError.message);
      console.log('❌ Code:', termsError.code);
    } else {
      console.log('✅ Terms table works! Data:', termsData);
    }
    
    // Try privacy_policy
    console.log('\n📋 Trying privacy_policy table...');
    
    const { data: privacyData, error: privacyError } = await supabase
      .from('privacy_policy')
      .insert([{ content: 'Test content' }])
      .select();
    
    if (privacyError) {
      console.log('❌ Privacy policy table error:', privacyError.message);
      console.log('❌ Code:', privacyError.code);
    } else {
      console.log('✅ Privacy policy table works! Data:', privacyData);
    }
    
    // Try site_guidance
    console.log('\n📋 Trying site_guidance table...');
    
    const { data: guidanceData, error: guidanceError } = await supabase
      .from('site_guidance')
      .insert([{ 
        title: 'Test Guide',
        content: 'Test content',
        category: 'test',
        sort_order: 1
      }])
      .select();
    
    if (guidanceError) {
      console.log('❌ Site guidance table error:', guidanceError.message);
      console.log('❌ Code:', guidanceError.code);
    } else {
      console.log('✅ Site guidance table works! Data:', guidanceData);
    }
    
    // Now try to read from the tables
    console.log('\n📋 Trying to read from tables...');
    
    const { data: readTerms, error: readTermsError } = await supabase
      .from('terms')
      .select('*');
    
    if (readTermsError) {
      console.log('❌ Cannot read terms:', readTermsError.message);
    } else {
      console.log('✅ Terms read successfully:', readTerms?.length || 0, 'records');
    }
    
  } catch (error) {
    console.error('❌ General error:', error);
  }
}

createTablesDirectly(); 