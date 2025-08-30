require('dotenv').config();
const sgMail = require('@sendgrid/mail');

// Validate environment variables
if (!process.env.SENDGRID_API_KEY) {
  console.error('❌ SENDGRID_API_KEY is not set in .env file');
  process.exit(1);
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const testEmail = async () => {
  const msg = {
    to: 'mubasharhussain26a@gmail.com', // Send to yourself for testing
    from: 'mubasharhussain26a@gmail.com', // Must be verified in SendGrid
    subject: 'Test Email from Bulk Mail Service',
    text: 'This is a test email to verify SendGrid configuration.',
    html: '<h1>Test Email</h1><p>This is a test email to verify SendGrid configuration.</p>',
  };

  try {
    console.log('🚀 Sending test email...');
    await sgMail.send(msg);
    console.log('✅ Email sent successfully!');
    console.log('📧 Check your inbox at:', msg.to);
  } catch (error) {
    console.error('❌ Error sending email:');
    console.error('Status Code:', error.code);
    console.error('Message:', error.message);
    
    if (error.response && error.response.body) {
      console.error('Response Body:', JSON.stringify(error.response.body, null, 2));
    }
  }
};

testEmail();