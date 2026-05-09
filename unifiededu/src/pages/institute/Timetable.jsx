import React, { useState, useEffect } from "react";
import {
  CalendarDays, Edit3, GripVertical, Cpu, Save, Loader2, X,
  Settings, Users, Trash2, Plus, AlertTriangle, Pencil, Clock,
  BookOpen, CheckCircle, MessageSquare, Briefcase
} from "lucide-react";

// --- Sub-components ---

const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
    <div>
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
    </div>
    {action && <div className="mt-4 md:mt-0">{action}</div>}
  </div>
);

const TimetableManager = ({ authFetch, theme, pushToast }) => {
  // --- STATE MANAGEMENT ---
  
  const [ttView, setTtView] = useState("list"); 
  const [savedTimetables, setSavedTimetables] = useState([]);
  
  // Data State
  const [departments, setDepartments] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [facultyList, setFacultyList] = useState([]); 
  const [loadingData, setLoadingData] = useState(false);

  // Generation Configuration
  const [config, setConfig] = useState({
    department: "",
    semester: "1",
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    startTime: "09:00",
    endTime: "16:30",
    lunchTime: "13:00",
    slotDuration: "60",
    selectedCourseIds: [],
    selectedLabIds: [],
    selectedFacultyIds: [], 
    remarks: ""
  });

  const [generatedDraft, setGeneratedDraft] = useState(null); 
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Edit/Delete/Rename States
  const [selectedTimetable, setSelectedTimetable] = useState(null); 
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [dragSource, setDragSource] = useState(null); 
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [renameId, setRenameId] = useState(null);
  const [renameText, setRenameText] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  // --- EFFECTS ---
  useEffect(() => {
    loadTimetables();
    loadDepartments();
  }, []);

  useEffect(() => {
    if (config.department && config.semester) {
      loadCoursesForSelection();
      loadFacultyForSelection(); 
    }
  }, [config.department, config.semester]);

  // --- API HELPERS ---
  const loadTimetables = async () => {
    try {
      const res = await authFetch("/institute/timetables");
      const data = await res.json();
      setSavedTimetables(Array.isArray(data) ? data : []);
    } catch (e) { setSavedTimetables([]); }
  };

  const loadDepartments = async () => {
    try {
      const res = await authFetch("/institute/departments");
      const data = await res.json();
      setDepartments(Array.isArray(data) ? data : []);
      if(data.length > 0 && !config.department) {
        setConfig(prev => ({...prev, department: data[0].code}));
      }
    } catch (e) { console.error(e); }
  };

  // --- UPDATED: Fetch courses using Query Params ---
  const loadCoursesForSelection = async () => {
    setLoadingData(true);
    try {
      // 1. Pass department and semester to backend to fix StrictPopulateError
      const res = await authFetch(`/institute/courses?department=${config.department}&semester=${config.semester}`);
      const data = await res.json();
      
      // 2. Data is already filtered by backend
      setAvailableCourses(Array.isArray(data) ? data : []);
      
      // 3. Reset selections
      setConfig(prev => ({ ...prev, selectedCourseIds: [], selectedLabIds: [] }));
    } catch (e) {
      pushToast({ message: "Failed to load subjects", type: "error" });
    } finally {
      setLoadingData(false);
    }
  };

  const loadFacultyForSelection = async () => {
    try {
      const res = await authFetch("/institute/faculty");
      const data = await res.json();
      const deptFaculty = data.filter(f => f.department === config.department);
      setFacultyList(deptFaculty);
    } catch (e) {
      console.error("Faculty fetch error", e);
    }
  };

  // --- HANDLERS ---
  const toggleCourse = (id, isLab = false) => {
    if (isLab) {
      setConfig(prev => ({
        ...prev,
        selectedLabIds: prev.selectedLabIds.includes(id) 
          ? prev.selectedLabIds.filter(x => x !== id) 
          : [...prev.selectedLabIds, id]
      }));
    } else {
      setConfig(prev => ({
        ...prev,
        selectedCourseIds: prev.selectedCourseIds.includes(id) 
          ? prev.selectedCourseIds.filter(x => x !== id) 
          : [...prev.selectedCourseIds, id]
      }));
    }
  };

  const toggleFaculty = (id) => {
    setConfig(prev => ({
      ...prev,
      selectedFacultyIds: prev.selectedFacultyIds.includes(id)
        ? prev.selectedFacultyIds.filter(x => x !== id)
        : [...prev.selectedFacultyIds, id]
    }));
  };

  const handleGenerate = async () => {
    if (!config.department || !config.semester) {
      pushToast({ message: "Please select Department and Semester", type: "error" });
      return;
    }
    if (config.selectedCourseIds.length === 0 && config.selectedLabIds.length === 0) {
      pushToast({ message: "Select at least one subject or lab", type: "error" });
      return;
    }

    setIsGenerating(true);
    try {
      const res = await authFetch("/institute/timetable/generate", {
        method: "POST",
        body: JSON.stringify({ config })
      });
      const data = await res.json();
      
      if (data.schedule) {
        setGeneratedDraft(data.schedule);
        pushToast({ message: "Timetable Generated Successfully!", type: "success" });
      } else {
        pushToast({ message: "Generation failed. Try again.", type: "error" });
      }
    } catch (e) {
      pushToast({ message: "Server Error", type: "error" });
    } finally {
      setIsGenerating(false);
    }
  };

  // --- UPDATED: Save Draft with Department ID ---
  const handleSaveDraft = async () => {
    if (!generatedDraft) return;
    try {
      // 1. Include 'department' in the payload so the backend saves it correctly
      const payload = {
        department: config.department, // <--- ADDED THIS
        semester: config.semester,
        subjects: [], // Optional: You can populate this with course names if needed
        workingDays: config.workingDays,
        schedule: generatedDraft
      };

      const res = await authFetch("/institute/timetable/save", { 
        method: "POST", 
        body: JSON.stringify(payload) 
      });

      if (res.ok) {
        pushToast({ message: "Timetable Saved!", type: "success" });
        setGeneratedDraft(null);
        setTtView("list");
        loadTimetables();
      }
    } catch (e) { pushToast({ message: "Save failed", type: "error" }); }
  };

  const handleSaveChanges = async () => {
    if (!selectedTimetable) return;
    try {
      const res = await authFetch(`/institute/timetable/${selectedTimetable._id}`, {
        method: "PUT", body: JSON.stringify({ schedule: selectedTimetable.schedule })
      });
      if (res.ok) { pushToast({ message: "Updated!", type: "success" }); setIsEditModalOpen(false); loadTimetables(); }
    } catch (e) { pushToast({ message: "Update failed", type: "error" }); }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await authFetch(`/institute/timetable/${deleteId}`, { method: "DELETE" });
      if (res.ok) { pushToast({ message: "Deleted successfully", type: "success" }); loadTimetables(); setDeleteId(null); }
    } catch (e) { pushToast({ message: "Server error", type: "error" }); } finally { setIsDeleting(false); }
  };

  const handleRename = async () => {
    if (!renameId || !renameText.trim()) return;
    setIsRenaming(true);
    try {
      const res = await authFetch(`/institute/timetable/${renameId}`, { method: "PUT", body: JSON.stringify({ semester: renameText }) });
      if (res.ok) { pushToast({ message: "Renamed successfully", type: "success" }); loadTimetables(); setRenameId(null); }
    } catch (e) { pushToast({ message: "Server error", type: "error" }); } finally { setIsRenaming(false); }
  };

  const handleDragStart = (e, day, index) => { setDragSource({ day, index }); e.dataTransfer.effectAllowed = "move"; };
  const handleDragOver = (e) => { e.preventDefault(); };
  const handleDrop = (e, targetDay, targetIndex) => {
    e.preventDefault(); if (!dragSource || !selectedTimetable) return;
    const newSchedule = { ...selectedTimetable.schedule };
    const sourceItem = newSchedule[dragSource.day][dragSource.index];
    const targetItem = newSchedule[targetDay][targetIndex];
    newSchedule[dragSource.day][dragSource.index] = targetItem;
    newSchedule[targetDay][targetIndex] = sourceItem;
    setSelectedTimetable({ ...selectedTimetable, schedule: newSchedule });
    setDragSource(null);
  };
  const handleDeleteSlot = (day, index) => {
    const newSchedule = { ...selectedTimetable.schedule };
    newSchedule[day][index] = { time: newSchedule[day][index].time, subject: "Free Slot", faculty: "", room: "" };
    setSelectedTimetable({ ...selectedTimetable, schedule: newSchedule });
  };

  // Render Edit Modal
  const renderEditModal = () => {
    if (!isEditModalOpen || !selectedTimetable) return null;
    const schedule = selectedTimetable.schedule;
    const days = Object.keys(schedule);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
          <div className="p-5 border-b flex justify-between items-center bg-gray-50">
            <div><h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Edit3 className="w-5 h-5"/> Edit Timetable: {selectedTimetable.semester}</h2></div>
            <div className="flex gap-3">
              <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 rounded-xl border hover:bg-gray-100 text-gray-600 font-medium">Cancel</button>
              <button onClick={handleSaveChanges} className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md flex items-center gap-2 font-medium" style={{ backgroundColor: theme.primary }}><Save className="w-4 h-4" /> Save Changes</button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-6 custom-scrollbar bg-gray-50/50">
            <table className="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
              <thead><tr><th className="p-4 bg-gray-100 border-b text-left text-sm font-bold text-gray-600">Day</th>{schedule[days[0]]?.map((slot, i) => <th key={i} className="p-4 bg-gray-100 border-b text-left text-sm font-bold text-gray-600 min-w-[150px]">{slot.time}</th>)}</tr></thead>
              <tbody>
                {days.map((day) => (
                  <tr key={day} className="border-b last:border-0"><td className="p-4 font-bold text-gray-700 bg-gray-50 border-r">{day}</td>{schedule[day].map((slot, idx) => (
                      <td key={idx} className="p-2 border-r last:border-0 relative group transition-colors hover:bg-blue-50/50" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, day, idx)}>
                        <div draggable onDragStart={(e) => handleDragStart(e, day, idx)} className={`p-3 rounded-lg border cursor-grab active:cursor-grabbing shadow-sm min-h-[80px] flex flex-col justify-between transition-all ${slot.subject === "Free Slot" ? "bg-gray-50 border-dashed border-gray-300 opacity-60" : "bg-white border-gray-200 hover:shadow-md"}`} style={{ borderLeft: slot.subject !== "Free Slot" ? `4px solid ${theme.primary}` : undefined }}>
                          {slot.subject !== "Free Slot" ? (<><div className="flex justify-between items-start gap-2"><span className="font-bold text-sm text-gray-800 line-clamp-2 leading-tight">{slot.subject}</span><button onClick={() => handleDeleteSlot(day, idx)} className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><X className="w-4 h-4" /></button></div><div className="mt-2 flex items-center justify-between text-xs text-gray-500"><span className="flex items-center gap-1 truncate max-w-[80px]"><Users className="w-3 h-3"/> {slot.faculty || "N/A"}</span></div></>) : (<div className="flex items-center justify-center h-full text-gray-400 text-xs italic">Empty</div>)}
                        </div>
                      </td>
                    ))}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // --- RENDER ---
  return (
    <div className="pb-10 animate-in fade-in slide-in-from-bottom-2 relative">
      <SectionHeader title="Timetable Management" subtitle="AI-Powered Scheduling with Conflict Detection" action={
          <div className="flex bg-gray-100 p-1 rounded-xl">
             <button onClick={() => setTtView("list")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${ttView === "list" ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700"}`}>All Timetables</button>
             <button onClick={() => setTtView("generate")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${ttView === "generate" ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700"}`}>Generate New</button>
          </div>
      } />

      {ttView === "generate" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2"><Settings className="w-5 h-5 text-blue-600" /> Setup Class Details</h3>
              <div className="space-y-5">
                
                {/* Dept/Sem */}
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs font-bold text-gray-500 uppercase">Department</label><select className="w-full mt-1 p-3 bg-gray-50 border rounded-xl text-sm font-bold outline-none" value={config.department} onChange={e => setConfig({...config, department: e.target.value})}><option value="">Select</option>{departments.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}</select></div>
                  <div><label className="text-xs font-bold text-gray-500 uppercase">Semester</label><select className="w-full mt-1 p-3 bg-gray-50 border rounded-xl text-sm font-bold outline-none" value={config.semester} onChange={e => setConfig({...config, semester: e.target.value})}>{[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}</select></div>
                </div>
                
                {/* Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs font-bold text-gray-500 uppercase">Start Time</label><input type="time" className="w-full mt-1 p-2 bg-gray-50 border rounded-xl text-sm" value={config.startTime} onChange={e => setConfig({...config, startTime: e.target.value})} /></div>
                  <div><label className="text-xs font-bold text-gray-500 uppercase">End Time</label><input type="time" className="w-full mt-1 p-2 bg-gray-50 border rounded-xl text-sm" value={config.endTime} onChange={e => setConfig({...config, endTime: e.target.value})} /></div>
                </div>
                <div className="p-3 bg-orange-50 rounded-xl border border-orange-100"><label className="text-xs font-bold text-orange-700 uppercase flex items-center gap-2"><Clock className="w-3 h-3"/> Lunch Break (1 Hr)</label><input type="time" className="w-full mt-2 p-2 bg-white border border-orange-200 rounded-lg text-sm font-bold" value={config.lunchTime} onChange={e => setConfig({...config, lunchTime: e.target.value})} /></div>
                
                {/* Remarks */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2"><MessageSquare className="w-3 h-3"/> Remarks / Instructions</label>
                  <textarea rows={2} className="w-full mt-1 p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:border-blue-500 resize-none" placeholder="e.g. Dr. Smith unavailable Mondays, Labs in afternoon..." value={config.remarks} onChange={e => setConfig({...config, remarks: e.target.value})} />
                </div>

                {/* Faculty Selection */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2"><Briefcase className="w-3 h-3"/> Select Faculty (Availability)</label>
                  {facultyList.length === 0 ? <p className="text-xs text-gray-400 italic">No faculty found for this Dept.</p> : (
                    <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-1 p-1 border rounded-xl bg-gray-50">
                      {facultyList.map(f => (
                        <div key={f._id} onClick={() => toggleFaculty(f._id)} className={`p-2 rounded-lg cursor-pointer flex items-center gap-2 text-xs transition-all ${config.selectedFacultyIds.includes(f._id) ? 'bg-green-50 border border-green-300 text-green-800' : 'bg-white border border-transparent hover:bg-gray-100'}`}>
                          <div className={`w-3 h-3 rounded-sm border flex items-center justify-center ${config.selectedFacultyIds.includes(f._id) ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>{config.selectedFacultyIds.includes(f._id) && <span className="text-white text-[8px]">✓</span>}</div>
                          <span>{f.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Courses */}
                <div><label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Select Theory Courses</label>{loadingData ? <Loader2 className="w-5 h-5 animate-spin mx-auto"/> : <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-2 p-1">{availableCourses.map(c => (<div key={c._id} onClick={() => toggleCourse(c._id, false)} className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${config.selectedCourseIds.includes(c._id) ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200 hover:border-blue-300'}`}><div className={`w-4 h-4 rounded border flex items-center justify-center ${config.selectedCourseIds.includes(c._id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>{config.selectedCourseIds.includes(c._id) && <span className="text-white text-xs">✓</span>}</div><div className="flex-1"><p className="text-sm font-bold text-gray-800">{c.name}</p><p className="text-xs text-gray-500">{c.code} • {c.facultyId?.name || "No Faculty"}</p></div></div>))}</div>}</div>
                
                {/* Labs */}
                <div><label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Select Labs</label><div className="max-h-40 overflow-y-auto custom-scrollbar space-y-2 p-1">{availableCourses.map(c => (<div key={`lab-${c._id}`} onClick={() => toggleCourse(c._id, true)} className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${config.selectedLabIds.includes(c._id) ? 'bg-purple-50 border-purple-500' : 'bg-white border-gray-200 hover:border-purple-300'}`}><div className={`w-4 h-4 rounded border flex items-center justify-center ${config.selectedLabIds.includes(c._id) ? 'bg-purple-500 border-purple-500' : 'border-gray-300'}`}>{config.selectedLabIds.includes(c._id) && <span className="text-white text-xs">✓</span>}</div><div className="flex-1"><p className="text-sm font-bold text-gray-800">{c.name} (Lab)</p></div></div>))}</div></div>
                
                <button onClick={handleGenerate} disabled={isGenerating} className="w-full py-4 rounded-xl text-white font-bold shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity" style={{ backgroundColor: theme.primary }}>{isGenerating ? <Loader2 className="w-5 h-5 animate-spin"/> : <Cpu className="w-5 h-5" />} Generate Timetable</button>
              </div>
            </div>
          </div>
          {/* Preview */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
              <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
                <div><h3 className="font-bold text-gray-800">Draft Preview</h3>{generatedDraft && <p className="text-xs text-green-600 font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3"/> AI Generated Successfully</p>}</div>
                {generatedDraft && (<button onClick={handleSaveDraft} className="px-5 py-2.5 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 shadow-md flex items-center gap-2"><Save className="w-4 h-4" /> Save Schedule</button>)}
              </div>
              <div className="p-6 flex-1 overflow-x-auto custom-scrollbar bg-gray-50/30">
                {!generatedDraft ? (<div className="h-full flex flex-col items-center justify-center text-gray-300"><CalendarDays className="w-24 h-24 mb-4 opacity-20" /><p className="text-lg font-bold">Ready to Generate</p><p className="text-sm">Select constraints on the left to start.</p></div>) : (<table className="w-full border-collapse"><thead><tr><th className="p-4 text-left text-xs font-extrabold text-gray-400 uppercase border-b">Day</th>{generatedDraft[Object.keys(generatedDraft)[0]]?.map((slot, i) => <th key={i} className="p-4 text-left text-xs font-extrabold text-gray-400 uppercase border-b min-w-[140px]">{slot.time}</th>)}</tr></thead><tbody>{Object.entries(generatedDraft).map(([day, slots]) => (<tr key={day} className="border-b last:border-0 bg-white hover:bg-gray-50 transition-colors"><td className="p-4 font-bold text-gray-800 border-r">{day}</td>{slots.map((slot, idx) => (<td key={idx} className="p-2 border-r last:border-0"><div className={`p-3 rounded-xl h-full flex flex-col justify-center ${slot.subject.includes("Lunch") ? "bg-orange-100 border border-orange-200 text-orange-700" : slot.subject === "Free" ? "bg-gray-50 text-gray-400 border border-dashed" : "bg-blue-50 border border-blue-100 text-blue-900"}`}><p className="font-bold text-xs line-clamp-2">{slot.subject}</p>{slot.faculty && <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1"><Users className="w-3 h-3"/> {slot.faculty}</p>}</div></td>))}</tr>))}</tbody></table>)}
              </div>
            </div>
          </div>
        </div>
      )}

      {ttView === "list" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
           <div onClick={() => setTtView("generate")} className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-8 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group min-h-[200px]"><div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors"><Plus className="w-6 h-6 text-gray-400 group-hover:text-blue-600" /></div><p className="font-semibold text-gray-500 group-hover:text-blue-600">Create New Timetable</p></div>
           {savedTimetables.map((tt) => (
            <div key={tt._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden" onClick={() => { setSelectedTimetable(JSON.parse(JSON.stringify(tt))); setIsEditModalOpen(true); }}>
              <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: theme.primary }}></div>
              <div className="flex justify-between items-start mb-4 pl-4">
                <div><h3 className="font-bold text-lg text-gray-800 line-clamp-1 pr-2">{tt.semester}</h3><p className="text-xs text-gray-500 mt-1">Created: {new Date(tt.createdAt).toLocaleDateString()}</p></div>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}><button onClick={() => { setRenameId(tt._id); setRenameText(tt.semester); }} className="p-2 bg-gray-50 rounded-full hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors z-10"><Pencil className="w-4 h-4" /></button><button onClick={() => setDeleteId(tt._id)} className="p-2 bg-gray-50 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors z-10"><Trash2 className="w-4 h-4" /></button></div>
              </div>
              <div className="pl-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600"><CalendarDays className="w-4 h-4 text-gray-400" /><span>{Object.keys(tt.schedule || {}).length} Working Days</span></div>
                <div className="flex flex-wrap gap-2 mt-3"><span className="text-[10px] bg-gray-100 px-2 py-1 rounded-md text-gray-600">AI Generated</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {renderEditModal()}
      {deleteId && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"><div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4 border border-gray-100"><div className="flex flex-col items-center text-center"><div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4"><AlertTriangle className="w-6 h-6 text-red-600" /></div><h3 className="text-lg font-bold text-gray-900 mb-2">Delete Timetable?</h3><p className="text-sm text-gray-500 mb-6">Are you sure? This action cannot be undone.</p><div className="flex gap-3 w-full"><button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition">Cancel</button><button onClick={confirmDelete} disabled={isDeleting} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 shadow-lg shadow-red-200 transition flex justify-center items-center">{isDeleting ? <Loader2 className="animate-spin"/> : "Delete"}</button></div></div></div></div>}
      {renameId && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"><div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4 border border-gray-100"><h3 className="text-lg font-bold text-gray-900 mb-4">Rename Timetable</h3><input value={renameText} onChange={(e) => setRenameText(e.target.value)} className="w-full p-3 border rounded-xl mb-6 text-sm outline-none focus:border-blue-500" placeholder="Enter new semester name" autoFocus/><div className="flex gap-3 w-full"><button onClick={() => setRenameId(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition">Cancel</button><button onClick={handleRename} disabled={isRenaming} className="flex-1 py-2.5 rounded-xl text-white font-semibold shadow-lg transition flex justify-center items-center" style={{ backgroundColor: theme.primary }}>{isRenaming ? <Loader2 className="animate-spin"/> : "Save"}</button></div></div></div>}
    </div>
  );
};

export default TimetableManager;