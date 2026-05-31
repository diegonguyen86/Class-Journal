import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import MyClasses from './pages/MyClasses'
import JournalSessions from './pages/JournalSessions'
import StudentBilling from './pages/StudentBilling'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 ml-[260px] flex flex-col">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/classes" element={<MyClasses />} />
            <Route path="/sessions" element={<JournalSessions />} />
            <Route path="/billing" element={<StudentBilling />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}
