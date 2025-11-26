// models/institute/Student.js
const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
  SID: { type: String, required: true, unique: true }, 
  name: { type: String, required: true },
  
  // MATCHED WITH FRONTEND:
  rollNumber: { type: String }, // Frontend was sending 'roll', we will fix frontend to send 'rollNumber'
  email: { type: String },
  phone: { type: String },
  
  // NEWLY ADDED:
  section: { type: String },      // Added to match frontend
  admissionNo: { type: String },  // Added to match frontend
  
  department: { type: String, required: true }, 
  year: { type: String }, 
  
  course: { type: String }, // You might want to add this to frontend later
  profilePic: { type: String },
  loginId: { type: String },
  password: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);