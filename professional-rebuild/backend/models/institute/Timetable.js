// models/institute/Timetable.js
const mongoose = require('mongoose');

const TimetableSchema = new mongoose.Schema({
  instituteId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Institute', 
    required: true 
  },
  semester: { 
    type: String, 
    required: true 
  },
  // We store the specific constraints used to generate this for reference
  constraints: {
    subjects: String,
    workingDays: [String]
  },
  // The actual AI-generated JSON schedule
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