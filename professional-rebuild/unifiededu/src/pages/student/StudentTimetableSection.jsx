import React, { useState, useEffect } from "react";
import { Clock, Users, Calendar, ChevronDown, CheckCircle, AlertCircle } from "lucide-react";

const StudentTimetableSection = ({ 
  timetables = [], 
  student, 
  theme = { primary: "#2E5843" } 
}) => {
  const [selectedTimetable, setSelectedTimetable] = useState(null);

  // Auto-select logic
  useEffect(() => {
    if (timetables.length > 0) {
      // 1. Try to find match for student's current semester
      const match = timetables.find(t => t.semester === student?.semester);
      // 2. Default to first found
      setSelectedTimetable(match || timetables[0]);
    }
  }, [timetables, student]);

  if (!timetables || timetables.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-[2rem] border border-gray-100 p-10 text-gray-400 animate-in fade-in">
         <Calendar className="w-16 h-16 mb-4 opacity-20" />
         <h3 className="text-lg font-bold">No Timetable Found</h3>
         <p className="text-sm">We couldn't find a schedule for your department.</p>
         {student?.department && <p className="text-xs mt-2 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">Dept: {student.department}</p>}
      </div>
    );
  }

  if (!selectedTimetable || !selectedTimetable.schedule) return null;

  const schedule = selectedTimetable.schedule;
  // Get days from the schedule object keys
  const days = Object.keys(schedule);
  // Get time slots from the first day to render headers
  const timeSlots = schedule[days[0]] || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
         <div>
           <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
             <Calendar className="w-6 h-6 text-gray-400"/> Class Timetable
           </h2>
           <p className="text-sm text-gray-500 mt-1">
              Department: <span className="font-bold text-gray-700">{student?.department}</span>
           </p>
         </div>
         
         <div className="flex items-center gap-3">
             {/* Semester Selector (if multiple exist) */}
             {timetables.length > 1 && (
               <div className="relative group">
                 <select 
                    className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 pl-4 pr-10 rounded-xl text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-white transition-colors"
                    value={selectedTimetable._id}
                    onChange={(e) => {
                      const found = timetables.find(t => t._id === e.target.value);
                      if (found) setSelectedTimetable(found);
                    }}
                 >
                   {timetables.map(t => (
                     <option key={t._id} value={t._id}>
                       Semester {t.semester}
                     </option>
                   ))}
                 </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 group-hover:text-gray-600">
                   <ChevronDown className="h-4 w-4" />
                 </div>
               </div>
             )}
         </div>
      </div>

      {/* The Table Grid (Exact style from Institute view) */}
      <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm overflow-hidden flex flex-col">
         <div className="overflow-x-auto custom-scrollbar p-6">
           <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr>
                  <th className="p-4 bg-gray-50/80 border-b border-gray-100 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider rounded-tl-xl">
                    Day
                  </th>
                  {timeSlots.map((slot, i) => (
                    <th key={i} className="p-4 bg-gray-50/80 border-b border-gray-100 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider min-w-[160px]">
                      {slot.time}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                 {days.map((day) => (
                    <tr key={day} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors">
                       <td className="p-4 font-bold text-gray-800 bg-white border-r border-gray-50 sticky left-0 z-10 w-32">
                          {day}
                       </td>
                       {schedule[day].map((slot, idx) => {
                          // Determine Styling based on content
                          const isFree = slot.subject === "Free" || slot.subject === "Free Slot";
                          const isLunch = slot.subject.toLowerCase().includes("lunch");
                          
                          return (
                            <td key={idx} className="p-3 border-r border-gray-50 last:border-0 align-top h-32">
                              <div 
                                className={`h-full w-full p-4 rounded-xl border flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
                                  isLunch 
                                    ? "bg-orange-50 border-orange-100" 
                                    : isFree 
                                      ? "bg-gray-50 border-gray-100 border-dashed opacity-60" 
                                      : "bg-white border-gray-100"
                                }`}
                                style={
                                  !isFree && !isLunch 
                                    ? { borderLeft: `4px solid ${theme.primary}` } 
                                    : {}
                                }
                              >
                                {isFree ? (
                                  <div className="flex items-center justify-center h-full text-xs text-gray-400 italic font-medium">
                                    Empty
                                  </div>
                                ) : isLunch ? (
                                  <div className="flex items-center justify-center h-full text-xs font-bold text-orange-400 uppercase tracking-widest">
                                    Lunch Break
                                  </div>
                                ) : (
                                  <>
                                    <div>
                                      <p className="font-bold text-sm text-gray-800 leading-snug line-clamp-2" title={slot.subject}>
                                        {slot.subject}
                                      </p>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                                      {slot.faculty && (
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-md">
                                          <Users className="w-3 h-3" />
                                          <span className="truncate max-w-[80px]" title={slot.faculty}>
                                            {slot.faculty}
                                          </span>
                                        </div>
                                      )}
                                      {/* Optional: Add Room number if available in your schema later */}
                                      {/* <span className="text-[10px] text-gray-300 font-mono">R-101</span> */}
                                    </div>
                                  </>
                                )}
                              </div>
                            </td>
                          );
                       })}
                    </tr>
                 ))}
              </tbody>
           </table>
         </div>
      </div>
    </div>
  );
};

export default StudentTimetableSection;