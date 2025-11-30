// FacultyDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  LogOut,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  GraduationCap,
  ShieldCheck,
  Clock,
  Briefcase,
  ScrollText,
  BarChart2,
  CalendarDays,
  Megaphone,
  Send,
  Users,
  ChevronRight,
  CalendarClock,
  Fingerprint,
  Settings,
  LayoutDashboard,
  UserCircle,
  BookOpen,
  ClipboardList,
  Award,
  FileText,
  TrendingUp,
  TrendingDown,
  Trash2, // <--- Added Trash2 for reminders
} from "lucide-react";

// --- IMPORT COMPONENTS ---
import FacultyProfile from "./FacultyProfile";
import FacultyCourses from "./FacultyCourses";
import FacultyStudent from "./FacultyStudent";
import FacultySchedule from "./FacultySchedule"; // <--- IMPORTED HERE

const API_URL = import.meta.env.VITE_BACK_URI;

// --- Default Theme ---
const DEFAULT_THEME = {
  primary: "#2A9D8F",
  secondary: "#264653",
  bg: "#F4F1DE",
  textMain: "#1F2937",
  white: "#FFFFFF",
  textOnPrimary: "#FFFFFF",
};

// --- NAVIGATION CONFIG & COMPONENT ---
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "profile", label: "My Profile", icon: UserCircle },
  { id: "timetable", label: "Schedule", icon: CalendarClock },
  { id: "students", label: "Students", icon: Users },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "exams", label: "Exams", icon: ClipboardList },
  { id: "ssr", label: "SSR Update", icon: FileText },
  { id: "naac", label: "NAAC Update", icon: Award },
  { id: "settings", label: "Settings", icon: Settings },
];

const FacultyNav = ({ activeTab, setActiveTab, theme }) => {
  return (
    <div
      className="h-full rounded-[2rem] shadow-sm flex items-center px-4 overflow-x-auto no-scrollbar w-fit transition-all duration-300"
      style={{ backgroundColor: theme.primary }}
    >
      <div className="flex w-full items-center justify-center gap-2 p-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-4 py-2.5 rounded-[2rem] flex items-center gap-2 transition-all duration-300 whitespace-nowrap text-sm font-medium ${
              activeTab === item.id ? "shadow-md" : "hover:bg-white/10"
            }`}
            style={{
              backgroundColor:
                activeTab === item.id
                  ? theme.textOnPrimary === "#FFFFFF"
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(0, 0, 0, 0.1)"
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

// --- Helpers ---
const authFetch = async (path, opts = {}) => {
  const token = localStorage.getItem("facultyToken");
  const headers = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...opts, headers });

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem("facultyToken");
    window.location.href = "/fc/auth";
    throw new Error("Unauthorized");
  }
  return res;
};

// --- Components ---

const Spinner = ({ size = 6, color = "currentColor" }) => (
  <div
    className="rounded-full animate-spin"
    style={{
      width: `${size * 4}px`,
      height: `${size * 4}px`,
      borderWidth: "3px",
      borderStyle: "solid",
      borderTopColor: "transparent",
      borderRightColor: color,
      borderBottomColor: color,
      borderLeftColor: color,
    }}
  />
);

const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-6 border-b border-gray-100 pb-4">
    <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
    {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
  </div>
);

// --- Simple CSS Bar Chart Component ---
const BarChart = ({ data, color }) => (
  <div className="flex items-end justify-between h-32 w-full gap-2 mt-4">
    {data.map((item, index) => (
      <div
        key={index}
        className="flex flex-col items-center w-full group cursor-pointer"
      >
        <div className="relative w-full flex items-end justify-center h-full">
          {/* Tooltip */}
          <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-[10px] px-2 py-1 rounded z-10">
            {item.value}%
          </div>
          {/* Bar */}
          <div
            className="w-full mx-1 rounded-t-lg transition-all duration-500 hover:opacity-80"
            style={{
              height: `${item.value}%`,
              backgroundColor: color,
            }}
          ></div>
        </div>
        <span className="text-[10px] text-gray-400 mt-2 font-medium truncate w-full text-center">
          {item.label}
        </span>
      </div>
    ))}
  </div>
);

// --- Main Component ---
const FacultyDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);
  const [showNotices, setShowNotices] = useState(false);
  const [isPostingNotice, setIsPostingNotice] = useState(false);
  
  // Data State
  const [faculty, setFaculty] = useState(null);
  const [notices, setNotices] = useState([]);
  const [reminders, setReminders] = useState([]); // <--- NEW STATE: Reminders
  const [mySchedule, setMySchedule] = useState(null); // Kept for 'Today's Load' calculation only
  
  // Forms
  const [noticeForm, setNoticeForm] = useState({ title: "", description: "", type: "General" });

  // Theme State
  const [theme, setTheme] = useState(DEFAULT_THEME);

  // --- 1. Browser Tab Title Effect ---
  useEffect(() => {
    if (faculty) {
      document.title = faculty.name
        ? `${faculty.name} | CampusVersa`
        : "Faculty Portal | CampusVersa";

      if (faculty.instituteLogo) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement("link");
          link.rel = "icon";
          document.head.appendChild(link);
        }
        link.href = faculty.instituteLogo;
      }
    }
  }, [faculty]);

  // --- Initial Fetch ---
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Profile
      const res = await authFetch("/faculty/me");
      let data = await res.json();

      // MOCK DATA INJECTION (Preserved)
      data = {
        ...data,
        qualification: data.qualification || "Ph.D. in Computer Science",
        designation: data.designation || "Associate Professor",
        experience: data.experience || "8 Years Teaching, 2 Years Industry",
        joiningDate: data.joiningDate || "2015-08-20",
        aparScore: "9.2 / 10",
        research: data.research || {
          citations: 450,
          hIndex: 12,
          i10Index: 15,
          papersPublished: 32,
          projectsGuided: 18,
          patents: 2,
        },
      };

      setFaculty(data);

      if (data.themeColorPrimary) {
        setTheme((prev) => ({
          ...prev,
          primary: data.themeColorPrimary,
          secondary: data.themeColorSecondary || prev.secondary,
          textOnPrimary: data.themeColorSecondary ? "#FFFFFF" : "#FFFFFF",
        }));
      }

      // 2. Fetch Notices
      const noticeRes = await authFetch("/faculty/notices"); 
      const noticeData = await noticeRes.json();
      setNotices(noticeData || []);

      // 3. Fetch Reminders (NEW)
      const remRes = await authFetch("/faculty/reminders");
      setReminders(await remRes.json() || []);

    } catch (err) {
      console.error(err);
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- Dynamic Data Loaders ---
  useEffect(() => {
    if (!faculty) return;

    const fetchTodaysLoad = async () => {
      // We still need this briefly for the "Today's Load" counter in the dashboard tab
      if (activeTab === "dashboard" && !mySchedule) {
        try {
          const res = await authFetch("/institute/timetables");
          const allTimetables = await res.json();
          if (allTimetables.length > 0) {
            const latest = allTimetables[0];
            const mySlots = {};
            Object.entries(latest.schedule).forEach(([day, slots]) => {
              const relevantSlots = slots.filter(
                (slot) =>
                  slot.faculty &&
                  slot.faculty
                    .toLowerCase()
                    .includes(faculty.name.toLowerCase())
              );
              if (relevantSlots.length > 0) mySlots[day] = relevantSlots;
            });
            setMySchedule(mySlots);
          }
        } catch (e) {
          console.error(e);
        }
      }
    };

    fetchTodaysLoad();
  }, [activeTab, faculty, mySchedule]);

  // --- Actions ---
  const handleLogout = () => {
    localStorage.removeItem("facultyToken");
    window.location.href = "/auth";
  };

  const showToast = (msg, type = "success") => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePostNotice = async (e) => {
    e.preventDefault();
    setIsPostingNotice(true);
    try {
      const res = await authFetch("/faculty/notices/add", {
        method: "POST",
        body: JSON.stringify(noticeForm),
      });
      
      if (res.ok) {
        const newNotice = await res.json();
        setNotices([newNotice, ...notices]);
        setNoticeForm({ title: "", description: "", type: "General" });
        showToast("Notice Posted Successfully!");
      } else {
        showToast("Failed to post notice", "error");
      }
    } catch (err) {
      showToast("Server Error", "error");
    } finally {
      setIsPostingNotice(false);
    }
  };

  // --- NEW: Delete Reminder ---
  const handleDeleteReminder = async (id) => {
    try {
      await authFetch(`/faculty/reminders/${id}`, { method: 'DELETE' });
      setReminders(reminders.filter(r => r._id !== id));
      showToast("Reminder Removed", "success");
    } catch(e) { 
      console.error(e); 
      showToast("Failed to remove reminder", "error");
    }
  };

  // --- Render Sections ---

  const renderDashboard = () => {
    const attendanceData = [
      { label: "Mon", value: 85 },
      { label: "Tue", value: 92 },
      { label: "Wed", value: 78 },
      { label: "Thu", value: 88 },
      { label: "Fri", value: 65 },
    ];

    const performanceData = [
      { label: "A", value: 30 },
      { label: "B", value: 45 },
      { label: "C", value: 15 },
      { label: "Fail", value: 10 },
    ];

    const topPerformers = [
      { name: "Aditi Rao", year: "4th", score: "9.8 CGPA" },
      { name: "Rahul Verma", year: "3rd", score: "9.5 CGPA" },
      { name: "Sanya Mir", year: "2nd", score: "9.2 CGPA" },
    ];

    const needsAttention = [
      { name: "Vikram Singh", year: "2nd", score: "4.2 CGPA" },
      { name: "Amit Kumar", year: "1st", score: "5.1 CGPA" },
    ];
    
    return (
      <div className="animate-in fade-in duration-500 grid grid-cols-1 lg:grid-cols-4 gap-6 pb-10">
        
        {/* 1. Welcome Header */}
        <div className="lg:col-span-4 bg-gradient-to-r from-gray-50 to-white p-6 rounded-[2rem] border border-gray-100 flex items-center justify-between shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Welcome back, {faculty?.name.split(" ")[0]}
            </h2>
            <p className="text-gray-500">
              Here's what's happening in the {faculty?.department} department today.
            </p>
          </div>
          <div className="hidden md:block">
            <span className="text-xs font-mono text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
              {new Date().toLocaleDateString([], {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* 2. Left Column: Reminders + Stats */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* NEW: Reminders Card */}
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Bell className="w-5 h-5 text-yellow-500"/> Upcoming Reminders
              </h3>
              <button onClick={() => setActiveTab('timetable')} className="text-xs font-bold text-blue-600 hover:underline">
                Manage Schedule
              </button>
            </div>
            
            {reminders.length === 0 ? (
              <p className="text-sm text-gray-400 italic py-2">No active reminders set.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reminders.slice(0, 4).map(r => ( // Show max 4
                  <div key={r._id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm text-yellow-600 font-bold text-xs flex flex-col items-center min-w-[3rem]">
                        <span className="uppercase">{r.day ? r.day.substring(0,3) : "N/A"}</span>
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-gray-800 truncate">{r.courseName}</p>
                        <p className="text-xs text-gray-500 truncate">{r.time} • {r.message}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteReminder(r._id)} 
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-full transition-colors"
                      title="Delete Reminder"
                    >
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-gray-700 flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" /> Avg. Attendance
                </h4>
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded font-bold">
                  +4.5%
                </span>
              </div>
              <BarChart data={attendanceData} color={theme.primary} />
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-gray-700 flex items-center gap-2">
                  <Award className="w-4 h-4 text-gray-400" /> Class Grades
                </h4>
                <span className="text-xs text-gray-400">Last Semester</span>
              </div>
              <BarChart data={performanceData} color={theme.secondary} />
            </div>
          </div>

          {/* Students Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 p-6 rounded-[2rem] border border-green-100 relative overflow-hidden">
              <div className="flex justify-between items-center mb-4 relative z-10">
                <h4 className="font-bold text-green-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" /> Top Performers
                </h4>
                <span className="bg-white text-green-700 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                  Year Wise
                </span>
              </div>
              <div className="space-y-3 relative z-10">
                {topPerformers.map((s, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/60 p-3 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-200 text-green-700 flex items-center justify-center font-bold text-xs">
                        {s.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800 leading-none">{s.name}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{s.year} Year</p>
                      </div>
                    </div>
                    <span className="text-sm font-extrabold text-green-600">{s.score}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100 relative overflow-hidden">
              <div className="flex justify-between items-center mb-4 relative z-10">
                <h4 className="font-bold text-red-800 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5" /> Needs Attention
                </h4>
                <span className="bg-white text-red-700 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                  Year Wise
                </span>
              </div>
              <div className="space-y-3 relative z-10">
                {needsAttention.map((s, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/60 p-3 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-200 text-red-700 flex items-center justify-center font-bold text-xs">
                        {s.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800 leading-none">{s.name}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{s.year} Year</p>
                      </div>
                    </div>
                    <span className="text-sm font-extrabold text-red-600">{s.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Right Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div
            className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4 mb-2 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setActiveTab("profile")}
          >
            <div
              className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center border-2 overflow-hidden"
              style={{ borderColor: theme.primary }}
            >
              {faculty?.profilePic ? (
                <img
                  src={faculty.profilePic}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold text-gray-400">
                  {faculty?.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-gray-800 truncate">
                {faculty?.name}
              </h3>
              <p className="text-xs text-gray-500 truncate">
                {faculty?.designation}
              </p>
            </div>
            <div className="ml-auto">
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </div>
          </div>

          <div className="bg-orange-50 p-5 rounded-[2rem] border border-orange-100 relative overflow-hidden">
            <div className="absolute right-[-20px] top-[-20px] opacity-10">
              <CalendarClock className="w-24 h-24 text-orange-600" />
            </div>
            <p className="text-orange-600 text-sm font-bold uppercase mb-1 relative z-10">
              Today's Load
            </p>
            <h3 className="text-4xl font-extrabold text-orange-900 relative z-10">
              {mySchedule &&
              mySchedule[
                new Date().toLocaleDateString("en-US", { weekday: "Long" })
              ]
                ? mySchedule[
                    new Date().toLocaleDateString("en-US", { weekday: "Long" })
                  ].length
                : 0}
              <span className="text-lg ml-1">Classes</span>
            </h3>
          </div>
        </div>
      </div>
    );
  };

  // --- Loading / Error ---
  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Spinner size={10} color={theme.primary} />
      </div>
    );
  if (error)
    return (
      <div className="h-screen flex items-center justify-center text-red-500 font-medium bg-gray-50">
        <AlertCircle className="w-6 h-6 mr-2" /> {error}
      </div>
    );

  // --- Main Layout ---
  return (
    <div className="h-screen w-screen bg-[#F8F9FC] p-4 lg:p-6 flex flex-col gap-6 overflow-hidden font-sans antialiased">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-[100] bg-gray-900 text-white pl-4 pr-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-10 fade-in border border-gray-800">
          {notification.type === "success" ? (
            <CheckCircle className="w-6 h-6 text-green-400" />
          ) : (
            <AlertCircle className="w-6 h-6 text-red-400" />
          )}
          <p className="text-sm font-bold tracking-wide">
            {notification.message}
          </p>
        </div>
      )}

      {/* 1. Header Row */}
      <div className="shrink-0 flex items-center justify-between gap-4 h-18">
        {/* Left: Institute Card */}
        <div
          className="h-full px-6 rounded-[2rem] flex items-center gap-4 shadow-lg shadow-gray-200/50 min-w-[220px] transition-transform hover:scale-[1.02]"
          style={{ backgroundColor: theme.primary, color: theme.white }}
        >
          <div className="w-17 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center p-1 border-2 border-white/30">
            {faculty?.instituteLogo ? (
              <img
                src={faculty.instituteLogo}
                alt="Logo"
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <GraduationCap className="w-6 h-6 text-white" />
            )}
          </div>

          <div>
            <h1 className="font-extrabold text-xl leading-none tracking-tight">
              {faculty?.instituteCode || "INST"}
            </h1>
            <p className="text-[10px] opacity-90 uppercase tracking-widest font-bold mt-1">
              Faculty Portal
            </p>
          </div>
        </div>

        {/* Center: Navigation Bar */}
        <FacultyNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          theme={theme}
        />

        {/* Right: Notification & Logout */}
        <div className="h-full flex gap-3">
          <button
            onClick={() => setShowNotices(!showNotices)}
            className="h-full aspect-square rounded-[2rem] shadow-sm flex items-center justify-center relative transition-all hover:opacity-90 hover:shadow-md group"
            style={{
              backgroundColor: theme.white,
              color: theme.primary,
              border: `2px solid ${theme.primary}20`,
            }}
          >
            <Bell className="w-6 h-6 transition-transform group-hover:rotate-12" />
            {notices.length > 0 && (
              <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="h-full px-6 rounded-[2rem] shadow-sm flex items-center justify-center gap-2 transition-all font-bold text-sm group"
            title="Logout"
            style={{
              backgroundColor: theme.white,
              color: theme.textMain,
              border: `2px solid ${theme.secondary}20`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#FEF2F2"; 
              e.currentTarget.style.color = "#EF4444"; 
              e.currentTarget.style.borderColor = "#FCA5A5"; 
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.white;
              e.currentTarget.style.color = theme.textMain;
              e.currentTarget.style.borderColor = `${theme.secondary}20`;
            }}
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1 bg-white rounded-[3rem] shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-8 overflow-y-auto relative custom-scrollbar border border-gray-100">
        
        {/* Overlay for Notices */}
        {showNotices && (
          <div className="absolute top-0 right-0 z-50 w-96 h-full bg-white border-l border-gray-100 shadow-2xl p-6 animate-in slide-in-from-right overflow-y-auto rounded-r-[3rem] flex flex-col">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                <Bell className="w-5 h-5" style={{ color: theme.primary }} />{" "}
                Notices Board
              </h3>
              <button
                onClick={() => setShowNotices(false)}
                className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Post Notice Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-200 shrink-0">
              <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-orange-500"/> Post New Update
              </h4>
              <form onSubmit={handlePostNotice} className="space-y-3">
                <input 
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500"
                  placeholder="Title (e.g. Class Cancelled)"
                  value={noticeForm.title}
                  onChange={e => setNoticeForm({...noticeForm, title: e.target.value})}
                  required
                />
                <textarea 
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 resize-none h-20"
                  placeholder="Details..."
                  value={noticeForm.description}
                  onChange={e => setNoticeForm({...noticeForm, description: e.target.value})}
                  required
                />
                <div className="flex gap-2">
                  <select 
                    className="flex-1 p-2 rounded-xl border border-gray-200 text-xs font-bold outline-none"
                    value={noticeForm.type}
                    onChange={e => setNoticeForm({...noticeForm, type: e.target.value})}
                  >
                    <option value="General">General</option>
                    <option value="Student">For Students</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                  <button 
                    type="submit" 
                    disabled={isPostingNotice}
                    className="px-4 py-2 bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1 hover:opacity-80"
                  >
                    {isPostingNotice ? <Loader2 className="w-3 h-3 animate-spin"/> : <Send className="w-3 h-3"/>} Post
                  </button>
                </div>
              </form>
            </div>

            {/* List Notices */}
            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Recent Updates</h4>
              {notices.map((n, i) => (
                <div
                  key={i}
                  className="p-4 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 shadow-sm transition-all group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`text-[10px] font-bold text-white px-2 py-1 rounded-md ${n.type === 'Urgent' ? 'bg-red-500' : 'bg-gray-400'}`}
                      style={{ backgroundColor: n.type !== 'Urgent' ? theme.secondary : undefined }}
                    >
                      {n.type || "General"}
                    </span>
                    <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {new Date(n.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-gray-800 leading-snug">
                    {n.title}
                  </p>
                  {n.description && (
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                      {n.description}
                    </p>
                  )}
                  {n.postedBy && (
                    <p className="text-[10px] text-gray-400 mt-2 italic border-t border-gray-50 pt-2">
                      - {n.postedBy}
                    </p>
                  )}
                </div>
              ))}
              {notices.length === 0 && (
                <div className="text-center text-gray-400 py-10">
                  No recent notices found.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content Switcher */}
        {activeTab === "dashboard" && renderDashboard()}
        
        {activeTab === "profile" && (
          <FacultyProfile 
            faculty={faculty} 
            theme={theme} 
            refreshProfile={loadData}
          />
        )}
        
        {/* UPDATED: Render the new Schedule Component */}
        {activeTab === "timetable" && (
          <FacultySchedule 
            authFetch={authFetch} 
            theme={theme} 
            faculty={faculty} 
            pushToast={showToast}
          />
        )}
        
        {activeTab === "students" && (
          <FacultyStudent 
            authFetch={authFetch} 
            theme={theme} 
            faculty={faculty} 
          />
        )}
        
        {activeTab === "courses" && (
          <FacultyCourses 
             authFetch={authFetch} 
             theme={theme} 
             pushToast={showToast}
             faculty={faculty}
          />
        )}

        {/* Placeholders for incomplete tabs */}
        {(activeTab === "ssr" || activeTab === "naac") && (
             <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400 animate-in fade-in">
             <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 relative">
               {activeTab === "ssr" ? <FileText className="w-12 h-12 text-gray-300" /> : <Award className="w-12 h-12 text-gray-300" />}
             </div>
             <h2 className="text-xl font-bold text-gray-700 mb-2">
               {activeTab === "ssr" ? "SSR Update Portal" : "NAAC Accreditation"}
             </h2>
             <p className="text-gray-500 max-w-xs text-center">
               This module is under development. You will be able to update your {activeTab.toUpperCase()} details here.
             </p>
           </div>
        )}

        {(activeTab === "exams" || activeTab === "settings") && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400 animate-in fade-in">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 relative">
              <Settings className="w-12 h-12 text-gray-300" />
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center border-2 border-white">
                <Clock className="w-4 h-4 text-orange-500" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">
              Coming Soon
            </h2>
            <p className="text-gray-500 max-w-xs text-center">
              This module is currently under development and will be available
              shortly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyDashboard;