// src/pages/student/StudentCareerSection.jsx
import React from "react";
import { FileText, Map, Mic, ArrowRight } from "lucide-react";
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
          AI-powered tools to help you with{" "}
          <span className="font-semibold">
            resume, interview preparation, and personalized roadmaps
          </span>
          .
        </p>
      </div>

      {/* Three core tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Resume Builder */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center">
              <FileText className="text-blue-600" size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                AI Resume Builder
              </p>
              <p className="text-xs text-gray-500">
                Generate and refine your resume automatically.
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            This will take you to the dedicated resume builder page.
          </p>
          <button
            type="button"
            className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
            onClick={() => navigate("/student/resume")}
          >
            Open Resume Builder
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Roadmap */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center">
              <Map className="text-emerald-600" size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Personalized Roadmap
              </p>
              <p className="text-xs text-gray-500">
                Plan your skills, projects and certifications.
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            Navigate to your roadmap planner for DSA, web dev, ML and more.
          </p>
          <button
            type="button"
            className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-800"
            onClick={() => navigate("/student/roadmap")}
          >
            View Roadmap
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Mock Interview */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-9 w-9 rounded-full bg-purple-50 flex items-center justify-center">
              <Mic className="text-purple-600" size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Mock Interview Suite
              </p>
              <p className="text-xs text-gray-500">
                Practice with AI-based interview and tests.
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            Uses your advanced mock interview module with AI questions and
            analytics.
          </p>
          <button
            type="button"
            className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-800"
            onClick={() => navigate("/student/mock-interview")}
          >
            Open Mock Interview
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default StudentCareerSection;