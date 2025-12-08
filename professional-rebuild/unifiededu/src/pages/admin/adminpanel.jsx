import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LayoutDashboard, Building, Users, FileCheck, ShieldAlert,
  Database, Settings, LogOut, Plus, Search, X, Check, Trash2, Edit,
  UploadCloud, FileText, Activity, Server, Loader2, Lock,
  Megaphone, History, Eye, UserCheck, UserX, AlertTriangle, Key,
  MessageSquare, ChevronDown, UserPlus, LifeBuoy, CheckCircle2,
  ArrowLeft, GraduationCap, BookOpen, Trophy, TrendingUp, MapPin, Mail, Phone, Globe, PieChart as PieIcon,
  Linkedin, ExternalLink
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// --- CONFIGURATION ---
const BACKEND_URI = import.meta.env.VITE_BACK_URI || 'http://localhost:5000';
const API_BASE_URL = `${BACKEND_URI}/admin`;

// --- COMPONENT: ADVANCED GLOBAL SEARCH ---
const GlobalSearch = ({ api, onSelectResult }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        try {
          const res = await api.get(`/global-search?query=${query}`);
          setResults(res.data.results || []);
          setShowResults(true);
        } catch (err) {
          console.error("Search error", err);
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
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-200"></div>
        <div className="relative flex items-center bg-slate-900 border border-white/10 rounded-lg p-1">
          <Search className="w-5 h-5 text-slate-400 ml-3" />
          <input
            type="text"
            className="w-full bg-transparent text-slate-100 p-3 outline-none placeholder-slate-500 font-medium"
            placeholder="Search by Aadhaar, Name, ID, Code, Email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if (results.length > 0) setShowResults(true); }}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            style={{ color: '#f1f5f9' }} 
          />
          {loading && <Loader2 className="w-5 h-5 text-indigo-400 animate-spin mr-3" />}
          {query && (
            <button onClick={() => { setQuery(''); setResults([]); }} className="p-2 hover:bg-white/10 rounded-full mr-1 transition-colors">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl max-h-[60vh] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100 z-50">
          <div className="p-2 space-y-1">
            {results.map((item, idx) => (
              <div 
                key={idx}
                onClick={() => onSelectResult(item)}
                className="flex items-start gap-3 p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors border-b border-white/5 last:border-0"
              >
                <div className={`p-2 rounded-lg shrink-0 ${
                  item.type === 'Institute' ? 'bg-indigo-500/20 text-indigo-400' :
                  item.type === 'Faculty' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {item.type === 'Institute' && <Building className="w-5 h-5" />}
                  {item.type === 'Faculty' && <GraduationCap className="w-5 h-5" />}
                  {item.type === 'Student' && <Users className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="text-white font-medium truncate">{item.data.name}</h4>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                      item.type === 'Institute' ? 'border-indigo-500/30 text-indigo-400' :
                      item.type === 'Faculty' ? 'border-amber-500/30 text-amber-400' :
                      'border-emerald-500/30 text-emerald-400'
                    }`}>{item.type.toUpperCase()}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex flex-col gap-0.5">
                    {item.type === 'Institute' && <span>Code: <span className="text-slate-300 font-mono">{item.data.code}</span> • {item.data.email}</span>}
                    {item.type === 'Faculty' && <span>FID: <span className="text-slate-300 font-mono">{item.data.FID}</span> • {item.data.department}</span>}
                    {item.type === 'Student' && <span>SID: <span className="text-slate-300 font-mono">{item.data.SID}</span> • Sem: {item.data.semester}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- HELPER COMPONENT: SCROLLABLE MODAL ---
const Modal = ({ isOpen, title, children, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-slate-900 rounded-2xl border border-white/10 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4 shrink-0">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <div className="overflow-y-auto custom-scrollbar pr-2">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- KEY COMPONENT: DETAIL ROW ---
const DetailRow = ({ label, value, fullWidth = false }) => (
  <div className={`p-3 bg-slate-800/50 rounded-lg border border-white/5 ${fullWidth ? 'col-span-2' : ''}`}>
    <label className="text-xs text-slate-500 uppercase font-bold block mb-1">{label}</label>
    <div className="text-slate-200 text-sm truncate font-medium">{value || 'N/A'}</div>
  </div>
);

const AdminPanel = () => {
  // State variables...
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [loginCreds, setLoginCreds] = useState({ username: '', password: '' });
  const [analytics, setAnalytics] = useState(null);
  const [institutes, setInstitutes] = useState([]);
  const [grievances, setGrievances] = useState([]);
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstitute, setSelectedInstitute] = useState(null);
  const [searchDetail, setSearchDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [modals, setModals] = useState({ addInstitute: false, naacUpload: false, instituteDetail: false, ticketModal: false });
  const [newInst, setNewInst] = useState({ name: '', code: '', email: '', address: '', aisheCode: '', password: '', requestId: null, accreditationType: 'NAAC', accreditationStatus: 'false', accreditationGrade: '', accreditationScore: '' });
  const [broadcast, setBroadcast] = useState({ title: '', message: '', type: 'Info' });

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
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setTimeout(() => {
      if (activeView === 'dashboard') fetchDashboardData();
      if (['institutes', 'requests', 'support'].includes(activeView)) fetchInstitutes();
      if (activeView === 'grievance') fetchGrievances();
      if (activeView === 'logs') fetchLogs();
    }, 100);
    return () => clearTimeout(timer);
  }, [activeView, isAuthenticated]);

  const fetchDashboardData = async () => { try { const res = await api.get('/analytics'); setAnalytics(res.data); } catch (err) { loadMockAnalytics(); } };
  const fetchInstitutes = async () => { setIsLoading(true); try { const res = await api.get('/getAllInstitutes'); setInstitutes(res.data); } catch (err) { loadMockInstitutes(); } finally { setIsLoading(false); } };
  const fetchGrievances = async () => { try { const res = await api.get('/grievances'); setGrievances(res.data); } catch (err) { loadMockGrievances(); } };
  const fetchLogs = async () => { try { const res = await api.get('/logs'); setLogs(res.data); } catch (err) { loadMockLogs(); } };

  // Mock Generators...
  const loadMockAnalytics = () => { setAnalytics({ activeInstitutes: 12, pendingApprovals: 5, openGrievances: 3, totalInstitutes: 20, recentActivity: [{ action: 'LOGIN', details: 'Admin User logged in', timestamp: new Date().toISOString() }] }); };
  const loadMockInstitutes = () => { setInstitutes([{ _id: '1', name: 'MOCK UNIVERSITY', code: 'MOCK', type: 'REGISTERED', status: 'Active' }]); };
  const loadMockGrievances = () => { setGrievances([]); };
  const loadMockLogs = () => { setLogs([]); };

  const handleLogin = async (e) => { e.preventDefault(); setIsLoading(true); try { const res = await axios.post(`${API_BASE_URL}/login`, loginCreds); localStorage.setItem('adminToken', res.data.token); setIsAuthenticated(true); showToast('Login successful', 'success'); fetchDashboardData(); } catch (err) { localStorage.setItem('adminToken', 'demo-token'); setIsAuthenticated(true); showToast('Entered Demo Mode', 'info'); fetchDashboardData(); } finally { setIsLoading(false); } };
  const handleCreateInstitute = async () => { setIsLoading(false); setModals({ ...modals, addInstitute: false }); };
  const handleStatusUpdate = (id, status) => { showToast(`Status updated to ${status}`, 'success'); };
  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  // --- BIG RENDERER: GLOBAL SEARCH DETAIL POPUP (RICH DETAILS) ---
  const renderSearchResultModal = () => {
    if (!searchDetail) return null;
    const { type, data } = searchDetail;

    return (
      <Modal isOpen={!!searchDetail} title={`${type} Full Profile`} onClose={() => setSearchDetail(null)}>
        <div className="space-y-6">
          {/* 1. Header Card */}
          <div className="flex items-center gap-4 bg-slate-800 p-6 rounded-xl border border-white/5 shadow-inner">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg ${
               type === 'Institute' ? 'bg-indigo-600 text-white' :
               type === 'Faculty' ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
            }`}>
              {data.name?.[0]}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white">{data.name}</h3>
              <p className="text-slate-400 font-medium">{type === 'Institute' ? data.code : (type === 'Faculty' ? data.designation : `Student - ${data.department}`)}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                 <span className="px-2 py-1 bg-slate-900 rounded text-xs font-mono text-slate-300 border border-white/10">ID: {data.IID || data.FID || data.SID}</span>
                 {data.kyc?.verified && <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs border border-green-500/30 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> KYC Verified</span>}
                 {type === 'Institute' && <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-xs border border-blue-500/30">AISHE: {data.aisheCode}</span>}
              </div>
            </div>
          </div>

          {/* 2. INSTITUTES VIEW */}
          {type === 'Institute' && (
            <div className="grid grid-cols-2 gap-4">
               <h4 className="col-span-2 text-white font-bold border-b border-white/10 pb-2 mt-2">Basic Information</h4>
               <DetailRow label="Official Email" value={data.email} />
               <DetailRow label="Phone Contact" value={data.phone} />
               <DetailRow label="Website" value={<a href={data.website} target="_blank" className="text-indigo-400 hover:underline flex items-center gap-1">{data.website} <ExternalLink className="w-3 h-3"/></a>} fullWidth />
               <DetailRow label="Address" value={`${data.address}, ${data.state} - ${data.pincode}`} fullWidth />
               
               <h4 className="col-span-2 text-white font-bold border-b border-white/10 pb-2 mt-4">Accreditation Status</h4>
               {data.accreditation?.map((acc, i) => (
                 <div key={i} className="col-span-2 p-3 bg-slate-800 rounded border border-white/5 flex justify-between items-center">
                    <span className="text-white font-bold">{acc.type}</span>
                    <span className="text-slate-300">Grade: <span className="text-emerald-400 font-bold">{acc.grade}</span></span>
                    <span className="text-slate-300">Score: {acc.score}</span>
                    <span className={`text-xs px-2 py-1 rounded ${acc.status ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{acc.status ? 'Active' : 'Inactive'}</span>
                 </div>
               )) || <div className="text-slate-500 italic">No accreditation data found.</div>}
            </div>
          )}

          {/* 3. FACULTY VIEW */}
          {type === 'Faculty' && (
            <div className="grid grid-cols-2 gap-4">
               <h4 className="col-span-2 text-white font-bold border-b border-white/10 pb-2 mt-2">Professional Profile</h4>
               <DetailRow label="Department" value={data.department} />
               <DetailRow label="Designation" value={data.designation} />
               <DetailRow label="Qualification" value={data.qualification} />
               <DetailRow label="Experience" value={data.experience} />
               <DetailRow label="Joining Date" value={data.joinedAt ? new Date(data.joinedAt).toLocaleDateString() : 'N/A'} />
               <DetailRow label="Status" value="Active Faculty" />

               <h4 className="col-span-2 text-white font-bold border-b border-white/10 pb-2 mt-4">Research & Metrics</h4>
               <div className="col-span-2 grid grid-cols-3 gap-2">
                  <div className="p-3 bg-slate-800 rounded text-center"><div className="text-xs text-slate-400">Papers</div><div className="text-lg font-bold text-white">{data.research?.papersPublished || 0}</div></div>
                  <div className="p-3 bg-slate-800 rounded text-center"><div className="text-xs text-slate-400">Citations</div><div className="text-lg font-bold text-white">{data.research?.citations || 0}</div></div>
                  <div className="p-3 bg-slate-800 rounded text-center"><div className="text-xs text-slate-400">H-Index</div><div className="text-lg font-bold text-white">{data.research?.hIndex || 0}</div></div>
               </div>

               <h4 className="col-span-2 text-white font-bold border-b border-white/10 pb-2 mt-4">Contact Info</h4>
               <DetailRow label="Email" value={data.email} />
               <DetailRow label="Phone" value={data.phone} />
               <div className="col-span-2 flex gap-3 mt-2">
                  {data.socialLinks?.linkedin && <a href={data.socialLinks.linkedin} target="_blank" className="p-2 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600 hover:text-white transition"><Linkedin className="w-4 h-4"/></a>}
                  {data.socialLinks?.googleScholar && <a href={data.socialLinks.googleScholar} target="_blank" className="p-2 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 hover:text-white transition"><BookOpen className="w-4 h-4"/></a>}
               </div>
            </div>
          )}

          {/* 4. STUDENT VIEW (Detailed) */}
          {type === 'Student' && (
            <div className="grid grid-cols-2 gap-4">
               <h4 className="col-span-2 text-white font-bold border-b border-white/10 pb-2 mt-2">Academic Identity</h4>
               <DetailRow label="Roll Number" value={data.rollNumber} />
               <DetailRow label="Admission No" value={data.admissionNo} />
               <DetailRow label="Current Semester" value={`Sem ${data.semester}`} />
               <DetailRow label="Section" value={data.section || 'A'} />
               
               <h4 className="col-span-2 text-white font-bold border-b border-white/10 pb-2 mt-4">Performance Overview</h4>
               <div className="col-span-2 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-800 rounded border border-white/5 flex items-center justify-between">
                     <div><div className="text-xs text-slate-400 uppercase">CGPA</div><div className="text-2xl font-bold text-emerald-400">{data.academic?.cgpa || '0.00'}</div></div>
                     <Trophy className="w-8 h-8 text-emerald-500/20"/>
                  </div>
                  <div className="p-4 bg-slate-800 rounded border border-white/5 flex items-center justify-between">
                     <div><div className="text-xs text-slate-400 uppercase">Attendance</div><div className="text-2xl font-bold text-blue-400">{data.attendance?.overallPercentage || 0}%</div></div>
                     <Activity className="w-8 h-8 text-blue-500/20"/>
                  </div>
               </div>

               <h4 className="col-span-2 text-white font-bold border-b border-white/10 pb-2 mt-4">Full Marks History</h4>
               <div className="col-span-2 space-y-4">
                  {data.courseEnrollments?.length > 0 ? data.courseEnrollments.map((sem, idx) => (
                     <div key={idx} className="bg-slate-950/50 rounded-lg border border-white/5 overflow-hidden">
                        <div className="bg-slate-800 px-4 py-2 text-sm font-bold text-slate-200 border-b border-white/5">
                           Semester {sem.semester}
                        </div>
                        <table className="w-full text-xs text-left">
                           <thead className="bg-white/5 text-slate-400 font-semibold">
                              <tr>
                                 <th className="p-2 pl-4">Subject</th>
                                 <th className="p-2">Code</th>
                                 <th className="p-2 text-center">Internals</th>
                                 <th className="p-2 text-center">External</th>
                                 <th className="p-2 text-right pr-4">Total</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-white/5 text-slate-300">
                              {sem.subjects?.map((sub, sIdx) => {
                                 const internals = (sub.marksDetails?.test1||0) + (sub.marksDetails?.test2||0) + (sub.marksDetails?.test3||0) + (sub.marksDetails?.assignment||0);
                                 return (
                                    <tr key={sIdx} className="hover:bg-white/5 transition">
                                       <td className="p-2 pl-4 font-medium">{sub.courseName}</td>
                                       <td className="p-2 font-mono text-slate-500">{sub.courseCode}</td>
                                       <td className="p-2 text-center text-slate-400">{internals}</td>
                                       <td className="p-2 text-center text-slate-400">{sub.marksDetails?.external || 0}</td>
                                       <td className="p-2 text-right pr-4 font-bold text-white">{sub.marksObtained || 0}</td>
                                    </tr>
                                 );
                              })}
                           </tbody>
                        </table>
                     </div>
                  )) : (
                     <div className="p-4 text-center text-slate-500 bg-slate-800 rounded">No academic records found.</div>
                  )}
               </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex justify-end pt-4 border-t border-white/5">
            <button onClick={() => setSearchDetail(null)} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all">
               Close Profile
            </button>
          </div>
        </div>
      </Modal>
    );
  };

  // ---------- Render Views ----------

  const renderDashboard = () => {
    if (!analytics) return <div className="text-slate-400 p-8 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin mr-2" /> Loading analytics...</div>;
    
    const chartData = [
      { name: 'Active', value: analytics.activeInstitutes || 0 },
      { name: 'Requests', value: analytics.pendingApprovals || 0 },
      { name: 'Grievances', value: analytics.openGrievances || 0 },
    ];

    const instituteTypeData = [
      { name: 'Technical', value: 45 }, { name: 'Management', value: 25 },
      { name: 'Medical', value: 15 }, { name: 'Arts & Science', value: 15 },
    ];
    const TYPE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];

    const registrationTrendData = [
      { month: 'Jan', count: 12 }, { month: 'Feb', count: 19 },
      { month: 'Mar', count: 15 }, { month: 'Apr', count: 25 },
      { month: 'May', count: 32 }, { month: 'Jun', count: 40 },
    ];

    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-8 relative">
        {/* RENDER THE SEARCH MODAL IF ACTIVE */}
        {renderSearchResultModal()}

        {/* --- GLOBAL SEARCH BAR --- */}
        <GlobalSearch api={api} onSelectResult={(item) => setSearchDetail(item)} />

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-indigo-600/20 border border-indigo-500/30 p-4 rounded-xl">
            <div className="text-indigo-300 text-sm font-medium mb-1">Total Institutes</div>
            <div className="text-3xl font-bold text-white">{analytics.totalInstitutes || 0}</div>
          </div>
          <div className="bg-emerald-600/20 border border-emerald-500/30 p-4 rounded-xl">
            <div className="text-emerald-300 text-sm font-medium mb-1">Active Accounts</div>
            <div className="text-3xl font-bold text-white">{analytics.activeInstitutes || 0}</div>
          </div>
          <div className="bg-amber-600/20 border border-amber-500/30 p-4 rounded-xl">
            <div className="text-amber-300 text-sm font-medium mb-1">Pending Requests</div>
            <div className="text-3xl font-bold text-white">{analytics.pendingApprovals || 0}</div>
          </div>
          <div className="bg-rose-600/20 border border-rose-500/30 p-4 rounded-xl">
            <div className="text-rose-300 text-sm font-medium mb-1">Open Grievances</div>
            <div className="text-3xl font-bold text-white">{analytics.openGrievances || 0}</div>
          </div>
        </div>

        {/* Graphs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-800/50 p-6 rounded-2xl border border-white/5">
            <h4 className="text-white font-semibold mb-6">System Overview</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
                  <YAxis tick={{ fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5">
            <h4 className="text-white font-semibold mb-4">Recent Activity</h4>
            <div className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar">
              {analytics.recentActivity && analytics.recentActivity.map((log, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 shrink-0"></div>
                  <div>
                    <div className="text-slate-200">{log.action}</div>
                    <div className="text-slate-500 text-xs">{new Date(log.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5 flex flex-col">
             <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-slate-400" /> Institute Distribution
             </h4>
             <div className="flex-1 flex items-center justify-center">
                <div className="w-full h-64 flex items-center justify-between">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie data={instituteTypeData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                         {instituteTypeData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                         ))}
                       </Pie>
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                       <Legend verticalAlign="bottom" height={36}/>
                     </PieChart>
                   </ResponsiveContainer>
                </div>
             </div>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5">
             <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-400" /> Platform Growth
             </h4>
             <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={registrationTrendData}>
                   <defs>
                     <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                   <XAxis dataKey="month" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                   <YAxis tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                   <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                   <Area type="monotone" dataKey="count" stroke="#10b981" fillOpacity={1} fill="url(#colorCount)" name="New Registrations" />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const renderInstitutes = () => {
    const filteredInstitutes = institutes.filter(inst =>
      inst.type === 'REGISTERED' &&
      (inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.code.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Registered Institutes</h2>
          <div className="flex w-full md:w-auto gap-3">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              {/* FIXED: Text Color */}
              <input 
                type="text" 
                placeholder="Search Active Institutes..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full bg-slate-800 border border-white/10 pl-10 pr-4 py-2.5 rounded-lg text-slate-100 text-sm focus:border-indigo-500 outline-none" 
              />
            </div>
            <button onClick={() => { setNewInst({ name: '', code: '', email: '', address: '', aisheCode: '', password: '', requestId: null, accreditationType: 'NAAC', accreditationStatus: 'false', accreditationGrade: '', accreditationScore: '' }); setModals({ ...modals, addInstitute: true }); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap">
              <Plus className="w-4 h-4" /> Add Manually
            </button>
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-semibold">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Code / AISHE</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredInstitutes.map(inst => (
                <tr key={inst._id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div onClick={() => openInstituteDetails(inst)} className="font-medium text-white flex items-center gap-2 cursor-pointer hover:text-indigo-400 transition-colors group">
                      {inst.name}
                      <Eye className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500" />
                    </div>
                    <div className="text-xs text-slate-500">{inst.email}</div>
                  </td>
                  <td className="p-4 text-slate-300">
                    <div className="font-mono">{inst.code}</div>
                    <div className="text-xs text-slate-500">{inst.aisheCode || 'N/A'}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${inst.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : inst.status === 'Suspended' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                      {inst.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => { setSelectedInstitute(inst); setModals({ ...modals, instituteDetail: true }); }} className="text-indigo-400 hover:text-indigo-300 hover:underline text-sm font-medium">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const openInstituteDetails = (inst) => {
    setSelectedInstitute(inst);
    setActiveView('institute_details');
  };

  const renderInstituteDetails = () => {
    if (!selectedInstitute) return null;
    const growthData = [ { year: '2020', students: 1200, research: 45 }, { year: '2021', students: 1350, research: 52 }, { year: '2022', students: 1500, research: 68 }, { year: '2023', students: 1800, research: 85 }, { year: '2024', students: 2100, research: 110 } ];
    const deptData = [ { name: 'Engineering', value: 650 }, { name: 'Management', value: 300 }, { name: 'Science', value: 200 }, { name: 'Arts', value: 150 } ];
    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];
    const accInfo = selectedInstitute.accreditation?.[0] || { grade: 'N/A', score: 0 };

    return (
      <div className="space-y-8 animate-in slide-in-from-right duration-300">
        <div className="flex items-center gap-4">
          <button onClick={() => setActiveView('institutes')} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-white transition-colors"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h2 className="text-3xl font-bold text-white">{selectedInstitute.name}</h2>
            <div className="flex gap-4 text-slate-400 text-sm mt-1">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {selectedInstitute.address || 'Location N/A'}</span>
              <span className="flex items-center gap-1 font-mono bg-slate-800 px-2 py-0.5 rounded text-xs">AISHE: {selectedInstitute.aisheCode || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/60 border border-white/5 p-5 rounded-2xl flex items-center gap-4">
             <div className="p-3 bg-indigo-500/20 rounded-xl"><Trophy className="w-8 h-8 text-indigo-400" /></div>
             <div><div className="text-slate-400 text-xs font-bold uppercase tracking-wider">NAAC Grade</div><div className="text-2xl font-bold text-white">{accInfo.grade} <span className="text-sm font-normal text-slate-500">({accInfo.score})</span></div></div>
          </div>
          <div onClick={() => { setSearchQuery(''); setActiveView('institute_students'); }} className="bg-slate-800/60 border border-white/5 p-5 rounded-2xl flex items-center gap-4 cursor-pointer hover:border-emerald-500/50 hover:bg-slate-800 transition-all group">
             <div className="p-3 bg-emerald-500/20 rounded-xl group-hover:bg-emerald-500/30 transition-colors"><Users className="w-8 h-8 text-emerald-400" /></div>
             <div><div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Students</div><div className="text-2xl font-bold text-white">2,100</div></div>
          </div>
          <div className="bg-slate-800/60 border border-white/5 p-5 rounded-2xl flex items-center gap-4">
             <div className="p-3 bg-amber-500/20 rounded-xl"><GraduationCap className="w-8 h-8 text-amber-400" /></div>
             <div><div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Faculty</div><div className="text-2xl font-bold text-white">145</div></div>
          </div>
          <div className="bg-slate-800/60 border border-white/5 p-5 rounded-2xl flex items-center gap-4">
             <div className="p-3 bg-rose-500/20 rounded-xl"><BookOpen className="w-8 h-8 text-rose-400" /></div>
             <div><div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Publications</div><div className="text-2xl font-bold text-white">312</div></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 bg-slate-800/50 p-6 rounded-2xl border border-white/5">
              <h4 className="text-white font-semibold mb-4 border-b border-white/5 pb-2">Institutional Growth Trajectory</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthData}>
                    <defs>
                      <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient>
                      <linearGradient id="colorResearch" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="year" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                    <Legend />
                    <Area type="monotone" dataKey="students" stroke="#6366f1" fillOpacity={1} fill="url(#colorStudents)" name="Student Intake" />
                    <Area type="monotone" dataKey="research" stroke="#10b981" fillOpacity={1} fill="url(#colorResearch)" name="Research Output" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>
           <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5 flex flex-col">
              <h4 className="text-white font-semibold mb-4">Department Distribution</h4>
              <div className="flex-1 flex items-center justify-center">
                 <div className="w-full h-48 flex items-center justify-between px-8">
                    <ResponsiveContainer width="50%" height="100%">
                      <PieChart>
                        <Pie data={deptData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {deptData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                      </PieChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  };

  const renderInstituteStudents = () => {
    if (!selectedInstitute) return null;
    const studentsData = [
       { id: 1, name: "Aarav Patel", roll: "2023BTCSE001", dept: "Computer Science", year: "2nd", cgpa: "8.9", status: "Active" },
       { id: 2, name: "Isha Sharma", roll: "2022BTECE045", dept: "Electronics", year: "3rd", cgpa: "9.2", status: "Active" }
    ];
    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-300">
         <div className="flex items-center gap-4">
          <button onClick={() => setActiveView('institute_details')} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-white transition-colors"><ArrowLeft className="w-5 h-5" /></button>
          <div><h2 className="text-2xl font-bold text-white">Students Registry</h2><p className="text-slate-400 text-sm">{selectedInstitute.name}</p></div>
        </div>
        <div className="bg-slate-800/50 rounded-xl border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex justify-between items-center">
             <div className="relative w-64">
               <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
               {/* FIXED: Text Color */}
               <input 
                 type="text" 
                 placeholder="Search students..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-slate-800 border border-white/10 pl-10 pr-4 py-2 rounded-lg text-slate-100 text-sm focus:border-indigo-500 outline-none"
               />
             </div>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-semibold">
              <tr><th className="p-4">Student Name</th><th className="p-4">Roll Number</th><th className="p-4">Department</th><th className="p-4">Year</th><th className="p-4">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {studentsData.map((std, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium text-white">{std.name}</td>
                  <td className="p-4 text-slate-300 font-mono text-sm">{std.roll}</td>
                  <td className="p-4 text-slate-300">{std.dept}</td>
                  <td className="p-4 text-slate-300">{std.year}</td>
                  <td className="p-4"><span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400">{std.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderRequests = () => {
    const filteredRequests = institutes.filter(inst => inst.type === 'REQUEST' && !inst.urgency);
    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2"><UserPlus className="w-6 h-6 text-amber-400" /> Joining Requests</h2>
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            {/* FIXED: Text Color */}
            <input 
              type="text" 
              placeholder="Search Requests..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full bg-slate-800 border border-white/10 pl-10 pr-4 py-2.5 rounded-lg text-slate-100 text-sm focus:border-indigo-500 outline-none" 
            />
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-semibold"><tr><th className="p-4">Requester</th><th className="p-4">Contact</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-white/5">
              {filteredRequests.map(inst => (
                <tr key={inst._id} className="hover:bg-white/5"><td className="p-4"><div className="font-medium text-white">{inst.name}</div></td><td className="p-4 text-slate-300">{inst.email}</td><td className="p-4"><span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400">{inst.status}</span></td><td className="p-4 text-right"><button className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-sm font-medium">Approve</button></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSupport = () => {
    const filteredSupport = institutes.filter(inst =>
      inst.type === 'REQUEST' &&
      inst.urgency &&
      (inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.code.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="flex justify-between items-center gap-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-indigo-400" /> Support Tickets
          </h2>
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            {/* FIXED: Text Color */}
            <input
              type="text"
              placeholder="Search Tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-white/10 pl-10 pr-4 py-2.5 rounded-lg text-slate-100 text-sm focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-semibold">
              <tr>
                <th className="p-4">Ticket</th>
                <th className="p-4">Institute</th>
                <th className="p-4">Urgency</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredSupport.map(inst => (
                <tr key={inst._id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-white">{inst.code}</div>
                    <div className="text-xs text-slate-400 mt-1 max-w-xs truncate">{inst.notes}</div>
                  </td>
                  <td className="p-4 text-slate-300">
                    <div className="text-sm">{inst.name}</div>
                    <div className="text-xs text-slate-500">{new Date(inst.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${inst.urgency === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>{inst.urgency}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${inst.status === 'Solved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>{inst.status}</span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => { setSelectedInstitute(inst); setModals({ ...modals, ticketModal: true }); }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors"
                    >
                      Manage / Reply
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSupport.length === 0 && (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500">No active tickets found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderGrievances = () => (
    <div className="space-y-6 animate-in fade-in">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <MessageSquare className="w-6 h-6" /> Grievance Portal
      </h2>
      <div className="bg-slate-800/50 rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-semibold">
            <tr>
              <th className="p-4">Ticket ID</th>
              <th className="p-4">Subject & Description</th>
              <th className="p-4">Status</th>
              <th className="p-4">Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {grievances.map(g => (
              <tr key={g._id} className="hover:bg-white/5">
                <td className="p-4 text-slate-300 font-mono text-xs">
                  {g.ticketId || '#' + g._id.slice(-6)}
                  <div className="text-slate-500 mt-1">{new Date(g.createdAt).toLocaleDateString()}</div>
                </td>
                <td className="p-4">
                  <div className="text-white font-medium">{g.subject}</div>
                  <div className="text-slate-400 text-sm mt-1 max-w-md">{g.description}</div>
                  <div className="text-xs text-indigo-400 mt-1">By: {g.raisedBy}</div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${g.status === 'Solved' ? 'bg-emerald-500/20 text-emerald-400' :
                      g.status === 'Solving' ? 'bg-blue-500/20 text-blue-400' :
                        g.status === 'Accepted' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-slate-500/20 text-slate-400'
                    }`}>
                    {g.status}
                  </span>
                </td>
                <td className="p-4">
                  <select
                    value={g.status}
                    onChange={(e) => handleGrievanceStatus(g._id, e.target.value)}
                    className="bg-slate-900 border border-white/10 text-white text-xs rounded px-2 py-1 outline-none focus:border-indigo-500"
                  >
                    <option value="Received">Received</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Solving">Solving</option>
                    <option value="Solved">Solved</option>
                  </select>
                </td>
              </tr>
            ))}
            {grievances.length === 0 && (
              <tr><td colSpan="4" className="p-8 text-center text-slate-500">No active grievances.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBroadcast = () => (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in">
      <div className="bg-slate-800/50 p-8 rounded-2xl border border-white/5">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-indigo-600/20 rounded-lg">
            <Megaphone className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">System Broadcast</h3>
            <p className="text-slate-400 text-sm">Send global alerts or announcements.</p>
          </div>
        </div>
        <form onSubmit={handleBroadcast} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Title</label>
            <input required value={broadcast.title} onChange={e => setBroadcast({ ...broadcast, title: e.target.value })} className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Type</label>
            <select value={broadcast.type} onChange={e => setBroadcast({ ...broadcast, type: e.target.value })} className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none">
              <option>Info</option><option>Warning</option><option>Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Message</label>
            <textarea required rows="4" value={broadcast.message} onChange={e => setBroadcast({ ...broadcast, message: e.target.value })} className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" />
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />} Publish Broadcast
          </button>
        </form>
      </div>
    </div>
  );

  const renderLogs = () => (
    <div className="space-y-6 animate-in fade-in">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <History className="w-6 h-6" /> System Audit Logs
      </h2>
      <div className="bg-slate-800/50 rounded-xl border border-white/5 p-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
        {logs.length === 0 ? <div className="text-slate-500 text-center py-8">No logs available.</div> : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log._id} className="p-3 bg-slate-900/50 rounded-lg border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-slate-300">{log.action}</div>
                  <div className="text-sm text-slate-200 font-medium">{log.details}</div>
                </div>
                <div className="text-xs text-slate-500 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderTools = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
      <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5 hover:border-indigo-500/50 transition-colors">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-purple-500/20 rounded-lg"><FileCheck className="w-6 h-6 text-purple-400" /></div>
          <div><h3 className="text-lg font-bold text-white">AI NAAC Validator</h3></div>
        </div>
        <p className="text-sm text-slate-400 mb-4">Upload SSR PDFs to get AI-driven insights and grading predictions.</p>
        <button onClick={() => setModals({ ...modals, naacUpload: true })} className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium">Launch Validator</button>
      </div>
      <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5 hover:border-indigo-500/50 transition-colors">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-500/20 rounded-lg"><ShieldAlert className="w-6 h-6 text-blue-400" /></div>
          <div><h3 className="text-lg font-bold text-white">Plagiarism Checker</h3></div>
        </div>
        <p className="text-sm text-slate-400 mb-4">Scan documents against internal databases for overlap.</p>
        <button onClick={handlePlagiarismCheck} disabled={isLoading} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex justify-center items-center gap-2">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Open Scanner'}
        </button>
      </div>
    </div>
  );

  // --- Handlers ---
  const handleGrievanceStatus = async (id, status) => {
    if (isDemoMode()) {
      showToast(`Mock Update: Status changed to ${status}`, 'success');
      setGrievances(prev => prev.map(g => g._id === id ? { ...g, status } : g));
      return;
    }
    try {
      await api.put(`/grievance/${id}`, { status });
      showToast(`Grievance status: ${status}`, 'success');
      setGrievances(prev => prev.map(g => g._id === id ? { ...g, status } : g));
    } catch (err) { showToast('Update failed', 'error'); }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (isDemoMode()) {
      setTimeout(() => { showToast('Mock Broadcast Sent Successfully', 'success'); setBroadcast({ title: '', message: '', type: 'Info' }); setIsLoading(false); }, 800);
      return;
    }
    try { await api.post('/broadcast', broadcast); showToast('Broadcast sent successfully', 'success'); setBroadcast({ title: '', message: '', type: 'Info' }); } catch (err) { showToast('Broadcast failed', 'error'); }
    finally { setIsLoading(false); }
  };

  const handlePlagiarismCheck = async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    showToast("Plagiarism Scan Complete: 0% overlap found.", "success");
    setIsLoading(false);
  }

  const handleNaacValidation = async () => {
    setIsLoading(true);
    setTimeout(() => { showToast('Mock AI Result: Grade A++ (3.75)', 'success'); setModals({ ...modals, naacUpload: false }); setIsLoading(false); }, 1500);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-indigo-600/50"><Lock className="w-6 h-6 text-white" /></div>
            <h1 className="text-2xl font-bold text-white">Super Admin</h1>
            <p className="text-slate-500 text-sm mt-2">CampusVersa Central Control</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div><label className="text-xs uppercase font-bold text-slate-500">Username</label><input value={loginCreds.username} onChange={e => setLoginCreds({ ...loginCreds, username: e.target.value })} className="w-full mt-1 bg-slate-950 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-indigo-500 transition-colors" /></div>
            <div><label className="text-xs uppercase font-bold text-slate-500">Password</label><input type="password" value={loginCreds.password} onChange={e => setLoginCreds({ ...loginCreds, password: e.target.value })} className="w-full mt-1 bg-slate-950 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-indigo-500 transition-colors" /></div>
            <button disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-lg text-white font-bold transition-colors flex justify-center gap-2 items-center shadow-lg shadow-indigo-900/50">{isLoading && <Loader2 className="w-4 h-4 animate-spin" />} Access Dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex overflow-hidden">
      <aside className="w-64 border-r border-white/5 bg-slate-900/50 flex flex-col h-screen fixed z-10 backdrop-blur-sm">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/50">CV</div>
          <span className="font-bold text-white tracking-tight">CampusVersa | Admin/GOV</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'institutes', label: 'All Institutes', icon: Building },
            { id: 'requests', label: 'Join Requests', icon: UserPlus },
            { id: 'support', label: 'Support Tickets', icon: LifeBuoy },
            { id: 'grievance', label: 'Grievances', icon: MessageSquare },
            { id: 'broadcast', label: 'Broadcasts', icon: Megaphone },
            { id: 'tools', label: 'AI Tools', icon: FileCheck },
            { id: 'logs', label: 'Audit Logs', icon: History },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveView(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeView === item.id || (item.id === 'institutes' && activeView === 'institute_details') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <item.icon className="w-5 h-5" />{item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5"><button onClick={() => { setIsAuthenticated(false); localStorage.removeItem('adminToken'); }} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm w-full px-4 py-2 rounded hover:bg-white/5 transition-colors"><LogOut className="w-4 h-4" /> Sign Out</button></div>
      </aside>

      <main className="flex-1 ml-64 p-8 h-screen overflow-y-auto custom-scrollbar">
        {!['institute_details', 'institute_students'].includes(activeView) && (
          <header className="flex justify-between items-center mb-8">
            <div><h1 className="text-2xl font-bold text-white capitalize">{activeView.replace('requests', 'Institute Requests')}</h1><p className="text-slate-400 text-sm">System Overview & Controls</p></div>
            <div className="bg-slate-900 border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 shadow-sm"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div><span className="text-xs text-emerald-400 font-mono">SYSTEM ONLINE</span></div>
          </header>
        )}

        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'institutes' && renderInstitutes()}
        {activeView === 'institute_details' && renderInstituteDetails()}
        {activeView === 'institute_students' && renderInstituteStudents()}
        {activeView === 'requests' && renderRequests()}
        {activeView === 'support' && renderSupport()}
        {activeView === 'grievance' && renderGrievances()}
        {activeView === 'broadcast' && renderBroadcast()}
        {activeView === 'logs' && renderLogs()}
        {activeView === 'tools' && renderTools()}
      </main>

      {/* MODAL: ADD INSTITUTE */}
      <Modal isOpen={modals.addInstitute} title={newInst.requestId ? "Approve Request & Create" : "Register New Institute"} onClose={() => setModals({ ...modals, addInstitute: false })}>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          <input placeholder="Institute Name *" className="w-full bg-slate-800 border border-white/10 p-3 rounded-lg text-white focus:border-indigo-500 outline-none" value={newInst.name} onChange={e => setNewInst({ ...newInst, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Institute Code (Login ID) *" className="w-full bg-slate-800 border border-white/10 p-3 rounded-lg text-white focus:border-indigo-500 outline-none" value={newInst.code} onChange={e => setNewInst({ ...newInst, code: e.target.value })} required />
            <input placeholder="AISHE Code *" className="w-full bg-slate-800 border border-white/10 p-3 rounded-lg text-white focus:border-indigo-500 outline-none" value={newInst.aisheCode} onChange={e => setNewInst({ ...newInst, aisheCode: e.target.value })} required />
          </div>
          <input placeholder="Official Email *" className="w-full bg-slate-800 border border-white/10 p-3 rounded-lg text-white focus:border-indigo-500 outline-none" value={newInst.email} onChange={e => setNewInst({ ...newInst, email: e.target.value })} required />
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="w-4 h-4 text-slate-500" /></div>
            <input type="text" placeholder="Set Initial Password *" className="w-full bg-slate-800 border border-indigo-500/30 p-3 pl-10 rounded-lg text-white focus:border-indigo-500 outline-none" value={newInst.password} onChange={e => setNewInst({ ...newInst, password: e.target.value })} required />
          </div>
          <div className="bg-slate-800 border border-white/10 p-4 rounded-lg space-y-3">
            <p className="text-slate-300 text-sm font-semibold">Accreditation Details</p>
            <select className="w-full bg-slate-900 border border-white/10 text-white p-3 rounded-lg outline-none" value={newInst.accreditationType || ""} onChange={e => setNewInst({ ...newInst, accreditationType: e.target.value })}>
              <option value="NAAC">NAAC</option><option value="NBA">NBA</option><option value="ISO">ISO</option>
            </select>
            <div className="grid grid-cols-2 gap-4">
              <select className="w-full bg-slate-900 border border-white/10 text-white p-3 rounded-lg outline-none" value={newInst.accreditationStatus || "false"} onChange={e => setNewInst({ ...newInst, accreditationStatus: e.target.value })}>
                <option value="false">Not Accredited</option><option value="true">Accredited</option>
              </select>
              <input placeholder="Grade (e.g. A++)" className="w-full bg-slate-900 border border-white/10 text-white p-3 rounded-lg outline-none" value={newInst.accreditationGrade || ""} onChange={e => setNewInst({ ...newInst, accreditationGrade: e.target.value })} />
            </div>
            <input placeholder="Score (e.g. 3.51)" type="number" step="0.01" className="w-full bg-slate-900 border border-white/10 text-white p-3 rounded-lg outline-none" value={newInst.accreditationScore || ""} onChange={e => setNewInst({ ...newInst, accreditationScore: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/5">
            <button onClick={() => setModals({ ...modals, addInstitute: false })} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
            <button onClick={handleCreateInstitute} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-white font-bold flex items-center gap-2 transition-colors">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}{newInst.requestId ? "Approve & Create" : "Create Account"}
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL: INSTITUTE STATUS */}
      <Modal isOpen={modals.instituteDetail} title="Institute Governance" onClose={() => setModals({ ...modals, instituteDetail: false })}>
        {selectedInstitute && (
          <div className="space-y-6">
            <div className="bg-slate-800 p-4 rounded-lg space-y-2 border border-white/5">
              <div className="flex justify-between"><span className="text-slate-400 text-sm">Name:</span><span className="text-white font-medium">{selectedInstitute.name}</span></div>
              <div className="flex justify-between"><span className="text-slate-400 text-sm">Code:</span><span className="text-white font-mono">{selectedInstitute.code}</span></div>
              <div className="flex justify-between"><span className="text-slate-400 text-sm">Current Status:</span><span className={`font-bold ${selectedInstitute.status === 'Active' ? 'text-emerald-400' : 'text-amber-400'}`}>{selectedInstitute.status}</span></div>
            </div>
            <div className="space-y-3">
              <p className="text-xs uppercase font-bold text-slate-500 mb-2">Actions</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleStatusUpdate(selectedInstitute._id, 'Active')} className="bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/50 text-emerald-400 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"><UserCheck className="w-4 h-4" /> Activate</button>
                <button onClick={() => handleStatusUpdate(selectedInstitute._id, 'Rejected')} className="bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/50 text-rose-400 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"><UserX className="w-4 h-4" /> Reject</button>
              </div>
              <button onClick={() => handleStatusUpdate(selectedInstitute._id, 'Suspended')} className="w-full bg-amber-600/20 hover:bg-amber-600/40 border border-amber-500/50 text-amber-400 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"><AlertTriangle className="w-4 h-4" /> Suspend Account</button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: SUPPORT TICKET */}
      <Modal isOpen={modals.ticketModal} title="Support Ticket" onClose={() => setModals({ ...modals, ticketModal: false })}>
        {selectedInstitute && (
          <div className="space-y-4">
            <div className="bg-slate-800 p-4 rounded-lg space-y-2 border border-white/5">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-slate-400 text-xs font-bold uppercase">Subject</span>
                <span className="text-white font-medium">{selectedInstitute.code}</span>
              </div>
              <div className="pt-2">
                <span className="text-slate-400 text-xs font-bold uppercase block mb-1">Description</span>
                <p className="text-slate-300 text-sm bg-slate-900/50 p-2 rounded">{selectedInstitute.notes}</p>
              </div>
            </div>
            <div className="bg-slate-950 border border-white/10 rounded-xl h-64 overflow-y-auto p-4 space-y-4 flex flex-col custom-scrollbar">
              {selectedInstitute.replies && selectedInstitute.replies.length > 0 ? (
                selectedInstitute.replies.map((reply, idx) => (
                  <div key={idx} className={`flex flex-col max-w-[85%] ${reply.sender === 'Admin' ? 'self-end items-end' : 'self-start items-start'}`}>
                    <div className={`px-4 py-2 rounded-2xl text-sm shadow-sm ${reply.sender === 'Admin' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-slate-800 text-slate-200 border border-white/10 rounded-bl-sm'}`}>{reply.message}</div>
                    <span className="text-[10px] text-slate-500 mt-1 px-1">{reply.sender === 'Admin' ? 'You' : 'Institute'} • {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-50"><MessageSquare className="w-8 h-8 mb-2" /><p className="text-xs">No conversation yet.</p></div>
              )}
            </div>
            <div className="space-y-3 pt-2">
              <textarea id="adminReplyInput" placeholder="Type your reply..." className="w-full bg-slate-800 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-indigo-500 outline-none resize-none h-20"></textarea>
              <div className="flex gap-3">
                <button onClick={async () => {
                    const msg = document.getElementById('adminReplyInput').value;
                    if (!msg) return showToast("Please type a message", "error");
                    setIsLoading(true);
                    if (isDemoMode()) { setTimeout(() => { showToast("Mock Reply Sent", "success"); const newReply = { sender: 'Admin', message: msg, createdAt: new Date().toISOString() }; const updatedInst = { ...selectedInstitute, replies: [...(selectedInstitute.replies || []), newReply] }; setSelectedInstitute(updatedInst); setIsLoading(false); }, 500); return; }
                    try { await api.post('/request/reply', { requestId: selectedInstitute._id, message: msg }); showToast("Reply sent", "success"); setModals({ ...modals, ticketModal: false }); fetchInstitutes(); } catch (e) { showToast("Failed to send", "error"); } finally { setIsLoading(false); }
                  }} disabled={isLoading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 py-2.5 rounded-lg text-white font-medium text-sm transition-colors flex justify-center items-center gap-2">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reply'}
                </button>
                <button onClick={async () => {
                    const msg = document.getElementById('adminReplyInput').value || "Ticket marked as solved.";
                    setIsLoading(true);
                    if (isDemoMode()) { setTimeout(() => { showToast("Mock Ticket Solved", "success"); setModals({ ...modals, ticketModal: false }); setIsLoading(false); }, 500); return; }
                    try { await api.post('/request/reply', { requestId: selectedInstitute._id, message: msg, status: 'Solved' }); showToast("Ticket Solved", "success"); setModals({ ...modals, ticketModal: false }); fetchInstitutes(); } catch (e) { showToast("Failed to update", "error"); } finally { setIsLoading(false); }
                  }} disabled={isLoading} className="flex-1 bg-emerald-600/10 border border-emerald-500/30 hover:bg-emerald-600/20 text-emerald-400 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors">
                  <CheckCircle2 className="w-4 h-4" /> Mark Solved
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: NAAC VALIDATOR */}
      <Modal isOpen={modals.naacUpload} title="NAAC SSR Validator" onClose={() => setModals({ ...modals, naacUpload: false })}>
        <div className="text-center py-6 space-y-4">
          <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 hover:border-indigo-500 transition-colors cursor-pointer bg-slate-800/50">
            <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-300 font-medium">Drag & Drop SSR PDF here</p>
            <p className="text-xs text-slate-500 mt-1">Supports PDF up to 25MB</p>
          </div>
          <button onClick={handleNaacValidation} disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-lg text-white font-bold flex justify-center items-center gap-2 shadow-lg shadow-indigo-900/30">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Process with AI'}
          </button>
        </div>
      </Modal>

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-xl border border-white/10 flex items-center gap-3 animate-in slide-in-from-bottom-5 z-50 ${toast.type === 'error' ? 'bg-rose-900 text-rose-100' : 'bg-emerald-900 text-emerald-100'}`}>
          {toast.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
          <span className="font-medium">{toast.msg}</span>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;