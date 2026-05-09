import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  GraduationCap,
  TrendingUp,
  Award,
  Edit,
  Save,
  Loader2,
  Lock,
  BookOpen,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ListChecks,
  History
} from "lucide-react";
const API_URL = import.meta.env.VITE_BACK_URI;
const FacultyStudentInfo = ({ student, onBack, theme, authFetch, refreshData, faculty, viewMode }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);

  // --- Attendance State ---
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [markingId, setMarkingId] = useState(null); 
  
  // --- Bulk Attendance State ---
  const [showBulk, setShowBulk] = useState(false);
  const [bulkData, setBulkData] = useState([]); // Array of { date, status }

  // --- Data Stability Refs ---
  const lastLoadedStudentId = useRef(null);

  // --- 1. DATA PREPARATION (Permissions) ---
  const [mySharedCourses, setMySharedCourses] = useState([]);

  useEffect(() => {
    if (student && faculty) {
      const myFacultyId = String(faculty._id || faculty.id);
      const myOptedCourseIds = (faculty.courses || []).map(c => String(c?._id || c));

      const shared = [];
      
      if (student.courseEnrollments) {
        student.courseEnrollments.forEach(sem => {
          if (sem.subjects) {
            sem.subjects.forEach(sub => {
              const studentCourseId = String(sub.courseId?._id || sub.courseId);
              const studentAssignedFacultyId = String(sub.facultyId?._id || sub.facultyId);

              // Strict Check: Must be opted by faculty AND assigned to this student
              const isCourseMatch = myOptedCourseIds.includes(studentCourseId);
              const isFacultyMatch = studentAssignedFacultyId === myFacultyId;

              if (isCourseMatch && isFacultyMatch) {
                shared.push({
                  courseId: studentCourseId,
                  courseName: sub.courseName || sub.courseCode || "Unknown Course",
                  semester: sem.semester,
                  marksDetails: sub.marksDetails || {},
                  marksObtained: sub.marksObtained || 0,
                  maxMarks: sub.maxMarks || 100,
                  attendance: sub.attendance 
                });
              }
            });
          }
        });
      }
      setMySharedCourses(shared);
    }
  }, [student, faculty]);

  const canEdit = viewMode === 'enrolled' && mySharedCourses.length > 0;

  // --- 2. FORM STATE ---
  const [isEditing, setIsEditing] = useState(false);
  const [courseForms, setCourseForms] = useState({}); 

  // --- 3. FETCH LATEST DATA (API) ---
  const fetchLatestCourseDetails = async () => {
    try {
      const res = await authFetch(`/faculty/student/course-details/${student._id}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.courses)) {
        const updated = {};

        data.courses.forEach(c => {
          const att = c.attendance || { attended: 0, total: 0, history: [] };
          const marks = c.marksDetails || { test1: 0, test2: 0, test3: 0, assignment: 0, external: 0 };

          updated[c.courseId] = {
            courseName: c.courseName,
            
            // Attendance Aggregates
            attended: att.attended || 0,
            total: att.total || 0,
            percentage: (att.total || 0) > 0 
              ? ((att.attended || 0) / (att.total || 1)) * 100 
              : 0,
            history: att.history || [], 

            // Marks
            test1: marks.test1 || 0,
            test2: marks.test2 || 0,
            test3: marks.test3 || 0,
            assignment: marks.assignment || 0,
            external: marks.external || 0,

            // Totals
            marksObtained: c.marksObtained || 0,
            maxMarks: c.maxMarks || 100
          };
        });

        setCourseForms(updated);
      }
    } catch (error) {
      console.error("Error fetching details:", error);
    }
  };

  // --- 4. INITIAL SYNC ---
  useEffect(() => {
    if (student && mySharedCourses.length > 0 && lastLoadedStudentId.current !== student._id) {
      const initialData = {};
      mySharedCourses.forEach(c => {
        const attRecord = c.attendance || { attended: 0, total: 0 };
        const mDetails = c.marksDetails || {};

        initialData[c.courseId] = {
          courseName: c.courseName,
          attended: attRecord.attended || 0,
          total: attRecord.total || 0,
          percentage: (attRecord.total || 0) > 0 ? ((attRecord.attended || 0) / attRecord.total) * 100 : 0,
          history: [], 
          test1: mDetails.test1 || 0,
          test2: mDetails.test2 || 0,
          test3: mDetails.test3 || 0,
          assignment: mDetails.assignment || 0,
          external: mDetails.external || 0,
          marksObtained: c.marksObtained || 0
        };
      });

      setCourseForms(initialData);
      lastLoadedStudentId.current = student._id;
      fetchLatestCourseDetails();
    }
  }, [student, mySharedCourses]);

  // --- 5. HANDLERS ---
  const handleInputChange = (courseId, field, value) => {
    let numValue = Number(value);
    
    // Limits
    if (field.includes('test') && numValue > 50) numValue = 50;
    if (field === 'assignment' && numValue > 20) numValue = 20;
    if (field === 'external' && numValue > 100) numValue = 100;
    if (numValue < 0) numValue = 0;

    setCourseForms(prev => {
      const updatedRecord = { ...prev[courseId], [field]: numValue };
      
      // Auto-calc Marks Formula: (Avg(Internals) + External/2)
      if (['test1', 'test2', 'test3', 'assignment', 'external'].includes(field)) {
        const t1 = field === 'test1' ? numValue : updatedRecord.test1;
        const t2 = field === 'test2' ? numValue : updatedRecord.test2;
        const t3 = field === 'test3' ? numValue : updatedRecord.test3;
        const assign = field === 'assignment' ? numValue : updatedRecord.assignment;
        const ext = field === 'external' ? numValue : updatedRecord.external;

        const internalTotal = (t1 + t2 + t3 + assign) / 4; 
        const externalScaled = ext / 2;
        updatedRecord.marksObtained = parseFloat((internalTotal + externalScaled).toFixed(2));
      }
      
      return { ...prev, [courseId]: updatedRecord };
    });
  };

  // Bulk Save (Marks)
  const saveAllMarks = async () => {
    setLoading(true);
    try {
      const promises = Object.entries(courseForms).map(async ([courseId, data]) => {
        const payload = {
          studentId: student._id,
          courseId: courseId,
          attendance: { attended: data.attended, total: data.total }, 
          marksDetails: {
            test1: data.test1, test2: data.test2, test3: data.test3,
            assignment: data.assignment, external: data.external
          }
        };
        return authFetch('/faculty/student/update-course-details', {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      });

      await Promise.all(promises);
      setIsEditing(false);
      await fetchLatestCourseDetails(); 
      refreshData();
    } catch (e) {
      alert("Failed to save changes.");
    } finally {
      setLoading(false);
    }
  };

  // Single Day Attendance Marking
  const markAttendance = async (courseId, status, dateToMark = attendanceDate) => {
    try {
      const payload = {
        courseId: courseId,
        type: 'attendance',
        date: dateToMark,
        records: [{ studentId: student._id, value: status }]
      };

      const res = await authFetch('/faculty/evaluation/bulk-update', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      return res.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const handleSingleDayMark = async (courseId, status) => {
    setMarkingId(courseId);
    await markAttendance(courseId, status, attendanceDate);
    await fetchLatestCourseDetails();
    setMarkingId(null);
  };

  // --- BULK ATTENDANCE LOGIC (PAST 10 DAYS) ---
  const initBulkAttendance = () => {
    const dates = [];
    for (let i = 0; i < 10; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      // Skip weekends if needed, logic here. For now, just last 10 days.
      dates.push({ 
        date: d.toISOString().split('T')[0], 
        status: 'Present', // Default
        id: i
      });
    }
    setBulkData(dates);
    setShowBulk(true);
  };

  const handleBulkToggle = (index, status) => {
    const updated = [...bulkData];
    updated[index].status = status;
    setBulkData(updated);
  };

  const saveBulkAttendance = async (courseId) => {
    setMarkingId(courseId);
    try {
      // Execute sequentially to ensure database consistency
      for (const item of bulkData) {
        await markAttendance(courseId, item.status, item.date);
      }
      await fetchLatestCourseDetails();
      setShowBulk(false);
    } catch (e) {
      alert("Error saving bulk attendance");
    } finally {
      setMarkingId(null);
    }
  };

  // --- UI HELPERS ---
  const getPercentColor = (pct) => {
    if (pct < 75) return "text-red-600 bg-red-50 border-red-200"; 
    if (pct < 85) return "text-orange-600 bg-orange-50 border-orange-200"; 
    return "text-green-600 bg-green-50 border-green-200"; 
  };

  const PerformanceGraph = () => {
    const data = student.academic?.semesterResults || [];
    if (data.length === 0) return <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No academic data yet</div>;
    const points = data.map((d, i) => {
      const x = (i / (Math.max(data.length - 1, 1))) * 100;
      const y = 100 - ((d.sgpa || 0) / 10) * 100;
      return `${x},${y}`;
    }).join(" ");
    return (
      <div className="w-full h-40 relative mt-4">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <polyline fill="none" stroke={theme.primary} strokeWidth="2" points={points} vectorEffect="non-scaling-stroke" />
          {data.map((d, i) => <circle key={i} cx={`${x}%`} cy={`${y}%`} r="3" fill="white" stroke={theme.primary} strokeWidth="2" />)}
        </svg>
      </div>
    );
  };

  return (
    <div className="animate-in slide-in-from-right duration-300">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </button>
        {!canEdit && <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full border border-gray-200"><Lock className="w-3 h-3 text-gray-400" /><span className="text-xs font-bold text-gray-500">Read Only</span></div>}
      </div>

      {/* STUDENT PROFILE CARD */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-lg border border-gray-100 relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-gray-50 to-white rounded-full -mr-10 -mt-10 opacity-50 pointer-events-none"></div>
        <div className="relative flex flex-col md:flex-row gap-8 items-start">
          <div className="w-28 h-28 rounded-full p-1 border-2 border-dashed border-gray-300 flex-shrink-0">
            <div className="w-full h-full rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
              {student.profilePic ? <img src={student.profilePic} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-4xl font-bold text-gray-300">{student.name.charAt(0)}</span>}
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold text-gray-800">{student.name}</h1>
            <p className="text-gray-500 font-medium mt-1 flex items-center gap-2">
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">{student.SID}</span>
              <span>• {student.department} Dept • {student.year} Year</span>
            </p>
            <div className="flex gap-4 mt-4">
              <div className="text-center p-3 bg-blue-50 rounded-2xl min-w-[80px]">
                <p className="text-xs text-blue-600 font-bold uppercase">CGPA</p>
                <p className="text-xl font-black text-blue-800">{student.academic?.cgpa || "N/A"}</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-2xl min-w-[80px]">
                <p className="text-xs text-green-600 font-bold uppercase">Attend</p>
                <p className="text-xl font-black text-green-800">{Math.round(student.attendance?.overallPercentage || 0)}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 pb-1">
        {['overview', 'marks', 'attendance'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-bold capitalize transition-all relative ${activeTab === tab ? "text-gray-900" : "text-gray-400 hover:text-gray-600"}`}>
            {tab}
            {activeTab === tab && <span className="absolute bottom-[-5px] left-0 w-full h-1 bg-black rounded-t-full" style={{ backgroundColor: theme.primary }}></span>}
          </button>
        ))}
      </div>

      {/* --- TAB: OVERVIEW --- */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2"><TrendingUp className="w-5 h-5 text-gray-400" /> Performance Trend</h3>
            <PerformanceGraph />
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-[2rem] border border-indigo-100 shadow-sm">
            <h3 className="font-bold text-indigo-900 flex items-center gap-2 mb-4"><Award className="w-5 h-5 text-indigo-500" /> AI Insights</h3>
            <p className="text-sm font-medium text-gray-700 bg-white/60 p-4 rounded-xl">Consistent performance. Suggest focusing on Algorithms.</p>
          </div>
        </div>
      )}

      {/* --- TAB: MARKS --- */}
      {activeTab === 'marks' && (
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 text-lg">Course Marks Entry</h3>
            {canEdit && !isEditing ? (
              <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:opacity-90">
                <Edit className="w-3 h-3" /> Edit Marks
              </button>
            ) : isEditing && (
              <div className="flex gap-2">
                 <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold">Cancel</button>
                 <button onClick={saveAllMarks} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-green-700">
                   {loading ? <Loader2 className="w-3 h-3 animate-spin"/> : <Save className="w-3 h-3"/>} Save Changes
                 </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            {canEdit ? mySharedCourses.map(c => {
              const formData = courseForms[c.courseId] || {};
              return (
                <div key={c.courseId} className="p-5 rounded-2xl border border-gray-100 bg-gray-50">
                  <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
                    <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2"><BookOpen className="w-4 h-4 text-gray-400" />{c.courseName}</h4>
                    <span className="text-[10px] bg-white px-2 py-1 rounded border font-mono">Sem {c.semester}</span>
                  </div>
                  
                  {isEditing ? (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['test1','test2','test3','assignment'].map(field => (
                          <div key={field}>
                            <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">{field} ({field==='assignment'?'20':'50'})</label>
                            <input type="number" className="w-full p-2 rounded-lg border outline-none font-bold text-sm focus:border-blue-500" 
                              value={formData[field]} onChange={(e) => handleInputChange(c.courseId, field, e.target.value)} />
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col md:flex-row gap-4 pt-2 border-t border-gray-200">
                        <div className="flex-1">
                          <label className="text-[10px] uppercase font-bold text-blue-600 block mb-1">External Exam (100)</label>
                          <input type="number" max="100" className="w-full p-2 rounded-lg border-2 border-blue-100 outline-none font-bold text-sm focus:border-blue-500" 
                            value={formData.external} onChange={(e) => handleInputChange(c.courseId, 'external', e.target.value)} />
                        </div>
                        <div className="flex-1 bg-white p-2 rounded-lg border border-gray-200 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Projected Total</span>
                          <div className="flex items-end gap-1">
                            <span className="text-xl font-black text-gray-800">{formData.marksObtained}</span>
                            <span className="text-xs text-gray-400 mb-1">/ 100</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 md:col-span-1 grid grid-cols-2 gap-2 text-xs text-gray-600">
                         {['test1','test2','test3','assignment'].map(f => (
                           <div key={f} className="flex justify-between border-b pb-1">
                             <span className="capitalize">{f}</span> <span className="font-bold">{formData[f]}</span>
                           </div>
                         ))}
                      </div>
                      <div className="col-span-2 md:col-span-1 bg-white rounded-xl border border-gray-200 p-3 flex flex-col justify-center items-center">
                        <span className="text-[10px] text-gray-400 font-bold uppercase mb-1">Final Score</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-gray-800">{formData.marksObtained}</span>
                          <span className="text-sm font-bold text-gray-400">/ 100</span>
                        </div>
                        <span className="text-[10px] text-gray-400">Ext: {formData.external}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            }) : <div className="col-span-full text-center py-10 text-gray-400 italic">No courses assigned.</div>}
          </div>
        </div>
      )}

      {/* --- TAB: ATTENDANCE (UPDATED WITH BULK) --- */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Top Bar: Controls */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-wrap items-center gap-4 shadow-sm justify-between">
             <div className="flex items-center gap-4">
               <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Calendar className="w-5 h-5"/></div>
               {!showBulk ? (
                 <div>
                   <label className="text-[10px] font-bold text-gray-400 uppercase block">Single Date</label>
                   <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} className="font-bold text-gray-800 outline-none bg-transparent text-sm"/>
                 </div>
               ) : <span className="font-bold text-gray-800">Bulk Mode: Past 10 Days</span>}
             </div>
             
             {!showBulk ? (
               <button onClick={initBulkAttendance} className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-gray-800">
                 <ListChecks className="w-4 h-4" /> Bulk Fill (10 Days)
               </button>
             ) : (
               <button onClick={() => setShowBulk(false)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold">Cancel Bulk</button>
             )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {canEdit ? mySharedCourses.map(c => {
              const formData = courseForms[c.courseId] || {};
              const pct = Math.round(formData.percentage || 0);
              const todaysRecord = formData.history?.find(h => h.date === attendanceDate);

              return (
                <div key={c.courseId} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="font-bold text-gray-800 w-4/5 text-sm">{c.courseName}</h4>
                      <p className="text-xs text-gray-400">Sem {c.semester}</p>
                    </div>
                    {/* VISIBLE PERCENTAGE BADGE */}
                    <div className={`w-12 h-12 flex items-center justify-center rounded-full text-sm font-bold border-4 ${getPercentColor(pct).replace('bg-', 'border-').replace('text-', 'text-')}`}>
                      {pct}%
                    </div>
                  </div>

                  {/* MODE: BULK OR SINGLE */}
                  {showBulk ? (
                    <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100 animate-in fade-in">
                      <h5 className="text-xs font-bold text-gray-500 mb-3 uppercase">Past 10 Days Log</h5>
                      <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2 mb-4">
                        {bulkData.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs bg-white p-2 rounded border">
                            <span className="font-mono">{item.date}</span>
                            <div className="flex gap-1">
                              <button onClick={() => handleBulkToggle(idx, 'Present')} className={`px-2 py-1 rounded ${item.status==='Present'?'bg-green-100 text-green-700 font-bold':'text-gray-400'}`}>P</button>
                              <button onClick={() => handleBulkToggle(idx, 'Absent')} className={`px-2 py-1 rounded ${item.status==='Absent'?'bg-red-100 text-red-700 font-bold':'text-gray-400'}`}>A</button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => saveBulkAttendance(c.courseId)} disabled={markingId === c.courseId} className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold flex justify-center gap-2">
                        {markingId === c.courseId ? <Loader2 className="animate-spin w-4 h-4"/> : "Save Bulk Log"}
                      </button>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100">
                      <p className="text-xs font-bold text-gray-500 mb-3 flex items-center justify-between">
                        <span>Mark for {attendanceDate}</span>
                        {todaysRecord && <span className={`px-2 py-0.5 rounded text-[10px] ${todaysRecord.status==='Present'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{todaysRecord.status}</span>}
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => handleSingleDayMark(c.courseId, "Present")} disabled={markingId === c.courseId} className="flex-1 py-2 rounded-lg text-xs font-bold border bg-white text-gray-600 hover:text-green-600 hover:border-green-400 transition-all flex justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4"/> Present
                        </button>
                        <button onClick={() => handleSingleDayMark(c.courseId, "Absent")} disabled={markingId === c.courseId} className="flex-1 py-2 rounded-lg text-xs font-bold border bg-white text-gray-600 hover:text-red-600 hover:border-red-400 transition-all flex justify-center gap-2">
                          <XCircle className="w-4 h-4"/> Absent
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>Total: <b>{formData.total}</b></span>
                      <span>Attended: <b>{formData.attended}</b></span>
                    </div>
                    <details className="group">
                      <summary className="text-xs font-bold text-blue-600 cursor-pointer list-none flex items-center gap-1 hover:underline">
                         View Full History <History className="w-3 h-3 group-open:rotate-90 transition-transform"/>
                      </summary>
                      <div className="mt-3 max-h-32 overflow-y-auto custom-scrollbar space-y-1">
                        {formData.history && formData.history.length > 0 ? (
                          formData.history.slice().reverse().map((rec, i) => (
                            <div key={i} className="flex justify-between text-xs p-2 bg-gray-50 rounded-lg">
                              <span className="font-mono text-gray-600">{rec.date}</span>
                              <span className={`font-bold ${rec.status === 'Present' ? 'text-green-600' : 'text-red-600'}`}>{rec.status}</span>
                            </div>
                          ))
                        ) : <p className="text-xs text-gray-400 italic p-2">No history.</p>}
                      </div>
                    </details>
                  </div>
                </div>
              );
            }) : <div className="col-span-full text-center py-10 text-gray-400 italic">No courses assigned.</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyStudentInfo;