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
    avatar: '',
    socials: [],
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
        const data = docSnap.data()
        if (data.socials && !Array.isArray(data.socials)) {
          data.socials = Object.entries(data.socials)
            .filter(([_, v]) => v)
            .map(([k, v]) => ({ id: Date.now().toString() + k, platform: k === 'fb' ? 'Facebook' : k === 'zalo' ? 'Zalo' : 'LinkedIn', url: v }))
        }
        setProfile({ ...data, socials: data.socials || [] })
      }
    } catch (error) {
      console.error("Lỗi khi tải hồ sơ:", error)
    } finally {
      setLoading(false)
    }
  }

  const uploadImageToImgBB = async (file, id, field, type) => {
    const formData = new FormData()
    formData.append('image', file)
    
    if (type === 'cert') updateCert(id, 'uploading', true)
    else if (type === 'student') updateStudent(id, 'uploading', true)
    else setProfile(prev => ({...prev, uploadingAvatar: true}))

    try {
      const imgbbKey = import.meta.env.VITE_IMGBB_API_KEY;
      if (!imgbbKey) {
        throw new Error('Thiếu cấu hình API Key ImgBB (VITE_IMGBB_API_KEY). Vui lòng thêm vào file .env');
      }
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
        method: 'POST',
        body: formData
      })
      const data = await response.json()
      if (data.success) {
        if (type === 'cert') updateCert(id, field, data.data.url)
        else if (type === 'student') updateStudent(id, field, data.data.url)
        else setProfile(prev => ({...prev, avatar: data.data.url}))
      } else {
        throw new Error(data.error.message)
      }
    } catch (error) {
      setMessage('Lỗi tải ảnh: ' + error.message)
    } finally {
      if (type === 'cert') updateCert(id, 'uploading', false)
      else if (type === 'student') updateStudent(id, 'uploading', false)
      else setProfile(prev => ({...prev, uploadingAvatar: false}))
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

  const handleCopyLink = () => {
    const link = window.location.origin + '/portfolio'
    navigator.clipboard.writeText(link)
    setMessage('Đã copy link Portfolio vào bộ nhớ tạm! Bạn có thể dán (Ctrl+V) để gửi cho phụ huynh.')
    setTimeout(() => setMessage(''), 5000)
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

  const handleAddSocial = () => {
    setProfile(prev => ({
      ...prev,
      socials: [...(prev.socials || []), { id: Date.now().toString(), platform: 'Facebook', url: '' }]
    }))
  }

  const updateSocial = (id, field, value) => {
    setProfile(prev => ({
      ...prev,
      socials: prev.socials.map(s => s.id === id ? { ...s, [field]: value } : s)
    }))
  }

  const removeSocial = (id) => {
    setProfile(prev => ({
      ...prev,
      socials: prev.socials.filter(s => s.id !== id)
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-8">
        <div>
          <h1 className="text-3xl font-headline font-extrabold text-dark">Hồ Sơ Của Tôi</h1>
          <p className="text-dark/60 font-label mt-1">Thông tin này sẽ được hiển thị trên trang Portfolio công khai.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleCopyLink}
            className="bg-secondary text-dark font-bold py-2 px-4 md:px-6 rounded-md memphis-border shadow-memphis hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined">share</span>
            Copy Link Gửi Phụ Huynh
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-primary text-white font-bold py-2 px-4 md:px-6 rounded-md memphis-border shadow-memphis hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined">{saving ? 'hourglass_empty' : 'save'}</span>
            {saving ? 'Đang lưu...' : 'Lưu Hồ Sơ'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded-md font-bold memphis-border ${message.includes('Lỗi') ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success'}`}>
          {message}
        </div>
      )}

      <div className="space-y-8 pb-20">
        {/* Thông tin cơ bản & Avatar */}
        <section className="bg-white p-6 rounded-xl memphis-border shadow-memphis-sm">
          <h2 className="text-xl font-headline font-bold mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">person</span>
            Thông Tin Cơ Bản
          </h2>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0 flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-full memphis-border overflow-hidden bg-dark/5 flex items-center justify-center relative">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-5xl text-dark/20">account_circle</span>
                )}
                {profile.uploadingAvatar && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                    <span className="material-symbols-outlined animate-spin text-primary">refresh</span>
                  </div>
                )}
              </div>
              <div className="text-center">
                <input 
                  type="file" 
                  id="avatar-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      uploadImageToImgBB(e.target.files[0], null, 'avatar', 'avatar')
                    }
                  }}
                />
                <label htmlFor="avatar-upload" className="cursor-pointer text-primary font-bold text-sm bg-primary/10 px-4 py-2 rounded-md inline-block hover:bg-primary/20 transition-colors">
                  Đổi Ảnh Đại Diện
                </label>
              </div>
            </div>
            
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </section>

        {/* Mạng Xã Hội */}
        <section className="bg-white p-6 rounded-xl memphis-border shadow-memphis-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-headline font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">link</span>
              Mạng Xã Hội
            </h2>
            <button onClick={handleAddSocial} className="text-primary font-bold text-sm bg-primary/10 px-3 py-1 rounded-md flex items-center gap-1 hover:bg-primary/20">
              <span className="material-symbols-outlined text-sm">add</span> Thêm Mạng Xã Hội
            </button>
          </div>
          <div className="space-y-4">
            {profile.socials?.map(social => (
              <div key={social.id} className="flex flex-col sm:flex-row gap-4 sm:items-end">
                <div className="w-full sm:w-1/3">
                  <label className="block font-label font-bold text-dark mb-1">Nền Tảng</label>
                  <select 
                    className="w-full border-2 border-dark/20 p-2 rounded-md font-body focus:border-primary outline-none"
                    value={social.platform}
                    onChange={e => updateSocial(social.id, 'platform', e.target.value)}
                  >
                    <option value="Facebook">Facebook</option>
                    <option value="Zalo">Zalo</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Website">Website Cá Nhân</option>
                  </select>
                </div>
                <div className="flex-1 w-full">
                  <label className="block font-label font-bold text-dark mb-1">Đường Link</label>
                  <input 
                    type="text" 
                    placeholder="https://..."
                    className="w-full border-2 border-dark/20 p-2 rounded-md font-body focus:border-primary outline-none"
                    value={social.url}
                    onChange={e => updateSocial(social.id, 'url', e.target.value)}
                  />
                </div>
                <button onClick={() => removeSocial(social.id)} className="w-full sm:w-auto text-danger bg-danger/10 p-2 rounded-md hover:bg-danger/20 mb-[2px] flex justify-center">
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            ))}
            {(!profile.socials || profile.socials.length === 0) && (
              <p className="text-dark/40 italic text-center py-2">Chưa thêm liên kết nào.</p>
            )}
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
                    <label className="block text-xs font-bold text-dark mb-1">Ảnh Bằng Cấp/Chứng Chỉ</label>
                    {cert.imageLink ? (
                      <div className="flex items-center gap-3 mt-2">
                        <img src={cert.imageLink} alt="preview" className="w-16 h-16 object-cover rounded-md memphis-border shadow-sm" />
                        <button onClick={() => updateCert(cert.id, 'imageLink', '')} className="text-danger text-sm font-bold bg-danger/10 hover:bg-danger/20 px-3 py-1.5 rounded-md transition-colors">Xóa Ảnh</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input 
                          type="file" 
                          accept="image/*"
                          className="w-full border-2 border-dark/20 p-2 rounded-md font-body focus:border-primary outline-none text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              uploadImageToImgBB(e.target.files[0], cert.id, 'imageLink', 'cert')
                            }
                          }}
                        />
                        {cert.uploading && <span className="material-symbols-outlined animate-spin text-primary">refresh</span>}
                      </div>
                    )}
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
                    <label className="block text-xs font-bold text-dark mb-1">Ảnh Chân Dung Học Sinh</label>
                    {student.imageLink ? (
                      <div className="flex items-center gap-3 mt-2">
                        <img src={student.imageLink} alt="preview" className="w-16 h-16 object-cover rounded-md memphis-border shadow-sm" />
                        <button onClick={() => updateStudent(student.id, 'imageLink', '')} className="text-danger text-sm font-bold bg-danger/10 hover:bg-danger/20 px-3 py-1.5 rounded-md transition-colors">Xóa Ảnh</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input 
                          type="file" 
                          accept="image/*"
                          className="w-full border-2 border-dark/20 p-2 rounded-md font-body focus:border-primary outline-none text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer"
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              uploadImageToImgBB(e.target.files[0], student.id, 'imageLink', 'student')
                            }
                          }}
                        />
                        {student.uploading && <span className="material-symbols-outlined animate-spin text-primary">refresh</span>}
                      </div>
                    )}
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
