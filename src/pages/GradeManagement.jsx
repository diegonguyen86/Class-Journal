import { useState, useEffect, useMemo, useRef } from 'react'
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore'
import { db } from '../firebase'
import TopNavBar from '../components/TopNavBar'
import { ConfirmModal, AlertModal } from '../components/Dialogs'
import html2canvas from 'html2canvas'

const DEFAULT_SKILLS = [
  { 
    id: 'vocab',   
    name: 'Từ vựng',       
    icon: 'Aa',                 
    color: '#9B88ED', 
    score: 8.5, 
    comment: 'Nắm vững từ vựng cơ bản và từ vựng theo chủ đề. Sử dụng từ vựng phù hợp trong bài.' 
  },
  { 
    id: 'grammar', 
    name: 'Ngữ pháp',      
    icon: 'menu_book',          
    color: '#10B981', 
    score: 7.0, 
    comment: 'Hiểu được các cấu trúc ngữ pháp cơ bản. Cần chú ý thêm thì hiện tại hoàn thành.' 
  },
  { 
    id: 'listen',  
    name: 'Kỹ năng nghe',  
    icon: 'headphones',         
    color: '#E27D60', 
    score: 8.0, 
    comment: 'Nghe hiểu tốt các ý chính và chi tiết. Cần luyện thêm dạng bài nghe điền thông tin.' 
  },
  { 
    id: 'speak',   
    name: 'Kỹ năng nói',   
    icon: 'record_voice_over',  
    color: '#5D87FF', 
    score: 7.0, 
    comment: 'Diễn đạt ý tưởng rõ ràng. Cần tự tin và mở rộng vốn từ khi trả lời.' 
  },
  { 
    id: 'read',    
    name: 'Kỹ năng đọc',   
    icon: 'import_contacts',    
    color: '#FFB800', 
    score: 8.5, 
    comment: 'Đọc hiểu tốt, nắm được ý chính và chi tiết. Cần chú ý tốc độ làm bài.' 
  },
  { 
    id: 'write',   
    name: 'Kỹ năng viết',  
    icon: 'edit',               
    color: '#FF69B4', 
    score: 7.5, 
    comment: 'Bài viết có bố cục rõ ràng, diễn đạt mạch lạc. Cần chú ý lỗi chính tả và ngữ pháp.' 
  },
]

const COMMON_TEST_NAMES = [
  'Kiểm tra 15 phút – Tiếng Anh',
  'Kiểm tra 15 phút – Từ vựng & Ngữ pháp',
  'Kiểm tra 45 phút – Định kỳ số 1',
  'Kiểm tra 45 phút – Định kỳ số 2',
  'Kiểm tra giữa kỳ 1 – Tiếng Anh',
  'Kiểm tra cuối kỳ 1 – Tiếng Anh',
  'Kiểm tra giữa kỳ 2 – Tiếng Anh',
  'Kiểm tra cuối kỳ 2 – Tiếng Anh',
  'Bài thi thử chuyển cấp / Luyện đề',
]

// Modal/View Nhập Điểm Bài Kiểm Tra (chuẩn giao diện Ảnh 2)
function AssessmentEntryModal({ 
  isOpen, 
  onClose, 
  onSave, 
  classesList, 
  initialClassId, 
  initialStudentName, 
  editingAssessment 
}) {
  const [selectedClassId, setSelectedClassId] = useState(initialClassId || '')
  const [selectedStudentName, setSelectedStudentName] = useState(initialStudentName || '')
  const [testName, setTestName] = useState('Kiểm tra giữa kỳ 1 – Tiếng Anh')
  const [testDate, setTestDate] = useState(() => new Date().toISOString().split('T')[0])
  const [skills, setSkills] = useState(DEFAULT_SKILLS)
  const [generalComment, setGeneralComment] = useState(
    'Học sinh có nền tảng kiến thức tốt và thái độ học tập nghiêm túc. Em đã thể hiện khả năng hiểu bài ổn định ở hầu hết các kỹ năng. Cần tiếp tục củng cố ngữ pháp và luyện nói để tự tin hơn.'
  )
  const [improvementPlan, setImprovementPlan] = useState(
    '• Học và ghi nhớ thêm từ vựng theo chủ đề mỗi ngày.\n• Làm thêm bài tập ngữ pháp, đặc biệt là thì hiện tại hoàn thành và câu điều kiện.\n• Luyện nghe các bài hội thoại ngắn và ghi chú ý chính.\n• Thực hành nói bằng cách mô tả tranh, kể chuyện hoặc thuyết trình ngắn.\n• Viết đoạn văn mỗi ngày về một chủ đề quen thuộc.'
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentClass = useMemo(() => {
    return classesList.find(c => c.id === selectedClassId) || classesList[0] || null
  }, [classesList, selectedClassId])

  const studentsOfClass = useMemo(() => {
    return currentClass?.studentList || []
  }, [currentClass])

  useEffect(() => {
    if (isOpen) {
      if (editingAssessment) {
        setSelectedClassId(editingAssessment.classId || '')
        setSelectedStudentName(editingAssessment.studentName || '')
        setTestName(editingAssessment.testName || '')
        setTestDate(editingAssessment.testDate || new Date().toISOString().split('T')[0])
        setSkills(editingAssessment.skills || DEFAULT_SKILLS)
        setGeneralComment(editingAssessment.generalComment || '')
        setImprovementPlan(editingAssessment.improvementPlan || '')
      } else {
        const clsId = initialClassId || (classesList.length > 0 ? classesList[0].id : '')
        setSelectedClassId(clsId)
        const targetCls = classesList.find(c => c.id === clsId)
        if (initialStudentName) {
          setSelectedStudentName(initialStudentName)
        } else if (targetCls?.studentList?.length > 0) {
          setSelectedStudentName(targetCls.studentList[0].name)
        }
        setTestName('Kiểm tra giữa kỳ 1 – Tiếng Anh')
        setTestDate(new Date().toISOString().split('T')[0])
        setSkills(DEFAULT_SKILLS)
        setGeneralComment(
          'Học sinh có nền tảng kiến thức tốt và thái độ học tập nghiêm túc. Em đã thể hiện khả năng hiểu bài ổn định ở hầu hết các kỹ năng. Cần tiếp tục củng cố ngữ pháp và luyện nói để tự tin hơn.'
        )
        setImprovementPlan(
          '• Học và ghi nhớ thêm từ vựng theo chủ đề mỗi ngày.\n• Làm thêm bài tập ngữ pháp, đặc biệt là thì hiện tại hoàn thành và câu điều kiện.\n• Luyện nghe các bài hội thoại ngắn và ghi chú ý chính.\n• Thực hành nói bằng cách mô tả tranh, kể chuyện hoặc thuyết trình ngắn.\n• Viết đoạn văn mỗi ngày về một chủ đề quen thuộc.'
        )
      }
    }
  }, [isOpen, editingAssessment, initialClassId, initialStudentName, classesList])

  const handleClassChange = (newClsId) => {
    setSelectedClassId(newClsId)
    const cls = classesList.find(c => c.id === newClsId)
    if (cls?.studentList?.length > 0) {
      setSelectedStudentName(cls.studentList[0].name)
    } else {
      setSelectedStudentName('')
    }
  }

  const updateSkillScore = (id, newScore) => {
    setSkills(prev => prev.map(s => s.id === id ? { ...s, score: parseFloat(newScore) || 0 } : s))
  }

  const updateSkillComment = (id, newComment) => {
    setSkills(prev => prev.map(s => s.id === id ? { ...s, comment: newComment } : s))
  }

  // Tính điểm tổng bài trung bình
  const totalScore = useMemo(() => {
    if (!skills || skills.length === 0) return '0.0'
    const sum = skills.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0)
    return (sum / skills.length).toFixed(1)
  }, [skills])

  const handleSave = async (status = 'published') => {
    if (!selectedClassId) {
      alert('Vui lòng chọn lớp học!')
      return
    }
    if (!selectedStudentName) {
      alert('Vui lòng chọn học sinh!')
      return
    }
    if (!testName.trim()) {
      alert('Vui lòng nhập tên bài kiểm tra!')
      return
    }

    setIsSubmitting(true)
    try {
      const assessmentData = {
        classId: selectedClassId,
        className: currentClass?.name || '',
        studentName: selectedStudentName,
        testName: testName.trim(),
        testDate,
        skills,
        totalScore: Number(totalScore),
        generalComment,
        improvementPlan,
        status,
        updatedAt: new Date().toISOString()
      }

      await onSave(assessmentData, editingAssessment?.id)
      onClose()
    } catch (error) {
      console.error(error)
      alert('Đã xảy ra lỗi khi lưu bài kiểm tra.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 overflow-y-auto backdrop-blur-sm bg-dark/70">
      <div className="relative bg-white w-full max-w-6xl rounded-2xl memphis-border-thick shadow-memphis-lg flex flex-col my-auto max-h-[96vh] overflow-hidden animate-[slideUp_0.2s_ease-out]">
        
        {/* Header với Illustration như Ảnh 2 */}
        <div className="p-4 sm:p-6 bg-white border-b-2 border-dark flex justify-between items-center relative shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-blue-50 border-2 border-primary/30 flex items-center justify-center text-primary shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-3xl sm:text-4xl text-[#0068FF]">assignment</span>
            </div>
            <div>
              <h2 className="font-headline font-black text-xl sm:text-2xl text-dark uppercase tracking-tight flex items-center gap-2">
                NHẬP ĐIỂM BÀI KIỂM TRA
              </h2>
              <p className="font-body text-xs sm:text-sm text-dark/70 mt-0.5">
                Nhập điểm và đánh giá kết quả bài kiểm tra của học sinh
              </p>
            </div>
          </div>

          {/* Decorative illustration icon + Close button */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#F8F4EC] rounded-xl border border-dark/10">
              <span className="material-symbols-outlined text-primary text-xl">psychology</span>
              <span className="font-label font-bold text-xs text-dark/80">Đánh giá 6 kỹ năng chuẩn</span>
            </div>
            <button 
              onClick={onClose} 
              className="w-10 h-10 rounded-full border-2 border-dark/20 hover:border-dark flex items-center justify-center hover:bg-dark hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* Modal Body: Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 bg-[#FAFAF8]">
          
          {/* Top Form Controls: Mã lớp, Chọn học sinh, Tên bài kiểm tra, Ngày kiểm tra */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl memphis-border shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Mã lớp */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label font-bold text-xs text-dark uppercase tracking-wider">Mã lớp</label>
              <div className="relative">
                <select 
                  value={selectedClassId} 
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="w-full bg-[#F8F4EC] border-2 border-dark/30 rounded-xl py-2.5 px-3 font-body text-sm font-bold text-dark focus:outline-none focus:border-primary focus:bg-white transition-all cursor-pointer"
                >
                  {classesList.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                  {classesList.length === 0 && <option value="">Chưa có lớp học</option>}
                </select>
              </div>
            </div>

            {/* Chọn học sinh */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label font-bold text-xs text-dark uppercase tracking-wider">Chọn học sinh</label>
              <div className="relative">
                <select 
                  value={selectedStudentName} 
                  onChange={(e) => setSelectedStudentName(e.target.value)}
                  className="w-full bg-[#F8F4EC] border-2 border-dark/30 rounded-xl py-2.5 px-3 font-body text-sm font-bold text-dark focus:outline-none focus:border-primary focus:bg-white transition-all cursor-pointer"
                >
                  {studentsOfClass.map(stu => (
                    <option key={stu.id || stu.name} value={stu.name}>
                      👤 {stu.name}
                    </option>
                  ))}
                  {studentsOfClass.length === 0 && <option value="">Không có học sinh trong lớp</option>}
                </select>
              </div>
            </div>

            {/* Tên bài kiểm tra (cho phép gõ tự do hoặc chọn gợi ý) */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label font-bold text-xs text-dark uppercase tracking-wider">Tên bài kiểm tra</label>
              <div className="relative">
                <input 
                  type="text"
                  list="test-name-suggestions"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="Nhập hoặc chọn tên bài test..."
                  className="w-full bg-[#F8F4EC] border-2 border-dark/30 rounded-xl py-2.5 px-3 font-body text-sm font-medium text-dark focus:outline-none focus:border-primary focus:bg-white transition-all"
                />
                <datalist id="test-name-suggestions">
                  {COMMON_TEST_NAMES.map((name, i) => (
                    <option key={i} value={name} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Ngày kiểm tra */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label font-bold text-xs text-dark uppercase tracking-wider">Ngày kiểm tra</label>
              <div className="relative">
                <input 
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  className="w-full bg-[#F8F4EC] border-2 border-dark/30 rounded-xl py-2.5 px-3 font-body text-sm font-bold text-dark focus:outline-none focus:border-primary focus:bg-white transition-all cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Bảng Kỹ Năng & Nhận Xét Từng Kỹ Năng (Chuẩn layout Ảnh 2) */}
          <div className="bg-white rounded-2xl memphis-border shadow-sm overflow-hidden">
            {/* Header Table */}
            <div className="grid grid-cols-12 bg-[#F8F4EC] border-b-2 border-dark p-3.5 font-headline font-bold text-xs text-dark uppercase tracking-wider">
              <div className="col-span-12 sm:col-span-3 lg:col-span-2">Kỹ năng</div>
              <div className="col-span-12 sm:col-span-3 lg:col-span-2 text-left sm:text-center">Điểm thành phần (/ 10)</div>
              <div className="col-span-12 sm:col-span-6 lg:col-span-8">Nhận xét từng kỹ năng</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y-2 divide-dark/10">
              {skills.map((skill) => (
                <div key={skill.id} className="grid grid-cols-12 p-3 sm:p-4 items-center gap-3 hover:bg-[#FAF9F5] transition-colors">
                  {/* Cột 1: Kỹ năng */}
                  <div className="col-span-12 sm:col-span-3 lg:col-span-2 flex items-center gap-3">
                    <div 
                      className="w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 shadow-sm"
                      style={{ backgroundColor: `${skill.color}25`, borderColor: skill.color, color: skill.color }}
                    >
                      {skill.id === 'vocab' ? (
                        <span className="font-headline font-black text-sm">Aa</span>
                      ) : (
                        <span className="material-symbols-outlined text-lg">{skill.icon}</span>
                      )}
                    </div>
                    <span className="font-headline font-bold text-sm text-dark">{skill.name}</span>
                  </div>

                  {/* Cột 2: Điểm thành phần (/ 10) */}
                  <div className="col-span-12 sm:col-span-3 lg:col-span-2 flex sm:justify-center">
                    <select
                      value={skill.score}
                      onChange={(e) => updateSkillScore(skill.id, e.target.value)}
                      className="w-24 sm:w-28 text-center bg-[#F8F4EC] border-2 border-dark/30 rounded-xl py-1.5 px-2 font-headline font-black text-base text-dark focus:outline-none focus:border-primary focus:bg-white cursor-pointer shadow-sm"
                    >
                      {Array.from({ length: 21 }, (_, i) => (i * 0.5).toFixed(1)).map(val => (
                        <option key={val} value={val}>{val}</option>
                      ))}
                    </select>
                  </div>

                  {/* Cột 3: Nhận xét từng kỹ năng */}
                  <div className="col-span-12 sm:col-span-6 lg:col-span-8">
                    <textarea
                      rows={2}
                      value={skill.comment}
                      onChange={(e) => updateSkillComment(skill.id, e.target.value)}
                      placeholder={`Nhận xét về ${skill.name.toLowerCase()} của học sinh...`}
                      className="w-full bg-[#F8F4EC]/60 border border-dark/20 hover:border-dark/40 rounded-xl p-2.5 font-body text-xs sm:text-sm text-dark focus:outline-none focus:border-primary focus:bg-white transition-all resize-y"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Total Score Row */}
            <div className="p-4 sm:p-5 bg-blue-50/60 border-t-2 border-dark flex items-center justify-between">
              <div className="font-headline font-black text-sm sm:text-base text-primary uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">grade</span>
                ĐIỂM TỔNG BÀI (/ 10)
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-label text-dark/60 hidden sm:inline-block italic">* Tự động tính trung bình cộng</span>
                <div className="bg-white border-2 border-dark rounded-xl px-5 py-1.5 shadow-memphis-sm">
                  <span className="font-headline font-black text-2xl sm:text-3xl text-[#0068FF]">{totalScore}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2 Bottom Cards: Nhận xét chung & Định hướng cải thiện */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nhận xét chung */}
            <div className="bg-white p-5 rounded-2xl memphis-border shadow-sm flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5 text-primary">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                  <span className="material-symbols-outlined text-lg">chat</span>
                </div>
                <h3 className="font-headline font-bold text-sm sm:text-base text-dark uppercase tracking-wide">
                  NHẬN XÉT CHUNG
                </h3>
              </div>
              <textarea
                rows={5}
                value={generalComment}
                onChange={(e) => setGeneralComment(e.target.value)}
                placeholder="Nhập đánh giá tổng quan về thái độ, sự tiến bộ và năng lực của học sinh..."
                className="w-full bg-[#F8F4EC]/60 border border-dark/20 rounded-xl p-3 font-body text-sm text-dark focus:outline-none focus:border-primary focus:bg-white transition-all resize-y leading-relaxed"
              />
            </div>

            {/* Định hướng cải thiện */}
            <div className="bg-white p-5 rounded-2xl memphis-border shadow-sm flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5 text-accent">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20">
                  <span className="material-symbols-outlined text-lg">adjust</span>
                </div>
                <h3 className="font-headline font-bold text-sm sm:text-base text-dark uppercase tracking-wide">
                  ĐỊNH HƯỚNG CẢI THIỆN
                </h3>
              </div>
              <textarea
                rows={5}
                value={improvementPlan}
                onChange={(e) => setImprovementPlan(e.target.value)}
                placeholder="Gợi ý các bước tự rèn luyện ở nhà để học sinh cải thiện kết quả..."
                className="w-full bg-[#F8F4EC]/60 border border-dark/20 rounded-xl p-3 font-body text-sm text-dark focus:outline-none focus:border-primary focus:bg-white transition-all resize-y leading-relaxed"
              />
            </div>
          </div>

        </div>

        {/* Modal Footer Buttons */}
        <div className="p-4 sm:p-5 bg-white border-t-2 border-dark flex justify-end items-center gap-3 shrink-0">
          <button 
            type="button"
            onClick={onClose} 
            className="px-5 py-2.5 font-label font-bold text-dark/70 hover:text-dark hover:bg-dark/5 rounded-xl transition-colors text-sm"
          >
            Hủy
          </button>
          <button 
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave('draft')}
            className="px-5 py-2.5 font-label font-bold text-dark bg-white border-2 border-dark rounded-xl shadow-memphis-sm hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">save_as</span>
            Lưu nháp
          </button>
          <button 
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave('published')} 
            className="px-6 py-2.5 font-label font-bold text-white bg-primary memphis-border rounded-xl shadow-memphis hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all flex items-center gap-2 text-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="material-symbols-outlined animate-spin text-base">sync</span>
            ) : (
              <span className="material-symbols-outlined text-base">check</span>
            )}
            Lưu điểm
          </button>
        </div>

      </div>
    </div>
  )
}

// Modal Xem Trước & Xuất Báo Cáo Gửi Phụ Huynh (Share Modal qua html2canvas & Zalo)
function AssessmentShareModal({ isOpen, onClose, assessment, studentInfo, showAlert }) {
  const [isExporting, setIsExporting] = useState(false)
  const reportRef = useRef(null)

  if (!isOpen || !assessment) return null

  const parentPhone = studentInfo?.phone || ''

  const handleShareZalo = async () => {
    setIsExporting(true)
    try {
      if (reportRef.current) {
        const canvas = await html2canvas(reportRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#F8F4EC',
        })
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Phieu_Diem_${assessment.studentName.replace(/\s+/g, '_')}_${assessment.testDate}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }

      if (parentPhone) {
        window.open(`https://zalo.me/${parentPhone.replace(/\D/g, '')}`, '_blank')
      } else {
        window.open('https://chat.zalo.me/', '_blank')
      }
      onClose()
    } catch (err) {
      console.error(err)
      showAlert('Lỗi khi chụp ảnh báo cáo!', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 overflow-y-auto backdrop-blur-sm bg-dark/75">
      <div className="relative bg-white w-full max-w-4xl rounded-2xl memphis-border-thick shadow-memphis-lg flex flex-col my-auto max-h-[95vh] overflow-hidden animate-[slideUp_0.2s_ease-out]">
        
        {/* Header Modal */}
        <div className="p-4 sm:p-5 bg-white border-b-2 border-dark flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 border-2 border-accent flex items-center justify-center text-accent">
              <span className="material-symbols-outlined text-2xl">preview</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg text-dark">Bản Xem Trước Báo Cáo Gửi Phụ Huynh</h3>
              <p className="font-label text-xs text-dark/60">Học sinh: {assessment.studentName} · {assessment.className}</p>
            </div>
          </div>
          
          <button 
            onClick={onClose} 
            className="w-9 h-9 rounded-full border-2 border-dark/20 hover:border-dark flex items-center justify-center hover:bg-dark hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Scrollable Preview Area */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-[#ECE5D8] flex justify-center">
          
          {/* Card to Capture */}
          <div 
            ref={reportRef} 
            className="bg-[#F8F4EC] p-6 sm:p-10 font-body text-dark flex flex-col gap-6 w-full max-w-[800px] rounded-2xl memphis-border shadow-memphis-lg relative overflow-hidden"
            style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #C9B79C 31px, #C9B79C 32px)', lineHeight: '32px' }}
          >
            {/* Header Card */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 bg-white p-6 rounded-2xl border-4 border-dark shadow-[6px_6px_0px_0px_rgba(47,47,47,1)] relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-full border-4 border-dark flex items-center justify-center font-headline font-black text-2xl sm:text-3xl text-white shrink-0">
                  {assessment.studentName?.split(' ').map(n=>n[0]).join('')}
                </div>
                <div>
                  <h2 className="font-headline font-black text-2xl sm:text-3xl text-dark tracking-tight leading-none mb-1">
                    PHIẾU KẾT QUẢ KIỂM TRA
                  </h2>
                  <p className="font-headline font-bold text-lg text-primary">{assessment.studentName} · {assessment.className}</p>
                  <p className="font-label text-xs font-bold text-dark/70 mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">calendar_today</span> Ngày: {assessment.testDate} · Bài test: {assessment.testName}
                  </p>
                </div>
              </div>

              {/* Total Score Badge */}
              <div className="bg-[#FAF9F5] border-4 border-dark rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center min-w-[120px] shadow-[3px_3px_0px_0px_rgba(47,47,47,1)]">
                <span className="font-headline font-bold text-[10px] text-dark/70 uppercase tracking-widest">ĐIỂM TỔNG</span>
                <span className="font-headline font-black text-4xl text-[#0068FF] mt-0.5">{assessment.totalScore}</span>
                <span className="font-label text-[10px] font-bold text-primary mt-0.5">Thang điểm 10</span>
              </div>
            </div>

            {/* Bảng điểm 6 kỹ năng */}
            <div className="bg-white rounded-2xl border-4 border-dark shadow-[6px_6px_0px_0px_rgba(47,47,47,1)] overflow-hidden relative z-10">
              <div className="bg-secondary/20 p-3.5 border-b-2 border-dark font-headline font-bold text-xs uppercase tracking-wide flex justify-between">
                <span>Chi tiết 6 kỹ năng</span>
                <span>Điểm số</span>
              </div>
              <div className="divide-y-2 divide-dark/10">
                {assessment.skills?.map(skill => (
                  <div key={skill.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: skill.color }}></span>
                        <span className="font-headline font-bold text-sm text-dark">{skill.name}</span>
                      </div>
                      <p className="text-xs text-dark/80 mt-1 leading-normal pl-4">{skill.comment}</p>
                    </div>
                    <div className="font-headline font-black text-lg text-dark pl-4 sm:pl-0 sm:text-right shrink-0">
                      {skill.score} / 10
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nhận xét chung & Định hướng cải thiện */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              <div className="bg-white p-5 rounded-2xl border-4 border-dark shadow-[4px_4px_0px_0px_rgba(47,47,47,1)]">
                <div className="font-headline font-bold text-sm text-primary mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">chat</span> NHẬN XÉT CỦA GIÁO VIÊN
                </div>
                <p className="text-xs sm:text-sm text-dark leading-relaxed whitespace-pre-wrap">{assessment.generalComment || 'Chưa có nhận xét.'}</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border-4 border-dark shadow-[4px_4px_0px_0px_rgba(47,47,47,1)]">
                <div className="font-headline font-bold text-sm text-accent mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">adjust</span> ĐỊNH HƯỚNG CẢI THIỆN
                </div>
                <p className="text-xs sm:text-sm text-dark leading-relaxed whitespace-pre-wrap">{assessment.improvementPlan || 'Chưa có định hướng.'}</p>
              </div>
            </div>

            {/* Footer ký tên */}
            <div className="flex justify-between items-center text-xs font-label text-dark/60 border-t-2 border-dark/20 pt-4 relative z-10">
              <span>Sổ Tay Lớp Học · Class Journal</span>
              <span className="font-bold text-dark">Giáo viên phụ trách môn Tiếng Anh</span>
            </div>

          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 sm:p-5 bg-white border-t-2 border-dark flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
          <div className="font-label text-xs text-dark/70">
            {parentPhone ? (
              <span>SĐT Phụ huynh: <strong>{parentPhone}</strong> (Sẽ mở Zalo trực tiếp)</span>
            ) : (
              <span className="text-accent font-bold">Chưa có SĐT phụ huynh trong hồ sơ học sinh</span>
            )}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 font-label font-bold text-dark/70 hover:bg-dark/5 rounded-xl text-sm"
            >
              Đóng
            </button>
            <button
              disabled={isExporting}
              onClick={handleShareZalo}
              className="flex-1 sm:flex-none bg-primary text-white px-6 py-2.5 rounded-xl font-headline font-bold text-sm memphis-border shadow-memphis-sm hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all flex items-center justify-center gap-2"
            >
              {isExporting ? <span className="material-symbols-outlined animate-spin text-base">sync</span> : <span className="material-symbols-outlined text-base">photo_camera</span>}
              Tải ảnh & Gửi Zalo
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

// Trang chính: Quản lý Bảng Điểm & Đánh Giá
export default function GradeManagement() {
  const [classesList, setClassesList] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [activeStudent, setActiveStudent] = useState('')
  const [assessmentsList, setAssessmentsList] = useState([])
  const [loading, setLoading] = useState(true)

  // Modals state
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false)
  const [editingAssessment, setEditingAssessment] = useState(null)
  const [shareAssessment, setShareAssessment] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null })
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, message: '', type: 'info' })

  const showAlert = (message, type = 'info') => {
    setAlertDialog({ isOpen: true, message, type })
  }

  // Tải danh sách lớp, bài kiểm tra và điểm cũ từ journalSessions
  const fetchData = async () => {
    setLoading(true)
    try {
      const [classesSnap, assessmentsSnap, sessionsSnap] = await Promise.all([
        getDocs(collection(db, 'classes')),
        getDocs(collection(db, 'assessments')),
        getDocs(collection(db, 'journalSessions'))
      ])

      const classesData = classesSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      const assessmentsData = assessmentsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      const sessionsData = sessionsSnap.docs.map(d => ({ id: d.id, ...d.data() }))

      // Quét các điểm cũ đã từng nhập trong journalSessions
      const legacyGrades = []
      sessionsData.forEach(session => {
        if (session.grades && typeof session.grades === 'object') {
          Object.entries(session.grades).forEach(([studentName, gradeObj]) => {
            if (gradeObj && (gradeObj.totalScore !== undefined || (Array.isArray(gradeObj.details) && gradeObj.details.length > 0))) {
              // Kiểm tra xem đã được chuyển sang assessments chưa
              const alreadyMigrated = assessmentsData.some(
                a => a.legacySessionId === session.id && a.studentName === studentName
              )
              if (!alreadyMigrated) {
                legacyGrades.push({
                  id: `legacy_${session.id}_${studentName}`,
                  isLegacy: true,
                  legacySessionId: session.id,
                  sessionTitle: session.title,
                  classId: session.classId,
                  className: classesData.find(c => c.id === session.classId)?.name || '',
                  studentName: studentName,
                  testName: gradeObj.testName?.trim() || `Điểm từ buổi học (${session.title || session.date || 'Chưa đặt tên'})`,
                  testDate: gradeObj.testDate || session.date?.split(' ')[0] || new Date().toISOString().split('T')[0],
                  skills: Array.isArray(gradeObj.details) && gradeObj.details.length > 0 ? gradeObj.details : DEFAULT_SKILLS,
                  totalScore: Number(gradeObj.totalScore) || 0,
                  generalComment: session.observation || '',
                  improvementPlan: session.nextPlan || '',
                  status: 'published'
                })
              }
            }
          })
        }
      })

      setClassesList(classesData)
      setAssessmentsList([...assessmentsData, ...legacyGrades])

      if (classesData.length > 0) {
        const defaultClass = selectedClass 
          ? (classesData.find(c => c.id === selectedClass.id) || classesData[0])
          : classesData[0]
        setSelectedClass(defaultClass)
        
        if (defaultClass.studentList && defaultClass.studentList.length > 0) {
          if (!activeStudent || !defaultClass.studentList.find(s => s.name === activeStudent)) {
            setActiveStudent(defaultClass.studentList[0].name)
          }
        } else {
          setActiveStudent('')
        }
      }
    } catch (err) {
      console.error(err)
      showAlert('Lỗi khi tải dữ liệu bảng điểm!', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Đổi lớp học
  const handleSelectClass = (clsId) => {
    const cls = classesList.find(c => c.id === clsId)
    setSelectedClass(cls)
    if (cls?.studentList?.length > 0) {
      setActiveStudent(cls.studentList[0].name)
    } else {
      setActiveStudent('')
    }
  }

  // Lọc bài kiểm tra của học sinh đang chọn
  const studentAssessments = useMemo(() => {
    if (!selectedClass || !activeStudent) return []
    return assessmentsList
      .filter(a => a.classId === selectedClass.id && a.studentName === activeStudent)
      .sort((a, b) => new Date(b.testDate) - new Date(a.testDate))
  }, [assessmentsList, selectedClass, activeStudent])

  // Tính điểm trung bình tất cả bài kiểm tra của học sinh
  const studentOverallAvg = useMemo(() => {
    if (studentAssessments.length === 0) return null
    const sum = studentAssessments.reduce((acc, curr) => acc + (Number(curr.totalScore) || 0), 0)
    return (sum / studentAssessments.length).toFixed(1)
  }, [studentAssessments])

  // Học sinh hiện tại
  const currentStudentObj = useMemo(() => {
    return selectedClass?.studentList?.find(s => s.name === activeStudent) || null
  }, [selectedClass, activeStudent])

  // Lưu bài kiểm tra (Thêm mới, Cập nhật, hoặc Phân loại từ điểm cũ)
  const handleSaveAssessment = async (data, id) => {
    try {
      if (id && !String(id).startsWith('legacy_')) {
        await updateDoc(doc(db, 'assessments', id), data)
        setAssessmentsList(prev => prev.map(a => a.id === id ? { ...a, ...data } : a))
        showAlert('Cập nhật điểm kiểm tra thành công!', 'success')
      } else {
        // Lưu mới vào collection assessments (kể cả chuyển từ điểm cũ sang)
        if (editingAssessment?.isLegacy) {
          data.legacySessionId = editingAssessment.legacySessionId
        }
        data.createdAt = new Date().toISOString()
        const docRef = await addDoc(collection(db, 'assessments'), data)
        
        // Cập nhật lại danh sách: bỏ item legacy cũ và thêm bản ghi chính thức mới
        setAssessmentsList(prev => [
          { id: docRef.id, ...data },
          ...prev.filter(a => a.id !== id)
        ])
        showAlert('Đã lưu bài kiểm tra chính thức thành công!', 'success')
      }
    } catch (err) {
      console.error(err)
      showAlert('Lỗi khi lưu điểm vào Firestore!', 'error')
      throw err
    }
  }

  // Xóa bài kiểm tra
  const handleDeleteAssessment = async () => {
    const id = confirmDelete.id
    setConfirmDelete({ isOpen: false, id: null })
    if (!id) return
    try {
      if (!String(id).startsWith('legacy_')) {
        await deleteDoc(doc(db, 'assessments', id))
      }
      setAssessmentsList(prev => prev.filter(a => a.id !== id))
      showAlert('Đã xóa bài kiểm tra.', 'info')
    } catch (err) {
      console.error(err)
      showAlert('Lỗi khi xóa bài kiểm tra!', 'error')
    }
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#FAFAF8] min-h-screen">
      <TopNavBar title="Bảng Điểm & Đánh Giá Bài Kiểm Tra" />

      <main className="p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Thanh điều khiển: Chọn Lớp, Học sinh & Nút Nhập Điểm Mới */}
        <div className="bg-white p-5 rounded-2xl memphis-border shadow-sm flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Bộ chọn lớp */}
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">school</span>
              <select
                value={selectedClass?.id || ''}
                onChange={(e) => handleSelectClass(e.target.value)}
                className="bg-[#F8F4EC] border-2 border-dark rounded-xl px-3.5 py-2 font-headline font-bold text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary shadow-memphis-sm cursor-pointer"
              >
                {classesList.map(cls => (
                  <option key={cls.id} value={cls.id}>Lớp: {cls.name}</option>
                ))}
                {classesList.length === 0 && <option value="">Chưa có lớp</option>}
              </select>
            </div>

            {/* Bộ chọn học sinh */}
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-xl">person</span>
              <select
                value={activeStudent}
                onChange={(e) => setActiveStudent(e.target.value)}
                className="bg-[#F8F4EC] border-2 border-dark rounded-xl px-3.5 py-2 font-headline font-bold text-sm text-dark focus:outline-none focus:ring-2 focus:ring-primary shadow-memphis-sm cursor-pointer"
              >
                {selectedClass?.studentList?.map(s => (
                  <option key={s.id || s.name} value={s.name}>Học sinh: {s.name}</option>
                ))}
                {(!selectedClass?.studentList || selectedClass.studentList.length === 0) && (
                  <option value="">Lớp này chưa có học sinh</option>
                )}
              </select>
            </div>
          </div>

          {/* Nút Nhập điểm bài kiểm tra mới */}
          <button
            onClick={() => {
              setEditingAssessment(null)
              setIsEntryModalOpen(true)
            }}
            disabled={!selectedClass || !activeStudent}
            className="bg-primary text-white px-5 py-2.5 rounded-xl font-headline font-bold text-sm memphis-border shadow-memphis hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-xl">post_add</span>
            + Nhập điểm bài kiểm tra
          </button>
        </div>

        {/* Danh sách học sinh dạng Pills để bấm chọn nhanh */}
        {selectedClass?.studentList && selectedClass.studentList.length > 0 && (
          <div className="bg-white p-4 rounded-2xl memphis-border shadow-sm flex items-center gap-3 overflow-x-auto">
            <span className="font-label font-bold text-xs text-dark/60 uppercase tracking-wider shrink-0 mr-1">
              Danh sách:
            </span>
            {selectedClass.studentList.map(stu => {
              const isActive = stu.name === activeStudent
              return (
                <button
                  key={stu.id || stu.name}
                  onClick={() => setActiveStudent(stu.name)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-label font-bold text-xs transition-all shrink-0 ${
                    isActive 
                      ? 'bg-secondary memphis-border shadow-memphis-sm text-dark scale-105' 
                      : 'bg-[#F8F4EC] text-dark/70 hover:text-dark hover:bg-secondary/40 border border-dark/20'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                    {stu.name.split(' ').slice(-1)[0][0]}
                  </span>
                  {stu.name}
                </button>
              )
            })}
          </div>
        )}

        {/* Thông tin tổng kết của học sinh đang chọn */}
        {activeStudent && (
          <div className="bg-white p-6 rounded-2xl memphis-border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary memphis-border flex items-center justify-center text-white font-headline font-black text-2xl shadow-memphis-sm">
                {activeStudent.split(' ').map(n=>n[0]).join('')}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-headline font-black text-2xl text-dark">{activeStudent}</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary/50 font-label text-xs font-bold text-dark border border-dark/20">
                    {selectedClass?.name}
                  </span>
                </div>
                <p className="font-body text-xs text-dark/60 mt-1 flex items-center gap-3">
                  <span>Phụ huynh: <strong>{currentStudentObj?.parent || 'Chưa cập nhật'}</strong></span>
                  <span>·</span>
                  <span>SĐT: <strong>{currentStudentObj?.phone || 'Chưa cập nhật'}</strong></span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-dark/10">
              <div className="text-right">
                <p className="font-label text-xs font-bold text-dark/60 uppercase tracking-wider">Số bài kiểm tra</p>
                <p className="font-headline font-black text-2xl text-dark">{studentAssessments.length}</p>
              </div>
              <div className="w-px h-10 bg-dark/20"></div>
              <div className="text-right">
                <p className="font-label text-xs font-bold text-primary uppercase tracking-wider">Điểm trung bình</p>
                <p className="font-headline font-black text-2xl text-primary">
                  {studentOverallAvg ? `${studentOverallAvg} / 10` : '--'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Danh sách các bài kiểm tra đã lưu của học sinh */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-headline font-black text-lg text-dark flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl">history_edu</span>
              Lịch Sử Bài Kiểm Tra ({studentAssessments.length})
            </h3>
          </div>

          {loading ? (
            <div className="bg-white p-12 rounded-2xl memphis-border text-center text-dark/60 font-label font-bold flex flex-col items-center gap-3">
              <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
              Đang tải dữ liệu điểm...
            </div>
          ) : studentAssessments.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl memphis-border shadow-sm text-center flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center text-dark/60">
                <span className="material-symbols-outlined text-4xl">assignment_late</span>
              </div>
              <h4 className="font-headline font-bold text-lg text-dark">Học sinh chưa có bài kiểm tra nào</h4>
              <p className="font-body text-xs text-dark/60 max-w-md">
                Bấm vào nút "Nhập điểm bài kiểm tra" ở trên để ghi điểm và đánh giá cho {activeStudent}.
              </p>
              <button
                onClick={() => {
                  setEditingAssessment(null)
                  setIsEntryModalOpen(true)
                }}
                className="mt-2 bg-primary text-white px-5 py-2.5 rounded-xl font-headline font-bold text-sm memphis-border shadow-memphis-sm hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                Tạo bài kiểm tra đầu tiên
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {studentAssessments.map((assessment) => (
                <div 
                  key={assessment.id} 
                  className="bg-white p-5 rounded-2xl memphis-border shadow-sm hover:shadow-memphis transition-all flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-5"
                >
                  {/* Left: Test Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-headline font-black text-lg text-dark">{assessment.testName}</span>
                      {assessment.isLegacy ? (
                        <span className="px-2.5 py-0.5 rounded-full font-label text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">history</span> Điểm từ buổi học
                        </span>
                      ) : (
                        <span className={`px-2.5 py-0.5 rounded-full font-label text-[10px] font-bold ${
                          assessment.status === 'draft' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-green-100 text-green-800 border border-green-300'
                        }`}>
                          {assessment.status === 'draft' ? 'Bản nháp' : 'Chính thức'}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs font-label text-dark/70">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">event</span>
                        Ngày: {assessment.testDate}
                      </span>
                      <span>·</span>
                      <span>Lớp: {assessment.className}</span>
                    </div>

                    {/* 6 skills score badges */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {assessment.skills?.map(skill => (
                        <div 
                          key={skill.id}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-label font-bold"
                          style={{ backgroundColor: `${skill.color}15`, borderColor: `${skill.color}50` }}
                        >
                          <span style={{ color: skill.color }}>{skill.name}:</span>
                          <span className="font-black text-dark">{skill.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Score + Action buttons */}
                  <div className="flex items-center justify-between lg:justify-end gap-5 border-t lg:border-t-0 pt-3 lg:pt-0 border-dark/10">
                    {/* Score display */}
                    <div className="flex items-center gap-2 bg-[#F8F4EC] px-4 py-2 rounded-xl memphis-border shadow-memphis-sm shrink-0">
                      <div className="text-right">
                        <p className="font-label text-[9px] font-bold text-dark/60 uppercase">ĐIỂM TỔNG</p>
                        <p className="font-headline font-black text-2xl text-[#0068FF] leading-none">{assessment.totalScore}</p>
                      </div>
                      <span className="material-symbols-outlined text-[#0068FF] text-2xl">verified</span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        title="Chia sẻ báo cáo cho phụ huynh qua Zalo"
                        onClick={() => setShareAssessment(assessment)}
                        className="bg-accent text-white px-3.5 py-2 rounded-xl font-label font-bold text-xs memphis-border shadow-memphis-sm hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">share</span>
                        Gửi phụ huynh
                      </button>

                      <button
                        title={assessment.isLegacy ? "Phân loại thành bài kiểm tra chính thức (15p, 45p, giữa kỳ...)" : "Chỉnh sửa bài kiểm tra"}
                        onClick={() => {
                          setEditingAssessment(assessment)
                          setIsEntryModalOpen(true)
                        }}
                        className={`p-2 rounded-xl border-2 border-dark shadow-memphis-sm hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all flex items-center justify-center gap-1.5 ${
                          assessment.isLegacy ? 'bg-secondary text-dark font-headline font-bold text-xs px-3' : 'bg-white text-dark'
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">{assessment.isLegacy ? 'category' : 'edit'}</span>
                        {assessment.isLegacy && <span>Phân loại</span>}
                      </button>

                      <button
                        title="Xóa bài kiểm tra"
                        onClick={() => setConfirmDelete({ isOpen: true, id: assessment.id })}
                        className="p-2 bg-white text-danger rounded-xl border-2 border-dark shadow-memphis-sm hover:bg-danger hover:text-white transition-all flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Modal Nhập điểm bài kiểm tra (Ảnh 2) */}
      <AssessmentEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        onSave={handleSaveAssessment}
        classesList={classesList}
        initialClassId={selectedClass?.id}
        initialStudentName={activeStudent}
        editingAssessment={editingAssessment}
      />

      {/* Modal Chia sẻ / Xuất phiếu gửi phụ huynh qua Zalo */}
      <AssessmentShareModal
        isOpen={!!shareAssessment}
        onClose={() => setShareAssessment(null)}
        assessment={shareAssessment}
        studentInfo={currentStudentObj}
        showAlert={showAlert}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title="Xác nhận xóa bài kiểm tra"
        message="Bạn có chắc chắn muốn xóa bài kiểm tra này? Thao tác này không thể hoàn tác."
        onConfirm={handleDeleteAssessment}
        onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertDialog.isOpen}
        title={alertDialog.type === 'error' ? 'Lỗi' : alertDialog.type === 'success' ? 'Thành công' : 'Thông báo'}
        message={alertDialog.message}
        type={alertDialog.type}
        onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
      />
    </div>
  )
}
