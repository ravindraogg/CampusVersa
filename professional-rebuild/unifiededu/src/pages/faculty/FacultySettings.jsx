import React, { useState, useEffect } from "react";
import {
  Settings,
  MessageSquare,
  FilePlus,
  Save,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Lock,
  Moon,
  Bell,
  Loader2,
  Send,
  Layout,
  ArrowLeft,
  User,
  Calendar
} from "lucide-react";
const API_URL = import.meta.env.VITE_BACK_URI;
const FacultySettings = ({ authFetch, theme, pushToast, faculty, initialTab }) => {
  // Use initialTab if provided (e.g. from Dashboard quick link), else default to 'general'
  const [activeTab, setActiveTab] = useState(initialTab || "general");
  
  // Dynamic Styles
  const primaryColor = theme.primary;
  const lightPrimaryBg = `${theme.primary}15`;

  // --- RENDERERS ---
  
  // 1. GENERAL SETTINGS
  const GeneralSettings = () => (
    <div className="max-w-2xl space-y-6 animate-in fade-in">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
          <Settings className="w-5 h-5" style={{ color: primaryColor }} /> 
          Account Preferences
        </h3>
        
        {/* Toggle Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm"><Bell className="w-4 h-4 text-gray-600"/></div>
              <div>
                <p className="text-sm font-bold text-gray-700">Email Notifications</p>
                <p className="text-xs text-gray-500">Receive updates about student submissions</p>
              </div>
            </div>
            <input type="checkbox" className="toggle toggle-sm" defaultChecked style={{ accentColor: primaryColor }} />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
             <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm"><Moon className="w-4 h-4 text-gray-600"/></div>
              <div>
                <p className="text-sm font-bold text-gray-700">Dark Mode</p>
                <p className="text-xs text-gray-500">Switch between light and dark themes</p>
              </div>
            </div>
            <input type="checkbox" className="toggle toggle-sm" disabled />
          </div>
        </div>

        {/* Password Change Stub */}
        <div className="pt-4 border-t">
           <h4 className="text-sm font-bold text-gray-700 mb-3">Security</h4>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="password" placeholder="Current Password" className="p-2 border rounded-xl text-sm outline-none focus:ring-1" style={{ '--tw-ring-color': primaryColor }}/>
              <input type="password" placeholder="New Password" className="p-2 border rounded-xl text-sm outline-none focus:ring-1" style={{ '--tw-ring-color': primaryColor }}/>
           </div>
           <button className="mt-4 px-4 py-2 text-white text-sm font-bold rounded-xl hover:opacity-90" style={{ backgroundColor: primaryColor }}>
              Update Password
           </button>
        </div>
      </div>
    </div>
  );

  // 2. SUPPORT & REQUESTS
  const SupportPanel = () => {
    const [tickets, setTickets] = useState([]);
    const [form, setForm] = useState({ subject: "", message: "", type: "General" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
      fetchTickets();
    }, []);

    const fetchTickets = async () => {
      const res = await authFetch('/faculty/grievances');
      if (res.ok) setTickets(await res.json());
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        const res = await authFetch('/faculty/grievance/add', {
          method: 'POST',
          body: JSON.stringify(form)
        });
        if (res.ok) {
          pushToast("Request Submitted", "success");
          setForm({ subject: "", message: "", type: "General" });
          fetchTickets();
        }
      } catch(e) { pushToast("Failed to submit", "error"); }
      finally { setIsSubmitting(false); }
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
        {/* Form */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" style={{ color: primaryColor }} /> 
            Submit Request / Grievance
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
               <label className="text-xs font-bold text-gray-500">Request Type</label>
               <select 
                 className="w-full p-2 mt-1 border rounded-xl text-sm bg-gray-50 outline-none"
                 value={form.type} onChange={e => setForm({...form, type: e.target.value})}
               >
                 <option>General</option>
                 <option>Technical Issue</option>
                 <option>Infrastructure</option>
                 <option>Urgent</option>
               </select>
            </div>
            <div>
               <label className="text-xs font-bold text-gray-500">Subject</label>
               <input 
                 className="w-full p-2 mt-1 border rounded-xl text-sm outline-none focus:ring-1"
                 style={{ '--tw-ring-color': primaryColor }}
                 placeholder="Brief subject..."
                 value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}
                 required
               />
            </div>
            <div>
               <label className="text-xs font-bold text-gray-500">Details</label>
               <textarea 
                 className="w-full p-2 mt-1 border rounded-xl text-sm h-32 outline-none focus:ring-1"
                 style={{ '--tw-ring-color': primaryColor }}
                 placeholder="Describe your issue or request..."
                 value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                 required
               />
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-2.5 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4"/>}
              Submit Ticket
            </button>
          </form>
        </div>

        {/* History List */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-500 text-sm uppercase tracking-wide">Ticket History</h3>
          {tickets.length === 0 ? (
            <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-2xl border border-dashed">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50"/>
              No past requests found.
            </div>
          ) : (
            tickets.map((t) => (
              <div key={t._id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                 <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                      t.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                      t.status === 'Solved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {t.status}
                    </span>
                    <span className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleDateString()}</span>
                 </div>
                 <h4 className="font-bold text-gray-800 text-sm">{t.subject}</h4>
                 <p className="text-xs text-gray-500 mt-1 line-clamp-2">{t.message}</p>
                 {t.ticketId && <p className="text-[10px] text-gray-300 mt-2 font-mono">#{t.ticketId}</p>}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // 3. FORM BUILDER
  const FormBuilder = () => {
    const [courses, setCourses] = useState([]);
    const [myForms, setMyForms] = useState([]);
    // viewMode: 'list' | 'create' | 'responses'
    const [viewMode, setViewMode] = useState('list'); 
    
    // Form Creation State
    const [selectedCourse, setSelectedCourse] = useState("");
    const [formTitle, setFormTitle] = useState("");
    const [questions, setQuestions] = useState([{ id: 1, label: "", fieldType: "text" }]);

    // Response Viewing State
    const [selectedForm, setSelectedForm] = useState(null);
    const [formResponses, setFormResponses] = useState([]);
    const [loadingResponses, setLoadingResponses] = useState(false);

    useEffect(() => {
      loadData();
    }, []);

    const loadData = async () => {
      const cRes = await authFetch('/faculty/courses');
      if (cRes.ok) setCourses(await cRes.json());

      const fRes = await authFetch('/faculty/forms');
      if (fRes.ok) setMyForms(await fRes.json());
    };

    // --- LOGIC TO HANDLE RESPONSES ---
    const handleViewResponses = async (form) => {
      setLoadingResponses(true);
      setSelectedForm(form);
      setViewMode('responses');

      try {
        const res = await authFetch(`/faculty/forms/${form._id}/responses`);
        if (res.ok) {
          const data = await res.json();
          setFormResponses(data);
        } else {
          pushToast("Failed to fetch responses", "error");
          setFormResponses([]);
        }
      } catch (error) {
        console.error(error);
        pushToast("Error loading data", "error");
      } finally {
        setLoadingResponses(false);
      }
    };

    const addQuestion = () => {
      setQuestions([...questions, { id: Date.now(), label: "", fieldType: "text" }]);
    };

    const removeQuestion = (id) => {
      if (questions.length === 1) return;
      setQuestions(questions.filter(q => q.id !== id));
    };

    const updateQuestion = (id, field, val) => {
      setQuestions(questions.map(q => q.id === id ? { ...q, [field]: val } : q));
    };

    const saveForm = async () => {
      if (!selectedCourse || !formTitle) return pushToast("Please fill title and select course", "error");
      
      try {
        const payload = {
          courseId: selectedCourse,
          title: formTitle,
          description: "Faculty created custom form",
          fields: questions
        };

        const res = await authFetch('/faculty/forms/create', {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          pushToast("Form Created Successfully!", "success");
          setViewMode('list');
          loadData();
          setFormTitle("");
          setQuestions([{ id: 1, label: "", fieldType: "text" }]);
        }
      } catch(e) { pushToast("Creation failed", "error"); }
    };

    // --- RENDERERS ---

    // A. View Responses Component
    const renderResponsesView = () => (
      <div className="animate-in fade-in">
        <div className="flex items-center gap-4 mb-6 pb-4 border-b">
           <button 
              onClick={() => { setViewMode('list'); setFormResponses([]); setSelectedForm(null); }}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
           >
              <ArrowLeft className="w-5 h-5 text-gray-600"/>
           </button>
           <div>
              <h3 className="font-bold text-gray-800 text-xl">{selectedForm?.title}</h3>
              <p className="text-xs text-gray-500">Responses: {formResponses.length} • Course: {selectedForm?.courseId?.name}</p>
           </div>
        </div>

        {loadingResponses ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400"/></div>
        ) : formResponses.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed">
            <User className="w-12 h-12 mx-auto mb-2 text-gray-300"/>
            <p className="text-gray-500 font-medium">No responses yet.</p>
            <p className="text-xs text-gray-400">Share the form with your students to get data.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Loop through each student response */}
            {formResponses.map((resp, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-50">
                   <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                         {resp.studentId?.name ? resp.studentId.name[0] : "A"}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{resp.studentId?.name || "Anonymous Student"}</p>
                        {resp.studentId?.rollNumber && <p className="text-[10px] text-gray-500">{resp.studentId.rollNumber}</p>}
                      </div>
                   </div>
                   <span className="text-[10px] text-gray-400 flex items-center gap-1">
                     <Calendar className="w-3 h-3"/> {new Date(resp.submittedAt).toLocaleDateString()}
                   </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resp.answers.map((ans, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-xl">
                       <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{ans.questionLabel}</p>
                       <p className="text-sm font-medium text-gray-800">{ans.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );

    // B. Main Switch Logic
    return (
      <div className="animate-in fade-in">
        {viewMode === 'responses' && renderResponsesView()}

        {viewMode === 'list' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
               <div>
                  <h3 className="font-bold text-gray-800 text-lg">My Forms & Surveys</h3>
                  <p className="text-xs text-gray-500">Create feedback forms for your students.</p>
               </div>
               <button 
                 onClick={() => setViewMode('create')}
                 className="px-4 py-2 text-white font-bold rounded-xl flex items-center gap-2 hover:opacity-90 transition-all shadow-md shadow-blue-100"
                 style={{ backgroundColor: primaryColor }}
               >
                 <Plus className="w-4 h-4"/> Create New
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myForms.map(form => (
                <div key={form._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                   <div className="flex justify-between items-start mb-3">
                      <div className="p-2 rounded-lg bg-gray-50 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <Layout className="w-5 h-5"/>
                      </div>
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded font-bold">
                        {form.fields.length} Qs
                      </span>
                   </div>
                   <h4 className="font-bold text-gray-800 mb-1">{form.title}</h4>
                   <p className="text-xs text-gray-500 mb-4">Course: {form.courseId?.name || "Unknown"}</p>
                   <div className="flex gap-2 border-t pt-3">
                      {/* FIXED: Added onClick handler here */}
                      <button 
                        onClick={() => handleViewResponses(form)}
                        className="flex-1 text-xs font-bold py-1.5 rounded bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                      >
                        View Responses
                      </button>
                   </div>
                </div>
              ))}
              {myForms.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  <FilePlus className="w-10 h-10 mx-auto mb-2 opacity-20"/>
                  <p>No forms created yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'create' && (
          <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl border border-gray-100 shadow-xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
               <h3 className="font-bold text-gray-800 text-xl">Form Builder</h3>
               <button onClick={() => setViewMode('list')} className="text-xs font-bold text-gray-400 hover:text-gray-600">Cancel</button>
            </div>

            <div className="space-y-4 mb-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500">Select Course</label>
                    <select 
                      className="w-full p-2 mt-1 border rounded-xl text-sm outline-none"
                      value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
                    >
                      <option value="">-- Choose Course --</option>
                      {courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500">Form Title</label>
                    <input 
                      className="w-full p-2 mt-1 border rounded-xl text-sm outline-none"
                      placeholder="e.g. Mid-Sem Feedback"
                      value={formTitle} onChange={e => setFormTitle(e.target.value)}
                    />
                  </div>
               </div>
            </div>

            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200/60">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Questions</span>
               </div>
               
               {questions.map((q, idx) => (
                 <div key={q.id} className="flex gap-3 items-start animate-in slide-in-from-left-2">
                    <span className="mt-2.5 text-xs font-bold text-gray-400 w-4">{idx+1}.</span>
                    <div className="flex-1 space-y-2">
                       <input 
                         className="w-full p-2 border rounded-lg text-sm bg-white" 
                         placeholder="Question text..."
                         value={q.label} onChange={e => updateQuestion(q.id, 'label', e.target.value)}
                       />
                    </div>
                    <select 
                      className="w-32 p-2 border rounded-lg text-xs font-bold bg-white h-10"
                      value={q.fieldType} onChange={e => updateQuestion(q.id, 'fieldType', e.target.value)}
                    >
                      <option value="text">Text Input</option>
                      <option value="rating">1-5 Rating</option>
                      <option value="yesno">Yes / No</option>
                    </select>
                    <button onClick={() => removeQuestion(q.id)} className="p-2.5 text-gray-400 hover:text-red-500 bg-white border rounded-lg h-10">
                      <Trash2 className="w-4 h-4"/>
                    </button>
                 </div>
               ))}
               
               <button onClick={addQuestion} className="mt-4 text-xs font-bold flex items-center gap-1 hover:underline" style={{ color: primaryColor }}>
                 <Plus className="w-3 h-3"/> Add Another Question
               </button>
            </div>

            <div className="mt-6 flex justify-end">
               <button 
                 onClick={saveForm}
                 className="px-8 py-3 text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-transform active:scale-95 flex items-center gap-2"
                 style={{ backgroundColor: primaryColor }}
               >
                 <Save className="w-4 h-4"/> Save Form
               </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 animate-in slide-in-from-bottom-4">
       {/* Settings Sidebar */}
       <div className="w-full md:w-64 shrink-0 space-y-2">
          {[
            { id: 'general', label: 'General', icon: Settings },
            { id: 'support', label: 'Support & Requests', icon: MessageSquare },
            { id: 'forms', label: 'Form Builder', icon: FilePlus },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
                activeTab === tab.id ? "" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
              style={{
                backgroundColor: activeTab === tab.id ? lightPrimaryBg : "white",
                color: activeTab === tab.id ? primaryColor : "#4B5563"
              }}
            >
               <tab.icon className="w-4 h-4" style={{ color: activeTab === tab.id ? primaryColor : "#9CA3AF" }} />
               <span className="text-sm font-bold">{tab.label}</span>
            </button>
          ))}
       </div>

       {/* Main Content */}
       <div className="flex-1 bg-white rounded-[2rem] p-6 md:p-8 border border-gray-100 shadow-sm overflow-y-auto custom-scrollbar">
          <div className="mb-6 pb-4 border-b">
             <h2 className="text-2xl font-bold text-gray-800">
               {activeTab === 'general' && "General Settings"}
               {activeTab === 'support' && "Help Center"}
               {activeTab === 'forms' && "Custom Forms"}
             </h2>
             <p className="text-xs text-gray-400 mt-1">Manage your account and institute interactions.</p>
          </div>
          
          {activeTab === 'general' && <GeneralSettings />}
          {activeTab === 'support' && <SupportPanel />}
          {activeTab === 'forms' && <FormBuilder />}
       </div>
    </div>
  );
};

export default FacultySettings;