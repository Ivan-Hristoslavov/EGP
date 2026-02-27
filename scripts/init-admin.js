/**
 * Initialize or update admin profile in the database.
 * Admin credentials are stored only in the DB - no env vars for password.
 *
 * Usage:
 *   node scripts/init-admin.js <email> <password> [name]
 *
 * Examples:
 *   node scripts/init-admin.js admin@egpaesthetics.co.uk MySecurePass123
 *   node scripts/init-admin.js admin@egpaesthetics.co.uk MySecurePass123 "Admin User"
 *
 * Required env (DB only): NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const [email, password, name] = process.argv.slice(2);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing DB env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

if (!email || !password) {
  console.error('Usage: node scripts/init-admin.js <email> <password> [name]');
  console.error('Example: node scripts/init-admin.js admin@egpaesthetics.co.uk MySecurePass123 "Admin User"');
  process.exit(1);
}

const adminEmail = email.trim();
const adminPassword = password;
const adminName = (name || 'Admin').trim();

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function initializeAdmin() {
  try {
    console.log('🔧 Initializing admin profile (DB only, no env credentials)...');
    console.log('🔐 Hashing password...');

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const { data: existingProfile, error: fetchError } = await supabase
      .from('admin_profile')
      .select('id, email, name')
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error('❌ Error checking admin profile:', fetchError);
      process.exit(1);
    }

    if (existingProfile) {
      const { error: updateError } = await supabase
        .from('admin_profile')
        .update({
          name: adminName,
          email: adminEmail,
          business_email: adminEmail,
          password: hashedPassword,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingProfile.id);

      if (updateError) {
        console.error('❌ Error updating admin profile:', updateError);
        process.exit(1);
      }
      console.log('✅ Admin profile updated successfully!');
    } else {
      const { error: insertError } = await supabase
        .from('admin_profile')
        .insert([{
          name: adminName,
          email: adminEmail,
          business_email: adminEmail,
          password: hashedPassword,
          phone: process.env.NEXT_PUBLIC_PHONE_NUMBER || '07944 24 20 79',
          company_address: 'London, UK',
        }]);

      if (insertError) {
        console.error('❌ Error creating admin profile:', insertError);
        process.exit(1);
      }
      console.log('✅ Admin profile created successfully!');
    }

    console.log(`📧 Email: ${adminEmail}`);
    console.log(`👤 Name: ${adminName}`);
    console.log('🔐 Password hashed and stored in DB');
    console.log('\n🚀 Login at /admin/login');
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

initializeAdmin();
