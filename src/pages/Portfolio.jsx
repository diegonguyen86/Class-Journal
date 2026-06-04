import { useState, useEffect } from 'react'
import { getFirestore, doc, getDoc } from 'firebase/firestore'

const db = getFirestore()

// Utility to convert Google Drive view links to direct image links
const parseImageLink = (url) => {
  if (!url) return '/placeholder.png' // Fallback
  try {
    const driveRegex = /\/file\/d\/([a-zA-Z0-9_-]+)\//
    const match = url.match(driveRegex)
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`
    }
    return url
  } catch (e) {
    return url
  }
}

export default function Portfolio() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'teacherProfile', 'main')
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setProfile(docSnap.data())
        }
      } catch (error) {
        console.error("Lỗi khi tải portfolio:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">refresh</span>
          <p className="font-headline font-bold text-xl text-dark">Đang tải hồ sơ...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-headline font-bold text-xl text-dark">Hồ sơ chưa được thiết lập.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-dark font-body relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/30 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        
        {/* Header / Hero Section */}
        <header className="text-center space-y-6">
          <div className="w-24 h-24 bg-primary text-white rounded-2xl memphis-border shadow-memphis-sm mx-auto flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-5xl">auto_awesome</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-headline font-extrabold text-dark tracking-tight">
            {profile.name || "Tên Giáo Viên"}
          </h1>
          <p className="text-xl md:text-2xl font-label font-bold text-dark/70 max-w-2xl mx-auto">
            {profile.experience || "Giáo viên đầy nhiệt huyết"}
          </p>

          {/* Social Links */}
          <div className="flex justify-center gap-4 pt-4">
            {profile.socials?.fb && (
              <a href={profile.socials.fb} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 bg-[#1877F2] text-white font-bold font-label rounded-full memphis-border shadow-memphis-sm hover:-translate-y-1 transition-transform">
                <span className="material-symbols-outlined">thumb_up</span>
                Facebook
              </a>
            )}
            {profile.socials?.zalo && (
              <a href={profile.socials.zalo} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 bg-[#0068FF] text-white font-bold font-label rounded-full memphis-border shadow-memphis-sm hover:-translate-y-1 transition-transform">
                <span className="material-symbols-outlined">chat</span>
                Zalo
              </a>
            )}
            {profile.socials?.linkedin && (
              <a href={profile.socials.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 bg-[#0A66C2] text-white font-bold font-label rounded-full memphis-border shadow-memphis-sm hover:-translate-y-1 transition-transform">
                <span className="material-symbols-outlined">work</span>
                LinkedIn
              </a>
            )}
          </div>
        </header>

        {/* About Section - Bento Style */}
        {profile.about && (
          <section className="bg-white p-8 md:p-12 rounded-3xl memphis-border shadow-memphis">
            <h2 className="text-2xl font-headline font-bold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">person_book</span>
              Giới thiệu
            </h2>
            <p className="text-lg leading-relaxed text-dark/80 whitespace-pre-wrap">
              {profile.about}
            </p>
          </section>
        )}

        {/* Certificates Grid */}
        {profile.certificates && profile.certificates.length > 0 && (
          <section>
            <h2 className="text-3xl font-headline font-extrabold mb-8 text-center flex items-center justify-center gap-3">
              <span className="material-symbols-outlined text-primary text-4xl">workspace_premium</span>
              Bằng Cấp & Chứng Chỉ
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.certificates.map(cert => (
                <div key={cert.id} className="bg-white rounded-2xl memphis-border shadow-memphis-sm overflow-hidden flex flex-col group hover:-translate-y-2 transition-transform duration-300">
                  {cert.imageLink && (
                    <div className="h-48 w-full bg-dark/5 overflow-hidden border-b-2 border-dark">
                      <img 
                        src={parseImageLink(cert.imageLink)} 
                        alt={cert.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.onerror = null; 
                          e.target.src = "https://placehold.co/600x400/f8f4ec/1a1a1a?text=L%E1%BB%97i+T%E1%BA%A3i+%E1%BA%A2nh";
                        }}
                      />
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col justify-center">
                    <h3 className="font-headline font-bold text-xl text-dark mb-2">{cert.name}</h3>
                    <p className="font-label text-dark/60 font-bold">{cert.issuer}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Outstanding Students Grid */}
        {profile.outstandingStudents && profile.outstandingStudents.length > 0 && (
          <section className="pt-8">
            <h2 className="text-3xl font-headline font-extrabold mb-8 text-center flex items-center justify-center gap-3">
              <span className="material-symbols-outlined text-primary text-4xl">social_leaderboard</span>
              Học Sinh Tiêu Biểu
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {profile.outstandingStudents.map(student => (
                <div key={student.id} className="bg-secondary/20 rounded-3xl memphis-border shadow-memphis relative overflow-hidden group">
                  {/* Geometric Decoration */}
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/40 transition-colors"></div>
                  
                  {student.imageLink && (
                    <div className="aspect-square w-full bg-white border-b-2 border-dark overflow-hidden p-2">
                      <div className="w-full h-full rounded-2xl overflow-hidden memphis-border">
                        <img 
                          src={parseImageLink(student.imageLink)} 
                          alt={student.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = "https://placehold.co/600x600/f8f4ec/1a1a1a?text=L%E1%BB%97i+T%E1%BA%A3i+%E1%BA%A2nh";
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <div className="p-6 text-center">
                    <h3 className="font-headline font-extrabold text-2xl text-dark mb-2">{student.name}</h3>
                    <div className="inline-block bg-white px-4 py-2 rounded-full memphis-border-thick font-label font-bold text-primary shadow-sm">
                      {student.achievement}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="pt-20 pb-8 text-center font-label font-bold text-dark/40">
          © {new Date().getFullYear()} - Chào mừng đến với lớp học của {profile.name}
        </footer>
      </div>
    </div>
  )
}
