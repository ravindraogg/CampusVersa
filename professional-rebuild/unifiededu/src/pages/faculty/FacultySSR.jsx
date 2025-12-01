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
  Loader2
} from "lucide-react";

const SECTIONS = [
  { id: "personal", label: "Profile & Quals", icon: Users },
  { id: "teaching", label: "Teaching & ICT", icon: BookOpen },
  { id: "evaluation", label: "Evaluation", icon: CheckCircle },
  { id: "research", label: "Research & FDP", icon: Award },
  { id: "extension", label: "Extension Activities", icon: Briefcase },
  { id: "mentoring", label: "Mentoring", icon: Users },
  { id: "documents", label: "Proof Uploads", icon: UploadCloud },
];

const FacultySSR = ({ authFetch, theme, pushToast }) => {
  const [activeSection, setActiveSection] = useState("personal");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    personal: {},
    teaching: [],
    evaluation: {},
    research: { publications: [], fdpAttended: [] },
    extension: [],
    mentoring: {},
    documents: []
  });

  // Fetch Data on Load
  useEffect(() => {
    fetchSSRData();
  }, []);

  const fetchSSRData = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/faculty/ssr");
      if (res.ok) {
        const fetchedData = await res.json();
        // Merge with defaults to prevent null crashes
        setData((prev) => ({
            ...prev,
            ...fetchedData,
            research: fetchedData.research || { publications: [], fdpAttended: [] },
            personal: fetchedData.personal || {},
            evaluation: fetchedData.evaluation || {},
            mentoring: fetchedData.mentoring || {}
        }));
      }
    } catch (error) {
      console.error(error);
      pushToast("Failed to load SSR data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (sectionToSave) => {
    try {
      const payload = {
        section: sectionToSave,
        data: data[sectionToSave]
      };

      const res = await authFetch("/faculty/ssr/update", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        pushToast(`${SECTIONS.find(s=>s.id === sectionToSave).label} Saved!`, "success");
      } else {
        pushToast("Save failed", "error");
      }
    } catch (error) {
      pushToast("Server error", "error");
    }
  };

  const updateData = (section, field, value) => {
    setData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  // --- Dynamic Styles ---
  // Calculates a light version of primary color for backgrounds (Hex + 15 opacity)
  const lightPrimaryBg = `${theme.primary}15`; 
  
  // Standard Button Style
  const buttonStyle = {
    backgroundColor: theme.primary,
    color: "#ffffff"
  };

  // Secondary/Light Button Style
  const lightButtonStyle = {
    backgroundColor: lightPrimaryBg,
    color: theme.primary
  };

  // --- RENDERERS FOR SECTIONS ---

  const renderPersonal = () => (
    <div className="space-y-4 animate-in fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-gray-500">Highest Qualification</label>
          <input 
            type="text" 
            className="w-full p-2 border rounded-xl mt-1 outline-none focus:ring-1"
            style={{ borderColor: "inherit", "--tw-ring-color": theme.primary }} 
            placeholder="e.g. Ph.D. in Data Science"
            value={data.personal.qualifications || ""}
            onChange={(e) => updateData("personal", "qualifications", e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500">Specialization</label>
          <input 
            type="text" 
            className="w-full p-2 border rounded-xl mt-1 outline-none focus:ring-1"
            style={{ borderColor: "inherit", "--tw-ring-color": theme.primary }}
            placeholder="e.g. Machine Learning"
            value={data.personal.specialization || ""}
            onChange={(e) => updateData("personal", "specialization", e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500">Teaching Experience (Years)</label>
          <input 
            type="number" 
            className="w-full p-2 border rounded-xl mt-1 outline-none focus:ring-1"
            style={{ borderColor: "inherit", "--tw-ring-color": theme.primary }}
            value={data.personal.experienceTeaching || 0}
            onChange={(e) => updateData("personal", "experienceTeaching", e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500">Industry Experience (Years)</label>
          <input 
            type="number" 
            className="w-full p-2 border rounded-xl mt-1 outline-none focus:ring-1"
            style={{ borderColor: "inherit", "--tw-ring-color": theme.primary }}
            value={data.personal.experienceIndustry || 0}
            onChange={(e) => updateData("personal", "experienceIndustry", e.target.value)}
          />
        </div>
        <div className="col-span-2">
            <label className="text-xs font-bold text-gray-500">Awards & Recognitions</label>
            <textarea 
                className="w-full p-2 border rounded-xl mt-1 h-24 outline-none focus:ring-1"
                style={{ borderColor: "inherit", "--tw-ring-color": theme.primary }}
                placeholder="List any academic awards..."
                value={data.personal.awards || ""}
                onChange={(e) => updateData("personal", "awards", e.target.value)}
            />
        </div>
      </div>
      <button onClick={() => handleSave("personal")} className="px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity" style={buttonStyle}>
        <Save className="w-4 h-4"/> Save Profile
      </button>
    </div>
  );

  const renderTeaching = () => {
    const addRow = () => setData(p => ({ ...p, teaching: [...p.teaching, { courseName: "", methodology: "", ictTools: "" }] }));
    const updateRow = (idx, field, val) => {
        const newData = [...data.teaching];
        newData[idx][field] = val;
        setData(p => ({ ...p, teaching: newData }));
    };
    const removeRow = (idx) => {
        const newData = data.teaching.filter((_, i) => i !== idx);
        setData(p => ({ ...p, teaching: newData }));
    };

    return (
      <div className="space-y-4 animate-in fade-in">
        <p className="text-sm text-gray-500 mb-2">Details of courses taught, innovative methods, and ICT tools used (Criteria 2).</p>
        {data.teaching.map((row, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 relative">
                <button onClick={() => removeRow(i)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input placeholder="Course Name" className="p-2 border rounded-lg outline-none focus:ring-1" style={{ "--tw-ring-color": theme.primary }} value={row.courseName} onChange={e => updateRow(i, 'courseName', e.target.value)} />
                    <input placeholder="Semester" className="p-2 border rounded-lg outline-none focus:ring-1" style={{ "--tw-ring-color": theme.primary }} value={row.semester} onChange={e => updateRow(i, 'semester', e.target.value)} />
                    <input placeholder="Innovative Pedagogy" className="p-2 border rounded-lg outline-none focus:ring-1" style={{ "--tw-ring-color": theme.primary }} value={row.methodology} onChange={e => updateRow(i, 'methodology', e.target.value)} />
                    <input placeholder="ICT Tools Used" className="p-2 border rounded-lg outline-none focus:ring-1" style={{ "--tw-ring-color": theme.primary }} value={row.ictTools} onChange={e => updateRow(i, 'ictTools', e.target.value)} />
                </div>
            </div>
        ))}
        <div className="flex gap-2">
            <button onClick={addRow} className="px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:opacity-80 transition-opacity" style={lightButtonStyle}>
                <Plus className="w-4 h-4"/> Add Course
            </button>
            <button onClick={() => handleSave("teaching")} className="px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity" style={buttonStyle}>
                <Save className="w-4 h-4"/> Save All
            </button>
        </div>
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
                        <label className="text-xs font-bold text-gray-500">Question Papers Set (Count)</label>
                        <input type="number" className="w-full p-2 border rounded-lg bg-white outline-none focus:ring-1" 
                            style={{ "--tw-ring-color": theme.primary }}
                            value={data.evaluation.paperSettingCount || 0}
                            onChange={(e) => updateData("evaluation", "paperSettingCount", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500">Scripts Evaluated (Count)</label>
                        <input type="number" className="w-full p-2 border rounded-lg bg-white outline-none focus:ring-1" 
                            style={{ "--tw-ring-color": theme.primary }}
                            value={data.evaluation.evaluationCount || 0}
                            onChange={(e) => updateData("evaluation", "evaluationCount", e.target.value)}
                        />
                    </div>
                </div>
            </div>
            <div className="p-4 border rounded-2xl bg-gray-50">
                <h4 className="font-bold text-gray-700 mb-2">Quality Assurance</h4>
                <div className="space-y-4 pt-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 rounded"
                            style={{ accentColor: theme.primary }}
                            checked={data.evaluation.rubricsUsed || false}
                            onChange={(e) => updateData("evaluation", "rubricsUsed", e.target.checked)}
                        />
                        <span className="text-sm font-medium">Rubrics used for evaluation</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 rounded"
                            style={{ accentColor: theme.primary }}
                            checked={data.evaluation.copoMappingDone || false}
                            onChange={(e) => updateData("evaluation", "copoMappingDone", e.target.checked)}
                        />
                        <span className="text-sm font-medium">CO-PO Mapping completed</span>
                    </label>
                </div>
            </div>
        </div>
        <button onClick={() => handleSave("evaluation")} className="px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity" style={buttonStyle}>
            <Save className="w-4 h-4"/> Save Details
        </button>
    </div>
  );

  const renderResearch = () => {
    const addPub = () => setData(p => ({ ...p, research: { ...p.research, publications: [...p.research.publications, { title: "", journal: "", year: "" }] } }));
    const updatePub = (idx, field, val) => {
        const newPubs = [...data.research.publications];
        newPubs[idx][field] = val;
        setData(p => ({ ...p, research: { ...p.research, publications: newPubs } }));
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Publications */}
            <div>
                <h3 className="font-bold text-lg mb-2">Publications (Journals/Conferences)</h3>
                {data.research.publications.map((pub, i) => (
                    <div key={i} className="flex gap-2 mb-2 items-center">
                        <span className="text-xs font-bold text-gray-400 w-6">{i+1}.</span>
                        <input placeholder="Paper Title" className="flex-1 p-2 border rounded-lg text-sm outline-none focus:ring-1" style={{ "--tw-ring-color": theme.primary }} value={pub.title} onChange={e => updatePub(i, 'title', e.target.value)} />
                        <input placeholder="Journal/Conf Name" className="w-1/3 p-2 border rounded-lg text-sm outline-none focus:ring-1" style={{ "--tw-ring-color": theme.primary }} value={pub.journal} onChange={e => updatePub(i, 'journal', e.target.value)} />
                        <input placeholder="Year" className="w-20 p-2 border rounded-lg text-sm outline-none focus:ring-1" style={{ "--tw-ring-color": theme.primary }} value={pub.year} onChange={e => updatePub(i, 'year', e.target.value)} />
                    </div>
                ))}
                <button onClick={addPub} className="text-xs font-bold hover:underline flex items-center gap-1 mt-2" style={{ color: theme.primary }}>
                    <Plus className="w-3 h-3"/> Add Publication
                </button>
            </div>

            <div className="border-t pt-4">
                 <h3 className="font-bold text-lg mb-2">Projects & Guidance</h3>
                 <div className="flex gap-4 items-center">
                    <label className="text-sm font-medium">Number of Projects Guided (UG/PG):</label>
                    <input type="number" className="w-20 p-2 border rounded-lg outline-none focus:ring-1" 
                        style={{ "--tw-ring-color": theme.primary }}
                        value={data.research.projectsGuided || 0}
                        onChange={(e) => updateData("research", "projectsGuided", e.target.value)}
                    />
                 </div>
            </div>

            <button onClick={() => handleSave("research")} className="px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity" style={buttonStyle}>
                <Save className="w-4 h-4"/> Save Research Data
            </button>
        </div>
    );
  };

  const renderMentoring = () => (
    <div className="max-w-xl animate-in fade-in">
        <p className="text-sm text-gray-500 mb-4">Details for Student Support & Progression (Criterion 5).</p>
        <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div>
                <label className="text-sm font-bold text-gray-700">Number of Mentees Assigned</label>
                <input type="number" className="w-full p-2 border rounded-xl mt-1 bg-white outline-none focus:ring-1" 
                    style={{ "--tw-ring-color": theme.primary }}
                    value={data.mentoring.menteesCount || 0}
                    onChange={(e) => updateData("mentoring", "menteesCount", e.target.value)}
                />
            </div>
            <div>
                <label className="text-sm font-bold text-gray-700">Formal Meetings Held (This Year)</label>
                <input type="number" className="w-full p-2 border rounded-xl mt-1 bg-white outline-none focus:ring-1" 
                    style={{ "--tw-ring-color": theme.primary }}
                    value={data.mentoring.meetingsHeld || 0}
                    onChange={(e) => updateData("mentoring", "meetingsHeld", e.target.value)}
                />
            </div>
            <div>
                <label className="text-sm font-bold text-gray-700">Remedial Classes Conducted (Hours)</label>
                <input type="number" className="w-full p-2 border rounded-xl mt-1 bg-white outline-none focus:ring-1" 
                    style={{ "--tw-ring-color": theme.primary }}
                    value={data.mentoring.remedialClassesTaken || 0}
                    onChange={(e) => updateData("mentoring", "remedialClassesTaken", e.target.value)}
                />
            </div>
            <button onClick={() => handleSave("mentoring")} className="w-full py-2 rounded-xl font-bold hover:opacity-90 mt-2 transition-opacity" style={buttonStyle}>
                Save Mentoring Data
            </button>
        </div>
    </div>
  );

  const renderDocuments = () => {
    const handleFileUpload = async (e, category) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64Data = reader.result;
            try {
                const res = await authFetch("/faculty/ssr/upload", {
                    method: "POST",
                    body: JSON.stringify({
                        category,
                        title: file.name,
                        fileData: base64Data
                    })
                });
                if (res.ok) {
                    const saved = await res.json();
                    setData(p => ({ ...p, documents: saved.documents }));
                    pushToast("Document Uploaded!", "success");
                }
            } catch (err) {
                pushToast("Upload failed", "error");
            }
        };
    };

    const handleDeleteDoc = async (docId) => {
        try {
            const res = await authFetch(`/faculty/ssr/document/${docId}`, { method: 'DELETE' });
            if (res.ok) {
                setData(p => ({ ...p, documents: p.documents.filter(d => d._id !== docId) }));
                pushToast("Document Deleted", "success");
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
                            Browse
                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, cat)} />
                        </label>
                    </div>
                ))}
            </div>

            <div className="mt-8">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><FileText className="w-5 h-5" style={{ color: theme.primary }}/> Uploaded Files Library</h3>
                {data.documents.length === 0 ? <p className="text-gray-400 italic">No files uploaded yet.</p> : (
                    <div className="bg-white rounded-xl border overflow-hidden">
                        {data.documents.map((doc, i) => (
                            <div key={i} className="flex justify-between items-center p-3 border-b last:border-0 hover:bg-gray-50">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    {/* Dynamic Light Background for Icon */}
                                    <div 
                                        className="w-8 h-8 rounded flex items-center justify-center font-bold text-xs"
                                        style={{ backgroundColor: lightPrimaryBg, color: theme.primary }}
                                    >
                                        {doc.category[0]}
                                    </div>
                                    <div className="truncate">
                                        <p className="text-sm font-bold text-gray-800 truncate">{doc.title}</p>
                                        <p className="text-[10px] text-gray-500">{doc.category} • {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <a href={doc.url} download={doc.title} className="p-2 text-gray-400 hover:text-blue-600"><ExternalLink className="w-4 h-4"/></a>
                                    <button onClick={() => handleDeleteDoc(doc._id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" style={{ color: theme.primary }}/></div>;

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 animate-in slide-in-from-bottom-4">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 shrink-0 space-y-2">
        {SECTIONS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
              activeSection === item.id 
              ? "" 
              : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
            style={{
                backgroundColor: activeSection === item.id ? lightPrimaryBg : "white",
                color: activeSection === item.id ? theme.primary : "#4B5563"
            }}
          >
            <item.icon 
                className="w-4 h-4" 
                style={{ color: activeSection === item.id ? theme.primary : "#9CA3AF" }}
            />
            <span className="text-sm font-bold">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-[2rem] p-6 md:p-8 border border-gray-100 shadow-sm overflow-y-auto custom-scrollbar">
         <div className="mb-6 pb-4 border-b">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                {SECTIONS.find(s => s.id === activeSection)?.icon && 
                    React.createElement(SECTIONS.find(s => s.id === activeSection).icon, { 
                        className: "w-6 h-6",
                        style: { color: theme.primary } 
                    })
                }
                {SECTIONS.find(s => s.id === activeSection)?.label}
            </h2>
            <p className="text-xs text-gray-400 mt-1">Please fill valid data. This will be used for NAAC Accreditation reports.</p>
         </div>

         {activeSection === "personal" && renderPersonal()}
         {activeSection === "teaching" && renderTeaching()}
         {activeSection === "evaluation" && renderEvaluation()}
         {activeSection === "research" && renderResearch()}
         {activeSection === "extension" && (
             <div className="text-center py-20 text-gray-400">
                <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-20"/>
                <p>Extension Activities form is under development.</p>
             </div>
         )}
         {activeSection === "mentoring" && renderMentoring()}
         {activeSection === "documents" && renderDocuments()}
      </div>
    </div>
  );
};

export default FacultySSR;