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
  Upload,
  X,
  Trash2,
  BellOff,
  Eye, 
  EyeOff,
  Shield,
  BookOpen,
  Lock,
  ShieldCheck,
  Search,
  Save,
  UserPlus,
  UserMinus,
  MapPin,
  Globe,
  Phone,
  UserCheck,
  PieChart
} from "lucide-react";

// Sub-page Components
import DepartmentPage from "./DepartmentPage";
import FacultyPage from "./FacultyPage";
import StudentPage from "./StudentPage";
import RequestAdminPage from "./RequestAdminPage";
import NIRFPage from "./NIRFPage"; 
import NoticePage from "./NoticePage"; 
import TimetableManager from "./Timetable"; 
import CoursesPage from "./CoursesPage";

const API_URL = import.meta.env.VITE_BACK_URI;

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

// --- MOCK DATA DEFINITIONS ---
const STUDENT_MOCK_DATA = [
    { label: 'CSE', value: 520 },
    { label: 'ECE', value: 380 },
    { label: 'EEE', value: 240 },
    { label: 'MECH', value: 310 },
    { label: 'CIVIL', value: 190 },
    { label: 'MBA', value: 120 }
];

const FACULTY_MOCK_DATA = [
    { label: 'CSE', value: 48 },
    { label: 'ECE', value: 35 },
    { label: 'EEE', value: 22 },
    { label: 'MECH', value: 28 },
    { label: 'CIVIL', value: 18 },
    { label: 'MBA', value: 10 }
];

// --- Helpers ---
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

// --- UPDATED Simple Chart Component ---
const SimpleBarChart = ({ data = [], color, height = "150px" }) => {
    // 1. Calculate max value safely
    const values = data.map(d => d.value);
    const maxVal = values.length > 0 ? Math.max(...values) : 100;
    
    // 2. Fallback color if prop is missing
    const barColor = color || "#3B82F6"; 

    return (
      <div className="w-full">
        <div className="flex items-end gap-2 sm:gap-4 w-full" style={{ height }}>
            {data.map((item, i) => {
                // Prevent division by zero
                const heightPct = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
                
                return (
                    <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                        {/* Tooltip on Hover */}
                        <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] py-1 px-2 rounded z-10 whitespace-nowrap pointer-events-none">
                            <span className="font-bold">{item.label}</span>: {item.value}
                        </div>
                        
                        {/* Bar Track (Light Background) */}
                        <div className="w-full bg-gray-100 rounded-t-md relative overflow-hidden flex items-end h-full">
                             {/* The Actual Colored Bar */}
                             <div 
                                style={{ height: `${heightPct}%`, backgroundColor: barColor }} 
                                className="w-full rounded-t-md transition-all duration-500 ease-out hover:brightness-110"
                             ></div>
                        </div>
                    </div>
                );
            })}
        </div>
        {/* X-Axis Labels */}
        <div className="flex items-start gap-2 sm:gap-4 w-full mt-3 border-t border-gray-100 pt-2">
            {data.map((item, i) => (
                <div key={i} className="flex-1 text-center">
                    <p className="text-[10px] font-bold text-gray-500 uppercase truncate" title={item.label}>{item.label}</p>
                </div>
            ))}
        </div>
      </div>
    );
};

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
  const [notification, setNotification] = useState(null); 
  const [showNotificationsModal, setShowNotificationsModal] = useState(false); 
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
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
  const [noticesList, setNoticesList] = useState(null);
  const [noticesLoading, setNoticesLoading] = useState(false);
  
  // --- SETTINGS STATE ---
  const [settingsTab, setSettingsTab] = useState("profile"); // profile | security | access
  const [passForm, setPassForm] = useState({ current: "", new: "", confirm: "" });
  
  // Access Control State
  const [accessUsers, setAccessUsers] = useState([]); // Authorized Admins
  const [availableFaculty, setAvailableFaculty] = useState([]); // All other faculty
  const [facultySearch, setFacultySearch] = useState("");
  
  const [editForm, setEditForm] = useState({
    name: "",
    website: "",
    phone: "",
    address: "",
    state: "",
    pincode: "",
    naacGrade: "", 
    logoBase64: null,
    previewUrl: null,
  });

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchInstituteData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/institute/me", { method: "GET" });
      const data = await res.json();
      setInstitute(data);
      
      setEditForm({
        name: data.name || "",
        website: data.website || "",
        phone: data.phone || "",
        address: data.address || "",
        state: data.state || "",
        pincode: data.pincode || "",
        naacGrade: data.accreditation && data.accreditation.length > 0 ? data.accreditation[0].grade : "",
        logoBase64: null,
        previewUrl: data.logo || null,
      });

      if (data.themeColorPrimary) {
        setCurrentTheme((prev) => ({
          ...prev,
          primary: data.themeColorPrimary,
          dark: data.themeColorPrimary,
          textOnPrimary: data.themeColorSecondary || "#FFFFFF",
        }));
      }

      await loadDashboardStats();
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

  useEffect(() => {
    if (activeTab === "dashboard") loadDashboardStats();
    if (activeTab === "notices" && noticesList === null) loadNotices();
    if (activeTab === "settings" && settingsTab === "access") loadAccessControlData();
  }, [activeTab, settingsTab]);
   
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

  const loadDashboardStats = async () => {
    setDashboardLoading(true);
    try {
      const res = await authFetch("/institute/dashboard-stats", { method: "GET" });
      const data = await res.json();
      setDashboardStats(data);
    } catch (err) { console.error("dashboard-stats", err); } finally { setDashboardLoading(false); }
  };
 
  const loadNotices = async () => {
    setNoticesLoading(true);
    try {
      const res = await authFetch("/institute/notices", { method: "GET" });
      const data = await res.json();
      setNoticesList(data);
    } catch (err) { setNoticesList([]); } finally { setNoticesLoading(false); }
  };
  
  // --- SETTINGS ACTIONS ---

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


  const saveProfileFull = async () => {
    setIsPageLoading(true);
    try {
      const accreditationData = editForm.naacGrade 
        ? [{ type: 'NAAC', grade: editForm.naacGrade, status: true }] 
        : [];

      const payload = {
        name: editForm.name,
        website: editForm.website,
        phone: editForm.phone,
        address: editForm.address,
        state: editForm.state,
        pincode: editForm.pincode,
        accreditation: accreditationData,
        logoBase64: editForm.logoBase64 
      };

      const response = await authFetch("/institute/update-profile", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setInstitute(data.data);
        if (data.data.themeColorPrimary) {
          setCurrentTheme((prev) => ({
            ...prev,
            primary: data.data.themeColorPrimary,
            dark: data.data.themeColorPrimary,
            textOnPrimary: data.data.themeColorSecondary || "#FFFFFF",
          }));
        }
        showToast("Profile & Theme updated!", "success");
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      showToast(error.message || "Update failed", "error");
    } finally {
      setIsPageLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passForm.new !== passForm.confirm) {
      showToast("New passwords do not match", "error");
      return;
    }
    setIsPageLoading(true);
    try {
      const res = await authFetch("/institute/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword: passForm.current, newPassword: passForm.new })
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Password changed successfully", "success");
        setPassForm({ current: "", new: "", confirm: "" });
      } else {
        showToast(data.message || "Failed to change password", "error");
      }
    } catch (err) {
      showToast("Server error", "error");
    } finally {
      setIsPageLoading(false);
    }
  };

  // --- ACCESS CONTROL ACTIONS ---
  const loadAccessControlData = async () => {
    try {
        const [authRes, allRes] = await Promise.all([
            authFetch("/institute/access-control/users"),
            authFetch("/institute/faculty")
        ]);

        if (authRes.ok && allRes.ok) {
            const authorizedData = await authRes.json();
            const allFacultyData = await allRes.json();
            
            setAccessUsers(authorizedData);
            const authorizedIds = new Set(authorizedData.map(u => u._id));
            const available = allFacultyData.filter(f => !authorizedIds.has(f._id));
            setAvailableFaculty(available);
        }
    } catch(e) { 
        console.error("Failed to load access control data", e); 
        showToast("Failed to load faculty list", "error");
    }
  };

  const grantAccess = async (facultyId) => {
    setIsPageLoading(true);
    try {
      const res = await authFetch("/institute/access-control/grant", {
        method: "POST",
        body: JSON.stringify({ facultyId })
      });
      if(res.ok) {
        showToast("Access granted successfully", "success");
        loadAccessControlData(); 
        setFacultySearch("");
      }
    } catch(err) { showToast("Failed to grant access", "error"); }
    finally { setIsPageLoading(false); }
  };

  const revokeAccess = async (facultyId) => {
    if(!window.confirm("Are you sure you want to revoke access?")) return;
    setIsPageLoading(true);
    try {
      const res = await authFetch("/institute/access-control/revoke", {
        method: "POST",
        body: JSON.stringify({ facultyId })
      });
      if(res.ok) {
        showToast("Access revoked", "success");
        loadAccessControlData(); 
      }
    } catch(err) { showToast("Failed to revoke access", "error"); }
    finally { setIsPageLoading(false); }
  };

  const filteredAvailableFaculty = availableFaculty.filter(f => 
    f.name.toLowerCase().includes(facultySearch.toLowerCase()) || 
    f.email.toLowerCase().includes(facultySearch.toLowerCase()) ||
    (f.department && f.department.toLowerCase().includes(facultySearch.toLowerCase()))
  );

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("instituteToken");
    window.location.href = "/in/auth";
  };

  const clearNotifications = () => {
    setNoticesList([]);
    showToast("Notifications cleared locally");
  };

  // --- RENDER SECTIONS ---

  const renderDashboardHome = () => {
    return (
      <div className="animate-in fade-in duration-500 pb-6">
        <SectionHeader 
          title="Institute Overview" 
          subtitle={`Welcome back, ${institute?.name || "Administrator"} (${institute?.code || "..."}).`} 
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Faculty" 
            value={dashboardLoading ? "..." : dashboardStats?.facultyCount ?? "—"} 
            icon={Users} 
            theme={currentTheme.secondary} 
          />
          
          <StatCard 
            title="Total Students" 
            value={dashboardLoading ? "..." : dashboardStats?.studentCount ?? "—"} 
            icon={Building2} 
            theme={currentTheme.secondary} 
          />
          
          <StatCard 
            title="NIRF Status" 
            value="NOT AFFILIATED" 
            icon={BarChart3} 
            color="secondary"
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

        {/* --- ANALYTICS SECTION WITH GRAPHS (FIXED COLORS) --- */}
        <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-gray-400"/> Analytic Overview
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Student Comparison Graph */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h4 className="font-bold text-gray-800">Student Distribution</h4>
                            <p className="text-xs text-gray-500">Total students per department</p>
                        </div>
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                            <Users className="w-5 h-5"/>
                        </div>
                    </div>
                    {/* Passed explicit color fallback if theme not ready */}
                    <SimpleBarChart 
                        data={STUDENT_MOCK_DATA} 
                        color={currentTheme.secondary || "#7D5AFE"} 
                        height="180px"
                    />
                </div>

                {/* Faculty Comparison Graph */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h4 className="font-bold text-gray-800">Faculty Distribution</h4>
                            <p className="text-xs text-gray-500">Teaching staff per department</p>
                        </div>
                        <div className="p-2 rounded-lg bg-green-50 text-green-600">
                            <Building2 className="w-5 h-5"/>
                        </div>
                    </div>
                    {/* Passed explicit color fallback if theme not ready */}
                    <SimpleBarChart 
                        data={FACULTY_MOCK_DATA} 
                        color={currentTheme.primary || "#66BB6A"} 
                        height="180px"
                    />
                </div>
            </div>
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
  };
  
  const renderSettingsSection = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-6 relative">
      <SectionHeader title="Institute Settings" subtitle="Manage profile, security, and team access" />
      
      <div className="flex gap-2 mb-6 border-b border-gray-100 pb-1 overflow-x-auto">
        {[
          { id: 'profile', label: 'General Profile', icon: Building2 },
          { id: 'security', label: 'Security', icon: Lock },
          { id: 'access', label: 'Team Access', icon: ShieldCheck },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSettingsTab(tab.id)}
            className={`px-4 py-2.5 rounded-t-xl flex items-center gap-2 text-sm font-medium transition-colors whitespace-nowrap ${
              settingsTab === tab.id 
                ? 'bg-white border-b-2 text-gray-800' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            style={{ borderColor: settingsTab === tab.id ? currentTheme.primary : 'transparent' }}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-4xl">
        
        {settingsTab === 'profile' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="shrink-0 group relative self-center md:self-start">
                 <div className="w-32 h-32 rounded-full bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                    {editForm.previewUrl ? (
                      <img src={editForm.previewUrl} className="w-full h-full object-cover" alt="Logo" />
                    ) : (
                      <Upload className="w-8 h-8 text-gray-300" />
                    )}
                 </div>
                 <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                    Change Logo
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                 </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1 w-full">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Institute Name</label>
                  <input 
                    value={editForm.name} 
                    onChange={e => setEditForm({...editForm, name: e.target.value})} 
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><Globe className="w-3 h-3"/> Website</label>
                  <input 
                    value={editForm.website} 
                    onChange={e => setEditForm({...editForm, website: e.target.value})} 
                    placeholder="https://..."
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Official Email</label>
                   <input value={institute?.email} disabled className="w-full p-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><Phone className="w-3 h-3"/> Phone Number</label>
                  <input 
                    value={editForm.phone} 
                    onChange={e => setEditForm({...editForm, phone: e.target.value})} 
                    placeholder="+91..."
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-t border-gray-100 pt-6">
               <div className="md:col-span-3"><h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400"/> Location & Details</h4></div>
               
               <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Street Address</label>
                  <textarea 
                    rows={2}
                    value={editForm.address} 
                    onChange={e => setEditForm({...editForm, address: e.target.value})} 
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                    placeholder="Enter full address..."
                  />
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">State</label>
                  <input 
                    value={editForm.state} 
                    onChange={e => setEditForm({...editForm, state: e.target.value})} 
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pincode</label>
                  <input 
                    value={editForm.pincode} 
                    onChange={e => setEditForm({...editForm, pincode: e.target.value})} 
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><Shield className="w-3 h-3"/> NAAC Grade</label>
                  <input 
                    value={editForm.naacGrade} 
                    onChange={e => setEditForm({...editForm, naacGrade: e.target.value})} 
                    placeholder="e.g. A++"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
               </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
               <button 
                 onClick={saveProfileFull}
                 disabled={isPageLoading}
                 className="flex items-center gap-2 px-6 py-2.5 text-white rounded-xl shadow-md transition-transform hover:scale-105 active:scale-95"
                 style={{ backgroundColor: currentTheme.primary }}
               >
                 {isPageLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />}
                 Save Profile Changes
               </button>
            </div>
          </div>
        )}

        {settingsTab === 'security' && (
          <div className="max-w-md mx-auto py-4 animate-in fade-in">
             <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-100">
                   <Lock className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-xl text-gray-800">Change Password</h3>
                <p className="text-sm text-gray-500 mt-1">Keep your institute account secure.</p>
             </div>
             <div className="space-y-4">
                <div className="relative">
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Current Password</label>
                   <div className="relative">
                     <input 
                       type={showPassword ? "text" : "password"} 
                       value={passForm.current} 
                       onChange={e => setPassForm({...passForm, current: e.target.value})} 
                       className="w-full p-3 pr-10 bg-white border border-gray-300 rounded-xl outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50 transition-all" 
                       placeholder="••••••••"
                     />
                     <button 
                       type="button"
                       onClick={() => setShowPassword(!showPassword)}
                       className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                     >
                       {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                     </button>
                   </div>
                </div>

                <div className="relative">
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">New Password</label>
                   <div className="relative">
                     <input 
                       type={showPassword ? "text" : "password"} 
                       value={passForm.new} 
                       onChange={e => setPassForm({...passForm, new: e.target.value})} 
                       className="w-full p-3 pr-10 bg-white border border-gray-300 rounded-xl outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50 transition-all" 
                       placeholder="••••••••"
                     />
                     <button 
                       type="button"
                       onClick={() => setShowPassword(!showPassword)}
                       className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                     >
                       {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                     </button>
                   </div>
                </div>

                <div className="relative">
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Confirm New Password</label>
                   <div className="relative">
                     <input 
                       type={showPassword ? "text" : "password"} 
                       value={passForm.confirm} 
                       onChange={e => setPassForm({...passForm, confirm: e.target.value})} 
                       className="w-full p-3 pr-10 bg-white border border-gray-300 rounded-xl outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50 transition-all" 
                       placeholder="••••••••"
                     />
                     <button 
                       type="button"
                       onClick={() => setShowPassword(!showPassword)}
                       className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                     >
                       {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                     </button>
                   </div>
                </div>

                <button 
                  onClick={handlePasswordChange} 
                  disabled={isPageLoading}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-md shadow-red-200 transition-all flex justify-center items-center gap-2 mt-4"
                >
                   {isPageLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : "Update Password"}
                </button>
             </div>
          </div>
        )}

        {settingsTab === 'access' && (
          <div className="space-y-8 animate-in fade-in">
             <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3 text-blue-800 text-sm border border-blue-100">
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                <p>Manage access to the Institute Dashboard. Granting access allows faculty members to manage students, notices, and view departmental metrics.</p>
             </div>

             <div>
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    Authorized Administrators <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">{accessUsers.length}</span>
                </h4>
                
                {accessUsers.length === 0 ? (
                   <div className="flex items-center justify-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
                      <UserCheck className="w-4 h-4 mr-2"/> No additional faculty members authorized yet.
                   </div>
                ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {accessUsers.map(user => (
                         <div key={user._id} className="flex items-center justify-between p-4 bg-white border border-green-100 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center font-bold text-sm border border-green-100">
                                 {user.name ? user.name[0] : "U"}
                               </div>
                               <div>
                                  <h5 className="font-bold text-gray-800 text-sm">{user.name}</h5>
                                  <p className="text-xs text-gray-500">{user.designation || "Faculty"} • {user.email}</p>
                               </div>
                            </div>
                            <button 
                              onClick={() => revokeAccess(user._id)} 
                              className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                              title="Revoke Access"
                            >
                               <UserMinus className="w-5 h-5" />
                            </button>
                         </div>
                      ))}
                   </div>
                )}
             </div>

             <div className="h-px bg-gray-100"></div>

             <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                        Faculty Directory <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{filteredAvailableFaculty.length}</span>
                    </h4>
                    
                    <div className="relative w-full md:w-64">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                        <input 
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                            placeholder="Search faculty..."
                            value={facultySearch}
                            onChange={e => setFacultySearch(e.target.value)}
                        />
                    </div>
                </div>

                {filteredAvailableFaculty.length === 0 ? (
                   <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <p className="text-gray-500 text-sm">No faculty members found.</p>
                      <p className="text-xs text-gray-400 mt-1">Try adding faculty from the "Manage Faculty" tab first.</p>
                   </div>
                ) : (
                   <div className="max-h-80 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                      {filteredAvailableFaculty.map(f => (
                         <div key={f._id} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-white border border-transparent hover:border-blue-100 rounded-lg transition-all group">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold">
                                   {f.name ? f.name[0] : "?"}
                               </div>
                               <div>
                                  <p className="font-semibold text-sm text-gray-800">{f.name}</p>
                                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">{f.department || "No Dept"} • {f.FID || "No ID"}</p>
                               </div>
                            </div>
                            <button 
                                onClick={() => grantAccess(f._id)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-600 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all"
                            >
                                <UserPlus className="w-3 h-3" /> Grant Access
                            </button>
                         </div>
                      ))}
                   </div>
                )}
             </div>
          </div>
        )}

      </div>
    </div>
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin" style={{ color: DEFAULT_THEME.primary }} /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="h-screen w-screen bg-white p-6 flex flex-col overflow-hidden relative">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: ${currentTheme.primary}60; 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: ${currentTheme.primary};
        }
      `}</style>

      {isPageLoading && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
          <div className="rounded-2xl p-6 bg-white/90 backdrop-blur-md flex flex-col items-center gap-4"><Spinner size={28} color={currentTheme.primary || "#111"} /><div style={{ color: "#374151" }}>Working…</div></div>
        </div>
      )}

      {notification && (
        <div className="fixed bottom-6 right-6 z-[100] bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-10 fade-in">
          <div className={`p-2 rounded-full ${notification.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}</div>
          <div><h4 className="font-bold text-sm">Notification</h4><p className="text-sm text-gray-300">{notification.message}</p></div>
          <button onClick={() => setNotification(null)} className="ml-2 text-gray-500 hover:text-white">✕</button>
        </div>
      )}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl p-6 max-w-sm w-full border border-gray-100">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center border-4 border-white shadow-sm">
                <LogOut className="w-6 h-6 ml-1" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Logging Out</h3>
                <p className="text-sm text-gray-500 mt-2">
                  You are about to sign out of the Institute Portal. Do you wish to continue?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full mt-2">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-3 rounded-xl bg-gray-50 text-gray-700 font-bold text-sm hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="px-4 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
                >
                  Confirm Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showNotificationsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-600"/> Notifications
              </h3>
              <button onClick={() => setShowNotificationsModal(false)} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition">
                <X className="w-4 h-4"/>
              </button>
            </div>
            
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
        <div className=" px-4 py-3 flex items-center gap-3 shadow-md rounded-4xl" style={{ backgroundColor: currentTheme.primary, width: "220px" }}>
          <div className="w-17 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center p-1 border-2 border-white/30">

            {institute?.logo ? (
              <img
                src={institute.logo}
                alt="Logo"
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <Building2 className="w-5 h-5 m-auto" />
            )}
          </div>
          <div>
             <h1 className="text-white font-extrabold text-xl leading-none tracking-tight">
               {institute?.code || "INST"}
             </h1>
             <p className="text-[10px] opacity-90 uppercase tracking-widest font-bold mt-1"style={{color:currentTheme.textOnPrimary}}>
               Institute Portal
             </p>
           </div>
        </div>
        
        {/* Right Action Icons */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowNotificationsModal(true)}
            className="rounded-2xl px-6 py-4 flex items-center gap-6 hover:bg-gray-50 transition-colors cursor-pointer relative" 
            style={{ backgroundColor: "transparent" }}
            title="Notifications"
          >
            <Bell className="w-6 h-6" style={{ color: currentTheme.primary }} />
            {noticesList && noticesList.length > 0 && (
              <span className="absolute top-3 right-5 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
            )}
          </button>
        </div>
      </div>

      {/* 3. MAIN ROW: Fills Remaining Height */}
      <div className="flex gap-6 flex-1 min-h-0">
        
        {/* SIDEBAR */}
        <div 
          className="rounded-4xl p-5 shadow-sm flex flex-col justify-between h-full" 
          style={{ backgroundColor: currentTheme.primary, width: "fit-content", minWidth: "220px" }}
        >
          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3">
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "faculty", label: "Manage Faculty", icon: Users },
              { id: "dept-metrics", label: "Manage Department", icon: BarChart3 },
              { id: "courses", label: "Manage Courses", icon: BookOpen },
              { id: "data-tracking", label: "Manage Student", icon: ClipboardList },
              { id: "nirf", label: "NIRF Data Entry", icon: BarChart3 }, 
              { id: "requests", label: "Requests to Admin", icon: Send },
              { id: "notices", label: "Notices & Alerts", icon: Bell },
              { id: "ai-timetable", label: "AI Timetable", icon: Cpu },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((item) => (
              <button 
                key={item.id} 
                onClick={() => setActiveTab(item.id)} 
                className="flex items-center px-4 py-3 rounded-xl text-left transition-all w-full shrink-0" 
                style={{ 
                  color: currentTheme.textOnPrimary, 
                  backgroundColor: activeTab === item.id ? currentTheme.textOnPrimary + "25" : "transparent" 
                }} 
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = activeTab === item.id ? currentTheme.textOnPrimary + "30" : currentTheme.textOnPrimary + "20"; }} 
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = activeTab === item.id ? currentTheme.textOnPrimary + "25" : "transparent"; }}
              >
                <item.icon className="w-5 h-5" /><span className="ml-3 text-sm">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Logout Button */}
          <div className="mt-4 pt-4 border-t border-white/20">
             <button 
               onClick={handleLogout} 
               className="flex items-center px-4 py-3 rounded-xl text-left transition-all w-full hover:bg-red-500/20 group"
               style={{ color: currentTheme.textOnPrimary }}
             >
                <LogOut className="w-5 h-5 group-hover:text-red-100" />
                <span className="ml-3 text-sm font-medium group-hover:text-red-100">Logout</span>
             </button>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="flex-1 rounded-3xl bg-white p-7 shadow-[0_8px_50px_rgba(0,0,0,0.22)] h-full flex flex-col overflow-hidden relative">
          
          {/* Main Content Switch */}
          {activeTab === "nirf" ? (
            <NIRFPage
              authFetch={authFetch}
              theme={currentTheme}
              institute={institute}
              pushToast={(msg) => showToast(msg.message, msg.type)}
            />
          ) : (
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {activeTab === "dashboard" && renderDashboardHome()}
              {activeTab === "courses" && <CoursesPage authFetch={authFetch} theme={currentTheme} pushToast={(msg) => showToast(msg.message, msg.type)} />}
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
              {activeTab === "ai-timetable" && (
                  <TimetableManager
                    authFetch={authFetch}
                    theme={currentTheme}
                    pushToast={(msg) => showToast(msg.message, msg.type)}
                  />
              )}
              {activeTab === "settings" && renderSettingsSection()}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default InstituteDashboard;