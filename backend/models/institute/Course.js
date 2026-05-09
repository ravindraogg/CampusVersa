const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  instituteId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Institute', 
    required: true 
  },
  name: { type: String, required: true },
  code: { type: String, required: true },
  department: { type: String, required: true },
  year: { type: String, required: true }, // e.g., "1", "2", "3", "4"
  semester: { type: String, required: true }, // e.g., "5"
  credits: { type: Number, default: 3 },

  // --- ADD THIS FIELD TO FIX THE ERROR ---
  facultyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Faculty',
    default: null
  },

  // List of students enrolled in this course
  enrolledStudents: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student' 
  }],

  // Course materials
  resources: [{
    title: String,
    type: String, // 'pdf', 'link', 'video'
    url: String,
    createdAt: { type: Date, default: Date.now }
  }],

  createdAt: { type: Date, default: Date.now }
});

// Ensure unique course code per institute + department is handled in logic or compound index if needed
CourseSchema.index({ instituteId: 1, code: 1, department: 1 }, { unique: true });

module.exports = mongoose.model('Course', CourseSchema);