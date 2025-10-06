const { createClient } = require('@supabase/supabase-js');

async function testFixedIssues() {
  console.log('🔧 Тестване на всички коригирани проблеми...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Проверяваме admin_profile структурата
    console.log('👤 Проверка на admin_profile структурата...');
    const { data: adminProfile, error: profileError } = await supabase
      .from('admin_profile')
      .select('*')
      .single();

    if (profileError) {
      console.error('❌ Грешка при извличане на admin_profile:', profileError.message);
    } else {
      console.log('✅ Admin Profile колони:');
      const expectedColumns = ['certifications', 'years_of_experience', 'specializations', 'response_time', 'service_areas', 'terms_and_conditions', 'privacy_policy'];
      expectedColumns.forEach(col => {
        if (adminProfile.hasOwnProperty(col)) {
          console.log(`   ✅ ${col}: ${adminProfile[col] ? 'има стойност' : 'null'}`);
        } else {
          console.log(`   ❌ ${col}: липсва`);
        }
      });
    }

    // 2. Проверяваме gallery таблиците за admin_id
    console.log('\n🖼️ Проверка на gallery таблиците...');
    
    const { data: gallerySections, error: sectionsError } = await supabase
      .from('gallery_sections')
      .select('*')
      .limit(1);

    if (sectionsError) {
      console.error('❌ Gallery sections грешка:', sectionsError.message);
    } else {
      const hasAdminId = gallerySections.length > 0 && gallerySections[0].hasOwnProperty('admin_id');
      console.log(`   Gallery sections admin_id: ${hasAdminId ? '✅' : '❌'}`);
    }

    const { data: gallery, error: galleryError } = await supabase
      .from('gallery')
      .select('*')
      .limit(1);

    if (galleryError) {
      console.error('❌ Gallery грешка:', galleryError.message);
    } else {
      const hasAdminId = gallery.length > 0 ? gallery[0].hasOwnProperty('admin_id') : true; // OK if empty
      console.log(`   Gallery admin_id: ${hasAdminId ? '✅' : '❌'}`);
    }

    // 3. Проверяваме admin_settings записи
    console.log('\n⚙️ Проверка на admin_settings...');
    const { data: settings, error: settingsError } = await supabase
      .from('admin_settings')
      .select('*');

    if (settingsError) {
      console.error('❌ Settings грешка:', settingsError.message);
    } else {
      console.log(`✅ Брой settings записи: ${settings.length}`);
      
      const importantSettings = ['businessPhone', 'vatSettings', 'dayOffSettings', 'businessHours'];
      importantSettings.forEach(key => {
        const setting = settings.find(s => s.key === key);
        console.log(`   ${key}: ${setting ? '✅' : '❌'}`);
      });
    }

    // 4. Тестваме API endpoints
    console.log('\n🌐 Тестване на API endpoints...');

    // Test Profile API
    try {
      const profileResponse = await fetch('http://localhost:3000/api/admin/profile');
      if (profileResponse.ok) {
        console.log('   ✅ GET Profile API');
      } else {
        console.log('   ❌ GET Profile API');
      }
    } catch (err) {
      console.log('   ❌ GET Profile API - network error');
    }

    // Test Settings API
    try {
      const settingsResponse = await fetch('http://localhost:3000/api/admin/settings');
      if (settingsResponse.ok) {
        console.log('   ✅ GET Settings API');
      } else {
        console.log('   ❌ GET Settings API');
      }
    } catch (err) {
      console.log('   ❌ GET Settings API - network error');
    }

    // Test Gallery API
    try {
      const galleryResponse = await fetch('http://localhost:3000/api/gallery');
      if (galleryResponse.ok) {
        console.log('   ✅ GET Gallery API');
      } else {
        console.log('   ❌ GET Gallery API');
      }
    } catch (err) {
      console.log('   ❌ GET Gallery API - network error');
    }

    // Test Gallery Sections API
    try {
      const gallerySectionsResponse = await fetch('http://localhost:3000/api/gallery-sections');
      if (gallerySectionsResponse.ok) {
        console.log('   ✅ GET Gallery Sections API');
      } else {
        console.log('   ❌ GET Gallery Sections API');
      }
    } catch (err) {
      console.log('   ❌ GET Gallery Sections API - network error');
    }

    // Test Areas API
    try {
      const areasResponse = await fetch('http://localhost:3000/api/admin/areas');
      if (areasResponse.ok) {
        console.log('   ✅ GET Areas API');
      } else {
        console.log('   ❌ GET Areas API');
      }
    } catch (err) {
      console.log('   ❌ GET Areas API - network error');
    }

    // 5. Проверяваме VAT настройки
    console.log('\n💰 Проверка на VAT настройки...');
    const vatSetting = settings?.find(s => s.key === 'vatSettings');
    if (vatSetting) {
      const vatData = typeof vatSetting.value === 'string' ? JSON.parse(vatSetting.value) : vatSetting.value;
      console.log(`   VAT Enabled: ${vatData.enabled ? '✅' : '❌ (disabled)'}`);
      console.log(`   VAT Rate: ${vatData.rate}%`);
      console.log(`   VAT Company: ${vatData.companyName || 'N/A'}`);
    } else {
      console.log('   ❌ VAT settings липсват');
    }

    // 6. Проверяваме Day Off настройки
    console.log('\n📅 Проверка на Day Off настройки...');
    const dayOffSetting = settings?.find(s => s.key === 'dayOffSettings');
    if (dayOffSetting) {
      const dayOffData = typeof dayOffSetting.value === 'string' ? JSON.parse(dayOffSetting.value) : dayOffSetting.value;
      console.log(`   Day Off Enabled: ${dayOffData.enabled ? '✅' : '❌ (disabled)'}`);
      console.log(`   Day Off Message: ${dayOffData.message || 'N/A'}`);
    } else {
      console.log('   ❌ Day Off settings липсват');
    }

    console.log('\n🎉 Тестването завършено!');

  } catch (error) {
    console.error('❌ Критична грешка:', error.message);
  }
}

// Зареждаме environment variables
require('dotenv').config({ path: '.env.local' });

// Стартираме теста
testFixedIssues(); 