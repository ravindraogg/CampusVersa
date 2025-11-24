// src/pages/student/StudentExamCalendarSection.jsx
import React from "react";
import { CalendarDays, Clock, Bell } from "lucide-react";

const StudentExamCalendarSection = () => {
  const upcomingExams = [
    {
      subject: "Data Structures",
      date: "2025-12-10",
      time: "10:00 AM",
      type: "Internal Test 2",
      room: "CS-301",
    },
    {
      subject: "Algorithms",
      date: "2025-12-14",
      time: "2:00 PM",
      type: "Lab Exam",
      room: "Lab-2",
    },
    {
      subject: "DBMS",
      date: "2025-12-20",
      time: "10:00 AM",
      type: "End-Sem",
      room: "Main Block",
    },
  ];

  const deadlines = [
    {
      title: "Mini Project Report Submission",
      due: "2025-12-05",
    },
    {
      title: "Internship Logbook Upload",
      due: "2025-12-08",
    },
  ];

  return (
    <section className="space-y-5">
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
          <CalendarDays className="text-blue-600" size={18} />
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Exam Calendar
          </p>
          <p className="text-sm text-gray-700">
            Upcoming exams and important academic deadlines.
          </p>
        </div>
      </div>

      {/* Upcoming exams */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-3">
          Upcoming Exams
        </h3>
        <div className="space-y-3">
          {upcomingExams.map((exam, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {exam.subject}
                </p>
                <p className="text-xs text-gray-500">{exam.type}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <CalendarDays size={14} />
                  {exam.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {exam.time}
                </span>
                <span className="px-2 py-1 bg-gray-100 rounded-full text-[11px]">
                  Room: {exam.room}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deadlines & reminders */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="text-amber-500" size={18} />
          <h3 className="text-sm md:text-base font-semibold text-gray-900">
            Assignment & Project Deadlines
          </h3>
        </div>
        <ul className="space-y-2 text-xs text-gray-700">
          {deadlines.map((d, idx) => (
            <li
              key={idx}
              className="flex items-center justify-between border border-gray-100 rounded-lg px-3 py-2"
            >
              <span>{d.title}</span>
              <span className="text-gray-500 text-[11px]">{d.due}</span>
            </li>
          ))}
        </ul>

        <p className="mt-3 text-[11px] text-gray-500">
          Later you can plug this into a real calendar API or your backend to
          sync with official exam schedules and reminders.
        </p>
      </div>
    </section>
  );
};

export default StudentExamCalendarSection;
