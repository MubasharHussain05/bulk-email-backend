const express = require('express');
const { sendEmail } = require('../services/emailService');
const { sendCampaign, sendTestEmail, sendPersonalizedTestEmail, validateSendGridConfig, getDeliveryStatus } = require('../controllers/emailController');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Send campaign
router.post('/send-campaign/:id', authenticateToken, sendCampaign);

// Send test email
router.post('/send-test', authenticateToken, sendTestEmail);

// Send personalized test email
router.post('/send-personalized-test', authenticateToken, sendPersonalizedTestEmail);

// Validate SendGrid configuration
router.get('/validate-config', authenticateToken, validateSendGridConfig);

// Get delivery status
router.get('/delivery-status/:campaignId', getDeliveryStatus);

// Legacy test route
router.get('/send-email', async (req, res) => {
  const msg = {
    to: 'recipient@example.com',
    from: 'mubasharhussain26a@gmail.com',
    subject: 'Hello from SendGrid',
    text: 'This is a test email using SendGrid API key.',
    html: '<strong>This is a test email using SendGrid API key.</strong>',
  };

  try {
    const result = await sendEmail(msg.to, msg.subject, msg.text, msg.html);
    if (result.success) {
      res.json({ message: 'Email sent successfully' });
    } else {
      res.status(500).json({ message: 'Failed to send email', error: result.error });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;