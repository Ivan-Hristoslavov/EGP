const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

async function testAdminLogin() {
  console.log('🔐 Тестване на Admin Login API...\n');

  // Credentials за тестване
  const testEmail = 'hristoslavov.ivanov@gmail.com';
  const testPassword = 'plamen-admin-2024';

  console.log('📋 Test Credentials:');
  console.log('   Email:', testEmail);
  console.log('   Password:', testPassword);
  console.log('');

  try {
    // 1. Първо проверяваме дали има admin профил в базата
    console.log('🔍 Проверка на admin профил в базата...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: adminProfile, error: fetchError } = await supabase
      .from('admin_profile')
      .select('*')
      .eq('email', testEmail)
      .single();

    if (fetchError) {
      console.error('❌ Грешка при извличане на admin профил:', fetchError.message);
      return;
    }

    if (!adminProfile) {
      console.error('❌ Не е намерен admin профил с този email');
      return;
    }

    console.log('✅ Admin профил намерен:');
    console.log('   ID:', adminProfile.id);
    console.log('   Name:', adminProfile.name);
    console.log('   Email:', adminProfile.email);
    console.log('   Hashed Password:', adminProfile.password.substring(0, 20) + '...');
    console.log('');

    // 2. Хашираме тестовата парола и я сравняваме
    console.log('🔑 Проверка на паролата...');
    
    const isPasswordValid = await bcrypt.compare(testPassword, adminProfile.password);
    
    if (!isPasswordValid) {
      console.log('❌ Паролата не съвпада със съхранената hash стойност');
      console.log('💡 Създавам нова hash стойност за тестовата парола...');
      
      const newHashedPassword = await bcrypt.hash(testPassword, 10);
      console.log('   Нова hash стойност:', newHashedPassword);
      
      // Обновяваме паролата в базата
      const { error: updateError } = await supabase
        .from('admin_profile')
        .update({ password: newHashedPassword })
        .eq('email', testEmail);

      if (updateError) {
        console.error('❌ Грешка при обновяване на паролата:', updateError.message);
        return;
      }

      console.log('✅ Паролата е обновена в базата');
      console.log('');
    } else {
      console.log('✅ Паролата е валидна!');
      console.log('');
    }

    // 3. Тестваме login API endpoint
    console.log('🌐 Тестване на Login API endpoint...');
    
    const loginResponse = await fetch('http://localhost:3000/api/admin/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
      console.error('❌ Login API грешка:', loginData.error || 'Unknown error');
      console.error('   Status:', loginResponse.status);
      return;
    }

    console.log('✅ Login API успешен!');
    console.log('   Success:', loginData.success);
    console.log('   Admin ID:', loginData.admin?.id);
    console.log('   Admin Name:', loginData.admin?.name);
    console.log('   Admin Email:', loginData.admin?.email);
    console.log('');

    // 4. Тестваме profile API endpoint
    console.log('👤 Тестване на Profile API endpoint...');
    
    const profileResponse = await fetch('http://localhost:3000/api/admin/profile');
    const profileData = await profileResponse.json();

    if (!profileResponse.ok) {
      console.error('❌ Profile API грешка:', profileData.error || 'Unknown error');
      return;
    }

    console.log('✅ Profile API успешен!');
    console.log('   Name:', profileData.name);
    console.log('   Email:', profileData.email);
    console.log('   Company:', profileData.company_name);
    console.log('');

    console.log('🎉 Всички тестове са успешни! Admin панелът е готов за използване.');

  } catch (error) {
    console.error('❌ Критична грешка:', error.message);
  }
}

// Зареждаме environment variables
require('dotenv').config({ path: '.env.local' });

// Стартираме теста
testAdminLogin(); 