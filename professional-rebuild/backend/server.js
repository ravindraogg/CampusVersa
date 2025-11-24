// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// models
const AdminUser = require('./models/admin/AdminUser');
const Institute = require('./models/admin/Institute');
const Log = require('./models/admin/Log');

// middleware
const { verifyToken } = require('./middleware/authMiddleware');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

// 1. Admin Login (NO BCRYPT)
app.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Simple lookup
    const user = await AdminUser.findOne({ username: username.trim() });

    if (!user) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    // Plain-text password check
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      role: user.role,
      message: "Login Successful"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ---------------------------
// ADMIN API (protected)
// ---------------------------

// GET /admin/analytics
// Returns live counts from DB (no mocks)
app.get('/admin/analytics', verifyToken, async (req, res) => {
  try {
    const totalInstitutes = await Institute.countDocuments();
    const activeInstitutes = await Institute.countDocuments({ status: 'Active' });
    const pendingApprovals = await Institute.countDocuments({ status: 'Pending' });

    // If you later add Student/Faculty models, replace these with real counts.
    res.json({
      totalInstitutes,
      activeInstitutes,
      pendingApprovals
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// POST /admin/createInstitute
app.post('/admin/createInstitute', verifyToken, async (req, res) => {
  try {
    const { name, code, email, address } = req.body;
    if (!name || !code || !email) return res.status(400).json({ message: 'name, code and email required' });

    const existing = await Institute.findOne({ code: code.trim() });
    if (existing) return res.status(400).json({ message: 'Institute Code already exists' });

    const newInst = new Institute({
      name: name.trim(),
      code: code.trim(),
      email: email.trim(),
      address: address ? address.trim() : ''
    });
    await newInst.save();

    await Log.create({ action: 'CREATE_INSTITUTE', adminId: req.user.id, target: newInst.code });
    res.status(201).json({ message: 'Institute created successfully', data: newInst });
  } catch (err) {
    console.error('Create institute error:', err);
    res.status(500).json({ error: 'Failed to create institute' });
  }
});

// GET /admin/getAllInstitutes
app.get('/admin/getAllInstitutes', verifyToken, async (req, res) => {
  try {
    const institutes = await Institute.find().sort({ createdAt: -1 });
    res.json(institutes);
  } catch (err) {
    console.error('Get institutes error:', err);
    res.status(500).json({ error: 'Failed to fetch institutes' });
  }
});

// PUT /admin/updateInstitute/:id  { status }
app.put('/admin/updateInstitute/:id', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Active', 'Pending', 'Suspended'].includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const institute = await Institute.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!institute) return res.status(404).json({ message: 'Institute not found' });

    await Log.create({ action: `UPDATE_STATUS_${status.toUpperCase()}`, adminId: req.user.id, target: institute.code });
    res.json({ message: 'Institute status updated', data: institute });
  } catch (err) {
    console.error('Update institute error:', err);
    res.status(500).json({ error: 'Failed to update institute' });
  }
});

// GET /admin/logs
app.get('/admin/logs', verifyToken, async (req, res) => {
  try {
    const logs = await Log.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    console.error('Get logs error:', err);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Example: POST /admin/broadcast  { title, message, target }
// We'll store minimal announcements in logs for now
app.post('/admin/broadcast', verifyToken, async (req, res) => {
  try {
    const { title, message, target = 'all' } = req.body;
    if (!title || !message) return res.status(400).json({ message: 'title and message required' });

    await Log.create({ action: `BROADCAST:${title}`, adminId: req.user.id, target });
    res.json({ message: 'Broadcast recorded' });
  } catch (err) {
    console.error('Broadcast error:', err);
    res.status(500).json({ error: 'Failed to broadcast' });
  }
});

// Fallback
app.use((req, res) => res.status(404).json({ message: 'Not Found' }));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Admin Server running on port ${PORT}`));
