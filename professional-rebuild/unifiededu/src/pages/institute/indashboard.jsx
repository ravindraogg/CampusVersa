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
} from "lucide-react";
import DepartmentPage from "./DepartmentPage";
import FacultyPage from "./FacultyPage";
import StudentPage from "./StudentPage";

const API_URL = "http://localhost:5000";

// --- Default Theme ---
const DEFAULT_THEME = {
  primary: "#66BB6A", // Default Green
  secondary: "#7D5AFE", // Purple
  dark: "#374232", // Dark Green/Black
  bg: "#F9FAFB", // Gray-50
  white: "#FFFFFF",
  textMain: "#1F2937",
  textMuted: "#6B7280",
};

// --- Small helpers ---
const authFetch = async (path, opts = {}) => {
  const token = localStorage.getItem("instituteToken");
  const headers = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...opts, headers });
  // Auto handle unauthorized -> redirect to auth
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem("instituteToken");
    window.location.href = "/in/auth";
    throw new Error("Unauthorized");
  }
  return res;
};

// --- Helper Components ---
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

  // --- Data State ---
  const [institute, setInstitute] = useState(null);
  const [loading, setLoading] = useState(true); // Initial load
  const [isPageLoading, setIsPageLoading] = useState(false); // Glass overlay state
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

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    logoBase64: null,
    previewUrl: null,
  });

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

  // --- Update Browser Tab (Title & Favicon) ---
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

  // --- Tab Management & Lazy Loading ---
  useEffect(() => {
    if (activeTab === "dashboard") loadDashboardStats();
    if (activeTab === "faculty" && facultyList === null) loadFaculty();
    if (activeTab === "data-tracking" && studentsList === null) loadStudents();
    if (activeTab === "notices" && noticesList === null) loadNotices();
    if (activeTab === "requests" && requestsList === null) loadRequests();
    if (activeTab === "dept-metrics" && metricsList === null) loadMetrics();
    if (activeTab === "naac" && naacData === null) loadNAAC();
    if (activeTab === "ai-timetable" && timetables === null) loadTimetables();
  }, [activeTab]);

  // -------------------------
  // Loaders and actions
  // -------------------------
  const loadDashboardStats = async () => {
    setDashboardLoading(true);
    try {
      const res = await authFetch("/institute/dashboard-stats", {
        method: "GET",
      });
      const data = await res.json();
      setDashboardStats(data);
    } catch (err) {
      console.error("dashboard-stats", err);
    } finally {
      setDashboardLoading(false);
    }
  };

  const loadFaculty = async () => {
    setFacultyLoading(true);
    try {
      const res = await authFetch("/institute/faculty", { method: "GET" });
      const data = await res.json();
      setFacultyList(data);
    } catch (err) {
      setFacultyList([]);
    } finally {
      setFacultyLoading(false);
    }
  };

  const loadStudents = async () => {
    setStudentsLoading(true);
    try {
      const res = await authFetch("/institute/students", { method: "GET" });
      const data = await res.json();
      setStudentsList(data);
    } catch (err) {
      setStudentsList([]);
    } finally {
      setStudentsLoading(false);
    }
  };

  const loadNotices = async () => {
    setNoticesLoading(true);
    try {
      const res = await authFetch("/institute/notices", { method: "GET" });
      const data = await res.json();
      setNoticesList(data);
    } catch (err) {
      setNoticesList([]);
    } finally {
      setNoticesLoading(false);
    }
  };

  const postNotice = async (payload) => {
    setIsPageLoading(true);
    try {
      const res = await authFetch("/institute/notices/add", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Notice published.");
        loadNotices();
      } else {
        alert(data.message || "Failed to post notice");
      }
    } catch (err) {
      console.error("postNotice", err);
      alert("Server error while posting notice");
    } finally {
      setIsPageLoading(false);
    }
  };

  const loadRequests = async () => {
    setRequestsLoading(true);
    try {
      const res = await authFetch("/institute/requests", { method: "GET" });
      const data = await res.json();
      setRequestsList(data);
    } catch (err) {
      setRequestsList([]);
    } finally {
      setRequestsLoading(false);
    }
  };

  const postRequest = async (payload) => {
    setIsPageLoading(true);
    try {
      const res = await authFetch("/institute/requests/add", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Request sent.");
        loadRequests();
      } else {
        alert(data.message || "Failed to send request");
      }
    } catch (err) {
      console.error("postRequest", err);
      alert("Server error while sending request");
    } finally {
      setIsPageLoading(false);
    }
  };
const loadHybridInstitute = async () => {
  try {
    const res = await authFetch("/institute/hybrid", { method: "GET" });
    const data = await res.json();
    setInstitute(data); // replace your current institute setter
  } catch (err) {
    console.error(err);
  }
};

  const loadMetrics = async () => {
    setMetricsLoading(true);
    try {
      const res = await authFetch("/institute/metrics", { method: "GET" });
      const data = await res.json();
      setMetricsList(data);
    } catch (err) {
      setMetricsList([]);
    } finally {
      setMetricsLoading(false);
    }
  };

  const updateMetric = async (payload) => {
    setIsPageLoading(true);
    try {
      const res = await authFetch("/institute/metrics/update", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Metric updated.");
        loadMetrics();
      } else {
        alert(data.message || "Metric update failed");
      }
    } catch (err) {
      alert("Server error while updating metric");
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
    } catch (err) {
      setNaacData(null);
    } finally {
      setNaacLoading(false);
    }
  };

  const updateNAAC = async (payload) => {
    setIsPageLoading(true);
    try {
      const res = await authFetch("/institute/naac/update", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        loadNAAC();
      } else {
        alert(data.message || "NAAC update failed");
      }
    } catch (err) {
      alert("Server error while updating NAAC");
    } finally {
      setIsPageLoading(false);
    }
  };

  const generateTimetable = async (payload) => {
    setIsPageLoading(true);
    try {
      const res = await authFetch("/institute/timetable/generate", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Timetable generated.");
        loadTimetables();
      } else {
        alert(data.message || "Timetable generation failed");
      }
    } catch (err) {
      alert("Server error while generating timetable");
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
    } catch (err) {
      setTimetables([]);
    } finally {
      setTimetablesLoading(false);
    }
  };

  // --- Profile Logic ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm((prev) => ({
          ...prev,
          logoBase64: reader.result,
          previewUrl: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = async () => {
    setUploadLoading(true);
    try {
      const payload = {
        name: editForm.name || institute.name,
        logoBase64: editForm.logoBase64,
      };

      const response = await authFetch("/institute/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        alert(data.message || "Failed to update profile");
        setUploadLoading(false);
        return;
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
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("saveProfile error:", error);
      alert("Server error during update");
    }
    setUploadLoading(false);
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

  // --- RENDER SETTINGS SECTION (Fixed: Now defined!) ---
  const renderSettingsSection = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader
        title="Settings"
        subtitle="Manage your institute profile and appearance"
      />

<div className="w-full flex justify-center">
  <div
    className="w-full max-w-3xl bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden"
    style={{ margin: "0 auto" }}
  >

        {/* Background blob decoration */}
        <div
          className="absolute top-0 right-0 w-64 h-64 bg-opacity-5 rounded-full -mr-16 -mt-16 pointer-events-none"
          style={{ backgroundColor: currentTheme.primary }}
        />

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-500" />
              Institute Profile
            </h3>
            {!isEditingProfile && (
              <button
                onClick={openProfileEditor}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Edit Details
              </button>
            )}
          </div>

          {isEditingProfile ? (
            <div className="space-y-6">
              {/* Logo Upload */}
              <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                <div className="w-32 h-32 rounded-full bg-white shadow-md flex items-center justify-center overflow-hidden relative group">
                  {editForm.previewUrl ? (
                    <img
                      src={editForm.previewUrl}
                      className="w-full h-full object-cover"
                      alt="Preview"
                    />
                  ) : (
                    <Upload className="w-10 h-10 text-gray-300" />
                  )}
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-medium text-xs">
                    Change Logo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  Click image to upload new logo
                </p>
              </div>

              {/* Name Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Institute Name
                </label>
                <input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                  style={{ "--tw-ring-color": currentTheme.primary }}
                  placeholder="Enter institute name"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="px-5 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveProfile}
                  disabled={uploadLoading}
                  className="px-6 py-2.5 rounded-xl font-semibold text-white shadow-lg flex items-center gap-2"
                  style={{ backgroundColor: currentTheme.primary }}
                >
                  {uploadLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Display Logo */}
              <div className="w-32 h-32 rounded-full bg-white shadow-lg p-1 border border-gray-100 flex-shrink-0">
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-50 flex items-center justify-center">
                  {institute?.logo ? (
                    <img
                      src={institute.logo}
                      className="w-full h-full object-cover"
                      alt="Logo"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-gray-300">
                      {institute?.code?.substring(0, 2) || "IN"}
                    </span>
                  )}
                </div>
              </div>

              {/* Display Info */}
              <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Institute Name
                  </p>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {institute?.name}
                  </h2>
                </div>

                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <InfoBox label="Code" value={institute?.code} />
                  <InfoBox label="Est. ID" value={institute?.IID || "N/A"} />
                  <InfoBox label="Email" value={institute?.email} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
      </div> 
  );

  // -------------------------
  // Render Sections (plugging real data into existing UI)
  // -------------------------
  const renderDashboardHome = () => (
    <div className="animate-in fade-in duration-500">
      <SectionHeader
        title="Institute Overview"
        subtitle={`Welcome back, ${institute?.name || "Administrator"} (${
          institute?.code || "..."
        }).`}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Faculty"
          value={
            dashboardLoading ? "..." : dashboardStats?.facultyCount ?? "—"
          }
          icon={Users}
          trend="+4 this month"
          theme={currentTheme.secondary}
        />
        <StatCard
          title="Total Students"
          value={
            dashboardLoading ? "..." : dashboardStats?.studentCount ?? "—"
          }
          icon={Building2}
          trend="+12% vs last year"
          theme={currentTheme.secondary}
        />
        <StatCard
          title="NAAC Score"
          value={dashboardLoading ? "..." : dashboardStats?.naacScore ?? "Pending"}
          icon={CheckCircle}
          theme={currentTheme.secondary}
        />
        <StatCard
          title="AI Optimizations"
          value="85%"
          icon={Cpu}
          color="secondary"
          theme={currentTheme.secondary}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Notices */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">Recent Notices</h3>
            <button
              onClick={() => {
                setActiveTab("notices");
              }}
              className="text-sm font-semibold hover:underline"
              style={{ color: currentTheme.secondary }}
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {noticesLoading ? (
              <div className="py-8 text-center">Loading...</div>
            ) : noticesList && noticesList.length > 0 ? (
              noticesList.slice(0, 5).map((notice) => (
                <div
                  key={notice._id || notice.id}
                  className="flex items-start p-4 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <div
                    className="p-2 rounded-lg mr-4 bg-opacity-10"
                    style={{ backgroundColor: `${currentTheme.primary}20` }}
                  >
                    <Bell
                      className="w-5 h-5"
                      style={{ color: currentTheme.primary }}
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {notice.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(
                        notice.date || notice.createdAt
                      ).toLocaleDateString()}{" "}
                      • {notice.type || "General"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-sm text-gray-500">No notices yet.</div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => setActiveTab("faculty")}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors group"
            >
              <span className="flex items-center">
                <Plus className="w-4 h-4 mr-2" /> Add Faculty
              </span>
              <ArrowRight
                className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: currentTheme.primary }}
              />
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors group"
            >
              <span className="flex items-center">
                <Send className="w-4 h-4 mr-2" /> New Admin Request
              </span>
              <ArrowRight
                className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: currentTheme.primary }}
              />
            </button>
            <button
              onClick={() => setActiveTab("ai-timetable")}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors group"
            >
              <span className="flex items-center">
                <Cpu className="w-4 h-4 mr-2" /> Generate Timetable
              </span>
              <ArrowRight
                className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: currentTheme.primary }}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // --- Notices Section ---
  const renderNoticesSection = () => (
    <div>
      <SectionHeader
        title="Notices & Alerts"
        subtitle="Publish and manage notices"
        action={
          <button
            onClick={() => {
              const title = prompt("Notice Title");
              const content = prompt("Notice Content");
              if (title && content)
                postNotice({
                  title,
                  content,
                  type: "General",
                  date: new Date().toISOString(),
                });
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white"
              style={{
    backgroundColor: currentTheme.primary,
    color: "#ffffff",
  }}
          >
            Publish Notice
          </button>
        }
      />
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        {noticesLoading ? (
          <div className="py-8 text-center">Loading...</div>
        ) : noticesList && noticesList.length > 0 ? (
          <div className="space-y-3">
            {noticesList.map((n) => (
              <div
                key={n._id || n.id}
                className="p-3 rounded-lg bg-gray-50 border border-gray-100"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-gray-800">{n.title}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(n.date || n.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mt-2">{n.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">No notices.</div>
        )}
      </div>
    </div>
  );

  // --- Requests Section ---
  const renderRequestsSection = () => (
    <div>
      <SectionHeader
        title="Requests to Admin"
        subtitle="Track requests sent to platform admin"
        action={
          <button
  onClick={() => {
    const subject = prompt("Request Subject");
    const notes = prompt("Notes");
    if (subject) postRequest({ subject, notes, type: "General" });
  }}
  className="px-4 py-2 rounded-xl font-semibold transition"
  style={{
    backgroundColor: currentTheme.primary,
    color: "#ffffff",
  }}
>
  New Request
</button>

        }
      />
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        {requestsLoading ? (
          <div className="py-8 text-center">Loading...</div>
        ) : requestsList && requestsList.length > 0 ? (
          <div className="space-y-3">
            {requestsList.map((r) => (
              <div
                key={r._id || r.id}
                className="p-3 rounded-lg bg-gray-50 border border-gray-100"
              >
                <div className="flex justify-between">
                  <div>
                    <div className="font-semibold text-gray-800">
                      {r.subject || r.requestedCode || r.type}
                    </div>
                    <div className="text-xs text-gray-500">
                      {r.status} • {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mt-2">
                  {r.notes || r.reason || ""}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            No requests found.
          </div>
        )}
      </div>
    </div>
  );

  // --- Metrics Section ---
  const renderMetricsSection = () => (
    <div>
      <SectionHeader
        title="Department Metrics"
        subtitle="NIRF-style metrics"
        action={
          <button
            onClick={() => {
              const department = prompt("Department");
              const year = prompt("Year");
              const publications = prompt("Publications (number)");
              const placements = prompt("Placements (number)");
              if (department)
                updateMetric({
                  department,
                  year,
                  publications: Number(publications || 0),
                  placements: Number(placements || 0),
                });
            }}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white"
          >
            Update Metric
          </button>
        }
      />
      <div className="bg-white p-4 rounded-2xl border border-gray-100">
        {metricsLoading ? (
          <div className="py-8 text-center">Loading...</div>
        ) : metricsList && metricsList.length > 0 ? (
          <div className="space-y-3">
            {metricsList.map((m) => (
              <div
                key={m._id || `${m.department}-${m.year}`}
                className="p-3 rounded-lg bg-gray-50 border border-gray-100"
              >
                <div className="flex justify-between">
                  <div>
                    <div className="font-semibold text-gray-800">
                      {m.department} • {m.year}
                    </div>
                    <div className="text-xs text-gray-500">
                      Publications: {m.publications || 0} • Placements:{" "}
                      {m.placements || 0}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">No metrics yet.</div>
        )}
      </div>
    </div>
  );

  // --- NAAC Section ---
  const renderNAACSection = () => (
    <div>
      <SectionHeader
        title="NAAC Monitoring"
        subtitle="Track criteria & suggestions"
        action={
          <button
            onClick={() => {
              loadNAAC();
            }}
            className="px-4 py-2 rounded-xl" style={{
    backgroundColor: currentTheme.primary,
    color: "#ffffff",
  }}
          >
            Refresh Suggestions
          </button>
        }
      />
      <div className="bg-white p-4 rounded-2xl border border-gray-100">
        {naacLoading ? (
          <div className="py-8 text-center">Loading...</div>
        ) : naacData && naacData.criteria ? (
          <div className="space-y-3">
            {naacData.criteria.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-lg bg-gray-50 border border-gray-100"
              >
                <div className="flex justify-between">
                  <div>
                    <div className="font-semibold text-gray-800">{c.name}</div>
                    <div className="text-xs text-gray-500">
                      Status: {c.status || "Pending"}
                    </div>
                  </div>
                  <div className="text-right">
                    <button
                      onClick={() =>
                        updateNAAC({
                          criteriaId: c.id,
                          status:
                            c.status === "Completed" ? "Pending" : "Completed",
                        })
                      }
                      className="px-3 py-1 rounded-xl bg-green-600 text-white text-sm"
                    >
                      Toggle
                    </button>
                  </div>
                </div>
                {c.suggestion && (
                  <p className="text-sm text-gray-700 mt-2 italic">
                    {c.suggestion}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            NAAC tracker not initialized.
          </div>
        )}
      </div>
    </div>
  );

  // --- Timetable Section ---
  const renderTimetableSection = () => (
    <div>
      <SectionHeader
        title="AI Timetable"
        subtitle="Generate or view saved timetables"
        action={
          <button
            onClick={() => {
              const department = prompt("Department");
              const semester = prompt("Semester");
              const subjectsInput = prompt("Subjects (comma separated)");
              if (!department || !semester || !subjectsInput) return;
              const subjects = subjectsInput
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
              generateTimetable({ department, semester, subjects });
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white"
            style={{
    backgroundColor: currentTheme.primary,
    color: "#ffffff",
  }}
          >
            Generate Timetable
          </button>
        }
      />
      <div className="bg-white p-4 rounded-2xl border border-gray-100">
        {timetablesLoading ? (
          <div className="py-8 text-center">Loading...</div>
        ) : timetables && timetables.length > 0 ? (
          <div className="space-y-4">
            {timetables.map((tt) => (
              <div
                key={tt._id || tt.createdAt}
                className="p-3 rounded-lg bg-gray-50 border border-gray-100"
              >
                <div className="font-semibold text-gray-800">
                  Dept: {tt.department} — Semester: {tt.semester}
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  Saved: {new Date(tt.createdAt).toLocaleString()}
                </div>
                <pre className="text-sm bg-white p-3 rounded-md overflow-auto">
                  {JSON.stringify(tt.scheduleData, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            No timetables generated yet.
          </div>
        )}
      </div>
    </div>
  );

  // --- Main layout render ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2
            className="w-10 h-10 animate-spin mx-auto mb-4"
            style={{ color: DEFAULT_THEME.primary }}
          />
          <p className="text-gray-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => (window.location.href = "/institute/auth")}
            className="px-6 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 relative">
      {/* --- FULL PAGE LOADING OVERLAY --- */}
      {isPageLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="rounded-2xl p-6 bg-white/90 backdrop-blur-md flex flex-col items-center gap-4">
            <Spinner size={28} color={currentTheme.primary || "#111"} />
            <div style={{ color: "#374151" }}>Working…</div>
          </div>
        </div>
      )}

      {/* TOP ROW */}
      <div className="flex items-start justify-between mb-6">
        {/* TOP LEFT SMALL CARD */}
        <div
          className="rounded-2xl px-4 py-3 flex items-center gap-3 shadow-[0_0_14px_rgba(0,0,0,0.15)]"
          style={{
            backgroundColor: currentTheme.primary,
            width: "220px",
            minWidth: "220px",
          }}
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden">
            {institute?.logo ? (
              <img
                src={institute.logo}
                className="w-full h-full object-cover"
                alt="Logo"
              />
            ) : (
              <Building2 className="w-5 h-5 m-auto" />
            )}
          </div>

          <p
            className="font-bold text-[25px] "
            style={{ color: currentTheme.textOnPrimary }}
          >
            {institute?.code}
          </p>
        </div>

        {/* TOP RIGHT SMALL CARD */}
        <div
          className="rounded-2xl px-6 py-4 flex items-center gap-6"
          style={{
            backgroundColor: "transparent",
            maxWidth: "fit-content",
          }}
        >
          {/* Notification Icon */}
          <Bell
            className="w-6 h-6"
            style={{ color: currentTheme.primary }}
          />
        </div>
      </div>

      {/* MAIN ROW */}
      <div className="flex gap-6">
        {/* LEFT NAV COLUMN */}
        <div
          className="rounded-3xl p-5 shadow-[0_0_18px_rgba(0,0,0,0.12)] flex flex-col gap-3"
          style={{
            backgroundColor: currentTheme.primary,
            width: "fit-content",
            minWidth: "220px",
            height: "calc(100vh - 160px)",
          }}
        >
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
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex items-center px-4 py-3 rounded-xl text-left transition-all w-full"
              style={{
                color: currentTheme.textOnPrimary,
                backgroundColor:
                  activeTab === item.id
                    ? currentTheme.textOnPrimary + "25"
                    : "transparent",
                boxShadow:
                  activeTab === item.id
                    ? "0 0 12px rgba(255,255,255,0.25)"
                    : "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  activeTab === item.id
                    ? currentTheme.textOnPrimary + "30"
                    : currentTheme.textOnPrimary + "20";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  activeTab === item.id
                    ? currentTheme.textOnPrimary + "25"
                    : "transparent";
              }}
            >
              <item.icon className="w-5 h-5" />
              <span className="ml-3 text-sm">{item.label}</span>
            </button>
          ))}

          {/* LOGOUT BUTTON */}
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-3 rounded-xl mt-4 transition-all w-full font-semibold"
            style={{
              backgroundColor: currentTheme.textOnPrimary + "20",
              color: currentTheme.textOnPrimary,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#E53935";
              e.currentTarget.style.color = "#FFFFFF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                currentTheme.textOnPrimary + "20";
              e.currentTarget.style.color = currentTheme.textOnPrimary;
            }}
          >
            <LogOut className="w-5 h-5" />
            <span className="ml-3 text-sm">Logout</span>
          </button>
        </div>

        {/* RIGHT CONTENT AREA */}
        <div className="flex-1">
          <div className="rounded-3xl bg-white p-7 h-full shadow-[0_8px_50px_rgba(0,0,0,0.22)]">
            {/* Dynamic Content Inside Right Big Card */}
            {activeTab === "dashboard" && renderDashboardHome()}

            {activeTab === "dept-metrics" && (
              <DepartmentPage
                authFetch={authFetch}
                theme={currentTheme}
                institute={institute}
                pushToast={(msg) => alert(msg.message)}
              />
            )}

            {activeTab === "faculty" && (
              <FacultyPage
                authFetch={authFetch}
                theme={currentTheme}
                institute={institute}
                pushToast={(msg) => alert(msg.message)}
              />
            )}

            {activeTab === "data-tracking" && (
              <StudentPage
                authFetch={authFetch}
                theme={currentTheme}
                institute={institute}
                pushToast={(msg) => alert(msg.message)}
              />
            )}

            {activeTab === "notices" && renderNoticesSection()}
            {activeTab === "requests" && renderRequestsSection()}
            {activeTab === "naac" && renderNAACSection()}
            {activeTab === "ai-timetable" && renderTimetableSection()}
            {activeTab === "settings" && renderSettingsSection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstituteDashboard;