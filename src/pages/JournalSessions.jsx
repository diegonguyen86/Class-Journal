import { useState, useMemo } from 'react'
import TopNavBar from '../components/TopNavBar'

const sessions = [
  { id: 1, title: 'Session 1: Present Simple & Continuous', date: 'May 29', active: true },
  { id: 2, title: 'Session 2: Vocabulary - Family & Friends', date: 'May 28' },
  { id: 3, title: 'Session 3: Listening - Short Conversations', date: 'May 27' },
  { id: 4, title: 'Session 4: Past Simple vs Present Perfect', date: 'May 26' },
  { id: 5, title: 'Session 5: Speaking - Describing People', date: 'May 25' },
  { id: 6, title: 'Session 6: Reading - True/False/Not Given', date: 'May 24' },
]

const studentsList = ['Nguyễn An', 'Lê Bình', 'Trần Chi', 'Phạm Dũng']

const initialSkills = [
  { id: 'vocab',   name: 'Từ vựng',       icon: 'Aa',                 color: '#9B88ED', score: 8.5, comment: 'Nắm vững từ vựng cơ bản và từ vựng theo chủ đề. Sử dụng từ vựng phù hợp trong bài.' },
  { id: 'grammar', name: 'Ngữ pháp',      icon: 'menu_book',          color: '#71816D', score: 7.0, comment: 'Hiểu được các cấu trúc ngữ pháp cơ bản. Cần chú ý thêm thì hiện tại hoàn thành.' },
  { id: 'listen',  name: 'Kỹ năng nghe',  icon: 'headphones',         color: '#E27D60', score: 8.0, comment: 'Nghe hiểu tốt các ý chính và chi tiết. Cần luyện thêm dạng bài nghe điền thông tin.' },
  { id: 'speak',   name: 'Kỹ năng nói',   icon: 'record_voice_over',  color: '#5D87FF', score: 7.0, comment: 'Diễn đạt ý tưởng rõ ràng. Cần tự tin và mở rộng vốn từ khi trả lời.' },
  { id: 'read',    name: 'Kỹ năng đọc',   icon: 'import_contacts',    color: '#FFB800', score: 8.5, comment: 'Đọc hiểu tốt, nắm được ý chính và chi tiết. Cần chú ý tốc độ làm bài.' },
  { id: 'write',   name: 'Kỹ năng viết',  icon: 'edit',               color: '#FF69B4', score: 7.5, comment: 'Bài viết có bố cục rõ ràng, diễn đạt mạch lạc. Cần chú ý lỗi chính tả và ngữ pháp.' },
]

function GradeModal({ isOpen, onClose, studentName }) {
  const [skills, setSkills] = useState(initialSkills)

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
          <button className="px-5 py-2 font-label font-bold text-white bg-primary border-2 border-dark rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 shadow-memphis hover:-translate-y-px hover:shadow-memphis-lg active:translate-y-0.5 active:shadow-none text-sm">
            <span className="material-symbols-outlined text-[18px]">check</span>
            Lưu điểm
          </button>
        </div>
      </div>
    </div>
  )
}

function AddSessionModal({ isOpen, onClose }) {
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
              <input type="text" placeholder="e.g. Lesson 9: Advanced Algebra" className="w-full bg-white border-[2px] border-dark rounded-lg p-3 focus:outline-none focus:ring-0 focus:border-primary shadow-[2px_2px_0px_0px_rgba(47,47,47,0.2)] transition-shadow font-body text-dark placeholder:text-dark/40" />
            </div>
            <div className="space-y-2">
              <label className="block font-label font-bold text-dark text-sm uppercase tracking-wider">Date & Time</label>
              <div className="relative">
                <input type="datetime-local" className="w-full bg-white border-[2px] border-dark rounded-lg p-3 pl-10 focus:outline-none focus:ring-0 focus:border-primary shadow-[2px_2px_0px_0px_rgba(47,47,47,0.2)] font-body text-dark" />
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
                    <tr className="hover:bg-primary/5 transition-colors">
                      <td className="p-3 font-medium">Nguyễn Văn A</td>
                      <td className="p-3 text-center"><input type="radio" name="att_1" value="present" defaultChecked className="w-5 h-5 text-primary border-2 border-dark focus:ring-primary focus:ring-offset-1" /></td>
                      <td className="p-3 text-center"><input type="radio" name="att_1" value="late" className="w-5 h-5 text-accent border-2 border-dark focus:ring-accent" /></td>
                      <td className="p-3 text-center"><input type="radio" name="att_1" value="absent" className="w-5 h-5 text-danger border-2 border-dark focus:ring-danger" /></td>
                      <td className="p-3 text-center"><input type="radio" name="att_1" value="excused" className="w-5 h-5 text-secondary border-2 border-dark focus:ring-secondary" /></td>
                    </tr>
                    <tr className="hover:bg-primary/5 transition-colors">
                      <td className="p-3 font-medium">Trần Thị B</td>
                      <td className="p-3 text-center"><input type="radio" name="att_2" value="present" defaultChecked className="w-5 h-5 text-primary border-2 border-dark focus:ring-primary" /></td>
                      <td className="p-3 text-center"><input type="radio" name="att_2" value="late" className="w-5 h-5 text-accent border-2 border-dark focus:ring-accent" /></td>
                      <td className="p-3 text-center"><input type="radio" name="att_2" value="absent" className="w-5 h-5 text-danger border-2 border-dark focus:ring-danger" /></td>
                      <td className="p-3 text-center"><input type="radio" name="att_2" value="excused" className="w-5 h-5 text-secondary border-2 border-dark focus:ring-secondary" /></td>
                    </tr>
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
                    <tr className="hover:bg-primary/5 transition-colors">
                      <td className="p-3 font-medium">Nguyễn Văn A</td>
                      <td className="p-3 text-center"><input type="radio" name="hw_1" value="completed" defaultChecked className="w-5 h-5 text-primary border-2 border-dark focus:ring-primary" /></td>
                      <td className="p-3 text-center"><input type="radio" name="hw_1" value="partial" className="w-5 h-5 text-accent border-2 border-dark focus:ring-accent" /></td>
                      <td className="p-3 text-center"><input type="radio" name="hw_1" value="incomplete" className="w-5 h-5 text-danger border-2 border-dark focus:ring-danger" /></td>
                    </tr>
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
              <textarea className="w-full bg-white border-[2px] border-dark rounded-lg p-3 focus:outline-none focus:ring-0 focus:border-primary font-body text-dark resize-y min-h-[100px]" placeholder="What was covered today? Topics, exercises, materials used..." rows="4"></textarea>
            </div>

            {/* 5. General Observation */}
            <div className="space-y-2 bg-white/50 p-4 rounded-xl border-2 border-dark/20">
              <label className="block font-label font-bold text-dark text-sm uppercase tracking-wider">Nhận xét chung của buổi học</label>
              <textarea className="w-full bg-white border-[2px] border-dark rounded-lg p-3 focus:outline-none focus:ring-0 focus:border-primary font-body text-dark resize-y min-h-[100px]" placeholder="How did the class respond? Notable student interactions, struggles, or successes..." rows="4"></textarea>
            </div>

            {/* 6. Next Lesson Plan */}
            <div className="space-y-2 bg-white/50 p-4 rounded-xl border-2 border-dark/20">
              <label className="block font-label font-bold text-dark text-sm uppercase tracking-wider">Bài học buổi sau</label>
              <textarea className="w-full bg-white border-[2px] border-dark rounded-lg p-3 focus:outline-none focus:ring-0 focus:border-primary font-body text-dark resize-y min-h-[80px]" placeholder="Brief outline or goals for the next session..." rows="2"></textarea>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t-[3px] border-dark bg-white/80 flex flex-col-reverse sm:flex-row justify-end items-center gap-4 shrink-0">
          <button onClick={onClose} className="w-full sm:w-auto px-6 py-3 rounded-lg border-[2px] border-dark bg-secondary text-dark font-headline font-bold shadow-memphis-sm hover:bg-secondary/80 hover:-translate-y-px hover:shadow-none transition-all">
            Cancel
          </button>
          <button onClick={onClose} className="w-full sm:w-auto px-8 py-3 rounded-lg border-[3px] border-dark bg-primary text-white font-headline font-bold text-lg shadow-memphis hover:bg-primary/90 active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 group">
            Create Session
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function JournalSessions() {
  const [activeStudent, setActiveStudent] = useState(studentsList[0])
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false)
  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false)

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
                <span className="bg-secondary text-dark px-2 py-0.5 rounded-md font-label font-bold text-xs memphis-border">8 Sessions</span>
              </div>
              <button onClick={() => setIsAddSessionModalOpen(true)} className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center memphis-border hover:bg-dark transition-colors">
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {sessions.map((s) => (
                <div key={s.id} className={`p-4 rounded-xl memphis-border cursor-pointer relative overflow-hidden group transition-all ${s.active ? 'bg-secondary shadow-memphis' : 'bg-white hover:shadow-memphis hover:-translate-y-1'}`}>
                  {s.active && <div className="absolute -right-4 -top-4 w-12 h-12 bg-white/20 rounded-full rotate-45"></div>}
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
          <div className="w-[65%] bg-white rounded-2xl memphis-border flex flex-col h-[calc(100vh-220px)] overflow-hidden shadow-sm">
            {/* Sticky Toolbar */}
            <div className="sticky top-0 bg-[#F8F4EC] border-b-2 border-dark p-4 flex flex-col gap-4 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 overflow-x-auto pb-1">
                  {studentsList.map((name) => {
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
                    <div className="font-headline font-extrabold text-2xl text-dark">92%</div>
                  </div>
                  <div className="bg-secondary p-3 rounded-xl memphis-border flex flex-col items-center justify-center">
                    <div className="font-label text-[10px] font-bold text-dark mb-1 text-center uppercase tracking-wider">Tỉ lệ làm bài tập</div>
                    <div className="font-headline font-extrabold text-xl text-dark mb-1">85%</div>
                    <div className="w-full bg-white rounded-full h-1.5 memphis-border">
                      <div className="bg-accent h-full rounded-full border-r-2 border-dark" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div className="bg-accent p-3 rounded-xl memphis-border flex flex-col items-center justify-center text-white">
                    <div className="font-label text-[10px] font-bold mb-1 text-center uppercase tracking-wider">Điểm trung bình</div>
                    <div className="flex items-center gap-1">
                      <span className="font-headline font-extrabold text-2xl">8.5</span>
                      <span className="material-symbols-outlined text-xl">star</span>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <textarea className="w-full h-24 p-3 bg-white border-2 border-dark rounded-xl font-body text-sm focus:ring-0 focus:border-primary resize-none" placeholder={`Nhập nhận xét cá nhân cho ${activeStudent}...`}></textarea>
                  <div className="flex items-center gap-3 mt-3">
                    <button 
                      onClick={() => setIsGradeModalOpen(true)}
                      className="flex-1 bg-white text-dark px-4 py-2 rounded-lg font-label font-bold text-sm border-2 border-dark hover:shadow-memphis-sm active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-sm">edit_note</span> Nhập điểm
                    </button>
                    <button className="flex-1 bg-primary text-white px-4 py-2 rounded-lg font-label font-bold text-sm memphis-border hover:shadow-memphis-sm active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-sm">save</span> Lưu nhận xét riêng
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 p-8 overflow-y-auto font-label text-lg text-dark leading-relaxed outline-none" style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #C9B79C 31px, #C9B79C 32px)', lineHeight: '32px' }}>
              <h3 className="font-headline font-bold text-xl mb-4 bg-white inline-block px-2">Nội dung buổi học</h3>
              <p className="mb-8">Introduce the standard form of a quadratic equation: ax² + bx + c = 0. Demonstrate solving by factoring (quick review). Introduce the Quadratic Formula as the universal method.</p>
              
              <h3 className="font-headline font-bold text-xl mb-4 bg-white inline-block px-2">Nhận xét buổi học</h3>
              <div className="bg-background p-4 rounded-xl memphis-border mb-8 relative overflow-hidden group">
                <span className="absolute top-0 left-0 w-2 h-full bg-primary"></span>
                <div className="font-headline font-bold text-primary mb-1 flex items-center gap-2 leading-none">
                  <span className="material-symbols-outlined text-[20px]">assignment</span> Nhận xét chung của buổi học
                </div>
                <p className="font-body text-sm text-dark mt-2 leading-normal">Lớp học tích cực phát biểu, hầu hết học sinh nắm bắt được công thức tính delta nhưng vẫn còn nhầm lẫn về dấu.</p>
              </div>

              <h3 className="font-headline font-bold text-xl mb-4 bg-white inline-block px-2">Bài học buổi sau</h3>
              <p className="mb-4">Phần 2 của phương trình bậc hai: Giải quyết các bài toán đố thực tế (Word Problems).</p>
            </div>
          </div>
        </div>
      </main>

      <GradeModal 
        isOpen={isGradeModalOpen} 
        onClose={() => setIsGradeModalOpen(false)} 
        studentName={activeStudent}
      />
      <AddSessionModal isOpen={isAddSessionModalOpen} onClose={() => setIsAddSessionModalOpen(false)} />
    </div>
  )
}
