import React, { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  BookOpen, 
  ChevronRight, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft,
  Briefcase,
  Target,
  Sparkles,
  School,
  Building2,
  Award
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import bookImage from "../../assets/logo.png";

// --- EDUCATION DATA HIERARCHY ---
const EDUCATION_DATA = {
  "Early School Education": {
    boards: ["NCERT", "CBSE", "ICSE", "State Board", "International Board"],
    levels: ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5"],
    subjects: ["Mathematics", "Environmental Studies", "Computer Awareness", "English", "General Science"]
  },
  "Middle School Education": {
    boards: ["NCERT", "CBSE", "ICSE", "State Board", "International Board"],
    levels: ["Class 6", "Class 7", "Class 8"],
    subjects: ["Mathematics", "Science", "Computer Science", "Social Science", "English"]
  },
  "Secondary Education": {
    boards: ["NCERT", "CBSE", "ICSE", "State Board", "International Board"],
    levels: ["Class 9", "Class 10"],
    subjects: ["Mathematics", "Science", "Information Technology", "Social Science", "English"]
  },
  "Senior Secondary / Higher Secondary": {
    boards: ["NCERT", "CBSE", "ICSE", "State Board", "International Board"],
    levels: ["Class 11", "Class 12"],
    streams: {
      "Science": ["Physics", "Chemistry", "Biology", "Mathematics", "Computer Science", "Statistics"],
      "Commerce": ["Accountancy", "Business Studies", "Economics", "Statistics", "Computer Science"],
      "Arts": ["History", "Political Science", "Sociology", "Psychology", "Economics"]
    }
  },
  "Pre-University Education (PUC)": {
    boards: ["Karnataka Department of Pre-University Education", "Other State PUC"],
    levels: ["1st PUC", "2nd PUC"],
    streams: {
      "Science": ["Physics", "Chemistry", "Mathematics", "Biology", "Computer Science", "Electronics", "Statistics"],
      "Commerce": ["Accountancy", "Business Studies", "Economics", "Statistics", "Computer Science"],
      "Arts": ["History", "Political Science", "Sociology", "Psychology", "Economics"]
    }
  },
  "Diploma / Polytechnic Education": {
    boards: ["DTE Karnataka", "Other State Technical Boards"],
    programs: [
      "Diploma in Computer Science Engineering",
      "Diploma in Information Science",
      "Diploma in Electronics and Communication",
      "Diploma in Electrical and Electronics",
      "Diploma in Mechanical Engineering",
      "Diploma in Civil Engineering",
      "Diploma in Mechatronics",
      "Diploma in Automobile Engineering",
      "Diploma in AI & ML",
      "Diploma in Data Science"
    ],
    levels: ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6"]
  },
  "Undergraduate Education (UG)": {
    boards: ["VTU", "Autonomous College", "State University", "Central University", "Private University"],
    programs: [
      "B.E. in Computer Science and Engineering",
      "B.E. in Information Science and Engineering",
      "B.E. in Data Science",
      "B.E. in AI & ML",
      "B.E. in Electronics and Communication Engineering",
      "B.E. in Electrical and Electronics Engineering",
      "B.E. in Mechanical Engineering",
      "B.E. in Civil Engineering",
      "B.E. in Mechatronics Engineering",
      "B.Sc", "BCA", "BBA", "BA"
    ],
    levels: ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6", "Semester 7", "Semester 8"]
  },
  "Postgraduate Education (PG)": {
    boards: ["VTU", "Autonomous College", "State University", "Central University", "Private University"],
    programs: ["M.Tech", "M.Sc", "MCA", "MBA", "MA"],
    levels: ["Semester 1", "Semester 2", "Semester 3", "Semester 4"]
  },
  "Doctoral Research": {
    boards: ["University", "Research Center"],
    programs: ["PhD Coursework and Research"]
  }
};

const IndependentEnrollment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    // Personal Info
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    country: "India",
    state: "",
    city: "",
    // Academic Info (Hierarchical)
    lifecycle: "",
    board: "",
    stream: "",
    programName: "",
    level: "",
    academicYear: "2024-25",
    currentSubjects: [],
    // Interests
    careerInterests: "",
    targetExams: "",
    preferredSkills: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Reset child fields if parent changes
    if (name === "lifecycle") {
      setFormData(prev => ({ ...prev, board: "", stream: "", programName: "", level: "", currentSubjects: [] }));
    }
    if (name === "stream") {
      setFormData(prev => ({ ...prev, currentSubjects: [] }));
    }
    setError("");
  };

  const handleSubjectToggle = (subject) => {
    setFormData(prev => {
      const current = prev.currentSubjects;
      if (current.includes(subject)) {
        return { ...prev, currentSubjects: current.filter(s => s !== subject) };
      }
      return { ...prev, currentSubjects: [...current, subject] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    setError("");

    try {
      const API_URL = import.meta.env.VITE_BACKEND_URL;
      const res = await fetch(`${API_URL}/student/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ...formData,
            institutionName: "Independent Learning",
            institutionType: formData.lifecycle,
            // Format for backend
            careerInterests: formData.careerInterests.split(',').map(s => s.trim()).filter(s => s),
            targetExams: formData.targetExams.split(',').map(s => s.trim()).filter(s => s),
            preferredSkills: formData.preferredSkills.split(',').map(s => s.trim()).filter(s => s),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      localStorage.setItem("studentToken", data.token);
      localStorage.setItem("studentName", data.user.name);
      localStorage.setItem("accountType", 'independent');

      setSuccess(true);
      setTimeout(() => navigate("/student/dashboard"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentLifecycle = EDUCATION_DATA[formData.lifecycle];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">
      {/* HEADER */}
      <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <img src={bookImage} alt="Logo" className="w-8 h-8 rounded-lg shadow-sm" />
          <h1 className="text-xl font-black tracking-tight text-slate-800">CampusVersa</h1>
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-purple-100">
            Independent enrollment
          </div>
        </div>
        <button onClick={() => navigate("/student/auth")} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm font-bold">
          <ArrowLeft size={18} /> Back to Login
        </button>
      </nav>

      {/* HERO SECTION */}
      <div className="max-w-6xl mx-auto px-6 pt-12">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* LEFT: FORM */}
          <div className="w-full lg:w-[65%] space-y-8">
            <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
              <div className="h-2 w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500"></div>
              
              <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-12">
                
                {/* SECTION 1: PERSONAL */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-inner">
                      <User size={20} />
                    </div>
                    <h2 className="text-xl font-black text-slate-800">Personal Information</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm" placeholder="John Doe" required />
                      </div>
                    </div>
                    <div className="group space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm" placeholder="john@example.com" required />
                      </div>
                    </div>
                    <div className="group space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                      <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm" placeholder="••••••••" required />
                    </div>
                    <div className="group space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                      <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm" placeholder="••••••••" required />
                    </div>
                    <div className="group space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Mobile Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm" placeholder="+91..." required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="group space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">State</label>
                            <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm" placeholder="State" required />
                        </div>
                        <div className="group space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">City</label>
                            <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm" placeholder="City" required />
                        </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: ACADEMIC (HIERARCHICAL) */}
                <div className="space-y-8 bg-slate-50/50 p-6 md:p-10 rounded-[2rem] border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner">
                      <GraduationCap size={20} />
                    </div>
                    <h2 className="text-xl font-black text-slate-800">Academic Lifecycle</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-8">
                    {/* 1. Education Stage */}
                    <div className="space-y-4">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-tighter flex items-center gap-2">
                           <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
                           Select Education Stage
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.keys(EDUCATION_DATA).map(stage => (
                                <button
                                    key={stage}
                                    type="button"
                                    onClick={() => handleChange({ target: { name: "lifecycle", value: stage } })}
                                    className={`p-4 rounded-2xl border text-left transition-all duration-200 group ${
                                        formData.lifecycle === stage 
                                        ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200" 
                                        : "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md text-slate-600"
                                    }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg mb-2 flex items-center justify-center transition-colors ${formData.lifecycle === stage ? "bg-white/20" : "bg-slate-100 group-hover:bg-indigo-50"}`}>
                                        <Building2 size={16} className={formData.lifecycle === stage ? "text-white" : "text-slate-500 group-hover:text-indigo-600"} />
                                    </div>
                                    <p className="text-[11px] font-black leading-tight uppercase">{stage}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {formData.lifecycle && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-300">
                            {/* 2. Board / University */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Board / Authority</label>
                                <select name="board" value={formData.board} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium">
                                    <option value="">Select Board</option>
                                    {currentLifecycle.boards.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>

                            {/* 3. Program / Stream */}
                            {currentLifecycle.programs ? (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Program of Study</label>
                                    <select name="programName" value={formData.programName} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium">
                                        <option value="">Select Program</option>
                                        {currentLifecycle.programs.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            ) : currentLifecycle.streams ? (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Stream</label>
                                    <select name="stream" value={formData.stream} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium">
                                        <option value="">Select Stream</option>
                                        {Object.keys(currentLifecycle.streams).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            ) : null}

                            {/* 4. Level / Grade */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Current Grade / Semester</label>
                                <select name="level" value={formData.level} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium">
                                    <option value="">Select Level</option>
                                    {currentLifecycle.levels.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>

                            {/* 5. Academic Year */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Academic Year</label>
                                <input type="text" name="academicYear" value={formData.academicYear} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium" placeholder="2024-25" />
                            </div>
                        </div>
                    )}

                    {/* 6. Subject Selector */}
                    {formData.lifecycle && (
                        <div className="space-y-4 animate-in slide-in-from-top-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-tighter flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</span>
                                Select Your Subjects
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {(currentLifecycle.subjects || (formData.stream ? currentLifecycle.streams[formData.stream] : [])).map(sub => (
                                    <button
                                        key={sub}
                                        type="button"
                                        onClick={() => handleSubjectToggle(sub)}
                                        className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all duration-200 border ${
                                            formData.currentSubjects.includes(sub)
                                            ? "bg-indigo-50 border-indigo-200 text-indigo-700 ring-2 ring-indigo-500/10"
                                            : "bg-white border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-500"
                                        }`}
                                    >
                                        {sub}
                                        {formData.currentSubjects.includes(sub) && <CheckCircle2 size={12} className="inline ml-2" />}
                                    </button>
                                ))}
                            </div>
                            {formData.currentSubjects.length === 0 && <p className="text-[10px] text-slate-400 italic">No subjects selected yet</p>}
                        </div>
                    )}
                  </div>
                </div>

                {/* SECTION 3: GOALS */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
                            <Target size={20} />
                        </div>
                        <h2 className="text-xl font-black text-slate-800">Interests and Goals</h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Career Interests</label>
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-4 text-slate-400 w-4 h-4" />
                                <textarea name="careerInterests" value={formData.careerInterests} onChange={handleChange} rows="2" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" placeholder="e.g. Software Engineer, Data Scientist, Civil Architect..."></textarea>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Target Exams</label>
                                <div className="relative">
                                    <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input type="text" name="targetExams" value={formData.targetExams} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" placeholder="e.g. GATE, JEE, UPSC..." />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Preferred Skills</label>
                                <div className="relative">
                                    <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input type="text" name="preferredSkills" value={formData.preferredSkills} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" placeholder="e.g. React, Python, UI/UX..." />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ERROR MESSAGE */}
                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3 animate-shake">
                        <Loader2 className="animate-spin" size={18} />
                        <span className="text-xs font-bold">{error}</span>
                    </div>
                )}

                {/* SUBMIT BUTTON */}
                <button
                    type="submit"
                    disabled={loading || success}
                    className="w-full group relative overflow-hidden bg-slate-900 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all hover:bg-black hover:shadow-2xl hover:shadow-slate-300 disabled:opacity-50"
                >
                    <div className="relative z-10 flex items-center justify-center gap-3">
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (success ? <CheckCircle2 size={20} /> : "Complete Enrollment")}
                        {!loading && !success && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>

              </form>
            </div>
          </div>

          {/* RIGHT: INFO PANEL */}
          <div className="hidden lg:block w-full lg:w-[35%] sticky top-32">
            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm space-y-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-800 leading-tight tracking-tight">Access Premium <br/> Learning Resources</h3>
                <p className="text-slate-400 text-sm leading-relaxed">By enrolling as an Independent student, you gain immediate access to our ecosystem of tools.</p>
              </div>

              <div className="space-y-6">
                {[
                  { icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50", t: "Virtual Labs", d: "Experiment safely with digital simulations mapped to your curriculum." },
                  { icon: Award, color: "text-amber-500", bg: "bg-amber-50", t: "Scholarships", d: "Smart matching engine that finds grants based on your profile." },
                  { icon: Target, color: "text-emerald-500", bg: "bg-emerald-50", t: "Career Path", d: "AI-generated roadmaps to help you achieve your professional goals." },
                  { icon: School, color: "text-purple-500", bg: "bg-purple-50", t: "Community Hub", d: "Connect with learners from across the globe in our specialized hubs." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className={`w-12 h-12 shrink-0 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm`}>
                      <item.icon size={20} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-slate-700 uppercase tracking-wider">{item.t}</p>
                      <p className="text-[10px] text-slate-400 leading-relaxed">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-slate-100">
                <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-[10px] text-slate-500 leading-relaxed italic">"Independent enrollment allows you to self-manage your academic progress while utilizing our platform's enterprise-grade tools."</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* SUCCESS MODAL OVERLAY */}
      {success && (
        <div className="fixed inset-0 z-[200] bg-white/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-green-500 text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-green-200">
              <CheckCircle2 size={48} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Welcome Aboard!</h2>
              <p className="text-slate-500 text-sm font-medium">Your independent profile has been created successfully. Taking you to your dashboard now...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndependentEnrollment;
