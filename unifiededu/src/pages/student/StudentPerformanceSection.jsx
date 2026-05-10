import React, { useState } from "react";
import {
  Sparkles, TrendingUp, Target, BrainCircuit,
  Activity, Zap, Award
} from "lucide-react";

// Safe API URL definition
const API_URL = import.meta.env.VITE_BACKEND_URL;

const StudentPerformanceSection = ({ student }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- 1. PREPARE ACADEMIC DATA ---
  const academicHistory = student?.academic?.semesterResults || [];
  const currentCGPA = student?.academic?.cgpa || 0;

  // Sort semesters numerically
  const sortedHistory = [...academicHistory].sort((a, b) => Number(a.semester) - Number(b.semester));

  // Format for the Chart
  const sgpaData = sortedHistory.map(record => ({
    label: `Sem ${record.semester}`,
    score: record.sgpa
  }));

  const handleGenerateAnalysis = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("studentToken");
      const res = await fetch(`${API_URL}/student/performance/analyze`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);
      }
    } catch (e) {
      console.error("Analysis failed", e);
    } finally {
      setLoading(false);
    }
  };

  // --- REUSABLE SVG LINE CHART (Fixed Visibility) ---
  const PerformanceLineChart = ({ data, color = "#8b5cf6", maxValue = 10 }) => {
    if (!data || data.length === 0) return <div className="text-center text-gray-400 text-xs py-10">No academic data yet</div>;

    const height = 150;
    const width = 500;
    const padding = 20;

    const points = data.map((item, index) => {
      const x = (index / (data.length - 1 || 1)) * (width - 2 * padding) + padding;
      // Ensure score is treated as number and doesn't exceed bounds
      const safeScore = Number(item.score) || 0;
      const y = height - (safeScore / maxValue) * (height - 2 * padding) - padding;
      return { x, y, score: safeScore, label: item.label };
    });

    const linePath = points.map((p, i) => (i === 0 ? "M" : "L") + ` ${p.x},${p.y}`).join(" ");
    // Close the path for the gradient fill
    const areaPath = `${linePath} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;

    return (
      <div className="w-full mt-6 select-none">
        <div className="relative w-full aspect-[3/1] max-h-60">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid */}
            <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#e5e7eb" strokeDasharray="4" />
            <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#e5e7eb" strokeDasharray="4" />
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" strokeDasharray="4" />

            {/* Gradient Area Fill (Makes it visible) */}
            <path d={areaPath} fill={`url(#grad-${color})`} stroke="none" />

            {/* Main Line */}
            <path d={linePath} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm" />

            {/* Points */}
            {points.map((p, i) => (
              <g key={i} className="group cursor-pointer">
                <circle cx={p.x} cy={p.y} r="6" fill="#fff" stroke={color} strokeWidth="3" className="transition-all group-hover:r-8" />
                <foreignObject x={p.x - 20} y={p.y - 40} width="40" height="30" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-gray-800 text-white text-[10px] py-1 px-2 rounded-md text-center shadow-lg">
                    {p.score}
                  </div>
                </foreignObject>
              </g>
            ))}
          </svg>
        </div>
        <div className="flex justify-between px-2 mt-2">
          {data.map((item, i) => (
            <div key={i} className="text-center w-20">
              <p className="text-[10px] font-bold text-gray-500 uppercase">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-10">

      {/* 1. ACADEMIC OVERVIEW SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CGPA Card */}
        <div className="lg:col-span-1 bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-center items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <Award size={100} />
          </div>
          <h3 className="text-gray-500 font-bold uppercase tracking-wider text-sm mb-2">Cumulative GPA</h3>
          <div className="text-6xl font-black text-emerald-600 mb-2">
            {currentCGPA || "N/A"}
          </div>
        </div>

        {/* SGPA Trend Graph */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" /> SGPA Progression
            </h3>
            <span className="text-xs text-gray-400 font-medium">Real-time Semester Performance</span>
          </div>
          {/* Passed maxValue as 10 for SGPA */}
          <PerformanceLineChart data={sgpaData} color="#3b82f6" maxValue={10} />
        </div>
      </div>

      {/* 2. AI ANALYSIS HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-indigo-900 to-purple-900 rounded-[2.5rem] p-8 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-3xl font-extrabold flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-purple-300" />
            AI Performance Coach
          </h2>
          <p className="text-indigo-200 mt-2 text-sm leading-relaxed">
            Get deep insights into your attendance vs marks correlation and future predictions.
          </p>
        </div>

        <button
          onClick={handleGenerateAnalysis}
          disabled={loading}
          className="relative z-10 mt-6 md:mt-0 px-8 py-4 bg-white text-indigo-900 font-bold rounded-2xl shadow-lg hover:bg-indigo-50 transition-all flex items-center gap-3 disabled:opacity-70"
        >
          {loading ? (
            <><div className="w-5 h-5 border-2 border-indigo-900 border-t-transparent rounded-full animate-spin"></div> Analyzing...</>
          ) : (
            <><Sparkles className="w-5 h-5 text-purple-600" /> Run AI Analysis</>
          )}
        </button>
      </div>

      {/* 3. AI ANALYSIS RESULTS */}
      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" /> Strategic Overview
              </h3>
              <p className="text-gray-600 leading-normal text-justify hyphens-auto">
                {analysis.insight}
              </p>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Metric Analysis</h4>
                  <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-1 rounded-full font-bold">AI Score</span>
                </div>
                <PerformanceLineChart data={analysis.graphData} color="#8b5cf6" maxValue={100} />
              </div>
            </div>

            {/* Prediction Card */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-[2rem] p-6 flex flex-col gap-6 shadow-sm">
              <div className="text-lg font-bold text-emerald-800 w-full text-left leading-relaxed">
                {analysis.prediction}
              </div>

              <div className="flex items-center gap-4 self-end mt-2">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-800 uppercase">Next Sem Prediction</p>
                  <p className="text-emerald-900 font-medium text-sm mt-1">AI Calculated</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-900 text-white rounded-[2.5rem] p-8 shadow-xl h-full flex flex-col">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Target className="w-6 h-6 text-red-400" /> Improvement Areas
              </h3>
              <div className="flex-1 space-y-6">
                {analysis.improvementAreas.map((area, idx) => (
                  <div key={idx} className="group cursor-default">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-lg text-red-200 group-hover:text-white transition-colors">
                        {idx + 1}. {area.area}
                      </h4>
                      <Zap className="w-4 h-4 text-gray-600 group-hover:text-yellow-400 transition-colors" />
                    </div>
                    <div className="pl-4 border-l-2 border-gray-700 group-hover:border-red-400 transition-colors space-y-2">
                      <p className="text-xs text-gray-400 font-medium">
                        <span className="text-gray-500 uppercase text-[10px]">Issue:</span> {area.reason}
                      </p>
                      <p className="text-sm text-gray-300 leading-snug">
                        <span className="text-green-400 font-bold">Action:</span> {area.action}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default StudentPerformanceSection;
