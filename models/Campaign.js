const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  segment: {
    type: String,
    default: 'all',
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'sent', 'failed', 'paused'],
    default: 'draft'
  },
  description: {
    type: String,
    trim: true
  },
  scheduledAt: Date,
  sentAt: Date,
  totalRecipients: {
    type: Number,
    default: 0
  },
  sentCount: {
    type: Number,
    default: 0
  },
  openCount: {
    type: Number,
    default: 0
  },
  clickCount: {
    type: Number,
    default: 0
  },
  bounceCount: {
    type: Number,
    default: 0
  },
  unsubscribeCount: {
    type: Number,
    default: 0
  },
  errorCount: {
    type: Number,
    default: 0
  },
  tags: {
    type: [String],
    default: []
  },
  settings: {
    trackOpens: {
      type: Boolean,
      default: true
    },
    trackClicks: {
      type: Boolean,
      default: true
    },
    sendRate: {
      type: Number,
      default: 100 // emails per hour
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
campaignSchema.index({ userId: 1, status: 1 });
campaignSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Campaign', campaignSchema);