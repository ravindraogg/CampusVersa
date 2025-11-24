import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Landing from './pages/landing'   // assuming file is src/landing.jsx
import InAuth from './pages/institute/inauth'   // assuming file is src/pages/institute/inauth.jsx
import AdminPanel from './pages/admin/adminpanel'
function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/in/auth" element={<InAuth />} />
        <Route path="/ad/admin/dash" element={<AdminPanel />} />
        
      </Routes>
    </BrowserRouter>
  )
}

export default App
