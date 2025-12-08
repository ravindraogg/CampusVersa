import React, { useState, useEffect } from "react";
import { Users, Search, AlertCircle, Loader2, Filter, BookOpen, ChevronRight } from "lucide-react";
import FacultyStudentInfo from "./FacultyStudentInfo";
const API_URL = import.meta.env.VITE_BACK_URI;
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
  
  // 'all' = Read Only Mode, 'enrolled' = Edit Mode
  const [filterMode, setFilterMode] = useState("all"); 
  
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    loadData();
  }, [faculty]);

  const loadData = async () => {
    if (!faculty) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await authFetch("/institute/students?limit=0");
      const responseData = await res.json();
      const allStudents = Array.isArray(responseData) ? responseData : (responseData.data || []);

      const myDeptStudents = allStudents.filter(
        (s) => s.department === faculty.department
      );
      
      setStudents(myDeptStudents);
    } catch (e) {
      console.error("Failed to load data", e);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
  };

  const handleBack = () => {
    setSelectedStudent(null);
    loadData(); 
  };

  const isEnrolledWithMe = (student) => {
    if (!student.courseEnrollments || !faculty) return false;
    const myOptedCourses = (faculty.courses || []).map(id => String(id?._id || id));

    return student.courseEnrollments.some(sem => 
      sem.subjects && sem.subjects.some(sub => {
        const studentCourseId = String(sub.courseId?._id || sub.courseId);
        return myOptedCourses.includes(studentCourseId);
      })
    );
  };

  // --- VIEW: DETAILED INFO ---
  if (selectedStudent) {
    return (
      <FacultyStudentInfo 
        student={selectedStudent} 
        onBack={handleBack} 
        theme={theme}
        authFetch={authFetch}
        faculty={faculty}
        viewMode={filterMode} // <--- PASSING THE MODE HERE ('all' or 'enrolled')
        refreshData={async () => {
           const res = await authFetch(`/institute/students?limit=0`); 
           const data = await res.json();
           const all = Array.isArray(data) ? data : data.data;
           const updated = all.find(s => s._id === selectedStudent._id);
           if(updated) setSelectedStudent(updated);
        }}
      />
    );
  }

  // --- VIEW: LIST ---
  const filteredStudents = students.filter(s => {
    const matchesSearch = 
      s.name?.toLowerCase().includes(search.toLowerCase()) || 
      s.SID?.toLowerCase().includes(search.toLowerCase()) ||
      (s.rollNumber && s.rollNumber.toLowerCase().includes(search.toLowerCase()));
    
    if (filterMode === 'enrolled') {
      return matchesSearch && isEnrolledWithMe(s);
    }
    return matchesSearch;
  });

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

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by Name, SID, or Roll Number..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 outline-none focus:border-blue-500 transition-all shadow-sm bg-gray-50 focus:bg-white"
          />
        </div>

        <div className="flex bg-gray-100 p-1 rounded-2xl shrink-0">
           <button 
             onClick={() => setFilterMode('all')}
             className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterMode === 'all' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
           >
             All Students
           </button>
           <button 
             onClick={() => setFilterMode('enrolled')}
             className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${filterMode === 'enrolled' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
           >
             <BookOpen className="w-3 h-3" /> My Students
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-white rounded-[2.5rem] border border-gray-100 flex flex-col shadow-sm">
        <div className="grid grid-cols-12 bg-gray-50 p-5 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-5">Student Details</div>
          <div className="col-span-3">Year & Section</div>
          <div className="col-span-3 text-right">Status</div>
        </div>
        
        <div className="overflow-y-auto flex-1 p-3 custom-scrollbar">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((s, i) => {
              const isEnrolled = isEnrolledWithMe(s);
              
              return (
                <div
                  key={s._id}
                  onClick={() => handleStudentClick(s)}
                  className="grid grid-cols-12 p-4 border-b border-gray-50 hover:bg-blue-50 transition-colors rounded-2xl items-center group cursor-pointer"
                >
                  <div className="col-span-1 text-gray-400 text-sm font-medium pl-2">{i + 1}</div>
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold group-hover:bg-white transition-colors overflow-hidden relative">
                      {s.profilePic ? <img src={s.profilePic} alt="Profile" className="w-full h-full object-cover" /> : (s.name?.charAt(0) || "?")}
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                         <p className="font-bold text-gray-800 text-sm group-hover:text-blue-600 transition-colors">{s.name}</p>
                         {isEnrolled && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-bold rounded-md border border-blue-200">Enrolled</span>}
                      </div>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{s.SID}</p>
                    </div>
                  </div>
                  <div className="col-span-3 text-sm text-gray-600 font-medium">
                    <span className="bg-gray-100 px-2 py-1 rounded-lg">{s.year} Year</span>
                    {s.section && <span className="ml-2 text-gray-400">Sec {s.section}</span>}
                  </div>
                  <div className="col-span-3 text-right pr-2 flex justify-end items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 w-fit ${s.academic?.cgpa > 8 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {s.academic?.cgpa ? `${s.academic.cgpa} CGPA` : 'New'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-20 text-center text-gray-400 flex flex-col items-center">
              <Users className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">No students found.</p>
              {filterMode === 'enrolled' && <p className="text-sm mt-2">No students match your filter.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyStudent;