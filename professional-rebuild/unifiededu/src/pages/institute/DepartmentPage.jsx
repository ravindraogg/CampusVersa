// DepartmentPage.jsx
import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit, ChevronDown, AlertTriangle, Save } from "lucide-react";
const API_URL = import.meta.env.VITE_BACK_URI;
export default function DepartmentPage({ authFetch, theme, institute, pushToast }) {
  // --- Data & UI State ---
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  // Edit State (NEW)
  const [selected, setSelected] = useState(null); 
  const [isSaving, setIsSaving] = useState(false);

  // Delete Modal State
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    code: "",
    genre: "",
    section: "",
  });

  const [dropdownOpen, setDropdownOpen] = useState({
    genre: false,
    section: false,
  });

  const genreList = ["Engineering", "Science", "Commerce", "Arts", "Management", "Humanities", "Medical", "Law"];
  const sectionList = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

  // --- Helper Component: Spinner ---
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

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async () => {
    setIsPageLoading(true);
    setLoading(true);
    try {
      const res = await authFetch("/institute/departments", { method: "GET" });
      const data = await res.json();
      setList(data || []);
    } catch (err) {
      pushToast({ type: "error", message: "Load Failed: Could not load departments" });
    } finally {
      setLoading(false);
      setTimeout(() => setIsPageLoading(false), 200); 
    }
  };

  const submit = async () => {
    if (!form.name || !form.code) {
      pushToast({ type: "error", message: "Validation: Name & code required" });
      return;
    }
    try {
      const res = await authFetch("/institute/departments/add", {
        method: "POST",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        pushToast({ type: "success", message: "Department added successfully" });
        setShowAdd(false);
        setForm({ name: "", code: "", genre: "", section: "" });
        load();
      } else {
        pushToast({ type: "error", message: data.message || "Add failed" });
      }
    } catch (err) {
      pushToast({ type: "error", message: "Server error: Could not add" });
    }
  };

  // --- NEW: Save Edited Department ---
  const saveChanges = async () => {
    if (!selected || !selected._id) return;
    setIsSaving(true);
    try {
      const res = await authFetch(`/institute/departments/${selected._id}`, {
        method: "PUT",
        body: JSON.stringify(selected),
      });
      const data = await res.json();
      if (res.ok) {
        pushToast({ type: "success", message: "Department updated successfully" });
        setSelected(null);
        load();
      } else {
        pushToast({ type: "error", message: data.message || "Update failed" });
      }
    } catch (err) {
      pushToast({ type: "error", message: "Server error: Could not update" });
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await authFetch(`/institute/departments/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        pushToast({ type: "success", message: "Department removed successfully" });
        load();
        setDeleteId(null);
      } else {
        pushToast({ type: "error", message: "Delete failed" });
      }
    } catch (err) {
      pushToast({ type: "error", message: "Server connection failed" });
    } finally {
      setIsDeleting(false);
    }
  };

  // Generic Dropdown
  const GlassDropdown = ({ label, value, list, keyName }) => (
    <div className="relative w-full">
      <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">
        {label}
      </label>
      <div
        className="flex items-center justify-between p-3 rounded-xl border bg-white/60 backdrop-blur-md cursor-pointer hover:bg-white/80 transition-colors"
        style={{ borderColor: "#00000020" }}
        onClick={() =>
          setDropdownOpen((prev) => ({ ...prev, [keyName]: !prev[keyName] }))
        }
      >
        <span className={`font-medium ${value ? 'text-gray-900' : 'text-gray-400'}`}>
          {value || "Select..."}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform ${
            dropdownOpen[keyName] ? "rotate-180" : "rotate-0"
          }`}
        />
      </div>

      {dropdownOpen[keyName] && (
        <div
          className="absolute left-0 right-0 mt-2 max-h-48 overflow-y-auto rounded-xl shadow-xl bg-white z-20 border border-gray-100"
        >
          {list.map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                setForm((f) => ({ ...f, [keyName]: item }));
                setDropdownOpen((prev) => ({ ...prev, [keyName]: false }));
              }}
              className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition cursor-pointer"
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full relative pb-10">
      {isPageLoading && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
          <div className="rounded-2xl p-6 bg-white/90 backdrop-blur-md flex flex-col items-center gap-4">
            <Spinner size={28} color={theme.primary || "#111"} />
            <div style={{ color: "#374151" }}>Working…</div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-[22px] font-bold text-gray-900">Departments</h3>
          <p className="text-gray-500 text-sm">Manage institute departments</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-5 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-md transition-transform hover:scale-105 active:scale-95"
          style={{ background: theme.primary, color: "white" }}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Department</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* DEPARTMENT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-400">Loading departments...</div>
        ) : list.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-2xl">
            No departments found. Click "Add Department" to start.
          </div>
        ) : (
          list.map((d, i) => (
            <div key={d._id} className="p-5 rounded-2xl border border-gray-100 bg-white flex flex-col gap-3 hover:shadow-lg transition-all duration-300 group">
              <div className="flex justify-between items-start">
                <div>
                   <p className="font-bold text-lg text-gray-900 leading-tight mb-1">{d.name}</p>
                   <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 uppercase tracking-wider">{d.code}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 font-bold text-xs">{i + 1}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                 <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Genre</p>
                    <p className="text-sm font-medium text-gray-700 truncate">{d.genre || "—"}</p>
                 </div>
                 <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Section</p>
                    <p className="text-sm font-medium text-gray-700 truncate">{d.section || "—"}</p>
                 </div>
              </div>

              <div className="flex gap-2 mt-2 pt-3 border-t border-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* EDIT BUTTON - NOW WORKS */}
                <button
                  className="flex-1 py-2 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors flex justify-center items-center gap-2"
                  onClick={() => setSelected(d)} 
                >
                  <Edit className="w-3 h-3" /> Edit
                </button>

                <button
                  className="flex-1 py-2 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 transition-colors flex justify-center items-center gap-2"
                  onClick={() => setDeleteId(d._id)}
                >
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- ADD MODAL (Unchanged logic, just keeping structure) --- */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-white shadow-2xl scale-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add Department</h3>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">✕</button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Department Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 outline-none transition-all" placeholder="e.g. Computer Science" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Department Code</label>
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 outline-none transition-all" placeholder="e.g. CSE" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <GlassDropdown label="Genre" value={form.genre} list={genreList} keyName="genre" />
                <GlassDropdown label="Section" value={form.section} list={sectionList} keyName="section" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
              <button onClick={() => setShowAdd(false)} className="px-5 py-2.5 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={submit} className="px-6 py-2.5 rounded-xl font-semibold shadow-lg transition-all active:scale-95" style={{ background: theme.primary || "black", color: "white" }}>Add Department</button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL (NEW) --- */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-white shadow-2xl scale-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit Department</h3>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">✕</button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Department Name</label>
                <input value={selected.name} onChange={(e) => setSelected({ ...selected, name: e.target.value })} className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Department Code</label>
                <input value={selected.code} onChange={(e) => setSelected({ ...selected, code: e.target.value })} className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 {/* Reusing existing list arrays with simple selects for stability */}
                 <div className="relative w-full">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Genre</label>
                    <select value={selected.genre} onChange={e => setSelected({...selected, genre: e.target.value})} className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 outline-none cursor-pointer">
                       <option value="">Select...</option>
                       {genreList.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                 </div>
                 <div className="relative w-full">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Section</label>
                    <select value={selected.section} onChange={e => setSelected({...selected, section: e.target.value})} className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 outline-none cursor-pointer">
                       <option value="">Select...</option>
                       {sectionList.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                 </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
              <button onClick={() => setSelected(null)} className="px-5 py-2.5 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={saveChanges} disabled={isSaving} className="px-6 py-2.5 rounded-xl font-semibold shadow-lg transition-all active:scale-95 flex items-center gap-2" style={{ background: theme.primary || "black", color: "white" }}>
                {isSaving ? <Spinner size={16} /> : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL (Unchanged) */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4 border border-gray-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4"><AlertTriangle className="w-6 h-6 text-red-600" /></div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Department?</h3>
              <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this department? This action cannot be undone.</p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition">Cancel</button>
                <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 shadow-lg shadow-red-200 transition flex justify-center items-center">
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