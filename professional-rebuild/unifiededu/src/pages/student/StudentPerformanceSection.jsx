// src/pages/student/StudentPerformanceSection.jsx
import React from "react";
import { BarChart2, TrendingUp, Activity } from "lucide-react";

const StudentPerformanceSection = () => {
  const stats = {
    gpa: "8.7",
    cgpa: "8.3",
    rank: "Top 10%",
  };

  const subjects = [
    { name: "Data Structures", grade: "A", score: 9.0 },
    { name: "Algorithms", grade: "A", score: 8.8 },
    { name: "DBMS", grade: "B+", score: 8.2 },
    { name: "Operating Systems", grade: "A", score: 8.9 },
  ];

  return (
    <section className="space-y-5">
      {/* Top cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
            <BarChart2 className="text-blue-600" size={18} />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Current GPA
            </p>
            <p className="text-xl font-semibold text-gray-900">{stats.gpa}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
            <TrendingUp className="text-emerald-600" size={18} />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              CGPA
            </p>
            <p className="text-xl font-semibold text-gray-900">{stats.cgpa}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center">
            <Activity className="text-indigo-600" size={18} />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Overall Rank
            </p>
            <p className="text-base font-semibold text-gray-900">
              {stats.rank}
            </p>
          </div>
        </div>
      </div>

      {/* Subject trends */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm md:text-base font-semibold text-gray-900">
            Subject-wise Performance
          </h3>
          <p className="text-xs text-gray-500">
            Trend view – higher bar = better score
          </p>
        </div>

        <div className="space-y-3">
          {subjects.map((subj) => (
            <div key={subj.name} className="flex items-center gap-3">
              <div className="w-40 text-xs md:text-sm text-gray-700 truncate">
                {subj.name}
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${(subj.score / 10) * 100}%` }}
                  />
                </div>
              </div>
              <div className="w-10 text-xs text-gray-600 text-right">
                {subj.score.toFixed(1)}
              </div>
              <div className="w-10 text-xs font-semibold text-gray-800 text-right">
                {subj.grade}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Placeholder for AI performance prediction */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">
          AI Performance Prediction (Placeholder)
        </p>
        <p className="text-xs text-gray-500">
          Later you can connect this section to your AI model to show{" "}
          <span className="font-semibold">future GPA / backlog risk / subject analysis</span>.
        </p>
      </div>
    </section>
  );
};

export default StudentPerformanceSection;
