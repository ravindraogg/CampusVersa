// src/pages/student/StudentPerformanceSection.jsx
import React, { useEffect, useState } from "react";
import { BarChart2, TrendingUp, Activity } from "lucide-react";

const StudentPerformanceSection = ({ student }) => {
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    try {
      const raw = localStorage.getItem("mock_performance");

      if (!raw) {
        setError(
          'No performance data found. Open DevTools → Console and run localStorage.setItem("mock_performance", ...).'
        );
        setLoading(false);
        return;
      }

      const data = JSON.parse(raw);
      setPerformance(data);
    } catch (err) {
      console.error("Error reading mock_performance from localStorage:", err);
      setError("Failed to read performance data from localStorage.");
    } finally {
      setLoading(false);
    }
  }, []);

  const stats = performance?.stats || {};
  const subjects = performance?.subjects || [];

  return (
    <section className="space-y-5">
      {/* Loading / error */}
      {loading && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm animate-pulse">
          <div className="h-4 w-40 bg-gray-200 rounded mb-3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-20 bg-gray-100 rounded-xl" />
            <div className="h-20 bg-gray-100 rounded-xl" />
            <div className="h-20 bg-gray-100 rounded-xl" />
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-4">
          <p className="font-semibold mb-1">Unable to load performance data</p>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
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
                <p className="text-xl font-semibold text-gray-900">
                  {stats.gpa ?? "–"}
                </p>
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
                <p className="text-xl font-semibold text-gray-900">
                  {stats.cgpa ?? "–"}
                </p>
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
                  {stats.rank || "Not available"}
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
              <p className="text-[11px] text-gray-500">
                Scores are out of 10 • Higher bar = better score
              </p>
            </div>

            {subjects.length === 0 ? (
              <p className="text-xs text-gray-500">
                No subject performance data available.
              </p>
            ) : (
              <div className="space-y-3">
                {subjects.map((subj) => {
                  const pct = Math.min(100, (subj.score / 10) * 100);
                  return (
                    <div
                      key={subj.code || subj.name}
                      className="flex items-center gap-3 group"
                    >
                      <div className="w-48">
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
                            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:opacity-80 transition-opacity"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      <div className="w-12 text-xs text-gray-600 text-right">
                        {subj.score?.toFixed(1) ?? "–"}
                      </div>

                      <div className="w-14 text-right">
                        <span className="inline-flex items-center justify-center rounded-full px-2 py-[2px] text-[11px] font-semibold bg-blue-50 text-blue-700">
                          {subj.grade || "-"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* AI insight */}
          {performance?.aiInsight && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-[11px] text-gray-500 mb-1 font-semibold uppercase tracking-wide">
                AI Performance Insight
              </p>
              <p className="text-xs text-gray-700 leading-relaxed">
                {performance.aiInsight}
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default StudentPerformanceSection;
