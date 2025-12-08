import React, { useState, useEffect } from "react";
import {
  BookOpen, Video, FileText, HelpCircle, Users, Plus,
  Trash2, ExternalLink, CheckSquare, Square, ChevronLeft,
  Loader2, Save, Search, Eye, Download, X, AlertCircle, Filter, Info,
  Lock, CheckCircle, UserX
} from "lucide-react";
const API_URL = import.meta.env.VITE_BACK_URI;
const FacultyCourses = ({ authFetch, theme, pushToast, faculty, refreshProfile }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [previewResource, setPreviewResource] = useState(null);
  const [viewMode, setViewMode] = useState('resources');

  // We no longer rely solely on local state for opt-in status.
  // We rely on the course.facultyId from the API.

  useEffect(() => {
    fetchCourses();
  }, [faculty]);

  const fetchCourses = async () => {
    if (!faculty) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await authFetch('/faculty/courses');
      const data = await res.json();
      const allCourses = Array.isArray(data) ? data : [];

      // Filter: Only show courses matching Faculty's Department
      const myDeptCourses = allCourses.filter(c => c.department === faculty.department);

      setCourses(myDeptCourses);
    } catch (e) {
      console.error(e);
      pushToast("Failed to load courses", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- Toggle Course Opt-In ---
  const handleOptInToggle = async (e, course) => {
    e.stopPropagation(); // Prevent opening details

    const isMine = course.facultyId === faculty._id || course.facultyId === faculty.id;
    const newStatus = !isMine; // If mine, we are opting out. If not mine, opting in.

    try {
      const res = await authFetch(`/faculty/course/opt-in`, {
        method: 'POST',
        body: JSON.stringify({ courseId: course._id, status: newStatus })
      });

      if (res.ok) {
        pushToast(newStatus ? "Added to your courses" : "Removed from your courses", "success");

        // Refresh Data
        fetchCourses();
        if (refreshProfile) refreshProfile(); // <--- CRASH OCCURS HERE
      } else {
        const err = await res.json();
        pushToast(err.message || "Failed to update status", "error");
      }
    } catch (err) {
      pushToast("Server Error", "error");
    }
  };

  // ... (ResourcePreviewModal code remains exactly the same) ...
  const ResourcePreviewModal = () => {
    if (!previewResource) return null;
    const { title, type, url } = previewResource;
    const isPdf = url.startsWith("data:application/pdf");
    const isImage = url.startsWith("data:image");

    return (
      <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
          <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${type === 'Video' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                {type === 'Video' ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{title}</h3>
                <p className="text-xs text-gray-500">{type}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {type !== 'Video' && (
                <a href={url} download={title} className="p-2 rounded-full hover:bg-gray-200 text-gray-600 transition-colors" title="Download">
                  <Download className="w-5 h-5" />
                </a>
              )}
              <button onClick={() => setPreviewResource(null)} className="p-2 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div className="flex-1 bg-gray-100 flex items-center justify-center overflow-hidden relative">
            {type === 'Video' ? (
              <div className="text-center p-10">
                <Video className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium mb-4">External Video Link</p>
                <a href={url} target="_blank" rel="noreferrer" className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 inline-flex items-center gap-2">
                  Open on YouTube <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ) : isPdf ? (
              <iframe src={url} className="w-full h-full" title="PDF Preview"></iframe>
            ) : isImage ? (
              <img src={url} alt="Preview" className="max-w-full max-h-full object-contain" />
            ) : (
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Preview not available.</p>
                <a href={url} download={title} className="text-blue-600 font-bold hover:underline mt-2 inline-block">Download File</a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ... (ResourceManager code remains exactly the same) ...
  const ResourceManager = ({ course }) => {
    const [resources, setResources] = useState(course.resources || []);
    const [form, setForm] = useState({ title: "", type: "Note", url: "" });
    const [uploading, setUploading] = useState(false);

    const handleFile = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          pushToast("File too large (Max 10MB)", "error");
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => setForm({ ...form, url: reader.result });
        reader.readAsDataURL(file);
      }
    };

    const addResource = async () => {
      if (!form.title || !form.url) return pushToast("Title and Content required", "error");
      setUploading(true);
      try {
        const res = await authFetch(`/faculty/course/${course._id}/resource`, {
          method: 'POST',
          body: JSON.stringify(form)
        });
        const data = await res.json();
        if (res.ok) {
          setResources(data.resources);
          setForm({ title: "", type: "Note", url: "" });
          pushToast("Resource added successfully");
        }
      } catch (e) { pushToast("Failed to add resource", "error"); }
      finally { setUploading(false); }
    };

    return (
      <div className="animate-in fade-in">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" /> Course Materials
        </h3>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Type</label>
              <select className="w-full p-2 rounded-lg border border-gray-300 mt-1 outline-none" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="Note">Note (PDF/Doc)</option>
                <option value="PYQ">PYQ (Prev. Year Q)</option>
                <option value="Video">Video Tutorial</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
              <input className="w-full p-2 rounded-lg border border-gray-300 mt-1 outline-none" placeholder="e.g., Unit 1 Notes" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="md:col-span-1">
              {form.type === 'Video' ? (
                <input className="w-full p-2 rounded-lg border border-gray-300 outline-none" placeholder="YouTube Link" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
              ) : (
                <div className="relative">
                  <input type="file" className="hidden" id="resFile" onChange={handleFile} accept=".pdf,.doc,.docx,.jpg,.png" />
                  <label htmlFor="resFile" className="w-full p-2 bg-white border border-gray-300 rounded-lg cursor-pointer flex items-center justify-center text-sm text-gray-600 hover:bg-gray-100 truncate">
                    {form.url ? "File Selected" : "Upload File"}
                  </label>
                </div>
              )}
            </div>
          </div>
          <button onClick={addResource} disabled={uploading} className="mt-3 w-full py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
            {uploading ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus className="w-4 h-4" />} Add Material
          </button>
        </div>

        <div className="space-y-3">
          {resources.length === 0 ? <div className="text-center py-10 text-gray-400 text-sm">No materials added yet.</div> : resources.slice().reverse().map((res, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${res.type === 'Video' ? 'bg-red-50 text-red-600' : res.type === 'PYQ' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                  {res.type === 'Video' ? <Video className="w-5 h-5" /> : res.type === 'PYQ' ? <HelpCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">{res.title}</h4>
                  <p className="text-xs text-gray-400">{new Date(res.uploadedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button onClick={() => setPreviewResource(res)} className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-lg" title="Preview"><Eye className="w-4 h-4" /></button>
                {res.type !== 'Video' && <a href={res.url} download={res.title} className="p-2 text-gray-400 hover:text-green-600 bg-gray-50 rounded-lg" title="Download"><Download className="w-4 h-4" /></a>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ... (StudentMapper code remains exactly the same) ...
  const StudentMapper = ({ course }) => {
    const [students, setStudents] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [fetching, setFetching] = useState(true);
    const [saving, setSaving] = useState(false);

    // Filters
    const [search, setSearch] = useState("");
    const [sectionFilter, setSectionFilter] = useState("All");

    useEffect(() => {
      loadStudents();
    }, [course]);

    const loadStudents = async () => {
      setFetching(true);
      try {
        const res = await authFetch(`/faculty/course/${course._id}/eligible-students`);
        const data = await res.json();
        setStudents(data.students || []);
        setSelectedIds(data.enrolled || []);
      } catch (e) { pushToast("Failed to load students", "error"); }
      finally { setFetching(false); }
    };

    const toggleStudent = (id) => {
      setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const toggleAll = () => {
      const idsToToggle = filteredStudents.map(s => s._id);
      const allSelected = idsToToggle.every(id => selectedIds.includes(id));

      if (allSelected) {
        setSelectedIds(prev => prev.filter(id => !idsToToggle.includes(id)));
      } else {
        const newIds = [...selectedIds];
        idsToToggle.forEach(id => { if (!newIds.includes(id)) newIds.push(id); });
        setSelectedIds(newIds);
      }
    };

    const saveMapping = async () => {
      setSaving(true);
      try {
        const res = await authFetch(`/faculty/course/${course._id}/enroll`, {
          method: 'POST',
          body: JSON.stringify({ studentIds: selectedIds })
        });
        if (res.ok) pushToast(`Successfully mapped ${selectedIds.length} students`);
      } catch (e) { pushToast("Mapping failed", "error"); }
      finally { setSaving(false); }
    };

    const sections = ["All", ...new Set(students.map(s => s.section || "N/A"))].sort();

    const filteredStudents = students.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.SID.toLowerCase().includes(search.toLowerCase());
      const matchesSection = sectionFilter === "All" || (s.section || "N/A") === sectionFilter;
      return matchesSearch && matchesSection;
    });

    if (fetching) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-gray-400" /></div>;

    return (
      <div className="animate-in fade-in h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600" /> Enrolled Students
          </h3>
          <div className="flex gap-2">
            <button onClick={loadStudents} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl" title="Refresh List"><Loader2 className={`w-4 h-4 ${fetching ? 'animate-spin' : ''}`} /></button>
            <button onClick={saveMapping} disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-green-700 flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Mapping
            </button>
          </div>
        </div>

        {/* Filter Analysis Bar */}
        <div className="mb-4 bg-blue-50 border border-blue-100 rounded-xl overflow-hidden">
          <div className="p-3 border-b border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-800 text-xs font-bold uppercase tracking-wider">
              <Info className="w-4 h-4" /> Filter Analysis
            </div>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">Total Found: {filteredStudents.length}</span>
          </div>
          <div className="p-3 flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-white border border-blue-200 rounded-lg text-xs text-gray-600 flex items-center gap-1 shadow-sm">
              <span className="font-bold text-gray-800">Department:</span> {course.department}
            </span>
            <span className="px-3 py-1 bg-white border border-blue-200 rounded-lg text-xs text-gray-600 flex items-center gap-1 shadow-sm">
              <span className="font-bold text-gray-800">Year:</span> {course.year}
            </span>
            {sectionFilter !== "All" && (
              <span className="px-3 py-1 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 flex items-center gap-1 shadow-sm">
                <Filter className="w-3 h-3" /> Section: {sectionFilter}
              </span>
            )}
            {search && (
              <span className="px-3 py-1 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 flex items-center gap-1 shadow-sm">
                <Search className="w-3 h-3" /> Search: "{search}"
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input className="w-full pl-9 p-2.5 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-green-500" placeholder="Search by name or ID..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div className="relative min-w-[100px]">
            <select
              className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-green-500 text-sm font-medium appearance-none cursor-pointer"
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
            >
              {sections.map(sec => <option key={sec} value={sec}>{sec === "All" ? "All Sections" : `Sec ${sec}`}</option>)}
            </select>
            <ChevronLeft className="w-4 h-4 absolute right-3 top-3 text-gray-400 -rotate-90 pointer-events-none" />
          </div>

          <button onClick={toggleAll} className="px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 whitespace-nowrap">
            Select Visible
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2 max-h-[400px]">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-10 text-gray-400 flex flex-col items-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <AlertCircle className="w-10 h-10 text-gray-300 mb-2" />
              <p className="font-bold text-gray-600">No students found.</p>
              <div className="text-xs text-gray-400 mt-2 max-w-xs text-center space-y-1">
                <p>The system is looking for students in:</p>
                <p className="font-mono bg-white px-2 py-1 rounded border">Dept: {course.department} | Year: {course.year}</p>
                {sectionFilter !== "All" && <p>Matches Section: {sectionFilter}</p>}
              </div>
            </div>
          ) : filteredStudents.map(student => {
            const isSelected = selectedIds.includes(student._id);
            return (
              <div key={student._id} onClick={() => toggleStudent(student._id)} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100 hover:bg-gray-50'}`}>
                <div className={isSelected ? "text-green-600" : "text-gray-300"}>{isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}</div>
                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                  {student.profilePic ? <img src={student.profilePic} className="w-full h-full object-cover" alt="img" /> : <span className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">{student.name[0]}</span>}
                </div>
                <div className="flex-1">
                  <h4 className={`text-sm font-bold ${isSelected ? 'text-green-900' : 'text-gray-700'}`}>{student.name}</h4>
                  <p className="text-xs text-gray-500">{student.SID} • Sec {student.section || 'NA'}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-gray-400" /></div>;

  // --- VIEW: COURSE LIST ---
  if (!selectedCourse) {
    return (
      <div className="animate-in fade-in pb-10">
        <div className="mb-6 border-b border-gray-100 pb-4">
          <h2 className="text-2xl font-bold text-gray-800">My Courses</h2>
          <p className="text-gray-500 text-sm mt-1">Manage content and students for your subjects</p>
        </div>
        {courses.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-500">No Courses Assigned</h3>
            <p className="text-sm text-gray-400">
              {faculty ? `Showing courses for ${faculty.department} Department.` : "Loading..."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => {
              // Logic Check: Who owns this course?
              const isMine = course.facultyId === faculty._id || course.facultyId === faculty.id;
              const isTaken = course.facultyId && !isMine;

              return (
                <div key={course._id} onClick={() => setSelectedCourse(course)} className={`bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 cursor-pointer transition-all group relative overflow-hidden ${isTaken ? 'opacity-70 grayscale-[0.5]' : ''}`}>

                  {/* --- Opt-In Toggle / Taken Status --- */}
                  <div className="absolute top-4 right-4 z-10">
                    {isTaken ? (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed">
                        <Lock className="w-3 h-3" /> Taken
                      </span>
                    ) : (
                      <button
                        onClick={(e) => handleOptInToggle(e, course)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${isMine
                          ? "bg-green-100 border-green-200 text-green-700"
                          : "bg-white border-gray-200 text-gray-400 hover:border-blue-400 hover:text-blue-500"
                          }`}
                      >
                        {isMine ? <CheckCircle className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5 rounded-full border border-current"></div>}
                        {isMine ? "Assigned" : "Opt In"}
                      </button>
                    )}
                  </div>

                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl transition-colors ${isMine ? 'bg-green-50 text-green-600' : isTaken ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600'}`}>
                      <BookOpen className="w-6 h-6" />
                    </div>
                    {/* Code Badge */}
                    <span className="mr-24 px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-500 uppercase">{course.code}</span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-1">{course.name}</h3>
                  <p className="text-sm text-gray-500">{course.department} • {course.year} Year</p>

                  <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between text-xs font-semibold text-gray-400">
                    <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {course.resources?.length || 0} Materials</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {course.enrolledStudents?.length || 0} Students</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // --- VIEW: SELECTED COURSE DETAILS ---
  const isMine = selectedCourse.facultyId === faculty._id || selectedCourse.facultyId === faculty.id;

  return (
    <div className="animate-in fade-in h-full flex flex-col relative">
      <ResourcePreviewModal />
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => { setSelectedCourse(null); setViewMode('resources'); }} className="p-2 rounded-full hover:bg-gray-100 text-gray-500"><ChevronLeft className="w-6 h-6" /></button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              {selectedCourse.name}
              {!isMine && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full border">ReadOnly View</span>}
            </h2>
            <p className="text-sm text-gray-500">{selectedCourse.code} • {selectedCourse.department}</p>
          </div>
        </div>

        {/* VIEW TOGGLE */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button onClick={() => setViewMode('resources')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'resources' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Resources</button>

          {/* LOCKED STUDENT TAB IF NOT OWNER */}
          {isMine ? (
            <button onClick={() => setViewMode('students')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'students' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'}`}>Students</button>
          ) : (
            <div className="px-4 py-2 rounded-lg text-sm font-bold text-gray-400 flex items-center gap-1 cursor-not-allowed" title="Only the assigned faculty can manage students">
              <Lock className="w-3 h-3" /> Students
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto custom-scrollbar pr-2">
          {viewMode === 'resources' ? <ResourceManager course={selectedCourse} /> : <StudentMapper course={selectedCourse} />}
        </div>
      </div>
    </div>
  );
};

export default FacultyCourses;