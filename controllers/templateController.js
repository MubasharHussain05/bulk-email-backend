const Template = require('../models/Template');

exports.getAllTemplates = async (req, res) => {
  try {
    console.log('Fetching templates for user:', req.user.userId);
    const templates = await Template.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });
    console.log(`Found ${templates.length} templates for user ${req.user.userId}`);
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getTemplate = async (req, res) => {
  try {
    const template = await Template.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createTemplate = async (req, res) => {
  try {
    console.log('Creating template for user:', req.user.userId, req.body);
    
    const templateData = {
      ...req.body,
      userId: req.user.userId
    };
    
    const template = new Template(templateData);
    await template.save();
    
    console.log('Template created successfully:', template._id);
    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.updateTemplate = async (req, res) => {
  try {
    const template = await Template.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    console.log('Template updated successfully:', template._id);
    res.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    console.log('Template deleted successfully:', template._id);
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(400).json({ error: error.message });
  }
};