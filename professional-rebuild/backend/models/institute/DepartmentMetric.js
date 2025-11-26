const mongoose = require('mongoose');

const DepartmentMetricSchema = new mongoose.Schema({
  instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
  department: { type: String, required: true },
  year: { type: String, required: true }, // e.g., "2024-2025"
  studentCount: { type: Number, default: 0 },
  facultyCount: { type: Number, default: 0 },
  publications: { type: Number, default: 0 },
  placements: { type: Number, default: 0 }, // Percentage or count
  researchGrants: { type: Number, default: 0 }, // In currency
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DepartmentMetric', DepartmentMetricSchema);