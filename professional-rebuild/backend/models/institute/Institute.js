const mongoose = require('mongoose');

const InstituteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true }, // Login ID
  email: { type: String, required: true },
  password: { type: String, required: true },
  aisheCode: { type: String },
  address: String,
  
  // --- NEW FIELDS ---
  logo: { type: String },       // Stores Base64 image string
  themeColor: { type: String }, // Stores Hex Code (e.g., #66BB6A)
  website: { type: String },    // Added website field as used in the profile update
  
  status: { 
    type: String, 
    enum: ['Active', 'Pending', 'Suspended', 'Rejected'], 
    default: 'Pending' 
  },
  accreditationScore: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Institute', InstituteSchema);