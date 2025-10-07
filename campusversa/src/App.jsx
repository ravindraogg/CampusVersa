
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/auth'; // make sure path is correct
import Dashboard from './pages/student/dashboard';
import Landing from './pages/landing';
import Dashboard2 from './pages/institute/dashboard';

function App() {
  const isAuthenticated = false; // Replace this with your auth state

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing/>} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/institute/dashboard" element={<Dashboard2 />} />
      </Routes>
    </Router>
  );
}

export default App;
