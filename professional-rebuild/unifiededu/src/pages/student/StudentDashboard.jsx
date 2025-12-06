import React, { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  TrendingUp,
  BookOpen,
  Briefcase,
  Bell,
  LogOut,
  Loader2,
  AlertCircle,
  GraduationCap,
  Sparkles,
  ChevronRight,
  ListTodo,
  History,
  ArrowLeft,
  FileText,
  Map,
  Mic,
  Code2,
  Users,
  Send, 
  Table as TableIcon
} from "lucide-react";

// --- SUB-COMPONENTS ---
import StudentAttendanceSection from "./StudentAttendanceSection";
import StudentPerformanceSection from "./StudentPerformanceSection";
import StudentProfileSection from "./StudentProfileSection";
import StudentTimetableSection from "./StudentTimetableSection";
import StudentCoursesSection from "./StudentCoursesSection"; 

// --- FEATURE COMPONENTS ---
import ResumeBuilder from "./resume"; 
import MockInterview from "./mockinterview";
import ProjectCollab from "./projectcolab"; 
import FreelanceHub from "./freelance"; 
import ProblemSolvingArena from "./problemsolve"; 
import Roadmap from "./roadmap"; 

const API_URL = import.meta.env.VITE_BACK_URI;

// --- DEFAULT THEME ---
const DEFAULT_THEME = {
  primary: "#2E5843",
  secondary: "#D4E7DD",
  bg: "#F2F5F3",
  textMain: "#1F2937",
  white: "#FFFFFF",
  textOnPrimary: "#FFFFFF",
};

// --- NAVIGATION CONFIGURATION ---
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "attendance", label: "Attendance", icon: CalendarDays },
  { id: "timetable", label: "Timetable", icon: TableIcon }, 
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "performance", label: "Performance", icon: TrendingUp },
  { id: "career", label: "Career & Skills", icon: Briefcase }, 
  { id: "freelance", label: "Freelance Hub", icon: Send }, 
];

// --- HELPER: VTU Grading Logic (Client Side) ---
const getGradePoint = (marks) => {
  if (marks >= 90) return 10;
  if (marks >= 80) return 9;
  if (marks >= 70) return 8;
  if (marks >= 60) return 7;
  if (marks >= 55) return 6;
  if (marks >= 50) return 5;
  if (marks >= 40) return 4;
  return 0;
};

// --- CAREER HUB COMPONENT ---
const CareerHub = ({ theme }) => {
  const [activeFeature, setActiveFeature] = useState(null);

  const FEATURES = [
    {
      id: "resume",
      title: "AI Resume Builder",
      description: "Create & improve resume automatically. Dedicated builder page.",
      buttonText: "Open Builder",
      icon: FileText,
      color: "bg-blue-50 text-blue-600",
      component: ResumeBuilder
    },
    {
      id: "roadmap",
      title: "Personalized Roadmap",
      description: "Plan your path. Roadmaps for DSA, Web Dev, AI & more.",
      buttonText: "View Roadmap",
      icon: Map,
      color: "bg-emerald-50 text-emerald-600",
      component: Roadmap
    },
    {
      id: "interview",
      title: "Mock Interview Suite",
      description: "Practice HR & technical interviews with AI feedback.",
      buttonText: "Start Interview",
      icon: Mic,
      color: "bg-purple-50 text-purple-600",
      component: MockInterview
    },
    {
      id: "problems",
      title: "Problem Solving Arena",
      description: "100+ curated DSA & logic problems with hints.",
      buttonText: "Start Solving",
      icon: Code2,
      color: "bg-orange-50 text-orange-600",
      component: ProblemSolvingArena
    },
    {
      id: "projects",
      title: "Project Collaboration",
      description: "Find peers, join teams & build real projects together.",
      buttonText: "Find Projects",
      icon: Users,
      color: "bg-pink-50 text-pink-600",
      component: ProjectCollab
    }
  ];

  if (activeFeature) {
    const feature = FEATURES.find(f => f.id === activeFeature);
    const Component = feature?.component || (() => <div>Component Not Found</div>);

    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col">
        <button 
          onClick={() => setActiveFeature(null)}
          className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors w-fit"
        >
          <ArrowLeft size={18} /> Back to Career Hub
        </button>
        <div className="flex-1">
          <Component theme={theme} />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Career & Skills Hub</h2>
        <p className="text-gray-500">Select a tool to boost your professional journey.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((feature) => (
          <div 
            key={feature.id}
            onClick={() => setActiveFeature(feature.id)}
            className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all cursor-pointer flex flex-col justify-between h-full"
          >
            <div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-xl ${feature.color}`}>
                <feature.icon size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-50 flex items-center text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {feature.buttonText} <ChevronRight size={16} className="ml-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- HELPER: Simple Chart ---
const SimpleBarChart = ({ data, color, height = "h-32" }) => (
  <div className={`flex items-end justify-between ${height} w-full gap-2 mt-4`}>
    {data.length === 0 ? (
      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 italic">
        No academic history yet
      </div>
    ) : (
      data.map((item, index) => (
        <div key={index} className="flex flex-col items-center w-full group cursor-pointer">
          <div className="relative w-full flex items-end justify-center h-full">
            <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-[10px] px-2 py-1 rounded z-10 pointer-events-none whitespace-nowrap">
              {item.tooltip || `${item.value.toFixed(1)}`}
            </div>
            <div
              className="w-full mx-1 rounded-t-lg transition-all duration-500 hover:opacity-80 relative"
              style={{ height: `${item.value}%`, backgroundColor: color }}
            ></div>
          </div>
          <span className="text-[10px] text-gray-400 mt-2 font-medium truncate w-full text-center">
            {item.label}
          </span>
        </div>
      ))
    )}
  </div>
);

// --- AUTH FETCH ---
const authFetch = async (path, opts = {}) => {
  const token = localStorage.getItem("studentToken");
  const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  
  const res = await fetch(`${API_URL}${path}`, { ...opts, headers });
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem("studentToken");
    window.location.href = "/student/auth";
    throw new Error("Unauthorized");
  }
  return res;
};

// --- COMPONENT: Navigation ---
const StudentNav = ({ activeTab, setActiveTab, theme }) => {
  return (
    <div
      className="h-full rounded-[2rem] shadow-sm flex items-center px-2 transition-all duration-300 w-auto"
      style={{ backgroundColor: theme.primary }}
    >
      <div className="flex items-center gap-1 p-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-4 py-2.5 rounded-[2rem] flex items-center gap-2 transition-all duration-300 whitespace-nowrap text-sm font-medium ${
              activeTab === item.id ? "shadow-md scale-105" : "hover:bg-white/10"
            }`}
            style={{
              backgroundColor: activeTab === item.id
                ? (theme.textOnPrimary === "#FFFFFF" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)")
                : "transparent",
              color: theme.textOnPrimary,
              opacity: activeTab === item.id ? 1 : 0.8,
            }}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD COMPONENT ---
const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [institute, setInstitute] = useState(null);
  const [theme, setTheme] = useState(DEFAULT_THEME);
  
  // Data States
  const [performanceChartData, setPerformanceChartData] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]); 
  const [subjectWiseData, setSubjectWiseData] = useState([]); 
  const [availableTimetables, setAvailableTimetables] = useState([]); 

  // --- DATA LOADING ---
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Basic Profile
      const res = await authFetch("/student/me");
      const data = await res.json();
      let currentStudent = data.student;
      setInstitute(data.institute);

      if (data.institute?.themeColorPrimary) {
        setTheme((prev) => ({
          ...prev,
          primary: data.institute.themeColorPrimary,
          secondary: data.institute.themeColorSecondary || prev.secondary,
          textOnPrimary: "#FFFFFF",
        }));
      }

      // 2. Fetch LIVE Attendance & Use it to Calculate GPA
      try {
        const attRes = await authFetch("/student/attendance/full");
        if (attRes.ok) {
          const attFullData = await attRes.json();
          
          // A. Attendance Logic
          let totalClasses = 0;
          let totalPresent = 0;
          const liveSubjects = attFullData.map(record => {
            totalClasses += (record.totalClasses || 0);
            totalPresent += (record.totalPresent || 0);
            return {
              subjectName: record.courseId?.name || "Unknown Course",
              percentage: record.percentage || 0
            };
          });
          setSubjectWiseData(liveSubjects);

          const liveOverall = totalClasses > 0 ? (totalPresent / totalClasses) * 100 : 0;
          
          // B. CLIENT-SIDE GPA CALCULATION (Fallback)
          // We need course credits from 'attFullData' (since it populates courseId)
          // and marks from 'currentStudent.courseEnrollments'
          
          let calculatedResults = [];
          let sumSiCi = 0;
          let sumCiTotal = 0;

          // Create a map of CourseID -> Credits from attendance data
          const creditMap = {};
          attFullData.forEach(r => {
            if(r.courseId && r.courseId._id) {
                creditMap[r.courseId._id] = r.courseId.credits || 3; // Default 3
            }
          });

          if (currentStudent.courseEnrollments) {
            currentStudent.courseEnrollments.forEach(semData => {
                let semCreditsTotal = 0;
                let semProduct = 0;

                semData.subjects.forEach(sub => {
                    const credits = creditMap[sub.courseId] || 3; 
                    
                    // Calc Marks
                    let finalMarks = sub.marksObtained || 0;
                    if(finalMarks === 0 && sub.marksDetails) {
                        const m = sub.marksDetails;
                        const internal = (m.test1 + m.test2 + m.test3 + m.assignment) / 4;
                        const external = m.external / 2; 
                        finalMarks = internal + external;
                    }

                    const gp = getGradePoint(finalMarks);
                    if(gp > 0 || finalMarks >= 0) { // consider all valid attempts
                        semCreditsTotal += credits;
                        semProduct += (credits * gp);
                    }
                });

                if (semCreditsTotal > 0) {
                    const sgpa = semProduct / semCreditsTotal;
                    calculatedResults.push({
                        semester: semData.semester,
                        sgpa: parseFloat(sgpa.toFixed(2))
                    });
                    
                    sumSiCi += (sgpa * semCreditsTotal);
                    sumCiTotal += semCreditsTotal;
                }
            });
          }

          const calculatedCGPA = sumCiTotal > 0 ? (sumSiCi / sumCiTotal).toFixed(2) : "0.00";

          // Update Student State with LIVE calculated data
          currentStudent = {
            ...currentStudent,
            attendance: {
                ...currentStudent.attendance,
                overallPercentage: liveOverall
            },
            academic: {
                ...currentStudent.academic,
                cgpa: calculatedCGPA,
                creditsEarned: sumCiTotal,
                semesterResults: calculatedResults // Use live calculated SGPAs
            }
          };

          setStudent(currentStudent);

          // C. Update Charts with New SGPA Data
          const sortedResults = [...calculatedResults].sort((a, b) => Number(a.semester) - Number(b.semester));
          const perfData = sortedResults.map(sem => ({
            label: `Sem ${sem.semester}`,
            value: (sem.sgpa / 10) * 100, // Scale 0-10 SGPA to 0-100% height
            tooltip: `SGPA: ${sem.sgpa}`
          }));
          setPerformanceChartData(perfData);

          // D. Recent Activity
          const allHistory = attFullData.flatMap(record => 
            (record.history || []).map(h => ({
              ...h,
              courseName: record.courseId?.name || "Unknown Course",
              courseCode: record.courseId?.code || ""
            }))
          );
          allHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
          setRecentAttendance(allHistory.slice(0, 3));
        }
      } catch (e) { console.warn("Attendance/GPA fetch error", e); }

      // 4. Timetables
      try {
        const ttRes = await authFetch("/student/timetable");
        if (ttRes.ok) {
          const ttList = await ttRes.json();
          setAvailableTimetables(Array.isArray(ttList) ? ttList : []);
        }
      } catch (e) { console.warn("Timetable fetch error", e); }

    } catch (err) {
      console.error("Profile Load Error", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (institute) {
      document.title = `${student?.name || "Institute"} | CampusVersa`;
      if (institute.logo) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.getElementsByTagName("head")[0].appendChild(link);
        }
        link.href = institute.logo;
      }
    }
  }, [student, institute]);

  useEffect(() => { loadData(); }, [loadData]);
  
  const handleLogout = () => {
    localStorage.removeItem("studentToken");
    window.location.href = "/student/auth";
  };

  // --- RENDER DASHBOARD OVERVIEW ---
  const renderDashboardOverview = () => (
    <div className="animate-in fade-in duration-500 grid grid-cols-1 lg:grid-cols-4 gap-6 pb-10">
      
      {/* 1. Welcome Header */}
      <div className="lg:col-span-4 bg-gradient-to-r from-gray-50 to-white p-6 rounded-[2rem] border border-gray-100 flex items-center justify-between shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome back, {student?.name?.split(" ")[0]}!
          </h2>
          <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
             <Sparkles className="w-4 h-4 text-yellow-500" />
             AI Prediction: <span className="font-bold text-green-600">Stable Growth</span>.
          </p>
        </div>
        {student?.attendance?.overallPercentage < 75 && (
          <div className="hidden md:flex flex-col gap-2 relative z-10">
             <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-xl border border-red-100 text-xs font-bold shadow-sm">
                <AlertCircle className="w-4 h-4" /> 
                <span>Overall Attendance Low ({Number(student.attendance.overallPercentage || 0).toFixed(2)}%)</span>
             </div>
          </div>
        )}
      </div>

      {/* 2. Left Column (Main Stats & Charts) - Span 3 */}
      <div className="lg:col-span-3 flex flex-col gap-6">
         
         {/* Quick Stats Row */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* CGPA CARD - Uses Live Calculated Data */}
            <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start">
                   <div className="p-2 bg-green-50 rounded-full text-green-600"><GraduationCap className="w-5 h-5"/></div>
                   <span className="text-[10px] text-gray-400 font-bold uppercase">CGPA</span>
                </div>
                <div className="mt-2">
                   <h3 className="text-2xl font-black text-gray-800">{student?.academic?.cgpa || "0.00"}</h3>
                   <p className="text-[10px] text-green-600 font-bold">Cumulative</p>
                </div>
            </div>

            {/* Attendance Card */}
            <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start">
                   <div className="p-2 bg-blue-50 rounded-full text-blue-600"><CalendarDays className="w-5 h-5"/></div>
                   <span className="text-[10px] text-gray-400 font-bold uppercase">Attendance</span>
                </div>
                <div className="mt-2">
                   <h3 className="text-2xl font-black text-gray-800">{Number(student?.attendance?.overallPercentage || 0).toFixed(2)}%</h3>
                   <p className="text-[10px] text-gray-400">Overall Avg</p>
                </div>
            </div>

            {/* Credits Card */}
            <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start">
                   <div className="p-2 bg-orange-50 rounded-full text-orange-600"><ListTodo className="w-5 h-5"/></div>
                   <span className="text-[10px] text-gray-400 font-bold uppercase">Credits</span>
                </div>
                <div className="mt-2">
                   <h3 className="text-2xl font-black text-gray-800">{student?.academic?.creditsEarned || 0}</h3>
                   <p className="text-[10px] text-orange-500 font-bold">Earned so far</p>
                </div>
            </div>

            {/* Courses Card */}
            <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start">
                   <div className="p-2 bg-purple-50 rounded-full text-purple-600"><BookOpen className="w-5 h-5"/></div>
                   <span className="text-[10px] text-gray-400 font-bold uppercase">Courses</span>
                </div>
                <div className="mt-2">
                   <h3 className="text-2xl font-black text-gray-800">
                     {student?.courseEnrollments?.find(s => s.semester === student.semester)?.subjects?.length || 0}
                   </h3>
                   <p className="text-[10px] text-gray-400">Active Subjects</p>
                </div>
            </div>
         </div>
         
         {/* Charts Section */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* SUBJECT ATTENDANCE CARD */}
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col h-full min-h-[250px]">
               <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-gray-700 flex items-center gap-2">
                     <CalendarDays className="w-4 h-4 text-gray-400" /> Subject Attendance
                  </h4>
                  <span className={`text-xs px-2 py-1 rounded font-bold ${
                    student?.attendance?.overallPercentage  >= 75 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
                  }`}>
                    {student?.attendance?.overallPercentage >= 75 ? "Good" : "Low"}
                  </span>
               </div>
               
               {/* List View */}
               <div className="space-y-4 overflow-y-auto flex-1 custom-scrollbar pr-2">
                  {subjectWiseData.length > 0 ? (
                    subjectWiseData.map((subj, idx) => (
                      <div key={idx} className="flex flex-col gap-1 group">
                        <div className="flex justify-between items-center">
                           <p className="text-xs font-bold text-gray-700 truncate w-3/4" title={subj.subjectName}>
                              {subj.subjectName}
                           </p>
                           <span className={`text-xs font-bold ${subj.percentage >= 75 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {Number(subj.percentage || 0).toFixed(2)}%
                           </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                           <div 
                             className={`h-1.5 rounded-full transition-all duration-500 ${subj.percentage >= 75 ? 'bg-emerald-500' : 'bg-red-500'}`} 
                             style={{ width: `${subj.percentage}%` }}
                           ></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-xs">No subjects found</div>
                  )}
               </div>
            </div>

            {/* Performance Trend Chart (Uses Live SGPA Data) */}
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col h-full">
               <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-gray-700 flex items-center gap-2">
                     <TrendingUp className="w-4 h-4 text-gray-400" /> Academic Trend
                  </h4>
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded font-bold">SGPA/Sem</span>
               </div>
               <SimpleBarChart data={performanceChartData} color="#6366f1" height="h-40" />
            </div>
         </div>
      </div>

      {/* 3. Right Column (Sidebar) - Span 1 */}
      <div className="lg:col-span-1 flex flex-col gap-4">
         
         {/* Profile */}
         <div 
            className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setActiveTab("settings")}
         >
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center border-2 overflow-hidden" style={{ borderColor: theme.primary }}>
               {student?.profilePic ? (
                  <img src={student.profilePic} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                  <span className="text-lg font-bold text-gray-400">{student?.name?.charAt(0)}</span>
               )}
            </div>
            <div className="overflow-hidden">
               <h3 className="font-bold text-gray-800 truncate text-sm">{student?.name}</h3>
               <p className="text-xs text-gray-500 truncate">{student?.SID || "Student"}</p>
            </div>
         </div>

         {/* Schedule */}
         <div className="bg-orange-50 p-5 rounded-[2rem] border border-orange-100 relative overflow-hidden">
            <div className="absolute right-[-20px] top-[-20px] opacity-10">
               <CalendarDays className="w-24 h-24 text-orange-600" />
            </div>
            <p className="text-orange-600 text-xs font-bold uppercase mb-1 relative z-10">Today's Schedule</p>
            <h3 className="text-4xl font-extrabold text-orange-900 relative z-10">
               {student?.todayClasses || 0} <span className="text-lg ml-1 font-bold opacity-60">Classes</span>
            </h3>
            <p className="text-xs text-orange-700 mt-2 relative z-10 font-medium cursor-pointer hover:underline" onClick={() => setActiveTab('timetable')}>
               Check Timetable tab
            </p>
         </div>

         {/* Recent Activity */}
         <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
            <h4 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
               <History className="w-4 h-4 text-gray-400" /> Recent Attendance
            </h4>
            <div className="space-y-3">
               {recentAttendance.length > 0 ? (
                  recentAttendance.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors">
                       <div className="overflow-hidden">
                          <p className="text-xs font-bold text-gray-700 truncate w-32">{item.courseName}</p>
                          <p className="text-[10px] text-gray-400">
                             {new Date(item.date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                          </p>
                       </div>
                       <div className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-bold ${
                          item.value === 1 ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                       }`}>
                          {item.value === 1 ? "P" : "A"}
                       </div>
                    </div>
                  ))
               ) : (
                  <p className="text-xs text-gray-400 text-center py-2">No recent records found.</p>
               )}
            </div>
         </div>
      </div>
    </div>
  );

  // --- CONTENT SWITCHER ---
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return renderDashboardOverview();
      case "attendance": return <StudentAttendanceSection student={student} />;
      case "timetable": 
        return (
          <StudentTimetableSection 
             timetables={availableTimetables} 
             student={student} 
             theme={theme} 
          />
        );
      case "courses": 
        return <StudentCoursesSection student={student} theme={theme} />;
      case "performance": return <StudentPerformanceSection student={student} />;
      
      // CAREER & SKILLS (5 Cards)
      case "career": return <CareerHub theme={theme} />;

      // FREELANCE HUB (Separate Tab)
      case "freelance": 
        return (
          <div className="animate-in fade-in h-full">
             <FreelanceHub theme={theme} />
          </div>
        );

      case "settings": return <div className="animate-in fade-in max-w-4xl mx-auto"><StudentProfileSection student={student} institute={institute} theme={theme} refreshProfile={loadData} /></div>;
      default: return null;
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#F8F9FC]"><Loader2 className="w-10 h-10 animate-spin" style={{color: theme.primary}}/></div>;

  return (
    <div className="h-screen w-screen bg-[#F8F9FC] p-4 lg:p-6 flex flex-col gap-6 overflow-hidden font-sans antialiased relative">
      <div className="shrink-0 flex items-center justify-between gap-4 h-18">
        <div className="h-full px-6 rounded-[2rem] flex items-center gap-4 shadow-lg shadow-gray-200/50 min-w-[200px]" style={{ backgroundColor: theme.primary, color: theme.white }}>
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center p-1 border-2 border-white/30">
            {institute?.logo ? <img src={institute.logo} alt="Logo" className="w-full h-full object-contain p-1" /> : <GraduationCap className="w-6 h-6 text-white" />}
          </div>
          <div>
            <h1 className="font-extrabold text-lg leading-none">{institute?.code || "CAMPUS"}</h1>
            <p className="text-[10px] uppercase font-bold mt-1"style={{color: theme.secondary}}>Student Portal</p>
          </div>
        </div>
        <StudentNav activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
        <div className="h-full flex gap-3">
          <button className="h-full aspect-square rounded-[2rem] shadow-sm flex items-center justify-center bg-white border border-gray-100"><Bell className="w-6 h-6 text-gray-600" /></button>
          <button onClick={handleLogout} className="h-full px-6 rounded-[2rem] shadow-sm flex items-center justify-center gap-2 bg-white border border-gray-100 hover:bg-red-50 text-gray-700 font-bold text-sm"><LogOut className="w-5 h-5" /> Logout</button>
        </div>
      </div>
      <div className="flex-1 bg-white rounded-[3rem] shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-8 overflow-y-auto relative custom-scrollbar border border-gray-100">
        {renderContent()}
      </div>
    </div>
  );
};

export default StudentDashboard;