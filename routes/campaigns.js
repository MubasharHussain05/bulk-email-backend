const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const { sendCampaign } = require('../controllers/emailController');
const { authenticateToken } = require('../middleware/auth');
const Campaign = require('../models/Campaign');

// Public endpoint for basic campaign stats
router.get('/public', async (req, res) => {
  try {
    const campaigns = await Campaign.find()
      .select('name status createdAt emailsSent')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint without auth
router.get('/test', async (req, res) => {
  res.json({ message: 'Campaigns endpoint working', timestamp: new Date().toISOString() });
});

router.get('/', authenticateToken, campaignController.getAllCampaigns);
router.get('/:id', authenticateToken, campaignController.getCampaign);
router.post('/', authenticateToken, campaignController.createCampaign);
router.put('/:id', authenticateToken, campaignController.updateCampaign);
router.delete('/:id', authenticateToken, campaignController.deleteCampaign);
router.post('/:id/send', authenticateToken, sendCampaign);

module.exports = router;