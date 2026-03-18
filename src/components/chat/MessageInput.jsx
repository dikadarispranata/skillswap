// src/components/chat/MessageInput.jsx
import { useState, useRef } from 'react'

export default function MessageInput({ onSend, disabled }) {
  const [text, setText] = useState('')
  const ref  = useRef()

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  function submit() {
    const t = text.trim()
    if (!t || disabled) return
    onSend(t)
    setText('')
    ref.current?.focus()
  }

  return (
    <div className="flex items-end gap-3 p-4 border-t border-white/5 bg-dark-900">
      <textarea
        ref={ref}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Ketik pesan... (Enter untuk kirim)"
        rows={1}
        disabled={disabled}
        className="flex-1 bg-dark-700 border border-white/10 focus:border-brand-500/50 text-white
                   placeholder:text-white/25 rounded-xl px-4 py-3 text-sm font-body outline-none
                   resize-none transition-all duration-200 max-h-32 disabled:opacity-40"
        style={{ lineHeight: '1.5' }}
      />
      <button
        onClick={submit}
        disabled={!text.trim() || disabled}
        className="w-10 h-10 bg-brand-500 hover:bg-brand-400 disabled:opacity-30
                   rounded-xl flex items-center justify-center transition-all active:scale-95
                   flex-shrink-0 mb-0.5"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 text-dark-900" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </div>
  )
}
