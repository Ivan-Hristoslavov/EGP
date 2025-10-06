const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Конфигурация за новата база
const SUPABASE_URL = 'https://riwmzezepflpnemylnyr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpd216ZXplcGZscG5lbXlsbnlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NjA0NDQsImV4cCI6MjA2NzIzNjQ0NH0.oWmpFAKAPT5QjVrpCZw0-kgZUtFBNVdM8GqoEtsv-qU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function executeSQLFile() {
  console.log('🚀 Пушване на базата данни в Supabase...\n');
  console.log(`📍 URL: ${SUPABASE_URL}`);
  console.log(`📋 Schema: public`);
  console.log('');
  
  try {
    // Четем SQL файла
    const sqlFilePath = path.join(__dirname, '..', 'complete-schema.sql');
    console.log('📖 Четене на SQL файла...');
    const sqlContent = await fs.readFile(sqlFilePath, 'utf8');
    console.log(`✅ SQL файлът е прочетен (${sqlContent.length} символа)`);
    
    // Разделяме SQL на отделни заявки
    console.log('🔧 Разделяне на SQL заявки...');
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && stmt !== 'SELECT \'Database schema created successfully! All tables, functions, triggers, and sample data have been set up.\' as result');
    
    console.log(`📝 Намерени ${statements.length} SQL заявки за изпълнение\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Изпълняваме заявките една по една
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Пропускаме коментари и празни редове
      if (statement.startsWith('--') || statement.trim() === '') {
        continue;
      }
      
      console.log(`📝 Изпълняване на заявка ${i + 1}/${statements.length}...`);
      
      // Показваме първите 50 символа от заявката за debug
      const preview = statement.substring(0, 50).replace(/\s+/g, ' ');
      console.log(`   ${preview}${statement.length > 50 ? '...' : ''}`);
      
      try {
        // Опитваме се да изпълним заявката чрез PostgREST
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'apikey': SUPABASE_ANON_KEY
          },
          body: JSON.stringify({ sql_query: statement })
        });
        
        if (response.ok) {
          console.log(`   ✅ Успешно`);
          successCount++;
        } else {
          const errorText = await response.text();
          console.log(`   ❌ Грешка: ${errorText}`);
          errorCount++;
          
          // Ако грешката е за липсваща функция, опитваме се с друг подход
          if (errorText.includes('exec_sql')) {
            console.log('   🔄 Опитваме алтернативен подход...');
            
            // Опитваме се да изпълним заявката директно чрез Supabase клиента
            try {
              if (statement.toUpperCase().includes('CREATE TABLE')) {
                console.log('   ⚠️  CREATE TABLE заявка - трябва да се изпълни в SQL Editor');
              } else if (statement.toUpperCase().includes('INSERT')) {
                console.log('   ⚠️  INSERT заявка - трябва да се изпълни в SQL Editor');
              }
            } catch (altError) {
              console.log(`   ❌ Алтернативният подход също не работи: ${altError.message}`);
            }
          }
        }
      } catch (error) {
        console.log(`   ❌ Неочаквана грешка: ${error.message}`);
        errorCount++;
      }
      
      // Малка пауза между заявките
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 ОБОБЩЕНИЕ НА ИЗПЪЛНЕНИЕТО');
    console.log('='.repeat(50));
    console.log(`✅ Успешни заявки: ${successCount}`);
    console.log(`❌ Неуспешни заявки: ${errorCount}`);
    console.log(`📋 Общо заявки: ${statements.length}`);
    
    if (errorCount > 0) {
      console.log('\n⚠️  ВАЖНО: Има грешки при изпълнението!');
      console.log('🔧 РЕШЕНИЕ:');
      console.log('1. Отидете в Supabase Dashboard');
      console.log('2. Изберете проекта riwmzezepflpnemylnyr');
      console.log('3. Отидете в SQL Editor');
      console.log('4. Копирайте и изпълнете съдържанието на complete-schema.sql');
      console.log('5. Кликнете "Run" за да изпълните всички заявки наведнъж');
    } else {
      console.log('\n🎉 Всички заявки са изпълнени успешно!');
      console.log('📋 Базата данни е готова за използване.');
    }
    
  } catch (error) {
    console.error('❌ Критична грешка:', error);
  }
}

// Изпълнение
executeSQLFile().catch(console.error); 