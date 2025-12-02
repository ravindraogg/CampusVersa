// src/pages/student/StudentAttendanceSection.jsx
import React, { useEffect, useState } from "react";
import { BookOpen, AlertTriangle, CheckCircle2 } from "lucide-react";

const StudentAttendanceSection = ({ student }) => {
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    try {
      const raw = localStorage.getItem("mock_attendance");

      if (!raw) {
        setError(
          'No attendance data found. Run localStorage.setItem("mock_attendance", ...) in DevTools.'
        );
        setLoading(false);
        return;
      }

      const data = JSON.parse(raw);
      setAttendance(data);
    } catch (err) {
      console.error("Error reading mock_attendance from localStorage:", err);
      setError("Failed to read attendance data from localStorage.");
    } finally {
      setLoading(false);
    }
  }, []);

  const overall = attendance?.overall || {};
  const subjects = attendance?.subjects || [];
  const lowAttendance = subjects.filter((s) => s.percentage < 75);

  return (
    <section className="space-y-5">
      {/* Top card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center">
            <BookOpen className="text-indigo-600" size={18} />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Overall Attendance
            </p>
            {loading ? (
              <div className="h-5 w-16 bg-gray-200 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-xl font-semibold text-gray-900">
                {overall.percentage != null ? `${overall.percentage}%` : "–"}
              </p>
            )}
            <p className="text-xs text-gray-500">
              {overall.status || (loading ? "Loading..." : "No status")}
            </p>
          </div>
        </div>
        <div className="text-xs text-gray-500 text-right">
          <p>
            Daily, monthly and subject-wise breakdown helps you avoid{" "}
            <span className="font-semibold">shortage of attendance.</span>
          </p>
          {attendance?.lastUpdated && (
            <p className="mt-1 text-[11px]">
              Last updated:{" "}
              <span className="font-medium text-gray-700">
                {new Date(attendance.lastUpdated).toLocaleString()}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Subject-wise attendance */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm md:text-base font-semibold text-gray-900">
            Subject-wise Attendance
          </h3>
          <p className="text-xs text-gray-500">
            Hover on a subject to see highlights
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-40 h-3 bg-gray-200 rounded animate-pulse" />
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="h-2 bg-gray-200 w-2/3 animate-pulse" />
                  </div>
                </div>
                <div className="w-12 h-3 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : subjects.length === 0 ? (
          <p className="text-xs text-gray-500">
            No subject attendance data available.
          </p>
        ) : (
          <div className="space-y-3">
            {subjects.map((subj) => {
              const color =
                subj.percentage >= 85
                  ? "bg-emerald-500"
                  : subj.percentage >= 75
                  ? "bg-yellow-500"
                  : "bg-red-500";

              return (
                <div
                  key={subj.code || subj.name}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-40">
                    <p className="text-xs md:text-sm text-gray-800 truncate">
                      {subj.name}
                    </p>
                    {subj.code && (
                      <p className="text-[11px] text-gray-500">
                        {subj.code}
                      </p>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${color} group-hover:opacity-80 transition-opacity`}
                        style={{ width: `${subj.percentage}%` }}
                      />
                    </div>
                    {subj.totalClasses != null && (
                      <p className="text-[11px] text-gray-500 mt-1">
                        {subj.attendedClasses}/{subj.totalClasses} classes
                        attended
                      </p>
                    )}
                  </div>
                  <div className="w-12 text-xs font-semibold text-gray-800 text-right">
                    {subj.percentage != null ? `${subj.percentage}%` : "–"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Alerts */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          {lowAttendance.length > 0 ? (
            <>
              <AlertTriangle className="text-red-500" size={18} />
              <h3 className="text-sm font-semibold text-red-600">
                Early Warning – Low Attendance
              </h3>
            </>
          ) : (
            <>
              <CheckCircle2 className="text-emerald-600" size={18} />
              <h3 className="text-sm font-semibold text-emerald-700">
                All subjects are safe
              </h3>
            </>
          )}
        </div>
        {loading ? (
          <p className="text-xs text-gray-500">Checking risk subjects…</p>
        ) : lowAttendance.length > 0 ? (
          <ul className="text-xs text-gray-600 space-y-1">
            {lowAttendance.map((s) => (
              <li key={s.code || s.name}>
                • <span className="font-semibold">{s.name}</span> —{" "}
                {s.percentage}% (risk of shortage, please attend regularly).
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-gray-600">
            No subject is below the critical threshold. Keep your attendance
            above <span className="font-semibold">75%</span> to stay safe.
          </p>
        )}
      </div>
    </section>
  );
};

export default StudentAttendanceSection;
