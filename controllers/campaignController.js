const Campaign = require('../models/Campaign');
const Template = require('../models/Template');

exports.getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ userId: req.user.userId })
      .populate('templateId')
      .sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    }).populate('templateId');
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCampaign = async (req, res) => {
  try {
    // Verify template belongs to user
    if (req.body.templateId) {
      const template = await Template.findOne({ 
        _id: req.body.templateId, 
        userId: req.user.userId 
      });
      
      if (!template) {
        return res.status(400).json({ error: 'Template not found or does not belong to user' });
      }
    }
    
    const campaignData = {
      ...req.body,
      userId: req.user.userId
    };
    
    const campaign = new Campaign(campaignData);
    await campaign.save();
    
    // Populate template data for response
    await campaign.populate('templateId');
    
    res.status(201).json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateCampaign = async (req, res) => {
  try {
    // Verify template belongs to user if templateId is being updated
    if (req.body.templateId) {
      const template = await Template.findOne({ 
        _id: req.body.templateId, 
        userId: req.user.userId 
      });
      
      if (!template) {
        return res.status(400).json({ error: 'Template not found or does not belong to user' });
      }
    }
    
    const campaign = await Campaign.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    ).populate('templateId');
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    res.json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};