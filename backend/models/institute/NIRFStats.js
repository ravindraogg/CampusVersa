const mongoose = require('mongoose');

const NIRFStatsSchema = new mongoose.Schema({
  instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },

  // If this is filled by an INDIVIDUAL FACULTY (NIRF-C)
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', default: null },

  academicYear: { type: String, required: true, default: "2024-2025" },
  status: { type: String, enum: ['Draft', 'Submitted', 'Archived'], default: 'Draft' },

  // --------------------------------------
  //  B — INSTITUTE LEVEL NIRF SHEET
  // --------------------------------------
  studentStrength: {
    sanctionedIntake: Number,
    totalEnrolled: Number,
    diversity: {
      withinState: Number,
      outsideState: Number,
      outsideCountry: Number,
      economicallyBackward: Number,
      sociallyChallenged: Number
    }
  },

  facultyDetails: {
    totalFaculty: Number,
    phdCount: Number,
    femaleFaculty: Number,
    experience: {
      avgTeachingExp: Number,
      avgIndustryExp: Number
    }
  },

  financialResources: {
    capitalExpenditure: {
      library: Number,
      newEquipment: Number,
      engineeringWorkshops: Number,
      otherAssets: Number
    },
    operationalExpenditure: {
      salaries: Number,
      maintenance: Number,
      seminarsConferences: Number
    }
  },

  researchPerformance: {
    publications: {
      scopus: Number,
      webOfScience: Number,
      googleScholar: Number,
      ici: Number
    },
    citations: {
      totalCitations: Number,
      citationsPerPaper: Number,
      hIndex: Number
    },
    ipr: {
      patentsFiled: Number,
      patentsPublished: Number,
      patentsGranted: Number,
      patentsLicensed: Number
    },
    sponsoredResearch: {
      projectCount: Number,
      totalFundingAmount: Number
    },
    consultancy: {
      projectCount: Number,
      totalAmount: Number
    }
  },

  graduationOutcomes: {
    studentsGraduated: Number,
    placements: {
      studentsPlaced: Number,
      medianSalary: Number
    },
    higherStudies: Number,
    phdStudentsGraduated: Number
  },

  outreachInclusivity: {
    womenDiversityPercentage: Number,
    physicallyChallengedStudents: Number,
    outreachPrograms: Number
  },

  perception: {
    peerPerceptionScore: Number,
    awardsAndRecognitions: Number
  },

  other: {
    booksPublished: Number,
    phdGuided: Number
  },

  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NIRFStats', NIRFStatsSchema);