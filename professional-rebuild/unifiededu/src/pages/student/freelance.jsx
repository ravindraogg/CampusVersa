import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, DollarSign, Clock, MapPin, Building2, 
  Search, Plus, CheckCircle2, UserCircle, BadgeCheck,
  Globe, Code, PenTool, TrendingUp, X, ChevronRight,
  Filter, Star
} from 'lucide-react';

// --- MOCK DATA ---
const INITIAL_JOBS = [
  {
    id: '1',
    title: 'Frontend Developer for College Fest Website',
    company: 'Student Council',
    description: 'We need a React developer to build the landing page for the upcoming annual fest. Must know Tailwind CSS and basic animations.',
    budget: '$200',
    type: 'Freelance',
    tags: ['React', 'Tailwind', 'Web Design'],
    isAlumni: false,
    verified: true,
    color: 'bg-purple-100 text-purple-600',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Logo Designer Needed',
    company: 'TechStart Startup',
    description: 'Looking for a creative logo designer for our new AI startup incubated at the college. Need 3 variations.',
    budget: '$50',
    type: 'Contract',
    tags: ['Design', 'Figma', 'Branding'],
    isAlumni: true, // Alumni post example
    verified: true,
    color: 'bg-blue-100 text-blue-600',
    createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
  },
  {
    id: '3',
    title: 'Social Media Manager',
    company: 'Campus Cafeteria',
    description: 'Manage our Instagram page. Create reels and posts to promote daily specials. Good photography skills required.',
    budget: '$15/hr',
    type: 'Part-time',
    tags: ['Marketing', 'Social Media', 'Content Creation'],
    isAlumni: false,
    verified: false,
    color: 'bg-pink-100 text-pink-600',
    createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
  }
];

const CATEGORIES = [
  { id: 'all', name: 'All Opportunities', icon: Briefcase },
  { id: 'dev', name: 'Development', icon: Code },
  { id: 'design', name: 'Design & Creative', icon: PenTool },
  { id: 'marketing', name: 'Marketing', icon: TrendingUp },
];

// --- COMPONENTS ---

// 1. Job Card Component
const JobCard = ({ job, onClick }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(125, 90, 254, 0.2)" }}
    onClick={onClick}
    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer relative overflow-hidden group"
  >
    {job.isAlumni && (
      <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10 flex items-center gap-1">
        <BadgeCheck size={12} /> ALUMNI POST
      </div>
    )}
    
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${job.color || 'bg-blue-100 text-blue-600'}`}>
          {job.company[0]}
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">{job.title}</h3>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            {job.company} 
            {job.verified && <CheckCircle2 size={14} className="text-blue-500" />}
          </p>
        </div>
      </div>
    </div>

    <div className="flex flex-wrap gap-2 mb-4">
      {job.tags?.map((tag, i) => (
        <span key={i} className="px-3 py-1 bg-gray-50 text-gray-600 text-xs rounded-full font-medium border border-gray-100">
          {tag}
        </span>
      ))}
    </div>

    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1"><DollarSign size={14} className="text-green-600"/> {job.budget}</span>
        <span className="flex items-center gap-1"><Clock size={14} /> {job.type}</span>
      </div>
      <span className="text-xs font-medium text-indigo-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        View Details <ChevronRight size={14} />
      </span>
    </div>
  </motion.div>
);

// 2. Post Job Modal
const PostJobModal = ({ onClose, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    budget: '',
    type: 'Freelance',
    tags: '',
    isAlumni: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const colors = ['bg-blue-100 text-blue-600', 'bg-purple-100 text-purple-600', 'bg-indigo-100 text-indigo-600', 'bg-pink-100 text-pink-600'];
    
    onSubmit({
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()),
      verified: true,
      color: colors[Math.floor(Math.random() * colors.length)],
      createdAt: new Date().toISOString()
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} 
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">Post an Opportunity</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
            <input required type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. React Developer" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company/Client</label>
              <input required type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. TechCorp" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget/Stipend</label>
              <input required type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. $500 or $20/hr" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea required rows={4} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="Describe the project requirements..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
            <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="React, Design, Figma..." value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} />
          </div>

          <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
            <input type="checkbox" id="alumni" className="w-5 h-5 text-indigo-600 rounded" checked={formData.isAlumni} onChange={e => setFormData({...formData, isAlumni: e.target.checked})} />
            <label htmlFor="alumni" className="text-sm font-medium text-indigo-900 cursor-pointer">
              I am a College Alumni / Staff Member
              <span className="block text-xs text-indigo-600 font-normal">Your post will get a verified badge.</span>
            </label>
          </div>

          <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
            {isSubmitting ? 'Publishing...' : 'Publish Opportunity'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

// 3. Job Detail View
const JobDetail = ({ job, onClose }) => (
  <motion.div 
    initial={{ x: '100%' }}
    animate={{ x: 0 }}
    exit={{ x: '100%' }}
    transition={{ type: "spring", damping: 25, stiffness: 200 }}
    className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white shadow-2xl z-40 overflow-y-auto border-l border-gray-100"
  >
    <div className="p-8">
      <button onClick={onClose} className="mb-6 flex items-center text-gray-500 hover:text-gray-800 transition-colors font-medium">
        <ChevronRight className="rotate-180" size={20} /> Back to Listings
      </button>

      <div className="flex items-center justify-between mb-6">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold ${job.color}`}>
          {job.company[0]}
        </div>
        {job.isAlumni && (
          <span className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
            <BadgeCheck size={14} /> Alumni Verified
          </span>
        )}
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
      <div className="flex items-center gap-4 text-gray-500 mb-8">
        <span className="flex items-center gap-1 font-medium text-gray-900"><Building2 size={16} /> {job.company}</span>
        <span>•</span>
        <span className="flex items-center gap-1"><MapPin size={16} /> Remote</span>
        <span>•</span>
        <span className="flex items-center gap-1"><Clock size={16} /> Posted {new Date(job.createdAt).toLocaleDateString()}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Budget</p>
          <p className="text-lg font-bold text-green-600">{job.budget}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Type</p>
          <p className="text-lg font-bold text-gray-900">{job.type}</p>
        </div>
      </div>

      <div className="prose prose-indigo max-w-none mb-8 text-gray-600 leading-relaxed">
        <h3 className="text-gray-900 font-bold text-lg mb-3">About the Role</h3>
        <p className="whitespace-pre-wrap">{job.description}</p>
      </div>

      <div className="mb-8">
        <h3 className="text-gray-900 font-bold text-lg mb-3">Skills Required</h3>
        <div className="flex flex-wrap gap-2">
          {job.tags?.map((tag, i) => (
            <span key={i} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>

    <div className="sticky bottom-0 p-6 bg-white border-t border-gray-100 flex gap-4 backdrop-blur-xl bg-white/90">
      <button className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2">
        Apply Now <ExternalLink size={18} />
      </button>
      <button className="px-6 py-4 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold rounded-xl transition-all">
        Save
      </button>
    </div>
  </motion.div>
);

// --- MAIN PAGE ---
const Freelance = () => {
  // Mock User State - We simulate a logged in user so features work
  const [user] = useState({ uid: 'mock-user-123', displayName: 'Student User' });
  
  const [activeTab, setActiveTab] = useState('all');
  const [isRecruiterMode, setIsRecruiterMode] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 3. Add Job (Local State Only)
  const handlePostJob = (jobData) => {
    setIsSubmitting(true);
    
    // Simulate network delay
    setTimeout(() => {
      const newJob = {
        id: Date.now().toString(),
        ...jobData,
        postedBy: user.uid
      };
      
      setJobs(prevJobs => [newJob, ...prevJobs]);
      setShowPostModal(false);
      setIsRecruiterMode(false); // Switch back to see the post
      setIsSubmitting(false);
    }, 800);
  };

  const filteredJobs = activeTab === 'all' 
    ? jobs 
    : jobs.filter(j => j.tags?.some(t => t.toLowerCase().includes(activeTab)));

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative overflow-x-hidden">
      
      {/* Sidebar Navigation */}
      <div className="fixed left-0 top-0 h-full w-20 md:w-64 bg-white border-r border-gray-200 hidden md:flex flex-col z-10">
        <div className="p-6">
          <h1 className="text-2xl font-extrabold text-indigo-600 flex items-center gap-2">
            <Globe className="fill-indigo-600 text-white" />
            <span className="hidden md:block">Freelance</span>
          </h1>
          <p className="text-xs text-gray-500 mt-2 hidden md:block">Student Job Market</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                activeTab === cat.id 
                  ? 'bg-indigo-50 text-indigo-600 font-bold' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <cat.icon size={20} />
              <span className="hidden md:block">{cat.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-white hidden md:block">
            <p className="text-sm font-bold mb-1">Recruiting?</p>
            <p className="text-xs opacity-90 mb-3">Post jobs for students and alumni.</p>
            <button 
              onClick={() => { setIsRecruiterMode(true); setShowPostModal(true); }}
              className="w-full py-2 bg-white text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors"
            >
              Post a Job
            </button>
          </div>
          {/* Mobile Icon Only */}
          <button 
            onClick={() => { setIsRecruiterMode(true); setShowPostModal(true); }}
            className="md:hidden w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:ml-64 p-4 md:p-8 max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Explore Opportunities</h2>
            <p className="text-gray-500 mt-1">
              {jobs.length} open positions • <span className="text-indigo-600 font-medium">Verified Client Network</span>
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
             <button 
               onClick={() => setIsRecruiterMode(false)}
               className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!isRecruiterMode ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
             >
               Find Work
             </button>
             <button 
               onClick={() => setIsRecruiterMode(true)}
               className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isRecruiterMode ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
             >
               Recruiter View
             </button>
          </div>
        </header>

        {/* Recruiter CTA if empty or just extra visibility */}
        {isRecruiterMode && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }}
            className="mb-8 bg-indigo-900 text-white rounded-3xl p-8 flex items-center justify-between shadow-xl relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2">Hire Top Student Talent</h3>
              <p className="text-indigo-200 max-w-xl">Post internships, freelance gigs, or full-time roles directly to the college network. Alumni posts get a verified badge.</p>
            </div>
            <button 
              onClick={() => setShowPostModal(true)}
              className="relative z-10 px-6 py-3 bg-white text-indigo-900 font-bold rounded-xl hover:bg-indigo-50 transition-colors flex items-center gap-2"
            >
              <Plus size={18} /> Create Post
            </button>
          </motion.div>
        )}

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by title, skill, or company..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
            />
          </div>
          <button className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 font-medium flex items-center gap-2 hover:border-gray-300">
            <Filter size={18} /> Filters
          </button>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredJobs.length > 0 ? (
              filteredJobs.map(job => (
                <JobCard key={job.id} job={job} onClick={() => setSelectedJob(job)} />
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="col-span-full py-20 text-center"
              >
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="text-gray-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">No opportunities found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your filters or be the first to post!</p>
                <button 
                  onClick={() => setShowPostModal(true)}
                  className="mt-6 text-indigo-600 font-bold hover:underline"
                >
                  Post an Opportunity
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showPostModal && (
          <PostJobModal 
            onClose={() => setShowPostModal(false)} 
            onSubmit={handlePostJob} 
            isSubmitting={isSubmitting}
          />
        )}
        {selectedJob && (
          <JobDetail 
            job={selectedJob} 
            onClose={() => setSelectedJob(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Freelance;