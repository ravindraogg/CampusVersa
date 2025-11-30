// models/institute/Course.js
const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  department: { type: String, required: true },
  year: { type: String, required: true },
  semester: { type: String, required: true },
  credits: { type: Number, default: 3 },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', default: null },
  
  // --- NEW FIELDS ---
  
  // 1. Course Materials
  resources: [{
    title: { type: String, required: true },
    type: { type: String, enum: ['Note', 'PYQ', 'Video'], required: true },
    url: { type: String, required: true }, // Base64 for docs, URL for videos
    uploadedAt: { type: Date, default: Date.now }
  }],

  // 2. Student Mapping (Enrollment)
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', CourseSchema);