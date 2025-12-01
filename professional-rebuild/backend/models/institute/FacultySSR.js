const mongoose = require('mongoose');

const FacultySSRSchema = new mongoose.Schema({
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
  
  // 1. Personal Academic Details (Criteria 1)
  personal: {
    qualifications: String, // e.g., "M.Tech, Ph.D"
    specialization: String,
    experienceTeaching: Number,
    experienceIndustry: Number,
    awards: String
  },

  // 2. Teaching & Learning (Criteria 2)
  teaching: [{
    courseName: String,
    semester: String,
    methodology: String, // "Chalk & Talk", "Flipped Class", etc.
    ictTools: String, // "PPT, Google Classroom"
    innovation: String // "Project-based learning"
  }],

  // 3. Evaluation Related (Criteria 2)
  evaluation: {
    paperSettingCount: { type: Number, default: 0 },
    evaluationCount: { type: Number, default: 0 },
    rubricsUsed: { type: Boolean, default: false },
    copoMappingDone: { type: Boolean, default: false }
  },

  // 4. Research & Contributions (Criteria 3)
  research: {
    publications: [{
      title: String,
      journal: String,
      year: String,
      link: String
    }],
    fdpAttended: [{
      title: String,
      organizer: String,
      duration: String
    }],
    projectsGuided: { type: Number, default: 0 }
  },

  // 5. Extension Activities (Criteria 3 & 7)
  extension: [{
    activityName: String,
    role: String, // "Coordinator", "Participant"
    date: Date,
    impact: String
  }],

  // 6. Student Support (Criteria 5)
  mentoring: {
    menteesCount: { type: Number, default: 0 },
    meetingsHeld: { type: Number, default: 0 },
    remedialClassesTaken: { type: Number, default: 0 }
  },

  // 7. Uploaded Documents (Centralized Proofs)
  documents: [{
    category: String, // "Lesson Plan", "Certificate", "Question Paper"
    title: String,
    url: String, // Base64 or Link
    uploadedAt: { type: Date, default: Date.now }
  }],

  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FacultySSR', FacultySSRSchema);