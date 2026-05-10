const mongoose = require('mongoose');

const RequestsInstituteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  requestedCode: { type: String, required: true }, // The code they want
  aisheCode: { type: String },
  accreditation: String,
  email: { type: String, required: true },
  phone: String,
  website: String,
  state: String,
  pincode: String,
  notes: String,
  source: { type: String, default: 'direct' },
  urgency: { type: String },
  type: { type: String },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  replies: [{
    sender: { type: String }, // 'Admin' or 'Institute'
    message: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
}, { collection: 'requestsinstitute' }); // Explicitly setting collection name

module.exports = mongoose.model('RequestsInstitute', RequestsInstituteSchema);