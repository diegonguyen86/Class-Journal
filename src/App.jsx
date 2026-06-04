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
import ProfileSettings from './pages/ProfileSettings'
import Portfolio from './pages/Portfolio'

function PrivateRoute({ children, user }) {
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return children
}

function PrivateLayout({ user }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <PrivateRoute user={user}>
      <div className="flex min-h-screen bg-background relative">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        
        <div className="flex-1 md:ml-[260px] flex flex-col min-w-0">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between p-4 bg-white border-b-2 border-dark sticky top-0 z-30 shadow-sm">
            <div className="font-headline font-bold text-xl text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">school</span>
              Class Journal
            </div>
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-1 bg-secondary rounded-md memphis-border text-dark flex items-center justify-center"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>

          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/classes" element={<MyClasses />} />
            <Route path="/sessions" element={<JournalSessions />} />
            <Route path="/billing" element={<StudentBilling />} />
            <Route path="/profile" element={<ProfileSettings />} />
          </Routes>
        </div>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-dark/50 z-40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}
      </div>
    </PrivateRoute>
  )
}

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

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        
        {/* Private Routes */}
        <Route path="/*" element={<PrivateLayout user={user} />} />
      </Routes>
    </BrowserRouter>
  )
}
