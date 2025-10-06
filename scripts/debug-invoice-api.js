require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugInvoiceAPI() {
  console.log('🔍 Debugging Invoice API...\n');

  try {
    // Create a test customer first
    console.log('👤 Creating test customer...');
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert([{
        name: 'Debug Customer',
        email: 'debug@example.com',
        phone: '+44 7700 123456',
        address: '123 Debug Street, London',
        customer_type: 'individual'
      }])
      .select()
      .single();

    if (customerError) {
      console.error('❌ Error creating customer:', customerError);
      return;
    }

    console.log('✅ Test customer created:', customer.id);

    // Create a test booking
    console.log('📅 Creating test booking...');
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([{
        customer_name: 'Debug Customer',
        customer_email: 'debug@example.com',
        customer_phone: '+44 7700 123456',
        service: 'Debug Service',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        status: 'completed',
        payment_status: 'paid',
        amount: 100
      }])
      .select()
      .single();

    if (bookingError) {
      console.error('❌ Error creating booking:', bookingError);
      return;
    }

    console.log('✅ Test booking created:', booking.id);

    // Test invoice creation without images first
    console.log('\n🧪 Testing invoice creation WITHOUT images...');
    
    const FormData = require('form-data');
    const formData = new FormData();
    
    formData.append('customer_id', customer.id);
    formData.append('booking_id', booking.id);
    formData.append('invoice_date', new Date().toISOString().split('T')[0]);
    formData.append('due_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    formData.append('subtotal', '100');
    formData.append('vat_rate', '20');
    formData.append('vat_amount', '20');
    formData.append('total_amount', '120');
    formData.append('status', 'pending');
    formData.append('company_name', 'Debug Company');
    formData.append('company_address', 'Debug Address');
    formData.append('company_phone', 'Debug Phone');
    formData.append('company_email', 'debug@example.com');
    formData.append('notes', 'Debug invoice without images');

    console.log('📤 Sending request to API (no images)...');
    const response1 = await fetch('http://localhost:3001/api/invoices', {
      method: 'POST',
      body: formData
    });

    console.log('📊 Response status:', response1.status);
    
    if (response1.ok) {
      const result = await response1.json();
      console.log('✅ Invoice created successfully (no images)!');
      console.log('📄 Invoice number:', result.invoice_number);
      console.log('🆔 Invoice ID:', result.id);
    } else {
      const errorText = await response1.text();
      console.error('❌ API request failed (no images):', errorText);
    }

    // Now test with a simple image
    console.log('\n🧪 Testing invoice creation WITH simple image...');
    
    const formData2 = new FormData();
    formData2.append('customer_id', customer.id);
    formData2.append('booking_id', booking.id);
    formData2.append('invoice_date', new Date().toISOString().split('T')[0]);
    formData2.append('due_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    formData2.append('subtotal', '100');
    formData2.append('vat_rate', '20');
    formData2.append('vat_amount', '20');
    formData2.append('total_amount', '120');
    formData2.append('status', 'pending');
    formData2.append('company_name', 'Debug Company');
    formData2.append('company_address', 'Debug Address');
    formData2.append('company_phone', 'Debug Phone');
    formData2.append('company_email', 'debug@example.com');
    formData2.append('notes', 'Debug invoice with simple image');
    
    // Add a very small test image
    const testImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    formData2.append('images', testImageData, {
      filename: 'debug-test.png',
      contentType: 'image/png'
    });

    console.log('📤 Sending request to API (with image)...');
    const response2 = await fetch('http://localhost:3001/api/invoices', {
      method: 'POST',
      body: formData2
    });

    console.log('📊 Response status:', response2.status);
    
    if (response2.ok) {
      const result = await response2.json();
      console.log('✅ Invoice created successfully (with image)!');
      console.log('📄 Invoice number:', result.invoice_number);
      console.log('🆔 Invoice ID:', result.id);
      
      if (result.image_attachments) {
        const attachments = JSON.parse(result.image_attachments);
        console.log('🖼️ Images attached:', attachments.length);
      } else {
        console.log('❌ No image attachments found');
      }
    } else {
      const errorText = await response2.text();
      console.error('❌ API request failed (with image):', errorText);
    }

    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await supabase.from('invoices').delete().eq('customer_id', customer.id);
    await supabase.from('bookings').delete().eq('id', booking.id);
    await supabase.from('customers').delete().eq('id', customer.id);
    console.log('✅ Test data cleaned up');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

debugInvoiceAPI(); 