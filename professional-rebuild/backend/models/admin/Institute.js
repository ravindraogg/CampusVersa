const mongoose = require('mongoose');

const InstituteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  address: String,
  status: { type: String, enum: ['Active', 'Pending', 'Suspended'], default: 'Pending' },
  accreditationScore: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Institute', InstituteSchema);