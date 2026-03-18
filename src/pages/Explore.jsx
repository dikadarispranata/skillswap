// src/pages/Explore.jsx
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { getMatchingUsers, listenSentSwaps, listenReceivedSwaps } from '../services/swapService'
import UserCard from '../components/common/UserCard'
import { Link } from 'react-router-dom'

/* ── Empty states ──────────────────────────────────────────────── */
function EmptyNoSkills() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 bg-brand-500/10 border border-brand-500/20 rounded-2xl flex items-center justify-center mb-4">
        <svg viewBox="0 0 24 24" className="w-8 h-8 text-brand-400" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </div>
      <h3 className="font-display font-semibold text-white text-lg mb-2">Lengkapi skill dulu</h3>
      <p className="text-white/40 font-body text-sm max-w-xs mb-6">
        Tambahkan skill "I Have" dan "I Want" di profil agar kami bisa mencarikan partner yang cocok.
      </p>
      <Link to="/profile" className="btn-primary text-sm px-6 py-2.5">
        Lengkapi Profil
      </Link>
    </div>
  )
}

function EmptyNoMatch() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-4">
        <svg viewBox="0 0 24 24" className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </div>
      <h3 className="font-display font-semibold text-white text-lg mb-2">Belum ada partner cocok</h3>
      <p className="text-white/40 font-body text-sm max-w-xs mb-6">
        Komunitas masih berkembang. Coba tambah lebih banyak skill atau cek lagi nanti.
      </p>
      <Link to="/profile" className="btn-outline text-sm px-6 py-2.5">
        Tambah Skill
      </Link>
    </div>
  )
}

/* ── Skeleton loader ───────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="card p-5 space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-white/5" />
        <div className="space-y-2 flex-1">
          <div className="h-3 w-28 bg-white/5 rounded-full" />
          <div className="h-2.5 w-16 bg-white/5 rounded-full" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-2.5 w-24 bg-white/5 rounded-full" />
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-white/5 rounded-lg" />
          <div className="h-6 w-20 bg-white/5 rounded-lg" />
        </div>
      </div>
      <div className="h-9 w-full bg-white/5 rounded-xl mt-2" />
    </div>
  )
}

/* ── Main ───────────────────────────────────────────────────────── */
export default function Explore() {
  const { user, profile } = useAuth()

  const [matches,       setMatches]       = useState([])
  const [swapMap,       setSwapMap]       = useState({}) // uid → swapDoc
  const [loading,       setLoading]       = useState(true)
  const [search,        setSearch]        = useState('')
  const [filterTab,     setFilterTab]     = useState('all') // 'all' | 'pending' | 'accepted'

  const hasSkills = (profile?.skills_have?.length > 0) || (profile?.skills_want?.length > 0)

  /* Fetch matching users */
  const fetchMatches = useCallback(async () => {
    if (!profile) return
    setLoading(true)
    try {
      const result = await getMatchingUsers(profile)
      setMatches(result)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [profile])

  useEffect(() => { fetchMatches() }, [fetchMatches])

  /* Listen swaps realtime */
  useEffect(() => {
    if (!user) return
    const merge = (swaps, isSender) => {
      setSwapMap(prev => {
        const next = { ...prev }
        swaps.forEach(s => {
          const key = isSender ? s.receiver_id : s.sender_id
          // Simpan yang paling baru / relevan
          if (!next[key] || s.timestamp?.seconds > next[key].timestamp?.seconds) {
            next[key] = { ...s, isSender }
          }
        })
        return next
      })
    }
    const unsubSent     = listenSentSwaps(user.uid,     swaps => merge(swaps, true))
    const unsubReceived = listenReceivedSwaps(user.uid, swaps => merge(swaps, false))
    return () => { unsubSent(); unsubReceived() }
  }, [user])

  /* Filter & search */
  const filtered = matches.filter(u => {
    const q = search.toLowerCase()
    const nameMatch  = u.name?.toLowerCase().includes(q)
    const skillMatch = [...(u.skills_have || []), ...(u.skills_want || [])].some(s => s.toLowerCase().includes(q))
    if (q && !nameMatch && !skillMatch) return false

    const swap = swapMap[u.uid]
    if (filterTab === 'pending')  return swap?.status === 'pending'
    if (filterTab === 'accepted') return swap?.status === 'accepted'
    return true
  })

  const pendingCount  = Object.values(swapMap).filter(s => s.status === 'pending'  && !s.isSender).length
  const acceptedCount = Object.values(swapMap).filter(s => s.status === 'accepted').length

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-8">
        <p className="text-brand-400 font-display font-semibold text-xs tracking-widest uppercase mb-1">
          Smart Matching
        </p>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl text-white">
              Explore Partner
            </h1>
            <p className="text-white/40 font-body text-sm mt-1">
              {loading ? 'Mencari partner...' : `${matches.length} partner cocok ditemukan`}
            </p>
          </div>

          {/* Search */}
          {hasSkills && (
            <div className="relative w-full sm:w-64">
              <svg viewBox="0 0 24 24" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama atau skill..."
                className="input-base pl-9 text-sm"
              />
            </div>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      {hasSkills && matches.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {[
            { id: 'all',      label: 'Semua',    count: matches.length },
            { id: 'pending',  label: 'Menunggu', count: pendingCount,  show: pendingCount > 0 },
            { id: 'accepted', label: 'Diterima', count: acceptedCount, show: acceptedCount > 0 },
          ].filter(t => t.show !== false).map(t => (
            <button
              key={t.id}
              onClick={() => setFilterTab(t.id)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-body text-sm whitespace-nowrap transition-all
                ${filterTab === t.id
                  ? 'bg-brand-500 text-dark-900 font-medium'
                  : 'bg-white/5 border border-white/10 text-white/50 hover:text-white'}`}
            >
              {t.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-md ${filterTab === t.id ? 'bg-dark-900/20' : 'bg-white/10'}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {!hasSkills ? (
        <EmptyNoSkills />
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        matches.length === 0 ? <EmptyNoMatch /> : (
          <div className="text-center py-16 text-white/30 font-body">
            Tidak ada hasil untuk "{search}"
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((u, i) => (
            <div
              key={u.uid}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'forwards', opacity: 0 }}
            >
              <UserCard
                user={u}
                currentUser={profile}
                swapStatus={swapMap[u.uid] || null}
                onSwapSent={fetchMatches}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
