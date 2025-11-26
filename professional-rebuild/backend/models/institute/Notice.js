const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema({
  instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['General', 'Urgent', 'Exam', 'Event'], default: 'General' },
  date: { type: String, required: true }, // Keeping as string for 'YYYY-MM-DD' format simplicity or use Date
  content: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notice', NoticeSchema);