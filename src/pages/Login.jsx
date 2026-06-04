import { useState } from 'react'
import { auth } from '../firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      setError(err.message || 'Đã có lỗi xảy ra.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl memphis-border shadow-memphis w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary text-white rounded-xl memphis-border shadow-memphis-sm mx-auto flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-3xl">menu_book</span>
          </div>
          <h1 className="font-headline text-3xl font-extrabold text-dark">Sổ Tay Lớp Học</h1>
          <p className="font-label text-dark/60 mt-2">Đăng nhập để quản lý học sinh của bạn</p>
        </div>



        {error && (
          <div className="bg-danger/10 border-2 border-danger text-danger p-3 rounded-md mb-6 font-label text-sm font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-label font-bold text-dark mb-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-background border-2 border-dark/20 p-3 rounded-md font-body text-dark focus:border-primary focus:outline-none transition-colors"
              placeholder="Ví dụ: gv.thu@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-label font-bold text-dark mb-1">Mật khẩu</label>
            <input 
              type="password" 
              required
              className="w-full bg-background border-2 border-dark/20 p-3 rounded-md font-body text-dark focus:border-primary focus:outline-none transition-colors"
              placeholder="Nhập mật khẩu..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-primary text-white font-bold py-3 px-4 rounded-md memphis-border shadow-memphis-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all font-label mt-4 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading && <span className="material-symbols-outlined animate-spin">refresh</span>}
            Vào hệ thống
          </button>
        </form>
      </div>
    </div>
  )
}
