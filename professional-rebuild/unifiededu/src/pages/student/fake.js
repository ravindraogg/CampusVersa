

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

// --- STUDENT PROFILE (Fetch Dashboard Data) ---
app.get('/student/me', verifyToken, async (req, res) => {
  try {
    // 1. Fetch Student Data (excluding sensitive fields)
    const student = await Student.findById(req.user.id).select('-password');
    if (!student) return res.status(404).json({ message: "Student not found" });

    // 2. Fetch Institute Data (Logo, Name, Colors)
    const institute = await Institute.findById(student.instituteId).select('name code logo themeColorPrimary themeColorSecondary');

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
