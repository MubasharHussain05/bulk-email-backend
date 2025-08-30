const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
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
  htmlContent: {
    type: String,
    required: true
  },
  textContent: {
    type: String
  },
  description: {
    type: String,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    default: 'general',
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  variables: {
    type: [String],
    default: []
  },
  lastUsed: Date
}, {
  timestamps: true
});

// Index for better query performance
templateSchema.index({ userId: 1, name: 1 });
templateSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('Template', templateSchema);