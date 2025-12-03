import React, { useState, useEffect } from "react";
import { 
  BookOpen, Calendar, CheckCircle, XCircle, 
  BarChart3, Loader2, ChevronDown, ChevronUp,
  FileText, Send, Check
} from "lucide-react";

const API_URL = import.meta.env.VITE_BACK_URI;

const StudentCoursesSection = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourse, setExpandedCourse] = useState(null);
  
  // Form State
  const [formsList, setFormsList] = useState([]); // Forms for the currently expanded course
  const [loadingForms, setLoadingForms] = useState(false);
  const [activeForm, setActiveForm] = useState(null); // The specific form opened in modal
  const [formAnswers, setFormAnswers] = useState({}); // Answers being typed { questionId: value }
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, []);

  // --- API CALLS ---
  const fetchCourseDetails = async () => {
    try {
      const token = localStorage.getItem("studentToken");
      const res = await fetch(`${API_URL}/student/courses/details`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFormsForCourse = async (courseId) => {
    setLoadingForms(true);
    setFormsList([]);
    try {
      const token = localStorage.getItem("studentToken");
      const res = await fetch(`${API_URL}/student/course/${courseId}/forms`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setFormsList(await res.json());
      }
    } catch (e) { console.error(e); }
    finally { setLoadingForms(false); }
  };

  const submitForm = async () => {
    if (!activeForm) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem("studentToken");
      
      // Format answers for backend
      const formattedAnswers = activeForm.fields.map(field => ({
        questionId: field._id,
        questionLabel: field.label,
        answer: formAnswers[field._id] || ""
      }));

      const res = await fetch(`${API_URL}/student/form/submit`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          formId: activeForm._id,
          answers: formattedAnswers
        })
      });

      if (res.ok) {
        alert("Submitted Successfully!");
        setActiveForm(null);
        fetchFormsForCourse(expandedCourse); // Refresh status
      } else {
        alert("Failed to submit.");
      }
    } catch (e) {
      console.error(e);
      alert("Error submitting form.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- HANDLERS ---
  const toggleExpand = (id) => {
    if (expandedCourse === id) {
      setExpandedCourse(null);
    } else {
      setExpandedCourse(id);
      fetchFormsForCourse(id); // Fetch forms when opening
    }
  };

  const openFormModal = (form) => {
    setFormAnswers({});
    setActiveForm(form);
  };

  // --- SUB-COMPONENTS ---
  
  // Render Input Field based on type
  const renderField = (field, isReadOnly = false, previousAnswer = null) => {
    const val = previousAnswer || formAnswers[field._id] || "";
    
    if (field.fieldType === 'text') {
      return (
        <input 
          disabled={isReadOnly}
          className="w-full p-3 border rounded-xl bg-gray-50 text-sm focus:bg-white transition-colors outline-none focus:ring-2 focus:ring-green-500/20"
          placeholder="Type your answer here..."
          value={val}
          onChange={e => setFormAnswers({...formAnswers, [field._id]: e.target.value})}
        />
      );
    }
    if (field.fieldType === 'rating') {
      return (
        <div className="flex gap-2">
          {[1,2,3,4,5].map(num => (
            <button
              key={num}
              disabled={isReadOnly}
              onClick={() => setFormAnswers({...formAnswers, [field._id]: String(num)})}
              className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                String(val) === String(num) 
                  ? "bg-green-600 text-white shadow-md scale-105" 
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      );
    }
    if (field.fieldType === 'yesno') {
      return (
        <div className="flex gap-3">
          {['Yes', 'No'].map(opt => (
            <button
              key={opt}
              disabled={isReadOnly}
              onClick={() => setFormAnswers({...formAnswers, [field._id]: opt})}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                val === opt 
                  ? (opt === 'Yes' ? "bg-green-600 text-white" : "bg-red-500 text-white")
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      );
    }
    return null;
  };

  // --- MAIN RENDER ---
  if (loading) return <div className="flex justify-center h-64 items-center"><Loader2 className="animate-spin text-green-600"/></div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">My Courses</h2>
        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
          {courses.length} Active
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {courses.map((course) => (
          <div key={course._id} className="bg-white border border-gray-100 rounded-[2rem] shadow-sm overflow-hidden transition-all hover:shadow-md">
            
            {/* Header Row */}
            <div 
              onClick={() => toggleExpand(course._id)}
              className="p-6 cursor-pointer bg-white hover:bg-gray-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">
                  {course.courseName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{course.courseName}</h3>
                  <p className="text-xs text-gray-500 font-mono">{course.courseCode} • Sem {course.semester}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                 <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Attendance</p>
                    <p className={`text-lg font-bold ${course.attendance.percentage >= 75 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {course.attendance.percentage.toFixed(1)}%
                    </p>
                 </div>
                 <div className="text-gray-400">
                   {expandedCourse === course._id ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
                 </div>
              </div>
            </div>

            {/* EXPANDED CONTENT */}
            {expandedCourse === course._id && (
              <div className="border-t border-gray-100 bg-gray-50/30 p-6 space-y-8">
                
                {/* 1. FORMS SECTION (NEW) */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                   <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                     <FileText className="w-4 h-4 text-orange-500"/> Forms & Feedback
                   </h4>
                   
                   {loadingForms ? (
                     <p className="text-xs text-gray-400 py-4">Loading forms...</p>
                   ) : formsList.length === 0 ? (
                     <p className="text-xs text-gray-400 italic py-2">No active forms for this course.</p>
                   ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                       {formsList.map(form => (
                         <div key={form._id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors bg-white">
                            <div className="flex justify-between items-start mb-2">
                               <h5 className="font-bold text-sm text-gray-800 line-clamp-1">{form.title}</h5>
                               {form.isResponded ? (
                                 <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                                   <Check className="w-3 h-3"/> Done
                                 </span>
                               ) : (
                                 <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">New</span>
                               )}
                            </div>
                            <p className="text-xs text-gray-500 mb-3 line-clamp-2 h-8">{form.description || "No description"}</p>
                            
                            <button 
                              onClick={() => openFormModal(form)}
                              className={`w-full py-2 rounded-lg text-xs font-bold transition-colors ${
                                form.isResponded 
                                  ? "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-100"
                              }`}
                            >
                              {form.isResponded ? "View My Response" : "Fill Form"}
                            </button>
                         </div>
                       ))}
                     </div>
                   )}
                </div>

                {/* 2. GRID FOR MARKS AND ATTENDANCE */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Marks */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                     <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                       <BarChart3 className="w-4 h-4 text-purple-500"/> Assessment Marks
                     </h4>
                     <div className="space-y-3">
                        {['test1', 'test2', 'test3', 'assignment', 'external'].map((key) => (
                          <div key={key} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                             <span className="text-sm text-gray-600 font-medium capitalize">{key}</span>
                             <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-md">
                               {course.marks[key] || 0}
                             </span>
                          </div>
                        ))}
                     </div>
                  </div>

                  {/* Attendance */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col max-h-80">
                     <div className="flex justify-between items-center mb-4">
                       <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                         <Calendar className="w-4 h-4 text-blue-500"/> Date-wise History
                       </h4>
                       <span className="text-xs text-gray-400">
                          {course.attendance.attended}/{course.attendance.total} Classes
                       </span>
                     </div>
                     <div className="overflow-y-auto flex-1 custom-scrollbar pr-2 space-y-2">
                        {course.attendance.history?.slice().reverse().map((record, i) => (
                          <div key={i} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:border-blue-100 transition-colors">
                             <span className="text-xs font-bold text-gray-600">
                               {new Date(record.date).toLocaleDateString()}
                             </span>
                             <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase ${
                               record.value === 1 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                             }`}>
                               {record.value === 1 ? <CheckCircle className="w-3 h-3"/> : <XCircle className="w-3 h-3"/>}
                               <span>{record.value === 1 ? "Present" : "Absent"}</span>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        ))}
      </div>

      {/* --- FORM MODAL --- */}
      {activeForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
             
             {/* Header */}
             <div className="p-6 border-b bg-gray-50 flex justify-between items-start">
               <div>
                 <h3 className="text-xl font-bold text-gray-800">{activeForm.title}</h3>
                 <p className="text-sm text-gray-500 mt-1">{activeForm.description}</p>
                 {activeForm.isResponded && (
                   <span className="mt-2 inline-block px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">
                     Response Submitted
                   </span>
                 )}
               </div>
               <button onClick={() => setActiveForm(null)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                 <XCircle className="w-6 h-6"/>
               </button>
             </div>

             {/* Body */}
             <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
                {activeForm.fields.map((field, idx) => {
                  // If viewing response, find the answer
                  let prevAns = "";
                  if (activeForm.isResponded && activeForm.myResponse) {
                    const found = activeForm.myResponse.find(a => a.questionId === field._id);
                    prevAns = found ? found.answer : "";
                  }

                  return (
                    <div key={field._id} className="space-y-2">
                       <p className="text-sm font-bold text-gray-700">
                         {idx + 1}. {field.label} {field.required && <span className="text-red-500">*</span>}
                       </p>
                       {renderField(field, activeForm.isResponded, prevAns)}
                    </div>
                  );
                })}
             </div>

             {/* Footer */}
             <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
               <button 
                 onClick={() => setActiveForm(null)}
                 className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-200 transition-colors"
               >
                 Close
               </button>
               
               {!activeForm.isResponded && (
                 <button 
                   onClick={submitForm}
                   disabled={submitting}
                   className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                 >
                   {submitting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4"/>}
                   Submit Response
                 </button>
               )}
             </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentCoursesSection;