import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  Edit3,
  GripVertical,
  Cpu,
  Save,
  Loader2,
  X,
  Settings,
  Users,
  Trash2,
  Plus,
  AlertTriangle,
  Pencil // Added for Rename
} from "lucide-react";

// Local Section Header Component
const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
    <div>
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
    </div>
    {action && <div className="mt-4 md:mt-0">{action}</div>}
  </div>
);

// Helper Spinner for Modals
const Spinner = ({ size = 16, color = "white" }) => (
  <div
    className="rounded-full animate-spin"
    style={{
      width: `${size}px`,
      height: `${size}px`,
      border: `${Math.max(2, Math.round(size / 6))}px solid ${color}`,
      borderTopColor: "transparent",
    }}
  />
);

const TimetableManager = ({ authFetch, theme, pushToast }) => {
  // --- State ---
  const [ttView, setTtView] = useState("list"); // "list" | "generate"
  const [savedTimetables, setSavedTimetables] = useState([]);
  
  // Configuration Form State
  const [timetableConfig, setTimetableConfig] = useState({
    semester: "",
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    startTime: "09:00",
    endTime: "16:00",
    slotDuration: "60",
    subjects: "",
    faculty: "",
    labs: "",
    constraints: ""
  });

  const [generatedDraft, setGeneratedDraft] = useState(null); 
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Edit Modal State
  const [selectedTimetable, setSelectedTimetable] = useState(null); 
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [dragSource, setDragSource] = useState(null); 

  // Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Rename State
  const [renameId, setRenameId] = useState(null);
  const [renameText, setRenameText] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  // --- Effects ---
  useEffect(() => {
    loadTimetables();
  }, []);

  // --- Actions ---

  // 1. Load All
  const loadTimetables = async () => {
    try {
      const res = await authFetch("/institute/timetables");
      const data = await res.json();
      setSavedTimetables(Array.isArray(data) ? data : []);
    } catch (e) {
      setSavedTimetables([]);
    }
  };

  // 2. Generate Draft (AI)
  const handleGenerate = async () => {
    if (!timetableConfig.semester || !timetableConfig.subjects) {
      pushToast({ message: "Semester and Subjects are required", type: "error" });
      return;
    }
    setIsGenerating(true);
    try {
      const payload = {
        prompt: `Generate a college timetable for ${timetableConfig.semester}. 
        Working Days: ${timetableConfig.workingDays.join(", ")}.
        Time: ${timetableConfig.startTime} to ${timetableConfig.endTime}.
        Slot Duration: ${timetableConfig.slotDuration} minutes.
        Subjects: ${timetableConfig.subjects}.
        Faculty: ${timetableConfig.faculty}.
        Lab Requirements: ${timetableConfig.labs}.
        Additional Constraints: ${timetableConfig.constraints}.
        Output strictly in JSON format keys=Days, values=array of { time, subject, faculty, room }.`
      };
      
      const res = await authFetch("/institute/timetable/generate", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.schedule) {
        setGeneratedDraft(data.schedule);
        pushToast({ message: "Draft generated! Review and Save.", type: "success" });
      } else {
        pushToast({ message: "Generation failed", type: "error" });
      }
    } catch (e) {
      pushToast({ message: "Server Error", type: "error" });
    } finally {
      setIsGenerating(false);
    }
  };

  // 3. Save Draft
  const handleSaveDraft = async () => {
    if (!generatedDraft) return;
    try {
      const payload = {
        semester: timetableConfig.semester,
        subjects: timetableConfig.subjects.split(","),
        workingDays: timetableConfig.workingDays,
        schedule: generatedDraft
      };
      const res = await authFetch("/institute/timetable/save", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        pushToast({ message: "Timetable Saved Successfully!", type: "success" });
        setGeneratedDraft(null);
        setTtView("list");
        loadTimetables();
      }
    } catch (e) {
      pushToast({ message: "Failed to save", type: "error" });
    }
  };

  // 4. Update Existing (Drag & Drop Save)
  const handleSaveChanges = async () => {
    if (!selectedTimetable) return;
    try {
      const res = await authFetch(`/institute/timetable/${selectedTimetable._id}`, {
        method: "PUT",
        body: JSON.stringify({ schedule: selectedTimetable.schedule })
      });
      if (res.ok) {
        pushToast({ message: "Changes updated!", type: "success" });
        setIsEditModalOpen(false);
        loadTimetables();
      }
    } catch (e) {
      pushToast({ message: "Update failed", type: "error" });
    }
  };

  // 5. Confirm Delete
  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await authFetch(`/institute/timetable/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        pushToast({ message: "Timetable deleted successfully", type: "success" });
        loadTimetables();
        setDeleteId(null);
      } else {
        pushToast({ message: "Delete failed", type: "error" });
      }
    } catch (e) {
      pushToast({ message: "Server connection failed", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  // 6. Handle Rename
  const handleRename = async () => {
    if (!renameId || !renameText.trim()) return;
    setIsRenaming(true);
    try {
      const res = await authFetch(`/institute/timetable/${renameId}`, {
        method: "PUT",
        body: JSON.stringify({ semester: renameText })
      });
      
      if (res.ok) {
        pushToast({ message: "Renamed successfully", type: "success" });
        loadTimetables();
        setRenameId(null);
      } else {
        pushToast({ message: "Rename failed", type: "error" });
      }
    } catch (e) {
      pushToast({ message: "Server error", type: "error" });
    } finally {
      setIsRenaming(false);
    }
  };

  // --- Drag & Drop Logic ---
  const handleDragStart = (e, day, index) => {
    setDragSource({ day, index });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetDay, targetIndex) => {
    e.preventDefault();
    if (!dragSource || !selectedTimetable) return;

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
    newSchedule[day][index] = { 
      time: newSchedule[day][index].time, 
      subject: "Free Slot", 
      faculty: "", 
      room: "" 
    };
    setSelectedTimetable({ ...selectedTimetable, schedule: newSchedule });
  };

  // --- Renderers ---
  
  // Render Edit Modal
  const renderTimetableModal = () => {
    if (!isEditModalOpen || !selectedTimetable) return null;
    const schedule = selectedTimetable.schedule;
    const days = Object.keys(schedule);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b flex justify-between items-center bg-gray-50">
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Edit3 className="w-5 h-5"/> Edit Timetable: {selectedTimetable.semester}
              </h2>
              <p className="text-xs text-gray-500 mt-1">Drag and drop slots to rearrange. Click Save to apply.</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsEditModalOpen(false)} 
                className="px-4 py-2 rounded-xl border hover:bg-gray-100 text-gray-600 font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveChanges} 
                className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md flex items-center gap-2 font-medium"
                style={{ backgroundColor: theme.primary }}
              >
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto p-6 custom-scrollbar bg-gray-50/50">
            <table className="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
              <thead>
                <tr>
                  <th className="p-4 bg-gray-100 border-b text-left text-sm font-bold text-gray-600">Day</th>
                  {schedule[days[0]]?.map((slot, i) => (
                    <th key={i} className="p-4 bg-gray-100 border-b text-left text-sm font-bold text-gray-600 min-w-[150px]">
                      {slot.time || `Slot ${i+1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((day) => (
                  <tr key={day} className="border-b last:border-0">
                    <td className="p-4 font-bold text-gray-700 bg-gray-50 border-r">{day}</td>
                    {schedule[day].map((slot, idx) => (
                      <td 
                        key={idx} 
                        className="p-2 border-r last:border-0 relative group transition-colors hover:bg-blue-50/50"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, day, idx)}
                      >
                        <div 
                          draggable 
                          onDragStart={(e) => handleDragStart(e, day, idx)}
                          className={`p-3 rounded-lg border cursor-grab active:cursor-grabbing shadow-sm min-h-[80px] flex flex-col justify-between transition-all ${
                            slot.subject === "Free Slot" 
                              ? "bg-gray-50 border-dashed border-gray-300 opacity-60" 
                              : "bg-white border-gray-200 hover:shadow-md"
                          }`}
                          style={{ borderLeft: slot.subject !== "Free Slot" ? `4px solid ${theme.primary}` : undefined }}
                        >
                          {slot.subject !== "Free Slot" ? (
                            <>
                              <div className="flex justify-between items-start gap-2">
                                <span className="font-bold text-sm text-gray-800 line-clamp-2 leading-tight">{slot.subject}</span>
                                <button 
                                  onClick={() => handleDeleteSlot(day, idx)}
                                  className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                                <span className="flex items-center gap-1 truncate max-w-[80px]">
                                  <Users className="w-3 h-3"/> {slot.faculty || "N/A"}
                                </span>
                                {slot.room && <span className="px-1.5 py-0.5 border rounded bg-gray-50 text-[10px]">{slot.room}</span>}
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-400 text-xs italic">Empty</div>
                          )}
                          
                          {/* Drag Hint */}
                          <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-20 pointer-events-none">
                             <GripVertical className="w-4 h-4" />
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="pb-10 animate-in fade-in slide-in-from-bottom-2 relative">
      <SectionHeader 
        title="AI Timetable Manager" 
        subtitle="Generate, Edit, and Manage Schedules" 
        action={
          <div className="flex bg-gray-100 p-1 rounded-xl">
             <button 
               onClick={() => setTtView("list")}
               className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${ttView === "list" ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700"}`}
             >
               All Timetables
             </button>
             <button 
               onClick={() => setTtView("generate")}
               className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${ttView === "generate" ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700"}`}
             >
               Generate New
             </button>
          </div>
        }
      />

      {/* VIEW 1: SAVED TIMETABLES LIST */}
      {ttView === "list" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Create New Card */}
          <div 
            onClick={() => setTtView("generate")}
            className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-8 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group min-h-[200px]"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
              <Plus className="w-6 h-6 text-gray-400 group-hover:text-blue-600" />
            </div>
            <p className="font-semibold text-gray-500 group-hover:text-blue-600">Create New Timetable</p>
          </div>

          {savedTimetables.map((tt) => (
            <div 
              key={tt._id} 
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
              onClick={() => { setSelectedTimetable(JSON.parse(JSON.stringify(tt))); setIsEditModalOpen(true); }}
            >
              <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: theme.primary }}></div>
              
              <div className="flex justify-between items-start mb-4 pl-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-800 line-clamp-1 pr-2">{tt.semester}</h3>
                  <p className="text-xs text-gray-500 mt-1">Created: {new Date(tt.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  {/* Rename Button */}
                  <button 
                     onClick={() => { setRenameId(tt._id); setRenameText(tt.semester); }}
                     className="p-2 bg-gray-50 rounded-full hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors z-10"
                     title="Rename"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  {/* Delete Button */}
                  <button 
                     onClick={() => setDeleteId(tt._id)}
                     className="p-2 bg-gray-50 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors z-10"
                     title="Delete Timetable"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="pl-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CalendarDays className="w-4 h-4 text-gray-400" />
                  <span>{Object.keys(tt.schedule || {}).length} Working Days</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                    {(tt.constraints?.subjects || "").split(',').slice(0, 3).map((sub, i) => (
                      <span key={i} className="text-[10px] bg-gray-100 px-2 py-1 rounded-md text-gray-600 truncate max-w-[80px]">
                        {sub}
                      </span>
                    ))}
                    {(tt.constraints?.subjects || "").split(',').length > 3 && (
                      <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-md text-gray-500">+more</span>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: GENERATOR FORM */}
      {ttView === "generate" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left: Configuration Form */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4" /> Configuration
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Semester / Batch</label>
                  <input 
                    className="w-full mt-1 p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:border-blue-500"
                    placeholder="e.g. B.Tech CS - Sem 5"
                    value={timetableConfig.semester}
                    onChange={(e) => setTimetableConfig({...timetableConfig, semester: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Start Time</label>
                    <input type="time" className="w-full mt-1 p-2 bg-gray-50 border rounded-xl text-sm" value={timetableConfig.startTime} onChange={(e) => setTimetableConfig({...timetableConfig, startTime: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">End Time</label>
                    <input type="time" className="w-full mt-1 p-2 bg-gray-50 border rounded-xl text-sm" value={timetableConfig.endTime} onChange={(e) => setTimetableConfig({...timetableConfig, endTime: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Subjects</label>
                  <textarea 
                    rows={3} 
                    placeholder="Data Structures, Algorithms, OS..."
                    className="w-full mt-1 p-3 bg-gray-50 border rounded-xl text-sm outline-none focus:border-blue-500"
                    value={timetableConfig.subjects}
                    onChange={(e) => setTimetableConfig({...timetableConfig, subjects: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Faculty (Optional)</label>
                  <input 
                    className="w-full mt-1 p-3 bg-gray-50 border rounded-xl text-sm"
                    placeholder="Dr. Smith, Prof. Doe..."
                    value={timetableConfig.faculty}
                    onChange={(e) => setTimetableConfig({...timetableConfig, faculty: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Labs / Constraints</label>
                  <input 
                    className="w-full mt-1 p-3 bg-gray-50 border rounded-xl text-sm"
                    placeholder="Physics Lab (2 hrs), No class Friday..."
                    value={timetableConfig.labs}
                    onChange={(e) => setTimetableConfig({...timetableConfig, labs: e.target.value})}
                  />
                </div>

                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full py-3 rounded-xl text-white font-bold shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity mt-2"
                  style={{ backgroundColor: theme.primary }}
                >
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin"/> : <Cpu className="w-5 h-5" />}
                  Generate Draft
                </button>
              </div>
            </div>
          </div>

          {/* Right: Draft Preview */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Draft Preview</h3>
                {generatedDraft && (
                  <button 
                    onClick={handleSaveDraft}
                    className="px-4 py-2 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 shadow-md flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Save to Database
                  </button>
                )}
              </div>
              
              <div className="p-6 flex-1 overflow-x-auto custom-scrollbar">
                {!generatedDraft ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                    <Cpu className="w-16 h-16 mb-4 text-gray-300" />
                    <p>Enter details on the left and click Generate.</p>
                  </div>
                ) : (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="p-3 text-left text-xs font-bold text-gray-500 uppercase border-b bg-gray-50">Day</th>
                        {generatedDraft[Object.keys(generatedDraft)[0]]?.map((slot, i) => (
                          <th key={i} className="p-3 text-left text-xs font-bold text-gray-500 uppercase border-b bg-gray-50 min-w-[120px]">
                            {slot.time}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(generatedDraft).map(([day, slots]) => (
                        <tr key={day} className="border-b last:border-0">
                          <td className="p-3 font-bold text-gray-700 border-r bg-gray-50">{day}</td>
                          {slots.map((slot, idx) => (
                            <td key={idx} className="p-2 border-r last:border-0">
                              <div className={`p-2 rounded-lg border h-full ${
                                slot.subject.toLowerCase().includes("break") ? "bg-gray-100 border-dashed" : "bg-green-50 border-green-100"
                              }`}>
                                <p className="font-bold text-xs text-gray-800 line-clamp-2">{slot.subject}</p>
                                {slot.faculty && <p className="text-[10px] text-gray-500 mt-1">{slot.faculty}</p>}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Render Edit Modal */}
      {renderTimetableModal()}

      {/* --- CUSTOM DELETE MODAL (Copied & Adapted from DepartmentPage) --- */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4 border border-gray-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Timetable?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this timetable? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setDeleteId(null)} 
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 shadow-lg shadow-red-200 transition flex justify-center items-center"
                >
                  {isDeleting ? <Spinner /> : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- RENAME MODAL --- */}
      {renameId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Rename Timetable</h3>
            <input 
              value={renameText}
              onChange={(e) => setRenameText(e.target.value)}
              className="w-full p-3 border rounded-xl mb-6 text-sm outline-none focus:border-blue-500"
              placeholder="Enter new semester name"
              autoFocus
            />
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setRenameId(null)} 
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleRename}
                disabled={isRenaming}
                className="flex-1 py-2.5 rounded-xl text-white font-semibold shadow-lg transition flex justify-center items-center"
                style={{ backgroundColor: theme.primary }}
              >
                {isRenaming ? <Spinner /> : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TimetableManager;