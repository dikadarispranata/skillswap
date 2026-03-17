// src/pages/Explore.jsx
import { useAuth } from '../context/AuthContext'

export default function Explore() {
  const { profile } = useAuth()

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10">
        <p className="text-brand-400 font-display font-semibold text-sm tracking-widest uppercase mb-2">
          Selamat datang kembali
        </p>
        <h1 className="font-display font-bold text-4xl text-white">
          Halo, {profile?.name?.split(' ')[0] || 'Pengguna'} 👋
        </h1>
        <p className="text-white/40 font-body mt-2">
          Temukan orang yang cocok untuk bertukar keahlian denganmu.
        </p>
      </div>

      {/* Placeholder cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card p-5 space-y-4 animate-fade-up" style={{ animationDelay: `${i * 60}ms`, opacity: 0, animationFillMode: 'forwards' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-500/20 border border-brand-500/30" />
              <div className="space-y-1.5">
                <div className="h-3 w-24 bg-white/10 rounded-full" />
                <div className="h-2.5 w-16 bg-white/5 rounded-full" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-2.5 w-full bg-white/5 rounded-full" />
              <div className="h-2.5 w-3/4 bg-white/5 rounded-full" />
            </div>
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-brand-500/10 border border-brand-500/20 rounded-lg" />
              <div className="h-6 w-20 bg-brand-500/10 border border-brand-500/20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-white/20 font-body text-sm mt-12">
        🚧 Fitur Explore sedang dalam pengembangan
      </p>
    </div>
  )
}
