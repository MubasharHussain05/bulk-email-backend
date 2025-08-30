const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { logger } = require('../config/monitoring');

// Handle unsubscribe requests
router.get('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    // Update contact to unsubscribed status
    await Contact.findOneAndUpdate(
      { email: email },
      { 
        status: 'unsubscribed',
        unsubscribedAt: new Date()
      }
    );

    logger.info('User unsubscribed', { email });

    res.send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2>Successfully Unsubscribed</h2>
          <p>You have been successfully unsubscribed from our mailing list.</p>
          <p>Email: ${email}</p>
        </body>
      </html>
    `);
  } catch (error) {
    logger.error('Unsubscribe error', { error: error.message });
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

// One-click unsubscribe (POST method for email clients)
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    await Contact.findOneAndUpdate(
      { email: email },
      { 
        status: 'unsubscribed',
        unsubscribedAt: new Date()
      }
    );

    logger.info('User unsubscribed via one-click', { email });
    res.status(200).send('Unsubscribed successfully');
  } catch (error) {
    logger.error('One-click unsubscribe error', { error: error.message });
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

module.exports = router;