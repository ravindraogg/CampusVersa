import React, { useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client"; // Socket Import
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
  ChevronDown,
  ListTodo,
  History,
  ArrowLeft,
  FileText,
  Map,
  Mic,
  Code2,
  Users,
  Send,
  Table as TableIcon,
  Menu,
  X,
  Settings,
  Megaphone,
  Award,
  MessageCircle,
  Languages,
  Accessibility,
  Activity,
  FlaskConical,
  Wrench
} from "lucide-react";

// --- SUB-COMPONENTS ---
import StudentAttendanceSection from "./StudentAttendanceSection";
import StudentPerformanceSection from "./StudentPerformanceSection";
import StudentProfileSection from "./StudentProfileSection";
import StudentTimetableSection from "./StudentTimetableSection";
import StudentCoursesSection from "./StudentCoursesSection";
import UniversalNoticePage from "../UniversalNoticePage";
import ScholarshipSection from "./scholler";

// --- FEATURE COMPONENTS ---
import ResumeBuilder from "./resume";
import MockInterview from "./mockinterview";
import ProjectCollab from "./projectcolab";
import FreelanceHub from "./freelance";
import ProblemSolvingArena from "./problemsolve";
import Roadmap from "./roadmap";

// --- NEW HACKATHON FEATURES ---
import TranslationHub from "./TranslationHub";
import AccessibilityTools from "./AccessibilityTools";
import VirtualLabs from "./VirtualLabs";

// --- CHATBOT IMPORT ---
import CompleteChatbot from "./CompleteChatbot"; // <--- 2. Import Chatbot Component

const API_URL = import.meta.env.VITE_BACKEND_URL;

// --- DEFAULT THEME ---
const DEFAULT_THEME = {
  primary: "#2E5843",
  secondary: "#D4E7DD",
  bg: "#F2F5F3",
  textMain: "#1F2937",
  white: "#FFFFFF",
  textOnPrimary: "#FFFFFF",
};

// --- NAVIGATION CONFIGURATION (Grouped Hierarchy) ---
const NAV_GROUPS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    type: "single",
  },
  {
    id: "academics",
    label: "Academics",
    icon: GraduationCap,
    type: "group",
    children: [
      { id: "attendance", label: "Attendance", icon: CalendarDays },
      { id: "timetable", label: "Timetable", icon: TableIcon },
      { id: "courses", label: "Courses", icon: BookOpen },
      { id: "performance", label: "Performance", icon: TrendingUp },
      { id: "virtualLabs", label: "Virtual Labs", icon: FlaskConical },
    ],
  },
  {
    id: "career_group",
    label: "Career",
    icon: Briefcase,
    type: "group",
    children: [
      { id: "career", label: "Career & Skills", icon: Briefcase },
      { id: "freelance", label: "Jobs & Hubs", icon: Send },
    ],
  },
  {
    id: "notices",
    label: "Notices",
    icon: Megaphone,
    type: "single",
  },
  {
    id: "services",
    label: "Services",
    icon: Wrench,
    type: "group",
    children: [
      { id: "scholarships", label: "Scholarships", icon: Award },
      { id: "translate", label: "Translate", icon: Languages },
      { id: "accessibility", label: "Accessibility", icon: Activity },
    ],
  },
];

// Flat list helper for mobile and lookups
const NAV_ITEMS_FLAT = NAV_GROUPS.flatMap(g =>
  g.type === "single" ? [{ id: g.id, label: g.label, icon: g.icon }] : g.children
);

// --- HELPER: VTU Grading Logic ---
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
      description: "Create & improve resume automatically.",
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
      description: "100+ curated DSA & logic problems.",
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
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Career & Skills Hub</h2>
        <p className="text-sm md:text-base text-gray-500">Select a tool to boost your professional journey.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {FEATURES.map((feature) => (
          <div
            key={feature.id}
            onClick={() => setActiveFeature(feature.id)}
            className="group bg-white rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all cursor-pointer flex flex-col justify-between min-h-[180px]"
          >
            <div>
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-3 md:mb-4 text-xl ${feature.color}`}>
                <feature.icon size={20} className="md:w-6 md:h-6" />
              </div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-xs md:text-sm text-gray-500 leading-relaxed line-clamp-2">
                {feature.description}
              </p>
            </div>

            <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-50 flex items-center text-xs md:text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {feature.buttonText} <ChevronRight size={16} className="ml-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- HELPER: Dashboard Line Chart ---
const DashboardLineChart = ({ data, color = "#6366f1" }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-32 flex items-center justify-center text-xs text-gray-400 italic">
        No academic history
      </div>
    );
  }

  const width = 300;
  const height = 100;
  const padding = 10;
  const maxValue = 100;

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1 || 1)) * (width - 2 * padding) + padding;
    const y = height - ((item.value || 0) / maxValue) * (height - 2 * padding) - padding;
    return { x, y, ...item };
  });

  const pathD = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <div className="w-full h-40 md:h-48 flex flex-col justify-end mt-4">
      <div className="relative w-full h-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#f3f4f6" strokeWidth="1" />
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4" />
          <path d={areaD} fill="url(#chartGradient)" />
          <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((p, i) => (
            <g key={i} className="group">
              <circle cx={p.x} cy={p.y} r="8" fill="transparent" className="cursor-pointer" />
              <circle cx={p.x} cy={p.y} r="3" fill="#fff" stroke={color} strokeWidth="2" className="pointer-events-none" />
              <foreignObject x={p.x - 30} y={p.y - 35} width="60" height="30" className="overflow-visible opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="flex justify-center">
                  <span className="bg-gray-800 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                    {p.tooltip || p.value.toFixed(1)}
                  </span>
                </div>
              </foreignObject>
            </g>
          ))}
        </svg>
      </div>
      <div className="flex justify-between px-1 mt-1">
        {points.map((p, i) => (
          <div key={i} className="text-[9px] text-gray-400 font-medium text-center" style={{ width: '40px' }}>
            {p.label}
          </div>
        ))}
      </div>
    </div>
  );
};

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

// --- DESKTOP NAV COMPONENT (Grouped Dropdowns) ---
const DesktopNav = ({ activeTab, setActiveTab, theme, accountType }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownTimeout = useRef(null);

  const handleMouseEnter = (groupId) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setOpenDropdown(groupId);
  };

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => setOpenDropdown(null), 150);
  };

  // Check if a group contains the active tab
  const groupContainsActive = (group) => {
    if (group.type === "single") return group.id === activeTab;
    return group.children?.some(c => c.id === activeTab);
  };

  // Filter NAV_GROUPS based on account type
  const filteredGroups = NAV_GROUPS.map(group => {
    if (group.type === "single") return group;
    
    const filteredChildren = group.children.filter(child => {
      if (accountType === 'independent') {
        const institutionalOnly = ['attendance', 'timetable', 'performance'];
        if (institutionalOnly.includes(child.id)) return false;
      }
      return true;
    });

    if (filteredChildren.length === 0) return null;
    return { ...group, children: filteredChildren };
  }).filter(Boolean);

  return (
    <div
      className="hidden md:flex h-full rounded-[2rem] shadow-sm items-center px-2 transition-all duration-300"
      style={{ backgroundColor: theme.primary }}
    >
      <div className="flex items-center gap-0.5 p-1 w-full justify-center">
        {filteredGroups.map((group) => {
          const isGroupActive = groupContainsActive(group);

          if (group.type === "single") {
            return (
              <button
                key={group.id}
                onClick={() => setActiveTab(group.id)}
                className="px-4 py-2.5 rounded-[2rem] flex items-center gap-2 transition-all duration-200 whitespace-nowrap text-sm font-semibold hover:bg-white/10"
                style={{
                  backgroundColor: isGroupActive ? "rgba(255,255,255,0.2)" : "transparent",
                  color: theme.textOnPrimary,
                  opacity: isGroupActive ? 1 : 0.85,
                }}
              >
                <group.icon className="w-4 h-4" />
                <span>{group.label}</span>
              </button>
            );
          }

          return (
            <div
              key={group.id}
              className="relative"
              onMouseEnter={() => handleMouseEnter(group.id)}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className="px-4 py-2.5 rounded-[2rem] flex items-center gap-1.5 transition-all duration-200 whitespace-nowrap text-sm font-semibold hover:bg-white/10"
                style={{
                  backgroundColor: isGroupActive || openDropdown === group.id ? "rgba(255,255,255,0.2)" : "transparent",
                  color: theme.textOnPrimary,
                  opacity: isGroupActive || openDropdown === group.id ? 1 : 0.85,
                }}
              >
                <group.icon className="w-4 h-4" />
                <span>{group.label}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === group.id ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown */}
              {openDropdown === group.id && (
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 min-w-[200px] rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 z-[60]"
                  style={{ backgroundColor: "#ffffff" }}
                  onMouseEnter={() => handleMouseEnter(group.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="p-1.5">
                    {group.children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => {
                          setActiveTab(child.id);
                          setOpenDropdown(null);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                          activeTab === child.id
                            ? "font-bold shadow-sm"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                        style={activeTab === child.id ? { backgroundColor: `${theme.primary}12`, color: theme.primary } : {}}
                      >
                        <child.icon className="w-4 h-4 shrink-0" />
                        {child.label}
                        {activeTab === child.id && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.primary }} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- HEADER ACTIONS (UPDATED WITH RED DOT LOGIC) ---
const HeaderActions = ({ activeTab, setActiveTab, theme, handleLogout, openMobileMenu, setOpenMobileMenu, unreadCount, setUnreadCount, accountType }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMobileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = () => {
    setActiveTab('notices');
    setUnreadCount(0); // Clear red dot when clicked
  };

  return (
    <div className="flex items-center gap-3 h-full">

      {/* --- DESKTOP VIEW ACTIONS --- */}
      <div className="hidden md:flex items-center gap-3 h-full">

        {/* Notification & Settings Group */}
        <div className="h-full px-2 rounded-[2rem] shadow-sm flex items-center justify-center gap-1 bg-white border border-gray-100 hover:bg-gray-50 transition-colors">
          {/* Bell Button with Red Dot */}
          <button
            onClick={handleNotificationClick}
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
               <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
            )}
          </button>

          <div className="w-px h-6 bg-gray-200 mx-1"></div>

          <button
            onClick={() => setActiveTab('settings')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="h-full px-6 rounded-[2rem] shadow-sm flex items-center justify-center gap-2 bg-white border border-gray-100 hover:bg-red-50 text-gray-700 font-bold text-sm group"
        >
          <LogOut className="w-5 h-5 group-hover:text-red-600 transition-colors" />
          <span className="group-hover:text-red-600 transition-colors">Logout</span>
        </button>
      </div>

      {/* --- MOBILE VIEW ACTIONS --- */}
      <div className="md:hidden flex items-center gap-2 relative" ref={menuRef}>
        <div className="h-12 rounded-2xl flex items-center p-1.5 shadow-sm border border-gray-100 bg-white">
          <button 
             onClick={handleNotificationClick}
             className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
               <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500"
          >
            <Settings className="w-5 h-5" />
          </button>

          <div className="w-px h-5 bg-gray-200 mx-1"></div>

          <button
            onClick={() => setOpenMobileMenu(!openMobileMenu)}
            className="h-9 px-3 rounded-xl flex items-center justify-center gap-2 text-white font-bold text-xs shadow-sm transition-transform active:scale-95"
            style={{ backgroundColor: theme.primary }}
          >
            {openMobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {openMobileMenu && (
          <div
            className="absolute top-14 right-0 z-50 w-72 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 origin-top-right backdrop-blur-md max-h-[80vh] overflow-y-auto custom-scrollbar"
            style={{ backgroundColor: theme.primary }}
          >
            <div className="flex flex-col gap-0.5">
              <div className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between opacity-80" style={{ color: theme.textOnPrimary }}>
                <span>Navigation</span>
                <button onClick={() => setOpenMobileMenu(false)} className="text-[9px] normal-case font-normal border px-2 py-0.5 rounded opacity-60 hover:opacity-100 transition-opacity" style={{ borderColor: theme.textOnPrimary, color: theme.textOnPrimary }}>Close</button>
              </div>

              {NAV_GROUPS.map((group) => {
                if (group.type === "single") {
                  return (
                    <button
                      key={group.id}
                      onClick={() => { setActiveTab(group.id); setOpenMobileMenu(false); }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors hover:bg-white/10"
                      style={{ color: theme.textOnPrimary, opacity: activeTab === group.id ? 1 : 0.8, backgroundColor: activeTab === group.id ? "rgba(255,255,255,0.15)" : "transparent" }}
                    >
                      <group.icon className="w-4 h-4" />
                      {group.label}
                    </button>
                  );
                }

                const filteredChildren = group.children.filter(child => {
                  if (accountType === 'independent') {
                    const institutionalOnly = ['attendance', 'timetable', 'performance'];
                    if (institutionalOnly.includes(child.id)) return false;
                  }
                  return true;
                });

                if (filteredChildren.length === 0) return null;

                return (
                  <div key={group.id} className="mt-1">
                    <div className="px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest opacity-50" style={{ color: theme.textOnPrimary }}>
                      {group.label}
                    </div>
                    {filteredChildren.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => { setActiveTab(child.id); setOpenMobileMenu(false); }}
                        className="w-full flex items-center gap-3 pl-6 pr-4 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-white/10"
                        style={{ color: theme.textOnPrimary, opacity: activeTab === child.id ? 1 : 0.7, backgroundColor: activeTab === child.id ? "rgba(255,255,255,0.15)" : "transparent" }}
                      >
                        <child.icon className="w-4 h-4 shrink-0" />
                        {child.label}
                        {activeTab === child.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />}
                      </button>
                    ))}
                  </div>
                );
              })}

              <div className="h-px opacity-20 my-1.5" style={{ backgroundColor: theme.textOnPrimary }}></div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-white/10 opacity-80 hover:opacity-100"
                style={{ color: theme.textOnPrimary }}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD COMPONENT ---
const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [accountType, setAccountType] = useState(localStorage.getItem("accountType") || 'institute');
  const [institute, setInstitute] = useState(null);
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false); // <--- 3. State for Chatbot Modal

  // Data States
  const [performanceChartData, setPerformanceChartData] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [subjectWiseData, setSubjectWiseData] = useState([]);
  const [availableTimetables, setAvailableTimetables] = useState([]);

  // --- SOCKET STATES ---
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastMsg, setToastMsg] = useState(null);
  const [noticeRefreshTrigger, setNoticeRefreshTrigger] = useState(0);

  // --- SOCKET CONNECTION EFFECT ---
  useEffect(() => {
    if (!student || !institute) return;

    // 1. Connect to Backend URL
   const newSocket = io(API_URL, {
      transports: ['websocket', 'polling'], // Allow fallback
      withCredentials: false
    });
    
    setSocket(newSocket);

    // Debugging connection
    newSocket.on("connect", () => {
      console.log("[SOCKET] Connected with ID:", newSocket.id);
    });

    newSocket.on("connect_error", (err) => {
      console.error("[SOCKET ERROR] Connection Error:", err.message);
    });

    newSocket.emit('join_room', {
      instituteId: institute?._id || 'independent',
      role: 'student',
      department: student?.department || 'general'
    });

    // 3. Listen for Notices
    newSocket.on('receive_notice', (data) => {
      console.log("Socket: New Notice", data);
      setUnreadCount(prev => prev + 1);
      setToastMsg({ 
        title: "New Notice", 
        msg: data.title, 
        type: data.type === 'Urgent' ? 'alert' : 'info' 
      });
      // Trigger notice page refresh
      setNoticeRefreshTrigger(prev => prev + 1);
    });

    // 4. Listen for Marks/Exam Alerts
    newSocket.on('receive_alert', (data) => {
      console.log("Socket: Alert", data);
      setUnreadCount(prev => prev + 1);
      setToastMsg({ 
        title: data.title || "Alert", 
        msg: data.message, 
        type: "alert" 
      });
    });

    // Cleanup
    return () => {
      newSocket.disconnect();
    };
  }, [student, institute]);

  // --- DATA LOADING ---
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/student/me");
      const data = await res.json();
      let currentStudent = data.student;
      setInstitute(data.institute);
      if (data.accountType) {
        setAccountType(data.accountType);
        localStorage.setItem("accountType", data.accountType);
      }

      if (data.institute?.themeColorPrimary) {
        setTheme((prev) => ({
          ...prev,
          primary: data.institute.themeColorPrimary,
          secondary: data.institute.themeColorSecondary || prev.secondary,
          textOnPrimary: "#FFFFFF",
        }));
      }

      // ... (Existing attendance/marks logic retained for compatibility) ...
      try {
        const attRes = await authFetch("/student/attendance/full");
        if (attRes.ok) {
          const attFullData = await attRes.json();
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
          
          let calculatedResults = [];
          let sumSiCi = 0;
          let sumCiTotal = 0;
          const creditMap = {};
          attFullData.forEach(r => {
             if (r.courseId && r.courseId._id) creditMap[r.courseId._id] = r.courseId.credits || 3;
          });
          if (currentStudent.courseEnrollments) {
            currentStudent.courseEnrollments.forEach(semData => {
              let semCreditsTotal = 0;
              let semProduct = 0;
              semData.subjects.forEach(sub => {
                const credits = creditMap[sub.courseId] || 3;
                let finalMarks = sub.marksObtained || 0;
                if (finalMarks === 0 && sub.marksDetails) {
                  const m = sub.marksDetails;
                  const internal = (m.test1 + m.test2 + m.test3 + m.assignment) / 4;
                  const external = m.external / 2;
                  finalMarks = internal + external;
                }
                const gp = getGradePoint(finalMarks);
                if (gp > 0 || finalMarks >= 0) {
                  semCreditsTotal += credits;
                  semProduct += (credits * gp);
                }
              });
              if (semCreditsTotal > 0) {
                const sgpa = semProduct / semCreditsTotal;
                calculatedResults.push({ semester: semData.semester, sgpa: parseFloat(sgpa.toFixed(2)) });
                sumSiCi += (sgpa * semCreditsTotal);
                sumCiTotal += semCreditsTotal;
              }
            });
          }
          const calculatedCGPA = sumCiTotal > 0 ? (sumSiCi / sumCiTotal).toFixed(2) : "0.00";
          currentStudent = {
            ...currentStudent,
            attendance: { ...currentStudent.attendance, overallPercentage: liveOverall },
            academic: { ...currentStudent.academic, cgpa: calculatedCGPA, creditsEarned: sumCiTotal, semesterResults: calculatedResults }
          };
          setStudent(currentStudent);

          const sortedResults = [...calculatedResults].sort((a, b) => Number(a.semester) - Number(b.semester));
          const perfData = sortedResults.map(sem => ({
            label: `Sem ${sem.semester}`,
            value: (sem.sgpa / 10) * 100, 
            tooltip: `SGPA: ${sem.sgpa}`
          }));
          setPerformanceChartData(perfData);

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

  // Auto-Dismiss Toast
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    setShowLogoutModal(true);
  };
  const confirmLogout = () => {
    localStorage.removeItem("studentToken");
    window.location.href = "/student/auth";
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return renderDashboardOverview();
      case "notices": // New Case for Notices
        return (
          <div className="animate-in fade-in h-full">
            <UniversalNoticePage 
               role="student" 
               authFetch={authFetch} 
               theme={theme} 
               pushToast={(msg, type) => setToastMsg({title: type === 'error' ? 'Error' : 'Success', msg, type})} 
               key={noticeRefreshTrigger} // Forces refresh when socket triggers
            />
          </div>
        );
      case "attendance": return <StudentAttendanceSection student={student} />;
      case "timetable":
        return (
          <StudentTimetableSection
            timetables={availableTimetables}
            student={student}
            theme={theme}
          />
        );
      case "translate":
        return <div className="animate-in fade-in h-full"><TranslationHub theme={theme} /></div>;
      case "accessibility":
        return <div className="animate-in fade-in h-full"><AccessibilityTools theme={theme} /></div>;
      case "virtualLabs":
        return <div className="animate-in fade-in h-full"><VirtualLabs theme={theme} student={student} /></div>;
      case "courses":
        return <StudentCoursesSection student={student} theme={theme} />;
        case "scholarships":
        return <ScholarshipSection student={student} theme={theme} />;
      case "performance": return <StudentPerformanceSection student={student} />;
      case "career": return <CareerHub theme={theme} />;
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

  const renderDashboardOverview = () => {
    if (accountType === 'independent') {
      return (
        <div className="animate-in fade-in duration-500 grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 pb-20 md:pb-10">
          {/* 1. Welcome Header */}
          <div className="lg:col-span-4 bg-gradient-to-r from-indigo-600 to-purple-600 p-8 md:p-12 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between shadow-xl relative overflow-hidden group">
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
            <div className="relative z-10 space-y-2 text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight">
                Hello, {student?.name?.split(" ")[0]}!
              </h2>
              <p className="text-indigo-100 text-sm md:text-lg font-medium opacity-90 max-w-xl">
                Ready to take the next step in your learning journey? Explore tools designed for your professional growth.
              </p>
              <div className="flex flex-wrap gap-3 mt-6 justify-center md:justify-start">
                 <button onClick={() => setActiveTab('career')} className="px-6 py-3 bg-white text-indigo-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:shadow-lg hover:scale-105 transition-all">Explore Career Hub</button>
                 <button onClick={() => setActiveTab('settings')} className="px-6 py-3 bg-indigo-500/30 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-500/50 transition-all">Complete Profile</button>
              </div>
            </div>
            <div className="hidden lg:block relative z-10">
               <div className="w-48 h-48 bg-white/20 rounded-[3rem] backdrop-blur-xl border border-white/30 flex items-center justify-center rotate-6 animate-pulse">
                  <Sparkles className="w-24 h-24 text-yellow-300" />
               </div>
            </div>
          </div>

          {/* 2. Independent Quick Actions */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
             <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                   <FileText size={24} />
                </div>
                <div>
                   <h4 className="font-black text-gray-800 uppercase text-xs tracking-widest">Resume Builder</h4>
                   <p className="text-gray-400 text-[10px] mt-1">Create an ATS-friendly resume in minutes.</p>
                </div>
                <button onClick={() => setActiveTab('career')} className="mt-auto w-full py-3 bg-gray-50 text-gray-600 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all">Open Builder</button>
             </div>

             <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                   <FlaskConical size={24} />
                </div>
                <div>
                   <h4 className="font-black text-gray-800 uppercase text-xs tracking-widest">Virtual Labs</h4>
                   <p className="text-gray-400 text-[10px] mt-1">Simulate experiments across various disciplines.</p>
                </div>
                <button onClick={() => setActiveTab('virtualLabs')} className="mt-auto w-full py-3 bg-gray-50 text-gray-600 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-emerald-600 hover:text-white transition-all">Launch Labs</button>
             </div>

             <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner">
                   <Award size={24} />
                </div>
                <div>
                   <h4 className="font-black text-gray-800 uppercase text-xs tracking-widest">Scholarships</h4>
                   <p className="text-gray-400 text-[10px] mt-1">Find financial aid tailored to your profile.</p>
                </div>
                <button onClick={() => setActiveTab('scholarships')} className="mt-auto w-full py-3 bg-gray-50 text-gray-600 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-amber-600 hover:text-white transition-all">Find Grants</button>
             </div>

             {/* Roadmaps and Projects */}
             <div className="md:col-span-3 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
                <div className="w-full md:w-1/2 space-y-4">
                   <div className="inline-block px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest">Career Strategy</div>
                   <h3 className="text-2xl font-black text-gray-800 leading-tight">Master Your Career Path with AI-Powered Roadmaps</h3>
                   <p className="text-gray-500 text-sm">Our intelligent system analyzes your goals and creates step-by-step learning paths to help you reach your dream job.</p>
                   <button onClick={() => setActiveTab('career')} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2">View My Roadmap <ChevronRight size={14} /></button>
                </div>
                <div className="w-full md:w-1/2 grid grid-cols-2 gap-3">
                   {['DSA Master', 'Web Development', 'AI & ML', 'Cybersecurity'].map(path => (
                      <div key={path} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3 hover:bg-white hover:shadow-md transition-all cursor-pointer group">
                         <div className="w-2 h-2 rounded-full bg-purple-500 group-hover:scale-150 transition-transform"></div>
                         <span className="text-xs font-bold text-gray-600">{path}</span>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          {/* 3. Right Column: Profile Summary */}
          <div className="lg:col-span-1 space-y-4 md:space-y-6">
             <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center text-center gap-4">
                <div className="relative">
                   <div className="w-24 h-24 rounded-full border-4 border-indigo-500 p-1">
                      {student?.profilePic ? (
                        <img src={student.profilePic} alt="Profile" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-2xl font-black text-gray-400">{student?.name?.charAt(0)}</div>
                      )}
                   </div>
                   <div className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center border-4 border-white">
                      <Sparkles size={14} />
                   </div>
                </div>
                <div>
                   <h3 className="text-xl font-black text-gray-800">{student?.name}</h3>
                   <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Independent Learner</p>
                </div>
                <div className="w-full h-px bg-gray-100 my-2"></div>
                <div className="w-full space-y-3">
                   <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-medium">Profile Strength</span>
                      <span className="text-indigo-600 font-black">75%</span>
                   </div>
                   <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="w-[75%] h-full bg-indigo-500 rounded-full"></div>
                   </div>
                </div>
                <button onClick={() => setActiveTab('settings')} className="w-full py-3 border border-gray-200 rounded-xl text-gray-600 font-bold text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all">Edit Profile</button>
             </div>

             <div className="bg-slate-900 p-6 rounded-[2rem] text-white space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <h4 className="text-xs font-black uppercase tracking-widest opacity-60">Global Reach</h4>
                <div className="flex items-center gap-4">
                   <div className="text-3xl font-black">2.4k</div>
                   <div className="text-[10px] font-medium opacity-60 leading-tight">Learners enrolled <br/> independently this week</div>
                </div>
                <div className="flex -space-x-3 mt-4">
                   {[1,2,3,4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[8px] font-bold">U{i}</div>
                   ))}
                   <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-indigo-500 flex items-center justify-center text-[8px] font-bold">+99</div>
                </div>
             </div>
          </div>
        </div>
      );
    }

    return (
      <div className="animate-in fade-in duration-500 grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 pb-20 md:pb-10">
        {/* 1. Welcome Header */}
        <div className="lg:col-span-4 bg-gradient-to-r from-gray-50 to-white p-5 md:p-6 rounded-[2rem] border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm relative overflow-hidden gap-4">
          <div className="relative z-10">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              Welcome back, {student?.name?.split(" ")[0]}!
            </h2>
            <p className="text-gray-500 text-xs md:text-sm mt-1 flex items-center gap-2">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-yellow-500" />
              AI Prediction: <span className="font-bold text-green-600">Stable Growth</span>.
            </p>
          </div>
          {accountType === 'institute' && student?.attendance?.overallPercentage < 75 && (
            <div className="flex flex-col gap-2 relative z-10 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-xl border border-red-100 text-xs font-bold shadow-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Low Attendance ({Number(student.attendance.overallPercentage || 0).toFixed(0)}%)</span>
              </div>
            </div>
          )}
        </div>

        {/* 2. Left Column */}
        <div className="lg:col-span-3 flex flex-col gap-4 md:gap-6 order-2 md:order-1">
          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-white p-4 md:p-5 rounded-2xl md:rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-green-50 rounded-full text-green-600"><GraduationCap className="w-4 h-4 md:w-5 md:h-5" /></div>
                <span className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase">CGPA</span>
              </div>
              <div className="mt-2">
                <h3 className="text-xl md:text-2xl font-black text-gray-800">{student?.academic?.cgpa || "0.00"}</h3>
                <p className="text-[9px] md:text-[10px] text-green-600 font-bold">Cumulative</p>
              </div>
            </div>
            {accountType === 'institute' && (
              <div className="bg-white p-4 md:p-5 rounded-2xl md:rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-blue-50 rounded-full text-blue-600"><CalendarDays className="w-4 h-4 md:w-5 md:h-5" /></div>
                  <span className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase">Attendance</span>
                </div>
                <div className="mt-2">
                  <h3 className="text-xl md:text-2xl font-black text-gray-800">{Number(student?.attendance?.overallPercentage || 0).toFixed(2)}%</h3>
                  <p className="text-[9px] md:text-[10px] text-gray-400">Overall Avg</p>
                </div>
              </div>
            )}
            <div className="bg-white p-4 md:p-5 rounded-2xl md:rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-orange-50 rounded-full text-orange-600"><ListTodo className="w-4 h-4 md:w-5 md:h-5" /></div>
                <span className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase">Credits</span>
              </div>
              <div className="mt-2">
                <h3 className="text-xl md:text-2xl font-black text-gray-800">{student?.academic?.creditsEarned || 0}</h3>
                <p className="text-[9px] md:text-[10px] text-orange-500 font-bold">Earned</p>
              </div>
            </div>
            <div className="bg-white p-4 md:p-5 rounded-2xl md:rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="p-2 bg-purple-50 rounded-full text-purple-600"><BookOpen className="w-4 h-4 md:w-5 md:h-5" /></div>
                <span className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase">Courses</span>
              </div>
              <div className="mt-2">
                <h3 className="text-xl md:text-2xl font-black text-gray-800">
                  {student?.courseEnrollments?.find(s => s.semester === student.semester)?.subjects?.length || 0}
                </h3>
                <p className="text-[9px] md:text-[10px] text-gray-400">Active</p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-white p-5 md:p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col h-full min-h-[250px] md:min-h-[300px]">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-gray-700 text-sm md:text-base flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-gray-400" /> Subject Attendance
                </h4>
                <span className={`text-[10px] md:text-xs px-2 py-1 rounded font-bold ${student?.attendance?.overallPercentage >= 75 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"}`}>
                  {student?.attendance?.overallPercentage >= 75 ? "Good" : "Low"}
                </span>
              </div>
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
            <div className="bg-white p-5 md:p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col h-full min-h-[250px] md:min-h-[300px]">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-gray-700 text-sm md:text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gray-400" /> Academic Trend
                </h4>
                <span className="text-[10px] md:text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded font-bold">SGPA/Sem</span>
              </div>
              <DashboardLineChart data={performanceChartData} color="#6366f1" />
            </div>
          </div>
        </div>

        {/* 3. Right Column */}
        <div className="lg:col-span-1 flex flex-col gap-4 order-1 md:order-2">
          <div
            className="bg-white p-3 md:p-4 rounded-2xl md:rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setActiveTab("settings")}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-100 flex items-center justify-center border-2 overflow-hidden shrink-0" style={{ borderColor: theme.primary }}>
              {student?.profilePic ? (
                <img src={student.profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-base md:text-lg font-bold text-gray-400">{student?.name?.charAt(0)}</span>
              )}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-gray-800 truncate text-xs md:text-sm">{student?.name}</h3>
              <p className="text-[10px] md:text-xs text-gray-500 truncate">{student?.SID || "Student"}</p>
            </div>
          </div>

          <div className="bg-orange-50 p-4 md:p-5 rounded-2xl md:rounded-[2rem] border border-orange-100 relative overflow-hidden">
            <div className="absolute right-[-20px] top-[-20px] opacity-10">
              <CalendarDays className="w-20 h-20 md:w-24 md:h-24 text-orange-600" />
            </div>
            <p className="text-orange-600 text-[10px] md:text-xs font-bold uppercase mb-1 relative z-10">Today's Schedule</p>
            <h3 className="text-3xl md:text-4xl font-extrabold text-orange-900 relative z-10">
              {student?.todayClasses || 0} <span className="text-base md:text-lg ml-1 font-bold opacity-60">Classes</span>
            </h3>
            <p className="text-[10px] md:text-xs text-orange-700 mt-2 relative z-10 font-medium cursor-pointer hover:underline" onClick={() => setActiveTab('timetable')}>
              Check Timetable
            </p>
          </div>

          <div className="bg-white p-4 md:p-5 rounded-[2rem] border border-gray-100 shadow-sm hidden md:block">
            <h4 className="font-bold text-gray-800 text-xs md:text-sm mb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-gray-400" /> Recent Attendance
            </h4>
            <div className="space-y-3">
              {recentAttendance.length > 0 ? (
                recentAttendance.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors">
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-gray-700 truncate w-32">{item.courseName}</p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-bold ${item.value === 1 ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
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
  };

  if (loading) return <div className="h-[100dvh] flex items-center justify-center bg-[#F8F9FC]"><Loader2 className="w-10 h-10 animate-spin" style={{ color: theme.primary }} /></div>;

  return (
    <div className="h-[100dvh] w-screen bg-[#F8F9FC] p-3 md:p-6 flex flex-col gap-4 md:gap-6 overflow-hidden font-sans antialiased relative">
      
      {/* --- TOAST NOTIFICATION (SOCKET) --- */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[100] bg-gray-900 text-white pl-4 pr-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-10 fade-in border border-gray-800 max-w-sm">
          <div className={`p-2 rounded-full ${toastMsg.type === 'alert' ? 'bg-red-500' : 'bg-blue-500'}`}>
            {toastMsg.type === 'alert' ? <AlertCircle className="w-5 h-5 text-white" /> : <Bell className="w-5 h-5 text-white" />}
          </div>
          <div>
            <h4 className="font-bold text-sm tracking-wide">{toastMsg.title}</h4>
            <p className="text-xs opacity-80 mt-0.5 line-clamp-2">{toastMsg.msg}</p>
          </div>
          <button onClick={() => setToastMsg(null)} className="ml-auto text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="shrink-0 flex items-center justify-between gap-4 h-18 md:h-18 relative z-50">
        <div className="h-full px-3 md:px-6 rounded-2xl md:rounded-[2rem] flex items-center gap-2 md:gap-4 shadow-lg shadow-gray-200/50 min-w-fit" style={{ backgroundColor: theme.primary, color: theme.white }}>
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center p-1 border-2 border-white/30 shrink-0">
            {institute?.logo ? <img src={institute.logo} alt="Logo" className="w-full h-full object-contain p-1" /> : <GraduationCap className="w-6 h-6 text-white" />}
          </div>
          <div className="block">
            <h1 className="font-extrabold text-[10px] md:text-lg leading-none">{institute?.code || "CAMPUS"}</h1>
            <p className="text-[8px] md:text-[10px] uppercase font-bold mt-0.5 md:mt-1 opacity-90" style={{ color: theme.secondary }}>Student Portal</p>
          </div>
        </div>

        <div className="hidden md:flex items-center justify-center flex-1 mx-4 h-full">
          <DesktopNav activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} accountType={accountType} />
        </div>

        {/* Right Actions with Red Dot Support */}
        <HeaderActions
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          theme={theme}
          handleLogout={handleLogout}
          openMobileMenu={isMobileMenuOpen}
          setOpenMobileMenu={setIsMobileMenuOpen}
          unreadCount={unreadCount}
          setUnreadCount={setUnreadCount}
          accountType={accountType}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-2xl md:rounded-[3rem] shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-4 md:p-8 overflow-y-auto relative custom-scrollbar border border-gray-100">
        {renderContent()}
      </div>

      {/* --- 3. FLOATING CHAT BUTTON --- */}
      <button 
        onClick={() => setShowChatbot(true)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-transform hover:scale-110 active:scale-95 flex items-center justify-center"
        style={{ backgroundColor: theme.primary, color: theme.white }}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* --- 4. CHATBOT MODAL OVERLAY --- */}
      {showChatbot && (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Close Button for Chatbot */}
            <button 
              onClick={() => setShowChatbot(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Render Chatbot Component */}
            <div className="flex-1 overflow-auto bg-gray-50">
               <CompleteChatbot />
            </div>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl p-6 md:p-8 max-w-sm w-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 to-orange-500"></div>
            <div className="flex flex-col items-center text-center gap-5">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center rotate-3">
                <LogOut className="w-7 h-7 md:w-8 md:h-8 ml-1" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-black text-gray-800">See you soon!</h3>
                <p className="text-xs md:text-sm text-gray-500 mt-2 font-medium">Are you sure you want to log out?</p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button onClick={() => setShowLogoutModal(false)} className="flex-1 px-4 py-2.5 md:py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs md:text-sm hover:bg-gray-200 transition-colors">Stay</button>
                <button onClick={confirmLogout} className="flex-1 px-4 py-2.5 md:py-3 rounded-xl bg-gray-900 text-white font-bold text-xs md:text-sm hover:bg-black transition-colors shadow-xl shadow-gray-200">Logout</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
