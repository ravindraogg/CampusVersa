import React, { useEffect, useState } from "react";
import { 
  BookOpen, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  BarChart3, 
  ChevronRight,
  RefreshCcw 
} from "lucide-react";

const API_URL = import.meta.env.VITE_BACK_URI || "http://localhost:5000";

const StudentAttendanceSection = ({ student }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [stats, setStats] = useState({ overall: 0, totalClasses: 0, totalPresent: 0 });

  // Fetch Attendance Data
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("studentToken");
      const res = await fetch(`${API_URL}/student/attendance/full`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch attendance");

      const data = await res.json();
      setAttendanceData(data);

      // Calculate Overall Aggregates
      let totalP = 0;
      let totalC = 0;

      data.forEach((record) => {
        totalP += record.totalPresent || 0;
        totalC += record.totalClasses || 0;
      });

      setStats({
        totalClasses: totalC,
        totalPresent: totalP,
        overall: totalC > 0 ? ((totalP / totalC) * 100).toFixed(2) : 0,
      });

      // Select first subject by default if available
      if (data.length > 0 && !selectedSubject) {
        setSelectedSubject(data[0]);
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // Helper for status color
  const getStatusColor = (percentage) => {
    if (percentage >= 85) return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (percentage >= 75) return "text-blue-600 bg-blue-50 border-blue-100";
    if (percentage >= 60) return "text-amber-600 bg-amber-50 border-amber-100";
    return "text-red-600 bg-red-50 border-red-100";
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 85) return "bg-emerald-500";
    if (percentage >= 75) return "bg-blue-500";
    if (percentage >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <section className="space-y-6 animate-in fade-in duration-500">
      {/* 1. Header Stats Card */}
      <div className="bg-white border border-gray-200 rounded-[2rem] p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
            <BarChart3 className="text-indigo-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wide font-bold">
              Overall Attendance
            </p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl font-black text-gray-900">{stats.overall}%</h2>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getStatusColor(stats.overall)}`}>
                {stats.overall < 75 ? "Shortage" : "Good"}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Total: {stats.totalPresent}/{stats.totalClasses} sessions attended
            </p>
          </div>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex-1 md:w-32 bg-gray-50 rounded-2xl p-3 border border-gray-100 text-center">
            <p className="text-xs text-gray-500 font-bold uppercase">Safe Subjects</p>
            <p className="text-xl font-bold text-emerald-600">
              {attendanceData.filter(d => d.percentage >= 75).length}
            </p>
          </div>
          <div className="flex-1 md:w-32 bg-gray-50 rounded-2xl p-3 border border-gray-100 text-center">
            <p className="text-xs text-gray-500 font-bold uppercase">At Risk</p>
            <p className="text-xl font-bold text-red-600">
              {attendanceData.filter(d => d.percentage < 75).length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. Left Column: Subject List */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-[2rem] p-5 shadow-sm h-[500px] overflow-y-auto custom-scrollbar">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gray-400"/> Subjects
          </h3>
          
          {attendanceData.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-10">No attendance records found.</p>
          ) : (
            <div className="space-y-3">
              {attendanceData.map((record) => {
                const isActive = selectedSubject?._id === record._id;
                return (
                  <div
                    key={record._id}
                    onClick={() => setSelectedSubject(record)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 group ${
                      isActive
                        ? "bg-indigo-50 border-indigo-200 shadow-inner"
                        : "bg-white border-gray-100 hover:border-indigo-100 hover:shadow-md"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="w-4/5">
                        <h4 className={`text-sm font-bold truncate ${isActive ? "text-indigo-900" : "text-gray-700"}`}>
                          {record.courseId?.name || "Unknown Course"}
                        </h4>
                        <p className="text-[10px] text-gray-400">{record.courseId?.code}</p>
                      </div>
                      <span className={`text-xs font-bold ${
                        record.percentage < 75 ? "text-red-500" : "text-emerald-500"
                      }`}>
                        {record.percentage?.toFixed(0)}%
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(record.percentage)}`} 
                        style={{ width: `${record.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Right Column: Detailed History (Calendar/List View) */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-[2rem] p-6 shadow-sm h-[500px] flex flex-col">
          {selectedSubject ? (
            <>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    {selectedSubject.courseId?.name}
                    <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(selectedSubject.percentage)}`}>
                      {selectedSubject.percentage}%
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    History Log • {selectedSubject.totalPresent} Present / {selectedSubject.totalClasses} Classes
                  </p>
                </div>
                <button onClick={fetchAttendance} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                  <RefreshCcw size={16} />
                </button>
              </div>

              {/* History Grid */}
              <div className="overflow-y-auto custom-scrollbar flex-1 pr-2">
                {selectedSubject.history && selectedSubject.history.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedSubject.history
                       // Sort by date descending (newest first)
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((log, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            log.value === 1 ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                          }`}>
                            <Calendar size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-700">
                              {new Date(log.date).toLocaleDateString(undefined, { 
                                weekday: 'short', 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </p>
                            <p className="text-[10px] text-gray-400">Session {selectedSubject.history.length - index}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {log.value === 1 ? (
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold">
                              <CheckCircle2 size={14} />
                              <span>Present</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-bold">
                              <XCircle size={14} />
                              <span>Absent</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <Calendar size={48} className="mb-4 opacity-20" />
                    <p>No daily records found for this course.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <BookOpen size={48} className="mb-4 opacity-20" />
              <p>Select a subject to view detailed history.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default StudentAttendanceSection;