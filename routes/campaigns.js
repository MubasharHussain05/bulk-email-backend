const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const { sendCampaign } = require('../controllers/emailController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, campaignController.getAllCampaigns);
router.get('/:id', authenticateToken, campaignController.getCampaign);
router.post('/', authenticateToken, campaignController.createCampaign);
router.put('/:id', authenticateToken, campaignController.updateCampaign);
router.delete('/:id', authenticateToken, campaignController.deleteCampaign);
router.post('/:id/send', authenticateToken, sendCampaign);

module.exports = router;