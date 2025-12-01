// src/pages/student/StudentCareerSection.jsx
import React from "react";
import { FileText, Map, Mic, Lightbulb, Users, Briefcase, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StudentCareerSection = () => {
  const navigate = useNavigate();

  return (
    <section className="space-y-5">
      {/* Intro */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1">
          Career Booster
        </h3>
        <p className="text-xs text-gray-500">
          AI-powered modules for{" "}
          <span className="font-semibold">
            resume building, interview prep, roadmaps, problem solving, project collaboration & freelancing.
          </span>
        </p>
      </div>

      {/* Six cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* 1. Resume Builder */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center">
              <FileText className="text-blue-600" size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">AI Resume Builder</p>
              <p className="text-xs text-gray-500">Create & improve resume automatically.</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 mb-3">
            This will take you to the dedicated resume builder page.
          </p>

          <button
            className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
            onClick={() => navigate("/student/resume")}
          >
            Open Resume Builder <ArrowRight size={14} />
          </button>
        </div>

        {/* 2. Roadmap */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center">
              <Map className="text-emerald-600" size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Personalized Roadmap</p>
              <p className="text-xs text-gray-500">Plan your skills and future path.</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 mb-3">Roadmaps for DSA, Web Dev, AI, ML & more.</p>

          <button
            className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-800"
            onClick={() => navigate("/student/roadmap")}
          >
            View Roadmap <ArrowRight size={14} />
          </button>
        </div>

        {/* 3. Mock Interview */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-9 w-9 rounded-full bg-purple-50 flex items-center justify-center">
              <Mic className="text-purple-600" size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Mock Interview Suite</p>
              <p className="text-xs text-gray-500">Practice HR & technical interviews.</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 mb-3">
            Includes AI Q&A, feedback, scoring & analytics.
          </p>

          <button
            className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-800"
            onClick={() => navigate("/student/mock-interview")}
          >
            Start Mock Interview <ArrowRight size={14} />
          </button>
        </div>

        {/* 4. Problem Solving */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-9 w-9 rounded-full bg-orange-50 flex items-center justify-center">
              <Lightbulb className="text-orange-600" size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Problem Solving Arena</p>
              <p className="text-xs text-gray-500">Improve DSA, coding & logic skills.</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 mb-3">
            Access curated problems & AI-driven hints.
          </p>

          <button
            className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-800"
            onClick={() => navigate("/student/problemsolve")}
          >
            Start Solving <ArrowRight size={14} />
          </button>
        </div>

        {/* 5. Project Collaboration */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-9 w-9 rounded-full bg-teal-50 flex items-center justify-center">
              <Users className="text-teal-600" size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Project Collaboration</p>
              <p className="text-xs text-gray-500">Find peers & build real projects.</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 mb-3">
            Join teams, collaborate on ideas & share progress.
          </p>

          <button
            className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-800"
            onClick={() => navigate("/student/projectcolab")}
          >
            Explore Projects <ArrowRight size={14} />
          </button>
        </div>

        {/* 6. Freelancing */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-9 w-9 rounded-full bg-yellow-50 flex items-center justify-center">
              <Briefcase className="text-yellow-600" size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Freelance Hub</p>
              <p className="text-xs text-gray-500">Start earning with your skills.</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 mb-3">
            AI-guided gigs, project suggestions & portfolio tips.
          </p>

          <button
            className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-yellow-600 hover:text-yellow-800"
            onClick={() => navigate("/student/freelance")}
          >
            Start Freelancing <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </section>
  );
};

export default StudentCareerSection;
