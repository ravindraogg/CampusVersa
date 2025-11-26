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
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'requestsinstitute' }); // Explicitly setting collection name

module.exports = mongoose.model('RequestsInstitute', RequestsInstituteSchema);