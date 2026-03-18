// src/components/common/UserCard.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SkillTag from './SkillTag'
import { sendSwapRequest, updateSwapStatus } from '../../services/swapService'
import { ensureChat } from '../../services/chatService'

const STATUS_STYLE = {
  pending:   'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
  accepted:  'bg-brand-500/10 border-brand-500/30 text-brand-400',
  rejected:  'bg-red-500/10 border-red-500/30 text-red-400',
  completed: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
}
const STATUS_LABEL = {
  pending:   'Menunggu respons',
  accepted:  'Diterima!',
  rejected:  'Ditolak',
  completed: 'Selesai',
}

export default function UserCard({ user: target, currentUser, swapStatus, onSwapSent }) {
  const [loading,  setLoading]  = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [message,  setMessage]  = useState('')
  const navigate = useNavigate()

  const avatar = target.name?.[0]?.toUpperCase() || '?'

  async function handleOpenChat() {
    await ensureChat(currentUser.uid, target.uid)
    navigate(`/chat/${target.uid}`)
  }

  async function handleSend() {
    if (!message.trim()) return
    setLoading(true)
    try {
      await sendSwapRequest(currentUser.uid, target.uid, message.trim())
      setShowForm(false)
      setMessage('')
      onSwapSent?.()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleRespond(status) {
    setLoading(true)
    try {
      await updateSwapStatus(swapStatus.id, status)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-5 flex flex-col gap-4 hover:border-white/10 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
            {target.photoURL
              ? <img src={target.photoURL} alt={target.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-display font-bold text-lg">
                  {avatar}
                </div>
            }
          </div>
          <div>
            <p className="font-display font-semibold text-white text-sm">{target.name || 'Pengguna'}</p>
            <div className="flex items-center gap-1 mt-0.5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} viewBox="0 0 24 24" className={`w-3 h-3 ${i < Math.round(target.rating_avg || 0) ? 'text-yellow-400' : 'text-white/15'}`} fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              ))}
              <span className="text-white/30 text-xs ml-1">{target.rating_avg?.toFixed(1) || '—'}</span>
            </div>
          </div>
        </div>

        {/* Match score badge */}
        {target._score > 0 && (
          <span className="text-xs font-body px-2 py-1 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 flex-shrink-0">
            {target._score} match
          </span>
        )}
      </div>

      {/* Skills they have that I want */}
      {target.theyHaveIWant?.length > 0 && (
        <div>
          <p className="text-white/30 font-body text-xs mb-2">Bisa mengajari kamu:</p>
          <div className="flex flex-wrap gap-1.5">
            {target.theyHaveIWant.map(s => <SkillTag key={s} label={s} color="green" />)}
          </div>
        </div>
      )}

      {/* Skills I have that they want */}
      {target.iHaveTheyWant?.length > 0 && (
        <div>
          <p className="text-white/30 font-body text-xs mb-2">Ingin belajar darimu:</p>
          <div className="flex flex-wrap gap-1.5">
            {target.iHaveTheyWant.map(s => <SkillTag key={s} label={s} color="blue" />)}
          </div>
        </div>
      )}

      {/* Social links */}
      {target.socials && Object.values(target.socials).some(v => v) && (
        <div className="flex gap-2">
          {[
            { key: 'linkedin', icon: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z', color: 'text-blue-400' },
            { key: 'github',   icon: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22', color: 'text-white/50' },
            { key: 'instagram',icon: 'M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01 M7.5 2h9A5.5 5.5 0 0122 7.5v9a5.5 5.5 0 01-5.5 5.5h-9A5.5 5.5 0 012 16.5v-9A5.5 5.5 0 017.5 2z', color: 'text-pink-400' },
            { key: 'twitter',  icon: 'M4 4l16 16M4 20L20 4', color: 'text-white/50' },
          ].filter(f => target.socials[f.key]).map(f => (
            <a key={f.key} href={target.socials[f.key]} target="_blank" rel="noopener noreferrer"
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all">
              <svg viewBox="0 0 24 24" className={`w-3.5 h-3.5 ${f.color}`} fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path d={f.icon}/>
              </svg>
            </a>
          ))}
        </div>
      )}

      {/* ── Action area ─────────────────────────────────────────── */}
      <div className="mt-auto pt-3 border-t border-white/5">

        {/* Tidak ada swap */}
        {!swapStatus && (
          <>
            {!showForm
              ? <button onClick={() => setShowForm(true)} className="btn-primary w-full text-sm py-2">
                  Ajukan Swap
                </button>
              : <div className="space-y-2">
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder={`Hei ${target.name?.split(' ')[0] || ''}! Aku bisa mengajarimu ${target.iHaveTheyWant?.[0] || '...'}, dan aku ingin belajar ${target.theyHaveIWant?.[0] || '...'} darimu. Gimana?`}
                    rows={3}
                    maxLength={300}
                    className="input-base text-sm resize-none"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setShowForm(false)} className="btn-outline flex-1 text-sm py-2">Batal</button>
                    <button onClick={handleSend} disabled={loading || !message.trim()} className="btn-primary flex-1 text-sm py-2 disabled:opacity-40">
                      {loading ? 'Mengirim...' : 'Kirim'}
                    </button>
                  </div>
                </div>
            }
          </>
        )}

        {/* Swap sudah dikirim (aku sender) */}
        {swapStatus?.isSender && swapStatus.status !== 'accepted' && (
          <div className={`text-xs font-body px-3 py-2 rounded-lg border text-center ${STATUS_STYLE[swapStatus.status]}`}>
            {STATUS_LABEL[swapStatus.status]}
          </div>
        )}

        {/* Swap accepted — siapapun bisa buka chat */}
        {swapStatus?.status === 'accepted' && (
          <button onClick={handleOpenChat} className="btn-primary w-full text-sm py-2 flex items-center justify-center gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
            Buka Chat
          </button>
        )}

        {/* Swap diterima (aku receiver) & masih pending */}
        {swapStatus && !swapStatus.isSender && swapStatus.status === 'pending' && (
          <div className="space-y-2">
            {swapStatus.message && (
              <p className="text-white/50 text-xs font-body italic bg-white/5 rounded-lg px-3 py-2">
                "{swapStatus.message}"
              </p>
            )}
            <div className="flex gap-2">
              <button onClick={() => handleRespond('rejected')} disabled={loading}
                className="flex-1 text-sm py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all font-body">
                Tolak
              </button>
              <button onClick={() => handleRespond('accepted')} disabled={loading}
                className="btn-primary flex-1 text-sm py-2">
                Terima
              </button>
            </div>
          </div>
        )}

        {/* Swap diterima & sudah direspons (rejected/completed) */}
        {swapStatus && !swapStatus.isSender && swapStatus.status !== 'pending' && swapStatus.status !== 'accepted' && (
          <div className={`text-xs font-body px-3 py-2 rounded-lg border text-center ${STATUS_STYLE[swapStatus.status]}`}>
            {STATUS_LABEL[swapStatus.status]}
          </div>
        )}
      </div>
    </div>
  )
}
