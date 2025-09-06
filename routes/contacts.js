const express = require('express');
const multer = require('multer');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticateToken } = require('../middleware/auth');
const Contact = require('../models/Contact');

const upload = multer({ dest: 'uploads/' });

// Public endpoint for basic contact stats
router.get('/public', async (req, res) => {
  try {
    const contacts = await Contact.find()
      .select('email firstName lastName createdAt')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint without auth
router.get('/test', async (req, res) => {
  res.json({ message: 'Contacts endpoint working', timestamp: new Date().toISOString() });
});

router.get('/', authenticateToken, contactController.getAllContacts);
router.get('/:id', authenticateToken, contactController.getContact);
router.post('/', authenticateToken, contactController.createContact);
router.put('/:id', authenticateToken, contactController.updateContact);
router.delete('/:id', authenticateToken, contactController.deleteContact);
router.post('/import', authenticateToken, upload.single('file'), contactController.importContacts);

module.exports = router;