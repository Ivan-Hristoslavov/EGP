const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: './ui/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
const adminName = process.env.ADMIN_NAME;

if (!supabaseUrl || !supabaseKey || !adminEmail || !adminPassword || !adminName) {
  console.error('Missing required environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function initializeAdmin() {
  try {
    console.log('🔧 Initializing admin profile...');
    console.log('🔐 Hashing password...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Check if admin profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('admin_profile')
      .select('*')
      .limit(1);

    if (fetchError) {
      console.error('❌ Error checking admin profile:', fetchError);
      return;
    }

    if (existingProfile && existingProfile.length > 0) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('admin_profile')
        .update({
          name: adminName,
          email: adminEmail,
          password: hashedPassword,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProfile[0].id);

      if (updateError) {
        console.error('❌ Error updating admin profile:', updateError);
      } else {
        console.log('✅ Admin profile updated successfully!');
        console.log(`📧 Email: ${adminEmail}`);
        console.log(`👤 Name: ${adminName}`);
        console.log('🔐 Password has been securely hashed');
      }
    } else {
      // Create new profile
      const { error: insertError } = await supabase
        .from('admin_profile')
        .insert([{
          name: adminName,
          email: adminEmail,
          password: hashedPassword,
          phone: process.env.NEXT_PUBLIC_PHONE_NUMBER || '07944 24 20 79',
          company_address: 'London, UK'
        }]);

      if (insertError) {
        console.error('❌ Error creating admin profile:', insertError);
      } else {
        console.log('✅ Admin profile created successfully!');
        console.log(`📧 Email: ${adminEmail}`);
        console.log(`👤 Name: ${adminName}`);
        console.log('🔐 Password has been securely hashed');
      }
    }

    console.log('\n🚀 Admin setup complete! You can now login at /admin/login');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

initializeAdmin(); 