import React, { useState } from "react";
import { 
  Sparkles, TrendingUp, Target, BrainCircuit, 
  Activity, Zap, BarChart2, CheckCircle 
} from "lucide-react";

const API_URL = import.meta.env.VITE_BACK_URI;

const StudentPerformanceSection = ({ student }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

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

  // --- CUSTOM SVG LINE CHART ---
  const PerformanceLineChart = ({ data }) => {
    if (!data || data.length === 0) return null;

    // SVG Config
    const height = 150;
    const width = 500; // arbitrary unit width for viewBox
    const padding = 20;

    // Calculate Coordinates
    // X is distributed evenly, Y is inverted (100 - score) scaled to height
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * (width - 2 * padding) + padding;
      const y = height - ((item.score || 0) / 100) * (height - 2 * padding) - padding;
      return { x, y, score: item.score, label: item.label };
    });

    // Generate Path String (Connect the dots)
    const pathData = points.map((p, i) => 
      (i === 0 ? "M" : "L") + ` ${p.x},${p.y}`
    ).join(" ");

    return (
      <div className="w-full mt-6 select-none">
        <div className="relative w-full aspect-[3/1] max-h-60">
          <svg 
            viewBox={`0 0 ${width} ${height}`} 
            className="w-full h-full overflow-visible"
          >
            {/* Background Grid Lines (Optional) */}
            <line x1={padding} y1={padding} x2={width-padding} y2={padding} stroke="#e5e7eb" strokeDasharray="4"/>
            <line x1={padding} y1={height/2} x2={width-padding} y2={height/2} stroke="#e5e7eb" strokeDasharray="4"/>
            <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="#e5e7eb" strokeDasharray="4"/>

            {/* The Gradient Area under the line (Optional aesthetic) */}
            <path 
              d={`${pathData} L ${width-padding},${height} L ${padding},${height} Z`} 
              fill="url(#gradient)" 
              opacity="0.2" 
            />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* The Line Itself */}
            <path 
              d={pathData} 
              fill="none" 
              stroke="#8b5cf6" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="drop-shadow-md"
            />

            {/* Data Points */}
            {points.map((p, i) => (
              <g key={i} className="group">
                {/* Outer Circle */}
                <circle cx={p.x} cy={p.y} r="6" fill="#fff" stroke="#8b5cf6" strokeWidth="2" className="transition-all group-hover:r-8"/>
                {/* Inner Dot */}
                <circle cx={p.x} cy={p.y} r="3" fill="#8b5cf6" />
                
                {/* Tooltip Label (Visible on Hover) */}
                <foreignObject x={p.x - 50} y={p.y - 45} width="100" height="40" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-gray-800 text-white text-[10px] py-1 px-2 rounded-lg text-center shadow-lg">
                    {p.score}/100
                  </div>
                </foreignObject>
              </g>
            ))}
          </svg>
        </div>

        {/* X-Axis Labels */}
        <div className="flex justify-between px-2 mt-2">
          {data.map((item, i) => (
            <div key={i} className="text-center w-20">
              <p className="text-[10px] font-bold text-gray-500 uppercase leading-tight">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-10">
      
      {/* Header & Button */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-indigo-900 to-purple-900 rounded-[2.5rem] p-8 shadow-xl text-white relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-lg">
          <h2 className="text-3xl font-extrabold flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-purple-300" /> 
            AI Performance Architect
          </h2>
          <p className="text-indigo-200 mt-2 text-sm leading-relaxed">
            Generate a personalized academic growth roadmap using our AI engine based on your marks and attendance.
          </p>
        </div>

        <button 
          onClick={handleGenerateAnalysis}
          disabled={loading}
          className="relative z-10 mt-6 md:mt-0 px-8 py-4 bg-white text-indigo-900 font-bold rounded-2xl shadow-lg hover:bg-indigo-50 transition-all flex items-center gap-3 disabled:opacity-70 disabled:scale-100 hover:scale-105 active:scale-95"
        >
          {loading ? (
            <><div className="w-5 h-5 border-2 border-indigo-900 border-t-transparent rounded-full animate-spin"></div> Analyzing...</>
          ) : (
            <><Sparkles className="w-5 h-5 text-purple-600" /> Run AI Analysis</>
          )}
        </button>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Insight & Graph */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" /> Strategic Overview
              </h3>
              <p className="text-gray-600 leading-loose text-justify font-medium">
                {analysis.insight}
              </p>
              
              {/* GRAPH SECTION */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex justify-between items-center mb-4">
                   <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Metric Analysis</h4>
                   <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-1 rounded-full font-bold">Live Data</span>
                </div>
                
                {/* NEW LINE CHART COMPONENT */}
                <PerformanceLineChart data={analysis.graphData} />
              </div>
            </div>

            {/* Prediction Banner */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-[2rem] p-6 flex items-center justify-between shadow-sm">
                              <div className="text-2xl font-black text-emerald-700 max-w-[50%] text-left leading-tight">
                 {analysis.prediction}
               </div>
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-600">
                   <TrendingUp className="w-6 h-6" />
                 </div>
                 
                 <div>
                   <p className="text-xs font-bold text-emerald-800 uppercase">AI Prediction</p>
                   <p className="text-emerald-900 font-medium text-sm mt-1">Based on current trajectory</p>
                 </div>
               </div>

            </div>
          </div>

          {/* Action Items */}
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
              
              <div className="mt-8 pt-6 border-t border-gray-800 text-center">
                 <p className="text-xs text-gray-500 italic">"Consistently good is better than occasionally great."</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Initial Empty State */}
      {!analysis && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 opacity-50">
          <BarChart2 className="w-24 h-24 mb-4" />
          <p className="text-lg font-bold">Ready to analyze</p>
          <p className="text-sm">Click the button above to start AI diagnostics.</p>
        </div>
      )}
    </div>
  );
};

export default StudentPerformanceSection;