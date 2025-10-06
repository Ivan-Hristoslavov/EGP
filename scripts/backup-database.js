const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// List of tables to backup
const tables = [
  'admin_profile',
  'admin_settings', 
  'customers',
  'bookings',
  'invoices',
  'payments',
  'reviews',
  'services',
  'pricing_cards',
  'gallery',
  'gallery_sections',
  'faq',
  'admin_areas',
  'day_off_periods',
  'working_hours',
  // New legal tables
  'terms',
  'privacy_policy',
  'site_guidance'
];

async function backupDatabase() {
  console.log('🔄 Creating database backup...');
  
  const backupData = {
    timestamp: new Date().toISOString(),
    tables: {}
  };

  try {
    for (const table of tables) {
      try {
        console.log(`📋 Backing up table: ${table}`);
        
        const { data, error } = await supabase
          .from(table)
          .select('*');
        
        if (error) {
          console.log(`⚠️  Table ${table} doesn't exist or has error:`, error.message);
          backupData.tables[table] = { error: error.message };
        } else {
          backupData.tables[table] = {
            count: data.length,
            data: data
          };
          console.log(`✅ Backed up ${data.length} records from ${table}`);
        }
      } catch (err) {
        console.log(`❌ Error backing up ${table}:`, err.message);
        backupData.tables[table] = { error: err.message };
      }
    }

    // Save backup to file
    const backupFileName = `database_backup_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    const backupPath = path.join(__dirname, '..', 'backups', backupFileName);
    
    // Create backups directory if it doesn't exist
    const backupsDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }
    
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    
    console.log(`\n✅ Database backup completed!`);
    console.log(`📁 Backup saved to: ${backupPath}`);
    console.log(`📊 Tables backed up: ${Object.keys(backupData.tables).length}`);
    
    // Summary
    const successfulTables = Object.keys(backupData.tables).filter(
      table => !backupData.tables[table].error
    );
    console.log(`\n📈 Summary:`);
    console.log(`✅ Successful backups: ${successfulTables.length}`);
    console.log(`❌ Failed backups: ${tables.length - successfulTables.length}`);
    
    successfulTables.forEach(table => {
      console.log(`  - ${table}: ${backupData.tables[table].count} records`);
    });

  } catch (error) {
    console.error('❌ Backup failed:', error);
  }
}

backupDatabase(); 