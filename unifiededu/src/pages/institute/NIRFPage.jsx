import React, { useState, useEffect } from "react";
import {
  Save, Loader2, RefreshCw, Users, BookOpen, 
  IndianRupee, FlaskConical, GraduationCap, 
  Globe, LayoutGrid, AlertCircle, Info, UploadCloud, 
  FileText, ArrowRight, CheckCircle, X
} from "lucide-react";
const API_URL = import.meta.env.VITE_BACK_URI;
export default function NIRFPage({ authFetch, theme, institute, pushToast }) {
  // --- State ---
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("studentStrength");
  const [academicYear, setAcademicYear] = useState("2024-2025");
  const [uploadStatus, setUploadStatus] = useState("");
  // Bulk Upload State
  const [uploading, setUploading] = useState(false);
  const [parsedData, setParsedData] = useState(null); // Holds AI result for preview
  const [showPreview, setShowPreview] = useState(false);

  // Store reference data (names lists) separately from form numbers
  const [referenceData, setReferenceData] = useState({
    facultyNames: [] 
  });
  
  // Initial State matching NIRFStats.js Schema
  const [formData, setFormData] = useState({
    studentStrength: {
      sanctionedIntake: 0, totalEnrolled: 0,
      diversity: { withinState: 0, outsideState: 0, outsideCountry: 0, economicallyBackward: 0, sociallyChallenged: 0 }
    },
    facultyDetails: {
      totalFaculty: 0, phdCount: 0, femaleFaculty: 0,
      experience: { avgTeachingExp: 0, avgIndustryExp: 0 }
    },
    financialResources: {
      capitalExpenditure: { library: 0, newEquipment: 0, engineeringWorkshops: 0, otherAssets: 0 },
      operationalExpenditure: { salaries: 0, maintenance: 0, seminarsConferences: 0 }
    },
    researchPerformance: {
      publications: { scopus: 0, webOfScience: 0, googleScholar: 0, ici: 0 },
      citations: { totalCitations: 0, citationsPerPaper: 0 },
      ipr: { patentsFiled: 0, patentsPublished: 0, patentsGranted: 0, patentsLicensed: 0 },
      sponsoredResearch: { projectCount: 0, totalFundingAmount: 0 },
      consultancy: { projectCount: 0, totalAmount: 0 }
    },
    graduationOutcomes: {
      studentsGraduated: 0,
      placements: { studentsPlaced: 0, medianSalary: 0 },
      higherStudies: 0, phdStudentsGraduated: 0
    },
    outreachInclusivity: {
      womenDiversityPercentage: 0, physicallyChallengedStudents: 0, outreachPrograms: 0
    }
  });

  // --- Fetch Saved Data ---
  const fetchNIRFData = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`/institute/nirf?year=${academicYear}`); 
      if (res.ok) {
        const data = await res.json();
        if(data) {
           setFormData(prev => ({
             ...prev,
             ...data,
             studentStrength: { ...prev.studentStrength, ...(data.studentStrength || {}) },
             facultyDetails: { ...prev.facultyDetails, ...(data.facultyDetails || {}) },
             financialResources: { ...prev.financialResources, ...(data.financialResources || {}) },
             researchPerformance: { ...prev.researchPerformance, ...(data.researchPerformance || {}) },
             graduationOutcomes: { ...prev.graduationOutcomes, ...(data.graduationOutcomes || {}) },
             outreachInclusivity: { ...prev.outreachInclusivity, ...(data.outreachInclusivity || {}) },
           }));
        }
      }
    } catch (err) {
      console.error("NIRF Load Error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNIRFData();
  }, [academicYear]);

// --- HANDLER: BULK UPLOAD (Robust Token Fix) ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. ROBUST TOKEN RETRIEVAL
    // Based on your screenshot, we check 'instituteToken' first, then 'authToken'
    const token = localStorage.getItem('instituteToken') || 
                  localStorage.getItem('authToken') || 
                  localStorage.getItem('token'); 

    // Debugging: Log exactly what is being sent
    console.log("Attempting upload with token:", token ? `${token.substring(0, 10)}...` : "NULL");

    if (!token) {
        pushToast({ type: "error", message: "Authentication Error: No token found. Please log in again." });
        return;
    }

    setUploading(true);
    setUploadStatus("Uploading..."); // Update status text

    const form = new FormData();
    form.append('file', file);

    try {
        const res = await fetch(`${API_URL}/institute/nirf/bulk-upload`, {
            method: "POST",
            headers: { 
                // Authorization header must include 'Bearer ' prefix
                "Authorization": `Bearer ${token}` 
            },
            body: form
        });

        const result = await res.json();

        if (res.ok && result.success) {
            setParsedData(result.data);
            setShowPreview(true);
            setUploadStatus("Success!");
            pushToast({ type: "success", message: "Document Parsed Successfully" });
        } else {
            console.error("Upload failed details:", result);
            setUploadStatus("Error: " + (result.message || "Upload failed"));
            pushToast({ type: "error", message: result.message || "Failed to parse document" });
        }
    } catch (err) {
        console.error("Network error:", err);
        setUploadStatus("Network Error");
        pushToast({ type: "error", message: "Upload failed: Server connection error" });
    } finally {
        setUploading(false);
        e.target.value = null; // Reset file input to allow re-upload
    }
  };
  // --- HANDLER: MERGE PARSED DATA ---
  const handleMergeData = () => {
    if (!parsedData) return;

    // Deep merge logic: Only update fields that the AI found (not null)
    setFormData(prev => {
        const newData = { ...prev };
        
        const updateRecursive = (target, source) => {
            Object.keys(source).forEach(key => {
                if (source[key] !== null && typeof source[key] === 'object') {
                    if (!target[key]) target[key] = {};
                    updateRecursive(target[key], source[key]);
                } else if (source[key] !== null && source[key] !== undefined) {
                    target[key] = Number(source[key]);
                }
            });
        };

        updateRecursive(newData, parsedData);
        return newData;
    });

    setShowPreview(false);
    setParsedData(null);
    pushToast({ type: "success", message: "Data Merged! Click Save to confirm." });
  };

  // --- Handlers (Existing) ---
  const handleNestedChange = (section, subsection, field, value) => {
    setFormData(prev => {
      const updated = { ...prev };
      if (subsection) {
        updated[section][subsection][field] = Number(value);
      } else {
        updated[section][field] = Number(value);
      }
      return updated;
    });
  };

  const handleAutoSync = async () => {
    pushToast({ type: "info", message: "Analyzing Institute Database..." });
    setLoading(true);

    try {
      const res = await authFetch(`/institute/nirf/sync?year=${academicYear}`);
      
      if (res.ok) {
        const syncedData = await res.json();
        
        if (syncedData.meta) {
          setReferenceData(prev => ({ ...prev, ...syncedData.meta }));
        }

        setFormData(prev => ({
          ...prev,
          studentStrength: { ...prev.studentStrength, ...syncedData.studentStrength },
          facultyDetails: { ...prev.facultyDetails, ...syncedData.facultyDetails },
          researchPerformance: { ...prev.researchPerformance, ...syncedData.researchPerformance },
          graduationOutcomes: { ...prev.graduationOutcomes, ...syncedData.graduationOutcomes },
          outreachInclusivity: { ...prev.outreachInclusivity, ...syncedData.outreachInclusivity }
        }));

        pushToast({ type: "success", message: "Data synced successfully!" });
      } else {
        pushToast({ type: "error", message: "Sync failed. Please try again." });
      }
    } catch (err) {
      console.error("Sync Error", err);
      pushToast({ type: "error", message: "Server connection failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { academicYear, ...formData };
      const res = await authFetch("/institute/nirf/update", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      if (res.ok) pushToast({ type: "success", message: "NIRF Data Saved Successfully" });
      else pushToast({ type: "error", message: "Failed to save data" });
    } catch (err) {
      pushToast({ type: "error", message: "Server error during save" });
    } finally {
      setSaving(false);
    }
  };

  // --- UI Components ---
  const InputGroup = ({ label, value, onChange, prefix, note, hoverList }) => {
    const [showPopover, setShowPopover] = useState(false);

    return (
      <div 
        className="bg-gray-50 p-3 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors relative group"
        onMouseEnter={() => hoverList && hoverList.length > 0 && setShowPopover(true)}
        onMouseLeave={() => setShowPopover(false)}
      >
        <div className="flex justify-between items-center mb-1">
          <label className="block text-xs font-bold text-gray-500 uppercase">{label}</label>
          {hoverList && hoverList.length > 0 && (
             <Info className="w-3 h-3 text-blue-400 cursor-help" />
          )}
        </div>

        <div className="flex items-center relative">
          {prefix && <span className="mr-2 text-gray-400 text-sm font-medium">{prefix}</span>}
          <input 
            type="number" 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all font-semibold text-gray-700"
          />
        </div>
        {note && <p className="text-[10px] text-gray-400 mt-1">{note}</p>}

        {showPopover && hoverList && (
          <div className="absolute left-0 bottom-full mb-2 w-48 bg-white border border-gray-200 shadow-xl rounded-lg z-50 animate-in fade-in zoom-in-95 duration-200">
             <div className="bg-gray-100 px-3 py-2 rounded-t-lg border-b border-gray-200 text-xs font-bold text-gray-600">
               Included List ({hoverList.length})
             </div>
             <div className="max-h-40 overflow-y-auto p-2 custom-scrollbar">
               {hoverList.map((name, idx) => (
                 <div key={idx} className="text-xs text-gray-700 py-1 border-b border-gray-50 last:border-0 truncate">
                   • {name}
                 </div>
               ))}
             </div>
             <div className="absolute left-4 -bottom-1 w-2 h-2 bg-white border-b border-r border-gray-200 transform rotate-45"></div>
          </div>
        )}
      </div>
    );
  };

  const sections = [
    { id: "studentStrength", label: "Student Strength", icon: Users },
    { id: "facultyDetails", label: "Faculty Info", icon: BookOpen },
    { id: "financialResources", label: "Financial Resources", icon: IndianRupee },
    { id: "researchPerformance", label: "Research & IPR", icon: FlaskConical },
    { id: "graduationOutcomes", label: "Graduation Outcomes", icon: GraduationCap },
    { id: "outreachInclusivity", label: "Outreach (OI)", icon: Globe },
  ];

  // --- PREVIEW MODAL RENDERER ---
  const renderPreviewModal = () => {
    if (!showPreview || !parsedData) return null;
    
    // Helper to render rows comparing Current vs Extracted
    const diffRow = (label, section, sub, key) => {
        // Safe access to nested properties
        const current = sub ? formData[section][sub][key] : formData[section][key];
        const extracted = sub ? parsedData[section]?.[sub]?.[key] : parsedData[section]?.[key];

        // Only show if AI actually found a value for this field
        if (extracted === undefined || extracted === null) return null;

        return (
            <tr className="border-b last:border-0 hover:bg-green-50/50 transition-colors">
                <td className="p-3 text-sm text-gray-600 font-medium">{label}</td>
                <td className="p-3 text-sm font-bold text-gray-400">{current || 0}</td>
                <td className="p-3 text-sm font-bold text-green-600 flex items-center gap-2 bg-green-50/30 rounded-r-lg">
                    {extracted} <ArrowRight className="w-3 h-3"/>
                </td>
            </tr>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 bg-green-50 border-b border-green-100 flex justify-between items-center">
                    <h3 className="font-bold text-green-800 flex items-center gap-2">
                        <FileText className="w-5 h-5"/> Data Extracted Successfully
                    </h3>
                    <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-5 h-5"/></button>
                </div>
                
                <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <p className="text-sm text-gray-500 mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100 text-blue-700">
                       <Info className="w-3 h-3 inline mr-1"/> 
                       The AI has analyzed your document. Please review the extracted numbers below against your current data before merging.
                    </p>
                    
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-100 text-xs uppercase text-gray-500 sticky top-0">
                            <tr>
                                <th className="p-3 rounded-tl-lg">Field</th>
                                <th className="p-3">Current Value</th>
                                <th className="p-3 rounded-tr-lg">New (From Doc)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Example Comparisons - The modal will only show what was found */}
                            {diffRow("Library Expenditure", "financialResources", "capitalExpenditure", "library")}
                            {diffRow("New Equipment", "financialResources", "capitalExpenditure", "newEquipment")}
                            {diffRow("Maintenance", "financialResources", "operationalExpenditure", "maintenance")}
                            {diffRow("Scopus Publications", "researchPerformance", "publications", "scopus")}
                            {diffRow("Patents Granted", "researchPerformance", "ipr", "patentsGranted")}
                            {diffRow("Median Salary", "graduationOutcomes", "placements", "medianSalary")}
                            {diffRow("Total Enrolled", "studentStrength", null, "totalEnrolled")}
                            {/* You can add more diffRow calls for other fields here */}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
                    <button onClick={() => setShowPreview(false)} className="px-4 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors">
                        Discard
                    </button>
                    <button onClick={handleMergeData} className="px-4 py-2 rounded-lg text-sm font-bold bg-green-600 text-white hover:bg-green-700 shadow-lg flex items-center gap-2 transition-transform hover:scale-105">
                        <CheckCircle className="w-4 h-4"/> Merge & Update Form
                    </button>
                </div>
            </div>
        </div>
    );
  };

  if (loading && !formData.studentStrength) return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400"/></div>;

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 relative">
      
      {/* RENDER MODAL IF ACTIVE */}
      {renderPreviewModal()}

      {/* Header */}
      <div className="shrink-0 flex flex-col md:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <LayoutGrid className="w-6 h-6 text-blue-600"/> NIRF Data Entry
          </h2>
          <p className="text-gray-500 text-sm mt-1">Part II: Institute Level Data (Aggregates to University Report)</p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          
          <div className="flex items-center gap-2">
            <select 
              value={academicYear} 
              onChange={(e) => setAcademicYear(e.target.value)}
              className="bg-white border border-gray-200 text-sm rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-700 cursor-pointer"
            >
              <option value="2024-2025">2024-2025</option>
              <option value="2023-2024">2023-2024</option>
            </select>

          {/* --- UPLOAD BUTTON GROUP --- */}
<div className="flex flex-col items-end">
  <label className={`flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-bold hover:bg-purple-100 transition-colors border border-purple-100 cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
      {uploading ? <Loader2 className="w-4 h-4 animate-spin"/> : <UploadCloud className="w-4 h-4" />}
      {uploading ? "Parsing..." : "Upload Report"}
      <input 
        type="file" 
        className="hidden" 
        accept=".pdf,.csv,.xlsx" 
        onChange={handleFileUpload} 
      />
  </label>
  
  {/* Add this status text below the button */}
  {uploadStatus && (
    <span className={`text-[10px] mt-1 font-medium ${uploadStatus.includes("Error") ? "text-red-500" : "text-green-600"}`}>
      {uploadStatus}
    </span>
  )}
</div>
          </div>

        
          
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />}
            Save Data
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0 gap-6">
        
        {/* Sidebar */}
        <div className="w-64 shrink-0 flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-2">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeSection === section.id 
                  ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              <section.icon className={`w-4 h-4 ${activeSection === section.id ? "text-blue-600" : "text-gray-400"}`} />
              {section.label}
            </button>
          ))}
          
          <div className="mt-auto p-4 bg-yellow-50 rounded-xl border border-yellow-100 text-yellow-800 text-xs">
            <div className="flex items-center gap-2 font-bold mb-1">
              <AlertCircle className="w-3 h-3"/> Note
            </div>
            Data synced from Auto-Sync is an aggregation. Please verify numbers before final submission.
          </div>
        </div>

        {/* Form Area */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-6 overflow-y-auto custom-scrollbar shadow-sm relative">
           
           {loading && (
             <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
               <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
             </div>
           )}

          {/* 1. Student Strength */}
          {activeSection === "studentStrength" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Student Strength & Diversity</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="Sanctioned Intake" value={formData.studentStrength.sanctionedIntake} onChange={(v) => handleNestedChange("studentStrength", null, "sanctionedIntake", v)} />
                <InputGroup label="Total Enrolled" value={formData.studentStrength.totalEnrolled} onChange={(v) => handleNestedChange("studentStrength", null, "totalEnrolled", v)} />
              </div>
              
              <h4 className="text-sm font-bold text-gray-600 mt-4 flex items-center gap-2"><Globe className="w-4 h-4"/> Diversity Metrics</h4>
              <div className="grid grid-cols-3 gap-4">
                <InputGroup label="Within State" value={formData.studentStrength.diversity.withinState} onChange={(v) => handleNestedChange("studentStrength", "diversity", "withinState", v)} />
                <InputGroup label="Outside State" value={formData.studentStrength.diversity.outsideState} onChange={(v) => handleNestedChange("studentStrength", "diversity", "outsideState", v)} />
                <InputGroup label="International" value={formData.studentStrength.diversity.outsideCountry} onChange={(v) => handleNestedChange("studentStrength", "diversity", "outsideCountry", v)} />
                <InputGroup label="Economically Backward" value={formData.studentStrength.diversity.economicallyBackward} onChange={(v) => handleNestedChange("studentStrength", "diversity", "economicallyBackward", v)} />
                <InputGroup label="Socially Challenged (SC/ST/OBC)" value={formData.studentStrength.diversity.sociallyChallenged} onChange={(v) => handleNestedChange("studentStrength", "diversity", "sociallyChallenged", v)} />
              </div>
            </div>
          )}

          {/* 2. Faculty Details (WITH HOVER LIST) */}
          {activeSection === "facultyDetails" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Faculty Information</h3>
              <div className="grid grid-cols-3 gap-4">
                <InputGroup 
                   label="Total Faculty" 
                   value={formData.facultyDetails.totalFaculty} 
                   onChange={(v) => handleNestedChange("facultyDetails", null, "totalFaculty", v)} 
                   hoverList={referenceData.facultyNames} 
                />
                <InputGroup label="Ph.D. Holders" value={formData.facultyDetails.phdCount} onChange={(v) => handleNestedChange("facultyDetails", null, "phdCount", v)} />
                <InputGroup label="Female Faculty" value={formData.facultyDetails.femaleFaculty} onChange={(v) => handleNestedChange("facultyDetails", null, "femaleFaculty", v)} />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <InputGroup label="Avg Teaching Experience (Years)" value={formData.facultyDetails.experience.avgTeachingExp} onChange={(v) => handleNestedChange("facultyDetails", "experience", "avgTeachingExp", v)} />
                <InputGroup label="Avg Industry Experience (Years)" value={formData.facultyDetails.experience.avgIndustryExp} onChange={(v) => handleNestedChange("facultyDetails", "experience", "avgIndustryExp", v)} />
              </div>
            </div>
          )}

          {/* 3. Financial Resources */}
          {activeSection === "financialResources" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Financial Resources (In Rupees)</h3>
              
              <h4 className="text-sm font-bold text-green-700 bg-green-50 p-2 rounded">Capital Expenditure (Excluding Buildings)</h4>
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="Library (Books & Journals)" prefix="₹" value={formData.financialResources.capitalExpenditure.library} onChange={(v) => handleNestedChange("financialResources", "capitalExpenditure", "library", v)} />
                <InputGroup label="New Equipment for Labs" prefix="₹" value={formData.financialResources.capitalExpenditure.newEquipment} onChange={(v) => handleNestedChange("financialResources", "capitalExpenditure", "newEquipment", v)} />
                <InputGroup label="Engineering Workshops" prefix="₹" value={formData.financialResources.capitalExpenditure.engineeringWorkshops} onChange={(v) => handleNestedChange("financialResources", "capitalExpenditure", "engineeringWorkshops", v)} />
                <InputGroup label="Other Assets" prefix="₹" value={formData.financialResources.capitalExpenditure.otherAssets} onChange={(v) => handleNestedChange("financialResources", "capitalExpenditure", "otherAssets", v)} />
              </div>

              <h4 className="text-sm font-bold text-orange-700 bg-orange-50 p-2 rounded mt-2">Operational Expenditure</h4>
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="Salaries (Teaching & Non-Teaching)" prefix="₹" value={formData.financialResources.operationalExpenditure.salaries} onChange={(v) => handleNestedChange("financialResources", "operationalExpenditure", "salaries", v)} />
                <InputGroup label="Maintenance of Academic Infrastructure" prefix="₹" value={formData.financialResources.operationalExpenditure.maintenance} onChange={(v) => handleNestedChange("financialResources", "operationalExpenditure", "maintenance", v)} />
                <InputGroup label="Seminars / Conferences" prefix="₹" value={formData.financialResources.operationalExpenditure.seminarsConferences} onChange={(v) => handleNestedChange("financialResources", "operationalExpenditure", "seminarsConferences", v)} />
              </div>
            </div>
          )}

          {/* 4. Research */}
          {activeSection === "researchPerformance" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Research & Professional Practice</h3>
              
              <div className="grid grid-cols-4 gap-4">
                 <InputGroup label="Scopus" value={formData.researchPerformance.publications.scopus} onChange={(v) => handleNestedChange("researchPerformance", "publications", "scopus", v)} />
                 <InputGroup label="Web of Science" value={formData.researchPerformance.publications.webOfScience} onChange={(v) => handleNestedChange("researchPerformance", "publications", "webOfScience", v)} />
                 <InputGroup label="Patents Published" value={formData.researchPerformance.ipr.patentsPublished} onChange={(v) => handleNestedChange("researchPerformance", "ipr", "patentsPublished", v)} />
                 <InputGroup label="Patents Granted" value={formData.researchPerformance.ipr.patentsGranted} onChange={(v) => handleNestedChange("researchPerformance", "ipr", "patentsGranted", v)} />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 bg-purple-50 p-4 rounded-xl border border-purple-100">
                 <div>
                    <h5 className="font-bold text-xs text-purple-800 uppercase mb-2">Sponsored Research</h5>
                    <div className="grid grid-cols-2 gap-2">
                       <InputGroup label="Projects" value={formData.researchPerformance.sponsoredResearch.projectCount} onChange={(v) => handleNestedChange("researchPerformance", "sponsoredResearch", "projectCount", v)} />
                       <InputGroup label="Amount (₹)" value={formData.researchPerformance.sponsoredResearch.totalFundingAmount} onChange={(v) => handleNestedChange("researchPerformance", "sponsoredResearch", "totalFundingAmount", v)} />
                    </div>
                 </div>
                 <div>
                    <h5 className="font-bold text-xs text-purple-800 uppercase mb-2">Consultancy</h5>
                    <div className="grid grid-cols-2 gap-2">
                       <InputGroup label="Projects" value={formData.researchPerformance.consultancy.projectCount} onChange={(v) => handleNestedChange("researchPerformance", "consultancy", "projectCount", v)} />
                       <InputGroup label="Amount (₹)" value={formData.researchPerformance.consultancy.totalAmount} onChange={(v) => handleNestedChange("researchPerformance", "consultancy", "totalAmount", v)} />
                    </div>
                 </div>
              </div>
            </div>
          )}

          {/* 5. Graduation Outcomes */}
          {activeSection === "graduationOutcomes" && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Graduation Outcomes</h3>
              <div className="grid grid-cols-2 gap-4">
                 <InputGroup label="Students Graduated (UG/PG)" value={formData.graduationOutcomes.studentsGraduated} onChange={(v) => handleNestedChange("graduationOutcomes", null, "studentsGraduated", v)} />
                 <InputGroup label="Selected for Higher Studies" value={formData.graduationOutcomes.higherStudies} onChange={(v) => handleNestedChange("graduationOutcomes", null, "higherStudies", v)} />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                 <InputGroup label="Students Placed" value={formData.graduationOutcomes.placements.studentsPlaced} onChange={(v) => handleNestedChange("graduationOutcomes", "placements", "studentsPlaced", v)} />
                 <InputGroup label="Median Salary (LPA)" prefix="₹" value={formData.graduationOutcomes.placements.medianSalary} onChange={(v) => handleNestedChange("graduationOutcomes", "placements", "medianSalary", v)} />
              </div>
             </div>
          )}

          {/* 6. Outreach */}
          {activeSection === "outreachInclusivity" && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Outreach & Inclusivity</h3>
              <div className="grid grid-cols-3 gap-4">
                 <InputGroup label="Women Diversity %" value={formData.outreachInclusivity.womenDiversityPercentage} onChange={(v) => handleNestedChange("outreachInclusivity", null, "womenDiversityPercentage", v)} />
                 <InputGroup label="Physically Challenged Students" value={formData.outreachInclusivity.physicallyChallengedStudents} onChange={(v) => handleNestedChange("outreachInclusivity", null, "physicallyChallengedStudents", v)} />
                 <InputGroup label="Outreach Programs Organized" value={formData.outreachInclusivity.outreachPrograms} onChange={(v) => handleNestedChange("outreachInclusivity", null, "outreachPrograms", v)} />
              </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
}