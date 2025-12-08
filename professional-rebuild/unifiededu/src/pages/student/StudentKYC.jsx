import React, { useState } from "react";
import { ShieldCheck, Lock, CheckCircle, Fingerprint } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_BACK_URI;

const StudentKYC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Input Aadhaar, 2: Input OTP
  const [aadhar, setAadhar] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  // Format Aadhaar with spaces
  const handleAadharChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 12);
    setAadhar(val);
    setErrorMsg("");
  };

  const handleSendOtp = () => {
    if (aadhar.length !== 12) {
      setErrorMsg("Please enter a valid 12-digit Apaar number.");
      return;
    }
    setIsLoading(true);
    // Simulate sending OTP
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      alert("Mock OTP sent: 123456"); 
    }, 1500);
  };

  const handleVerify = async () => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("studentToken");
      
      const response = await fetch(`${API_URL}/student/kyc/verify`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": token 
        },
        body: JSON.stringify({ aadharNumber: aadhar, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/student/dashboard"); // Redirect to Student Dashboard
        }, 2000);
      } else {
        setErrorMsg(data.message || "Verification failed");
      }
    } catch (err) {
      setErrorMsg("Server error.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center p-10 bg-white rounded-2xl shadow-xl animate-in zoom-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Identity Verified!</h2>
          <p className="text-gray-500 mt-2">Redirecting to your classroom...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-20 px-4">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
            <Fingerprint className="w-8 h-8 text-purple-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Student Verification</h1>
        <p className="text-slate-500 text-sm mt-1 max-w-md">
          Verify your identity to access your academic records and dashboard.
        </p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-slate-100">
        {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded border border-red-100 font-medium">
                {errorMsg}
            </div>
        )}

        {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Apaar Number</label>
                    <div className="relative">
                        <ShieldCheck className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                        <input 
                            type="text" 
                            value={aadhar}
                            onChange={handleAadharChange}
                            placeholder="0000 0000 0000"
                            className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-lg tracking-widest focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            maxLength="12"
                        />
                    </div>
                </div>
                <button 
                    onClick={handleSendOtp}
                    disabled={isLoading || aadhar.length < 12}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Processing..." : "Verify & Send OTP"}
                </button>
            </div>
        )}

        {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="text-center">
                    <p className="text-sm text-slate-600">Enter the OTP sent to linked mobile</p>
                    <p className="font-mono font-bold text-slate-800 mt-1">XXXX XXXX {aadhar.slice(-4)}</p>
                </div>

                <div>
                    <input 
                        type="text" 
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6-digit OTP"
                        className="w-full p-3 text-center bg-slate-50 border border-slate-200 rounded-xl text-xl tracking-[0.5em] font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        maxLength="6"
                    />
                </div>

                <button 
                    onClick={handleVerify}
                    disabled={isLoading || otp.length < 6}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-green-200"
                >
                    {isLoading ? "Verifying..." : "Complete Verification"}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default StudentKYC;  