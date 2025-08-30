require('dotenv').config();
const mongoose = require('mongoose');
const { sendEmail } = require('./services/emailService');

// Test the complete email flow
async function testEmailFlow() {
  try {
    console.log('Testing email flow...');
    console.log('SendGrid API Key:', process.env.SENDGRID_API_KEY ? 'Set' : 'Not set');
    console.log('From Email:', process.env.FROM_EMAIL);
    
    // Test sending a simple email
    const result = await sendEmail(
      'mubasharhussain26a@gmail.com', // Send to yourself for testing
      'Test Email from Bulk Email Service',
      'This is a test email to verify the email service is working.',
      '<h1>Test Email</h1><p>This is a test email to verify the email service is working.</p>'
    );
    
    if (result.success) {
      console.log('✅ Email sent successfully!');
    } else {
      console.log('❌ Email failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testEmailFlow();