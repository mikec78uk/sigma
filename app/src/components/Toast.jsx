import { useEffect } from 'react'
import Icon from './Icon'

/**
 * Toast — individual notification card (no fixed positioning; parent handles stacking).
 * Props:
 *   message   string
 *   type      'success' | 'error'
 *   onClose   () => void
 *   duration  number (ms, default 4000)
 */
export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [message])

  const isSuccess = type === 'success'
  const accent    = isSuccess ? '#16a34a' : '#dc2626'
  const bg        = isSuccess ? '#f0fdf4' : '#fff5f5'
  const border    = isSuccess ? '#bbf7d0' : 'rgba(220,38,38,0.3)'
  const text      = isSuccess ? '#166534' : '#991b1b'

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: 10,
      padding: '12px 16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
      minWidth: 280,
      maxWidth: 420,
      animation: 'toast-in 0.2s ease',
    }}>
      <Icon
        name={isSuccess ? 'check' : 'alert'}
        size={15}
        style={{ color: accent, flexShrink: 0 }}
      />
      <span style={{ fontSize: 13.5, color: text, fontWeight: 500, flex: 1 }}>
        {message}
      </span>
      <button
        onClick={onClose}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: accent, padding: 2, flexShrink: 0 }}
      >
        <Icon name="x" size={14} />
      </button>

      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
