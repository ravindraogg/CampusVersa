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
  CheckCircle,
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
  ListTodo
} from "lucide-react";

// --- IMPORT YOUR SUB-COMPONENTS ---
import StudentAttendanceSection from "./StudentAttendanceSection";
import StudentPerformanceSection from "./StudentPerformanceSection";
import StudentExamCalendarSection from "./StudentExamCalendarSection";
import StudentCareerSection from "./StudentCareerSection";
import StudentProfileSection from "./StudentProfileSection";
// Placeholder imports for files you may have:
import ResumeBuilder from "./resume"; 
import MockInterview from "./mockinterview";
import FreelanceHub from "./freelance";
import ProjectCollab from "./projectcolab";
import Roadmap from "./roadmap"; 

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

// --- FINAL 6-ITEM NAVIGATION CONFIGURATION ---
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "attendance", label: "Attendance", icon: CalendarDays },
  { id: "performance", label: "Performance", icon: TrendingUp },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "career", label: "Career & Achievements", icon: Briefcase }, 
  { id: "freelance", label: "Freelancing Hub", icon: Send },
];

// --- HELPER COMPONENTS ---

// 1. Simple CSS Bar Chart (Matches Faculty Dashboard Style)
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
            {/* Tooltip */}
            <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-[10px] px-2 py-1 rounded z-10 pointer-events-none">
              {item.tooltip || `${item.value}%`}
            </div>
            {/* Bar */}
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

// --- STUDENT NAV COMPONENT ---
const StudentNav = ({ activeTab, setActiveTab, theme }) => {
  return (
    <div
      className="h-full rounded-[2rem] shadow-sm flex items-center px-4 overflow-x-auto no-scrollbar w-fit transition-all duration-300 max-w-[60vw]"
      style={{ backgroundColor: theme.primary }}
    >
      <div className="flex items-center gap-2 p-2">
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
  const [notification, setNotification] = useState(null);

  // Chart Data States
  const [attendanceChartData, setAttendanceChartData] = useState([]);
  const [performanceChartData, setPerformanceChartData] = useState([]);

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

      // --- PROCESS CHART DATA ---
      // 1. Attendance Data
      if (data.student?.attendance?.subjectWise) {
        const attData = data.student.attendance.subjectWise.map(subj => ({
          label: subj.subjectName.substring(0, 8),
          value: subj.percentage,
          tooltip: `${subj.subjectName}: ${subj.percentage}%`
        }));
        setAttendanceChartData(attData);
      }

      // 2. Performance Data
      if (data.student?.academic?.semesterResults) {
        const perfData = data.student.academic.semesterResults.map(sem => ({
          label: `Sem ${sem.semester}`,
          value: (sem.sgpa / 10) * 100, 
          tooltip: `SGPA: ${sem.sgpa}`
        }));
        setPerformanceChartData(perfData);
      }

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
    }, [student]);
  useEffect(() => { loadData(); }, [loadData]);
  
  const handleLogout = () => {
    localStorage.removeItem("studentToken");
    window.location.href = "/student/auth";
  };

  // --- RENDER DASHBOARD OVERVIEW (Faculty Style) ---
  const renderDashboardOverview = () => (
    <div className="animate-in fade-in duration-500 grid grid-cols-1 lg:grid-cols-4 gap-6 pb-10">
      
      {/* 1. Welcome Header (Full Width) */}
      <div className="lg:col-span-4 bg-gradient-to-r from-gray-50 to-white p-6 rounded-[2rem] border border-gray-100 flex items-center justify-between shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome back, {student?.name?.split(" ")[0]}!
          </h2>
          <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
             <Sparkles className="w-4 h-4 text-yellow-500" />
             AI Prediction: <span className="font-bold text-green-600">Stable Growth</span>. Keep up the good work in Sem {student?.semester}.
          </p>
        </div>
        
        {/* Early Warning Badge */}
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
            {/* Subject Attendance Chart */}
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
               <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-gray-700 flex items-center gap-2">
                     <CalendarDays className="w-4 h-4 text-gray-400" /> Subject Attendance
                  </h4>
                  <span className={`text-xs px-2 py-1 rounded font-bold ${
                    student?.attendance?.overallPercentage >= 75 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
                  }`}>
                    {student?.attendance?.overallPercentage >= 75 ? "Good" : "Low"}
                  </span>
               </div>
               <SimpleBarChart data={attendanceChartData} color={theme.primary} />
            </div>

            {/* Performance Trend Chart */}
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
               <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-gray-700 flex items-center gap-2">
                     <TrendingUp className="w-4 h-4 text-gray-400" /> Academic Trend
                  </h4>
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded font-bold">GPA</span>
               </div>
               <SimpleBarChart data={performanceChartData} color="#6366f1" />
            </div>
         </div>

         {/* Upcoming Tasks List */}
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
              {/* Placeholder Data */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-orange-200 transition-colors">
                 <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Assignment</span>
                    <span className="text-[10px] font-bold text-orange-600">Tomorrow</span>
                 </div>
                 <h4 className="font-bold text-sm text-gray-800 line-clamp-1">Data Structures Lab</h4>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-orange-200 transition-colors">
                 <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Exam</span>
                    <span className="text-[10px] font-bold text-orange-600">12 Oct</span>
                 </div>
                 <h4 className="font-bold text-sm text-gray-800 line-clamp-1">Internal Assessment 2</h4>
              </div>
            </div>
         </div>
      </div>

      {/* 3. Right Column (Sidebar) - Span 1 */}
      <div className="lg:col-span-1 flex flex-col gap-4">
         
         {/* Profile Snippet */}
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
            <div className="ml-auto">
               <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
         </div>

         {/* "Today's Status" Widget */}
         <div className="bg-orange-50 p-5 rounded-[2rem] border border-orange-100 relative overflow-hidden">
            <div className="absolute right-[-20px] top-[-20px] opacity-10">
               <Calendar className="w-24 h-24 text-orange-600" />
            </div>
            <p className="text-orange-600 text-xs font-bold uppercase mb-1 relative z-10">Today's Schedule</p>
            <h3 className="text-4xl font-extrabold text-orange-900 relative z-10">
               {student?.todayClasses || 0} <span className="text-lg ml-1 font-bold opacity-60">Classes</span>
            </h3>
            <p className="text-xs text-orange-700 mt-2 relative z-10 font-medium">Check Timetable tab for details</p>
         </div>

         {/* Quick Links */}
         <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
            <h4 className="font-bold text-gray-800 text-sm mb-3">Quick Actions</h4>
            <div className="space-y-2">
               <button className="w-full text-left p-3 rounded-xl bg-gray-50 hover:bg-blue-50 text-xs font-bold text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2">
                  <ExternalLink className="w-4 h-4"/> Upload Certificate
               </button>
               <button className="w-full text-left p-3 rounded-xl bg-gray-50 hover:bg-green-50 text-xs font-bold text-gray-600 hover:text-green-600 transition-colors flex items-center gap-2">
                  <Cpu className="w-4 h-4"/> Ask AI Assistant
               </button>
               <button onClick={() => setActiveTab('performance')} className="w-full text-left p-3 rounded-xl bg-gray-50 hover:bg-purple-50 text-xs font-bold text-gray-600 hover:text-purple-600 transition-colors flex items-center gap-2">
                  <Award className="w-4 h-4"/> View Results
               </button>
            </div>
         </div>

      </div>
    </div>
  );

  // --- RENDER CONTENT SWITCHER ---
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return renderDashboardOverview();
      case "attendance": return <StudentAttendanceSection student={student} />;
      case "performance": 
         return (
             <div className="space-y-6 animate-in fade-in">
                <StudentPerformanceSection student={student} />
                <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100 relative overflow-hidden">
                   <div className="relative z-10">
                      <h3 className="font-bold text-indigo-900 flex items-center gap-2 mb-2">
                         <Sparkles className="w-5 h-5" /> AI Performance Predictor
                      </h3>
                      <p className="text-sm text-indigo-700 max-w-2xl">
                         Based on your current trajectory, our AI predicts a <strong>9.4 SGPA</strong>.
                      </p>
                   </div>
                </div>
             </div>
         );
      case "courses": return (
        <div className="animate-in fade-in space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Enrolled Courses</h2>
            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">Semester {student?.semester}</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {student?.courseEnrollments?.flatMap(sem => sem.subjects).map((sub, i) => (
                <div key={i} className="p-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><BookOpen className="w-6 h-6" /></div>
                    <span className="text-xs font-bold text-gray-400">Enrolled</span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-800">{sub.courseName}</h3>
                  <p className="text-xs text-gray-500 mt-1">{sub.courseCode}</p>
                </div>
             )) || (
                <p className="text-gray-400 col-span-2 text-center py-10">No courses found.</p>
             )}
          </div>
        </div>
      );
      case "career": return (
         <div className="space-y-8 animate-in fade-in">
             <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"><Briefcase className="w-6 h-6"/> Career & Placements</h2>
                <StudentCareerSection />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                   <ResumeBuilder theme={theme} />
                   <MockInterview theme={theme} />
                </div>
             </div>
         </div>
      );
      case "freelance": return <div className="space-y-6 animate-in fade-in"><FreelanceHub theme={theme} /><ProjectCollab /></div>;
      
      // NEW: Pass institute prop
      case "settings": 
        return (
          <div className="animate-in fade-in max-w-4xl mx-auto space-y-6">
             <StudentProfileSection 
                student={student} 
                institute={institute} // PASS THIS
                theme={theme} 
                refreshProfile={loadData} 
             />
          </div>
        );
        
      default: return null;
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#F8F9FC]"><Loader2 className="w-10 h-10 animate-spin" style={{color: theme.primary}}/></div>;

  return (
    <div className="h-screen w-screen bg-[#F8F9FC] p-4 lg:p-6 flex flex-col gap-6 overflow-hidden font-sans antialiased relative">
      
      {/* HEADER ROW */}
      <div className="shrink-0 flex items-center justify-between gap-4 h-18">
        {/* Logo */}
        <div className="h-full px-6 rounded-[2rem] flex items-center gap-4 shadow-lg shadow-gray-200/50 min-w-[200px] transition-transform hover:scale-[1.02]" style={{ backgroundColor: theme.primary, color: theme.white }}>
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center p-1 border-2 border-white/30">
            {institute?.logo ? <img src={institute.logo} alt="Logo" className="w-full h-full object-contain p-1" /> : <GraduationCap className="w-6 h-6 text-white" />}
          </div>
          <div>
            <h1 className="font-extrabold text-lg leading-none tracking-tight">{institute?.code || "CAMPUS"}</h1>
            <p className="text-[10px] opacity-90 uppercase tracking-widest font-bold mt-1">Student Portal</p>
          </div>
        </div>

        {/* Navigation Pills (6 Items) */}
        <StudentNav activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />

        {/* Action Buttons */}
        <div className="h-full flex gap-3">
          <button className="h-full aspect-square rounded-[2rem] shadow-sm flex items-center justify-center relative transition-all hover:bg-gray-50 border border-gray-100 bg-white">
             <Bell className="w-6 h-6 text-gray-600" />
          </button>
          
          <button 
            onClick={() => setActiveTab('settings')}
            className={`h-full aspect-square rounded-[2rem] shadow-sm flex items-center justify-center transition-all border border-gray-100 ${
              activeTab === 'settings' ? 'bg-gray-100 text-black' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
            title="Settings"
          >
             <Settings className="w-6 h-6" />
          </button>

          <button onClick={handleLogout} className="h-full px-6 rounded-[2rem] shadow-sm flex items-center justify-center gap-2 transition-all font-bold text-sm bg-white border border-gray-100 hover:bg-red-50 hover:text-red-500 hover:border-red-100 text-gray-700">
             <LogOut className="w-5 h-5" /> <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 bg-white rounded-[3rem] shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-8 overflow-y-auto relative custom-scrollbar border border-gray-100">
        {renderContent()}
      </div>

    </div>
  );
};

export default StudentDashboard;