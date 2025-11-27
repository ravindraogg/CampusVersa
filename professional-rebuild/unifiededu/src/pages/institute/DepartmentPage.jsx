// DepartmentPage.jsx
import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit, ChevronDown, AlertTriangle } from "lucide-react"; // Added AlertTriangle

export default function DepartmentPage({ authFetch, theme, institute, pushToast }) {
  // --- Data & UI State ---
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false); // Local loading for grid text
  const [isPageLoading, setIsPageLoading] = useState(false); // Full-page glass overlay
  const [showAdd, setShowAdd] = useState(false);

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

  const genreList = ["Engineering", "Science", "Commerce", "Arts", "Management"];
  const sectionList = ["A", "B", "C", "D"];

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

  // --- Load Departments ---
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

const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await authFetch(`/institute/departments/${deleteId}`, { method: "DELETE" });
      
      // FIX: Handle cases where server returns empty body (204) or HTML error
      let data = {};
      try {
        const text = await res.text();
        if (text) data = JSON.parse(text);
      } catch (e) { /* ignore json parse error */ }

      if (res.ok) {
        pushToast({ type: "success", message: "Department removed successfully" });
        load();
        setDeleteId(null);
      } else {
        pushToast({ type: "error", message: data.message || "Delete failed" });
      }
    } catch (err) {
      pushToast({ type: "error", message: "Server connection failed" });
    } finally {
      setIsDeleting(false);
    }
  };

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
              className="px-4 py-3 text-gray-700 hover:bg-black/10 transition cursor-pointer"
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full relative">
      
      {/* --- Full-page glass loader --- */}
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
          <h3 className="text-[22px] font-bold">Departments</h3>
          <p className="text-gray-500">Manage institute departments</p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="px-5 py-3 rounded-xl flex items-center gap-2 font-semibold"
          style={{ background: theme.primary, color: "white" }}
        >
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      </div>

      {/* DEPARTMENT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <div className="p-5 text-gray-500">Loading grid...</div>
        ) : list.length === 0 ? (
          <div className="text-gray-500 p-5">No departments found.</div>
        ) : (
          list.map((d, i) => (
            <div
              key={d._id}
              className="p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] bg-white flex flex-col gap-2 hover:shadow-[0_6px_25px_rgba(0,0,0,0.15)] transition"
            >
              <p className="font-bold text-[18px]">{i + 1}. {d.name}</p>
              <p className="text-gray-600 text-sm">Code: {d.code}</p>
              <p className="text-gray-600 text-sm">Genre: {d.genre || "—"}</p>
              <p className="text-gray-600 text-sm">Section: {d.section || "—"}</p>

              <div className="flex gap-3 mt-2">
                <button
                  className="px-3 py-1 rounded-lg text-xs font-semibold"
                  style={{ background: "#00000015", color: "black" }}
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  className="px-3 py-1 rounded-lg text-xs font-semibold text-white"
                  style={{ background: "#E53935" }}
                  onClick={() => setDeleteId(d._id)} // Changed to open modal
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ADD MODAL */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div
            className="w-full max-w-2xl p-6 rounded-3xl bg-white/90 backdrop-blur-xl"
            style={{ border: "1px solid #00000030" }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[20px] font-bold">Add Department</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-500 text-xl">
                ✕
              </button>
            </div>

            {/* FORM */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* NAME */}
              <div className="relative">
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="peer w-full p-4 rounded-2xl border bg-white/70 backdrop-blur-md outline-none"
                  placeholder=" "
                  style={{ borderColor: `#00000040` }}
                />
                <label
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-700 transition-all peer-focus:top-0 peer-not-placeholder-shown:top-0 peer-focus:text-[12px] peer-not-placeholder-shown:text-[12px]"
                  style={{ color: "black" }}
                >
                  Department Name
                </label>
              </div>

              {/* CODE */}
              <div className="relative">
                <input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="peer w-full p-4 rounded-2xl border bg-white/70 backdrop-blur-md outline-none"
                  placeholder=" "
                  style={{ borderColor: `#00000040` }}
                />
                <label
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-700 transition-all peer-focus:top-0 peer-not-placeholder-shown:top-0 peer-focus:text-[12px] peer-not-placeholder-shown:text-[12px]"
                  style={{ color: "black" }}
                >
                  Department Code
                </label>
              </div>

              {/* GENRE DROPDOWN */}
              <GlassDropdown
                label="Select Genre"
                value={form.genre}
                list={genreList}
                keyName="genre"
              />

              {/* SECTION DROPDOWN */}
              <GlassDropdown
                label="Select Section"
                value={form.section}
                list={sectionList}
                keyName="section"
              />
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 mt-7">
              <button
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 rounded-xl border font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                className="px-5 py-2 rounded-xl font-semibold"
                style={{ background: "black", color: "white" }}
              >
                Add Department
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CUSTOM DELETE MODAL --- */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4 border border-gray-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Department?</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this department? This action cannot be undone.
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