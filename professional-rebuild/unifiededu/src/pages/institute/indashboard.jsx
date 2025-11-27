// indashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
  ClipboardList,
  Send,
  Bell,
  Cpu,
  TrendingUp,
  Settings,
  Plus,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  LogOut,
  Loader2,
  Save,
  Upload,
  X,
  Trash2,
  BellOff
} from "lucide-react";
import DepartmentPage from "./DepartmentPage";
import FacultyPage from "./FacultyPage";
import StudentPage from "./StudentPage";
import RequestAdminPage from "./RequestAdminPage";
import NaacPage from "./NaacPage";
import NoticePage from "./NoticePage"; 

const API_URL = "http://localhost:5000";

// --- Default Theme ---
const DEFAULT_THEME = {
  primary: "#66BB6A",
  secondary: "#7D5AFE",
  dark: "#374232",
  bg: "#F9FAFB",
  white: "#FFFFFF",
  textMain: "#1F2937",
  textMuted: "#6B7280",
};

// --- Small helpers (Can remain outside) ---
const authFetch = async (path, opts = {}) => {
  const token = localStorage.getItem("instituteToken");
  const headers = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...opts, headers });
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem("instituteToken");
    window.location.href = "/in/auth";
    throw new Error("Unauthorized");
  }
  return res;
};

const Spinner = ({ size = 6, color = "white" }) => (
  <div
    className="rounded-full animate-spin"
    style={{
      width: `${size}px`,
      height: `${size}px`,
      border: `${Math.max(2, Math.round(size / 6))}px solid ${color}`,
      borderTopColor: "transparent",
    }}
  />
);

const InfoBox = ({ label, value }) => (
  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 min-w-[100px]">
    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
      {label}
    </span>
    <p className="font-semibold text-gray-700 text-sm truncate">{value}</p>
  </div>
);

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  color = "primary",
  theme,
}) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all group">
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
      {trend && (
        <p
          className="text-xs font-semibold mt-2 flex items-center"
          style={{ color: theme.primary }}
        >
          <TrendingUp className="w-3 h-3 mr-1" /> {trend}
        </p>
      )}
    </div>
    <div
      className={`p-4 rounded-xl opacity-20 group-hover:opacity-30 transition-opacity`}
      style={{
        backgroundColor:
          color === "secondary" ? theme.secondary : theme.primary,
      }}
    >
      <Icon
        className="w-6 h-6"
        style={{
          color: color === "secondary" ? theme.secondary : theme.primary,
          opacity: 1,
        }}
      />
    </div>
  </div>
);

const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
    <div>
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
    </div>
    {action && <div className="mt-4 md:mt-0">{action}</div>}
  </div>
);


// --- Main Dashboard Component ---
const InstituteDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [notification, setNotification] = useState(null); // Toast state
  const [showNotificationsModal, setShowNotificationsModal] = useState(false); // Bell Modal state

  // Data State
  const [institute, setInstitute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [error, setError] = useState("");

  // Theme
  const [currentTheme, setCurrentTheme] = useState(DEFAULT_THEME);

  // Section-specific states
  const [dashboardStats, setDashboardStats] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [facultyList, setFacultyList] = useState(null);
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [studentsList, setStudentsList] = useState(null);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [noticesList, setNoticesList] = useState(null);
  const [noticesLoading, setNoticesLoading] = useState(false);
  const [requestsList, setRequestsList] = useState(null);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [metricsList, setMetricsList] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [naacData, setNaacData] = useState(null);
  const [naacLoading, setNaacLoading] = useState(false);
  const [timetables, setTimetables] = useState(null);
  const [timetablesLoading, setTimetablesLoading] = useState(false);

  // --- AI Timetable State (MOVED HERE) ---
  const [timetableConfig, setTimetableConfig] = useState({
    semester: "",
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    startTime: "09:00",
    endTime: "16:00",
    slotDuration: "60", // in minutes
    subjects: "", // Comma separated
    faculty: "", // Comma separated
    labs: "", // Comma separated
    constraints: "" // Free text for AI
  });
  const [generatedTimetable, setGeneratedTimetable] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    logoBase64: null,
    previewUrl: null,
  });

  // --- Helper: Centralized Toast Function ---
  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // --- AI Timetable Handler (MOVED HERE) ---
  const handleGenerateAiTimetable = async () => {
    if (!timetableConfig.semester || !timetableConfig.subjects) {
      showToast("Please provide at least a Semester and Subjects.", "error");
      return;
    }
  
    setIsGenerating(true);
    try {
      // Construct payload
      const payload = {
        prompt: `Generate a college timetable for ${timetableConfig.semester}. 
        Working Days: ${timetableConfig.workingDays.join(", ")}.
        Time: ${timetableConfig.startTime} to ${timetableConfig.endTime}.
        Slot Duration: ${timetableConfig.slotDuration} minutes.
        Subjects: ${timetableConfig.subjects}.
        Faculty: ${timetableConfig.faculty}.
        Lab Requirements: ${timetableConfig.labs}.
        Additional Constraints: ${timetableConfig.constraints}.
        Output strictly in JSON format where keys are Days and values are arrays of objects containing { time, subject, faculty, room }.`,
        
        // Pass these explicitly for DB saving
        semester: timetableConfig.semester,
        subjects: timetableConfig.subjects
  .split(",")
  .map(s => s.trim())
  .filter(Boolean),

        workingDays: timetableConfig.workingDays
      };
  
      const res = await authFetch("/institute/timetable/generate", { 
        method: "POST", 
        body: JSON.stringify(payload) 
      });
  
      const data = await res.json();
  
      if (res.ok && data.schedule) {
        setGeneratedTimetable(data.schedule);
        showToast("AI Timetable generated successfully!");
        // Refresh saved timetables list
        loadTimetables();
      } else {
        showToast(data.message || "Failed to generate timetable.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Server error during generation.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Initial fetch ---
  const fetchInstituteData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/institute/me", { method: "GET" });
      const data = await res.json();
      setInstitute(data);
      if (data.themeColor) {
        setCurrentTheme((prev) => ({
          ...prev,
          primary: data.themeColor,
          dark: data.themeColor,
        }));
      }
      if (data.themeColorPrimary) {
        sessionStorage.setItem("themePrimary", data.themeColorPrimary);
        setCurrentTheme((prev) => ({
          ...prev,
          primary: data.themeColorPrimary,
          dark: data.themeColorPrimary,
          textOnPrimary: data.themeColorSecondary || "#FFFFFF",
        }));
      }

      await loadDashboardStats();
      // Load notices initially so bell works immediately
      await loadNotices();
    } catch (err) {
      console.error("Failed to fetch institute:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstituteData();
  }, [fetchInstituteData]);

  // --- Update Browser Tab ---
  useEffect(() => {
    if (institute) {
      document.title = `${institute.code || "Institute"} | CampusVersa`;
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
  }, [institute]);

  // --- Tab Management ---
  useEffect(() => {
    if (activeTab === "dashboard") loadDashboardStats();
    if (activeTab === "faculty" && facultyList === null) loadFaculty();
    if (activeTab === "data-tracking" && studentsList === null) loadStudents();
    if (activeTab === "notices" && noticesList === null) loadNotices();
    if (activeTab === "dept-metrics" && metricsList === null) loadMetrics();
    if (activeTab === "naac" && naacData === null) loadNAAC();
    if (activeTab === "ai-timetable" && timetables === null) loadTimetables();
  }, [activeTab]);

  // --- Loaders ---
  const loadDashboardStats = async () => {
    setDashboardLoading(true);
    try {
      const res = await authFetch("/institute/dashboard-stats", { method: "GET" });
      const data = await res.json();
      setDashboardStats(data);
    } catch (err) { console.error("dashboard-stats", err); } finally { setDashboardLoading(false); }
  };
  const loadFaculty = async () => {
    setFacultyLoading(true);
    try {
      const res = await authFetch("/institute/faculty", { method: "GET" });
      const data = await res.json();
      setFacultyList(data);
    } catch (err) { setFacultyList([]); } finally { setFacultyLoading(false); }
  };
  const loadStudents = async () => {
    setStudentsLoading(true);
    try {
      const res = await authFetch("/institute/students", { method: "GET" });
      const data = await res.json();
      setStudentsList(data);
    } catch (err) { setStudentsList([]); } finally { setStudentsLoading(false); }
  };
  const loadNotices = async () => {
    setNoticesLoading(true);
    try {
      const res = await authFetch("/institute/notices", { method: "GET" });
      const data = await res.json();
      setNoticesList(data);
    } catch (err) { setNoticesList([]); } finally { setNoticesLoading(false); }
  };
  
  // --- ACTIONS ---
  const postNotice = async (payload) => {
    setIsPageLoading(true);
    try {
      const res = await authFetch("/institute/notices/add", { method: "POST", body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok) { 
        showToast("Notice published successfully."); 
        loadNotices(); 
      } else { 
        showToast(data.message || "Failed to post notice", "error"); 
      }
    } catch (err) { 
      showToast("Server error while posting notice", "error"); 
    } finally { 
      setIsPageLoading(false); 
    }
  };

  const loadMetrics = async () => {
    setMetricsLoading(true);
    try {
      const res = await authFetch("/institute/metrics", { method: "GET" });
      const data = await res.json();
      setMetricsList(data);
    } catch (err) { setMetricsList([]); } finally { setMetricsLoading(false); }
  };

  const updateMetric = async (payload) => {
    setIsPageLoading(true);
    try {
      const res = await authFetch("/institute/metrics/update", { method: "POST", body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok) { 
        showToast("Department metrics updated."); 
        loadMetrics(); 
      } else { 
        showToast(data.message || "Update failed", "error"); 
      }
    } catch (err) { 
      showToast("Server error while updating metrics", "error"); 
    } finally { 
      setIsPageLoading(false); 
    }
  };

  const loadNAAC = async () => {
    setNaacLoading(true);
    try {
      const res = await authFetch("/institute/naac?ai=1", { method: "GET" });
      const data = await res.json();
      setNaacData(data);
    } catch (err) { setNaacData(null); } finally { setNaacLoading(false); }
  };

  const updateNAAC = async (payload) => {
    setIsPageLoading(true);
    try {
      const res = await authFetch("/institute/naac/update", { method: "POST", body: JSON.stringify(payload) });
      if (res.ok) { 
        loadNAAC(); 
      } else { 
        showToast("NAAC update failed", "error"); 
      }
    } catch (err) { 
      showToast("Server error", "error"); 
    } finally { 
      setIsPageLoading(false); 
    }
  };

  const loadTimetables = async () => {
    setTimetablesLoading(true);
    try {
      const res = await authFetch("/institute/timetables", { method: "GET" });
      const data = await res.json();
      setTimetables(data);
    } catch (err) { setTimetables([]); } finally { setTimetablesLoading(false); }
  };

  // --- Profile Logic ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm((prev) => ({ ...prev, logoBase64: reader.result, previewUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = async () => {
    setUploadLoading(true);
    setIsPageLoading(true);
    try {
      const payload = {
        name: editForm.name || institute.name,
        logoBase64: editForm.logoBase64,
      };
      const response = await authFetch("/institute/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      
      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed");
      }

      setInstitute(data.data);
      if (data.data.themeColorPrimary) {
        setCurrentTheme((prev) => ({
          ...prev,
          primary: data.data.themeColorPrimary,
          dark: data.data.themeColorPrimary,
          textOnPrimary: data.data.themeColorSecondary || "#FFFFFF",
        }));
      }
      setIsEditingProfile(false);
      showToast("Profile & Logo updated successfully!", "success");
    } catch (error) {
      showToast("Profile update failed. Please try again.", "error");
    } finally {
      setUploadLoading(false);
      setIsPageLoading(false);
    }
  };

  const openProfileEditor = () => {
    setEditForm({
      name: institute?.name || "",
      logoBase64: null,
      previewUrl: institute?.logo || null,
    });
    setIsEditingProfile(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("instituteToken");
    localStorage.removeItem("instituteName");
    window.location.href = "/in/auth";
  };

  // --- Bell / Notification Logic ---
  const clearNotifications = () => {
    setNoticesList([]);
    // Optionally: Call backend to mark read if supported
    showToast("Notifications cleared locally");
  };

  // --- RENDER FUNCTIONS (Must be inside component to see state) ---
  const renderTimetableSection = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <SectionHeader 
        title="AI Timetable Generator" 
        subtitle="Define your constraints and let AI optimize the schedule." 
      />
  
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* LEFT: Configuration Form */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4" /> Configuration
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Semester / Batch</label>
                <input 
                  type="text" 
                  placeholder="e.g. B.Tech CS - Sem 5"
                  className="w-full mt-1 p-2 bg-gray-50 border rounded-lg text-sm outline-none focus:border-blue-500"
                  value={timetableConfig.semester}
                  onChange={(e) => setTimetableConfig({...timetableConfig, semester: e.target.value})}
                />
              </div>
  
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Start Time</label>
                  <input type="time" className="w-full mt-1 p-2 bg-gray-50 border rounded-lg text-sm"
                    value={timetableConfig.startTime}
                    onChange={(e) => setTimetableConfig({...timetableConfig, startTime: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">End Time</label>
                  <input type="time" className="w-full mt-1 p-2 bg-gray-50 border rounded-lg text-sm"
                    value={timetableConfig.endTime}
                    onChange={(e) => setTimetableConfig({...timetableConfig, endTime: e.target.value})}
                  />
                </div>
              </div>
  
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Subjects (Comma Separated)</label>
                <textarea 
                  rows={3}
                  placeholder="Data Structures, Algorithms, OS, Web Dev..."
                  className="w-full mt-1 p-2 bg-gray-50 border rounded-lg text-sm outline-none focus:border-blue-500"
                  value={timetableConfig.subjects}
                  onChange={(e) => setTimetableConfig({...timetableConfig, subjects: e.target.value})}
                />
              </div>
  
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Faculty List (Optional)</label>
                <input 
                  type="text" 
                  placeholder="Dr. Smith, Prof. Doe..."
                  className="w-full mt-1 p-2 bg-gray-50 border rounded-lg text-sm"
                  value={timetableConfig.faculty}
                  onChange={(e) => setTimetableConfig({...timetableConfig, faculty: e.target.value})}
                />
              </div>
  
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Labs / Practicals</label>
                <input 
                  type="text" 
                  placeholder="Physics Lab (2 hrs), Computer Lab..."
                  className="w-full mt-1 p-2 bg-gray-50 border rounded-lg text-sm"
                  value={timetableConfig.labs}
                  onChange={(e) => setTimetableConfig({...timetableConfig, labs: e.target.value})}
                />
              </div>
  
              <button 
                onClick={handleGenerateAiTimetable}
                disabled={isGenerating}
                className="w-full py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 mt-2"
                style={{ backgroundColor: currentTheme.primary }}
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin"/> : <Cpu className="w-5 h-5" />}
                {isGenerating ? "Generating..." : "Generate Timetable"}
              </button>
            </div>
          </div>
        </div>
  
        {/* RIGHT: Result Display */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
               <h3 className="font-bold text-gray-800">Generated Schedule</h3>
               {generatedTimetable && (
                 <button 
                   onClick={() => showToast("Download feature coming soon!")}
                   className="text-xs font-bold px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-50"
                 >
                   Export PDF
                 </button>
               )}
            </div>
  
            <div className="p-6 flex-1 overflow-x-auto custom-scrollbar">
              {!generatedTimetable ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                  <BarChart3 className="w-16 h-16 mb-4 text-gray-300" />
                  <p>Enter details and click Generate to see the AI magic.</p>
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="p-3 text-left text-xs font-bold text-gray-500 uppercase border-b bg-gray-50 sticky left-0 z-10">Day / Time</th>
                      {/* Assuming the first day has all time slots to generate headers. */}
                      {generatedTimetable[Object.keys(generatedTimetable)[0]]?.map((slot, i) => (
                        <th key={i} className="p-3 text-left text-xs font-bold text-gray-500 uppercase border-b bg-gray-50 min-w-[140px]">
                          {slot.time}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(generatedTimetable).map(([day, slots]) => (
                      <tr key={day} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-bold text-gray-700 border-r bg-gray-50 sticky left-0">{day}</td>
                        {slots.map((slot, idx) => (
                          <td key={idx} className="p-3 border-r last:border-r-0 relative group">
                            <div className={`p-3 rounded-xl border-l-4 shadow-sm h-full ${
                               slot.subject.toLowerCase().includes("break") || slot.subject.toLowerCase().includes("lunch") 
                               ? "bg-gray-100 border-gray-400 opacity-70" 
                               : slot.subject.toLowerCase().includes("lab") 
                               ? "bg-purple-50 border-purple-500" 
                               : "bg-green-50"
                            }`}
                            style={{ 
                              backgroundColor: !slot.subject.toLowerCase().includes("break") ? `${currentTheme.primary}10` : undefined,
                              borderColor: !slot.subject.toLowerCase().includes("break") ? currentTheme.primary : undefined
                            }}
                            >
                              <p className="font-bold text-sm text-gray-800">{slot.subject}</p>
                              {slot.faculty && (
                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                  <Users className="w-3 h-3"/> {slot.faculty}
                                </p>
                              )}
                              {slot.room && (
                                <span className="absolute top-2 right-2 text-[10px] font-mono bg-white px-1 rounded border">
                                  {slot.room}
                                </span>
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboardHome = () => (
    <div className="animate-in fade-in duration-500 pb-6">
      <SectionHeader title="Institute Overview" subtitle={`Welcome back, ${institute?.name || "Administrator"} (${institute?.code || "..."}).`} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Faculty" value={dashboardLoading ? "..." : dashboardStats?.facultyCount ?? "—"} icon={Users} trend="+4 this month" theme={currentTheme.secondary} />
        <StatCard title="Total Students" value={dashboardLoading ? "..." : dashboardStats?.studentCount ?? "—"} icon={Building2} trend="+12% vs last year" theme={currentTheme.secondary} />
        <StatCard title="NAAC Score" value={dashboardLoading ? "..." : dashboardStats?.naacScore ?? "Pending"} icon={CheckCircle} theme={currentTheme.secondary} />
        <StatCard title="AI Optimizations" value="85%" icon={Cpu} color="secondary" theme={currentTheme.secondary} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">Recent Notices</h3>
            <button onClick={() => setActiveTab("notices")} className="text-sm font-semibold hover:underline" style={{ color: currentTheme.secondary }}>View All</button>
          </div>
          <div className="space-y-4">
            {noticesLoading ? <div className="py-8 text-center">Loading...</div> : noticesList && noticesList.length > 0 ? noticesList.slice(0, 5).map((n) => (
              <div key={n._id || n.id} className="flex items-start p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="p-2 rounded-lg mr-4 bg-opacity-10" style={{ backgroundColor: `${currentTheme.primary}20` }}><Bell className="w-5 h-5" style={{ color: currentTheme.primary }} /></div>
                <div><h4 className="font-semibold text-gray-800">{n.title}</h4><p className="text-xs text-gray-500 mt-1">{new Date(n.date || n.createdAt).toLocaleDateString()} • {n.type || "General"}</p></div>
              </div>
            )) : <div className="py-6 text-sm text-gray-500">No notices yet.</div>}
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <button onClick={() => setActiveTab("faculty")} className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors group"><span className="flex items-center"><Plus className="w-4 h-4 mr-2" /> Add Faculty</span><ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: currentTheme.primary }} /></button>
            <button onClick={() => setActiveTab("requests")} className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors group"><span className="flex items-center"><Send className="w-4 h-4 mr-2" /> New Admin Request</span><ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: currentTheme.primary }} /></button>
            <button onClick={() => setActiveTab("ai-timetable")} className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors group"><span className="flex items-center"><Cpu className="w-4 h-4 mr-2" /> Generate Timetable</span><ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: currentTheme.primary }} /></button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNoticesSection = () => (
    <div className="pb-6">
      <SectionHeader title="Notices & Alerts" subtitle="Publish and manage notices" action={
        <button onClick={() => { 
          const t = prompt("Notice Title"); 
          const c = prompt("Notice Content"); 
          if (t && c) {
            postNotice({ title: t, content: c, type: "General", date: new Date().toISOString() }); 
          } else if (t === null || c === null) {
            // Cancelled
          } else {
            showToast("Title and content required", "error");
          }
        }} className="px-4 py-2 rounded-xl bg-blue-600 text-white">Publish Notice</button>
      } />
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        {noticesLoading ? <div className="py-8 text-center">Loading...</div> : noticesList?.length > 0 ? <div className="space-y-3">{noticesList.map((n) => <div key={n._id} className="p-3 rounded-lg bg-gray-50 border"><div className="font-bold">{n.title}</div><div className="text-sm">{n.content}</div></div>)}</div> : <div className="py-8 text-center text-gray-500">No notices.</div>}
      </div>
    </div>
  );

  const renderSettingsSection = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative pb-6">
      <SectionHeader title="Settings" subtitle="Manage your institute profile and appearance" />
      <div className="w-full flex justify-center">
        <div className="w-full max-w-3xl bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden" style={{ margin: "0 auto" }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-opacity-5 rounded-full -mr-16 -mt-16 pointer-events-none" style={{ backgroundColor: currentTheme.primary }} />
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Building2 className="w-5 h-5 text-gray-500" /> Institute Profile</h3>
              {!isEditingProfile && <button onClick={openProfileEditor} className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50">Edit Details</button>}
            </div>
            {isEditingProfile ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                  <div className="w-32 h-32 rounded-full bg-white shadow-md flex items-center justify-center overflow-hidden relative group">
                    {editForm.previewUrl ? <img src={editForm.previewUrl} className="w-full h-full object-cover" alt="Preview" /> : <Upload className="w-10 h-10 text-gray-300" />}
                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-medium text-xs">Change Logo <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} /></label>
                  </div>
                </div>
                <div><label className="block text-sm font-semibold mb-2">Name</label><input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full p-3 rounded-xl border" /></div>
                <div className="flex justify-end gap-3"><button onClick={() => setIsEditingProfile(false)} className="px-5 py-2.5 rounded-xl border">Cancel</button><button onClick={saveProfile} disabled={uploadLoading} className="px-6 py-2.5 rounded-xl text-white shadow-lg" style={{ backgroundColor: currentTheme.primary }}>Save Changes</button></div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-32 h-32 rounded-full bg-white shadow-lg p-1 border border-gray-100"><div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">{institute?.logo ? <img src={institute.logo} className="w-full h-full object-cover" alt="Logo" /> : <span className="text-3xl font-bold text-gray-300">IN</span>}</div></div>
                <div className="flex-1 text-center md:text-left space-y-4">
                  <h2 className="text-2xl font-bold text-gray-800">{institute?.name}</h2>
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start"><InfoBox label="Code" value={institute?.code} /><InfoBox label="Email" value={institute?.email} /></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // --- Main Render ---
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin" style={{ color: DEFAULT_THEME.primary }} /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    // 1. Root Container: Fixed Screen Dimensions (No Scroll)
    <div className="h-screen w-screen bg-white p-6 flex flex-col overflow-hidden relative">
      
      {/* CUSTOM SCROLLBAR STYLES (Dynamic based on Theme) */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: ${currentTheme.primary}60; /* 60% opacity for subtleness */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: ${currentTheme.primary};
        }
      `}</style>

      {/* Loading Overlay */}
      {isPageLoading && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
          <div className="rounded-2xl p-6 bg-white/90 backdrop-blur-md flex flex-col items-center gap-4"><Spinner size={28} color={currentTheme.primary || "#111"} /><div style={{ color: "#374151" }}>Working…</div></div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-[100] bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-10 fade-in">
          <div className={`p-2 rounded-full ${notification.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}</div>
          <div><h4 className="font-bold text-sm">Notification</h4><p className="text-sm text-gray-300">{notification.message}</p></div>
          <button onClick={() => setNotification(null)} className="ml-2 text-gray-500 hover:text-white">✕</button>
        </div>
      )}

      {/* Notification Center Modal (Bell Click) */}
      {showNotificationsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-600"/> Notifications
              </h3>
              <button onClick={() => setShowNotificationsModal(false)} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition">
                <X className="w-4 h-4"/>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white custom-scrollbar">
              {noticesList && noticesList.length > 0 ? (
                noticesList.map((notice, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-gray-800 text-sm">{notice.title}</h4>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                        {new Date(notice.date || notice.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{notice.content}</p>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <BellOff className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium">No recent notifications</p>
                  <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
                </div>
              )}
            </div>

            {/* Modal Footer (Clear All) */}
            {noticesList && noticesList.length > 0 && (
              <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <button 
                  onClick={clearNotifications}
                  className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Clear All Notifications
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. HEADER: Fixed Height (Shrink-0) */}
      <div className="shrink-0 flex items-start justify-between mb-6">
        <div className="rounded-2xl px-4 py-3 flex items-center gap-3 shadow-md" style={{ backgroundColor: currentTheme.primary, width: "220px" }}>
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white">{institute?.logo ? <img src={institute.logo} className="w-full h-full object-cover" alt="Logo" /> : <Building2 className="w-5 h-5 m-auto" />}</div>
          <p className="font-bold text-[25px] " style={{ color: currentTheme.textOnPrimary }}>{institute?.code}</p>
        </div>
        
        {/* BELL ICON BUTTON */}
        <button 
          onClick={() => setShowNotificationsModal(true)}
          className="rounded-2xl px-6 py-4 flex items-center gap-6 hover:bg-gray-50 transition-colors cursor-pointer relative" 
          style={{ backgroundColor: "transparent" }}
        >
          <Bell className="w-6 h-6" style={{ color: currentTheme.primary }} />
          {noticesList && noticesList.length > 0 && (
            <span className="absolute top-3 right-5 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
          )}
        </button>
      </div>

      {/* 3. MAIN ROW: Fills Remaining Height */}
      <div className="flex gap-6 flex-1 min-h-0">
        
        {/* SIDEBAR: Full Height, Internal Scroll */}
        <div className="rounded-3xl p-5 shadow-sm flex flex-col gap-3 h-full overflow-y-auto custom-scrollbar" style={{ backgroundColor: currentTheme.primary, width: "fit-content", minWidth: "220px" }}>
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "faculty", label: "Manage Faculty", icon: Users },
            { id: "dept-metrics", label: "Manage Department", icon: BarChart3 },
            { id: "data-tracking", label: "Manage Student", icon: ClipboardList },
            { id: "naac", label: "NAAC Monitoring", icon: CheckCircle },
            { id: "requests", label: "Requests to Admin", icon: Send },
            { id: "notices", label: "Notices & Alerts", icon: Bell },
            { id: "ai-timetable", label: "AI Timetable", icon: Cpu },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className="flex items-center px-4 py-3 rounded-xl text-left transition-all w-full" style={{ color: currentTheme.textOnPrimary, backgroundColor: activeTab === item.id ? currentTheme.textOnPrimary + "25" : "transparent" }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = activeTab === item.id ? currentTheme.textOnPrimary + "30" : currentTheme.textOnPrimary + "20"; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = activeTab === item.id ? currentTheme.textOnPrimary + "25" : "transparent"; }}>
              <item.icon className="w-5 h-5" /><span className="ml-3 text-sm">{item.label}</span>
            </button>
          ))}
          <div className="mt-auto">
            <button onClick={handleLogout} className="flex items-center px-4 py-3 rounded-xl mt-4 transition-all w-full font-semibold" style={{ backgroundColor: currentTheme.textOnPrimary + "20", color: currentTheme.textOnPrimary }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#E53935"; e.currentTarget.style.color = "#FFFFFF"; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = currentTheme.textOnPrimary + "20"; e.currentTarget.style.color = currentTheme.textOnPrimary; }}>
              <LogOut className="w-5 h-5" /><span className="ml-3 text-sm">Logout</span>
            </button>
          </div>
        </div>

        {/* RIGHT CONTENT: Full Height, Internal Scroll Logic */}
        <div className="flex-1 rounded-3xl bg-white p-7 shadow-[0_8px_50px_rgba(0,0,0,0.22)] h-full flex flex-col overflow-hidden relative">
          
          {/* Scroll wrapper for normal pages */}
          {activeTab === "naac" ? (
            // NaacPage handles its own scroll internally
            <NaacPage
              authFetch={authFetch}
              theme={currentTheme}
              institute={institute}
              pushToast={(msg) => showToast(msg.message, msg.type)}
            />
          ) : (
            // Other pages need this wrapper to scroll inside the card
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {activeTab === "dashboard" && renderDashboardHome()}
              {activeTab === "dept-metrics" && <DepartmentPage authFetch={authFetch} theme={currentTheme} institute={institute} pushToast={(msg) => showToast(msg.message, msg.type)} />}
              {activeTab === "faculty" && <FacultyPage authFetch={authFetch} theme={currentTheme} institute={institute} pushToast={(msg) => showToast(msg.message, msg.type)} />}
              {activeTab === "data-tracking" && <StudentPage authFetch={authFetch} theme={currentTheme} institute={institute} pushToast={(msg) => showToast(msg.message, msg.type)} />}
               {activeTab === "notices" && (
                <NoticePage 
                  authFetch={authFetch} 
                  theme={currentTheme} 
                  institute={institute} 
                  pushToast={(msg) => showToast(msg.message, msg.type)} 
                />
              )}
              {activeTab === "requests" && <RequestAdminPage authFetch={authFetch} theme={currentTheme} institute={institute} pushToast={(msg) => showToast(msg.message, msg.type)} />}
              {activeTab === "ai-timetable" && renderTimetableSection()}
              {activeTab === "settings" && renderSettingsSection()}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default InstituteDashboard;