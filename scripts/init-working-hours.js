const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://riwmzezepflpnemylnyr.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpd216ZXplcGZscG5lbXlsbnlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NjA0NDQsImV4cCI6MjA2NzIzNjQ0NH0.oWmpFAKAPT5QjVrpCZw0-kgZUtFBNVdM8GqoEtsv-qU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function initWorkingHours() {
  try {
    console.log('Initializing working hours settings...');

    const defaultSettings = [
      { key: 'workingHoursStart', value: '"08:00"' },
      { key: 'workingHoursEnd', value: '"18:00"' },
      { key: 'workingDays', value: '["monday", "tuesday", "wednesday", "thursday", "friday"]' },
      { key: 'responseTime', value: '"45 minutes"' },
      { key: 'emergencyRate', value: '"150"' },
      { key: 'standardRate', value: '"75"' },
      { key: 'dayOffEnabled', value: 'false' },
      { key: 'dayOffMessage', value: '"Limited service hours today. Emergency services available 24/7."' },
      { key: 'dayOffStartDate', value: '""' },
      { key: 'dayOffEndDate', value: '""' },
      { key: 'emailNotifications', value: 'true' },
      { key: 'smsNotifications', value: 'false' },
      { key: 'autoConfirmBookings', value: 'false' },
      { key: 'vatEnabled', value: 'false' },
      { key: 'vatRate', value: '20' },
      { key: 'vatCompanyName', value: '""' },
      { key: 'gasSafeRegistered', value: 'true' },
      { key: 'gasSafeNumber', value: '"123456"' },
      { key: 'fullyInsured', value: 'true' },
      { key: 'insuranceProvider', value: '"Professional Indemnity Insurance"' },
      { key: 'companyStatus', value: '"Ltd"' }
    ];

    for (const setting of defaultSettings) {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          key: setting.key,
          value: setting.value
        }, {
          onConflict: 'key'
        });

      if (error) {
        console.error(`Error inserting ${setting.key}:`, error);
      } else {
        console.log(`✅ ${setting.key} initialized`);
      }
    }

    console.log('✅ Working hours initialization complete!');
  } catch (error) {
    console.error('Error initializing working hours:', error);
  }
}

initWorkingHours(); 