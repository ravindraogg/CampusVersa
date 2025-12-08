import React, { useState } from "react";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
      const API_URL = import.meta.env.VITE_BACK_URI;

      const res = await fetch(`${API_URL}/student/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store Auth Details
      localStorage.setItem("studentToken", data.token);
      localStorage.setItem("studentName", data.user.name);

      // --- KYC REDIRECTION LOGIC ---
      if (data.user.isKycVerified) {
        navigate("/student/dashboard");
      } else {
        navigate("/student/kyc"); // Navigate to the new KYC page
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Container: Adjusted padding for mobile (p-4) vs desktop
    <div className="min-h-screen w-full flex items-center justify-center bg-[#ffffff] p-4 font-sans">

      {/* Navbar: Responsive padding and spacing */}
      <nav className="absolute top-0 left-0 w-full p-4 sm:p-6 flex justify-between items-center z-50">

        {/* Logo Pill: Smaller text/icon on mobile */}
        <div className="flex items-center space-x-2 sm:space-x-3 bg-white/60 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-slate-200 shadow-sm select-none cursor-default">
          <img src={bookImage} alt="Logo" className="w-5 h-5 sm:w-6 sm:h-6 rounded-md shadow-sm" />
          <span className="text-sm sm:text-lg font-bold text-slate-700 tracking-wide">CampusVersa</span>
        </div>

        {/* Return Home Pill: Smaller text on mobile */}
        <a
          href="/"
          className="flex items-center space-x-1.5 sm:space-x-2 bg-white/60 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-slate-200 shadow-sm hover:bg-white hover:shadow-md transition-all duration-300 text-slate-600 hover:text-slate-900 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform duration-300 text-xs sm:text-base">&larr;</span>
          <span className="text-xs sm:text-sm font-bold tracking-wide">Return Home</span>
        </a>

      </nav>

      {/* Card Container: Responsive rounded corners, height, and width */}
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-4xl bg-[#18181b] rounded-2xl sm:rounded-[30px] shadow-2xl border border-gray-100 overflow-hidden flex flex-col lg:flex-row min-h-[auto] sm:min-h-[500px] lg:min-h-[550px]">

        {/* LEFT PANEL: Dark Form Section */}
        {/* Adjusted padding: px-6 py-8 on mobile -> px-12 py-12 on desktop */}
        <div className="w-full lg:w-[45%] flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-12 text-white relative z-10">

          <div className="w-full">
            {/* Header: Responsive text sizes */}
            <div className="mb-6 sm:mb-10">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 tracking-tight">Login</h1>
              <p className="text-gray-400 text-xs sm:text-sm">Enter your account details</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 sm:p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                <AlertCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">

              {/* Email / Username */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase tracking-widest ml-1 font-semibold">Username</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  // Responsive font size for input text
                  className="w-full bg-transparent border-b border-gray-700 py-1.5 sm:py-2 text-sm sm:text-base text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#9c6bff] transition-colors"
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
                    className="w-full bg-transparent border-b border-gray-700 py-1.5 sm:py-2 text-sm sm:text-base !text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#9c6bff] transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1.5 sm:top-2 text-gray-500 hover:text-gray-300 transition"
                  >
                    {showPassword ? <EyeOff size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Eye size={16} className="sm:w-[18px] sm:h-[18px]" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#9c6bff] hover:bg-[#8b5cf6] text-white font-bold py-3 sm:py-3.5 rounded-xl shadow-lg shadow-purple-900/20 transition-all flex items-center justify-center gap-2 mt-4 sm:mt-6 text-sm sm:text-base"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Login"}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT PANEL: Purple Visuals (Hidden on Mobile/Tablet, visible on Large screens) */}
        <div className="hidden lg:flex lg:w-[55%] bg-[#a78bfa] relative flex-col items-center justify-center p-12 text-center overflow-hidden">

          {/* Background Decor */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#9c6bff] to-[#a78bfa]"></div>
          <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-purple-900 opacity-10 rounded-full blur-3xl"></div>

          {/* Content Layer */}
          <div className="relative z-10 w-full">
            <h2 className="text-3xl xl:text-4xl font-bold text-white mb-3 drop-shadow-sm">
              Welcome to <br /> Student portal
            </h2>
            <p className="text-white/90 text-sm mb-8 font-light tracking-wide">
              Login to access your account
            </p>

            {/* Illustration */}
            <div className="w-full flex justify-center">
              <img
                src={loginimage}
                alt="Student Portal Illustration"
                className="w-full h-auto max-h-[300px] xl:max-h-[350px] object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentLogin;