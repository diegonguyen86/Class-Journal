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
              let svgIcon = null
              
              if (social.platform === 'Facebook') { 
                bgColor = 'bg-[#1877F2]'
                svgIcon = <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-6 md:h-6"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> 
              }
              if (social.platform === 'Zalo') { 
                bgColor = 'bg-[#0068FF]'
                svgIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 md:w-6 md:h-6"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/><text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="900" fill="currentColor" stroke="none" style={{fontFamily: 'sans-serif'}}>Zalo</text></svg>
              }
              if (social.platform === 'LinkedIn') { 
                bgColor = 'bg-[#0A66C2]'
                svgIcon = <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-6 md:h-6"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              }
              if (social.platform === 'Instagram') { 
                bgColor = 'bg-[#E1306C]'
                svgIcon = <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-6 md:h-6"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              }
              if (social.platform === 'TikTok') { 
                bgColor = 'bg-[#000000]'
                svgIcon = <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-6 md:h-6"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.22-1.15 4.5-2.97 5.92-1.76 1.36-4.06 1.83-6.22 1.47-2.6-.43-4.8-2.31-5.63-4.82-.9-2.73-.24-5.83 1.63-8.02 1.79-2.07 4.54-3.12 7.23-2.65v4.06c-1.3-.2-2.71-.05-3.83.69-1.04.68-1.73 1.83-1.83 3.06-.11 1.35.43 2.72 1.47 3.55 1.09.87 2.64 1.15 3.98.77 1.47-.41 2.53-1.67 2.73-3.18.06-.44.05-.89.05-1.34V.02h-1.66z"/></svg>
              }
              if (social.platform === 'YouTube') { 
                bgColor = 'bg-[#FF0000]'
                svgIcon = <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-6 md:h-6"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              }
              if (social.platform === 'Website') { 
                bgColor = 'bg-primary'
                svgIcon = <span className="material-symbols-outlined text-[20px] md:text-[24px]">language</span>
              }

              return (
                <a key={social.id} href={social.url} target="_blank" rel="noreferrer" className={`flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 ${bgColor} text-white font-bold font-label text-base md:text-lg rounded-full memphis-border shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] md:shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] md:hover:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] transition-all`}>
                  {svgIcon}
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
                <span className="material-symbols-outlined text-primary text-3xl md:text-4xl">waving_hand</span>
                Giới Thiệu Chung
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
