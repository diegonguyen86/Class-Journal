import { useState, useEffect } from 'react'
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'

const db = getFirestore()

export default function ProfileSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [profile, setProfile] = useState({
    name: '',
    experience: '',
    about: '',
    socials: {
      fb: '',
      zalo: '',
      linkedin: ''
    },
    certificates: [],
    outstandingStudents: []
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const docRef = doc(db, 'teacherProfile', 'main')
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        setProfile(docSnap.data())
      }
    } catch (error) {
      console.error("Lỗi khi tải hồ sơ:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      await setDoc(doc(db, 'teacherProfile', 'main'), profile)
      setMessage('Lưu hồ sơ thành công!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('Lỗi khi lưu: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleAddCert = () => {
    setProfile(prev => ({
      ...prev,
      certificates: [...prev.certificates, { id: Date.now().toString(), name: '', issuer: '', imageLink: '' }]
    }))
  }

  const handleAddStudent = () => {
    setProfile(prev => ({
      ...prev,
      outstandingStudents: [...prev.outstandingStudents, { id: Date.now().toString(), name: '', achievement: '', imageLink: '' }]
    }))
  }

  const updateCert = (id, field, value) => {
    setProfile(prev => ({
      ...prev,
      certificates: prev.certificates.map(c => c.id === id ? { ...c, [field]: value } : c)
    }))
  }

  const updateStudent = (id, field, value) => {
    setProfile(prev => ({
      ...prev,
      outstandingStudents: prev.outstandingStudents.map(s => s.id === id ? { ...s, [field]: value } : s)
    }))
  }

  const removeCert = (id) => {
    setProfile(prev => ({
      ...prev,
      certificates: prev.certificates.filter(c => c.id !== id)
    }))
  }

  const removeStudent = (id) => {
    setProfile(prev => ({
      ...prev,
      outstandingStudents: prev.outstandingStudents.filter(s => s.id !== id)
    }))
  }

  if (loading) {
    return <div className="p-8 font-headline font-bold">Đang tải hồ sơ...</div>
  }

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-headline font-extrabold text-dark">Hồ Sơ Của Tôi</h1>
          <p className="text-dark/60 font-label mt-1">Thông tin này sẽ được hiển thị trên trang Portfolio công khai.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-white font-bold py-2 px-6 rounded-md memphis-border shadow-memphis hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <span className="material-symbols-outlined">{saving ? 'hourglass_empty' : 'save'}</span>
          {saving ? 'Đang lưu...' : 'Lưu Hồ Sơ'}
        </button>
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded-md font-bold memphis-border ${message.includes('Lỗi') ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success'}`}>
          {message}
        </div>
      )}

      <div className="space-y-8 pb-20">
        {/* Thông tin cơ bản */}
        <section className="bg-white p-6 rounded-xl memphis-border shadow-memphis-sm">
          <h2 className="text-xl font-headline font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">person</span>
            Thông Tin Cơ Bản
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-label font-bold text-dark mb-1">Tên Giáo Viên</label>
              <input 
                type="text" 
                className="w-full border-2 border-dark/20 p-2 rounded-md font-body focus:border-primary outline-none"
                value={profile.name}
                onChange={e => setProfile({...profile, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block font-label font-bold text-dark mb-1">Số Năm Kinh Nghiệm</label>
              <input 
                type="text" 
                className="w-full border-2 border-dark/20 p-2 rounded-md font-body focus:border-primary outline-none"
                value={profile.experience}
                onChange={e => setProfile({...profile, experience: e.target.value})}
                placeholder="VD: 5 năm kinh nghiệm luyện thi đại học"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-label font-bold text-dark mb-1">Mô Tả Ngắn Về Bản Thân</label>
              <textarea 
                className="w-full border-2 border-dark/20 p-2 rounded-md font-body focus:border-primary outline-none h-24"
                value={profile.about}
                onChange={e => setProfile({...profile, about: e.target.value})}
              />
            </div>
          </div>
        </section>

        {/* Mạng Xã Hội */}
        <section className="bg-white p-6 rounded-xl memphis-border shadow-memphis-sm">
          <h2 className="text-xl font-headline font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">link</span>
            Mạng Xã Hội
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-label font-bold text-dark mb-1">Link Zalo</label>
              <input 
                type="text" 
                className="w-full border-2 border-dark/20 p-2 rounded-md font-body focus:border-primary outline-none"
                value={profile.socials?.zalo || ''}
                onChange={e => setProfile({...profile, socials: {...profile.socials, zalo: e.target.value}})}
              />
            </div>
            <div>
              <label className="block font-label font-bold text-dark mb-1">Link Facebook</label>
              <input 
                type="text" 
                className="w-full border-2 border-dark/20 p-2 rounded-md font-body focus:border-primary outline-none"
                value={profile.socials?.fb || ''}
                onChange={e => setProfile({...profile, socials: {...profile.socials, fb: e.target.value}})}
              />
            </div>
            <div>
              <label className="block font-label font-bold text-dark mb-1">Link LinkedIn (Nếu có)</label>
              <input 
                type="text" 
                className="w-full border-2 border-dark/20 p-2 rounded-md font-body focus:border-primary outline-none"
                value={profile.socials?.linkedin || ''}
                onChange={e => setProfile({...profile, socials: {...profile.socials, linkedin: e.target.value}})}
              />
            </div>
          </div>
        </section>

        {/* Bằng Cấp */}
        <section className="bg-white p-6 rounded-xl memphis-border shadow-memphis-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-headline font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">workspace_premium</span>
              Bằng Cấp & Chứng Chỉ
            </h2>
            <button onClick={handleAddCert} className="text-primary font-bold text-sm bg-primary/10 px-3 py-1 rounded-md flex items-center gap-1 hover:bg-primary/20">
              <span className="material-symbols-outlined text-sm">add</span> Thêm
            </button>
          </div>
          <div className="space-y-4">
            {profile.certificates?.map(cert => (
              <div key={cert.id} className="border-2 border-dark/10 p-4 rounded-lg flex gap-4 relative">
                <button onClick={() => removeCert(cert.id)} className="absolute top-2 right-2 text-danger hover:bg-danger/10 rounded p-1">
                  <span className="material-symbols-outlined text-xl">delete</span>
                </button>
                <div className="flex-1 space-y-3">
                  <input 
                    type="text" 
                    placeholder="Tên Bằng/Chứng Chỉ"
                    className="w-full border-2 border-dark/20 p-2 rounded-md font-body focus:border-primary outline-none font-bold"
                    value={cert.name}
                    onChange={e => updateCert(cert.id, 'name', e.target.value)}
                  />
                  <input 
                    type="text" 
                    placeholder="Tổ Chức Cấp (VD: Đại học Sư Phạm HN)"
                    className="w-full border-2 border-dark/20 p-2 rounded-md font-body focus:border-primary outline-none"
                    value={cert.issuer}
                    onChange={e => updateCert(cert.id, 'issuer', e.target.value)}
                  />
                  <div>
                    <label className="block text-xs font-bold text-dark/60 mb-1">Link Ảnh (Google Drive / Imgur / Fb...)</label>
                    <input 
                      type="text" 
                      placeholder="Dán link ảnh vào đây..."
                      className="w-full border-2 border-dark/20 p-2 rounded-md font-body focus:border-primary outline-none text-sm"
                      value={cert.imageLink}
                      onChange={e => updateCert(cert.id, 'imageLink', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            {(!profile.certificates || profile.certificates.length === 0) && (
              <p className="text-dark/40 italic text-center py-4">Chưa có bằng cấp nào.</p>
            )}
          </div>
        </section>

        {/* Học Sinh Tiêu Biểu */}
        <section className="bg-white p-6 rounded-xl memphis-border shadow-memphis-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-headline font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">social_leaderboard</span>
              Học Sinh Tiêu Biểu
            </h2>
            <button onClick={handleAddStudent} className="text-primary font-bold text-sm bg-primary/10 px-3 py-1 rounded-md flex items-center gap-1 hover:bg-primary/20">
              <span className="material-symbols-outlined text-sm">add</span> Thêm
            </button>
          </div>
          <div className="space-y-4">
            {profile.outstandingStudents?.map(student => (
              <div key={student.id} className="border-2 border-dark/10 p-4 rounded-lg flex gap-4 relative">
                <button onClick={() => removeStudent(student.id)} className="absolute top-2 right-2 text-danger hover:bg-danger/10 rounded p-1">
                  <span className="material-symbols-outlined text-xl">delete</span>
                </button>
                <div className="flex-1 space-y-3">
                  <input 
                    type="text" 
                    placeholder="Tên Học Sinh"
                    className="w-full border-2 border-dark/20 p-2 rounded-md font-body focus:border-primary outline-none font-bold"
                    value={student.name}
                    onChange={e => updateStudent(student.id, 'name', e.target.value)}
                  />
                  <input 
                    type="text" 
                    placeholder="Thành tích (VD: Đạt 9.0 IELTS, Thủ khoa...)"
                    className="w-full border-2 border-dark/20 p-2 rounded-md font-body focus:border-primary outline-none"
                    value={student.achievement}
                    onChange={e => updateStudent(student.id, 'achievement', e.target.value)}
                  />
                  <div>
                    <label className="block text-xs font-bold text-dark/60 mb-1">Link Ảnh (Google Drive / Imgur / Fb...)</label>
                    <input 
                      type="text" 
                      placeholder="Dán link ảnh vào đây..."
                      className="w-full border-2 border-dark/20 p-2 rounded-md font-body focus:border-primary outline-none text-sm"
                      value={student.imageLink}
                      onChange={e => updateStudent(student.id, 'imageLink', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            {(!profile.outstandingStudents || profile.outstandingStudents.length === 0) && (
              <p className="text-dark/40 italic text-center py-4">Chưa có học sinh nào.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
