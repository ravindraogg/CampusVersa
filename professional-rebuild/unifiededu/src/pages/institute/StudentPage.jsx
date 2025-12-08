import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit, ChevronDown, AlertTriangle, RefreshCw, Eye, EyeOff, Upload } from "lucide-react";

export default function StudentPage({ authFetch, theme, institute, pushToast }) {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);

  // UI / loading states
  const [loading, setLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Toggle state

  // Delete Modal State
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- NEW: USN Generation State ---
  const [showUsnModal, setShowUsnModal] = useState(false);
  const [usnConfig, setUsnConfig] = useState({
    department: "",
    admissionYear: new Date().getFullYear().toString(),
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // --- NEW: BULK UPLOAD STATE ---
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [isUploadingBulk, setIsUploadingBulk] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");

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
    password: "",
  });

  const [dropdownOpen, setDropdownOpen] = useState({
    year: false,
    section: false,
    semester: false,
  });

  // --- GENERATE SECTIONS A-Z ---
  const sectionList = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

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
        authFetch("/institute/departments", { method: "GET" }).then((r) => r.json())
      ]);

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

  const filtered = students.filter((st) => {
    const txt = `${st.name || ""} ${st.rollNumber || ""} ${st.SID || ""} ${st.email || ""} ${st.department || ""}`.toLowerCase();
    return txt.includes(search.toLowerCase()) && (filterDept ? st.department === filterDept : true);
  });

  const openEdit = (s) => {
    setSelected({
      ...s,
      rollNumber: s.rollNumber ?? s.roll ?? "",
      semester: s.semester ?? s.sem ?? "",
      year: s.year ?? "",
      section: s.section ?? "", // Ensure section is mapped
      admissionNo: s.admissionNo ?? "",
      profilePic: s.profilePic ?? null,
      email: s.email ?? "",
      phone: s.phone ?? "",
      department: s.department ?? "",
      name: s.name ?? "",
    });
  };

  const GlassDropdown = ({ label, value, list, keyName, onChange }) => (
    <div className="relative w-full">
      <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">{label}</label>
      <div
        className="flex items-center justify-between p-3.5 rounded-xl border bg-white cursor-pointer hover:bg-gray-50 transition-colors"
        style={{ borderColor: "#E5E7EB" }}
        onClick={() => setDropdownOpen((p) => ({ ...p, [keyName]: !p[keyName] }))}
      >
        <span className="font-medium text-gray-900">{value || "Select..."}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition ${dropdownOpen[keyName] ? "rotate-180" : "rotate-0"}`} />
      </div>

      {dropdownOpen[keyName] && (
        <div className="absolute left-0 right-0 mt-2 rounded-xl shadow-lg bg-white border border-gray-100 z-20 overflow-hidden max-h-48 overflow-y-auto">
          {list.map((it, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (onChange) onChange(it);
                else setForm((f) => ({ ...f, [keyName]: it }));
                setDropdownOpen((p) => ({ ...p, [keyName]: false }));
              }}
              className="px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition cursor-pointer"
            >
              {it}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const submit = async () => {
    if (!form.name || !form.department || !form.semester || !form.year) {
      pushToast({ type: "error", message: "Validation: Name, department, year and semester required" });
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
          password: "",
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

  const handleGenerateUsn = async () => {
    if (!usnConfig.department || !usnConfig.admissionYear) {
      pushToast({ type: "error", message: "Select Department and Admission Year" });
      return;
    }
    setIsGenerating(true);
    try {
      const res = await authFetch("/institute/students/generate-usn", {
        method: "POST",
        body: JSON.stringify(usnConfig),
      });
      const data = await res.json();
      if (res.ok) {
        pushToast({ type: "success", message: data.message });
        setShowUsnModal(false);
        await load();
      } else {
        pushToast({ type: "error", message: data.message || "Generation failed" });
      }
    } catch (err) {
      pushToast({ type: "error", message: "Server error during generation" });
    } finally {
      setIsGenerating(false);
    }
  };

// Replace your existing handleBulkUpload function with this:

// --- NEW: HANDLE BULK UPLOAD ---
  const handleBulkUpload = async () => {
    if (!bulkFile) {
      pushToast({ type: "error", message: "Please select a file first" });
      return;
    }
    setIsUploadingBulk(true);
    try {
      const formData = new FormData();
      formData.append("file", bulkFile);

      // 1. ROBUST TOKEN RETRIEVAL
      // Based on your screenshot, we check 'instituteToken' first, then 'authToken'
      const token = localStorage.getItem('instituteToken') || 
                    localStorage.getItem('authToken') || 
                    localStorage.getItem('token');

      if (!token) {
        pushToast({ type: "error", message: "Authentication token not found. Please login again." });
        setIsUploadingBulk(false);
        return;
      }

      // 2. Use native fetch to handle FormData headers automatically
      const res = await fetch(`${API_URL}/institute/students/bulk-upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}` // Attach the retrieved token
          // NOTE: Do NOT set 'Content-Type'. Browser sets it for FormData.
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        pushToast({ type: "success", message: `Uploaded ${data.count} students!` });
        setShowBulkModal(false);
        setBulkFile(null);
        await load();
      } else {
        pushToast({ type: "error", message: data.message || "Upload failed" });
      }
    } catch (err) {
      console.error(err);
      pushToast({ type: "error", message: "Server error during upload" });
    } finally {
      setIsUploadingBulk(false);
    }
  };


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

  const saveStudentChanges = async (data) => {
    if (!data || !data._id) {
      pushToast({ type: "error", message: "Validation: Invalid student data" });
      return;
    }
    setIsSaving(true);
    try {
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
            placeholder="Search name/roll/SID"
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
              <option key={d.DID} value={d.code}>{d.code} — {d.name}</option>
            ))}
          </select>

          <button
            onClick={() => { setUsnConfig((prev) => ({ ...prev, department: filterDept || "" })); setShowUsnModal(true); }}
            className="px-4 py-3 rounded-xl flex items-center gap-2 font-semibold bg-gray-900 text-white hover:bg-gray-800 transition shadow-md"
          >
            <RefreshCw className="w-4 h-4" /> USN
          </button>

          {/* BULK UPLOAD BUTTON */}
          <button
            onClick={() => setShowBulkModal(true)}
            className="px-4 py-3 rounded-xl flex items-center gap-2 font-bold shadow-md transition-all hover:opacity-90"
            style={{ backgroundColor: theme.primary, color: 'white' }}
          >
            <Upload className="w-4 h-4" /> Upload
          </button>

          <button
            onClick={() => {
              setForm({
                name: "", rollNumber: "", department: "", section: "", year: "", semester: "", email: "", phone: "", profilePic: null, admissionNo: "", password: "",
              });
              setShowAdd(true);
            }}
            className="px-5 py-3 rounded-xl flex items-center gap-2 font-semibold disabled:opacity-60 shadow-md"
            style={{ background: theme?.primary, color: "white" }}
            disabled={isAdding}
          >
            {isAdding ? <Spinner size={16} /> : <><Plus className="w-4 h-4" /> Add Student</>}
          </button>
        </div>
      </div>

      {/* STUDENT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? <div className="p-6">Loading...</div> : filtered.length === 0 ? <div className="p-6 text-gray-500">No students found.</div> : filtered.map((s, idx) => (
          <div key={s._id} className="cursor-pointer p-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] bg-white hover:shadow-[0_6px_25px_rgba(0,0,0,0.14)] transition-all flex items-center gap-4" onClick={() => openEdit(s)}>
            <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
              {s.profilePic ? <img src={s.profilePic} className="w-full h-full object-cover" alt="pf" /> : <span className="font-bold text-gray-600">{(s.name || "").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}</span>}
            </div>
            <div className="flex-1 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-[15px] truncate">{idx + 1}. {s.name}</p>
                <p className="text-[12px] text-gray-600 truncate font-mono">{s.SID || s.rollNumber || "—"}</p>
                <p className="text-[10px] text-gray-500 truncate">{s.department || "—"} • Sem {s.semester || "—"} • Sec {s.section || "?"}</p>
              </div>
              <div className="flex gap-2 shrink-0 ml-3">
                <button className="px-3 py-1 rounded-lg text-xs font-semibold" style={{ background: "#00000015", color: "black" }} onClick={(e) => { e.stopPropagation(); openEdit(s); }}>Edit</button>
                <button className="px-3 py-1 rounded-lg text-xs font-semibold text-white" style={{ background: "#E53935" }} onClick={(e) => { e.stopPropagation(); setDeleteId(s._id); }}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* BULK UPLOAD MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Bulk Upload Students</h3>
              <button onClick={() => setShowBulkModal(false)} className="text-gray-400 hover:text-red-500">✕</button>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 font-medium mb-2">Drag & Drop or Click to Upload</p>
              <p className="text-xs text-gray-400 mb-4">Supported: CSV, XML, PDF</p>
              
              <input 
                type="file" 
                id="bulkUploadInput" 
                className="hidden" 
                accept=".csv,.xml,.pdf,.txt"
                onChange={(e) => setBulkFile(e.target.files[0])}
              />
              <label 
                htmlFor="bulkUploadInput" 
                className="px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-transform active:scale-95"
                style={{ backgroundColor: theme.primary, color:"white" }}
              >
                Choose File
              </label>
            </div>

            {bulkFile && (
              <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-xl text-sm flex items-center gap-2">
                <span className="font-bold">Selected:</span> {bulkFile.name}
              </div>
            )}

            <div className="mt-6">
              <button 
                onClick={handleBulkUpload} 
                disabled={isUploadingBulk || !bulkFile}
                className="w-full py-3 rounded-xl font-bold flex justify-center items-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: theme.primary, color: theme.secondary }}
              >
                {isUploadingBulk ? <Spinner size={18} color={theme.secondary} /> : "Start Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD STUDENT MODAL */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in zoom-in duration-200">
          <div className="w-full max-w-2xl p-6 rounded-3xl bg-white shadow-2xl" style={{ border: "1px solid #E5E7EB" }}>
            <div className="flex justify-between items-center">
              <div><h3 className="text-[18px] font-bold">Add Student</h3><div className="text-gray-500">Create a new student record</div></div>
              <button onClick={() => setShowAdd(false)} className="text-slate-500 hover:text-red-500">✕</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Full Name</label><input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/5 outline-none transition-all" placeholder="e.g. Jane Doe" /></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Roll Number (Optional)</label><input value={form.rollNumber} onChange={(e) => setForm((p) => ({ ...p, rollNumber: e.target.value }))} className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/5 outline-none transition-all" placeholder="e.g. 1RV21CS001" /></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Email</label><input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/5 outline-none transition-all" placeholder="student@example.com" /></div>
              
              {/* PASSWORD + EYE */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} className="w-full p-3.5 pr-10 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/5 outline-none transition-all" placeholder="Set password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
              </div>

              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Phone</label><input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/5 outline-none transition-all" placeholder="+91..." /></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Department</label><select value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} className="w-full p-3.5 rounded-xl border border-gray-200 bg-white outline-none cursor-pointer"><option value="">Select department</option>{departments.map((d) => (<option key={d.DID} value={d.code} className="text-black">{d.code} — {d.name}</option>))}</select></div>
              <GlassDropdown label="Semester" value={form.semester ? `Sem ${form.semester}` : ""} list={["1", "2", "3", "4", "5", "6", "7", "8"]} keyName="semester" onChange={(it) => setForm((p) => ({ ...p, semester: it }))} />
              <GlassDropdown label="Year" value={form.year ? `${form.year} Year` : ""} list={["1", "2", "3", "4"]} keyName="year" onChange={(it) => setForm((p) => ({ ...p, year: it }))} />
              
              {/* UPDATED SECTION LIST A-Z */}
              <GlassDropdown label="Section" value={form.section} list={sectionList} keyName="section" onChange={(it) => setForm((p) => ({ ...p, section: it }))} />

              <div className="col-span-2 md:col-span-1"><label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Admission No.</label><input value={form.admissionNo} onChange={(e) => setForm((p) => ({ ...p, admissionNo: e.target.value }))} className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black/5 outline-none transition-all" placeholder="e.g. ADM-2024-001" /></div>
              <div className="col-span-2"><label className="w-full flex items-center justify-center p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 bg-gray-50 cursor-pointer text-gray-700 font-medium transition-colors">{isUploadingPic ? <DarkSpinner /> : form.profilePic ? <span className="text-green-600 font-semibold">✓ Profile Picture Selected</span> : "Upload Profile Picture"}<input type="file" accept="image/*" className="hidden" onChange={handlePic} /></label></div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button onClick={() => setShowAdd(false)} className="px-5 py-2.5 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={submit} disabled={isAdding} className="px-6 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg hover:opacity-90 transition-opacity disabled:opacity-60" style={{ background: theme?.primary || "black", color: theme?.textOnPrimary || "white" }}>{isAdding ? <Spinner size={16} color="white" /> : "Add Student"}</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl rounded-3xl p-7 shadow-[0_8px_40px_rgba(0,0,0,0.25)] bg-white border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[22px] font-bold">Edit Student — {selected.name || ""}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-600 text-xl hover:text-red-500 transition">✕</button>
            </div>
            <div className="flex items-center gap-6 mb-6">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center shadow-md border border-gray-100">
                {selected.profilePic ? <img src={selected.profilePic} className="w-full h-full object-cover" alt="pf" /> : <span className="font-bold text-gray-600 text-[20px]">{(selected.name || "").split(" ").map((x) => x[0]).slice(0, 2).join("").toUpperCase()}</span>}
                <label className="absolute bottom-0 left-0 right-0 bg-black/60 text-white py-1 text-[10px] text-center cursor-pointer hover:bg-black/70">{isUploadingPic ? "..." : "Change"}<input type="file" accept="image/*" className="hidden" onChange={handleEditPic} /></label>
              </div>
              <div className="flex-1">
                <p className="text-gray-600 text-sm">USN/SID: <b>{selected.SID || selected.rollNumber || "—"}</b></p>
                <p className="text-gray-600 text-sm mt-1">Department: <b>{selected.department || "—"}</b></p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label><input value={selected.name || ""} onChange={(e) => setSelected((prev) => ({ ...prev, name: e.target.value }))} className="w-full p-3 rounded-xl border border-gray-200 mt-1" /></div>
              <div><label className="text-xs font-bold text-gray-500 uppercase ml-1">Roll Number</label><input value={selected.rollNumber || ""} onChange={(e) => setSelected((prev) => ({ ...prev, rollNumber: e.target.value }))} className="w-full p-3 rounded-xl border border-gray-200 mt-1" /></div>
              <div><label className="text-xs font-bold text-gray-500 uppercase ml-1">Email</label><input value={selected.email || ""} onChange={(e) => setSelected((prev) => ({ ...prev, email: e.target.value }))} className="w-full p-3 rounded-xl border border-gray-200 mt-1" /></div>
              <div><label className="text-xs font-bold text-gray-500 uppercase ml-1">Phone</label><input value={selected.phone || ""} onChange={(e) => setSelected((prev) => ({ ...prev, phone: e.target.value }))} className="w-full p-3 rounded-xl border border-gray-200 mt-1" /></div>
              <div><label className="text-xs font-bold text-gray-500 uppercase ml-1">Semester</label><input value={selected.semester || ""} onChange={(e) => setSelected((prev) => ({ ...prev, semester: e.target.value }))} className="w-full p-3 rounded-xl border border-gray-200 mt-1" /></div>
              <div><label className="text-xs font-bold text-gray-500 uppercase ml-1">Year</label><input value={selected.year || ""} onChange={(e) => setSelected((prev) => ({ ...prev, year: e.target.value }))} className="w-full p-3 rounded-xl border border-gray-200 mt-1" /></div>
              <div><label className="text-xs font-bold text-gray-500 uppercase ml-1">Admission No.</label><input value={selected.admissionNo || ""} onChange={(e) => setSelected((prev) => ({ ...prev, admissionNo: e.target.value }))} className="w-full p-3 rounded-xl border border-gray-200 mt-1" /></div>
              
              {/* ADDED SECTION TO EDIT MODAL */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Section</label>
                <select value={selected.section || ""} onChange={(e) => setSelected((prev) => ({ ...prev, section: e.target.value }))} className="w-full p-3 rounded-xl border border-gray-200 mt-1 bg-white cursor-pointer">
                  <option value="">Select</option>
                  {sectionList.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                 <label className="text-xs font-bold text-gray-500 uppercase ml-1">Department</label>
                 <select value={selected.department || ""} onChange={(e) => setSelected((prev) => ({ ...prev, department: e.target.value }))} className="w-full p-3 rounded-xl border border-gray-200 bg-white mt-1 cursor-pointer">
                  <option value="">Select dept</option>
                  {departments.map((d) => (<option key={d.DID} value={d.code}>{d.code} — {d.name}</option>))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-7">
              <button onClick={() => setSelected(null)} className="px-5 py-2.5 rounded-xl border font-semibold hover:bg-gray-50">Cancel</button>
              <button onClick={() => saveStudentChanges(selected)} disabled={isSaving} className="px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 text-white bg-black shadow-lg">{isSaving ? <Spinner size={16} color="white" /> : "Save Changes"}</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4 border border-gray-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4"><AlertTriangle className="w-6 h-6 text-red-600" /></div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Student?</h3>
              <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this student? This action cannot be undone.</p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition">Cancel</button>
                <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 shadow-lg shadow-red-200 transition flex justify-center items-center">{isDeleting ? <Spinner size={16} /> : "Delete"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* USN MODAL */}
      {showUsnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Generate USNs</h3><button onClick={() => setShowUsnModal(false)} className="text-gray-500 hover:text-red-500">✕</button></div>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800"><p className="font-bold mb-1">Logic: Region + College + Year + Branch + Serial</p><p>This will sort students alphabetically and overwrite their SIDs.</p></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Select Department</label><select value={usnConfig.department} onChange={(e) => setUsnConfig({ ...usnConfig, department: e.target.value })} className="w-full p-3 rounded-xl border border-gray-300 outline-none"><option value="">-- Select Dept --</option>{departments.map((d) => (<option key={d.DID} value={d.code}>{d.code}</option>))}</select></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Admission Year (e.g. 2024)</label><input type="number" value={usnConfig.admissionYear} onChange={(e) => setUsnConfig({ ...usnConfig, admissionYear: e.target.value })} className="w-full p-3 rounded-xl border border-gray-300 outline-none" placeholder="2024" /></div>
              <button onClick={handleGenerateUsn} disabled={isGenerating} className="w-full py-3 rounded-xl bg-black text-white font-bold flex justify-center items-center gap-2 hover:opacity-90 transition">{isGenerating ? <Spinner size={18} /> : "Generate & Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}