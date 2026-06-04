import { useState, useEffect } from 'react'
import { getFirestore, doc, getDoc } from 'firebase/firestore'

const db = getFirestore()

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
      <div className="min-h-screen bg-[#F8F4EC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin">autorenew</span>
          <p className="font-headline font-bold text-2xl text-dark uppercase tracking-widest">Đang Khởi Tạo...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#F8F4EC] flex items-center justify-center">
        <div className="bg-white p-8 memphis-border shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] rounded-2xl">
          <p className="font-headline font-bold text-2xl text-dark">Hồ sơ chưa được thiết lập.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F4EC] text-dark font-body relative overflow-hidden selection:bg-primary selection:text-white pb-32">
      {/* Background Pattern - Dot Grid */}
      <div className="absolute inset-0 z-0 opacity-[0.15] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1a1a1a 2px, transparent 2px)', backgroundSize: '32px 32px' }}></div>
      
      {/* Floating Memphis Decorative Shapes (Hidden on Mobile to save space) */}
      <div className="hidden md:block absolute top-20 left-[5%] w-24 h-24 bg-secondary rounded-full memphis-border -z-0 animate-bounce" style={{ animationDuration: '5s' }}></div>
      <div className="hidden md:block absolute top-60 right-[10%] w-40 h-10 bg-primary memphis-border -z-0 rotate-12"></div>
      <div className="hidden md:block absolute top-[40%] left-[-2rem] w-20 h-20 bg-white memphis-border rotate-45 -z-0"></div>
      <div className="hidden md:block absolute bottom-[20%] right-[5%] w-16 h-16 bg-[#FF6B6B] rounded-full memphis-border -z-0"></div>
      
      <div className="max-w-6xl mx-auto px-4 pt-32 relative z-10 space-y-32">
        
        {/* Header / Hero Section */}
        <header className="relative bg-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 lg:p-20 memphis-border-thick shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] md:shadow-[16px_16px_0px_0px_rgba(26,26,26,1)] text-center transition-transform hover:-translate-y-2 duration-500">
          <div className="absolute -top-12 md:-top-16 left-1/2 -translate-x-1/2 w-24 h-24 md:w-32 md:h-32 bg-primary text-white rounded-2xl md:rounded-3xl memphis-border-thick flex items-center justify-center rotate-6 hover:rotate-0 transition-transform duration-300 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] overflow-hidden z-10">
            {profile.avatar ? (
              <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-5xl md:text-6xl text-white">school</span>
            )}
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-headline font-extrabold text-dark tracking-tighter uppercase mb-6 mt-8 md:mt-4 break-words">
            {profile.name || "Tên Giáo Viên"}
          </h1>
          
          <div className="inline-block bg-secondary px-6 md:px-8 py-2 md:py-3 rounded-full memphis-border-thick font-label font-black text-lg md:text-xl lg:text-2xl -rotate-2 mb-8 md:mb-12 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] break-words max-w-full">
            {profile.experience || "Giáo viên đầy nhiệt huyết"}
          </div>

          {/* Social Links */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            {Array.isArray(profile.socials) && profile.socials.map(social => {
              if (!social.url) return null;
              let bgColor = 'bg-dark'
              let icon = 'link'
              if (social.platform === 'Facebook') { bgColor = 'bg-[#1877F2]'; icon = 'thumb_up' }
              if (social.platform === 'Zalo') { bgColor = 'bg-[#0068FF]'; icon = 'chat' }
              if (social.platform === 'LinkedIn') { bgColor = 'bg-[#0A66C2]'; icon = 'work' }
              if (social.platform === 'Instagram') { bgColor = 'bg-[#E1306C]'; icon = 'photo_camera' }
              if (social.platform === 'TikTok') { bgColor = 'bg-[#000000]'; icon = 'music_note' }
              if (social.platform === 'YouTube') { bgColor = 'bg-[#FF0000]'; icon = 'play_arrow' }
              if (social.platform === 'Website') { bgColor = 'bg-primary'; icon = 'language' }

              return (
                <a key={social.id} href={social.url} target="_blank" rel="noreferrer" className={`flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 ${bgColor} text-white font-bold font-label text-base md:text-lg rounded-full memphis-border shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] md:hover:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] transition-all`}>
                  <span className="material-symbols-outlined">{icon}</span>
                  {social.platform}
                </a>
              )
            })}
          </div>
        </header>

        {/* About Section */}
        {profile.about && (
          <section className="relative w-full max-w-4xl mx-auto">
            <div className="hidden md:block absolute inset-0 bg-primary rounded-3xl rotate-2 memphis-border-thick"></div>
            <div className="relative bg-white p-6 md:p-14 rounded-[2rem] md:rounded-3xl memphis-border-thick md:-rotate-1 md:hover:rotate-0 transition-transform duration-300">
              <h2 className="text-2xl md:text-3xl font-headline font-black mb-4 md:mb-6 flex items-center gap-3 uppercase">
                <span className="material-symbols-outlined text-primary text-3xl md:text-4xl">person_book</span>
                Về Bản Thân
              </h2>
              <p className="text-lg md:text-xl lg:text-2xl leading-relaxed text-dark font-medium whitespace-pre-wrap">
                {profile.about}
              </p>
            </div>
          </section>
        )}

        {/* Certificates Grid */}
        {profile.certificates && profile.certificates.length > 0 && (
          <section>
            <div className="inline-block bg-dark text-white px-6 md:px-8 py-3 md:py-4 rounded-xl memphis-border mb-8 md:mb-12 md:-rotate-1 shadow-[6px_6px_0px_0px_#A5D6A7] md:shadow-[8px_8px_0px_0px_#A5D6A7]">
              <h2 className="text-2xl md:text-4xl font-headline font-black uppercase tracking-wider flex items-center gap-3 md:gap-4">
                <span className="material-symbols-outlined text-secondary text-4xl md:text-5xl">workspace_premium</span>
                <span className="break-words">Bằng Cấp & Chứng Chỉ</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {profile.certificates.map(cert => (
                <div key={cert.id} className="bg-white rounded-[2rem] memphis-border-thick shadow-[10px_10px_0px_0px_rgba(26,26,26,1)] overflow-hidden flex flex-col group hover:-translate-y-3 transition-transform duration-300">
                  {cert.imageLink && (
                    <div className="h-56 w-full bg-dark/5 overflow-hidden border-b-4 border-dark relative">
                      <div className="absolute top-4 right-4 bg-secondary w-12 h-12 rounded-full memphis-border z-10 flex items-center justify-center text-dark">
                        <span className="material-symbols-outlined font-bold">verified</span>
                      </div>
                      <img 
                        src={cert.imageLink} 
                        alt={cert.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                  )}
                  <div className="p-8 flex-1 flex flex-col justify-center bg-white">
                    <h3 className="font-headline font-black text-2xl text-dark mb-3 leading-tight">{cert.name}</h3>
                    <div className="inline-block bg-primary/10 px-4 py-2 rounded-lg border-2 border-primary text-primary font-bold font-label">
                      {cert.issuer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Outstanding Students Grid */}
        {profile.outstandingStudents && profile.outstandingStudents.length > 0 && (
          <section className="pt-8 md:pt-10">
            <div className="flex justify-start md:justify-end mb-8 md:mb-12">
              <div className="inline-block bg-primary text-white px-6 md:px-8 py-3 md:py-4 rounded-xl memphis-border md:rotate-1 shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] md:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)]">
                <h2 className="text-2xl md:text-4xl font-headline font-black uppercase tracking-wider flex items-center gap-3 md:gap-4">
                  <span className="break-words">Học Sinh Tiêu Biểu</span>
                  <span className="material-symbols-outlined text-white text-4xl md:text-5xl">social_leaderboard</span>
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {profile.outstandingStudents.map(student => (
                <div key={student.id} className="bg-white rounded-3xl memphis-border-thick shadow-[12px_12px_0px_0px_rgba(26,26,26,1)] relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                  {/* Geometric Decoration */}
                  <div className="absolute -left-6 -top-6 w-32 h-32 bg-secondary rounded-full memphis-border group-hover:scale-110 transition-transform"></div>
                  
                  {student.imageLink && (
                    <div className="aspect-square w-full bg-dark/5 border-b-4 border-dark overflow-hidden p-4 relative z-10">
                      <div className="w-full h-full rounded-2xl overflow-hidden memphis-border shadow-inner">
                        <img 
                          src={student.imageLink} 
                          alt={student.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                    </div>
                  )}
                  <div className="p-8 text-center relative z-10 bg-white">
                    <h3 className="font-headline font-black text-3xl text-dark mb-4">{student.name}</h3>
                    <div className="inline-block bg-white px-6 py-3 rounded-full memphis-border-thick font-label font-black text-primary shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] text-lg">
                      {student.achievement}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="pt-20 text-center">
          <div className="inline-block bg-dark text-white px-8 py-4 rounded-full font-label font-black uppercase tracking-widest text-sm memphis-border">
            © {new Date().getFullYear()} - PORTFOLIO CỦA {profile.name}
          </div>
        </footer>
      </div>
    </div>
  )
}
