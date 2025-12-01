const mongoose = require('mongoose');

const FacultyFormSchema = new mongoose.Schema({
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  description: String,
  isActive: { type: Boolean, default: true },
  
  // The schema for the questions/fields
  fields: [{
    label: String, // e.g., "Rate the teaching pace"
    fieldType: { type: String, enum: ['text', 'rating', 'yesno', 'mcq'], default: 'text' },
    required: { type: Boolean, default: true },
    options: [String] // For MCQ
  }],
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FacultyForm', FacultyFormSchema);