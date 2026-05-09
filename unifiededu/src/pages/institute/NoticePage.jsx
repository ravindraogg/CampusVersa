import React, { useState, useEffect } from "react";
import { Plus, Trash2, Bell, Calendar, Users, FileText, ChevronDown, AlertTriangle, Import, BookOpen } from "lucide-react";
const API_URL = import.meta.env.VITE_BACK_URI;
export default function NoticePage({ authFetch, theme, institute, pushToast }) {
  // Data State
  const [list, setList] = useState([]);
  const [timetables, setTimetables] = useState([]); // Store fetched timetables
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false); // Full overlay
  const [showAdd, setShowAdd] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  // Delete Modal State
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter State
  const [filterAudience, setFilterAudience] = useState("All");

  // Form State
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "General",
    audience: "Global",
    targetDept: "",
    targetYear: "" 
  });

  // Dropdown States
  const [dropdownOpen, setDropdownOpen] = useState({
    category: false,
    audience: false,
    timetable: false
  });

  // Constants
  const categories = ["General", "Exam", "Fees", "Event", "Holiday", "Urgent", "Timetable"];
  const audiences = ["Global", "Student", "Faculty"];

  // --- Helper Components ---
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

  const GlassDropdown = ({ label, value, list, keyName, onSelect }) => (
    <div className="relative w-full">
      <div
        className="flex items-center justify-between p-4 rounded-2xl border bg-white/60 backdrop-blur-md cursor-pointer hover:bg-white/80 transition"
        style={{ borderColor: "#00000020" }}
        onClick={() =>
          setDropdownOpen((prev) => ({ ...prev, [keyName]: !prev[keyName] }))
        }
      >
        <span className="font-medium text-gray-700 truncate">{value || label}</span>
        <ChevronDown
          className={`w-5 h-5 transition ${
            dropdownOpen[keyName] ? "rotate-180" : "rotate-0"
          }`}
        />
      </div>

      {dropdownOpen[keyName] && (
        <div
          className="absolute left-0 right-0 mt-2 rounded-2xl shadow-xl bg-white/95 backdrop-blur-lg z-20 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar"
          style={{ border: "1px solid #00000010" }}
        >
          {list.map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                if(onSelect) {
                    onSelect(item);
                } else {
                    setForm((f) => ({ ...f, [keyName]: item }));
                }
                setDropdownOpen((prev) => ({ ...prev, [keyName]: false }));
              }}
              className="px-4 py-3 text-gray-700 hover:bg-gray-100 transition cursor-pointer flex items-center gap-2 border-b last:border-0 border-gray-50"
            >
              {typeof item === 'object' ? item.label : item}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // --- Load Data ---
  const load = async () => {
    setIsPageLoading(true);
    setLoading(true);
    try {
      const [noticesRes, timetablesRes] = await Promise.all([
        authFetch("/institute/notices", { method: "GET" }),
        authFetch("/institute/timetables", { method: "GET" })
      ]);

      const noticesData = await noticesRes.json();
      const timetablesData = await timetablesRes.json();

      setList(Array.isArray(noticesData) ? noticesData : []);
      setTimetables(Array.isArray(timetablesData) ? timetablesData : []);

    } catch (err) {
      console.error(err);
      pushToast({ type: "error", message: "Failed to load data" });
    } finally {
      setLoading(false);
      setTimeout(() => setIsPageLoading(false), 200);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // --- Logic: Import Timetable ---
  const handleTimetableImport = (tt) => {
    // We store the RAW JSON structure as a string so we can parse it back into a table
    const payload = {
        meta: "tt_json",
        semester: tt.semester,
        schedule: tt.schedule
    };

    setForm(prev => ({
        ...prev,
        title: `Timetable: ${tt.semester}`,
        content: JSON.stringify(payload), // Store as stringified JSON
        category: "Timetable",
        audience: "Student"
    }));
  };

  // --- Render Timetable in Card ---
  const renderContent = (notice) => {
    // 1. Try to parse if it's a Timetable
    if (notice.type === "Timetable" || notice.category === "Timetable") {
      try {
        const parsed = JSON.parse(notice.content);
        if (parsed.meta === "tt_json" && parsed.schedule) {
          const days = Object.keys(parsed.schedule);
          return (
            <div className="mt-3 border rounded-xl overflow-hidden bg-white shadow-sm">
               <div className="bg-gray-50 p-3 font-bold text-gray-700 border-b flex justify-between items-center">
                 <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-indigo-500"/> Semester: {parsed.semester}</span>
               </div>
               <div className="overflow-x-auto custom-scrollbar">
                 <table className="w-full text-left border-collapse min-w-[600px]">
                   <thead>
                     <tr>
                       <th className="p-3 border-b border-r bg-gray-50 w-24 font-bold text-xs text-gray-500 uppercase sticky left-0 z-10">Day</th>
                       {parsed.schedule[days[0]]?.map((slot, i) => (
                         <th key={i} className="p-3 border-b bg-gray-50 font-bold text-xs text-gray-500 uppercase whitespace-nowrap min-w-[140px]">
                           {slot.time}
                         </th>
                       ))}
                     </tr>
                   </thead>
                   <tbody>
                     {days.map(day => (
                       <tr key={day} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                         <td className="p-3 border-r font-bold text-sm text-gray-700 bg-gray-50 sticky left-0 z-10">{day}</td>
                         {parsed.schedule[day].map((slot, idx) => (
                           <td key={idx} className="p-2 border-r bg-white">
                             <div className={`p-2 rounded-lg border h-full flex flex-col justify-between ${
                               slot.subject.toLowerCase().includes("break") || slot.subject.toLowerCase().includes("lunch")
                                ? "bg-gray-100 border-dashed border-gray-300 opacity-70" 
                                : slot.subject.toLowerCase().includes("lab")
                                ? "bg-purple-50 border-purple-100"
                                : "bg-green-50 border-green-100"
                             }`}>
                               <p className="font-bold text-xs text-gray-800 line-clamp-2">{slot.subject}</p>
                               {slot.faculty && (
                                 <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                                   <Users className="w-3 h-3"/> {slot.faculty}
                                 </p>
                               )}
                               {slot.room && (
                                 <span className="text-[9px] bg-white border px-1 rounded self-start mt-1">
                                   {slot.room}
                                 </span>
                               )}
                             </div>
                           </td>
                         ))}
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          );
        }
      } catch (e) {
        // Fallback if parsing fails (legacy text data)
        return <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap font-mono text-[13px] mt-2">{notice.content}</p>;
      }
    }
    // 2. Default Text Content
    return <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap font-mono text-[13px] mt-2">{notice.content}</p>;
  };

  // --- Submit Notice ---
  const submit = async () => {
    if (!form.title || !form.content) {
      pushToast({ type: "error", message: "Title and content required" });
      return;
    }

    setIsAdding(true);
    try {
      const payload = {
        ...form,
        date: new Date().toISOString(),
        type: form.category // Ensures category matches 'type' in DB
      };

      const res = await authFetch("/institute/notices/add", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        pushToast({ type: "success", message: "Notice published!" });
        setShowAdd(false);
        setForm({ title: "", content: "", category: "General", audience: "Global", targetDept: "", targetYear: "" });
        load(); 
      } else {
        pushToast({ type: "error", message: data.message || "Post failed" });
      }
    } catch (err) {
      pushToast({ type: "error", message: "Server error" });
    } finally {
      setIsAdding(false);
    }
  };

  // --- Delete Notice ---
  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await authFetch(`/institute/notices/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        pushToast({ type: "success", message: "Notice removed" });
        load();
        setDeleteId(null);
      } else {
        pushToast({ type: "error", message: "Delete failed" });
      }
    } catch (err) {
      pushToast({ type: "error", message: "Server error" });
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Filtering ---
  const filteredList = list.filter(n => 
    filterAudience === "All" ? true : (n.audience || "Global") === filterAudience
  );

  // --- Badge Styling ---
  const getCategoryColor = (cat) => {
    switch(cat) {
      case 'Exam': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Fees': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'Timetable': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getAudienceColor = (aud) => {
    switch(aud) {
      case 'Student': return 'bg-blue-50 text-blue-600';
      case 'Faculty': return 'bg-orange-50 text-orange-600';
      default: return 'bg-green-50 text-green-600';
    }
  };

  return (
    <div className="w-full relative">
      
      {/* Loading Overlay */}
      {isPageLoading && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
          <div className="rounded-2xl p-6 bg-white/90 backdrop-blur-md flex flex-col items-center gap-4">
            <Spinner size={28} color={theme.primary || "#111"} />
            <div style={{ color: "#374151" }}>Updating Notices…</div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-[22px] font-bold text-gray-800">Notices & Alerts</h3>
          <p className="text-gray-500">Manage announcements and timetables</p>
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={filterAudience} 
            onChange={(e) => setFilterAudience(e.target.value)}
            className="p-3 rounded-xl border border-gray-200 bg-white cursor-pointer outline-none focus:border-black/30"
          >
            <option value="All">All Audiences</option>
            <option value="Global">Global</option>
            <option value="Student">Students Only</option>
            <option value="Faculty">Faculty Only</option>
          </select>

          <button
            onClick={() => setShowAdd(true)}
            className="px-5 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg shadow-blue-500/20 transition-transform active:scale-95"
            style={{ background: theme.primary, color: "white" }}
          >
            <Plus className="w-4 h-4" />
            Post Notice
          </button>
        </div>
      </div>

      {/* NOTICE GRID */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading notices...</div>
        ) : filteredList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <Bell className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No notices published yet</p>
          </div>
        ) : (
          filteredList.map((notice) => (
            <div
              key={notice._id || notice.id}
              className="group relative bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all overflow-hidden"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 w-full min-w-0">
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border uppercase tracking-wide ${getCategoryColor(notice.type || notice.category)}`}>
                      {notice.type || notice.category || "General"}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 ${getAudienceColor(notice.audience)}`}>
                      <Users className="w-3 h-3" />
                      {notice.audience || "Global"}
                    </span>
                    {/* Specific Targeting Badge */}
                    {(notice.targetDept || notice.targetYear) && (
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                            {notice.targetDept} {notice.targetYear ? `(Yr ${notice.targetYear})` : ''}
                        </span>
                    )}
                    <span className="text-gray-400 text-xs flex items-center gap-1 ml-auto md:ml-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(notice.date || notice.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-800 mb-1 truncate">{notice.title}</h3>
                  
                  {/* DYNAMIC CONTENT RENDERER */}
                  {renderContent(notice)}

                </div>

                <button
                  onClick={() => setDeleteId(notice._id || notice.id)}
                  className="p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 ml-4 self-start"
                  title="Delete Notice"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- ADD MODAL --- */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg p-6 rounded-3xl shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
            style={{ 
              background: "linear-gradient(180deg, rgba(255,255,255,0.99), rgba(255,255,255,0.95))", 
              backdropFilter: "blur(20px)"
            }}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Post New Notice</h3>
                <p className="text-sm text-gray-500">Announce exams, fees, or share timetables</p>
              </div>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition">✕</button>
            </div>

            {/* Modal Form */}
            <div className="space-y-4">
              
              {/* TIMETABLE IMPORT */}
              <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 mb-4">
                 <label className="text-xs font-bold text-indigo-500 uppercase flex items-center gap-2 mb-2">
                    <Import className="w-3 h-3"/> Import from Timetables (Optional)
                 </label>
                 <GlassDropdown 
                    label="Select a Timetable to Attach..." 
                    value="" 
                    list={[
                        { label: "None / Clear Selection", value: null }, // Allow clearing
                        ...timetables.map(t => ({ label: `${t.semester} (Created: ${new Date(t.createdAt).toLocaleDateString()})`, ...t }))
                    ]}
                    keyName="timetable"
                    onSelect={(val) => {
                        if (!val || val.value === null) {
                            // Clear selection
                            setForm(prev => ({ ...prev, content: "", category: "General" }));
                        } else {
                            handleTimetableImport(val);
                        }
                    }}
                 />
              </div>

              {/* Title Input */}
              <div className="relative">
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="peer w-full p-4 rounded-2xl border bg-white/50 focus:bg-white transition-all outline-none"
                  style={{ borderColor: "#00000020" }}
                  placeholder=" "
                />
                <label className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm transition-all peer-focus:top-3 peer-focus:text-[10px] peer-focus:font-bold peer-not-placeholder-shown:top-3 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:font-bold">
                  Notice Title
                </label>
              </div>

              {/* Category & Audience */}
              <div className="grid grid-cols-2 gap-3">
                <GlassDropdown 
                  label="Category" 
                  value={form.category} 
                  list={categories} 
                  keyName="category" 
                />
                <GlassDropdown 
                  label="Audience" 
                  value={form.audience} 
                  list={audiences} 
                  keyName="audience" 
                />
              </div>

              {/* Granular Targeting */}
              {(form.audience === "Student" || form.audience === "Faculty") && (
                  <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 fade-in">
                    <div className="relative">
                        <input
                        value={form.targetDept}
                        onChange={(e) => setForm({ ...form, targetDept: e.target.value })}
                        className="w-full p-3 rounded-xl border bg-white/50 focus:bg-white outline-none text-sm"
                        placeholder="Dept (e.g. CSE)"
                        />
                    </div>
                    <div className="relative">
                        <input
                        value={form.targetYear}
                        onChange={(e) => setForm({ ...form, targetYear: e.target.value })}
                        className="w-full p-3 rounded-xl border bg-white/50 focus:bg-white outline-none text-sm"
                        placeholder="Year (e.g. 1, 2)"
                        />
                    </div>
                  </div>
              )}

              {/* Content Textarea */}
              <div className="relative">
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="peer w-full p-4 rounded-2xl border bg-white/50 focus:bg-white transition-all outline-none min-h-[150px] resize-none font-mono text-sm"
                  style={{ borderColor: "#00000020" }}
                  placeholder=" "
                />
                <label className="absolute left-4 top-4 text-gray-500 text-sm transition-all peer-focus:text-black peer-focus:font-medium">
                  Content (Auto-filled if timetable selected)
                </label>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 mt-8">
              <button 
                onClick={() => setShowAdd(false)} 
                className="px-5 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button 
                onClick={submit} 
                disabled={isAdding} 
                className="px-6 py-2.5 rounded-xl flex items-center gap-2 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-95" 
                style={{ background: theme.primary }}
              >
                {isAdding ? <Spinner size={18} /> : "Publish Notice"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE MODAL --- */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4 border border-gray-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Notice?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to remove this notice? It will disappear from all student/faculty dashboards.
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
                  {isDeleting ? <Spinner size={16} /> : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}