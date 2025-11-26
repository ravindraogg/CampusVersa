const mongoose = require('mongoose');

const NAACTrackerSchema = new mongoose.Schema({
  instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true, unique: true },
  criteria: [{
    id: Number,
    name: String,
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Verified'], default: 'Pending' },
    score: { type: Number, default: 0 },
    notes: String
  }],
  overallScore: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NAACTracker', NAACTrackerSchema);