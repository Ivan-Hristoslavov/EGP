const { createClient } = require('@supabase/supabase-js');

async function testAllAdminAPIs() {
  console.log('🔧 Тестване на всички Admin API endpoints...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Проверяваме структурата на admin_profile таблицата
    console.log('📋 Проверка на структурата на admin_profile таблицата...');
    
    const { data: adminProfile, error: profileError } = await supabase
      .from('admin_profile')
      .select('*')
      .limit(1)
      .single();

    if (profileError) {
      console.error('❌ Грешка при извличане на admin_profile:', profileError.message);
      return;
    }

    console.log('✅ Admin Profile структура:');
    Object.keys(adminProfile).forEach(key => {
      console.log(`   ${key}: ${typeof adminProfile[key]} = ${String(adminProfile[key]).substring(0, 50)}${String(adminProfile[key]).length > 50 ? '...' : ''}`);
    });
    console.log('');

    // 2. Тестваме GET /api/admin/profile
    console.log('👤 Тестване на GET /api/admin/profile...');
    try {
      const profileResponse = await fetch('http://localhost:3000/api/admin/profile');
      const profileData = await profileResponse.json();
      
      if (profileResponse.ok) {
        console.log('✅ GET Profile успешен');
      } else {
        console.error('❌ GET Profile грешка:', profileData.error);
      }
    } catch (err) {
      console.error('❌ GET Profile network грешка:', err.message);
    }

    // 3. Тестваме PUT /api/admin/profile с валидни полета
    console.log('📝 Тестване на PUT /api/admin/profile...');
    
    const validProfileData = {
      name: adminProfile.name,
      email: adminProfile.email,
      phone: adminProfile.phone,
      company_name: adminProfile.company_name || '',
      company_address: adminProfile.company_address || '',
      about: adminProfile.about || '',
      bank_name: adminProfile.bank_name || '',
      account_number: adminProfile.account_number || '',
      sort_code: adminProfile.sort_code || '',
      gas_safe_number: adminProfile.gas_safe_number || '',
      insurance_provider: adminProfile.insurance_provider || ''
    };

    try {
      const updateResponse = await fetch('http://localhost:3000/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validProfileData)
      });
      
      const updateData = await updateResponse.json();
      
      if (updateResponse.ok) {
        console.log('✅ PUT Profile успешен');
      } else {
        console.error('❌ PUT Profile грешка:', updateData.error);
      }
    } catch (err) {
      console.error('❌ PUT Profile network грешка:', err.message);
    }

    // 4. Тестваме GET /api/admin/settings
    console.log('⚙️ Тестване на GET /api/admin/settings...');
    try {
      const settingsResponse = await fetch('http://localhost:3000/api/admin/settings');
      const settingsData = await settingsResponse.json();
      
      if (settingsResponse.ok) {
        console.log('✅ GET Settings успешен');
        console.log('   Брой настройки:', Object.keys(settingsData).length);
      } else {
        console.error('❌ GET Settings грешка:', settingsData.error);
      }
    } catch (err) {
      console.error('❌ GET Settings network грешка:', err.message);
    }

    // 5. Тестваме PUT /api/admin/settings
    console.log('📝 Тестване на PUT /api/admin/settings...');
    const testSettings = {
      dayOffSettings: {
        enabled: false,
        message: "Test maintenance message",
        showBanner: false
      }
    };

    try {
      const updateSettingsResponse = await fetch('http://localhost:3000/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testSettings)
      });
      
      const updateSettingsData = await updateSettingsResponse.json();
      
      if (updateSettingsResponse.ok) {
        console.log('✅ PUT Settings успешен');
      } else {
        console.error('❌ PUT Settings грешка:', updateSettingsData.error);
      }
    } catch (err) {
      console.error('❌ PUT Settings network грешка:', err.message);
    }

    // 6. Тестваме други API endpoints
    const endpoints = [
      { name: 'Areas', url: '/api/admin/areas' },
      { name: 'FAQ', url: '/api/faq' },
      { name: 'Services', url: '/api/services' },
      { name: 'Gallery', url: '/api/gallery' },
      { name: 'Reviews', url: '/api/reviews' },
      { name: 'Customers', url: '/api/customers' },
      { name: 'Bookings', url: '/api/bookings' },
      { name: 'Invoices', url: '/api/invoices' }
    ];

    console.log('🌐 Тестване на други API endpoints...');
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://localhost:3000${endpoint.url}`);
        const data = await response.json();
        
        if (response.ok) {
          console.log(`✅ ${endpoint.name}: успешен`);
        } else {
          console.error(`❌ ${endpoint.name}: ${data.error || 'Unknown error'}`);
        }
      } catch (err) {
        console.error(`❌ ${endpoint.name}: network грешка - ${err.message}`);
      }
    }

    // 7. Проверяваме admin_settings структурата
    console.log('\n📊 Проверка на admin_settings таблицата...');
    const { data: settings, error: settingsError } = await supabase
      .from('admin_settings')
      .select('*');

    if (settingsError) {
      console.error('❌ Грешка при извличане на settings:', settingsError.message);
    } else {
      console.log('✅ Admin Settings записи:');
      settings.forEach((setting, index) => {
        console.log(`   ${index + 1}. ${setting.key}: ${JSON.stringify(setting.value).substring(0, 100)}...`);
      });
    }

  } catch (error) {
    console.error('❌ Критична грешка:', error.message);
  }
}

// Зареждаме environment variables
require('dotenv').config({ path: '.env.local' });

// Стартираме теста
testAllAdminAPIs(); 