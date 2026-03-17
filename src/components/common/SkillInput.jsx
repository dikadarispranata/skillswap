// src/components/common/SkillInput.jsx
import { useState } from 'react'

export default function SkillInput({ onAdd, placeholder = 'Ketik skill lalu Enter...' }) {
  const [value, setValue] = useState('')

  function handleKey(e) {
    if ((e.key === 'Enter' || e.key === ',') && value.trim()) {
      e.preventDefault()
      onAdd(value.trim().replace(/,$/, ''))
      setValue('')
    }
  }

  function handleAdd() {
    if (value.trim()) {
      onAdd(value.trim())
      setValue('')
    }
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        className="input-base flex-1"
        maxLength={40}
      />
      <button
        type="button"
        onClick={handleAdd}
        disabled={!value.trim()}
        className="btn-outline px-4 py-3 disabled:opacity-30"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>
    </div>
  )
}
