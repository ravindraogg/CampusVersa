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
  position: { type: String },
  workingHours: { type: String },
  joiningDate: { type: Date },

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

  // Professional Overview
  qualification: { type: String },
  experience: { type: String }, // overall years from your existing field
  specialization: [String],

  // Research Metrics
  research: {
    papersPublished: { type: Number, default: 0 },
    citations: { type: Number, default: 0 },
    hIndex: { type: Number, default: 0 },
    i10Index: { type: Number, default: 0 },
    projectsGuided: { type: Number, default: 0 },
    patents: { type: Number, default: 0 }
  },

  // Social Links
  socialLinks: {
    linkedin: String,
    googleScholar: String,
    website: String
  },

  // Appraisal
  aparScore: { type: String, default: "0/10" },

  // NEW: Previous Work & Academic Background
  workHistory: [
    {
      instituteName: { type: String }, // previous institute or university
      role: { type: String }, // Lecturer, Assistant Professor, etc.
      duration: { type: String }, // "2015-2019"
      experienceYears: { type: Number }, // numeric years from that institute
      description: { type: String } // optional brief notes
    }
  ],

  totalExperienceYears: { type: Number, default: 0 }, // numeric overall experience

  joinedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Faculty', FacultySchema);
