import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, Send, Clock, CheckCircle, XCircle, FileText, 
  MessageCircle, User, AlertCircle, Loader2 
} from "lucide-react";

export default function RequestAdminPage({ authFetch, theme, institute, pushToast }) {
  // --- State ---
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false); // Glass overlay
  
  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null); // For Chat Modal

  // Forms
  const [form, setForm] = useState({
    subject: "",
    notes: "",
    urgency: "Normal",
  });
  const [replyText, setReplyText] = useState("");

  // Refs
  const chatEndRef = useRef(null);

  // --- Helpers ---
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

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (selectedRequest) scrollToBottom();
  }, [selectedRequest?.replies]);

  // --- Load Requests ---
  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/institute/requests", { method: "GET" });
      const data = await res.json();
      setRequests(data || []);
    } catch (err) {
      console.error(err);
      pushToast({ type: "error", message: "Could not load requests" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Submit New Request ---
  const handleSubmit = async () => {
    if (!form.subject || !form.notes) {
      pushToast({ type: "error", message: "Subject and details are required" });
      return;
    }

    setIsPageLoading(true);
    try {
      const payload = {
        requestedCode: form.subject, 
        notes: form.notes,
        type: "Internal Request",
        urgency: form.urgency
      };

      const res = await authFetch("/institute/requests/add", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        pushToast({ type: "success", message: "Request sent to Admin" });
        setShowAdd(false);
        setForm({ subject: "", notes: "", urgency: "Normal" });
        loadRequests();
      } else {
        pushToast({ type: "error", message: data.message || "Failed to send" });
      }
    } catch (err) {
      pushToast({ type: "error", message: "Server Error" });
    } finally {
      setIsPageLoading(false);
    }
  };

  // --- Send Reply ---
  const sendReply = async () => {
    if (!replyText.trim()) return;
    
    try {
      // Optimistic Update (Optional)
      const newMessage = { 
        sender: 'Institute', 
        message: replyText, 
        createdAt: new Date().toISOString() 
      };
      
      const res = await authFetch("/institute/request/reply", {
        method: "POST",
        body: JSON.stringify({ requestId: selectedRequest._id, message: replyText })
      });

      if (res.ok) {
        const updatedDoc = await res.json();
        // Update local selected request to show new message
        setSelectedRequest(updatedDoc);
        // Update the list in background
        setRequests(prev => prev.map(r => r._id === updatedDoc._id ? updatedDoc : r));
        setReplyText("");
      } else {
        pushToast({ type: "error", message: "Failed to send reply" });
      }
    } catch (err) {
      console.error(err);
      pushToast({ type: "error", message: "Message failed" });
    }
  };

  // --- Status Badge ---
  const getStatusBadge = (status) => {
    switch (status) {
      case "Solved": return <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Solved</span>;
      case "Approved": return <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Approved</span>;
      case "Rejected": return <span className="text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><XCircle className="w-3 h-3"/> Rejected</span>;
      default: return <span className="text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Clock className="w-3 h-3"/> {status}</span>;
    }
  };

  return (
    <div className="w-full relative animate-in fade-in duration-500">
      
      {/* Full Page Loading Overlay */}
      {isPageLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="rounded-2xl p-6 bg-white/90 backdrop-blur-md flex flex-col items-center gap-4">
            <Spinner size={28} color={theme.primary || "#111"} />
            <div style={{ color: "#374151" }}>Processing...</div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Admin Requests</h2>
          <p className="text-gray-500 text-sm mt-1">Submit tickets for access, updates, or technical support</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="mt-4 md:mt-0 px-5 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg transition-transform active:scale-95"
          style={{ backgroundColor: theme.primary, color: theme.textOnPrimary }}
        >
          <Plus className="w-4 h-4" />
          New Request
        </button>
      </div>

      {/* REQUEST LIST */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
           <div className="py-12 text-center text-gray-400">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No requests found</p>
            <p className="text-xs text-gray-400 mt-1">Create a new request to contact the admin.</p>
          </div>
        ) : (
          requests.map((req) => (
            <div 
              key={req._id} 
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-all"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-bold text-gray-800 text-lg">
                    {req.requestedCode || req.subject || "No Subject"}
                  </h4>
                  {getStatusBadge(req.status)}
                </div>
                <p className="text-gray-600 text-sm line-clamp-1">{req.notes || "No details provided."}</p>
                
                {/* Meta & Last Reply Snippet */}
                <div className="flex flex-wrap items-center gap-4 mt-2">
                    <span className="text-xs text-gray-400">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                    {req.replies && req.replies.length > 0 && (
                        <div className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-indigo-50 text-indigo-600 font-medium">
                            <MessageCircle className="w-3 h-3"/>
                            {req.replies.length} replies
                        </div>
                    )}
                </div>
              </div>

              <button 
                onClick={() => setSelectedRequest(req)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50 transition whitespace-nowrap"
              >
                View Thread
              </button>
            </div>
          ))
        )}
      </div>

      {/* --- 1. CREATE REQUEST MODAL --- */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-800">New Request to Admin</h3>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition">✕</button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Subject / Title</label>
                <input value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} placeholder="e.g. Technical Issue..." className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none" />
              </div>
              <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Priority</label>
                 <div className="flex gap-3">
                    {['Normal', 'High', 'Critical'].map(level => (
                      <button key={level} onClick={() => setForm({...form, urgency: level})} className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${form.urgency === level ? `bg-gray-800 text-white border-gray-800` : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>{level}</button>
                    ))}
                 </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                <textarea value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} rows={4} placeholder="Describe details..." className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none resize-none" />
              </div>
              <div className="pt-4 flex gap-3">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
                <button onClick={handleSubmit} className="flex-1 py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2" style={{ backgroundColor: theme.primary }}><Send className="w-4 h-4" /> Submit Ticket</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- 2. CONVERSATION THREAD MODAL --- */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[90vh]">
                
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <div className="overflow-hidden">
                        <h3 className="font-bold text-gray-800 truncate">{selectedRequest.requestedCode || "Request"}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(selectedRequest.status)}
                            <span className="text-xs text-gray-400">• {selectedRequest.urgency || "Normal"}</span>
                        </div>
                    </div>
                    <button onClick={() => setSelectedRequest(null)} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100">✕</button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50">
                    {/* Original Request Bubble */}
                    <div className="flex justify-end">
                        <div className="bg-white border border-gray-200 text-gray-800 p-4 rounded-2xl rounded-tr-sm max-w-[90%] shadow-sm relative">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Original Request</div>
                            <p className="text-sm">{selectedRequest.notes}</p>
                        </div>
                    </div>

                    {/* Replies Map */}
                    {selectedRequest.replies && selectedRequest.replies.map((reply, i) => (
                        <div key={i} className={`flex ${reply.sender === 'Admin' ? 'justify-start' : 'justify-end'}`}>
                            
                            {reply.sender === 'Admin' && (
                                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white mr-2 shrink-0">
                                    <User className="w-4 h-4"/>
                                </div>
                            )}

                            <div className={`p-3 rounded-2xl max-w-[85%] text-sm shadow-sm ${
                                reply.sender === 'Admin' 
                                ? 'bg-indigo-600 text-white rounded-tl-sm' // Admin Style
                                : 'bg-white text-gray-800 border border-gray-200 rounded-tr-sm' // Institute Style
                            }`}>
                                {reply.message}
                                <div className={`text-[10px] mt-1 text-right ${reply.sender === 'Admin' ? 'text-indigo-200' : 'text-gray-400'}`}>
                                    {new Date(reply.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100">
                    <form 
                        onSubmit={(e) => { e.preventDefault(); sendReply(); }}
                        className="flex items-center gap-2"
                    >
                        <input 
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Type a reply..."
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                        />
                        <button 
                            type="submit"
                            disabled={!replyText.trim()}
                            className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}