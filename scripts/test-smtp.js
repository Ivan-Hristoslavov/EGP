const nodemailer = require('nodemailer');

// SMTP Configuration for SendGrid
const smtpConfig = {
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  auth: {
    user: 'apikey',
    pass: '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'
  }
};

async function testSMTP() {
  console.log('Testing SendGrid SMTP connection...');
  
  try {
    // Create transporter
    const transporter = nodemailer.createTransport(smtpConfig);
    
    // Verify connection
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');
    
    // Test sending email
    console.log('Testing email sending...');
    const info = await transporter.sendMail({
      from: 'hristoslavov.ivanov@gmail.com',
      to: 'hristoslavov.ivanov@gmail.com',
      subject: 'Test Email from FixMyLeak SMTP',
      text: 'This is a test email sent via SendGrid SMTP.',
      html: `
        <html>
          <body>
            <h2>Test Email from FixMyLeak</h2>
            <p>This is a test email sent via SendGrid SMTP.</p>
            <p>If you received this email, the SMTP configuration is working correctly!</p>
            <hr>
            <p><small>Sent at: ${new Date().toLocaleString()}</small></p>
          </body>
        </html>
      `
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    
  } catch (error) {
    console.error('❌ SMTP test failed:', error);
    process.exit(1);
  }
}

testSMTP(); 