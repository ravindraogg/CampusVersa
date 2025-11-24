
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, BarChart2, BookOpen, CalendarDays, Briefcase } from "lucide-react";

import StudentProfileSection from "./StudentProfileSection";


const loadStudentFromLocalStorage = () => {
  try {
    const raw = localStorage.getItem("studentProfile");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse studentProfile:", e);
    return null;
  }
};

const StudentDashboard = () => {
  const [activeSection, setActiveSection] = useState("profile");
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
        return (
          <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2">
              Academic Performance Dashboard
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              GPA, CGPA and subject trends will be shown here (connect to your data later).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-4 rounded-lg border border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-500">Current GPA</p>
                <p className="text-lg font-semibold text-gray-900">–</p>
              </div>
              <div className="p-4 rounded-lg border border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-500">Overall CGPA</p>
                <p className="text-lg font-semibold text-gray-900">–</p>
              </div>
              <div className="p-4 rounded-lg border border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-500">Rank / Percentile</p>
                <p className="text-lg font-semibold text-gray-900">–</p>
              </div>
            </div>
          </section>
        );

      case "attendance":
        return (
          <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2">
              Attendance Insights
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Daily, monthly and subject-wise attendance will be displayed here.
            </p>
            <div className="p-4 rounded-lg border border-gray-100 bg-gray-50 text-xs text-gray-600">
              Connect this section to your attendance API and show risk alerts when
              a subject falls below 75%.
            </div>
          </section>
        );

      case "exam":
        return (
          <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2">
              Exam Calendar & Deadlines
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Upcoming exams, internal tests and project submission deadlines.
            </p>
            <div className="p-4 rounded-lg border border-gray-100 bg-gray-50 text-xs text-gray-600">
              Later you can map this to your real exam schedule and reminders.
            </div>
          </section>
        );

      case "career":
        return (
          <section className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1">
                Career Booster
              </h3>
              <p className="text-xs text-gray-500">
                Resume, mock interview and roadmap tools will be integrated here.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <p className="font-semibold text-gray-900 mb-1">AI Resume Builder</p>
                <p className="text-xs text-gray-500 mb-3">
                  Generate and refine your resume automatically.
                </p>
                <button
                  type="button"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                  onClick={() => alert("Hook this to your resume builder page.")}
                >
                  Open Resume Builder →
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <p className="font-semibold text-gray-900 mb-1">Personalized Roadmap</p>
                <p className="text-xs text-gray-500 mb-3">
                  Plan skills, projects and certifications for your target role.
                </p>
                <button
                  type="button"
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-800"
                  onClick={() => alert("Hook this to your roadmap planner.")}
                >
                  View Roadmap →
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <p className="font-semibold text-gray-900 mb-1">Mock Interview</p>
                <p className="text-xs text-gray-500 mb-3">
                  Practice interview questions and get feedback.
                </p>
                <button
                  type="button"
                  className="text-xs font-semibold text-purple-600 hover:text-purple-800"
                  onClick={() => alert("Hook this to your mock interview UI.")}
                >
                  Start Mock Interview →
                </button>
              </div>
            </div>
          </section>
        );

      default:
        return <StudentProfileSection student={student} />;
    }
  };

  const displayName = student?.name || "Student";
  const displayUSN = student?.usn || "USN not set";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-6">
      {/* Outer card */}
      <div className="w-full max-w-6xl bg-white border border-gray-200 rounded-2xl shadow-sm flex overflow-hidden">
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
          <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex items-center justify-between">
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
                <p className="text-sm font-medium text-gray-900">{displayName}</p>
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
          <div className="px-4 md:px-6 py-5 space-y-5">{renderSection()}</div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
