import React, { useState, useEffect } from "react";
import { Plus, Trash2, Bell, Calendar, Users, Import, BookOpen, ChevronDown, AlertTriangle, Send, Loader2, Table as TableIcon } from "lucide-react";

// --- UPDATED COMPONENT: Timetable Preview Table ---
// Now accepts 'customSchedule' (from the notice content) or falls back to 'timetables' (from API)
const TimetablePreview = ({ timetables, customSchedule, theme }) => {
  // 1. Determine which data source to use
  let displayData = null;

  if (customSchedule && customSchedule.schedule) {
    // Priority: Use the specific JSON found in the notice
    displayData = customSchedule;
  } else if (timetables && timetables.length > 0) {
    // Fallback: Use the first timetable fetched from the server
    displayData = timetables[0];
  }

  if (!displayData || !displayData.schedule) return null;

  const schedule = displayData.schedule;
  const days = Object.keys(schedule);
  const timeSlots = schedule[days[0]] || []; 

  return (
    <div className="mt-4 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm animate-in fade-in">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center gap-2">
        <TableIcon className="w-4 h-4 text-gray-500" />
        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
          {displayData.semester ? `Timetable (${displayData.semester})` : "Timetable Preview"}
        </span>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr>
              <th className="p-2 bg-gray-50/50 border-b border-gray-100 text-left text-[10px] font-extrabold text-gray-400 uppercase tracking-wider w-20">
                Day
              </th>
              {timeSlots.map((slot, i) => (
                <th key={i} className="p-2 bg-gray-50/50 border-b border-gray-100 text-left text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                  {slot.time}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30">
                <td className="p-3 font-bold text-xs text-gray-700 bg-white border-r border-gray-50">
                  {day.slice(0, 3)}
                </td>
                {schedule[day].map((slot, idx) => {
                  const isFree = slot.subject === "Free" || slot.subject === "Free Slot" || slot.subject === "---";
                  const isLunch = slot.subject.toLowerCase().includes("lunch");
                  const isBreak = slot.subject.toLowerCase().includes("break") && !isLunch;

                  return (
                    <td key={idx} className="p-1 border-r border-gray-50 last:border-0 h-16 w-32 min-w-[100px]">
                      <div 
                        className={`h-full w-full p-2 rounded-lg border flex flex-col justify-center gap-1 ${
                          isLunch ? "bg-orange-50 border-orange-100" 
                          : isBreak ? "bg-blue-50 border-blue-100"
                          : isFree ? "bg-gray-50 border-gray-100 border-dashed opacity-50" 
                          : "bg-white border-gray-100"
                        }`}
                        style={!isFree && !isLunch && !isBreak ? { borderLeft: `3px solid ${theme.primary}` } : {}}
                      >
                        {isLunch ? (
                          <span className="text-[10px] font-bold text-orange-400 uppercase text-center">Lunch</span>
                        ) : isBreak ? (
                          <span className="text-[10px] font-bold text-blue-400 uppercase text-center">Break</span>
                        ) : isFree ? (
                          <span className="text-[10px] text-gray-300 text-center">-</span>
                        ) : (
                          <>
                            <p className="font-bold text-[10px] text-gray-800 leading-tight line-clamp-2" title={slot.subject}>
                              {slot.subject}
                            </p>
                            {slot.faculty && slot.faculty !== "---" && (
                              <p className="text-[9px] text-gray-400 truncate">{slot.faculty}</p>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function UniversalNoticePage({ authFetch, theme, role, pushToast }) {
  const isReadOnly = role === 'student';
  const [list, setList] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [filterAudience, setFilterAudience] = useState("All");

  // Form State
  const [form, setForm] = useState({
    title: "", content: "", category: "General", audience: "Global"
  });

  const categories = ["General", "Exam", "Fees", "Event", "Holiday", "Urgent", "Timetable"];

  const load = async () => {
    setLoading(true);
    try {
      const endpoint = role === 'student' ? '/student/notices' : (role === 'faculty' ? '/faculty/notices' : '/institute/notices');
      const safeEndpoint = endpoint;

      const [noticesRes, timetablesRes] = await Promise.all([
        authFetch(safeEndpoint),
        // We still fetch timetables as a fallback
        authFetch(role === 'student' ? '/student/timetable' : "/institute/timetables") 
      ]);

      const noticesData = await noticesRes.json();
      const timetablesData = await timetablesRes.json();

      setList(Array.isArray(noticesData) ? noticesData : []);
      setTimetables(Array.isArray(timetablesData) ? timetablesData : []);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.title || !form.content) return pushToast("Title required", "error");
    setIsAdding(true);
    try {
      const endpoint = role === 'faculty' ? '/faculty/notices/add' : '/institute/notices/add';
      const res = await authFetch(endpoint, {
        method: "POST",
        body: JSON.stringify({ ...form, date: new Date(), type: form.category })
      });
      if (res.ok) {
        pushToast("Notice Posted", "success");
        setShowAdd(false);
        setForm({ title: "", content: "", category: "General", audience: "Global" });
        load();
      }
    } catch (e) { pushToast("Failed", "error"); } 
    finally { setIsAdding(false); }
  };

  const deleteNotice = async () => {
    try {
      await authFetch(`/institute/notices/${deleteId}`, { method: "DELETE" });
      setList(list.filter(l => l._id !== deleteId));
      setDeleteId(null);
      pushToast("Deleted", "success");
    } catch(e) { pushToast("Delete failed", "error"); }
  };

  const getBadgeColor = (type) => {
    if(type === 'Urgent' || type === 'Exam') return 'bg-red-100 text-red-700 border-red-200';
    if(type === 'Timetable') return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="w-full relative min-h-[500px]">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Notices & Circulars</h3>
          <p className="text-gray-500 text-sm">Official updates from the institute</p>
        </div>
        <div className="flex gap-3">
          <select value={filterAudience} onChange={(e) => setFilterAudience(e.target.value)} className="p-2 rounded-xl border text-sm outline-none">
            <option value="All">All Categories</option>
            <option value="Global">Global</option>
            <option value="Student">Student</option>
            <option value="Exam">Exams</option>
            <option value="Timetable">Timetable</option>
          </select>
          {!isReadOnly && (
            <button onClick={() => setShowAdd(true)} className="px-4 py-2 rounded-xl text-white text-sm font-bold flex items-center gap-2 shadow-lg hover:opacity-90 transition-transform active:scale-95" style={{ backgroundColor: theme.primary }}>
              <Plus className="w-4 h-4" /> Post
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? <div className="text-center py-10 text-gray-400">Loading updates...</div> : 
         list.length === 0 ? <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed"><Bell className="w-8 h-8 mx-auto text-gray-300 mb-2"/><p className="text-gray-500 text-sm">No notices found</p></div> :
         list.filter(n => filterAudience === "All" || n.audience === filterAudience || n.type === filterAudience).map((notice) => {
           
           // --- PARSING LOGIC START ---
           // Check if content is the raw JSON string
           const isRawJson = notice.content && notice.content.trim().startsWith('{"meta":"tt_json"');
           let parsedSchedule = null;
           
           if (isRawJson) {
             try {
               parsedSchedule = JSON.parse(notice.content);
             } catch (e) {
               console.error("Failed to parse timetable JSON", e);
             }
           }
           // --- PARSING LOGIC END ---

           return (
             <div key={notice._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative">
               <div className="flex justify-between items-start">
                  <div className="w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${getBadgeColor(notice.type)}`}>{notice.type || "General"}</span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3"/> {new Date(notice.createdAt || notice.date).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-800">{notice.title}</h4>
                    
                    {/* ✅ HIDE RAW STRING: Only show text div if it is NOT the JSON string */}
                    {!isRawJson && (
                      <div className="mt-2 text-sm text-gray-600 whitespace-pre-wrap font-mono bg-gray-50 p-3 rounded-lg border border-gray-100">
                        {notice.content}
                      </div>
                    )}

                    {/* ✅ PREVIEW: Pass parsed schedule OR fall back to global list */}
                    {notice.type === 'Timetable' && (
                      <TimetablePreview 
                         timetables={timetables} 
                         customSchedule={parsedSchedule} // Pass the parsed JSON here
                         theme={theme} 
                      />
                    )}

                    {notice.postedBy && <p className="text-[10px] text-gray-400 mt-2 text-right">- {notice.postedBy}</p>}
                  </div>
                  {!isReadOnly && (
                    <button onClick={() => setDeleteId(notice._id)} className="ml-4 text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
                  )}
               </div>
             </div>
           );
         })
        }
      </div>

      {/* Add Modal (Only for Admin/Faculty) */}
      {showAdd && !isReadOnly && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Post New Notice</h3>
            <div className="space-y-3">
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full p-3 border rounded-xl text-sm" placeholder="Title" />
              <div className="flex gap-2">
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-1/2 p-3 border rounded-xl text-sm bg-white">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={form.audience} onChange={e => setForm({...form, audience: e.target.value})} className="w-1/2 p-3 border rounded-xl text-sm bg-white"><option>Global</option><option>Student</option><option>Faculty</option></select>
              </div>
              <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="w-full p-3 border rounded-xl text-sm h-32 resize-none" placeholder="Details..." />
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button onClick={submit} disabled={isAdding} className="px-4 py-2 text-sm text-white font-bold rounded-lg flex items-center gap-2" style={{ backgroundColor: theme.primary }}>
                  {isAdding ? <Loader2 className="w-3 h-3 animate-spin"/> : <Send className="w-3 h-3"/>} Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-[60] bg-black/20 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-xs text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2"/>
            <h3 className="font-bold">Delete Notice?</h3>
            <div className="flex gap-2 mt-4 justify-center">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg bg-gray-100 text-sm font-bold">Cancel</button>
              <button onClick={deleteNotice} className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-bold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}