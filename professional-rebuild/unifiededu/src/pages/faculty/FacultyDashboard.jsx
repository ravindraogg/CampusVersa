import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  LogOut,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  GraduationCap,
  Clock,
  BookOpen,
  ClipboardList,
  Award,
  FileText,
  TrendingUp,
  TrendingDown,
  Trash2,
  Users,
  ChevronRight,
  CalendarClock,
  Settings,
  LayoutDashboard,
  UserCircle,
  CalendarDays,
  Megaphone,
  Send,
  Briefcase,
  Phone,
  Mail,
  FilePlus, // Ensure FilePlus is imported
} from "lucide-react";

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
  { id: "ssr", label: "SSR & NAAC Updats", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
];

// --- FIXED: FacultyNav Component Definition ---
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

const BarChart = ({ data, color }) => (
  <div className="flex items-end justify-between h-32 w-full gap-2 mt-4">
    {data.map((item, index) => (
      <div
        key={index}
        className="flex flex-col items-center w-full group cursor-pointer"
      >
        <div className="relative w-full flex items-end justify-center h-full">
          <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-[10px] px-2 py-1 rounded z-10">
            {item.value}%
          </div>
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

const FacultyDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);

  // New State for handling direct navigation to specific settings tab
  const [settingsDefaultTab, setSettingsDefaultTab] = useState("general");

  // Notice & Reminder State
  const [showNotices, setShowNotices] = useState(false);
  const [isPostingNotice, setIsPostingNotice] = useState(false);
  const [notices, setNotices] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [noticeForm, setNoticeForm] = useState({
    title: "",
    description: "",
    type: "General",
  });

  // HOD Specific State
  const [showMyFaculty, setShowMyFaculty] = useState(false); // Toggle for Modal
  const [myFacultyList, setMyFacultyList] = useState([]); // Data for Modal
  const [loadingMyFaculty, setLoadingMyFaculty] = useState(false);

  const [faculty, setFaculty] = useState(null);
  const [mySchedule, setMySchedule] = useState(null);
  const [studentStats, setStudentStats] = useState({ top: [], weak: [] });
  const [theme, setTheme] = useState(DEFAULT_THEME);

  const loadData = useCallback(async () => {
    if (!faculty) setLoading(true);
    try {
      const res = await authFetch("/faculty/me");
      let data = await res.json();

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

      const noticeRes = await authFetch("/faculty/notices");
      setNotices((await noticeRes.json()) || []);

      const remRes = await authFetch("/faculty/reminders");
      setReminders((await remRes.json()) || []);

      try {
        const stdRes = await authFetch("/institute/students?limit=0");
        const stdData = await stdRes.json();
        if (stdData.data && Array.isArray(stdData.data)) {
          const allStudents = stdData.data;
          const withScores = allStudents.filter(
            (s) => s.academic && s.academic.cgpa !== undefined
          );
          const top = [...withScores]
            .sort((a, b) => b.academic.cgpa - a.academic.cgpa)
            .slice(0, 3);
          const weak = [...withScores]
            .sort((a, b) => a.academic.cgpa - b.academic.cgpa)
            .slice(0, 3);
          setStudentStats({ top, weak });
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
  }, []);
useEffect(() => {
  if (!faculty) return;

  // Set Title
  document.title = `${faculty.name || "Institute"} | CampusVersa`;

  // Set Favicon
  if (faculty.instituteLogo) {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = faculty.instituteLogo;
  }
}, [faculty]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!faculty) return;
    const fetchTodaysLoad = async () => {
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

  const handleLogout = () => {
    localStorage.removeItem("facultyToken");
    window.location.href = "/auth";
  };
  const showToast = (msg, type = "success") => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleMyFacultyClick = async () => {
    setShowMyFaculty(true);
    if (myFacultyList.length === 0) {
      setLoadingMyFaculty(true);
      try {
        const res = await authFetch("/faculty/my-department");
        if (res.ok) {
          const data = await res.json();
          setMyFacultyList(data);
        } else {
          showToast("Failed to fetch faculty list", "error");
        }
      } catch (error) {
        showToast("Server error fetching faculty", "error");
      } finally {
        setLoadingMyFaculty(false);
      }
    }
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

  const handleDeleteReminder = async (id) => {
    try {
      await authFetch(`/faculty/reminders/${id}`, { method: "DELETE" });
      setReminders(reminders.filter((r) => r._id !== id));
      showToast("Reminder Removed", "success");
    } catch (e) {
      showToast("Failed to remove reminder", "error");
    }
  };

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

    return (
      <div className="animate-in fade-in duration-500 grid grid-cols-1 lg:grid-cols-4 gap-6 pb-10">
        {/* Welcome Header */}
        <div className="lg:col-span-4 bg-gradient-to-r from-gray-50 to-white p-6 rounded-[2rem] border border-gray-100 flex items-center justify-between shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Welcome back, {faculty?.name.split(" ")[0]}
            </h2>
            <p className="text-gray-500">
              Here's what's happening in the {faculty?.department} department
              today.
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

        {/* Left Column */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Reminders */}
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Bell className="w-5 h-5 text-yellow-500" /> Upcoming Reminders
              </h3>
              <button
                onClick={() => setActiveTab("timetable")}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Manage Schedule
              </button>
            </div>
            {reminders.length === 0 ? (
              <p className="text-sm text-gray-400 italic py-2">
                No active reminders set.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reminders.slice(0, 4).map((r) => (
                  <div
                    key={r._id}
                    className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm text-yellow-600 font-bold text-xs flex flex-col items-center min-w-[3rem]">
                        <span className="uppercase">
                          {r.day ? r.day.substring(0, 3) : "N/A"}
                        </span>
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-gray-800 truncate">
                          {r.courseName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {r.time} • {r.message}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteReminder(r._id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Charts */}
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

          {/* Students Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 p-6 rounded-[2rem] border border-green-100 relative overflow-hidden">
              <div className="flex justify-between items-center mb-4 relative z-10">
                <h4 className="font-bold text-green-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" /> Top Performers
                </h4>
                <span className="bg-white text-green-700 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                  Top 3 CGPA
                </span>
              </div>
              <div className="space-y-3 relative z-10">
                {studentStats.top.length === 0 ? (
                  <p className="text-xs text-green-700 italic">
                    No academic data available yet.
                  </p>
                ) : (
                  studentStats.top.map((s, i) => (
                    <div
                      key={s._id || i}
                      className="flex items-center justify-between bg-white/60 p-3 rounded-xl backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-200 text-green-700 flex items-center justify-center font-bold text-xs uppercase">
                          {s.name ? s.name[0] : "?"}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-gray-800 leading-none truncate w-32">
                            {s.name}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {s.year} Year
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-extrabold text-green-600">
                        {s.academic?.cgpa?.toFixed(2) || "N/A"}{" "}
                        <span className="text-[10px]">CGPA</span>
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100 relative overflow-hidden">
              <div className="flex justify-between items-center mb-4 relative z-10">
                <h4 className="font-bold text-red-800 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5" /> Needs Attention
                </h4>
                <span className="bg-white text-red-700 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                  Lowest 3 CGPA
                </span>
              </div>
              <div className="space-y-3 relative z-10">
                {studentStats.weak.length === 0 ? (
                  <p className="text-xs text-red-700 italic">
                    No students require attention.
                  </p>
                ) : (
                  studentStats.weak.map((s, i) => (
                    <div
                      key={s._id || i}
                      className="flex items-center justify-between bg-white/60 p-3 rounded-xl backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-200 text-red-700 flex items-center justify-center font-bold text-xs uppercase">
                          {s.name ? s.name[0] : "?"}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-gray-800 leading-none truncate w-32">
                            {s.name}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {s.year} Year
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-extrabold text-red-600">
                        {s.academic?.cgpa?.toFixed(2) || "N/A"}{" "}
                        <span className="text-[10px]">CGPA</span>
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
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
                  {faculty?.name?.charAt(0)}
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
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </div>
          </div>

          {/* HOD "MY FACULTY" BUTTON */}
          {faculty?.designation === "Head of the Department" && (
            <div
              onClick={handleMyFacultyClick}
              className="p-4 rounded-4xl border shadow-md flex items-center gap-4 cursor-pointer transition-all active:scale-95 group"
              style={{ backgroundColor: "white", borderColor: theme.secondary }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 transition-colors">
                <Briefcase className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="font-bold text-black">My Faculty</h3>
                <p className="text-xs text-gray-800 opacity-90">
                  {faculty?.department} Dept.
                </p>
              </div>
              <div className="ml-auto bg-white/10 p-2 rounded-full">
                <ChevronRight className="w-5 h-5 text-grey-300" />
              </div>
            </div>
          )}

          {/* NEW: FORM BUILDER LINK */}
          <div
            onClick={() => {
              setSettingsDefaultTab("forms"); // Set default sub-tab to Forms
              setActiveTab("settings");       // Switch main tab to Settings
            }}
            className="p-4 rounded-[2rem] border shadow-sm flex items-center gap-4 cursor-pointer transition-all active:scale-95 hover:shadow-md bg-white border-blue-100 group"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-50 text-blue-600 transition-colors group-hover:text-white">
              <FilePlus className="w-6 h-6" style={{color: theme.primary}} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Form Builder</h3>
              <p className="text-xs text-gray-500">Create Surveys & Feedback</p>
            </div>
            <div className="ml-auto bg-gray-50 p-2 rounded-full group-hover:bg-blue-50">
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
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

  return (
    <div className="h-screen w-screen bg-[#F8F9FC] p-4 lg:p-6 flex flex-col gap-6 overflow-hidden font-sans antialiased">
      {/* Notification Toast */}
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

      {/* Header Row */}
      <div className="shrink-0 flex items-center justify-between gap-4 h-18">
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

        <FacultyNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          theme={theme}
        />

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
  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgb(256, 195, 195)")}
  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.white)}
>
  <LogOut className="w-5 h-5 transition-transform group-hover:translate-x-1" />
  <span className="hidden md:inline">Logout</span>
</button>



        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-[3rem] shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-8 overflow-y-auto relative custom-scrollbar border border-gray-100">
        {/* Notices Overlay ... (Unchanged) ... */}
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
            {/* Notice Form */}
            <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-200 shrink-0">
              <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-orange-500" /> Post New
                Update
              </h4>
              <form onSubmit={handlePostNotice} className="space-y-3">
                <input
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500"
                  placeholder="Title..."
                  value={noticeForm.title}
                  onChange={(e) =>
                    setNoticeForm({ ...noticeForm, title: e.target.value })
                  }
                  required
                />
                <textarea
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 resize-none h-20"
                  placeholder="Details..."
                  value={noticeForm.description}
                  onChange={(e) =>
                    setNoticeForm({
                      ...noticeForm,
                      description: e.target.value,
                    })
                  }
                  required
                />
                <div className="flex gap-2">
                  <select
                    className="flex-1 p-2 rounded-xl border border-gray-200 text-xs font-bold outline-none"
                    value={noticeForm.type}
                    onChange={(e) =>
                      setNoticeForm({ ...noticeForm, type: e.target.value })
                    }
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
                    {isPostingNotice ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Send className="w-3 h-3" />
                    )}{" "}
                    Post
                  </button>
                </div>
              </form>
            </div>
            {/* Notice List */}
            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Recent Updates
              </h4>
              {notices.map((n, i) => (
                <div
                  key={i}
                  className="p-4 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 shadow-sm transition-all group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`text-[10px] font-bold text-white px-2 py-1 rounded-md ${
                        n.type === "Urgent" ? "bg-red-500" : "bg-gray-400"
                      }`}
                      style={{
                        backgroundColor:
                          n.type !== "Urgent" ? theme.secondary : undefined,
                      }}
                    >
                      {n.type || "General"}
                    </span>
                    <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />{" "}
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

        {/* --- HOD MY FACULTY MODAL --- */}
        {showMyFaculty && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            {/* Click outside to close */}
            <div
              className="absolute inset-0"
              onClick={() => setShowMyFaculty(false)}
            ></div>

            <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] relative z-10 animate-in zoom-in-95 duration-200">
              {/* Header with Theme Color */}
              <div
                className="p-6 text-white shrink-0 flex justify-between items-start"
                style={{ backgroundColor: theme.primary }}
              >
                <div>
                  <h3 className="font-bold text-xl flex items-center gap-2">
                    <Briefcase className="w-5 h-5 opacity-90" /> My Department
                  </h3>
                  <p className="text-xs opacity-80 mt-1">
                    {faculty?.department} Faculty Members
                  </p>
                </div>
                <button
                  onClick={() => setShowMyFaculty(false)}
                  className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-gray-50/50">
                {loadingMyFaculty ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                    <Loader2
                      className="w-8 h-8 animate-spin"
                      style={{ color: theme.primary }}
                    />
                    <span className="text-sm font-bold">
                      Loading Faculty...
                    </span>
                  </div>
                ) : myFacultyList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center">
                    <Users className="w-12 h-12 opacity-20 mb-2" />
                    <p>No other faculty members found in this department.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myFacultyList.map((f) => (
                      <div
                        key={f._id}
                        className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow hover:border-blue-100"
                      >
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                          {f.profilePic ? (
                            <img
                              src={f.profilePic}
                              alt={f.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-bold text-gray-400">
                              {f.name?.charAt(0)}
                            </span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-gray-800 text-sm truncate">
                              {f.name}
                            </h4>
                            {f._id === faculty._id && (
                              <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 font-medium mb-2">
                            {f.designation || "Faculty Member"}
                          </p>

                          {/* Contact Badges */}
                          <div className="flex flex-col gap-1.5">
                            {f.email && (
                              <a
                                href={`mailto:${f.email}`}
                                className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-blue-600 transition-colors truncate"
                              >
                                <Mail className="w-3 h-3 text-gray-300 shrink-0" />{" "}
                                {f.email}
                              </a>
                            )}
                            {f.phone && (
                              <a
                                href={`tel:${f.phone}`}
                                className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-blue-600 transition-colors truncate"
                              >
                                <Phone className="w-3 h-3 text-gray-300 shrink-0" />{" "}
                                {f.phone}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Footer Count */}
              <div className="p-4 border-t border-gray-100 bg-white text-center flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                <span>Total: {myFacultyList.length}</span>
                <span className="text-[10px] font-normal normal-case opacity-60">
                  Confidential Department Data
                </span>
              </div>
            </div>
          </div>
        )}

        {/* --- TABS CONTENT --- */}
        {activeTab === "dashboard" && renderDashboard()}

        {activeTab === "profile" && (
          <FacultyProfile
            faculty={faculty}
            theme={theme}
            refreshProfile={loadData}
          />
        )}

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
            refreshProfile={loadData}
          />
        )}
        {activeTab === "ssr" && (
          <FacultySSR
            authFetch={authFetch}
            theme={theme}
            pushToast={showToast}
          />
        )}
        {activeTab === "Evaluation" && (
          <FacultyEvaluation
            authFetch={authFetch}
            theme={theme}
            faculty={faculty}
            pushToast={showToast}
          />
        )}

        {activeTab === "settings" && (
          <FacultySettings
            authFetch={authFetch}
            theme={theme}
            pushToast={showToast}
            faculty={faculty}
            initialTab={settingsDefaultTab} // Passing the default tab state
          />
        )}
      </div>
    </div>
  );
};

export default FacultyDashboard;