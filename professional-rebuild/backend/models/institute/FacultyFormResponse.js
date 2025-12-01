const mongoose = require('mongoose');

const FacultyFormResponseSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'FacultyForm', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' }, // Optional (anonymous surveys)
  
  // Array of answers matching the fields in FacultyForm
  answers: [{
    questionId: String, // Matches the 'id' field in form.fields
    questionLabel: String, // Snapshot of question in case it changes later
    answer: String
  }],

  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FacultyFormResponse', FacultyFormResponseSchema);