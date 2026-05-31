import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase'
import TopNavBar from '../components/TopNavBar'

function ClassModal({ cls, onClose }) {
  if (!cls) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background w-full max-w-3xl rounded-2xl memphis-border-thick shadow-memphis-lg overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 flex justify-between items-center text-white" style={{ backgroundColor: cls.color }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full memphis-border border-white/50 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">{cls.icon}</span>
            </div>
            <div>
              <h2 className="font-headline text-3xl font-extrabold break-words">{cls.name}</h2>
              <p className="font-label text-white/80">{cls.room} · {cls.days} {cls.time}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors border border-white/30">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {/* Modal Body */}
        <div className="p-8 overflow-y-auto flex-1 bg-white/50">
          <div className="bg-white rounded-xl memphis-border p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline font-bold text-xl text-dark">Danh sách học sinh</h3>
              <span className="font-label font-bold text-sm bg-secondary px-3 py-1 rounded-full memphis-border">Sĩ số: {cls.studentList.length}</span>
            </div>
            
            <div className="space-y-4">
              {cls.studentList.map((stu) => (
                <div key={stu.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-2 border-dark rounded-xl bg-background hover:bg-background/80 transition-colors gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full memphis-border overflow-hidden bg-primary ring-2 ring-primary ring-offset-2 flex-shrink-0">
                      <div className="w-full h-full bg-secondary/30 flex items-center justify-center font-bold text-sm text-dark">{stu.name.split(' ').map(n=>n[0]).join('')}</div>
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-lg text-dark break-words">{stu.name}</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 font-body text-xs text-dark/70 mt-1">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">cake</span> {stu.dob}</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">family_restroom</span> Phụ huynh: {stu.parent}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 sm:ml-auto">
                    <button className="flex items-center gap-2 bg-white text-dark px-3 py-2 rounded-lg font-label font-bold text-xs border-2 border-dark shadow-memphis-sm hover:-translate-y-px transition-transform">
                      <span className="material-symbols-outlined text-sm">call</span> Gọi điện
                    </button>
                    <button className="flex items-center gap-2 bg-[#0068FF] text-white px-3 py-2 rounded-lg font-label font-bold text-xs border-2 border-dark shadow-memphis-sm hover:-translate-y-px transition-transform">
                      <span className="material-symbols-outlined text-sm">chat</span> Nhắn Zalo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AddClassModal({ isOpen, onClose, onSuccess, editingClass }) {
  const [students, setStudents] = useState([{ id: 1, name: '', dob: '', parent: '', phone: '' }])
  const [className, setClassName] = useState('')
  const [description, setDescription] = useState('')
  const [schedule, setSchedule] = useState([])
  const [timeStart, setTimeStart] = useState('18:00')
  const [timeEnd, setTimeEnd] = useState('19:30')
  const [room, setRoom] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (editingClass) {
        setClassName(editingClass.name || '')
        setDescription(editingClass.description || '')
        setSchedule(editingClass.days ? editingClass.days.split('/') : [])
        if (editingClass.time) {
          const [start, end] = editingClass.time.split('–')
          setTimeStart(start || '18:00')
          setTimeEnd(end || '19:30')
        }
        setRoom(editingClass.room || '')
        if (editingClass.studentList && editingClass.studentList.length > 0) {
          setStudents(editingClass.studentList)
        } else {
          setStudents([{ id: Date.now(), name: '', dob: '', parent: '', phone: '' }])
        }
      } else {
        setClassName('')
        setDescription('')
        setSchedule([])
        setTimeStart('18:00')
        setTimeEnd('19:30')
        setRoom('')
        setStudents([{ id: Date.now(), name: '', dob: '', parent: '', phone: '' }])
      }
      setErrorMsg('')
      setSuccessMsg('')
    }
  }, [isOpen, editingClass])

  const addStudentRow = () => {
    setStudents([...students, { id: Date.now(), name: '', dob: '', parent: '', phone: '' }])
  }

  const removeStudentRow = (id) => {
    if (students.length > 1) {
      setStudents(students.filter(s => s.id !== id))
    }
  }

  const handleStudentChange = (id, field, value) => {
    setStudents(students.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  const handleScheduleChange = (day) => {
    setSchedule(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
  }

  const handleSubmit = async () => {
    setErrorMsg('')
    if (!className) return setErrorMsg('Class Name is required')
    if (schedule.length === 0) return setErrorMsg('Please select at least one day')
    
    setIsSubmitting(true)
    try {
      const classData = {
        name: className,
        description,
        days: schedule.join('/'),
        time: `${timeStart}–${timeEnd}`,
        room,
        students: students.length,
        studentList: students.filter(s => s.name.trim() !== ''),
      }
      
      if (editingClass) {
        classData.updatedAt = new Date().toISOString()
        const classRef = doc(db, 'classes', editingClass.id)
        await updateDoc(classRef, classData)
        setSuccessMsg('Cập nhật lớp học thành công!')
      } else {
        classData.attendance = 100
        classData.color = '#D96C75' // Default color
        classData.icon = 'book'     // Default icon
        classData.teacher = 'Ms. Sarah Chen' // Default teacher
        classData.createdAt = new Date().toISOString()
        await addDoc(collection(db, 'classes'), classData)
        setSuccessMsg('Tạo lớp học thành công!')
      }
      
      setTimeout(() => {
        if (onSuccess) onSuccess()
        onClose()
      }, 1000)
    } catch (error) {
      console.error("Error adding class: ", error)
      if (error.code === 'permission-denied') {
        setErrorMsg("Không thể lưu: Lỗi phân quyền Firebase. Bạn hãy kiểm tra lại Firestore Rules.")
      } else {
        setErrorMsg("Failed to add class. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-5xl rounded-2xl memphis-border-thick shadow-memphis-lg flex flex-col max-h-[95vh]">
        <div className="p-6 border-b-2 border-dark flex justify-between items-center bg-secondary/30">
          <h2 className="font-headline font-bold text-2xl">{editingClass ? 'Edit Class' : 'Add New Class'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full border-2 border-dark flex items-center justify-center hover:bg-dark hover:text-white transition-colors">
            <span className="material-symbols-outlined text-sm">close</span>
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
        
        <div className="p-6 overflow-y-auto flex-1 font-body text-sm grid grid-cols-1 lg:grid-cols-2 gap-8 bg-[#F8F4EC]">
          {/* Left Column: Class Info */}
          <div className="space-y-5">
            <h3 className="font-headline font-bold text-lg border-b-2 border-dark pb-2 mb-4">Class Information</h3>
            <div>
              <label className="font-label font-bold text-sm text-dark">Class Name *</label>
              <input type="text" value={className} onChange={(e) => setClassName(e.target.value)} placeholder="e.g. IELTS Foundation" className="w-full bg-secondary/20 border-2 border-dark rounded-lg p-2 mt-1 focus:outline-none focus:border-primary shadow-memphis-sm placeholder:text-dark/40" />
            </div>
            <div>
              <label className="font-label font-bold text-sm text-dark">Description (Optional)</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of the class..." className="w-full bg-secondary/20 border-2 border-dark rounded-lg p-2 mt-1 focus:outline-none focus:border-primary resize-none h-20 shadow-memphis-sm placeholder:text-dark/40 break-words" />
            </div>
            
            <div>
              <label className="font-label font-bold text-sm text-dark mb-2 block">Schedule (Days of Week) *</label>
              <div className="flex flex-wrap gap-3 mt-1">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => (
                  <label key={day} className="flex items-center gap-1.5 cursor-pointer group">
                    <input type="checkbox" checked={schedule.includes(day)} onChange={() => handleScheduleChange(day)} className="appearance-none w-4 h-4 rounded-sm border-2 border-dark bg-white checked:bg-primary checked:border-primary flex-shrink-0 cursor-pointer shadow-[1px_1px_0px_0px_#2F2F2F] relative checked:after:content-['✓'] checked:after:absolute checked:after:text-white checked:after:text-[10px] checked:after:font-bold checked:after:left-[2px] checked:after:-top-[1px]" />
                    <span className="font-label font-bold text-xs">{day}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-label font-bold text-sm text-dark">Time *</label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="relative flex-1">
                    <input type="time" value={timeStart} onChange={(e) => setTimeStart(e.target.value)} className="w-full bg-secondary/20 border-2 border-dark rounded-lg p-2 focus:outline-none focus:border-primary text-xs shadow-memphis-sm" />
                  </div>
                  <span>-</span>
                  <div className="relative flex-1">
                    <input type="time" value={timeEnd} onChange={(e) => setTimeEnd(e.target.value)} className="w-full bg-secondary/20 border-2 border-dark rounded-lg p-2 focus:outline-none focus:border-primary text-xs shadow-memphis-sm" />
                  </div>
                </div>
              </div>
              <div>
                <label className="font-label font-bold text-sm text-dark">Room Number (Optional)</label>
                <input type="text" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="e.g. Room 101" className="w-full bg-secondary/20 border-2 border-dark rounded-lg p-2 mt-1 focus:outline-none focus:border-primary shadow-memphis-sm placeholder:text-dark/40" />
              </div>
            </div>
          </div>

          {/* Right Column: Student Roster */}
          <div className="space-y-4 flex flex-col h-full">
            <div className="flex justify-between items-center border-b-2 border-dark pb-2 mb-2">
              <h3 className="font-headline font-bold text-lg">Student Roster</h3>
              <button onClick={addStudentRow} className="text-xs font-label font-bold bg-secondary px-3 py-1.5 rounded-lg memphis-border flex items-center gap-1 hover:-translate-y-px transition-transform">
                <span className="material-symbols-outlined text-[14px]">add</span> Add Row
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {students.map((stu, i) => (
                <div key={stu.id} className="bg-secondary/30 border-2 border-dark rounded-xl p-4 relative group shadow-[2px_2px_0px_0px_#2F2F2F]">
                  <div className="flex justify-between items-center mb-2">
                    <div className="w-6 h-6 bg-dark text-white rounded-full flex items-center justify-center font-bold text-xs font-label">
                      {i + 1}
                    </div>
                    {students.length > 1 && (
                      <button onClick={() => removeStudentRow(stu.id)} className="text-danger hover:text-white hover:bg-danger w-6 h-6 rounded-full flex items-center justify-center transition-colors">
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-label font-bold text-xs text-dark/70">Student Name</label>
                      <input type="text" value={stu.name} onChange={(e) => handleStudentChange(stu.id, 'name', e.target.value)} placeholder="Full name" className="w-full bg-white border-2 border-dark/20 rounded-md p-1.5 mt-1 focus:border-primary focus:outline-none text-xs shadow-[1px_1px_0px_0px_rgba(47,47,47,0.1)]" />
                    </div>
                    <div>
                      <label className="font-label font-bold text-xs text-dark/70">Date of Birth</label>
                      <input type="date" value={stu.dob} onChange={(e) => handleStudentChange(stu.id, 'dob', e.target.value)} className="w-full bg-white border-2 border-dark/20 rounded-md p-1.5 mt-1 focus:border-primary focus:outline-none text-xs shadow-[1px_1px_0px_0px_rgba(47,47,47,0.1)]" />
                    </div>
                    <div>
                      <label className="font-label font-bold text-xs text-dark/70">Parent Name</label>
                      <input type="text" value={stu.parent} onChange={(e) => handleStudentChange(stu.id, 'parent', e.target.value)} placeholder="Parent full name" className="w-full bg-white border-2 border-dark/20 rounded-md p-1.5 mt-1 focus:border-primary focus:outline-none text-xs shadow-[1px_1px_0px_0px_rgba(47,47,47,0.1)]" />
                    </div>
                    <div>
                      <label className="font-label font-bold text-xs text-dark/70">Contact Phone</label>
                      <input type="tel" value={stu.phone} onChange={(e) => handleStudentChange(stu.id, 'phone', e.target.value)} placeholder="Phone number" className="w-full bg-white border-2 border-dark/20 rounded-md p-1.5 mt-1 focus:border-primary focus:outline-none text-xs shadow-[1px_1px_0px_0px_rgba(47,47,47,0.1)]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t-2 border-dark bg-secondary/30 flex justify-end gap-3">
          <button onClick={onClose} disabled={isSubmitting} className="px-5 py-2 font-label font-bold text-dark/70 hover:bg-white rounded-lg border-2 border-transparent transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={isSubmitting} className={`px-6 py-2 font-label font-bold text-white bg-primary border-2 border-dark rounded-lg shadow-memphis hover:-translate-y-px transition-transform flex items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}>
            <span className="material-symbols-outlined text-sm">{isSubmitting ? 'hourglass_empty' : 'save'}</span> {isSubmitting ? (editingClass ? 'Saving...' : 'Creating...') : (editingClass ? 'Save Changes' : 'Create Class')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MyClasses() {
  const [activeClass, setActiveClass] = useState(null)
  const [editingClass, setEditingClass] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [classesList, setClassesList] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchClasses = async () => {
    try {
      const classesSnapshot = await getDocs(collection(db, 'classes'))
      const classesData = classesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setClassesList(classesData)
    } catch (error) {
      console.error("Error fetching classes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClass = async (classId, e) => {
    e.stopPropagation()
    if (window.confirm('Bạn có chắc chắn muốn xoá lớp học này?')) {
      try {
        await deleteDoc(doc(db, 'classes', classId))
        fetchClasses()
      } catch (error) {
        console.error("Error deleting class:", error)
        alert('Có lỗi xảy ra khi xoá lớp học.')
      }
    }
  }


  useEffect(() => {
    fetchClasses()
  }, [])

  if (loading) return <div className="flex min-h-screen items-center justify-center font-headline text-2xl text-dark">Loading Classes...</div>

  return (
    <div className="flex flex-col min-h-screen">
      <TopNavBar />
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="font-headline text-4xl font-extrabold text-dark mb-1">My Classes</h1>
            <p className="font-label text-lg text-dark/70">Manage your classrooms and student rosters</p>
          </div>
          <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-accent text-white px-6 py-2.5 rounded-lg memphis-border shadow-memphis font-label font-bold hover:-translate-y-0.5 transition-transform">
            <span className="material-symbols-outlined">add</span> Add Class
          </button>
        </div>

        {/* Class Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {classesList.map((cls) => (
            <div
              key={cls.id}
              className="bg-white rounded-2xl memphis-border shadow-memphis overflow-hidden flex flex-col cursor-pointer hover:-translate-y-1 transition-transform"
              onClick={() => setActiveClass(cls)}
            >
              {/* Card Banner */}
              <div className="h-24 relative border-b-2 border-dark" style={{ backgroundColor: cls.color }}>
                <div className="absolute -bottom-7 left-6 w-14 h-14 bg-white rounded-full memphis-border flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl" style={{ color: cls.color }}>{cls.icon}</span>
                </div>
              </div>
              {/* Card Body */}
              <div className="p-6 pt-10 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-1">
                  <h2 className="font-headline text-2xl font-bold text-dark">{cls.name}</h2>
                  <span className="font-label text-xs font-bold px-2 py-1 rounded memphis-border" style={{ backgroundColor: cls.color + '33', color: cls.color }}>{cls.time}</span>
                </div>
                <p className="font-label text-dark/70 mb-4 text-sm">{cls.teacher}</p>
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <div className="flex items-center gap-1.5 bg-secondary/30 border-2 border-dark rounded-md px-2.5 py-1 font-label font-bold text-xs text-dark shadow-[1px_1px_0px_0px_#2F2F2F]">
                    <span className="material-symbols-outlined text-[14px]">group</span>
                    {cls.students} Students
                  </div>
                  <div className="flex items-center gap-1.5 bg-primary/20 border-2 border-dark rounded-md px-2.5 py-1 font-label font-bold text-xs text-dark shadow-[1px_1px_0px_0px_#2F2F2F]">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    {cls.days}
                  </div>
                  <div className="flex items-center gap-1.5 bg-accent/20 border-2 border-dark rounded-md px-2.5 py-1 font-label font-bold text-xs text-dark shadow-[1px_1px_0px_0px_#2F2F2F]">
                    <span className="material-symbols-outlined text-[14px]">meeting_room</span>
                    {cls.room || 'TBD'}
                  </div>
                </div>
                
                <div className="mt-auto flex gap-3 pt-4 border-t-2 border-dark/10">
                  <button className="flex-1 border-2 border-primary text-primary font-label font-bold py-2 rounded-lg hover:bg-primary/10 transition-colors text-sm">View Details</button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingClass(cls)
                      setIsAddModalOpen(true)
                    }} 
                    className="px-3 border-2 border-dark rounded-lg hover:bg-dark hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">edit_note</span>
                  </button>
                  <button 
                    onClick={(e) => handleDeleteClass(cls.id, e)}
                    className="px-3 border-2 border-dark rounded-lg text-danger hover:bg-danger hover:border-danger hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <ClassModal cls={activeClass} onClose={() => setActiveClass(null)} />
      <AddClassModal 
        isOpen={isAddModalOpen} 
        onClose={() => {
          setIsAddModalOpen(false)
          setEditingClass(null)
        }} 
        onSuccess={fetchClasses} 
        editingClass={editingClass}
      />
    </div>
  )
}
