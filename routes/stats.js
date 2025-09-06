const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const Contact = require('../models/Contact');
const Template = require('../models/Template');

// Public stats endpoint - no auth required
router.get('/', async (req, res) => {
  try {
    const [campaignCount, contactCount, templateCount] = await Promise.all([
      Campaign.countDocuments(),
      Contact.countDocuments(),
      Template.countDocuments()
    ]);

    res.json({
      campaigns: campaignCount,
      contacts: contactCount,
      templates: templateCount,
      totalEmails: 0 // You can calculate this based on your email tracking
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Public recent activity endpoint - no auth required
router.get('/activity', async (req, res) => {
  try {
    const recentCampaigns = await Campaign.find()
      .select('name status createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json(recentCampaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;