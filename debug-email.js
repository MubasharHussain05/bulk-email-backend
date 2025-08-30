require('dotenv').config();
const mongoose = require('mongoose');
const Contact = require('./models/Contact');
const sgMail = require('@sendgrid/mail');

async function debugEmailIssue() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check contacts
    const allContacts = await Contact.find({});
    console.log(`📋 Total contacts in database: ${allContacts.length}`);
    
    allContacts.forEach(contact => {
      console.log(`  - ${contact.email}: segment=${contact.segment}, status=${contact.status}, userId=${contact.userId}`);
    });

    // Check subscribed contacts
    const subscribedContacts = await Contact.find({ status: 'subscribed' });
    console.log(`✅ Subscribed contacts: ${subscribedContacts.length}`);

    // Test SendGrid API key
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log('🔑 SendGrid API key set');

    // Test email send
    const testMsg = {
      to: 'mubasharhussain26a@gmail.com',
      from: 'mubasharhussain26a@gmail.com',
      subject: 'Test Email',
      text: 'This is a test email',
      mailSettings: {
        sandboxMode: { enable: false }
      }
    };

    await sgMail.send(testMsg);
    console.log('✅ Test email sent successfully');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('SendGrid Error:', error.response.body);
    }
  } finally {
    mongoose.disconnect();
  }
}

debugEmailIssue();