const mongoose = require('mongoose');

const InstituteSchema = new mongoose.Schema({
  IID: {                              // NEW FIELD
    type: String,
    required: true,
    unique: true                      // PRIMARY UNIQUE IDENTIFIER
  },

  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },  // Login Option 2
  email: { type: String, required: true, unique: true }, // Login Option 3
  password: { type: String, required: true },

  aisheCode: { type: String },
  logo: { type: String },

  themeColorPrimary: { type: String },
  themeColorSecondary: { type: String },
  collegeNumber: { type: Number, default: 1 },
  website: String,
  phone: String,
  address: String,
  state: String,
  pincode: String,
  accreditation: String,

  status: {
    type: String,
    enum: ['Active', 'Pending', 'Suspended', 'Rejected'],
    default: 'Pending'
  },

  accreditationScore: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Institute', InstituteSchema);
