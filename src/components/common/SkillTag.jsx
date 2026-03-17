// src/components/common/SkillTag.jsx
export default function SkillTag({ label, onRemove, color = 'green' }) {
  const styles = {
    green: 'bg-brand-500/10 border-brand-500/30 text-brand-400',
    blue:  'bg-blue-500/10 border-blue-500/30 text-blue-400',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-sm font-body font-medium transition-all ${styles[color]}`}>
      {label}
      {onRemove && (
        <button onClick={onRemove} className="hover:text-white transition-colors ml-0.5" aria-label={`Hapus ${label}`}>
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </span>
  )
}
