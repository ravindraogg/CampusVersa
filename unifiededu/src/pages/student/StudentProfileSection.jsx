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
  Globe
} from "lucide-react";

// Replaced import.meta.env with a placeholder to prevent build errors in the preview environment
const API_URL = import.meta.env.VITE_BACK_URI;

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
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    phone: "",
  });

  // Load initial data into form
  useEffect(() => {
    if (student) {
      setEditForm({
        phone: student.phone || "",
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
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("studentToken");
      const res = await fetch(`${API_URL}/student/update-profile`, {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl md:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                <Edit className="w-4 h-4 md:w-5 md:h-5 text-blue-600" /> Edit Contact Info
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 md:p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProfile} className="p-4 md:p-6 space-y-4 md:space-y-6">
              <div>
                <h4 className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 md:mb-4 border-b border-gray-100 pb-2">
                  Contact Information
                </h4>
                <div className="space-y-3 md:space-y-4">
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-xs md:text-sm font-semibold text-gray-700">Phone Number</label>
                    <input
                      name="phone"
                      value={editForm.phone}
                      onChange={handleInputChange}
                      className="w-full p-2.5 md:p-3 text-sm rounded-xl border border-gray-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                   <div className="space-y-1.5 md:space-y-2 opacity-60 cursor-not-allowed" title="Contact Admin to change">
                    <label className="text-xs md:text-sm font-semibold text-gray-700">Email (Read Only)</label>
                    <input
                      value={student.email}
                      disabled
                      className="w-full p-2.5 md:p-3 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 md:pt-4 flex justify-end gap-2 md:gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 md:px-6 md:py-3 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 transition-all"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 md:px-6 md:py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-all flex items-center gap-2"
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
            {/* Added Institute Specific Info */}
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