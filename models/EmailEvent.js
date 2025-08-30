const mongoose = require('mongoose');

const emailEventSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  },
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  },
  eventType: {
    type: String,
    enum: ['sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed'],
    required: true
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EmailEvent', emailEventSchema);