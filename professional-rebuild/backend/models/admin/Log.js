const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  action: String,
  adminId: mongoose.Schema.Types.ObjectId,
  target: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Log', LogSchema);