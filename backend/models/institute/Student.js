const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  // --- ACCOUNT TYPE ---
  accountType: { 
    type: String, 
    enum: ['institute', 'independent'], 
    default: 'institute' 
  },
  verificationStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'approved' 
  },
  trustLevel: { 
    type: String, 
    enum: ['self_declared', 'document_verified', 'institution_verified'], 
    default: 'institution_verified' 
  },

  // --- CORE FIELDS ---
  instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute' }, // Optional for independent
  SID: { type: String, required: true }, 
  name: { type: String, required: true },
  preferredLanguage: { type: String, default: 'en' },
  source: { type: String, default: 'direct' },
  
  // --- BASIC INFO ---
  rollNumber: { type: String }, 
  email: { type: String },
  phone: { type: String },
  section: { type: String },      
  admissionNo: { type: String },  
  department: { type: String }, 
  year: { type: String }, 
  semester: { type: String },
  profilePic: { type: String },
  password: { type: String },

  // --- INDEPENDENT STUDENT PROFILE ---
  independentProfile: {
    country: { type: String },
    state: { type: String },
    city: { type: String },
    institutionName: { type: String },
    institutionType: { 
      type: String, 
      default: 'Other'
    },
    board: { type: String }, // CBSE, ICSE, State Board, VTU, DTE Karnataka, Other
    programName: { type: String },
    academicYear: { type: String },
    currentSubjects: [{ type: String }],
    careerInterests: [{ type: String }],
    targetExams: [{ type: String }],
    preferredSkills: [{ type: String }]
  },

  // --- UPLOADED DOCUMENTS (Optional Verification) ---
  documents: {
    studentIdCard: { type: String },
    feeReceipt: { type: String },
    bonafideCert: { type: String },
    institutionalEmail: { type: String }
  },

  // --- PREVIOUS EDUCATION ---
  previousEducation: {
    primary: {
      schoolName: { type: String },
      board: { type: String },      // e.g., CBSE, ICSE, State Board
      marks: { type: String },      // String used to handle %, CGPA or Grades
      city: { type: String },
      state: { type: String },
      yearOfPassing: { type: String } // Optional: Good to have
    },
    secondary: {
      schoolName: { type: String },
      board: { type: String },
      marks: { type: String },
      city: { type: String },
      state: { type: String },
      yearOfPassing: { type: String } // Optional: Good to have
    }
  },

  // --- KYC ---
  kyc: {
    verified: { type: Boolean, default: false },
    kycType: { type: String, default: null }, // e.g., 'aadhar'
    aadharLast4: { type: String, default: null } 
  },

  // --- ACADEMIC (Current Institute) ---
  academic: {
    cgpa: { type: Number, default: 0 }, 
    semesterResults: [{
      semester: String,
      sgpa: Number
    }],
    creditsEarned: { type: Number, default: 0 }
  },

  // --- DETAILED COURSE MAPPING (For Marks) ---
  courseEnrollments: [{
    semester: { type: String, required: true },
    subjects: [{
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
      facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
      courseCode: String,
      courseName: String,
      
      // Detailed Marks Breakdown
      marksDetails: {
        test1: { type: Number, default: 0 },
        test2: { type: Number, default: 0 },
        test3: { type: Number, default: 0 },
        assignment: { type: Number, default: 0 },
        external: { type: Number, default: 0 } 
      },

      // Calculated Total
      marksObtained: { type: Number, default: 0 } 
    }]
  }],
  
  attendance: {
    overallPercentage: { type: Number, default: 0 },
    alertLevel: { type: String, enum: ['Safe', 'Warning', 'Critical'], default: 'Safe' }
  },

  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);