// src/components/common/AvatarUpload.jsx
import { useRef, useState } from 'react'

const MAX_SIZE_MB = 2

export default function AvatarUpload({ currentURL, name, onFileSelect }) {
  const inputRef  = useRef()
  const [preview, setPreview] = useState(null)
  const [error,   setError]   = useState('')

  const initial = (name || 'U')[0].toUpperCase()

  function handleChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')

    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar'); return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Ukuran maks ${MAX_SIZE_MB}MB`); return
    }

    const url = URL.createObjectURL(file)
    setPreview(url)
    onFileSelect(file)
  }

  const src = preview || currentURL

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar circle */}
      <div className="relative group cursor-pointer" onClick={() => inputRef.current?.click()}>
        <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/10 group-hover:border-brand-500/50 transition-all duration-200">
          {src
            ? <img src={src} alt="Avatar" className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-display font-bold text-3xl">
                {initial}
              </div>
          }
        </div>

        {/* Overlay on hover */}
        <div className="absolute inset-0 rounded-2xl bg-dark-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </div>

        {/* Badge */}
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-dark-900" fill="none" stroke="currentColor" strokeWidth={3}>
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />

      <div className="text-center">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-brand-400 hover:text-brand-300 font-body text-sm transition-colors"
        >
          Ganti foto
        </button>
        <p className="text-white/25 font-body text-xs mt-0.5">JPG, PNG, WebP — maks 2MB</p>
      </div>

      {error && <p className="text-red-400 text-xs font-body">{error}</p>}
    </div>
  )
}
