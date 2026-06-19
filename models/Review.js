const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeName: {
    type: String,
    required: true
  },
  reviewerName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  feedback: {
    type: String,
    required: true
  },
  reviewPeriod: {
    type: String, // e.g. "Q1 2026", "Annual 2025"
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
