import React, { useState } from "react";
import { 
  Briefcase, 
  Lock, 
  Eye, 
  EyeOff, 
  Cpu, 
  Globe, 
  Award,
  ArrowRight
} from "lucide-react";
import bookImage from "../../assets/logo.png";

const API_URL = import.meta.env.VITE_BACK_URI;

const FacultyAuth = () => {
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/faculty/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

     if (response.ok) {
  localStorage.setItem("facultyToken", data.token);
  localStorage.setItem("facultyName", data.name);
  
  // Save Theme
  localStorage.setItem("primary", data.themeColorPrimary || "#5D3FD3");
  localStorage.setItem("secondary", data.themeColorSecondary || "#ffffff");

  // --- NEW: Save Logo ---
  if (data.instituteLogo) {
    localStorage.setItem("instituteLogo", data.instituteLogo);
  }

  // KYC Check
  if (data.isKycVerified) {
       window.location.href = "/fc/dash";
  } else {
       window.location.href = "/faculty/kyc-verification";
  }
} else {
        setErrorMsg(data.message || "Invalid credentials");
      }
    } catch (error) {
      setErrorMsg("Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* --- 1. Background: Light Gradient (#ffffff to #f0f3f8) --- */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#ffffff] to-[#f0f3f8]">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-slate-300/40 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-slate-400/30 blur-[120px] animate-pulse delay-1000"></div>
      </div>

      {/* --- 2. Navbar Floating --- */}
      <nav className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
        
        {/* Logo Pill */}
        <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 shadow-sm select-none cursor-default">
           <img src={bookImage} alt="Logo" className="w-6 h-6 rounded-md shadow-sm" />
           <span className="text-lg font-bold text-slate-700 tracking-wide">CampusVersa</span>
        </div>

        {/* Return Home Pill */}
        <a 
          href="/" 
          className="flex items-center space-x-2 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 shadow-sm hover:bg-white hover:shadow-md transition-all duration-300 text-slate-600 hover:text-slate-900 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform duration-300">&larr;</span>
          <span className="text-sm font-bold tracking-wide">Return Home</span>
        </a>

      </nav>

      {/* --- 3. Main Glass Card --- */}
      <div className="relative z-10 w-full max-w-5xl bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[600px] border border-slate-100">
        
        {/* === LEFT SIDE: Slate Grey Canvas === */}
        <div className="hidden md:flex w-5/12 bg-slate-700 p-12 flex-col justify-between relative overflow-hidden">
          
          {/* Abstract Pattern overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

          <div className="z-10 mt-8">
            <h1 className="text-4xl font-serif text-white leading-tight mb-4">
              Inspire the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-indigo-300 font-sans font-bold">
                Next Generation.
              </span>
            </h1>
            <p className="text-indigo-100 text-sm leading-relaxed max-w-xs">
              Welcome to the Faculty portal. Manage your curriculum, track performance, and engage with students through our unified academic workspace.
            </p>
          </div>

          {/* Floating 3D-style Elements */}
          <div className="relative z-10 h-48 w-full mt-8">
            {/* Card 1 */}
            <div className="absolute top-0 left-0 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-xl w-40 transform hover:-translate-y-2 transition-transform duration-500">
                <Globe className="w-6 h-6 text-teal-300 mb-2" />
                <div className="h-2 w-16 bg-white/20 rounded mb-2"></div>
                <div className="h-2 w-24 bg-white/10 rounded"></div>
            </div>
            {/* Card 2 */}
            <div className="absolute top-12 right-4 bg-slate-800 p-4 rounded-xl border border-slate-600 shadow-2xl w-44 transform translate-x-4 hover:translate-x-2 transition-transform duration-500">
                <div className="flex justify-between items-start mb-2">
                    <Award className="w-6 h-6 text-yellow-400" />
                    <span className="text-xs text-indigo-200 font-mono">A++</span>
                </div>
                <div className="text-white text-xs font-semibold">Department Metrics</div>
                <div className="text-indigo-200 text-[10px] mt-1">NAAC Accredited</div>
            </div>
             {/* Card 3 */}
             <div className="absolute bottom-0 left-8 bg-white p-4 rounded-xl shadow-lg w-48 transform rotate-[-3deg]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                    <div>
                        <div className="h-2 w-20 bg-slate-800 rounded mb-1"></div>
                        <div className="h-2 w-12 bg-slate-400 rounded"></div>
                    </div>
                </div>
            </div>
          </div>

          <div className="z-10 text-xs text-indigo-300/60 font-mono">
            Secure Connection • End-to-End Encrypted
          </div>
        </div>

        {/* === RIGHT SIDE: Form === */}
        <div className="flex-1 bg-white p-10 md:p-16 flex flex-col justify-center">
            
            <div className="max-w-md w-full mx-auto">
                <div className="mb-10">
                    <h2 className="text-2xl font-bold text-slate-900">Faculty Sign In</h2>
                    <p className="text-slate-500 text-sm mt-2">
                        Enter your credentials to access the dashboard.
                    </p>
                </div>

                {errorMsg && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-md flex items-center animate-pulse">
                        <span className="mr-2">⚠️</span> {errorMsg}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    
                    <div className="group">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 group-focus-within:text-indigo-600 transition-colors">
                            FID or Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                                <Briefcase className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                            </div>
                            <input
                                type="text"
                                name="identifier"
                                value={formData.identifier}
                                onChange={handleChange}
                                className="block w-full pl-8 pr-3 py-3 border-b-2 border-slate-200 text-slate-900 placeholder-slate-300 focus:outline-none focus:border-indigo-600 focus:ring-0 transition-all bg-transparent sm:text-sm"
                                placeholder="e.g. FAC-2024-001"
                                required
                            />
                        </div>
                    </div>

                    <div className="group">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 group-focus-within:text-indigo-600 transition-colors">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-0 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                            </div>
                            <input
                                type={showPass ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="block w-full pl-8 pr-10 py-3 border-b-2 border-slate-200 text-slate-900 placeholder-slate-300 focus:outline-none focus:border-indigo-600 focus:ring-0 transition-all bg-transparent sm:text-sm"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                            >
                                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-500 cursor-pointer">
                                Remember device
                            </label>
                        </div>
                        <div className="text-sm">
                            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                                Forgot password?
                            </a>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-200 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <Cpu className="animate-spin h-4 w-4" /> Authenticating...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                Access Dashboard <ArrowRight className="h-4 w-4" />
                            </span>
                        )}
                    </button>
                </form>

                <div className="mt-10 border-t border-slate-100 pt-6 text-center">
                    <p className="text-xs text-slate-400">
                        Protected by CampusVersa Identity Guard. <br/>
                        Unauthorized access is a punishable offense.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyAuth;