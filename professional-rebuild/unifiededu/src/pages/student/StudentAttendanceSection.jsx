import React, { useEffect, useState } from "react";
import { 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  BarChart3, 
  RefreshCcw,
  ArrowLeft
} from "lucide-react";

// Fixed: Removed import.meta to ensure compatibility with the current build environment.
// If you have a deployed backend, replace this URL with your production API endpoint.
const API_URL = import.meta.env.VITE_BACK_URI;

const StudentAttendanceSection = ({ student }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [stats, setStats] = useState({ overall: 0, totalClasses: 0, totalPresent: 0 });
  
  // Mobile UI State: Controls whether we show the list or the details view on small screens
  const [showMobileDetail, setShowMobileDetail] = useState(false);

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

      // Select first subject by default for DESKTOP view
      // On mobile, we keep showMobileDetail false so they see the list first
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

  // Handler for clicking a subject
  const handleSubjectClick = (record) => {
    setSelectedSubject(record);
    setShowMobileDetail(true); // Switch to detail view on mobile
  };

  // Handler for back button on mobile
  const handleBackToList = () => {
    setShowMobileDetail(false);
  };

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
    <section className="space-y-4 md:space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
      
      {/* 1. Header Stats Card */}
      {/* Hide stats on mobile if viewing details to save space */}
      <div className={`bg-white border border-gray-200 rounded-3xl p-4 md:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 ${showMobileDetail ? 'hidden lg:flex' : 'flex'}`}>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 shrink-0">
            <BarChart3 className="text-indigo-600" size={20} />
          </div>
          <div>
            <p className="text-xs md:text-sm text-gray-500 uppercase tracking-wide font-bold">
              Overall Attendance
            </p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl md:text-3xl font-black text-gray-900">{stats.overall}%</h2>
              <span className={`text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full ${getStatusColor(stats.overall)}`}>
                {stats.overall < 75 ? "Shortage" : "Good"}
              </span>
            </div>
            <p className="text-[10px] md:text-xs text-gray-400 mt-1">
              Total: {stats.totalPresent}/{stats.totalClasses} sessions
            </p>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex-1 md:w-32 bg-gray-50 rounded-2xl p-3 border border-gray-100 text-center min-w-[100px]">
            <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase">Safe</p>
            <p className="text-lg md:text-xl font-bold text-emerald-600">
              {attendanceData.filter(d => d.percentage >= 75).length}
            </p>
          </div>
          <div className="flex-1 md:w-32 bg-gray-50 rounded-2xl p-3 border border-gray-100 text-center min-w-[100px]">
            <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase">At Risk</p>
            <p className="text-lg md:text-xl font-bold text-red-600">
              {attendanceData.filter(d => d.percentage < 75).length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. Left Column: Subject List */}
        {/* Responsive Logic: Hidden on mobile if detail is shown, always visible on Desktop (lg) */}
        <div className={`
          lg:col-span-1 bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden flex flex-col
          ${showMobileDetail ? 'hidden lg:flex' : 'flex'}
          h-[calc(100vh-250px)] lg:h-[500px] 
        `}>
          <div className="p-5 border-b border-gray-100 bg-white sticky top-0 z-10">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-gray-400"/> Subjects
            </h3>
          </div>
          
          <div className="overflow-y-auto custom-scrollbar p-3 space-y-3 flex-1">
            {attendanceData.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-10">No attendance records found.</p>
            ) : (
              attendanceData.map((record) => {
                const isActive = selectedSubject?._id === record._id;
                return (
                  <div
                    key={record._id}
                    onClick={() => handleSubjectClick(record)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 group active:scale-95 ${
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
                        {Number(record.percentage || 0).toFixed(2)}%
                      </span>
                    </div>
                    
                    {/* Prconst API_URL = import.meta.env.VITE_BACK_URI;ogress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(record.percentage)}`} 
                        style={{ width: `${record.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 3. Right Column: Detailed History */}
        {/* Responsive Logic: Visible on mobile ONLY if detail is shown, always visible on Desktop */}
        <div className={`
          lg:col-span-2 bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden flex flex-col
          ${showMobileDetail ? 'flex' : 'hidden lg:flex'}
          h-[calc(100vh-150px)] lg:h-[500px]
        `}>
          {selectedSubject ? (
            <>
              <div className="p-4 md:p-6 border-b border-gray-100 bg-white sticky top-0 z-10 flex flex-col gap-4">
                {/* Mobile Back Button Header */}
                <div className="flex items-center gap-3 lg:hidden mb-2">
                  <button 
                    onClick={handleBackToList}
                    className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <span className="text-sm font-bold text-gray-500">Back to Subjects</span>
                </div>

                <div className="flex justify-between items-start md:items-center">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-800 flex flex-wrap items-center gap-2">
                      <span className="truncate max-w-[200px] md:max-w-none">{selectedSubject.courseId?.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full border shrink-0 ${getStatusColor(selectedSubject.percentage)}`}>
                        {Number(selectedSubject.percentage || 0).toFixed(2)}%
                      </span>
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedSubject.totalPresent} Present / {selectedSubject.totalClasses} Classes
                    </p>
                  </div>
                  <button onClick={fetchAttendance} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition-colors shrink-0">
                    <RefreshCcw size={16} />
                  </button>
                </div>
              </div>

              {/* History Grid */}
              <div className="overflow-y-auto custom-scrollbar flex-1 p-4 md:p-6">
                {selectedSubject.history && selectedSubject.history.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedSubject.history
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((log, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full shrink-0 ${
                            log.value === 1 ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                          }`}>
                            <Calendar size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-700">
                              {new Date(log.date).toLocaleDateString(undefined, { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </p>
                            <p className="text-[10px] text-gray-400">Session {selectedSubject.history.length - index}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {log.value === 1 ? (
                            <div className="flex items-center gap-1.5 px-2 md:px-3 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold">
                              <CheckCircle2 size={14} />
                              <span className="hidden md:inline">Present</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 px-2 md:px-3 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-bold">
                              <XCircle size={14} />
                              <span className="hidden md:inline">Absent</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <Calendar size={48} className="mb-4 opacity-20" />
                    <p>No daily records found.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
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