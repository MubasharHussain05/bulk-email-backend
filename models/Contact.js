const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  segment: {
    type: String,
    default: 'general',
    trim: true
  },
  status: {
    type: String,
    enum: ['subscribed', 'unsubscribed', 'bounced'],
    default: 'subscribed'
  },
  tags: {
    type: [String],
    default: []
  },
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastEmailSent: Date,
  subscriptionDate: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
contactSchema.index({ userId: 1, email: 1 });
contactSchema.index({ userId: 1, segment: 1 });

module.exports = mongoose.model('Contact', contactSchema);