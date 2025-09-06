const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');
const { authenticateToken } = require('../middleware/auth');
const Template = require('../models/Template');

// Public endpoint for basic template stats
router.get('/public', async (req, res) => {
  try {
    const templates = await Template.find()
      .select('name subject createdAt')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', authenticateToken, templateController.getAllTemplates);
router.get('/:id', authenticateToken, templateController.getTemplate);
router.post('/', authenticateToken, templateController.createTemplate);
router.put('/:id', authenticateToken, templateController.updateTemplate);
router.delete('/:id', authenticateToken, templateController.deleteTemplate);

module.exports = router;