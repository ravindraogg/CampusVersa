// src/pages/student/StudentDashboard.jsx
import React, { useState, useEffect } from "react";
import { 
  LayoutGrid, User, BookOpen, Calendar, Award, 
  LogOut, Bell, Menu, ChevronRight, TrendingUp, Clock, MapPin 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Theme Configuration
const THEME = {
  primary: "#2E5843",
  primaryDark: "#1e3b2c",
  accent: "#D4E7DD",
  bg: "#F2F5F3",
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [student, setStudent] = useState(null);
  const [institute, setInstitute] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("studentToken");
      
      if (!token) {
        navigate("/student/auth"); // Redirect if not logged in
        return;
      }

      try {
        const API_URL = import.meta.env.VITE_BACK_URI || "http://localhost:5000";
        const res = await fetch(`${API_URL}/student/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("studentToken");
          navigate("/student/auth");
          return;
        }

        const data = await res.json();
        setStudent(data.student);
        setInstitute(data.institute);
      } catch (error) {
        console.error("Dashboard Load Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#F2F5F3] gap-4">
        <div className="w-12 h-12 border-4 border-[#2E5843] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#2E5843] font-medium animate-pulse">Fetching your academic profile...</p>
      </div>
    );
  }

  // Helper for Sidebar Buttons
  const NavButton = ({ id, icon: Icon, label }) => {
    const active = activeTab === id;
    return (
      <button 
        onClick={() => setActiveTab(id)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
          active 
            ? "bg-white text-[#2E5843] shadow-lg shadow-[#2E5843]/10 font-bold translate-x-2" 
            : "text-white/70 hover:bg-white/10 hover:text-white"
        }`}
      >
        <Icon size={20} strokeWidth={active ? 2.5 : 2} />
        <span className="text-sm tracking-wide">{label}</span>
      </button>
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F2F5F3] font-sans text-gray-800">
      
      {/* SIDEBAR */}
      <aside className="hidden md:flex flex-col w-[280px] h-full p-4 pr-0 shrink-0">
        <div 
          className="flex-1 rounded-[30px] flex flex-col relative overflow-hidden shadow-2xl"
          style={{ background: `linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.primaryDark} 100%)` }}
        >
          {/* Branding Pill */}
          <div className="p-6 pt-8 pb-4">
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-full p-2 pr-6 flex items-center gap-4">
              <div className="w-17 h-12 rounded-full  flex items-center justify-center shadow-md p-1 overflow-hidden">
                 <img 
                   src={institute?.logo || "https://via.placeholder.com/50"} 
                   alt="Logo" 
                   className="w-full h-full object-contain"
                 />
              </div>
              <div className="flex flex-col">
                <h1 className="text-white font-black text-lg leading-none tracking-tight">
                  {institute?.code || "CAMPUS"}
                </h1>
                <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest mt-0.5">
                  Student Portal
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-4 custom-scrollbar">
            <NavButton id="overview" icon={LayoutGrid} label="Overview" />
            <NavButton id="profile" icon={User} label="My Profile" />
            <NavButton id="academics" icon={BookOpen} label="Academics" />
            <NavButton id="attendance" icon={Clock} label="Attendance" />
            <NavButton id="results" icon={Award} label="Results" />
          </nav>

          <div className="p-4 bg-[#1e3b2c]/30 backdrop-blur-md mt-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4E7DD] text-[#2E5843] flex items-center justify-center font-bold text-lg overflow-hidden">
                {student?.profilePic ? (
                  <img src={student.profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  student?.name?.[0]
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-sm font-bold truncate">{student?.name}</p>
                <p className="text-white/50 text-[10px] truncate">{student?.SID}</p>
              </div>
              <button onClick={handleLogout} className="ml-auto text-white/50 hover:text-white hover:bg-white/10 p-2 rounded-lg transition">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 h-full overflow-hidden flex flex-col relative">
        <header className="md:hidden p-4 flex justify-between items-center bg-white shadow-sm z-50">
           <span className="font-bold text-[#2E5843]">{institute?.code}</span>
           <Menu className="text-gray-600" />
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">
                  Hello, <span style={{ color: THEME.primary }}>{student?.name?.split(' ')[0]}</span> 👋
                </h2>
                <p className="text-gray-500 mt-1 flex items-center gap-2">
                  <MapPin size={14} /> {institute?.name}
                </p>
              </div>
              <div className="hidden md:flex gap-3">
                 <button className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-400 hover:text-[#2E5843] hover:border-[#2E5843] transition-all relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                 </button>
              </div>
            </div>

            {/* --- BENTO GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* CARD 1: ID Card Style */}
              <div className="md:col-span-1 h-64 perspective-1000 group">
                 <div className="relative w-full h-full rounded-3xl transition-transform duration-700 transform hover:scale-[1.02] shadow-xl overflow-hidden">
                    <div className="absolute inset-0 p-6 flex flex-col text-white"
                         style={{ background: `linear-gradient(145deg, ${THEME.primary}, ${THEME.primaryDark})` }}>
                        
                        <div className="flex justify-between items-start mb-4">
                           <div className="w-10 h-10 bg-white/20 rounded-full p-1 backdrop-blur-md flex items-center justify-center">
                             <img src={institute?.logo} className="w-full h-full object-contain" alt="Inst Logo" />
                           </div>
                           <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold tracking-wider uppercase">
                             Active
                           </div>
                        </div>

                        <div className="mt-auto relative z-10">
                           <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/30 mb-3 overflow-hidden shadow-inner">
                              {student?.profilePic ? (
                                <img src={student.profilePic} className="w-full h-full object-cover" alt="Profile" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl font-bold">{student?.name?.[0]}</div>
                              )}
                           </div>
                           <h3 className="text-xl font-bold tracking-wide leading-tight">{student?.name}</h3>
                           <p className="text-white/70 text-sm font-mono tracking-widest mt-1">{student?.SID}</p>
                           <p className="text-white/50 text-xs mt-1">{student?.department} • Sem {student?.semester}</p>
                        </div>
                        
                        {/* Decorative background circle */}
                        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white opacity-[0.05] rounded-full blur-2xl pointer-events-none"></div>
                    </div>
                 </div>
              </div>

              {/* CARD 2: Stats */}
              <div className="md:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                 <div className="flex justify-between items-start">
                   <div>
                     <h3 className="text-lg font-bold text-gray-800">Academic Overview</h3>
                     <p className="text-sm text-gray-400">Department of {student?.department}</p>
                   </div>
                   <div className="bg-[#D4E7DD] p-2 rounded-xl text-[#2E5843]">
                     <TrendingUp size={20} />
                   </div>
                 </div>

                 <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-gray-50">
                       <p className="text-xs text-gray-400 font-bold uppercase">Section</p>
                       <p className="text-2xl font-bold text-gray-800 mt-1">{student?.section}</p>
                    </div>
                    <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-gray-50">
                       <p className="text-xs text-gray-400 font-bold uppercase">Year</p>
                       <p className="text-2xl font-bold text-gray-800 mt-1">{student?.year}</p>
                    </div>
                    <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-gray-50">
                       <p className="text-xs text-gray-400 font-bold uppercase">Phone</p>
                       <p className="text-sm font-bold text-gray-800 mt-2 truncate" title={student?.phone}>{student?.phone}</p>
                    </div>
                 </div>
              </div>

              {/* CARD 3: Schedule */}
              <div className="md:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Calendar className="text-[#2E5843]" size={20} /> Current Semester
                  </h3>
                  <span className="text-xs font-bold bg-[#2E5843] text-white px-3 py-1 rounded-full">Active</span>
                </div>
                <div className="space-y-3">
                   {['Admission No: ' + student?.admissionNo, 'Email: ' + student?.email, 'Roll Number: ' + student?.rollNumber].map((item, i) => (
                     <div key={i} className="flex items-center p-3 bg-gray-50 rounded-xl">
                        <div className="w-2 h-2 rounded-full bg-[#2E5843] mr-4"></div>
                        <span className="text-sm font-medium text-gray-700 flex-1">{item}</span>
                     </div>
                   ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default StudentDashboard;