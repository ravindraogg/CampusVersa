// models/institute/Timetable.js
const mongoose = require('mongoose');

const TimetableSchema = new mongoose.Schema({
  instituteId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Institute', 
    required: true 
  },
  // --- ADDED DEPARTMENT FIELD ---
  department: {
    type: String,
    required: true
  },
  semester: { 
    type: String, 
    required: true 
  },
  constraints: {
    subjects: String,
    workingDays: [String]
  },
  schedule: { 
    type: Object, 
    required: true 
  }, 
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Timetable', TimetableSchema);