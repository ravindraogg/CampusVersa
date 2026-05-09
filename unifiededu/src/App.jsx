import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Landing from './pages/landing'   
import InAuth from './pages/institute/inauth'   
import AdminPanel from './pages/admin/adminpanel'
import InDash from './pages/institute/indashboard'
import FacultyAuth from './pages/faculty/auth'
import FacultyKYC from './pages/faculty/FacultyKYC'
import FacultyDashboard from './pages/faculty/FacultyDashboard'
import StudentDashboard from './pages/student/StudentDashboard'
import StudentLogin from './pages/student/auth'
import MockInterview from './pages/student/mockinterview'
import StudentPerformanceSection from './pages/student/StudentPerformanceSection'
import StudentAttendanceSection from './pages/student/StudentAttendanceSection'
import StudentExamCalendarSection from './pages/student/StudentExamCalendarSection'
import StudentCareerSection from './pages/student/StudentCareerSection'
import Resume from './pages/student/resume'
import Roadmap from './pages/student/roadmap'
import StudentKYC from "/src/pages/student/StudentKYC";


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/ad/admin/dash" element={<AdminPanel />} />
        <Route path="/in/auth" element={<InAuth />} />
        <Route path="/in/dashboard" element={<InDash />} />
        <Route path="/fc/auth" element={<FacultyAuth />} />
        <Route path="/faculty/kyc-verification" element={<FacultyKYC />} />
        <Route path="/fc/dash" element={<FacultyDashboard />} />
        <Route path="/student/auth" element={<StudentLogin />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/mock-interview" element={<MockInterview />} />
        <Route path="/student/performance" element={<StudentPerformanceSection />} />
        <Route path="/student/attendance" element={<StudentAttendanceSection />} />
        <Route path="/student/exam-calendar" element={<StudentExamCalendarSection />} />
        <Route path="/student/career-booster" element={<StudentCareerSection />} />
        <Route path="/student/resume" element={<Resume />} />
        <Route path="/student/roadmap" element={<Roadmap />} />
        <Route path="/student/kyc" element={<StudentKYC />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
