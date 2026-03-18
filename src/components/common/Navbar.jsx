// src/components/common/Navbar.jsx
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { logout } from '../../services/authService'

const NavLink = ({ to, children }) => {
  const { pathname } = useLocation()
  const active = pathname === to
  return (
    <Link
      to={to}
      className={`font-body text-sm px-3 py-1.5 rounded-lg transition-all duration-150
        ${active
          ? 'text-brand-400 bg-brand-500/10'
          : 'text-white/50 hover:text-white hover:bg-white/5'}`}
    >
      {children}
    </Link>
  )
}

export default function Navbar() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* logo */}
        <Link to="/explore" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-dark-900" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M8 3v4m0 0C6.34 7 5 8.34 5 10s1.34 3 3 3m0-6h8m0 0v4m0-4c1.66 0 3 1.34 3 3s-1.34 3-3 3m0-3H8m4 3v7"/>
            </svg>
          </div>
          <span className="font-display font-bold text-white text-base">SkillSwap</span>
        </Link>

        {/* links */}
        {user && (
          <div className="flex items-center gap-1">
            <NavLink to="/explore">Explore</NavLink>
            <NavLink to="/chat">Chat</NavLink>
            <NavLink to="/profile">Profil</NavLink>
          </div>
        )}

        {/* right */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 text-sm text-white/50 font-body">
                <div className="w-7 h-7 rounded-full overflow-hidden border border-brand-500/30 flex-shrink-0">
                  {profile?.photoURL
                    ? <img src={profile.photoURL} alt="avatar" className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-display font-semibold text-xs">
                        {(profile?.name || user.displayName || 'U')[0].toUpperCase()}
                      </div>
                  }
                </div>
                <span>{profile?.name || user.displayName}</span>
              </div>
              <button onClick={handleLogout} className="btn-outline text-sm py-1.5 px-4">
                Keluar
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary text-sm py-2 px-4">
              Masuk
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
