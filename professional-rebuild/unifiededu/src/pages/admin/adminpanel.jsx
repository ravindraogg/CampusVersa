import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LayoutDashboard, Building, Users, FileCheck, ShieldAlert,
  Database, Settings, LogOut, Plus, Search, X, Check, Trash2, Edit,
  UploadCloud, FileText, Activity, Server, Loader2, Lock,
  Megaphone, History, Eye, UserCheck, UserX, AlertTriangle, Key,
  MessageSquare, ChevronDown, ChevronRight, UserPlus, LifeBuoy, CheckCircle2,
  ArrowLeft, GraduationCap, BookOpen, Trophy, TrendingUp, MapPin, Mail, Phone, Globe, PieChart as PieIcon,
  Linkedin, ExternalLink, ArrowUpDown, Filter, RefreshCw, Landmark, ScrollText, Sun, Moon
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend, ComposedChart, LabelList
} from 'recharts';

// --- CONFIGURATION ---
const BACKEND_URI = import.meta.env.VITE_BACK_URI;
const API_BASE_URL = `${BACKEND_URI}/admin`;
const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'institutes', label: 'All Institutes', icon: Building },
    { id: 'schemes', label: 'Schemes', icon: Landmark }, // New item in the new design
    { id: 'requests', label: 'Join Requests', icon: UserPlus },
    { id: 'support', label: 'Support Tickets', icon: LifeBuoy },
    { id: 'grievance', label: 'Grievances', icon: MessageSquare },
    { id: 'broadcast', label: 'Broadcasts', icon: Megaphone },
    { id: 'tools', label: 'AI Tools', icon: FileCheck },
    { id: 'logs', label: 'Audit Logs', icon: History },
  ];
// --- THEME CONSTANTS ---
const THEME_COLORS = {
  received: '#10b981', // Emerald
  pending: '#f59e0b',  // Amber
  rejected: '#ef4444'  // Red
};

// --- MOCK DATA FOR CHARTS ---
const GOV_MOCK_DATA = {
  overall: [{ name: 'Total', applied: 4000, pending: 1200, rejected: 800, received: 2000 }],
  institutes: [],
  students: {}
};

// --- GOVERNMENT SCHOLARSHIP / SCHEME SCHEMA ---
const GOV_SCHEMES = [
  {
    id: 1,
    title: "Post Matric Scholarships Scheme for Minorities",
    ministry: "Ministry of Minority Affairs",
    type: "Central",
    amount: "₹3,000 - ₹10,000 / year",
    deadline: "2025-10-31",
    category: ["Muslim", "Sikh", "Christian", "Buddhist", "Jain", "Parsi"],
    incomeLimit: 200000,
    minMarks: 50,
    link: "https://scholarships.gov.in/"
  },
  {
    id: 2,
    title: "Merit Cum Means Scholarship for Professional and Technical Courses",
    ministry: "Ministry of Minority Affairs",
    type: "Central",
    amount: "₹20,000 / year + Maintenance",
    deadline: "2025-11-15",
    category: ["Muslim", "Sikh", "Christian", "Buddhist", "Jain", "Parsi"],
    incomeLimit: 250000,
    minMarks: 50,
    link: "https://scholarships.gov.in/"
  },
  {
    id: 3,
    title: "Post-Matric Scholarship for SC Students",
    ministry: "Ministry of Social Justice & Empowerment",
    type: "Central",
    amount: "Full Tuition Fee + Maintenance",
    deadline: "2025-12-05",
    category: ["SC"],
    incomeLimit: 250000,
    minMarks: 0,
    link: "https://scholarships.gov.in/"
  },
  {
    id: 4,
    title: "AICTE Pragati Scholarship for Girl Students",
    ministry: "AICTE",
    type: "Technical",
    amount: "₹50,000 / year",
    deadline: "2025-12-31",
    category: ["General", "SC", "ST", "OBC"],
    gender: "Female",
    incomeLimit: 800000,
    minMarks: 0,
    link: "https://www.aicte-india.org/schemes/students-development-schemes"
  }
];
// --- HELPER: TEXT HIGHLIGHTER ---
const HighlightText = ({ text, highlight }) => {
  if (!highlight || !text) return <span>{text}</span>;
  const parts = String(text).split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() ? 
          <span key={i} className="bg-yellow-500/30 text-yellow-200 rounded px-0.5">{part}</span> : part
      )}
    </span>
  );
};

// --- HELPER: MINI CHART ---
const MiniStatCard = ({ label, value, icon: Icon, colorClass, subtext }) => (
  <div className="bg-slate-800/50 border border-white/5 p-4 rounded-xl flex items-center gap-4 relative overflow-hidden group hover:border-white/10 transition-all">
    <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full blur-2xl opacity-20 ${colorClass}`}></div>
    <div className={`p-3 rounded-lg ${colorClass.replace('bg-', 'bg-opacity-20 text-')}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-bold text-white mt-0.5">{value}</div>
      {subtext && <div className="text-xs text-slate-500">{subtext}</div>}
    </div>
  </div>
);
// --- COMPONENT: ADVANCED GLOBAL SEARCH ---
const GlobalSearch = ({ api, onSelectResult }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        try {
          const res = await api.get(`/global-search?query=${query}`);
          setResults(res.data.results || res.data || []);
          setShowResults(true);
        } catch (err) {
          setResults([]); 
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 400); 
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative w-full max-w-2xl mx-auto mb-8 z-20">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-200"></div>
        <div className="relative flex items-center bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-1 shadow-sm">
          <Search className="w-5 h-5 text-gray-400 ml-3" />
          <input
            type="text"
            className="w-full bg-transparent !text-gray-900 dark:!text-white p-3 outline-none placeholder-gray-400 font-medium"
            placeholder="Search Database (Institutes, Faculty, Students)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if (results.length > 0) setShowResults(true); }}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
          />
          {loading && <Loader2 className="w-5 h-5 text-blue-600 animate-spin mr-3" />}
          {query && (
            <button onClick={() => { setQuery(''); setResults([]); }} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full mr-1 transition-colors">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-[60vh] overflow-y-auto custom-scrollbar z-50">
          <div className="p-2 space-y-1">
            {results.map((item, idx) => (
              <div 
                key={idx}
                onClick={() => onSelectResult(item)}
                className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors border-b border-gray-100 dark:border-slate-800 last:border-0"
              >
                <div className={`p-2 rounded-lg shrink-0 ${
                  item.type === 'Institute' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' :
                  item.type === 'Faculty' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' :
                  'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                }`}>
                  {item.type === 'Institute' && <Building className="w-5 h-5" />}
                  {item.type === 'Faculty' && <GraduationCap className="w-5 h-5" />}
                  {item.type === 'Student' && <Users className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-semibold !text-gray-900 dark:!text-white">{item.data.name}</h4>
                  <span className="text-xs text-gray-500 dark:text-slate-400">{item.type} • {item.type === 'Institute' ? item.data.code : (item.type === 'Faculty' ? item.data.designation : item.data.department)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- HELPER COMPONENT: MODAL ---
const Modal = ({ isOpen, title, children, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-slate-800 pb-4 shrink-0">
          <h3 className="text-xl font-bold !text-gray-900 dark:!text-white">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
          </button>
        </div>
        <div className="overflow-y-auto custom-scrollbar pr-2">{children}</div>
      </div>
    </div>
  );
};

// --- KEY COMPONENT: DETAIL ROW WITH HIGHLIGHTING ---
const DetailRow = ({ label, value, fullWidth = false, filter = '' }) => {
  const hasFilter = !!filter;
  const lowerFilter = hasFilter ? filter.toLowerCase() : '';
  const lowerLabel = (label || '').toLowerCase();

  // Only use value text for matching if it's simple
  const isSimpleValue = typeof value === 'string' || typeof value === 'number';
  const lowerValue = isSimpleValue ? String(value).toLowerCase() : '';

  // Decide if this row "matches" the filter
  const matches =
    !hasFilter ||
    lowerLabel.includes(lowerFilter) ||
    lowerValue.includes(lowerFilter);

  return (
    <div
      className={`p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700 ${
        fullWidth ? 'col-span-2' : ''
      } animate-in fade-in ${
        hasFilter && !matches ? 'opacity-40' : '' // dim non-matching rows instead of hiding
      }`}
    >
      <label className="text-xs text-gray-500 dark:text-slate-500 uppercase font-bold block mb-1">
        <HighlightText text={label} highlight={filter} />
      </label>
      <div className="text-gray-900 dark:text-slate-200 text-sm truncate font-medium">
        {isSimpleValue ? (
          <HighlightText text={value} highlight={filter} />
        ) : (
          value || 'N/A'
        )}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const AdminPanel = () => {
  // State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [activeView, setActiveView] = useState('dashboard');
  const [loginCreds, setLoginCreds] = useState({ username: '', password: '' });
  const [analytics, setAnalytics] = useState(null);
  const [institutes, setInstitutes] = useState([]);
  const [profileSearch, setProfileSearch] = useState('');

  // Pagination & Loading
  const [instPage, setInstPage] = useState(1);
  const [instHasMore, setInstHasMore] = useState(true);
  const [isInstLoading, setIsInstLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Graph Data
  const [govStats, setGovStats] = useState(null);
  
  // Detail Views
  const [selectedInstitute, setSelectedInstitute] = useState(null);
  const [instituteStats, setInstituteStats] = useState(null);
  const [instituteStudents, setInstituteStudents] = useState([]);
  const [instituteFaculty, setInstituteFaculty] = useState([]);
  const [deptSortConfig, setDeptSortConfig] = useState({ key: 'students', direction: 'desc' });
  const [deptFilter, setDeptFilter] = useState('');
  
  // Governance Drill Down
  const [showGovDrillDown, setShowGovDrillDown] = useState(false);
  const [govLoading, setGovLoading] = useState(false);
  const [expandedGovInst, setExpandedGovInst] = useState(null);
  const [govSearch, setGovSearch] = useState('');
  const [govLimit, setGovLimit] = useState(10); 

  // Scheme Search
  const [schemeSearch, setSchemeSearch] = useState('');
  const [schemeFilterType, setSchemeFilterType] = useState('All');

  // Modules State
  const [grievances, setGrievances] = useState([]);
  const [logs, setLogs] = useState([]);
  const [broadcast, setBroadcast] = useState({ title: '', message: '', type: 'Info' });

  // Modals
  const [searchDetail, setSearchDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [modals, setModals] = useState({ addInstitute: false, naacUpload: false, instituteDetail: false, ticketModal: false });
  const [newInst, setNewInst] = useState({ name: '', code: '', email: '', address: '', aisheCode: '', password: '', requestId: null, accreditationType: 'NAAC', accreditationStatus: 'false', accreditationGrade: '', accreditationScore: '' });

  const api = axios.create({ baseURL: API_BASE_URL });
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('adminToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  const isDemoMode = () => localStorage.getItem('adminToken') === 'demo-token';

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) { setIsAuthenticated(true); fetchDashboardData(); }
    document.body.className = theme === 'dark' ? 'bg-slate-950' : 'bg-gray-50';
  }, [theme]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setTimeout(() => {
      if (activeView === 'dashboard') { fetchDashboardData(); fetchGovStats(); }
      if (['institutes', 'requests', 'support'].includes(activeView)) fetchInstitutes();
      if (activeView === 'grievance') fetchGrievances();
      if (activeView === 'logs') fetchLogs();
    }, 100);
    return () => clearTimeout(timer);
  }, [activeView, isAuthenticated]);

  useEffect(() => {
    if (activeView === 'institute_students' && selectedInstitute) fetchInstituteStudents(selectedInstitute._id);
    if (activeView === 'institute_faculty' && selectedInstitute) fetchInstituteFaculty(selectedInstitute._id);
  }, [activeView, selectedInstitute]);

  // --- API CALLS ---
  const fetchDashboardData = async () => { try { const res = await api.get('/analytics'); setAnalytics(res.data); } catch (err) { setAnalytics({}); } };
  const fetchGovStats = async () => { try { const res = await api.get('/governance-stats'); setGovStats(res.data); } catch (err) { console.warn("Using Mock"); } };
  
  const fetchInstitutes = async (isLoadMore = false) => {
    if (isInstLoading) return;
    setIsInstLoading(true);
    const nextPage = isLoadMore ? instPage + 1 : 1;
    const limit = 10;
    try {
      const res = await api.get(`/getAllInstitutes?page=${nextPage}&limit=${limit}`);
      if (isLoadMore) setInstitutes(prev => [...prev, ...res.data]);
      else setInstitutes(res.data);
      setInstPage(nextPage);
      setInstHasMore(res.data.length === limit);
    } catch (err) { showToast("Failed to load institutes", "error"); } finally { setIsInstLoading(false); }
  };

  const fetchGrievances = async () => { try { const res = await api.get('/grievances'); setGrievances(res.data); } catch (err) { setGrievances([]); } };
  const fetchLogs = async () => { try { const res = await api.get('/logs'); setLogs(res.data); } catch (err) { setLogs([]); } };

  const fetchInstituteStats = async (instituteId) => { try { const res = await api.get(`/institute/${instituteId}/stats`); setInstituteStats(res.data || {}); } catch (err) { setInstituteStats({}); } };
  const fetchInstituteStudents = async (instituteId) => { setIsLoading(true); try { const res = await api.get(`/institute/${instituteId}/students`); setInstituteStudents(res.data.data || res.data || []); } catch (err) { setInstituteStudents([]); } finally { setIsLoading(false); } };
  const fetchInstituteFaculty = async (instituteId) => { setIsLoading(true); try { const res = await api.get(`/institute/${instituteId}/faculty`); setInstituteFaculty(res.data.data || res.data || []); } catch (err) { setInstituteFaculty([]); } finally { setIsLoading(false); } };

  const handleLogin = async (e) => { e.preventDefault(); setIsLoading(true); try { const res = await axios.post(`${API_BASE_URL}/login`, loginCreds); localStorage.setItem('adminToken', res.data.token); setIsAuthenticated(true); showToast('Login successful', 'success'); fetchDashboardData(); } catch (err) { localStorage.setItem('adminToken', 'demo-token'); setIsAuthenticated(true); showToast('Demo Mode', 'info'); fetchDashboardData(); } finally { setIsLoading(false); } };
  
  const handleCreateInstitute = async () => { 
    setIsLoading(true);
    try {
      if (isDemoMode()) throw new Error("Demo");
      const res = await api.post('/createInstitute', newInst);
      setInstitutes(prev => [res.data.data, ...prev]);
      showToast("Institute Created!", "success");
    } catch (err) {
      const mockInst = { ...newInst, _id: `temp-${Date.now()}`, status: 'Active', type: 'REGISTERED' };
      setInstitutes(prev => [mockInst, ...prev]);
      showToast("Mock Institute Added", "success");
    } finally {
      setIsLoading(false);
      setModals({ ...modals, addInstitute: false });
    }
  };

  const handleStatusUpdate = async (id, status) => {
    const updatedInstitutes = institutes.map(i => i._id === id ? { ...i, status } : i);
    setInstitutes(updatedInstitutes);
    if (selectedInstitute?._id === id) setSelectedInstitute({ ...selectedInstitute, status });
    try {
      if (!isDemoMode()) await api.put(`/institute/${id}/status`, { status });
      showToast(`Status updated to ${status}`, "success");
    } catch(e) { showToast(`Status updated (Mock): ${status}`, "info"); }
    setModals({ ...modals, instituteDetail: false });
  };

  const handleDeleteInstitute = async (id) => {
    if(!window.confirm("Are you sure? This cannot be undone.")) return;
    const updated = institutes.filter(i => i._id !== id);
    setInstitutes(updated);
    try {
      if (!isDemoMode()) await api.delete(`/institute/${id}`);
      showToast("Institute Deleted", "success");
    } catch(e) { showToast("Institute Deleted (Mock)", "info"); }
    setModals({ ...modals, instituteDetail: false });
    setActiveView('institutes');
  };

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };
  const handleGovDrillDown = () => { setShowGovDrillDown(!showGovDrillDown); if (!showGovDrillDown) { setGovLoading(true); setTimeout(() => setGovLoading(false), 800); } };
  
  const handleDeptSort = (key) => {
    setDeptSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

const renderSearchResultModal = () => {
  if (!searchDetail) return null;
  const { type, data } = searchDetail;

  // Safe helper for block-level matching (objects like previousEducation, workHistory items, etc.)
  const matchesFilter = (obj, filter) => {
    if (!filter) return true;
    if (!obj) return false;

    try {
      const str = JSON.stringify(obj);
      if (typeof str !== "string") return false;
      return str.toLowerCase().includes(filter.toLowerCase());
    } catch {
      return false;
    }
  };

  return (
    <Modal
      isOpen={!!searchDetail}
      title={`${type} Full Profile`}
      onClose={() => {
        setSearchDetail(null);
        setProfileSearch(""); // Reset filter on close
      }}
    >
      <div className="space-y-6">
        {/* INTERNAL SEARCH BAR */}
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 pb-4 border-b border-gray-100 dark:border-slate-800 pt-1">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              autoFocus
              placeholder={`Search inside ${data?.name || ""}'s profile...`}
              value={profileSearch}
              onChange={(e) => setProfileSearch(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 pl-10 pr-9 py-2 rounded-lg text-sm !text-gray-900 dark:!text-white focus:border-indigo-500 outline-none transition-all"
            />
            {profileSearch && (
              <button
                onClick={() => setProfileSearch("")}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* HEADER CARD */}
        <div className="flex items-center gap-4 bg-gray-100 dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-inner">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg ${
              type === "Institute"
                ? "bg-indigo-600 text-white"
                : type === "Faculty"
                ? "bg-amber-600 text-white"
                : "bg-emerald-600 text-white"
            }`}
          >
            {data?.name?.[0] || "?"}
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold !text-gray-900 dark:!text-white">
              <HighlightText text={data?.name || ""} highlight={profileSearch} />
            </h3>
            <p className="text-gray-500 dark:text-slate-400 font-medium">
              <HighlightText
                text={
                  type === "Institute"
                    ? data?.code || ""
                    : type === "Faculty"
                    ? data?.designation || ""
                    : `Student - ${data?.department || ""}`
                }
                highlight={profileSearch}
              />
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-white dark:bg-slate-900 rounded text-xs font-mono text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700">
                ID:{" "}
                <HighlightText
                  text={data?.IID || data?.FID || data?.SID || "N/A"}
                  highlight={profileSearch}
                />
              </span>

              {type === "Institute" && data?.aisheCode && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs border border-blue-200 dark:border-blue-500/30">
                  AISHE:{" "}
                  <HighlightText
                    text={data.aisheCode}
                    highlight={profileSearch}
                  />
                </span>
              )}
            </div>
          </div>
        </div>

        {/* FACULTY VIEW */}
        {type === "Faculty" && (
          <div className="grid grid-cols-2 gap-4">
            <h4 className="col-span-2 !text-gray-900 dark:!text-white font-bold border-b border-gray-200 dark:border-slate-700 pb-2 mt-2">
              Professional Profile
            </h4>

            <DetailRow
              label="Department"
              value={data?.department}
              filter={profileSearch}
            />
            <DetailRow
              label="Designation"
              value={data?.designation}
              filter={profileSearch}
            />
            <DetailRow
              label="Qualification"
              value={data?.qualification}
              fullWidth
              filter={profileSearch}
            />
            <DetailRow
              label="Experience"
              value={`${data?.experience || "N/A"} (Total: ${
                data?.totalExperienceYears || 0
              } Yrs)`}
              filter={profileSearch}
            />

            {/* Research & Impact summary (visible when relevant or no filter) */}
            {(!profileSearch ||
              "research papers citations h-index projects".includes(
                profileSearch.toLowerCase()
              )) && (
              <>
                <h4 className="col-span-2 !text-gray-900 dark:!text-white font-bold border-b border-gray-200 dark:border-slate-700 pb-2 mt-4">
                  Research & Impact
                </h4>
                <div className="col-span-2 grid grid-cols-4 gap-2 bg-gray-50 dark:bg-slate-800/50 p-3 rounded-lg border border-gray-200 dark:border-slate-700 text-center">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-slate-400 uppercase">
                      Papers
                    </div>
                    <div className="text-xl font-bold !text-gray-900 dark:!text-white">
                      {data?.research?.papersPublished ||
                        data?.papersPublished ||
                        0}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-slate-400 uppercase">
                      Citations
                    </div>
                    <div className="text-xl font-bold !text-gray-900 dark:!text-white">
                      {data?.research?.citations || data?.citations || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-slate-400 uppercase">
                      h-Index
                    </div>
                    <div className="text-xl font-bold !text-gray-900 dark:!text-white">
                      {data?.research?.hIndex || data?.hIndex || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-slate-400 uppercase">
                      Projects
                    </div>
                    <div className="text-xl font-bold !text-gray-900 dark:!text-white">
                      {data?.research?.projectsGuided ||
                        data?.projectsGuided ||
                        0}
                    </div>
                  </div>
                </div>
              </>
            )}

            <h4 className="col-span-2 !text-gray-900 dark:!text-white font-bold border-b border-gray-200 dark:border-slate-700 pb-2 mt-4">
              Work History
            </h4>
            <div className="col-span-2 p-3 bg-gray-50 dark:bg-slate-800/50 rounded border border-gray-200 dark:border-slate-700 text-sm text-gray-600 dark:text-slate-300">
              {Array.isArray(data?.workHistory) ? (
                data.workHistory
                  .filter((w) => matchesFilter(w, profileSearch))
                  .map((w, i) => (
                    <div
                      key={i}
                      className="mb-1 pb-1 border-b border-gray-200 dark:border-slate-700 last:border-0"
                    >
                      <span className="font-bold !text-gray-900 dark:!text-white">
                        <HighlightText
                          text={w.instituteName || ""}
                          highlight={profileSearch}
                        />
                      </span>{" "}
                      -{" "}
                      <HighlightText
                        text={w.role || ""}
                        highlight={profileSearch}
                      />{" "}
                      (
                      <HighlightText
                        text={w.duration || ""}
                        highlight={profileSearch}
                      />
                      )
                    </div>
                  ))
              ) : data?.workHistory &&
                (!profileSearch ||
                  String(data.workHistory)
                    .toLowerCase()
                    .includes(profileSearch.toLowerCase())) ? (
                <HighlightText
                  text={String(data.workHistory)}
                  highlight={profileSearch}
                />
              ) : (
                <span className="text-gray-400 italic">
                  No matching history.
                </span>
              )}
            </div>
          </div>
        )}

        {/* STUDENT VIEW */}
        {type === "Student" && (
          <div className="grid grid-cols-2 gap-4">
            <h4 className="col-span-2 !text-gray-900 dark:!text-white font-bold border-b border-gray-200 dark:border-slate-700 pb-2 mt-2">
              Academic Identity
            </h4>

            <DetailRow
              label="Roll Number"
              value={data?.rollNumber}
              filter={profileSearch}
            />
            <DetailRow
              label="Admission No"
              value={data?.admissionNo}
              filter={profileSearch}
            />
            <DetailRow
              label="Department"
              value={data?.department}
              filter={profileSearch}
            />
            <DetailRow
              label="Current Semester"
              value={data?.semester ? `Sem ${data.semester}` : "N/A"}
              filter={profileSearch}
            />

            <h4 className="col-span-2 !text-gray-900 dark:!text-white font-bold border-b border-gray-200 dark:border-slate-700 pb-2 mt-4">
              Previous Education
            </h4>

            {/* Primary (10th) */}
            {matchesFilter(data?.previousEducation?.primary, profileSearch) && (
              <div className="col-span-2 md:col-span-1 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700">
                <h5 className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase mb-2">
                  Primary (10th)
                </h5>
                <div className="space-y-2">
                  <DetailRow
                    label="School"
                    value={data?.previousEducation?.primary?.schoolName}
                    filter={profileSearch}
                  />
                  <DetailRow
                    label="Marks"
                    value={data?.previousEducation?.primary?.marks}
                    filter={profileSearch}
                  />
                </div>
              </div>
            )}

            {/* Secondary (12th) */}
            {matchesFilter(
              data?.previousEducation?.secondary,
              profileSearch
            ) && (
              <div className="col-span-2 md:col-span-1 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700">
                <h5 className="text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase mb-2">
                  Secondary (12th)
                </h5>
                <div className="space-y-2">
                  <DetailRow
                    label="School"
                    value={data?.previousEducation?.secondary?.schoolName}
                    filter={profileSearch}
                  />
                  <DetailRow
                    label="Marks"
                    value={data?.previousEducation?.secondary?.marks}
                    filter={profileSearch}
                  />
                </div>
              </div>
            )}

            <h4 className="col-span-2 !text-gray-900 dark:!text-white font-bold border-b border-gray-200 dark:border-slate-700 pb-2 mt-4">
              Performance Overview
            </h4>

            <div className="col-span-2 grid grid-cols-2 gap-4">
              {(!profileSearch ||
                "cgpa academic grade".includes(
                  profileSearch.toLowerCase()
                )) && (
                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-slate-400 uppercase">
                      CGPA
                    </div>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {data?.academic?.cgpa ||
                        data?.cgpa ||
                        "0.00"}
                    </div>
                  </div>
                  <Trophy className="w-8 h-8 text-emerald-500/20" />
                </div>
              )}

              {(!profileSearch ||
                "attendance present absent".includes(
                  profileSearch.toLowerCase()
                )) && (
                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-slate-400 uppercase">
                      Attendance
                    </div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {data?.attendance?.overallPercentage ||
                        data?.attendancePercentage ||
                        0}
                      %
                    </div>
                  </div>
                  <Activity className="w-8 h-8 text-blue-500/20" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* INSTITUTE VIEW */}
        {type === "Institute" && (
          <div className="grid grid-cols-2 gap-4">
            <DetailRow
              label="Email"
              value={data?.email}
              filter={profileSearch}
            />
            <DetailRow
              label="Phone"
              value={data?.phone}
              filter={profileSearch}
            />
            <DetailRow
              label="Address"
              value={data?.address}
              fullWidth
              filter={profileSearch}
            />
          </div>
        )}

        {/* FOOTER */}
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={() => {
              setSearchDetail(null);
              setProfileSearch("");
            }}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all"
          >
            Close Profile
          </button>
        </div>
      </div>
    </Modal>
  );
};



  // 2. DASHBOARD
  const renderDashboard = () => {
    if (!analytics) return <div className="p-8 text-center"><Loader2 className="animate-spin inline mr-2" /> Loading...</div>;
    const currentGovData = govStats || { overall: [{ name: 'Total', applied: 0, pending: 0, rejected: 0, received: 0 }], institutes: [], students: {} };
    const govData = currentGovData.overall;
    
    // --- CALCULATE PERCENTAGES ---
    const totalBeneficiaries = govData[0]?.applied || 1;
    const getPercent = (val) => {
        if (!val || val === 0) return '';
        const percent = ((val / totalBeneficiaries) * 100).toFixed(1);
        return `${percent}%`;
    };

    const allFilteredGovInstitutes = currentGovData.institutes.filter(i => (i.name || '').toLowerCase().includes(govSearch.toLowerCase()));
    const visibleGovInstitutes = allFilteredGovInstitutes.slice(0, govLimit);

    return (
      <div className={`space-y-6 animate-in fade-in duration-500 pb-8 relative ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'}`}>
        {renderSearchResultModal()}
        <GlobalSearch api={api} onSelectResult={(item) => setSearchDetail(item)} />
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 p-4 rounded-xl shadow-sm">
            <div className="text-indigo-600 dark:text-indigo-400 text-sm font-bold uppercase mb-1">Total Institutes</div>
            <div className="text-3xl font-extrabold !text-gray-900 dark:!text-white">{analytics.totalInstitutes || 0}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 p-4 rounded-xl shadow-sm">
             <div className="text-emerald-600 dark:text-emerald-400 text-sm font-bold uppercase mb-1">Active</div>
             <div className="text-3xl font-extrabold !text-gray-900 dark:!text-white">{analytics.activeInstitutes || 0}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 p-4 rounded-xl shadow-sm">
             <div className="text-amber-600 dark:text-amber-400 text-sm font-bold uppercase mb-1">Pending</div>
             <div className="text-3xl font-extrabold !text-gray-900 dark:!text-white">{analytics.pendingApprovals || 0}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/50 p-4 rounded-xl shadow-sm relative overflow-hidden">
             <div className="absolute right-0 top-0 p-3 opacity-10"><Landmark className="w-16 h-16 text-blue-600 dark:text-blue-400" /></div>
             <div className="text-blue-600 dark:text-blue-400 text-sm font-bold uppercase mb-1">Beneficiaries</div>
             <div className="text-3xl font-extrabold !text-gray-900 dark:!text-white">{govData[0]?.applied?.toLocaleString() || 0}</div>
          </div>
        </div>

        {/* Governance Tracker */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
           <div className="flex justify-between items-center mb-6">
              <div><h4 className="text-xl font-bold !text-gray-900 dark:!text-white flex items-center gap-2"><ScrollText className="w-6 h-6 text-blue-600 dark:text-blue-400"/> Governance Tracker</h4></div>
              <button onClick={handleGovDrillDown} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold">{showGovDrillDown ? 'Hide Details' : 'View Breakdown'} <ChevronRight className={`w-4 h-4 transition-transform ${showGovDrillDown ? 'rotate-90' : ''}`}/></button>
           </div>
           
           {/* Chart */}
         {/* Chart */}
<div className="h-28 w-full mb-4 rounded-lg overflow-visible bg-gray-100 dark:bg-slate-800">
  <ResponsiveContainer width="100%" height="100%">
    <BarChart
      layout="vertical"
      data={govData}
      stackOffset="expand"
      margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
    >
      <XAxis type="number" hide domain={[0, 1]} />
      <YAxis dataKey="name" type="category" hide />
      <Tooltip
        contentStyle={{
          backgroundColor: theme === 'dark' ? '#0f172a' : '#fff',
          borderColor: '#334155',
        }}
        wrapperStyle={{ zIndex: 50 }}   // makes sure it stays on top
        formatter={(value) =>
          `${((value / totalBeneficiaries) * 100).toFixed(1)}% (${value})`
        }
      />
      <Bar dataKey="received" stackId="a" fill={THEME_COLORS.received} isAnimationActive={false}>
        <LabelList
          dataKey="received"
          position="center"
          fill="white"
          fontSize={12}
          fontWeight="bold"
          formatter={getPercent}
        />
      </Bar>
      <Bar dataKey="pending" stackId="a" fill={THEME_COLORS.pending} isAnimationActive={false}>
        <LabelList
          dataKey="pending"
          position="center"
          fill="white"
          fontSize={12}
          fontWeight="bold"
          formatter={getPercent}
        />
      </Bar>
      <Bar dataKey="rejected" stackId="a" fill={THEME_COLORS.rejected} isAnimationActive={false}>
        <LabelList
          dataKey="rejected"
          position="center"
          fill="white"
          fontSize={12}
          fontWeight="bold"
          formatter={getPercent}
        />
      </Bar>
    </BarChart>
  </ResponsiveContainer>
</div>

           
           <div className="flex gap-6 justify-center text-sm font-medium text-gray-600 dark:text-slate-300 mb-2">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Received ({govData[0]?.received || 0})</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div> Pending ({govData[0]?.pending || 0})</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> Rejected ({govData[0]?.rejected || 0})</div>
           </div>

           {/* Drill Down */}
           {showGovDrillDown && (
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-800 animate-in fade-in">
                 <div className="flex justify-between items-center mb-4">
                    <h5 className="font-bold !text-gray-900 dark:!text-white">Institute Level Breakdown</h5>
                    <div className="relative">
                       <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400"/>
                       <input type="text" placeholder="Search Institute..." value={govSearch} onChange={(e) => setGovSearch(e.target.value)} className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm !text-gray-900 dark:!text-white placeholder-gray-500 outline-none" />
                    </div>
                 </div>
                 {govLoading ? <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-blue-500"/></div> : (
                    <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                       {visibleGovInstitutes.map((inst) => (
                          <div key={inst.id} className="bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                             <div onClick={() => setExpandedGovInst(expandedGovInst === inst.id ? null : inst.id)} className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                                <div className="flex-1">
                                   <div className="font-bold !text-gray-900 dark:!text-white flex items-center gap-2">{inst.name} {expandedGovInst === inst.id ? <ChevronDown className="w-4 h-4 text-gray-400"/> : <ChevronRight className="w-4 h-4 text-gray-400"/>}</div>
                                   <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">Total Applied: {inst.applied}</div>
                                </div>
                                <div className="w-1/3 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                                   <div style={{ width: `${(inst.received / (inst.applied || 1)) * 100}%` }} className="h-full bg-emerald-500"></div>
                                   <div style={{ width: `${(inst.pending / (inst.applied || 1)) * 100}%` }} className="h-full bg-amber-500"></div>
                                   <div style={{ width: `${(inst.rejected / (inst.applied || 1)) * 100}%` }} className="h-full bg-red-500"></div>
                                </div>
                             </div>
                             {expandedGovInst === inst.id && (
                                <div className="border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                                   <table className="w-full text-left text-sm">
                                      <thead className="text-xs uppercase text-gray-500 dark:text-slate-500 border-b border-gray-100 dark:border-slate-800">
                                         <tr><th className="pb-2">Student Name</th><th className="pb-2">Scheme</th><th className="pb-2">Status</th><th className="pb-2 text-right">Amount</th></tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                         {(currentGovData.students[inst.id] || []).map((stu) => (
                                            <tr key={stu.id}>
                                               <td className="py-3 font-medium !text-gray-900 dark:!text-white">{stu.name}</td>
                                               <td className="py-3 text-gray-600 dark:text-slate-400">{stu.scheme}</td>
                                               <td className="py-3"><span className={`px-2 py-0.5 rounded text-xs font-bold ${stu.status === 'Received' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20'}`}>{stu.status}</span></td>
                                               <td className="py-3 text-right font-mono text-gray-700 dark:text-slate-300">{stu.amount}</td>
                                            </tr>
                                         ))}
                                      </tbody>
                                   </table>
                                </div>
                             )}
                          </div>
                       ))}
                       {visibleGovInstitutes.length < allFilteredGovInstitutes.length && (
                         <div className="flex justify-center pt-2"><button onClick={() => setGovLimit(prev => prev + 10)} className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Load More Institutes</button></div>
                       )}
                    </div>
                 )}
              </div>
           )}
        </div>

        {/* Existing Graphs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-700">
            <h4 className="font-semibold mb-6 !text-gray-900 dark:!text-white">System Overview</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ name: 'Active', value: analytics.activeInstitutes || 0 }, { name: 'Requests', value: analytics.pendingApprovals || 0 }, { name: 'Grievances', value: analytics.openGrievances || 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
                  <YAxis tick={{ fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-700">
            <h4 className="font-semibold mb-4 !text-gray-900 dark:!text-white">Recent Activity</h4>
            <div className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar">
              {analytics.recentActivity && analytics.recentActivity.map((log, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 shrink-0"></div>
                  <div><div className="text-gray-700 dark:text-slate-200">{log.action}</div><div className="text-gray-500 dark:text-slate-500 text-xs">{new Date(log.timestamp).toLocaleString()}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderInstitutes = () => {
    const filteredInstitutes = institutes.filter(inst => (inst.name?.toLowerCase().includes(searchQuery.toLowerCase()) || inst.code?.toLowerCase().includes(searchQuery.toLowerCase())));
    return (
      <div className={`space-y-6 animate-in fade-in ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-bold">All Institutes</h2>
          <div className="flex w-full md:w-auto gap-3">
            <div className="relative flex-1 md:w-64"><Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" /><input type="text" placeholder="Filter..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 pl-10 pr-4 py-2.5 rounded-lg text-sm !text-gray-900 dark:!text-white focus:border-indigo-500 outline-none" /></div>
            <button onClick={() => { setNewInst({ name: '', code: '' }); setModals({ ...modals, addInstitute: true }); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap"><Plus className="w-4 h-4" /> Add Manually</button>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm mb-4">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-slate-400 text-xs uppercase font-semibold"><tr><th className="p-4">Name</th><th className="p-4">Code</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filteredInstitutes.map(inst => (
                <tr key={inst._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="p-4"><div onClick={() => { setSelectedInstitute(inst); setActiveView('institute_details'); fetchInstituteStats(inst._id); }} className="font-medium cursor-pointer hover:text-indigo-500 !text-gray-900 dark:!text-white">{inst.name}</div><div className="text-xs text-gray-500">{inst.email}</div></td>
                  <td className="p-4 font-mono text-sm">{inst.code}</td>
                  <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${inst.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{inst.status}</span></td>
                  <td className="p-4 text-right"><button onClick={() => { setSelectedInstitute(inst); setActiveView('institute_details'); fetchInstituteStats(inst._id); }} className="text-indigo-600 hover:underline text-sm font-medium">Manage</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {instHasMore && !searchQuery && (<div className="flex justify-center pb-8"><button onClick={() => fetchInstitutes(true)} disabled={isInstLoading} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2">{isInstLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4"/>} Load More</button></div>)}
      </div>
    );
  };

  const renderSchemes = () => {
    const filtered = GOV_SCHEMES
      .filter(s => s.title.toLowerCase().includes(schemeSearch.toLowerCase()) || s.ministry.toLowerCase().includes(schemeSearch.toLowerCase()))
      .filter(s => schemeFilterType === 'All' || s.type === schemeFilterType);

    return (
      <div className={`space-y-6 animate-in fade-in ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-2"><Landmark className="w-6 h-6 text-indigo-500"/> Government Schemes</h2>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64"><Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" /><input type="text" placeholder="Search schemes..." value={schemeSearch} onChange={(e) => setSchemeSearch(e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 pl-10 pr-4 py-2.5 rounded-lg text-sm !text-gray-900 dark:!text-white focus:border-indigo-500 outline-none" /></div>
            <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">{['All', 'Central', 'Technical', 'Defense'].map(t => (<button key={t} onClick={() => setSchemeFilterType(t)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${schemeFilterType === t ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white'}`}>{t}</button>))}</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-slate-400 text-xs uppercase font-semibold"><tr><th className="p-4">Scheme Title</th><th className="p-4">Ministry</th><th className="p-4">Type</th><th className="p-4">Deadline</th><th className="p-4 text-right">Link</th></tr></thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="p-4"><div className="font-semibold text-sm !text-gray-900 dark:!text-white">{s.title}</div></td>
                  <td className="p-4 text-sm text-gray-600 dark:text-slate-300">{s.ministry}</td>
                  <td className="p-4"><span className="px-2 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">{s.type}</span></td>
                  <td className="p-4 text-xs text-gray-500 dark:text-slate-400">{s.deadline}</td>
                  <td className="p-4 text-right"><a href={s.link} target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline flex items-center justify-end gap-1">Apply <ExternalLink className="w-3 h-3"/></a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderInstituteDetails = () => {
    if (!selectedInstitute) return null;
    const stats = instituteStats || { totalStudents: 0, totalFaculty: 0, publications: 0, departmentBreakdown: [] };
    const deptBreakdown = stats.departmentBreakdown || [];
    const sortedDepts = [...deptBreakdown]
      .filter(d => d.name.toLowerCase().includes(deptFilter.toLowerCase()))
      .sort((a, b) => {
        const { key, direction } = deptSortConfig;
        if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
        if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
        return 0;
      });

    return (
      <div className={`space-y-8 animate-in slide-in-from-right duration-300 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveView('institutes')} className="p-2 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full border border-gray-200 dark:border-slate-700 transition-colors"><ArrowLeft className="w-5 h-5" /></button>
            <div>
              <h2 className="text-3xl font-bold !text-gray-900 dark:!text-white">{selectedInstitute.name}</h2>
              <div className="flex gap-4 text-gray-500 dark:text-slate-400 text-sm mt-1">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {selectedInstitute.address || 'Location N/A'}</span>
                <span className="flex items-center gap-1 font-mono bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">AISHE: {selectedInstitute.aisheCode || 'N/A'}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setModals({ ...modals, instituteDetail: true })}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white rounded-lg shadow-sm transition-colors"
          >
            <Settings className="w-4 h-4"/> Governance Controls
          </button>
        </div>

        {/* --- TOP STATISTICS CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div onClick={() => { setSearchQuery(''); setActiveView('institute_students'); }} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-5 rounded-2xl flex items-center gap-4 cursor-pointer hover:border-emerald-500/50 hover:shadow-lg transition-all group">
             <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl group-hover:bg-emerald-200 dark:group-hover:bg-emerald-500/30"><Users className="w-8 h-8 text-emerald-600 dark:text-emerald-400" /></div>
             <div><div className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Total Students</div><div className="text-2xl font-bold !text-gray-900 dark:!text-white">{stats.totalStudents || 0}</div></div>
          </div>
          <div onClick={() => { setSearchQuery(''); setActiveView('institute_faculty'); }} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-5 rounded-2xl flex items-center gap-4 cursor-pointer hover:border-amber-500/50 hover:shadow-lg transition-all group">
             <div className="p-3 bg-amber-100 dark:bg-amber-500/20 rounded-xl group-hover:bg-amber-200 dark:group-hover:bg-amber-500/30"><GraduationCap className="w-8 h-8 text-amber-600 dark:text-amber-400" /></div>
             <div><div className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Faculty</div><div className="text-2xl font-bold !text-gray-900 dark:!text-white">{selectedInstitute.authorizedFaculty?.length || stats.totalFaculty || 0}</div></div>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-5 rounded-2xl flex items-center gap-4">
             <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl"><Trophy className="w-8 h-8 text-indigo-600 dark:text-indigo-400" /></div>
             <div><div className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Accreditation</div><div className="text-2xl font-bold !text-gray-900 dark:!text-white">{selectedInstitute.accreditation?.[0]?.grade || 'N/A'}</div></div>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-5 rounded-2xl flex items-center gap-4">
             <div className="p-3 bg-rose-100 dark:bg-rose-500/20 rounded-xl"><BookOpen className="w-8 h-8 text-rose-600 dark:text-rose-400" /></div>
             <div><div className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Publications</div><div className="text-2xl font-bold !text-gray-900 dark:!text-white">{stats.publications || 0}</div></div>
          </div>
        </div>

        {/* --- DEPARTMENT ANALYSIS --- */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
           <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <h3 className="text-xl font-bold !text-gray-900 dark:!text-white flex items-center gap-2"><PieIcon className="w-5 h-5 text-indigo-500"/> Departmental Performance</h3>
              <div className="relative">
                 <Filter className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                 <input 
                    type="text" 
                    placeholder="Filter Departments..." 
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-indigo-500 outline-none !text-gray-900 dark:!text-white"
                 />
              </div>
           </div>

           {deptBreakdown.length > 0 ? (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gray-50 dark:bg-slate-800/30 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                   <table className="w-full text-left">
                      <thead className="bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 text-xs uppercase font-bold">
                         <tr>
                            <th className="p-4 cursor-pointer hover:text-indigo-500" onClick={()=>handleDeptSort('name')}>Department <ArrowUpDown className="w-3 h-3 inline"/></th>
                            <th className="p-4 cursor-pointer hover:text-indigo-500" onClick={()=>handleDeptSort('students')}>Students <ArrowUpDown className="w-3 h-3 inline"/></th>
                            <th className="p-4 cursor-pointer hover:text-indigo-500" onClick={()=>handleDeptSort('faculty')}>Faculty <ArrowUpDown className="w-3 h-3 inline"/></th>
                            <th className="p-4 cursor-pointer hover:text-indigo-500" onClick={()=>handleDeptSort('avgCgpa')}>Avg CGPA <ArrowUpDown className="w-3 h-3 inline"/></th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-sm">
                         {sortedDepts.map((dept, idx) => (
                            <tr key={idx} className="hover:bg-white dark:hover:bg-slate-800 transition-colors">
                               <td className="p-4 font-bold !text-gray-900 dark:!text-white">{dept.name}</td>
                               <td className="p-4 text-gray-600 dark:text-slate-300">{dept.students}</td>
                               <td className="p-4 text-gray-600 dark:text-slate-300">{dept.faculty}</td>
                               <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">{dept.avgCgpa}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800/30 rounded-xl border border-gray-200 dark:border-slate-700 p-4 flex flex-col h-[350px]">
                   <h4 className="text-gray-500 dark:text-slate-400 text-xs font-bold uppercase mb-4 text-center">Student vs Faculty Ratio</h4>
                   <div className="flex-1 w-full h-full">
                      <ResponsiveContainer width="100%" height="100%">
                         <ComposedChart data={sortedDepts.slice(0, 8)}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                            <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="students" fill="#6366f1" barSize={20} radius={[4,4,0,0]} />
                            <Line type="monotone" dataKey="faculty" stroke="#10b981" strokeWidth={2} dot={{r:3}} />
                         </ComposedChart>
                      </ResponsiveContainer>
                   </div>
                </div>
             </div>
           ) : (
             <div className="text-center py-12 text-gray-500">No department data available.</div>
           )}
        </div>
      </div>
    );
  };

  const renderInstituteStudents = () => {
    if (!selectedInstitute) return null;
    
    return (
      <div className={`space-y-6 animate-in slide-in-from-right duration-300 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
         <div className="flex items-center gap-4">
          <button onClick={() => setActiveView('institute_details')} className="p-2 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full border border-gray-200 dark:border-slate-700 transition-colors"><ArrowLeft className="w-5 h-5" /></button>
          <div><h2 className="text-2xl font-bold !text-gray-900 dark:!text-white">Students Registry</h2><p className="text-gray-500 dark:text-slate-400 text-sm">{selectedInstitute.name}</p></div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
             <div className="relative w-64">
               <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Search students in this list..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 pl-10 pr-4 py-2 rounded-lg text-sm focus:border-indigo-500 outline-none !text-gray-900 dark:!text-white"
               />
             </div>
             <button onClick={() => fetchInstituteStudents(selectedInstitute._id)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-500 dark:text-slate-400" title="Refresh List">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-indigo-500" /> : <RefreshCw className="w-5 h-5"/>}
             </button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-slate-400 text-xs uppercase font-semibold">
              <tr>
                <th className="p-4">Student Name</th>
                <th className="p-4">SID / Roll</th>
                <th className="p-4">Department</th>
                <th className="p-4">Academic</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {instituteStudents
                .filter(s => s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || s.SID?.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((std, idx) => {
                  const cgpa = std.academic?.cgpa || std.cgpa || '0.00';
                  const alertLevel = std.attendance?.alertLevel || std.attendanceStatus || 'Active';
                  const isCritical = alertLevel === 'Critical';

                  return (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="p-4 font-medium !text-gray-900 dark:!text-white">
                        {std.name}
                        <button onClick={() => setSearchDetail({ type: 'Student', data: std })} className="ml-2 text-xs text-indigo-500 hover:underline block">View Profile</button>
                      </td>
                      <td className="p-4 text-gray-600 dark:text-slate-300 font-mono text-sm">
                        {std.SID}<br/>
                        <span className="text-xs text-gray-500 dark:text-slate-500">{std.rollNumber || ''}</span>
                      </td>
                      <td className="p-4 text-gray-600 dark:text-slate-300">
                        {std.department}<br/>
                        <span className="text-xs text-gray-500 dark:text-slate-500">Sem: {std.semester}</span>
                      </td>
                      <td className="p-4 text-gray-600 dark:text-slate-300">
                        CGPA: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{cgpa}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${isCritical ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'}`}>
                            {isCritical ? 'Attendance Alert' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              {instituteStudents.length === 0 && !isLoading && (
                 <tr>
                    <td colSpan="5" className="p-12 text-center text-gray-500">
                       <p>No students found.</p>
                       <button onClick={() => fetchInstituteStudents(selectedInstitute._id)} className="mt-2 text-indigo-500 hover:underline text-sm">Try Again</button>
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderInstituteFaculty = () => {
    if (!selectedInstitute) return null;

    const filteredFaculty = instituteFaculty.filter(f => 
      f.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      f.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.designation?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className={`space-y-6 animate-in slide-in-from-right duration-300 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
         <div className="flex items-center gap-4">
          <button onClick={() => setActiveView('institute_details')} className="p-2 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full border border-gray-200 dark:border-slate-700 transition-colors"><ArrowLeft className="w-5 h-5" /></button>
          <div><h2 className="text-2xl font-bold !text-gray-900 dark:!text-white">Faculty Registry</h2><p className="text-gray-500 dark:text-slate-400 text-sm">{selectedInstitute.name}</p></div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
             <div className="relative w-64">
               <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Search faculty..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 pl-10 pr-4 py-2 rounded-lg text-sm focus:border-indigo-500 outline-none !text-gray-900 dark:!text-white"
               />
             </div>
             <button onClick={() => fetchInstituteFaculty(selectedInstitute._id)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-500 dark:text-slate-400" title="Refresh List">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-indigo-500" /> : <RefreshCw className="w-5 h-5"/>}
             </button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-slate-400 text-xs uppercase font-semibold">
              <tr>
                <th className="p-4">Faculty Name</th>
                <th className="p-4">ID / Designation</th>
                <th className="p-4">Department</th>
                <th className="p-4">Research Profile</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filteredFaculty.map((fac, idx) => {
                const papers = fac.research?.papersPublished || fac.papersPublished || 0;
                const citations = fac.research?.citations || fac.citations || 0;

                return (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium !text-gray-900 dark:!text-white flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-500 flex items-center justify-center text-xs font-bold">{fac.name?.[0] || 'F'}</div>
                        {fac.name}
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-slate-300">
                      <span className="font-mono text-xs bg-gray-100 dark:bg-slate-900 px-1.5 py-0.5 rounded border border-gray-200 dark:border-slate-700">{fac.FID || fac.id}</span>
                      <div className="text-xs text-gray-500 dark:text-slate-500 mt-1">{fac.designation}</div>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-slate-300">
                      {fac.department}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-slate-300 text-xs">
                      <div>Papers: <span className="font-bold !text-gray-900 dark:!text-white">{papers}</span></div>
                      <div>Citations: <span className="font-bold !text-gray-900 dark:!text-white">{citations}</span></div>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => setSearchDetail({ type: 'Faculty', data: fac })} className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium">View Profile</button>
                    </td>
                  </tr>
                )
              })}
              {filteredFaculty.length === 0 && !isLoading && (
                 <tr>
                    <td colSpan="5" className="p-12 text-center text-gray-500">No faculty found.</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // --- RESTORED MODULES ---
  const renderRequests = () => (
    <div className={`space-y-6 animate-in fade-in ${theme==='dark'?'text-white':'text-gray-900'}`}>
      <h2 className="text-2xl font-bold flex items-center gap-2"><UserPlus className="w-6 h-6 text-amber-500"/> Requests</h2>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden"><table className="w-full text-left"><thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-slate-400"><tr><th className="p-4">Name</th><th className="p-4">Status</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-slate-700"><tr><td className="p-4" colSpan="2">No pending requests.</td></tr></tbody></table></div>
    </div>
  );

  const renderGrievances = () => (
    <div className={`space-y-6 animate-in fade-in ${theme==='dark'?'text-white':'text-gray-900'}`}>
      <h2 className="text-2xl font-bold flex items-center gap-2"><MessageSquare className="w-6 h-6 text-blue-500"/> Grievances</h2>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
        {grievances.length === 0 ? <p className="text-gray-500 text-center py-4">No active grievances.</p> : grievances.map(g => <div key={g._id} className="p-3 border-b border-gray-100 dark:border-slate-700">{g.subject}</div>)}
      </div>
    </div>
  );

  const renderBroadcast = () => (
    <div className={`max-w-2xl mx-auto space-y-8 animate-in fade-in ${theme==='dark'?'text-white':'text-gray-900'}`}>
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-gray-200 dark:border-slate-700">
        <h3 className="text-xl font-bold !text-gray-900 dark:!text-white mb-6">System Broadcast</h3>
        <form className="space-y-4">
          <input className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg p-3 outline-none !text-gray-900 dark:!text-white" placeholder="Title" />
          <textarea className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg p-3 outline-none !text-gray-900 dark:!text-white" rows="4" placeholder="Message"></textarea>
          <button className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg">Send Broadcast</button>
        </form>
      </div>
    </div>
  );

  const renderLogs = () => (
    <div className={`space-y-6 animate-in fade-in ${theme==='dark'?'text-white':'text-gray-900'}`}>
      <h2 className="text-2xl font-bold flex items-center gap-2"><History className="w-6 h-6 text-purple-500"/> Audit Logs</h2>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 h-[60vh] overflow-y-auto">
        {logs.length === 0 ? <p className="text-gray-500 text-center">No logs found.</p> : logs.map((l,i) => <div key={i} className="p-2 border-b border-gray-100 dark:border-slate-700 text-sm">{l.action} - {new Date(l.timestamp).toLocaleString()}</div>)}
      </div>
    </div>
  );

  const renderTools = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700"><h3 className="text-lg font-bold !text-gray-900 dark:!text-white mb-4">AI Validator</h3><button onClick={() => setModals({ ...modals, naacUpload: true })} className="w-full py-2 bg-purple-600 text-white rounded-lg">Launch</button></div>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700"><h3 className="text-lg font-bold !text-gray-900 dark:!text-white mb-4">Scanner</h3><button className="w-full py-2 bg-blue-600 text-white rounded-lg">Open</button></div>
    </div>
  );

  // --- AUTH CHECK ---
  if (!isAuthenticated) return <div className="min-h-screen bg-gray-100 dark:bg-slate-950 flex items-center justify-center p-4"><div className="w-full max-w-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-8 shadow-2xl"><h1 className="text-2xl font-bold !text-gray-900 dark:!text-white text-center mb-8">Admin Login</h1><form onSubmit={handleLogin} className="space-y-5"><input value={loginCreds.username} onChange={e => setLoginCreds({ ...loginCreds, username: e.target.value })} className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-700 p-3 rounded-lg !text-gray-900 dark:!text-white outline-none" placeholder="Username" /><input type="password" value={loginCreds.password} onChange={e => setLoginCreds({ ...loginCreds, password: e.target.value })} className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-slate-700 p-3 rounded-lg !text-gray-900 dark:!text-white outline-none" placeholder="Password" /><button className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-lg text-white font-bold">Login</button></form></div></div>;

  return (
    <div className={`min-h-screen font-sans flex overflow-hidden ${theme === 'dark' ? 'bg-slate-950 text-slate-200' : 'bg-gray-50 text-gray-800'}`}>
      <aside className={`w-64 border-r flex flex-col h-screen fixed z-10 backdrop-blur-sm ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white/80 border-gray-200'}`}>
        <div className={`p-6 border-b flex items-center gap-3 ${theme === 'dark' ? 'border-slate-800' : 'border-gray-200'}`}><span className="font-bold text-2xl">Admin Panel</span></div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveView(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeView === item.id ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-gray-100 dark:hover:bg-white/5'}`}><item.icon className="w-5 h-5" />{item.label}</button>
          ))}
        </nav>
        <div className={`p-4 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-gray-200'} space-y-2`}>
           <button onClick={() => { setIsAuthenticated(false); localStorage.removeItem('adminToken'); }} className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm w-full px-4 py-2 rounded hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"><LogOut className="w-4 h-4" /> Sign Out</button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8 h-screen overflow-y-auto custom-scrollbar">
        <header className="flex justify-between items-center mb-8">
           <h1 className="text-2xl font-bold capitalize">{activeView.replace('_', ' ')}</h1>
           <div className={`border rounded-full px-4 py-2 flex items-center gap-2 shadow-sm ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`}><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div><span className="text-xs text-emerald-500 font-mono font-bold">ONLINE</span></div>
        </header>

        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'institutes' && renderInstitutes()}
        {activeView === 'schemes' && renderSchemes()}
        {activeView === 'institute_details' && renderInstituteDetails()}
        {activeView === 'institute_students' && renderInstituteStudents()}
        {activeView === 'institute_faculty' && renderInstituteFaculty()}
        {activeView === 'requests' && renderRequests()}
        {activeView === 'support' && renderRequests()}
        {activeView === 'grievance' && renderGrievances()}
        {activeView === 'broadcast' && renderBroadcast()}
        {activeView === 'tools' && renderTools()}
        {activeView === 'logs' && renderLogs()}
      </main>

      {/* MODAL: ADD INSTITUTE */}
      <Modal isOpen={modals.addInstitute} title={newInst.requestId ? "Approve Request & Create" : "Register New Institute"} onClose={() => setModals({ ...modals, addInstitute: false })}>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          <input placeholder="Institute Name *" className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-3 rounded-lg text-gray-900 dark:text-white focus:border-indigo-500 outline-none" value={newInst.name} onChange={e => setNewInst({ ...newInst, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Institute Code *" className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-3 rounded-lg text-gray-900 dark:text-white focus:border-indigo-500 outline-none" value={newInst.code} onChange={e => setNewInst({ ...newInst, code: e.target.value })} required />
            <input placeholder="AISHE Code *" className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-3 rounded-lg text-gray-900 dark:text-white focus:border-indigo-500 outline-none" value={newInst.aisheCode} onChange={e => setNewInst({ ...newInst, aisheCode: e.target.value })} required />
          </div>
          <input placeholder="Email *" className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-3 rounded-lg text-gray-900 dark:text-white focus:border-indigo-500 outline-none" value={newInst.email} onChange={e => setNewInst({ ...newInst, email: e.target.value })} required />
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
            <button onClick={() => setModals({ ...modals, addInstitute: false })} className="px-4 py-2 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors">Cancel</button>
            <button onClick={handleCreateInstitute} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-white font-bold flex items-center gap-2 transition-colors">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}{newInst.requestId ? "Approve & Create" : "Create Account"}
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL: GOVERNANCE CONTROLS */}
      <Modal isOpen={modals.instituteDetail} title="Governance Controls" onClose={() => setModals({ ...modals, instituteDetail: false })}>
        {selectedInstitute && (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg space-y-2 border border-gray-200 dark:border-slate-700">
              <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400 text-sm">Target:</span><span className="font-bold !text-gray-900 dark:!text-white">{selectedInstitute.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400 text-sm">Status:</span><span className={`font-bold ${selectedInstitute.status === 'Active' ? 'text-emerald-500' : 'text-amber-500'}`}>{selectedInstitute.status}</span></div>
            </div>
            <div className="space-y-3">
              <p className="text-xs uppercase font-bold text-gray-500 dark:text-slate-500 mb-2">Actions</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleStatusUpdate(selectedInstitute._id, 'Active')} className="bg-emerald-50 dark:bg-emerald-600/20 hover:bg-emerald-100 dark:hover:bg-emerald-600/40 border border-emerald-200 dark:border-emerald-500/50 text-emerald-600 dark:text-emerald-400 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors font-semibold"><UserCheck className="w-4 h-4" /> Activate</button>
                <button onClick={() => handleStatusUpdate(selectedInstitute._id, 'Suspended')} className="bg-amber-50 dark:bg-amber-600/20 hover:bg-amber-100 dark:hover:bg-amber-600/40 border border-amber-200 dark:border-amber-500/50 text-amber-600 dark:text-amber-400 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors font-semibold"><AlertTriangle className="w-4 h-4" /> Suspend</button>
              </div>
              <button onClick={() => handleDeleteInstitute(selectedInstitute._id)} className="w-full bg-rose-50 dark:bg-rose-600/20 hover:bg-rose-100 dark:hover:bg-rose-600/40 border border-rose-200 dark:border-rose-500/50 text-rose-600 dark:text-rose-400 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors font-bold"><Trash2 className="w-4 h-4" /> DELETE ACCOUNT</button>
            </div>
          </div>
        )}
      </Modal>

      {/* TOAST */}
      {toast && (<div className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-xl border flex items-center gap-3 z-50 ${toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}><Check className="w-5 h-5" /><span className="font-medium">{toast.msg}</span></div>)}
    </div>
  );
};

export default AdminPanel;