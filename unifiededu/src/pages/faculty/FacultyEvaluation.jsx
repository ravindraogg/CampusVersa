import React, { useState, useEffect } from "react";
import {
  Save, Users, ClipboardList, GraduationCap, Calendar,
  Loader2, CheckCircle2, ArrowRight
} from "lucide-react";
const API_URL = import.meta.env.VITE_BACK_URI;
const FacultyEvaluation = ({ authFetch, theme, faculty, pushToast }) => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [evaluationType, setEvaluationType] = useState("attendance"); 
  const [examType, setExamType] = useState("test1"); 
  
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false); // Global submitting state
  const [singleSubmitting, setSingleSubmitting] = useState(null); // Track which ID is submitting
  
  const [evalData, setEvalData] = useState({});
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch Courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await authFetch("/faculty/courses"); 
        const data = await res.json();
        setCourses(data || []);
        if (data.length > 0) setSelectedCourse(data[0]._id);
      } catch (error) { console.error(error); }
    };
    fetchCourses();
  }, [authFetch]);

  // Fetch Students
  useEffect(() => {
    if (!selectedCourse) return;
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await authFetch(`/faculty/courses/${selectedCourse}/students`);
        const data = await res.json();
        const sorted = (data.students || []).sort((a, b) => a.name.localeCompare(b.name));
        setStudents(sorted);
        setEvalData({});
      } catch (error) { pushToast("Failed to fetch students", "error"); } 
      finally { setLoading(false); }
    };
    fetchStudents();
  }, [selectedCourse]); 

// --- Updated Handler for Toggle Logic ---
  const handleInputChange = (studentId, value) => {
    setEvalData(prev => {
      const currentVal = prev[studentId];
      if (currentVal === value) {
        const newState = { ...prev };
        delete newState[studentId]; 
        return newState;
      }
      return {
        ...prev,
        [studentId]: value
      };
    });
  };

  const markAll = (status) => {
    const newData = {};
    students.forEach(s => { newData[s._id] = status; });
    setEvalData(newData);
  };

  // --- NEW: Handle Single Submit ---
  const handleSingleSubmit = async (studentId) => {
    if (!selectedCourse) return;
    
    // Get the value. If undefined, handle gracefully.
    const rawVal = evalData[studentId];
    
    // Validation
    if (evaluationType === 'marks' && (rawVal === undefined || rawVal === "")) {
       return pushToast("Please enter marks first", "error");
    }
    if (evaluationType === 'attendance' && !rawVal) {
       return pushToast("Select Present or Absent first", "error");
    }

    setSingleSubmitting(studentId); // Show loader for this specific row

    const payload = {
      courseId: selectedCourse,
      type: evaluationType,
      date: evaluationType === 'attendance' ? attendanceDate : null,
      examType: evaluationType === 'marks' ? examType : null,
      records: [{
        studentId: studentId,
        value: rawVal
      }]
    };

    try {
      const res = await authFetch('/faculty/evaluation/bulk-update', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        pushToast("Saved", "success");
      } else {
        pushToast("Failed", "error");
      }
    } catch (error) {
      console.error(error);
      pushToast("Error", "error");
    } finally {
      setSingleSubmitting(null);
    }
  };

  // --- Bulk Submit ---
  const handleSubmitAll = async () => {
    if (!selectedCourse) return pushToast("Please select a course", "error");
    setSubmitting(true);

    const payload = {
      courseId: selectedCourse,
      type: evaluationType,
      date: evaluationType === 'attendance' ? attendanceDate : null,
      examType: evaluationType === 'marks' ? examType : null,
      records: students.map(student => ({
        studentId: student._id,
        // Default to 'Absent' or 0 if user hasn't touched the input
        value: evalData[student._id] !== undefined 
          ? evalData[student._id] 
          : (evaluationType === 'attendance' ? 'Absent' : 0)
      }))
    };

    try {
      const res = await authFetch('/faculty/evaluation/bulk-update', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.ok) pushToast("All records updated!", "success");
      else pushToast("Update failed.", "error");
    } catch (error) { pushToast("Server error", "error"); } 
    finally { setSubmitting(false); }
  };

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500">
      
      {/* 1. Header Controls */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex flex-col gap-2 w-full md:w-1/3">
          <label className="text-xs font-bold text-gray-500 uppercase">Select Course</label>
          <div className="relative">
            <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="w-full p-3 pl-10 bg-gray-50 rounded-xl font-bold text-gray-700 outline-none cursor-pointer">
              {courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
            </select>
            <GraduationCap className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" />
          </div>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-full">
          <button onClick={() => setEvaluationType("attendance")} className={`px-6 py-2.5 rounded-full text-sm font-bold flex gap-2 transition-all ${evaluationType === 'attendance' ? 'bg-white shadow-md text-gray-800' : 'text-gray-500'}`}>
            <Calendar className="w-4 h-4" /> Attendance
          </button>
          <button onClick={() => setEvaluationType("marks")} className={`px-6 py-2.5 rounded-full text-sm font-bold flex gap-2 transition-all ${evaluationType === 'marks' ? 'bg-white shadow-md text-gray-800' : 'text-gray-500'}`}>
            <ClipboardList className="w-4 h-4" /> Marks
          </button>
        </div>
      </div>

      {/* 2. Sub-Header Inputs */}
      <div className="bg-white px-6 py-4 rounded-[2rem] shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
        {evaluationType === 'attendance' ? (
          <>
            <div className="flex flex-col gap-1">
               <label className="text-[10px] font-bold text-gray-400 uppercase">Date</label>
               <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold outline-none" />
            </div>
            <div className="ml-auto flex gap-2">
               <button onClick={() => markAll("Present")} className="px-3 py-2 bg-green-50 text-green-700 rounded-lg text-xs font-bold border border-green-100 flex items-center gap-1 hover:bg-green-100"><CheckCircle2 className="w-3 h-3"/> Mark All P</button>
               <button onClick={() => markAll("Absent")} className="px-3 py-2 bg-red-50 text-red-700 rounded-lg text-xs font-bold border border-red-100 hover:bg-red-100">Mark All A</button>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-1 w-full md:w-1/3">
             <label className="text-[10px] font-bold text-gray-400 uppercase">Select Exam</label>
             <select 
               value={examType} 
               onChange={(e) => setExamType(e.target.value)}
               className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none cursor-pointer"
             >
               <option value="test1">Internal Test 1</option>
               <option value="test2">Internal Test 2</option>
               <option value="test3">Internal Test 3</option>
               <option value="assignment">Assignment</option>
               <option value="external">External / Final</option>
             </select>
          </div>
        )}
      </div>

      {/* 3. Table Area */}
      <div className="flex-1 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        {loading ? <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-gray-300 w-8 h-8"/></div> : (
          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white z-10 shadow-sm">
                <tr>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase w-12">#</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase">Student Name</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase text-center">
                    {evaluationType === 'attendance' ? "Status" : `Marks (${examType})`}
                  </th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase text-center w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map((student, index) => (
                  <tr key={student._id} className="hover:bg-gray-50 group transition-colors">
                    <td className="p-4 text-sm font-bold text-gray-400">{index + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                           {student.name.charAt(0)}
                         </div>
                         <div>
                           <p className="font-bold text-gray-800 text-sm">{student.name}</p>
                           <p className="text-[10px] text-gray-400">{student.rollNumber}</p>
                         </div>
                      </div>
                    </td>
                    
                    {/* Input Column */}
                    <td className="p-4 flex justify-center">
                      {evaluationType === 'attendance' ? (
                        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                           <button 
                             onClick={() => handleInputChange(student._id, "Present")} 
                             className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${evalData[student._id] === "Present" ? "bg-green-500 text-white shadow-md" : "text-gray-500 hover:bg-white"}`}
                           >P</button>
                           <button 
                             onClick={() => handleInputChange(student._id, "Absent")} 
                             className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${evalData[student._id] === "Absent" ? "bg-red-500 text-white shadow-md" : "text-gray-500 hover:bg-white"}`}
                           >A</button>
                        </div>
                      ) : (
                        <input 
                          type="number" 
                          placeholder="0" 
                          value={evalData[student._id] || ""} 
                          onChange={(e) => handleInputChange(student._id, e.target.value)} 
                          className="w-24 text-center bg-gray-50 border border-gray-200 rounded-lg py-2 text-sm font-bold outline-none focus:border-blue-500 transition-all" 
                        />
                      )}
                    </td>

                    {/* Single Save Action */}
                    <td className="p-4 text-center">
                       <button 
                         onClick={() => handleSingleSubmit(student._id)}
                         disabled={singleSubmitting === student._id}
                         className="p-2 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                         title="Save this student"
                       >
                         {singleSubmitting === student._id ? (
                           <Loader2 className="w-5 h-5 animate-spin text-blue-600"/> 
                         ) : (
                           <Save className="w-5 h-5"/>
                         )}
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Footer: Bulk Submit */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
           <button 
             onClick={handleSubmitAll} 
             disabled={submitting || students.length === 0} 
             className="px-8 py-3 rounded-2xl text-white font-bold bg-gray-900 hover:opacity-90 flex gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gray-200"
             style={{ backgroundColor: theme.primary }}
           >
             {submitting ? <Loader2 className="animate-spin w-5 h-5"/> : <Save className="w-5 h-5"/>} 
             Submit All Records
           </button>
        </div>
      </div>
    </div>
  );
};

export default FacultyEvaluation;