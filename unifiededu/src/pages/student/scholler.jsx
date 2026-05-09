import React, { useState, useEffect } from 'react';
import { 
  Award, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Info, 
  Calendar, 
  Search, 
  Building2, 
  Filter,
  ArrowRight,
  Landmark,
  IndianRupee
} from 'lucide-react';

// --- MOCK DATA (Fallback if API fails) ---
const MOCK_SCHOLARSHIPS = [
  {
    id: 1,
    title: "Post Matric Scholarships Scheme for Minorities",
    ministry: "Ministry of Minority Affairs",
    type: "Central",
    amount: "₹3,000 - ₹10,000 / year",
    deadline: "2025-10-31",
    category: ["Muslim", "Sikh", "Christian", "Buddhist", "Jain", "Parsi"],
    incomeLimit: 200000,
    minMarks: 50,
    link: "https://scholarships.gov.in/"
  },
  {
    id: 2,
    title: "Merit Cum Means Scholarship for Professional and Technical Courses",
    ministry: "Ministry of Minority Affairs",
    type: "Central",
    amount: "₹20,000 / year + Maintenance",
    deadline: "2025-11-15",
    category: ["Muslim", "Sikh", "Christian", "Buddhist", "Jain", "Parsi"],
    incomeLimit: 250000,
    minMarks: 50,
    link: "https://scholarships.gov.in/"
  },
  {
    id: 3,
    title: "Post-Matric Scholarship for SC Students",
    ministry: "Ministry of Social Justice & Empowerment",
    type: "Central",
    amount: "Full Tuition Fee + Maintenance",
    deadline: "2025-12-05",
    category: ["SC"],
    incomeLimit: 250000,
    minMarks: 0, // No specific % often, just pass
    link: "https://scholarships.gov.in/"
  },
  {
    id: 4,
    title: "AICTE Pragati Scholarship for Girl Students",
    ministry: "AICTE",
    type: "Technical",
    amount: "₹50,000 / year",
    deadline: "2025-12-31",
    category: ["General", "SC", "ST", "OBC"],
    gender: "Female",
    incomeLimit: 800000,
    minMarks: 0, // Merit based
    link: "https://www.aicte-india.org/schemes/students-development-schemes"
  },
  {
    id: 5,
    title: "Central Sector Scheme of Scholarships for College and University Students",
    ministry: "Department of Higher Education",
    type: "Central",
    amount: "₹10,000 - ₹20,000 / year",
    deadline: "2025-10-31",
    category: ["General", "SC", "ST", "OBC"],
    incomeLimit: 800000,
    minMarks: 80, // Top 20th Percentile
    link: "https://scholarships.gov.in/"
  },
  {
    id: 6,
    title: "Prime Minister's Scholarship Scheme for CAPF & Assam Rifles",
    ministry: "Ministry of Home Affairs",
    type: "Defense",
    amount: "₹3,000/month (Girls), ₹2,500/month (Boys)",
    deadline: "2025-11-30",
    category: ["General", "SC", "ST", "OBC"],
    minMarks: 60,
    link: "https://scholarships.gov.in/"
  }
];

const ScholarshipSection = ({ theme, student }) => {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All'); // All, Eligible, Central, State
  const [searchQuery, setSearchQuery] = useState('');
  const [viewDetails, setViewDetails] = useState(null);

  // Use props or default mock student profile if data is missing
  const studentProfile = {
    category: student?.category || "General", // SC, ST, OBC, General
    income: student?.annualIncome || 150000, // Annual Family Income
    gender: student?.gender || "Male",
    marks: student?.academic?.lastSemMarks || 75, // Last exam percentage
    religion: student?.religion || "Hindu"
  };

  useEffect(() => {
    // Simulate API Call
    const fetchScholarships = async () => {
      setLoading(true);
      try {
        // In a real app: const res = await fetch('/api/scholarships');
        // const data = await res.json();
        
        // Simulating network delay
        setTimeout(() => {
          setScholarships(MOCK_SCHOLARSHIPS);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Failed to fetch scholarships", error);
        setScholarships(MOCK_SCHOLARSHIPS); // Fallback
        setLoading(false);
      }
    };

    fetchScholarships();
  }, []);

  // --- ELIGIBILITY LOGIC ---
  const checkEligibility = (scheme) => {
    const reasons = [];
    let isEligible = true;

    // 1. Income Check
    if (scheme.incomeLimit && studentProfile.income > scheme.incomeLimit) {
      isEligible = false;
      reasons.push(`Income > ₹${(scheme.incomeLimit/100000).toFixed(1)}L`);
    }

    // 2. Marks Check
    if (scheme.minMarks && studentProfile.marks < scheme.minMarks) {
      isEligible = false;
      reasons.push(`Marks < ${scheme.minMarks}%`);
    }

    // 3. Category/Religion Check (Simplified)
    // If scheme lists specific categories and student isn't in it
    // Note: Real logic is complex (Minorities = specific religions)
    const minorities = ["Muslim", "Sikh", "Christian", "Buddhist", "Jain", "Parsi"];
    
    if (scheme.ministry.includes("Minority")) {
       if (!minorities.includes(studentProfile.religion)) {
          isEligible = false;
          reasons.push("Not Minority Community");
       }
    } else if (scheme.category && !scheme.category.includes("General") && !scheme.category.includes(studentProfile.category)) {
       isEligible = false;
       reasons.push(`Only for ${scheme.category.join('/')}`);
    }

    // 4. Gender Check
    if (scheme.gender && scheme.gender !== studentProfile.gender) {
      isEligible = false;
      reasons.push(`Only for ${scheme.gender}s`);
    }

    return { isEligible, reasons };
  };

  // --- FILTERING ---
  const filteredScholarships = scholarships.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.ministry.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filterType === 'All') return true;
    if (filterType === 'Central') return item.type === 'Central';
    if (filterType === 'Technical') return item.type === 'Technical';
    
    if (filterType === 'Eligible') {
      return checkEligibility(item).isEligible;
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-500">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Fetching Government Schemes...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col gap-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Landmark className="w-6 h-6 text-emerald-600" /> 
            Scholarship Portal
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Browse and apply for Government & State schemes.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search schemes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-64"
            />
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {['All', 'Eligible', 'Central'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterType(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterType === tab 
                    ? 'bg-white text-emerald-700 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto pb-10 pr-2 custom-scrollbar">
        {filteredScholarships.length > 0 ? (
          filteredScholarships.map((scheme) => {
            const status = checkEligibility(scheme);
            const isDeadlineClose = new Date(scheme.deadline) < new Date(new Date().setDate(new Date().getDate() + 30));

            return (
              <div 
                key={scheme.id} 
                className="group bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-xl hover:border-emerald-100 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wide border border-emerald-100">
                      {scheme.type} Govt
                    </span>
                    {isDeadlineClose && (
                      <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-[10px] font-bold flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Closing Soon
                      </span>
                    )}
                  </div>

                  {/* Title & Ministry */}
                  <h3 className="font-bold text-gray-800 text-lg leading-snug mb-1 group-hover:text-emerald-700 transition-colors">
                    {scheme.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-4">
                    <Building2 className="w-3 h-3" />
                    {scheme.ministry}
                  </div>

                  {/* Key Info Grid */}
                  <div className="bg-gray-50 rounded-xl p-3 grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Benefit Amount</p>
                      <p className="text-sm font-bold text-gray-900 flex items-center gap-1">
                         {scheme.amount}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Deadline</p>
                      <p className="text-sm font-bold text-gray-900">
                        {new Date(scheme.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Eligibility Status Bar */}
                  <div className={`rounded-lg p-2.5 mb-4 text-xs border ${
                    status.isEligible 
                      ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' 
                      : 'bg-red-50/50 border-red-100 text-red-800'
                  }`}>
                    <div className="flex items-center gap-2 font-bold mb-1">
                      {status.isEligible ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span>{status.isEligible ? "You are Eligible" : "Not Eligible"}</span>
                    </div>
                    {!status.isEligible && (
                      <ul className="list-disc list-inside opacity-80 pl-1 space-y-0.5">
                        {status.reasons.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-2">
                   <button 
                     onClick={() => setViewDetails(viewDetails === scheme.id ? null : scheme.id)}
                     className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50 transition-colors"
                   >
                     {viewDetails === scheme.id ? "Hide Criteria" : "Criteria"}
                   </button>
                   <a 
                     href={scheme.link} 
                     target="_blank" 
                     rel="noreferrer"
                     className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-gray-200"
                   >
                     Apply Now <ExternalLink className="w-3 h-3" />
                   </a>
                </div>

                {/* Expanded Details (Accordion) */}
                {viewDetails === scheme.id && (
                  <div className="mt-4 pt-4 border-t border-dashed border-gray-200 animate-in fade-in slide-in-from-top-1">
                     <p className="text-xs font-bold text-gray-700 mb-2">Detailed Criteria:</p>
                     <ul className="space-y-1.5">
                        <li className="flex items-start gap-2 text-xs text-gray-500">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                           <span>Family Income should be less than ₹{(scheme.incomeLimit/100000).toFixed(1)} Lakh.</span>
                        </li>
                        <li className="flex items-start gap-2 text-xs text-gray-500">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                           <span>Must have secured min {scheme.minMarks}% in previous exam.</span>
                        </li>
                        <li className="flex items-start gap-2 text-xs text-gray-500">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                           <span>Applicable for {scheme.category.join(', ')} categories.</span>
                        </li>
                     </ul>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
            <Filter className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">No scholarships found matching your filters.</p>
            <button 
              onClick={() => {setFilterType('All'); setSearchQuery('');}}
              className="mt-2 text-xs text-emerald-600 font-bold hover:underline"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScholarshipSection;
