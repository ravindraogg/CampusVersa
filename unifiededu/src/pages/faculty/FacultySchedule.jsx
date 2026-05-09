import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  Clock,
  Bell,
  Plus,
  Loader2,
  ChevronDown,
  CheckCircle,
} from "lucide-react";
const API_URL = import.meta.env.VITE_BACK_URI;
const FacultySchedule = ({ authFetch, theme, faculty, pushToast }) => {
  const [timetables, setTimetables] = useState([]);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [loading, setLoading] = useState(true);

  // Reminder Modal State
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderForm, setReminderForm] = useState({
    course: "",
    day: "",
    time: "",
    message: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchTimetables();
  }, [faculty]);

  const fetchTimetables = async () => {
    if (!faculty) return;
    setLoading(true);
    try {
      const res = await authFetch("/faculty/timetables");
      const data = await res.json();

      // Filter timetables that match the Faculty's Department
      const deptTimetables = data.filter((tt) =>
        tt.semester.toLowerCase().includes(faculty.department.toLowerCase())
      );

      setTimetables(deptTimetables);
      if (deptTimetables.length > 0) setSelectedTimetable(deptTimetables[0]);
    } catch (e) {
      console.error(e);
      pushToast("Failed to load schedule", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSetReminder = (day, slot) => {
    setReminderForm({
      course: slot.subject,
      day: day,
      time: slot.time,
      message: `Class: ${slot.subject} in ${slot.room || "Room TBD"}`,
    });
    setShowReminderModal(true);
  };

  const saveReminder = async () => {
    setIsSaving(true);
    try {
      const res = await authFetch("/faculty/reminders/add", {
        method: "POST",
        body: JSON.stringify({
          courseName: reminderForm.course,
          day: reminderForm.day,
          time: reminderForm.time,
          message: reminderForm.message,
        }),
      });
      if (res.ok) {
        pushToast("Reminder Set Successfully!", "success");
        setShowReminderModal(false);
      } else {
        pushToast("Failed to set reminder", "error");
      }
    } catch (e) {
      pushToast("Server error", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Helper: Generate Pastel Color from String ---
  const getSubjectColor = (subject) => {
    if (!subject) return "#FFFFFF";
    if (subject === "Free Slot") return "#F9FAFB"; // gray-50
    if (subject.includes("Lunch")) return "#FFF7ED"; // orange-50

    // Generate a hash from the string
    let hash = 0;
    for (let i = 0; i < subject.length; i++) {
      hash = subject.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Use HSL to ensure pastel tone (High Lightness, Moderate Saturation)
    // Hue: 0-360 based on hash
    // Saturation: 70% fixed
    // Lightness: 90% fixed (Light pastel)
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 70%, 93%)`;
  };

  if (loading)
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
      </div>
    );

  return (
    <div className="animate-in fade-in h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Schedule</h2>
          <p className="text-sm text-gray-500">
            View timetable and set class reminders
          </p>
        </div>

        {/* Semester Selector */}
        <div className="relative">
          <select
            className="appearance-none bg-white border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:border-blue-500 font-bold cursor-pointer shadow-sm"
            onChange={(e) => {
              const selected = timetables.find((t) => t._id === e.target.value);
              setSelectedTimetable(selected);
            }}
            value={selectedTimetable?._id || ""}
          >
            {timetables.length === 0 && <option>No Timetables Found</option>}
            {timetables.map((tt) => (
              <option key={tt._id} value={tt._id}>
                {tt.semester}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Timetable View */}
      {selectedTimetable ? (
        <div className="flex-1 overflow-auto custom-scrollbar bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-4 text-left text-xs font-extrabold text-gray-400 uppercase border-b bg-gray-50 rounded-tl-xl">
                  Day
                </th>
                {selectedTimetable.schedule[
                  Object.keys(selectedTimetable.schedule)[0]
                ]?.map((slot, i) => (
                  <th
                    key={i}
                    className="p-4 text-left text-xs font-extrabold text-gray-400 uppercase border-b bg-gray-50 min-w-[140px] border-l border-gray-100"
                  >
                    {slot.time}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(selectedTimetable.schedule).map(
                ([day, slots]) => (
                  <tr
                    key={day}
                    className="border-b last:border-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-4 font-bold text-gray-700 border-r bg-gray-50/30 sticky left-0">
                      {day}
                    </td>
                    {slots.map((slot, idx) => {
                      // Check if this slot belongs to the logged-in faculty
                      const isMyClass =
                        slot.faculty &&
                        faculty.name &&
                        slot.faculty
                          .toLowerCase()
                          .includes(faculty.name.toLowerCase().split(" ")[0]); 

                      // Get Pastel Color
                      const bgColor = getSubjectColor(slot.subject);

                      return (
                        <td key={idx} className="p-2 border-r last:border-0">
                          <div
                            className={`p-3 rounded-xl h-full min-h-[100px] flex flex-col justify-between group transition-all`}
                            style={{
                              backgroundColor: bgColor,
                              // If it's my class, add a thick left border with theme color
                              borderLeft: isMyClass
                                ? `4px solid ${theme.primary}`
                                : "1px solid transparent",
                              // Add a subtle border for others
                              border: !isMyClass ? "1px solid rgba(0,0,0,0.02)" : undefined
                            }}
                          >
                            <div>
                              <p
                                className={`font-bold text-xs line-clamp-2 ${
                                  slot.subject === "Free Slot"
                                    ? "text-gray-400"
                                    : slot.subject.includes("Lunch")
                                    ? "text-orange-800"
                                    : "text-gray-800"
                                }`}
                              >
                                {slot.subject}
                              </p>
                              {slot.faculty && (
                                <p className="text-[10px] text-gray-500 mt-1 font-medium">
                                  {slot.faculty}
                                </p>
                              )}
                            </div>

                            {/* Set Reminder Button */}
                            {slot.subject !== "Free Slot" &&
                              !slot.subject.includes("Lunch") && (
                                <button
                                  onClick={() => handleSetReminder(day, slot)}
                                  className="mt-2 w-full py-1.5 rounded-lg bg-white/60 border border-black/5 text-[10px] font-bold text-gray-500 hover:bg-white hover:text-black flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <Bell className="w-3 h-3" /> Remind
                                </button>
                              )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <CalendarDays className="w-16 h-16 mb-4 opacity-20" />
          <p>No timetable available for your department yet.</p>
        </div>
      )}

      {/* Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" style={{ color: theme.primary }} /> Set Class
              Reminder
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-xl border">
                  <p className="text-xs text-gray-500 uppercase">Day</p>
                  <p className="font-bold text-gray-800">{reminderForm.day}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border">
                  <p className="text-xs text-gray-500 uppercase">Time</p>
                  <p className="font-bold text-gray-800">{reminderForm.time}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                  Course
                </label>
                <input
                  className="w-full p-3 rounded-xl border bg-gray-50 font-bold text-gray-800 outline-none"
                  value={reminderForm.course}
                  readOnly
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                  Note
                </label>
                <input
                  className="w-full p-3 rounded-xl border focus:border-blue-500 outline-none"
                  value={reminderForm.message}
                  onChange={(e) =>
                    setReminderForm({
                      ...reminderForm,
                      message: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowReminderModal(false)}
                className="flex-1 py-3 rounded-xl border hover:bg-gray-50 font-bold text-gray-600"
              >
                Cancel
              </button>
              
              {/* UPDATED SAVE BUTTON */}
              <button
                onClick={saveReminder}
                disabled={isSaving}
                className="flex-1 py-3 rounded-xl text-white font-bold hover:opacity-90 flex justify-center items-center gap-2 shadow-lg transition-all"
                style={{ backgroundColor: theme.primary, color: "#ffffff" }}
              >
                {isSaving ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  "Set Reminder"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultySchedule;