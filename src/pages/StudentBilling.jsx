import TopNavBar from '../components/TopNavBar'



function BillingDetailsModal({ isOpen, onClose, studentData }) {
  if (!isOpen || !studentData) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl rounded-2xl memphis-border-thick shadow-memphis-lg flex flex-col max-h-[85vh] animate-[slideUp_0.2s_ease-out]">
        <div className="p-6 border-b-2 border-dark flex justify-between items-center bg-secondary/30">
          <h2 className="font-headline font-bold text-2xl">Chi tiết học phí: {studentData.name}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full border-2 border-dark flex items-center justify-center hover:bg-dark hover:text-white transition-colors">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 bg-[#F8F4EC]">
          <div className="bg-white rounded-xl memphis-border p-5 mb-6">
            <div className="flex justify-between items-center mb-4 border-b-2 border-dark/10 pb-4">
              <div>
                <p className="font-label text-sm text-dark/70 font-bold">Lớp học</p>
                <p className="font-headline text-xl font-bold">{studentData.class}</p>
              </div>
              <div className="text-right">
                <p className="font-label text-sm text-dark/70 font-bold">Tổng số tiền</p>
                <p className="font-headline text-2xl font-bold text-primary">{studentData.amount}</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div>
                <p className="font-label text-xs text-dark/70 font-bold">Số buổi đã học</p>
                <p className="font-body font-bold">{studentData.attendedCount} buổi</p>
              </div>
              <div>
                <p className="font-label text-xs text-dark/70 font-bold">Tổng thời gian</p>
                <p className="font-body font-bold">{studentData.totalHours} giờ</p>
              </div>
            </div>
          </div>

          <h3 className="font-headline font-bold text-lg mb-4">Danh sách buổi học</h3>
          <div className="space-y-3">
            {studentData.sessionDetails?.map((session, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border-2 border-dark flex justify-between items-center shadow-[2px_2px_0_0_#2F2F2F]">
                <div>
                  <h4 className="font-bold text-dark">{session.title}</h4>
                  <p className="text-xs font-label text-dark/60 mt-1">{session.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(session.cost)}</p>
                  <p className="text-xs font-label text-dark/60 mt-1">{session.duration} giờ</p>
                </div>
              </div>
            ))}
            {(!studentData.sessionDetails || studentData.sessionDetails.length === 0) && (
              <p className="text-center font-label text-dark/50 py-4">Chưa có dữ liệu buổi học</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

export default function StudentBilling() {
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [pendingStudents, setPendingStudents] = useState([])
  const [recentPayments, setRecentPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [classesList, setClassesList] = useState([])
  const [selectedClassFilter, setSelectedClassFilter] = useState('')

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        const classesSnapshot = await getDocs(collection(db, 'classes'))
        const sessionsSnapshot = await getDocs(collection(db, 'sessions'))
        
        const classesData = classesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        const sessionsData = sessionsSnapshot.docs.map(doc => doc.data())
        
        setClassesList(classesData.map(c => c.name))

        let generatedBills = []
        let idCounter = 1

        classesData.forEach(cls => {
          const price = Number(cls.pricePerSession) || 0
          if (price === 0) return

          const classSessions = sessionsData.filter(s => s.classId === cls.id)
          
          cls.studentList?.forEach(student => {
            let attendedCount = 0
            let totalHours = 0
            let sessionDetails = []

            classSessions.forEach(session => {
              // Assume present if no attendance recorded or if marked present/late
              if (!session.attendance || session.attendance[student.name] !== 'absent') {
                attendedCount++
                const duration = Number(session.actualDuration) || 1.5
                totalHours += duration
                
                const sessionCost = duration * price
                sessionDetails.push({
                  title: session.title || 'Untitled Session',
                  date: session.date || 'Unknown Date',
                  duration,
                  cost: sessionCost
                })
              }
            })

            if (attendedCount > 0) {
              const amount = totalHours * price
              generatedBills.push({
                id: idCounter++,
                name: student.name,
                class: cls.name,
                amount: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount),
                rawAmount: amount,
                status: 'Pending',
                statusColor: 'border-accent text-accent',
                initials: student.name.split(' ').map(n=>n[0]).join('').substring(0, 2),
                initialsColor: 'bg-primary/20 text-primary border-primary/30',
                attendedCount,
                totalHours,
                sessionDetails
              })
            }
          })
        })
        
        setPendingStudents(generatedBills.sort((a,b) => b.rawAmount - a.rawAmount))

        const paymentsSnapshot = await getDocs(collection(db, 'recentPayments'))
        const paymentsData = paymentsSnapshot.docs.map(doc => doc.data())
        setRecentPayments(paymentsData)
      } catch (error) {
        console.error("Error fetching billing data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchBillingData()
  }, [])

  if (loading) return <div className="flex min-h-screen items-center justify-center font-headline text-2xl text-dark">Loading Billing...</div>

  const filteredStudents = selectedClassFilter ? pendingStudents.filter(s => s.class === selectedClassFilter) : pendingStudents
  
  const totalCollected = recentPayments.reduce((sum, p) => {
    const raw = p.rawAmount || parseFloat(String(p.amount).replace(/[^\d.-]/g, '')) || 0
    return sum + raw
  }, 0)

  return (
    <div className="flex flex-col min-h-screen">
      <TopNavBar />
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Page Header */}
          <div>
            <h2 className="text-4xl font-headline font-bold mb-2">Student Tuition & Payments</h2>
            <p className="text-dark/70 font-label text-lg">Manage school-wide billing and student accounts</p>
          </div>

          {/* Summary Section */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-primary/10 rounded-2xl p-8 memphis-border shadow-memphis relative overflow-hidden transition-transform hover:-translate-y-0.5 hover:shadow-memphis-lg">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/20 rounded-full blur-xl"></div>
              <div className="relative z-10">
                <p className="text-sm font-label font-bold text-primary uppercase tracking-wider mb-1">Total Collected</p>
                <h3 className="text-4xl font-headline font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalCollected)}</h3>
                <p className="text-xs text-dark/60 mt-4 flex items-center gap-1 font-label">
                  <span className="material-symbols-outlined text-sm text-primary">receipt_long</span>
                  {recentPayments.length} payments recorded
                </p>
              </div>
            </div>

            <div className="bg-secondary/20 rounded-2xl p-8 memphis-border shadow-memphis relative overflow-hidden transition-transform hover:-translate-y-0.5 hover:shadow-memphis-lg">
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-secondary/30 rounded-full blur-xl"></div>
              <div className="relative z-10">
                <p className="text-sm font-label font-bold text-dark/70 uppercase tracking-wider mb-1">Pending Payments</p>
                <h3 className="text-4xl font-headline font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pendingStudents.reduce((sum, s) => sum + s.rawAmount, 0))}</h3>
                <p className="text-xs text-dark/60 mt-4 font-label">{pendingStudents.length} students awaiting processing</p>
              </div>
            </div>

            <div className="bg-accent/10 rounded-2xl p-8 memphis-border shadow-memphis relative overflow-hidden transition-transform hover:-translate-y-0.5 hover:shadow-memphis-lg">
              <div className="absolute top-1/2 -right-10 w-20 h-20 bg-accent/20 rounded-lg rotate-45 blur-lg"></div>
              <div className="relative z-10">
                <p className="text-sm font-label font-bold text-accent uppercase tracking-wider mb-1">Overdue</p>
                <h3 className="text-4xl font-headline font-bold text-accent">0 ₫</h3>
                <p className="text-xs text-dark/60 mt-4 font-label">0 students past due date</p>
              </div>
            </div>
          </section>

          {/* Student Payment List */}
          <section>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <h3 className="text-2xl font-headline font-bold">Học sinh chưa đóng tiền</h3>
              <div className="flex gap-2">
                <select value={selectedClassFilter} onChange={(e) => setSelectedClassFilter(e.target.value)} className="px-4 py-2 bg-white text-sm font-bold memphis-border rounded-lg shadow-memphis-sm hover:-translate-y-px hover:shadow-memphis transition-all focus:outline-none cursor-pointer">
                  <option value="">Tất cả các lớp</option>
                  {classesList.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="bg-white rounded-xl memphis-border shadow-memphis overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary/30 border-b-2 border-dark text-sm font-bold font-headline">
                      <th className="py-4 px-6">Student Name</th>
                      <th className="py-4 px-6">Class</th>
                      <th className="py-4 px-6">Amount Due</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="font-label text-sm divide-y divide-dark/10">
                    {filteredStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedStudent(s)}>
                        <td className="py-4 px-6 font-bold flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${s.initialsColor}`}>{s.initials}</div>
                          {s.name}
                        </td>
                        <td className="py-4 px-6">{s.class}</td>
                        <td className="py-4 px-6 font-medium">
                          {s.amount}
                          <div className="text-xs text-dark/50 font-normal mt-1">{s.attendedCount} buổi ({s.totalHours} giờ)</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold border ${s.statusColor}`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {s.status === 'Paid' ? (
                            <button className="bg-white px-3 py-1.5 text-xs font-bold memphis-border rounded shadow-memphis-sm opacity-50 cursor-not-allowed">Receipt Issued</button>
                          ) : (
                            <button className="bg-primary text-white px-3 py-1.5 text-xs font-bold memphis-border rounded shadow-memphis-sm hover:-translate-y-px transition-transform">Record Payment</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Payment History */}
          <section className="pb-12">
            <h3 className="text-2xl font-headline font-bold mb-6">Học sinh đã đóng gần nhất</h3>
            <div className="bg-white rounded-xl memphis-border shadow-memphis overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary/10 border-b-2 border-dark text-sm font-bold font-headline">
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6">Student / Description</th>
                      <th className="py-4 px-6">Amount</th>
                      <th className="py-4 px-6">Method</th>
                      <th className="py-4 px-6 text-right">Statement</th>
                    </tr>
                  </thead>
                  <tbody className="font-label text-sm divide-y divide-dark/10">
                    {recentPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 font-medium">{p.date}</td>
                        <td className="py-4 px-6">{p.desc}</td>
                        <td className="py-4 px-6 font-medium text-primary">{p.amount}</td>
                        <td className="py-4 px-6 text-dark/60">{p.method}</td>
                        <td className="py-4 px-6 text-right">
                          <a href="#" className="text-dark/60 hover:text-primary transition-colors flex items-center justify-end gap-1 font-bold">
                            <span className="material-symbols-outlined text-sm">print</span> In
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>
      <BillingDetailsModal isOpen={!!selectedStudent} onClose={() => setSelectedStudent(null)} studentData={selectedStudent} />
    </div>
  )
}
