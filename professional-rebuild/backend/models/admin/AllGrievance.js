const mongoose = require('mongoose');

const AllGrievanceSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  instituteId: { type: String }, // Optional: link to Institute Code
  subject: { type: String, required: true },
  description: { type: String, required: true },
  raisedBy: { type: String, default: 'Institute Admin' },
  status: { 
    type: String, 
    enum: ['Received', 'Accepted', 'Solving', 'Solved'], 
    default: 'Received' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
}, { collection: 'allgrievances' });

module.exports = mongoose.model('AllGrievance', AllGrievanceSchema);