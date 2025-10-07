
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/auth'; // make sure path is correct
import Dashboard from './pages/student/dashboard';
import Landing from './pages/landing';
import Dashboard2 from './pages/institute/dashboard';
import Resume from './pages/student/resume'; // Changed 'resume' to 'Resume'
import ProjectColab from './pages/student/projectcolab'; // Changed 'projectcolab' to 'ProjectColab'
import MockInterview from './pages/student/mockinterview'; // Changed 'mockinterview' to 'MockInterview'
import Problemsolve from './pages/student/problemsolve'; // Changed 'problemsolve' to 'Problemsolve'
function App() {
  const isAuthenticated = false; // Replace this with your auth state

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing/>} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/institute/dashboard" element={<Dashboard2 />} />
        <Route path="/resume" element={<Resume />} /> 
        <Route path="/projecttools" element={<ProjectColab />} />
        <Route path="/mockinterview" element={<MockInterview />} />
        <Route path="/problemsolve" element={<Problemsolve />} />
      </Routes>
    </Router>
  );
}

export default App;
