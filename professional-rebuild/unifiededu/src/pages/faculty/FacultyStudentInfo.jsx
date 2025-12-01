import React, { useState, useEffect } from "react";
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
  AlertCircle,
  Calculator
} from "lucide-react";

const FacultyStudentInfo = ({ student, onBack, theme, authFetch, refreshData, faculty, viewMode }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);

  // --- 1. DATA PREPARATION & PERMISSIONS ---
  const [mySharedCourses, setMySharedCourses] = useState([]);

  useEffect(() => {
    if (student && faculty) {
      // Safe ID conversion
      const myFacultyId = String(faculty._id || faculty.id);
      // Get list of courses opted by faculty
      const myOptedCourseIds = (faculty.courses || []).map(c => String(c?._id || c));

      const shared = [];
      
      if (student.courseEnrollments) {
        student.courseEnrollments.forEach(sem => {
          if (sem.subjects) {
            sem.subjects.forEach(sub => {
              const studentCourseId = String(sub.courseId?._id || sub.courseId);
              const studentAssignedFacultyId = String(sub.facultyId?._id || sub.facultyId);

              // STRICT CHECK:
              // 1. Is this a course I (Faculty) have opted for?
              const isCourseMatch = myOptedCourseIds.includes(studentCourseId);
              // 2. Am I the specific faculty assigned to this student for this course?
              const isFacultyMatch = studentAssignedFacultyId === myFacultyId;

              if (isCourseMatch && isFacultyMatch) {
                shared.push({
                  courseId: studentCourseId,
                  courseName: sub.courseName || sub.courseCode || "Unknown Course",
                  semester: sem.semester,
                  // Load existing detailed marks or default to 0
                  marksDetails: sub.marksDetails || {
                    test1: 0,
                    test2: 0,
                    test3: 0,
                    assignment: 0,
                    external: 0
                  },
                  // Load existing totals
                  marksObtained: sub.marksObtained || 0,
                  maxMarks: sub.maxMarks || 100
                });
              }
            });
          }
        });
      }
      setMySharedCourses(shared);
    }
  }, [student, faculty]);

  // Edit Permission: Only if viewMode is 'enrolled' AND we found matching courses
  const canEdit = viewMode === 'enrolled' && mySharedCourses.length > 0;

  // --- 2. FORM STATE ---
  const [isEditing, setIsEditing] = useState(false);
  const [courseForms, setCourseForms] = useState({}); // Keyed by Course ID

  // --- 3. SYNC INITIAL DATA ---
  useEffect(() => {
    if (student && mySharedCourses.length > 0) {
      const initialData = {};
      
      mySharedCourses.forEach(c => {
        // Find existing attendance record from the flat list
        const attRecord = student.attendance?.subjectWise?.find(a => a.subjectName === c.courseName) || { attended: 0, total: 0 };
        
        initialData[c.courseId] = {
          courseName: c.courseName,
          // Attendance Data
          attended: attRecord.attended,
          total: attRecord.total,
          percentage: attRecord.total > 0 ? (attRecord.attended / attRecord.total) * 100 : 0,
          
          // Marks Data (Detailed)
          test1: c.marksDetails?.test1 || 0,
          test2: c.marksDetails?.test2 || 0,
          test3: c.marksDetails?.test3 || 0,
          assignment: c.marksDetails?.assignment || 0,
          external: c.marksDetails?.external || 0,
          
          // Display only (calculated on fly or from DB)
          marksObtained: c.marksObtained,
          maxMarks: c.maxMarks
        };
      });
      setCourseForms(initialData);
    }
  }, [student, mySharedCourses]);

  // --- 4. HANDLERS ---
  const handleInputChange = (courseId, field, value) => {
    let numValue = Number(value);
    
    // VALIDATION RULES
    if (field === 'test1' || field === 'test2' || field === 'test3') {
      if (numValue > 50) numValue = 50; // Max 50 for tests
    }
    if (field === 'assignment') {
      if (numValue > 20) numValue = 20; // Max 20 for assignment (assuming 'tenty' meant twenty or ten, setting 20 safe)
    }
    if (field === 'external') {
      if (numValue > 100) numValue = 100; // Max 100 for external
    }
    if (numValue < 0) numValue = 0;

    setCourseForms(prev => {
      const updatedRecord = { ...prev[courseId], [field]: numValue };
      
      // Auto-calc Percentage for Attendance UI
      if (field === 'attended' || field === 'total') {
        const att = field === 'attended' ? numValue : updatedRecord.attended;
        const tot = field === 'total' ? numValue : updatedRecord.total;
        updatedRecord.percentage = tot > 0 ? (att / tot) * 100 : 0;
      }

      // Auto-calc Projected Marks for UI (Client-side preview of the math)
      if (['test1', 'test2', 'test3', 'assignment', 'external'].includes(field)) {
        const t1 = field === 'test1' ? numValue : updatedRecord.test1;
        const t2 = field === 'test2' ? numValue : updatedRecord.test2;
        const t3 = field === 'test3' ? numValue : updatedRecord.test3;
        const assign = field === 'assignment' ? numValue : updatedRecord.assignment;
        const ext = field === 'external' ? numValue : updatedRecord.external;

        // Logic: (Sum Internals / 4) + (External / 2) -> Max 50 + Max 50 = 100
        const internalTotal = (t1 + t2 + t3 + assign) / 4; 
        const externalScaled = ext / 2;
        updatedRecord.marksObtained = parseFloat((internalTotal + externalScaled).toFixed(2));
      }
      
      return { ...prev, [courseId]: updatedRecord };
    });
  };

  const saveAll = async () => {
    setLoading(true);
    try {
      const promises = Object.entries(courseForms).map(async ([courseId, data]) => {
        const payload = {
          studentId: student._id,
          courseId: courseId,
          attendance: {
            attended: data.attended,
            total: data.total
          },
          // NEW: Send detailed breakdown matching backend schema
          marksDetails: {
            test1: data.test1,
            test2: data.test2,
            test3: data.test3,
            assignment: data.assignment,
            external: data.external
          }
        };
        
        return authFetch('/faculty/student/update-course-details', {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      });

      await Promise.all(promises);
      
      setIsEditing(false);
      if (refreshData) await refreshData();
      
    } catch (e) {
      console.error(e);
      alert("Failed to save changes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- HELPER: Percentage Color ---
  const getPercentColor = (pct) => {
    if (pct < 75) return "text-red-600 bg-red-50 border-red-200"; // Critical
    if (pct < 85) return "text-orange-600 bg-orange-50 border-orange-200"; // Warning
    return "text-green-600 bg-green-50 border-green-200"; // Safe
  };

  // --- SUB-COMPONENT: Performance Graph ---
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
          <line x1="0" y1="0" x2="100" y2="0" stroke="#eee" strokeWidth="0.5" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#eee" strokeWidth="0.5" />
          <line x1="0" y1="100" x2="100" y2="100" stroke="#eee" strokeWidth="0.5" />
          <polyline fill="none" stroke={theme.primary} strokeWidth="2" points={points} vectorEffect="non-scaling-stroke" />
          {data.map((d, i) => {
            const x = (i / (Math.max(data.length - 1, 1))) * 100;
            const y = 100 - ((d.sgpa || 0) / 10) * 100;
            return (
              <g key={i}>
                <circle cx={`${x}%`} cy={`${y}%`} r="3" fill="white" stroke={theme.primary} strokeWidth="2" />
                <text x={`${x}%`} y={`${y - 8}%`} fontSize="4" textAnchor="middle" fill="#666">{d.sgpa}</text>
                <text x={`${x}%`} y="115%" fontSize="4" textAnchor="middle" fill="#999">Sem {d.semester}</text>
              </g>
            );
          })}
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
        {!canEdit && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full border border-gray-200">
            <Lock className="w-3 h-3 text-gray-400" /><span className="text-xs font-bold text-gray-500">Read Only</span>
          </div>
        )}
      </div>

      {/* STUDENT PROFILE CARD */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-lg border border-gray-100 relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-gray-50 to-white rounded-full -mr-10 -mt-10 opacity-50 pointer-events-none"></div>
        <div className="relative flex flex-col md:flex-row gap-8 items-start">
          <div className="w-28 h-28 rounded-full p-1 border-2 border-dashed border-gray-300 flex-shrink-0">
            <div className="w-full h-full rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
              {student.profilePic ? (
                <img src={student.profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-gray-300">{student.name.charAt(0)}</span>
              )}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-800">{student.name}</h1>
                <p className="text-gray-500 font-medium mt-1 flex items-center gap-2">
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">{student.SID}</span>
                  <span>•</span><span>{student.department} Dept</span><span>•</span><span>{student.year} Year</span>
                </p>
              </div>
              <div className="flex gap-4">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Mail className="w-4 h-4 text-gray-400" /><span className="text-sm font-medium text-gray-700 truncate">{student.email || "No Email"}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Phone className="w-4 h-4 text-gray-400" /><span className="text-sm font-medium text-gray-700">{student.phone || "No Phone"}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <GraduationCap className="w-4 h-4 text-gray-400" /><span className="text-sm font-medium text-gray-700">Sem {student.semester}</span>
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

      {/* 1. OVERVIEW CONTENT */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2"><TrendingUp className="w-5 h-5 text-gray-400" /> Performance Trend</h3>
            <p className="text-xs text-gray-400 mb-4">Semester-wise SGPA progression</p>
            <PerformanceGraph />
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-[2rem] border border-indigo-100 shadow-sm">
            <h3 className="font-bold text-indigo-900 flex items-center gap-2 mb-4"><Award className="w-5 h-5 text-indigo-500" /> AI Potential Analysis</h3>
            <div className="space-y-4">
              <div className="bg-white/60 p-4 rounded-xl backdrop-blur-sm">
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Risk Analysis</p>
                <p className="text-sm font-medium text-gray-700">{student.aiInsights?.riskAnalysis || "Low Risk. Consistent performance observed."}</p>
              </div>
              <div className="bg-white/60 p-4 rounded-xl backdrop-blur-sm">
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Suggested Focus</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {student.aiInsights?.suggestedFocusAreas?.length > 0 ? student.aiInsights.suggestedFocusAreas.map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-md font-bold">{tag}</span>
                    )) : <span className="text-sm text-gray-500 italic">No specific suggestions yet.</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MARKS CONTENT (Detailed Input) */}
      {activeTab === 'marks' && (
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Course Marks Entry</h3>
              <p className="text-xs text-gray-500">Update Internals and Externals.</p>
            </div>
            
            {canEdit && !isEditing && (
              <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:opacity-90">
                <Edit className="w-3 h-3" /> Edit Marks
              </button>
            )}
            {isEditing && (
               <div className="flex gap-2">
                 <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold">Cancel</button>
                 <button onClick={saveAll} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-green-700">
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
                    <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                      {c.courseName}
                    </h4>
                    <span className="text-[10px] bg-white px-2 py-1 rounded border font-mono">Sem {c.semester}</span>
                  </div>
                  
                  {isEditing ? (
                    <div className="space-y-4 animate-in fade-in">
                      {/* Internal Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Test 1 (50)</label>
                          <input type="number" max="50" className="w-full p-2 rounded-lg border outline-none font-bold text-sm focus:border-blue-500" 
                            value={formData.test1} onChange={(e) => handleInputChange(c.courseId, 'test1', e.target.value)} />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Test 2 (50)</label>
                          <input type="number" max="50" className="w-full p-2 rounded-lg border outline-none font-bold text-sm focus:border-blue-500" 
                            value={formData.test2} onChange={(e) => handleInputChange(c.courseId, 'test2', e.target.value)} />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Test 3 (50)</label>
                          <input type="number" max="50" className="w-full p-2 rounded-lg border outline-none font-bold text-sm focus:border-blue-500" 
                            value={formData.test3} onChange={(e) => handleInputChange(c.courseId, 'test3', e.target.value)} />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Assign (20)</label>
                          <input type="number" max="20" className="w-full p-2 rounded-lg border outline-none font-bold text-sm focus:border-blue-500" 
                            value={formData.assignment} onChange={(e) => handleInputChange(c.courseId, 'assignment', e.target.value)} />
                        </div>
                      </div>

                      {/* External & Total */}
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
                      <p className="text-[10px] text-gray-400 italic text-center">
                        Calc: (Internals ÷ 4) + (External ÷ 2)
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 md:col-span-1 space-y-2">
                         <div className="flex justify-between text-xs text-gray-600"><span>Test 1:</span> <span className="font-bold">{formData.test1}</span></div>
                         <div className="flex justify-between text-xs text-gray-600"><span>Test 2:</span> <span className="font-bold">{formData.test2}</span></div>
                         <div className="flex justify-between text-xs text-gray-600"><span>Test 3:</span> <span className="font-bold">{formData.test3}</span></div>
                         <div className="flex justify-between text-xs text-gray-600"><span>Assign:</span> <span className="font-bold">{formData.assignment}</span></div>
                      </div>
                      <div className="col-span-2 md:col-span-1 bg-white rounded-xl border border-gray-200 p-3 flex flex-col justify-center items-center">
                        <span className="text-[10px] text-gray-400 font-bold uppercase mb-1">Final Score</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-gray-800">{formData.marksObtained}</span>
                          <span className="text-sm font-bold text-gray-400">/ 100</span>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1">Ext: {formData.external}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            }) : <div className="col-span-full text-center py-10 text-gray-400 italic">No courses assigned to you for this student.</div>}
          </div>
        </div>
      )}

      {/* 3. ATTENDANCE CONTENT (Unchanged Layout) */}
      {activeTab === 'attendance' && (
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Attendance Tracker</h3>
              <p className="text-xs text-gray-500">Low attendance is highlighted in red.</p>
            </div>
            {canEdit && !isEditing && (
              <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:opacity-90">
                <Edit className="w-3 h-3" /> Update
              </button>
            )}
            {isEditing && (
               <div className="flex gap-2">
                 <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold">Cancel</button>
                 <button onClick={saveAll} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-green-700">
                   {loading ? <Loader2 className="w-3 h-3 animate-spin"/> : <Save className="w-3 h-3"/>} Save
                 </button>
               </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {canEdit ? mySharedCourses.map(c => {
              const formData = courseForms[c.courseId] || {};
              const pct = Math.round(formData.percentage || 0);
              
              return (
                <div key={c.courseId} className={`p-4 rounded-xl border relative ${getPercentColor(pct)} bg-opacity-10 border-opacity-50`}>
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-sm w-3/4 leading-tight">{c.courseName}</h4>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 bg-white ${pct < 85 ? 'text-red-600 border-red-100' : 'text-green-600 border-green-100'}`}>
                      {pct}%
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="flex gap-2">
                       <div>
                         <label className="text-[10px] font-bold opacity-60">Attended</label>
                         <input type="number" className="w-full p-1 rounded border text-sm font-bold" value={formData.attended} onChange={(e) => handleInputChange(c.courseId, 'attended', e.target.value)} />
                       </div>
                       <div>
                         <label className="text-[10px] font-bold opacity-60">Total</label>
                         <input type="number" className="w-full p-1 rounded border text-sm font-bold" value={formData.total} onChange={(e) => handleInputChange(c.courseId, 'total', e.target.value)} />
                       </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-end">
                       <span className="text-xs font-bold opacity-70">Classes</span>
                       <span className="font-mono font-bold">{formData.attended} / {formData.total}</span>
                    </div>
                  )}
                  
                  {pct < 85 && !isEditing && (
                    <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-red-600">
                      <AlertCircle className="w-3 h-3"/> Low Attendance
                    </div>
                  )}
                </div>
              );
            }) : <div className="col-span-full text-center py-10 text-gray-400 italic">No courses assigned to you for this student.</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyStudentInfo;