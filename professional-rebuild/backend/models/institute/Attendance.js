const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  
  // Array of daily records
  history: [{
    date: { type: String, required: true }, // Format: "YYYY-MM-DD"
    status: { type: String, enum: ['Present', 'Absent'], required: true },
    value: { type: Number, enum: [1, 0], required: true } // 1 for Present, 0 for Absent
  }],

  // Aggregates for quick access (updated on every push)
  totalClasses: { type: Number, default: 0 },
  totalPresent: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 }
}, { timestamps: true });

// Compound index to ensure 1 document per student per course
AttendanceSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);