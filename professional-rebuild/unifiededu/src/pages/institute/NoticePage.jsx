import React, { useState, useEffect } from "react";
import { Plus, Trash2, Bell, Calendar, Users, FileText, ChevronDown, AlertTriangle } from "lucide-react";

export default function NoticePage({ authFetch, theme, institute, pushToast }) {
  // Data State
  const [list, setList] = useState([]);
  
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
    category: "General", // Exam, Fees, Event, General
    audience: "Global",  // Global, Student, Faculty
  });

  // Dropdown States for Custom UI
  const [dropdownOpen, setDropdownOpen] = useState({
    category: false,
    audience: false
  });

  // Constants
  const categories = ["General", "Exam", "Fees", "Event", "Holiday", "Urgent"];
  const audiences = ["Global", "Student", "Faculty"];

  // --- Helper Components ---
  const Spinner = ({ size = 6, color = "white" }) => (
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

  const GlassDropdown = ({ label, value, list, keyName }) => (
    <div className="relative w-full">
      <div
        className="flex items-center justify-between p-4 rounded-2xl border bg-white/60 backdrop-blur-md cursor-pointer"
        style={{ borderColor: "#00000040" }}
        onClick={() =>
          setDropdownOpen((prev) => ({ ...prev, [keyName]: !prev[keyName] }))
        }
      >
        <span className="font-medium text-gray-700">{value || label}</span>
        <ChevronDown
          className={`w-5 h-5 transition ${
            dropdownOpen[keyName] ? "rotate-180" : "rotate-0"
          }`}
        />
      </div>

      {dropdownOpen[keyName] && (
        <div
          className="absolute left-0 right-0 mt-2 rounded-2xl shadow-xl bg-white/80 backdrop-blur-lg z-20 overflow-hidden"
          style={{ border: "1px solid #00000020" }}
        >
          {list.map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                setForm((f) => ({ ...f, [keyName]: item }));
                setDropdownOpen((prev) => ({ ...prev, [keyName]: false }));
              }}
              className="px-4 py-3 text-gray-700 hover:bg-black/10 transition cursor-pointer flex items-center gap-2"
            >
              {item}
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
      const res = await authFetch("/institute/notices", { method: "GET" });
      const data = await res.json();
      setList(data || []);
    } catch (err) {
      console.error(err);
      pushToast({ type: "error", message: "Load Failed: Could not load notices" });
    } finally {
      setLoading(false);
      setTimeout(() => setIsPageLoading(false), 200);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Submit Notice ---
  const submit = async () => {
    if (!form.title || !form.content) {
      pushToast({ type: "error", message: "Validation: Title and content required" });
      return;
    }

    setIsAdding(true);
    try {
      const payload = {
        ...form,
        date: new Date().toISOString(),
        type: form.category // Mapping category to type for backend compatibility
      };

      const res = await authFetch("/institute/notices/add", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        pushToast({ type: "success", message: "Notice published successfully" });
        setShowAdd(false);
        setForm({ title: "", content: "", category: "General", audience: "Global" });
        await load();
      } else {
        pushToast({ type: "error", message: data.message || "Post failed" });
      }
    } catch (err) {
      pushToast({ type: "error", message: "Server error: Could not publish notice" });
    } finally {
      setIsAdding(false);
    }
  };

  // --- Delete Notice ---
  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      // Backend route might differ, adjust if needed. Assuming standard pattern.
      // If server doesn't have explicit DELETE for notices, you might need to add it.
      // Using /notices/:id as a placeholder standard
      const res = await authFetch(`/institute/notices/${deleteId}`, { method: "DELETE" });
      
      let data = {};
      try { const text = await res.text(); if(text) data = JSON.parse(text); } catch(e){}

      if (res.ok) {
        pushToast({ type: "success", message: "Notice removed successfully" });
        await load();
        setDeleteId(null);
      } else {
        // Fallback for demo if backend route missing
        pushToast({ type: "error", message: "Delete feature requires backend update" });
        setDeleteId(null);
      }
    } catch (err) {
      pushToast({ type: "error", message: "Server error: Delete failed" });
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Filtering ---
  const filteredList = list.filter(n => 
    filterAudience === "All" ? true : (n.audience || "Global") === filterAudience
  );

  // --- Badge Colors ---
  const getCategoryColor = (cat) => {
    switch(cat) {
      case 'Exam': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Fees': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Urgent': return 'bg-red-100 text-red-700 border-red-200';
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
      
      {/* Full-page glass loader */}
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
          <p className="text-gray-500">Manage announcements for students and faculty</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Audience Filter */}
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
              className="group relative bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border uppercase tracking-wide ${getCategoryColor(notice.type || notice.category)}`}>
                      {notice.type || notice.category || "General"}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 ${getAudienceColor(notice.audience)}`}>
                      <Users className="w-3 h-3" />
                      {notice.audience || "Global"}
                    </span>
                    <span className="text-gray-400 text-xs flex items-center gap-1 ml-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(notice.date || notice.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-800 mb-1">{notice.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{notice.content}</p>
                </div>

                <button
                  onClick={() => setDeleteId(notice._id || notice.id)}
                  className="p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
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
            className="w-full max-w-lg p-6 rounded-3xl shadow-2xl relative"
            style={{ 
              background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.95))", 
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.4)"
            }}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Post New Notice</h3>
                <p className="text-sm text-gray-500">Announce exams, fees, or general news</p>
              </div>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition">✕</button>
            </div>

            {/* Modal Form */}
            <div className="space-y-4">
              
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

              {/* Category & Audience Row */}
              <div className="flex gap-3">
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

              {/* Content Textarea */}
              <div className="relative">
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="peer w-full p-4 rounded-2xl border bg-white/50 focus:bg-white transition-all outline-none min-h-[120px] resize-none"
                  style={{ borderColor: "#00000020" }}
                  placeholder=" "
                />
                <label className="absolute left-4 top-4 text-gray-500 text-sm transition-all peer-focus:text-black peer-focus:font-medium">
                  Detailed Content / Message
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