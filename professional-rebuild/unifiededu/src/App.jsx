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

function App() {
  const [count, setCount] = useState(0)

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
        
      </Routes>
    </BrowserRouter>
  )
}

export default App
