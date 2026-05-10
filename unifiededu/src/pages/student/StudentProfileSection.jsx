import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Mail,
  Phone,
  Award,
  GraduationCap,
  CalendarDays,
  ShieldCheck,
  ScrollText,
  BarChart2,
  BookOpen,
  Users,
  CheckCircle,
  AlertCircle,
  Camera,
  Loader2,
  Edit,
  X,
  Save,
  MapPin,
  Clock,
  Layout,
  Globe, Sparkles, Target 
} from "lucide-react";

// Replaced import.meta.env with a placeholder to prevent build errors in the preview environment
const API_URL = import.meta.env.VITE_BACKEND_URL;

// Helper Component for Section Header
const SectionHeader = ({ title, subtitle, onEdit, theme }) => (
  <div className="mb-4 md:mb-6 border-b border-gray-100 pb-3 md:pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-3 md:gap-0">
    <div>
      <h2 className="text-xl md:text-2xl font-bold text-gray-800">{title}</h2>
      {subtitle && <p className="text-gray-500 text-xs md:text-sm mt-1">{subtitle}</p>}
    </div>
    {onEdit && (
      <button
        onClick={onEdit}
        className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-bold hover:opacity-80 transition-all shadow-md"
        style={{ 
          backgroundColor: theme?.primary || "#000", 
          color: "#ffffff" 
        }}
      >
        <Edit className="w-3 h-3 md:w-4 md:h-4" /> Edit Profile
      </button>
    )}
  </div>
);

const StudentProfileSection = ({ student, institute, theme, refreshProfile }) => {
  const [uploading, setUploading] = useState(false);
  const [localImage, setLocalImage] = useState(null);

  // --- EDIT MODAL STATE ---
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeEditTab, setActiveEditTab] = useState("personal");
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    phone: "",
    name: "",
    state: "",
    city: "",
    independentProfile: {
      institutionName: "",
      board: "",
      programName: "",
      academicYear: "",
      careerInterests: "",
      targetExams: "",
      preferredSkills: ""
    },
    previousEducation: {
      primary: { schoolName: "", board: "", marks: "", yearOfPassing: "" },
      secondary: { schoolName: "", board: "", marks: "", yearOfPassing: "" }
    },
    preferredLanguage: "en"
  });

  // Load initial data into form
  useEffect(() => {
    if (student) {
      setEditForm({
        phone: student.phone || "",
        name: student.name || "",
        state: student.state || "",
        city: student.city || "",
        independentProfile: {
          institutionName: student.independentProfile?.institutionName || "",
          board: student.independentProfile?.board || "",
          programName: student.independentProfile?.programName || "",
          academicYear: student.independentProfile?.academicYear || "",
          careerInterests: student.independentProfile?.careerInterests?.join(", ") || "",
          targetExams: student.independentProfile?.targetExams?.join(", ") || "",
          preferredSkills: student.independentProfile?.preferredSkills?.join(", ") || ""
        },
        previousEducation: {
          primary: { 
            schoolName: student.previousEducation?.primary?.schoolName || "", 
            board: student.previousEducation?.primary?.board || "", 
            marks: student.previousEducation?.primary?.marks || "", 
            yearOfPassing: student.previousEducation?.primary?.yearOfPassing || "" 
          },
          secondary: { 
            schoolName: student.previousEducation?.secondary?.schoolName || "", 
            board: student.previousEducation?.secondary?.board || "", 
            marks: student.previousEducation?.secondary?.marks || "", 
            yearOfPassing: student.previousEducation?.secondary?.yearOfPassing || "" 
          }
        },
        preferredLanguage: student.preferredLanguage || "en"
      });
    }
  }, [student, showEditModal]);

  if (!student) return null;

  // --- IMAGE UPLOAD ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Please upload an image under 5MB.");
      return;
    }

    setUploading(true);
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64String = reader.result;

      try {
        const token = localStorage.getItem("studentToken");
        const res = await fetch(`${API_URL}/student/update-profile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ profilePic: base64String }),
        });

        if (res.ok) {
          setLocalImage(base64String);
          if (refreshProfile) refreshProfile(); // Trigger parent reload
        } else {
          alert("Failed to upload image");
        }
      } catch (err) {
        console.error(err);
        alert("Error uploading image");
      } finally {
        setUploading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  // --- EDIT HANDLERS ---
  const handleInputChange = (e, path = null) => {
    const { name, value } = e.target;
    if (path) {
      const parts = path.split(".");
      setEditForm(prev => {
        let updated = { ...prev };
        let current = updated;
        for (let i = 0; i < parts.length - 1; i++) {
          current[parts[i]] = { ...current[parts[i]] };
          current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
        return updated;
      });
    } else {
      setEditForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("studentToken");
      
      // Process comma separated strings back to arrays
      const finalData = {
        ...editForm,
        independentProfile: {
          ...editForm.independentProfile,
          careerInterests: editForm.independentProfile.careerInterests.split(",").map(s => s.trim()).filter(Boolean),
          targetExams: editForm.independentProfile.targetExams.split(",").map(s => s.trim()).filter(Boolean),
          preferredSkills: editForm.independentProfile.preferredSkills.split(",").map(s => s.trim()).filter(Boolean)
        },
        preferredLanguage: editForm.preferredLanguage
      };

      const res = await fetch(`${API_URL}/student/update-profile`, {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(finalData),
      });

      if (res.ok) {
        if (refreshProfile) refreshProfile();
        setShowEditModal(false);
      } else {
        alert("Failed to update profile. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error occurred.");
    } finally {
      setSaving(false);
    }
  };

  // --- UI COMPONENTS ---
  const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-2 md:gap-3 p-2 md:p-3 rounded-xl bg-gray-50 border border-gray-100">
      <div
        className="mt-1 p-1.5 md:p-2 rounded-lg bg-white shadow-sm"
        style={{ color: theme.primary }}
      >
        <Icon className="w-4 h-4 md:w-5 md:h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] md:text-xs text-gray-500 font-medium uppercase truncate">{label}</p>
        <p className="text-xs md:text-sm font-bold text-gray-800 mt-0.5 break-words">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );

  const StatCard = ({ label, value, icon: Icon, colorClass }) => (
    <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-3 md:gap-4 relative overflow-hidden">
      <div
        className={`p-3 md:p-4 rounded-full ${colorClass} bg-opacity-10 text-${
          colorClass.split("-")[1]
        }-600`}
      >
        <Icon className="w-6 h-6 md:w-8 md:h-8" />
      </div>
      <div className="z-10">
        <h3 className="text-xl md:text-3xl font-extrabold text-gray-800">{value}</h3>
        <p className="text-xs md:text-sm text-gray-500 font-medium">{label}</p>
      </div>
      <div
        className={`absolute -bottom-6 -right-6 w-16 h-16 md:w-24 md:h-24 rounded-full ${colorClass} opacity-5 pointer-events-none`}
      ></div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 space-y-6 md:space-y-8 pb-10 relative">
      <SectionHeader
        title="My Profile"
        subtitle="Manage your personal and academic details"
        onEdit={() => setShowEditModal(true)}
        theme={theme} 
      />

      {/* --- EDIT MODAL OVERLAY --- */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-white/20">
            
            {/* Modal Header */}
            <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center bg-white">
              <div>
                 <h3 className="text-2xl font-black text-gray-800 tracking-tight">Edit Profile</h3>
                 <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Independent Enrollment</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-3 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all hover:rotate-90"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Tabs */}
             <div className="flex border-b border-gray-100 px-6 bg-gray-50/50">
                {['personal', 'academic', 'career', 'settings'].map(tab => (
                   <button
                     key={tab}
                     onClick={() => setActiveEditTab(tab)}
                     className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeEditTab === tab ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                   >
                     {tab}
                     {activeEditTab === tab && <div className="absolute bottom-0 left-6 right-6 h-1 bg-indigo-600 rounded-full"></div>}
                   </button>
                ))}
             </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar">
              
              {activeEditTab === 'personal' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                        <input name="name" value={editForm.name} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                        <input name="phone" value={editForm.phone} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold" placeholder="+91..." />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">State</label>
                        <input name="state" value={editForm.state} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City</label>
                        <input name="city" value={editForm.city} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold" />
                      </div>
                   </div>
                </div>
              )}

              {activeEditTab === 'academic' && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
                   <div className="space-y-6">
                      <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-2">Current Education</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Institution Name</label>
                            <input value={editForm.independentProfile.institutionName} onChange={(e) => handleInputChange(e, 'independentProfile.institutionName')} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold" placeholder="e.g. Self Study / XYZ College" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Board / University</label>
                            <input value={editForm.independentProfile.board} onChange={(e) => handleInputChange(e, 'independentProfile.board')} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold" placeholder="e.g. CBSE, VTU" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Program Name</label>
                            <input value={editForm.independentProfile.programName} onChange={(e) => handleInputChange(e, 'independentProfile.programName')} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold" placeholder="e.g. B.E Computer Science" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Academic Year</label>
                            <input value={editForm.independentProfile.academicYear} onChange={(e) => handleInputChange(e, 'independentProfile.academicYear')} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold" placeholder="2024-25" />
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-2">Previous Education (X / XII)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-4">
                            <p className="text-[10px] font-black text-gray-500">Secondary Education (X)</p>
                            <input value={editForm.previousEducation.primary.schoolName} onChange={(e) => handleInputChange(e, 'previousEducation.primary.schoolName')} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold" placeholder="School Name" />
                            <input value={editForm.previousEducation.primary.marks} onChange={(e) => handleInputChange(e, 'previousEducation.primary.marks')} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold" placeholder="Marks (%)" />
                         </div>
                         <div className="space-y-4">
                            <p className="text-[10px] font-black text-gray-500">Higher Secondary (XII)</p>
                            <input value={editForm.previousEducation.secondary.schoolName} onChange={(e) => handleInputChange(e, 'previousEducation.secondary.schoolName')} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold" placeholder="College Name" />
                            <input value={editForm.previousEducation.secondary.marks} onChange={(e) => handleInputChange(e, 'previousEducation.secondary.marks')} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold" placeholder="Marks (%)" />
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {activeEditTab === 'career' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Career Interests</label>
                      <textarea value={editForm.independentProfile.careerInterests} onChange={(e) => handleInputChange(e, 'independentProfile.careerInterests')} rows="2" className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold" placeholder="Comma separated: Software Engineer, Data Scientist..." />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Exams</label>
                      <input value={editForm.independentProfile.targetExams} onChange={(e) => handleInputChange(e, 'independentProfile.targetExams')} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold" placeholder="Comma separated: GATE, JEE, UPSC..." />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Preferred Skills</label>
                      <input value={editForm.independentProfile.preferredSkills} onChange={(e) => handleInputChange(e, 'independentProfile.preferredSkills')} className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold" placeholder="Comma separated: React, Python, UI/UX..." />
                   </div>
                </div>
              )}

              {activeEditTab === 'settings' && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
                   <div className="p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100 flex items-start gap-4">
                      <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600">
                         <Sparkles size={24} />
                      </div>
                      <div>
                         <h4 className="text-sm font-black text-indigo-900 uppercase tracking-tight">AI & Language Settings</h4>
                         <p className="text-xs text-indigo-700 mt-1 font-medium leading-relaxed opacity-80">
                            Set your preferred language for platform-wide AI explanations, 
                            localized content, and voice-enabled interactions.
                         </p>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Preferred Language</label>
                      <div className="relative">
                        <select 
                          value={editForm.preferredLanguage} 
                          onChange={(e) => setEditForm({ ...editForm, preferredLanguage: e.target.value })}
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold appearance-none cursor-pointer"
                        >
                          <option value="en">English (Global)</option>
                          <option value="hi">Hindi (हिन्दी)</option>
                          <option value="ta">Tamil (தமிழ்)</option>
                          <option value="te">Telugu (తెలుగు)</option>
                          <option value="kn">Kannada (ಕನ್ನಡ)</option>
                          <option value="ml">Malayalam (മലയാളം)</option>
                          <option value="bn">Bengali (বাংলা)</option>
                          <option value="mr">Marathi (मराठी)</option>
                          <option value="gu">Gujarati (ગુજરાતી)</option>
                          <option value="pa">Punjabi (ਪੰਜਾਬੀ)</option>
                          <option value="or">Odia (ଓଡ଼ିଆ)</option>
                          <option value="as">Assamese (অসমীয়া)</option>
                          <option value="ur">Urdu (اردو)</option>
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                           <ChevronDown size={18} />
                        </div>
                      </div>
                   </div>
                </div>
              )}

              <div className="pt-8 border-t border-gray-100 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-8 py-4 rounded-2xl bg-gray-100 text-gray-600 text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-4 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-black hover:shadow-xl hover:shadow-slate-200 transition-all flex items-center gap-2"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PROFILE CARD --- */}
      <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-5 md:p-8 shadow-lg border border-gray-100 relative overflow-hidden">
        <div
          className="absolute top-0 left-0 w-full h-24 md:h-32 opacity-10"
          style={{ backgroundColor: theme.primary }}
        ></div>
        <div
          className="absolute top-[-50px] right-[-50px] w-48 h-48 md:w-64 md:h-64 rounded-full opacity-10"
          style={{ backgroundColor: theme.secondary }}
        ></div>

        <div className="relative flex flex-col md:flex-row gap-5 md:gap-8 items-center md:items-start">
          <div className="flex flex-col items-center space-y-3 md:space-y-4">
            <div
              className="w-24 h-24 md:w-32 md:h-32 rounded-full p-1.5 border-4 bg-white shadow-md relative group"
              style={{ borderColor: theme.primary }}
            >
              <div className="w-full h-full rounded-full bg-gray-100 overflow-hidden flex items-center justify-center relative">
                {localImage || student.profilePic ? (
                  <img
                    src={localImage || student.profilePic}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl md:text-4xl font-bold text-gray-300">
                    {student.name?.charAt(0)}
                  </span>
                )}

                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
                  {uploading ? (
                    <Loader2 className="w-6 h-6 md:w-8 md:h-8 text-white animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              </div>

              {/* Status Badge */}
              <div
                className={`absolute bottom-0 right-0 md:bottom-1 md:right-1 w-6 h-6 md:w-8 md:h-8 rounded-full border-2 md:border-4 border-white flex items-center justify-center shadow-sm z-20 bg-green-500`}
              >
                 <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-white" />
              </div>
            </div>

            <span className="px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-green-50 text-green-700 text-[10px] md:text-xs font-bold border border-green-200 flex items-center gap-1">
               Active Student
            </span>
          </div>

          <div className="flex-1 w-full pt-0 md:pt-2">
            <div className="mb-4 md:mb-6 text-center md:text-left">
              <h1 className="text-xl md:text-3xl font-extrabold text-gray-800 break-words">
                {student.name}
              </h1>
              <p className="text-sm md:text-lg text-gray-500 font-medium flex flex-wrap items-center justify-center md:justify-start gap-2 mt-1">
                <span style={{ color: theme.primary }}>
                  {student.SID || student.rollNumber}
                </span>
                <span
                  className="text-gray-300 hidden md:inline"
                  style={{ color: theme.primary }}
                >
                  •
                </span>
                <span className="w-full md:w-auto text-center">{student.department} Dept.</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <InfoItem icon={Mail} label="Email Address" value={student.email} />
              <InfoItem
                icon={Phone}
                label="Phone"
                value={student.phone || "+91 XXXXX XXXXX"}
              />
              <InfoItem 
                icon={MapPin} 
                label="Institute" 
                value={institute?.name || "CampusVersa"}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 md:w-6 md:h-6" style={{ color: theme.primary }} />
            Academic Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6">
            {student.accountType === 'independent' ? (
              <>
                <InfoItem
                  icon={MapPin}
                  label="Institution"
                  value={student.independentProfile?.institutionName || "Self Study"}
                />
                <InfoItem
                  icon={ScrollText}
                  label="Board / University"
                  value={student.independentProfile?.board}
                />
                <InfoItem
                  icon={GraduationCap}
                  label="Program"
                  value={student.independentProfile?.programName}
                />
                <InfoItem
                  icon={Briefcase}
                  label="Academic Year"
                  value={student.independentProfile?.academicYear}
                />
                <div className="sm:col-span-2 mt-4 space-y-4">
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Previous Education</h4>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                         <p className="text-[10px] font-bold text-indigo-400 uppercase">Class X</p>
                         <p className="text-xs font-black text-indigo-900 mt-1">{student.previousEducation?.primary?.schoolName || "N/A"}</p>
                         <p className="text-[10px] font-medium text-indigo-600">{student.previousEducation?.primary?.marks ? `${student.previousEducation.primary.marks}%` : ""}</p>
                      </div>
                      <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                         <p className="text-[10px] font-bold text-purple-400 uppercase">Class XII</p>
                         <p className="text-xs font-black text-purple-900 mt-1">{student.previousEducation?.secondary?.schoolName || "N/A"}</p>
                         <p className="text-[10px] font-medium text-purple-600">{student.previousEducation?.secondary?.marks ? `${student.previousEducation.secondary.marks}%` : ""}</p>
                      </div>
                   </div>
                </div>
              </>
            ) : (
              <>
                <InfoItem
                  icon={GraduationCap}
                  label="Current Semester"
                  value={`Semester ${student.semester}`}
                />
                <InfoItem
                  icon={Briefcase}
                  label="Academic Year"
                  value={student.year ? `Year ${student.year}` : "N/A"}
                />
                <InfoItem
                  icon={CalendarDays}
                  label="Admission Date"
                  value={new Date(student.createdAt).toLocaleDateString()}
                />
                <InfoItem
                  icon={Layout}
                  label="Section"
                  value={student.section || "A"}
                />
                <InfoItem
                  icon={Globe}
                  label="Institute Website"
                  value={institute?.website || "N/A"}
                />
                <InfoItem
                  icon={MapPin}
                  label="Institute Address"
                  value={institute?.address || "N/A"}
                />
              </>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 bg-gradient-to-br from-white to-gray-50 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ScrollText
              className="w-16 h-16 md:w-24 md:h-24"
              style={{ color: theme.secondary }}
            />
          </div>
          <h3 className="text-base md:text-lg font-bold text-gray-500 mb-2">
            Cumulative GPA (CGPA)
          </h3>
          <div
            className="text-4xl md:text-5xl font-extrabold mb-2"
            style={{ color: theme.primary }}
          >
            {student.academic?.cgpa || "N/A"}
          </div>
          <span className="text-xs md:text-sm text-gray-400 font-medium">
            Out of 10.0
          </span>
          <div className="mt-3 md:mt-4 px-3 py-1 md:px-4 md:py-1 bg-green-100 text-green-700 rounded-full text-xs md:text-sm font-bold">
            {student.academic?.cgpa > 8 ? "Excellent" : "Good Standing"}
          </div>
        </div>
      </div>

      {student.accountType === 'independent' && (
        <div className="bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm">
           <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />
            Career & Interests
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                   <Target size={12} className="text-indigo-500" /> Career Goals
                </p>
                <div className="flex flex-wrap gap-2">
                   {student.independentProfile?.careerInterests?.map(interest => (
                      <span key={interest} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold">{interest}</span>
                   )) || <span className="text-gray-400 text-xs italic">No goals set</span>}
                </div>
             </div>
             <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                   <Award size={12} className="text-purple-500" /> Target Exams
                </p>
                <div className="flex flex-wrap gap-2">
                   {student.independentProfile?.targetExams?.map(exam => (
                      <span key={exam} className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold">{exam}</span>
                   )) || <span className="text-gray-400 text-xs italic">No exams set</span>}
                </div>
             </div>
             <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                   <Briefcase size={12} className="text-emerald-500" /> Preferred Skills
                </p>
                <div className="flex flex-wrap gap-2">
                   {student.independentProfile?.preferredSkills?.map(skill => (
                      <span key={skill} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">{skill}</span>
                   )) || <span className="text-gray-400 text-xs italic">No skills set</span>}
                </div>
             </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center gap-2 px-2">
          <BarChart2 className="w-5 h-5 md:w-6 md:h-6" style={{ color: theme.secondary }} />
          Performance Stats
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <StatCard
            label="Attendance"
            value={`${student.attendance?.overallPercentage ? Number(student.attendance.overallPercentage).toFixed(2) : "0.00"}%`}
            icon={Clock}
            colorClass="bg-blue-50"
          />
          <StatCard
            label="Credits Earned"
            value={student.academic?.creditsEarned || 0}
            icon={ScrollText}
            colorClass="bg-purple-50"
          />
          <StatCard
            label="Backlogs"
            value={student.academic?.backlogs || 0}
            icon={AlertCircle}
            colorClass="bg-orange-50"
          />
          <StatCard
            label="Active Courses"
            value={student.courseEnrollments?.reduce((acc, sem) => acc + sem.subjects.length, 0) || 0}
            icon={BookOpen}
            colorClass="bg-green-50"
          />
        </div>
      </div>
    </div>
  );
};

export default StudentProfileSection;
