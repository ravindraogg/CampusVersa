import React, { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  TrendingUp,
  BookOpen,
  Briefcase,
  Send,
  Bell,
  LogOut,
  Loader2,
  AlertCircle,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Award,
  Settings,
  Cpu,
  Clock,
  Calendar,
  ChevronRight,
  ListTodo,
  History,
  Table as TableIcon 
} from "lucide-react";

// --- IMPORT YOUR SUB-COMPONENTS ---
import StudentAttendanceSection from "./StudentAttendanceSection";
import StudentPerformanceSection from "./StudentPerformanceSection";
import StudentCareerSection from "./StudentCareerSection";
import StudentProfileSection from "./StudentProfileSection";
import StudentTimetableSection from "./StudentTimetableSection";
import StudentCoursesSection from "./StudentCoursesSection"; // <--- MAKE SURE THIS IS IMPORTED

// Placeholder imports for files you may have:
import ResumeBuilder from "./resume"; 
import MockInterview from "./mockinterview";
import FreelanceHub from "./freelance";
import ProjectCollab from "./projectcolab";

const API_URL = import.meta.env.VITE_BACK_URI;

// --- DEFAULT THEME ---
const DEFAULT_THEME = {
  primary: "#2E5843", // Institute Green
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
  { id: "career", label: "Career & Achievements", icon: Briefcase }, 
  { id: "freelance", label: "Freelancing Hub", icon: Send },
];

// --- HELPER: Random Color Generator for Subjects ---
const getSubjectColor = (subjectName) => {
  const colors = [
    "bg-red-50 text-red-700 border-red-100",
    "bg-orange-50 text-orange-700 border-orange-100",
    "bg-amber-50 text-amber-700 border-amber-100",
    "bg-emerald-50 text-emerald-700 border-emerald-100",
    "bg-teal-50 text-teal-700 border-teal-100",
    "bg-cyan-50 text-cyan-700 border-cyan-100",
    "bg-blue-50 text-blue-700 border-blue-100",
    "bg-indigo-50 text-indigo-700 border-indigo-100",
    "bg-violet-50 text-violet-700 border-violet-100",
    "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100",
    "bg-pink-50 text-pink-700 border-pink-100",
    "bg-rose-50 text-rose-700 border-rose-100",
  ];
  if (!subjectName) return "bg-gray-50 text-gray-700 border-gray-100";
  
  let hash = 0;
  for (let i = 0; i < subjectName.length; i++) {
    hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// --- CHART COMPONENT ---
const SimpleBarChart = ({ data, color, height = "h-32" }) => (
  <div className={`flex items-end justify-between ${height} w-full gap-2 mt-4`}>
    {data.length === 0 ? (
      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 italic">
        No data available
      </div>
    ) : (
      data.map((item, index) => (
        <div key={index} className="flex flex-col items-center w-full group cursor-pointer">
          <div className="relative w-full flex items-end justify-center h-full">
            <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-[10px] px-2 py-1 rounded z-10 pointer-events-none whitespace-nowrap">
              {item.tooltip || `${item.value}%`}
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

// --- NAVIGATION COMPONENT ---
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
      const res = await authFetch("/student/me");
      const data = await res.json();
      setStudent(data.student);
      setInstitute(data.institute);

      if (data.institute?.themeColorPrimary) {
        setTheme((prev) => ({
          ...prev,
          primary: data.institute.themeColorPrimary,
          secondary: data.institute.themeColorSecondary || prev.secondary,
          textOnPrimary: "#FFFFFF",
        }));
      }

      if (data.student?.attendance?.subjectWise) {
        setSubjectWiseData(data.student.attendance.subjectWise);
      }

      if (data.student?.academic?.semesterResults) {
        const perfData = data.student.academic.semesterResults.map(sem => ({
          label: `Sem ${sem.semester}`,
          value: (sem.sgpa / 10) * 100, 
          tooltip: `SGPA: ${sem.sgpa}`
        }));
        setPerformanceChartData(perfData);
      }

      try {
        const attRes = await authFetch("/student/attendance/full");
        if (attRes.ok) {
          const attFullData = await attRes.json();
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
      } catch (e) { console.warn("Recent attendance fetch error", e); }

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
      document.title = `${student.name || "Institute"} | CampusVersa`;
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
                <span>Overall Attendance Low ({student.attendance.overallPercentage}%)</span>
             </div>
          </div>
        )}
      </div>

      {/* 2. Left Column (Main Stats & Charts) - Span 3 */}
      <div className="lg:col-span-3 flex flex-col gap-6">
         
         {/* Quick Stats Row */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start">
                   <div className="p-2 bg-green-50 rounded-full text-green-600"><GraduationCap className="w-5 h-5"/></div>
                   <span className="text-[10px] text-gray-400 font-bold uppercase">CGPA</span>
                </div>
                <div className="mt-2">
                   <h3 className="text-2xl font-black text-gray-800">{student?.academic?.cgpa || "N/A"}</h3>
                   <p className="text-[10px] text-green-600 font-bold">Academic Score</p>
                </div>
            </div>

            <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start">
                   <div className="p-2 bg-blue-50 rounded-full text-blue-600"><CalendarDays className="w-5 h-5"/></div>
                   <span className="text-[10px] text-gray-400 font-bold uppercase">Attendance</span>
                </div>
                <div className="mt-2">
                   <h3 className="text-2xl font-black text-gray-800">{student?.attendance?.overallPercentage || 0}%</h3>
                   <p className="text-[10px] text-gray-400">Overall Avg</p>
                </div>
            </div>

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

            <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start">
                   <div className="p-2 bg-purple-50 rounded-full text-purple-600"><Send className="w-5 h-5"/></div>
                   <span className="text-[10px] text-gray-400 font-bold uppercase">Gigs</span>
                </div>
                <div className="mt-2">
                   <h3 className="text-2xl font-black text-gray-800">0</h3>
                   <p className="text-[10px] text-gray-400">Active Applications</p>
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
                              {subj.percentage}%
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

            {/* Performance Trend Chart */}
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col h-full">
               <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-gray-700 flex items-center gap-2">
                     <TrendingUp className="w-4 h-4 text-gray-400" /> Academic Trend
                  </h4>
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded font-bold">CGPA</span>
               </div>
               <SimpleBarChart data={performanceChartData} color="#6366f1" height="h-40" />
            </div>
         </div>

         {/* Upcoming Tasks */}
         <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" /> Upcoming Deadlines
              </h3>
              <button onClick={() => setActiveTab("courses")} className="text-xs font-bold text-blue-600 hover:underline">
                View All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-orange-200 transition-colors">
                 <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Assignment</span>
                    <span className="text-[10px] font-bold text-orange-600">Tomorrow</span>
                 </div>
                 <h4 className="font-bold text-sm text-gray-800 line-clamp-1">Data Structures Lab</h4>
              </div>
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
               <Calendar className="w-24 h-24 text-orange-600" />
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
      
      // --- UPDATED: USE THE NEW COMPONENT ---
      case "courses": 
         return <StudentCoursesSection />;

      case "performance": return <StudentPerformanceSection student={student} />;
      case "career": return <div className="space-y-8 animate-in fade-in"><StudentCareerSection /><div className="grid lg:grid-cols-2 gap-6"><ResumeBuilder theme={theme} /><MockInterview theme={theme} /></div></div>;
      case "freelance": return <div className="space-y-6 animate-in fade-in"><FreelanceHub theme={theme} /><ProjectCollab /></div>;
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
            <p className="text-[10px] uppercase font-bold mt-1">Student Portal</p>
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