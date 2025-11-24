// src/pages/student/StudentDashboard.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  User,
  BarChart2,
  BookOpen,
  CalendarDays,
  Briefcase,
} from "lucide-react";

import StudentProfileSection from "./StudentProfileSection";
import StudentPerformanceSection from "./StudentPerformanceSection";
import StudentAttendanceSection from "./StudentAttendanceSection";
import StudentExamCalendarSection from "./StudentExamCalendarSection";
import StudentCareerSection from "./StudentCareerSection";

// Helper: load from localStorage for now
const loadStudentFromLocalStorage = () => {
  try {
    const raw = localStorage.getItem("studentProfile");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse studentProfile from localStorage:", err);
    return null;
  }
};

const StudentDashboard = () => {
  const [activeSection, setActiveSection] = useState("profile"); // profile | performance | attendance | exam | career
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const data = loadStudentFromLocalStorage();
    setStudent(data);
  }, []);

  const sectionTitleMap = {
    profile: "Profile",
    performance: "Performance",
    attendance: "Attendance",
    exam: "Exam & Calendar",
    career: "Career Booster",
  };

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return <StudentProfileSection student={student} />;
      case "performance":
        return <StudentPerformanceSection student={student} />;
      case "attendance":
        return <StudentAttendanceSection student={student} />;
      case "exam":
        return <StudentExamCalendarSection student={student} />;
      case "career":
        return <StudentCareerSection student={student} />;
      default:
        return <StudentProfileSection student={student} />;
    }
  };

  const displayName = student?.name || "Student";
  const displayUSN = student?.usn || "USN not set";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">CampusVersa</h1>
          <p className="text-xs text-gray-500 mt-1">Student Portal</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          <div className="text-xs font-semibold text-gray-400 px-2 mb-1">
            Overview
          </div>

          <button
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${
              activeSection === "profile"
                ? "bg-blue-50 text-blue-700 font-medium"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setActiveSection("profile")}
          >
            <User size={16} />
            Profile
          </button>

          <button
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${
              activeSection === "performance"
                ? "bg-blue-50 text-blue-700 font-medium"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setActiveSection("performance")}
          >
            <BarChart2 size={16} />
            Performance
          </button>

          <button
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${
              activeSection === "attendance"
                ? "bg-blue-50 text-blue-700 font-medium"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setActiveSection("attendance")}
          >
            <BookOpen size={16} />
            Attendance
          </button>

          <button
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${
              activeSection === "exam"
                ? "bg-blue-50 text-blue-700 font-medium"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setActiveSection("exam")}
          >
            <CalendarDays size={16} />
            Exam & Calendar
          </button>

          <button
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${
              activeSection === "career"
                ? "bg-blue-50 text-blue-700 font-medium"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setActiveSection("career")}
          >
            <Briefcase size={16} />
            Career
          </button>
        </nav>

        <div className="px-4 py-4 border-t border-gray-200 text-xs text-gray-500">
          <Link to="/" className="hover:text-gray-800">
            ← Back to Landing
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {sectionTitleMap[activeSection]}
            </h2>
            <p className="text-xs text-gray-500">
              Student view • {sectionTitleMap[activeSection]} section
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">
                {displayName}
              </p>
              <p className="text-xs text-gray-500">{displayUSN}</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700">
              {displayName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="px-4 md:px-8 py-6 space-y-6">{renderSection()}</div>
      </main>
    </div>
  );
};

export default StudentDashboard;
