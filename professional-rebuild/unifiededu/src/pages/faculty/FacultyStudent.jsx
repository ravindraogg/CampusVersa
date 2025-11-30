import React, { useState, useEffect } from "react";
import { Users, Search, AlertCircle, Loader2 } from "lucide-react";

const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-6 border-b border-gray-100 pb-4">
    <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
    {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
  </div>
);

const FacultyStudent = ({ authFetch, theme, faculty }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchStudents();
  }, [faculty]);

  const fetchStudents = async () => {
    if (!faculty) return;
    setLoading(true);
    try {
      // Fetch all students (limit=0 implies no limit in your server logic)
      const res = await authFetch("/institute/students?limit=0");
      const responseData = await res.json();
      
      // Handle the specific response structure { data: [], total: ... }
      const allStudents = Array.isArray(responseData) ? responseData : (responseData.data || []);

      // Filter by Faculty's Department
      const myDeptStudents = allStudents.filter(
        (s) => s.department === faculty.department
      );
      
      setStudents(myDeptStudents);
    } catch (e) {
      console.error("Failed to load students", e);
    } finally {
      setLoading(false);
    }
  };

  // Filter based on Search
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.SID.toLowerCase().includes(search.toLowerCase()) ||
    (s.rollNumber && s.rollNumber.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: theme.primary }} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-in fade-in">
      <SectionHeader
        title="Student Directory"
        subtitle={`Total ${students.length} students in Department of ${faculty?.department}`}
      />

      {/* Search Bar */}
      <div className="mb-6 relative">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search by Name, SID, or Roll Number..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 outline-none focus:border-blue-500 transition-all shadow-sm bg-gray-50 focus:bg-white"
        />
      </div>

      <div className="flex-1 overflow-hidden bg-white rounded-[2.5rem] border border-gray-100 flex flex-col shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-12 bg-gray-50 p-5 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-5">Student Details</div>
          <div className="col-span-3">Year & Section</div>
          <div className="col-span-3 text-right">Status</div>
        </div>
        
        {/* Table Body */}
        <div className="overflow-y-auto flex-1 p-3 custom-scrollbar">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((s, i) => (
              <div
                key={s._id}
                className="grid grid-cols-12 p-4 border-b border-gray-50 hover:bg-blue-50 transition-colors rounded-2xl items-center group"
              >
                <div className="col-span-1 text-gray-400 text-sm font-medium pl-2">
                  {i + 1}
                </div>
                <div className="col-span-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold group-hover:bg-white transition-colors overflow-hidden">
                    {s.profilePic ? (
                      <img src={s.profilePic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      s.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{s.name}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">
                      {s.SID}
                    </p>
                  </div>
                </div>
                <div className="col-span-3 text-sm text-gray-600 font-medium">
                  <span className="bg-gray-100 px-2 py-1 rounded-lg">
                    {s.year} Year
                  </span>
                  {s.section && (
                    <span className="ml-2 text-gray-400">Sec {s.section}</span>
                  )}
                  {s.semester && (
                    <span className="ml-2 text-blue-500 text-xs">Sem {s.semester}</span>
                  )}
                </div>
                <div className="col-span-3 text-right pr-2">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1 w-fit ml-auto">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>{" "}
                    Active
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-20 text-center text-gray-400 flex flex-col items-center">
              <Users className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">No students found.</p>
              <p className="text-sm">
                Try adjusting your search or contact the admin.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyStudent;