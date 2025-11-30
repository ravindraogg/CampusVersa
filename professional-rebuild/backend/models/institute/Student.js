// models/institute/Student.js
const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
  SID: { type: String, required: true, unique: true }, 
  name: { type: String, required: true },
  
  // Basic Info
  rollNumber: { type: String }, 
  email: { type: String },
  phone: { type: String },
  section: { type: String },      
  admissionNo: { type: String },  
  department: { type: String, required: true }, 
  year: { type: String }, 
  semester: { type: String, required: true }, // <--- ADDED: Current Semester
  course: { type: String },
  
  // Auth & UI
  profilePic: { type: String },
  loginId: { type: String },
  password: { type: String },
  themeColorPrimary: { type: String },
  themeColorSecondary: { type: String },

  // --- UPDATED FEATURE: Academic Dashboard (GPA, CGPA logic) ---
  academic: {
    cgpa: { type: Number, default: 0 }, // Calculated using formula: Σ(SGPA * Credits) / Σ(Credits)
    
    // Store history to calculate CGPA
    semesterResults: [{
      semester: String,
      totalCredits: Number, // The ΣC for this semester
      earnedPoints: Number, // The Σ(GradePoint * Credits)
      sgpa: Number          // The calculated SGPA for this semester
    }],
    
    backlogs: { type: Number, default: 0 },
    creditsEarned: { type: Number, default: 0 }
  },

  // ... (Rest of the schema: attendance, lifecycle, placement, freelancing, aiInsights remains the same)
  attendance: {
    overallPercentage: { type: Number, default: 0 },
    subjectWise: [{
      subjectName: String,
      attended: Number,
      total: Number,
      percentage: Number
    }],
    alertLevel: { type: String, enum: ['Safe', 'Warning', 'Critical'], default: 'Safe' }
  },
  lifecycle: [{
    event: String,
    date: { type: Date, default: Date.now },
    description: String
  }],
  achievements: [{
    title: String,
    date: Date,
    issuer: String,
    certificateUrl: String,
    type: { type: String, enum: ['Academic', 'Sports', 'Cultural', 'Hackathon'] }
  }],
  placement: {
    status: { type: String, enum: ['Open to Work', 'Placed', 'Higher Studies', 'Not Interested'], default: 'Open to Work' },
    skills: [String],
    resumeUrl: String,
    applications: [{
      company: String,
      role: String,
      status: { type: String, enum: ['Applied', 'Shortlisted', 'Interview', 'Rejected', 'Offered'] },
      date: Date
    }]
  },
  freelancing: {
    isFreelancer: { type: Boolean, default: false },
    portfolioUrl: String,
    gigsCompleted: { type: Number, default: 0 },
    earnings: { type: Number, default: 0 },
    specialization: [String]
  },
  documentLocker: [{
    docName: String,
    docUrl: String,
    verified: { type: Boolean, default: false }
  }],
  aiInsights: {
    performancePrediction: String,
    riskAnalysis: String,
    suggestedFocusAreas: [String]
  },

  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);