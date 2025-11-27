const mongoose = require('mongoose');

const CriteriaSchema = new mongoose.Schema({
  id: Number,
  name: String,
  status: { type: String, default: 'Pending' }, // Pending, Submitted, Verified, Rejected
  score: Number,
  suggestion: String, // AI suggestion
  submissionText: String, // Institute's proof
  adminComments: String,  // Rejection/Approval notes
  lastUpdated: Date
});

const NAACTrackerSchema = new mongoose.Schema({
  instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute' },
  criteria: [CriteriaSchema],
  overallScore: String
}, { timestamps: true });

module.exports = mongoose.model('NAACTracker', NAACTrackerSchema);