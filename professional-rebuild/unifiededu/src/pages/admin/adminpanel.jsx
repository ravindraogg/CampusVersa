import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LayoutDashboard, Building, Users, FileCheck, ShieldAlert,
  Database, Settings, LogOut, Plus, Search, X, Check, Trash2, Edit,
  UploadCloud, FileText, Activity, Server, Loader2, Lock,
  Megaphone, History, Eye, UserCheck, UserX, AlertTriangle, Key,
  MessageSquare, ChevronDown, UserPlus, LifeBuoy, CheckCircle2 // Added Icons
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_BASE_URL = 'http://localhost:5000/admin';

// --- Components ---
const Modal = ({ isOpen, title, children, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-slate-900 rounded-2xl border border-white/10 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <X className="w-5 h-5 text-slate-400"/>
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

const AdminPanel = () => {
  // ---------- State ----------
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [loginCreds, setLoginCreds] = useState({ username: '', password: '' });

  // Data State
  const [analytics, setAnalytics] = useState(null);
  const [institutes, setInstitutes] = useState([]);
  const [grievances, setGrievances] = useState([]); 
  const [logs, setLogs] = useState([]);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedInstitute, setSelectedInstitute] = useState(null);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [modals, setModals] = useState({ 
    addInstitute: false, 
    naacUpload: false, 
    instituteDetail: false 
  });
  
  const [newInst, setNewInst] = useState({ 
    name: '', code: '', email: '', address: '', aisheCode: '', password: '', requestId: null
  });
  const [broadcast, setBroadcast] = useState({ title: '', message: '', type: 'Info' });

  // Axios Instance
  const api = axios.create({ baseURL: API_BASE_URL });
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('adminToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // ---------- Effects ----------
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
      fetchDashboardData();
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeView === 'dashboard') fetchDashboardData();
    // Fetch institutes data for Registry, Join Requests, AND Support Tickets
    if (['institutes', 'requests', 'support'].includes(activeView)) fetchInstitutes();
    if (activeView === 'grievance') fetchGrievances();
    if (activeView === 'logs') fetchLogs();
  }, [activeView, isAuthenticated]);

  // ---------- Actions ----------

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/login`, loginCreds);
      localStorage.setItem('adminToken', res.data.token);
      setIsAuthenticated(true);
      showToast('Login successful', 'success');
      fetchDashboardData();
    } catch (err) {
      showToast('Invalid credentials', 'error');
    } finally { setIsLoading(false); }
  };

  const fetchDashboardData = async () => {
    try { const res = await api.get('/analytics'); setAnalytics(res.data); } catch (err) { console.error(err); }
  };

  const fetchInstitutes = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/getAllInstitutes');
      setInstitutes(res.data);
    } catch (err) { showToast('Failed to load data', 'error'); } 
    finally { setIsLoading(false); }
  };

  const fetchGrievances = async () => { 
    try {
      const res = await api.get('/grievances');
      setGrievances(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchLogs = async () => {
    try { const res = await api.get('/logs'); setLogs(res.data); } catch (err) { console.error(err); }
  };

  const handleCreateInstitute = async () => {
    try {
      await api.post('/createInstitute', newInst);
      await api.post('/createInstitute', {
  ...newInst,
  accreditation: [
    {
      type: newInst.accreditationType || "",
      status: newInst.accreditationStatus || false,
      grade: newInst.accreditationGrade || "",
      score: newInst.accreditationScore || null
    }
  ]
});

      showToast('Institute registered & credentials created', 'success');
      setModals({ ...modals, addInstitute: false });
      setNewInst({ name: '', code: '', email: '', address: '', aisheCode: '', password: '', requestId: null });
      fetchInstitutes();
      
    } catch (err) {
      showToast(err.response?.data?.message || 'Error creating institute', 'error');
    }
  };

  const handleGrievanceStatus = async (id, status) => {
    try {
      await api.put(`/grievance/${id}`, { status });
      showToast(`Grievance status: ${status}`, 'success');
      setGrievances(prev => prev.map(g => g._id === id ? { ...g, status } : g));
    } catch (err) { showToast('Update failed', 'error'); }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/updateInstituteStatus/${id}`, { status });
      showToast(`Institute marked as ${status}`, 'success');
      setInstitutes(prev => prev.map(inst => inst._id === id ? { ...inst, status } : inst));
      if (selectedInstitute && selectedInstitute._id === id) {
        setSelectedInstitute({ ...selectedInstitute, status });
      }
    } catch (err) { showToast('Update failed', 'error'); }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    try {
      await api.post('/broadcast', broadcast);
      showToast('Broadcast sent', 'success');
      setBroadcast({ title: '', message: '', type: 'Info' });
    } catch (err) { showToast('Broadcast failed', 'error'); }
  };

  const handleNaacValidation = async () => {
    setIsLoading(true);
    try {
      const res = await api.post('/naacValidator', {});
      showToast(`AI Grade: ${res.data.grade} (Score: ${res.data.score})`, 'success');
      setModals({ ...modals, naacUpload: false });
    } catch (err) { showToast('Validation failed', 'error'); } 
    finally { setIsLoading(false); }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openPromoteModal = (request) => {
    setNewInst({
      name: request.name,
      code: request.code,
      email: request.email,
      aisheCode: request.aisheCode || '',
      address: request.state || '',
      password: '', 
      requestId: request._id
    });
    setModals({ ...modals, addInstitute: true });
  };

  // ---------- Render Views ----------

  const renderDashboard = () => {
    if (!analytics) return <div className="text-slate-400 p-8">Loading analytics...</div>;
    const chartData = [
      { name: 'Active', value: analytics.activeInstitutes },
      { name: 'Requests', value: analytics.pendingApprovals },
      { name: 'Grievances', value: analytics.openGrievances },
    ];
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-indigo-600/20 border border-indigo-500/30 p-4 rounded-xl">
            <div className="text-indigo-300 text-sm font-medium mb-1">Total Institutes</div>
            <div className="text-3xl font-bold text-white">{analytics.totalInstitutes}</div>
          </div>
          <div className="bg-emerald-600/20 border border-emerald-500/30 p-4 rounded-xl">
            <div className="text-emerald-300 text-sm font-medium mb-1">Active Accounts</div>
            <div className="text-3xl font-bold text-white">{analytics.activeInstitutes}</div>
          </div>
          <div className="bg-amber-600/20 border border-amber-500/30 p-4 rounded-xl">
            <div className="text-amber-300 text-sm font-medium mb-1">Pending Requests</div>
            <div className="text-3xl font-bold text-white">{analytics.pendingApprovals}</div>
          </div>
          <div className="bg-rose-600/20 border border-rose-500/30 p-4 rounded-xl">
            <div className="text-rose-300 text-sm font-medium mb-1">Open Grievances</div>
            <div className="text-3xl font-bold text-white">{analytics.openGrievances}</div>
          </div>
        </div>
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
             <div className="space-y-4">
              {analytics.recentActivity && analytics.recentActivity.map((log, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500"></div>
                  <div>
                    <div className="text-slate-200">{log.action}</div>
                    <div className="text-slate-500 text-xs">{new Date(log.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- VIEW 1: Active Institutes Only ---
  const renderInstitutes = () => {
    const filteredInstitutes = institutes.filter(inst => 
      inst.type === 'REGISTERED' && 
      (inst.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       inst.code.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Registered Institutes</h2>
          
          <div className="flex w-full md:w-auto gap-3">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search Active Institutes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 pl-10 pr-4 py-2.5 rounded-lg text-white text-sm focus:border-indigo-500 outline-none"
              />
            </div>

            <button 
              onClick={() => { setNewInst({ name: '', code: '', email: '', address: '', aisheCode: '', password: '', requestId: null }); setModals({ ...modals, addInstitute: true }); }} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap"
            >
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
                    <div className="font-medium text-white flex items-center gap-2">
                      {inst.name}
                    </div>
                    <div className="text-xs text-slate-500">{inst.email}</div>
                  </td>
                  <td className="p-4 text-slate-300">
                    <div className="font-mono">{inst.code}</div>
                    <div className="text-xs text-slate-500">{inst.aisheCode || 'N/A'}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      inst.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' :
                      inst.status === 'Suspended' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {inst.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => { setSelectedInstitute(inst); setModals({ ...modals, instituteDetail: true }); }}
                      className="text-indigo-400 hover:text-indigo-300 hover:underline text-sm font-medium"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
              {filteredInstitutes.length === 0 && (
                <tr><td colSpan="4" className="p-8 text-center text-slate-500">No registered institutes found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // --- VIEW 2: Pending Join Requests Only ---
  const renderRequests = () => {
    // Filter: Is a Request AND (Urgency is missing OR Empty) -> Means it's a Registration Request
    const filteredRequests = institutes.filter(inst => 
      inst.type === 'REQUEST' && 
      !inst.urgency && 
      (inst.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       inst.code.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-amber-400"/> Joining Requests
          </h2>
          
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search Requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-white/10 pl-10 pr-4 py-2.5 rounded-lg text-white text-sm focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-semibold">
              <tr>
                <th className="p-4">Requester</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Request Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRequests.map(inst => (
                <tr key={inst._id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-white flex items-center gap-2">
                      {inst.name}
                    </div>
                    <div className="text-xs text-slate-500">Proposed Code: {inst.code}</div>
                  </td>
                  <td className="p-4 text-slate-300">
                    <div>{inst.email}</div>
                    <div className="text-xs text-slate-500">{inst.phone || 'No Phone'}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      inst.status.includes('Pending') ? 'bg-blue-500/20 text-blue-400' :
                      inst.status.includes('Approved') ? 'bg-emerald-500/20 text-emerald-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {inst.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {!inst.status.includes('Approved') ? (
                       <button 
                        onClick={() => openPromoteModal(inst)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                      >
                        Approve & Create
                      </button>
                    ) : (
                      <span className="text-slate-500 text-sm">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr><td colSpan="4" className="p-8 text-center text-slate-500">No pending requests found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // --- VIEW 3: Support Tickets (Internal Requests) ---
// --- VIEW 3: Support Tickets (Internal Requests) ---
  const renderSupport = () => {
    const filteredSupport = institutes.filter(inst => 
      inst.type === 'REQUEST' && 
      inst.urgency && 
      (inst.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       inst.code.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center gap-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-indigo-400"/> Support Tickets
          </h2>
       <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search Requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-white/10 pl-10 pr-4 py-2.5 rounded-lg text-white text-sm focus:border-indigo-500 outline-none"
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
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      inst.urgency === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>{inst.urgency}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      inst.status === 'Solved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
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
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderGrievances = () => (
    <div className="space-y-6">
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
                   <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      g.status === 'Solved' ? 'bg-emerald-500/20 text-emerald-400' :
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
    <div className="max-w-2xl mx-auto space-y-8">
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
            <input required value={broadcast.title} onChange={e => setBroadcast({...broadcast, title: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"/>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Type</label>
            <select value={broadcast.type} onChange={e => setBroadcast({...broadcast, type: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none">
              <option>Info</option><option>Warning</option><option>Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Message</label>
            <textarea required rows="4" value={broadcast.message} onChange={e => setBroadcast({...broadcast, message: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"/>
          </div>
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors">Publish</button>
        </form>
      </div>
    </div>
  );

  const renderLogs = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <History className="w-6 h-6" /> System Audit Logs
      </h2>
      <div className="bg-slate-800/50 rounded-xl border border-white/5 p-4">
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5 hover:border-indigo-500/50 transition-colors">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-purple-500/20 rounded-lg"><FileCheck className="w-6 h-6 text-purple-400" /></div>
          <div><h3 className="text-lg font-bold text-white">AI NAAC Validator</h3></div>
        </div>
        <button onClick={() => setModals({...modals, naacUpload: true})} className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium">Launch Validator</button>
      </div>
      <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5 hover:border-indigo-500/50 transition-colors">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-500/20 rounded-lg"><ShieldAlert className="w-6 h-6 text-blue-400" /></div>
          <div><h3 className="text-lg font-bold text-white">Plagiarism Checker</h3></div>
        </div>
        <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">Open Scanner</button>
      </div>
    </div>
  );

  // ---------- Login Screen ----------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl mx-auto flex items-center justify-center mb-4"><Lock className="w-6 h-6 text-white" /></div>
            <h1 className="text-2xl font-bold text-white">Super Admin</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div><label className="text-xs uppercase font-bold text-slate-500">Username</label><input value={loginCreds.username} onChange={e => setLoginCreds({...loginCreds, username: e.target.value})} className="w-full mt-1 bg-slate-950 border border-white/10 p-3 rounded-lg text-white outline-none"/></div>
            <div><label className="text-xs uppercase font-bold text-slate-500">Password</label><input type="password" value={loginCreds.password} onChange={e => setLoginCreds({...loginCreds, password: e.target.value})} className="w-full mt-1 bg-slate-950 border border-white/10 p-3 rounded-lg text-white outline-none"/></div>
            <button disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-lg text-white font-bold transition-colors flex justify-center gap-2">{isLoading && <Loader2 className="w-4 h-4 animate-spin"/>} Access Dashboard</button>
          </form>
        </div>
        {toast && <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">{toast.msg}</div>}
      </div>
    );
  }

  // ---------- Main Layout ----------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex">
      <aside className="w-64 border-r border-white/5 bg-slate-900/50 flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white">CV</div>
          <span className="font-bold text-white tracking-tight">CampusVersa</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'institutes', label: 'All Institutes', icon: Building }, 
            { id: 'requests', label: 'Join Requests', icon: UserPlus },
            { id: 'support', label: 'Support Tickets', icon: LifeBuoy }, // New Section
            { id: 'grievance', label: 'Grievances', icon: MessageSquare }, 
            { id: 'broadcast', label: 'Broadcasts', icon: Megaphone },
            { id: 'tools', label: 'AI Tools', icon: FileCheck },
            { id: 'logs', label: 'Audit Logs', icon: History },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveView(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeView === item.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <item.icon className="w-5 h-5" />{item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <button onClick={() => { setIsAuthenticated(false); localStorage.removeItem('adminToken'); }} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm"><LogOut className="w-4 h-4" /> Sign Out</button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white capitalize">{activeView.replace('requests', 'Institute Requests')}</h1>
            <p className="text-slate-400 text-sm">System Overview & Controls</p>
          </div>
          <div className="bg-slate-900 border border-white/10 rounded-full px-4 py-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div><span className="text-xs text-emerald-400 font-mono">SYSTEM ONLINE</span></div>
        </header>

        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'institutes' && renderInstitutes()}
        {activeView === 'requests' && renderRequests()} 
        {activeView === 'support' && renderSupport()} {/* New View Render */}
        {activeView === 'grievance' && renderGrievances()}
        {activeView === 'broadcast' && renderBroadcast()}
        {activeView === 'logs' && renderLogs()}
        {activeView === 'tools' && renderTools()}
      </main>

      {/* --- MODALS --- */}
      <Modal isOpen={modals.addInstitute} title={newInst.requestId ? "Approve Request & Create" : "Register New Institute"} onClose={() => setModals({...modals, addInstitute: false})}>
        <div className="space-y-4">

  {/* Mandatory Basics */}
  <input 
    placeholder="Institute Name *"
    className="w-full bg-slate-800 border border-white/10 p-3 rounded-lg text-white"
    value={newInst.name}
    onChange={e => setNewInst({...newInst, name: e.target.value})}
    required
  />

  <div className="grid grid-cols-2 gap-4">
    <input 
      placeholder="Institute Code (Login ID) *"
      className="w-full bg-slate-800 border border-white/10 p-3 rounded-lg text-white"
      value={newInst.code}
      onChange={e => setNewInst({...newInst, code: e.target.value})}
      required
    />

    <input 
      placeholder="AISHE Code *"
      className="w-full bg-slate-800 border border-white/10 p-3 rounded-lg text-white"
      value={newInst.aisheCode}
      onChange={e => setNewInst({...newInst, aisheCode: e.target.value})}
      required
    />
  </div>

  <input 
    placeholder="Official Email *"
    className="w-full bg-slate-800 border border-white/10 p-3 rounded-lg text-white"
    value={newInst.email}
    onChange={e => setNewInst({...newInst, email: e.target.value})}
    required
  />

  {/* Password */}
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Lock className="w-4 h-4 text-slate-500" />
    </div>
    <input 
      type="text"
      placeholder="Set Initial Password *"
      className="w-full bg-slate-800 border border-indigo-500/30 p-3 pl-10 rounded-lg text-white focus:border-indigo-500 outline-none"
      value={newInst.password}
      onChange={e => setNewInst({...newInst, password: e.target.value})}
      required
    />
  </div>

  {/* Accreditation Section */}
  <div className="bg-slate-800 border border-white/10 p-4 rounded-lg space-y-3">
    <p className="text-slate-300 text-sm font-semibold">Accreditation Details (Optional now, can be edited later)</p>

    <select 
      className="w-full bg-slate-900 border border-white/10 text-white p-3 rounded-lg"
      value={newInst.accreditationType || ""}
      onChange={e => setNewInst({...newInst, accreditationType: e.target.value})}
    >
      <option value="">Select Accreditation Type</option>
      <option value="NAAC">NAAC</option>
      <option value="NBA">NBA</option>
      <option value="ISO">ISO</option>
    </select>

    <div className="grid grid-cols-2 gap-4">
      <select 
        className="w-full bg-slate-900 border border-white/10 text-white p-3 rounded-lg"
        value={newInst.accreditationStatus || false}
        onChange={e => setNewInst({...newInst, accreditationStatus: e.target.value === "true"})}
      >
        <option value={false}>Not Accredited</option>
        <option value={true}>Accredited</option>
      </select>

      <input 
        placeholder="Grade (A++, A+, A, B++...)"
        className="w-full bg-slate-900 border border-white/10 text-white p-3 rounded-lg"
        value={newInst.accreditationGrade || ""}
        onChange={e => setNewInst({...newInst, accreditationGrade: e.target.value})}
      />
    </div>

    <input 
      placeholder="Score (eg: 3.51)"
      type="number"
      step="0.01"
      className="w-full bg-slate-900 border border-white/10 text-white p-3 rounded-lg"
      value={newInst.accreditationScore || ""}
      onChange={e => setNewInst({...newInst, accreditationScore: e.target.value})}
    />
  </div>

  {/* Footer */}
  <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/5">
    <button 
      onClick={() => setModals({...modals, addInstitute: false})}
      className="px-4 py-2 text-slate-400 hover:text-white"
    >
      Cancel
    </button>

    <button 
      onClick={handleCreateInstitute}
      className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-white font-bold"
    >
      {newInst.requestId ? "Approve & Create" : "Create Account"}
    </button>
  </div>

</div>

      </Modal>

      <Modal isOpen={modals.instituteDetail} title="Institute Profile" onClose={() => setModals({...modals, instituteDetail: false})}>
        {selectedInstitute && (
          <div className="space-y-6">
            <div className="bg-slate-800 p-4 rounded-lg space-y-2">
              <div className="flex justify-between"><span className="text-slate-400 text-sm">Name:</span><span className="text-white font-medium">{selectedInstitute.name}</span></div>
              <div className="flex justify-between"><span className="text-slate-400 text-sm">Code:</span><span className="text-white font-mono">{selectedInstitute.code}</span></div>
              <div className="flex justify-between"><span className="text-slate-400 text-sm">Status:</span><span className={`font-bold ${selectedInstitute.status === 'Active' ? 'text-emerald-400' : 'text-amber-400'}`}>{selectedInstitute.status}</span></div>
            </div>
            <div className="space-y-3">
              <p className="text-xs uppercase font-bold text-slate-500 mb-2">Governance Actions</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleStatusUpdate(selectedInstitute._id, 'Active')} className="bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/50 text-emerald-400 py-3 rounded-lg flex items-center justify-center gap-2"><UserCheck className="w-4 h-4" /> Activate</button>
                <button onClick={() => handleStatusUpdate(selectedInstitute._id, 'Rejected')} className="bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/50 text-rose-400 py-3 rounded-lg flex items-center justify-center gap-2"><UserX className="w-4 h-4" /> Reject</button>
              </div>
              <button onClick={() => handleStatusUpdate(selectedInstitute._id, 'Suspended')} className="w-full bg-amber-600/20 hover:bg-amber-600/40 border border-amber-500/50 text-amber-400 py-3 rounded-lg flex items-center justify-center gap-2"><AlertTriangle className="w-4 h-4" /> Suspend Account</button>
            </div>
          </div>
        )}
      </Modal>
        {/* --- 4. TICKET / SUPPORT CONVERSATION MODAL --- */}
      <Modal isOpen={modals.ticketModal} title="Support Ticket Management" onClose={() => setModals({...modals, ticketModal: false})}>
        {selectedInstitute && (
          <div className="space-y-4">
            {/* Ticket Info Header */}
            <div className="bg-slate-800 p-4 rounded-lg space-y-2 border border-white/5">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-slate-400 text-xs font-bold uppercase">Subject</span>
                <span className="text-white font-medium">{selectedInstitute.code}</span>
              </div>
              <div className="pt-2">
                <span className="text-slate-400 text-xs font-bold uppercase block mb-1">Original Description</span>
                <p className="text-slate-300 text-sm bg-slate-900/50 p-2 rounded">{selectedInstitute.notes}</p>
              </div>
            </div>

            {/* Conversation Thread Container */}
            <div className="bg-slate-950 border border-white/10 rounded-xl h-72 overflow-y-auto p-4 space-y-4 flex flex-col">
              {selectedInstitute.replies && selectedInstitute.replies.length > 0 ? (
                selectedInstitute.replies.map((reply, idx) => (
                  <div key={idx} className={`flex flex-col max-w-[85%] ${reply.sender === 'Admin' ? 'self-end items-end' : 'self-start items-start'}`}>
                    <div className={`px-4 py-2 rounded-2xl text-sm shadow-sm ${
                      reply.sender === 'Admin' 
                        ? 'bg-indigo-600 text-white rounded-br-sm' 
                        : 'bg-slate-800 text-slate-200 border border-white/10 rounded-bl-sm'
                    }`}>
                      {reply.message}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 px-1">
                      {reply.sender === 'Admin' ? 'You' : 'Institute'} • {new Date(reply.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-50">
                  <MessageSquare className="w-8 h-8 mb-2" />
                  <p className="text-xs">No replies yet. Start the conversation.</p>
                </div>
              )}
            </div>

            {/* Admin Action Area */}
            <div className="space-y-3 pt-2">
              <textarea 
                id="adminReplyInput"
                placeholder="Type your reply here..." 
                className="w-full bg-slate-800 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-indigo-500 outline-none resize-none h-20"
              ></textarea>
              
              <div className="flex gap-3">
                <button 
                  onClick={async () => {
                    const msg = document.getElementById('adminReplyInput').value;
                    if(!msg) return showToast("Please type a message", "error");
                    
                    setIsLoading(true);
                    try {
                      await api.post('/request/reply', { requestId: selectedInstitute._id, message: msg });
                      showToast("Reply sent", "success");
                      setModals({...modals, ticketModal: false});
                      fetchInstitutes(); // Refresh list to show updated status/thread
                    } catch(e) { 
                      showToast("Failed to send", "error"); 
                    } finally { setIsLoading(false); }
                  }}
                  disabled={isLoading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 py-2.5 rounded-lg text-white font-medium text-sm transition-colors flex justify-center items-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Send Reply'}
                </button>
                
                <button 
                  onClick={async () => {
                    const msg = document.getElementById('adminReplyInput').value || "Ticket marked as solved.";
                    setIsLoading(true);
                    try {
                      await api.post('/request/reply', { requestId: selectedInstitute._id, message: msg, status: 'Solved' });
                      showToast("Ticket Solved", "success");
                      setModals({...modals, ticketModal: false});
                      fetchInstitutes();
                    } catch(e) { 
                      showToast("Failed to update", "error"); 
                    } finally { setIsLoading(false); }
                  }}
                  disabled={isLoading}
                  className="flex-1 bg-emerald-600/10 border border-emerald-500/30 hover:bg-emerald-600/20 text-emerald-400 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" /> Mark Solved
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
      <Modal isOpen={modals.naacUpload} title="NAAC SSR Validator" onClose={() => setModals({...modals, naacUpload: false})}>
        <div className="text-center py-6 space-y-4">
          <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 hover:border-indigo-500 transition-colors cursor-pointer bg-slate-800/50">
            <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-300">Drag & Drop SSR PDF here</p>
          </div>
          <button onClick={handleNaacValidation} disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-lg text-white font-bold flex justify-center items-center gap-2">{isLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Process with AI'}</button>
        </div>
      </Modal>

      {toast && <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-xl border border-white/10 flex items-center gap-3 animate-in slide-in-from-bottom-5 ${toast.type === 'error' ? 'bg-rose-900 text-rose-100' : 'bg-emerald-900 text-emerald-100'}`}>{toast.type === 'error' ? <AlertTriangle className="w-5 h-5"/> : <Check className="w-5 h-5"/>}{toast.msg}</div>}
    </div>
  );
};

export default AdminPanel;