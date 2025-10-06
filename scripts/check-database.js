const { createClient } = require('@supabase/supabase-js');

// Конфигурация за новата база
const SUPABASE_URL = 'https://riwmzezepflpnemylnyr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpd216ZXplcGZscG5lbXlsbnlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NjA0NDQsImV4cCI6MjA2NzIzNjQ0NH0.oWmpFAKAPT5QjVrpCZw0-kgZUtFBNVdM8GqoEtsv-qU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkDatabase() {
  console.log('🔍 Проверка на новата база данни...\n');
  console.log(`📍 URL: ${SUPABASE_URL}`);
  console.log(`🔑 Anon Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
  console.log('');
  
  // Списък на очакваните таблици
  const expectedTables = [
    'admin_profile',
    'admin_settings', 
    'customers',
    'bookings',
    'payments',
    'invoices',
    'day_off_periods',
    'activity_log',
    'pricing_cards',
    'gallery_sections',
    'gallery',
    'reviews',
    'faq',
    'services',
    'admin_areas_cover'
  ];
  
  console.log('📋 Проверяване на таблици...\n');
  
  let existingTables = [];
  let missingTables = [];
  
  for (const tableName of expectedTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`❌ ${tableName} - не съществува`);
          missingTables.push(tableName);
        } else {
          console.log(`⚠️  ${tableName} - грешка: ${error.message}`);
          missingTables.push(tableName);
        }
      } else {
        console.log(`✅ ${tableName} - съществува (${data?.length || 0} записа)`);
        existingTables.push(tableName);
      }
    } catch (err) {
      console.log(`❌ ${tableName} - неочаквана грешка: ${err.message}`);
      missingTables.push(tableName);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 ОБОБЩЕНИЕ');
  console.log('='.repeat(50));
  console.log(`✅ Съществуващи таблици: ${existingTables.length}/${expectedTables.length}`);
  console.log(`❌ Липсващи таблици: ${missingTables.length}/${expectedTables.length}`);
  
  if (existingTables.length > 0) {
    console.log('\n✅ Намерени таблици:');
    existingTables.forEach(table => console.log(`   - ${table}`));
  }
  
  if (missingTables.length > 0) {
    console.log('\n❌ Липсващи таблици:');
    missingTables.forEach(table => console.log(`   - ${table}`));
    
    console.log('\n🔧 ПРЕПОРЪКИ:');
    console.log('1. Отидете в Supabase Dashboard');
    console.log('2. Изберете проекта riwmzezepflpnemylnyr');
    console.log('3. Отидете в SQL Editor');
    console.log('4. Изпълнете SQL кода от scripts/create-tables.js');
  } else {
    console.log('\n🎉 Всички таблици са налични! Базата е готова за използване.');
  }
  
  // Проверяваме дали можем да създадем нова таблица
  console.log('\n🧪 Тестване на write permissions...');
  try {
    const { error: testError } = await supabase
      .from('admin_profile')
      .insert({ 
        name: 'Test User',
        email: 'test@example.com',
        phone: '123456789',
        password: 'test'
      });
    
    if (testError) {
      console.log(`⚠️  Write test failed: ${testError.message}`);
      if (testError.code === 'PGRST116') {
        console.log('   Таблицата admin_profile не съществува');
      }
    } else {
      console.log('✅ Write permissions работят');
      // Изтриваме тестовия запис
      await supabase
        .from('admin_profile')
        .delete()
        .eq('email', 'test@example.com');
    }
  } catch (err) {
    console.log(`❌ Write test error: ${err.message}`);
  }
}

// Изпълнение
checkDatabase().catch(console.error); 