const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  department: { type: String, required: true },
  year: { type: String, required: true },
  semester: { type: String, required: true },
  credits: { type: Number, default: 3 },  
  resources: [{
    title: { type: String, required: true },
    type: { type: String, enum: ['Note', 'PYQ', 'Video'], required: true },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', CourseSchema);