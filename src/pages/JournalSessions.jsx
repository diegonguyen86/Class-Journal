import { useState, useMemo, useEffect } from 'react'
import { collection, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import TopNavBar from '../components/TopNavBar'

const initialSkills = [
  { id: 'vocab',   name: 'Từ vựng',       icon: 'Aa',                 color: '#9B88ED', score: 8.5, comment: 'Nắm vững từ vựng cơ bản và từ vựng theo chủ đề. Sử dụng từ vựng phù hợp trong bài.' },
  { id: 'grammar', name: 'Ngữ pháp',      icon: 'menu_book',          color: '#71816D', score: 7.0, comment: 'Hiểu được các cấu trúc ngữ pháp cơ bản. Cần chú ý thêm thì hiện tại hoàn thành.' },
  { id: 'listen',  name: 'Kỹ năng nghe',  icon: 'headphones',         color: '#E27D60', score: 8.0, comment: 'Nghe hiểu tốt các ý chính và chi tiết. Cần luyện thêm dạng bài nghe điền thông tin.' },
  { id: 'speak',   name: 'Kỹ năng nói',   icon: 'record_voice_over',  color: '#5D87FF', score: 7.0, comment: 'Diễn đạt ý tưởng rõ ràng. Cần tự tin và mở rộng vốn từ khi trả lời.' },
  { id: 'read',    name: 'Kỹ năng đọc',   icon: 'import_contacts',    color: '#FFB800', score: 8.5, comment: 'Đọc hiểu tốt, nắm được ý chính và chi tiết. Cần chú ý tốc độ làm bài.' },
  { id: 'write',   name: 'Kỹ năng viết',  icon: 'edit',               color: '#FF69B4', score: 7.5, comment: 'Bài viết có bố cục rõ ràng, diễn đạt mạch lạc. Cần chú ý lỗi chính tả và ngữ pháp.' },
]

function GradeModal({ isOpen, onClose, studentName, onSave, savedDetails }) {
  const [skills, setSkills] = useState(initialSkills)

  useEffect(() => {
    if (isOpen) {
      setSkills(savedDetails || initialSkills)
    }
  }, [isOpen, savedDetails])

  const updateScore = (id, newScore) => {
    setSkills(skills.map(s => s.id === id ? { ...s, score: Number(newScore) || 0 } : s))
  }


  const totalScore = useMemo(() => {
    const sum = skills.reduce((acc, curr) => acc + curr.score, 0)
    return (sum / skills.length).toFixed(1)
  }, [skills])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background w-full max-w-2xl rounded-2xl memphis-border-thick shadow-memphis-lg overflow-hidden max-h-[95vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 flex justify-between items-center bg-white border-b-2 border-dark">
          <div>
            <h2 className="font-headline font-bold text-2xl text-dark flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-primary fill">edit_document</span>
              Nhập điểm chi tiết: {studentName}
            </h2>
            <p className="font-body text-sm text-dark/70 mt-1 ml-[44px]">Cập nhật kết quả bài kiểm tra của học sinh.</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors border-2 border-transparent hover:border-dark">
            <span className="material-symbols-outlined text-dark">close</span>
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-xl memphis-border">

            <div className="flex flex-col gap-1.5">
              <label className="font-label font-bold text-sm text-dark">Tên bài kiểm tra</label>
              <div className="relative">
                <select className="w-full appearance-none bg-background border-2 border-dark rounded-lg py-2 px-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer shadow-sm truncate pr-8">
                  <option>Kiểm tra giữa kỳ 1 – Tiếng Anh</option><option>Kiểm tra 15 phút</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-dark/60">expand_more</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-label font-bold text-sm text-dark">Ngày kiểm tra</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-dark/60 text-[18px]">calendar_month</span>
                <input type="text" defaultValue="15/05/2024" className="w-full bg-background border-2 border-dark rounded-lg py-2 pl-9 pr-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" />
              </div>
            </div>
          </div>

          {/* Skills Table */}
          <div className="bg-white rounded-xl memphis-border overflow-hidden">
            <div className="flex bg-background border-b-2 border-dark p-3 font-headline font-bold text-xs text-dark uppercase tracking-wide">
              <div className="flex-1">Kỹ năng</div>
              <div className="w-24 text-center">Điểm (/10)</div>
            </div>
            
            <div className="flex flex-col divide-y-2 divide-dark/10">
              {skills.map((s) => (
                <div key={s.id} className="flex p-3 items-center hover:bg-background/30 transition-colors">
                  <div className="flex-1 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${s.color}33`, borderColor: s.color, color: s.color }}>
                      {s.id === 'vocab' ? <span className="font-headline font-bold text-sm">Aa</span> : <span className="material-symbols-outlined text-[18px]">{s.icon}</span>}
                    </div>
                    <span className="font-label font-bold text-sm text-dark">{s.name}</span>
                  </div>
                  <div className="w-24 flex justify-center items-center">
                    <input 
                      type="number" step="0.1" max="10" min="0"
                      value={s.score}
                      onChange={(e) => updateScore(s.id, e.target.value)}
                      className="w-16 text-center font-headline font-bold text-base bg-background border-2 border-dark rounded-md py-1 focus:ring-2 focus:ring-primary focus:outline-none" 
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Total Score Row */}
            <div className="flex p-4 bg-primary/10 border-t-2 border-dark items-center justify-between">
              <div className="flex-1 text-xs font-label text-dark/60 font-semibold italic">
                * Điểm tổng tự động
              </div>
              <div className="flex items-center gap-4">
                <span className="font-headline font-bold text-sm text-primary uppercase">ĐIỂM TỔNG</span>
                <div className="bg-white border-2 border-primary rounded-lg px-3 py-1 shadow-memphis-sm" style={{ boxShadow: '2px 2px 0px 0px #71816D' }}>
                  <span className="font-headline font-extrabold text-xl text-primary">{totalScore}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t-2 border-dark flex justify-end items-center gap-3">
          <button onClick={onClose} className="px-4 py-2 font-label font-bold text-dark/70 hover:text-dark hover:bg-background rounded-lg transition-colors text-sm">
            Hủy
          </button>
          <button onClick={() => onSave(totalScore, skills)} className="px-5 py-2 font-label font-bold text-white bg-primary border-2 border-dark rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 shadow-memphis hover:-translate-y-px hover:shadow-memphis-lg active:translate-y-0.5 active:shadow-none text-sm">
            <span className="material-symbols-outlined text-[18px]">check</span>
            Lưu điểm
          </button>
        </div>
      </div>
    </div>
  )
}

function AddSessionModal({ isOpen, onClose, onSuccess, selectedClass }) {
  const [sessionTitle, setSessionTitle] = useState('')
  const [dateTime, setDateTime] = useState('')
  
  const [attendance, setAttendance] = useState({})
  const [homework, setHomework] = useState({})
  
  useEffect(() => {
    if (selectedClass && selectedClass.studentList) {
      setAttendance(selectedClass.studentList.reduce((acc, student) => ({...acc, [student.name]: 'present'}), {}))
      setHomework(selectedClass.studentList.reduce((acc, student) => ({...acc, [student.name]: 'completed'}), {}))
    }
  }, [selectedClass])

  const [content, setContent] = useState('')
  const [observation, setObservation] = useState('')
  const [nextPlan, setNextPlan] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleAttendanceChange = (student, value) => {
    setAttendance(prev => ({ ...prev, [student]: value }))
  }

  const handleHomeworkChange = (student, value) => {
    setHomework(prev => ({ ...prev, [student]: value }))
  }

  const handleSubmit = async () => {
    setErrorMsg('')
    if (!sessionTitle) return setErrorMsg('Session Title is required')
    if (!dateTime) return setErrorMsg('Date & Time is required')
    
    setIsSubmitting(true)
    try {
      const newSession = {
        title: sessionTitle,
        date: dateTime.replace('T', ' '),
        attendance,
        homework,
        content,
        observation,
        nextPlan,
        createdAt: new Date().toISOString()
      }
      
      await addDoc(collection(db, 'journalSessions'), newSession)
      
      setSuccessMsg('Tạo Session thành công!')
      
      setTimeout(() => {
        // Reset form
        setSessionTitle('')
        setDateTime('')
        setContent('')
        setObservation('')
        setNextPlan('')
        setErrorMsg('')
        setSuccessMsg('')
        
        if (onSuccess) onSuccess()
        onClose()
      }, 1000)
    } catch (error) {
      console.error("Error adding session: ", error)
      if (error.code === 'permission-denied') {
        setErrorMsg("Không thể lưu: Lỗi phân quyền Firebase. Bạn hãy kiểm tra lại Firestore Rules.")
      } else {
        setErrorMsg("Failed to add session. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto backdrop-blur-sm">
      <div className="absolute inset-0 bg-dark/60" onClick={onClose} />
      
      {/* Modal Card */}
      <div className="relative bg-background w-full max-w-5xl rounded-[24px] border-[3px] border-dark shadow-memphis flex flex-col max-h-[90vh] overflow-hidden my-auto animate-[slideUp_0.3s_ease-out]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b-[3px] border-dark bg-secondary/20 relative shrink-0">
          <div className="absolute top-4 right-20 w-4 h-4 rounded-full bg-accent border-2 border-dark shadow-memphis-sm"></div>
          <div className="absolute top-8 right-24 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-primary rotate-45"></div>
          
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
            <h2 className="text-2xl font-headline font-bold text-dark tracking-tight">Add New Session</h2>
          </div>
          
          <button onClick={onClose} className="p-2 hover:bg-dark/10 rounded-full transition-colors group">
            <span className="material-symbols-outlined text-dark group-hover:text-danger">close</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-6 p-4 bg-danger/10 border-2 border-danger rounded-lg flex items-center gap-3 text-danger font-label font-bold text-sm">
            <span className="material-symbols-outlined">error</span>
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-6 p-4 bg-primary/10 border-2 border-primary rounded-lg flex items-center gap-3 text-primary font-label font-bold text-sm">
            <span className="material-symbols-outlined">check_circle</span>
            {successMsg}
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 relative">
          
          {/* Background decoration */}
          <div className="absolute top-10 left-10 text-secondary/30 pointer-events-none transform -rotate-12">
            <svg fill="none" height="40" viewBox="0 0 100 100" width="40" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 50 Q 30 10, 50 50 T 90 50" fill="transparent" stroke="currentColor" strokeWidth="8"></path>
            </svg>
          </div>

          {/* 1. Session Title & Time */}
          <div className="grid grid-cols-1 gap-6 relative z-10">
            <div className="space-y-2">
              <label className="block font-label font-bold text-dark text-sm uppercase tracking-wider">Session Title</label>
              <input type="text" value={sessionTitle} onChange={(e) => setSessionTitle(e.target.value)} placeholder="e.g. Lesson 9: Advanced Algebra" className="w-full bg-white border-[2px] border-dark rounded-lg p-3 focus:outline-none focus:ring-0 focus:border-primary shadow-[2px_2px_0px_0px_rgba(47,47,47,0.2)] transition-shadow font-body text-dark placeholder:text-dark/40" />
            </div>
            <div className="space-y-2">
              <label className="block font-label font-bold text-dark text-sm uppercase tracking-wider">Date & Time</label>
              <div className="relative">
                <input type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} className="w-full bg-white border-[2px] border-dark rounded-lg p-3 pl-10 focus:outline-none focus:ring-0 focus:border-primary shadow-[2px_2px_0px_0px_rgba(47,47,47,0.2)] font-body text-dark" />
                <span className="material-symbols-outlined absolute left-3 top-3.5 text-dark/60 pointer-events-none">calendar_today</span>
              </div>
            </div>
          </div>

          <hr className="border-dark/20 border-[1.5px] rounded-full" />

          <div className="relative z-10 space-y-8">
            <h3 className="font-headline font-bold text-xl text-dark flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>assignment</span>
              Session Details
            </h3>

            {/* 2. Attendance */}
            <div className="space-y-2 bg-white/50 p-4 rounded-xl border-2 border-dark/20 relative">
              <div className="absolute -left-2 -top-2 w-4 h-4 rounded-full bg-secondary border-2 border-dark"></div>
              <label className="block font-label font-bold text-dark text-sm uppercase tracking-wider">Điểm danh học sinh</label>
              
              <div className="overflow-x-auto bg-white border-2 border-dark rounded-lg shadow-[2px_2px_0px_0px_rgba(47,47,47,0.2)]">
                <table className="w-full text-left font-body text-sm">
                  <thead className="bg-secondary/20 border-b-2 border-dark">
                    <tr>
                      <th className="p-3 font-semibold text-dark">Học sinh</th>
                      <th className="p-3 text-center font-semibold text-dark">Có mặt</th>
                      <th className="p-3 text-center font-semibold text-dark">Đi muộn</th>
                      <th className="p-3 text-center font-semibold text-dark">Vắng mặt</th>
                      <th className="p-3 text-center font-semibold text-dark">Có phép</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-dark/10">
                    {selectedClass?.studentList?.map((student, idx) => (
                      <tr key={student.id || idx} className="hover:bg-primary/5 transition-colors">
                        <td className="p-3 font-medium">{student.name}</td>
                        <td className="p-3 text-center"><input type="radio" name={`att_${idx}`} value="present" checked={attendance[student.name] === 'present'} onChange={(e) => handleAttendanceChange(student.name, e.target.value)} className="w-5 h-5 text-primary border-2 border-dark focus:ring-primary focus:ring-offset-1" /></td>
                        <td className="p-3 text-center"><input type="radio" name={`att_${idx}`} value="late" checked={attendance[student.name] === 'late'} onChange={(e) => handleAttendanceChange(student.name, e.target.value)} className="w-5 h-5 text-accent border-2 border-dark focus:ring-accent" /></td>
                        <td className="p-3 text-center"><input type="radio" name={`att_${idx}`} value="absent" checked={attendance[student.name] === 'absent'} onChange={(e) => handleAttendanceChange(student.name, e.target.value)} className="w-5 h-5 text-danger border-2 border-dark focus:ring-danger" /></td>
                        <td className="p-3 text-center"><input type="radio" name={`att_${idx}`} value="excused" checked={attendance[student.name] === 'excused'} onChange={(e) => handleAttendanceChange(student.name, e.target.value)} className="w-5 h-5 text-secondary border-2 border-dark focus:ring-secondary" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Homework Tracking */}
            <div className="space-y-2 bg-white/50 p-4 rounded-xl border-2 border-dark/20 relative">
              <div className="absolute -right-2 -top-2 w-4 h-4 bg-accent border-2 border-dark rounded-sm"></div>
              <label className="block font-label font-bold text-dark text-sm uppercase tracking-wider">THEO DÕI BÀI TẬP</label>
              
              <div className="overflow-x-auto bg-white border-2 border-dark rounded-lg shadow-[2px_2px_0px_0px_rgba(47,47,47,0.2)]">
                <table className="w-full text-left font-body text-sm">
                  <thead className="bg-secondary/20 border-b-2 border-dark">
                    <tr>
                      <th className="p-3 font-semibold text-dark">Học sinh</th>
                      <th className="p-3 text-center font-semibold text-dark">Hoàn thành</th>
                      <th className="p-3 text-center font-semibold text-dark">Một phần</th>
                      <th className="p-3 text-center font-semibold text-dark">Chưa làm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-dark/10">
                    {selectedClass?.studentList?.map((student, idx) => (
                      <tr key={student.id || idx} className="hover:bg-primary/5 transition-colors">
                        <td className="p-3 font-medium">{student.name}</td>
                        <td className="p-3 text-center"><input type="radio" name={`hw_${idx}`} value="completed" checked={homework[student.name] === 'completed'} onChange={(e) => handleHomeworkChange(student.name, e.target.value)} className="w-5 h-5 text-primary border-2 border-dark focus:ring-primary" /></td>
                        <td className="p-3 text-center"><input type="radio" name={`hw_${idx}`} value="partial" checked={homework[student.name] === 'partial'} onChange={(e) => handleHomeworkChange(student.name, e.target.value)} className="w-5 h-5 text-accent border-2 border-dark focus:ring-accent" /></td>
                        <td className="p-3 text-center"><input type="radio" name={`hw_${idx}`} value="incomplete" checked={homework[student.name] === 'incomplete'} onChange={(e) => handleHomeworkChange(student.name, e.target.value)} className="w-5 h-5 text-danger border-2 border-dark focus:ring-danger" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. Session Content */}
            <div className="space-y-2 bg-white/50 p-4 rounded-xl border-2 border-dark/20 relative">
              <div className="absolute -right-2 -top-2 w-4 h-4 bg-primary border-2 border-dark rotate-12"></div>
              <label className="block font-label font-bold text-dark text-sm uppercase tracking-wider flex items-center justify-between">
                <span>Nội dung buổi học</span>
                <div className="flex gap-1 text-dark/40">
                  <span className="material-symbols-outlined text-[18px] cursor-pointer hover:text-dark">format_bold</span>
                  <span className="material-symbols-outlined text-[18px] cursor-pointer hover:text-dark">format_italic</span>
                  <span className="material-symbols-outlined text-[18px] cursor-pointer hover:text-dark">format_list_bulleted</span>
                </div>
              </label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full bg-white border-[2px] border-dark rounded-lg p-3 focus:outline-none focus:ring-0 focus:border-primary font-body text-dark resize-y min-h-[100px]" placeholder="What was covered today? Topics, exercises, materials used..." rows="4"></textarea>
            </div>

            {/* 5. General Observation */}
            <div className="space-y-2 bg-white/50 p-4 rounded-xl border-2 border-dark/20">
              <label className="block font-label font-bold text-dark text-sm uppercase tracking-wider">Nhận xét chung của buổi học</label>
              <textarea value={observation} onChange={(e) => setObservation(e.target.value)} className="w-full bg-white border-[2px] border-dark rounded-lg p-3 focus:outline-none focus:ring-0 focus:border-primary font-body text-dark resize-y min-h-[100px]" placeholder="How did the class respond? Notable student interactions, struggles, or successes..." rows="4"></textarea>
            </div>

            {/* 6. Next Lesson Plan */}
            <div className="space-y-2 bg-white/50 p-4 rounded-xl border-2 border-dark/20">
              <label className="block font-label font-bold text-dark text-sm uppercase tracking-wider">Bài học buổi sau</label>
              <textarea value={nextPlan} onChange={(e) => setNextPlan(e.target.value)} className="w-full bg-white border-[2px] border-dark rounded-lg p-3 focus:outline-none focus:ring-0 focus:border-primary font-body text-dark resize-y min-h-[80px]" placeholder="Brief outline or goals for the next session..." rows="2"></textarea>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t-[3px] border-dark bg-white/80 flex flex-col-reverse sm:flex-row justify-end items-center gap-4 shrink-0">
          <button onClick={onClose} disabled={isSubmitting} className="w-full sm:w-auto px-6 py-3 rounded-lg border-[2px] border-dark bg-secondary text-dark font-headline font-bold shadow-memphis-sm hover:bg-secondary/80 hover:-translate-y-px hover:shadow-none transition-all">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting} className={`w-full sm:w-auto px-8 py-3 rounded-lg border-[3px] border-dark bg-primary text-white font-headline font-bold text-lg shadow-memphis hover:bg-primary/90 active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 group ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}>
            {isSubmitting ? 'Creating...' : 'Create Session'}
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">{isSubmitting ? 'hourglass_empty' : 'arrow_forward'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function JournalSessions() {
  const [activeStudent, setActiveStudent] = useState('')
  const [activeSession, setActiveSession] = useState(null)
  const [selectedClass, setSelectedClass] = useState(null)
  const [classesList, setClassesList] = useState([])

  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false)
  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false)
  const [sessionsList, setSessionsList] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [sessionsSnapshot, classesSnapshot] = await Promise.all([
        getDocs(collection(db, 'journalSessions')),
        getDocs(collection(db, 'classes'))
      ])
      
      const sessionsData = sessionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      const classesData = classesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      
      if (classesData.length > 0) {
        setClassesList(classesData)
        setSelectedClass(classesData[0])
        if (classesData[0].studentList && classesData[0].studentList.length > 0) {
          setActiveStudent(classesData[0].studentList[0].name)
        }
      }

      if (sessionsData.length > 0) {
        setSessionsList(sessionsData)
        setActiveSession(sessionsData[0])
      } else {
        setSessionsList([])
        setActiveSession(null)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const currentStudents = selectedClass?.studentList?.map(s => s.name) || []

  const studentStats = useMemo(() => {
    if (!activeStudent || !sessionsList.length) return { att: 0, hw: 0, attCount: 0, attTotal: 0, lateCount: 0, hwCompleted: 0, hwPartial: 0, hwIncomplete: 0 }
    
    let attTotal = 0
    let attCount = 0
    let lateCount = 0
    let hwTotal = 0
    let hwScore = 0
    let hwCompleted = 0
    let hwPartial = 0
    let hwIncomplete = 0

    sessionsList.forEach(session => {
      if (session.attendance && session.attendance[activeStudent]) {
        attTotal++
        if (session.attendance[activeStudent] === 'present') {
          attCount++
        } else if (session.attendance[activeStudent] === 'late') {
          attCount++
          lateCount++
        }
      }
      if (session.homework && session.homework[activeStudent]) {
        hwTotal++
        if (session.homework[activeStudent] === 'completed') {
          hwScore += 1
          hwCompleted++
        } else if (session.homework[activeStudent] === 'partial') {
          hwScore += 0.5
          hwPartial++
        } else if (session.homework[activeStudent] === 'incomplete') {
          hwIncomplete++
        }
      }
    })

    return {
      att: attTotal > 0 ? Math.round((attCount / attTotal) * 100) : 0,
      attCount,
      attTotal,
      lateCount,
      hw: hwTotal > 0 ? Math.round((hwScore / hwTotal) * 100) : 0,
      hwCompleted,
      hwPartial,
      hwIncomplete
    }
  }, [activeStudent, sessionsList])

  const activeStudentGradeData = activeSession?.grades?.[activeStudent]
  const avgGrade = activeStudentGradeData?.totalScore || '--'

  const handleSaveGrade = async (totalScore, details) => {
    if (!activeSession) {
      alert("Vui lòng chọn một session trước khi nhập điểm!")
      return
    }
    try {
      const updatedGrades = {
        ...(activeSession.grades || {}),
        [activeStudent]: { totalScore, details }
      }
      const sessionRef = doc(db, 'journalSessions', activeSession.id)
      await updateDoc(sessionRef, { grades: updatedGrades })
      
      const updatedSession = { ...activeSession, grades: updatedGrades }
      setActiveSession(updatedSession)
      setSessionsList(prev => prev.map(s => s.id === activeSession.id ? updatedSession : s))
      setIsGradeModalOpen(false)
    } catch (e) {
      console.error(e)
      alert('Không thể lưu điểm. Vui lòng kiểm tra quyền Firestore.')
    }
  }

  const [personalNote, setPersonalNote] = useState('')

  useEffect(() => {
    setPersonalNote(activeSession?.personalNotes?.[activeStudent] || '')
  }, [activeSession, activeStudent])

  const handleSavePersonalNote = async () => {
    if (!activeSession) return
    try {
      const updatedNotes = {
        ...(activeSession.personalNotes || {}),
        [activeStudent]: personalNote
      }
      const sessionRef = doc(db, 'journalSessions', activeSession.id)
      await updateDoc(sessionRef, { personalNotes: updatedNotes })
      
      const updatedSession = { ...activeSession, personalNotes: updatedNotes }
      setActiveSession(updatedSession)
      setSessionsList(prev => prev.map(s => s.id === activeSession.id ? updatedSession : s))
      alert('Đã lưu nhận xét riêng thành công!')
    } catch (e) {
      console.error(e)
      alert('Không thể lưu nhận xét. Vui lòng kiểm tra quyền Firestore.')
    }
  }

  const handleShareToParent = () => {
    if (!activeSession || !activeStudent) return
    
    const studentData = selectedClass?.studentList?.find(s => s.name === activeStudent)
    const parentPhone = studentData?.phone || ''
    
    const message = `Kính gửi Phụ huynh em ${activeStudent},\nĐây là nhận xét và nội dung buổi học ngày ${activeSession.date}:\n\n📌 NHẬN XÉT CÁ NHÂN:\n${personalNote || 'Không có nhận xét riêng.'}\n\n📖 NỘI DUNG BUỔI HỌC:\n${activeSession.content || 'Không có nội dung.'}\n\n🗣 NHẬN XÉT CHUNG CỦA LỚP:\n${activeSession.observation || 'Không có nhận xét chung.'}\n\n📝 KẾ HOẠCH BUỔI SAU:\n${activeSession.nextPlan || 'Không có kế hoạch.'}`
    
    navigator.clipboard.writeText(message).then(() => {
       alert("Đã sao chép nội dung chia sẻ vào Khay nhớ tạm (Clipboard)!")
       if (parentPhone) {
         window.open(`https://zalo.me/${parentPhone}`, '_blank')
       }
    }).catch(err => {
       console.error("Failed to copy text: ", err)
       alert("Không thể tự động sao chép. Lỗi: " + err)
    })
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center font-headline text-2xl text-dark">Loading Sessions...</div>

  return (
    <div className="flex flex-col min-h-screen">
      <TopNavBar />
      <main className="flex-1 p-8 flex flex-col gap-6 relative">
        {/* Hero Section */}
        <div className="relative z-10">
          <h1 className="font-headline font-extrabold text-4xl mb-2 text-dark tracking-tight">Capture every teaching moment.</h1>
          <p className="font-body text-lg text-dark/80">Your sessions, tagged and searchable — always at hand.</p>
        </div>

        {/* Two Column Layout */}
        <div className="flex flex-1 gap-6 min-h-0 relative z-10">
          {/* Left Column: Lesson List */}
          <div className="w-[35%] flex flex-col bg-white/60 backdrop-blur-sm rounded-2xl memphis-border p-4 flex-shrink-0 h-[calc(100vh-220px)]">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h2 className="font-headline font-bold text-xl">Sessions</h2>
                <span className="bg-secondary text-dark px-2 py-0.5 rounded-md font-label font-bold text-xs memphis-border">{sessionsList.length} Sessions</span>
              </div>
              <button onClick={() => {
                if (!selectedClass) {
                  alert('Vui lòng tạo hoặc chọn lớp học trước khi tạo Session!')
                  return
                }
                setIsAddSessionModalOpen(true)
              }} className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center memphis-border hover:bg-dark transition-colors">
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {sessionsList.map((s) => (
                <div key={s.id} onClick={() => setActiveSession(s)} className={`p-4 rounded-xl memphis-border cursor-pointer relative overflow-hidden group transition-all ${activeSession?.id === s.id ? 'bg-secondary shadow-memphis' : 'bg-white hover:shadow-memphis hover:-translate-y-1'}`}>
                  {activeSession?.id === s.id && <div className="absolute -right-4 -top-4 w-12 h-12 bg-white/20 rounded-full rotate-45"></div>}
                  <div className="flex justify-between items-start mb-2 relative z-10">
                    <h3 className="font-headline font-bold text-dark leading-tight pr-6">{s.title}</h3>
                  </div>
                  <div className="flex justify-between items-end mt-4">
                    <div className="font-label text-xs font-semibold text-dark/70 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">calendar_today</span> {s.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Note Editor */}
          <div className="w-[65%] bg-white rounded-2xl memphis-border flex flex-col h-[calc(100vh-220px)] overflow-y-auto shadow-sm">
            {/* Top Toolbar */}
            <div className="bg-[#F8F4EC] border-b-2 border-dark p-4 flex flex-col gap-4 shrink-0">
              {/* Class Selector Dropdown */}
              <div className="flex items-center gap-3 border-b-2 border-dark/10 pb-3">
                <label className="font-label font-bold text-sm text-dark">Chọn lớp học:</label>
                <select 
                  className="bg-white border-2 border-dark rounded-lg px-3 py-1.5 font-body text-sm focus:outline-none focus:border-primary shadow-memphis-sm cursor-pointer"
                  value={selectedClass?.id || ''}
                  onChange={(e) => {
                    const cls = classesList.find(c => c.id === e.target.value)
                    setSelectedClass(cls)
                    if (cls?.studentList?.length > 0) {
                      setActiveStudent(cls.studentList[0].name)
                    } else {
                      setActiveStudent('')
                    }
                  }}
                >
                  <option value="" disabled>-- Chọn một lớp học --</option>
                  {classesList.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 overflow-x-auto pb-1">
                  {currentStudents.length === 0 && <span className="font-label text-sm text-dark/60 italic">Lớp học này chưa có học sinh.</span>}
                  {currentStudents.map((name) => {
                    const isActive = name === activeStudent;
                    return (
                      <div 
                        key={name} 
                        onClick={() => setActiveStudent(name)}
                        className={`flex flex-col items-center gap-1 cursor-pointer group transition-opacity ${isActive ? '' : 'opacity-60 hover:opacity-100'}`}
                      >
                        <div className={`w-12 h-12 rounded-full memphis-border overflow-hidden group-hover:scale-110 transition-transform ${isActive ? 'bg-primary ring-2 ring-primary ring-offset-2' : 'bg-white'}`}>
                          <div className="w-full h-full bg-secondary/30 flex items-center justify-center font-bold text-xs text-dark">{name.split(' ').map(n=>n[0]).join('')}</div>
                        </div>
                        <span className={`font-label text-xs ${isActive ? 'font-bold' : 'font-semibold'} text-dark`}>{name}</span>
                      </div>
                    )
                  })}
                </div>
                <a href="#" className="font-label text-sm font-bold text-primary hover:underline whitespace-nowrap">View All</a>
              </div>

              <div className="border-t-2 border-dark/10 pt-4">
                <h3 className="font-headline font-bold text-lg mb-3 text-dark">Nhận xét riêng cho học sinh: <span className="text-primary">{activeStudent}</span></h3>
                
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-background p-3 rounded-xl memphis-border flex flex-col items-center justify-center">
                    <div className="font-label text-[10px] font-bold text-primary mb-1 text-center uppercase tracking-wider">Tỉ lệ điểm danh</div>
                    <div className="font-headline font-extrabold text-2xl text-dark mb-1">{studentStats.att}%</div>
                    <div className="font-body text-[10px] font-semibold text-dark/70">
                      {studentStats.attCount}/{studentStats.attTotal} <span className="text-accent">({studentStats.lateCount} muộn)</span>
                    </div>
                  </div>
                  <div className="bg-secondary p-3 rounded-xl memphis-border flex flex-col items-center justify-center">
                    <div className="font-label text-[10px] font-bold text-dark mb-1 text-center uppercase tracking-wider">Tỉ lệ làm bài tập</div>
                    <div className="font-headline font-extrabold text-xl text-dark mb-1">{studentStats.hw}%</div>
                    <div className="w-full bg-white rounded-full h-1.5 memphis-border mb-1.5">
                      <div className="bg-accent h-full rounded-full border-r-2 border-dark" style={{ width: `${studentStats.hw}%` }}></div>
                    </div>
                    <div className="font-body text-[10px] font-semibold text-dark flex gap-2">
                      <span className="text-primary" title="Hoàn thành">H: {studentStats.hwCompleted}</span>
                      <span className="text-dark" title="Một phần">P: {studentStats.hwPartial}</span>
                      <span className="text-danger" title="Chưa làm">C: {studentStats.hwIncomplete}</span>
                    </div>
                  </div>
                  <div className="bg-accent p-3 rounded-xl memphis-border flex flex-col items-center justify-center text-white text-center">
                    <div className="font-label text-[10px] font-bold mb-1 uppercase tracking-wider">Điểm TB (Session này)</div>
                    <div className="flex items-center gap-1">
                      <span className="font-headline font-extrabold text-2xl">{avgGrade}</span>
                      <span className="material-symbols-outlined text-xl">star</span>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <textarea value={personalNote} onChange={e => setPersonalNote(e.target.value)} className="w-full h-24 p-3 bg-white border-2 border-dark rounded-xl font-body text-sm focus:ring-0 focus:border-primary resize-none" placeholder={`Nhập nhận xét cá nhân cho ${activeStudent}...`}></textarea>
                  <div className="flex items-center gap-3 mt-3">
                    <button 
                      onClick={() => setIsGradeModalOpen(true)}
                      className="flex-1 bg-white text-dark px-4 py-2 rounded-lg font-label font-bold text-sm border-2 border-dark hover:shadow-memphis-sm active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-sm">edit_note</span> Nhập điểm
                    </button>
                    <button onClick={handleSavePersonalNote} className="flex-1 bg-primary text-white px-4 py-2 rounded-lg font-label font-bold text-sm memphis-border hover:shadow-memphis-sm active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-sm">save</span> Lưu nhận xét riêng
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Editor Area */}
            <div className="p-8 font-label text-lg text-dark leading-relaxed outline-none" style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #C9B79C 31px, #C9B79C 32px)', lineHeight: '32px' }}>
              <h3 className="font-headline font-bold text-xl mb-4 bg-white inline-block px-2">Nội dung buổi học</h3>
              <p className="mb-8 whitespace-pre-wrap">{activeSession?.content || 'Chưa có nội dung.'}</p>
              
              <h3 className="font-headline font-bold text-xl mb-4 bg-white inline-block px-2">Nhận xét buổi học</h3>
              <div className="bg-background p-4 rounded-xl memphis-border mb-8 relative overflow-hidden group">
                <span className="absolute top-0 left-0 w-2 h-full bg-primary"></span>
                <div className="font-headline font-bold text-primary mb-1 flex items-center gap-2 leading-none">
                  <span className="material-symbols-outlined text-[20px]">assignment</span> Nhận xét chung của buổi học
                </div>
                <p className="font-body text-sm text-dark mt-2 leading-normal whitespace-pre-wrap">{activeSession?.observation || 'Chưa có nhận xét.'}</p>
              </div>

              <h3 className="font-headline font-bold text-xl mb-4 bg-white inline-block px-2">Bài học buổi sau</h3>
              <p className="mb-10 whitespace-pre-wrap">{activeSession?.nextPlan || 'Chưa có kế hoạch.'}</p>

              <div className="flex justify-center border-t-2 border-dark/20 pt-8 mt-4 bg-white mx-[-32px] px-8 mb-[-32px] pb-8">
                <button onClick={handleShareToParent} className="bg-accent text-white px-8 py-3 rounded-xl font-headline font-bold text-lg memphis-border hover:-translate-y-1 hover:shadow-memphis transition-all flex items-center justify-center gap-3 w-full sm:w-auto">
                  <span className="material-symbols-outlined text-2xl">share</span> Chia sẻ cho phụ huynh
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <GradeModal 
        isOpen={isGradeModalOpen} 
        onClose={() => setIsGradeModalOpen(false)} 
        studentName={activeStudent}
        onSave={handleSaveGrade}
        savedDetails={activeStudentGradeData?.details}
      />
      <AddSessionModal isOpen={isAddSessionModalOpen} onClose={() => setIsAddSessionModalOpen(false)} onSuccess={fetchData} selectedClass={selectedClass} />
    </div>
  )
}
