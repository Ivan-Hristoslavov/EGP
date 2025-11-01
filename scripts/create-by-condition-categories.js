/**
 * Script to create BY CONDITION categories in the database
 * Run with: node scripts/create-by-condition-categories.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createByConditionCategories() {
  console.log('🔄 Creating BY CONDITION categories...\n');

  try {
    // First, get the 'by-condition' main tab
    const { data: mainTab, error: mainTabError } = await supabase
      .from('main_tabs')
      .select('id, slug, name')
      .eq('slug', 'by-condition')
      .single();

    if (mainTabError || !mainTab) {
      console.error('❌ Error fetching main_tab:', mainTabError);
      console.error('Make sure the "by-condition" main_tab exists in the database');
      return;
    }

    console.log(`✅ Found main_tab: ${mainTab.name} (${mainTab.slug})`);

    // Create FACE category
    const { data: faceCategory, error: faceError } = await supabase
      .from('service_categories')
      .upsert({
        main_tab_id: mainTab.id,
        slug: 'face',
        name: 'FACE',
        display_order: 1,
        is_active: true,
      }, {
        onConflict: 'main_tab_id,slug'
      })
      .select()
      .single();

    if (faceError) {
      console.error('❌ Error creating FACE category:', faceError);
    } else {
      console.log(`✅ Created/Updated category: ${faceCategory.name}`);
    }

    // Create BODY category
    const { data: bodyCategory, error: bodyError } = await supabase
      .from('service_categories')
      .upsert({
        main_tab_id: mainTab.id,
        slug: 'body',
        name: 'BODY',
        display_order: 2,
        is_active: true,
      }, {
        onConflict: 'main_tab_id,slug'
      })
      .select()
      .single();

    if (bodyError) {
      console.error('❌ Error creating BODY category:', bodyError);
    } else {
      console.log(`✅ Created/Updated category: ${bodyCategory.name}`);
    }

    // Verify the categories were created
    const { data: categories, error: verifyError } = await supabase
      .from('service_categories')
      .select('id, name, slug, is_active')
      .eq('main_tab_id', mainTab.id);

    if (verifyError) {
      console.error('❌ Error verifying categories:', verifyError);
    } else {
      console.log(`\n✅ Success! Created ${categories.length} categories for BY CONDITION:`);
      categories.forEach(cat => {
        console.log(`   - ${cat.name} (${cat.slug}) - Active: ${cat.is_active}`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createByConditionCategories();

