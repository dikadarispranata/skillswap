// src/pages/Login.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginWithEmail, loginWithGoogle, registerWithEmail } from '../services/authService'

/* ── Ikon sederhana (inline SVG) ─────────────────────────────────── */
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const EyeIcon = ({ open }) => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
    {open
      ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      : <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
    }
  </svg>
)

/* ── Komponen utama ───────────────────────────────────────────────── */
export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode]         = useState('login')   // 'login' | 'register'
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const clearError = () => setError('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password)
      } else {
        if (!name.trim()) { setError('Nama tidak boleh kosong'); setLoading(false); return }
        await registerWithEmail(email, password, name)
      }
      navigate('/explore')
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setLoading(true)
    setError('')
    try {
      await loginWithGoogle()
      navigate('/explore')
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex overflow-hidden">

      {/* ── Left panel (branding) ─────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-dark-800 overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-72 h-72 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-dark-900" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M8 3v4m0 0C6.34 7 5 8.34 5 10s1.34 3 3 3m0-6h8m0 0v4m0-4c1.66 0 3 1.34 3 3s-1.34 3-3 3m0-3H8m4 3v7"/>
            </svg>
          </div>
          <span className="font-display font-bold text-xl text-white tracking-tight">SkillSwap</span>
        </div>

        {/* hero text */}
        <div className="relative z-10">
          <p className="text-brand-400 font-display font-semibold text-sm tracking-widest uppercase mb-4">
            Barter Keahlian
          </p>
          <h1 className="font-display font-bold text-5xl text-white leading-[1.1] mb-6">
            Tukar ilmu,<br />tanpa uang.
          </h1>
          <p className="text-white/50 font-body text-lg leading-relaxed max-w-sm">
            Temukan orang yang butuh keahlianmu, dan kamu bisa belajar dari mereka. Gratis, barter, komunitas.
          </p>
        </div>

        {/* feature pills */}
        <div className="relative z-10 flex flex-wrap gap-3">
          {['Smart Matching', 'Real-time Chat', 'Reputation System'].map(f => (
            <span key={f} className="glass text-white/70 text-sm font-body px-4 py-2">
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* ── Right panel (form) ────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md animate-fade-up">

          {/* mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-dark-900" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M8 3v4m0 0C6.34 7 5 8.34 5 10s1.34 3 3 3m0-6h8m0 0v4m0-4c1.66 0 3 1.34 3 3s-1.34 3-3 3m0-3H8m4 3v7"/>
              </svg>
            </div>
            <span className="font-display font-bold text-lg text-white">SkillSwap</span>
          </div>

          {/* heading */}
          <h2 className="font-display font-bold text-3xl text-white mb-1">
            {mode === 'login' ? 'Selamat datang' : 'Buat akun'}
          </h2>
          <p className="text-white/40 font-body mb-8">
            {mode === 'login'
              ? 'Login untuk mulai bertukar keahlian'
              : 'Bergabung dan mulai barter ilmu'}
          </p>

          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10
                       border border-white/10 hover:border-white/20 text-white font-body font-medium
                       py-3 px-5 rounded-xl transition-all duration-200 active:scale-[0.98] mb-6
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <GoogleIcon />
            Lanjutkan dengan Google
          </button>

          {/* divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs font-body">atau dengan email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-white/60 text-sm font-body mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={e => { setName(e.target.value); clearError() }}
                  className="input-base"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-white/60 text-sm font-body mb-1.5">Email</label>
              <input
                type="email"
                placeholder="kamu@email.com"
                value={email}
                onChange={e => { setEmail(e.target.value); clearError() }}
                className="input-base"
                required
              />
            </div>

            <div>
              <label className="block text-white/60 text-sm font-body mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={e => { setPassword(e.target.value); clearError() }}
                  className="input-base pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  <EyeIcon open={showPass} />
                </button>
              </div>
            </div>

            {/* error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm font-body">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" strokeLinecap="round"/>
                    </svg>
                    Memproses...
                  </span>
                : mode === 'login' ? 'Masuk' : 'Daftar Sekarang'
              }
            </button>
          </form>

          {/* switch mode */}
          <p className="text-center text-white/40 font-body text-sm mt-6">
            {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}
            {' '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
              className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
            >
              {mode === 'login' ? 'Daftar gratis' : 'Masuk'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

/* ── Helper: pesan error yang ramah ─────────────────────────────── */
function friendlyError(code) {
  const map = {
    'auth/user-not-found':       'Email tidak terdaftar.',
    'auth/wrong-password':       'Password salah.',
    'auth/invalid-credential':   'Email atau password salah.',
    'auth/email-already-in-use': 'Email sudah terdaftar.',
    'auth/weak-password':        'Password minimal 6 karakter.',
    'auth/invalid-email':        'Format email tidak valid.',
    'auth/popup-closed-by-user': 'Popup Google ditutup.',
    'auth/too-many-requests':    'Terlalu banyak percobaan. Coba lagi nanti.',
  }
  return map[code] ?? 'Terjadi kesalahan. Silakan coba lagi.'
}
