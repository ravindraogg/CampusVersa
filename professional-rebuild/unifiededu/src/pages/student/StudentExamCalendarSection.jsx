// src/pages/student/StudentExamCalendarSection.jsx
import React, { useEffect, useState } from "react";
import { CalendarDays, Clock, Bell } from "lucide-react";

const StudentExamCalendarSection = ({ student }) => {
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    try {
      const raw = localStorage.getItem("mock_exams");

      if (!raw) {
        setError(
          'No exam data found. Run localStorage.setItem("mock_exams", ...) in DevTools.'
        );
        setLoading(false);
        return;
      }

      const data = JSON.parse(raw);
      setExamData(data);
    } catch (err) {
      console.error("Error reading mock_exams from localStorage:", err);
      setError("Failed to read exam calendar data from localStorage.");
    } finally {
      setLoading(false);
    }
  }, []);

  const upcomingExams = examData?.upcomingExams || [];
  const deadlines = examData?.deadlines || [];

  const getBadgeColor = (dateStr) => {
    if (!dateStr) return "bg-gray-100 text-gray-600";
    const examDate = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.ceil(
      (examDate - today) / (1000 * 60 * 60 * 24)
    );

    if (diffDays <= 1) return "bg-red-50 text-red-700 border border-red-200";
    if (diffDays <= 3)
      return "bg-amber-50 text-amber-700 border border-amber-200";
    if (diffDays <= 7)
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    return "bg-gray-100 text-gray-700 border border-gray-200";
  };

  return (
    <section className="space-y-5">
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
          <CalendarDays className="text-blue-600" size={18} />
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Exam Calendar
          </p>
          <p className="text-sm text-gray-700">
            Upcoming exams and important academic deadlines.
          </p>
          {examData?.examSession && (
            <p className="text-[11px] text-gray-500 mt-1">
              Session:{" "}
              <span className="font-medium text-gray-700">
                {examData.examSession}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Upcoming exams */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-3">
          Upcoming Exams
        </h3>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="border border-gray-100 rounded-lg p-3 flex flex-col md:flex-row gap-3 animate-pulse"
              >
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="flex-1 flex flex-wrap gap-2">
                  <div className="h-3 w-20 bg-gray-200 rounded" />
                  <div className="h-3 w-16 bg-gray-200 rounded" />
                  <div className="h-6 w-24 bg-gray-200 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-xs text-red-600">{error}</p>
        ) : upcomingExams.length === 0 ? (
          <p className="text-xs text-gray-500">
            No upcoming exams scheduled right now.
          </p>
        ) : (
          <div className="space-y-3">
            {upcomingExams.map((exam, idx) => (
              <div
                key={exam.id || idx}
                className="border border-gray-200 rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {exam.subject}
                  </p>
                  <p className="text-xs text-gray-500">
                    {exam.type}{" "}
                    {exam.code && (
                      <span className="text-[11px] text-gray-400">
                        • {exam.code}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <CalendarDays size={14} />
                    {exam.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {exam.time}
                  </span>
                  {exam.room && (
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-[11px]">
                      Room: {exam.room}
                    </span>
                  )}
                  <span
                    className={`px-2 py-1 rounded-full text-[11px] font-medium ${getBadgeColor(
                      exam.date
                    )}`}
                  >
                    {exam.dateLabel || "Upcoming"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Deadlines */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="text-amber-500" size={18} />
          <h3 className="text-sm md:text-base font-semibold text-gray-900">
            Assignment & Project Deadlines
          </h3>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between border border-gray-100 rounded-lg px-3 py-2 animate-pulse"
              >
                <div className="h-3 w-40 bg-gray-200 rounded" />
                <div className="h-3 w-16 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : deadlines.length === 0 ? (
          <p className="text-xs text-gray-500">
            No active assignment or project deadlines.
          </p>
        ) : (
          <ul className="space-y-2 text-xs text-gray-700">
            {deadlines.map((d, idx) => (
              <li
                key={d.id || idx}
                className="flex items-center justify-between border border-gray-100 rounded-lg px-3 py-2"
              >
                <span>
                  {d.title}
                  {d.type && (
                    <span className="ml-1 text-[11px] text-gray-500">
                      • {d.type}
                    </span>
                  )}
                </span>
                <span className="text-gray-500 text-[11px]">
                  {d.due}
                </span>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-3 text-[11px] text-gray-500">
          Later you can plug this into your real backend or a calendar service
          to sync official exam schedules and reminders.
        </p>
      </div>
    </section>
  );
};

export default StudentExamCalendarSection;
