// src/pages/ChatList.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../services/firebaseConfig'
import { useAuth } from '../context/AuthContext'
import { listenMyChats } from '../services/chatService'

function formatTime(ts) {
  if (!ts) return ''
  const d   = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

export default function ChatList() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [chats,    setChats]    = useState([])
  const [partners, setPartners] = useState({}) // uid → profile
  const [loading,  setLoading]  = useState(true)

  /* Listen chats */
  useEffect(() => {
    if (!user) return
    const unsub = listenMyChats(user.uid, async chatList => {
      setChats(chatList)
      setLoading(false)

      // Fetch partner profiles yang belum ada
      const uidsToFetch = chatList
        .map(c => c.members.find(m => m !== user.uid))
        .filter(uid => uid && !partners[uid])

      const fetched = {}
      await Promise.all(uidsToFetch.map(async uid => {
        const snap = await getDoc(doc(db, 'users', uid))
        if (snap.exists()) fetched[uid] = snap.data()
      }))

      if (Object.keys(fetched).length > 0) {
        setPartners(prev => ({ ...prev, ...fetched }))
      }
    })
    return unsub
  }, [user])

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-brand-400 font-display font-semibold text-xs tracking-widest uppercase mb-1">Pesan</p>
        <h1 className="font-display font-bold text-3xl text-white">Chat</h1>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-4 flex items-center gap-3 animate-pulse">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex-shrink-0"/>
              <div className="flex-1 space-y-2">
                <div className="h-3 w-28 bg-white/5 rounded-full"/>
                <div className="h-2.5 w-40 bg-white/5 rounded-full"/>
              </div>
            </div>
          ))}
        </div>
      ) : chats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-4">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          </div>
          <p className="font-display font-semibold text-white text-lg mb-2">Belum ada chat</p>
          <p className="text-white/40 font-body text-sm max-w-xs">
            Terima swap request dari Explore untuk membuka chat dengan partner.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {chats.map(chat => {
            const partnerUid = chat.members.find(m => m !== user.uid)
            const partner    = partners[partnerUid]
            const avatar     = partner?.name?.[0]?.toUpperCase() || '?'

            return (
              <button
                key={chat.id}
                onClick={() => navigate(`/chat/${partnerUid}`)}
                className="card w-full p-4 flex items-center gap-3 hover:border-white/10 hover:bg-dark-700/50 transition-all duration-150 text-left"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                  {partner?.photoURL
                    ? <img src={partner.photoURL} alt={partner.name} className="w-full h-full object-cover"/>
                    : <div className="w-full h-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-display font-bold text-lg">
                        {avatar}
                      </div>
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-display font-semibold text-white text-sm truncate">
                      {partner?.name || 'Pengguna'}
                    </p>
                    <span className="text-white/25 font-body text-xs flex-shrink-0">
                      {formatTime(chat.lastMsgAt)}
                    </span>
                  </div>
                  <p className="text-white/40 font-body text-xs truncate mt-0.5">
                    {chat.lastMsg || 'Mulai percakapan...'}
                  </p>
                  {/* Skills chip */}
                  {partner?.skills_have?.length > 0 && (
                    <p className="text-brand-400/60 font-body text-xs mt-1 truncate">
                      🎯 {partner.skills_have.slice(0, 2).join(' · ')}
                    </p>
                  )}
                </div>

                <svg viewBox="0 0 24 24" className="w-4 h-4 text-white/20 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
