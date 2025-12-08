const mongoose = require('mongoose');

const NIRFStatsSchema = new mongoose.Schema({
  instituteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institute',
    required: true
  },
  // ADDED: Optional Faculty ID to support Level C data in same collection
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    default: null 
  },
  academicYear: {
    type: String, 
    required: true,
    default: "2024-2025"
  },
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Archived'],
    default: 'Draft'
  },

  // ==========================================
  // LEVEL B & C SHARED FIELDS
  // ==========================================
  
  // Faculty won't fill Student Strength, but Institute will.
  studentStrength: {
    sanctionedIntake: { type: Number, default: 0 },
    totalEnrolled: { type: Number, default: 0 },
    diversity: {
      withinState: { type: Number, default: 0 },
      outsideState: { type: Number, default: 0 },
      outsideCountry: { type: Number, default: 0 },
      economicallyBackward: { type: Number, default: 0 },
      sociallyChallenged: { type: Number, default: 0 },
    }
  },

  // Faculty fills their own details here (e.g. experience), Admin aggregates totals
  facultyDetails: {
    totalFaculty: { type: Number, default: 0 }, // Admin uses this for count
    phdCount: { type: Number, default: 0 }, 
    femaleFaculty: { type: Number, default: 0 },
    experience: {
      avgTeachingExp: { type: Number, default: 0 }, 
      avgIndustryExp: { type: Number, default: 0 }
    }
  },

  // Faculty can enter project funding here, Admin aggregates to Total
  financialResources: {
    capitalExpenditure: {
      library: { type: Number, default: 0 },
      newEquipment: { type: Number, default: 0 },
      engineeringWorkshops: { type: Number, default: 0 },
      otherAssets: { type: Number, default: 0 }
    },
    operationalExpenditure: {
      salaries: { type: Number, default: 0 },
      maintenance: { type: Number, default: 0 },
      seminarsConferences: { type: Number, default: 0 }
    }
  },

  // MAIN FACULTY INPUT SECTION (Aggregates perfectly)
  researchPerformance: {
    publications: {
      scopus: { type: Number, default: 0 },
      webOfScience: { type: Number, default: 0 },
      googleScholar: { type: Number, default: 0 }, 
      ici: { type: Number, default: 0 }
    },
    citations: {
      totalCitations: { type: Number, default: 0 },
      citationsPerPaper: { type: Number, default: 0 },
      hIndex: { type: Number, default: 0 } // Added hIndex for Faculty
    },
    ipr: {
      patentsFiled: { type: Number, default: 0 },
      patentsPublished: { type: Number, default: 0 },
      patentsGranted: { type: Number, default: 0 },
      patentsLicensed: { type: Number, default: 0 }
    },
    sponsoredResearch: {
      projectCount: { type: Number, default: 0 },
      totalFundingAmount: { type: Number, default: 0 }
    },
    consultancy: {
      projectCount: { type: Number, default: 0 },
      totalAmount: { type: Number, default: 0 }
    }
  },

  graduationOutcomes: {
    studentsGraduated: { type: Number, default: 0 },
    placements: {
      studentsPlaced: { type: Number, default: 0 },
      medianSalary: { type: Number, default: 0 } 
    },
    higherStudies: { type: Number, default: 0 },
    phdStudentsGraduated: { type: Number, default: 0 } // Faculty enters PhDs they guided
  },

  outreachInclusivity: {
    womenDiversityPercentage: { type: Number, default: 0 },
    physicallyChallengedStudents: { type: Number, default: 0 },
    outreachPrograms: { type: Number, default: 0 } 
  },

  perception: {
    peerPerceptionScore: { type: Number, default: 0 },
    awardsAndRecognitions: { type: Number, default: 0 }
  },

  // Extra field to track if a faculty wrote a book (for aggregation)
  other: {
    booksPublished: { type: Number, default: 0 },
    phdGuided: { type: Number, default: 0 }
  },

  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

NIRFStatsSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

module.exports = mongoose.model('NIRFStats', NIRFStatsSchema);