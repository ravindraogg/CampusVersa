import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors('*'));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

// ============= SCHEMAS ============= //

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  usn: { type: String, required: true, unique: true },
  aadhaar: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: "student" },
  verified: { type: Boolean, default: false },
  registeredAt: { type: Date, default: Date.now },
  profile: {
    gpa: { type: Number, default: 0 },
    attendance: { type: Number, default: 0 },
    pendingTasks: { type: Number, default: 0 }
  }
});

const instituteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  aisheCode: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: "institute_admin" },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const facultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { type: String },
  designation: { type: String },
  role: { type: String, default: "faculty" },
  courseIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
});

const courseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
});

const assignmentSchema = new mongoose.Schema({
  courseCode: { type: String, required: true },
  title: { type: String, required: true },
  deadline: { type: Date, required: true },
  submittedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  gradedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
});

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String },
  tag: { type: String },
  details: { type: String }
});

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  userRole: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Student = mongoose.model("Student", studentSchema);
const Institute = mongoose.model("Institute", instituteSchema);
const Faculty = mongoose.model("Faculty", facultySchema);
const Course = mongoose.model("Course", courseSchema);
const Assignment = mongoose.model("Assignment", assignmentSchema);
const Event = mongoose.model("Event", eventSchema);
const Notification = mongoose.model("Notification", notificationSchema);

// Middleware to protect routes
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });
  
  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// ============= AUTH ROUTES (EXISTING) ============= //

app.get("/", (req, res) => {
  res.send("Unified Education Interface API is running...");
});

// Signup (Student / Institute)
app.post("/auth/signup", async (req, res) => {
  try {
    const { userType, name, usn, aadhaar, email, mobile, password, aisheCode, phone } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    if (userType === "student") {
      const existing = await Student.findOne({ $or: [{ usn }, { aadhaar }, { email }] });
      if (existing) return res.status(400).json({ message: "Student already registered" });

      const student = new Student({ name, usn, aadhaar, email, mobile, password: hashedPassword });
      await student.save();
      return res.status(201).json({ message: "Student signup successful" });
    }

    if (userType === "institute") {
      const existing = await Institute.findOne({ $or: [{ aisheCode }, { email }] });
      if (existing) return res.status(400).json({ message: "Institute already registered" });

      const institute = new Institute({ name, aisheCode, email, phone, password: hashedPassword });
      await institute.save();
      return res.status(201).json({ message: "Institute signup successful" });
    }

    res.status(400).json({ message: "Invalid userType" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Signin (Student / Institute)
app.post("/auth/signin", async (req, res) => {
  try {
    const { userType, identifier, password } = req.body;
    let user;

    if (userType === "student") {
      user = await Student.findOne({
        $or: [{ email: identifier }, { usn: identifier }, { aadhaar: identifier }]
      });
    } else if (userType === "institute") {
      user = await Institute.findOne({
        $or: [{ email: identifier }, { aisheCode: identifier }]
      });
    } else {
      return res.status(400).json({ message: "Invalid userType" });
    }

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    res.status(200).json({
      message: `${userType} login successful`,
      token,
      role: user.role,
      name: user.name
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected Route Example (using new middleware)
app.get("/auth/profile", authMiddleware, async (req, res) => {
  try {
    let user;
    if (req.user.role === "student") user = await Student.findById(req.user.id);
    else if (req.user.role === "institute_admin") user = await Institute.findById(req.user.id);
    else if (req.user.role === "faculty") user = await Faculty.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "Profile fetched successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============= NEW API ROUTES ============= //
// All routes below should be protected with authMiddleware
// They are prefixed with /api to separate them from auth routes.

// Student Dashboard API
app.get("/api/student/dashboard-data", authMiddleware, async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select("-password");
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Fetch related data
    const courses = await Course.find({ students: student._id }).populate('facultyId', 'name');
    const upcomingEvents = await Event.find({ date: { $gte: new Date() } }).sort({ date: 1 }).limit(3);
    const notifications = await Notification.find({ userId: student._id }).sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      student,
      courses,
      upcomingEvents,
      notifications
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Institute Dashboard API
app.get("/api/institute/dashboard-data", authMiddleware, async (req, res) => {
  if (req.user.role !== "institute_admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const totalStudents = await Student.countDocuments();
    const totalFaculty = await Faculty.countDocuments();
    const recentGrading = await Assignment.find().populate('submittedStudents gradedStudents', 'name').limit(5);
    
    // In a real app, this would be more complex, perhaps aggregated stats
    const avgGpa = await Student.aggregate([
      { $group: { _id: null, avgGpa: { $avg: "$profile.gpa" } } }
    ]);

    res.status(200).json({
      totalStudents,
      totalFaculty,
      recentGrading,
      avgGpa: avgGpa.length > 0 ? avgGpa[0].avgGpa.toFixed(2) : 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Events API
app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Assignments API
app.get("/api/assignments", authMiddleware, async (req, res) => {
  try {
    let assignments;
    if (req.user.role === "faculty") {
      // Fetch assignments for the faculty's courses
      const facultyCourses = await Course.find({ facultyId: req.user.id });
      const courseCodes = facultyCourses.map(c => c.code);
      assignments = await Assignment.find({ courseCode: { $in: courseCodes } });
    } else {
      // Fetch all assignments for a student's courses
      const studentCourses = await Course.find({ students: req.user.id });
      const courseCodes = studentCourses.map(c => c.code);
      assignments = await Assignment.find({ courseCode: { $in: courseCodes } });
    }
    res.status(200).json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Faculty API
app.get("/api/faculty", authMiddleware, async (req, res) => {
  try {
    const faculty = await Faculty.find().select("-password");
    res.status(200).json(faculty);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============= SERVER ============= //
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));