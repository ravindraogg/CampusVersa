// DepartmentPage.jsx
import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit, ChevronDown } from "lucide-react";

export default function DepartmentPage({ authFetch, theme, institute, pushToast }) {
  // --- Data & UI State ---
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false); // Local loading for grid text
  const [isPageLoading, setIsPageLoading] = useState(false); // Full-page glass overlay (New)
  const [showAdd, setShowAdd] = useState(false);

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

  // --- Helper Component: Spinner (Copied from FacultyPage) ---
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

  // --- Load Departments with Overlay ---
  const load = async () => {
    setIsPageLoading(true); // Start overlay
    setLoading(true);
    try {
      const res = await authFetch("/institute/departments", { method: "GET" });
      const data = await res.json();
      setList(data || []);
    } catch (err) {
      pushToast({ type: "error", title: "Load Failed", message: "Could not load departments" });
    } finally {
      setLoading(false);
      // Slight delay to prevent flicker, matching FacultyPage style
      setTimeout(() => setIsPageLoading(false), 200); 
    }
  };

  const submit = async () => {
    if (!form.name || !form.code) {
      pushToast({ type: "error", title: "Validation", message: "Name & code required" });
      return;
    }

    // Optional: You could use isPageLoading here too, but usually Submit buttons have their own spinners.
    // We'll keep it simple for now or you can add setIsPageLoading(true) here if you want to block screen on add.
    try {
      const res = await authFetch("/institute/departments/add", {
        method: "POST",
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        pushToast({ type: "success", title: "Added", message: "Department added" });
        setShowAdd(false);
        setForm({ name: "", code: "", genre: "", section: "" });
        load(); // Reloads list (triggers overlay)
      } else {
        pushToast({ type: "error", title: "Failed", message: data.message || "Add failed" });
      }
    } catch (err) {
      pushToast({ type: "error", title: "Server", message: "Could not add" });
    }
  };

  // --- Delete Department with Overlay ---
  const deleteDept = async (id) => {
    if (!window.confirm("Delete this department?")) return;
    
    setIsPageLoading(true); // Start overlay
    try {
      const res = await authFetch(`/institute/departments/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        pushToast({ type: "success", title: "Deleted", message: "Department removed" });
        load(); // Reloads list
      } else {
        pushToast({ type: "error", title: "Failed", message: data.message });
        setIsPageLoading(false); // Stop overlay if load() isn't called
      }
    } catch (err) {
      pushToast({ type: "error", title: "Server", message: "Delete failed" });
      setIsPageLoading(false); // Stop overlay on error
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
      
      {/* --- Full-page glass loader (New) --- */}
      {isPageLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
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
          style={{ background: theme.primary, color: theme.textOnPrimary }}
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
                  onClick={() => deleteDept(d._id)}
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
    </div>
  );
}