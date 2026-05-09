import React, { useState, useEffect } from "react";
import { Clock, Users, Calendar, ChevronDown, CheckCircle, AlertCircle, Briefcase } from "lucide-react";
const API_URL = import.meta.env.VITE_BACK_URI;
const StudentTimetableSection = ({ 
  timetables = [], 
  student, 
  theme = { primary: "#2E5843" } 
}) => {
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [activeMobileDay, setActiveMobileDay] = useState("");

  // Auto-select logic
  useEffect(() => {
    if (timetables.length > 0) {
      // 1. Try to find match for student's current semester
      const match = timetables.find(t => t.semester === student?.semester);
      // 2. Default to first found
      const selected = match || timetables[0];
      setSelectedTimetable(selected);
      
      // Set default mobile day (Today or Monday)
      if (selected && selected.schedule) {
        const days = Object.keys(selected.schedule);
        // FIX: Changed 'Long' to 'long'
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }); 
        setActiveMobileDay(days.includes(today) ? today : days[0]);
      }
    }
  }, [timetables, student]);

  if (!timetables || timetables.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 md:h-96 bg-white rounded-[2rem] border border-gray-100 p-6 md:p-10 text-gray-400 animate-in fade-in">
         <Calendar className="w-12 h-12 md:w-16 md:h-16 mb-4 opacity-20" />
         <h3 className="text-lg font-bold">No Timetable Found</h3>
         <p className="text-sm text-center">We couldn't find a schedule for your department.</p>
         {student?.department && <p className="text-xs mt-2 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">Dept: {student.department}</p>}
      </div>
    );
  }

  if (!selectedTimetable || !selectedTimetable.schedule) return null;

  const schedule = selectedTimetable.schedule;
  const days = Object.keys(schedule);
  const timeSlots = schedule[days[0]] || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-[2rem] border border-gray-100 shadow-sm">
         <div>
           <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
             <Calendar className="w-5 h-5 md:w-6 md:h-6 text-gray-400"/> 
             <span className="hidden md:inline">Class Timetable</span>
             <span className="md:hidden">Schedule</span>
           </h2>
           <p className="text-xs md:text-sm text-gray-500 mt-1">
              Department: <span className="font-bold text-gray-700">{student?.department}</span>
           </p>
         </div>
         
         <div className="flex items-center gap-3 w-full md:w-auto">
             {/* Semester Selector */}
             {timetables.length > 1 && (
               <div className="relative group w-full md:w-auto">
                 <select 
                    className="appearance-none w-full md:w-auto bg-gray-50 border border-gray-200 text-gray-700 py-2.5 md:py-3 pl-4 pr-10 rounded-xl text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-white transition-colors"
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

      {/* =========================================================
          DESKTOP/TABLET VIEW (Table)
          Hidden on small screens (md:block)
      ========================================================= */}
      <div className="hidden md:block bg-white border border-gray-100 rounded-[2rem] shadow-sm overflow-hidden">
         <div className="overflow-x-auto custom-scrollbar p-6">
           <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr>
                  <th className="p-4 bg-gray-50/80 border-b border-gray-100 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider rounded-tl-xl sticky left-0 z-20">
                    Day
                  </th>
                  {timeSlots.map((slot, i) => (
                    <th key={i} className="p-4 bg-gray-50/80 border-b border-gray-100 text-left text-xs font-extrabold text-gray-400 uppercase tracking-wider min-w-[140px]">
                      {slot.time}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                 {days.map((day) => (
                    <tr key={day} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors">
                       <td className="p-4 font-bold text-gray-800 bg-white border-r border-gray-50 sticky left-0 z-10 w-32 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                          {day}
                       </td>
                       {schedule[day].map((slot, idx) => {
                          const isFree = slot.subject === "Free" || slot.subject === "Free Slot";
                          const isLunch = slot.subject.toLowerCase().includes("lunch");
                          
                          return (
                            <td key={idx} className="p-2 border-r border-gray-50 last:border-0 align-top h-32">
                              <div 
                                className={`h-full w-full p-3 rounded-xl border flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${
                                  isLunch ? "bg-orange-50 border-orange-100" 
                                  : isFree ? "bg-gray-50 border-gray-100 border-dashed opacity-60" 
                                  : "bg-white border-gray-100"
                                }`}
                                style={!isFree && !isLunch ? { borderLeft: `4px solid ${theme.primary}` } : {}}
                              >
                                {isFree ? (
                                  <div className="flex items-center justify-center h-full text-xs text-gray-400 italic font-medium">Empty</div>
                                ) : isLunch ? (
                                  <div className="flex items-center justify-center h-full text-xs font-bold text-orange-400 uppercase tracking-widest">Lunch</div>
                                ) : (
                                  <>
                                    <p className="font-bold text-xs lg:text-sm text-gray-800 leading-tight line-clamp-3" title={slot.subject}>
                                      {slot.subject}
                                    </p>
                                    <div className="mt-2 pt-2 border-t border-gray-50 flex items-center gap-1">
                                       {slot.faculty && (
                                         <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium bg-gray-100 px-1.5 py-0.5 rounded">
                                           <Users className="w-3 h-3" />
                                           <span className="truncate max-w-[70px]">{slot.faculty}</span>
                                         </div>
                                       )}
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

      {/* =========================================================
          MOBILE VIEW (Day Tabs + Vertical List)
          Visible only on small screens (md:hidden)
      ========================================================= */}
      <div className="md:hidden flex flex-col gap-4">
        
        {/* Day Selection Tabs */}
        <div className="overflow-x-auto no-scrollbar -mx-4 px-4 pb-2">
          <div className="flex gap-2">
            {days.map(day => (
              <button
                key={day}
                onClick={() => setActiveMobileDay(day)}
                className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all ${
                  activeMobileDay === day 
                    ? "text-white shadow-md shadow-gray-200" 
                    : "bg-white text-gray-500 border border-gray-100"
                }`}
                style={activeMobileDay === day ? { backgroundColor: theme.primary } : {}}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Day Content */}
        <div className="flex flex-col gap-3">
          {schedule[activeMobileDay]?.map((slot, idx) => {
             const isFree = slot.subject === "Free" || slot.subject === "Free Slot";
             const isLunch = slot.subject.toLowerCase().includes("lunch");

             // Skip Free slots on mobile to save space
             if (isFree) return null;

             return (
               <div 
                 key={idx}
                 className={`p-4 rounded-2xl border flex gap-4 items-start shadow-sm ${
                    isLunch ? "bg-orange-50 border-orange-100" : "bg-white border-gray-100"
                 }`}
               >
                 {/* Time Column */}
                 <div className="flex flex-col items-center justify-center min-w-[4rem] pr-4 border-r border-gray-100">
                    <span className="text-xs font-bold text-gray-500">{slot.time.split('-')[0]}</span>
                    <div className="w-1 h-1 bg-gray-300 rounded-full my-1"></div>
                    <span className="text-xs font-bold text-gray-400">{slot.time.split('-')[1]}</span>
                 </div>

                 {/* Content Column */}
                 <div className="flex-1">
                   {isLunch ? (
                     <div className="flex items-center gap-2 text-orange-500 font-bold uppercase tracking-wider text-sm h-full py-2">
                        <Briefcase className="w-4 h-4" /> Lunch Break
                     </div>
                   ) : (
                     <>
                        <h4 className="font-bold text-gray-800 text-sm leading-tight mb-1">{slot.subject}</h4>
                        {slot.faculty && (
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                             <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                                <Users className="w-3 h-3 text-gray-600" />
                             </div>
                             {slot.faculty}
                          </div>
                        )}
                     </>
                   )}
                 </div>
               </div>
             );
          })}
          
          {/* Empty State for Mobile if all slots were free/hidden */}
          {(!schedule[activeMobileDay] || schedule[activeMobileDay].every(s => s.subject === "Free" || s.subject === "Free Slot")) && (
             <div className="text-center py-10 text-gray-400 bg-white rounded-2xl border border-gray-100 border-dashed">
                <p className="text-sm">No classes scheduled for {activeMobileDay}</p>
             </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default StudentTimetableSection;