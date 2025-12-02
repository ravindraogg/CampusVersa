// src/pages/student/auth.jsx
import React, { useState } from "react";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
// 1. Updated Import path as requested
import loginimage from '../../assets/loginn.png';
import bookImage from "../../assets/logo.png";

const StudentLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const API_URL = import.meta.env.VITE_BACK_URI || "http://localhost:5000";
      
      const res = await fetch(`${API_URL}/student/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("studentToken", data.token);
      localStorage.setItem("studentName", data.user.name);
      
      navigate("/student/dashboard");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // 2. Page Container: White background (#ffffff), centered content
    <div className="min-h-screen w-full flex items-center justify-center bg-[#ffffff] p-4 font-sans">
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
      {/* 3. Card Container: "Small card", Centered, Rounded, Shadow, Border */}
      <div className="w-full max-w-4xl bg-[#18181b] rounded-[30px] shadow-2xl border border-gray-100 overflow-hidden flex flex-col lg:flex-row min-h-[550px]">
        
        {/* LEFT PANEL: Dark Form Section (45%) */}
        <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-12 py-12 text-white relative z-10">
          
          <div className="w-full">
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-3xl font-bold mb-2 tracking-tight">Login</h1>
              <p className="text-gray-400 text-sm">Enter your account details</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-center gap-3 text-sm">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Email / Username */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest ml-1 font-semibold">Username</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-gray-700 py-2 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#9c6bff] transition-colors"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest ml-1 font-semibold">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    className="w-full bg-transparent border-b border-gray-700 py-2 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#9c6bff] transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-2 text-gray-500 hover:text-gray-300 transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end pt-1">
                <button type="button" className="text-xs text-gray-400 hover:text-[#9c6bff] transition">
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#9c6bff] hover:bg-[#8b5cf6] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-900/20 transition-all flex items-center justify-center gap-2 mt-6"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Login"}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT PANEL: Purple Visuals (55%) */}
        <div className="hidden lg:flex lg:w-[55%] bg-[#a78bfa] relative flex-col items-center justify-center p-12 text-center overflow-hidden">
          
          {/* Background Decor */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#9c6bff] to-[#a78bfa]"></div>
          <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-purple-900 opacity-10 rounded-full blur-3xl"></div>

          {/* Content Layer */}
          <div className="relative z-10 w-full">
            <h2 className="text-4xl font-bold text-white mb-3 drop-shadow-sm">
              Welcome to <br/> Student portal
            </h2>
            <p className="text-white/90 text-sm mb-8 font-light tracking-wide">
              Login to access your account
            </p>
            
            {/* Illustration - Using the imported image */}
            <div className="w-full flex justify-center">
               <img 
                 src={loginimage}
                 alt="Student Portal Illustration"
                 className="w-full h-auto max-h-[350px] object-contain drop-shadow-2xl"
               />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentLogin;