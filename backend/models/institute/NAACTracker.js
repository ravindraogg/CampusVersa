const mongoose = require('mongoose');

// Sub-schema for supporting documents (The "Evidence Locker")
const EvidenceSchema = new mongoose.Schema({
  title: String,       // e.g., "Academic Calendar 2024"
  url: String,         // URL to S3/Firebase/Local file
  type: String,        // 'PDF', 'Image', 'Excel'
  uploadedAt: { type: Date, default: Date.now }
});

// Sub-schema for specific metrics within a criteria
const MetricSchema = new mongoose.Schema({
  metricId: String,    // e.g., "1.1.1"
  type: { type: String, enum: ['QnM', 'QlM'] }, // Quantitative or Qualitative
  description: String, // e.g., "Curriculum Delivery"
  value: String,       // For QnM: "85%", "150 students"
  proofAttached: Boolean
});

const CriteriaSchema = new mongoose.Schema({
  id: Number,          // 1 to 7
  name: String,        // e.g., "Curricular Aspects"
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Submitted', 'Verified', 'Rejected'],
    default: 'Pending' 
  },
  
  // Scoring
  weightage: Number,   // Total weight of this criteria (e.g., 150)
  obtainedScore: Number, 
  
  // AI & Feedback
  suggestion: String, 
  adminComments: String,

  // The actual SSR Content
  submissionText: String, // The descriptive QlM summary (350-500 words)
  
  // Data for QnM (The "Hard Numbers")
  metrics: [MetricSchema],

  // The Evidence Locker
  evidenceFiles: [EvidenceSchema],

  lastUpdated: Date
});

const NAACTrackerSchema = new mongoose.Schema({
  instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
  academicYear: String, // e.g., "2024-2025"
  
  // The 7 Criteria
  criteria: [CriteriaSchema],
  
  // Overall Status
  iiqaStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  ssrStatus: { type: String, enum: ['Draft', 'Submitted'], default: 'Draft' },
  
  overallCGPA: Number,
  projectedGrade: String // e.g., "A+" based on internal calc
}, { timestamps: true });

module.exports = mongoose.model('NAACTracker', NAACTrackerSchema);