import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Landing from './pages/landing'   
import InAuth from './pages/institute/inauth'   
import AdminPanel from './pages/admin/adminpanel'
import InDash from './pages/institute/indashboard'
function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/in/auth" element={<InAuth />} />
        <Route path="/ad/admin/dash" element={<AdminPanel />} />
        <Route path="/in/dashboard" element={<InDash />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
