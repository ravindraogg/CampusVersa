import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit, AlertTriangle, Eye, EyeOff, Upload } from "lucide-react";
const API_URL = import.meta.env.VITE_BACK_URI;
export default function FacultyPage({ authFetch, theme, institute, pushToast }) {
  // data
  const [list, setList] = useState([]);
  const [departments, setDepartments] = useState([]);

  // UI state
  const [loading, setLoading] = useState(false); 
  const [isPageLoading, setIsPageLoading] = useState(false); 
  const [isAdding, setIsAdding] = useState(false);
  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Delete Modal State
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");

  // --- NEW STATE FOR BULK UPLOAD ---
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [isUploadingBulk, setIsUploadingBulk] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    designation: "",
    department: "",
    position: "",
    workingHours: "",
    ssrStatus: "",
    naacFollowing: false,
    profilePic: null,
    loginId: "",
    password: "",
  });

  const [selected, setSelected] = useState(null);

  // --- Spinner components ---
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

  // --- Load faculty & departments ---
  const load = async () => {
    setIsPageLoading(true);
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([
        authFetch("/institute/faculty", { method: "GET" }).then((r) => r.json()),
        authFetch("/institute/departments", { method: "GET" }).then((r) => r.json()),
      ]);
      setList(r1 || []);
      setDepartments(r2 || []);
    } catch (err) {
      console.error(err);
      pushToast({ type: "error", message: "Load failed: Could not load faculty" });
    } finally {
      setLoading(false);
      setTimeout(() => setIsPageLoading(false), 200);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // preview FID generator
  const previewFID = () => {
    if (!form.department) return "—";

    const deptCode = form.department.toUpperCase();
    const instCode = institute?.code || "CLG";
    const clgNum = institute?.collegeNumber || 1;

    const sameDept = list.filter((f) => (f.department || "").toUpperCase() === deptCode);

    const seqNumbers = sameDept.map((f) => {
      if (!f.FID) return 0;
      const last3 = f.FID.slice(-3);
      const num = parseInt(last3, 10);
      return isNaN(num) ? 0 : num;
    });

    const maxSeq = seqNumbers.length > 0 ? Math.max(...seqNumbers) : 0;
    const nextSeq = maxSeq + 1;

    return `${clgNum}${instCode}${deptCode}${String(nextSeq).padStart(3, "0")}`;
  };

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
      const token = localStorage.getItem('instituteToken') || 
                    localStorage.getItem('authToken') || 
                    localStorage.getItem('token');

      if (!token) {
        pushToast({ type: "error", message: "Authentication token not found. Please login again." });
        setIsUploadingBulk(false);
        return;
      }

      const res = await fetch(`${API_URL}/institute/faculty/bulk-upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        pushToast({ type: "success", message: `Uploaded ${data.count} faculty members!` });
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

  const submit = async () => {
    if (!form.name || !form.department || !form.password) {
      pushToast({ type: "error", message: "Validation: Name, department, and password required" });
      return;
    }

    setIsAdding(true);
    try {
      const generatedFID = previewFID();
      const finalLoginId = generatedFID === "—" ? "" : generatedFID;

      const payload = {
        ...form,
        department: form.department.toUpperCase(),
        loginId: finalLoginId,
      };

      const res = await authFetch("/institute/faculty/add", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        pushToast({ type: "success", message: "Faculty added successfully" });
        setShowAdd(false);
        setForm({
          name: "",
          email: "",
          phone: "",
          designation: "",
          department: "",
          position: "",
          workingHours: "",
          ssrStatus: "",
          naacFollowing: false,
          profilePic: null,
          loginId: "",
          password: "",
        });
        await load();
      } else {
        pushToast({ type: "error", message: data.message || "Add failed" });
      }
    } catch (err) {
      console.error(err);
      pushToast({ type: "error", message: "Server error: Could not add faculty" });
    } finally {
      setIsAdding(false);
    }
  };

  const filtered = list.filter((f) => {
    const text = `${f.name} ${f.email} ${f.designation} ${f.department}`.toLowerCase();
    return text.includes(search.toLowerCase()) && (filterDept ? f.department === filterDept : true);
  });

  const handlePic = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPic(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, profilePic: reader.result }));
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
      const res = await authFetch(`/institute/faculty/${deleteId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        pushToast({ type: "success", message: "Faculty removed successfully" });
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

  const saveFacultyChanges = async (data) => {
    if (!data || !data._id) {
      pushToast({ type: "error", message: "Validation: Invalid faculty data" });
      return;
    }
    setIsSaving(true);
    try {
      const res = await authFetch(`/institute/faculty/${data._id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      const out = await res.json();
      if (res.ok) {
        pushToast({ type: "success", message: "Faculty updated successfully" });
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
            <Spinner size={28} color={theme.primary || "#111"} />
            <div style={{ color: "#374151" }}>Working…</div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-[22px] font-bold">Faculty</h3>
          <p className="text-gray-500">Manage faculty records</p>
        </div>

        <div className="flex gap-3 items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search faculty"
            className="p-3 rounded-xl border w-48"
            style={{ borderColor: `${theme.primary}40` }}
          />

          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="p-3 rounded-xl border cursor-pointer"
            style={{ borderColor: `${theme.primary}40` }}
          >
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d.DID} value={d.code}>
                {d.code} — {d.name}
              </option>
            ))}
          </select>

          {/* BULK UPLOAD BUTTON */}
          <button
            onClick={() => setShowBulkModal(true)}
            className="px-4 py-3 rounded-xl flex items-center gap-2 font-bold shadow-md transition-all hover:opacity-90"
            style={{ backgroundColor: theme.primary, color: "white" }}
          >
            <Upload className="w-4 h-4" /> Upload
          </button>

          <button
            onClick={() => setShowAdd(true)}
            className="px-5 py-3 rounded-xl flex items-center gap-2 font-semibold disabled:opacity-60"
            style={{ background: theme.primary, color: "white" }}
            disabled={isAdding}
          >
            {isAdding ? <Spinner size={16} color="white" /> : <><Plus className="w-4 h-4" /> Add Faculty</>}
          </button>
        </div>
      </div>

      {/* FACULTY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <div className="p-6">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-gray-500">No faculty found.</div>
        ) : (
          filtered.map((f, index) => (
            <div
              key={f._id || f.FID}
              className="cursor-pointer p-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] bg-white hover:shadow-[0_6px_25px_rgba(0,0,0,0.14)] transition-all flex items-center gap-4 overflow-hidden w-full relative"
              onClick={() => setSelected(f)}
            >
              <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                {f.profilePic ? (
                  <img src={f.profilePic} className="w-full h-full object-cover" alt="pf" />
                ) : (
                  <span className="font-bold text-gray-600">
                    {(f.name || "").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex-1 flex items-center justify-between gap-2 overflow-hidden">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[15px] truncate">{index + 1}. {f.name}</p>
                  <p className="text-[12px] text-gray-600 truncate">{f.designation} • {f.department}</p>
                  <p className="text-[10px] text-gray-400 truncate">{f.email}</p>
                </div>

                <div className="flex gap-2 shrink-0 ml-2">
                  <button
                    className="px-3 py-1 rounded-lg text-xs font-semibold"
                    style={{ color: theme.secondary }}
                    onClick={(e) => { e.stopPropagation(); setSelected(f); }}
                  >
                    Edit
                  </button>

                  <button
                    className="px-3 py-1 rounded-lg text-xs font-semibold text-white"
                    style={{ background: "#E53935" }}
                    onClick={(e) => { e.stopPropagation(); setDeleteId(f._id); }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* BULK UPLOAD MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Bulk Upload Faculty</h3>
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
                style={{ backgroundColor: theme.primary, color: theme.secondary }}
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

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            className="w-full max-w-2xl p-6 rounded-3xl"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.78))",
              border: `1px solid ${theme.primary}33`,
              backdropFilter: "blur(8px)",
            }}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-[18px] font-bold">Add Faculty</h3>
                <div className="text-gray-500">
                  Auto FID preview: <span className="font-semibold">{previewFID()}</span>
                </div>
              </div>
              <button onClick={() => setShowAdd(false)} className="text-slate-500">✕</button>
            </div>

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
                <label className="absolute left-4 top-1/2 -translate-y-1/2 bg-white px-2 text-gray-700 text-sm transition-all peer-focus:top-0 peer-not-placeholder-shown:top-0" style={{ color: "black" }}>Full Name</label>
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
                <label className="absolute left-4 top-1/2 -translate-y-1/2 bg-white px-2 text-gray-700 text-sm transition-all peer-focus:top-0 peer-not-placeholder-shown:top-0" style={{ color: "black" }}>Email</label>
              </div>

              {/* PASSWORD WITH TOGGLE */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="peer w-full p-4 pr-10 rounded-2xl border bg-white/70 backdrop-blur-lg transition-all outline-none"
                  placeholder=" "
                  style={{ borderColor: `#00000040` }}
                />
                <label className="absolute left-4 top-1/2 -translate-y-1/2 bg-white px-2 text-gray-700 text-sm transition-all peer-focus:top-0 peer-not-placeholder-shown:top-0" style={{ color: "black" }}>Password</label>
                
                {/* TOGGLE BUTTON */}
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
                >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
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
                <label className="absolute left-4 top-1/2 -translate-y-1/2 bg-white px-2 text-gray-700 text-sm transition-all peer-focus:top-0 peer-not-placeholder-shown:top-0" style={{ color: "black" }}>Phone</label>
              </div>

              {/* DESIGNATION */}
              <div className="relative">
                <input
                  value={form.designation}
                  onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  className="peer w-full p-4 rounded-2xl border bg-white/70 backdrop-blur-lg transition-all outline-none"
                  placeholder=" "
                  style={{ borderColor: `#00000040` }}
                />
                <label className="absolute left-4 top-1/2 -translate-y-1/2 bg-white px-2 text-gray-700 text-sm transition-all peer-focus:top-0 peer-not-placeholder-shown:top-0" style={{ color: "black" }}>Designation</label>
              </div>

              {/* DEPARTMENT */}
              <div className="relative">
                <select
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full p-4 rounded-2xl border bg-white/70 backdrop-blur-lg outline-none cursor-pointer"
                  style={{ borderColor: `#00000040` }}
                >
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d.DID} value={d.code}>{d.code} — {d.name}</option>
                  ))}
                </select>
                <label className="absolute left-4 -top-2 bg-white px-2 text-[12px] text-gray-700" style={{ color: "black" }}>Department</label>
              </div>

              {/* POSITION */}
              <div className="relative">
                <input
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  className="peer w-full p-4 rounded-2xl border bg-white/70 backdrop-blur-lg transition-all outline-none"
                  placeholder=" "
                  style={{ borderColor: `#00000040` }}
                />
                <label className="absolute left-4 top-1/2 -translate-y-1/2 bg-white px-2 text-gray-700 text-sm transition-all peer-focus:top-0 peer-not-placeholder-shown:top-0" style={{ color: "black" }}>Position</label>
              </div>

              {/* WORKING HOURS */}
              <div className="relative">
                <input
                  value={form.workingHours}
                  onChange={(e) => setForm({ ...form, workingHours: e.target.value })}
                  className="peer w-full p-4 rounded-2xl border bg-white/70 backdrop-blur-lg transition-all outline-none"
                  placeholder=" "
                  style={{ borderColor: `#00000040` }}
                />
                <label className="absolute left-4 top-1/2 -translate-y-1/2 bg-white px-2 text-gray-700 text-sm transition-all peer-focus:top-0 peer-not-placeholder-shown:top-0" style={{ color: "black" }}>Working Hours</label>
              </div>

              {/* SSR STATUS */}
              <div className="relative">
                <input
                  value={form.ssrStatus}
                  onChange={(e) => setForm({ ...form, ssrStatus: e.target.value })}
                  className="peer w-full p-4 rounded-2xl border bg-white/70 backdrop-blur-lg transition-all outline-none"
                  placeholder=" "
                  style={{ borderColor: `#00000040` }}
                />
                <label className="absolute left-4 top-1/2 -translate-y-1/2 bg-white px-2 text-gray-700 text-sm transition-all peer-focus:top-0 peer-not-placeholder-shown:top-0" style={{ color: "black" }}>SSR Status</label>
              </div>

              {/* NAAC Checkbox */}
              <div className="flex items-center gap-3 p-4 rounded-2xl border bg-white/70 backdrop-blur-lg" style={{ borderColor: `#00000040` }}>
                <input type="checkbox" checked={form.naacFollowing} onChange={(e) => setForm({ ...form, naacFollowing: e.target.checked })} className="w-5 h-5 accent-black" />
                <span className="text-gray-700 font-medium">NAAC Following</span>
              </div>

              {/* UPLOAD PROFILE PIC */}
              <label className="col-span-2 w-full flex items-center justify-center p-4 rounded-2xl border bg-white/70 backdrop-blur-lg cursor-pointer font-medium gap-3" style={{ borderColor: `#00000040` }}>
                {isUploadingPic ? <><DarkSpinner /><span className="text-yellow-600 font-semibold">Uploading…</span></> : form.profilePic ? <span className="text-green-600 font-semibold">Uploaded ✓</span> : <span className="text-gray-700">Upload Profile Picture</span>}
                <input type="file" accept="image/*" className="hidden" onChange={handlePic} />
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl border">Cancel</button>
              <button onClick={submit} disabled={isAdding} className="px-4 py-2 rounded-xl flex items-center gap-2 disabled:opacity-60" style={{ background: theme.primary, color: theme.textOnPrimary }}>
                {isAdding ? <Spinner size={16} color="white" /> : "Add Faculty"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT / DETAILS POPUP */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl rounded-3xl p-7 shadow-[0_8px_40px_rgba(0,0,0,0.25)]" style={{ background: "white", border: `1px solid ${theme.primary}33` }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[22px] font-bold">Edit Faculty — {selected.name}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-600 text-xl hover:text-red-500 transition">✕</button>
            </div>

            <div className="flex items-center gap-6 mb-6">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center shadow-md">
                {selected.profilePic ? <img src={selected.profilePic} className="w-full h-full object-cover" alt="pf" /> : <span className="font-bold text-gray-600 text-[20px]">{(selected.name || "").split(" ").map((x) => x[0]).slice(0, 2).join("").toUpperCase()}</span>}
                <label className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded-lg text-xs cursor-pointer">
                  {isUploadingPic ? "Uploading..." : "Edit"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleEditPic} />
                </label>
              </div>
              <div className="flex-1">
                <p className="text-gray-600 text-sm">Faculty ID: <b>{selected.FID}</b></p>
                <p className="text-gray-600 text-sm">Department: <b>{selected.department}</b></p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={selected.name} onChange={(e) => setSelected((prev) => ({ ...prev, name: e.target.value }))} placeholder="Full Name" className="p-3 rounded-xl border" />
              <input value={selected.email} onChange={(e) => setSelected((prev) => ({ ...prev, email: e.target.value }))} placeholder="Email" className="p-3 rounded-xl border" />
              <input value={selected.phone} onChange={(e) => setSelected((prev) => ({ ...prev, phone: e.target.value }))} placeholder="Phone" className="p-3 rounded-xl border" />
              <input value={selected.designation} onChange={(e) => setSelected((prev) => ({ ...prev, designation: e.target.value }))} placeholder="Designation" className="p-3 rounded-xl border" />
              <input value={selected.position} onChange={(e) => setSelected((prev) => ({ ...prev, position: e.target.value }))} placeholder="Position" className="p-3 rounded-xl border" />
              <input value={selected.workingHours} onChange={(e) => setSelected((prev) => ({ ...prev, workingHours: e.target.value }))} placeholder="Working Hours" className="p-3 rounded-xl border" />
              <label className="flex items-center gap-2 p-3 border rounded-xl cursor-pointer">
                <span>NAAC Following</span>
                <input type="checkbox" checked={selected.naacFollowing} onChange={(e) => setSelected((prev) => ({ ...prev, naacFollowing: e.target.checked }))} className="ml-2" />
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-7">
              <button onClick={() => setSelected(null)} className="px-5 py-2 rounded-xl border font-semibold">Cancel</button>
              <button onClick={() => saveFacultyChanges(selected)} disabled={isSaving} className="px-6 py-2 rounded-xl font-semibold flex items-center gap-2" style={{ background: theme.primary, color: theme.textOnPrimary }}>
                {isSaving ? <Spinner size={16} color="white" /> : "Save Changes"}
              </button>
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
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Faculty?</h3>
              <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this faculty member? This action cannot be undone.</p>
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