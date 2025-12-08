import React, { useState, useEffect, useCallback } from "react";
import {
  Bell, LogOut, Loader2, CheckCircle, AlertCircle, X,
  GraduationCap, BookOpen, ClipboardList, Award, FileText,
  TrendingUp, TrendingDown, Trash2, Users, ChevronRight,
  CalendarClock, Settings, LayoutDashboard, UserCircle,
  CalendarDays, Megaphone, Send, Briefcase, Phone, Mail, FilePlus
} from "lucide-react";
import io from 'socket.io-client';
import FacultyProfile from "./FacultyProfile";
import FacultyCourses from "./FacultyCourses";
import FacultyStudent from "./FacultyStudent";
import FacultySchedule from "./FacultySchedule";
import FacultyEvaluation from "./FacultyEvaluation";
import FacultySSR from "./FacultySSR";
import FacultySettings from "./FacultySettings";

const API_URL = import.meta.env.VITE_BACK_URI;

const DEFAULT_THEME = {
  primary: "#2A9D8F",
  secondary: "#264653",
  bg: "#F4F1DE",
  textMain: "#1F2937",
  white: "#FFFFFF",
  textOnPrimary: "#FFFFFF",
};

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "profile", label: "My Profile", icon: UserCircle },
  { id: "timetable", label: "Schedule", icon: CalendarClock },
  { id: "students", label: "Students", icon: Users },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "Evaluation", label: "Evaluation", icon: ClipboardList },
  { id: "ssr", label: "SSR & NIRF Updates", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
];

// --- NAV COMPONENT ---
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
            className={`px-4 py-2.5 rounded-[2rem] flex items-center gap-2 transition-all duration-300 whitespace-nowrap text-sm font-medium ${activeTab === item.id ? "shadow-md" : "hover:bg-white/10"
              }`}
            style={{
              backgroundColor: activeTab === item.id
                ? theme.textOnPrimary === "#FFFFFF" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)"
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

const authFetch = async (path, opts = {}) => {
  const token = localStorage.getItem("facultyToken");
  const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...opts, headers });
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem("facultyToken");
    window.location.href = "/fc/auth";
    throw new Error("Unauthorized");
  }
  return res;
};

const Spinner = ({ size = 6, color = "currentColor" }) => (
  <div
    className="rounded-full animate-spin"
    style={{
      width: `${size * 4}px`, height: `${size * 4}px`,
      borderWidth: "3px", borderStyle: "solid",
      borderTopColor: "transparent", borderRightColor: color,
      borderBottomColor: color, borderLeftColor: color,
    }}
  />
);

// --- HELPER: Dashboard Line Chart ---
const DashboardLineChart = ({ data, color = "#2A9D8F" }) => {
  if (!data || data.length === 0) return <div className="w-full h-32 flex items-center justify-center text-xs text-gray-400 italic">No data available</div>;

  const width = 300; const height = 100; const padding = 10;
  const maxDataVal = Math.max(...data.map(d => d.value)) || 100;
  const maxValue = maxDataVal > 100 ? maxDataVal : 100;

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1 || 1)) * (width - 2 * padding) + padding;
    const y = height - ((item.value || 0) / maxValue) * (height - 2 * padding) - padding;
    return { x, y, ...item };
  });

  const pathD = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <div className="w-full h-32 md:h-40 flex flex-col justify-end mt-4">
      <div className="relative w-full h-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`chartGradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#f3f4f6" strokeWidth="1" />
          <path d={areaD} fill={`url(#chartGradient-${color})`} />
          <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((p, i) => (
            <g key={i} className="group">
              <circle cx={p.x} cy={p.y} r="3" fill="#fff" stroke={color} strokeWidth="2" />
              <foreignObject x={p.x - 20} y={p.y - 35} width="40" height="30" className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="flex justify-center">
                  <span className="bg-gray-800 text-white text-[9px] px-1.5 py-0.5 rounded shadow-lg">{p.value}</span>
                </div>
              </foreignObject>
            </g>
          ))}
        </svg>
      </div>
      <div className="flex justify-between px-1 mt-1">
        {points.map((p, i) => (
          <div key={i} className="text-[9px] text-gray-400 font-medium text-center w-8 truncate" title={p.label}>{p.label}</div>
        ))}
      </div>
    </div>
  );
};

const BarChart = ({ data, color }) => (
  <div className="flex items-end justify-between h-32 w-full gap-2 mt-4">
    {data.length === 0 ? <div className="w-full flex justify-center text-xs text-gray-400">No Data</div> :
      data.map((item, index) => (
        <div key={index} className="flex flex-col items-center w-full group cursor-pointer">
          <div className="relative w-full flex items-end justify-center h-full">
            <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-[10px] px-2 py-1 rounded z-10">
              {item.value}
            </div>
            <div
              className="w-full mx-1 rounded-t-lg transition-all duration-500 hover:opacity-80"
              style={{ height: `${item.value}%`, backgroundColor: color }}
            ></div>
          </div>
          <span className="text-[10px] text-gray-400 mt-2 font-medium truncate w-full text-center">
            {item.label}
          </span>
        </div>
      ))}
  </div>
);

const FacultyDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [myCourses, setMyCourses] = useState([]);
  const [mySpecificSchedule, setMySpecificSchedule] = useState({});

  const [settingsDefaultTab, setSettingsDefaultTab] = useState("general");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotices, setShowNotices] = useState(false);
  const [isPostingNotice, setIsPostingNotice] = useState(false);
  const [notices, setNotices] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [noticeForm, setNoticeForm] = useState({ title: "", content: "", type: "General" });

  const [showMyFaculty, setShowMyFaculty] = useState(false);
  const [myFacultyList, setMyFacultyList] = useState([]);
  const [loadingMyFaculty, setLoadingMyFaculty] = useState(false);

  const [faculty, setFaculty] = useState(null);
  const [mySchedule, setMySchedule] = useState(null);

  // REAL DATA STATES
  const [studentStats, setStudentStats] = useState({ top: [], weak: [] });
  const [gradesDistribution, setGradesDistribution] = useState([]);
  const [attendanceDistribution, setAttendanceDistribution] = useState([]);

  const [theme, setTheme] = useState(DEFAULT_THEME);

  const loadData = useCallback(async () => {
    // Avoid re-fetching if we already have the basic profile, unless strictly needed
    if (faculty && myCourses.length > 0) return; 
    
    setLoading(true);
    try {
      // 1. Fetch Faculty Profile
      const res = await authFetch("/faculty/me");
      let data = await res.json();
      setFaculty(data);
      if (data.themeColorPrimary) {
        setTheme((prev) => ({
          ...prev,
          primary: data.themeColorPrimary,
          secondary: data.themeColorSecondary || prev.secondary,
          textOnPrimary: data.themeColorSecondary ? "#FFFFFF" : "#FFFFFF",
        }));
      }

      // 2. Fetch Notices & Reminders
      const noticeRes = await authFetch("/faculty/notices");
      setNotices((await noticeRes.json()) || []);
      const remRes = await authFetch("/faculty/reminders");
      setReminders((await remRes.json()) || []);

      // 3. AUTO-FETCH: My Specific Courses
      const coursesRes = await authFetch("/faculty/my-courses");
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setMyCourses(coursesData);
      }

      // 4. AUTO-FETCH: My Specific Schedule
      const scheduleRes = await authFetch("/faculty/my-schedule");
      if (scheduleRes.ok) {
        const scheduleData = await scheduleRes.json();
        setMySpecificSchedule(scheduleData);
        setMySchedule(scheduleData);
      }

      // 5. Fetch Students & Calculate Real Charts
      try {
        const stdRes = await authFetch("/institute/students?limit=0");
        const stdData = await stdRes.json();

        if (stdData.data && Array.isArray(stdData.data)) {
          const allStudents = stdData.data;

          // Only consider students enrolled in MY courses
          const myCourseIds = new Set(myCourses.map(c => c._id));
          
          const relevantStudents = allStudents.filter(s => 
             s.courseEnrollments?.some(sem => 
               sem.subjects?.some(sub => myCourseIds.has(sub.courseId))
             )
          );

          const statsPool = relevantStudents.length > 0 ? relevantStudents : allStudents;

          // --- A. Top/Weak Performers ---
          const withScores = statsPool.filter((s) => s.academic && s.academic.cgpa !== undefined);
          const top = [...withScores].sort((a, b) => b.academic.cgpa - a.academic.cgpa).slice(0, 3);
          const weak = [...withScores].sort((a, b) => a.academic.cgpa - b.academic.cgpa).slice(0, 3);
          setStudentStats({ top, weak });

          // --- B. Real Grade Distribution ---
          const grades = { O: 0, A: 0, B: 0, C: 0, Fail: 0 };
          withScores.forEach(s => {
            const cp = s.academic.cgpa;
            if (cp >= 9) grades.O++;
            else if (cp >= 7.5) grades.A++;
            else if (cp >= 6) grades.B++;
            else if (cp >= 4) grades.C++;
            else grades.Fail++;
          });
          const totalGraded = withScores.length || 1;
          const chartData = [
            { label: "O", value: Math.round((grades.O / totalGraded) * 100) },
            { label: "A", value: Math.round((grades.A / totalGraded) * 100) },
            { label: "B", value: Math.round((grades.B / totalGraded) * 100) },
            { label: "C", value: Math.round((grades.C / totalGraded) * 100) },
            { label: "F", value: Math.round((grades.Fail / totalGraded) * 100) },
          ];
          setGradesDistribution(chartData);

          // --- C. Real Attendance Distribution ---
          const att = { Good: 0, Avg: 0, Low: 0 };
          let totalAtt = 0;
          statsPool.forEach(s => {
            if (s.attendance && s.attendance.overallPercentage !== undefined) {
              totalAtt++;
              const p = s.attendance.overallPercentage;
              if (p >= 75) att.Good++;
              else if (p >= 60) att.Avg++;
              else att.Low++;
            }
          });
          const totalAttCount = totalAtt || 1;
          const attChartData = [
            { label: "High (>75%)", value: Math.round((att.Good / totalAttCount) * 100) },
            { label: "Avg (60-75%)", value: Math.round((att.Avg / totalAttCount) * 100) },
            { label: "Low (<60%)", value: Math.round((att.Low / totalAttCount) * 100) },
          ];
          setAttendanceDistribution(attChartData);
        }
      } catch (innerErr) {
        console.error("Failed to fetch student stats:", innerErr);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array to load once on mount

  useEffect(() => {
    if (!faculty) return;
    document.title = `${faculty.name || "Institute"} | CampusVersa`;
    if (faculty.instituteLogo) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement("link"); link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = faculty.instituteLogo;
    }
  }, [faculty]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!faculty) return;

    const newSocket = io(API_URL);
    
    newSocket.emit('join_room', {
      instituteId: faculty.instituteId,
      role: 'faculty',
      department: faculty.department
    });

    newSocket.on('receive_notice', (data) => {
      setUnreadCount(prev => prev + 1);
      showToast(`New Notice: ${data.title}`, "info");
    });

    return () => newSocket.disconnect();
  }, [faculty]);

  // Fetch Schedule (Existing Logic - Updated to use auto-fetched schedule)
  useEffect(() => {
    if (activeTab === "dashboard" && !mySchedule && Object.keys(mySpecificSchedule).length > 0) {
       setMySchedule(mySpecificSchedule);
    }
  }, [activeTab, mySchedule, mySpecificSchedule]);

  const handleLogout = () => setShowLogoutModal(true);
  const confirmLogout = () => { localStorage.removeItem("facultyToken"); window.location.href = "/fc/auth"; };
  const showToast = (msg, type = "success") => { setNotification({ message: msg, type }); setTimeout(() => setNotification(null), 3000); };

  const handleMyFacultyClick = async () => {
    setShowMyFaculty(true);
    if (myFacultyList.length === 0) {
      setLoadingMyFaculty(true);
      try {
        const res = await authFetch("/faculty/my-department");
        if (res.ok) { const data = await res.json(); setMyFacultyList(data); }
        else { showToast("Failed to fetch faculty list", "error"); }
      } catch (error) { showToast("Server error", "error"); } finally { setLoadingMyFaculty(false); }
    }
  };

  const handlePostNotice = async (e) => {
    e.preventDefault(); setIsPostingNotice(true);
    try {
      const res = await authFetch("/faculty/notices/add", { method: "POST", body: JSON.stringify(noticeForm) });
      if (res.ok) {
        const newNotice = await res.json(); setNotices([newNotice, ...notices]);
        setNoticeForm({ title: "", content: "", type: "General" }); showToast("Notice Posted!");
      } else { showToast("Failed to post notice", "error"); }
    } catch (err) { showToast("Server Error", "error"); } finally { setIsPostingNotice(false); }
  };

  const handleDeleteReminder = async (id) => {
    try { await authFetch(`/faculty/reminders/${id}`, { method: "DELETE" }); setReminders(reminders.filter((r) => r._id !== id)); showToast("Reminder Removed", "success"); }
    catch (e) { showToast("Failed to remove reminder", "error"); }
  };

  const renderDashboard = () => {
    // Use dynamic schedule state
    const todayDay = new Date().toLocaleDateString("en-US", { weekday: "long" }); 
    const todaysClasses = mySpecificSchedule[todayDay] ? mySpecificSchedule[todayDay].length : 0;

    return (
      <div className="animate-in fade-in duration-500 grid grid-cols-1 lg:grid-cols-4 gap-6 pb-10">
        
        {/* --- Welcome Header --- */}
        <div className="lg:col-span-4 bg-gradient-to-r from-gray-50 to-white p-6 rounded-[2rem] border border-gray-100 flex items-center justify-between shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome back, {faculty?.name.split(" ")[0]}</h2>
            <p className="text-gray-500">Here's the realtime status of the {faculty?.department} department.</p>
          </div>
          <div className="hidden md:block">
            <span className="text-xs font-mono text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
              {new Date().toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
        </div>

        {/* --- Left Column (Stats & Charts) --- */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Reminders Widget */}
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Bell className="w-5 h-5 text-yellow-500" /> Upcoming Reminders
              </h3>
              <button onClick={() => setActiveTab("timetable")} className="text-xs font-bold text-blue-600 hover:underline">
                Manage Schedule
              </button>
            </div>
            {reminders.length === 0 ? (
              <p className="text-sm text-gray-400 italic py-2">No active reminders.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reminders.slice(0, 4).map((r) => (
                  <div key={r._id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm text-yellow-600 font-bold text-xs flex flex-col items-center min-w-[3rem]">
                        <span className="uppercase">{r.day ? r.day.substring(0, 3) : "N/A"}</span>
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-gray-800 truncate">{r.courseName}</p>
                        <p className="text-xs text-gray-500 truncate">{r.time} • {r.message}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteReminder(r._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-full transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Real Data Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Attendance Chart */}
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-gray-700 flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" /> Attendance Overview
                </h4>
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded font-bold">Realtime</span>
              </div>
              <DashboardLineChart data={attendanceDistribution} color={theme.primary} />
            </div>

            {/* Grade Distribution Chart */}
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-gray-700 flex items-center gap-2">
                  <Award className="w-4 h-4 text-gray-400" /> CGPA Distribution
                </h4>
                <span className="text-xs text-gray-400">All Students</span>
              </div>
              <BarChart data={gradesDistribution} color={theme.secondary} />
            </div>
          </div>

          {/* Student Performance Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Performers */}
            <div className="bg-green-50 p-6 rounded-[2rem] border border-green-100 relative overflow-hidden">
              <div className="flex justify-between items-center mb-4 relative z-10">
                <h4 className="font-bold text-green-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" /> Top Performers
                </h4>
                <span className="bg-white text-green-700 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">Top 3 CGPA</span>
              </div>
              <div className="space-y-3 relative z-10">
                {studentStats.top.length === 0 ? (
                  <p className="text-xs text-green-700 italic">No academic data available.</p>
                ) : (
                  studentStats.top.map((s, i) => (
                    <div key={s._id || i} className="flex items-center justify-between bg-white/60 p-3 rounded-xl backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-200 text-green-700 flex items-center justify-center font-bold text-xs uppercase">
                          {s.name ? s.name[0] : "?"}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-gray-800 leading-none truncate w-32">{s.name}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{s.year} Year</p>
                        </div>
                      </div>
                      <span className="text-sm font-extrabold text-green-600">
                        {s.academic?.cgpa?.toFixed(2) || "N/A"} <span className="text-[10px]">CGPA</span>
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Needs Attention */}
            <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100 relative overflow-hidden">
              <div className="flex justify-between items-center mb-4 relative z-10">
                <h4 className="font-bold text-red-800 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5" /> Needs Attention
                </h4>
                <span className="bg-white text-red-700 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">Lowest 3 CGPA</span>
              </div>
              <div className="space-y-3 relative z-10">
                {studentStats.weak.length === 0 ? (
                  <p className="text-xs text-red-700 italic">No students require attention.</p>
                ) : (
                  studentStats.weak.map((s, i) => (
                    <div key={s._id || i} className="flex items-center justify-between bg-white/60 p-3 rounded-xl backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-200 text-red-700 flex items-center justify-center font-bold text-xs uppercase">
                          {s.name ? s.name[0] : "?"}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-gray-800 leading-none truncate w-32">{s.name}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{s.year} Year</p>
                        </div>
                      </div>
                      <span className="text-sm font-extrabold text-red-600">
                        {s.academic?.cgpa?.toFixed(2) || "N/A"} <span className="text-[10px]">CGPA</span>
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- Right Sidebar (Profile, Quick Links, Load) --- */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {/* Profile Card */}
          <div 
            className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4 mb-2 cursor-pointer hover:bg-gray-50 transition-colors" 
            onClick={() => setActiveTab("profile")}
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center border-2 overflow-hidden" style={{ borderColor: theme.primary }}>
              {faculty?.profilePic ? (
                <img src={faculty.profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-gray-400">{faculty?.name?.charAt(0)}</span>
              )}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-gray-800 truncate">{faculty?.name}</h3>
              <p className="text-xs text-gray-500 truncate">{faculty?.designation}</p>
            </div>
            <div className="ml-auto"><ChevronRight className="w-5 h-5 text-gray-600" /></div>
          </div>

          {/* HOD View (Conditional) */}
          {faculty?.designation === "Head of the Department" && (
            <div onClick={handleMyFacultyClick} className="p-4 rounded-4xl border shadow-md flex items-center gap-4 cursor-pointer transition-all active:scale-95 group" style={{ backgroundColor: "white", borderColor: theme.secondary }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 transition-colors">
                <Briefcase className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="font-bold text-black">My Faculty</h3>
                <p className="text-xs text-gray-800 opacity-90">{faculty?.department} Dept.</p>
              </div>
              <div className="ml-auto bg-white/10 p-2 rounded-full"><ChevronRight className="w-5 h-5 text-grey-300" /></div>
            </div>
          )}

          {/* Form Builder Link */}
          <div onClick={() => { setSettingsDefaultTab("forms"); setActiveTab("settings"); }} className="p-4 rounded-[2rem] border shadow-sm flex items-center gap-4 cursor-pointer transition-all active:scale-95 hover:shadow-md bg-white border-blue-100 group">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-50 text-blue-600 transition-colors group-hover:text-white">
              <FilePlus className="w-6 h-6" style={{ color: theme.primary }} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Form Builder</h3>
              <p className="text-xs text-gray-500">Create Surveys & Feedback</p>
            </div>
            <div className="ml-auto bg-gray-50 p-2 rounded-full group-hover:bg-blue-50">
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
            </div>
          </div>

          {/* Today's Load (Dynamic) */}
          <div className="bg-orange-50 p-5 rounded-[2rem] border border-orange-100 relative overflow-hidden">
            <div className="absolute right-[-20px] top-[-20px] opacity-10">
              <CalendarClock className="w-24 h-24 text-orange-600" />
            </div>
            <p className="text-orange-600 text-sm font-bold uppercase mb-1 relative z-10">Today's Load</p>
            <h3 className="text-4xl font-extrabold text-orange-900 relative z-10">
              {todaysClasses}
              <span className="text-lg ml-1">Classes</span>
            </h3>
            <p className="text-xs text-orange-700 mt-2 relative z-10 font-medium">
               Across {myCourses.length} Active Courses
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><Spinner size={10} color={theme.primary} /></div>;
  if (error) return <div className="h-screen flex items-center justify-center text-red-500 font-medium bg-gray-50"><AlertCircle className="w-6 h-6 mr-2" /> {error}</div>;

  return (
    <div className="h-screen w-screen bg-[#F8F9FC] p-4 lg:p-6 flex flex-col gap-6 overflow-hidden font-sans antialiased">
      {notification && <div className="fixed top-6 right-6 z-[100] bg-gray-900 text-white pl-4 pr-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-10 fade-in border border-gray-800">{notification.type === "success" ? <CheckCircle className="w-6 h-6 text-green-400" /> : <AlertCircle className="w-6 h-6 text-red-400" />}<p className="text-sm font-bold tracking-wide">{notification.message}</p></div>}
      <div className="shrink-0 flex items-center justify-between gap-4 h-18">
        <div className="h-full px-6 rounded-[2rem] flex items-center gap-4 shadow-lg shadow-gray-200/50 min-w-[220px] transition-transform hover:scale-[1.02]" style={{ backgroundColor: theme.primary, color: theme.white }}>
          <div className="w-17 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center p-1 border-2 border-white/30">{faculty?.instituteLogo ? <img src={faculty.instituteLogo} alt="Logo" className="w-full h-full object-contain p-1" /> : <GraduationCap className="w-6 h-6 text-white" />}</div>
          <div><h1 className="font-extrabold text-xl leading-none tracking-tight">{faculty?.instituteCode || "INST"}</h1><p className="text-[10px] opacity-90 uppercase tracking-widest font-bold mt-1">Faculty Portal</p></div>
        </div>
        <FacultyNav activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
        <div className="h-full flex gap-3">
          <button onClick={() => setShowNotices(!showNotices)} className="h-full aspect-square rounded-[2rem] shadow-sm flex items-center justify-center relative transition-all hover:opacity-90 hover:shadow-md group" style={{ backgroundColor: theme.white, color: theme.primary, border: `2px solid ${theme.primary}20` }}><Bell className="w-6 h-6 transition-transform group-hover:rotate-12" />{notices.length > 0 && <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}</button>
          <button onClick={handleLogout} className="h-full px-6 rounded-[2rem] shadow-sm flex items-center justify-center gap-2 transition-all font-bold text-sm group" title="Logout" style={{ backgroundColor: theme.white, color: theme.textMain, border: `2px solid ${theme.secondary}20` }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgb(256, 195, 195)")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.white)}><LogOut className="w-5 h-5 transition-transform group-hover:translate-x-1" /><span className="hidden md:inline">Logout</span></button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[3rem] shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-8 overflow-y-auto relative custom-scrollbar border border-gray-100">
        {showNotices && (
          <div className="absolute top-0 right-0 z-50 w-96 h-full bg-white border-l border-gray-100 shadow-2xl p-6 animate-in slide-in-from-right overflow-y-auto rounded-r-[3rem] flex flex-col">
            <div className="flex justify-between items-center mb-6 shrink-0"><h3 className="font-bold text-xl text-gray-800 flex items-center gap-2"><Bell className="w-5 h-5" style={{ color: theme.primary }} /> Notices Board</h3><button onClick={() => setShowNotices(false)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"><X className="w-5 h-5 text-gray-500" /></button></div>
            <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-200 shrink-0"><h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><Megaphone className="w-4 h-4 text-orange-500" /> Post New Update</h4>
            <form onSubmit={handlePostNotice} className="space-y-3">
              <input className="w-full p-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500" placeholder="Title..." value={noticeForm.title} onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })} required />
              <textarea 
                className="w-full p-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 min-h-[80px]" 
                placeholder="Details..." 
                value={noticeForm.content} 
                onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })} 
                required 
              />
              <div className="flex gap-2">
                <select className="flex-1 p-2 rounded-xl border border-gray-200 text-xs font-bold outline-none" value={noticeForm.type} onChange={(e) => setNoticeForm({ ...noticeForm, type: e.target.value })}><option value="General">General</option></select>
                <button type="submit" disabled={isPostingNotice} className="px-4 py-2 bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1 hover:opacity-80">{isPostingNotice ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />} Post</button>
              </div>
            </form>
            </div>
            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1"><h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Recent Updates</h4>{notices.map((n, i) => (<div key={i} className="p-4 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 shadow-sm transition-all group"><div className="flex justify-between items-start mb-2"><span className={`text-[10px] font-bold text-white px-2 py-1 rounded-md ${n.type === "Urgent" ? "bg-red-500" : "bg-gray-400"}`} style={{ backgroundColor: n.type !== "Urgent" ? theme.secondary : undefined }}>{n.type || "General"}</span><p className="text-[10px] text-black-400 font-medium flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {new Date(n.createdAt).toLocaleDateString()}</p></div><p className="text-sm font-bold text-gray-800 leading-snug">{n.title}</p>{n.content && <p className="text-xs text-gray-500 mt-2 leading-relaxed">{n.content}</p>}{n.postedBy && <p className="text-[10px] text-gray-400 mt-2 italic border-t border-gray-50 pt-2">- {n.postedBy}</p>}</div>))}{notices.length === 0 && <div className="text-center text-gray-400 py-10">No recent notices found.</div>}</div>
          </div>
        )}
        {showLogoutModal && <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"><div className="bg-white rounded-[2rem] shadow-2xl p-6 max-w-sm w-full border border-gray-100"><div className="flex flex-col items-center text-center gap-4"><div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center border-4 border-white shadow-sm"><LogOut className="w-6 h-6 ml-1" /></div><div><h3 className="text-xl font-bold text-gray-900">Logging Out</h3><p className="text-sm text-gray-500 mt-2">You are about to sign out of the Institute Portal. Do you wish to continue?</p></div><div className="grid grid-cols-2 gap-3 w-full mt-2"><button onClick={() => setShowLogoutModal(false)} className="px-4 py-3 rounded-xl bg-gray-50 text-gray-700 font-bold text-sm hover:bg-gray-100 transition-colors">Cancel</button><button onClick={confirmLogout} className="px-4 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors shadow-lg shadow-red-200">Confirm Logout</button></div></div></div></div>}
        {showMyFaculty && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={() => setShowMyFaculty(false)}></div>
            <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] relative z-10 animate-in zoom-in-95 duration-200">
              <div className="p-6 text-white shrink-0 flex justify-between items-start" style={{ backgroundColor: theme.primary }}><div><h3 className="font-bold text-xl flex items-center gap-2"><Briefcase className="w-5 h-5 opacity-90" /> My Department</h3><p className="text-xs opacity-80 mt-1">{faculty?.department} Faculty Members</p></div><button onClick={() => setShowMyFaculty(false)} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"><X className="w-5 h-5 text-white" /></button></div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-gray-50/50">
                {loadingMyFaculty ? <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2"><Loader2 className="w-8 h-8 animate-spin" style={{ color: theme.primary }} /><span className="text-sm font-bold">Loading Faculty...</span></div> : myFacultyList.length === 0 ? <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center"><Users className="w-12 h-12 opacity-20 mb-2" /><p>No other faculty members found.</p></div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{myFacultyList.map((f) => (<div key={f._id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow hover:border-blue-100"><div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">{f.profilePic ? <img src={f.profilePic} alt={f.name} className="w-full h-full object-cover" /> : <span className="text-lg font-bold text-gray-400">{f.name?.charAt(0)}</span>}</div><div className="flex-1 min-w-0"><div className="flex justify-between items-start"><h4 className="font-bold text-gray-800 text-sm truncate">{f.name}</h4>{f._id === faculty._id && <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold">You</span>}</div><p className="text-xs text-gray-500 font-medium mb-2">{f.designation || "Faculty Member"}</p><div className="flex flex-col gap-1.5">{f.email && <a href={`mailto:${f.email}`} className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-blue-600 transition-colors truncate"><Mail className="w-3 h-3 text-gray-300 shrink-0" /> {f.email}</a>}{f.phone && <a href={`tel:${f.phone}`} className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-blue-600 transition-colors truncate"><Phone className="w-3 h-3 text-gray-300 shrink-0" /> {f.phone}</a>}</div></div></div>))}</div>}
              </div>
              <div className="p-4 border-t border-gray-100 bg-white text-center flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest"><span>Total: {myFacultyList.length}</span><span className="text-[10px] font-normal normal-case opacity-60">Confidential Data</span></div>
            </div>
          </div>
        )}
        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "profile" && <FacultyProfile faculty={faculty} theme={theme} refreshProfile={loadData} />}
        {activeTab === "timetable" && <FacultySchedule authFetch={authFetch} theme={theme} faculty={faculty} pushToast={showToast} />}
        {activeTab === "students" && <FacultyStudent authFetch={authFetch} theme={theme} faculty={faculty} />}
        {activeTab === "courses" && <FacultyCourses authFetch={authFetch} theme={theme} pushToast={showToast} faculty={faculty} refreshProfile={loadData} />}
        {activeTab === "ssr" && <FacultySSR authFetch={authFetch} theme={theme} pushToast={showToast} />}
        {activeTab === "Evaluation" && <FacultyEvaluation authFetch={authFetch} theme={theme} faculty={faculty} pushToast={showToast} />}
        {activeTab === "settings" && <FacultySettings authFetch={authFetch} theme={theme} pushToast={showToast} faculty={faculty} initialTab={settingsDefaultTab} />}
      </div>
    </div>
  );
};

export default FacultyDashboard;