const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
  target: String, // Code or ID of the affected entity
  details: String, // Detailed message (e.g., "Changed status to Active")
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Log', LogSchema);