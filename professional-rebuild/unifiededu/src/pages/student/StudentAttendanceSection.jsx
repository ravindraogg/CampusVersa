// src/pages/student/StudentAttendanceSection.jsx
import React from "react";
import { BookOpen, AlertTriangle, CheckCircle2 } from "lucide-react";

const StudentAttendanceSection = () => {
  const overall = {
    percentage: 86,
    status: "Healthy",
  };

  const subjects = [
    { name: "Data Structures", percentage: 92 },
    { name: "Algorithms", percentage: 80 },
    { name: "DBMS", percentage: 74 },
    { name: "Operating Systems", percentage: 88 },
  ];

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
            <p className="text-xl font-semibold text-gray-900">
              {overall.percentage}%
            </p>
            <p className="text-xs text-gray-500">{overall.status}</p>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          <p>
            Daily, monthly and subject-wise breakdown helps you avoid{" "}
            <span className="font-semibold">shortage of attendance.</span>
          </p>
        </div>
      </div>

      {/* Subject-wise attendance */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm md:text-base font-semibold text-gray-900">
            Subject-wise Attendance
          </h3>
          <p className="text-xs text-gray-500">Daily / monthly views later</p>
        </div>

        <div className="space-y-3">
          {subjects.map((subj) => {
            const color =
              subj.percentage >= 85
                ? "bg-emerald-500"
                : subj.percentage >= 75
                ? "bg-yellow-500"
                : "bg-red-500";
            return (
              <div key={subj.name} className="flex items-center gap-3">
                <div className="w-40 text-xs md:text-sm text-gray-700 truncate">
                  {subj.name}
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${color}`}
                      style={{ width: `${subj.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="w-12 text-xs font-semibold text-gray-800 text-right">
                  {subj.percentage}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alerts / Early Warning System */}
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
        {lowAttendance.length > 0 ? (
          <ul className="text-xs text-gray-600 space-y-1">
            {lowAttendance.map((s) => (
              <li key={s.name}>
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
