// src/pages/student/auth.jsx
import React, { useState } from "react";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const StudentLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(""); // Clear error on type
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

      // Login Success
      localStorage.setItem("studentToken", data.token);
      localStorage.setItem("studentName", data.user.name);
      
      // Redirect to Dashboard
      navigate("/student/dashboard");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex">
        
        {/* Left Side - Visuals */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#2E5843] relative items-center justify-center p-12">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 border-2 border-white rounded-full"></div>
          </div>
          <div className="relative z-10 text-center">
            <img 
              src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=600&fit=crop" 
              alt="Student"
              className="w-80 h-80 object-cover rounded-2xl shadow-2xl border-4 border-white/20"
            />
            <h2 className="text-3xl font-bold text-white mt-8">Welcome Back!</h2>
            <p className="text-white/70 mt-2">Access your portal to view attendance, results, and more.</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 p-12 flex flex-col justify-center">
          <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition mb-8 w-fit">
            <ArrowLeft size={18} /> Back to Home
          </Link>
          
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-8 bg-[#2E5843] rounded-full"></div>
              <span className="text-xl font-bold text-gray-800">CampusVersa</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Student Login</h2>
            <p className="text-gray-500">Please enter your registered email and password (or USN).</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">Official Email</label>
              <input
                type="email"
                name="email"
                required
                placeholder="nitesh@edu.in"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2E5843] focus:border-transparent transition bg-gray-50 text-gray-800 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">Password</label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2E5843] focus:border-transparent transition bg-gray-50 text-gray-800 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2E5843] hover:bg-[#1e3b2c] text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/20 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Sign In to Portal"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;