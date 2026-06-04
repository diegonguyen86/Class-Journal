import { NavLink } from 'react-router-dom'
import { auth } from '../firebase'
import { signOut } from 'firebase/auth'

const navItems = [
  { to: '/dashboard',   icon: 'dashboard',    label: 'Dashboard' },
  { to: '/classes',     icon: 'groups',       label: 'My Classes' },
  { to: '/sessions',    icon: 'description',  label: 'Session Notes' },
  { to: '/billing',     icon: 'payments',     label: 'Student Billing' },
  { to: '/profile',     icon: 'person',       label: 'Hồ Sơ Giáo Viên' },
]

export default function Sidebar({ isOpen, setIsOpen }) {
  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Lỗi đăng xuất:", error)
    }
  }

  return (
    <aside className={`
      fixed left-0 top-0 h-screen w-[260px] bg-background border-r-2 border-dark flex flex-col p-6 z-50 overflow-y-auto
      transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
      {/* Mobile Close Button & Logo */}
      <div className="flex justify-between items-center mb-10 md:justify-center relative">
        <img src="/logo.png" alt="Ms. Thu Class Journal Logo" className="w-3/4 md:w-full max-w-[180px] h-auto object-contain drop-shadow-sm mx-auto" />
        <button 
          onClick={() => setIsOpen(false)}
          className="md:hidden absolute -right-2 top-0 p-1 bg-white rounded-full memphis-border shadow-sm text-dark flex items-center justify-center"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Quick Note Button Removed */}

      {/* Nav Links */}
      <nav className="flex flex-col gap-1 flex-grow">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg font-label font-bold text-sm transition-all duration-200 cursor-pointer ` +
              (isActive
                ? 'bg-secondary memphis-border shadow-memphis-sm text-dark translate-x-0.5 translate-y-0.5'
                : 'text-dark/80 hover:bg-secondary/40 hover:translate-x-1')
            }
            onClick={() => setIsOpen && setIsOpen(false)}
          >
            <span className="material-symbols-outlined">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="mt-8">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-lg font-label font-bold text-sm transition-all duration-200 text-danger hover:bg-danger/10 hover:translate-x-1"
        >
          <span className="material-symbols-outlined">logout</span>
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}
