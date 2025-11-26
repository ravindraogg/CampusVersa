const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
  DID: { type: String, required: true, unique: true }, // auto-generated: <CLG_SHORT><DEPT_CODE><RAND3>
  name: { type: String, required: true },
  code: { type: String, required: true, uppercase: true }, // e.g. CD
  section: { type: String, default: 'A' },
  facultyCount: { type: Number, default: 0 },
  genre: { type: String }, // editable by institute (B option)
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Department', DepartmentSchema);
