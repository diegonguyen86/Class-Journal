import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../firebase'
import TopNavBar from '../components/TopNavBar'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const [stats, setStats] = useState([])
  const [attentionStudents, setAttentionStudents] = useState([])
  const [loading, setLoading] = useState(true)

  const [calendarId, setCalendarId] = useState(() => localStorage.getItem('class_journal_calendar_id') || '')
  const [isEditingCalendar, setIsEditingCalendar] = useState(false)
  const [tempCalendarId, setTempCalendarId] = useState('')

  const handleSaveCalendarId = () => {
     localStorage.setItem('class_journal_calendar_id', tempCalendarId)
     setCalendarId(tempCalendarId)
     setIsEditingCalendar(false)
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [classesSnapshot, sessionsSnapshot] = await Promise.all([
          getDocs(collection(db, 'classes')),
          getDocs(collection(db, 'journalSessions'))
        ])

        const classesData = classesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        const sessionsData = sessionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        // Calculate Stats
        const totalClasses = classesData.length
        const totalStudents = classesData.reduce((sum, cls) => sum + (cls.studentList?.length || 0), 0)

        const today = new Date()
        const currentWeekStart = new Date(today)
        currentWeekStart.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)) // Monday
        currentWeekStart.setHours(0, 0, 0, 0)
        
        const currentWeekEnd = new Date(currentWeekStart)
        currentWeekEnd.setDate(currentWeekStart.getDate() + 6)
        currentWeekEnd.setHours(23, 59, 59, 999)

        const lessonsThisWeek = sessionsData.filter(s => {
           const sessionDate = new Date(s.date)
           return sessionDate >= currentWeekStart && sessionDate <= currentWeekEnd
        }).length

        let totalAttended = 0
        let totalExpected = 0
        sessionsData.forEach(session => {
          if (session.grades) {
             Object.values(session.grades).forEach(grade => {
                if (grade.att !== undefined) {
                   totalExpected++
                   if (grade.att === 'M' || grade.att === 'L') {
                      totalAttended++
                   }
                }
             })
          }
        })
        const avgAttendance = totalExpected > 0 ? Math.round((totalAttended / totalExpected) * 100) : 0

        setStats([
          { icon: 'auto_awesome_mosaic', label: 'Tổng số lớp',    value: totalClasses.toString(), color: 'text-primary' },
          { icon: 'library_books',       label: 'Buổi học tuần này',value: lessonsThisWeek.toString(), color: 'text-secondary' },
          { icon: 'groups',              label: 'Tổng học sinh',   value: totalStudents.toString(), color: 'text-accent' },
          { icon: 'trending_up',         label: 'Tỉ lệ đi học',  value: `${avgAttendance}%`, color: 'text-primary' },
        ])

        // Students Needing Attention Logic
        const attentionList = []
        
        classesData.forEach(cls => {
           if (!cls.studentList) return
           const classSessions = sessionsData
              .filter(s => s.classId === cls.id)
              .sort((a, b) => new Date(b.date) - new Date(a.date))
           
           cls.studentList.forEach(student => {
              const name = student.name
              let incompleteHomeworks = 0
              let gradeSum = 0
              let gradeCount = 0
              let issues = []

              const recentSessions = classSessions.slice(0, 3)
              
              const last2 = recentSessions.slice(0, 2)
              if (last2.length === 2 && last2.every(s => s.grades && s.grades[name] && s.grades[name].att === 'V')) {
                 issues.push("Vắng 2 buổi liên tiếp")
              }
              
              recentSessions.forEach(s => {
                 if (s.grades && s.grades[name] && s.grades[name].hw === 'C') {
                    incompleteHomeworks++
                 }
              })
              if (incompleteHomeworks >= 2) {
                 issues.push(`Chưa làm bài tập ${incompleteHomeworks}/3 buổi gần nhất`)
              }

              recentSessions.forEach(s => {
                 if (s.grades && s.grades[name] && typeof s.grades[name].grade === 'number') {
                    gradeSum += s.grades[name].grade
                    gradeCount++
                 }
              })
              if (gradeCount >= 2 && (gradeSum / gradeCount) < 5.0) {
                 issues.push(`Điểm trung bình đang rất thấp (${(gradeSum / gradeCount).toFixed(1)})`)
              }

              if (issues.length > 0) {
                 attentionList.push({
                    studentName: name,
                    className: cls.name,
                    issues: issues,
                    phone: student.phone
                 })
              }
           })
        })
        
        setAttentionStudents(attentionList)

      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) return <div className="flex min-h-screen items-center justify-center font-headline text-2xl text-dark">Loading Dashboard...</div>

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

        {/* Calendar + Attention List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Google Calendar */}
          <div className="bg-white rounded-xl memphis-border shadow-memphis flex flex-col h-[500px]">
             <div className="p-4 border-b-2 border-dark/10 flex justify-between items-center bg-secondary/10 rounded-t-xl">
               <h2 className="font-headline font-bold text-xl text-dark flex items-center gap-2">
                 <span className="material-symbols-outlined text-secondary">calendar_month</span> Lịch Giảng Dạy
               </h2>
               <button onClick={() => { setTempCalendarId(calendarId); setIsEditingCalendar(!isEditingCalendar) }} className="text-dark/60 hover:text-dark">
                 <span className="material-symbols-outlined text-[20px]">settings</span>
               </button>
             </div>
             {isEditingCalendar ? (
                <div className="p-6 flex-1 flex flex-col justify-center items-center bg-background/50 rounded-b-xl">
                   <p className="font-label text-sm text-dark/70 mb-4 text-center">Nhập Google Calendar ID hoặc Email của bạn để đồng bộ lịch dạy. Lịch cần được cài đặt "Công khai" hoặc bạn đang đăng nhập tài khoản đó trên trình duyệt này.</p>
                   <input type="text" value={tempCalendarId} onChange={e => setTempCalendarId(e.target.value)} placeholder="vd: example@gmail.com" className="w-full max-w-sm p-3 rounded-lg border-2 border-dark mb-4 font-body" />
                   <div className="flex gap-3">
                     <button onClick={() => setIsEditingCalendar(false)} className="px-4 py-2 font-bold font-label text-dark/60">Hủy</button>
                     <button onClick={handleSaveCalendarId} className="bg-primary text-white px-6 py-2 rounded-lg font-bold font-label memphis-border shadow-memphis-sm hover:-translate-y-0.5 transition-all">Lưu ID</button>
                   </div>
                </div>
             ) : calendarId ? (
                <div className="flex-1 overflow-hidden rounded-b-xl relative">
                  <iframe src={`https://calendar.google.com/calendar/embed?height=500&wkst=2&bgcolor=%23ffffff&ctz=Asia%2FHo_Chi_Minh&src=${encodeURIComponent(calendarId)}&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=1&showCalendars=0&showTz=0`} style={{borderWidth: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}} frameBorder="0" scrolling="no"></iframe>
                </div>
             ) : (
                <div className="p-6 flex-1 flex flex-col justify-center items-center bg-background/50 rounded-b-xl">
                   <span className="material-symbols-outlined text-6xl text-dark/20 mb-4">event_busy</span>
                   <p className="font-label text-dark/60 text-center mb-4">Chưa có dữ liệu lịch dạy.</p>
                   <button onClick={() => { setTempCalendarId(''); setIsEditingCalendar(true) }} className="bg-white px-6 py-2 rounded-lg border-2 border-dark font-bold font-label shadow-[2px_2px_0px_0px_rgba(47,47,47,1)] hover:-translate-y-0.5 transition-all">Thêm Google Calendar</button>
                </div>
             )}
          </div>

          {/* Attention List */}
          <div className="bg-white rounded-xl memphis-border shadow-memphis flex flex-col h-[500px]">
             <div className="p-4 border-b-2 border-dark/10 flex justify-between items-center bg-danger/10 rounded-t-xl">
               <h2 className="font-headline font-bold text-xl text-dark flex items-center gap-2">
                 <span className="material-symbols-outlined text-danger">warning</span> Học sinh cần lưu ý
               </h2>
               <span className="bg-danger text-white text-xs font-bold px-2 py-1 rounded-full">{attentionStudents.length}</span>
             </div>
             <div className="flex-1 overflow-y-auto p-4 custom-scrollbar rounded-b-xl">
                {attentionStudents.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center text-center">
                      <span className="material-symbols-outlined text-6xl text-success mb-4">check_circle</span>
                      <p className="font-headline font-bold text-xl text-dark mb-1">Tuyệt vời!</p>
                      <p className="font-body text-dark/60 text-sm">Không có học sinh nào đang trong tình trạng đáng báo động.</p>
                   </div>
                ) : (
                   <div className="flex flex-col gap-3">
                      {attentionStudents.map((student, idx) => (
                         <div key={idx} className="bg-background/40 p-4 rounded-xl border-2 border-dark/10 flex gap-4 items-start relative overflow-hidden group">
                            <div className="absolute left-0 top-0 w-1 h-full bg-danger"></div>
                            <div className="w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center font-bold text-xl shrink-0 border-2 border-danger/20">
                               {student.studentName.split(' ').map(n=>n[0]).join('')}
                            </div>
                            <div className="flex-1 min-w-0">
                               <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-headline font-bold text-lg text-dark break-words">{student.studentName}</h3>
                                  <span className="text-xs font-label bg-white border-2 border-dark/20 px-2.5 py-1 rounded-md text-dark/70 shadow-sm">{student.className}</span>
                               </div>
                               <ul className="list-disc list-inside text-sm font-body text-danger/90 space-y-1">
                                  {student.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                               </ul>
                               {student.phone && (
                                  <a href={`https://zalo.me/${student.phone}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-primary hover:underline bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 transition-colors hover:bg-primary/20">
                                     <span className="material-symbols-outlined text-[14px]">chat</span> Nhắn tin phụ huynh
                                  </a>
                               )}
                            </div>
                         </div>
                      ))}
                   </div>
                )}
             </div>
          </div>
        </div>

      </main>
    </div>
  )
}
