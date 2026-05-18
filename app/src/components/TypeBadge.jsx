const STYLES = {
  hospital: { background: '#dbeafe', color: '#1e40af', border: '#bfdbfe', label: 'Hospital', fullLabel: 'Hospital / Bulk / MLD' },
  nrt:      { background: '#dcfce7', color: '#15803d', border: '#bbf7d0', label: 'NRT',      fullLabel: 'NRT'                   },
}

export default function TypeBadge({ type, full = false, style }) {
  const s = STYLES[type]
  if (!s) return null
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 7px', borderRadius: 4,
      fontSize: 11, fontWeight: 600, lineHeight: '16px',
      background: s.background, color: s.color,
      border: `1px solid ${s.border}`,
      flexShrink: 0,
      ...style,
    }}>
      {full ? s.fullLabel : s.label}
    </span>
  )
}
