const sgMail = require('@sendgrid/mail');
const Campaign = require('../models/Campaign');
const Contact = require('../models/Contact');
const Template = require('../models/Template');
const EmailEvent = require('../models/EmailEvent');

if (!process.env.SENDGRID_API_KEY) {
  console.error('SENDGRID_API_KEY is not set in environment variables');
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

exports.sendCampaign = async (req, res) => {
  try {
    const { id: campaignId } = req.params;
    const campaign = await Campaign.findOne({ 
      _id: campaignId, 
      userId: req.user.userId 
    }).populate('templateId');
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (!campaign.templateId) {
      return res.status(400).json({ message: 'Campaign template not found' });
    }

    // Get contacts based on segment for this user
    let contactQuery = { 
      status: 'subscribed',
      userId: req.user.userId
    };
    if (campaign.segment !== 'all') {
      contactQuery.segment = campaign.segment;
    }
    
    const contacts = await Contact.find(contactQuery);
    
    if (contacts.length === 0) {
      return res.status(400).json({ message: 'No subscribed contacts found for this segment' });
    }

    // Update campaign status
    campaign.status = 'sending';
    campaign.totalRecipients = contacts.length;
    campaign.sentCount = 0;
    campaign.bounceCount = 0;
    await campaign.save();

    let successCount = 0;
    let failureCount = 0;

    // Send emails to all contacts
    for (const contact of contacts) {
      try {
        // Personalize content
        let htmlContent = campaign.templateId.htmlContent;
        let textContent = campaign.templateId.textContent || '';
        
        // Replace placeholders with contact data
        const replacements = {
          '{{firstName}}': contact.firstName || '',
          '{{lastName}}': contact.lastName || '',
          '{{email}}': contact.email || '',
          '{{segment}}': contact.segment || 'general'
        };
        
        Object.entries(replacements).forEach(([placeholder, value]) => {
          htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
          textContent = textContent.replace(new RegExp(placeholder, 'g'), value);
        });

        const msg = {
          to: contact.email,
          from: {
            email: process.env.FROM_EMAIL,
            name: process.env.FROM_NAME
          },
          replyTo: process.env.REPLY_TO_EMAIL || process.env.FROM_EMAIL,
          subject: campaign.subject,
          html: htmlContent,
          text: textContent,
          headers: {
            'List-Unsubscribe': `<${process.env.APP_BASE_URL}/unsubscribe?email=${encodeURIComponent(contact.email)}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
          },
          trackingSettings: {
            clickTracking: { enable: false },
            openTracking: { enable: false }
          }
        };

        await sgMail.send(msg);
        successCount++;
        
        // Track sent event
        await EmailEvent.create({
          campaignId: campaign._id,
          contactId: contact._id,
          eventType: 'sent'
        });

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        failureCount++;
      }
    }

    // Update campaign with final results
    campaign.status = 'sent';
    campaign.sentCount = successCount;
    campaign.bounceCount = failureCount;
    campaign.sentAt = new Date();
    await campaign.save();

    res.json({ 
      message: 'Campaign sent successfully', 
      campaign,
      results: {
        totalRecipients: contacts.length,
        successCount,
        failureCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendTestEmail = async (req, res) => {
  try {
    const { templateId, testEmail } = req.body;
    const template = await Template.findOne({ 
      _id: templateId, 
      userId: req.user.userId 
    });
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const msg = {
      to: testEmail,
      from: process.env.FROM_EMAIL,
      subject: `[TEST] ${template.subject}`,
      html: template.htmlContent,
      text: template.textContent
    };

    await sgMail.send(msg);
    res.json({ message: 'Test email sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendPersonalizedTestEmail = async (req, res) => {
  try {
    const { templateId, contactId, testEmail } = req.body;
    const template = await Template.findOne({ 
      _id: templateId, 
      userId: req.user.userId 
    });
    const contact = await Contact.findOne({ 
      _id: contactId, 
      userId: req.user.userId 
    });
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Personalize content with contact data
    let htmlContent = template.htmlContent;
    let textContent = template.textContent || '';
    let subject = template.subject;
    
    // Replace placeholders with contact data
    const replacements = {
      '{{firstName}}': contact.firstName || '',
      '{{lastName}}': contact.lastName || '',
      '{{email}}': contact.email || '',
      '{{segment}}': contact.segment || 'general'
    };
    
    Object.entries(replacements).forEach(([placeholder, value]) => {
      htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
      textContent = textContent.replace(new RegExp(placeholder, 'g'), value);
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
    });

    const msg = {
      to: testEmail,
      from: process.env.FROM_EMAIL,
      subject: `[TEST] ${subject}`,
      html: htmlContent,
      text: textContent
    };

    await sgMail.send(msg);
    res.json({ 
      message: 'Personalized test email sent successfully',
      personalizedWith: {
        contactId: contact._id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        segment: contact.segment
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.validateSendGridConfig = async (req, res) => {
  try {
    const testMsg = {
      to: 'test@example.com',
      from: process.env.FROM_EMAIL || 'mubasharhussain26a@gmail.com',
      subject: 'SendGrid Configuration Test',
      text: 'This is a test message to validate SendGrid configuration.',
      mailSettings: {
        sandboxMode: {
          enable: true
        }
      }
    };

    await sgMail.send(testMsg);
    res.json({ valid: true, message: 'SendGrid configuration is valid' });
  } catch (error) {
    res.status(400).json({ valid: false, message: error.message });
  }
};

exports.getDeliveryStatus = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const campaign = await Campaign.findById(campaignId);
    
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json({ campaign });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};