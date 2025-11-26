const mongoose = require('mongoose');

const FacultySchema = new mongoose.Schema({
  instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
  FID: { type: String, required: true, unique: true }, // generated: <CLG_NO><CLG_SHORT><DEPT_CODE><SEQ3>
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  designation: { type: String },
  department: { type: String, required: true }, // store department.code (e.g. CD)
  position: { type: String },
  workingHours: { type: String },
  ssrStatus: { type: String }, // SSR status
  naacFollowing: { type: Boolean, default: false },
  profilePic: { type: String }, // base64 or URL
  loginId: { type: String },
  password: { type: String }, // keep as plain for now (you can hash later)
  joinedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Faculty', FacultySchema);
