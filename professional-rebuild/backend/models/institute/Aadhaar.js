const mongoose = require('mongoose');

const AadhaarSchema = new mongoose.Schema({
  instituteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institute',
    required: true
  },
  
  // --- DYNAMIC REFERENCE (Polymorphism) ---
  // This ID can belong to EITHER a Faculty OR a Student
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'userType' // This tells Mongoose to look at 'userType' to know which model to link
  },
  
  userType: {
    type: String,
    required: true,
    enum: ['Faculty', 'Student'] // Restricts values to these two models
  },

  // --- AADHAAR DATA ---
  aadhaarNumber: {
    type: String,
    required: true,
    unique: true, // ✅ This AUTOMATICALLY creates the index. No need to add .index() below.
    trim: true,
    minlength: 12,
    maxlength: 12, // Standard 12-digit format
    match: [/^\d{12}$/, 'Please fill a valid 12-digit Aadhaar number']
  },
  
  // Optional: To store the linked mobile if needed for OTP logic
  linkedMobile: {
    type: String,
    match: [/^\d{10}$/, 'Please fill a valid 10-digit mobile number']
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

AadhaarSchema.index({ userId: 1, userType: 1 }, { unique: true });

module.exports = mongoose.model('Aadhaar', AadhaarSchema);