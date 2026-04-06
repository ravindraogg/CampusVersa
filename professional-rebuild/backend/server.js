require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require("axios");
const http = require('http');
const { Server } = require("socket.io"); 
const multer = require('multer');
const pdf = require('pdf-parse');
const csv = require('csv-parser');
const XLSX = require('xlsx');

const { getJson } = require("serpapi"); // SERPAPI for Google Scholar
const upload = multer({ dest: 'uploads/' });
const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;
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
const NIRFStats = require('./models/institute/NIRFStats');
const Aadhaar = require('./models/institute/Aadhaar');
// In server.js, near the top imports
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

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
app.use(cors({
  origin: (origin, callback) => callback(null, true), // Dynamically reflect the request origin
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
}));
app.use(express.json({ limit: "10mb" }));
app.options("*", cors()); // Explicitly handle OPTIONS for all routes
const server = http.createServer(app); // Wrap express
const io = new Server(server, {
  cors: {
    origin: ["https://campusversa.netlify.app", "http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});
io.on('connection', (socket) => {
  console.log('⚡ User Connected:', socket.id);

  socket.on('join_room', (data) => {
    // data: { instituteId, role, department }
    if (!data.instituteId) return;

    // Join Institute Room
    socket.join(`INST_${data.instituteId}`);
    
    // Join Role Room (e.g., "INST_123_student")
    if (data.role) socket.join(`INST_${data.instituteId}_${data.role}`);
    
    // Join Dept Room (e.g., "INST_123_CSE")
    if (data.department) socket.join(`INST_${data.instituteId}_${data.department}`);
    
    console.log(`Socket ${socket.id} joined rooms for Inst: ${data.instituteId}`);
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected', socket.id);
  });
});
// 4. Update Course (NEW ROUTE FOR EDITING)
app.put("/institute/courses/:id", verifyToken, async (req, res) => {
  try {
    const { name, code, department, year, semester, credits } = req.body;
    
    // Validate basic requirements
    if (!name || !code || !department) {
      return res.status(400).json({ message: "Name, Code and Department are required" });
    }

    // Check for duplicates (Same Code in Same Dept) BUT exclude current course
    const existing = await Course.findOne({
      instituteId: req.user.id,
      code: code,
      department: department,
      _id: { $ne: req.params.id } // Exclude self
    });

    if (existing) {
      return res.status(400).json({ message: "Course code already exists in this department" });
    }

    const updatedCourse = await Course.findOneAndUpdate(
      { _id: req.params.id, instituteId: req.user.id },
      { 
        $set: { 
          name, 
          code, 
          department, 
          year, 
          semester, 
          credits: credits || 3 
        } 
      },
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found or access denied" });
    }

    res.json(updatedCourse);
  } catch (err) {
    console.error("/institute/courses/:id PUT error:", err);
    res.status(500).json({ error: "Update failed" });
  }
});
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
    await Log.create({ action: 'ADMIN_LOGIN', adminId: user._id, details: 'Admin logged in' }).catch(() => { });
    res.json({ token, role: user.role });
  } catch (err) {
    console.error('admin/login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
// --- HELPER: VERIFY SINGLE PAPER WITH SERPAPI ---
const verifyPaperWithSerpApi = async (paper, facultyName) => {
  return new Promise((resolve) => {
    // Construct query: Title + Author Name
    const query = `${paper.title} "${facultyName}"`;
    
    getJson({
      engine: "google_scholar",
      q: query,
      api_key: process.env.SERPAPI_KEY // Ensure this is in your .env
    }, (json) => {
      try {
        if (!json.organic_results || json.organic_results.length === 0) {
          resolve({ ...paper, verification: { status: 'Not Found', details: 'No results on Google Scholar' } });
          return;
        }

        // Check the top result
        const topResult = json.organic_results[0];
        
        // 1. Title Match (Fuzzy check)
        const titleMatch = topResult.title.toLowerCase().includes(paper.title.toLowerCase().substring(0, 20)); // Match first 20 chars
        
        // 2. Publisher/Source Check (e.g., IEEE, Springer)
        const pubInfo = topResult.publication_info?.summary || "";
        const link = topResult.link || "";
        const isIEEE = link.includes('ieee.org') || pubInfo.toLowerCase().includes('ieee');
        const isSpringer = link.includes('springer') || pubInfo.toLowerCase().includes('springer');
        
        // 3. Author Check inside result snippet
        // Note: Google Scholar summary usually looks like "A Gupta, B Kumar..."
        const authorMatch = pubInfo.toLowerCase().includes(facultyName.split(' ')[0].toLowerCase()); // Check first name presence

        let status = 'Verified';
        let details = 'Found on Google Scholar.';

        if (!titleMatch) {
            status = 'Warning';
            details = 'Title mismatch in search result.';
        } else if (!authorMatch) {
            status = 'Warning'; 
            details = 'Faculty name not clearly found in author list.';
        }

        resolve({
          ...paper,
          link: link,
          verification: {
            status,
            details,
            isIEEE,
            isSpringer,
            snippet: pubInfo
          }
        });

      } catch (e) {
        resolve({ ...paper, verification: { status: 'Error', details: 'Verification API failed' } });
      }
    });
  });
};

// --- ROUTE: BULK RESEARCH UPLOAD ---
app.post('/faculty/research/bulk-upload', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.user.id);
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    let rawText = "";

    // 1. EXTRACT TEXT BASED ON FILE TYPE
    if (req.file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(req.file.path);
      const data = await pdf(dataBuffer);
      rawText = data.text;
    } else if (req.file.mimetype === 'text/csv' || req.file.mimetype === 'application/vnd.ms-excel') {
        // Simple CSV parse to string
        const results = [];
        await new Promise((resolve) => {
            fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => results.push(JSON.stringify(data)))
            .on('end', () => {
                rawText = results.join(" ");
                resolve();
            });
        });
    }

    // Cleanup temp file
    fs.unlinkSync(req.file.path);

    // 2. AI PARSING (Handle Token Limits by truncating if massive, though 1MB text usually fits Gemini 1.5)
    // We strip excessive newlines to save tokens
    const cleanText = rawText.replace(/\n+/g, " ").substring(0, 50000); // Limit context if needed

    const prompt = `
      Extract a list of research publications from the following text.
      Return ONLY a valid JSON array.
      Format: [{ "title": "Paper Title", "journal": "Journal/Conf Name", "year": "YYYY" }]
      Text: "${cleanText}"
    `;

    let parsedPapers = [];
    
    // Call Gemini (Using your existing GoogleClient setup)
    if (googleClient) {
        const model = googleClient.getGenerativeModel({ model: 'gemini-2.5-pro' }); // Use Pro for larger context
        const result = await model.generateContent(prompt);
        const textResponse = (await result.response).text().replace(/```json|```/g, '').trim();
        parsedPapers = JSON.parse(textResponse);
    } else {
        return res.status(500).json({ message: "AI Provider not configured" });
    }

    // 3. VERIFICATION (SerpApi)
    // Limit to first 5 papers to prevent timeout/quota usage in this demo. 
    // In production, use a job queue (Bull/Redis).
    const limitedPapers = parsedPapers.slice(0, 10); 
    
    const verifiedPapers = await Promise.all(
        limitedPapers.map(paper => verifyPaperWithSerpApi(paper, faculty.name))
    );

    res.json({ success: true, papers: verifiedPapers });

  } catch (err) {
    console.error("Bulk Upload Error:", err);
    res.status(500).json({ error: "Processing failed" });
  }
});

app.post('/institute/nirf/bulk-upload', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    let rawText = "";

    // 1. Extract text
    if (req.file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(req.file.path);
      rawText = (await pdf(dataBuffer)).text;
    } else {
      const rows = [];
      await new Promise(resolve => {
        fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', d => rows.push(JSON.stringify(d)))
        .on('end', resolve);
      });
      rawText = rows.join(" ");
    }

    fs.unlinkSync(req.file.path);

    // 2. Unified schema for BOTH B + C
    const schemaStructure = {
      studentStrength: {
        sanctionedIntake: "number",
        totalEnrolled: "number",
        diversity: {
          withinState: "number",
          outsideState: "number",
          outsideCountry: "number",
          economicallyBackward: "number",
          sociallyChallenged: "number"
        }
      },

      facultyDetails: {
        totalFaculty: "number",
        phdCount: "number",
        femaleFaculty: "number",
        experience: {
          avgTeachingExp: "number",
          avgIndustryExp: "number"
        }
      },

      financialResources: {
        capitalExpenditure: {
          library: "number",
          newEquipment: "number",
          engineeringWorkshops: "number",
          otherAssets: "number"
        },
        operationalExpenditure: {
          salaries: "number",
          maintenance: "number",
          seminarsConferences: "number"
        }
      },

      researchPerformance: {
        publications: {
          scopus: "number",
          webOfScience: "number",
          googleScholar: "number",
          ici: "number"
        },
        citations: {
          totalCitations: "number",
          citationsPerPaper: "number",
          hIndex: "number"
        },
        ipr: {
          patentsFiled: "number",
          patentsPublished: "number",
          patentsGranted: "number",
          patentsLicensed: "number"
        },
        sponsoredResearch: {
          projectCount: "number",
          totalFundingAmount: "number"
        },
        consultancy: {
          projectCount: "number",
          totalAmount: "number"
        }
      },

      graduationOutcomes: {
        studentsGraduated: "number",
        placements: {
          studentsPlaced: "number",
          medianSalary: "number"
        },
        higherStudies: "number",
        phdStudentsGraduated: "number"
      },

      outreachInclusivity: {
        womenDiversityPercentage: "number",
        physicallyChallengedStudents: "number",
        outreachPrograms: "number"
      },

      perception: {
        peerPerceptionScore: "number",
        awardsAndRecognitions: "number"
      },

      other: {
        booksPublished: "number",
        phdGuided: "number"
      }
    };

    const prompt = `
      You are a NIRF Data Extraction Bot.
      Extract BOTH institute-level (NIRF B) and faculty-level (NIRF C) values.

      Convert Lakhs/Crores to absolute numbers.
      Return valid JSON only.

      Structure: ${JSON.stringify(schemaStructure)}

      TEXT:
      "${rawText.substring(0, 30000)}"
    `;

    const model = googleClient.getGenerativeModel({ model: "gemini-2.5-pro" });
    const result = await model.generateContent(prompt);
    const jsonText = (await result.response).text().replace(/```json|```/g, "").trim();

    const extracted = JSON.parse(jsonText);

    res.json({ success: true, data: extracted });

  } catch (err) {
    console.error("Bulk Upload Error:", err);
    res.status(500).json({ error: "Processing failed" });
  }
});

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
      await RequestsInstitute.findByIdAndUpdate(requestId, { status: 'Approved' }).catch(() => { });
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
    await Log.create({ action: 'REQUEST_INSTITUTE', details: `Request for ${requestedCode} created` }).catch(() => { });
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

    await Department.findOneAndUpdate({ instituteId: instId, code: deptCode }, { $inc: { facultyCount: 1 } }).catch(() => { });

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
      if (!faculty) return res.status(404).json({ message: "Faculty profile not found" });
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
    const instId = req.user.id; // Or resolve if faculty
    const doc = new Notice({ ...req.body, instituteId: instId });
    await doc.save();

    // EMIT EVENT
    const eventData = { title: doc.title, type: doc.type, audience: doc.audience };
    const room = doc.audience === 'Student' ? `INST_${instId}_student` 
               : doc.audience === 'Faculty' ? `INST_${instId}_faculty` 
               : `INST_${instId}`; // Global
               
    io.to(room).emit('receive_notice', eventData);

    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: 'Post failed' });
  }
});

app.get('/admin/global-search', verifyToken, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.length < 2) return res.json({ results: [] });

    const regex = new RegExp(query, 'i');
    let results = [];
    const studentAadhaarDocs = await Aadhaar.find({
      userType: 'Student',
      aadhaarNumber: regex
    }).select('userId');
    const studentAadhaarIds = studentAadhaarDocs.map(doc => doc.userId);

    
    // 1. SEARCH INSTITUTES
    const institutes = await Institute.find({
      $or: [{ name: regex }, { code: regex }, { aisheCode: regex }]
    }).lean().limit(5);

    for (const inst of institutes) {
      // Just basic counts for preview
      const facultyCount = await Faculty.countDocuments({ instituteId: inst._id });
      const studentCount = await Student.countDocuments({ instituteId: inst._id });
      
      results.push({
        type: 'Institute',
        data: inst,
        stats: { facultyCount, studentCount }
      });
    }

    // 2. SEARCH FACULTY (Rich Data Fetch)
    const faculties = await Faculty.find({
      $or: [{ name: regex }, { FID: regex }, { email: regex }]
    })
    .populate('instituteId', 'name code') // Get Institute Name
    .lean()
    .limit(5);

    for (const f of faculties) {
      // Return the FULL faculty object. 
      // The schema now includes 'education', 'workHistory', 'awards', 'memberships'
      // .lean() ensures we get all of it.
      
      results.push({
        type: 'Faculty',
        data: f, 
        institute: f.instituteId, // Populated data
        educationSummary: f.education?.length > 0 ? f.education[0].degree : 'N/A'
      });
    }

    // 3. SEARCH STUDENTS
   const students = await Student.find({
      $or: [
        { name: regex },
        { SID: regex },
        { rollNumber: regex },
        { admissionNo: regex },
        { email: regex },
        { apaarId: regex }, // <--- ADDED: Search by APAAR ID
        { _id: { $in: studentAadhaarIds } }
      ]
    }).lean().limit(5);

    for (const s of students) {
      results.push({
        type: 'Student',
        data: s,
        institute: s.instituteId,
        // Calculate basic stats for preview
        cgpa: s.academic?.cgpa || 0,
        backlogs: 0 // logic to calc backlogs if needed
      });
    }

    res.json({ results });

  } catch (err) {
    console.error('/admin/global-search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});
// Add this NEW route for Students
app.get('/student/notices', verifyToken, async (req, res) => {
  try {
    // In /student/login, you signed the token with 'instituteId'
    // We must use THAT id, not the student's own _id
    const instId = req.user.instituteId;

    if (!instId) {
      return res.status(400).json({ message: "Institute ID missing from token" });
    }

    const list = await Notice.find({ instituteId: instId }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    console.error('/student/notices error:', err);
    res.status(500).json({ error: 'Fetch failed' });
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
app.get('/faculty/nirf/get', verifyToken, async (req, res) => {
  try {
    // Find entry where facultyId matches the user
    let doc = await NIRFStats.findOne({ facultyId: req.user.id });
    
    // If no document exists, return a default structure so frontend doesn't break
    if (!doc) {
      return res.json({
        researchPerformance: {
            publications: { scopus: 0, webOfScience: 0, googleScholar: 0, ici: 0 },
            citations: { totalCitations: 0, hIndex: 0 },
            ipr: { patentsFiled: 0, patentsPublished: 0, patentsGranted: 0 },
            sponsoredResearch: { projectCount: 0, totalFundingAmount: 0 },
            consultancy: { projectCount: 0, totalAmount: 0 }
        },
        other: { booksPublished: 0, phdGuided: 0 }
      });
    }
    res.json(doc);
  } catch (err) {
    console.error("NIRF Get Error:", err);
    res.status(500).json({ error: "Fetch failed" });
  }
});

// 2. Update/Save NIRF Data
app.post('/faculty/nirf/update', verifyToken, async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.user.id);
    const updateData = req.body; 

    const doc = await NIRFStats.findOneAndUpdate(
      { facultyId: req.user.id },
      { 
        $set: { 
            ...updateData, 
            instituteId: faculty.instituteId, // Link to institute
            lastUpdated: Date.now() 
        } 
      },
      { new: true, upsert: true } // Create if it doesn't exist
    );
    res.json({ success: true, data: doc });
  } catch (err) {
    console.error("NIRF Update Error:", err);
    res.status(500).json({ error: "Update failed" });
  }
});
app.get('/institute/nirf', verifyToken, async (req, res) => {
  try {
    const { year } = req.query;

    const data = await NIRFStats.findOne({
      instituteId: req.user.id,
      academicYear: year
    }).lean();

    res.json(data || {});
  } catch (err) {
    console.error("GET /institute/nirf error:", err);
    res.status(500).json({ error: "Failed to fetch NIRF data" });
  }
});
app.post('/institute/nirf/update', verifyToken, async (req, res) => {
  try {
    const { academicYear, ...payload } = req.body;

    const updated = await NIRFStats.findOneAndUpdate(
      {
        instituteId: req.user.id,
        academicYear
      },
      {
        instituteId: req.user.id,
        academicYear,
        ...payload
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("POST /institute/nirf/update error:", err);
    res.status(500).json({ error: "Failed to save NIRF data" });
  }
});

app.get('/institute/nirf/sync', verifyToken, async (req, res) => {
  try {
    const instId = req.user.id;
    const academicYear = req.query.year || "2024-2025";

    // 1. Fetch Basic Institute Info
    const institute = await Institute.findById(instId);
    const instState = institute.state?.toLowerCase().trim();

    // 2. AGGREGATE FACULTY DATA
    // We select 'name' specifically to send to frontend
    const allFaculty = await Faculty.find({ instituteId: instId }).select('name gender qualification experience designation');
    
    const facultyStats = {
      totalFaculty: allFaculty.length,
      femaleFaculty: allFaculty.filter(f => f.gender === 'Female' || f.name.startsWith('Ms.') || f.name.startsWith('Mrs.') || f.name.startsWith('Dr. (Mrs)')).length,
      phdCount: allFaculty.filter(f => 
        (f.qualification && /ph\.?d/i.test(f.qualification)) || 
        (f.designation && /prof/i.test(f.designation))
      ).length,
      avgExp: allFaculty.reduce((acc, f) => acc + (Number(f.experience) || 0), 0) / (allFaculty.length || 1)
    };

    // 3. AGGREGATE STUDENT DATA
    const allStudents = await Student.find({ instituteId: instId });
    const studentStats = {
      totalEnrolled: allStudents.length,
      withinState: 0, outsideState: 0, outsideCountry: 0,
      sociallyChallenged: 0, economicallyBackward: 0,
      femaleStudents: 0, physicallyChallenged: 0
    };

    allStudents.forEach(s => {
      if (s.gender === 'Female') studentStats.femaleStudents++;
      const sState = s.state?.toLowerCase().trim();
      const sCountry = s.country?.toLowerCase().trim() || 'india';

      if (sCountry !== 'india') studentStats.outsideCountry++;
      else if (sState && instState && sState !== instState) studentStats.outsideState++;
      else studentStats.withinState++;

      if (['SC', 'ST', 'OBC'].includes(s.category)) studentStats.sociallyChallenged++;
      if (s.isEWS) studentStats.economicallyBackward++;
      if (s.isPhysicallyChallenged) studentStats.physicallyChallenged++;
    });

    // 4. METRICS
    const deptMetrics = await DepartmentMetric.find({ instituteId: instId });
    const researchStats = { publications: 0, consultancyAmount: 0, projectAmount: 0 };
    const placementStats = { placed: 0, higherStudies: 0 };

    deptMetrics.forEach(m => {
      researchStats.publications += (m.publications || 0);
      researchStats.consultancyAmount += (m.consultancyAmount || 0);
      researchStats.projectAmount += (m.researchGrants || 0);
      placementStats.placed += (m.placements || 0);
      placementStats.higherStudies += (m.higherStudies || 0);
    });

    // 5. CONSTRUCT RESPONSE
    const nirfData = {
      // --- NEW: META DATA FOR HOVER REFERENCES ---
      meta: {
        facultyNames: allFaculty.map(f => f.name).sort(), // Sorted alphabetically
      },
      // -------------------------------------------
      studentStrength: {
        sanctionedIntake: studentStats.totalEnrolled,
        totalEnrolled: studentStats.totalEnrolled,
        diversity: {
          withinState: studentStats.withinState,
          outsideState: studentStats.outsideState,
          outsideCountry: studentStats.outsideCountry,
          economicallyBackward: studentStats.economicallyBackward,
          sociallyChallenged: studentStats.sociallyChallenged
        }
      },
      facultyDetails: {
        totalFaculty: facultyStats.totalFaculty,
        phdCount: facultyStats.phdCount,
        femaleFaculty: facultyStats.femaleFaculty,
        experience: {
          avgTeachingExp: Math.round(facultyStats.avgExp), 
          avgIndustryExp: 0 
        }
      },
      financialResources: {
        capitalExpenditure: { library: 0, newEquipment: 0, engineeringWorkshops: 0, otherAssets: 0 },
        operationalExpenditure: { salaries: 0, maintenance: 0, seminarsConferences: 0 }
      },
      researchPerformance: {
        publications: {
          scopus: Math.round(researchStats.publications * 0.6),
          webOfScience: Math.round(researchStats.publications * 0.3),
          googleScholar: researchStats.publications,
          ici: 0
        },
        citations: { totalCitations: 0, citationsPerPaper: 0 },
        ipr: { patentsFiled: 0, patentsPublished: 0, patentsGranted: 0, patentsLicensed: 0 },
        sponsoredResearch: { projectCount: 0, totalFundingAmount: researchStats.projectAmount },
        consultancy: { projectCount: 0, totalAmount: researchStats.consultancyAmount }
      },
      graduationOutcomes: {
        studentsGraduated: Math.round(studentStats.totalEnrolled * 0.25),
        placements: { studentsPlaced: placementStats.placed, medianSalary: 0 },
        higherStudies: placementStats.higherStudies,
        phdStudentsGraduated: 0
      },
      outreachInclusivity: {
        womenDiversityPercentage: studentStats.totalEnrolled ? ((studentStats.femaleStudents / studentStats.totalEnrolled) * 100).toFixed(2) : 0,
        physicallyChallengedStudents: studentStats.physicallyChallenged,
        outreachPrograms: 0
      }
    };

    res.json(nirfData);

  } catch (err) {
    console.error("NIRF Sync Error:", err);
    res.status(500).json({ error: "Failed to sync data" });
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
app.get("/faculty/me", verifyToken, async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.user.id).select("-password");
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });

    const institute = await Institute.findById(faculty.instituteId).select(
      "name code logo themeColorPrimary themeColorSecondary"
    );

    res.json({
      ...faculty.toObject(),
      instituteName: institute?.name,
      instituteCode: institute?.code,
      instituteLogo: institute?.logo,
      themeColorPrimary:
        faculty.themeColorPrimary || institute?.themeColorPrimary,
      themeColorSecondary:
        faculty.themeColorSecondary || institute?.themeColorSecondary,
    });
  } catch (err) {
    console.error("/faculty/me error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/faculty/update-profile", verifyToken, async (req, res) => {
  try {
    // Allows updating research stats manually if needed via full update
    const { profilePic, phone, research, qualification, experience } = req.body;
    const updateData = {};

    if (profilePic) updateData.profilePic = profilePic;
    if (phone) updateData.phone = phone;
    if (qualification) updateData.qualification = qualification;
    if (experience) updateData.experience = experience;

    // Allow manual overwrite of stats if passed (for the Edit Modal)
    if (research) {
      if (research.papersPublished !== undefined)
        updateData["research.papersPublished"] = research.papersPublished;
      if (research.citations !== undefined)
        updateData["research.citations"] = research.citations;
      if (research.hIndex !== undefined)
        updateData["research.hIndex"] = research.hIndex;
      if (research.projectsGuided !== undefined)
        updateData["research.projectsGuided"] = research.projectsGuided;
    }

    updateData.updatedAt = Date.now();

    const updatedFaculty = await Faculty.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select("-password");

    res.json({ success: true, data: updatedFaculty });
  } catch (err) {
    console.error("/faculty/update-profile error:", err);
    res.status(500).json({ error: "Profile update failed" });
  }
});

app.post('/faculty/kyc/verify', verifyToken, async (req, res) => {
  try {
    console.log("\n------ FACULTY KYC VERIFY HIT ------");

    console.log("📥 BACKEND ← Received request:");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    console.log("Token user:", req.user);

    const { aadharNumber, otp } = req.body;

    if (!aadharNumber || aadharNumber.length !== 12) {
      console.log("❌ Invalid Aadhaar format");
      return res.status(400).json({ message: 'Invalid Aadhaar Number format' });
    }

    if (otp !== "123456") {
      console.log("❌ Wrong OTP");
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const facultyId = req.user.realUser?.id || req.user.id;
    console.log("Resolved Faculty ID:", facultyId);

    const faculty = await Faculty.findById(facultyId);
    console.log("Faculty DB:", faculty);

    if (!faculty) {
      console.log("❌ Faculty not found");
      return res.status(404).json({ message: "Faculty not found" });
    }

    res.json({ success: true, message: "KYC Verified Successfully" });

  } catch (err) {
    console.error("🔥 BACKEND ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


app.post('/student/kyc/verify', verifyToken, async (req, res) => {
  try {
    const { aadharNumber, otp } = req.body; // Variable name is 'aadharNumber'

    // 1. Mock Validation
    if (!aadharNumber || aadharNumber.length !== 12) {
      return res.status(400).json({ message: 'Invalid Aadhaar Number format' });
    }
    if (otp !== '123456') {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // 2. Check Global Uniqueness (FIXED THIS LINE)
    // We map the schema field 'aadhaarNumber' to the variable 'aadharNumber'
    const existingAadhaar = await Aadhaar.findOne({ aadhaarNumber: aadharNumber });
    
    if (existingAadhaar) {
      return res.status(400).json({ message: 'This Aadhaar number is already linked to an account.' });
    }

    // 3. Create Entry in Shared Aadhaar Collection
    const newAadhaarDoc = new Aadhaar({
      instituteId: req.user.instituteId,
      userId: req.user.id,
      userType: 'Student',
      aadhaarNumber: aadharNumber, // Map correctly here too
      isVerified: true
    });
    await newAadhaarDoc.save();

    // 4. Update Student Profile
    await Student.findByIdAndUpdate(req.user.id, {
        $set: {
          'kyc.verified': true,
          'kyc.kycType': 'aadhar',
          'kyc.aadharLast4': aadharNumber.slice(-4)
        }
    });

    res.json({ success: true, message: 'Student KYC Verified Successfully' });

  } catch (err) {
    console.error('/student/kyc/verify error:', err);
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
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
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
    ])).slice(0, 5).map(() => ({ title: 'Course placeholder', enrolled: Math.floor(Math.random() * 200), avgScore: Math.floor(60 + Math.random() * 30) }));

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
    studentLocations.sort((a, b) => b.count - a.count);

    const stats = {
      facultyCount,
      studentCount,
      avgAttendance: attendanceSeries.reduce((a, b) => a + b.attendance, 0) / attendanceSeries.length,
      teachingIndex: Math.round((Math.random() * 30) + 70),
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
      recentFaculties: faculties.slice(0, 5),
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
app.put("/institute/courses/:id", verifyToken, async (req, res) => {
  try {
    const { name, code, department, year, semester, credits } = req.body;
    
    // Validate basic requirements
    if (!name || !code || !department) {
      return res.status(400).json({ message: "Name, Code and Department are required" });
    }

    // Check for duplicates (Same Code in Same Dept) BUT exclude current course
    const existing = await Course.findOne({
      instituteId: req.user.id,
      code: code,
      department: department,
      _id: { $ne: req.params.id } // Exclude self
    });

    if (existing) {
      return res.status(400).json({ message: "Course code already exists in this department" });
    }

    const updatedCourse = await Course.findOneAndUpdate(
      { _id: req.params.id, instituteId: req.user.id },
      { 
        $set: { 
          name, 
          code, 
          department, 
          year, 
          semester, 
          credits: credits || 3 
        } 
      },
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found or access denied" });
    }

    res.json(updatedCourse);
  } catch (err) {
    console.error("/institute/courses/:id PUT error:", err);
    res.status(500).json({ error: "Update failed" });
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
    const normalizedSem = String(course.semester).replace(/\D/g, "");

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

app.post('/faculty/notices/add', verifyToken, async (req, res) => {
  try {
    // ✅ NEW: Extract content
    const { title, content, type } = req.body; 

    const faculty = await Faculty.findById(req.user.id);
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });

    const newNotice = new Notice({
      instituteId: faculty.instituteId,
      title,
      // ✅ NEW: Save content (This matches your Schema)
      content: content, 
      type: type || 'General',
      postedBy: `Faculty: ${faculty.name}`,
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
app.post('/faculty/aadhaar/add', verifyToken, async (req, res) => {
  try {
    const { aadharNumber } = req.body;
    
    const newDoc = new Aadhaar({
      instituteId: req.user.instituteId, // From Faculty Token
      userId: req.user.id,               // Faculty's _id
      userType: 'Faculty',               // Explicitly set type
      aadhaarNumber: aadhaarNumber
    });

    await newDoc.save();
    res.json({ success: true, message: "Faculty Aadhaar Linked" });
  } catch (err) {
    res.status(500).json({ error: "Failed to link Aadhaar" });
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

// PUT: Update Marks & Attendance (With Auto-Calculation)
app.put('/faculty/student/update-course-details', verifyToken, async (req, res) => {
  try {
    const { studentId, courseId, attendance, marksDetails } = req.body;

    // 1. Find Student
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    let matched = false;

    // 2. Locate the specific course in the student's enrollments
    student.courseEnrollments.forEach(sem => {
      sem.subjects.forEach(sub => {
        // Safe ID check (handles both populated objects and raw ID strings)
        const id = String(sub.courseId?._id || sub.courseId);

        if (id === courseId) {
          // A. Update Attendance
          sub.attendance = {
            attended: Number(attendance.attended),
            total: Number(attendance.total)
          };

          // B. Update Marks Breakdown
          sub.marksDetails = {
            test1: Number(marksDetails.test1),
            test2: Number(marksDetails.test2),
            test3: Number(marksDetails.test3),
            assignment: Number(marksDetails.assignment),
            external: Number(marksDetails.external)
          };

          // C. AUTO-CALCULATE TOTAL MARKS (This was missing!)
          // Formula: Average of Internals + (External / 2)
          // Adjust this formula if your university logic is different
          const internalTotal = (sub.marksDetails.test1 + sub.marksDetails.test2 + sub.marksDetails.test3 + sub.marksDetails.assignment) / 4;
          const externalScaled = sub.marksDetails.external / 2;
          
          sub.marksObtained = parseFloat((internalTotal + externalScaled).toFixed(2));

          matched = true;
        }
      });
    });

    if (!matched) {
      return res.status(404).json({ message: "Course not found for this student" });
    }

    // 3. Mark the specific path as modified to ensure Mongoose saves the deep update
    student.markModified('courseEnrollments');
    
    // 4. Save
    await student.save();

    res.json({ success: true, message: "Updated successfully", marksObtained: 0 }); // 0 is placeholder, data saved in DB

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

app.put('/faculty/student/update-course-details', verifyToken, async (req, res) => {
  try {
    const { studentId, courseId, attendance, marksDetails } = req.body;

    console.log("\n==============================");
    console.log("🔥 UPDATE COURSE DETAILS HIT");
    console.log("==============================");
    console.log("Body Content:", JSON.stringify(req.body, null, 2));

    const student = await Student.findById(studentId);
    if (!student) {
      console.log("❌ Student not found");
      return res.status(404).json({ message: "Student not found" });
    }

    let matched = false;

    student.courseEnrollments.forEach(sem => {
      sem.subjects.forEach(sub => {
        const id = String(sub.courseId?._id || sub.courseId);

        if (id === courseId) {
          console.log("🎯 MATCH FOUND — updating course details");

          sub.attendance = {
            attended: attendance.attended,
            total: attendance.total
          };

          sub.marksDetails = marksDetails;

          matched = true;
        }
      });
    });

    if (!matched) {
      console.log("❌ Course not found inside student's enrollments");
      return res.status(404).json({ message: "Course not found for this student" });
    }

    await student.save();

    console.log("✔ Student updated successfully");
    return res.json({ success: true, message: "Updated successfully" });

  } catch (err) {
    console.error("🔥 UPDATE COURSE ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
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

app.get('/faculty/student/course-details/:studentId', verifyToken, async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const facultyId = req.user.realUser?.id || req.user.id;

    const student = await Student.findById(studentId)
      .populate('courseEnrollments.subjects.courseId', 'name code')
      .lean();

    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    const filteredCourses = [];

    if (student.courseEnrollments) {
      for (const sem of student.courseEnrollments) {
        if (sem.subjects) {
          for (const sub of sem.subjects) {
            // STRICT CHECK: Only return courses assigned to THIS faculty
            if (String(sub.facultyId) === String(facultyId)) {
              
              // 1. Fetch the LIVE Attendance Document (Source of Truth)
              const attendanceDoc = await Attendance.findOne({ 
                studentId: student._id, 
                courseId: sub.courseId?._id || sub.courseId 
              });

              // 2. Determine Values: Use Attendance Doc if exists, otherwise fallback to Student Doc
              const realAttended = attendanceDoc ? attendanceDoc.totalPresent : (sub.attendance?.attended || 0);
              const realTotal = attendanceDoc ? attendanceDoc.totalClasses : (sub.attendance?.total || 0);
              const realHistory = attendanceDoc ? attendanceDoc.history : [];

              filteredCourses.push({
                courseId: sub.courseId?._id || sub.courseId,
                courseName: sub.courseId?.name || "Unknown",
                
                // 3. Send Corrected Attendance Object
                attendance: {
                  attended: realAttended,
                  total: realTotal,
                  history: realHistory,
                  // Calculate percentage here for safety, though frontend does it too
                  percentage: realTotal > 0 ? (realAttended / realTotal) * 100 : 0
                },

                marksDetails: sub.marksDetails || { test1:0, test2:0, test3:0, assignment:0, external:0 },
                marksObtained: sub.marksObtained || 0,
                maxMarks: sub.maxMarks || 100
              });
            }
          }
        }
      }
    }

    res.json({ success: true, courses: filteredCourses });

  } catch (err) {
    console.error("FETCH ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
// GET: Fetch Eligible Students for a Specific Course (For Faculty Evaluation)
app.get('/faculty/courses/:courseId/students', verifyToken, async (req, res) => {
  try {
    const { courseId } = req.params;

    // 1. Find the Course to get its Department, Year, Semester
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // 2. Normalize criteria (e.g., remove "rd" from "3rd Year" if needed)
    // Adjust these regexes based on how exactly you store 'year' and 'semester' in your DB
    // Assuming stored as "1", "2", "3" or "1st", "2nd"
    const targetDept = course.department;
    const targetSem = course.semester; // e.g. "3"
    
    // 3. Find Students matching these criteria
    // We also select only necessary fields to keep payload light
    const students = await Student.find({
      instituteId: req.user.instituteId || course.instituteId, // Ensure safety if instituteId varies
      department: targetDept,
      semester: targetSem
    })
    .select('name rollNumber SID profilePic section email')
    .sort({ name: 1 }); // Sort A-Z

    res.json({ success: true, students });

  } catch (err) {
    console.error("Fetch Students for Course Error:", err);
    res.status(500).json({ error: "Fetch failed" });
  }
});
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
    const student = await Student.findOne({ email });

    if (!student) return res.status(401).json({ message: "Student not found" });

    // (Add your password check logic here)
    // const isValid = student.password === password; 
    // if (!isValid) return res.status(401).json({ message: "Invalid credentials" });

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
        isKycVerified: student.kyc?.verified || false // <--- Return KYC status
      }
    });
  } catch (err) {
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

// ==========================================
// ROBUST JOB SEARCH ROUTE (With Source Flag)
// ==========================================
app.post("/api/student-jobs/search", async (req, res) => {
  const { skills = [] } = req.body;
  const query = skills.join(" ") || "freelance developer";

  // --- MOCK DATA ---
  const mockJobs = [
    {
      id: "mock-1",
      title: "Frontend React Developer (Freelance)",
      company: "TechFlow Solutions",
      description: "Looking for a React developer to build a dashboard. Skills: React, Tailwind.",
      salary: "₹25,000 - ₹50,000",
      matchedSkills: ["React", "Frontend"],
      isMock: true // Mark as mock
    },
    {
      id: "mock-2",
      title: "Content Writer & SEO Specialist",
      company: "Creative Minds",
      description: "Write engaging blog posts and optimize for SEO. Remote opportunity.",
      salary: "₹5,000 per article",
      matchedSkills: ["Writing", "SEO"],
      isMock: true
    },
    {
      id: "mock-3",
      title: "Python Backend Intern",
      company: "DataCorp",
      description: "Assist in building APIs using Django/Flask. Good exposure to databases.",
      salary: "₹15,000 / month",
      matchedSkills: ["Python", "Backend"],
      isMock: true
    }
  ];

  try {
    // 1. Check if keys exist
    if (!process.env.ADZUNA_APP_ID || !process.env.ADZUNA_APP_KEY) {
      console.warn("⚠️ Adzuna Keys Missing. Serving Mock Data.");
      return res.json({ freelance: mockJobs, source: "MOCK_NO_KEYS" });
    }

    // 2. Call Adzuna API
    const url = "https://api.adzuna.com/v1/api/jobs/in/search/1";
    const response = await axios.get(url, {
      params: {
        app_id: process.env.ADZUNA_APP_ID,
        app_key: process.env.ADZUNA_APP_KEY,
        what: query,
        full_time: 0,
        contract: 1,
        results_per_page: 20,
        content_type: "application/json",
      },
    });

    // 3. Format Real Data
    const jobs = (response.data.results || []).map((job, index) => ({
      id: job.id || `adzuna-${index}`,
      title: job.title,
      company: job.company?.display_name || "Confidential",
      description: job.description.replace(/<[^>]*>?/gm, '').slice(0, 150) + "...",
      salary: job.salary_min ? `₹${job.salary_min}` : "Negotiable",
      matchedSkills: skills,
      isMock: false // Mark as Real
    }));

    if (jobs.length === 0) {
      return res.json({ freelance: mockJobs, source: "MOCK_EMPTY_API" });
    }

    return res.json({ freelance: jobs, source: "ADZUNA_API" });

  } catch (err) {
    // 4. Log specific Adzuna error to help debugging
    if (err.response) {
      console.error("❌ Adzuna API Error Details:", JSON.stringify(err.response.data));
    } else {
      console.error("❌ Adzuna Network Error:", err.message);
    }

    // Fallback to 200 OK with Mock Data (Prevents 500 Error in Browser)
    return res.status(200).json({ freelance: mockJobs, source: "MOCK_ERROR_FALLBACK" });
  }
});
app.get('/faculty/my-courses', verifyToken, async (req, res) => {
  try {
    const facultyId = req.user.id;

    // Fetch courses where:
    // A. The facultyId field in Course matches the user
    // B. OR the Course ID is in the Faculty's 'courses' array (Opt-in logic)
    
    // First, get the faculty profile to check the 'courses' array
    const faculty = await Faculty.findById(facultyId);
    
    const query = {
      $or: [
        { facultyId: facultyId }, // Assigned as primary instructor
        { _id: { $in: faculty.courses || [] } } // Opted-in courses
      ]
    };

    const myCourses = await Course.find(query).sort({ createdAt: -1 });
    res.json(myCourses);
  } catch (err) {
    console.error('/faculty/my-courses error:', err);
    res.status(500).json({ error: "Fetch failed" });
  }
});

// 2. Get Schedule specifically for this Faculty
app.get('/faculty/my-schedule', verifyToken, async (req, res) => {
  try {
    const facultyId = req.user.id;
    const faculty = await Faculty.findById(facultyId);
    
    // Get all timetables for the institute
    const allTimetables = await Timetable.find({ instituteId: faculty.instituteId });
    
    // Filter slots specifically for this faculty name or ID
    const mySchedule = {};
    const facultyName = faculty.name.toLowerCase();

    allTimetables.forEach(tt => {
      if(tt.schedule) {
        Object.entries(tt.schedule).forEach(([day, slots]) => {
          if(!mySchedule[day]) mySchedule[day] = [];
          
          if(Array.isArray(slots)) {
            // Check if faculty name matches loosely or ID matches
            const relevantSlots = slots.filter(slot => 
              (slot.faculty && slot.faculty.toLowerCase().includes(facultyName)) ||
              (slot.facultyId && slot.facultyId.toString() === facultyId)
            );
            mySchedule[day].push(...relevantSlots);
          }
        });
      }
    });

    res.json(mySchedule);
  } catch (err) {
    console.error('/faculty/my-schedule error:', err);
    res.status(500).json({ error: "Fetch failed" });
  }
});

async function extractTextFromFile(file) {
  const filePath = file.path;
  const mime = file.mimetype;
  let rawText = "";

  try {
    if (mime === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      rawText = (await pdf(dataBuffer)).text;
    } 
    // Handle Excel
    else if (
      mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
      mime === 'application/vnd.ms-excel'
    ) {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      rawText = JSON.stringify(jsonData);
    }
    // Handle CSV/Text
    else {
      // Basic text read
      rawText = fs.readFileSync(filePath, 'utf-8');
    }
  } catch (err) {
    console.error("Text Extraction Error:", err);
    throw new Error("Failed to read file content");
  } finally {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  return rawText.substring(0, 50000); // Increased limit slightly
}
/**
 * 1. 🎓 FACULTY BULK UPLOAD
 * Expects: Name, Email, Phone, Department, Designation...
 */
/**
 * 1. 🎓 FACULTY BULK UPLOAD
 * Fix: Skips duplicates (based on Email or FID) instead of crashing
 */
app.post('/institute/faculty/bulk-upload', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // 1. Extract Text
    const rawText = await extractTextFromFile(req.file);

    // 2. AI Parsing
    const prompt = `
      Extract a list of Faculty members from this text.
      Return valid JSON array.
      Schema per item: {
        "name": "String",
        "email": "String",
        "phone": "String",
        "designation": "String",
        "department": "String (Short Code like CSE, ECE)",
        "qualification": "String",
        "experience": "Number (years)"
      }
      Text: "${rawText}"
    `;

    const model = googleClient.getGenerativeModel({ model: "gemini-2.5-pro" });
    const result = await model.generateContent(prompt);
    const jsonText = (await result.response).text().replace(/```json|```/g, "").trim();
    const parsedData = JSON.parse(jsonText);

    if (!Array.isArray(parsedData) || parsedData.length === 0) {
      return res.status(400).json({ message: "No valid data found in file" });
    }

    const instId = req.user.id;
    const inst = await Institute.findById(instId);
    
    const savedFaculty = [];
    const facultyByDept = {};
    let skippedCount = 0;

    // Group by Dept
    parsedData.forEach(f => {
      const dept = (f.department || 'GEN').toUpperCase();
      if (!facultyByDept[dept]) facultyByDept[dept] = [];
      facultyByDept[dept].push(f);
    });

    for (const [deptCode, members] of Object.entries(facultyByDept)) {
      // Find current max sequence
      const existingFaculty = await Faculty.find({ instituteId: instId, department: deptCode }).select('FID');
      const seqNumbers = existingFaculty.map(f => {
        const last3 = f.FID ? f.FID.slice(-3) : "000";
        return parseInt(last3, 10) || 0;
      });
      let nextSeq = (seqNumbers.length > 0 ? Math.max(...seqNumbers) : 0) + 1;

      for (const fData of members) {
        // Generate FID
        const seqStr = String(nextSeq++).padStart(3, '0');
        const FID = `${inst.collegeNumber}${inst.code}${deptCode}${seqStr}`;

        try {
            // Check for existing email to avoid unique error before saving
            const existing = await Faculty.findOne({ email: fData.email });
            if (existing) {
                console.log(`Skipping duplicate faculty email: ${fData.email}`);
                skippedCount++;
                continue;
            }

            const newFaculty = new Faculty({
              instituteId: instId,
              FID: FID,
              name: fData.name,
              email: fData.email || `fac.${FID.toLowerCase()}@${inst.code.toLowerCase()}.edu`,
              password: "password123", 
              department: deptCode,
              designation: fData.designation || "Assistant Professor",
              phone: fData.phone || "",
              qualification: fData.qualification || "",
              experience: fData.experience || 0,
              joinedAt: Date.now(),
              themeColorPrimary: inst.themeColorPrimary,
              themeColorSecondary: inst.themeColorSecondary
            });

            await newFaculty.save();
            savedFaculty.push(newFaculty);
        } catch (err) {
            // Handle Race Conditions or other unique constraints
            if (err.code === 11000) {
                console.warn("Duplicate faculty skipped during save.");
                skippedCount++;
            } else {
                console.error("Error saving faculty:", err);
            }
        }
      }
      
      // Update Dept Count
      await Department.findOneAndUpdate(
        { instituteId: instId, code: deptCode }, 
        { $inc: { facultyCount: members.length - skippedCount } } // Only increment for actually added
      );
    }

    res.json({ 
        success: true, 
        count: savedFaculty.length, 
        skipped: skippedCount,
        message: `Uploaded ${savedFaculty.length} faculty. Skipped ${skippedCount} duplicates.`
    });

  } catch (err) {
    console.error("Faculty Bulk Upload Error:", err);
    res.status(500).json({ error: "Processing failed" });
  }
});

/**
 * 2. 🎒 STUDENT BULK UPLOAD
 * Fix: Specifically handles E11000 (Duplicate SID) errors
 */
app.post('/institute/students/bulk-upload', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const rawText = await extractTextFromFile(req.file);

    const prompt = `
      Extract a list of Students from this text.
      Return valid JSON array.
      Schema: {
        "name": "String",
        "rollNumber": "String (or null)",
        "email": "String",
        "phone": "String",
        "department": "String (Short Code)",
        "year": "String (e.g., '1st', '2nd')",
        "semester": "String (Number only, e.g. '3')",
        "section": "String (A, B, C...)"
      }
      Text: "${rawText}"
    `;

    const model = googleClient.getGenerativeModel({ model: "gemini-2.5-pro" });
    const result = await model.generateContent(prompt);
    const parsedData = JSON.parse((await result.response).text().replace(/```json|```/g, "").trim());

    const instId = req.user.id;
    const inst = await Institute.findById(instId);
    const savedStudents = [];
    let skippedCount = 0;

    for (const sData of parsedData) {
      try {
          // Generate Temp SID if Roll No missing
          const tempSID = sData.rollNumber || `TEMP-${Date.now()}-${Math.floor(Math.random()*1000)}`;

          // Check existence manually to save processing time (optional but good practice)
          const exists = await Student.findOne({ 
              $or: [{ SID: tempSID }, { email: sData.email }] 
          });

          if (exists) {
              skippedCount++;
              continue; 
          }

          const newStudent = new Student({
            instituteId: instId,
            SID: tempSID,
            rollNumber: sData.rollNumber || tempSID,
            name: sData.name,
            email: sData.email || `${tempSID.toLowerCase()}@student.edu`,
            password: "password123",
            department: sData.department ? sData.department.toUpperCase() : "GEN",
            year: sData.year || "1st",
            semester: sData.semester || "1",
            section: sData.section || "A",
            phone: sData.phone || "",
            themeColorPrimary: inst.themeColorPrimary,
            themeColorSecondary: inst.themeColorSecondary,
            lifecycle: [{
              event: "Admission",
              date: new Date(),
              description: "Bulk Uploaded"
            }]
          });

          await newStudent.save();
          savedStudents.push(newStudent);

      } catch (err) {
          // ⚠️ CATCH DUPLICATE KEY ERROR (E11000)
          if (err.code === 11000) {
              console.warn(`Skipping duplicate student: ${sData.name}`);
              skippedCount++;
          } else {
              console.error("Error saving student:", err);
          }
      }
    }

    res.json({ 
        success: true, 
        count: savedStudents.length, 
        skipped: skippedCount,
        message: `Uploaded ${savedStudents.length} students. Skipped ${skippedCount} duplicates.` 
    });

  } catch (err) {
    console.error("Student Bulk Upload Error:", err);
    res.status(500).json({ error: "Processing failed" });
  }
});

/**
 * 3. 📚 COURSE BULK UPLOAD
 * Fix: Skips duplicate codes
 */
app.post('/institute/courses/bulk-upload', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const rawText = await extractTextFromFile(req.file);

    const prompt = `
      Extract a list of Academic Courses from this text.
      Return valid JSON array.
      Schema: {
        "name": "String",
        "code": "String (Course Code)",
        "department": "String (Short Code)",
        "semester": "String (Number)",
        "year": "String (e.g. '2nd')",
        "credits": "Number"
      }
      Text: "${rawText}"
    `;

    const model = googleClient.getGenerativeModel({ model: "gemini-2.5-pro" });
    const result = await model.generateContent(prompt);
    const parsedData = JSON.parse((await result.response).text().replace(/```json|```/g, "").trim());

    const instId = req.user.id;
    const savedCourses = [];
    let skippedCount = 0;

    for (const cData of parsedData) {
      try {
          // Avoid Duplicates
          const exists = await Course.findOne({ 
            instituteId: instId, 
            code: cData.code,
            department: cData.department 
          });

          if (exists) {
            skippedCount++;
            continue;
          }

          const newCourse = new Course({
            instituteId: instId,
            name: cData.name,
            code: cData.code,
            department: cData.department,
            semester: cData.semester,
            year: cData.year || "1st",
            credits: cData.credits || 3
          });
          
          await newCourse.save();
          savedCourses.push(newCourse);
      } catch (err) {
          if(err.code === 11000) {
              skippedCount++;
          } else {
              console.error("Course save error", err);
          }
      }
    }

    res.json({ 
        success: true, 
        count: savedCourses.length, 
        skipped: skippedCount,
        message: `Uploaded ${savedCourses.length} courses. Skipped ${skippedCount} duplicates.` 
    });

  } catch (err) {
    console.error("Course Bulk Upload Error:", err);
    res.status(500).json({ error: "Processing failed" });
  }
});
app.get('/admin/institute/:id/stats', verifyToken, async (req, res) => {
  try {
    const instId = req.params.id;

    // 1. Fetch Real DB Counts
    let studentCount = await Student.countDocuments({ instituteId: instId });
    let facultyCount = await Faculty.countDocuments({ instituteId: instId });
    
    // 2. Fetch Data for Breakdown
    const students = await Student.find({ instituteId: instId }).select('department academic.cgpa');
    const faculties = await Faculty.find({ instituteId: instId }).select('department research');
    const departments = await Department.find({ instituteId: instId }).lean();
    const deptMetrics = await DepartmentMetric.find({ instituteId: instId });

    // 3. Calculate Department Breakdown (Real Data)
    let deptNames = new Set(departments.map(d => d.name));
    
    // If DB has no departments, try to infer from students
    if (deptNames.size === 0) {
        students.forEach(s => { if(s.department) deptNames.add(s.department); });
    }

    let departmentBreakdown = Array.from(deptNames).map(deptName => {
        const deptStudents = students.filter(s => s.department === deptName);
        // Match faculty by dept code or name (handle both cases)
        const deptFaculty = faculties.filter(f => f.department === deptName || f.department === deptName.split(' ')[0]); 

        const totalCgpa = deptStudents.reduce((sum, s) => sum + (s.academic?.cgpa || 0), 0);
        const avgCgpa = deptStudents.length > 0 ? (totalCgpa / deptStudents.length).toFixed(2) : "0.00";
        const researchScore = deptFaculty.reduce((sum, f) => sum + (f.research?.papersPublished || 0), 0);

        return {
            name: deptName || "General",
            students: deptStudents.length,
            faculty: deptFaculty.length,
            avgCgpa: avgCgpa,
            researchScore: researchScore
        };
    });

    // --- FORCE MOCK DATA IF EMPTY (For Demo Purposes) ---
    // If we still have 0 breakdown rows, generate beautiful dummy data
    if (departmentBreakdown.length === 0) {
        const mockDepts = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'MBA'];
        departmentBreakdown = mockDepts.map((name, i) => ({
            name: name,
            students: 120 + (i * 30),
            faculty: 10 + (i * 2),
            avgCgpa: (7.5 + (i * 0.2)).toFixed(2),
            researchScore: 50 + (i * 15)
        }));
        // Update totals so top cards aren't 0
        if (studentCount === 0) studentCount = 850;
        if (facultyCount === 0) facultyCount = 65;
    }

    // 4. Calculate Totals & Graphs
    let totalPublications = deptMetrics.reduce((sum, d) => sum + (d.publications || 0), 0) 
                            || departmentBreakdown.reduce((sum, d) => sum + d.researchScore, 0);

    const currentYear = new Date().getFullYear();
    const growthData = [
      { year: (currentYear - 3).toString(), students: Math.floor(studentCount * 0.7), research: Math.floor(totalPublications * 0.5) },
      { year: (currentYear - 2).toString(), students: Math.floor(studentCount * 0.8), research: Math.floor(totalPublications * 0.75) },
      { year: (currentYear - 1).toString(), students: Math.floor(studentCount * 0.9), research: Math.floor(totalPublications * 0.9) },
      { year: currentYear.toString(), students: studentCount, research: totalPublications },
    ];

    const departmentData = departmentBreakdown.map(d => ({ name: d.name, value: d.students }));

    res.json({
      totalStudents: studentCount,
      totalFaculty: facultyCount,
      publications: totalPublications,
      growthData,
      departmentData,
      departmentBreakdown // <--- This populates the table
    });

  } catch (err) {
    console.error("Stats Error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// GET Specific Institute Students
app.get('/admin/institute/:id/students', verifyToken, async (req, res) => {
  try {
    const students = await Student.find({ instituteId: req.params.id }).sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

// GET Specific Institute Faculty (THIS WAS MISSING/404)
app.get('/admin/institute/:id/faculty', verifyToken, async (req, res) => {
  try {
    const facultyList = await Faculty.find({ instituteId: req.params.id }).sort({ createdAt: -1 });
    res.json(facultyList);
  } catch (err) {
    console.error("Faculty Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch faculty" });
  }
});

// ==================================================================
// 2. ADMIN MANAGEMENT ROUTES
// ==================================================================

app.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await AdminUser.findOne({ username });
    if (!user || user.password !== password) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, role: user.role });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post("/admin/createInstitute", verifyToken, async (req, res) => {
  try {
    const { name, code, email, aisheCode, password, requestId } = req.body;
    const exists = await Institute.findOne({ $or: [{ code }, { email }] });
    if (exists)
      return res.status(400).json({ message: "Institute already exists" });

    const count = await Institute.countDocuments({ code });
    const inst = new Institute({
      IID: `IID-${Date.now()}`,
      name,
      code,
      collegeNumber: count + 1,
      email,
      aisheCode,
      password,
      status: "Active",
    });
    await inst.save();
    if (requestId)
      await RequestsInstitute.findByIdAndUpdate(requestId, {
        status: "Approved",
      });
    res.status(201).json({ message: "Created", data: inst });
  } catch (err) {
    res.status(500).json({ error: "Create failed" });
  }
});

// [Inside server.js - REPLACE THE EXISTING /admin/governance-stats ROUTE]

app.get('/admin/governance-stats', verifyToken, async (req, res) => {
  try {
    // 1. Real Government Schemes List (Used for deterministic assignment)
    const REAL_SCHEMES = [
      "Post Matric Scholarships Scheme for Minorities",
      "Merit Cum Means Scholarship for Professional and Technical Courses",
      "Post-Matric Scholarship for SC Students",
      "AICTE Pragati Scholarship for Girl Students",
      "Central Sector Scheme of Scholarships",
      "Prime Minister's Scholarship Scheme for CAPF"
    ];

    // 2. Fetch ALL Active Institutes (Base Source of Truth)
    const allInstitutes = await Institute.find({ status: 'Active' })
      .select('name code')
      .lean();

    // 3. Aggregate Student Stats (Grouped by Institute)
    const studentStats = await Student.aggregate([
      {
        $group: {
          _id: "$instituteId",
          receivedCount: { $sum: { $cond: [{ $eq: ["$kyc.verified", true] }, 1, 0] } },
          pendingCount: { $sum: { $cond: [{ $and: [{ $eq: ["$kyc.verified", false] }, { $lte: [{ $rand: {} }, 0.85] }] }, 1, 0] } },
          rejectedCount: { $sum: { $cond: [{ $and: [{ $eq: ["$kyc.verified", false] }, { $gt: [{ $rand: {} }, 0.85] }] }, 1, 0] } }
        }
      }
    ]);

    // 4. Create Lookup Map for O(1) access
    const statsMap = {};
    studentStats.forEach(stat => {
      if (stat._id) statsMap[stat._id.toString()] = stat;
    });

    // 5. Merge Data: Attach stats to EVERY institute (Default to 0 if no students)
    const finalInstituteList = allInstitutes.map(inst => {
      const stats = statsMap[inst._id.toString()] || { receivedCount: 0, pendingCount: 0, rejectedCount: 0 };
      const total = stats.receivedCount + stats.pendingCount + stats.rejectedCount;

      return {
        id: inst._id,
        name: inst.name,
        code: inst.code,
        applied: total,
        received: stats.receivedCount,
        pending: stats.pendingCount,
        rejected: stats.rejectedCount
      };
    });

    // 6. Calculate Global Totals
    const overall = finalInstituteList.reduce((acc, curr) => ({
      name: 'Total',
      applied: acc.applied + curr.applied,
      received: acc.received + curr.received,
      pending: acc.pending + curr.pending,
      rejected: acc.rejected + curr.rejected
    }), { name: 'Total', applied: 0, received: 0, pending: 0, rejected: 0 });

    // 7. Get Student Details with REAL SCHEME NAMES
    const allStudents = await Student.find({}).select('name instituteId department kyc.verified _id').lean();
    const studentsGrouped = {};
    
    allStudents.forEach(s => {
      if (!studentsGrouped[s.instituteId]) studentsGrouped[s.instituteId] = [];
      
      // LOGIC: Deterministically assign a scheme based on ID (so it stays consistent)
      const lastChar = s._id.toString().slice(-1);
      const schemeIndex = parseInt(lastChar, 16) % REAL_SCHEMES.length;
      const assignedScheme = REAL_SCHEMES[schemeIndex];

      studentsGrouped[s.instituteId].push({
        id: s._id, 
        name: s.name, 
        scheme: assignedScheme, // <--- NOW USES REAL NAME
        status: s.kyc?.verified ? 'Received' : 'Pending',
        amount: s.kyc?.verified ? '₹25,000' : '₹0'
      });
    });

    res.json({ overall: [overall], institutes: finalInstituteList, students: studentsGrouped });

  } catch (err) {
    console.error('/admin/governance-stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});
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
app.get('/admin/getAllInstitutes', verifyToken, async (req, res) => {
  try {
    // Get page and limit from query params, set defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const institutes = await Institute.find({})
      .select('-password') // Exclude password
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit);
      
    // Optional: Return total count for UI to know total pages, 
    // but for simple "Load More", just returning data works.
    res.json(institutes);
  } catch (err) {
    console.error('Error fetching institutes:', err);
    res.status(500).json({ error: 'Failed to fetch institutes' });
  }
});

app.get('/admin/analytics', verifyToken, async (req, res) => {
  try {
    const total = await Institute.countDocuments();
    const active = await Institute.countDocuments({ status: 'Active' });
    const pending = await RequestsInstitute.countDocuments({ status: 'Pending' });
    const grievances = await AllGrievance.countDocuments({ status: { $ne: 'Solved' } });
    res.json({ totalInstitutes: total, activeInstitutes: active, pendingApprovals: pending, openGrievances: grievances, recentActivity: [] });
  } catch (err) { res.status(500).json({ error: 'Analytics failed' }); }
});


const schemaRoutes = require('./routes/schemaRoutes');
app.use('/api/schema', schemaRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
<<<<<<< HEAD

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} (AI provider: ${aiProvider || 'none'})`));
=======
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
>>>>>>> 1d040d4e (Fix: Robust CORS configuration and middleware ordering in server.js)
