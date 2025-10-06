require('dotenv').config({ path: '.env.local' });

async function testSimpleAPI() {
  console.log('🧪 Testing Simple API Route...\n');

  try {
    const FormData = require('form-data');
    const formData = new FormData();
    
    formData.append('test', 'value');

    console.log('📤 Sending request to simple API...');
    const response = await fetch('http://localhost:3001/api/invoices/simple', {
      method: 'POST',
      body: formData
    });

    console.log('📊 Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Simple API test successful!');
      console.log('📄 Response:', result);
    } else {
      const errorText = await response.text();
      console.error('❌ Simple API test failed:', errorText);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testSimpleAPI(); 