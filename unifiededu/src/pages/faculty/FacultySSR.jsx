import React, { useState, useEffect } from "react";
import {
  Save,
  Plus,
  Trash2,
  FileText,
  UploadCloud,
  CheckCircle,
  BookOpen,
  Award,
  Users,
  Briefcase,
  ExternalLink,
  Loader2,
  BarChart3,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
const API_URL = import.meta.env.VITE_BACK_URI;
// --- CONSTANTS ---
const SECTIONS = [
  { id: "personal", label: "Profile & Quals", icon: Users },
  { id: "nirf", label: "NIRF Contribution (Level C)", icon: BarChart3 },
  { id: "teaching", label: "Teaching & ICT", icon: BookOpen },
  { id: "evaluation", label: "Evaluation", icon: CheckCircle },
  { id: "research", label: "Research Details (SSR)", icon: Award },
  { id: "fdp", label: "FDP / Workshops", icon: Award },
  { id: "extension", label: "Extension Activities", icon: Briefcase },
  { id: "mentoring", label: "Mentoring", icon: Users },
  { id: "workload", label: "Workload", icon: Briefcase },
  { id: "coattainment", label: "CO Attainment", icon: CheckCircle },
  { id: "recognitions", label: "Recognitions", icon: Award },
  { id: "documents", label: "Proof Uploads", icon: UploadCloud },
];

const LOCAL_STORAGE_KEY = "faculty_ssr_draft_final";

const FacultySSR = ({ authFetch, theme, pushToast }) => {
  const [activeSection, setActiveSection] = useState("personal");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // --- INITIAL STATE ---
  const initialState = {
    personal: {},
    teaching: [],
    evaluation: {},
    research: { publications: [], fdpAttended: [], projectsGuided: 0 },
    extension: [],
    mentoring: {},
    documents: [], 
    workload: {},
    coattainment: [],
    recognitions: [],
    // Unified NIRF Schema
    nirfStats: {
        researchPerformance: {
            publications: { scopus: 0, webOfScience: 0, googleScholar: 0, ici: 0 },
            citations: { totalCitations: 0, hIndex: 0 },
            ipr: { patentsFiled: 0, patentsPublished: 0, patentsGranted: 0, patentsLicensed: 0 },
            sponsoredResearch: { projectCount: 0, totalFundingAmount: 0 },
            consultancy: { projectCount: 0, totalAmount: 0 }
        },
        other: { booksPublished: 0, phdGuided: 0 }
    }
  };

  const [data, setData] = useState(initialState);

  // --- 1. LOAD DATA (Cache -> Server) ---
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      
      // A. Try Local Storage
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        try {
          const parsedCache = JSON.parse(cached);
          setData(parsedCache);
          setHasUnsavedChanges(true);
        } catch (e) { console.error("Cache error", e); }
      }

      // B. Fetch Fresh Data from Server
      try {
        const [resSSR, resNIRF, resProfile] = await Promise.all([
            authFetch("/faculty/ssr"),
            authFetch("/faculty/nirf/get"),
            authFetch("/faculty/me")
        ]);

        if (resSSR.ok) {
          const serverSSR = await resSSR.json();
          const serverNIRF = resNIRF.ok ? await resNIRF.json() : null;
          const profile = resProfile.ok ? await resProfile.json() : null;

          setData(prev => {
            // If cache exists, we keep it as master.
            if (cached) return prev;

            return {
                ...initialState,
                ...serverSSR,
                // Ensure arrays are initialized to avoid .map() errors
                teaching: serverSSR.teaching || [],
                coattainment: serverSSR.coattainment || [],
                recognitions: serverSSR.recognitions || [],
                extension: serverSSR.extension || [],
                documents: serverSSR.documents || [],
                research: serverSSR.research || { publications: [], fdpAttended: [] },
                
                // Merge NIRF (Server Data > Default)
                nirfStats: serverNIRF || prev.nirfStats,

                // Pre-fill Personal if empty
                personal: {
                    ...serverSSR.personal,
                    qualifications: serverSSR.personal?.qualifications || profile?.qualification || "",
                    experienceTeaching: serverSSR.personal?.experienceTeaching || (profile?.experience ? parseInt(profile.experience) : 0),
                }
            };
          });
        }
      } catch (error) {
        console.error(error);
        // Silent fail is acceptable here to allow offline editing
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  // --- 2. AUTO-SAVE TO LOCAL STORAGE ---
  useEffect(() => {
    const handler = setTimeout(() => {
      if (JSON.stringify(data) !== JSON.stringify(initialState)) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        setHasUnsavedChanges(true);
      }
    }, 1000);
    return () => clearTimeout(handler);
  }, [data]);

  // --- 3. SAVE LOGIC (Bulk Upload) ---
  const handleSave = async (sectionToSave) => {
    setSaving(true);
    try {
      // Step A: Upload Pending Files (Queued in Local Storage)
      const pendingDocs = data.documents.filter(doc => doc.pendingUpload);
      let updatedDocuments = [...data.documents];

      if (pendingDocs.length > 0) {
        pushToast(`Uploading ${pendingDocs.length} pending files...`, "info");
        
        for (const doc of pendingDocs) {
           const uploadRes = await authFetch("/faculty/ssr/upload", {
             method: "POST",
             body: JSON.stringify({
               category: doc.category,
               title: doc.title,
               fileData: doc.url // Base64 string
             })
           });

           if (uploadRes.ok) {
             const result = await uploadRes.json();
             // Match returned doc or use current
             const uploadedDoc = result.documents ? result.documents.find(d => d.title === doc.title) : doc;
             
             // Update local state: Remove 'pendingUpload', set real URL/ID
             updatedDocuments = updatedDocuments.map(d => 
               d.tempId === doc.tempId ? { ...uploadedDoc, tempId: undefined, pendingUpload: undefined } : d
             );
           }
        }
        // Update state with uploaded files
        setData(prev => ({ ...prev, documents: updatedDocuments }));
      }

      // Step B: Save Data Section
      let endpoint = "/faculty/ssr/update";
      let payload = { section: sectionToSave, data: data[sectionToSave] };

      // Redirect Logic
      if (sectionToSave === 'nirf') {
         endpoint = "/faculty/nirf/update";
         payload = data.nirfStats; 
      } else if (sectionToSave === 'documents') {
         // Sync the clean document list
         payload = { section: 'documents', data: updatedDocuments };
      }

      const res = await authFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        pushToast("Saved Successfully!", "success");
        localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear draft on success
        setHasUnsavedChanges(false);
      } else {
        throw new Error("Save Failed");
      }

    } catch (error) {
      console.error(error);
      pushToast("Save failed. Data saved in local draft.", "error");
    } finally {
      setSaving(false);
    }
  };

  // --- HELPERS ---
  const updateData = (section, field, value) => {
    setData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  const updateNirf = (category, subField, value) => {
      setData(prev => ({
          ...prev,
          nirfStats: {
              ...prev.nirfStats,
              researchPerformance: {
                  ...prev.nirfStats.researchPerformance,
                  [category]: {
                      ...prev.nirfStats.researchPerformance[category],
                      [subField]: Number(value)
                  }
              }
          }
      }));
  };
  
  const updateNirfOther = (field, value) => {
      setData(prev => ({
          ...prev,
          nirfStats: { ...prev.nirfStats, other: { ...prev.nirfStats.other, [field]: Number(value) } }
      }));
  };

  // --- STYLES ---
  const lightPrimaryBg = `${theme.primary}15`; 
  const buttonStyle = { backgroundColor: theme.primary, color: "#ffffff" };
  const lightButtonStyle = { backgroundColor: lightPrimaryBg, color: theme.primary };

  // --- RENDERERS ---

  const renderPersonal = () => (
    <div className="space-y-4 animate-in fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-gray-500">Highest Qualification</label>
          <input type="text" className="w-full p-2 border rounded-xl mt-1 outline-none focus:ring-1" style={{ borderColor: "inherit", "--tw-ring-color": theme.primary }} 
            value={data.personal.qualifications || ""} onChange={(e) => updateData("personal", "qualifications", e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500">Specialization</label>
          <input type="text" className="w-full p-2 border rounded-xl mt-1 outline-none focus:ring-1" style={{ borderColor: "inherit", "--tw-ring-color": theme.primary }}
            value={data.personal.specialization || ""} onChange={(e) => updateData("personal", "specialization", e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500">Teaching Experience (Years)</label>
          <input type="number" className="w-full p-2 border rounded-xl mt-1 outline-none focus:ring-1" style={{ borderColor: "inherit", "--tw-ring-color": theme.primary }}
            value={data.personal.experienceTeaching || 0} onChange={(e) => updateData("personal", "experienceTeaching", e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500">Industry Experience (Years)</label>
          <input type="number" className="w-full p-2 border rounded-xl mt-1 outline-none focus:ring-1" style={{ borderColor: "inherit", "--tw-ring-color": theme.primary }}
            value={data.personal.experienceIndustry || 0} onChange={(e) => updateData("personal", "experienceIndustry", e.target.value)} />
        </div>
        <div className="col-span-2">
            <label className="text-xs font-bold text-gray-500">Awards & Recognitions</label>
            <textarea className="w-full p-2 border rounded-xl mt-1 h-24 outline-none focus:ring-1" style={{ borderColor: "inherit", "--tw-ring-color": theme.primary }}
                placeholder="List any academic awards..." value={data.personal.awards || ""} onChange={(e) => updateData("personal", "awards", e.target.value)} />
        </div>
      </div>
      <button onClick={() => handleSave("personal")} disabled={saving} className="px-6 py-2 rounded-xl font-bold flex items-center gap-2 text-white" style={buttonStyle}>
        {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>} Save Profile
      </button>
    </div>
  );

  const renderNIRF = () => (
    <div className="space-y-6 animate-in fade-in">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800 mb-4">
            <h4 className="font-bold flex items-center gap-2"><BarChart3 className="w-4 h-4"/> NIRF Contribution Sheet</h4>
            <p>Data synced automatically. Edits are saved locally until submission.</p>
        </div>
        <div className="p-5 border rounded-2xl bg-white shadow-sm">
            <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Publications</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['scopus', 'webOfScience', 'googleScholar', 'ici'].map(key => (
                    <div key={key}>
                        <label className="text-xs font-bold text-gray-500 uppercase">{key.replace(/([A-Z])/g, ' $1')}</label>
                        <input type="number" className="w-full p-2 border rounded-lg mt-1 outline-none focus:ring-1" style={{ "--tw-ring-color": theme.primary }}
                            value={data.nirfStats.researchPerformance?.publications?.[key] || 0}
                            onChange={(e) => updateNirf('publications', key, e.target.value)} />
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-dashed">
                <div>
                     <label className="text-xs font-bold text-gray-500 uppercase">Total Citations</label>
                     <input type="number" className="w-full p-2 border rounded-lg mt-1 bg-gray-50 outline-none focus:ring-1" style={{ "--tw-ring-color": theme.primary }}
                        value={data.nirfStats.researchPerformance?.citations?.totalCitations || 0}
                        onChange={(e) => {
                             const newData = { ...data.nirfStats };
                             newData.researchPerformance.citations.totalCitations = Number(e.target.value);
                             setData(prev => ({ ...prev, nirfStats: newData }));
                        }}
                     />
                </div>
            </div>
        </div>
        <button onClick={() => handleSave("nirf")} disabled={saving} className="w-full py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 hover:opacity-95 transition-opacity" style={buttonStyle}>
            {saving ? <Loader2 className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5"/>} Submit NIRF Data
        </button>
    </div>
  );

  const renderTeaching = () => {
    const addRow = () => setData(p => ({ ...p, teaching: [...p.teaching, { courseName: "", methodology: "", ictTools: "" }] }));
    const updateRow = (idx, field, val) => {
        const arr = [...data.teaching];
        arr[idx][field] = val;
        setData(p => ({ ...p, teaching: arr }));
    };
    const removeRow = (idx) => setData(p => ({ ...p, teaching: p.teaching.filter((_, i) => i !== idx) }));

    return (
      <div className="space-y-4 animate-in fade-in">
        <p className="text-sm text-gray-500 mb-2">Details of courses taught and ICT tools used.</p>
        {data.teaching.map((row, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 relative">
                <button onClick={() => removeRow(i)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input placeholder="Course Name" className="p-2 border rounded-lg" value={row.courseName} onChange={e => updateRow(i, 'courseName', e.target.value)} />
                    <input placeholder="Semester" className="p-2 border rounded-lg" value={row.semester} onChange={e => updateRow(i, 'semester', e.target.value)} />
                    <input placeholder="Innovative Pedagogy" className="p-2 border rounded-lg" value={row.methodology} onChange={e => updateRow(i, 'methodology', e.target.value)} />
                    <input placeholder="ICT Tools" className="p-2 border rounded-lg" value={row.ictTools} onChange={e => updateRow(i, 'ictTools', e.target.value)} />
                </div>
            </div>
        ))}
        <div className="flex gap-2">
            <button onClick={addRow} className="px-4 py-2 rounded-xl font-bold flex gap-2" style={lightButtonStyle}><Plus className="w-4 h-4"/> Add</button>
            <button onClick={() => handleSave("teaching")} disabled={saving} className="px-6 py-2 rounded-xl font-bold text-white" style={buttonStyle}>Save</button>
        </div>
      </div>
    );
  };

  const renderResearch = () => {
    const addPub = () => setData(p => ({ ...p, research: { ...p.research, publications: [...p.research.publications, { title: "", journal: "", year: "" }] } }));
    const updatePub = (idx, field, val) => {
        const arr = [...data.research.publications];
        arr[idx][field] = val;
        setData(p => ({ ...p, research: { ...p.research, publications: arr } }));
    };
    return (
        <div className="space-y-6 animate-in fade-in">
            <div>
                <h3 className="font-bold text-lg mb-2">Publications List</h3>
                {data.research.publications.map((pub, i) => (
                    <div key={i} className="flex gap-2 mb-2 items-center">
                        <input placeholder="Title" className="flex-1 p-2 border rounded-lg" value={pub.title} onChange={e => updatePub(i, 'title', e.target.value)} />
                        <input placeholder="Journal" className="w-1/3 p-2 border rounded-lg" value={pub.journal} onChange={e => updatePub(i, 'journal', e.target.value)} />
                        <input placeholder="Year" className="w-20 p-2 border rounded-lg" value={pub.year} onChange={e => updatePub(i, 'year', e.target.value)} />
                    </div>
                ))}
                <button onClick={addPub} className="text-xs font-bold hover:underline flex items-center gap-1 mt-2" style={{ color: theme.primary }}><Plus className="w-3 h-3"/> Add</button>
            </div>
            <button onClick={() => handleSave("research")} disabled={saving} className="px-6 py-2 rounded-xl font-bold text-white" style={buttonStyle}>Save Research</button>
        </div>
    );
  };

  const renderEvaluation = () => (
    <div className="space-y-6 animate-in fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border rounded-2xl bg-gray-50">
                <h4 className="font-bold text-gray-700 mb-2">Exam Duties</h4>
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-bold text-gray-500">Question Papers Set</label>
                        <input type="number" className="w-full p-2 border rounded-lg bg-white" 
                            value={data.evaluation.paperSettingCount || 0}
                            onChange={(e) => updateData("evaluation", "paperSettingCount", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Scripts Evaluated</label>
                        <input type="number" className="w-full p-2 border rounded-lg bg-white" 
                            value={data.evaluation.evaluationCount || 0}
                            onChange={(e) => updateData("evaluation", "evaluationCount", e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>
        <button onClick={() => handleSave("evaluation")} disabled={saving} className="px-6 py-2 rounded-xl font-bold text-white" style={buttonStyle}>Save</button>
    </div>
  );

  const renderMentoring = () => (
    <div className="max-w-xl animate-in fade-in">
        <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div>
                <label className="text-sm font-bold text-gray-700">Mentees Assigned</label>
                <input type="number" className="w-full p-2 border rounded-xl mt-1 bg-white" 
                    value={data.mentoring.menteesCount || 0}
                    onChange={(e) => updateData("mentoring", "menteesCount", e.target.value)}
                />
            </div>
            <button onClick={() => handleSave("mentoring")} disabled={saving} className="w-full py-2 rounded-xl font-bold text-white mt-2" style={buttonStyle}>Save</button>
        </div>
    </div>
  );

  const renderDocuments = () => {
    const handleFileSelect = (e, category) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { pushToast("File > 2MB. Please compress.", "error"); return; }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const newDoc = {
                tempId: Date.now(),
                category,
                title: file.name,
                url: reader.result,
                type: file.type,
                uploadedAt: new Date().toISOString(),
                pendingUpload: true
            };
            setData(prev => ({ ...prev, documents: [...prev.documents, newDoc] }));
            pushToast("File staged. Click Save to Upload.", "info");
        };
    };

    const handleDeleteDoc = async (docId, tempId) => {
        if (tempId) {
            setData(prev => ({ ...prev, documents: prev.documents.filter(d => d.tempId !== tempId) }));
            return;
        }
        try {
            const res = await authFetch(`/faculty/ssr/document/${docId}`, { method: 'DELETE' });
            if (res.ok) {
                setData(p => ({ ...p, documents: p.documents.filter(d => d._id !== docId) }));
                pushToast("Deleted", "success");
            }
        } catch (e) { pushToast("Delete failed", "error"); }
    };

    const categories = ["Lesson Plan", "Question Paper", "Publication Proof", "Certificate", "Event Report", "Others"];

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(cat => (
                    <div key={cat} className="p-4 border border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 transition-colors">
                        <UploadCloud className="w-6 h-6 text-gray-400"/>
                        <span className="text-sm font-bold text-gray-600">{cat}</span>
                        <label className="text-xs bg-white border px-3 py-1 rounded-lg cursor-pointer hover:shadow-sm">
                            Select File <input type="file" className="hidden" onChange={(e) => handleFileSelect(e, cat)} />
                        </label>
                    </div>
                ))}
            </div>
            <div className="bg-white rounded-xl border overflow-hidden mt-6">
                <div className="p-3 bg-gray-50 border-b font-bold text-gray-700 flex justify-between">
                    <span>Files Library</span>
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">{data.documents.length}</span>
                </div>
                {data.documents.map((doc, i) => (
                    <div key={i} className="flex justify-between items-center p-3 border-b last:border-0 hover:bg-gray-50">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded flex items-center justify-center font-bold text-xs" style={{ backgroundColor: lightPrimaryBg, color: theme.primary }}>{doc.category[0]}</div>
                            <div className="truncate min-w-0">
                                <p className="text-sm font-bold text-gray-800 truncate flex items-center gap-2">
                                    {doc.title}
                                    {doc.pendingUpload && <span className="text-[9px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded border border-orange-200">Pending</span>}
                                </p>
                                <p className="text-[10px] text-gray-500">{doc.category} • {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleDeleteDoc(doc._id, doc.tempId)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={() => handleSave("documents")} disabled={saving} className="w-full py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2" style={buttonStyle}>
                {saving ? <Loader2 className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5"/>} Sync Files
            </button>
        </div>
    );
  };

  const renderWorkload = () => (
    <div className="space-y-4 animate-in fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input placeholder="Theory Hours" type="number" className="p-2 border rounded-xl"
          value={data.workload.theory || ""} onChange={e => updateData("workload", "theory", e.target.value)} />
        <input placeholder="Lab Hours" type="number" className="p-2 border rounded-xl"
          value={data.workload.lab || ""} onChange={e => updateData("workload", "lab", e.target.value)} />
        <input placeholder="Tutorial Hours" type="number" className="p-2 border rounded-xl"
          value={data.workload.tutorial || ""} onChange={e => updateData("workload", "tutorial", e.target.value)} />
        <input placeholder="Other Duties" type="text" className="p-2 border rounded-xl"
          value={data.workload.otherDuties || ""} onChange={e => updateData("workload", "otherDuties", e.target.value)} />
      </div>
      <button onClick={() => handleSave("workload")} className="px-6 py-2 rounded-xl font-bold text-white" style={buttonStyle}>Save Workload</button>
    </div>
  );

  const renderFDP = () => {
    const addFDP = () => setData(p => ({ ...p, research: { ...p.research, fdpAttended: [...p.research.fdpAttended, { title: "", organizer: "", duration: "" }] } }));
    const updateFDP = (i, field, val) => {
      const arr = [...data.research.fdpAttended];
      arr[i][field] = val;
      setData(p => ({ ...p, research: { ...p.research, fdpAttended: arr } }));
    };
    return (
      <div className="space-y-4 animate-in fade-in">
        {data.research.fdpAttended.map((fdp, i) => (
          <div key={i} className="p-4 border rounded-xl bg-gray-50">
            <input placeholder="FDP Title" className="p-2 border rounded-xl w-full mb-2" value={fdp.title} onChange={e => updateFDP(i, "title", e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
                <input placeholder="Organizer" className="p-2 border rounded-xl w-full" value={fdp.organizer} onChange={e => updateFDP(i, "organizer", e.target.value)} />
                <input placeholder="Duration" className="p-2 border rounded-xl w-full" value={fdp.duration} onChange={e => updateFDP(i, "duration", e.target.value)} />
            </div>
          </div>
        ))}
        <button onClick={addFDP} className="px-4 py-2 rounded-xl font-bold flex gap-2" style={lightButtonStyle}><Plus className="w-4 h-4"/> Add FDP</button>
        <button onClick={() => handleSave("research")} className="px-6 py-2 rounded-xl font-bold text-white mt-2" style={buttonStyle}>Save FDPs</button>
      </div>
    );
  };

  const renderCOAttainment = () => {
    const addRow = () => setData(p => ({ ...p, coattainment: [...p.coattainment, { courseName: "", co1: 0, co2: 0, co3: 0, actionTaken: "" }] }));
    const updateRow = (i, field, val) => {
      const arr = [...data.coattainment];
      arr[i][field] = val;
      setData(p => ({ ...p, coattainment: arr }));
    };
    return (
      <div className="space-y-4 animate-in fade-in">
        {data.coattainment.map((row, i) => (
          <div key={i} className="p-4 rounded-xl border bg-gray-50">
            <input placeholder="Course Name" className="p-2 border rounded-xl w-full mb-2" value={row.courseName} onChange={e => updateRow(i, "courseName", e.target.value)} />
            <div className="grid grid-cols-3 gap-3 mb-2">
              <input placeholder="CO1" type="number" className="p-2 border rounded-xl" value={row.co1} onChange={e => updateRow(i, "co1", e.target.value)} />
              <input placeholder="CO2" type="number" className="p-2 border rounded-xl" value={row.co2} onChange={e => updateRow(i, "co2", e.target.value)} />
              <input placeholder="CO3" type="number" className="p-2 border rounded-xl" value={row.co3} onChange={e => updateRow(i, "co3", e.target.value)} />
            </div>
            <textarea placeholder="Action taken" className="p-2 border rounded-xl w-full h-20" value={row.actionTaken} onChange={e => updateRow(i, "actionTaken", e.target.value)} />
          </div>
        ))}
        <button onClick={addRow} className="px-4 py-2 rounded-xl font-bold flex gap-2" style={lightButtonStyle}><Plus className="w-4 h-4"/> Add Course CO</button>
        <button onClick={() => handleSave("coattainment")} className="px-6 py-2 rounded-xl font-bold text-white mt-2" style={buttonStyle}>Save CO Attainment</button>
      </div>
    );
  };

  const renderRecognitions = () => {
    const addRec = () => setData(p => ({ ...p, recognitions: [...p.recognitions, { title: "", by: "", year: "" }] }));
    const updateRec = (i, field, val) => {
      const arr = [...data.recognitions];
      arr[i][field] = val;
      setData(p => ({ ...p, recognitions: arr }));
    };
    return (
      <div className="space-y-4 animate-in fade-in">
        {data.recognitions.map((rec, i) => (
          <div key={i} className="p-4 border rounded-xl bg-gray-50">
            <input placeholder="Title" className="p-2 border rounded-xl w-full mb-2" value={rec.title} onChange={e => updateRec(i, "title", e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
                <input placeholder="Awarded By" className="p-2 border rounded-xl w-full" value={rec.by} onChange={e => updateRec(i, "by", e.target.value)} />
                <input placeholder="Year" className="p-2 border rounded-xl w-full" value={rec.year} onChange={e => updateRec(i, "year", e.target.value)} />
            </div>
          </div>
        ))}
        <button onClick={addRec} className="px-4 py-2 rounded-xl font-bold flex gap-2" style={lightButtonStyle}><Plus className="w-4 h-4"/> Add</button>
        <button onClick={() => handleSave("recognitions")} className="px-6 py-2 rounded-xl font-bold text-white mt-2" style={buttonStyle}>Save Recognitions</button>
      </div>
    );
  };

  const renderExtension = () => {
    const addExt = () => setData(p => ({ ...p, extension: [...p.extension, { activity: "", role: "", date: "" }] }));
    const updateExt = (i, field, val) => {
      const arr = [...data.extension];
      arr[i][field] = val;
      setData(p => ({ ...p, extension: arr }));
    };
    return (
      <div className="space-y-4 animate-in fade-in">
        {data.extension.map((ext, i) => (
          <div key={i} className="p-4 border rounded-xl bg-gray-50">
            <input placeholder="Activity Name" className="p-2 border rounded-xl w-full mb-2" value={ext.activity} onChange={e => updateExt(i, "activity", e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
                <input placeholder="Role" className="p-2 border rounded-xl w-full" value={ext.role} onChange={e => updateExt(i, "role", e.target.value)} />
                <input placeholder="Date" className="p-2 border rounded-xl w-full" value={ext.date} onChange={e => updateExt(i, "date", e.target.value)} />
            </div>
          </div>
        ))}
        <button onClick={addExt} className="px-4 py-2 rounded-xl font-bold flex gap-2" style={lightButtonStyle}><Plus className="w-4 h-4"/> Add Activity</button>
        <button onClick={() => handleSave("extension")} className="px-6 py-2 rounded-xl font-bold text-white mt-2" style={buttonStyle}>Save Extension</button>
      </div>
    );
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" style={{ color: theme.primary }}/></div>;

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 animate-in slide-in-from-bottom-4">
      {/* Sidebar */}
      <div className="w-full md:w-64 shrink-0 space-y-2">
        {SECTIONS.map((item) => (
          <button key={item.id} onClick={() => setActiveSection(item.id)} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${activeSection === item.id ? "" : "bg-white text-gray-600 hover:bg-gray-50"}`} style={{ backgroundColor: activeSection === item.id ? lightPrimaryBg : "white", color: activeSection === item.id ? theme.primary : "#4B5563" }}>
            <item.icon className="w-4 h-4" style={{ color: activeSection === item.id ? theme.primary : "#9CA3AF" }} />
            <span className="text-sm font-bold">{item.label}</span>
          </button>
        ))}
        <div className={`mt-4 p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${hasUnsavedChanges ? "bg-orange-50 border-orange-100 text-orange-600" : "bg-green-50 border-green-100 text-green-600"}`}>
            {hasUnsavedChanges ? <><AlertTriangle className="w-3 h-3"/> Unsaved Draft</> : <><CheckCircle className="w-3 h-3"/> All Synced</>}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white rounded-[2rem] p-6 md:p-8 border border-gray-100 shadow-sm overflow-y-auto custom-scrollbar">
         <div className="mb-6 pb-4 border-b flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">{SECTIONS.find(s => s.id === activeSection)?.label}</h2>
            <button onClick={() => { localStorage.removeItem(LOCAL_STORAGE_KEY); window.location.reload(); }} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1" title="Discard Draft"><RefreshCw className="w-3 h-3"/> Reset</button>
         </div>

         {activeSection === "personal" && renderPersonal()}
         {activeSection === "nirf" && renderNIRF()}
         {activeSection === "documents" && renderDocuments()}
         {activeSection === "teaching" && renderTeaching()}
         {activeSection === "research" && renderResearch()}
         {activeSection === "evaluation" && renderEvaluation()}
         {activeSection === "mentoring" && renderMentoring()}
         {activeSection === "workload" && renderWorkload()}
         {activeSection === "coattainment" && renderCOAttainment()}
         {activeSection === "fdp" && renderFDP()}
         {activeSection === "recognitions" && renderRecognitions()}
         {activeSection === "extension" && renderExtension()}
      </div>
    </div>
  );
};

export default FacultySSR;