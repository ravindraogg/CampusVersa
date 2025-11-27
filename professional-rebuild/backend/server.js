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
app.post('/institute/faculty/add', verifyToken, async (req, res) => {
  try {
    const instId = req.user.id;
    const payload = { ...req.body, instituteId: instId };

    // Require department and name
    if (!payload.department || !payload.name) return res.status(400).json({ message: 'Department and name required' });

    // find institute for code and number
    const inst = await Institute.findById(instId).select('code collegeNumber');
    if (!inst) return res.status(404).json({ message: 'Institute not found' });

    const deptCode = String(payload.department).toUpperCase();

    // Fetch all existing faculty names in the same department
    const existing = await Faculty.find({ instituteId: instId, department: deptCode }).select('name FID').lean();

    // Build combined list with the new name, then sort alphabetically by name
    const combined = existing.map(e => ({ name: e.name })).concat([{ name: payload.name }]);
    combined.sort((a, b) => {
      const A = String(a.name || '').toLowerCase();
      const B = String(b.name || '').toLowerCase();
      return A.localeCompare(B);
    });

    // Find position (first occurrence matching payload.name) -> sequence index (1-based)
    const idx = combined.findIndex(x => x.name === payload.name);
    const seq = idx >= 0 ? idx + 1 : combined.length;
    const seqStr = String(seq).padStart(3, '0');

    // FID = <CLG_NO><CLG_SHORT><DEPT_CODE><SEQ3>
    const FID = `${inst.collegeNumber}${inst.code}${deptCode}${seqStr}`;
    payload.FID = FID;

    // Create faculty
    const f = new Faculty(payload);
    await f.save();

    // Optionally update department facultyCount
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
app.get('/institute/students', verifyToken, async (req, res) => {
  try {
    const list = await Student.find({ instituteId: req.user.id }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error('/institute/students error:', err);
    res.status(500).json({ error: 'Fetch failed' });
  }
});

app.post('/institute/students/add', verifyToken, async (req, res) => {
  try {
    const instId = req.user.id;
    const payload = { ...req.body, instituteId: instId };

    if (!payload.department || !payload.name || !payload.year) {
      return res.status(400).json({ message: 'Department, name and year required' });
    }

    const inst = await Institute.findById(instId).select('code collegeNumber');
    if (!inst) return res.status(404).json({ message: 'Institute not found' });

    const deptCode = String(payload.department).toUpperCase();
    // Year last two digits
    const yearStr = String(payload.year).slice(-2);

    // Fetch existing students in the same department
    const existing = await Student.find({ instituteId: instId, department: deptCode }).select('name SID').lean();

    // Build combined with new, sort alphabetically
    const combined = existing.map(e => ({ name: e.name })).concat([{ name: payload.name }]);
    combined.sort((a, b) => {
      const A = String(a.name || '').toLowerCase();
      const B = String(b.name || '').toLowerCase();
      return A.localeCompare(B);
    });

    const idx = combined.findIndex(x => x.name === payload.name);
    const roll = idx >= 0 ? idx + 1 : combined.length;
    const rollStr = String(roll).padStart(3, '0');

    // SID = <CLG_NO><CLG_SHORT><YY><DEPT_CODE><ROLL3>
    const SID = `${inst.collegeNumber}${inst.code}${yearStr}${deptCode}${rollStr}`;
    payload.SID = SID;

    const doc = new Student(payload);
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
    const { criteriaId, submissionText } = req.body;
    
    // Find tracker
    const tracker = await NAACTracker.findOne({ instituteId: req.user.id });
    if (!tracker) return res.status(404).json({ message: "Tracker not found" });

    // Find specific criteria by ID
    const itemIndex = tracker.criteria.findIndex(c => c.id === Number(criteriaId));
    if (itemIndex === -1) return res.status(404).json({ message: "Criterion not found" });

    // Update fields
    tracker.criteria[itemIndex].submissionText = submissionText;
    tracker.criteria[itemIndex].status = "Submitted"; // Mark as ready for admin
    tracker.criteria[itemIndex].lastUpdated = Date.now();
    // Clear previous rejection comments if any
    tracker.criteria[itemIndex].adminComments = ""; 

    tracker.markModified('criteria'); // Important for array updates in Mongoose
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
// ✅ KEEP OR PASTE THIS AT THE BOTTOM OF SERVER.JS
// -------------------
// UPDATED: AI Timetable Generation Route
// -------------------
app.post('/institute/timetable/generate', verifyToken, async (req, res) => {

  try {
    const { prompt, semester, subjects, workingDays } = req.body; 

    if (!prompt) return res.status(400).json({ message: "Prompt is required" });

    // SAFEGUARD: Ensure subjects is a string for storage in 'constraints'
    // Frontend sends Array, DB might expect String.
    const subjectsStr = Array.isArray(subjects) ? subjects.join(", ") : subjects;

    let generatedJson = null;

    // --- OPTION A: Google Gemini ---
    if (aiProvider === 'google' && googleClient) {
      try {
        const model = googleClient.getGenerativeModel({ model: 'gemini-2.5-pro' });
        
        const finalPrompt = `
          ${prompt}
          
          CRITICAL INSTRUCTION: 
          Return ONLY valid JSON. Do not include markdown formatting (like \`\`\`json). 
          The JSON keys must be the Days (e.g., "Monday", "Tuesday").
          The values must be arrays of objects: { "time": "...", "subject": "...", "faculty": "...", "room": "..." }.
        `;

        const result = await model.generateContent(finalPrompt);
        const text = (await result.response).text().trim();
        const cleanText = text.replace(/```json|```/g, '').trim();
        generatedJson = JSON.parse(cleanText);
        
      } catch (err) {
        console.error('Gemini Generation Error:', err.message);
      }
    }

    // --- OPTION B: OpenAI (Fallback) ---
    if (!generatedJson && aiProvider === 'openai' && openaiClient) {
      try {
        const resp = await openaiClient.createChatCompletion({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a scheduling assistant. Return ONLY valid JSON. No markdown.' },
            { role: 'user', content: prompt }
          ]
        });
        const text = resp.data.choices[0].message.content.trim().replace(/```json|```/g, '');
        generatedJson = JSON.parse(text);
      } catch (err) {
        console.error('OpenAI Generation Error:', err.message);
      }
    }

    // 2. Validate Result
    if (!generatedJson || Object.keys(generatedJson).length === 0) {
      return res.status(500).json({ message: "AI generation failed or returned empty data." });
    }

    // 3. Save to Database
    try {
      const Timetable = require('./models/institute/Timetable');
      
      const newTimetable = new Timetable({
        instituteId: req.user.id,
        semester: semester || "General", 
        constraints: {
          subjects: subjectsStr || "N/A", // Saved safely as string
          workingDays: workingDays || []
        },
        schedule: generatedJson 
      });

      await newTimetable.save();
      
      res.json({ 
        message: 'Timetable generated successfully', 
        schedule: generatedJson,
        id: newTimetable._id 
      });
      
    } catch (saveError) {
      console.error("Database Save Error:", saveError);
      // Return schedule even if DB save fails
      res.json({ 
        message: 'Timetable generated (but not saved to history)', 
        schedule: generatedJson 
      });
    }

  } catch (err) {
    console.error('/institute/timetable/generate error:', err);
    res.status(500).json({ error: 'Server error during generation' });
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
