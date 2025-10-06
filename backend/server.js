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

// Schemas
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  usn: { type: String, required: true, unique: true },
  aadhaar: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: "student" },
  verified: { type: Boolean, default: false },
  registeredAt: { type: Date, default: Date.now }
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

const Student = mongoose.model("Student", studentSchema);
const Institute = mongoose.model("Institute", instituteSchema);

// Root
app.get("/", (req, res) => {
  res.send("Unified Education Interface API is running...");
});

// ============= AUTH ROUTES ============= //

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
    const { userType, identifier, password } = req.body; // identifier can be email/usn/aisheCode
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

// Protected Route Example
app.get("/auth/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user;
    if (decoded.role === "student") user = await Student.findById(decoded.id);
    else if (decoded.role === "institute_admin") user = await Institute.findById(decoded.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "Profile fetched successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============= SERVER ============= //
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
