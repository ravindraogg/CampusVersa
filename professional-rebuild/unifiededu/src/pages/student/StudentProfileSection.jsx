// src/components/student/StudentProfileSection.jsx
import React from "react";
import { IdCard, BadgeInfo, School } from "lucide-react";

const StudentProfileSection = ({ student }) => {
  // If student is not loaded yet
  if (!student) {
    return (
      <section className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-100" />
              <div className="space-y-2">
                <div className="h-3 w-32 bg-gray-100 rounded" />
                <div className="h-2 w-48 bg-gray-100 rounded" />
              </div>
            </div>
            <div className="h-6 w-40 bg-gray-100 rounded-full" />
          </div>
          <div className="h-24 bg-gray-100 rounded-lg" />
        </div>
      </section>
    );
  }

  const {
    name,
    usn,
    aadhaarLinked,
    aadhaarLast4,
    program,
    academicYear,
    semester,
    section,
    enrollmentYear,
    instituteId,
    email,
    phone,
  } = student;

  return (
    <section className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
            <IdCard className="text-blue-600" size={20} />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900">
              Unified Student Profile
            </h3>
            <p className="text-xs text-gray-500">
              Aadhaar-linked enrollment, program & academic details.
            </p>
          </div>
        </div>

        {aadhaarLinked && aadhaarLast4 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 text-xs px-3 py-1 border border-green-200">
            <BadgeInfo size={14} />
            Aadhaar Linked • **** {aadhaarLast4}
          </span>
        )}
      </div>

      {/* Main profile details */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        {/* Left: Identity */}
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Student Name
            </p>
            <p className="text-sm md:text-base font-semibold text-gray-900">
              {name || "-"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">
                USN / Roll No
              </p>
              <p className="font-medium text-gray-900">{usn || "-"}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">
                Institute ID
              </p>
              <p className="font-medium text-gray-900">
                {instituteId || "-"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">
                Email
              </p>
              <p className="font-medium text-gray-900 truncate">
                {email || "-"}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">
                Contact
              </p>
              <p className="font-medium text-gray-900">{phone || "-"}</p>
            </div>
          </div>
        </div>

        {/* Right: Program & Academic info */}
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <div className="mt-1">
              <School className="text-blue-600" size={18} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Program
              </p>
              <p className="text-sm md:text-base font-semibold text-gray-900">
                {program || "-"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">
                Academic Year
              </p>
              <p className="font-medium text-gray-900">
                {academicYear || "-"}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">
                Current Semester
              </p>
              <p className="font-medium text-gray-900">
                {semester || "-"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">
                Section
              </p>
              <p className="font-medium text-gray-900">{section || "-"}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">
                Enrollment Year
              </p>
              <p className="font-medium text-gray-900">
                {enrollmentYear || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom note */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
        <p>
          Data fetched from your{" "}
          <span className="font-medium text-gray-700">student record</span>.
        </p>
        <button className="text-blue-600 hover:text-blue-800 font-medium">
          View full profile →
        </button>
      </div>
    </section>
  );
};

export default StudentProfileSection;
