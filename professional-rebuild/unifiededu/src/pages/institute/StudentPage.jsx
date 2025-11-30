// StudentPage.jsx
import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit, ChevronDown, AlertTriangle } from "lucide-react";

export default function StudentPage({ authFetch, theme, institute, pushToast }) {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);

  // UI / loading states
  const [loading, setLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Delete Modal State
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // modals/forms
  const [showAdd, setShowAdd] = useState(false);

  // `selected` always uses canonical keys that match the Student model
  const [selected, setSelected] = useState(null);

  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");

  // add form
  const [form, setForm] = useState({
    name: "",
    rollNumber: "",
    department: "",
    section: "",
    year: "",
    semester: "",
    email: "",
    phone: "",
    profilePic: null,
    admissionNo: "",
  });

  // dropdown open state
  const [dropdownOpen, setDropdownOpen] = useState({
    year: false,
    section: false,
    semester: false,
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
        authFetch("/institute/students?limit=1000", { method: "GET" }).then((r) => r.json()),
        authFetch("/institute/departments", { method: "GET" }).then((r) => r.json()),
      ]);

      // API returns { data: [...], total, hasMore } — normalize to array
      const studentsList = Array.isArray(sRes) ? sRes : sRes?.data ? sRes.data : [];
      setStudents(studentsList || []);
      setDepartments(Array.isArray(dRes) ? dRes : []);
    } catch (err) {
      console.error(err);
      pushToast({ type: "error", message: "Load failed: Could not load students" });
    } finally {
      setLoading(false);
      setTimeout(() => setIsPageLoading(false), 180);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // filtered students (use canonical rollNumber)
  const filtered = students.filter((st) => {
    const txt = `${st.name || ""} ${st.rollNumber || ""} ${st.email || ""} ${st.department || ""}`.toLowerCase();
    return txt.includes(search.toLowerCase()) && (filterDept ? (st.department === filterDept) : true);
  });

  // ensure we open selected with canonical keys
  const openEdit = (s) => {
    setSelected({
      ...s,
      // normalize legacy keys
      rollNumber: s.rollNumber ?? s.roll ?? "",
      semester: s.semester ?? s.sem ?? "",
      year: s.year ?? "",
      admissionNo: s.admissionNo ?? s.admissionNo ?? "",
      profilePic: s.profilePic ?? null,
      email: s.email ?? "",
      phone: s.phone ?? "",
      department: s.department ?? "",
      name: s.name ?? "",
    });
  };

  // custom glass dropdown
  const GlassDropdown = ({ label, value, list, keyName, onChange }) => (
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
          className="absolute left-0 right-0 mt-2 rounded-2xl shadow-xl bg-white/80 backdrop-blur-lg z-20 overflow-hidden max-h-48 overflow-y-auto"
          style={{ border: "1px solid #00000020" }}
        >
          {list.map((it, idx) => (
            <div
              key={idx}
              onClick={() => {
                // if onChange provided use it, else write to form
                if (onChange) onChange(it);
                else setForm((f) => ({ ...f, [keyName]: it }));
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
    if (!form.name || !form.rollNumber || !form.department || !form.semester) {
      pushToast({ type: "error", message: "Validation: Name, roll, department and semester required" });
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
        pushToast({ type: "success", message: "Student added successfully" });
        setShowAdd(false);
        setForm({
          name: "",
          rollNumber: "",
          department: "",
          section: "",
          year: "",
          semester: "",
          email: "",
          phone: "",
          profilePic: null,
          admissionNo: "",
        });
        await load();
      } else {
        pushToast({ type: "error", message: data.message || "Add failed" });
      }
    } catch (err) {
      console.error(err);
      pushToast({ type: "error", message: "Server error: Could not add student" });
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

  // --- Delete Student ---
  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await authFetch(`/institute/students/${deleteId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        pushToast({ type: "success", message: "Student removed successfully" });
        await load();
        setDeleteId(null);
      } else {
        pushToast({ type: "error", message: data.message || "Delete failed" });
      }
    } catch (err) {
      console.error(err);
      pushToast({ type: "error", message: "Server error: Delete failed" });
    } finally {
      setIsDeleting(false);
    }
  };

  // --- save edited student ---
  const saveStudentChanges = async (data) => {
    if (!data || !data._id) {
      pushToast({ type: "error", message: "Validation: Invalid student data" });
      return;
    }
    setIsSaving(true);
    try {
      // ensure we send canonical keys (rollNumber)
      const payload = {
        name: data.name,
        rollNumber: data.rollNumber,
        email: data.email,
        phone: data.phone,
        department: data.department,
        section: data.section,
        year: data.year,
        semester: data.semester,
        admissionNo: data.admissionNo,
        profilePic: data.profilePic,
      };

      const res = await authFetch(`/institute/students/${data._id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      const out = await res.json();
      if (res.ok) {
        pushToast({ type: "success", message: "Student updated successfully" });
        setSelected(null);
        await load();
      } else {
        pushToast({ type: "error", message: out.message || "Update failed" });
      }
    } catch (err) {
      console.error(err);
      pushToast({ type: "error", message: "Server error: Could not update" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full relative">
      {/* Full-page glass loader */}
      {isPageLoading && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
          <div className="rounded-2xl p-6 bg-white/90 backdrop-blur-md flex flex-col items-center gap-4">
            <Spinner size={28} color={theme?.primary || "#111"} />
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
            onClick={() => {
              // reset form before showing
              setForm({
                name: "",
                rollNumber: "",
                department: "",
                section: "",
                year: "",
                semester: "",
                email: "",
                phone: "",
                profilePic: null,
                admissionNo: "",
              });
              setShowAdd(true);
            }}
            className="px-5 py-3 rounded-xl flex items-center gap-2 font-semibold disabled:opacity-60"
            style={{ background: theme?.primary, color: "white" }}
            disabled={isAdding}
          >
            {isAdding ? <Spinner size={16} /> : <><Plus className="w-4 h-4" /> Add Student</>}
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
              key={s._id}
              className="cursor-pointer p-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] bg-white hover:shadow-[0_6px_25px_rgba(0,0,0,0.14)] transition-all flex items-center gap-4"
              onClick={() => openEdit(s)}
            >
              <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                {s.profilePic ? (
                  <img src={s.profilePic} className="w-full h-full object-cover" alt="pf" />
                ) : (
                  <span className="font-bold text-gray-600">
                    {(s.name || "").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex-1 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-[15px] truncate">{idx + 1}. {s.name}</p>
                  <p className="text-[12px] text-gray-600 truncate">
                    {s.rollNumber || "—"} • {s.department || "—"} • Sem {s.semester || "—"}
                  </p>
                </div>

                <div className="flex gap-2 shrink-0 ml-3">
                  <button
                    className="px-3 py-1 rounded-lg text-xs font-semibold"
                    style={{ background: "#00000015", color: "black" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openEdit(s);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="px-3 py-1 rounded-lg text-xs font-semibold text-white"
                    style={{ background: "#E53935" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(s._id);
                    }}
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

            {/* FORM (floating labels) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
              {/* NAME */}
              <div className="relative">
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="peer w-full p-4 rounded-2xl border bg-white/70 backdrop-blur-lg transition-all outline-none"
                  placeholder=" "
                  style={{ borderColor: `#00000040` }}
                />
                <label className="absolute left-4 top-1/2 -translate-y-1/2 bg-white px-2 text-gray-700 text-sm transition-all peer-focus:top-0 peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-[12px]" style={{ color: "black" }}>
                  Full Name
                </label>
              </div>

              {/* ROLL NUMBER */}
              <div className="relative">
                <input
                  value={form.rollNumber}
                  onChange={(e) => setForm((p) => ({ ...p, rollNumber: e.target.value }))}
                  className="peer w-full p-4 rounded-2xl border bg-white/70 backdrop-blur-lg transition-all outline-none"
                  placeholder=" "
                  style={{ borderColor: `#00000040` }}
                />
                <label className="absolute left-4 top-1/2 -translate-y-1/2 bg-white px-2 text-gray-700 text-sm transition-all peer-focus:top-0 peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-[12px]" style={{ color: "black" }}>
                  Roll Number
                </label>
              </div>

              {/* EMAIL */}
              <div className="relative">
                <input
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
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
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  className="peer w-full p-4 rounded-2xl border bg-white/70 backdrop-blur-lg transition-all outline-none"
                  placeholder=" "
                  style={{ borderColor: `#00000040` }}
                />
                <label className="absolute left-4 top-1/2 -translate-y-1/2 bg-white px-2 text-gray-700 text-sm transition-all peer-focus:top-0 peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-[12px]" style={{ color: "black" }}>
                  Phone
                </label>
              </div>

              {/* DEPARTMENT */}
              <div className="relative">
                <select
                  value={form.department}
                  onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                  className="w-full p-4 rounded-2xl border bg-white/70 backdrop-blur-lg outline-none cursor-pointer"
                  style={{ borderColor: `#00000040` }}
                >
                  <option value="">Select department</option>
                  {departments.map((d) => <option key={d.DID} value={d.code}>{d.code} — {d.name}</option>)}
                </select>
                <label className="absolute left-4 -top-2 bg-white px-2 text-[12px] text-gray-700" style={{ color: "black" }}>Department</label>
              </div>

              {/* SEMESTER */}
              <GlassDropdown
                label="Select Semester"
                value={form.semester ? `Sem ${form.semester}` : ""}
                list={["1","2","3","4","5","6","7","8"]}
                keyName="semester"
                onChange={(it) => setForm((p) => ({ ...p, semester: it }))}
              />

              {/* YEAR */}
              <GlassDropdown
                label="Select Year"
                value={form.year ? `${form.year} Year` : ""}
                list={["1","2","3","4"]}
                keyName="year"
                onChange={(it) => setForm((p) => ({ ...p, year: it }))}
              />

              {/* SECTION */}
              <GlassDropdown
                label="Select Section"
                value={form.section}
                list={["A","B","C","D"]}
                keyName="section"
                onChange={(it) => setForm((p) => ({ ...p, section: it }))}
              />

              {/* ADMISSION NO */}
              <div className="relative col-span-2">
                <input
                  value={form.admissionNo}
                  onChange={(e) => setForm((p) => ({ ...p, admissionNo: e.target.value }))}
                  className="peer w-full p-4 rounded-2xl border bg-white/70 backdrop-blur-lg transition-all outline-none"
                  placeholder=" "
                  style={{ borderColor: `#00000040` }}
                />
                <label className="absolute left-4 top-1/2 -translate-y-1/2 bg-white px-2 text-gray-700 text-sm transition-all peer-focus:top-0 peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-[12px]" style={{ color: "black" }}>
                  Admission No.
                </label>
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
              <button onClick={submit} disabled={isAdding} className="px-4 py-2 rounded-xl flex items-center gap-2 border-[black]" style={{ background: theme?.primary, color: theme?.textOnPrimary || "white" }}>
                {isAdding ? <Spinner size={16} color="white" /> : "Add Student"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT / DETAILS POPUP (floating labels) */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl rounded-3xl p-7 shadow-[0_8px_40px_rgba(0,0,0,0.25)]" style={{ background: "white", border: "1px solid #00000033" }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[22px] font-bold">Edit Student — {selected.name || ""}</h3>
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
                <p className="text-gray-600 text-sm">Roll: <b>{selected.rollNumber || "—"}</b></p>
                <p className="text-gray-600 text-sm">Department: <b>{selected.department || "—"}</b></p>
              </div>
            </div>

            {/* edit form (floating labels) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <input
                  value={selected.name || ""}
                  onChange={(e) => setSelected(prev => ({ ...prev, name: e.target.value }))}
                  className="peer w-full p-3 rounded-xl border bg-white/70 outline-none"
                  placeholder=" "
                />
                <label className="absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-sm transition-all peer-focus:top-0 peer-not-placeholder-shown:top-0">Full Name</label>
              </div>

              <div className="relative">
                <input
                  value={selected.rollNumber || ""}
                  onChange={(e) => setSelected(prev => ({ ...prev, rollNumber: e.target.value }))}
                  className="peer w-full p-3 rounded-xl border bg-white/70 outline-none"
                  placeholder=" "
                />
                <label className="absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-sm transition-all peer-focus:top-0 peer-not-placeholder-shown:top-0">Roll Number</label>
              </div>

              <div className="relative">
                <input
                  value={selected.email || ""}
                  onChange={(e) => setSelected(prev => ({ ...prev, email: e.target.value }))}
                  className="peer w-full p-3 rounded-xl border bg-white/70 outline-none"
                  placeholder=" "
                />
                <label className="absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-sm transition-all peer-focus:top-0 peer-not-placeholder-shown:top-0">Email</label>
              </div>

              <div className="relative">
                <input
                  value={selected.phone || ""}
                  onChange={(e) => setSelected(prev => ({ ...prev, phone: e.target.value }))}
                  className="peer w-full p-3 rounded-xl border bg-white/70 outline-none"
                  placeholder=" "
                />
                <label className="absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-sm transition-all peer-focus:top-0 peer-not-placeholder-shown:top-0">Phone</label>
              </div>

              {/* SEMESTER */}
              <div className="relative">
                <input
                  value={selected.semester || ""}
                  onChange={(e) => setSelected(prev => ({ ...prev, semester: e.target.value }))}
                  className="peer w-full p-3 rounded-xl border bg-white/70 outline-none"
                  placeholder=" "
                />
                <label className="absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-sm transition-all peer-focus:top-0 peer-not-placeholder-shown:top-0">Semester (e.g. 5)</label>
              </div>

              <div className="relative">
                <input
                  value={selected.year || ""}
                  onChange={(e) => setSelected(prev => ({ ...prev, year: e.target.value }))}
                  className="peer w-full p-3 rounded-xl border bg-white/70 outline-none"
                  placeholder=" "
                />
                <label className="absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-sm transition-all peer-focus:top-0 peer-not-placeholder-shown:top-0">Year</label>
              </div>

              <div className="relative">
                <input
                  value={selected.admissionNo || ""}
                  onChange={(e) => setSelected(prev => ({ ...prev, admissionNo: e.target.value }))}
                  className="peer w-full p-3 rounded-xl border bg-white/70 outline-none"
                  placeholder=" "
                />
                <label className="absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-sm transition-all peer-focus:top-0 peer-not-placeholder-shown:top-0">Admission No.</label>
              </div>

              <div className="relative">
                <select
                  value={selected.department || ""}
                  onChange={(e) => setSelected(prev => ({ ...prev, department: e.target.value }))}
                  className="p-3 rounded-xl border bg-white/70 outline-none cursor-pointer"
                >
                  <option value="">Select dept</option>
                  {departments.map(d => <option key={d.DID} value={d.code}>{d.code} — {d.name}</option>)}
                </select>
              </div>
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

      {/* --- CUSTOM DELETE CONFIRMATION MODAL --- */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4 border border-gray-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Student?</h3>
              <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this student? This action cannot be undone.</p>
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
