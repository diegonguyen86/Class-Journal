import TopNavBar from '../components/TopNavBar'
import { Link } from 'react-router-dom'

const stats = [
  { icon: 'auto_awesome_mosaic', label: 'Total Classes',    value: '12', color: 'text-primary' },
  { icon: 'library_books',       label: 'Lessons this week',value: '24', color: 'text-secondary' },
  { icon: 'groups',              label: 'Total Students',   value: '186',color: 'text-accent' },
  { icon: 'trending_up',         label: 'Avg. Attendance',  value: '94%',color: 'text-primary' },
]

const recentSessions = [
  { class: 'IELTS Intensive',    topic: 'Listening - Map Labeling',  date: 'May 29' },
  { class: 'English 9B',         topic: 'Present Perfect Practice',  date: 'May 29' },
  { class: 'TOEIC Foundation',   topic: 'Reading - Incomplete Sent', date: 'May 28' },
  { class: 'Communication Eng',  topic: 'Speaking - Job Interviews', date: 'May 27' },
]

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen">
      <TopNavBar />
      <main className="flex-1 p-8 space-y-8">

        {/* Hero */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-white/40 p-8 rounded-xl memphis-border shadow-memphis">
          <div>
            <h1 className="font-headline text-4xl font-extrabold text-dark mb-2">
              Welcome back, Ms. Sarah! 👋
            </h1>
            <p className="font-label text-lg text-dark/70">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} — 3 upcoming classes today
            </p>
          </div>
          <div className="flex flex-wrap gap-3">

            <Link to="/sessions"
              className="bg-secondary text-dark font-bold py-2.5 px-5 rounded-lg memphis-border shadow-memphis-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-2 font-label">
              <span className="material-symbols-outlined text-sm">add</span> New Session
            </Link>
            <Link to="/classes"
              className="bg-accent text-white font-bold py-2.5 px-5 rounded-lg memphis-border shadow-memphis-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-2 font-label">
              <span className="material-symbols-outlined text-sm">school</span> My Classes
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="bg-white p-6 rounded-xl memphis-border shadow-memphis flex flex-col">
              <span className={`material-symbols-outlined fill mb-2 ${s.color}`}>{s.icon}</span>
              <p className="font-label text-dark/60 font-semibold mb-1 text-sm">{s.label}</p>
              <p className="font-headline text-3xl font-extrabold text-dark">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Recent Sessions + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Sessions */}
          <div className="lg:col-span-2 bg-white rounded-xl memphis-border shadow-memphis overflow-hidden">
            <div className="p-6 border-b-2 border-dark/10 flex justify-between items-center">
              <h2 className="font-headline font-bold text-xl text-dark">Recent Sessions</h2>
              <Link to="/sessions" className="font-label text-sm font-bold text-primary hover:underline">View all →</Link>
            </div>
            <div className="divide-y divide-dark/10">
              {recentSessions.map((s) => (
                <div key={s.topic} className="flex items-center gap-4 p-5 hover:bg-background/40 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-primary/20 memphis-border flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-base">description</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-label font-bold text-dark truncate">{s.topic}</p>
                    <p className="font-body text-sm text-dark/60">{s.class} · {s.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-background rounded-xl memphis-border shadow-memphis p-6 flex flex-col gap-4">
            <h2 className="font-headline font-bold text-xl text-dark">Quick Actions</h2>
            {[

              { to: '/sessions',   icon: 'add_circle',    label: 'Thêm Session mới',    color: 'text-primary' },
              { to: '/classes',    icon: 'group_add',     label: 'Thêm lớp học',        color: 'text-secondary' },
              { to: '/billing',    icon: 'receipt_long',  label: 'Xem học phí',          color: 'text-danger' },
            ].map((item) => (
              <Link key={item.to} to={item.to}
                className="flex items-center gap-3 bg-white p-3.5 rounded-lg memphis-border hover:-translate-y-0.5 hover:shadow-memphis transition-all font-label font-bold text-sm text-dark">
                <span className={`material-symbols-outlined ${item.color}`}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}
