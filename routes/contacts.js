const express = require('express');
const multer = require('multer');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticateToken } = require('../middleware/auth');

const upload = multer({ dest: 'uploads/' });

router.get('/', authenticateToken, contactController.getAllContacts);
router.get('/:id', authenticateToken, contactController.getContact);
router.post('/', authenticateToken, contactController.createContact);
router.put('/:id', authenticateToken, contactController.updateContact);
router.delete('/:id', authenticateToken, contactController.deleteContact);
router.post('/import', authenticateToken, upload.single('file'), contactController.importContacts);

module.exports = router;