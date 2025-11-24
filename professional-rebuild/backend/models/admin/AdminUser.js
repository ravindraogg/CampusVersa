const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // In prod, use bcrypt
  role: { type: String, default: 'super-admin' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdminUser', AdminSchema);