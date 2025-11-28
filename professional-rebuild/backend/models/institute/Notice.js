const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema({
  instituteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institute',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  // Update the enum to include 'Timetable'
  type: {
    type: String,
    enum: ['General', 'Exam', 'Fees', 'Event', 'Holiday', 'Urgent', 'Timetable'], 
    default: 'General'
  },
  audience: {
    type: String,
    enum: ['Global', 'Student', 'Faculty'],
    default: 'Global'
  },
  targetDept: String, // Optional: e.g. "CSE"
  targetYear: String, // Optional: e.g. "3"
  date: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notice', NoticeSchema);