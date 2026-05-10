import React, { useState } from "react";
import { Loader2, AlertCircle, Eye, EyeOff, GraduationCap, User, ArrowRight, ArrowLeft, CheckCircle2, TrendingUp, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

import loginimage from '../../assets/loginn.png';
import bookImage from "../../assets/logo.png";

const StudentLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // View states: 'login' or 'register'
  const [view, setView] = useState('login');
  // Sub-tabs for login: 'institute' or 'independent'
  const [loginType, setLoginType] = useState('institute');
  
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const API_URL = import.meta.env.VITE_BACKEND_URL;
      const res = await fetch(`${API_URL}/student/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("studentToken", data.token);
      localStorage.setItem("studentName", data.user.name);
      localStorage.setItem("accountType", data.user.accountType);

      if (data.user.isKycVerified || data.user.accountType === 'independent') {
        navigate("/student/dashboard");
      } else {
        navigate("/student/kyc");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#ffffff] p-4 font-sans">
      <nav className="absolute top-0 left-0 w-full p-4 sm:p-6 flex justify-between items-center z-50">
        <div className="flex items-center space-x-2 sm:space-x-3 bg-white/60 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-slate-200 shadow-sm select-none cursor-default">
          <img src={bookImage} alt="Logo" className="w-5 h-5 sm:w-6 sm:h-6 rounded-md shadow-sm" />
          <span className="text-sm sm:text-lg font-bold text-slate-700 tracking-wide">CampusVersa</span>
        </div>
        <a href="/" className="flex items-center space-x-1.5 sm:space-x-2 bg-white/60 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-slate-200 shadow-sm hover:bg-white hover:shadow-md transition-all duration-300 text-slate-600 hover:text-slate-900 group">
          <span className="group-hover:-translate-x-1 transition-transform duration-300 text-xs sm:text-base">&larr;</span>
          <span className="text-xs sm:text-sm font-bold tracking-wide">Return Home</span>
        </a>
      </nav>

      <div className="w-full max-w-sm sm:max-w-md lg:max-w-4xl bg-[#18181b] rounded-2xl sm:rounded-[30px] shadow-2xl border border-gray-100 overflow-hidden flex flex-col lg:flex-row min-h-[auto] sm:min-h-[600px]">
        
        {/* LEFT PANEL: Form Section */}
        <div className="w-full lg:w-[50%] flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-12 text-white relative z-10">
          
          <div className="w-full">
            {/* Mode Toggles */}
            <div className="flex bg-gray-900/50 p-1 rounded-xl mb-8 border border-gray-800">
                <button 
                    onClick={() => { setView('login'); setError(""); }} 
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${view === 'login' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                >Login</button>
                <button 
                    onClick={() => navigate('/student/independent-enrollment')} 
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${view === 'register' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                >Register Independent</button>
            </div>

            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 tracking-tight">Login</h1>
                <p className="text-gray-400 text-xs sm:text-sm">Sign in to your student portal</p>
            </div>

            <div className="flex gap-4 mb-8 border-b border-gray-800">
                <button onClick={() => setLoginType('institute')} className={`pb-2 text-xs font-bold tracking-widest transition-all ${loginType === 'institute' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-500'}`}>INSTITUTION</button>
                <button onClick={() => setLoginType('independent')} className={`pb-2 text-xs font-bold tracking-widest transition-all ${loginType === 'independent' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-500'}`}>INDEPENDENT</button>
            </div>

            {error && (
                <div className="mb-6 p-3 sm:p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-5 sm:space-y-6">
                <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest ml-1 font-semibold">Email Address</label>
                    <input type="email" name="email" required value={loginForm.email} onChange={handleLoginChange} className="w-full bg-transparent border-b border-gray-700 py-1.5 sm:py-2 text-sm sm:text-base text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors" placeholder="e.g. user@campus.edu" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest ml-1 font-semibold">Password</label>
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} name="password" required value={loginForm.password} onChange={handleLoginChange} className="w-full bg-transparent border-b border-gray-700 py-1.5 sm:py-2 text-sm sm:text-base !text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors pr-10" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-1.5 sm:top-2 text-gray-500 hover:text-gray-300 transition">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                    </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 sm:py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4 text-sm">
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Sign In"}
                </button>
            </form>
          </div>
        </div>

        {/* RIGHT PANEL: Visuals */}
        <div className="hidden lg:flex lg:w-[50%] bg-gradient-to-br from-purple-600 to-purple-400 relative flex-col items-center justify-center p-12 text-center">
          <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-purple-900 opacity-20 rounded-full blur-3xl"></div>

          <div className="relative z-10 w-full max-w-sm">
            <h2 className="text-3xl font-bold text-white mb-4">Empowering <br /> Every Student</h2>
            <p className="text-white/80 text-sm mb-12 font-light leading-relaxed">Whether you're part of an institute or learning independently, access best-in-class resources for your academic success.</p>
            <div className="bg-white/10 backdrop-blur-xl p-6 rounded-[2rem] border border-white/20 shadow-2xl">
                <div className="flex justify-around mb-4">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"><GraduationCap className="text-white"/></div>
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Labs</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"><TrendingUp className="text-white"/></div>
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Growth</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"><Briefcase className="text-white"/></div>
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Jobs</span>
                    </div>
                </div>
                <img src={loginimage} alt="Illustration" className="w-full h-auto max-h-[220px] object-contain drop-shadow-2xl" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentLogin;
