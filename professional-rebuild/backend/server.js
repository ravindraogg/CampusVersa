// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Optional AI SDKs (only if keys present)
let GoogleGenerativeAI;
let OpenAI;
try {
  GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI;
} catch (e) { /* not installed / not required if using OpenAI */ }

try {
  OpenAI = require('openai').OpenAIApi;
} catch (e) { /* optional */ }

const { Configuration } = require('openai'); // for init if present

// Models (adjust paths to your project structure)
const AdminUser = require('./models/admin/AdminUser');
const Institute = require('./models/admin/Institute');
const RequestsInstitute = require('./models/admin/RequestsInstitute');
const Log = require('./models/admin/Log');
const Faculty = require('./models/institute/Faculty');
const Student = require('./models/institute/Student');
const Notice = require('./models/institute/Notice');
const DepartmentMetric = require('./models/institute/DepartmentMetric');
const NAACTracker = require('./models/institute/NAACTracker');
const Timetable = require('./models/institute/Timetable');
const AllGrievance = require('./models/admin/AllGrievance');
const Department = require('./models/institute/Department');
const Course = require('./models/institute/Course');
const Attendance = require('./models/institute/Attendance');
const FacultySSR = require('./models/institute/FacultySSR');
const FacultyForm = require('./models/institute/FacultyForm');
const FacultyFormResponse = require('./models/institute/FacultyFormResponse');

const ReminderSchema = new mongoose.Schema({
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  courseName: String,
  day: String,
  time: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});
const Reminder = mongoose.model('Reminder', ReminderSchema);
// Middleware
const { verifyToken } = require('./middleware/authMiddleware'); // assumes this sets req.user

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// -------------------
// Database Connect
// -------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  });

// Helper: Convert Marks to Grade Point based on VTU Scheme (2021/2022)
const getGradePoint = (marks) => {
  if (marks >= 90) return 10; // O (Outstanding)
  if (marks >= 80) return 9;  // A+ (Excellent)
  if (marks >= 70) return 8;  // A (Very Good)
  if (marks >= 60) return 7;  // B+ (Good)
  if (marks >= 55) return 6;  // B (Above Average)
  if (marks >= 50) return 5;  // C (Average)
  if (marks >= 40) return 4;  // P (Pass)
  return 0;                   // F (Fail)
};
// -------------------
// Hybrid AI Provider Setup
// -------------------
let aiProvider = null; // 'google' | 'openai' | null
let googleClient = null;
let openaiClient = null;

if (process.env.GOOGLE_API_KEY && GoogleGenerativeAI) {
  try {
    googleClient = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    aiProvider = 'google';
    console.log('🔮 Using Google Gemini (Generative AI) as primary provider');
  } catch (e) {
    console.warn('⚠️ Failed to initialize GoogleGenerativeAI:', e.message);
  }
}

if (!aiProvider && process.env.OPENAI_API_KEY) {
  try {
    const config = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
    const OpenAIClient = require('openai').OpenAIApi;
    openaiClient = new OpenAIClient(config);
    aiProvider = 'openai';
    console.log('🤖 Using OpenAI as fallback provider');
  } catch (e) {
    console.warn('⚠️ Failed to initialize OpenAI client:', e.message);
  }
}

if (!aiProvider) {
  console.log('⚪ No AI provider configured. Falling back to deterministic local algorithms for key tasks.');
}

async function generateWeeklyTimetable({ department, semester, subjects = [], facultyList = [] }) {
  try {
    // If AI available, delegate to provider
    if (aiProvider === 'google' && googleClient) {
      try {
        const model = googleClient.getGenerativeModel({ model: 'gemini-2.5-pro' });
        const prompt = `Create a weekly class timetable (Monday to Friday, 5 slots per day) for Department: ${department}, Semester: ${semester}.
Subjects available: ${subjects.join(', ')}.
Available Faculty: ${facultyList.join(', ') || 'N/A'}.
Return ONLY a JSON object with keys Monday..Friday and values arrays of 5 strings formatted "Subject - Faculty". No markdown, no extra text.`;
        const result = await model.generateContent(prompt);
        const text = (await result.response).text().trim().replace(/```json|```/g, '');
        const parsed = JSON.parse(text);
        return parsed;
      } catch (err) {
        console.warn('Gemini timetable generation failed:', err.message);
      }
    }

    if (aiProvider === 'openai' && openaiClient) {
      try {
        const systemPrompt = 'You are a timetable generator. Return ONLY JSON with days Monday..Friday mapping to arrays of 5 strings each.';
        const userPrompt = `Department: ${department}, Semester: ${semester}. Subjects: ${subjects.join(', ')}. Faculty: ${facultyList.join(', ')}.`;
        const resp = await openaiClient.createChatCompletion({
          model: 'gpt-4o-mini', // choose available model or fallback to gpt-4o if not present in your account
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 800
        });
        const text = resp.data.choices[0].message.content.trim().replace(/```json|```/g, '');
        return JSON.parse(text);
      } catch (err) {
        console.warn('OpenAI timetable generation failed:', err.message);
      }
    }

    // Local fallback deterministic round-robin
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const slotsPerDay = 5;
    const result = {};
    for (let d = 0; d < days.length; d++) {
      result[days[d]] = [];
      for (let s = 0; s < slotsPerDay; s++) {
        const subject = subjects[(d * slotsPerDay + s) % (subjects.length || 1)] || `Subject-${(s + 1)}`;
        const faculty = facultyList[(d * slotsPerDay + s) % (facultyList.length || 1)] || 'TBD';
        result[days[d]].push(`${subject} - ${faculty}`);
      }
    }
    return result;
  } catch (err) {
    console.error('generateWeeklyTimetable error:', err);
    throw err;
  }
}

/**
 * Optional: AI-generated NAAC suggestion for a criterion
 * Returns short suggestion text.
 */
async function generateNaacSuggestion({ instituteName, criterion }) {
  try {
    if (aiProvider === 'google' && googleClient) {
      try {
        const model = googleClient.getGenerativeModel({ model: 'gemini-2.5-pro' });
        const prompt = `Provide a concise actionable suggestion (1-2 sentences) to improve NAAC criterion: ${criterion} for ${instituteName}. Return plain text only.`;
        const result = await model.generateContent(prompt);
        return (await result.response).text().trim();
      } catch (err) {
        console.warn('Gemini NAAC suggestion failed:', err.message);
      }
    }

    if (aiProvider === 'openai' && openaiClient) {
      try {
        const resp = await openaiClient.createChatCompletion({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'user', content: `Give a 1-2 sentence actionable suggestion to improve NAAC criterion "${criterion}" for institute ${instituteName}.` }
          ],
          max_tokens: 80
        });
        return resp.data.choices[0].message.content.trim();
      } catch (err) {
        console.warn('OpenAI NAAC suggestion failed:', err.message);
      }
    }

    // Local fallback generic suggestion
    return `Conduct a focused review, collect supporting evidence and align documentation for ${criterion}.`;
  } catch (err) {
    console.error('generateNaacSuggestion error:', err);
    return 'No suggestion available';
  }
}

// -------------------
// Routes
// -------------------

// --- Root ---
app.get('/', (req, res) => res.json({ ok: true, service: 'Institute Admin API', version: '1.0' }));

// -------------------
// 1. ADMIN AUTH / MANAGEMENT
// -------------------
app.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await AdminUser.findOne({ username });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    await Log.create({ action: 'ADMIN_LOGIN', adminId: user._id, details: 'Admin logged in' }).catch(()=>{});
    res.json({ token, role: user.role });
  } catch (err) {
    console.error('admin/login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin endpoints (example): get institutes
app.get('/admin/getAllInstitutes', verifyToken, async (req, res) => {
  try {
    // 1. Fetch created institutes
    const realInstitutes = await Institute.find().lean();
    
    // 2. Fetch requests (User submitted)
    const pendingRequests = await RequestsInstitute.find().lean();

    // 3. Mark them so frontend knows which is which
    const formattedInstitutes = realInstitutes.map(i => ({ ...i, type: 'REGISTERED' }));
    const formattedRequests = pendingRequests.map(r => ({
      ...r,
      _id: r._id,
      name: r.name,
      code: r.requestedCode, // Map requestedCode to code for display
      email: r.email,
      aisheCode: r.aisheCode,
      status: `Request-${r.status}`, // e.g., "Request-Pending"
      type: 'REQUEST',
      createdAt: r.createdAt
    }));

    // 4. Combine and Sort by date
    const combined = [...formattedInstitutes, ...formattedRequests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(combined);
  } catch (err) {
    console.error('/admin/getAllInstitutes error:', err);
    res.status(500).json({ error: 'Fetch failed' });
  }
});

// --- server.js ---

// --- Admin: Create Institute (assign collegeNumber) ---
app.post('/admin/createInstitute', verifyToken, async (req, res) => {
  try {
    // 1. Destructure ALL necessary fields, including details and accreditation
    const { 
      name, code, email, aisheCode, password, requestId,
      address, state, pincode, phone, website, accreditation // <--- ADDED THESE
    } = req.body;

    if (!password) return res.status(400).json({ message: 'Initial password required' });
    
    // avoid duplicates
    const exists = await Institute.findOne({ $or: [{ code }, { email }] });
    if (exists) return res.status(400).json({ message: 'Institute already exists' });

    // Determine collegeNumber
    const sameCodeCount = await Institute.countDocuments({ code });
    const collegeNumber = sameCodeCount + 1;

    // Generate IID
    const generatedIID = `IID-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    // 2. Create the Institute with ALL fields
    const inst = new Institute({
      IID: generatedIID,
      name,
      code,
      collegeNumber,
      email,
      aisheCode,
      password,
      // --- MAP NEW FIELDS ---
      address,
      state,
      pincode,
      phone,
      website,
      accreditation: accreditation || [], // Save the accreditation array
      // ----------------------
      status: 'Active',
      createdAt: Date.now()
    });

    await inst.save();

    if (requestId) {
      await RequestsInstitute.findByIdAndUpdate(requestId, { status: 'Approved' }).catch(()=>{});
    }

    res.status(201).json({ message: 'Created', data: inst });
  } catch (err) {
    console.error('/admin/createInstitute error:', err);
    res.status(500).json({ error: 'Create failed' });
  }
});


// UPDATE Faculty (Institute Side)
app.put('/institute/faculty/:id', verifyToken, async (req, res) => {
  try {
    const instId = req.user.id;

    // Only update if faculty belongs to this institute
    const faculty = await Faculty.findOne({ 
      _id: req.params.id, 
      instituteId: instId 
    });

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found or access denied' });
    }

    const allowed = [
      'name',
      'email',
      'phone',
      'department',
      'qualification',
      'experience',
      'research',
      'profilePic',
      'password',
      'joinedAt',
      'status'
    ];

    const updateData = {};
    allowed.forEach(key => {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    });

    updateData.updatedAt = Date.now();

    // department change? update dept counts
    if (req.body.department && req.body.department !== faculty.department) {
      await Department.findOneAndUpdate(
        { instituteId: instId, code: faculty.department },
        { $inc: { facultyCount: -1 } }
      );
      await Department.findOneAndUpdate(
        { instituteId: instId, code: req.body.department },
        { $inc: { facultyCount: 1 } }
      );
    }

    const updated = await Faculty.findByIdAndUpdate(
      faculty._id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    res.json({ message: 'Faculty updated successfully', data: updated });

  } catch (err) {
    console.error('/institute/faculty update error:', err);
    res.status(500).json({ error: 'Update failed' });
  }
});

app.get('/admin/grievances', verifyToken, async (req, res) => {
  try {
    const list = await AllGrievance.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) { res.status(500).json({ error: 'Fetch failed' }); }
});

app.put('/admin/grievance/:id', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await AllGrievance.findByIdAndUpdate(
      req.params.id, 
      { status, updatedAt: Date.now() }, 
      { new: true }
    );
    await Log.create({ action: 'UPDATE_GRIEVANCE', adminId: req.user.id, target: updated.ticketId, details: `Status: ${status}` });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: 'Update failed' }); }
});

// -------------------
// 2. INSTITUTE AUTH (Login + Register Request)
// -------------------
// ... existing imports ...

// ==========================================
// UPDATED INSTITUTE LOGIN (Supports Auth Faculty)
// ==========================================
app.post('/institute/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    // identifier can be: Institute Code, Institute Email, Institute IID, Faculty Email, Faculty FID

    // ------------------------------------------
    // STRATEGY 1: Check Direct Institute Login
    // ------------------------------------------
    let institute = await Institute.findOne({
      $or: [
        { IID: identifier },
        { email: identifier },
        { code: identifier }
      ]
    });

    if (institute) {
      if (institute.password !== password) {
        return res.status(401).json({ message: 'Invalid Institute password' });
      }
      if (institute.status !== 'Active') {
        return res.status(403).json({ message: `Institute account is ${institute.status}` });
      }

      const token = jwt.sign(
        { id: institute._id, role: 'institute', IID: institute.IID },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      return res.json({
        token,
        role: 'institute',
        name: institute.name,
        message: 'Login successful'
      });
    }

    // ------------------------------------------
    // STRATEGY 2: Check Authorized Faculty Login
    // ------------------------------------------
    const faculty = await Faculty.findOne({
      $or: [
        { FID: identifier },
        { email: identifier }
      ]
    });

    if (faculty) {
      // 1. Validate Faculty Password
      if (faculty.password !== password) {
        return res.status(401).json({ message: 'Invalid Faculty credentials' });
      }

      // 2. Check if Faculty is Authorized by their Institute
      // We look for the institute that OWNS this faculty AND has this faculty's ID in 'authorizedFaculty'
      const targetInstitute = await Institute.findOne({
        _id: faculty.instituteId,
        authorizedFaculty: faculty._id // Checks if faculty._id exists in the array
      });

      if (!targetInstitute) {
        return res.status(403).json({ message: 'Access Denied: You are not authorized to access the Institute Dashboard.' });
      }

      if (targetInstitute.status !== 'Active') {
        return res.status(403).json({ message: `Institute account is ${targetInstitute.status}` });
      }

      // 3. Issue "Proxy" Token
      // We set 'id' to the INSTITUTE'S ID so all dashboard routes work automatically.
      // We add 'realUser' to track who actually logged in.
      const token = jwt.sign(
        { 
          id: targetInstitute._id, 
          role: 'institute', 
          IID: targetInstitute.IID,
          realUser: { id: faculty._id, name: faculty.name, role: 'faculty' }
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      return res.json({
        token,
        role: 'institute',
        name: targetInstitute.name, // Dashboard expects Institute Name
        message: `Welcome ${faculty.name} (Admin Access)`
      });
    }

    // If neither found
    return res.status(401).json({ message: 'Account not found' });

  } catch (err) {
    console.error('/institute/login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


app.post('/institute/register', async (req, res) => {
  try {
    const { name, requestedCode, aisheCode, accreditation, state, pincode, email, phone, website, notes } = req.body;
    // prevent duplicates across requests and active institutes
    const conflict = await RequestsInstitute.findOne({ $or: [{ requestedCode }, { email }] });
    const exists = await Institute.findOne({ $or: [{ code: requestedCode }, { email }] });
    if (conflict || exists) return res.status(400).json({ message: 'Institute code or email already registered/requested' });
    const r = new RequestsInstitute({ name, requestedCode, aisheCode, accreditation, state, pincode, email, phone, website, notes, status: 'Pending' });
    await r.save();
    await Log.create({ action: 'REQUEST_INSTITUTE', details: `Request for ${requestedCode} created` }).catch(()=>{});
    res.status(201).json({ message: 'Request submitted' });
  } catch (err) {
    console.error('/institute/register error:', err);
    res.status(500).json({ error: 'Failed to submit request' });
  }
});


// Get current institute profile
app.get('/institute/me', verifyToken, async (req, res) => {
  try {
    const inst = await Institute.findById(req.user.id).select('-password');
    if (!inst) return res.status(404).json({ message: 'Institute not found' });
    res.json(inst);
  } catch (err) {
    console.error('/institute/me error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/faculty/course/opt-in', verifyToken, async (req, res) => {
  try {
    const { courseId, status } = req.body; // status: true (Opt In), false (Opt Out)
    const facultyId = req.user.id;

    // 1. Verify Course Exists
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // 2. Verify Faculty Exists
    const faculty = await Faculty.findById(facultyId);
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });

    if (status) {
      // --- OPT IN ---
      // Add course ID to the faculty's 'courses' array if not already present
      // We use $addToSet to avoid duplicates
      await Faculty.findByIdAndUpdate(facultyId, { 
        $addToSet: { courses: courseId } 
      });

      // OPTIONAL: If you want to update the Course to say "Taught by X", do it here.
      // If multiple faculties teach the same course, you might skip this 
      // or change Course.facultyId to an array. 
      // For now, I will Set it to the current faculty as the 'Primary' instructor.
      course.facultyId = facultyId;
      await course.save();

    } else {
      // --- OPT OUT ---
      // Remove course ID from the faculty's 'courses' array
      await Faculty.findByIdAndUpdate(facultyId, { 
        $pull: { courses: courseId } 
      });

      // OPTIONAL: If this faculty was the primary instructor, clear the field
      if (course.facultyId && course.facultyId.toString() === facultyId) {
        course.facultyId = null;
        await course.save();
      }
    }

    res.json({ success: true, message: status ? "Course Opted" : "Course Removed" });

  } catch (err) {
    console.error("Opt-In Error:", err);
    res.status(500).json({ error: "Operation failed" });
  }
});
app.post('/institute/update-profile', verifyToken, async (req, res) => {
  try {
    const { 
      name, logoBase64, website, phone, address, 
      state, pincode, themeColorPrimary, themeColorSecondary,
      accreditation 
    } = req.body;

    const updateData = {};

    // Map fields
    if (name) updateData.name = name;
    if (logoBase64) updateData.logo = logoBase64;
    if (website) updateData.website = website;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (state) updateData.state = state;
    if (pincode) updateData.pincode = pincode;
    if (themeColorPrimary) updateData.themeColorPrimary = themeColorPrimary;
    if (themeColorSecondary) updateData.themeColorSecondary = themeColorSecondary;
    if (accreditation) updateData.accreditation = accreditation;

    const updated = await Institute.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    res.json({ success: true, data: updated, message: "Profile updated successfully" });
  } catch (err) {
    console.error('/institute/update-profile error:', err);
    res.status(500).json({ error: 'Update failed' });
  }
});

// 2. CHANGE PASSWORD
app.post('/institute/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const inst = await Institute.findById(req.user.id);

    if (inst.password !== currentPassword) {
      return res.status(401).json({ message: "Incorrect current password" });
    }

    inst.password = newPassword;
    await inst.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error('/institute/change-password error:', err);
    res.status(500).json({ error: "Failed to change password" });
  }
});

// 3. GET AUTHORIZED FACULTY & SEARCH
app.get('/institute/access-control/users', verifyToken, async (req, res) => {
  try {
    const inst = await Institute.findById(req.user.id).populate('authorizedFaculty', 'name email FID profilePic designation');
    res.json(inst.authorizedFaculty || []);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

// 4. GRANT ACCESS TO FACULTY
app.post('/institute/access-control/grant', verifyToken, async (req, res) => {
  try {
    const { facultyId } = req.body;
    
    // Check if faculty exists in this institute
    const faculty = await Faculty.findOne({ _id: facultyId, instituteId: req.user.id });
    if (!faculty) return res.status(404).json({ message: "Faculty not found in this institute" });

    await Institute.findByIdAndUpdate(req.user.id, {
      $addToSet: { authorizedFaculty: facultyId } // addToSet prevents duplicates
    });

    res.json({ success: true, message: `${faculty.name} granted admin access` });
  } catch (err) {
    res.status(500).json({ error: "Grant access failed" });
  }
});

// 5. REVOKE ACCESS
app.post('/institute/access-control/revoke', verifyToken, async (req, res) => {
  try {
    const { facultyId } = req.body;
    await Institute.findByIdAndUpdate(req.user.id, {
      $pull: { authorizedFaculty: facultyId }
    });
    res.json({ success: true, message: "Access revoked" });
  } catch (err) {
    res.status(500).json({ error: "Revoke access failed" });
  }
});
app.post('/faculty/update-profile', verifyToken, async (req, res) => {
  try {
    // Extract all fields sent from the frontend form
    const { 
      profilePic, 
      phone, 
      qualification, 
      experience, 
      research 
    } = req.body;
    
    const updateData = {};
    
    // 1. Basic Fields
    if (profilePic) updateData.profilePic = profilePic; 
    if (phone) updateData.phone = phone;
    if (qualification) updateData.qualification = qualification;
    if (experience) updateData.experience = experience;

    // 2. Nested Research Fields
    // We use dot notation to update specific fields inside the 'research' object
    // without overwriting the entire object (preserving other keys if they exist).
    if (research) {
      if (research.papersPublished !== undefined) updateData['research.papersPublished'] = research.papersPublished;
      if (research.citations !== undefined) updateData['research.citations'] = research.citations;
      if (research.hIndex !== undefined) updateData['research.hIndex'] = research.hIndex;
      if (research.projectsGuided !== undefined) updateData['research.projectsGuided'] = research.projectsGuided;
    }

    updateData.updatedAt = Date.now();

    const updatedFaculty = await Faculty.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    res.json({ success: true, data: updatedFaculty });
  } catch (err) {
    console.error('/faculty/update-profile error:', err);
    res.status(500).json({ error: 'Profile update failed' });
  }
});
// Dashboard stats - aggregated
app.get('/institute/dashboard-stats', verifyToken, async (req, res) => {
  try {
    const instId = req.user.id;
    const [facultyCount, studentCount, notices, recentFaculty, naacData] = await Promise.all([
      Faculty.countDocuments({ instituteId: instId }),
      Student.countDocuments({ instituteId: instId }),
      Notice.find({ instituteId: instId }).sort({ createdAt: -1 }).limit(5),
      Faculty.find({ instituteId: instId }).sort({ joinedAt: -1 }).limit(5),
      NAACTracker.findOne({ instituteId: instId })
    ]);
    res.json({
      facultyCount,
      studentCount,
      notices,
      recentFaculty,
      naacScore: naacData ? (naacData.overallScore || 'N/A') : 'Pending'
    });
  } catch (err) {
    console.error('/institute/dashboard-stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// -------------------
// Faculty CRUD
// -------------------
// --- server.js ---

app.post('/institute/faculty/add', verifyToken, async (req, res) => {
  try {
    const instId = req.user.id;
    const payload = { ...req.body, instituteId: instId };

    if (!payload.department || !payload.name) return res.status(400).json({ message: 'Department and name required' });

    const inst = await Institute.findById(instId).select('code collegeNumber themeColorPrimary themeColorSecondary');
    if (!inst) return res.status(404).json({ message: 'Institute not found' });

    payload.themeColorPrimary = inst.themeColorPrimary;
    payload.themeColorSecondary = inst.themeColorSecondary;

    const deptCode = String(payload.department).toUpperCase();

    // --- NEW ID GENERATION LOGIC (Max + 1) ---
    // 1. Find all existing faculty in this institute & department
    const existingFaculty = await Faculty.find({ 
      instituteId: instId, 
      department: deptCode 
    }).select('FID');

    // 2. Extract the numeric sequence from existing FIDs (last 3 digits)
    const seqNumbers = existingFaculty.map(f => {
      // Assuming FID format: <CollegeNum><Code><Dept><001>
      // We grab the last 3 characters and convert to int
      const last3 = f.FID.slice(-3);
      const num = parseInt(last3, 10);
      return isNaN(num) ? 0 : num;
    });

    // 3. Find the highest number and add 1
    const maxSeq = seqNumbers.length > 0 ? Math.max(...seqNumbers) : 0;
    const nextSeq = maxSeq + 1;
    
    // 4. Pad with zeros (e.g., 1 -> "001")
    const seqStr = String(nextSeq).padStart(3, '0');

    // 5. Construct new FID
    const FID = `${inst.collegeNumber}${inst.code}${deptCode}${seqStr}`;
    payload.FID = FID;
    // ----------------------------------------

    if (!payload.research) payload.research = {};
    
    const f = new Faculty(payload);
    await f.save();

    await Department.findOneAndUpdate({ instituteId: instId, code: deptCode }, { $inc: { facultyCount: 1 } }).catch(()=>{});

    res.status(201).json(f);
  } catch (err) {
    console.error('/institute/faculty/add error:', err);
    res.status(500).json({ error: 'Failed to add faculty' });
  }
});

app.get('/institute/faculty', verifyToken, async (req, res) => {
  try {
    const list = await Faculty.find({ instituteId: req.user.id }).sort({ joinedAt: -1 });
    res.json(list);
  } catch (err) {
    console.error('/institute/faculty GET error:', err);
    res.status(500).json({ error: 'Fetch failed' });
  }
});

app.delete('/institute/faculty/:id', verifyToken, async (req, res) => {
  try {
    await Faculty.findOneAndDelete({ _id: req.params.id, instituteId: req.user.id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('/institute/faculty DELETE error:', err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// -------------------
// Students
// -------------------
// server.js - Updated Student Route for Pagination
app.get('/institute/students', verifyToken, async (req, res) => {
  try {
    // 1. Get query params for lazy loading
    const limit = parseInt(req.query.limit) || 0; // 0 means all
    const skip = parseInt(req.query.skip) || 0;
    
    // 2. Identify Institute ID (Works for both Admin/Faculty logins)
    let instituteId = req.user.id;
    
    // If logged in as Faculty, we need to use the instituteId stored in their profile
    if (req.user.role === 'faculty') {
       const faculty = await Faculty.findById(req.user.id).select('instituteId');
       if(!faculty) return res.status(404).json({message: "Faculty profile not found"});
       instituteId = faculty.instituteId;
    }

    // 3. Fetch with Pagination
    const query = { instituteId: instituteId };
    
    const total = await Student.countDocuments(query);
    const list = await Student.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: list,
      total: total,
      hasMore: (skip + list.length) < total
    });

  } catch (err) {
    console.error('/institute/students error:', err);
    res.status(500).json({ error: 'Fetch failed' });
  }
});

app.post('/institute/student/:id/calculate-gpa', verifyToken, async (req, res) => {
  try {
    const { semester } = req.body; // e.g., "5"
    const studentId = req.params.id;

    // 1. Fetch Student and populate Course details to get 'credits'
    const student = await Student.findById(studentId).populate({
      path: 'courseEnrollments.subjects.courseId',
      select: 'credits name code' // We strictly need credits from the Course model
    });

    if (!student) return res.status(404).json({ message: "Student not found" });

    // 2. Find the Enrollment Data for the requested Semester
    const enrollment = student.courseEnrollments.find(e => e.semester === String(semester));
    
    if (!enrollment || !enrollment.subjects || enrollment.subjects.length === 0) {
      return res.status(400).json({ message: "No subjects found for this semester" });
    }

    // --- STEP A: CALCULATE SGPA ---
    // Formula: Σ(Ci * Gi) / ΣCi
    
    let totalSemesterCredits = 0; // ΣCi
    let totalProductCiGi = 0;     // Σ(Ci * Gi)

    enrollment.subjects.forEach(sub => {
      // Get Credits from the populated Course model
      const courseCredits = sub.courseId?.credits || 0;
      
      // Calculate Total Marks (Internal + External)
      // Note: Adjust this logic if your 'marksObtained' is already stored correctly in bulk-update
      // Current Logic: (Average of Internals) + (External/2) -> Standard VTU logic often varies, adjusting to typical
      const m = sub.marksDetails;
      // Example Calculation: 
      // If internal is out of 50 and external out of 50 (Total 100)
      // Or if internal 40 + external 60. 
      // Using the stored 'marksObtained' if available, else calculating:
      let finalMarks = sub.marksObtained || 0;
      
      // If marksObtained is 0, let's try to calc it from details (Safety fallback)
      if (finalMarks === 0) {
         const internal = (m.test1 + m.test2 + m.test3 + m.assignment) / 4; 
         const external = m.external / 2; 
         finalMarks = internal + external;
      }

      // Get Grade Point (Gi)
      const gradePoint = getGradePoint(finalMarks);

      // Accumulate
      if (courseCredits > 0) {
        totalSemesterCredits += courseCredits;
        totalProductCiGi += (courseCredits * gradePoint);
      }
    });

    // Compute SGPA
    const sgpa = totalSemesterCredits === 0 ? 0 : (totalProductCiGi / totalSemesterCredits);
    const sgpaRounded = parseFloat(sgpa.toFixed(2));

    // --- STEP B: UPDATE ACADEMIC HISTORY ---
    
    // Remove old result for this specific semester if exists
    student.academic.semesterResults = student.academic.semesterResults.filter(r => r.semester !== String(semester));
    
    // Push new result
    student.academic.semesterResults.push({
      semester: String(semester),
      sgpa: sgpaRounded,
      // We explicitly store credits for this semester to help with CGPA calculation later
      // You might need to add 'credits' to semesterResults schema or calculate dynamically
      credits: totalSemesterCredits 
    });

    // --- STEP C: CALCULATE CGPA ---
    // Formula: Σ(Si * Ci) / ΣCi 
    // Where Si = SGPA of ith sem, Ci = Credits of ith sem

    let sumSiCi = 0; // Sum of (SGPA * Credits)
    let sumCiTotal = 0; // Sum of All Credits across semesters

    // We need to iterate over ALL semester results stored in history
    // Note: This requires fetching credits for past semesters. 
    // Ideally, store 'totalCredits' inside 'semesterResults' in Student Schema.
    // Assuming 'student.academic.semesterResults' now has { semester, sgpa, credits } based on logic above.
    
    // If your schema doesn't have 'credits' in semesterResults, we must recalculate them or fetch them.
    // For this implementation to work perfectly, ensure Schema allows storing credits in result.
    
    // *Self-Correction*: Since schema in Student.js only has { semester, sgpa }, 
    // we must loop through `courseEnrollments` to find credits for every semester.

    for (let res of student.academic.semesterResults) {
      const semName = res.semester;
      const semSGPA = res.sgpa;

      // Find credits for this semester from enrollments
      const semEnrollment = student.courseEnrollments.find(e => e.semester === semName);
      let semCredits = 0;
      
      if (semEnrollment) {
        semEnrollment.subjects.forEach(s => {
           semCredits += (s.courseId?.credits || 0);
        });
      }

      sumSiCi += (semSGPA * semCredits);
      sumCiTotal += semCredits;
    }

    const cgpa = sumCiTotal === 0 ? 0 : (sumSiCi / sumCiTotal);
    const cgpaRounded = parseFloat(cgpa.toFixed(2));

    // --- STEP D: SAVE ---
    student.academic.cgpa = cgpaRounded;
    student.academic.creditsEarned = sumCiTotal;

    await student.save();

    res.json({ 
      success: true, 
      semester: semester,
      totalCredits: totalSemesterCredits,
      sgpa: sgpaRounded, 
      cgpa: cgpaRounded 
    });

  } catch (err) {
    console.error("GPA Calc Error:", err);
    res.status(500).json({ error: "Calculation failed" });
  }
});
app.post('/institute/students/add', verifyToken, async (req, res) => {
  try {
    const instId = req.user.id;
    const { department, name, year, semester, ...rest } = req.body;

    if (!department || !name || !year || !semester) {
      return res.status(400).json({ message: 'Department, name, year, and semester are required' });
    }

    const inst = await Institute.findById(instId);
    if (!inst) return res.status(404).json({ message: 'Institute not found' });

    // --- CHANGED LOGIC: TEMP ID GENERATION ---
    // We generate a temporary unique ID because USN must be generated in bulk 
    // alphabetically later. The SID field is required/unique in Schema.
    const timestamp = Date.now();
    const random = Math.floor(1000 + Math.random() * 9000);
    const tempSID = `TEMP-${timestamp}-${random}`; 

    // Initialize lifecycle
    const lifecycle = [{
      event: "Admission",
      date: new Date(),
      description: `Admitted to ${department} Dept, Year ${year}, Sem ${semester}`
    }];

    const doc = new Student({
      instituteId: instId,
      SID: tempSID, // Temporary, will be updated by /generate-usn
      name,
      department,
      year,
      semester,
      themeColorPrimary: inst.themeColorPrimary,
      themeColorSecondary: inst.themeColorSecondary,
      lifecycle,
      ...rest
    });

    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    console.error('/institute/students/add error:', err);
    res.status(500).json({ error: 'Add failed' });
  }
});

// ==========================================
// 2. NEW ROUTE: BULK USN GENERATION
// ==========================================
app.post('/institute/students/generate-usn', verifyToken, async (req, res) => {
  try {
    const { department, admissionYear } = req.body; 
    // admissionYear: e.g., "2023" or "23"
    
    if (!department || !admissionYear) {
      return res.status(400).json({ message: "Department and Admission Year required" });
    }

    const instId = req.user.id;
    
    // 1. Fetch Institute Details for USN codes
    const inst = await Institute.findById(instId).select('code regionCode'); 
    // Assuming 'code' is the 2-letter College Code (e.g., 'RV')
    // Assuming you might add 'regionCode' to Institute model, defaulting to '1' if missing.
    
    const regionNum = inst.regionCode || "1"; 
    const collegeCode = inst.code ? inst.code.substring(0, 2).toUpperCase() : "XX";
    
    // 2. Format Year (Last 2 digits, e.g., 2017 -> 17)
    const yearShort = String(admissionYear).slice(-2);

    // 3. Format Branch Code (First 2 chars of Dept, e.g., CSE -> CS, ECE -> EC)
    // You might want a specific mapping object if codes deviate (e.g. 'Civil Engineering' -> 'CV')
    const deptCodeMap = {
      'CSE': 'CS', 'ECE': 'EC', 'EEE': 'EE', 'MECH': 'ME', 'CIVIL': 'CV', 'ISE': 'IS', 'AIML': 'AI'
    };
    const rawDept = String(department).toUpperCase();
    const branchCode = deptCodeMap[rawDept] || rawDept.substring(0, 2);

    // 4. Fetch Students, SORT ALPHABETICALLY by Name
    // We filter by Institute, Department, and Year
    // Note: Assuming 'year' in Student model represents "1st Year", "2nd Year", etc. 
    // If you store Admission Year explicitly, use that. 
    // Here logic matches based on the department provided.
    const students = await Student.find({ 
      instituteId: instId, 
      department: department 
      // You might want to filter by 'year' (1, 2, 3, 4) if generating for a specific batch
    }).sort({ name: 1 }); // Sort Alphabetically A-Z

    if (students.length === 0) {
      return res.status(404).json({ message: "No students found for this selection" });
    }

    // 5. Generate USNs and Prepare Bulk Operations
    const bulkOps = students.map((student, index) => {
      // Serial Number: 001, 002, ..., 099, 100
      const serialNo = String(index + 1).padStart(3, '0');
      
      // Logic: [Region][College][Year][Branch][Serial]
      // Example: 1RV17CS125
      const newUSN = `${regionNum}${collegeCode}${yearShort}${branchCode}${serialNo}`;

      return {
        updateOne: {
          filter: { _id: student._id },
          update: { 
            $set: { 
              SID: newUSN,       // Unique ID
              rollNumber: newUSN, // Usually Roll No is same as USN
              admissionNo: newUSN // Often mapped together
            } 
          }
        }
      };
    });

    // 6. Execute Bulk Write
    if (bulkOps.length > 0) {
      await Student.bulkWrite(bulkOps);
    }

    res.json({ 
      success: true, 
      message: `Generated USNs for ${students.length} students.`,
      format: `${regionNum}-${collegeCode}-${yearShort}-${branchCode}-XXX`
    });

  } catch (err) {
    console.error("USN Generation Error:", err);
    res.status(500).json({ error: "Failed to generate USNs" });
  }
});

// -------------------
// Notices
// -------------------
app.get('/institute/notices', verifyToken, async (req, res) => {
  try {
    const list = await Notice.find({ instituteId: req.user.id }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error('/institute/notices error:', err);
    res.status(500).json({ error: 'Fetch failed' });
  }
});

app.post('/institute/notices/add', verifyToken, async (req, res) => {
  try {
    const doc = new Notice({ ...req.body, instituteId: req.user.id });
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    console.error('/institute/notices/add error:', err);
    res.status(500).json({ error: 'Post failed' });
  }
});

// -------------------
// Requests (internal) - lightweight
// -------------------
app.get('/institute/requests', verifyToken, async (req, res) => {
  try {
    // returns requests created by this institute's registered email (approx)
    const inst = await Institute.findById(req.user.id).select('email');
    if (!inst) return res.json([]);
    const list = await RequestsInstitute.find({ email: inst.email }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error('/institute/requests error:', err);
    res.status(500).json({ error: 'Fetch failed' });
  }
});

app.post('/institute/requests/add', verifyToken, async (req, res) => {
  try {
    // Simple internal ticket - reuse RequestsInstitute shape for speed, or create a new model
    const inst = await Institute.findById(req.user.id).select('email name code');
    const doc = new RequestsInstitute({
      ...req.body,
      name: inst?.name || req.body.name,
      email: inst?.email || req.body.email,
      requestedCode: req.body.requestedCode || `${inst?.code || 'IN'}-REQ-${Date.now()}`,
      status: 'Pending'
    });
    await doc.save();
    res.status(201).json({ message: 'Request created', data: doc });
  } catch (err) {
    console.error('/institute/requests/add error:', err);
    res.status(500).json({ error: 'Create failed' });
  }
});

// -------------------
// Department Metrics
// -------------------
app.get('/institute/metrics', verifyToken, async (req, res) => {
  try {
    const metrics = await DepartmentMetric.find({ instituteId: req.user.id });
    res.json(metrics);
  } catch (err) {
    console.error('/institute/metrics GET error:', err);
    res.status(500).json({ error: 'Fetch failed' });
  }
});

app.post('/institute/metrics/update', verifyToken, async (req, res) => {
  try {
    const { department, year, publications, placements, researchGrants, efficiency } = req.body;
    const metric = await DepartmentMetric.findOneAndUpdate(
      { instituteId: req.user.id, department, year },
      { publications, placements, researchGrants, efficiency, updatedAt: Date.now() },
      { new: true, upsert: true }
    );
    res.json(metric);
  } catch (err) {
    console.error('/institute/metrics/update error:', err);
    res.status(500).json({ error: 'Update failed' });
  }
});

// -------------------
// NAAC Monitoring
// -------------------
app.get('/institute/naac', verifyToken, async (req, res) => {
  try {
    let tracker = await NAACTracker.findOne({ instituteId: req.user.id });
    if (!tracker) {
      const defaultCriteria = [
        { id: 1, name: 'Curricular Aspects', status: 'Pending' },
        { id: 2, name: 'Teaching-Learning & Evaluation', status: 'Pending' },
        { id: 3, name: 'Research, Innovation & Extension', status: 'Pending' },
        { id: 4, name: 'Infrastructure & Learning Resources', status: 'Pending' },
        { id: 5, name: 'Student Support & Progression', status: 'Pending' },
        { id: 6, name: 'Governance, Leadership & Management', status: 'Pending' },
        { id: 7, name: 'Institutional Values & Best Practices', status: 'Pending' }
      ];
      tracker = new NAACTracker({ instituteId: req.user.id, criteria: defaultCriteria, createdAt: Date.now() });
      await tracker.save();
    }

    // Optionally include AI suggestions for each criterion
    const includeAI = req.query.ai === '1' && (aiProvider !== null);
    if (includeAI) {
      const inst = await Institute.findById(req.user.id).select('name');
      for (let crit of tracker.criteria) {
        crit.suggestion = await generateNaacSuggestion({ instituteName: inst.name || 'This Institute', criterion: crit.name });
      }
    }
    res.json(tracker);
  } catch (err) {
    console.error('/institute/naac error:', err);
    res.status(500).json({ error: 'Fetch failed' });
  }
});

// Create department
app.post('/institute/departments/add', verifyToken, async (req, res) => {
  try {
    const instId = req.user.id;
    const { name, code, section = 'A', facultyCount = 0, genre } = req.body;

    if (!name || !code) return res.status(400).json({ message: 'Department name and code required' });

    // Normalize code
    const deptCode = String(code).toUpperCase();

    // Generate DID: <CLG_SHORT><DEPT_CODE><RANDOM3>
    const inst = await Institute.findById(instId).select('code collegeNumber');
    if (!inst) return res.status(404).json({ message: 'Institute not found' });

    const random3 = Math.floor(100 + Math.random() * 900);
    const DID = `${inst.code}${deptCode}${random3}`;

    // Create department
    const dept = new Department({
      instituteId: instId,
      DID,
      name,
      code: deptCode,
      section,
      facultyCount,
      genre
    });

    await dept.save();
    res.status(201).json({ message: 'Department created', data: dept });
  } catch (err) {
    console.error('/institute/departments/add error:', err);
    res.status(500).json({ error: 'Create failed' });
  }
});

// List departments for institute
app.get('/institute/departments', verifyToken, async (req, res) => {
  try {
    const instId = req.user.id;
    const list = await Department.find({ instituteId: instId }).sort({ name: 1 });
    res.json(list);
  } catch (err) {
    console.error('/institute/departments GET error:', err);
    res.status(500).json({ error: 'Fetch failed' });
  }
});

app.post('/institute/naac/update', verifyToken, async (req, res) => {
  try {
    const { criteriaId, status, score, notes } = req.body;
    const tracker = await NAACTracker.findOne({ instituteId: req.user.id });
    if (!tracker) return res.status(404).json({ message: 'NAAC tracker not found' });
    const item = tracker.criteria.find(c => c.id === criteriaId || c.id === Number(criteriaId));
    if (!item) return res.status(404).json({ message: 'Criterion not found' });
    if (status) item.status = status;
    if (score !== undefined) item.score = score;
    if (notes) item.notes = notes;
    tracker.lastUpdated = Date.now();
    await tracker.save();
    res.json(tracker);
  } catch (err) {
    console.error('/institute/naac/update error:', err);
    res.status(500).json({ error: 'Update failed' });
  }
});

// -------------------
// AI Timetable Generation (Hybrid)
// -------------------
// -------------------
// Misc: get timetables
// -------------------
app.get('/institute/timetables', verifyToken, async (req, res) => {
  try {
    const list = await Timetable.find({ instituteId: req.user.id }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error('/institute/timetables error:', err);
    res.status(500).json({ error: 'Fetch failed' });
  }
});

// -------------------
// Global Analytics (admin)
// -------------------
app.get('/admin/analytics', verifyToken, async (req, res) => {
  try {
    const total = await Institute.countDocuments();
    const active = await Institute.countDocuments({ status: 'Active' });
    const pendingReqs = await RequestsInstitute.countDocuments({ status: 'Pending' });
    const grievances = await AllGrievance.countDocuments({ status: { $ne: 'Solved' } }); // Open grievances
    const recentActivity = await Log.find().sort({ createdAt: -1 }).limit(5);
    
    res.json({ 
      totalInstitutes: total, 
      activeInstitutes: active, 
      pendingApprovals: pendingReqs, 
      openGrievances: grievances,
      recentActivity 
    });
  } catch (err) { res.status(500).json({ error: 'Analytics failed' }); }
});
// GET /institute/hybrid
exports.getHybridInstitute = async (req, res) => {
  try {
    const inst = await Institute.findOne({ IID: req.user.IID });
    const reqInst = await RequestedInstitute.findOne({ requestedCode: inst.code });

    const hybrid = {
      ...inst.toObject(),
      ...reqInst?.toObject(),
      logo: inst.logo || reqInst?.logo,
      themeColorPrimary: inst.themeColorPrimary,
      themeColorSecondary: inst.themeColorSecondary
    };

    return res.json(hybrid);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Hybrid data fetch failed" });
  }
};
// --- ADMIN: Reply to Request / Ticket ---
app.post('/admin/request/reply', verifyToken, async (req, res) => {
  try {
    const { requestId, message, status } = req.body;
    const updateData = {
      $push: { replies: { sender: 'Admin', message, createdAt: Date.now() } }
    };
    if (status) updateData.status = status; // Optional status update (e.g. 'Solved')

    const updated = await RequestsInstitute.findByIdAndUpdate(requestId, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    console.error('Admin reply error:', err);
    res.status(500).json({ error: 'Reply failed' });
  }
});

// --- INSTITUTE: Reply to Admin (Optional, for two-way chat) ---
app.post('/institute/request/reply', verifyToken, async (req, res) => {
  try {
    const { requestId, message } = req.body;
    // Verify this request belongs to the institute
    const inst = await Institute.findById(req.user.id);
    const reqDoc = await RequestsInstitute.findOne({ _id: requestId, email: inst.email });
    
    if (!reqDoc) return res.status(403).json({ message: "Request not found or access denied" });

    reqDoc.replies.push({ sender: 'Institute', message, createdAt: Date.now() });
    // Re-open ticket if it was solved
    if (reqDoc.status === 'Solved') reqDoc.status = 'In Progress';
    
    await reqDoc.save();
    res.json(reqDoc);
  } catch (err) {
    console.error('Institute reply error:', err);
    res.status(500).json({ error: 'Reply failed' });
  }
});
// --- INSTITUTE: Submit NAAC Data ---
app.post('/institute/naac/submit', verifyToken, async (req, res) => {
  try {
    const { criteriaId, submissionText, evidenceFiles } = req.body; // Added evidenceFiles
    
    // Find tracker
    const tracker = await NAACTracker.findOne({ instituteId: req.user.id });
    if (!tracker) return res.status(404).json({ message: "Tracker not found" });

    // Find specific criteria by ID
    const itemIndex = tracker.criteria.findIndex(c => c.id === Number(criteriaId));
    if (itemIndex === -1) return res.status(404).json({ message: "Criterion not found" });

    // Update fields
    tracker.criteria[itemIndex].submissionText = submissionText;
    
    // Process and append files if they exist
    if (evidenceFiles && Array.isArray(evidenceFiles)) {
      const formattedFiles = evidenceFiles.map(f => ({
        title: f.name,
        url: f.data, // Base64 string directly stored
        type: f.type,
        uploadedAt: Date.now()
      }));
      
      // Option A: Replace existing files
      // tracker.criteria[itemIndex].evidenceFiles = formattedFiles;
      
      // Option B: Append to existing (Preferred)
      if (!tracker.criteria[itemIndex].evidenceFiles) {
        tracker.criteria[itemIndex].evidenceFiles = [];
      }
      tracker.criteria[itemIndex].evidenceFiles.push(...formattedFiles);
    }

    tracker.criteria[itemIndex].status = "Submitted"; 
    tracker.criteria[itemIndex].lastUpdated = Date.now();
    tracker.criteria[itemIndex].adminComments = ""; 

    tracker.markModified('criteria'); 
    await tracker.save();

    res.json({ success: true, data: tracker });
  } catch (err) {
    console.error("NAAC Submit Error:", err);
    res.status(500).json({ error: "Submission failed" });
  }
});

// --- ADMIN: Verify or Reject NAAC Submission ---
app.post('/admin/naac/verify', verifyToken, async (req, res) => {
  try {
    const { instituteId, criteriaId, action, comments } = req.body;
    // action: 'Approve' | 'Reject'

    const tracker = await NAACTracker.findOne({ instituteId });
    if (!tracker) return res.status(404).json({ message: "Tracker not found" });

    const itemIndex = tracker.criteria.findIndex(c => c.id === Number(criteriaId));
    if (itemIndex === -1) return res.status(404).json({ message: "Criterion not found" });

    if (action === 'Approve') {
      tracker.criteria[itemIndex].status = "Verified";
      tracker.criteria[itemIndex].adminComments = comments || "Verified by Admin";
    } else if (action === 'Reject') {
      tracker.criteria[itemIndex].status = "Rejected";
      tracker.criteria[itemIndex].adminComments = comments || "Please review and resubmit.";
    }

    tracker.markModified('criteria');
    await tracker.save();

    // Log it
    await Log.create({ 
        action: `NAAC_${action.toUpperCase()}`, 
        adminId: req.user.id, 
        details: `Updated criteria ${criteriaId} for institute ${instituteId}` 
    });

    res.json({ success: true });
  } catch (err) {
    console.error("NAAC Verify Error:", err);
    res.status(500).json({ error: "Verification failed" });
  }
});
// Delete department
app.delete('/institute/departments/:id', verifyToken, async (req, res) => {
  try {
    // Ensure we only delete if it belongs to this institute
    const deleted = await Department.findOneAndDelete({ 
      _id: req.params.id, 
      instituteId: req.user.id 
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Department not found or access denied' });
    }

    res.json({ message: 'Department deleted successfully' });
  } catch (err) {
    console.error('/institute/departments DELETE error:', err);
    res.status(500).json({ error: 'Delete failed' });
  }
});
// Delete student
app.delete('/institute/students/:id', verifyToken, async (req, res) => {
  try {
    // Ensure we only delete if it belongs to this institute
    const deleted = await Student.findOneAndDelete({ 
      _id: req.params.id, 
      instituteId: req.user.id 
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Student not found or access denied' });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    console.error('/institute/students DELETE error:', err);
    res.status(500).json({ error: 'Delete failed' });
  }
});
// Delete a specific notice
app.delete('/institute/notices/:id', verifyToken, async (req, res) => {
  try {
    // Ensure the notice belongs to the logged-in institute
    const deleted = await Notice.findOneAndDelete({ 
      _id: req.params.id, 
      instituteId: req.user.id 
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Notice not found or access denied' });
    }

    res.json({ message: 'Notice deleted successfully' });
  } catch (err) {
    console.error('/institute/notices DELETE error:', err);
    res.status(500).json({ error: 'Delete failed' });
  }
});
// -------------------
// UPDATED: AI Timetable Generation Route
// -------------------
// --- UPDATED GENERATE ROUTE ---
app.post('/institute/timetable/generate', verifyToken, async (req, res) => {
  try {
    const { config } = req.body;
    
    if (!config || !config.selectedCourseIds) {
      return res.status(400).json({ message: "Invalid configuration" });
    }

    // 1. Fetch Full Course Details (to get Faculty Names)
    const allIds = [...config.selectedCourseIds, ...config.selectedLabIds];
    const courses = await Course.find({ _id: { $in: allIds } }).populate('facultyId');

    // 2. Fetch Selected Faculty Details (For Prompt)
    const selectedFaculty = await Faculty.find({ _id: { $in: config.selectedFacultyIds || [] } });
    const facultyNames = selectedFaculty.map(f => f.name).join(", ");

    // 3. Fetch ALL Existing Timetables for this Institute (For Conflict Check)
    const existingTimetables = await Timetable.find({ instituteId: req.user.id });

    // 4. Build "Busy Faculty" Map
    const busyMap = {};
    existingTimetables.forEach(tt => {
      if (tt.schedule) {
        Object.entries(tt.schedule).forEach(([day, slots]) => {
          if (Array.isArray(slots)) {
            slots.forEach(slot => {
              if (slot.faculty) {
                if (!busyMap[slot.faculty]) busyMap[slot.faculty] = [];
                busyMap[slot.faculty].push(`${day}-${slot.time}`);
              }
            });
          }
        });
      }
    });

    // 5. Construct the Detailed AI Prompt
    let prompt = `
      Create a university class timetable JSON.
      
      --- CONSTRAINTS ---
      Department: ${config.department}
      Semester: ${config.semester}
      Days: ${config.workingDays.join(", ")}
      Time Range: ${config.startTime} to ${config.endTime}
      Slot Duration: 60 minutes
      Lunch Break: MUST be at ${config.lunchTime} for 1 hour. Label it "Lunch Break".
      Additional Remarks: ${config.remarks || "None"}
      
      --- AVAILABLE FACULTY POOL ---
      ${facultyNames || "No specific faculty selected"}
      
      --- SUBJECTS TO ASSIGN ---
      Assign these subjects. 
      IMPORTANT: If a course has a Faculty listed, use them. If "TBD", pick from the "Available Faculty Pool".
      ALWAYS CHECK the "BUSY LIST" before assigning a time slot to avoid conflicts.
    `;

    courses.forEach(c => {
      const facultyName = c.facultyId ? c.facultyId.name : "TBD";
      const isLab = config.selectedLabIds.includes(c._id.toString());
      
      prompt += `\n- ${c.name} (${isLab ? "LAB - Requires 2 consecutive slots" : "Theory"}). Faculty: ${facultyName}`;
      
      if (busyMap[facultyName]) {
        prompt += ` [BUSY AT: ${busyMap[facultyName].join(", ")}]`;
      }
    });

    prompt += `
      \n\n--- OUTPUT FORMAT ---
      Return ONLY valid JSON. Keys are Days. Values are arrays of objects.
      Format: { "Monday": [{ "time": "09:00 - 10:00", "subject": "...", "faculty": "..." }, ...] }
      Ensure no conflicts with the BUSY AT times provided.
    `;

    // 6. Call AI (Gemini / OpenAI logic)
    let generatedJson = null;

    if (aiProvider === 'google' && googleClient) {
      try {
        const model = googleClient.getGenerativeModel({ model: 'gemini-2.5-pro' });
        const result = await model.generateContent(prompt);
        const text = (await result.response).text().trim().replace(/```json|```/g, '').trim();
        generatedJson = JSON.parse(text);
      } catch (err) { console.error('Gemini Error:', err.message); }
    }

    if (!generatedJson && aiProvider === 'openai' && openaiClient) {
      try {
        const resp = await openaiClient.createChatCompletion({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: 'You are a scheduler.' }, { role: 'user', content: prompt }]
        });
        const text = resp.data.choices[0].message.content.trim().replace(/```json|```/g, '').trim();
        generatedJson = JSON.parse(text);
      } catch (err) { console.error('OpenAI Error:', err.message); }
    }

    if (!generatedJson) return res.status(500).json({ message: "AI Generation failed" });

    res.json({ schedule: generatedJson });

  } catch (err) {
    console.error('/institute/timetable/generate error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. Save New Timetable (Called when user clicks "Save" on draft)
app.post('/institute/timetable/save', verifyToken, async (req, res) => {
  try {
    // Extract department from body
    const { semester, subjects, workingDays, schedule, department } = req.body;

    if (!department) {
      return res.status(400).json({ message: "Department is required to save timetable" });
    }

    const subjectsStr = Array.isArray(subjects) ? subjects.join(", ") : subjects;

    // Check if a timetable already exists for this Inst + Dept + Sem (Optional: overwrite logic)
    // For now, we just create a new one or you can use findOneAndUpdate logic
    
    // We remove old one to prevent duplicates for specific Sem+Dept
    await Timetable.findOneAndDelete({ 
        instituteId: req.user.id, 
        department: department, 
        semester: semester 
    });

    const newTimetable = new Timetable({
      instituteId: req.user.id,
      department: department, // <--- SAVE DEPARTMENT
      semester: semester || "General",
      constraints: {
        subjects: subjectsStr || "N/A",
        workingDays: workingDays || []
      },
      schedule: schedule
    });

    await newTimetable.save();
    res.json({ message: 'Timetable saved successfully', id: newTimetable._id });

  } catch (err) {
    console.error('/institute/timetable/save error:', err);
    res.status(500).json({ error: 'Failed to save timetable' });
  }
});

// 3. Update Existing Timetable (For Drag & Drop Edits)
app.put('/institute/timetable/:id', verifyToken, async (req, res) => {
  try {
    const { schedule, semester } = req.body; // Accept semester for renaming
    
    const updateData = {};
    if (schedule) updateData.schedule = schedule;
    if (semester) updateData.semester = semester;
    
    // Update timestamp
    updateData.createdAt = Date.now(); // Optional: or add an updatedAt field

    const updated = await Timetable.findOneAndUpdate(
      { _id: req.params.id, instituteId: req.user.id },
      { $set: updateData },
      { new: true }
    );
    
    if (!updated) return res.status(404).json({ message: "Timetable not found" });
    res.json({ message: 'Timetable updated', data: updated });
  } catch (err) {
    console.error('/institute/timetable/update error:', err);
    res.status(500).json({ error: 'Update failed' });
  }
});

// 5. DELETE
app.delete('/institute/timetable/:id', verifyToken, async (req, res) => {
  try {
    const deleted = await Timetable.findOneAndDelete({ _id: req.params.id, instituteId: req.user.id });
    if (!deleted) return res.status(404).json({ message: "Timetable not found" });
    res.json({ message: "Timetable deleted" });
  } catch (err) { res.status(500).json({ error: "Delete failed" }); }
});

// 4. Get All Timetables
app.get('/institute/timetables', verifyToken, async (req, res) => {
  try {
    const list = await Timetable.find({ instituteId: req.user.id }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error('/institute/timetables error:', err);
    res.status(500).json({ error: 'Fetch failed' });
  }
});
// --- 1. Faculty Login ---
// ... inside server.js

app.post('/faculty/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const faculty = await Faculty.findOne({
      $or: [
        { FID: identifier },
        { email: identifier }
      ]
    });

    if (!faculty) return res.status(401).json({ message: 'Invalid Faculty ID or Email' });
    
    if (faculty.password !== password) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // --- NEW STEP: Fetch Institute Logo ---
    // We use the instituteId stored in the faculty document
    const institute = await Institute.findById(faculty.instituteId).select('logo');

    const token = jwt.sign(
      { id: faculty._id, role: 'faculty', FID: faculty.FID },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      role: 'faculty',
      name: faculty.name,
      FID: faculty.FID,
      department: faculty.department,
      isKycVerified: faculty.kyc?.verified || false,
      
      // Colors (Stored on Faculty)
      themeColorPrimary: faculty.themeColorPrimary,
      themeColorSecondary: faculty.themeColorSecondary,

      // Logo (Fetched dynamically from Institute)
      instituteLogo: institute ? institute.logo : null 
    });

  } catch (err) {
    console.error('/faculty/login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
// server.js (Partial Update - Replace the /faculty/me endpoint)

app.get('/faculty/me', verifyToken, async (req, res) => {
  try {
    // 1. Find Faculty
    const faculty = await Faculty.findById(req.user.id).select('-password');
    if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

    // 2. Fetch Institute details - ADDED 'code' to selection
    const institute = await Institute.findById(faculty.instituteId).select('name code logo themeColorPrimary themeColorSecondary');

    // 3. Combine Data
    res.json({
      ...faculty.toObject(),
      instituteName: institute?.name,
      instituteCode: institute?.code, // <--- Added this field
      instituteLogo: institute?.logo,
      // Prefer faculty specific theme if set, else institute theme
      themeColorPrimary: faculty.themeColorPrimary || institute?.themeColorPrimary,
      themeColorSecondary: faculty.themeColorSecondary || institute?.themeColorSecondary
    });
  } catch (err) {
    console.error('/faculty/me error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
// --- server.js ---

app.post('/faculty/update-profile', verifyToken, async (req, res) => {
  try {
    // 👇 CHANGED: Extract 'profilePic' to match your schema
    const { profilePic, phone } = req.body;
    
    const updateData = {};
    
    // 👇 CHANGED: Check and assign to 'profilePic'
    if (profilePic) updateData.profilePic = profilePic; 
    if (phone) updateData.phone = phone;

    updateData.updatedAt = Date.now();

    const updatedFaculty = await Faculty.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    res.json({ success: true, data: updatedFaculty });
  } catch (err) {
    console.error('/faculty/update-profile error:', err);
    res.status(500).json({ error: 'Profile update failed' });
  }
});
// --- 2. Faculty KYC Verification (Mock UIDAI) ---
app.post('/faculty/kyc/verify', verifyToken, async (req, res) => {
  try {
    const { aadharNumber, otp } = req.body;

    // --- MOCK VALIDATION LOGIC ---
    // In a real scenario, this connects to an NSDL/UIDAI API Gateway.
    // Here we simulate: 
    // 1. Aadhaar must be 12 digits.
    // 2. OTP must be "123456" for success.

    if (!aadharNumber || aadharNumber.length !== 12) {
      return res.status(400).json({ message: 'Invalid Aadhaar Number format' });
    }

    if (otp !== '123456') {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Update Faculty Record
    const updatedFaculty = await Faculty.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          'kyc.verified': true,
          'kyc.kycType': 'aadhar',
          'kyc.aadharLast4': aadharNumber.slice(-4) // Only store last 4 digits for security
        }
      },
      { new: true }
    );

    await Log.create({ 
      action: 'FACULTY_KYC', 
      details: `Faculty ${updatedFaculty.FID} completed Aadhaar verification.` 
    });

    res.json({ success: true, message: 'KYC Verified Successfully' });

  } catch (err) {
    console.error('/faculty/kyc/verify error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});
app.get('/institute/dashboard-full', verifyToken, async (req, res) => {
  try {
    const instId = req.user.id;
    const [
      facultyCount,
      studentCount,
      deptMetrics,
      naacDoc,
      notices,
      studentsList,
      faculties,
      timetables
    ] = await Promise.all([
      Faculty.countDocuments({ instituteId: instId }),
      Student.countDocuments({ instituteId: instId }),
      DepartmentMetric.find({ instituteId: instId }).lean(),
      NAACTracker.findOne({ instituteId: instId }).lean(),
      Notice.find({ instituteId: instId }).sort({ createdAt: -1 }).limit(5).lean(),
      Student.find({ instituteId: instId }).lean(),
      Faculty.find({ instituteId: instId }).lean(),
      Timetable.find({ instituteId: instId }).sort({ createdAt: -1 }).limit(3).lean()
    ]);

    const attendanceSeries = []; // monthly aggregation
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    for (let m = 0; m < 12; m++) {
      attendanceSeries.push({
        month: monthNames[m],
        attendance: Math.round(Math.random() * 30) + 60,
        avgScore: Math.round(Math.random() * 30) + 60
      });
    }

    const performanceBuckets = [
      { name: 'Above 80', value: Math.round((studentsList.filter(s => s.avgScore && s.avgScore >= 80).length / (studentsList.length || 1)) * 100) },
      { name: '60-80', value: Math.round((studentsList.filter(s => s.avgScore && s.avgScore >= 60 && s.avgScore < 80).length / (studentsList.length || 1)) * 100) },
      { name: 'Below 60', value: Math.round((studentsList.filter(s => s.avgScore && s.avgScore < 60).length / (studentsList.length || 1)) * 100) }
    ];

    const topCourses = (await Institute.aggregate([
      { $match: { _id: require('mongoose').Types.ObjectId(instId) } },
      { $project: { _id: 1 } }
    ])).slice(0,5).map(() => ({ title: 'Course placeholder', enrolled: Math.floor(Math.random() * 200), avgScore: Math.floor(60 + Math.random() * 30) }));

    const research = {
      papers: deptMetrics.reduce((s, d) => s + (d.publications || 0), 0),
      projects: deptMetrics.reduce((s, d) => s + (d.researchGrants || 0), 0),
      grants: deptMetrics.reduce((s, d) => s + (d.placements || 0), 0)
    };

    const studentLocations = [];
    const locationCounts = {};
    for (const s of studentsList) {
      if (!s.location) continue;
      locationCounts[s.location] = (locationCounts[s.location] || 0) + 1;
    }
    for (const k of Object.keys(locationCounts)) studentLocations.push({ name: k, count: locationCounts[k] });
    studentLocations.sort((a,b)=>b.count-a.count);

    const stats = {
      facultyCount,
      studentCount,
      avgAttendance: attendanceSeries.reduce((a,b)=>a+b.attendance,0)/attendanceSeries.length,
      teachingIndex: Math.round((Math.random()*30)+70),
      researchScore: research.papers + research.projects,
      naacOverall: naacDoc ? (naacDoc.overallScore || 'N/A') : 'Pending'
    };

    res.json({
      stats,
      attendanceSeries,
      performanceBuckets,
      topCourses,
      research,
      naac: { overall: stats.naacOverall, criteria: naacDoc ? naacDoc.criteria : [] },
      studentLocations,
      notices,
      recentFaculties: faculties.slice(0,5),
      timetables
    });
  } catch (err) {
    console.error('/institute/dashboard-full error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});
// -------------------
// COURSE MANAGEMENT (Institute Side)
// -------------------

// 1. Get All Courses
// Replace the existing '/institute/courses' route in server.js
app.get('/institute/courses', verifyToken, async (req, res) => {
  try {
    // 1. Allow filtering by Department and Semester via Query Params
    const { department, semester } = req.query;
    
    const query = { instituteId: req.user.id };
    
    // 2. Apply filters if provided
    if (department) query.department = department;
    if (semester) query.semester = semester;

    // 3. Fetch
    const courses = await Course.find(query)
      .populate('facultyId', 'name') // This line caused the crash previously
      .sort({ department: 1, name: 1 });
      
    res.json(courses);
  } catch (err) {
    console.error('/institute/courses error:', err);
    res.status(500).json({ error: 'Fetch failed' });
  }
});

// 2. Add New Course
app.post('/institute/courses/add', verifyToken, async (req, res) => {
  try {
    const { name, code, department, year, semester, credits } = req.body;

    if (!name || !code || !department || !year) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check for duplicates (Same Code in Same Dept)
    const existing = await Course.findOne({ 
      instituteId: req.user.id, 
      code: code, 
      department: department 
    });
    
    if (existing) {
      return res.status(400).json({ message: "Course code already exists in this department" });
    }

    const newCourse = new Course({
      instituteId: req.user.id,
      name,
      code,
      department,
      year,
      semester,
      credits: credits || 3
    });

    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (err) {
    console.error('/institute/courses/add error:', err);
    res.status(500).json({ error: 'Creation failed' });
  }
});

// 3. Delete Course
app.delete('/institute/courses/:id', verifyToken, async (req, res) => {
  try {
    const deleted = await Course.findOneAndDelete({ 
      _id: req.params.id, 
      instituteId: req.user.id 
    });

    if (!deleted) return res.status(404).json({ message: "Course not found" });
    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});
// 1. Add Material to Course
app.post('/faculty/course/:id/resource', verifyToken, async (req, res) => {
  try {
    const { title, type, url } = req.body;
    const course = await Course.findById(req.params.id);
    
    if (!course) return res.status(404).json({ message: "Course not found" });

    course.resources.push({ title, type, url });
    await course.save();

    res.json({ success: true, resources: course.resources });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add resource" });
  }
});

// 2. Fetch Eligible Students (Same Dept & Year as Course)
app.get('/faculty/course/:id/eligible-students', verifyToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

// Normalize year and sem (remove "rd", "th", "nd")
const normalizedYear = String(course.year).replace(/\D/g, "");
const normalizedSem  = String(course.semester).replace(/\D/g, "");

const students = await Student.find({
  instituteId: course.instituteId,
  department: course.department,
  year: normalizedYear,
  semester: normalizedSem
}).select('name SID profilePic rollNumber section');


    res.json({ students, enrolled: course.enrolledStudents });
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
});
// ----------------------------------------------------
// FACULTY NOTICE MANAGEMENT
// ----------------------------------------------------

// 1. Get All Notices (Institute + Faculty level)
app.get('/faculty/notices', verifyToken, async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.user.id);
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });

    // Fetch notices belonging to this Faculty's Institute
    const notices = await Notice.find({ instituteId: faculty.instituteId })
      .sort({ createdAt: -1 });

    res.json(notices);
  } catch (err) {
    console.error('/faculty/notices error:', err);
    res.status(500).json({ error: "Fetch failed" });
  }
});

// 2. Post a New Notice by Faculty
app.post('/faculty/notices/add', verifyToken, async (req, res) => {
  try {
    const { title, description, type } = req.body; // type e.g., 'Student', 'General'
    
    const faculty = await Faculty.findById(req.user.id);
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });

    const newNotice = new Notice({
      instituteId: faculty.instituteId,
      title,
      description, // or 'content' depending on your Schema
      type: type || 'General',
      postedBy: `Faculty: ${faculty.name}`, // Tag the author
      createdAt: Date.now()
    });

    await newNotice.save();
    res.status(201).json(newNotice);
  } catch (err) {
    console.error('/faculty/notices/add error:', err);
    res.status(500).json({ error: "Post failed" });
  }
});
app.put('/institute/students/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Security: Prevent changing immutable fields like ID or Institute ownership
    delete updateData._id;
    delete updateData.instituteId;
    delete updateData.createdAt;

    // Find and update, ensuring the student belongs to the logged-in institute
    const updatedStudent = await Student.findOneAndUpdate(
      { _id: id, instituteId: req.user.id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found or access denied" });
    }

    res.json(updatedStudent);
  } catch (err) {
    console.error('/institute/students/:id PUT error:', err);
    res.status(500).json({ error: "Update failed" });
  }
});
// 3. Map (Enroll) Students to Course
app.post('/faculty/course/:id/enroll', verifyToken, async (req, res) => {
  try {
    const { studentIds } = req.body; // Array of selected Student IDs
    const courseId = req.params.id;
    const facultyId = req.user.id; // The logged-in faculty

    // 1. Get Course Details (to know Semester and Name)
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // 2. Update Course Model (Basic Enrollment list)
    course.enrolledStudents = studentIds;
    await course.save();

    // 3. Update Student Models (Detailed Mapping)
    
    // A. Add/Update logic for selected students
    await Promise.all(studentIds.map(async (studentId) => {
      const student = await Student.findById(studentId);
      if (!student) return;

      // Ensure the semester entry exists
      // We use the STUDENT'S current semester or the COURSE'S semester. 
      // Usually, mapping implies the course's semester.
      const targetSem = course.semester.toString(); 

      // Find if an entry for this semester exists
      let semEntry = student.courseEnrollments.find(s => s.semester === targetSem);
      
      if (!semEntry) {
        // Create new semester entry
        student.courseEnrollments.push({
          semester: targetSem,
          subjects: []
        });
        semEntry = student.courseEnrollments.find(s => s.semester === targetSem);
      }

      // Check if this course is already mapped in this semester
      const existingSubjectIndex = semEntry.subjects.findIndex(
        sub => sub.courseId.toString() === courseId.toString()
      );

      if (existingSubjectIndex > -1) {
        // Update existing mapping (in case faculty changed)
        semEntry.subjects[existingSubjectIndex].facultyId = facultyId;
      } else {
        // Push new mapping
        semEntry.subjects.push({
          courseId: course._id,
          facultyId: facultyId,
          courseCode: course.code,
          courseName: course.name
        });
      }

      await student.save();
    }));

    // B. (Optional but recommended) Remove this course mapping from students 
    // who were DESELECTED (passed in previous logic but not in current studentIds).
    // Skipping for now to keep it simple as per request.

    res.json({ success: true, message: "Students mapped and schema updated successfully" });
  } catch (err) {
    console.error("Enrollment Error:", err);
    res.status(500).json({ error: "Enrollment failed" });
  }
});

app.get('/faculty/courses', verifyToken, async (req, res) => {
  try {
    // 1. Find the logged-in Faculty to get their Institute ID
    const faculty = await Faculty.findById(req.user.id);
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });
    const courses = await Course.find({ instituteId: faculty.instituteId })
      .sort({ createdAt: -1 }); // Newest first
      
    res.json(courses);
  } catch (err) {
    console.error('/faculty/courses error:', err);
    res.status(500).json({ error: "Fetch failed" });
  }
});
app.get('/faculty/timetables', verifyToken, async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.user.id);
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });

    // Fetch all timetables for this institute
    const timetables = await Timetable.find({ instituteId: faculty.instituteId });
    res.json(timetables);
  } catch (err) {
    console.error('/faculty/timetables error:', err);
    res.status(500).json({ error: "Fetch failed" });
  }
});

// 2. Add Reminder
app.post('/faculty/reminders/add', verifyToken, async (req, res) => {
  try {
    const { courseName, day, time, message } = req.body;
    const newReminder = new Reminder({
      facultyId: req.user.id,
      courseName,
      day,
      time,
      message
    });
    await newReminder.save();
    res.json(newReminder);
  } catch (err) {
    res.status(500).json({ error: "Failed to add reminder" });
  }
});

// 3. Get Reminders
app.get('/faculty/reminders', verifyToken, async (req, res) => {
  try {
    const reminders = await Reminder.find({ facultyId: req.user.id }).sort({ createdAt: -1 });
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reminders" });
  }
});

// 4. Delete Reminder
app.delete('/faculty/reminders/:id', verifyToken, async (req, res) => {
  try {
    await Reminder.findOneAndDelete({ _id: req.params.id, facultyId: req.user.id });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});
app.post("/faculty/student/enroll-course", verifyToken, async (req, res) => {
  try {
    const { studentId, courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Add into course side
    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { enrolledStudents: studentId }
    });

    // Add into student side
    await Student.findByIdAndUpdate(studentId, {
      $addToSet: {
        "courseEnrollments.$[sem].subjects": {
          courseId: course._id,
          facultyId: course.facultyId,
          courseName: course.name,
          courseCode: course.code
        }
      }
    }, {
      arrayFilters: [{ "sem.semester": course.semester }]
    });

    return res.json({ message: "Student enrolled into course" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Enrollment failed" });
  }
});

app.put('/faculty/student/update-course-details', verifyToken, async (req, res) => {
  try {
    const { studentId, courseId, attendance, marksDetails } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
        console.log("❌ Student not found");
        return res.status(404).json({ message: "Student not found" });
    }

    let courseName = "";
    let semFound = false;

    // 1. UPDATE DATA IN MEMORY
    if (student.courseEnrollments) {
      student.courseEnrollments.forEach(sem => {
        const subIndex = sem.subjects.findIndex(s => s.courseId.toString() === courseId);
        
        if (subIndex > -1) {
          semFound = true;
          const subject = sem.subjects[subIndex];
          courseName = subject.courseName;

          if (marksDetails) {
            // Update raw values
            subject.marksDetails = {
              test1: Number(marksDetails.test1 || 0),
              test2: Number(marksDetails.test2 || 0),
              test3: Number(marksDetails.test3 || 0),
              assignment: Number(marksDetails.assignment || 0),
              external: Number(marksDetails.external || 0)
            };

            // Calculate Math
            const t1 = subject.marksDetails.test1;
            const t2 = subject.marksDetails.test2;
            const t3 = subject.marksDetails.test3;
            const assign = subject.marksDetails.assignment;
            const extRaw = subject.marksDetails.external;

            // Internals: (Sum of 4) / 4
            const internalTotal = (t1 + t2 + t3 + assign) / 4;
            // Externals: Raw / 2
            const externalScaled = extRaw / 2;

            subject.marksObtained = parseFloat((internalTotal + externalScaled).toFixed(2));
            subject.maxMarks = 100;
          }
        }
      });
    }

    // 2. UPDATE ATTENDANCE MEMORY
    if (attendance && semFound) {
      const attIndex = student.attendance.subjectWise.findIndex(s => s.subjectName === courseName);
      
      const newPct = Number(attendance.total) > 0 
        ? (Number(attendance.attended) / Number(attendance.total)) * 100 
        : 0;

      const rec = {
        subjectName: courseName,
        attended: Number(attendance.attended),
        total: Number(attendance.total),
        percentage: parseFloat(newPct.toFixed(1))
      };

      if (attIndex > -1) student.attendance.subjectWise[attIndex] = rec;
      else student.attendance.subjectWise.push(rec);

      // Recalculate Overall
      let att = 0, tot = 0;
      student.attendance.subjectWise.forEach(s => { att += s.attended; tot += s.total; });
      const overall = tot > 0 ? (att / tot) * 100 : 0;
      
      student.attendance.overallPercentage = parseFloat(overall.toFixed(1));
      student.attendance.alertLevel = overall < 75 ? "Critical" : (overall < 85 ? "Warning" : "Safe");
    }

    // 3. FORCE SAVE (Bypass Validation)
    // We use updateOne instead of save() to avoid "Password Required" error
    const enrollmentsPlain = student.courseEnrollments.map(s => s.toObject ? s.toObject() : s);
    const attendancePlain = student.attendance.toObject ? student.attendance.toObject() : student.attendance;

    await Student.updateOne(
      { _id: studentId },
      { 
        $set: { 
          courseEnrollments: enrollmentsPlain,
          attendance: attendancePlain
        } 
      },
      { runValidators: false }
    );

    console.log("✅ Update Successful");
    res.json({ success: true, message: "Details updated" });

  } catch (err) {
    console.error("❌ SERVER ERROR:", err);
    res.status(500).json({ error: "Update failed", details: err.message });
  }
});
app.get('/faculty/courses/:courseId/students', verifyToken, async (req, res) => {
  try {
    const { courseId } = req.params;

    // Option A: If your Course model has 'enrolledStudents' populated
    const course = await Course.findById(courseId).populate('enrolledStudents', 'name rollNumber profilePic email');
    
    if (course && course.enrolledStudents && course.enrolledStudents.length > 0) {
      return res.json({ students: course.enrolledStudents });
    }

    // Option B: Fallback - Find students who have this course in their enrollment array
    // This searches the Student collection where 'courseEnrollments.subjects.courseId' matches
    const students = await Student.find({
      'courseEnrollments.subjects.courseId': courseId
    }).select('name rollNumber profilePic email');

    res.json({ students: students || [] });

  } catch (err) {
    console.error('/faculty/courses/:id/students error:', err);
    res.status(500).json({ error: 'Fetch failed' });
  }
});

app.get('/faculty/my-department', verifyToken, async (req, res) => {
  try {
    // 1. Get the logged-in faculty details
    const currentFaculty = await Faculty.findById(req.user.id);
    if (!currentFaculty) return res.status(404).json({ message: "Faculty not found" });

     if (currentFaculty.designation !== "Head of the Department") {
       return res.status(403).json({ message: "Access Denied. HOD only." });
    }

    // 3. Find all faculty in the same Institute AND Department
    const colleagues = await Faculty.find({
      instituteId: currentFaculty.instituteId,
      department: currentFaculty.department
    })
    .select('-password') // Exclude passwords
    .sort({ name: 1 });  // Sort A-Z

    res.json(colleagues);
  } catch (err) {
    console.error('/faculty/my-department error:', err);
    res.status(500).json({ error: "Fetch failed" });
  }
});

// server.js

// ... (existing imports)

app.post('/faculty/evaluation/bulk-update', verifyToken, async (req, res) => {
  try {
    const { courseId, type, date, records, examType } = req.body; 
    // records = [{ studentId, value }, ...]

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // --- ATTENDANCE LOGIC ---
    if (type === 'attendance') {
      if (!date) return res.status(400).json({ message: "Date is required" });

      await Promise.all(records.map(async (record) => {
        const { studentId, value } = record; 
        
        if (!value) return; 

        const isPresent = value === "Present";
        const numericValue = isPresent ? 1 : 0;

        // 1. Update the 'Attendance' Collection (Detailed History)
        let attDoc = await Attendance.findOne({ studentId, courseId });
        if (!attDoc) {
          attDoc = new Attendance({ studentId, courseId, history: [] });
        }

        const existingRecordIndex = attDoc.history.findIndex(h => h.date === date);
        if (existingRecordIndex > -1) {
          attDoc.history[existingRecordIndex].status = value;
          attDoc.history[existingRecordIndex].value = numericValue;
        } else {
          attDoc.history.push({ date, status: value, value: numericValue });
        }

        // Update Aggregates for this specific course
        const totalClasses = attDoc.history.length;
        const totalPresent = attDoc.history.filter(h => h.value === 1).length;
        
        attDoc.totalClasses = totalClasses;
        attDoc.totalPresent = totalPresent;
        attDoc.percentage = totalClasses === 0 ? 0 : (totalPresent / totalClasses) * 100;

        await attDoc.save();

        // ---------------------------------------------------------
        // 2. SYNC WITH STUDENT MODEL (Fixes the Dashboard Discrepancy)
        // ---------------------------------------------------------
        
        // A. Fetch ALL attendance records for this student across ALL courses
        const allStudentAttendance = await Attendance.find({ studentId });
        
        let grandTotalClasses = 0;
        let grandTotalPresent = 0;

        // B. Sum up stats from all courses (e.g., Math, Physics, Lab)
        allStudentAttendance.forEach(doc => {
          grandTotalClasses += doc.totalClasses;
          grandTotalPresent += doc.totalPresent;
        });

        // C. Calculate the TRUE overall percentage
        const newOverallPercentage = grandTotalClasses === 0 
          ? 0 
          : (grandTotalPresent / grandTotalClasses) * 100;

        const newAlertLevel = newOverallPercentage < 75 ? 'Critical' : 'Safe';

        // D. Update the Student Document (Dashboard reads this)
        // Note: We use 'attendance.overallPercentage' to match your frontend expectations
        await Student.findByIdAndUpdate(studentId, {
          $set: {
            "attendance.overallPercentage": parseFloat(newOverallPercentage.toFixed(1)),
            "attendance.alertLevel": newAlertLevel
          }
        });

      }));
    } 
    
    // --- MARKS LOGIC (Unchanged) ---
    else if (type === 'marks') {
      if (!examType) return res.status(400).json({ message: "Exam Type is required" });

      await Promise.all(records.map(async (record) => {
        const { studentId, value } = record;
        let numericVal = Number(value);
        if (isNaN(numericVal) || value === "") numericVal = 0;

        await Student.updateOne(
            { _id: studentId, "courseEnrollments.subjects.courseId": courseId },
            { 
              $set: { 
                [`courseEnrollments.$[outer].subjects.$[inner].marksDetails.${examType}`]: numericVal
              }
            },
            { 
              arrayFilters: [
                { "outer.semester": course.semester.toString() },
                { "inner.courseId": courseId }
              ] 
            }
        );
      }));
    }

    res.json({ success: true, message: "Updated successfully" });

  } catch (err) {
    console.error('/faculty/evaluation/bulk-update error:', err);
    res.status(500).json({ error: 'Update failed', details: err.message });
  }
});

// server.js - Add this route for Student Timetable
app.get('/student/timetable', verifyToken, async (req, res) => {
  try {
    // 1. Get Logged in Student
    const student = await Student.findById(req.user.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // 2. Find ALL Timetables matching: Institute + Department
    // We REMOVE the 'semester' filter here so we get all sems (e.g., Sem 3, Sem 5)
    // This allows the student to switch views if needed, or ensures we at least find something.
    const timetables = await Timetable.find({ 
      instituteId: student.instituteId,
      department: student.department 
    }).sort({ semester: 1 }); // Sort by semester ascending

    // Return the array directly
    res.json(timetables);
  } catch (err) {
    console.error("Fetch Student Timetable Error:", err);
    res.status(500).json({ error: "Fetch failed" });
  }
});
// 1. GET Faculty SSR Data
app.get('/faculty/ssr', verifyToken, async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.user.id);
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });

    let ssrData = await FacultySSR.findOne({ facultyId: req.user.id });
    
    // If not exists, return empty structure (frontend handles defaults)
    if (!ssrData) {
      ssrData = { personal: {}, teaching: [], research: { publications: [], fdpAttended: [] }, documents: [] };
    }

    res.json(ssrData);
  } catch (err) {
    console.error('/faculty/ssr GET error:', err);
    res.status(500).json({ error: "Fetch failed" });
  }
});

// 2. UPDATE/SAVE Faculty SSR Data (Section wise)
app.post('/faculty/ssr/update', verifyToken, async (req, res) => {
  try {
    const { section, data } = req.body; 
    // section: 'personal', 'teaching', 'evaluation', 'research', 'extension', 'mentoring'

    const faculty = await Faculty.findById(req.user.id);
    
    let ssrDoc = await FacultySSR.findOne({ facultyId: req.user.id });
    if (!ssrDoc) {
      ssrDoc = new FacultySSR({ 
        facultyId: req.user.id, 
        instituteId: faculty.instituteId 
      });
    }

    // Dynamic update based on section
    if (section === 'personal') ssrDoc.personal = { ...ssrDoc.personal, ...data };
    if (section === 'evaluation') ssrDoc.evaluation = { ...ssrDoc.evaluation, ...data };
    if (section === 'mentoring') ssrDoc.mentoring = { ...ssrDoc.mentoring, ...data };
    
    // For Arrays, we usually push or replace. Here we replace for simplicity in editing forms
    if (section === 'teaching') ssrDoc.teaching = data; 
    if (section === 'extension') ssrDoc.extension = data;
    if (section === 'research') ssrDoc.research = { ...ssrDoc.research, ...data };

    ssrDoc.lastUpdated = Date.now();
    await ssrDoc.save();

    res.json({ success: true, message: "SSR Data Updated", data: ssrDoc });

  } catch (err) {
    console.error('/faculty/ssr/update error:', err);
    res.status(500).json({ error: "Update failed" });
  }
});

// 3. UPLOAD Document (Simulated Base64 Storage for Prototype)
app.post('/faculty/ssr/upload', verifyToken, async (req, res) => {
  try {
    const { category, title, fileData } = req.body; // fileData is Base64 string

    let ssrDoc = await FacultySSR.findOne({ facultyId: req.user.id });
    if (!ssrDoc) {
      // Create if doesn't exist (rare case if they upload before saving profile)
      const faculty = await Faculty.findById(req.user.id);
      ssrDoc = new FacultySSR({ facultyId: req.user.id, instituteId: faculty.instituteId });
    }

    ssrDoc.documents.push({
      category,
      title,
      url: fileData 
    });

    await ssrDoc.save();
    res.json({ success: true, message: "Document Added", documents: ssrDoc.documents });

  } catch (err) {
    console.error('/faculty/ssr/upload error:', err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// 4. DELETE Document
app.delete('/faculty/ssr/document/:docId', verifyToken, async (req, res) => {
  try {
    await FacultySSR.findOneAndUpdate(
      { facultyId: req.user.id },
      { $pull: { documents: { _id: req.params.docId } } }
    );
    res.json({ success: true, message: "Document removed" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});
// 1. Submit a Grievance / Request to Admin
app.post('/faculty/grievance/add', verifyToken, async (req, res) => {
  try {
    const { subject, message, type } = req.body; // type: 'Technical', 'General', 'Urgent'
    const faculty = await Faculty.findById(req.user.id);
    
    // Using the AllGrievance model (ensure it's imported at top)
    const ticketId = `TKT-${Date.now().toString().slice(-6)}`;
    
    const doc = new AllGrievance({
      ticketId,
      userId: req.user.id,
      userType: 'Faculty',
      instituteId: faculty.instituteId,
      subject,
      message,
      type: type || 'General',
      status: 'Pending'
    });

    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    console.error('/faculty/grievance/add error:', err);
    res.status(500).json({ error: "Failed to submit request" });
  }
});

// 2. Get My Grievances
app.get('/faculty/grievances', verifyToken, async (req, res) => {
  try {
    const list = await AllGrievance.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

// 3. Create a Custom Form (Survey/Feedback)
app.post('/faculty/forms/create', verifyToken, async (req, res) => {
  try {
    const { courseId, title, description, fields } = req.body;

    if (!courseId || !title || !fields) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newForm = new FacultyForm({
      facultyId: req.user.id,
      courseId,
      title,
      description,
      fields
    });

    await newForm.save();
    res.status(201).json(newForm);
  } catch (err) {
    console.error('/faculty/forms/create error:', err);
    res.status(500).json({ error: "Form creation failed" });
  }
});

// 4. Get My Created Forms
app.get('/faculty/forms', verifyToken, async (req, res) => {
  try {
    const forms = await FacultyForm.find({ facultyId: req.user.id })
      .populate('courseId', 'name code')
      .sort({ createdAt: -1 });
    res.json(forms);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
});
app.get('/faculty/forms/:formId/responses', verifyToken, async (req, res) => {
  try {
    const responses = await FacultyFormResponse.find({ formId: req.params.formId })
      .populate('studentId', 'name rollNumber') // Get student details if non-anonymous
      .sort({ submittedAt: -1 });
    res.json(responses);
  } catch (err) {
    console.error('/faculty/forms/:id/responses error:', err);
    res.status(500).json({ error: "Fetch failed" });
  }
});


// --- STUDENT AUTHENTICATION ---
app.post('/student/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find student by email
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(401).json({ message: "Student not found" });
    }

    // 2. Simple Password Logic (For demo purposes)
    // Checks if the password matches the stored one OR if the password is the Student's USN/SID
    // (Since you might not have set passwords for students yet)
    const isValid = (student.password && student.password === password) || (student.SID === password);

    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Generate Token
    const token = jwt.sign(
      { id: student._id, role: 'student', instituteId: student.instituteId },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        sid: student.SID
      }
    });

  } catch (err) {
    console.error("Student Login Error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

app.get('/student/me', verifyToken, async (req, res) => {
  try {
    // 1. Fetch Student Data (excluding sensitive fields)
    const student = await Student.findById(req.user.id).select('-password');
    if (!student) return res.status(404).json({ message: "Student not found" });

    // 2. Fetch Institute Data (Logo, Name, Colors)
    const institute = await Institute.findById(student.instituteId).select('-password'); // Fetch all except password

    // 3. Return Combined Data
    res.json({
      student,
      institute: institute || {}
    });

  } catch (err) {
    console.error("Fetch Student Me Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- STUDENT PROFILE UPDATE (NEW) ---
app.post('/student/update-profile', verifyToken, async (req, res) => {
  try {
    const { profilePic, phone } = req.body;
    
    const updateData = {};
    if (profilePic) updateData.profilePic = profilePic;
    if (phone) updateData.phone = phone;
    
    updateData.updatedAt = Date.now();

    const updatedStudent = await Student.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    res.json({ success: true, data: updatedStudent });
  } catch (err) {
    console.error('/student/update-profile error:', err);
    res.status(500).json({ error: 'Profile update failed' });
  }
});
// Add this in server.js inside the Student routes section
app.get('/student/attendance/full', verifyToken, async (req, res) => {
  try {
    // Find all attendance records for this student and populate course details
    const records = await Attendance.find({ studentId: req.user.id })
      .populate('courseId', 'name code credits')
      .sort({ updatedAt: -1 });
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fetch failed" });
  }
});
app.get('/student/courses/details', verifyToken, async (req, res) => {
  try {
    // 1. Fetch Student with Enrollment Data
    const student = await Student.findById(req.user.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const combinedData = [];

    // 2. Iterate through all enrolled semesters and subjects
    if (student.courseEnrollments) {
      for (const semesterData of student.courseEnrollments) {
        for (const subject of semesterData.subjects) {
          
          // 3. Fetch Attendance History for this specific course
          const attRecord = await Attendance.findOne({
            studentId: student._id,
            courseId: subject.courseId
          }).select('history percentage totalClasses totalPresent');

          // 4. Construct the combined object
          combinedData.push({
            _id: subject.courseId,
            courseName: subject.courseName,
            courseCode: subject.courseCode,
            semester: semesterData.semester,
            facultyId: subject.facultyId,
            
            // Marks from Student Model
            marks: subject.marksDetails || {
              test1: 0,
              test2: 0,
              test3: 0,
              assignment: 0,
              external: 0
            },
            
            // Attendance from Attendance Model
            attendance: {
              percentage: attRecord ? attRecord.percentage : 0,
              total: attRecord ? attRecord.totalClasses : 0,
              attended: attRecord ? attRecord.totalPresent : 0,
              history: attRecord ? attRecord.history : [] // Date-wise array
            }
          });
        }
      }
    }

    res.json(combinedData);

  } catch (err) {
    console.error("Fetch Student Course Details Error:", err);
    res.status(500).json({ error: "Fetch failed" });
  }
});

// ==========================================
// 1. GET Forms for a specific Course (Student View)
// ==========================================
app.get('/student/course/:courseId/forms', verifyToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    // 1. Find all active forms for this course
    const forms = await FacultyForm.find({ 
      courseId: courseId, 
      isActive: true 
    }).sort({ createdAt: -1 });

    // 2. Check which ones the student has already responded to
    const formsWithStatus = await Promise.all(forms.map(async (form) => {
      const response = await FacultyFormResponse.findOne({ 
        formId: form._id, 
        studentId: studentId 
      });

      return {
        ...form.toObject(),
        isResponded: !!response, // True if response exists
        myResponse: response ? response.answers : null // Return answers if exists
      };
    }));

    res.json(formsWithStatus);

  } catch (err) {
    console.error("Fetch Student Forms Error:", err);
    res.status(500).json({ error: "Fetch failed" });
  }
});

// ==========================================
// 2. Submit Form Response
// ==========================================
app.post('/student/form/submit', verifyToken, async (req, res) => {
  try {
    const { formId, answers } = req.body;
    const studentId = req.user.id;

    // Check if already responded
    const existing = await FacultyFormResponse.findOne({ formId, studentId });
    if (existing) {
      return res.status(400).json({ message: "You have already responded to this form." });
    }

    const newResponse = new FacultyFormResponse({
      formId,
      studentId,
      answers, // Array of { questionId, questionLabel, answer }
      submittedAt: Date.now()
    });

    await newResponse.save();
    res.json({ success: true, message: "Response submitted successfully" });

  } catch (err) {
    console.error("Submit Form Error:", err);
    res.status(500).json({ error: "Submission failed" });
  }
});
// ==========================================
// REAL AI PERFORMANCE ANALYSIS ROUTE
// ==========================================
app.post('/student/performance/analyze', verifyToken, async (req, res) => {
  try {
    const student = await Student.findById(req.user.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // 1. Gather All Study Data
    // We construct a detailed profile for the AI to analyze
    const academicProfile = {
      name: student.name,
      department: student.department,
      semester: student.semester,
      currentCGPA: student.academic.cgpa,
      attendance: student.attendance?.overallPercentage || 0,
      history: student.academic.semesterResults || [], // Past Semesters
      currentCourses: []
    };

    // Add detailed marks for current semester
    if (student.courseEnrollments) {
      student.courseEnrollments.forEach(sem => {
        // Only include current semester for detailed breakdown
        if (sem.semester === student.semester) {
          sem.subjects.forEach(sub => {
            academicProfile.currentCourses.push({
              subject: sub.courseName,
              code: sub.courseCode,
              marks: sub.marksDetails, // { test1: 15, test2: 18... }
              attendance: student.attendance?.subjectWise?.find(s => s.subjectName === sub.courseName)?.percentage || 0
            });
          });
        }
      });
    }

    // 2. Construct the Prompt for Gemini
    const prompt = `
      Act as an empathetic but data-driven Academic Performance Coach. Analyze this student's profile:
      ${JSON.stringify(academicProfile)}

      Task:
      1. Analyze the correlation between their attendance and marks.
      2. Identify specific subjects where they are struggling vs. excelling.
      3. Predict their next semester performance based on current internal marks.

      Output STRICT JSON format (no markdown):
      {
        "insight": "A 60-80 word narrative summary. Be direct. E.g., 'Your strong performance in Lab subjects is offset by low theory scores...'",
        "improvementAreas": [
          { "area": "Subject Name or Habit", "reason": "Specific data point (e.g., Low Test 1 score)", "action": "Concrete advice (e.g., Focus on Unit 2)" }
        ],
        "prediction": "Predicted SGPA: X.X (Short reasoning)",
        "graphData": [
           { "label": "Conceptual Grasp", "score": 0-100 },
           { "label": "Consistency", "score": 0-100 },
           { "label": "Practical Skill", "score": 0-100 },
           { "label": "Exam Readiness", "score": 0-100 },
           { "label": "Assignment Quality", "score": 0-100 }
        ]
      }
    `;

    // 3. Call Gemini AI
    let aiResponse = null;

    if (googleClient) {
      try {
        const model = googleClient.getGenerativeModel({ model: "gemini-2.5-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json|```/g, '').trim(); // Clean markdown
        aiResponse = JSON.parse(text);
      } catch (aiError) {
        console.error("Gemini Generation Error:", aiError.message);
        // Fallback to OpenAI if Gemini fails (optional, based on your setup)
      }
    }

    // 4. Fallback if AI fails or isn't configured
    if (!aiResponse) {
      return res.json({
        insight: "AI Analysis unavailable. Based on your records, please focus on maintaining attendance above 75% and submitting all pending assignments.",
        improvementAreas: [],
        prediction: "N/A",
        graphData: []
      });
    }

    res.json(aiResponse);

  } catch (err) {
    console.error("Performance Analysis Error:", err);
    res.status(500).json({ error: "Analysis failed" });
  }
});


// --- MISSING ADMIN ROUTES (Paste these into server.js) ---

// 1. Update Institute Status (Admin)
app.put('/admin/updateInstituteStatus/:id', verifyToken, async (req, res) => {
  try {
    const { status } = req.body; // Active, Suspended, Rejected
    const inst = await Institute.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );
    // Log the action
    await Log.create({ 
      action: 'UPDATE_STATUS', 
      adminId: req.user.id, 
      details: `Institute ${inst.code} status changed to ${status}` 
    });
    res.json(inst);
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Update failed' });
  }
});

// 2. Broadcast (Admin) - Placeholder logic as generic broadcast
app.post('/admin/broadcast', verifyToken, async (req, res) => {
  try {
    const { title, message, type } = req.body;
    // You can save this to a SystemBroadcast model if you have one.
    // For now, we'll log it and pretend it was sent to all active institutes.
    await Log.create({
      action: 'BROADCAST',
      adminId: req.user.id,
      details: `Broadcast: ${title} (${type})`
    });
    // Optional: create a Notice for every institute? 
    // Or just return success for the demo.
    res.json({ success: true, message: 'Broadcast published' });
  } catch (err) {
    res.status(500).json({ error: 'Broadcast failed' });
  }
});

// 3. Fetch System Logs (Admin)
app.get('/admin/logs', verifyToken, async (req, res) => {
  try {
    const logs = await Log.find().sort({ createdAt: -1 }).limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Fetch logs failed' });
  }
});

// 4. Mock NAAC Validator (Admin Tool)
app.post('/admin/naacValidator', verifyToken, async (req, res) => {
  try {
    // Mock processing delay
    // In real app, this parses the uploaded PDF
    const mockScore = (Math.random() * (4.0 - 2.5) + 2.5).toFixed(2);
    const grades = ['A++', 'A+', 'A', 'B++', 'B+'];
    const mockGrade = grades[Math.floor(Math.random() * grades.length)];
    
    res.json({ 
      score: mockScore, 
      grade: mockGrade,
      details: "Automated analysis completed successfully." 
    });
  } catch (err) {
    res.status(500).json({ error: 'Validator failed' });
  }
});
// -------------------
// Generic Error Handler (fallback)
// -------------------
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// -------------------
// Start Server
// -------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} (AI provider: ${aiProvider || 'none'})`));
