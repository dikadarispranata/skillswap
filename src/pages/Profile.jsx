// src/pages/Profile.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateUserProfile, uploadAvatar } from '../services/userService'
import SkillInput from '../components/common/SkillInput'
import SkillTag from '../components/common/SkillTag'
import AvatarUpload from '../components/common/AvatarUpload'

/* ── Constants ─────────────────────────────────────────────────── */
const SUGGESTIONS_HAVE = ['React', 'Vue', 'UI Design', 'Figma', 'Python', 'Node.js', 'Copywriting', 'SEO', 'English', 'Photography']
const SUGGESTIONS_WANT = ['Public Speaking', 'Video Editing', 'Excel', 'Marketing', 'Cooking', 'Music', 'Bahasa Jepang', 'Flutter', 'AWS']

const SOCIAL_FIELDS = [
  { key: 'linkedin', label: 'LinkedIn',  placeholder: 'https://linkedin.com/in/username', icon: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z', color: 'text-blue-400' },
  { key: 'github',   label: 'GitHub',    placeholder: 'https://github.com/username',      icon: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22', color: 'text-white/60' },
  { key: 'instagram',label: 'Instagram', placeholder: 'https://instagram.com/username',   icon: 'M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01 M7.5 2h9A5.5 5.5 0 0122 7.5v9a5.5 5.5 0 01-5.5 5.5h-9A5.5 5.5 0 012 16.5v-9A5.5 5.5 0 017.5 2z', color: 'text-pink-400' },
  { key: 'twitter',  label: 'X / Twitter', placeholder: 'https://x.com/username',        icon: 'M4 4l16 16M4 20L20 4', color: 'text-white/60' },
]

/* ── Toast ─────────────────────────────────────────────────────── */
function Toast({ message, type }) {
  if (!message) return null
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-body font-medium flex items-center gap-2 animate-fade-up
      ${type === 'success' ? 'bg-brand-500 text-dark-900' : 'bg-red-500/90 text-white'}`}>
      {type === 'success'
        ? <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M20 6L9 17l-5-5"/></svg>
        : <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/></svg>
      }
      {message}
    </div>
  )
}

/* ── Section wrapper ────────────────────────────────────────────── */
function Section({ title, icon, delay = 0, children }) {
  return (
    <div
      className="card p-6 animate-fade-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards', opacity: 0 }}
    >
      <h2 className="font-display font-semibold text-white mb-5 flex items-center gap-2">
        <span className="w-6 h-6 bg-brand-500/15 rounded-lg flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-brand-400" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d={icon}/>
          </svg>
        </span>
        {title}
      </h2>
      {children}
    </div>
  )
}

/* ── Main ───────────────────────────────────────────────────────── */
export default function Profile() {
  const { user, profile, setProfile } = useAuth()

  // Form state
  const [name,        setName]        = useState('')
  const [skillsHave,  setSkillsHave]  = useState([])
  const [skillsWant,  setSkillsWant]  = useState([])
  const [socials,     setSocials]     = useState({ linkedin: '', github: '', instagram: '', twitter: '' })
  const [avatarFile,  setAvatarFile]  = useState(null)
  const [uploadPct,   setUploadPct]   = useState(0)

  // UI state
  const [loading,  setLoading]  = useState(false)
  const [dirty,    setDirty]    = useState(false)
  const [toast,    setToast]    = useState({ message: '', type: 'success' })
  const [tab,      setTab]      = useState('profile') // 'profile' | 'skills' | 'social'

  /* Load dari Firestore */
  useEffect(() => {
    if (!profile) return
    setName(profile.name || '')
    setSkillsHave(profile.skills_have || [])
    setSkillsWant(profile.skills_want || [])
    setSocials({
      linkedin:  profile.socials?.linkedin  || '',
      github:    profile.socials?.github    || '',
      instagram: profile.socials?.instagram || '',
      twitter:   profile.socials?.twitter   || '',
    })
  }, [profile])

  /* Track dirty */
  useEffect(() => {
    if (!profile) return
    const changed =
      name !== (profile.name || '') ||
      !!avatarFile ||
      JSON.stringify(skillsHave) !== JSON.stringify(profile.skills_have || []) ||
      JSON.stringify(skillsWant) !== JSON.stringify(profile.skills_want || []) ||
      JSON.stringify(socials)    !== JSON.stringify(profile.socials || { linkedin:'', github:'', instagram:'', twitter:'' })
    setDirty(changed)
  }, [name, skillsHave, skillsWant, socials, avatarFile, profile])

  function showToast(msg, type = 'success') {
    setToast({ message: msg, type })
    setTimeout(() => setToast({ message: '', type: 'success' }), 3000)
  }

  async function handleSave() {
    if (!name.trim()) { showToast('Nama tidak boleh kosong', 'error'); return }
    setLoading(true)
    try {
      let photoURL = profile?.photoURL || ''

      // Upload avatar jika ada file baru
      if (avatarFile) {
        setUploadPct(1)
        photoURL = await uploadAvatar(user.uid, avatarFile, pct => setUploadPct(pct))
        setUploadPct(0)
        setAvatarFile(null)
      }

      const updated = {
        name:        name.trim(),
        skills_have: skillsHave,
        skills_want: skillsWant,
        socials,
        ...(photoURL && { photoURL }),
      }

      await updateUserProfile(user.uid, updated)
      setProfile(prev => ({ ...prev, ...updated }))
      setDirty(false)
      showToast('Profil berhasil disimpan!')
    } catch (err) {
      console.error(err)
      showToast('Gagal menyimpan. Coba lagi.', 'error')
    } finally {
      setLoading(false)
      setUploadPct(0)
    }
  }

  /* ── Tabs ─────────────────────────────────────────────────────── */
  const tabs = [
    { id: 'profile', label: 'Profil'   },
    { id: 'skills',  label: 'Skills'   },
    { id: 'social',  label: 'Sosial'   },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-6 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
        <p className="text-brand-400 font-display font-semibold text-xs tracking-widest uppercase mb-1">Pengaturan</p>
        <h1 className="font-display font-bold text-3xl text-white">Edit Profil</h1>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-dark-800 border border-white/5 rounded-xl mb-6 animate-fade-up" style={{ animationDelay: '40ms', animationFillMode: 'forwards', opacity: 0 }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-lg font-body font-medium text-sm transition-all duration-150
              ${tab === t.id
                ? 'bg-brand-500 text-dark-900 shadow-sm'
                : 'text-white/40 hover:text-white/70'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-5">

        {/* ══ TAB: PROFIL ══════════════════════════════════════════ */}
        {tab === 'profile' && (
          <>
            {/* Avatar + nama */}
            <Section title="Foto & Nama" icon="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 7a4 4 0 100 8 4 4 0 000-8z" delay={80}>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Avatar uploader */}
                <AvatarUpload
                  currentURL={profile?.photoURL}
                  name={name}
                  onFileSelect={setAvatarFile}
                />

                {/* Upload progress */}
                {uploadPct > 0 && (
                  <div className="w-full">
                    <div className="flex justify-between text-xs font-body text-white/40 mb-1">
                      <span>Mengunggah foto...</span>
                      <span>{uploadPct}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full transition-all duration-200"
                        style={{ width: `${uploadPct}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Nama */}
                <div className="flex-1 w-full space-y-4">
                  <div>
                    <label className="block text-white/60 text-sm font-body mb-1.5">Nama Lengkap</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Nama lengkapmu"
                      className="input-base"
                      maxLength={60}
                    />
                  </div>
                  <div>
                    <label className="block text-white/60 text-sm font-body mb-1.5">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="input-base opacity-40 cursor-not-allowed"
                    />
                    <p className="text-white/25 text-xs font-body mt-1">Email tidak dapat diubah</p>
                  </div>
                </div>
              </div>
            </Section>
          </>
        )}

        {/* ══ TAB: SKILLS ══════════════════════════════════════════ */}
        {tab === 'skills' && (
          <>
            {/* I Have */}
            <Section title="Keahlian Saya (I Have)" icon="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" delay={80}>
              <p className="text-white/40 font-body text-xs mb-4">Apa yang kamu kuasai dan bisa kamu ajarkan?</p>
              <SkillInput onAdd={s => { if (s && !skillsHave.includes(s)) setSkillsHave(p => [...p, s]) }} placeholder="Ketik lalu tekan Enter..." />
              {skillsHave.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {skillsHave.map(skill => (
                    <SkillTag key={skill} label={skill} color="green"
                      onRemove={() => setSkillsHave(s => s.filter(x => x !== skill))} />
                  ))}
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-white/30 font-body text-xs mb-2">Saran cepat:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS_HAVE.filter(s => !skillsHave.includes(s)).slice(0, 7).map(s => (
                    <button key={s} onClick={() => setSkillsHave(p => [...p, s])}
                      className="text-xs font-body px-3 py-1 rounded-lg bg-white/5 hover:bg-brand-500/10 border border-white/10 hover:border-brand-500/30 text-white/50 hover:text-brand-400 transition-all">
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            </Section>

            {/* I Want */}
            <Section title="Ingin Belajar (I Want)" icon="M11 4a7 7 0 107 7H11V4z M21 21l-4.35-4.35" delay={140}>
              <p className="text-white/40 font-body text-xs mb-4">Apa yang ingin kamu pelajari dari orang lain?</p>
              <SkillInput onAdd={s => { if (s && !skillsWant.includes(s)) setSkillsWant(p => [...p, s]) }} placeholder="Ketik lalu tekan Enter..." />
              {skillsWant.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {skillsWant.map(skill => (
                    <SkillTag key={skill} label={skill} color="blue"
                      onRemove={() => setSkillsWant(s => s.filter(x => x !== skill))} />
                  ))}
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-white/30 font-body text-xs mb-2">Saran cepat:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS_WANT.filter(s => !skillsWant.includes(s)).slice(0, 7).map(s => (
                    <button key={s} onClick={() => setSkillsWant(p => [...p, s])}
                      className="text-xs font-body px-3 py-1 rounded-lg bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/30 text-white/50 hover:text-blue-400 transition-all">
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            </Section>
          </>
        )}

        {/* ══ TAB: SOSIAL ══════════════════════════════════════════ */}
        {tab === 'social' && (
          <Section title="Link Sosial" icon="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71 M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" delay={80}>
            <p className="text-white/40 font-body text-xs mb-5">Tampilkan profilmu ke calon partner swap.</p>
            <div className="space-y-4">
              {SOCIAL_FIELDS.map(field => (
                <div key={field.key}>
                  <label className="flex items-center gap-2 text-white/60 text-sm font-body mb-1.5">
                    <svg viewBox="0 0 24 24" className={`w-4 h-4 ${field.color}`} fill="none" stroke="currentColor" strokeWidth={1.8}>
                      <path d={field.icon}/>
                    </svg>
                    {field.label}
                  </label>
                  <input
                    type="url"
                    value={socials[field.key]}
                    onChange={e => setSocials(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="input-base text-sm"
                  />
                </div>
              ))}
            </div>

            {/* Preview */}
            {Object.values(socials).some(v => v) && (
              <div className="mt-5 pt-5 border-t border-white/5">
                <p className="text-white/30 font-body text-xs mb-3">Preview di profil publik:</p>
                <div className="flex gap-3">
                  {SOCIAL_FIELDS.filter(f => socials[f.key]).map(f => (
                    <a
                      key={f.key}
                      href={socials[f.key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
                    >
                      <svg viewBox="0 0 24 24" className={`w-4 h-4 ${f.color}`} fill="none" stroke="currentColor" strokeWidth={1.8}>
                        <path d={f.icon}/>
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </Section>
        )}

        {/* ── Save bar ─────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between pt-1 animate-fade-up"
          style={{ animationDelay: '200ms', animationFillMode: 'forwards', opacity: 0 }}
        >
          <p className={`font-body text-sm transition-colors ${dirty ? 'text-brand-400/80' : 'text-white/25'}`}>
            {dirty ? '● Belum disimpan' : '✓ Tersimpan'}
          </p>
          <button
            onClick={handleSave}
            disabled={loading || !dirty}
            className="btn-primary px-8 disabled:opacity-40"
          >
            {loading
              ? <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" strokeLinecap="round"/>
                  </svg>
                  Menyimpan...
                </span>
              : 'Simpan Perubahan'
            }
          </button>
        </div>
      </div>

      <Toast message={toast.message} type={toast.type} />
    </div>
  )
}
