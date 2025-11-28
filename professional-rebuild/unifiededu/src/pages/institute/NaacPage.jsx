// NaacPage.jsx
import React, { useState, useEffect } from "react";
import { 
  CheckCircle, AlertCircle, FileText, Upload, 
  BrainCircuit, Clock, XCircle, 
  Save, Loader2, Sparkles, Trash2, File
} from "lucide-react";

export default function NaacPage({ authFetch, theme, institute, pushToast }) {
  // --- State ---
  const [activeTab, setActiveTab] = useState("submission"); 
  const [data, setData] = useState(null);
  
  // Two-phase loading state
  const [loading, setLoading] = useState(true);   // For basic data (fast)
  const [aiLoading, setAiLoading] = useState(false); // For AI insights (slow)
  
  // Submission Form State
  const [selectedCriteria, setSelectedCriteria] = useState(null);
  const [formText, setFormText] = useState("");
  const [files, setFiles] = useState([]); // Store selected files
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Load Data Strategy ---
  const loadBasicData = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/institute/naac?ai=0", { method: "GET" });
      const json = await res.json();
      setData(json);
      setLoading(false);
      loadAiData(); 
    } catch (err) {
      console.error(err);
      pushToast({ type: "error", message: "Failed to load NAAC data" });
      setLoading(false);
    }
  };

  const loadAiData = async () => {
    setAiLoading(true);
    try {
      const res = await authFetch("/institute/naac?ai=1", { method: "GET" });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("AI Fetch Error", err);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    loadBasicData();
  }, []);

  // --- File Handling Logic ---
  const handleFileSelect = async (e) => {
    const selected = e.target.files ? Array.from(e.target.files) : [];
    processFiles(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const dropped = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
    processFiles(dropped);
  };

  const processFiles = (fileList) => {
    const newFiles = [];
    let processing = 0;

    fileList.forEach(file => {
      // Basic validation: 5MB limit
      if (file.size > 5 * 1024 * 1024) {
        pushToast({ type: "error", message: `${file.name} is too large (Max 5MB)` });
        return;
      }

      processing++;
      const reader = new FileReader();
      reader.onload = (e) => {
        newFiles.push({
          name: file.name,
          type: file.type,
          size: (file.size / 1024).toFixed(1) + ' KB',
          data: e.target.result // Base64 string
        });
        processing--;
        if (processing === 0) {
          setFiles(prev => [...prev, ...newFiles]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // --- Submit Action ---
  const handleSubmitProof = async () => {
    if (!formText && files.length === 0) {
      return pushToast({ type: "error", message: "Please add description or files" });
    }
    
    setIsSubmitting(true);
    try {
      const res = await authFetch("/institute/naac/submit", {
        method: "POST",
        body: JSON.stringify({
          criteriaId: selectedCriteria.id,
          submissionText: formText,
          evidenceFiles: files // Send the processed Base64 files
        }),
      });

      if (res.ok) {
        pushToast({ type: "success", message: "Proof submitted successfully" });
        setSelectedCriteria(null);
        setFormText("");
        setFiles([]);
        loadBasicData(); 
      } else {
        pushToast({ type: "error", message: "Submission failed" });
      }
    } catch (err) {
      pushToast({ type: "error", message: "Server error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Helpers ---
  const getStatusColor = (status) => {
    switch (status) {
      case "Verified": return "bg-green-100 text-green-700 border-green-200";
      case "Rejected": return "bg-red-100 text-red-700 border-red-200";
      case "Submitted": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Verified": return <CheckCircle className="w-4 h-4" />;
      case "Rejected": return <XCircle className="w-4 h-4" />;
      case "Submitted": return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center text-gray-500">
      <Loader2 className="w-6 h-6 animate-spin mr-2" />
      Loading Compliance Tracker...
    </div>
  );

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="shrink-0 flex flex-col md:flex-row justify-between items-end mb-6 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">NAAC Accreditation</h2>
          <p className="text-gray-500 text-sm mt-1">Track compliance, submit Self Study Reports (SSR), and get AI insights.</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-xl mt-4 md:mt-0">
          <button onClick={() => setActiveTab("submission")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "submission" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            <div className="flex items-center gap-2"><FileText className="w-4 h-4" /> Institute Submission</div>
          </button>
          <button onClick={() => setActiveTab("ai")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "ai" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            <div className="flex items-center gap-2">{aiLoading ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-4 h-4" />} AI Strategy</div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-2 space-y-4 pb-4 custom-scrollbar">
        {/* TAB 1: SUBMISSION */}
        {activeTab === "submission" && (
          <div className="grid grid-cols-1 gap-4">
            {data?.criteria?.map((item) => (
              <div key={item.id} className={`group bg-white p-5 rounded-2xl border transition-all hover:shadow-md ${item.status === 'Rejected' ? 'border-red-200' : 'border-gray-100'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 w-full">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.status === 'Verified' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'}`}>
                      <span className="font-bold text-lg">{item.id}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg">{item.name}</h3>
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border mt-2 ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        {item.status || "Pending"}
                      </div>
                      
                      {/* Submission Preview */}
                      {(item.submissionText || (item.evidenceFiles && item.evidenceFiles.length > 0)) && (
                        <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                          {item.submissionText && <p className="text-sm text-gray-600 mb-2">"{item.submissionText}"</p>}
                          {item.evidenceFiles && item.evidenceFiles.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {item.evidenceFiles.map((file, idx) => (
                                <span key={idx} className="text-xs bg-white border px-2 py-1 rounded flex items-center gap-1 text-gray-500">
                                  <FileText className="w-3 h-3"/> {file.title || "Document"}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {item.adminComments && (
                        <div className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 flex gap-2 items-start">
                          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                          <div><span className="font-bold block text-xs uppercase mb-1">Admin Feedback:</span>{item.adminComments}</div>
                        </div>
                      )}
                    </div>
                  </div>
                  {item.status !== 'Verified' && (
                    <button onClick={() => { setSelectedCriteria(item); setFormText(item.submissionText || ""); setFiles([]); }} className="ml-4 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition shadow-lg shrink-0 whitespace-nowrap">
                      {item.status === 'Rejected' ? 'Resubmit' : item.status === 'Submitted' ? 'Edit' : 'Submit Proof'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: AI STRATEGY (Kept same as before) */}
        {activeTab === "ai" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {!aiLoading && data?.criteria?.map((item) => (
              <div key={item.id} className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-3xl border border-indigo-100 relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                <div className="flex items-center gap-2 mb-3 text-indigo-600"><BrainCircuit className="w-5 h-5" /><span className="font-bold text-xs uppercase tracking-wider">AI Suggestion</span></div>
                <h4 className="font-bold text-gray-800 mb-2">{item.name}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{item.suggestion || "AI analysis pending..."}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- SUBMISSION MODAL (With Drag & Drop) --- */}
      {selectedCriteria && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Submit Proof</h3>
                <p className="text-gray-500 text-sm">Criterion {selectedCriteria.id}: {selectedCriteria.name}</p>
              </div>
              <button onClick={() => setSelectedCriteria(null)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">✕</button>
            </div>

            <div className="space-y-4 overflow-y-auto custom-scrollbar pr-1">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description / Metric Details</label>
                <textarea
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none h-32 text-sm"
                  placeholder="Describe your compliance, mention metric numbers..."
                />
              </div>

              {/* Drag & Drop Zone */}
              <div 
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={handleDrop}
                onClick={() => document.getElementById('fileUpload').click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer bg-gray-50 group"
              >
                <input 
                  type="file" 
                  id="fileUpload" 
                  multiple 
                  className="hidden" 
                  onChange={handleFileSelect}
                />
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-indigo-500" />
                </div>
                <p className="text-sm font-medium text-gray-700">Click to upload or drag & drop</p>
                <p className="text-xs text-gray-400 mt-1">PDF, DOCX, Images (Max 5MB)</p>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="space-y-2 mt-2">
                  <p className="text-xs font-bold text-gray-500 uppercase">Attached Files ({files.length})</p>
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded bg-white border flex items-center justify-center text-gray-500">
                          <File className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                          <p className="text-[10px] text-gray-400">{file.size}</p>
                        </div>
                      </div>
                      <button onClick={() => removeFile(index)} className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6 shrink-0 pt-4 border-t border-gray-100">
              <button onClick={() => setSelectedCriteria(null)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleSubmitProof} disabled={isSubmitting} className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />}
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}