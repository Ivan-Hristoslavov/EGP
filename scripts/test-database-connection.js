const { createClient } = require('@supabase/supabase-js');

async function testDatabaseConnection() {
  console.log('🔍 Тестване на връзката с Supabase базата данни...\n');

  // Проверяваме дали имаме environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Липсват environment variables:');
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
    console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅' : '❌');
    console.error('\nМоля, създайте .env.local файл с правилните стойности.');
    return;
  }

  console.log('📋 Конфигурация:');
  console.log('   Supabase URL:', supabaseUrl);
  console.log('   Supabase Key:', supabaseKey.substring(0, 20) + '...');
  console.log('');

  try {
    // Създаваме Supabase клиент
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔌 Опит за свързване...');

    // Тестваме връзката чрез прост query
    const { data: testData, error: testError } = await supabase
      .from('admin_profile')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ Грешка при свързване:', testError.message);
      
      if (testError.message.includes('relation "admin_profile" does not exist')) {
        console.log('💡 Таблицата admin_profile не съществува - базата е празна');
      }
      
      return;
    }

    console.log('✅ Връзката е успешна!');
    console.log('');

    // Извличаме информация за базата
    console.log('📊 Информация за базата данни:');
    
    // Проверяваме различни таблици
    const tables = [
      'admin_profile',
      'admin_settings', 
      'pricing_cards',
      'gallery',
      'gallery_sections',
      'reviews',
      'faq',
      'customers',
      'bookings',
      'invoices',
      'payments',
      'services',
      'areas'
    ];

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.log(`   ${table}: ❌ ${error.message}`);
        } else {
          console.log(`   ${table}: ✅ ${count} записа`);
        }
      } catch (err) {
        console.log(`   ${table}: ❌ ${err.message}`);
      }
    }

    console.log('');

    // Проверяваме функции
    console.log('🔧 Проверка на функции:');
    
    try {
      const { data: invoiceNumber, error: invoiceError } = await supabase
        .rpc('generate_invoice_number');

      if (invoiceError) {
        console.log('   generate_invoice_number: ❌', invoiceError.message);
      } else {
        console.log('   generate_invoice_number: ✅', invoiceNumber);
      }
    } catch (err) {
      console.log('   generate_invoice_number: ❌', err.message);
    }

    // Проверяваме настройките
    console.log('');
    console.log('⚙️ Проверка на настройки:');
    
    try {
      const { data: settings, error: settingsError } = await supabase
        .from('admin_settings')
        .select('*')
        .single();

      if (settingsError) {
        console.log('   admin_settings: ❌', settingsError.message);
      } else {
        console.log('   admin_settings: ✅');
        console.log('      VAT Enabled:', settings.vat_enabled);
        console.log('      VAT Rate:', settings.vat_rate + '%');
        console.log('      Company Name:', settings.company_name);
      }
    } catch (err) {
      console.log('   admin_settings: ❌', err.message);
    }

    // Извличаме информация за проекта от URL
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    if (projectRef) {
      console.log('');
      console.log('🏗️ Информация за проекта:');
      console.log('   Project Reference:', projectRef);
      console.log('   Database URL:', supabaseUrl);
      console.log('   Dashboard URL:', `https://supabase.com/dashboard/project/${projectRef}`);
    }

  } catch (error) {
    console.error('❌ Критична грешка:', error.message);
  }
}

// Зареждаме environment variables
require('dotenv').config({ path: '.env.local' });

// Стартираме теста
testDatabaseConnection(); 