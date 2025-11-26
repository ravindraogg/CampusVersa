import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit } from "lucide-react";

export default function FacultyPage({ authFetch, theme, institute, pushToast }) {
  // data
  const [list, setList] = useState([]);
  const [departments, setDepartments] = useState([]);

  // UI state
  const [loading, setLoading] = useState(false); // local page loading for list (kept for small states)
  const [isPageLoading, setIsPageLoading] = useState(false); // full-page overlay loader (Option C)
  const [isAdding, setIsAdding] = useState(false);
  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");

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

  const [selected, setSelected] = useState(null); // selected faculty for view/edit popup

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
      pushToast({ type: "error", title: "Load failed", message: "Could not load faculty" });
    } finally {
      setLoading(false);
      // slight delay so spinner isn't too flickery
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
    const sameDept = list.filter((f) => (f.department || "").toUpperCase() === deptCode);
    const names = sameDept.map((x) => x.name).concat([form.name || ""]).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
    const idx = names.findIndex((n) => n === (form.name || ""));
    const seq = idx >= 0 ? idx + 1 : names.length;
    return `${institute?.collegeNumber || 1}${instCode}${deptCode}${String(seq).padStart(3, "0")}`;
  };

  // --- Add faculty (submit) ---
  const submit = async () => {
    if (!form.name || !form.department) {
      pushToast({ type: "error", title: "Validation", message: "Name and department required" });
      return;
    }

    setIsAdding(true);
    try {
      const payload = { ...form, department: form.department.toUpperCase() };
      const res = await authFetch("/institute/faculty/add", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        pushToast({ type: "success", title: "Added", message: "Faculty added" });
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
        pushToast({ type: "error", title: "Failed", message: data.message || "Add failed" });
      }
    } catch (err) {
      console.error(err);
      pushToast({ type: "error", title: "Server", message: "Could not add" });
    } finally {
      setIsAdding(false);
    }
  };

  // --- filtered list ---
  const filtered = list.filter((f) => {
    const text = `${f.name} ${f.email} ${f.designation} ${f.department}`.toLowerCase();
    return text.includes(search.toLowerCase()) && (filterDept ? f.department === filterDept : true);
  });

  // --- file handlers ---
  // For add-form upload
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

  // For edit popup upload
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

  // --- delete faculty ---
  const deleteFaculty = async (id) => {
    if (!window.confirm("Delete this faculty?")) return;
    setIsPageLoading(true);
    try {
      const res = await authFetch(`/institute/faculty/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        pushToast({ type: "success", title: "Deleted", message: "Faculty removed" });
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

  // --- save edited faculty ---
  const saveFacultyChanges = async (data) => {
    if (!data || !data._id) {
      pushToast({ type: "error", title: "Validation", message: "Invalid faculty data" });
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
        pushToast({ type: "success", title: "Updated", message: "Faculty updated" });
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
          <h3 className="text-[22px] font-bold">Faculty</h3>
          <p className="text-gray-500">Manage faculty records</p>
        </div>

        {/* Search + Dropdown + Add Button */}
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

          <button
            onClick={() => setShowAdd(true)}
            className="px-5 py-3 rounded-xl flex items-center gap-2 font-semibold disabled:opacity-60"
            style={{ background: theme.primary, color: theme.textOnPrimary }}
            disabled={isAdding}
          >
            {isAdding ? <Spinner size={16} color="white" /> : <><Plus className="w-4 h-4" /> Add Faculty</>}
          </button>
        </div>
      </div>

      {/* FACULTY GRID: 3 cards per row on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <div className="p-6">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-gray-500">No faculty found.</div>
        ) : (
          filtered.map((f, index) => (
            <div
              key={f._id || f.FID}
              className="cursor-pointer p-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] bg-white hover:shadow-[0_6px_25px_rgba(0,0,0,0.14)] transition-all flex items-center gap-4"
              onClick={() => setSelected(f)}
            >
              {/* Profile Pic */}
              <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                {f.profilePic ? (
                  <img src={f.profilePic} className="w-full h-full object-cover" alt="pf" />
                ) : (
                  <span className="font-bold text-gray-600">
                    {(f.name || "")
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </span>
                )}
              </div>

              {/* DETAILS + ACTIONS in one row */}
              <div className="flex-1 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-[15px] truncate">{index + 1}. {f.name}</p>
                  <p className="text-[12px] text-gray-600 truncate">{f.designation} • {f.department} • {f.email}</p>
                </div>

                <div className="flex gap-2 shrink-0 ml-3">
                  <button
                    className="px-3 py-1 rounded-lg text-xs font-semibold"
                    style={{ background: `${theme.primary}20`, color: theme.secondary }}
                    onClick={(e) => { e.stopPropagation(); /* TODO: open edit drawer if needed */ setSelected(f); }}
                  >
                    Edit
                  </button>

                  <button
                    className="px-3 py-1 rounded-lg text-xs font-semibold text-white"
                    style={{ background: "#E53935" }}
                    onClick={(e) => { e.stopPropagation(); deleteFaculty(f._id); }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            className="w-full max-w-2xl p-6 rounded-3xl"
            style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.78))", border: `1px solid ${theme.primary}33`, backdropFilter: "blur(8px)" }}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-[18px] font-bold">Add Faculty</h3>
                <div className="text-gray-500">Auto FID preview: <span className="font-semibold">{previewFID()}</span></div>
              </div>
              <button onClick={() => setShowAdd(false)} className="text-slate-500">✕</button>
            </div>

            {/* PREMIUM FORM */}
         {/* PREMIUM FORM — BLACK THEME */}
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
    <label
      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white px-2 text-gray-700 text-sm transition-all peer-focus:top-0 peer-focus:text-[12px] peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-[12px]"
      style={{ color: "black" }}
    >
      Full Name
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
    <label
      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white px-2 text-gray-700 text-sm transition-all peer-focus:top-0 peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-[12px]"
      style={{ color: "black" }}
    >
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
    <label
      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white px-2 text-gray-700 text-sm transition-all peer-focus:top-0 peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-[12px]"
      style={{ color: "black" }}
    >
      Phone
    </label>
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
    <label
      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white px-2 text-gray-700 text-sm transition-all peer-focus:top-0 peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-[12px]"
      style={{ color: "black" }}
    >
      Designation
    </label>
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
        <option key={d.DID} value={d.code}>
          {d.code} — {d.name}
        </option>
      ))}
    </select>

    <label
      className="absolute left-4 -top-2 bg-white px-2 text-[12px] text-gray-700"
      style={{ color: "black" }}
    >
      Department
    </label>
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
    <label
      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white px-2 text-gray-700 text-sm transition-all peer-focus:top-0 peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-[12px]"
      style={{ color: "black" }}
    >
      Position
    </label>
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
    <label
      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white px-2 text-gray-700 text-sm transition-all peer-focus:top-0 peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-[12px]"
      style={{ color: "black" }}
    >
      Working Hours
    </label>
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
    <label
      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white px-2 text-gray-700 text-sm transition-all peer-focus:top-0 peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-[12px]"
      style={{ color: "black" }}
    >
      SSR Status
    </label>
  </div>

  {/* NAAC Checkbox */}
  <div
    className="flex items-center gap-3 p-4 rounded-2xl border bg-white/70 backdrop-blur-lg"
    style={{ borderColor: `#00000040` }}
  >
    <input
      type="checkbox"
      checked={form.naacFollowing}
      onChange={(e) => setForm({ ...form, naacFollowing: e.target.checked })}
      className="w-5 h-5 accent-black"
    />
    <span className="text-gray-700 font-medium">NAAC Following</span>
  </div>

  {/* UPLOAD PROFILE PIC */}
{/* UPLOAD PROFILE PIC */}
<label
  className="col-span-2 w-full flex items-center justify-center p-4 rounded-2xl border bg-white/70 backdrop-blur-lg cursor-pointer font-medium gap-3"
  style={{ borderColor: `#00000040` }}
>
  {isUploadingPic ? (
    <>
      <DarkSpinner />
      <span className="text-yellow-600 font-semibold">Uploading…</span>
    </>
  ) : form.profilePic ? (
    <span className="text-green-600 font-semibold">Uploaded ✓</span>
  ) : (
    <span className="text-gray-700">Upload Profile Picture</span>
  )}

  <input
    type="file"
    accept="image/*"
    className="hidden"
    onChange={handlePic}
  />
</label>

</div>
 <div className="flex justify-end gap-3 mt-6">
        <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl border">
          Cancel
        </button>

        <button
          onClick={submit}
          disabled={isAdding}
          className="px-4 py-2 rounded-xl flex items-center gap-2 disabled:opacity-60"
          style={{ background: theme.primary, color: theme.textOnPrimary }}
        >
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
            {/* header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[22px] font-bold">Edit Faculty — {selected.name}</h3>
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
                <p className="text-gray-600 text-sm">Faculty ID: <b>{selected.FID}</b></p>
                <p className="text-gray-600 text-sm">Department: <b>{selected.department}</b></p>
              </div>
            </div>

            {/* edit form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={selected.name} onChange={(e) => setSelected(prev => ({ ...prev, name: e.target.value }))} placeholder="Full Name" className="p-3 rounded-xl border" />
              <input value={selected.email} onChange={(e) => setSelected(prev => ({ ...prev, email: e.target.value }))} placeholder="Email" className="p-3 rounded-xl border" />
              <input value={selected.phone} onChange={(e) => setSelected(prev => ({ ...prev, phone: e.target.value }))} placeholder="Phone" className="p-3 rounded-xl border" />
              <input value={selected.designation} onChange={(e) => setSelected(prev => ({ ...prev, designation: e.target.value }))} placeholder="Designation" className="p-3 rounded-xl border" />
              <input value={selected.position} onChange={(e) => setSelected(prev => ({ ...prev, position: e.target.value }))} placeholder="Position" className="p-3 rounded-xl border" />
              <input value={selected.workingHours} onChange={(e) => setSelected(prev => ({ ...prev, workingHours: e.target.value }))} placeholder="Working Hours" className="p-3 rounded-xl border" />
              <label className="flex items-center gap-2 p-3 border rounded-xl cursor-pointer">
                <span>NAAC Following</span>
                <input type="checkbox" checked={selected.naacFollowing} onChange={(e) => setSelected(prev => ({ ...prev, naacFollowing: e.target.checked }))} className="ml-2" />
              </label>
            </div>

            {/* actions */}
            <div className="flex justify-end gap-3 mt-7">
              <button onClick={() => setSelected(null)} className="px-5 py-2 rounded-xl border font-semibold">Cancel</button>
              <button onClick={() => saveFacultyChanges(selected)} disabled={isSaving} className="px-6 py-2 rounded-xl font-semibold flex items-center gap-2" style={{ background: theme.primary, color: theme.textOnPrimary }}>
                {isSaving ? <Spinner size={16} color="white" /> : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
