import React, { useState, useEffect } from "react";
import { 
  BookOpen, Plus, Trash2, Search, Filter, Layers, 
  Calendar, Hash, CheckCircle, Loader2, Upload
} from "lucide-react";
const API_URL = import.meta.env.VITE_BACK_URI;
const CoursesPage = ({ authFetch, theme, pushToast }) => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    department: "",
    year: "1st",
    semester: "1",
    credits: 3
  });

  // Filters
  const [filterDept, setFilterDept] = useState("All");

  // --- NEW: BULK UPLOAD STATE ---
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [isUploadingBulk, setIsUploadingBulk] = useState(false);

  // Load Data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Courses
      const courseRes = await authFetch("/institute/courses");
      const courseData = await courseRes.json();
      setCourses(Array.isArray(courseData) ? courseData : []);

      // Fetch Departments (for the dropdown)
      const deptRes = await authFetch("/institute/departments");
      const deptData = await deptRes.json();
      setDepartments(Array.isArray(deptData) ? deptData : []);
      
      // Set default department for form if available
      if (deptData.length > 0) {
        setFormData(prev => ({ ...prev, department: deptData[0].code }));
      }
    } catch (error) {
      console.error(error);
      pushToast({ message: "Failed to load data", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await authFetch("/institute/courses/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (res.ok) {
        pushToast({ message: "Course added successfully", type: "success" });
        setCourses([...courses, data]);
        setIsModalOpen(false);
        setFormData({ ...formData, name: "", code: "" }); // Reset text fields
      } else {
        pushToast({ message: data.message || "Failed to add course", type: "error" });
      }
    } catch (error) {
      pushToast({ message: "Server error", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      const res = await authFetch(`/institute/courses/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCourses(courses.filter(c => c._id !== id));
        pushToast({ message: "Course deleted", type: "success" });
      }
    } catch (error) {
      pushToast({ message: "Delete failed", type: "error" });
    }
  };

  // --- NEW FUNCTION: HANDLE BULK UPLOAD ---
// --- NEW FUNCTION: HANDLE BULK UPLOAD ---
  const handleBulkUpload = async () => {
    if (!bulkFile) {
      pushToast({ type: "error", message: "Please select a file first" });
      return;
    }
    setIsUploadingBulk(true);
    try {
      const formData = new FormData();
      formData.append("file", bulkFile);

      // 1. ROBUST TOKEN RETRIEVAL
      const token = localStorage.getItem('instituteToken') || 
                    localStorage.getItem('authToken') || 
                    localStorage.getItem('token');
      
      if (!token) {
        pushToast({ message: "Authentication token not found", type: "error" });
        setIsUploadingBulk(false);
        return;
      }

      const res = await fetch(`${API_URL}/institute/courses/bulk-upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        pushToast({ message: `Uploaded ${data.count} courses!`, type: "success" });
        setShowBulkModal(false);
        setBulkFile(null);
        fetchData(); 
      } else {
        pushToast({ message: data.message || "Upload failed", type: "error" });
      }
    } catch (err) {
      console.error(err);
      pushToast({ message: "Server error during upload", type: "error" });
    } finally {
      setIsUploadingBulk(false);
    }
  };

  // Filter Logic
  const filteredCourses = filterDept === "All" 
    ? courses 
    : courses.filter(c => c.department === filterDept);

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6" style={{ color: theme.primary }} />
            Course Master
          </h2>
          <p className="text-sm text-gray-500 mt-1">Define subjects and map them to departments & years.</p>
        </div>
        
        <div className="flex gap-3">
          {/* BULK UPLOAD BUTTON */}
          <button
            onClick={() => setShowBulkModal(true)}
            className="px-5 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            style={{ backgroundColor: theme.primary, color: 'white' }}
          >
            <Upload className="w-5 h-5" /> Upload
          </button>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            style={{ backgroundColor: theme.primary }}
          >
            <Plus className="w-5 h-5" /> Add New Course
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
        <div className="px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center gap-2 min-w-fit">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-600">Filter Department:</span>
          <select 
            value={filterDept} 
            onChange={(e) => setFilterDept(e.target.value)}
            className="bg-transparent text-sm font-bold text-gray-800 outline-none cursor-pointer"
          >
            <option value="All">All Departments</option>
            {departments.map(d => (
              <option key={d._id} value={d.code}>{d.name} ({d.code})</option>
            ))}
          </select>
        </div>
        <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold">
          Total Courses: {filteredCourses.length}
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-500">No courses found</h3>
          <p className="text-sm text-gray-400">Add a course to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-gray-50 group-hover:bg-blue-50 transition-colors">
                  <Hash className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                </div>
                <div className="flex flex-col items-end">
                   <span className="px-2 py-1 rounded bg-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                     {course.department}
                   </span>
                   <span className="text-xs font-bold" style={{ color: 'white' }}>
                     {course.year} Year
                   </span>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-gray-800 mb-1">{course.name}</h3>
              <p className="text-sm text-gray-500 font-mono mb-4">{course.code}</p>
              
              <div className="flex items-center gap-4 text-xs font-medium text-gray-500 pt-4 border-t border-gray-50">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> Sem {course.semester}</span>
                <span className="flex items-center gap-1"><Layers className="w-3 h-3"/> {course.credits} Credits</span>
              </div>

              <button 
                onClick={() => handleDelete(course._id)}
                className="absolute bottom-4 right-4 p-2 text-gray-300 hover:text-red-500 transition-colors"
                title="Delete Course"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* BULK UPLOAD MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Bulk Upload Courses</h3>
              <button onClick={() => setShowBulkModal(false)} className="text-gray-400 hover:text-red-500">✕</button>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 font-medium mb-2">Drag & Drop or Click to Upload</p>
              <p className="text-xs text-gray-400 mb-4">Supported: CSV, XML, PDF</p>
              
              <input 
                type="file" 
                id="courseBulkInput" 
                className="hidden" 
                accept=".csv,.xml,.pdf,.txt"
                onChange={(e) => setBulkFile(e.target.files[0])}
              />
              <label 
                htmlFor="courseBulkInput" 
                className="px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-transform active:scale-95"
                style={{ backgroundColor: theme.primary, color: 'white' }}
              >
                Choose File
              </label>
            </div>

            {bulkFile && (
              <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-xl text-sm flex items-center gap-2">
                <span className="font-bold">Selected:</span> {bulkFile.name}
              </div>
            )}

            <div className="mt-6">
              <button 
                onClick={handleBulkUpload} 
                disabled={isUploadingBulk || !bulkFile}
                className="w-full py-3 rounded-xl font-bold flex justify-center items-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: theme.primary, color: 'white' }}
              >
                {isUploadingBulk ? <Loader2 className="w-5 h-5 animate-spin" /> : "Start Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Add New Course</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Department</label>
                  <select 
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-all"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    required
                  >
                    <option value="" disabled>Select Dept</option>
                    {departments.map(d => (
                      <option key={d._id} value={d.code}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Year</label>
                  <select 
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-all"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                  >
                    {["1st", "2nd", "3rd", "4th", "5th"].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Course Name</label>
                <input 
                  className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-all"
                  placeholder="e.g. Analysis and Design of Algorithms"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Course Code</label>
                  <input 
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-all font-mono uppercase"
                    placeholder="CS204"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    required
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Semester</label>
                  <input 
                    type="number"
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-all"
                    value={formData.semester}
                    onChange={(e) => setFormData({...formData, semester: e.target.value})}
                    required
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Credits</label>
                  <input 
                    type="number"
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-all"
                    value={formData.credits}
                    onChange={(e) => setFormData({...formData, credits: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 flex items-center gap-2"
                  style={{ backgroundColor: theme.primary }}
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin"/>}
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;