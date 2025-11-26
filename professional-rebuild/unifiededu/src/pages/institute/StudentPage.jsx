import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit, ChevronDown } from "lucide-react";


export default function StudentPage({ authFetch, theme, institute, pushToast }) {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);

  // UI / loading states
  const [loading, setLoading] = useState(false); // small loads
  const [isPageLoading, setIsPageLoading] = useState(false); // full overlay (Option C)
  const [isAdding, setIsAdding] = useState(false);
  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // modals/forms
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null); // for edit popup

  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");

  // add form
const [form, setForm] = useState({
    name: "",
    rollNumber: "", // CHANGED from 'roll' to 'rollNumber'
    department: "",
    section: "",
    year: "",
    email: "",
    phone: "",
    profilePic: null,
    admissionNo: "",
  });
  // dropdown open state (for glass dropdown)
  const [dropdownOpen, setDropdownOpen] = useState({
    year: false,
    section: false,
  });

  // Spinner components
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

  const DarkSpinner = ({ size = 18 }) => (
    <div
      className="rounded-full animate-spin"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        border: `${Math.max(2, Math.round(size / 6))}px solid #9ca3af`,
        borderTopColor: "transparent",
      }}
    />
  );

  // --- load students & departments ---
  const load = async () => {
    setIsPageLoading(true);
    setLoading(true);
    try {
      const [sRes, dRes] = await Promise.all([
        authFetch("/institute/students", { method: "GET" }).then((r) => r.json()),
        authFetch("/institute/departments", { method: "GET" }).then((r) => r.json()),
      ]);
      setStudents(sRes || []);
      setDepartments(dRes || []);
    } catch (err) {
      console.error(err);
      pushToast({ type: "error", title: "Load failed", message: "Could not load students" });
    } finally {
      setLoading(false);
      // small delay so overlay doesn't flicker
      setTimeout(() => setIsPageLoading(false), 180);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // filtered students
  const filtered = students.filter((st) => {
    const txt = `${st.name} ${st.roll} ${st.email} ${st.department}`.toLowerCase();
    return txt.includes(search.toLowerCase()) && (filterDept ? st.department === filterDept : true);
  });

  // custom glass dropdown (apple style)
  const GlassDropdown = ({ label, value, list, keyName }) => (
    <div className="relative w-full">
      <div
        className="flex items-center justify-between p-4 rounded-2xl border bg-white/60 backdrop-blur-md cursor-pointer"
        style={{ borderColor: "#00000040" }}
        onClick={() => setDropdownOpen((p) => ({ ...p, [keyName]: !p[keyName] }))}
      >
        <span className="font-medium text-gray-700">{value || label}</span>
        <ChevronDown className={`w-5 h-5 transition ${dropdownOpen[keyName] ? "rotate-180" : "rotate-0"}`} />
      </div>

      {dropdownOpen[keyName] && (
        <div
          className="absolute left-0 right-0 mt-2 rounded-2xl shadow-xl bg-white/80 backdrop-blur-lg z-20 overflow-hidden"
          style={{ border: "1px solid #00000020" }}
        >
          {list.map((it, idx) => (
            <div
              key={idx}
              onClick={() => {
                setForm((f) => ({ ...f, [keyName]: it }));
                setDropdownOpen((p) => ({ ...p, [keyName]: false }));
              }}
              className="px-4 py-3 text-gray-700 hover:bg-black/10 transition cursor-pointer"
            >
              {it}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // --- Add student submit ---
  const submit = async () => {
    if (!form.name || !form.rollNumber || !form.department) {
      pushToast({ type: "error", title: "Validation", message: "Name, roll and department required" });
      return;
    }
    setIsAdding(true);
    try {
      const payload = { ...form, department: form.department.toUpperCase() };
      const res = await authFetch("/institute/students/add", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        pushToast({ type: "success", title: "Added", message: "Student added" });
        setShowAdd(false);
        setForm({
          name: "",
          rollNumber: "",
          department: "",
          section: "",
          year: "",
          email: "",
          phone: "",
          profilePic: null,
          admissionNo: "",
        });
        await load();
      } else {
        pushToast({ type: "error", title: "Failed", message: data.message || "Add failed" });
      }
    } catch (err) {
      console.error(err);
      pushToast({ type: "error", title: "Server", message: "Could not add student" });
    } finally {
      setIsAdding(false);
    }
  };

  // --- upload handlers ---
  const handlePic = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPic(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((p) => ({ ...p, profilePic: reader.result }));
      setIsUploadingPic(false);
    };
    reader.readAsDataURL(file);
  };

  const handleEditPic = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPic(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelected((old) => ({ ...old, profilePic: reader.result }));
      setIsUploadingPic(false);
    };
    reader.readAsDataURL(file);
  };

  // --- delete student ---
  const deleteStudent = async (id) => {
    if (!window.confirm("Delete this student?")) return;
    setIsPageLoading(true);
    try {
      const res = await authFetch(`/institute/students/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        pushToast({ type: "success", title: "Deleted", message: "Student removed" });
        await load();
      } else {
        pushToast({ type: "error", title: "Failed", message: data.message || "Delete failed" });
      }
    } catch (err) {
      console.error(err);
      pushToast({ type: "error", title: "Server", message: "Delete failed" });
    } finally {
      setTimeout(() => setIsPageLoading(false), 150);
    }
  };

  // --- save edited student ---
  const saveStudentChanges = async (data) => {
    if (!data || !data._id) {
      pushToast({ type: "error", title: "Validation", message: "Invalid student data" });
      return;
    }
    setIsSaving(true);
    try {
      const res = await authFetch(`/institute/students/${data._id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      const out = await res.json();
      if (res.ok) {
        pushToast({ type: "success", title: "Updated", message: "Student updated" });
        setSelected(null);
        await load();
      } else {
        pushToast({ type: "error", title: "Failed", message: out.message || "Update failed" });
      }
    } catch (err) {
      console.error(err);
      pushToast({ type: "error", title: "Server", message: "Could not update" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full relative">

      {/* Full-page glass loader (Option C) */}
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
          <h3 className="text-[22px] font-bold">Students</h3>
          <p className="text-gray-500">Manage student records</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students"
            className="p-3 rounded-xl border w-48"
            style={{ borderColor: "#00000040" }}
          />

          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="p-3 rounded-xl border cursor-pointer"
            style={{ borderColor: "#00000040" }}
          >
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d.DID} value={d.code}>
                {d.code} — {d.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowAdd(true)}
            className="px-5 py-3 rounded-xl flex items-center gap-2 font-semibold disabled:opacity-60"
            style={{ background: theme.primary, color: "black" }}
            disabled={isAdding}
          >
            {isAdding ? <Spinner size={16} color="white" /> : <><Plus className="w-4 h-4" /> Add Student</>}
          </button>
        </div>
      </div>

      {/* STUDENT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <div className="p-6">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-gray-500">No students found.</div>
        ) : (
          filtered.map((s, idx) => (
            <div
              key={s._id || s.SID}
              className="cursor-pointer p-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] bg-white hover:shadow-[0_6px_25px_rgba(0,0,0,0.14)] transition-all flex items-center gap-4"
              onClick={() => setSelected(s)}
            >
              <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                {s.profilePic ? (
                  <img src={s.profilePic} className="w-full h-full object-cover" alt="pf" />
                ) : (
                  <span className="font-bold text-gray-600">
                    {(s.name || "")
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex-1 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-[15px] truncate">{idx + 1}. {s.name}</p>
                  <p className="text-[12px] text-gray-600 truncate">{s.roll} • {s.department} • {s.email}</p>
                </div>

                <div className="flex gap-2 shrink-0 ml-3">
                  <button
                    className="px-3 py-1 rounded-lg text-xs font-semibold"
                    style={{ background: "#00000015", color: "black" }}
                    onClick={(e) => { e.stopPropagation(); setSelected(s); }}
                  >
                    Edit
                  </button>

                  <button
                    className="px-3 py-1 rounded-lg text-xs font-semibold text-white"
                    style={{ background: "#E53935" }}
                    onClick={(e) => { e.stopPropagation(); deleteStudent(s._id); }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ADD STUDENT MODAL */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl p-6 rounded-3xl" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.78))", border: "1px solid #00000030", backdropFilter: "blur(8px)" }}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-[18px] font-bold">Add Student</h3>
                <div className="text-gray-500">Create a new student record</div>
              </div>
              <button onClick={() => setShowAdd(false)} className="text-slate-500">✕</button>
            </div>

            {/* PREMIUM FORM */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">

              {/* NAME */}
              <div className="relative">
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="peer w-full p-4 rounded-2xl border bg-white/70 backdrop-blur-lg transition-all outline-none"
                  style={{ borderColor: `#00000040` }}
                  placeholder=" "
                />
                <label className="absolute left-4 top-1/2 -translate-y-1/2 bg-white px-2 text-gray-700 text-sm transition-all peer-focus:top-0 peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-[12px]" style={{ color: "black" }}>
                  Full Name
                </label>
              </div>

              {/* ROLL */}
              <div className="relative">
                <input
                  value={form.rollNumber}
                  onChange={(e) => setForm({ ...form, roll: e.target.value })}
                  className="peer w-full p-4 rounded-2xl border bg-white/70 backdrop-blur-lg transition-all outline-none"
                  style={{ borderColor: `#00000040` }}
                  placeholder=" "
                />
                <label className="absolute left-4 top-1/2 -translate-y-1/2 bg-white px-2 text-gray-700 text-sm transition-all peer-focus:top-0 peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-[12px]" style={{ color: "black" }}>
                  Roll Number
                </label>
              </div>

              {/* EMAIL */}
              <div className="relative">
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="peer w-full p-4 rounded-2xl border bg-white/70 backdrop-blur-lg transition-all outline-none"
                  placeholder=" "
                  style={{ borderColor: `#00000040` }}
                />
                <label className="absolute left-4 top-1/2 -translate-y-1/2 bg-white px-2 text-gray-700 text-sm transition-all peer-focus:top-0 peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-[12px]" style={{ color: "black" }}>
                  Email
                </label>
              </div>

              {/* PHONE */}
              <div className="relative">
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="peer w-full p-4 rounded-2xl border bg-white/70 backdrop-blur-lg transition-all outline-none"
                  placeholder=" "
                  style={{ borderColor: `#00000040` }}
                />
                <label className="absolute left-4 top-1/2 -translate-y-1/2 bg-white px-2 text-gray-700 text-sm transition-all peer-focus:top-0 peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-[12px]" style={{ color: "black" }}>
                  Phone
                </label>
              </div>

              {/* DEPARTMENT (black-themed select) */}
              <div className="relative">
                <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full p-4 rounded-2xl border bg-white/70 backdrop-blur-lg outline-none cursor-pointer" style={{ borderColor: `#00000040` }}>
                  <option value="">Select department</option>
                  {departments.map((d) => <option key={d.DID} value={d.code}>{d.code} — {d.name}</option>)}
                </select>
                <label className="absolute left-4 -top-2 bg-white px-2 text-[12px] text-gray-700" style={{ color: "black" }}>Department</label>
              </div>

              {/* YEAR (glass dropdown) */}
              <GlassDropdown label="Select Year" value={form.year} list={["1", "2", "3", "4"]} keyName="year" />

              {/* SECTION (glass dropdown) */}
              <GlassDropdown label="Select Section" value={form.section} list={["A", "B", "C", "D"]} keyName="section" />

              {/* ADMISSION NO */}
              <div className="relative">
                <input value={form.admissionNo} onChange={(e) => setForm({ ...form, admissionNo: e.target.value })} className="peer w-full p-4 rounded-2xl border bg-white/70 backdrop-blur-lg transition-all outline-none" placeholder=" " style={{ borderColor: `#00000040` }} />
                <label className="absolute left-4 top-1/2 -translate-y-1/2 bg-white px-2 text-gray-700 text-sm transition-all peer-focus:top-0 peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-[12px]" style={{ color: "black" }}>Admission No.</label>
              </div>

              {/* UPLOAD PROFILE PIC */}
              <label className="col-span-2 w-full flex items-center justify-center p-4 rounded-2xl border bg-white/70 backdrop-blur-lg cursor-pointer text-gray-700 font-medium" style={{ borderColor: `#00000040` }}>
                {isUploadingPic ? <DarkSpinner /> : "Upload Profile Picture"}
                <input type="file" accept="image/*" className="hidden" onChange={handlePic} />
              </label>

            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl border">Cancel</button>
              <button onClick={submit} disabled={isAdding} className="px-4 py-2 rounded-xl flex items-center gap-2 border-[black]"  style={{ background: theme.primary, color: "black" }}>
                {isAdding ? <Spinner size={16} color="white" /> : "Add Student"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT / DETAILS POPUP */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl rounded-3xl p-7 shadow-[0_8px_40px_rgba(0,0,0,0.25)]" style={{ background: "white", border: "1px solid #00000033" }}>
            {/* header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[22px] font-bold">Edit Student — {selected.name}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-600 text-xl hover:text-red-500 transition">✕</button>
            </div>

            {/* profile + meta */}
            <div className="flex items-center gap-6 mb-6">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center shadow-md">
                {selected.profilePic ? (
                  <img src={selected.profilePic} className="w-full h-full object-cover" alt="pf" />
                ) : (
                  <span className="font-bold text-gray-600 text-[20px]">{(selected.name || "").split(" ").map(x => x[0]).slice(0,2).join("").toUpperCase()}</span>
                )}

                <label className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded-lg text-xs cursor-pointer">
                  {isUploadingPic ? "Uploading..." : "Edit"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleEditPic} />
                </label>
              </div>

              <div className="flex-1">
                <p className="text-gray-600 text-sm">Roll: <b>{selected.roll}</b></p>
                <p className="text-gray-600 text-sm">Department: <b>{selected.department}</b></p>
              </div>
            </div>

            {/* edit form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={selected.name} onChange={(e) => setSelected(prev => ({ ...prev, name: e.target.value }))} placeholder="Full Name" className="p-3 rounded-xl border" />
              <input value={selected.roll} onChange={(e) => setSelected(prev => ({ ...prev, roll: e.target.value }))} placeholder="Roll" className="p-3 rounded-xl border" />
              <input value={selected.email} onChange={(e) => setSelected(prev => ({ ...prev, email: e.target.value }))} placeholder="Email" className="p-3 rounded-xl border" />
              <input value={selected.phone} onChange={(e) => setSelected(prev => ({ ...prev, phone: e.target.value }))} placeholder="Phone" className="p-3 rounded-xl border" />
              <input value={selected.section} onChange={(e) => setSelected(prev => ({ ...prev, section: e.target.value }))} placeholder="Section" className="p-3 rounded-xl border" />
              <input value={selected.year} onChange={(e) => setSelected(prev => ({ ...prev, year: e.target.value }))} placeholder="Year" className="p-3 rounded-xl border" />
              <input value={selected.admissionNo} onChange={(e) => setSelected(prev => ({ ...prev, admissionNo: e.target.value }))} placeholder="Admission No." className="p-3 rounded-xl border" />
              <select value={selected.department} onChange={(e) => setSelected(prev => ({ ...prev, department: e.target.value }))} className="p-3 rounded-xl border">
                <option value="">Select dept</option>
                {departments.map(d => <option key={d.DID} value={d.code}>{d.code} — {d.name}</option>)}
              </select>
            </div>

            {/* actions */}
            <div className="flex justify-end gap-3 mt-7">
              <button onClick={() => setSelected(null)} className="px-5 py-2 rounded-xl border font-semibold">Cancel</button>
              <button onClick={() => saveStudentChanges(selected)} disabled={isSaving} className="px-6 py-2 rounded-xl font-semibold flex items-center gap-2" style={{ background: "black", color: "white" }}>
                {isSaving ? <Spinner size={16} color="white" /> : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
