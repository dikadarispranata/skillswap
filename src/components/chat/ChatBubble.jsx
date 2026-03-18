// src/components/chat/ChatBubble.jsx

function formatTime(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000)
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

export default function ChatBubble({ message, isMine }) {
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm font-body leading-relaxed
        ${isMine
          ? 'bg-brand-500 text-dark-900 rounded-br-sm'
          : 'bg-dark-700 border border-white/5 text-white rounded-bl-sm'
        }`}>
        <p>{message.text}</p>
        <p className={`text-xs mt-1 ${isMine ? 'text-dark-900/50' : 'text-white/30'}`}>
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  )
}
