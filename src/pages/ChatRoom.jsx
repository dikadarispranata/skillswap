// src/pages/ChatRoom.jsx
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../services/firebaseConfig'
import { useAuth } from '../context/AuthContext'
import { ensureChat, sendMessage, listenMessages } from '../services/chatService'
import ChatBubble from '../components/chat/ChatBubble'
import MessageInput from '../components/chat/MessageInput'

export default function ChatRoom() {
  const { uid: partnerUid } = useParams()
  const { user, profile }   = useAuth()
  const navigate            = useNavigate()

  const [partner,  setPartner]  = useState(null)
  const [chatId,   setChatId]   = useState(null)
  const [messages, setMessages] = useState([])
  const [loading,  setLoading]  = useState(true)
  const bottomRef = useRef()

  /* Load partner profile */
  useEffect(() => {
    if (!partnerUid) return
    getDoc(doc(db, 'users', partnerUid)).then(snap => {
      if (snap.exists()) setPartner(snap.data())
      else navigate('/chat')
    })
  }, [partnerUid])

  /* Ensure chat doc & listen messages */
  useEffect(() => {
    if (!user || !partnerUid) return
    ensureChat(user.uid, partnerUid).then(id => {
      setChatId(id)
      setLoading(false)
      const unsub = listenMessages(id, msgs => setMessages(msgs))
      return unsub
    })
  }, [user, partnerUid])

  /* Auto-scroll to bottom */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(text) {
    if (!chatId) return
    await sendMessage(chatId, user.uid, text)
  }

  const partnerAvatar = partner?.name?.[0]?.toUpperCase() || '?'

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-dark-900/90 backdrop-blur-sm">
        <button onClick={() => navigate('/chat')} className="text-white/40 hover:text-white transition-colors">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>

        <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
          {partner?.photoURL
            ? <img src={partner.photoURL} alt={partner.name} className="w-full h-full object-cover"/>
            : <div className="w-full h-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-display font-bold">
                {partnerAvatar}
              </div>
          }
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold text-white text-sm truncate">{partner?.name || '...'}</p>
          <p className="text-white/30 font-body text-xs">
            {partner?.skills_have?.slice(0, 2).join(', ') || 'SkillSwap'}
          </p>
        </div>

        {/* Partner profile link */}
        <Link
          to={`/profile/${partnerUid}`}
          className="text-white/30 hover:text-white/60 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </Link>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin"/>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <div className="w-14 h-14 bg-brand-500/10 border border-brand-500/20 rounded-2xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-brand-400" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-display font-semibold text-sm">Mulai percakapan!</p>
              <p className="text-white/30 font-body text-xs mt-1">
                Kirim pesan pertamamu ke {partner?.name?.split(' ')[0] || 'partner'} 👋
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Date separator for first message */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-white/5"/>
              <span className="text-white/20 font-body text-xs">Percakapan dimulai</span>
              <div className="flex-1 h-px bg-white/5"/>
            </div>
            {messages.map(msg => (
              <ChatBubble
                key={msg.id}
                message={msg}
                isMine={msg.sender_id === user.uid}
              />
            ))}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput onSend={handleSend} disabled={loading || !chatId} />
    </div>
  )
}
