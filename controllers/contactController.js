const Contact = require('../models/Contact');

exports.getAllContacts = async (req, res) => {
  try {
    console.log('Fetching contacts for user:', req.user.userId);
    const contacts = await Contact.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });
    console.log(`Found ${contacts.length} contacts for user ${req.user.userId}`);
    
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getContact = async (req, res) => {
  try {
    const contact = await Contact.findOne({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createContact = async (req, res) => {
  try {
    console.log('Creating contact for user:', req.user.userId, req.body);
    
    // Check if contact already exists for this user
    const existingContact = await Contact.findOne({ 
      email: req.body.email, 
      userId: req.user.userId 
    });
    
    if (existingContact) {
      return res.status(400).json({ error: 'Contact with this email already exists' });
    }
    
    const contactData = {
      ...req.body,
      userId: req.user.userId
    };
    
    const contact = new Contact(contactData);
    await contact.save();
    
    console.log('Contact created successfully:', contact._id);
    res.status(201).json(contact);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.updateContact = async (req, res) => {
  try {
    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    console.log('Contact updated successfully:', contact._id);
    res.json(contact);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.userId 
    });
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    console.log('Contact deleted successfully:', contact._id);
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.importContacts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fs = require('fs');
    const csv = require('csv-parser');
    const contacts = [];
    let imported = 0;
    let errors = [];

    // Read and parse CSV file
    const stream = fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (row) => {
        // Clean up the row data
        const contact = {
          email: row.email?.trim(),
          firstName: row.firstName?.trim() || '',
          lastName: row.lastName?.trim() || '',
          segment: row.segment?.trim() || 'general',
          status: row.status?.trim() || 'subscribed',
          tags: row.tags ? row.tags.split(';').map(tag => tag.trim()).filter(tag => tag) : []
        };
        
        if (contact.email) {
          contacts.push(contact);
        }
      })
      .on('end', async () => {
        // Save contacts to database
        for (const contactData of contacts) {
          try {
            const existingContact = await Contact.findOne({ 
              email: contactData.email, 
              userId: req.user.userId 
            });
            if (!existingContact) {
              await Contact.create({
                ...contactData,
                userId: req.user.userId
              });
              imported++;
            }
          } catch (error) {
            errors.push(`Error importing ${contactData.email}: ${error.message}`);
          }
        }

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json({ 
          message: `Successfully imported ${imported} contacts`, 
          imported,
          total: contacts.length,
          errors: errors.length > 0 ? errors : undefined
        });
      });

  } catch (error) {
    console.error('Import error:', error);
    res.status(400).json({ error: error.message });
  }
};