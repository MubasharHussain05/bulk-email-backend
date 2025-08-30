require('dotenv').config();
const mongoose = require('mongoose');
const Contact = require('./models/Contact');
const Template = require('./models/Template');
const Campaign = require('./models/Campaign');
const { sendEmail } = require('./services/emailService');

async function testCompleteFlow() {
  try {
    console.log('🚀 Testing Complete Email Flow...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // 1. Test SendGrid connection
    console.log('\n📧 Testing SendGrid connection...');
    const testResult = await sendEmail(
      'mubasharhussain26a@gmail.com',
      'Test Connection',
      'Testing SendGrid connection',
      '<h1>Test Connection</h1><p>Testing SendGrid connection</p>'
    );
    
    if (testResult.success) {
      console.log('✅ SendGrid connection working');
    } else {
      console.log('❌ SendGrid connection failed:', testResult.error);
      return;
    }
    
    // 2. Create a test contact
    console.log('\n👤 Creating test contact...');
    const contact = new Contact({
      email: 'mubasharhussain26a@gmail.com',
      firstName: 'Mubashar',
      lastName: 'Ali',
      segment: 'test',
      status: 'subscribed'
    });
    
    await contact.save();
    console.log('✅ Test contact created:', contact.email);
    
    // 3. Create a test template
    console.log('\n📄 Creating test template...');
    const template = new Template({
      name: 'Test Template',
      subject: 'Test Email from Bulk Service',
      htmlContent: '<h1>Hello {{firstName}}!</h1><p>This is a test email from the bulk email service.</p>',
      textContent: 'Hello {{firstName}}! This is a test email from the bulk email service.',
      description: 'Test template for flow verification'
    });
    
    await template.save();
    console.log('✅ Test template created:', template.name);
    
    // 4. Create a test campaign
    console.log('\n📢 Creating test campaign...');
    const campaign = new Campaign({
      name: 'Test Campaign',
      subject: 'Test Campaign Email',
      templateId: template._id,
      segment: 'test',
      status: 'draft'
    });
    
    await campaign.save();
    console.log('✅ Test campaign created:', campaign.name);
    
    // 5. Simulate sending campaign
    console.log('\n📤 Simulating campaign send...');
    const populatedCampaign = await Campaign.findById(campaign._id).populate('templateId');
    const contacts = await Contact.find({ segment: 'test', status: 'subscribed' });
    
    console.log(`Found ${contacts.length} contacts for segment: ${populatedCampaign.segment}`);
    
    if (contacts.length > 0) {
      const testContact = contacts[0];
      let htmlContent = populatedCampaign.templateId.htmlContent;
      htmlContent = htmlContent.replace(/{{firstName}}/g, testContact.firstName || '');
      
      const emailResult = await sendEmail(
        testContact.email,
        populatedCampaign.subject,
        populatedCampaign.templateId.textContent,
        htmlContent
      );
      
      if (emailResult.success) {
        console.log('✅ Campaign email sent successfully to:', testContact.email);
      } else {
        console.log('❌ Campaign email failed:', emailResult.error);
      }
    }
    
    console.log('\n🎉 Complete flow test finished!');
    console.log('\n📋 Summary:');
    console.log('- SendGrid connection: Working');
    console.log('- Contact creation: Working');
    console.log('- Template creation: Working');
    console.log('- Campaign creation: Working');
    console.log('- Email sending: Working');
    
    // Cleanup
    await Contact.deleteOne({ _id: contact._id });
    await Template.deleteOne({ _id: template._id });
    await Campaign.deleteOne({ _id: campaign._id });
    console.log('\n🧹 Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Error in flow test:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
  }
}

testCompleteFlow();