import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LayoutDashboard, Building, Users, FileCheck, ShieldAlert,
  Database, Settings, LogOut, Plus, Search, X, Check, Trash2, Edit,
  UploadCloud, FileText, Activity, Server, Loader2, Lock
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Upgraded hybrid UI: Minimal + Dark Pro accents
// Keep existing API and logic, only visual layer is enhanced

const API_BASE_URL = 'http://localhost:5000/admin';

const AdminPanel = () => {
  // ---------- state ----------
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [loginCreds, setLoginCreds] = useState({ username: '', password: '' });

  const [authLoading, setAuthLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [analytics, setAnalytics] = useState(null);
  const [institutes, setInstitutes] = useState([]);
  const [chartData, setChartData] = useState([]);

  const [modals, setModals] = useState({ addInstitute: false, naacUpload: false });
  const [newInst, setNewInst] = useState({ name: '', code: '', email: '', address: '' });

  // axios instance
  const api = axios.create({ baseURL: API_BASE_URL });
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('adminToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // ---------- effects ----------
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
    if (activeView === 'institutes') fetchInstitutes();
  }, [activeView, isAuthenticated]);

  // ---------- actions ----------
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/login`, loginCreds);
      localStorage.setItem('adminToken', res.data.token);
      setIsAuthenticated(true);
      showToast('Welcome back — logged in', 'success');
      fetchDashboardData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Login failed', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setLoginCreds({ username: '', password: '' });
    setAnalytics(null);
    setInstitutes([]);
    showToast('Signed out', 'info');
  };

  const fetchDashboardData = async () => {
    setDataLoading(true);
    try {
      const res = await api.get('/analytics');
      setAnalytics(res.data);
      if (res.data.history && Array.isArray(res.data.history) && res.data.history.length) {
        setChartData(res.data.history);
      } else {
        // derive tiny chart from counts so UI is not empty
        setChartData([
          { name: 'Active', value: res.data.activeInstitutes || 0 },
          { name: 'Pending', value: res.data.pendingApprovals || 0 }
        ]);
      }
    } catch (err) {
      if (err.response?.status !== 401) showToast('Could not load dashboard', 'error');
      setAnalytics(null);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchInstitutes = async () => {
    setDataLoading(true);
    try {
      const res = await api.get('/getAllInstitutes');
      setInstitutes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      showToast('Failed to load institutes', 'error');
      setInstitutes([]);
    } finally {
      setDataLoading(false);
    }
  };

  const handleCreateInstitute = async () => {
    try {
      await api.post('/createInstitute', newInst);
      showToast('Institute created', 'success');
      setModals({ ...modals, addInstitute: false });
      setNewInst({ name: '', code: '', email: '', address: '' });
      fetchInstitutes();
    } catch (err) {
      showToast(err.response?.data?.message || 'Create failed', 'error');
    }
  };

  const handleNaacValidation = async () => {
    try {
      showToast('Validating...', 'info');
      const res = await api.post('/naacValidator', {});
      setModals({ ...modals, naacUpload: false });
      showToast(`Score ${res.data.score}`, 'success');
    } catch (err) {
      showToast('Validation failed', 'error');
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ---------- small UI helpers ----------
  const Stat = ({ label, value, icon: Icon }) => (
    <div className="flex items-center gap-4 p-4 bg-white/6 rounded-xl backdrop-blur-sm border border-white/6">
      <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600/80 flex items-center justify-center shadow-sm">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <div className="text-xs text-slate-300">{label}</div>
        <div className="text-2xl font-semibold text-white">{value ?? '-'}</div>
      </div>
    </div>
  );

  const Modal = ({ isOpen, title, children, onClose }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-xl bg-slate-900 rounded-2xl border border-white/6 p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button onClick={onClose} className="p-2 rounded-md bg-white/5"><X className="w-4 h-4 text-slate-300"/></button>
          </div>
          <div>{children}</div>
        </div>
      </div>
    );
  };

  // ---------- views ----------
  const DashboardView = () => {
    if (dataLoading && !analytics) return (
      <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-slate-300"/></div>
    );

    if (!analytics) return (
      <div className="p-8 rounded-xl bg-white/3 border border-white/6 text-slate-300">No analytics available</div>
    );

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Stat label="Total Institutes" value={analytics.totalInstitutes} icon={Building} />
          <Stat label="Active Institutes" value={analytics.activeInstitutes} icon={Users} />
          <Stat label="Pending Approvals" value={analytics.pendingApprovals} icon={ShieldAlert} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white/5 p-6 rounded-2xl border border-white/6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-semibold">Institute Growth</h4>
              <div className="text-xs text-slate-300">Last 30 days</div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" tick={{ fill: '#cbd5e1' }} />
                  <YAxis tick={{ fill: '#cbd5e1' }} />
                  <Tooltip wrapperStyle={{ background: '#0f172a', color: '#fff' }} />
                  <Bar dataKey="value" fill="#7c3aed" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/5 p-6 rounded-2xl border border-white/6">
            <h4 className="text-white font-semibold mb-3">System Status</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-3"><Server className="w-4 h-4"/> Backend</div>
                <div className="text-sm text-emerald-400">Online</div>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-3"><Database className="w-4 h-4"/> MongoDB</div>
                <div className="text-sm text-emerald-400">Connected</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const InstituteView = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-white text-xl font-semibold">Institute Management</h3>
          <button onClick={() => setModals({...modals, addInstitute: true})} className="inline-flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded-lg shadow">
            <Plus className="w-4 h-4 text-white"/> <span className="text-white text-sm font-medium">Add Institute</span>
          </button>
        </div>

        <div className="bg-white/5 p-4 rounded-2xl border border-white/6">
          {institutes.length === 0 ? (
            <div className="p-12 text-center text-slate-300">No institutes. Create one.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left table-auto">
                <thead className="text-slate-300 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Institute</th>
                    <th className="p-3">Code</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {institutes.map(inst => (
                    <tr key={inst._id} className="border-t border-white/4 text-slate-200 hover:bg-white/2">
                      <td className="p-3 font-medium">{inst.name}</td>
                      <td className="p-3 text-slate-300">{inst.code}</td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${inst.status === 'Active' ? 'bg-emerald-800 text-emerald-200' : inst.status === 'Suspended' ? 'bg-red-800 text-red-200' : 'bg-amber-800 text-amber-200'}`}>
                          {inst.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button className="p-2 rounded-md bg-white/5 mr-2"><Edit className="w-4 h-4"/></button>
                        <button className="p-2 rounded-md bg-white/5"><Trash2 className="w-4 h-4"/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ToolsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white/5 p-6 rounded-2xl border border-white/6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-semibold">AI NAAC Validator</h4>
          <div className="text-xs text-slate-300">Beta</div>
        </div>
        <div className="border-2 border-dashed border-white/6 rounded-xl p-6 text-center cursor-pointer" onClick={() => setModals({...modals, naacUpload: true})}>
          <UploadCloud className="w-8 h-8 text-slate-300 mx-auto"/>
          <div className="mt-2 text-slate-300">Upload SSR to validate</div>
        </div>
      </div>
    </div>
  );

  // ---------- layout ----------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-gradient-to-br from-white/4 to-white/2 backdrop-blur-sm border border-white/6 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-lg bg-indigo-600"><Lock className="w-6 h-6 text-white"/></div>
            <div>
              <h1 className="text-white text-2xl font-bold">Admin Portal</h1>
              <div className="text-slate-300 text-sm">Central governance - secure access</div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-slate-300 text-xs">Username</label>
              <input value={loginCreds.username} onChange={e => setLoginCreds({...loginCreds, username: e.target.value})} className="w-full mt-1 p-3 rounded-lg bg-white/3 border border-white/6 text-white outline-none" placeholder="admin" />
            </div>
            <div>
              <label className="text-slate-300 text-xs">Password</label>
              <input type="password" value={loginCreds.password} onChange={e => setLoginCreds({...loginCreds, password: e.target.value})} className="w-full mt-1 p-3 rounded-lg bg-white/3 border border-white/6 text-white outline-none" placeholder="••••" />
            </div>
            <button type="submit" disabled={authLoading} className="w-full py-3 rounded-lg bg-indigo-600 text-white font-semibold flex items-center justify-center gap-2">
              {authLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Sign in'}
            </button>
            <div className="text-xs text-slate-400 text-center">Tip: use your admin credentials</div>
          </form>

          <div className="mt-6 text-center text-slate-400 text-xs">© Campusversa</div>

          {toast && (
            <div className={`fixed bottom-6 right-6 px-4 py-2 rounded-lg ${toast.type === 'error' ? 'bg-red-600' : toast.type === 'info' ? 'bg-slate-600' : 'bg-emerald-600'} text-white`}>{toast.msg}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="flex">
        {/* sidebar */}
        <aside className="w-64 h-screen sticky top-0 p-6 bg-gradient-to-b from-black/20 to-transparent border-r border-white/6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold">CV</div>
            <div>
              <div className="font-bold">Campusversa</div>
              <div className="text-xs text-slate-400">Admin</div>
            </div>
          </div>

          <nav className="space-y-1">
            {[{id:'dashboard', label:'Overview', icon:LayoutDashboard},{id:'institutes', label:'Institutes', icon:Building},{id:'tools', label:'Tools', icon:FileCheck}].map(item => (
              <button key={item.id} onClick={() => setActiveView(item.id)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm ${activeView===item.id ? 'bg-white/6' : 'hover:bg-white/4 text-slate-200'}`}>
                <item.icon className="w-5 h-5"/>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-8">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 hover:bg-red-700 text-sm">
              <LogOut className="w-4 h-4"/> Sign out
            </button>
          </div>
        </aside>

        {/* main area */}
        <main className="flex-1 p-8">
          <header className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/6 rounded-full p-2"><Search className="w-4 h-4 text-slate-200"/></div>
              <input placeholder="Search records..." className="bg-transparent border border-white/6 text-slate-300 px-3 py-2 rounded-lg outline-none w-96" />
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-300">Super Admin</div>
            </div>
          </header>

          <div className="space-y-6">
            {activeView === 'dashboard' && <DashboardView />}
            {activeView === 'institutes' && <InstituteView />}
            {activeView === 'tools' && <ToolsView />}
          </div>
        </main>
      </div>

      <Modal isOpen={modals.addInstitute} title="Register Institute" onClose={() => setModals({...modals, addInstitute:false})}>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-300">Name</label>
            <input value={newInst.name} onChange={e => setNewInst({...newInst, name: e.target.value})} className="w-full mt-1 p-3 rounded-lg bg-white/3 border border-white/6 text-white" />
          </div>
          <div>
            <label className="text-sm text-slate-300">Code</label>
            <input value={newInst.code} onChange={e => setNewInst({...newInst, code: e.target.value})} className="w-full mt-1 p-3 rounded-lg bg-white/3 border border-white/6 text-white" />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setModals({...modals, addInstitute:false})} className="px-4 py-2 rounded-lg bg-white/5">Cancel</button>
            <button onClick={handleCreateInstitute} className="px-4 py-2 rounded-lg bg-indigo-600">Create</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={modals.naacUpload} title="NAAC Validator" onClose={() => setModals({...modals, naacUpload:false})}>
        <div className="text-center space-y-4">
          <FileText className="w-12 h-12 mx-auto text-slate-300"/>
          <div className="text-slate-300">Upload SSR (pdf) to validate</div>
          <div className="flex gap-2 justify-center">
            <button onClick={() => setModals({...modals, naacUpload:false})} className="px-4 py-2 rounded-lg bg-white/5">Cancel</button>
            <button onClick={handleNaacValidation} className="px-4 py-2 rounded-lg bg-indigo-600">Run</button>
          </div>
        </div>
      </Modal>

      {toast && (
        <div className={`fixed bottom-6 right-6 px-4 py-2 rounded-lg ${toast.type === 'error' ? 'bg-red-600' : toast.type === 'info' ? 'bg-slate-600' : 'bg-emerald-600'} text-white`}>{toast.msg}</div>
      )}
    </div>
  );
};

export default AdminPanel;
