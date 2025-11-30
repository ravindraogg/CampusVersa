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

// Create institute (admin)
// --- Admin: Create Institute (assign collegeNumber) ---
app.post('/admin/createInstitute', verifyToken, async (req, res) => {
  try {
    const { name, code, email, aisheCode, password, requestId } = req.body;
    if (!password) return res.status(400).json({ message: 'Initial password required' });
    // avoid duplicates
    const exists = await Institute.findOne({ $or: [{ code }, { email }] });
    if (exists) return res.status(400).json({ message: 'Institute already exists' });

    // Determine collegeNumber: count existing institutes with same short code
    // NOTE: We assign newNumber = (countExistingWithSameCode) + 1
    const sameCodeCount = await Institute.countDocuments({ code });
    const collegeNumber = sameCodeCount + 1;

    // Generate IID
    const generatedIID = `IID-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const inst = new Institute({
      IID: generatedIID,
      name,
      code,
      collegeNumber,          // save it
      email,
      aisheCode,
      password,
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
app.post('/institute/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;  
    // identifier can be IID OR email OR code

    const inst = await Institute.findOne({
      $or: [
        { IID: identifier },
        { email: identifier },
        { code: identifier }
      ]
    });

    if (!inst) return res.status(401).json({ message: 'Institute not found' });
    if (inst.status !== 'Active') return res.status(403).json({ message: `Account is ${inst.status}` });
    if (inst.password !== password) return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign(
      { id: inst._id, role: 'institute', IID: inst.IID },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      role: 'institute',
      name: inst.name,
      IID: inst.IID,
      code: inst.code,
      email: inst.email,
      message: 'Login successful'
    });

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

// Update profile: accepts { logoBase64, name }
// ✔ FIXED: SINGLE clean update-profile route
// ✔ FIXED update-profile route (uses googleClient instead of genAI)
app.post('/institute/update-profile', verifyToken, async (req, res) => {
  try {
    const { logoBase64, name } = req.body;

    const updateData = {};
    if (name) updateData.name = name;

    // Save base64 logo
    if (logoBase64 && logoBase64.startsWith("data:image")) {
      updateData.logo = logoBase64;

      // Extract raw base64
      const base64Data = logoBase64.split(",")[1];
      const mimeType = logoBase64.split(";")[0].split(":")[1];

      // AI color extraction (Google Gemini only)
     // AI pastel + contrast color extraction
if (googleClient && aiProvider === "google") {
  try {
    const model = googleClient.getGenerativeModel({ model: "gemini-2.5-pro" });

    const prompt = `
  Analyze this logo and extract two HEX colors:

  1. "primary": choose a darker, rich color taken from the logo. 
     It must be dark enough to work as a strong sidebar/nav background.
  
  2. "secondary": choose a lighter, fully readable contrast color
     that sits clearly on top of the primary for text/icons.

  Return strictly this JSON:
  {
    "primary": "#xxxxxx",
    "secondary": "#xxxxxx"
  }
`;


    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType } }
    ]);

    let text = result.response.text().trim();

    // Clean code fences if any
    text = text.replace(/```json/g, "").replace(/```/g, "");

    // Parse JSON safely
    const colors = JSON.parse(text);

    if (colors.primary && colors.secondary) {
      updateData.themeColorPrimary = colors.primary;
      updateData.themeColorSecondary = colors.secondary;
    }

  } catch (err) {
    console.error("AI dual-color extraction failed:", err.message);
  }
}

    }

    // Save to MongoDB
    const updated = await Institute.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select("-password");

    res.json({ success: true, data: updated });

  } catch (err) {
    console.error("update-profile error:", err);
    res.status(500).json({ success: false, message: "Update failed" });
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
    const { semester, courses } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // 1. Calculate SGPA: Σ(GradePoint × Credits) / Σ(Credits)
    let totalSemesterCredits = 0; // Σ Credits
    let totalSemesterPoints = 0;  // Σ (GradePoint * Credits)

    courses.forEach(c => {
      totalSemesterCredits += Number(c.credits);
      totalSemesterPoints += (Number(c.gradePoint) * Number(c.credits));
    });

    const sgpa = totalSemesterCredits === 0 ? 0 : (totalSemesterPoints / totalSemesterCredits);

    // 2. Update Student Academic History
    // Remove existing entry for this semester if it exists (update logic)
    student.academic.semesterResults = student.academic.semesterResults.filter(r => r.semester !== semester);
    
    student.academic.semesterResults.push({
      semester: String(semester),
      totalCredits: totalSemesterCredits,
      earnedPoints: totalSemesterPoints,
      sgpa: parseFloat(sgpa.toFixed(2))
    });

    // 3. Calculate CGPA: Σ(SGPA_i × C_i) / Σ(C_i)
    // Based on your formula: Sum of (SGPA of sem * Credits of sem) / Total Credits of all sems
    let grandTotalPoints = 0;
    let grandTotalCredits = 0;

    student.academic.semesterResults.forEach(res => {
      // Re-deriving Σ(SGPA * C) is basically the 'earnedPoints' we calculated earlier
      grandTotalPoints += res.earnedPoints; 
      grandTotalCredits += res.totalCredits;
    });

    const cgpa = grandTotalCredits === 0 ? 0 : (grandTotalPoints / grandTotalCredits);

    // Save
    student.academic.cgpa = parseFloat(cgpa.toFixed(2));
    student.academic.creditsEarned = grandTotalCredits;
    
    await student.save();

    res.json({ 
      success: true, 
      sgpa: student.academic.semesterResults.find(r => r.semester === semester).sgpa,
      cgpa: student.academic.cgpa 
    });

  } catch (err) {
    console.error("GPA Calc Error:", err);
    res.status(500).json({ error: "Calculation failed" });
  }
});
app.post('/institute/students/add', verifyToken, async (req, res) => {
  try {
    const instId = req.user.id;
    // Destructure semester specifically to ensure it's captured
    const { department, name, year, semester, ...rest } = req.body;

    if (!department || !name || !year || !semester) {
      return res.status(400).json({ message: 'Department, name, year, and semester are required' });
    }

    const inst = await Institute.findById(instId).select('code collegeNumber themeColorPrimary themeColorSecondary');
    if (!inst) return res.status(404).json({ message: 'Institute not found' });

    const deptCode = String(department).toUpperCase();
    const yearStr = String(year).slice(-2);

    // SID Generation Logic
    const existing = await Student.find({ instituteId: instId, department: deptCode }).select('name SID').lean();
    const combined = existing.map(e => ({ name: e.name })).concat([{ name }]);
    combined.sort((a, b) => a.name.localeCompare(b.name));

    const idx = combined.findIndex(x => x.name === name);
    const roll = idx >= 0 ? idx + 1 : combined.length;
    const rollStr = String(roll).padStart(3, '0');

    const SID = `${inst.collegeNumber}${inst.code}${yearStr}${deptCode}${rollStr}`;

    // Initialize lifecycle
    const lifecycle = [{
      event: "Admission",
      date: new Date(),
      description: `Admitted to ${department} Dept, Year ${year}, Sem ${semester}`
    }];

    const doc = new Student({
      instituteId: instId,
      SID,
      name,
      department,
      year,
      semester, // <--- SAVING SEMESTER
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
    const { semester, subjects, workingDays, schedule } = req.body;

    const subjectsStr = Array.isArray(subjects) ? subjects.join(", ") : subjects;

    const newTimetable = new Timetable({
      instituteId: req.user.id,
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
app.get('/institute/courses', verifyToken, async (req, res) => {
  try {
    // Fetch courses and optionally populate Faculty name if assigned
    const courses = await Course.find({ instituteId: req.user.id })
      .populate('facultyId', 'name')
      .sort({ department: 1, year: 1, name: 1 });
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
    const { studentIds } = req.body; // Array of IDs
    const course = await Course.findById(req.params.id);
    
    if (!course) return res.status(404).json({ message: "Course not found" });

    course.enrolledStudents = studentIds; // Overwrite enrollment
    await course.save();

    res.json({ success: true, message: "Students mapped successfully" });
  } catch (err) {
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
