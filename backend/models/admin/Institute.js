const mongoose = require('mongoose');

const InstituteSchema = new mongoose.Schema({
  IID: {
    type: String,
    required: true,
    unique: true
  },

  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  source: { type: String, default: 'direct' },

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

  accreditation: [
    {
      type: { type: String, required: true }, 
      status: { type: Boolean, default: false },
      grade: { type: String },
      score: { type: Number }
    }
  ],
  authorizedFaculty: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Faculty' 
  }],
  status: {
    type: String,
    enum: ['Active', 'Pending', 'Suspended', 'Rejected'],
    default: 'Pending'
  },

  accreditationScore: Number, // Optional now
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Institute', InstituteSchema);
