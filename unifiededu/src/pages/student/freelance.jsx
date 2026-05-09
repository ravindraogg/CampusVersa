import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, DollarSign, Clock, MapPin, Building2,
  Search, CheckCircle2, BadgeCheck,
  Code, PenTool, TrendingUp, X, ChevronRight,
  Filter, ExternalLink
} from "lucide-react";

// Responsive text reducer helper
const responsiveText = (text, length) => {
  if (window.innerWidth < 500) {
    return text.length > length ? text.substring(0, length) + "…" : text;
  }
  return text;
};

// Categories
const CATEGORIES = [
  { id: "all", name: "All Opportunities", icon: Briefcase },
  { id: "dev", name: "Development", icon: Code },
  { id: "design", name: "Design & Creative", icon: PenTool },
  { id: "marketing", name: "Marketing", icon: TrendingUp }
];

// -----------------------------
// RESPONSIVE SCROLLBAR HIDE
// -----------------------------
const GlobalStyles = () => (
  <style>{`
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
);
const INITIAL_JOBS = [
  // -------------------------------
  // 1–10: College + Alumni Mix
  // -------------------------------
  {
    id: 1,
    title: "Campus Event Website Developer",
    company: "BIT Student Club",
    description: "Build a React-based event management website for the upcoming tech fest.",
    budget: "₹8,000",
    type: "Freelance",
    tags: ["React", "Frontend", "College Project"],
    isAlumni: true,
    verified: true,
    applyLink: "https://indeed.com/job/event-web-developer",
    color: "bg-purple-100 text-purple-600",
    createdAt: "2025-01-01"
  },
  {
    id: 2,
    title: "Alumni Hiring: Junior Backend Developer",
    company: "BIT Alumni Network",
    description: "Work with alumni-led startup to build backend APIs using Node.js.",
    budget: "₹12,500",
    type: "Internship",
    tags: ["Node.js", "API", "MongoDB"],
    isAlumni: true,
    verified: true,
    applyLink: "https://upwork.com/job/backend-api",
    color: "bg-blue-100 text-blue-600",
    createdAt: "2025-01-02"
  },
  {
    id: 3,
    title: "College Magazine Graphic Designer",
    company: "BIT Media Cell",
    description: "Design posters, magazine spreads and digital creatives.",
    budget: "₹5,000",
    type: "Freelance",
    tags: ["Figma", "Poster Design", "Branding"],
    isAlumni: false,
    verified: true,
    applyLink: "https://naukri.com/job/graphic-designer",
    color: "bg-pink-100 text-pink-600",
    createdAt: "2025-01-03"
  },
  {
    id: 4,
    title: "Research Assistant: ML Dataset Cleaning",
    company: "BIT Data Science Lab",
    description: "Assist in cleaning and preparing datasets for ML models.",
    budget: "₹6,000",
    type: "Freelance",
    tags: ["Python", "ML", "Data Cleaning"],
    verified: true,
    applyLink: "https://indeed.com/job/ml-cleaning",
    color: "bg-green-100 text-green-600",
    createdAt: "2025-01-04"
  },
  {
    id: 5,
    title: "Club Website Maintenance Intern",
    company: "BIT Robotics Club",
    description: "Maintain student robotics club website and update content.",
    budget: "₹4,000",
    type: "Part-time",
    tags: ["Web Dev", "HTML", "CSS"],
    verified: true,
    applyLink: "https://linkdin.com/job/robotics-web",
    color: "bg-yellow-100 text-yellow-600",
    createdAt: "2025-01-05"
  },
  {
    id: 6,
    title: "Attendance App Enhancement",
    company: "BIT IT Team",
    description: "Add QR-based attendance and teacher dashboard to existing app.",
    budget: "₹10,000",
    type: "Freelance",
    tags: ["Flutter", "Mobile Dev", "Firebase"],
    isAlumni: true,
    verified: true,
    applyLink: "https://upwork.com/job/flutter-attendance",
    color: "bg-indigo-100 text-indigo-600",
    createdAt: "2025-01-06"
  },
  {
    id: 7,
    title: "College Event Promo Video Editor",
    company: "BIT Film Society",
    description: "Create event teasers, trailers and after-movie edits.",
    budget: "₹3,500",
    type: "Freelance",
    tags: ["Video Editing", "Adobe Premiere", "After Effects"],
    verified: true,
    applyLink: "https://indeed.com/job/editor",
    color: "bg-red-100 text-red-600",
    createdAt: "2025-01-07"
  },
  {
    id: 8,
    title: "Assistant AI Research Intern",
    company: "BIT AI Innovation Cell",
    description: "Help train models and prepare LLM datasets.",
    budget: "₹7,500",
    type: "Internship",
    tags: ["LLM", "Python", "NLP"],
    verified: true,
    applyLink: "https://naukri.com/job/ai-intern",
    color: "bg-lime-100 text-lime-600",
    createdAt: "2025-01-08"
  },
  {
    id: 9,
    title: "Campus Placement Portal QA Tester",
    company: "BIT Placement Cell",
    description: "Test new features for student registration & job posting.",
    budget: "₹5,000",
    type: "Freelance",
    tags: ["QA", "Testing", "Automation"],
    verified: true,
    applyLink: "https://indeed.com/job/qa-testing",
    color: "bg-cyan-100 text-cyan-600",
    createdAt: "2025-01-09"
  },
  {
    id: 10,
    title: "Event Management Assistant",
    company: "BIT Cultural Committee",
    description: "Coordinate with sponsors, prepare materials and manage logistics.",
    budget: "₹3,000",
    type: "Part-time",
    tags: ["Management", "Coordination"],
    verified: true,
    applyLink: "https://eventjobs.com/job/assistant",
    color: "bg-orange-100 text-orange-600",
    createdAt: "2025-01-10"
  },

  // -------------------------------
  // 11–40: Real Freelancing Jobs
  // -------------------------------
  ...Array.from({ length: 30 }, (_, i) => ({
    id: 11 + i,
    title: [
      "React Dashboard Developer",
      "Figma UX/UI Designer",
      "AI Prompt Writer",
      "SEO Landing Page Creator",
      "Backend API Developer",
      "Flutter App Debugger",
      "OpenAI Automation Specialist",
      "E-commerce Product Uploader",
      "Data Cleaning Specialist",
      "Portfolio Website Creator"
    ][Math.floor(Math.random() * 10)],
    company: [
      "Upwork Client",
      "Freelancer Client",
      "TechEdge Pvt. Ltd.",
      "MindCraft Studios",
      "NeoGen AI",
      "BrandSpace Media"
    ][Math.floor(Math.random() * 6)],
    description:
      "Remote freelance project. Work with client to deliver high-quality output in 3–7 days.",
    budget: `₹${3000 + Math.floor(Math.random() * 20000)}`,
    type: "Freelance",
    tags: ["Remote", "Contract", "Flexible Hours"],
    isAlumni: Math.random() > 0.7,
    verified: true,
    applyLink: "https://upwork.com/job/contract-" + (i + 1),
    color: [
      "bg-purple-100 text-purple-600",
      "bg-blue-100 text-blue-600",
      "bg-green-100 text-green-600",
      "bg-red-100 text-red-600",
      "bg-pink-100 text-pink-600",
      "bg-teal-100 text-teal-600"
    ][Math.floor(Math.random() * 6)],
    createdAt: "2025-01-12"
  })),

  // -------------------------------
  // 41–80: Corporate + Internship Blend
  // -------------------------------
  ...Array.from({ length: 40 }, (_, i) => ({
    id: 41 + i,
    title: [
      "Data Analyst Intern",
      "Software Intern - Backend",
      "ML Research Intern",
      "Junior DevOps Associate",
      "Frontend Engineer Intern",
      "CyberSecurity Analyst Trainee"
    ][Math.floor(Math.random() * 6)],
    company: [
      "Infosys Springboard",
      "TCS NQT",
      "Accenture Innovation Hub",
      "Wipro Future Skills",
      "IBM SkillsBuild"
    ][Math.floor(Math.random() * 5)],
    description:
      "Work with engineering teams on real-world products, pipelines and dashboards.",
    budget: `₹${8000 + Math.floor(Math.random() * 15000)}`,
    type: "Internship",
    tags: ["Internship", "Corporate"],
    verified: true,
    applyLink: "https://naukri.com/job/internship-" + (i + 1),
    color: [
      "bg-yellow-100 text-yellow-600",
      "bg-indigo-100 text-indigo-600",
      "bg-violet-100 text-violet-600"
    ][Math.floor(Math.random() * 3)],
    createdAt: "2025-01-15"
  })),

  // -------------------------------
  // 81–120: Mixed Creative + Technical + Admin
  // -------------------------------
  ...Array.from({ length: 40 }, (_, i) => ({
    id: 81 + i,
    title: [
      "Content Writer (Tech Blogs)",
      "Social Media Manager",
      "Canva Creative Designer",
      "Podcast Audio Editor",
      "Discord Community Moderator",
      "3D Model Designer",
      "YouTube Thumbnail Artist",
      "Python Automation Script Developer"
    ][Math.floor(Math.random() * 8)],
    company: [
      "ByteCraft",
      "CreativeHive",
      "DigitalEdge Media",
      "CampusHub",
      "TalentForge Studios"
    ][Math.floor(Math.random() * 5)],
    description:
      "A small project with flexible deadlines and remote working opportunity.",
    budget: `₹${2000 + Math.floor(Math.random() * 8000)}`,
    type: "Freelance",
    tags: ["Remote", "Creative", "Short-Term"],
    verified: Math.random() > 0.3,
    applyLink: "https://freelancer.com/job/" + (i + 81),
    color: [
      "bg-rose-100 text-rose-600",
      "bg-sky-100 text-sky-600",
      "bg-emerald-100 text-emerald-600"
    ][Math.floor(Math.random() * 3)],
    createdAt: "2025-01-20"
  }))
];

const JobCard = ({ job, onClick, theme }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5, boxShadow: "0 12px 32px -10px rgba(0,0,0,0.15)" }}
    onClick={onClick}
    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 cursor-pointer transition-all"
  >

    <div className="flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${job.color}`}>
        {job.company[0]}
      </div>

      <div className="flex-1">
        <h3 className="font-bold text-gray-900 text-lg sm:text-base">
          {responsiveText(job.title, 25)}
        </h3>
        <p className="text-sm text-gray-500 flex items-center gap-1">
          {responsiveText(job.company, 18)}
          {job.verified && <CheckCircle2 size={14} className="text-blue-500" />}
        </p>
      </div>
    </div>

    <div className="flex flex-wrap gap-2 mt-3 mb-4">
      {job.tags?.map((t, i) => (
        <span key={i} className="px-3 py-1 bg-gray-50 text-gray-600 text-xs rounded-full border">
          {t}
        </span>
      ))}
    </div>

    <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-3">
      <span className="flex items-center gap-1">
        <DollarSign size={14} className="text-green-600" /> {job.budget}
      </span>
      <span className="flex items-center gap-1">
        <Clock size={14} /> {job.type}
      </span>
    </div>
  </motion.div>
);

// ------------------------------------
// JOB DETAIL MODAL
// ------------------------------------
const JobDetail = ({ job, onClose, theme }) => (
  <motion.div
    initial={{ x: "100%" }}
    animate={{ x: 0 }}
    exit={{ x: "100%" }}
    className="fixed inset-y-0 right-0 w-full sm:w-full md:w-[550px] lg:w-[600px] bg-white shadow-2xl z-50 overflow-y-auto border-l"
  >
    <div className="p-6 sm:p-8">
      <button
        onClick={onClose}
        className="mb-6 flex items-center text-gray-500 hover:text-gray-800 font-medium"
      >
        <ChevronRight className="rotate-180" size={20} /> Back
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold ${job.color}`}>
          {job.company[0]}
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            {job.title}
          </h1>
          <p className="text-gray-500 flex items-center gap-2">
            <Building2 size={16} /> {job.company}
          </p>
        </div>
      </div>

      <div className="p-4 bg-gray-50 rounded-xl border mb-6">
        <p className="text-xs uppercase text-gray-500">Budget</p>
        <p className="text-lg font-bold text-green-600">{job.budget}</p>
      </div>

      <p className="text-gray-600 leading-relaxed">
        {job.description}
      </p>
    </div>

    <div className="sticky bottom-0 bg-white p-4 sm:p-6 border-t flex flex-col sm:flex-row gap-3">
      <a
        href={job.applyLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 py-4 rounded-xl font-bold shadow flex items-center justify-center gap-2"
        style={{ backgroundColor: theme.primary, color: theme.textOnPrimary }}
      >
        Apply Now <ExternalLink size={18} />
      </a>

      <button className="px-6 py-4 border rounded-xl font-bold">Save</button>
    </div>
  </motion.div>
);
const FreelanceHub = ({ theme }) => {
  const [activeTab, setActiveTab] = useState("all");
  const [jobs, setJobs] = useState(INITIAL_JOBS); // using your dataset
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);

  const activeTheme = theme || {
    primary: "#4F46E5",
    secondary: "#E0E7FF",
    textOnPrimary: "#fff"
  };

  const filteredJobs =
    activeTab === "all"
      ? jobs
      : jobs.filter(j =>
        j.tags?.some(t => t.toLowerCase().includes(activeTab))
      );

  const searchJobs = () => {
    const term = searchInput.toLowerCase();
    const matched = INITIAL_JOBS.filter(j =>
      j.title.toLowerCase().includes(term) ||
      j.company.toLowerCase().includes(term)
    );
    setJobs(matched);
  };
  return (
    <div className="w-full font-sans p-4 sm:p-6">
      <GlobalStyles />

      {/* Header */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">Freelance Opportunities</h1>
      <p className="text-gray-500 mb-6">{jobs.length} jobs found</p>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          className="flex-1 border p-3 rounded-xl"
          placeholder="Search by title or company…"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && searchJobs()}
        />

        <button
          onClick={searchJobs}
          className="px-4 py-3 rounded-xl flex items-center justify-center gap-2 text-white"
          style={{ backgroundColor: activeTheme.primary, color: activeTheme.textOnPrimary }}
        >
          <Search size={18} /> Search
        </button>
      </div>

      {/* Categories */}
      <div className="flex gap-3 mb-6 overflow-x-auto no-scrollbar pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`px-4 py-2 rounded-xl border flex items-center gap-2 whitespace-nowrap ${activeTab === cat.id
              ? "text-white"
              : "bg-white text-gray-600"
              }`}
            style={
              activeTab === cat.id
                ? { backgroundColor: activeTheme.primary }
                : {}
            }
          >
            <cat.icon size={18} /> {cat.name}
          </button>
        ))}
      </div>

      {/* JOB GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loadingJobs ? (
          <div className="col-span-full text-center py-20 text-gray-500">
            Loading jobs…
          </div>
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onClick={() => setSelectedJob(job)}
              theme={activeTheme}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-20 text-gray-500">
            No jobs found.
          </div>
        )}
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {selectedJob && (
          <JobDetail
            job={selectedJob}
            onClose={() => setSelectedJob(null)}
            theme={activeTheme}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FreelanceHub;