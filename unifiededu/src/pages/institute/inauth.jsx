import React, { useState, useEffect } from "react";
import {
  School,
  Lock,
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  FileText,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  ChevronRight,
  Hash,
  Home,
  ArrowLeft,
  XCircle // Added for error icon
} from "lucide-react";
// Import the custom website icon
import bookImage from "../../assets/logo.png";

// --- Constants ---
const primaryColor = "#66BB6A"; // Green
const secondaryColor = "#7D5AFE"; // Purple
const API_URL = import.meta.env.VITE_BACK_URI; // Adjust if hosted elsewhere

// --- Sub-component ---
const InputField = ({
  label,
  icon: Icon,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = true,
  fullWidth = false,
}) => (
  <div
    className={`flex flex-col space-y-2 ${
      fullWidth ? "col-span-1 md:col-span-2" : ""
    }`}
  >
    <label className="text-xs text-green-600 uppercase font-semibold flex items-center space-x-2">
      {Icon && <Icon className="w-4 h-4" style={{ color: primaryColor }} />}
      <span>{label}</span>
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150 bg-gray-50/50"
    />
  </div>
);

const InstituteAuth = () => {
  // --- State Management ---
  const [activeTab, setActiveTab] = useState("login");
  const [loginData, setLoginData] = useState({ identifier: "", password: "" });
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Custom Notification State
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  // Form State for Registration
  const [regData, setRegData] = useState({
    name: "",
    requestedCode: "",
    aisheCode: "",
    accreditation: "",
    state: "",
    pincode: "",
    email: "",
    phone: "",
    website: "",
    notes: "",
  });

  // --- Helper: Show Notification ---
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    
    // Auto hide after 3 seconds if it's just an error/info
    if (type === 'error') {
        setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
        }, 3000);
    }
  };

  // --- Handlers ---

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegChange = (e) => {
    setRegData({ ...regData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/institute/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        // Save token
        localStorage.setItem("instituteToken", data.token);
        localStorage.setItem("instituteName", data.name);
        
        // 1. Show Success Notification
        showNotification(`Login Successful! Welcome ${data.name}`, "success");

        // 2. Wait 1.5 Seconds before redirecting
        setTimeout(() => {
            window.location.href = "/in/dashboard";
        }, 1500);

      } else {
        // Show Error Notification
        showNotification(data.message || "Login failed", "error");
      }
    } catch (error) {
      console.error(error);
      showNotification("Server error. Please try again later.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/institute/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regData),
      });

      const data = await response.json();

      if (response.ok) {
        setRequestSuccess(true);
        showNotification("Request submitted successfully!", "success");
        setRegData({
          name: "",
          requestedCode: "",
          aisheCode: "",
          accreditation: "",
          state: "",
          pincode: "",
          email: "",
          phone: "",
          website: "",
          notes: "",
        });
      } else {
        showNotification(data.message || "Registration failed", "error");
      }
    } catch (error) {
      console.error(error);
      showNotification("Server error. Please try again later.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col relative overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .auth-scroll::-webkit-scrollbar { width: 6px; }
        .auth-scroll::-webkit-scrollbar-track { background: #f1f1f1; }
        .auth-scroll::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
        
        /* Notification Animation */
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .toast-enter { animation: slideInRight 0.4s ease-out forwards; }
      `}</style>

      {/* --- CUSTOM NOTIFICATION TOAST --- */}
      {notification.show && (
        <div className="fixed top-24 right-5 z-[100] toast-enter">
          <div 
            className={`flex items-center p-4 rounded-xl shadow-2xl border-l-4 backdrop-blur-md bg-white/95 w-80 md:w-96
              ${notification.type === 'success' ? 'border-green-500' : 'border-red-500'}
            `}
          >
            <div className={`p-2 rounded-full mr-3 ${notification.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
              {notification.type === 'success' ? (
                <CheckCircle className={`w-5 h-5 ${notification.type === 'success' ? 'text-green-600' : 'text-red-600'}`} />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div>
              <h4 className={`font-bold text-sm ${notification.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                {notification.type === 'success' ? 'Success' : 'Error'}
              </h4>
              <p className="text-gray-600 text-xs mt-0.5">{notification.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* --- Navbar --- */}
      <nav className="w-full bg-white/60 backdrop-blur-md border-b border-gray-200/50 py-4 px-6 fixed top-0 z-50 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center space-x-3">
          <img
            src={bookImage}
            alt="CampusVersa Logo"
            className="w-8 h-8 rounded-lg object-cover shadow-sm"
          />
          <span className="text-xl font-extrabold text-gray-800 tracking-tight">
            CampusVersa
          </span>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 text-gray-500 hover:text-gray-800 transition-colors font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden md:inline">Go Back</span>
          </button>
          <a
            href="/"
            className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-green-50 text-gray-700 border border-gray-200 rounded-xl transition-colors font-semibold text-sm shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </a>
        </div>
      </nav>

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex items-center justify-center p-6 pt-24 pb-12">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl flex flex-col md:flex-row overflow-hidden h-auto max-h-[85vh] min-h-[600px] transition-all duration-300 ease-in-out">
          {/* Left Side: Visual/Branding */}
          <div className="md:w-2/5 p-8 flex flex-col justify-between text-white relative bg-[#374232]">
            <div className="absolute top-[-50px] left-[-50px] w-40 h-40 rounded-full bg-white opacity-10"></div>
            <div className="absolute w-60 h-60 rounded-full bg-green-500 opacity-20"></div>

            <div className="z-10 mt-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm mb-6">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold mb-2">Institute Portal</h1>
              <p className="text-gray-300">
                Centralized Academic Management Platform
              </p>
            </div>

            <div className="z-10 mt-12 space-y-8 hidden md:block">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-white/10 rounded-lg">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">Admin Control</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Manage faculty, student records, and grading systems
                    securely.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">Digital Presence</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Streamline accreditation data and institute reporting.
                  </p>
                </div>
              </div>
            </div>

            <div className="z-10 text-xs text-gray-400 mt-8">
              © 2025 CampusVersa.
            </div>
          </div>

          {/* Right Side: Auth Forms */}
          <div className="flex-1 bg-white p-8 md:p-12 overflow-y-auto auth-scroll">
            {/* Tab Navigation */}
            <div className="flex p-1 bg-gray-100 rounded-xl mb-8 sticky top-0 z-10">
              <button
                onClick={() => {
                  setActiveTab("login");
                  setNotification({ show: false, message: "", type: "success" }); // Clear notifs on tab switch
                }}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === "login"
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Institute Login
              </button>
              <button
                onClick={() => {
                  setActiveTab("register");
                  setNotification({ show: false, message: "", type: "success" });
                }}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === "register"
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Request Access
              </button>
            </div>

            {/* --- VIEW 1: LOGIN --- */}
            {activeTab === "login" && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col justify-center min-h-[400px]">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Welcome Back
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Enter your Institute or Authorized Faculty credentials.
                  </p>
                </div>

                <form
                  onSubmit={handleLoginSubmit}
                  className="space-y-6 max-w-sm mx-auto w-full"
                >
                  <InputField
                    label="Institute / Faculty Identifier"
                    icon={Hash}
                    name="identifier"
                    value={loginData.identifier}
                    onChange={handleLoginChange}
                    placeholder="Institute Code, IID, or Faculty Email/FID"
                  />

                  <InputField
                    label="Password"
                    icon={Lock}
                    type="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    placeholder="••••••••"
                  />

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded text-green-600 focus:ring-green-500"
                      />
                      <span className="text-gray-600">Remember me</span>
                    </label>
                    <a
                      href="#"
                      className="text-green-600 font-semibold hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {isLoading ? (
                      <span className="animate-pulse">Verifying...</span>
                    ) : (
                      <>
                        <span>Access Dashboard</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* --- VIEW 2: REGISTRATION / QUERY --- */}
            {activeTab === "register" && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 pb-4">
                {!requestSuccess ? (
                  <>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-800">
                        New Institute Request
                      </h2>
                      <p className="text-gray-500 text-sm mt-1">
                        Submit your details for platform onboarding approval.
                      </p>
                    </div>

                    <form
                      onSubmit={handleRequestSubmit}
                      className="grid grid-cols-1 md:grid-cols-2 gap-5"
                    >
                      {/* Section: Identity */}
                      <div className="md:col-span-2 flex items-center space-x-2 text-gray-400 border-b pb-2 mb-2">
                        <Building2 className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Institute Details
                        </span>
                      </div>

                      <InputField
                        label="Institute Name"
                        icon={Building2}
                        name="name"
                        value={regData.name}
                        onChange={handleRegChange}
                        placeholder="Full Legal Name"
                        fullWidth
                        required={true}
                      />

                      <InputField
                        label="Preferred Code"
                        icon={Hash}
                        name="requestedCode"
                        value={regData.requestedCode}
                        onChange={handleRegChange}
                        placeholder="Desired Short Code"
                        required={true}
                      />

                      <InputField
                        label="AISHE Code"
                        icon={FileText}
                        name="aisheCode"
                        value={regData.aisheCode}
                        onChange={handleRegChange}
                        placeholder="e.g. U-1234"
                        required={true}
                      />

                      <InputField
                        label="Accreditation"
                        icon={ShieldCheck}
                        name="accreditation"
                        value={regData.accreditation}
                        onChange={handleRegChange}
                        placeholder="NAAC Grade / NBA"
                        fullWidth
                        required={true}
                      />

                      {/* Section: Contact */}
                      <div className="md:col-span-2 flex items-center space-x-2 text-gray-400 border-b pb-2 mb-2 mt-4">
                        <Mail className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Contact Info
                        </span>
                      </div>

                      <InputField
                        label="Official Email"
                        icon={Mail}
                        type="email"
                        name="email"
                        value={regData.email}
                        onChange={handleRegChange}
                        placeholder="admin@institute.edu"
                        required={true}
                      />

                      <InputField
                        label="Phone / Landline"
                        icon={Phone}
                        type="tel"
                        name="phone"
                        value={regData.phone}
                        onChange={handleRegChange}
                        placeholder="+91 99999 99999"
                        required={true}
                      />

                      <InputField
                        label="Website URL"
                        icon={Globe}
                        type="url"
                        name="website"
                        value={regData.website}
                        onChange={handleRegChange}
                        placeholder="https://..."
                        fullWidth
                        required={true}
                      />

                      {/* Section: Location */}
                      <div className="md:col-span-2 flex items-center space-x-2 text-gray-400 border-b pb-2 mb-2 mt-4">
                        <MapPin className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Location
                        </span>
                      </div>

                      <InputField
                        label="State"
                        name="state"
                        value={regData.state}
                        onChange={handleRegChange}
                        placeholder="State"
                        required={true}
                      />

                      <InputField
                        label="Pincode"
                        name="pincode"
                        value={regData.pincode}
                        onChange={handleRegChange}
                        placeholder="ZIP Code"
                        required={true}
                      />

                      <div className="md:col-span-2 mt-4">
                        <label className="text-xs text-green-600 uppercase font-semibold flex items-center space-x-2 mb-2">
                          <FileText
                            className="w-4 h-4"
                            style={{ color: primaryColor }}
                          />
                          <span>Additional Notes / Request Reason</span>
                        </label>
                        <textarea
                          name="notes"
                          value={regData.notes}
                          onChange={handleRegChange}
                          rows="3"
                          className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-150 bg-gray-50/50"
                          placeholder="Any specific modules required?"
                        ></textarea>
                      </div>

                      <div className="md:col-span-2 pt-4">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full py-3.5 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center space-x-2"
                          style={{ backgroundColor: secondaryColor }}
                        >
                          {isLoading
                            ? "Submitting Request..."
                            : "Submit Request for Approval"}
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  // --- SUCCESS STATE (INLINE) ---
                  <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-6 animate-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      Request Submitted Successfully!
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-md">
                      Thank you for your interest in CampusVersa. Our
                      administration team has received your details for
                      <span className="font-semibold text-gray-800">
                        {" "}
                        {regData.name}
                      </span>
                      .
                    </p>

                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg max-w-md text-left mb-8">
                      <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-blue-800 text-sm">
                            Next Steps
                          </h4>
                          <p className="text-blue-700 text-xs mt-1">
                            Our team will verify your AISHE code and
                            Accreditation status. Once approved (usually within
                            24-48 hours), you will receive your
                            <span className="font-bold">
                              {" "}
                              Login ID & Password
                            </span>{" "}
                            via the registered email:
                            <span className="font-semibold underline">
                              {" "}
                              {regData.email}
                            </span>
                            .
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setRequestSuccess(false);
                        setActiveTab("login");
                      }}
                      className="text-green-600 font-semibold flex items-center space-x-1 hover:underline"
                    >
                      <span>Return to Login</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstituteAuth;