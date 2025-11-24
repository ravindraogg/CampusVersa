import React, { useState } from "react";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const StudentLogin = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Student Login:", form);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="absolute top-6 left-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft size={18} /> Back to Home
        </Link>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h2 className="text-3xl font-semibold text-gray-900 text-center mb-6">
          Student Login
        </h2>
        <p className="text-center text-gray-500 text-sm mb-8">
          Please sign in using your student email.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="text-sm text-gray-600 block mb-2">
              Student Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                name="email"
                required
                placeholder="name@student.edu"
                value={form.email}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-gray-800"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-gray-600 block mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                name="password"
                required
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-gray-800"
              />
            </div>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => alert("Forgot password flow here")}
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Student Portal — CampusVersa
        </p>
      </div>
    </div>
  );
};

export default StudentLogin;
