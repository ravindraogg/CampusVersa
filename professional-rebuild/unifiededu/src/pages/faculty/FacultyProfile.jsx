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
} from "lucide-react";

const API_URL = import.meta.env.VITE_BACK_URI;

// Helper Component for Section Header
// UPDATED: Now accepts 'theme' prop to style the button
const SectionHeader = ({ title, subtitle, onEdit, theme }) => (
  <div className="mb-6 border-b border-gray-100 pb-4 flex justify-between items-end">
    <div>
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
    </div>
    {onEdit && (
      <button
        onClick={onEdit}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold hover:opacity-80 transition-all shadow-md"
        style={{ 
          backgroundColor: theme?.primary || "#000", 
          color: "#ffffff" 
        }}
      >
        <Edit className="w-4 h-4" /> Edit Profile
      </button>
    )}
  </div>
);

const FacultyProfile = ({ faculty, theme, refreshProfile }) => {
  const [uploading, setUploading] = useState(false);
  const [localImage, setLocalImage] = useState(null);

  // --- EDIT MODAL STATE ---
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    phone: "",
    qualification: "",
    experience: "",
    research: {
      papersPublished: 0,
      citations: 0,
      hIndex: 0,
      projectsGuided: 0,
    },
  });

  // Load initial data into form when faculty changes or modal opens
  useEffect(() => {
    if (faculty) {
      setEditForm({
        phone: faculty.phone || "",
        qualification: faculty.qualification || "",
        experience: faculty.experience || "",
        research: {
          papersPublished: faculty.research?.papersPublished || 0,
          citations: faculty.research?.citations || 0,
          hIndex: faculty.research?.hIndex || 0,
          projectsGuided: faculty.research?.projectsGuided || 0,
        },
      });
    }
  }, [faculty, showEditModal]);

  if (!faculty) return null;
  const stats = faculty.research || {};

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
        const token = localStorage.getItem("facultyToken");
        const res = await fetch(`${API_URL}/faculty/update-profile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ profilePic: base64String }),
        });

        if (res.ok) {
          setLocalImage(base64String);
          if (refreshProfile) refreshProfile();
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
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Check if it's a nested research field
    if (name.startsWith("research.")) {
      const field = name.split(".")[1];
      setEditForm((prev) => ({
        ...prev,
        research: {
          ...prev.research,
          [field]: value,
        },
      }));
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
      const token = localStorage.getItem("facultyToken");
      
      const res = await fetch(`${API_URL}/faculty/update-profile`, {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
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
    <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
      <div
        className="mt-1 p-2 rounded-lg bg-white shadow-sm"
        style={{ color: theme.primary }}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase">{label}</p>
        <p className="text-sm font-bold text-gray-800 mt-0.5">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );

  const StatCard = ({ label, value, icon: Icon, colorClass }) => (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
      <div
        className={`p-4 rounded-full ${colorClass} bg-opacity-10 text-${
          colorClass.split("-")[1]
        }-600`}
      >
        <Icon className="w-8 h-8" />
      </div>
      <div>
        <h3 className="text-3xl font-extrabold text-gray-800">{value}</h3>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
      </div>
      <div
        className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full ${colorClass} opacity-5 pointer-events-none`}
      ></div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 space-y-8 pb-10 relative">
      <SectionHeader
        title="My Profile"
        subtitle="Manage your personal and professional details"
        onEdit={() => setShowEditModal(true)}
        theme={theme} // Passed theme here
      />

      {/* --- EDIT MODAL OVERLAY --- */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600" /> Edit Profile Details
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
              
              {/* Personal Info Group */}
              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                    <input
                      name="phone"
                      value={editForm.phone}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                   <div className="space-y-2 opacity-60 cursor-not-allowed" title="Contact Admin to change">
                    <label className="text-sm font-semibold text-gray-700">Email (Read Only)</label>
                    <input
                      value={faculty.email}
                      disabled
                      className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Group */}
              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                  Professional Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Qualification</label>
                    <input
                      name="qualification"
                      value={editForm.qualification}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                      placeholder="e.g. Ph.D. in CS"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Experience</label>
                    <input
                      name="experience"
                      value={editForm.experience}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                      placeholder="e.g. 8 Years"
                    />
                  </div>
                </div>
              </div>

              {/* Research Group */}
              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                  Research Statistics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-600">Papers Published</label>
                    <input
                      type="number"
                      name="research.papersPublished"
                      value={editForm.research.papersPublished}
                      onChange={handleInputChange}
                      className="w-full p-2 rounded-lg border border-gray-200 outline-none focus:border-blue-500 text-center font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-600">Total Citations</label>
                    <input
                      type="number"
                      name="research.citations"
                      value={editForm.research.citations}
                      onChange={handleInputChange}
                      className="w-full p-2 rounded-lg border border-gray-200 outline-none focus:border-blue-500 text-center font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-600">h-index</label>
                    <input
                      type="number"
                      name="research.hIndex"
                      value={editForm.research.hIndex}
                      onChange={handleInputChange}
                      className="w-full p-2 rounded-lg border border-gray-200 outline-none focus:border-blue-500 text-center font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-600">Projects Guided</label>
                    <input
                      type="number"
                      name="research.projectsGuided"
                      value={editForm.research.projectsGuided}
                      onChange={handleInputChange}
                      className="w-full p-2 rounded-lg border border-gray-200 outline-none focus:border-blue-500 text-center font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-all"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2"
                  style={{ 
                    backgroundColor: theme?.primary || "#000", 
                    color: "#ffffff" 
                  }}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PROFILE CARD --- */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-lg border border-gray-100 relative overflow-hidden">
        <div
          className="absolute top-0 left-0 w-full h-32 opacity-10"
          style={{ backgroundColor: theme.primary }}
        ></div>
        <div
          className="absolute top-[-50px] right-[-50px] w-64 h-64 rounded-full opacity-10"
          style={{ backgroundColor: theme.secondary }}
        ></div>

        <div className="relative flex flex-col md:flex-row gap-8 items-start">
          <div className="flex flex-col items-center space-y-4">
            <div
              className="w-32 h-32 rounded-full p-1.5 border-4 bg-white shadow-md relative group"
              style={{ borderColor: theme.primary }}
            >
              <div className="w-full h-full rounded-full bg-gray-100 overflow-hidden flex items-center justify-center relative">
                {localImage || faculty.profilePic ? (
                  <img
                    src={localImage || faculty.profilePic}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-gray-300">
                    {faculty.name.charAt(0)}
                  </span>
                )}

                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
                  {uploading ? (
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  ) : (
                    <Camera className="w-8 h-8 text-white" />
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

              <div
                className={`absolute bottom-1 right-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-sm z-20 ${
                  faculty.kyc?.verified ? "bg-green-500" : "bg-orange-500"
                }`}
              >
                {faculty.kyc?.verified ? (
                  <ShieldCheck className="w-4 h-4 text-white" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-white" />
                )}
              </div>
            </div>

            {faculty.kyc?.verified && (
              <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-200 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Verified ID
              </span>
            )}
          </div>

          <div className="flex-1 pt-2">
            <div className="mb-6 text-center md:text-left">
              <h1 className="text-3xl font-extrabold text-gray-800">
                {faculty.name}
              </h1>
              <p className="text-lg text-gray-500 font-medium flex items-center justify-center md:justify-start gap-2">
                <span style={{ color: theme.primary }}>
                  {faculty.designation}
                </span>
                <span
                  className="text-gray-300"
                  style={{ color: theme.primary }}
                >
                  •
                </span>
                <span>{faculty.department} Dept.</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoItem icon={Briefcase} label="Faculty ID" value={faculty.FID} />
              <InfoItem icon={Mail} label="Email Address" value={faculty.email} />
              <InfoItem
                icon={Phone}
                label="Phone"
                value={faculty.phone || "+91 XXXXX XXXXX"}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Award className="w-6 h-6" style={{ color: theme.primary }} />
            Professional Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem
              icon={GraduationCap}
              label="Qualification"
              value={faculty.qualification}
            />
            <InfoItem
              icon={Briefcase}
              label="Total Experience"
              value={faculty.experience}
            />
            <InfoItem
              icon={CalendarDays}
              label="Date of Joining"
              value={new Date(
                faculty.joinedAt || faculty.joiningDate
              ).toLocaleDateString()}
            />
            <InfoItem
              icon={ShieldCheck}
              label="Current Status"
              value="Active Faculty"
            />
          </div>
        </div>

        <div className="lg:col-span-1 bg-gradient-to-br from-white to-gray-50 p-8 rounded-[2.5rem] border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ScrollText
              className="w-24 h-24"
              style={{ color: theme.secondary }}
            />
          </div>
          <h3 className="text-lg font-bold text-gray-500 mb-2">
            APAR Score (Last Cycle)
          </h3>
          <div
            className="text-5xl font-extrabold mb-2"
            style={{ color: theme.primary }}
          >
            {faculty.aparScore ? faculty.aparScore.split("/")[0] : "9.2"}
          </div>
          <span className="text-sm text-gray-400 font-medium">
            Out of {faculty.aparScore ? faculty.aparScore.split("/")[1] : "10"}
          </span>
          <div className="mt-4 px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
            Excellent
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 px-2">
          <BarChart2 className="w-6 h-6" style={{ color: theme.secondary }} />
          Research & Publications
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Papers Published"
            value={stats.papersPublished || 0}
            icon={BookOpen}
            colorClass="bg-blue-50"
          />
          <StatCard
            label="Total Citations"
            value={stats.citations || 0}
            icon={ScrollText}
            colorClass="bg-purple-50"
          />
          <StatCard
            label="h-index"
            value={stats.hIndex || 0}
            icon={BarChart2}
            colorClass="bg-orange-50"
          />
          <StatCard
            label="Projects Guided"
            value={stats.projectsGuided || 0}
            icon={Users}
            colorClass="bg-green-50"
          />
        </div>
      </div>
    </div>
  );
};

export default FacultyProfile;  