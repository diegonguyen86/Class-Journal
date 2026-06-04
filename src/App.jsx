import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import MyClasses from './pages/MyClasses'
import JournalSessions from './pages/JournalSessions'
import StudentBilling from './pages/StudentBilling'
import Login from './pages/Login'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background font-headline text-2xl font-bold text-dark">Đang tải dữ liệu...</div>
  }

  if (!user) {
    return <Login />
  }

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
