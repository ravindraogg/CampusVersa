// models/institute/Faculty.js
const mongoose = require('mongoose');

const FacultySchema = new mongoose.Schema({
  instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
  FID: { type: String, required: true, unique: true }, 
  name: { type: String, required: true },
  
  // Contact Info
  email: { type: String },
  phone: { type: String },
  
  // Professional Info
  designation: { type: String },
  department: { type: String, required: true },
  position: { type: String }, // Administrative position if any
  workingHours: { type: String },
  joiningDate: { type: Date }, // Explicit joining date field
  
  // Auth & UI
  profilePic: { type: String }, 
  loginId: { type: String },
  password: { type: String },
  themeColorPrimary: { type: String },
  themeColorSecondary: { type: String },

  // Compliance
  ssrStatus: { type: String }, 
  naacFollowing: { type: Boolean, default: false },
  
  kyc: {
    verified: { type: Boolean, default: false },
    kycType: { type: String, default: null },
    aadharLast4: { type: String, default: null } 
  },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  // --- EXPANDED: Professional Overview ---
  qualification: { type: String }, // e.g., "Ph.D. in Data Science"
  experience: { type: String }, // e.g., "12 Years"
  specialization: [String], // e.g., ["Machine Learning", "IoT"]
  
  // --- EXPANDED: Research Metrics (For Dashboard Stats) ---
  research: {
    papersPublished: { type: Number, default: 0 },
    citations: { type: Number, default: 0 },
    hIndex: { type: Number, default: 0 },
    i10Index: { type: Number, default: 0 },
    projectsGuided: { type: Number, default: 0 },
    patents: { type: Number, default: 0 }
  },

  // --- EXPANDED: Social & External Links ---
  socialLinks: {
    linkedin: String,
    googleScholar: String,
    website: String
  },

  // --- EXPANDED: Performance/Appraisal ---
  aparScore: { type: String, default: "0/10" }, // Annual Performance Appraisal Report

  joinedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Faculty', FacultySchema);